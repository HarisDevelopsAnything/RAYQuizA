// server/index.ts
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { getDb } from "./connect.cjs";
import { setupRealtime } from "./socket-server.js";
import { OAuth2Client } from "google-auth-library";
import aiQuizRoutes from "./ai-quiz-routes.js";

const app = express();
app.use(cors());
app.use(express.json()); // Required for POST JSON parsing

// Google OAuth client
const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);
const port = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
      : ["http://localhost:5173", "http://localhost:3000", "https://rayquiza-frontend.onrender.com"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setupRealtime(io);

// Mount AI quiz generation routes
app.use('/api', aiQuizRoutes);

// ✅ Google Login Route
app.post("/api/auth/google", async (req, res) => {
  try {
    const { token } = req.body;

    // Verify token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.VITE_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ error: "Invalid Google token" });
    }

    const db = await getDb();
    let user = await db.collection("Users").findOne({ googleId: payload.sub });

    if (!user) {
      const newUser = {
        googleId: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        createdAt: new Date(),
      };

      const insertResult = await db.collection("Users").insertOne(newUser);
      user = await db.collection("Users").findOne({ _id: insertResult.insertedId });
    }

    res.json({ message: "Login successful", user });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Google login failed" });
  }
});

// ✅ Sign Up with Email/Password Route
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const db = await getDb();

    // Check if user already exists
    const existingUser = await db.collection("Users").findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: "User with this email already exists" });
    }

    // Hash password using crypto (built-in Node.js module)
    const crypto = await import('crypto');
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    // Create new user
    const newUser = {
      email: email.toLowerCase(),
      name,
      passwordHash: hash,
      passwordSalt: salt,
      authProvider: "email",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("Users").insertOne(newUser);
    const user = await db.collection("Users").findOne({ _id: result.insertedId });

    // Remove sensitive data before sending response
    delete user.passwordHash;
    delete user.passwordSalt;

    res.status(201).json({ 
      message: "User created successfully", 
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        authProvider: user.authProvider,
        createdAt: user.createdAt
      }
    });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Sign up failed" });
  }
});

// ✅ Login with Email/Password Route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const db = await getDb();

    // Find user by email
    const user = await db.collection("Users").findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if user signed up with email/password
    if (user.authProvider !== "email") {
      return res.status(401).json({ 
        error: `This account was created using ${user.authProvider}. Please use ${user.authProvider} to login.` 
      });
    }

    // Verify password
    const crypto = await import('crypto');
    const hash = crypto.pbkdf2Sync(password, user.passwordSalt, 1000, 64, 'sha512').toString('hex');
    
    if (hash !== user.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Update last login
    await db.collection("Users").updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    // Remove sensitive data before sending response
    delete user.passwordHash;
    delete user.passwordSalt;

    res.json({ 
      message: "Login successful", 
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture || null,
        authProvider: user.authProvider
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ✅ Health Check Route
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});
// ✅ Existing routes
app.get("/api/users", async (req, res) => {
  try {
    const db = await getDb();
    const items = await db.collection("Users").find().toArray();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

app.get("/api/quizzes", async (req, res) => {
  try {
    const db = await getDb();
    const items = await db.collection("Quizzes").find().toArray();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// ✅ Create Quiz Route
app.post("/api/quizzes", async (req, res) => {
  try {
    const { title, description, categories, code, createdBy, createdByEmail, questions } = req.body;
    
    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ error: "Title and questions are required" });
    }

    const db = await getDb();
    
    // Ensure unique index on code field for better performance (run this once in MongoDB)
    // db.collection("Quizzes").createIndex({ code: 1 }, { unique: true })
    
    // Check if the code already exists and regenerate if needed
    let uniqueCode = code;
    let codeExists = await db.collection("Quizzes").findOne({ code: uniqueCode });
    
    // If code exists, generate a new one (this is a backup, frontend should handle uniqueness)
    while (codeExists) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      uniqueCode = '';
      for (let i = 0; i < 6; i++) {
        uniqueCode += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      codeExists = await db.collection("Quizzes").findOne({ code: uniqueCode });
    }

    const newQuiz = {
      title,
      description: description || "",
      categories: categories || [],
      code: uniqueCode,
      createdBy: createdBy || "Anonymous",
      createdByEmail: createdByEmail || "",
      questions,
      createdAt: new Date(),
    };

    const result = await db.collection("Quizzes").insertOne(newQuiz);
    const insertedQuiz = await db.collection("Quizzes").findOne({ _id: result.insertedId });
    
    res.status(201).json({ message: "Quiz created successfully", quiz: insertedQuiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create quiz" });
  }
});

// ✅ Get Quiz by Code Route
app.get("/api/quizzes/code/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const db = await getDb();
    const quiz = await db.collection("Quizzes").findOne({ code: code.toUpperCase() });
    
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found with this code" });
    }
    
    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
});

// ✅ Get Quiz by ID Route
app.get("/api/quizzes/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;
    const db = await getDb();
    const { ObjectId } = require("mongodb");
    
    // Validate ObjectId format
    if (!ObjectId.isValid(quizId)) {
      return res.status(400).json({ error: "Invalid quiz ID format" });
    }
    
    const quiz = await db.collection("Quizzes").findOne({ _id: new ObjectId(quizId) });
    
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    
    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
});

// ✅ Delete Quiz Route
app.delete("/api/quizzes/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;
    const { userEmail } = req.body; // Email of user requesting deletion
    
    if (!userEmail) {
      return res.status(400).json({ error: "User email is required" });
    }

    const db = await getDb();
    const { ObjectId } = require("mongodb");
    
    // First, check if the quiz exists and if the user is the creator
    const quiz = await db.collection("Quizzes").findOne({ _id: new ObjectId(quizId) });
    
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    
    // Verify the user is the creator
    if (quiz.createdByEmail !== userEmail) {
      return res.status(403).json({ error: "You can only delete quizzes you created" });
    }
    
    // Delete the quiz
    const result = await db.collection("Quizzes").deleteOne({ _id: new ObjectId(quizId) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    
    res.json({ message: "Quiz deleted successfully", quizId });
  } catch (err) {
    console.error("Error deleting quiz:", err);
    res.status(500).json({ error: "Failed to delete quiz" });
  }
});

// ✅ User Preferences Routes
// Get user preferences
app.get("/api/user-preferences/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const db = await getDb();
    const userPrefs = await db.collection("UserPrefs").findOne({ userId });
    
    if (!userPrefs) {
      // Return default preferences if none exist
      return res.json({ 
        userId,
        preferences: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    res.json(userPrefs);
  } catch (err) {
    console.error("Error fetching user preferences:", err);
    res.status(500).json({ error: "Failed to fetch user preferences" });
  }
});

// Create or update user preferences
app.put("/api/user-preferences/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { preferences } = req.body;
    
    if (!preferences) {
      return res.status(400).json({ error: "Preferences data is required" });
    }
    
    const db = await getDb();
    
    const updateData = {
      userId,
      preferences,
      updatedAt: new Date()
    };
    
    // Use upsert to create if doesn't exist, update if it does
    const result = await db.collection("UserPrefs").updateOne(
      { userId },
      { 
        $set: updateData,
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );
    
    const updatedPrefs = await db.collection("UserPrefs").findOne({ userId });
    
    res.json({ 
      message: "User preferences updated successfully",
      preferences: updatedPrefs,
      modified: result.modifiedCount > 0,
      created: result.upsertedCount > 0
    });
  } catch (err) {
    console.error("Error updating user preferences:", err);
    res.status(500).json({ error: "Failed to update user preferences" });
  }
});

// Delete user preferences
app.delete("/api/user-preferences/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const db = await getDb();
    
    const result = await db.collection("UserPrefs").deleteOne({ userId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "User preferences not found" });
    }
    
    res.json({ message: "User preferences deleted successfully" });
  } catch (err) {
    console.error("Error deleting user preferences:", err);
    res.status(500).json({ error: "Failed to delete user preferences" });
  }
});

// ✅ Get quiz history for a user (quizzes they created)
app.get("/api/quiz-history/created/:userEmail", async (req, res) => {
  try {
    const { userEmail } = req.params;
    const decodedEmail = decodeURIComponent(userEmail);
    console.log("Fetching created quiz history for email:", decodedEmail);
    
    const db = await getDb();
    
    const history = await db.collection("QuizHistory")
      .find({ creatorEmail: decodedEmail })
      .sort({ completedAt: -1 })
      .toArray();
    
    console.log(`Found ${history.length} created quizzes for ${decodedEmail}`);
    res.json({ history });
  } catch (err) {
    console.error("Error fetching created quiz history:", err);
    res.status(500).json({ error: "Failed to fetch quiz history" });
  }
});

// ✅ Get quiz history for a user (quizzes they participated in)
app.get("/api/quiz-history/participated/:userEmail", async (req, res) => {
  try {
    const { userEmail } = req.params;
    const decodedEmail = decodeURIComponent(userEmail);
    console.log("Fetching participated quiz history for email:", decodedEmail);
    
    const db = await getDb();
    
    const history = await db.collection("QuizHistory")
      .find({ "participants.email": decodedEmail })
      .sort({ completedAt: -1 })
      .toArray();
    
    console.log(`Found ${history.length} participated quizzes for ${decodedEmail}`);
    res.json({ history });
  } catch (err) {
    console.error("Error fetching participated quiz history:", err);
    res.status(500).json({ error: "Failed to fetch quiz history" });
  }
});

// ✅ Get specific quiz history details
app.get("/api/quiz-history/:historyId", async (req, res) => {
  try {
    const { historyId } = req.params;
    const db = await getDb();
    const { ObjectId } = await import('mongodb');
    
    const history = await db.collection("QuizHistory").findOne({ 
      _id: new ObjectId(historyId) 
    });
    
    if (!history) {
      return res.status(404).json({ error: "Quiz history not found" });
    }
    
    res.json({ history });
  } catch (err) {
    console.error("Error fetching quiz history details:", err);
    res.status(500).json({ error: "Failed to fetch quiz history details" });
  }
});

httpServer.listen(port, () => console.log(`Server running on port ${port}`));
