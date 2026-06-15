import express from 'express';
import cors from 'cors';
import { pool } from './db';

const app = express();
const PORT = 3000;

// Middleware so the server can read JSON from the React Native app
app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/health', (req, res) => {
  res.json({ status: 'UniPass Server is awake and running!' });
});

// Real Event Creation Route connected to PostgreSQL
app.post('/api/events', async (req, res) => {
  try {
    const { organizerId, title, description, eventDate, capacity, ticketPrice } = req.body;
    
    // Parameterized inputs ($1, $2, etc.) to prevent SQL Injection
    const sqlQuery = `
      INSERT INTO "EVENT" (organizer_id, title, description, event_date, capacity, ticket_price, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *; 
    `;
    
    const values = [
      organizerId, 
      title, 
      description, 
      eventDate, 
      capacity, 
      ticketPrice, 
      'Published'
    ];

    const result = await pool.query(sqlQuery, values);
    const savedEvent = result.rows[0];
    
    console.log(`[API] SUCCESS: Event saved to database -> ${savedEvent.title}`);
    
    res.status(201).json({ 
      message: 'Event successfully published to the database!',
      event: savedEvent
    });

  } catch (error) {
    console.error('[API] Database insertion error:', error);
    res.status(500).json({ error: 'Failed to create event in database' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});