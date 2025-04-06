import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { spawn } from 'child_process';
import { connectDB } from './config/db.js';
import User from './models/user.model.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173',  // allow Vite frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('/getTranscript', cors());

app.use(express.json());

// ======= USER ROUTES =======

app.post('/api/signup', async (req, res) => {
  console.log('[POST] /api/signup hit');
  const { email, password } = req.body;
  try {
    const user = new User({ email, password });
    await user.save();
    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ success: false, message: 'Error creating user' });
  }
});

app.post('/api/login', async (req, res) => {
  console.log('[POST] /api/login hit');
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) {
    res.status(201).json({ success: true, message: 'Login successful' });
  } else {
    res.status(500).json({ success: false, message: 'Invalid email or password' });
  }
});

// ======= HISTORY ROUTES =======

app.post('/api/history', async (req, res) => {
  console.log('[POST] /api/history hit');
  const { userId, videoUrl } = req.body;
  try {
    const historyEntry = new History({ userId, videoUrl });
    await historyEntry.save();
    res.json({ success: true });
  } catch (error) {
    console.error('History save failed:', error.message);
    res.status(500).send('History save failed: ' + error.message);
  }
});

app.get('/api/history/:userId', async (req, res) => {
  console.log('[GET] /api/history/:userId hit');
  const videos = await History.find({ userId: req.params.userId });
  res.json({ videos });
});

// ======= VIDEO HANDLING ROUTES =======

app.post('/getTranscript', (req, res) => {
  console.log('[POST] /getTranscript hit');
  const videoUrl = req.body.videoUrl;

  if (!videoUrl) {
    console.error('No video URL provided');
    return res.status(400).json({ success: false, message: 'No video URL provided' });
  }

  let videoId;
  try {
    videoId = new URL(videoUrl).searchParams.get('v');
    if (!videoId) throw new Error("Video ID couldn't be extracted");
  } catch (error) {
    console.error('Invalid YouTube URL:', error.message);
    return res.status(400).json({ success: false, message: 'Invalid YouTube URL' });
  }

  const py = spawn('python3', ['get_transcript.py', videoId]);

  let output = '';
  py.stdout.on('data', (data) => output += data.toString());
  let errorOutput = '';
  py.stderr.on('data', (data) => errorOutput += data.toString());

  py.on('close', (code) => {
    try {
      const result = JSON.parse(output);
      if (result.error) {
        console.error('Python error:', result.trace);
        return res.status(500).json({ success: false, message: result.error });
      } else {
        return res.json({ success: true, transcript: result.transcript });
        console.log('Python output:', output);
      }
    } catch (err) {
      console.error('Transcript parse error:', output, errorOutput, err);
      console.log('Python errorOutput:', errorOutput);
      return res.status(500).json({ success: false, message: 'Transcript parse error' });
    }
  });
});


app.post('/getSummary', async (req, res) => {
  console.log('[POST] /getSummary hit');
  const { transcript } = req.body;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

  try {
    const result = await model.generateContent(`Summarize this transcript in 3-5 sentences:\n\n${transcript}`);
    const response = await result.response;
    const summary = response.text();
    res.json({ summary });
  } catch (error) {
    console.error("Gemini error:", error.message);
    res.status(500).json({ summary: 'Error generating summary' });
  }
});

app.post('/chat', async (req, res) => {
  console.log('[POST] /chat hit');
  const { query, transcript } = req.body;
  try {
    const botResponse = await axios.post('https://api.botpress.cloud/v1/chat/messages', {
      type: 'text',
      text: query,
      conversationId: 'test-convo',
      context: { transcript }
    }, {
      headers: {
        'Authorization': `Bearer your-botpress-token`,
        'x-bot-id': 'your-bot-id',
        'Content-Type': 'application/json'
      }
    });
    res.json({ answer: botResponse.data.responses[0].text });
  } catch (error) {
    console.error('Botpress error:', error.message);
    res.json({ answer: 'Error with chatbot' });
  }
});

// ======= STATIC ROUTES =======

app.get('/video', (req, res) => {
  console.log('[GET] /video hit');
  res.sendFile('public/video/index.html', { root: __dirname });
});

app.get('/', (req, res) => {
  console.log('[GET] / hit');
  res.sendFile('public/index.html', { root: __dirname });
});

// ======= SERVER START =======

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});
