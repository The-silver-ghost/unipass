import express from 'express';
import cors from 'cors';
import { pool } from './db';

const app = express();
const PORT = 3000;

// Middleware so the server can read JSON from the React Native app
app.use(cors());
app.use(express.json());

// Health Check Route (To test if the server is awake)
app.get('/health', (req, res) => {
  res.json({ status: 'UniPass Server is awake and running!' });
});

// Mock Event Creation Route (Tied to your UC-2.3 architecture)
app.post('/api/events', async (req, res) => {
  try {
    const { title, description, date, basePrice, capacity } = req.body;
    
    // Once PostgreSQL is fully connected, you will replace this log with:
    // const result = await pool.query('INSERT INTO "EVENT" (...) VALUES (...)');
    
    console.log(`[API] Received request to create event: ${title}`);
    
    res.status(201).json({ 
      message: 'Event successfully published to the server!',
      receivedData: { title, basePrice, capacity }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});