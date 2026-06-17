import express from 'express';
import cors from 'cors';
import { pool } from './db';

const app = express();
const PORT = 5000;

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

// GET Route to retrieve events with optional organizer filter
app.get('/api/events', async (req, res) => {
  try {
    const { organizerId } = req.query;
    console.log(`[Server API] Fetching events. Organizer Filter: ${organizerId || 'None'}`);

    let sqlQuery = `SELECT * FROM "EVENT"`;
    const values: any[] = [];

    if (organizerId) {
      sqlQuery += ` WHERE organizer_id = $1`;
      values.push(organizerId);
    } else {
      sqlQuery += ` WHERE status != 'Cancelled'`;
    }

    sqlQuery += ` ORDER BY event_date ASC;`;

    const result = await pool.query(sqlQuery, values);
    
    console.log(`[Server API] Success: Retrieved ${result.rows.length} events.`);
    res.status(200).json({ events: result.rows });

  } catch (error: any) {
    console.error('[Server API] Database retrieval error:', error.message);
    res.status(500).json({ error: 'Failed to fetch events from database' });
  }
});

app.put('/api/events/:id/cancel', async (req, res) => {
  try {
    const eventId = req.params.id;
    
    const sqlQuery = `
      UPDATE "EVENT" 
      SET status = 'Cancelled'
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(sqlQuery, [eventId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    console.log(`[Server API] Success: Cancelled event ${eventId}`);
    res.status(200).json({ message: 'Event cancelled successfully', event: result.rows[0] });
  } catch (error: any) {
    console.error('[Server API] Cancellation error:', error.message);
    res.status(500).json({ error: 'Failed to cancel event' });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const { description, capacity } = req.body;
    
    const sqlQuery = `
      UPDATE "EVENT" 
      SET description = $1, capacity = $2
      WHERE id = $3
      RETURNING *;
    `;
    const result = await pool.query(sqlQuery, [description, capacity, eventId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    console.log(`[Server API] Success: Updated event ${eventId}`);
    res.status(200).json({ message: 'Event updated successfully', event: result.rows[0] });
  } catch (error: any) {
    console.error('[Server API] Update error:', error.message);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

app.post('/api/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    console.log(`[Server API] Received registration for: ${email}`);

    const sqlQuery = `
        INSERT INTO "USER" (full_name, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id;
    `;

    try {
        const dbResult = await pool.query(sqlQuery, [name, email, password, role]);
        const newUserId = dbResult.rows[0].id;
        
        console.log(`[Database Success] Inserted user with UUID: ${newUserId}`);
        
        return res.status(201).json({ 
            success: true, 
            message: "User successfully stored in USER table", 
            userId: newUserId 
        });
    } 
    
    catch (error: any) {
        // PostgreSQL code '23505' stands for a UNIQUE KEY Violation
        if (error.code === '23505') {
            console.log(`[Registration Blocked] Duplicate email rejected: ${email}`);
            return res.status(409).json({ 
                success: false, 
                message: "An account with this email address already exists. Please log in instead." 
            });
        }
        console.error('[Database SQL Error]:', error.message);
        return res.status(500).json({ success: false, message: error.message });
   
}});


// Add this route right next to your app.post('/register') route:

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    console.log(`[Server API] Login verification requested for: ${email}`);

    // Query to find the user row matching the typed email
    const sqlQuery = `
        SELECT id, full_name, email, password_hash, role 
        FROM "USER" 
        WHERE email = $1;
    `;

    try { 
        const dbResult = await pool.query(sqlQuery, [email]);

        // 1. If no rows are returned, user doesn't exist
        if (dbResult.rows.length === 0) {
            return res.status(401).json({ success: false, message: "No account found matching that email." });
        }

        const userRow = dbResult.rows[0];

        // 2. Validate password (plain text match for now; ready for bcrypt hash compare later)
        if (userRow.password_hash !== password) {
            return res.status(401).json({ success: false, message: "Incorrect password. Please try again." });
        }

        console.log(`[Login Success] Valid matching user found: ${userRow.full_name} (${userRow.role})`);

        // 3. Send the user data details back to the client app
        return res.status(200).json({
            success: true,
            message: "Authentication successful",
            user: {
                id: userRow.id,
                full_name: userRow.full_name,
                email: userRow.email,
                role: userRow.role // 'student' or 'organizer'
            }
        });

    } catch (error: any) {
        console.error('[Database SQL Login Error]:', error.message);
        return res.status(500).json({ success: false, message: "Internal server authentication error." });
    }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});