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
    const { title, description, categories, createdBy, questions } = req.body;
    
    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ error: "Title and questions are required" });
    }

    const db = await getDb();
    const newQuiz = {
      title,
      description: description || "",
      categories: categories || [],
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

app.listen(port, () => console.log("Server running on port 5000"));
