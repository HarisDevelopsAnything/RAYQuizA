import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';

const router = express.Router();

// MongoDB connection string from environment
const uri = process.env.MONGODB_URI;
let db;

// Connect to MongoDB
async function connectDB() {
  if (!db) {
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db('quizApp');
  }
  return db;
}

// Admin emails list - add your admin emails here
const ADMIN_EMAILS = [
  'harisdevelops@gmail.com', // Replace with actual admin emails
  // Add more admin emails here
];

// Middleware to verify admin access
async function verifyAdmin(req, res, next) {
  try {
    const { email, userId } = req.body || req.query;
    
    if (!email || !ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    
    const database = await connectDB();
    const user = await database.collection('users').findOne({ _id: new ObjectId(userId) });
    
    if (!user || user.email !== email) {
      return res.status(403).json({ error: 'Unauthorized: User not found' });
    }
    
    req.adminUser = user;
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({ error: 'Server error during admin verification' });
  }
}

// Verify admin endpoint
router.post('/verify', async (req, res) => {
  try {
    const { email, userId } = req.body;
    
    if (!email || !ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({ error: 'Not an admin' });
    }
    
    const database = await connectDB();
    const user = await database.collection('users').findOne({ _id: new ObjectId(userId) });
    
    if (!user || user.email !== email) {
      return res.status(403).json({ error: 'User not found' });
    }
    
    res.json({ success: true, admin: true });
  } catch (error) {
    console.error('Admin verify error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { email, userId } = req.query;
    
    if (!email || !ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    
    const database = await connectDB();
    const users = await database
      .collection('users')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Ban/Unban user
router.patch('/users/:id/ban', async (req, res) => {
  try {
    const { id } = req.params;
    const { banned, email } = req.body;
    
    if (!email || !ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    
    const database = await connectDB();
    const result = await database
      .collection('users')
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { banned: banned, bannedAt: banned ? new Date() : null } }
      );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, banned });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;
    
    if (!email || !ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    
    const database = await connectDB();
    
    // Also delete all quizzes created by this user
    const user = await database.collection('users').findOne({ _id: new ObjectId(id) });
    if (user) {
      await database.collection('quizzes').deleteMany({ createdByEmail: user.email });
    }
    
    const result = await database.collection('users').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Update user credentials
router.patch('/users/:id/credentials', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email: newEmail, email: adminEmail } = req.body;
    
    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    
    const updateFields = {};
    if (name) updateFields.name = name;
    if (newEmail) updateFields.email = newEmail;
    
    const database = await connectDB();
    const result = await database
      .collection('users')
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updateFields }
      );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update credentials error:', error);
    res.status(500).json({ error: 'Failed to update user credentials' });
  }
});

// Get all quizzes
router.get('/quizzes', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email || !ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    
    const database = await connectDB();
    const quizzes = await database
      .collection('quizzes')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(quizzes);
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Delete quiz
router.delete('/quizzes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;
    
    if (!email || !ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    
    const database = await connectDB();
    const result = await database.collection('quizzes').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email || !ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    
    const database = await connectDB();
    
    const totalUsers = await database.collection('users').countDocuments();
    const totalQuizzes = await database.collection('quizzes').countDocuments();
    const bannedUsers = await database.collection('users').countDocuments({ banned: true });
    
    // Get quizzes created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const quizzesToday = await database.collection('quizzes').countDocuments({
      createdAt: { $gte: today }
    });
    
    res.json({
      totalUsers,
      totalQuizzes,
      bannedUsers,
      quizzesToday
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
