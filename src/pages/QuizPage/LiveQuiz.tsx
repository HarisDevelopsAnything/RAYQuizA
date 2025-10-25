import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { Button, Badge, Separator, Box, Heading, Text, Portal, VStack } from "@chakra-ui/react";
import QuizOps from "@/components/QuizOps/QuizOps";
import { toaster } from "@/components/ui/toaster";
import { MdWarning, MdClose } from "react-icons/md";
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
  } | null>(null);
  const [lastSummary, setLastSummary] = useState<QuestionSummary[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<"websocket" | "polling" | null>(null);
  const [showConnectionWarning, setShowConnectionWarning] = useState(false);
  const [acknowledgedWarning, setAcknowledgedWarning] = useState(false);

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
      
      socket.emit("join-lobby", {
        quizCode,
        player: {
          id: playerIdRef.current,
          name: playerNameRef.current,
          isHost: requestedHost,
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

    socket.on("host-rejected", () => {
      toaster.create({
        title: "Host already active",
        description:
          "You joined as a player because another host is controlling this lobby.",
        type: "info",
        duration: 4000,
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

    socket.on("quiz-data", (payload: QuizMeta) => {
      setQuizMeta(payload);
    });

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
        timeLimit: limit,
      }: {
        questionIndex: number;
        question: QuestionPayload;
        endsAt: number;
        timeLimit: number;
      }) => {
        setPhase("question");
        setQuestionIndex(index);
        setCurrentQuestion(question);
        setSelectedAnswers([]);
        setHasSubmitted(false);
        setAnswerFeedback(null);
        setLastSummary([]);
        setQuestionEndsAt(endsAt);
        setTimeRemaining(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
        setTimeLimit(limit);
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
        setScoreboard(entries);
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
      ({ scoreboard: entries }: { scoreboard: ScoreEntry[] }) => {
        setPhase("complete");
        setScoreboard(entries);
        setCurrentQuestion(null);
        setQuestionEndsAt(null);
        setTimeRemaining(0);
        setTimeLimit(null);
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
      setTimeRemaining(
        Math.max(0, Math.ceil((questionEndsAt - Date.now()) / 1000))
      );
    };

    updateRemaining();
    const timerId = window.setInterval(updateRemaining, 500);
    return () => window.clearInterval(timerId);
  }, [questionEndsAt]);

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
      {showConnectionWarning && !acknowledgedWarning && connectionType === "polling" && (
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
              <Box display="flex" alignItems="center" mb={4} color="orange.500">
                <MdWarning size={32} />
                <Heading size="lg" ml={2}>
                  Network Restriction Detected
                </Heading>
              </Box>

              <VStack align="stretch" gap={3} mb={4}>
                <Text>
                  <strong>WebSocket connections are blocked</strong> on your network
                  (likely due to firewall or proxy restrictions).
                </Text>
                
                <Text>
                  The quiz will use <strong>polling</strong> as a fallback, but this may cause:
                </Text>
                
                <Box as="ul" pl={6}>
                  <li>⚠️ Slight delays in updates (1-2 seconds)</li>
                  <li>⚠️ Increased data usage</li>
                  <li>⚠️ Occasional connection hiccups</li>
                  <li>⚠️ Timer synchronization issues</li>
                </Box>

                <Text fontSize="sm" color="gray.500">
                  <strong>Recommended:</strong> Use a different network (mobile hotspot, home WiFi) or VPN for better experience.
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
              <p>
                Waiting for players. When everyone is ready, the host can start
                the quiz.
              </p>
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
              {participants.length === 0 && (
                <p className="muted">
                  No one is here yet. Share the code to invite friends!
                </p>
              )}
            </div>
          )}

          {viewingQuestion && (
            <div className="question-wrapper">
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
                      ? `Nice! You earned ${playerSummary.gained} point${
                          playerSummary.gained === 1 ? "" : "s"
                        }.`
                      : playerSummary.gained < 0
                      ? `Tough luck. ${Math.abs(
                          playerSummary.gained
                        )} point penalty.`
                      : "No points this round, get ready for the next one!"
                    : "You joined mid-question. Scores resume next round."}
                </p>
                <ul>
                  {lastSummary.map((entry) => (
                    <li key={entry.userId}>
                      <span>{entry.name}</span>
                      <span>
                        {entry.gained > 0 ? `+${entry.gained}` : entry.gained}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {phase === "complete" && (
            <div className="complete-wrapper">
              <h2>Quiz Complete</h2>
              <p>Thanks for playing! Here are the final standings.</p>
              <ol>
                {sortedScoreboard.map((entry) => (
                  <li key={entry.userId}>
                    <span>{entry.name}</span>
                    <span>{entry.score}</span>
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
              {sortedScoreboard.map((entry, index) => (
                <li
                  key={entry.userId}
                  className={
                    entry.userId === playerIdRef.current ? "me" : undefined
                  }
                >
                  <span>
                    {index + 1}. {entry.name}
                  </span>
                  <span>{entry.score}</span>
                </li>
              ))}
              {sortedScoreboard.length === 0 && (
                <p className="muted">
                  Scores will appear after the first question.
                </p>
              )}
            </ol>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default LiveQuiz;
