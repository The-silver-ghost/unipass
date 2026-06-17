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

app.delete('/api/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    
    const sqlQuery = `
      DELETE FROM "EVENT"
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(sqlQuery, [eventId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    console.log(`[Server API] Success: Deleted event ${eventId}`);
    res.status(200).json({ message: 'Event deleted successfully', event: result.rows[0] });
  } catch (error: any) {
    console.error('[Server API] Delete error:', error.message);
    res.status(500).json({ error: 'Failed to delete event' });
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

app.post('/api/payments', async (req, res) => {
  const { eventId, studentId, amount, method } = req.body;
  console.log(`[Server API] Payment requested — Event: ${eventId}, Student: ${studentId}, Method: ${method}`);

  try {
    //check event exists and is not cancelled
    const eventCheck = await pool.query(
      `SELECT * FROM "EVENT" WHERE id = $1 AND status != 'cancelled'`,
      [eventId]
    );
    if (eventCheck.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Event not found or no longer available.' });
    }

    //prevent duplicate registration
    const duplicate = await pool.query(
      `SELECT id FROM "REGISTRATION" WHERE event_id = $1 AND student_id = $2 AND status != 'cancelled'`,
      [eventId, studentId]
    );
    if (duplicate.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'You already have a ticket for this event.' });
    }

    //create REGISTRATION
    const registrationResult = await pool.query(
      `INSERT INTO "REGISTRATION" (student_id, event_id, status)
       VALUES ($1, $2, 'confirmed')
       RETURNING id`,
      [studentId, eventId]
    );
    const registrationId = registrationResult.rows[0].id;
    console.log(`[Server API] Registration created: ${registrationId}`);

    //record PAYMENT_LOG
    const receiptRef = `TXN-${Date.now()}`;
    await pool.query(
      `INSERT INTO "PAYMENT_LOG" (registration_id, method, transaction_type, amount, status, paid_at, receipt_ref)
       VALUES ($1, $2, 'charge', $3, 'success', NOW(), $4)`,
      [registrationId, method, amount, receiptRef]
    );
    console.log(`[Server API] Payment logged: ${receiptRef}`);

    //issue EPASS
    const qrCode = `EPASS-${registrationId}-${Date.now()}`;
    const epassResult = await pool.query(
      `INSERT INTO "EPASS" (registration_id, qr_code, state)
       VALUES ($1, $2, 'issued')
       RETURNING id`,
      [registrationId, qrCode]
    );
    const epassId = epassResult.rows[0].id;
    console.log(`[Server API] E-Pass issued: ${epassId}`);

    //log initial EPASS state — old_state = 'issued' since there's no prior state
    await pool.query(
      `INSERT INTO "EPASS_STATE_LOG" (epass_id, triggered_by, old_state, new_state)
       VALUES ($1, $2, 'issued', 'issued')`,
      [epassId, studentId]
    );

    return res.status(201).json({
      success: true,
      message: 'Payment successful. E-Pass issued.',
      registrationId,
      epassId,
      receiptRef,
      qrCode
    });

  } catch (error: any) {
    console.error('[Server API] Payment error:', error.message);
    return res.status(500).json({ success: false, message: 'Payment processing failed.' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
