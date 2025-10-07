// server/index.ts
import express from "express";
import cors from "cors";
import { getDb } from "./connect.cjs";
import { OAuth2Client } from "google-auth-library";

const app = express();
app.use(cors());
app.use(express.json()); // Required for POST JSON parsing

// Google OAuth client
const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);
const port = process.env.PORT || 5000;

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
    const { title, description, categories, code, createdBy, questions } = req.body;
    
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

app.listen(port, () => console.log("Server running on port 5000"));
