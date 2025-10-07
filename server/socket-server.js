// Simple Socket.IO server for testing multiplayer functionality
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3001; // Use different port to avoid conflicts

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Socket.IO server is running' });
});

// Socket.IO connection handling
const lobbies = new Map(); // Store lobby data: quizCode -> { participants: [], quizData: {}, host: socketId }

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Join lobby event
  socket.on('join-lobby', (data) => {
    const { quizCode, userInfo } = data;
    console.log(`👥 User ${userInfo.name} joining lobby ${quizCode}`);
    
    // Join the socket room
    socket.join(quizCode);
    
    // Initialize lobby if it doesn't exist
    if (!lobbies.has(quizCode)) {
      lobbies.set(quizCode, {
        participants: [],
        quizData: null,
        host: userInfo.isHost ? socket.id : null,
        started: false
      });
    }
    
    const lobby = lobbies.get(quizCode);
    
    // Add participant
    const participant = {
      id: socket.id,
      name: userInfo.name,
      isHost: userInfo.isHost,
      joinedAt: new Date().toISOString()
    };
    
    lobby.participants.push(participant);
    
    // Set host if this is the host
    if (userInfo.isHost) {
      lobby.host = socket.id;
    }
    
    // Notify all participants in the lobby
    io.to(quizCode).emit('participant-joined', participant);
    io.to(quizCode).emit('lobby-update', { participants: lobby.participants });
    
    console.log(`📊 Lobby ${quizCode} now has ${lobby.participants.length} participants`);
  });

  // Leave lobby event
  socket.on('leave-lobby', () => {
    // Find which lobby this socket is in
    for (const [quizCode, lobby] of lobbies.entries()) {
      const participantIndex = lobby.participants.findIndex(p => p.id === socket.id);
      if (participantIndex !== -1) {
        // Remove participant
        const participant = lobby.participants[participantIndex];
        lobby.participants.splice(participantIndex, 1);
        
        // Notify others
        socket.to(quizCode).emit('participant-left', socket.id);
        socket.to(quizCode).emit('lobby-update', { participants: lobby.participants });
        
        // Clean up empty lobbies
        if (lobby.participants.length === 0) {
          lobbies.delete(quizCode);
          console.log(`🗑️ Cleaned up empty lobby ${quizCode}`);
        }
        
        socket.leave(quizCode);
        console.log(`👋 ${participant.name} left lobby ${quizCode}`);
        break;
      }
    }
  });

  // Start quiz event
  socket.on('start-quiz', (data) => {
    const { quizCode } = data;
    const lobby = lobbies.get(quizCode);
    
    if (lobby && lobby.host === socket.id && !lobby.started) {
      lobby.started = true;
      io.to(quizCode).emit('quiz-started', { quizCode });
      console.log(`🚀 Quiz ${quizCode} started by host ${socket.id}`);
    }
  });

  // Submit answer event (for live quizzes)
  socket.on('submit-answer', (data) => {
    const { quizCode, answer, questionIndex } = data;
    console.log(`📝 Answer submitted for ${quizCode}: ${answer}`);
    
    // Broadcast to host for scoring
    socket.to(quizCode).emit('answer-submitted', {
      participantId: socket.id,
      answer,
      questionIndex,
      timestamp: new Date().toISOString()
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    
    // Remove from any lobbies
    for (const [quizCode, lobby] of lobbies.entries()) {
      const participantIndex = lobby.participants.findIndex(p => p.id === socket.id);
      if (participantIndex !== -1) {
        const participant = lobby.participants[participantIndex];
        lobby.participants.splice(participantIndex, 1);
        
        // Notify others
        socket.to(quizCode).emit('participant-left', socket.id);
        socket.to(quizCode).emit('lobby-update', { participants: lobby.participants });
        
        // Clean up empty lobbies
        if (lobby.participants.length === 0) {
          lobbies.delete(quizCode);
          console.log(`🗑️ Cleaned up empty lobby ${quizCode}`);
        }
        
        console.log(`👋 ${participant.name} disconnected from lobby ${quizCode}`);
        break;
      }
    }
  });
});

httpServer.listen(port, () => {
  console.log(`🚀 Socket.IO server running on port ${port}`);
  console.log(`📡 Ready for real-time quiz connections`);
  console.log(`🌐 CORS enabled for local development ports`);
});