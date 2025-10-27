import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import {
  Button,
  Badge,
  Separator,
  Box,
  Heading,
  Text,
  Portal,
  VStack,
} from "@chakra-ui/react";
import QuizOps from "@/components/QuizOps/QuizOps";
import { toaster } from "@/components/ui/toaster";
import { MdWarning } from "react-icons/md";
import PowerupBar from "@/components/PowerupBar/PowerupBar";
import PowerupGrantAnimation from "@/components/PowerupBar/PowerupGrantAnimation";
import type { Powerup } from "@/types/powerups";
import "./LiveQuiz.css";

interface Participant {
  socketId: string;
  userId: string;
  name: string;
  isHost: boolean;
  joinedAt: string;
}

interface ScoreEntry {
  userId: string;
  name: string;
  score: number;
}

interface QuestionPayload {
  text: string;
  options: string[];
  answerType: "single" | "multiple";
  imageUrl?: string;
  points: number;
  negativePoints: number;
}

interface QuizMeta {
  quizCode: string;
  title: string;
  description?: string;
  totalQuestions: number;
}

interface QuestionSummary {
  userId: string;
  name: string;
  selected: number[];
  isCorrect: boolean;
  gained: number;
  timeBonus?: number;
}

const getRealtimeUrl = () => {
  if (import.meta.env.VITE_REALTIME_URL) {
    return import.meta.env.VITE_REALTIME_URL as string;
  }
  if (import.meta.env.DEV) {
    return "http://localhost:5000";
  }
  return "https://rayquiza-backend.onrender.com";
};

const createPlayerId = (locationState?: {
  isGuest?: boolean;
  guestId?: string;
}) => {
  // Check if this is a guest join
  if (locationState?.isGuest && locationState?.guestId) {
    return locationState.guestId;
  }

  const guestId = localStorage.getItem("guestId");
  if (guestId) {
    return guestId;
  }

  const stored = localStorage.getItem("userId");
  if (stored && stored.trim()) {
    return stored;
  }
  return `guest-${Math.random().toString(36).slice(2, 8)}`;
};

const createPlayerName = (locationState?: {
  isGuest?: boolean;
  guestName?: string;
}) => {
  // Check if this is a guest join
  if (locationState?.isGuest && locationState?.guestName) {
    return locationState.guestName;
  }

  const guestName = localStorage.getItem("guestName");
  if (guestName) {
    return guestName;
  }

  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed?.name) {
        return parsed.name as string;
      }
    } catch (err) {
      console.warn("Failed to parse stored user", err);
    }
  }
  const storedName = localStorage.getItem("userName");
  if (storedName) {
    return storedName;
  }
  return `Player-${Math.floor(Math.random() * 900 + 100)}`;
};

const getPlayerEmail = (locationState?: {
  isGuest?: boolean;
}): string | undefined => {
  // Guests don't have emails
  if (locationState?.isGuest) {
    return undefined;
  }

  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed?.email) {
        return parsed.email as string;
      }
    } catch (err) {
      console.warn("Failed to parse stored user", err);
    }
  }
  return undefined;
};

const LiveQuiz = () => {
  const navigate = useNavigate();
  const { quizCode: rawQuizCode } = useParams<{ quizCode: string }>();
  const location = useLocation();
  const locationState = location.state as
    | {
        isHost?: boolean;
        isGuest?: boolean;
        guestId?: string;
        guestName?: string;
      }
    | undefined;
  const requestedHost = Boolean(locationState?.isHost);

  const quizCode = (rawQuizCode || "").toUpperCase();

  const socketRef = useRef<Socket | null>(null);
  const playerIdRef = useRef<string>(createPlayerId(locationState));
  const playerNameRef = useRef<string>(createPlayerName(locationState));
  const playerEmailRef = useRef<string | undefined>(
    getPlayerEmail(locationState)
  );

  const [quizMeta, setQuizMeta] = useState<QuizMeta | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [scoreboard, setScoreboard] = useState<ScoreEntry[]>([]);
  const [hostSocketId, setHostSocketId] = useState<string | null>(null);
  const [clientSocketId, setClientSocketId] = useState<string | null>(null);
  const [phase, setPhase] = useState<
    "lobby" | "question" | "review" | "complete"
  >("lobby");
  const [currentQuestion, setCurrentQuestion] =
    useState<QuestionPayload | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(-1);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [questionEndsAt, setQuestionEndsAt] = useState<number | null>(null);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [answerFeedback, setAnswerFeedback] = useState<{
    isCorrect: boolean;
    gained: number;
    correctAnswers: number[];
    timeBonus?: number;
  } | null>(null);
  const [lastSummary, setLastSummary] = useState<QuestionSummary[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<
    "websocket" | "polling" | null
  >(null);
  const [showConnectionWarning, setShowConnectionWarning] = useState(false);
  const [supervisorMode, setSupervisorMode] = useState(false);
  const [quizInterrupted, setQuizInterrupted] = useState(false);
  const [acknowledgedWarning, setAcknowledgedWarning] = useState(false);
  const [previousScoreboard, setPreviousScoreboard] = useState<ScoreEntry[]>(
    []
  );
  const [animatingScores, setAnimatingScores] = useState(false);
  
  // Server time offset to sync with server clock
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0);
  
  // Powerup state
  const [playerPowerups, setPlayerPowerups] = useState<Powerup[]>([]);
  const [showPowerupGrant, setShowPowerupGrant] = useState<Powerup | null>(null);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [activePowerupEffects, setActivePowerupEffects] = useState<{
    doublePoints?: boolean;
    shield?: boolean;
  }>({});

  useEffect(() => {
    if (!quizCode) {
      toaster.create({
        title: "Missing quiz code",
        description: "Redirecting you to the join page",
        type: "info",
        duration: 3000,
      });
      navigate("/join", { replace: true });
      return;
    }

    const realtimeUrl = getRealtimeUrl();
    // Allow polling fallback (don't force websocket-only) so the client can
    // connect successfully behind proxies/load-balancers (Render/Cloudflare).
    const socket = io(realtimeUrl, {
      // by default socket.io will try polling then upgrade to websocket.
      // specifying transports with both ensures a reliable connection.
      transports: ["polling", "websocket"],
      autoConnect: true,
      reconnectionAttempts: 5,
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      setClientSocketId(socket.id ?? null);

      // Detect connection type
      const transport = socket.io.engine.transport.name;
      setConnectionType(transport as "websocket" | "polling");

      // Show warning if using polling (WebSocket blocked)
      if (transport === "polling") {
        setShowConnectionWarning(true);
      }

      // Listen for transport upgrade attempts
      socket.io.engine.on("upgrade", (newTransport: any) => {
        console.log("Transport upgraded to:", newTransport.name);
        setConnectionType(newTransport.name as "websocket" | "polling");
      });

      // Listen for upgrade errors (WebSocket blocked)
      socket.io.engine.on("upgradeError", (error: any) => {
        console.log("WebSocket upgrade failed, stuck on polling:", error);
        setConnectionType("polling");
        setShowConnectionWarning(true);
      });

      // Check after 3 seconds if still on polling (WebSocket blocked)
      setTimeout(() => {
        const currentTransport = socket.io.engine.transport.name;
        console.log("Connection check after 3s - transport:", currentTransport);
        if (currentTransport === "polling") {
          console.log("Still on polling after 3s, showing warning");
          setConnectionType("polling");
          setShowConnectionWarning(true);
        }
      }, 3000);

      socket.emit("join-lobby", {
        quizCode,
        player: {
          id: playerIdRef.current,
          name: playerNameRef.current,
          email: playerEmailRef.current,
          isHost: requestedHost,
          supervisorMode: requestedHost, // If requesting host, default to supervisor mode
        },
      });
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("lobby-error", ({ message }) => {
      toaster.create({
        title: "Unable to join lobby",
        description: message,
        type: "error",
        duration: 5000,
      });
      navigate("/join", { replace: true });
    });

    socket.on("host-rejected", ({ reason }) => {
      toaster.create({
        title: "Cannot Join as Host",
        description: reason || "Only the quiz creator can be the host.",
        type: "error",
        duration: 5000,
      });
      navigate("/join", { replace: true });
    });

    socket.on("host-confirmed", () => {
      toaster.create({
        title: "You're the host",
        description: "You can start the quiz when ready.",
        type: "success",
        duration: 3000,
      });
    });

    socket.on("host-promoted", () => {
      toaster.create({
        title: "You're the host now",
        description: "Control the flow when you're ready.",
        type: "info",
        duration: 4000,
      });
    });

    socket.on(
      "quiz-data",
      (payload: QuizMeta & { supervisorMode?: boolean }) => {
        setQuizMeta(payload);
        if (payload.supervisorMode) {
          setSupervisorMode(true);
          toaster.create({
            title: "Supervisor Mode",
            description: "You're supervising this quiz. You won't participate.",
            type: "info",
            duration: 4000,
          });
        }
      }
    );

    socket.on(
      "lobby-update",
      ({
        participants: lobbyParticipants,
        hostSocketId: hostId,
      }: {
        participants: Participant[];
        hostSocketId: string | null;
      }) => {
        setParticipants(lobbyParticipants);
        setHostSocketId(hostId);
      }
    );

    socket.on(
      "scoreboard-update",
      ({ scoreboard: entries }: { scoreboard: ScoreEntry[] }) => {
        setScoreboard(entries);
      }
    );

    socket.on(
      "question-start",
      ({
        questionIndex: index,
        question,
        endsAt,
        serverTime,
        timeLimit: limit,
      }: {
        questionIndex: number;
        question: QuestionPayload;
        endsAt: number;
        serverTime: number;
        timeLimit: number;
      }) => {
        // Calculate server time offset using the server's actual timestamp
        // This accounts for clock differences between client and server
        const clientReceiveTime = Date.now();
        const calculatedOffset = serverTime - clientReceiveTime;
        setServerTimeOffset(calculatedOffset);
        
        console.log(`[Time Sync] Server time: ${serverTime}, Client time: ${clientReceiveTime}, Offset: ${calculatedOffset}ms`);
        
        setPhase("question");
        setQuestionIndex(index);
        setCurrentQuestion(question);
        setSelectedAnswers([]);
        setHasSubmitted(false);
        setAnswerFeedback(null);
        setLastSummary([]);
        setQuestionEndsAt(endsAt);
        // Use the timeLimit directly for initial display
        setTimeRemaining(limit);
        setTimeLimit(limit);
        
        // Reset powerup effects for new question
        setEliminatedOptions([]);
        setActivePowerupEffects({});
      }
    );

    socket.on(
      "question-ended",
      ({
        correctAnswers,
        scoreboard: entries,
        summary,
      }: {
        correctAnswers: number[];
        scoreboard: ScoreEntry[];
        summary: QuestionSummary[];
      }) => {
        setPhase("review");

        // Store previous scoreboard for animation
        setPreviousScoreboard(scoreboard);

        // Update scoreboard with animation
        setScoreboard(entries);
        setAnimatingScores(true);

        // Reset animation flag after animation completes
        setTimeout(() => setAnimatingScores(false), 600);

        setLastSummary(summary);
        setQuestionEndsAt(null);
        setTimeRemaining(0);
        setTimeLimit(null);

        const me = summary.find(
          (entry) => entry.userId === playerIdRef.current
        );
        setAnswerFeedback({
          isCorrect: Boolean(me?.isCorrect),
          gained: me?.gained ?? 0,
          correctAnswers,
          timeBonus: me?.timeBonus,
        });
      }
    );

    socket.on(
      "question-progress",
      ({ scoreboard: entries }: { scoreboard: ScoreEntry[] }) => {
        setScoreboard(entries);
      }
    );

    socket.on("answer-acknowledged", () => {
      setHasSubmitted(true);
    });

    socket.on("answer-rejected", ({ reason }) => {
      toaster.create({
        title: "Answer rejected",
        description: reason,
        type: "warning",
        duration: 4000,
      });
    });

    socket.on(
      "quiz-ended",
      ({
        scoreboard: entries,
        interrupted,
        reason,
      }: {
        scoreboard: ScoreEntry[];
        interrupted?: boolean;
        reason?: string;
      }) => {
        setPhase("complete");
        setScoreboard(entries);
        setCurrentQuestion(null);
        setQuestionEndsAt(null);
        setTimeRemaining(0);
        setTimeLimit(null);

        if (interrupted) {
          setQuizInterrupted(true);
          toaster.create({
            title: "Quiz Stopped",
            description: reason || "The quiz was stopped by the host.",
            type: "warning",
            duration: 5000,
          });
        }
      }
    );

    socket.on("quiz-cancelled", ({ reason }: { reason: string }) => {
      setPhase("complete");
      setCurrentQuestion(null);
      setQuestionEndsAt(null);
      setTimeRemaining(0);
      setTimeLimit(null);
      toaster.create({
        title: "Quiz cancelled",
        description: reason,
        type: "warning",
        duration: 5000,
      });
    });

    // Powerup event listeners
    socket.on("powerups-sync", ({ powerups }: { powerups: Powerup[] }) => {
      setPlayerPowerups(powerups);
    });

    socket.on("powerup-granted", ({ powerup, allPowerups }: { powerup: Powerup; allPowerups: Powerup[] }) => {
      setShowPowerupGrant(powerup);
      setPlayerPowerups(allPowerups);
      
      // Play celebration sound if available
      try {
        const audio = new Audio('/powerup-grant.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore audio errors
        });
      } catch (e) {
        // Ignore audio errors
      }
    });

    socket.on("powerup-used", ({ type, effect }: { powerupId: string; type: string; effect: any }) => {
      if (type === '50-50' && effect.eliminatedOptions) {
        setEliminatedOptions(effect.eliminatedOptions);
      } else if (type === 'time-freeze' && effect.newEndsAt) {
        setQuestionEndsAt(effect.newEndsAt);
      } else if (type === 'double-points') {
        setActivePowerupEffects(prev => ({ ...prev, doublePoints: true }));
        toaster.create({
          title: "Double Points Active!",
          description: "You'll earn 2x points for this question",
          type: "success",
          duration: 3000,
        });
      } else if (type === 'shield') {
        setActivePowerupEffects(prev => ({ ...prev, shield: true }));
        toaster.create({
          title: "Shield Active!",
          description: "You're protected from negative points",
          type: "success",
          duration: 3000,
        });
      }
    });

    socket.on("powerup-use-rejected", ({ reason }: { reason: string }) => {
      toaster.create({
        title: "Powerup Failed",
        description: reason,
        type: "error",
        duration: 3000,
      });
    });

    socket.on("time-extended", ({ playerName, newEndsAt }: { playerName: string; newEndsAt: number }) => {
      setQuestionEndsAt(newEndsAt);
      toaster.create({
        title: "Time Extended!",
        description: `${playerName} used Time Freeze! +15 seconds`,
        type: "info",
        duration: 3000,
      });
    });

    return () => {
      socket.emit("leave-lobby");
      socket.disconnect();
    };
  }, [navigate, quizCode, requestedHost]);

  useEffect(() => {
    if (!questionEndsAt) {
      return;
    }

    const updateRemaining = () => {
      // Use server time by adding the offset to our local time
      const serverTime = Date.now() + serverTimeOffset;
      setTimeRemaining(
        Math.max(0, Math.ceil((questionEndsAt - serverTime) / 1000))
      );
    };

    updateRemaining();
    const timerId = window.setInterval(updateRemaining, 500);
    return () => window.clearInterval(timerId);
  }, [questionEndsAt, serverTimeOffset]);

  const sortedScoreboard = useMemo(() => {
    return [...scoreboard].sort((a, b) => b.score - a.score);
  }, [scoreboard]);

  const isHost = hostSocketId !== null && clientSocketId === hostSocketId;

  const handleStartQuiz = () => {
    if (!socketRef.current) {
      return;
    }
    socketRef.current.emit("start-quiz");
  };

  const handleNextQuestion = () => {
    if (!socketRef.current) {
      return;
    }
    socketRef.current.emit("host-next-question");
  };

  const handleStopQuiz = () => {
    if (!socketRef.current) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to stop this quiz? Current scores will be saved."
    );

    if (confirmed) {
      socketRef.current.emit("stop-quiz");
    }
  };

  const submitAnswer = (answers: number[]) => {
    if (!socketRef.current || questionIndex < 0) {
      return;
    }
    socketRef.current.emit("submit-answer", {
      quizCode,
      questionIndex,
      answer: answers,
    });
  };

  const handleAnswerSelect = (index: number) => {
    if (!currentQuestion || hasSubmitted || phase !== "question") {
      return;
    }

    // Check if option is eliminated by 50-50 powerup
    if (eliminatedOptions.includes(index)) {
      return;
    }

    if (currentQuestion.answerType === "single") {
      setSelectedAnswers([index]);
      submitAnswer([index]);
    } else {
      setSelectedAnswers((prev) =>
        prev.includes(index)
          ? prev.filter((value) => value !== index)
          : [...prev, index]
      );
    }
  };

  const handleMultiSubmit = () => {
    if (
      !currentQuestion ||
      currentQuestion.answerType !== "multiple" ||
      selectedAnswers.length === 0
    ) {
      return;
    }
    submitAnswer(selectedAnswers);
  };

  const handleUsePowerup = (powerupId: string) => {
    if (!socketRef.current) {
      return;
    }

    const powerup = playerPowerups.find(p => p.id === powerupId);
    if (!powerup) {
      return;
    }

    // Can only use powerups during question phase
    if (phase !== "question") {
      toaster.create({
        title: "Cannot Use Powerup",
        description: "Powerups can only be used during questions",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    // Can't use powerups after submitting
    if (hasSubmitted) {
      toaster.create({
        title: "Cannot Use Powerup",
        description: "You've already submitted your answer",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    socketRef.current.emit("use-powerup", {
      powerupId,
      powerupType: powerup.type,
    });

    // Remove powerup from local state immediately for smooth UX
    setPlayerPowerups(prev => prev.filter(p => p.id !== powerupId));
  };

  const playersReady = participants.length;
  const viewingQuestion = phase === "question" && currentQuestion;
  const viewingReview = phase === "review" && currentQuestion;

  const playerSummary = useMemo(() => {
    return (
      lastSummary.find((entry) => entry.userId === playerIdRef.current) || null
    );
  }, [lastSummary]);

  return (
    <div className="live-page">
      {/* Connection Warning Modal */}
      {showConnectionWarning &&
        !acknowledgedWarning &&
        connectionType === "polling" && (
          <Portal>
            <Box
              position="fixed"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="blackAlpha.700"
              zIndex={2000}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box
                bg="bg.panel"
                borderRadius="lg"
                boxShadow="2xl"
                p={6}
                maxW="500px"
                width="90%"
                position="relative"
              >
                <Box
                  display="flex"
                  alignItems="center"
                  mb={4}
                  color="orange.500"
                >
                  <MdWarning size={32} />
                  <Heading size="lg" ml={2}>
                    Network Restriction Detected
                  </Heading>
                </Box>

                <VStack align="stretch" gap={3} mb={4}>
                  <Text>
                    <strong>WebSocket connections are blocked</strong> on your
                    network (likely due to firewall or proxy restrictions).
                  </Text>

                  <Text>
                    The quiz will use <strong>polling</strong> as a fallback,
                    but this may cause:
                  </Text>

                  <Box as="ul" pl={6}>
                    <li>⚠️ Slight delays in updates (1-2 seconds)</li>
                    <li>⚠️ Increased data usage</li>
                    <li>⚠️ Occasional connection hiccups</li>
                    <li>⚠️ Timer synchronization issues</li>
                  </Box>

                  <Text fontSize="sm" color="gray.500">
                    <strong>Recommended:</strong> Use a different network
                    (mobile hotspot, home WiFi) or VPN for better experience.
                  </Text>
                </VStack>

                <Box display="flex" gap={3} justifyContent="flex-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      socketRef.current?.disconnect();
                      navigate("/join");
                    }}
                  >
                    Cancel & Leave
                  </Button>
                  <Button
                    colorPalette="orange"
                    onClick={() => {
                      setAcknowledgedWarning(true);
                      setShowConnectionWarning(false);
                    }}
                  >
                    Continue Anyway
                  </Button>
                </Box>
              </Box>
            </Box>
          </Portal>
        )}

      <header className="live-header">
        <div>
          <h1>{quizMeta?.title || "RAYQuizA Live Quiz"}</h1>
          <p className="live-subtitle">
            Code: <span>{quizCode}</span> · Connected:{" "}
            {socketConnected ? "Online" : "Reconnecting"}
          </p>
        </div>
        <div className="live-header-right">
          {quizMeta && (
            <Badge colorPalette="teal" size="lg">
              {questionIndex >= 0
                ? `Question ${questionIndex + 1} / ${quizMeta.totalQuestions}`
                : `Waiting (${quizMeta.totalQuestions} questions)`}
            </Badge>
          )}
          {isHost && phase === "lobby" && (
            <Button
              colorPalette="teal"
              onClick={handleStartQuiz}
              loading={!socketConnected}
              disabled={!socketConnected || playersReady < 1}
            >
              Start Quiz
            </Button>
          )}
          {isHost && (phase === "question" || phase === "review") && (
            <Button
              colorPalette="red"
              variant="outline"
              onClick={handleStopQuiz}
            >
              Stop Quiz
            </Button>
          )}
          {isHost && phase === "review" && (
            <Button
              colorPalette="teal"
              variant="outline"
              onClick={handleNextQuestion}
            >
              Skip Wait &rarr;
            </Button>
          )}
        </div>
      </header>

      <main className="live-content">
        <section className="live-main">
          {phase === "lobby" && (
            <div className="lobby-state">
              <h2>Lobby</h2>
              {supervisorMode ? (
                <p>
                  <Badge colorPalette="purple" mb={2}>
                    Supervisor Mode
                  </Badge>
                  <br />
                  You're supervising this quiz. Start when players are ready.
                </p>
              ) : (
                <p>
                  Waiting for players. When everyone is ready, the host can
                  start the quiz.
                </p>
              )}
              <Separator marginBlock="1rem" />
              <ul className="participant-list">
                {participants.map((participant) => (
                  <li key={participant.socketId}>
                    <span>{participant.name}</span>
                    {participant.isHost && (
                      <Badge colorPalette="purple">Host</Badge>
                    )}
                  </li>
                ))}
              </ul>
              {participants.length === 0 && !supervisorMode && (
                <p className="muted">
                  No one is here yet. Share the code to invite friends!
                </p>
              )}
            </div>
          )}

          {viewingQuestion && (
            <div className="question-wrapper">
              {/* Active powerup effects indicator */}
              {(activePowerupEffects.doublePoints || activePowerupEffects.shield) && (
                <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  marginBottom: '10px', 
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  {activePowerupEffects.doublePoints && (
                    <Badge colorPalette="yellow" size="lg" style={{ fontSize: '14px', padding: '8px 12px' }}>
                      ⭐ Double Points Active!
                    </Badge>
                  )}
                  {activePowerupEffects.shield && (
                    <Badge colorPalette="green" size="lg" style={{ fontSize: '14px', padding: '8px 12px' }}>
                      🛡️ Shield Active!
                    </Badge>
                  )}
                </div>
              )}
              
              <QuizOps
                question={currentQuestion.text}
                type={currentQuestion.answerType}
                options={currentQuestion.options}
                image={currentQuestion.imageUrl || ""}
                selectedAnswers={selectedAnswers}
                onAnswerSelect={handleAnswerSelect}
                showFeedback={false}
                disableInteractions={hasSubmitted}
                timeRemaining={timeRemaining}
                totalTime={timeLimit}
                eliminatedOptions={eliminatedOptions}
              />

              {currentQuestion.answerType === "multiple" && (
                <Button
                  colorPalette="teal"
                  onClick={handleMultiSubmit}
                  disabled={selectedAnswers.length === 0 || hasSubmitted}
                  loading={hasSubmitted}
                  className="submit-btn"
                >
                  Submit Answers
                </Button>
              )}

              {hasSubmitted && (
                <p className="muted">
                  Answer received. Waiting for everyone else...
                </p>
              )}
            </div>
          )}

          {viewingReview && (
            <div className="review-wrapper">
              {supervisorMode ? (
                // Supervisor view: Only show who got it right/wrong
                <div className="supervisor-review">
                  <h2>Question {questionIndex + 1} Results</h2>
                  <div className="supervisor-results">
                    <div className="correct-answers">
                      <h3 style={{ color: "#4CAF50" }}>
                        ✓ Correct (
                        {lastSummary.filter((s) => s.isCorrect).length})
                      </h3>
                      <ul>
                        {lastSummary
                          .filter((s) => s.isCorrect)
                          .map((entry) => (
                            <li key={entry.userId} style={{ color: "#4CAF50" }}>
                              {entry.name}
                              {entry.timeBonus && entry.timeBonus > 1 && (
                                <span style={{ marginLeft: "0.5rem" }}>
                                  {entry.timeBonus === 2.0 && "⚡"}
                                  {entry.timeBonus === 1.75 && "🔥"}
                                  {entry.timeBonus === 1.5 && "⭐"}
                                </span>
                              )}
                              <span
                                style={{ float: "right", fontWeight: "bold" }}
                              >
                                +{entry.gained.toFixed(2)}
                              </span>
                            </li>
                          ))}
                      </ul>
                      {lastSummary.filter((s) => s.isCorrect).length === 0 && (
                        <p style={{ fontStyle: "italic", color: "#999" }}>
                          No one got it right
                        </p>
                      )}
                    </div>
                    <div className="incorrect-answers">
                      <h3 style={{ color: "#F44336" }}>
                        ✗ Incorrect (
                        {lastSummary.filter((s) => !s.isCorrect).length})
                      </h3>
                      <ul>
                        {lastSummary
                          .filter((s) => !s.isCorrect)
                          .map((entry) => (
                            <li key={entry.userId} style={{ color: "#F44336" }}>
                              {entry.name}
                              <span
                                style={{ float: "right", fontWeight: "bold" }}
                              >
                                {entry.gained.toFixed(2)}
                              </span>
                            </li>
                          ))}
                      </ul>
                      {lastSummary.filter((s) => !s.isCorrect).length === 0 && (
                        <p style={{ fontStyle: "italic", color: "#999" }}>
                          Everyone got it right!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Normal player view: Show question with feedback
                <>
                  <QuizOps
                    question={currentQuestion.text}
                    type={currentQuestion.answerType}
                    options={currentQuestion.options}
                    image={currentQuestion.imageUrl || ""}
                    selectedAnswers={playerSummary?.selected || []}
                    showFeedback={true}
                    isCorrect={Boolean(playerSummary?.isCorrect)}
                    correctAnswers={answerFeedback?.correctAnswers || []}
                    disableInteractions={true}
                  />
                  <div className="review-panel">
                    <h3>Round Summary</h3>
                    <p>
                      {playerSummary
                        ? playerSummary.isCorrect
                          ? `Nice! You earned ${playerSummary.gained.toFixed(
                              2
                            )} point${playerSummary.gained === 1 ? "" : "s"}${
                              playerSummary.timeBonus
                                ? ` (${playerSummary.timeBonus}x speed bonus!)`
                                : ""
                            }.`
                          : playerSummary.gained < 0
                          ? `Tough luck. ${Math.abs(
                              playerSummary.gained
                            )} point penalty.`
                          : "No points this round, get ready for the next one!"
                        : "You joined mid-question. Scores resume next round."}
                    </p>
                    {playerSummary?.timeBonus && playerSummary.isCorrect && (
                      <p
                        className="time-bonus-info"
                        style={{
                          fontSize: "0.9em",
                          color: "#4CAF50",
                          marginTop: "0.5rem",
                        }}
                      >
                        🚀 Speed Bonus:
                        {playerSummary.timeBonus === 2.0 &&
                          " ⚡ Lightning Fast! (within 10%)"}
                        {playerSummary.timeBonus === 1.75 &&
                          " 🔥 Super Quick! (within 25%)"}
                        {playerSummary.timeBonus === 1.5 &&
                          " ⭐ Nice Speed! (within 50%)"}
                        {playerSummary.timeBonus === 1.0 && " ✓ Good Job!"}
                      </p>
                    )}
                    <ul>
                      {lastSummary.map((entry) => (
                        <li key={entry.userId}>
                          <span>
                            {entry.name}
                            {entry.timeBonus && entry.timeBonus > 1 && (
                              <span
                                style={{
                                  fontSize: "0.8em",
                                  color: "#FF9800",
                                  marginLeft: "0.5rem",
                                }}
                              >
                                {entry.timeBonus === 2.0 && "⚡"}
                                {entry.timeBonus === 1.75 && "🔥"}
                                {entry.timeBonus === 1.5 && "⭐"}
                              </span>
                            )}
                          </span>
                          <span>
                            {entry.gained > 0
                              ? `+${entry.gained.toFixed(2)}`
                              : entry.gained.toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}

          {phase === "complete" && (
            <div className="complete-wrapper">
              <h2>{quizInterrupted ? "Quiz Stopped" : "Quiz Complete"}</h2>
              <p>
                {quizInterrupted
                  ? "The quiz was stopped by the host. Here are the scores at the time of stopping."
                  : "Thanks for playing! Here are the final standings."}
              </p>
              <ol>
                {sortedScoreboard.map((entry) => (
                  <li key={entry.userId}>
                    <span>{entry.name}</span>
                    <span>{entry.score.toFixed(2)}</span>
                  </li>
                ))}
              </ol>
              <Button onClick={() => navigate("/home")}>Back to Home</Button>
            </div>
          )}
        </section>

        <aside className="live-sidebar">
          <div className="live-card">
            <h3>Players</h3>
            <ul className="participant-list">
              {participants.map((participant) => (
                <li key={participant.socketId}>
                  <span>{participant.name}</span>
                  {participant.isHost && (
                    <Badge colorPalette="purple">Host</Badge>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="live-card">
            <h3>Scoreboard</h3>
            <ol className="scoreboard-list">
              {sortedScoreboard.map((entry, index) => {
                // Check if position changed
                const previousIndex = previousScoreboard.findIndex(
                  (p) => p.userId === entry.userId
                );
                const positionChanged =
                  animatingScores &&
                  previousIndex !== -1 &&
                  previousIndex !== index;
                const isTopPlayer = index === 0 && sortedScoreboard.length > 1;

                return (
                  <li
                    key={entry.userId}
                    className={`
                      ${entry.userId === playerIdRef.current ? "me" : ""}
                      ${isTopPlayer ? "top-player" : ""}
                      ${positionChanged ? "position-changed" : ""}
                    `.trim()}
                  >
                    <span>
                      {index + 1}. {entry.name}
                      {isTopPlayer && " 👑"}
                    </span>
                    <span>{entry.score.toFixed(2)}</span>
                  </li>
                );
              })}
              {sortedScoreboard.length === 0 && (
                <p className="muted">
                  Scores will appear after the first question.
                </p>
              )}
            </ol>
          </div>
        </aside>
      </main>
      
      {/* Powerup Bar - show during question phase and not in supervisor mode */}
      {!supervisorMode && phase === "question" && playerPowerups.length > 0 && (
        <PowerupBar
          powerups={playerPowerups}
          onUsePowerup={handleUsePowerup}
          disabled={hasSubmitted}
        />
      )}
      
      {/* Powerup Grant Animation */}
      {showPowerupGrant && (
        <PowerupGrantAnimation
          powerup={showPowerupGrant}
          onComplete={() => setShowPowerupGrant(null)}
        />
      )}
    </div>
  );
};

export default LiveQuiz;
