import { getDb } from "./connect.cjs";

const lobbies = new Map();
const REVIEW_DELAY_MS = Number(process.env.QUIZ_REVIEW_DELAY_MS || 5000);
const CLEANUP_INTERVAL_MS = 60 * 1000;
const LOBBY_IDLE_MS = 60 * 60 * 1000;

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

const endQuiz = async (io, quizCode, lobby) => {
  clearTimers(lobby);
  lobby.started = false;
  lobby.currentQuestionIndex = -1;
  lobby.questionEndsAt = null;
  lobby.answers.clear();

  const scoreboard = Array.from(lobby.scoreboard.values());

  io.to(quizCode).emit("quiz-ended", {
    quizCode,
    scoreboard,
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
    };

    console.log("Saving quiz history:", JSON.stringify(quizHistoryEntry, null, 2));
    await db.collection("QuizHistory").insertOne(quizHistoryEntry);
    console.log("Quiz history saved successfully");
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

  lobby.started = true;
  lobby.currentQuestionIndex = index;
  lobby.questionEndsAt = Date.now() + durationSeconds * 1000;
  lobby.answers.clear();
  lobby.lastActivity = Date.now();

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
    timeLimit: durationSeconds,
  });
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

  const summary = [];

  lobby.questionEndsAt = null;

  for (const participant of lobby.participants.values()) {
    const answerKey = participant.userId;
    const answerRecord = lobby.answers.get(answerKey);
    const submitted = answerRecord ? sortNumbers(answerRecord.choices) : [];
    const isCorrect = submitted.length > 0 && arraysEqual(submitted, correctAnswers);

    let gained = 0;
    if (answerRecord) {
      gained = isCorrect ? points : negative ? -Math.abs(negative) : 0;
    } else if (negative) {
      gained = -Math.abs(negative);
    }

    const scoreboardEntry = lobby.scoreboard.get(answerKey) || {
      userId: participant.userId,
      name: participant.name,
      score: 0,
    };

    scoreboardEntry.score += gained;
    scoreboardEntry.name = participant.name;
    lobby.scoreboard.set(answerKey, scoreboardEntry);

    summary.push({
      userId: participant.userId,
      name: participant.name,
      selected: submitted,
      isCorrect,
      gained,
    });
  }

  io.to(quizCode).emit("question-ended", {
    quizCode,
    questionIndex: lobby.currentQuestionIndex,
    correctAnswers,
    scoreboard: Array.from(lobby.scoreboard.values()),
    summary,
  });

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
    hostSocketId: null,
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
      let isHost = hostRequested;

      if (!lobby.hostSocketId) {
        isHost = true;
      } else if (hostRequested && lobby.hostSocketId !== socket.id) {
        socket.emit("host-rejected", { quizCode: normalizedCode });
        isHost = false;
      }

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
      }

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