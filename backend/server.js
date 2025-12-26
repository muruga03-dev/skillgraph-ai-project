
/**
 * SkillGraph AI Backend - Node.js + Express
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = 'mongodb+srv://admin:securepassword123@uk-portal-db.wevfyiw.mongodb.net/?retryWrites=true&w=majority&appName=uk-portal-db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, 
  googleId: { type: String, unique: true, sparse: true }, 
  createdAt: { type: Date, default: Date.now },
  analysis: Object,
  studyPlan: Array,
  interviewPrep: Array,
  chatHistory: Array
});

const User = mongoose.model('User', UserSchema);

// Standard Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ error: 'User exists.' });
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ id: user._id, name: user.name, email: user.email });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials.' });
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { googleId, email, name } = req.body;
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        await user.save();
      } else {
        user = new User({ name, email, googleId });
        await user.save();
      }
    }
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

app.put('/api/users/:userId/analysis', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { analysis: req.body.analysis });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

app.put('/api/users/:userId/study-plan', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { studyPlan: req.body.studyPlan });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

app.put('/api/users/:userId/interview-prep', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { interviewPrep: req.body.interviewPrep });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/users/:userId/chat', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { $push: { chatHistory: { ...req.body, timestamp: new Date() } } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

app.get('/api/users/:userId/data', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    res.json(user || {});
  } catch (err) { res.status(500).json({ error: 'Error' }); }
});

const PORT = 5000;
app.listen(PORT, '127.0.0.1', () => console.log(`📡 Backend: http://127.0.0.1:${PORT}`));
