import { getDb } from "./connect.cjs";

const lobbies = new Map();
const REVIEW_DELAY_MS = Number(process.env.QUIZ_REVIEW_DELAY_MS || 8000); // 8 seconds: 3s for scoreboard animation + 5s review
const CLEANUP_INTERVAL_MS = 60 * 1000;
const LOBBY_IDLE_MS = 60 * 60 * 1000;

// Powerup system constants
const POWERUP_TYPES = ['50-50', 'time-freeze', 'double-points', 'shield'];
const POWERUP_GRANT_THRESHOLD = 2; // Consecutive correct fast answers needed
const MAX_POWERUPS_PER_PLAYER = 3;

const POWERUP_DEFINITIONS = {
  '50-50': {
    type: '50-50',
    name: '50-50',
    description: 'Eliminate 2 incorrect answers',
    icon: '✂️',
    color: '#FF6B6B',
  },
  'time-freeze': {
    type: 'time-freeze',
    name: 'Time Freeze',
    description: 'Get 15 extra seconds',
    icon: '⏰',
    color: '#4ECDC4',
  },
  'double-points': {
    type: 'double-points',
    name: 'Double Points',
    description: 'Earn 2x points for this question',
    icon: '⭐',
    color: '#FFD93D',
  },
  'shield': {
    type: 'shield',
    name: 'Shield',
    description: 'Protect from negative points',
    icon: '🛡️',
    color: '#95E1D3',
  },
};

const sortNumbers = (values) =>
  values.map((value) => Number(value)).filter((value) => !Number.isNaN(value)).sort((a, b) => a - b);

const ensureArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === undefined || value === null) {
    return [];
  }
  return [value];
};

const arraysEqual = (a, b) => a.length === b.length && a.every((value, index) => value === b[index]);

const normalizeCode = (code) => (code ? String(code).trim().toUpperCase() : "");

const formatParticipant = (participant) => ({
  socketId: participant.socketId,
  userId: participant.userId,
  name: participant.name,
  isHost: participant.isHost,
  joinedAt: participant.joinedAt,
});

const emitScoreboard = (io, quizCode, lobby) => {
  io.to(quizCode).emit("scoreboard-update", {
    quizCode,
    scoreboard: Array.from(lobby.scoreboard.values()),
  });
};

const broadcastLobby = (io, quizCode, lobby) => {
  io.to(quizCode).emit("lobby-update", {
    participants: Array.from(lobby.participants.values()).map(formatParticipant),
    started: lobby.started,
    hostSocketId: lobby.hostSocketId,
  });
};

const clearTimers = (lobby) => {
  if (lobby.questionTimer) {
    clearTimeout(lobby.questionTimer);
    lobby.questionTimer = null;
  }
  if (lobby.advanceTimer) {
    clearTimeout(lobby.advanceTimer);
    lobby.advanceTimer = null;
  }
};

const endQuiz = async (io, quizCode, lobby, reason = "completed") => {
  clearTimers(lobby);
  lobby.started = false;
  const wasInterrupted = reason === "interrupted";
  const finalQuestionIndex = lobby.currentQuestionIndex;
  lobby.currentQuestionIndex = -1;
  lobby.questionEndsAt = null;
  lobby.answers.clear();

  const scoreboard = Array.from(lobby.scoreboard.values());

  io.to(quizCode).emit("quiz-ended", {
    quizCode,
    scoreboard,
    interrupted: wasInterrupted,
    reason: wasInterrupted ? "Quiz was stopped by the host" : "Quiz completed",
  });

  emitScoreboard(io, quizCode, lobby);

  // Save quiz history to database
  try {
    const db = await getDb();
    const participants = scoreboard.map(entry => ({
      userId: entry.userId,
      name: entry.name,
      email: entry.email || null,
      score: entry.score,
    }));

    // Determine host email
    let hostEmail = null;
    for (const participant of lobby.participants.values()) {
      if (participant.isHost && participant.email) {
        hostEmail = participant.email;
        break;
      }
    }

    // Get creator email from quiz
    const creatorEmail = lobby.quiz.createdByEmail || hostEmail;

    const quizHistoryEntry = {
      quizCode,
      quizTitle: lobby.quiz.title || "Untitled Quiz",
      quizId: lobby.quiz._id || null,
      creatorEmail,
      hostEmail,
      participants,
      completedAt: new Date(),
      totalParticipants: participants.length,
      status: wasInterrupted ? "interrupted" : "completed",
      questionsCompleted: wasInterrupted ? finalQuestionIndex : (lobby.quiz.questions?.length || 0),
      totalQuestions: lobby.quiz.questions?.length || 0,
    };

    console.log("Saving quiz history:", JSON.stringify(quizHistoryEntry, null, 2));
    await db.collection("QuizHistory").insertOne(quizHistoryEntry);
    console.log(`Quiz history saved successfully (${wasInterrupted ? 'interrupted' : 'completed'})`);
  } catch (error) {
    console.error("Failed to save quiz history:", error);
  }
};

const cancelQuiz = (io, quizCode, lobby, reason) => {
  clearTimers(lobby);
  lobby.started = false;
  lobby.currentQuestionIndex = -1;
  lobby.questionEndsAt = null;
  lobby.answers.clear();

  io.to(quizCode).emit("quiz-cancelled", {
    quizCode,
    reason,
  });
};

const startQuestion = (io, quizCode, lobby, index) => {
  if (!lobby.quiz || !Array.isArray(lobby.quiz.questions) || !lobby.quiz.questions[index]) {
    endQuiz(io, quizCode, lobby);
    return;
  }

  const question = lobby.quiz.questions[index];
  const durationSeconds = Math.max(5, Number(question.timeLimit || question.timing || 30));

  const serverNow = Date.now(); // Capture server time once
  lobby.started = true;
  lobby.currentQuestionIndex = index;
  lobby.questionEndsAt = serverNow + durationSeconds * 1000;
  lobby.questionStartTime = serverNow; // Track when question started
  lobby.answers.clear();
  lobby.lastActivity = serverNow;

  clearTimers(lobby);

  lobby.questionTimer = setTimeout(() => {
    finalizeQuestion(io, quizCode, lobby);
  }, durationSeconds * 1000);

  io.to(quizCode).emit("question-start", {
    quizCode,
    questionIndex: index,
    totalQuestions: lobby.quiz.questions.length,
    question: {
      text: question.question || question.questionText || "",
      options: question.options || [],
      answerType: question.answerType || (Array.isArray(question.correctOption) ? "multiple" : "single"),
      imageUrl: question.imageUrl || question.image || "",
      points: Number(question.points ?? 1),
      negativePoints: Number(question.negativePoints ?? 0),
    },
    endsAt: lobby.questionEndsAt,
    serverTime: serverNow, // Send current server time for synchronization
    timeLimit: durationSeconds,
  });
};

const calculateTimeBonus = (timeLimit, timeTaken) => {
  const percentage = (timeTaken / timeLimit) * 100;
  
  if (percentage <= 10) return 2.0;      // Within 10% of time: 2 pts
  if (percentage <= 25) return 1.75;     // Within 25% of time: 1.75 pts
  if (percentage <= 50) return 1.5;      // Within 50% of time: 1.5 pts
  return 1.0;                            // Else: 1 pt
};

// Grant a random powerup to a player
const grantRandomPowerup = (lobby, userId) => {
  if (!lobby.playerPowerups.has(userId)) {
    lobby.playerPowerups.set(userId, []);
  }

  const playerPowerups = lobby.playerPowerups.get(userId);
  
  // Select random powerup type
  const randomType = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
  const definition = POWERUP_DEFINITIONS[randomType];
  
  const powerup = {
    id: `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: definition.type,
    name: definition.name,
    description: definition.description,
    icon: definition.icon,
    color: definition.color,
    grantedAt: Date.now(),
  };

  // Maintain max 3 powerups per player (FIFO)
  if (playerPowerups.length >= MAX_POWERUPS_PER_PLAYER) {
    playerPowerups.shift(); // Remove oldest
  }
  
  playerPowerups.push(powerup);
  lobby.playerPowerups.set(userId, playerPowerups);

  return powerup;
};

// Check if player is eligible for powerup grant
const checkPowerupEligibility = (lobby, userId, isCorrect, timeBonus) => {
  if (!isCorrect || timeBonus < 2.0) {
    // Not a fast correct answer, reset streak
    if (lobby.powerupStats.has(userId)) {
      lobby.powerupStats.set(userId, { fastCorrectStreak: 0 });
    }
    return null;
  }

  // Track fast correct answers
  const stats = lobby.powerupStats.get(userId) || { fastCorrectStreak: 0 };
  stats.fastCorrectStreak = (stats.fastCorrectStreak || 0) + 1;
  lobby.powerupStats.set(userId, stats);

  // Grant powerup when threshold is reached
  if (stats.fastCorrectStreak >= POWERUP_GRANT_THRESHOLD) {
    stats.fastCorrectStreak = 0; // Reset streak
    lobby.powerupStats.set(userId, stats);
    return grantRandomPowerup(lobby, userId);
  }

  return null;
};

const finalizeQuestion = (io, quizCode, lobby) => {
  clearTimers(lobby);

  if (!lobby.quiz || lobby.currentQuestionIndex < 0) {
    return;
  }

  const question = lobby.quiz.questions[lobby.currentQuestionIndex];
  const correctAnswers = sortNumbers(
    ensureArray(question.correctOption ?? question.correctAnswers ?? question.correctAnswer ?? []),
  );
  const points = Number(question.points ?? 1);
  const negative = Number(question.negativePoints ?? 0);
  const timeLimit = Math.max(5, Number(question.timeLimit || question.timing || 30));

  const summary = [];
  const powerupGrants = []; // Track powerup grants for this question

  lobby.questionEndsAt = null;
  const questionStartTime = lobby.questionStartTime || Date.now();

  for (const participant of lobby.participants.values()) {
    const answerKey = participant.userId;
    const answerRecord = lobby.answers.get(answerKey);
    const submitted = answerRecord ? sortNumbers(answerRecord.choices) : [];
    const isCorrect = submitted.length > 0 && arraysEqual(submitted, correctAnswers);

    let gained = 0;
    let timeBonus = 1.0;
    
    // Check for active powerup effects
    const activeEffects = lobby.activePowerupEffects.get(answerKey) || {};
    
    if (answerRecord) {
      if (isCorrect) {
        // Calculate time bonus based on how quickly they answered
        const timeTaken = (answerRecord.submittedAt - questionStartTime) / 1000; // in seconds
        timeBonus = calculateTimeBonus(timeLimit, timeTaken);
        let basePoints = points * timeBonus;
        
        // Apply double points powerup if active
        if (activeEffects.doublePoints) {
          basePoints *= 2;
        }
        
        gained = basePoints;
      } else {
        // Apply shield powerup if active (blocks negative points)
        if (activeEffects.shield) {
          gained = 0;
        } else {
          gained = negative ? -Math.abs(negative) : 0;
        }
      }
    } else if (negative) {
      // Apply shield powerup if active (blocks negative points for no answer)
      if (activeEffects.shield) {
        gained = 0;
      } else {
        gained = -Math.abs(negative);
      }
    }

    const scoreboardEntry = lobby.scoreboard.get(answerKey) || {
      userId: participant.userId,
      name: participant.name,
      email: participant.email,
      score: 0,
    };

    scoreboardEntry.score += gained;
    scoreboardEntry.name = participant.name;
    scoreboardEntry.email = participant.email;
    lobby.scoreboard.set(answerKey, scoreboardEntry);

    summary.push({
      userId: participant.userId,
      name: participant.name,
      selected: submitted,
      isCorrect,
      gained,
      timeBonus: isCorrect ? timeBonus : undefined,
    });
    
    // Check for powerup eligibility and grant if qualified
    const grantedPowerup = checkPowerupEligibility(lobby, participant.userId, isCorrect, timeBonus);
    if (grantedPowerup) {
      powerupGrants.push({
        userId: participant.userId,
        powerup: grantedPowerup,
      });
    }
  }
  
  // Clear active powerup effects for next question
  lobby.activePowerupEffects.clear();

  io.to(quizCode).emit("question-ended", {
    quizCode,
    questionIndex: lobby.currentQuestionIndex,
    correctAnswers,
    scoreboard: Array.from(lobby.scoreboard.values()),
    summary,
  });

  // Emit powerup grants to individual players
  for (const grant of powerupGrants) {
    const participant = Array.from(lobby.participants.values()).find(p => p.userId === grant.userId);
    if (participant) {
      io.to(participant.socketId).emit("powerup-granted", {
        powerup: grant.powerup,
        allPowerups: lobby.playerPowerups.get(grant.userId) || [],
      });
    }
  }

  emitScoreboard(io, quizCode, lobby);

  const nextIndex = lobby.currentQuestionIndex + 1;
  const hasMore = !!(lobby.quiz && lobby.quiz.questions && lobby.quiz.questions[nextIndex]);

  if (hasMore) {
    lobby.advanceTimer = setTimeout(() => {
      startQuestion(io, quizCode, lobby, nextIndex);
    }, REVIEW_DELAY_MS);
  } else {
    lobby.advanceTimer = setTimeout(() => {
      endQuiz(io, quizCode, lobby);
    }, REVIEW_DELAY_MS);
  }
};

const loadQuizByCode = async (quizCode) => {
  const db = await getDb();
  return db.collection("Quizzes").findOne({ code: quizCode });
};

const getOrCreateLobby = async (quizCode) => {
  const existing = lobbies.get(quizCode);
  if (existing) {
    return existing;
  }

  const quiz = await loadQuizByCode(quizCode);
  if (!quiz) {
    return null;
  }

  const lobby = {
    quizCode,
    quiz,
    participants: new Map(),
    scoreboard: new Map(),
    answers: new Map(),
    powerupStats: new Map(), // Track powerup eligibility per player
    playerPowerups: new Map(), // Track active powerups per player
    activePowerupEffects: new Map(), // Track active powerup effects during questions
    hostSocketId: null,
    hostEmail: null, // Track the actual host's email
    creatorEmail: quiz.createdByEmail || null, // Quiz creator's email
    started: false,
    currentQuestionIndex: -1,
    questionEndsAt: null,
    questionTimer: null,
    advanceTimer: null,
    lastActivity: Date.now(),
  };

  lobbies.set(quizCode, lobby);
  return lobby;
};

const removeParticipant = (io, quizCode, lobby, socketId) => {
  const participant = lobby.participants.get(socketId);
  if (!participant) {
    return;
  }

  lobby.participants.delete(socketId);
  lobby.lastActivity = Date.now();

  if (lobby.answers.has(participant.userId)) {
    lobby.answers.delete(participant.userId);
  }

  if (lobby.scoreboard.has(participant.userId)) {
    const scoreboardEntry = lobby.scoreboard.get(participant.userId);
    if (scoreboardEntry) {
      scoreboardEntry.name = participant.name;
      lobby.scoreboard.set(participant.userId, scoreboardEntry);
    }
  }

  if (lobby.hostSocketId === socketId) {
    lobby.hostSocketId = null;
    const nextHostIterator = lobby.participants.values();
    const nextHost = nextHostIterator.next().value;
    if (nextHost) {
      nextHost.isHost = true;
      lobby.hostSocketId = nextHost.socketId;
      lobby.participants.set(nextHost.socketId, nextHost);
      io.to(nextHost.socketId).emit("host-promoted", { quizCode });
    } else {
      if (lobby.started) {
        cancelQuiz(io, quizCode, lobby, "Host disconnected");
      }
      clearTimers(lobby);
      lobbies.delete(quizCode);
      return;
    }
  }

  if (lobby.participants.size === 0) {
    clearTimers(lobby);
    lobbies.delete(quizCode);
    return;
  }

  broadcastLobby(io, quizCode, lobby);
  emitScoreboard(io, quizCode, lobby);
};

const setupRealtime = (io) => {
  io.on("connection", (socket) => {
    socket.data.quizCode = null;

    socket.on("join-lobby", async ({ quizCode, player }) => {
      const normalizedCode = normalizeCode(quizCode);
      if (!normalizedCode) {
        socket.emit("lobby-error", { message: "Invalid quiz code" });
        return;
      }

      const lobby = await getOrCreateLobby(normalizedCode);
      if (!lobby) {
        socket.emit("lobby-error", { message: "Quiz not found" });
        return;
      }

      const playerId = player?.id || `guest-${socket.id}`;
      const participantName = player?.name || `Player-${socket.id.slice(-4)}`;
      const participantEmail = player?.email || null;
      const hostRequested = Boolean(player?.isHost);
      const supervisorMode = Boolean(player?.supervisorMode); // Host supervising without playing
      
      let isHost = false;
      let canBeHost = false;

      // Verify if this user can be host
      if (hostRequested) {
        // Check if user's email matches the quiz creator's email
        if (participantEmail && lobby.creatorEmail && participantEmail === lobby.creatorEmail) {
          canBeHost = true;
        } else if (!lobby.creatorEmail) {
          // Fallback: if no creator email stored, allow first requester (shouldn't happen normally)
          canBeHost = true;
        }
      }

      // Assign host status
      if (canBeHost && !lobby.hostSocketId) {
        isHost = true;
        lobby.hostEmail = participantEmail;
      } else if (canBeHost && lobby.hostSocketId) {
        // Host reconnecting - transfer host status
        isHost = true;
        lobby.hostSocketId = socket.id;
        lobby.hostEmail = participantEmail;
      } else if (hostRequested && !canBeHost) {
        socket.emit("host-rejected", { 
          quizCode: normalizedCode,
          reason: "Only the quiz creator can be the host"
        });
        return; // Don't allow them to join if they requested host but aren't authorized
      }

      // If supervisor mode, host doesn't participate in the quiz
      if (supervisorMode && isHost) {
        // Host is only supervising - don't add to participants/scoreboard
        lobby.hostSocketId = socket.id;
        lobby.hostEmail = participantEmail;
        
        socket.join(normalizedCode);
        socket.data.quizCode = normalizedCode;
        socket.data.isSupervisor = true;

        socket.emit("quiz-data", {
          quizCode: normalizedCode,
          title: lobby.quiz.title,
          description: lobby.quiz.description || "",
          totalQuestions: Array.isArray(lobby.quiz.questions) ? lobby.quiz.questions.length : 0,
          supervisorMode: true,
        });

        socket.emit("host-confirmed", { quizCode: normalizedCode });
        
        broadcastLobby(io, normalizedCode, lobby);
        emitScoreboard(io, normalizedCode, lobby);
        
        console.log(`Host ${participantName} joined as supervisor for quiz ${normalizedCode}`);
        return;
      }

      // Regular participant (including host if they choose to play)
      const participant = {
        socketId: socket.id,
        userId: playerId,
        name: participantName,
        email: participantEmail,
        isHost,
        joinedAt: new Date().toISOString(),
      };

      lobby.participants.set(socket.id, participant);
      if (isHost) {
        lobby.hostSocketId = socket.id;
        lobby.hostEmail = participantEmail;
      }

      // Add to scoreboard
      if (!lobby.scoreboard.has(playerId)) {
        lobby.scoreboard.set(playerId, {
          userId: playerId,
          name: participantName,
          email: participantEmail,
          score: 0,
        });
      } else {
        const scoreboardEntry = lobby.scoreboard.get(playerId);
        if (scoreboardEntry) {
          scoreboardEntry.name = participantName;
          scoreboardEntry.email = participantEmail;
          lobby.scoreboard.set(playerId, scoreboardEntry);
        }
      }

      lobby.lastActivity = Date.now();

      socket.join(normalizedCode);
      socket.data.quizCode = normalizedCode;

      socket.emit("quiz-data", {
        quizCode: normalizedCode,
        title: lobby.quiz.title,
        description: lobby.quiz.description || "",
        totalQuestions: Array.isArray(lobby.quiz.questions) ? lobby.quiz.questions.length : 0,
      });

      if (isHost) {
        socket.emit("host-confirmed", { quizCode: normalizedCode });
      }

      // Send player's powerups
      const playerPowerups = lobby.playerPowerups.get(playerId) || [];
      socket.emit("powerups-sync", {
        powerups: playerPowerups,
      });

      broadcastLobby(io, normalizedCode, lobby);
      emitScoreboard(io, normalizedCode, lobby);

      if (lobby.started && lobby.currentQuestionIndex >= 0) {
        const question = lobby.quiz.questions[lobby.currentQuestionIndex];
        socket.emit("question-start", {
          quizCode: normalizedCode,
          questionIndex: lobby.currentQuestionIndex,
          totalQuestions: lobby.quiz.questions.length,
          question: {
            text: question.question || question.questionText || "",
            options: question.options || [],
            answerType: question.answerType || (Array.isArray(question.correctOption) ? "multiple" : "single"),
            imageUrl: question.imageUrl || question.image || "",
            points: Number(question.points ?? 1),
            negativePoints: Number(question.negativePoints ?? 0),
          },
          endsAt: lobby.questionEndsAt,
          timeLimit: Math.max(5, Number(question.timeLimit || question.timing || 30)),
        });

        const summary = [];
        for (const entry of lobby.answers.values()) {
          summary.push({
            userId: entry.userId,
            name: entry.name,
            selected: entry.choices,
          });
        }

        socket.emit("question-progress", {
          quizCode: normalizedCode,
          questionIndex: lobby.currentQuestionIndex,
          scoreboard: Array.from(lobby.scoreboard.values()),
          answers: summary,
        });
      }
    });

    socket.on("start-quiz", () => {
      const quizCode = socket.data.quizCode;
      if (!quizCode) {
        return;
      }
      const lobby = lobbies.get(quizCode);
      if (!lobby || lobby.hostSocketId !== socket.id) {
        return;
      }
      if (lobby.started && lobby.currentQuestionIndex >= 0) {
        return;
      }

      startQuestion(io, quizCode, lobby, 0);
    });

    socket.on("host-next-question", () => {
      const quizCode = socket.data.quizCode;
      if (!quizCode) {
        return;
      }
      const lobby = lobbies.get(quizCode);
      if (!lobby || lobby.hostSocketId !== socket.id) {
        return;
      }

      if (!lobby.started || lobby.currentQuestionIndex < 0) {
        return;
      }

      finalizeQuestion(io, quizCode, lobby);
    });

    socket.on("stop-quiz", () => {
      const quizCode = socket.data.quizCode;
      if (!quizCode) {
        return;
      }
      const lobby = lobbies.get(quizCode);
      if (!lobby || lobby.hostSocketId !== socket.id) {
        console.log("Stop quiz rejected: not host");
        return;
      }

      if (!lobby.started) {
        console.log("Stop quiz rejected: quiz not started");
        return;
      }

      console.log(`Host is stopping quiz ${quizCode}`);
      endQuiz(io, quizCode, lobby, "interrupted");
    });

    socket.on("submit-answer", ({ quizCode, questionIndex, answer }) => {
      const normalizedCode = normalizeCode(quizCode || socket.data.quizCode);
      if (!normalizedCode || questionIndex === undefined) {
        return;
      }

      const lobby = lobbies.get(normalizedCode);
      if (!lobby || lobby.currentQuestionIndex !== Number(questionIndex)) {
        return;
      }

      if (!lobby.questionEndsAt || Date.now() > lobby.questionEndsAt) {
        socket.emit("answer-rejected", { reason: "Time is up", questionIndex });
        return;
      }

      const participant = lobby.participants.get(socket.id);
      if (!participant) {
        socket.emit("answer-rejected", { reason: "Not in lobby", questionIndex });
        return;
      }

      if (lobby.answers.has(participant.userId)) {
        socket.emit("answer-rejected", { reason: "Answer already submitted", questionIndex });
        return;
      }

      const normalizedAnswers = sortNumbers(ensureArray(answer));
      lobby.answers.set(participant.userId, {
        userId: participant.userId,
        socketId: participant.socketId,
        name: participant.name,
        choices: normalizedAnswers,
        submittedAt: Date.now(),
      });
      lobby.lastActivity = Date.now();

      socket.emit("answer-acknowledged", {
        quizCode: normalizedCode,
        questionIndex,
        receivedAt: Date.now(),
      });

      // Check if everyone has answered - if so, auto-skip the timer
      const totalParticipants = lobby.participants.size;
      const totalAnswered = lobby.answers.size;
      
      console.log(`Quiz ${normalizedCode}: ${totalAnswered}/${totalParticipants} participants have answered`);
      
      if (totalAnswered === totalParticipants && totalParticipants > 0) {
        console.log(`All participants answered! Auto-skipping timer for quiz ${normalizedCode}`);
        // Clear the existing timer and immediately finalize the question
        clearTimers(lobby);
        // Add a small delay (1 second) so everyone sees their answer was submitted
        lobby.advanceTimer = setTimeout(() => {
          finalizeQuestion(io, normalizedCode, lobby);
        }, 1000);
      }
    });

    socket.on("use-powerup", ({ powerupId, powerupType }) => {
      const quizCode = socket.data.quizCode;
      if (!quizCode) {
        return;
      }

      const lobby = lobbies.get(quizCode);
      if (!lobby) {
        return;
      }

      const participant = lobby.participants.get(socket.id);
      if (!participant) {
        return;
      }

      const userId = participant.userId;
      const playerPowerups = lobby.playerPowerups.get(userId) || [];
      
      // Find and remove the powerup
      const powerupIndex = playerPowerups.findIndex(p => p.id === powerupId);
      if (powerupIndex === -1) {
        socket.emit("powerup-use-rejected", { reason: "Powerup not found" });
        return;
      }

      const powerup = playerPowerups[powerupIndex];
      playerPowerups.splice(powerupIndex, 1);
      lobby.playerPowerups.set(userId, playerPowerups);

      // Apply powerup effect based on type
      if (powerupType === '50-50') {
        // For 50-50, send filtered options to the client
        if (lobby.started && lobby.currentQuestionIndex >= 0) {
          const question = lobby.quiz.questions[lobby.currentQuestionIndex];
          const correctAnswers = ensureArray(question.correctOption ?? question.correctAnswers ?? question.correctAnswer ?? []);
          const incorrectIndices = question.options
            .map((_, index) => index)
            .filter(index => !correctAnswers.includes(index));
          
          // Randomly select 2 incorrect answers to eliminate
          const toEliminate = [];
          while (toEliminate.length < 2 && incorrectIndices.length > 0) {
            const randomIndex = Math.floor(Math.random() * incorrectIndices.length);
            toEliminate.push(incorrectIndices[randomIndex]);
            incorrectIndices.splice(randomIndex, 1);
          }

          socket.emit("powerup-used", {
            powerupId,
            type: powerupType,
            effect: { eliminatedOptions: toEliminate },
          });
        }
      } else if (powerupType === 'time-freeze') {
        // Add 15 seconds to the timer
        if (lobby.questionEndsAt) {
          lobby.questionEndsAt += 15000; // Add 15 seconds
          
          // Also extend the timer
          if (lobby.questionTimer) {
            clearTimeout(lobby.questionTimer);
            const newDuration = lobby.questionEndsAt - Date.now();
            if (newDuration > 0) {
              lobby.questionTimer = setTimeout(() => {
                finalizeQuestion(io, quizCode, lobby);
              }, newDuration);
            }
          }

          socket.emit("powerup-used", {
            powerupId,
            type: powerupType,
            effect: { newEndsAt: lobby.questionEndsAt },
          });

          // Notify all players about the time extension (optional)
          io.to(quizCode).emit("time-extended", {
            userId,
            playerName: participant.name,
            newEndsAt: lobby.questionEndsAt,
          });
        }
      } else if (powerupType === 'double-points') {
        // Set flag for double points on this question
        const activeEffects = lobby.activePowerupEffects.get(userId) || {};
        activeEffects.doublePoints = true;
        lobby.activePowerupEffects.set(userId, activeEffects);

        socket.emit("powerup-used", {
          powerupId,
          type: powerupType,
          effect: { doublePoints: true },
        });
      } else if (powerupType === 'shield') {
        // Set flag for shield on this question
        const activeEffects = lobby.activePowerupEffects.get(userId) || {};
        activeEffects.shield = true;
        lobby.activePowerupEffects.set(userId, activeEffects);

        socket.emit("powerup-used", {
          powerupId,
          type: powerupType,
          effect: { shield: true },
        });
      }
    });

    socket.on("leave-lobby", () => {
      const quizCode = socket.data.quizCode;
      if (!quizCode) {
        return;
      }
      const lobby = lobbies.get(quizCode);
      if (!lobby) {
        return;
      }

      socket.leave(quizCode);
      removeParticipant(io, quizCode, lobby, socket.id);
      socket.data.quizCode = null;
    });

    socket.on("disconnect", () => {
      const quizCode = socket.data.quizCode;
      if (!quizCode) {
        return;
      }
      const lobby = lobbies.get(quizCode);
      if (!lobby) {
        return;
      }

      removeParticipant(io, quizCode, lobby, socket.id);
    });
  });
};

setInterval(() => {
  const cutoff = Date.now() - LOBBY_IDLE_MS;
  for (const [quizCode, lobby] of lobbies.entries()) {
    if (lobby.participants.size === 0 && lobby.lastActivity < cutoff) {
      clearTimers(lobby);
      lobbies.delete(quizCode);
    }
  }
}, CLEANUP_INTERVAL_MS);

export { setupRealtime };