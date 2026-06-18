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

//real Event Creation Route connected to PostgreSQL
app.post('/api/events', async (req, res) => {
  try {
    const { organizerId, title, description, eventDate, eventEndDate, capacity, ticketPrice, bankName, accountNumber, accountHolder } = req.body;
    
    const sqlQuery = `
      INSERT INTO "EVENT" (organizer_id, title, description, event_date, event_end_date, capacity, ticket_price, status, bank_name, account_number, account_holder)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *; 
    `;
    
    const values = [
      organizerId, 
      title, 
      description, 
      eventDate,
      eventEndDate,
      capacity, 
      ticketPrice, 
      'Published',
      bankName || null,
      accountNumber || null,
      accountHolder || null,
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

    let sqlQuery = `
      SELECT e.*, 
             COALESCE((SELECT COUNT(*) FROM "REGISTRATION" r WHERE r.event_id = e.id AND r.status NOT IN ('Cancelled', 'Refunded')), 0) as participant_count
      FROM "EVENT" e
    `;
    const values: any[] = [];

    if (organizerId) {
      sqlQuery += ` WHERE organizer_id = $1`;
      values.push(organizerId);
    } else {
      sqlQuery += ` WHERE status != 'Cancelled' AND (event_end_date IS NULL OR event_end_date > NOW())`;
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
    
    // Check if free or if all users refunded
    const eventCheck = await pool.query(`SELECT ticket_price FROM "EVENT" WHERE id = $1`, [eventId]);
    if (eventCheck.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    
    const isFree = parseFloat(eventCheck.rows[0].ticket_price) === 0;
    
    if (!isFree) {
      const activeRegs = await pool.query(
        `SELECT COUNT(*) FROM "REGISTRATION" WHERE event_id = $1 AND status NOT IN ('Refunded', 'Cancelled')`,
        [eventId]
      );
      if (parseInt(activeRegs.rows[0].count) > 0) {
        return res.status(400).json({ error: 'Cannot cancel paid event until all participants are refunded or zero participants registered.' });
      }
    }

    const sqlQuery = `
      UPDATE "EVENT" 
      SET status = 'Cancelled'
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(sqlQuery, [eventId]);
    
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

app.get('/api/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const result = await pool.query('SELECT * FROM "EVENT" WHERE id = $1', [eventId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(200).json({ event: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const { description, capacity, eventDate, eventEndDate } = req.body;
    
    const oldRes = await pool.query('SELECT * FROM "EVENT" WHERE id = $1', [eventId]);
    if (oldRes.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    const oldEvent = oldRes.rows[0];

    const sqlQuery = `
      UPDATE "EVENT" 
      SET 
        description = COALESCE($1, description), 
        capacity = COALESCE($2, capacity),
        event_date = COALESCE($4, event_date),
        event_end_date = COALESCE($5, event_end_date)
      WHERE id = $3
      RETURNING *;
    `;
    const result = await pool.query(sqlQuery, [description, capacity, eventId, eventDate, eventEndDate]);
    const updatedEvent = result.rows[0];
    
    let changes = [];
    if (description && description !== oldEvent.description) changes.push(`description to "${description}"`);
    if (capacity && capacity !== oldEvent.capacity) changes.push(`capacity to ${capacity}`);
    if (eventDate && new Date(eventDate).getTime() !== new Date(oldEvent.event_date).getTime()) changes.push(`start date to ${new Date(eventDate).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}`);
    if (eventEndDate && oldEvent.event_end_date && new Date(eventEndDate).getTime() !== new Date(oldEvent.event_end_date).getTime()) changes.push(`end date to ${new Date(eventEndDate).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}`);
    else if (eventEndDate && !oldEvent.event_end_date) changes.push(`end date to ${new Date(eventEndDate).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}`);

    if (changes.length > 0) {
      const msg = `Event details updated: ${changes.join(', ')}.`;
      
      // Notify organizer
      await pool.query(`
        INSERT INTO "NOTIFICATION" (user_id, event_id, type, channel, status, sent_at, message)
        VALUES ($1, $2, 'Event Updated', 'In-App', 'Unread', NOW(), $3)
      `, [updatedEvent.organizer_id, eventId, `You successfully updated ${updatedEvent.title} (${changes.join(', ')})`]);


      // Notify joined students
      const regs = await pool.query(`
        SELECT id FROM "REGISTRATION" 
        WHERE event_id = $1 AND status NOT IN ('Cancelled', 'Refunded', 'cancelled')
      `, [eventId]);

      if (regs.rows.length > 0) {
        const values = regs.rows.map((row: any) => `('${row.id}', 'Event Updated', 'In-App', 'Unread', NOW(), '${msg}')`).join(',');
        await pool.query(`
          INSERT INTO "NOTIFICATION" (registration_id, type, channel, status, sent_at, message)
          VALUES ${values}
        `);
      }
    }

    console.log(`[Server API] Success: Updated event ${eventId}`);
    res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (error: any) {
    console.error('[Server API] Update error:', error.message);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

app.get('/api/events/:id/participants/export', async (req, res) => {
  try {
    const eventId = req.params.id;
    const sqlQuery = `
      SELECT 
          r.id AS "Registration ID",
          u.full_name AS "Student Name",
          u.student_id AS "Student ID",
          u.email AS "Email",
          r.status AS "Ticket Status",
          COALESCE(p.status, 'N/A') AS "Payment Status",
          COALESCE(p.amount, 0.00) AS "Amount Paid (RM)",
          COALESCE(p.method, 'Free') AS "Payment Method",
          COALESCE(p.receipt_ref, 'N/A') AS "Receipt Ref",
          ep.state AS "E-Pass State",
          ep.used_at AS "Check-In Time",
          r.registered_at AS "Registration Date"
      FROM "REGISTRATION" r
      JOIN "USER" u ON r.student_id = u.id
      LEFT JOIN "PAYMENT_LOG" p ON r.id = p.registration_id
      LEFT JOIN "EPASS" ep ON r.id = ep.registration_id
      WHERE r.event_id = $1
      ORDER BY u.full_name ASC;
    `;
    const result = await pool.query(sqlQuery, [eventId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No participants found' });
    }

    const fields = Object.keys(result.rows[0]);
    const csvRows = [];
    csvRows.push(fields.join(','));

    for (const row of result.rows) {
      const values = fields.map(field => {
        let val = row[field];
        if (val === null || val === undefined) val = '';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="participants.csv"`);
    res.status(200).send(csvString);
  } catch (error) {
    console.error('[Server API] Export error:', error);
    res.status(500).json({ error: 'Failed to export participants' });
  }
});

app.post('/api/register', async (req, res) => {
    const { name, email, password, role, studentID } = req.body;
    console.log(`[Server API] Received registration for: ${email}`);

    const sqlQuery = `
        INSERT INTO "USER" (full_name, email, password_hash, role, student_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
    `;

    try {
        const dbResult = await pool.query(sqlQuery, [name, email, password, role, studentID || null]);
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
      `SELECT id FROM "REGISTRATION" WHERE event_id = $1 AND student_id = $2 AND status NOT IN ('Cancelled', 'Refunded', 'cancelled')`,
      [eventId, studentId]
    );
    if (duplicate.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'You already have a ticket for this event.' });
    }

    //create REGISTRATION
    const registrationResult = await pool.query(
      `INSERT INTO "REGISTRATION" (student_id, event_id, status)
       VALUES ($1, $2, 'Active')
       RETURNING id`,
      [studentId, eventId]
    );
    const registrationId = registrationResult.rows[0].id;
    console.log(`[Server API] Registration created: ${registrationId}`);

    // Notify the organizer about the new ticket sale
    await pool.query(`
      INSERT INTO "NOTIFICATION" (registration_id, type, channel, status, sent_at, message)
      VALUES ($1, 'Ticket Sold', 'In-App', 'Unread', NOW(), 'A student just bought an E-Pass for your event!')
    `, [registrationId]);

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
       VALUES ($1, $2, 'Active')
       RETURNING id`,
      [registrationId, qrCode]
    );
    const epassId = epassResult.rows[0].id;
    console.log(`[Server API] E-Pass generated (Active): ${epassId}`);

    //log initial EPASS state
    await pool.query(
      `INSERT INTO "EPASS_STATE_LOG" (epass_id, triggered_by, old_state, new_state)
       VALUES ($1, $2, 'Active', 'Active')`,
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

app.get('/api/organizer/:organizerId/payments', async (req, res) => {
  const { organizerId } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        p.id AS payment_id,
        p.receipt_ref,
        p.method,
        p.amount,
        p.status AS payment_status,
        r.status AS registration_status,
        p.paid_at,
        u.full_name AS student_name,
        e.title AS event_title
       FROM "PAYMENT_LOG" p
       JOIN "REGISTRATION" r ON r.id = p.registration_id
       JOIN "USER" u ON u.id = r.student_id
       JOIN "EVENT" e ON e.id = r.event_id
       WHERE e.organizer_id = $1
       ORDER BY p.paid_at DESC`,
      [organizerId]
    );

    const totalRevenue = result.rows.reduce((sum: number, row: any) => {
      if (row.registration_status === 'Refunded' || row.registration_status === 'Cancelled') {
        return sum;
      }
      return sum + parseFloat(row.amount);
    }, 0);

    console.log(`[Server API] Fetched ${result.rows.length} payments for organizer ${organizerId}`);

    return res.status(200).json({
      success: true,
      totalRevenue: totalRevenue.toFixed(2),
      transactions: result.rows
    });

  } catch (error: any) {
    console.error('[Server API] Failed to fetch organizer payments:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch payment data.' });
  }
});

app.post('/api/epass/scan', async (req, res) => {
  try {
    const { qrCode, organizerId } = req.body;

    const result = await pool.query(`
      SELECT e.id as epass_id, e.state, ev.id as event_id, ev.organizer_id, ev.event_end_date 
      FROM "EPASS" e
      JOIN "REGISTRATION" r ON e.registration_id = r.id
      JOIN "EVENT" ev ON r.event_id = ev.id
      WHERE e.qr_code = $1
    `, [qrCode]);

    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'E-Pass not found' });

    const epass = result.rows[0];

    if (epass.organizer_id !== organizerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized scan' });
    }

    if (epass.event_end_date && new Date(epass.event_end_date) < new Date()) {
      await pool.query(`UPDATE "EPASS" SET state = 'Expired' WHERE id = $1`, [epass.epass_id]);
      return res.status(400).json({ success: false, message: 'E-Pass is expired' });
    }

    if (epass.state.toLowerCase() !== 'active' && epass.state.toLowerCase() !== 'issued') {
      return res.status(400).json({ success: false, message: `E-Pass cannot be scanned. State is ${epass.state}` });
    }

    await pool.query(`UPDATE "EPASS" SET state = 'Scanned', used_at = NOW() WHERE id = $1`, [epass.epass_id]);
    
    // Also update the registration status to Scanned for database consistency
    await pool.query(`UPDATE "REGISTRATION" SET status = 'Scanned' WHERE id = $1`, [epass.registration_id]);
    
    await pool.query(
      `INSERT INTO "EPASS_STATE_LOG" (epass_id, triggered_by, old_state, new_state) VALUES ($1, $2, $3, $4)`,
      [epass.epass_id, organizerId, epass.state, 'Scanned']
    );

    res.status(200).json({ success: true, message: 'E-Pass scanned successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Scan failed' });
  }
});

app.post('/api/refunds/request', async (req, res) => {
  try {
    const { epassId } = req.body;
    
    const result = await pool.query(`
      SELECT e.id as epass_id, r.id as registration_id, ev.ticket_price, ev.event_date, e.state
      FROM "EPASS" e
      JOIN "REGISTRATION" r ON e.registration_id = r.id
      JOIN "EVENT" ev ON r.event_id = ev.id
      WHERE e.id = $1
    `, [epassId]);

    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Pass not found' });
    
    const pass = result.rows[0];
    const isFree = parseFloat(pass.ticket_price) === 0;

    if (pass.state.toLowerCase() === 'scanned' || pass.state.toLowerCase() === 'expired') {
      return res.status(400).json({ success: false, message: 'Cannot refund/cancel a scanned or expired pass' });
    }

    if (isFree) {
      await pool.query(`UPDATE "REGISTRATION" SET status = 'Cancelled' WHERE id = $1`, [pass.registration_id]);
      await pool.query(`UPDATE "EPASS" SET state = 'Cancelled' WHERE id = $1`, [pass.epass_id]);
      return res.status(200).json({ success: true, message: 'Free ticket cancelled successfully' });
    } else {
      const msIn24Hours = 24 * 60 * 60 * 1000;
      if (new Date(pass.event_date).getTime() - new Date().getTime() < msIn24Hours) {
        return res.status(400).json({ success: false, message: 'Refunds not allowed 24 hours before the event' });
      }

      await pool.query(`UPDATE "REGISTRATION" SET status = 'RefundRequested' WHERE id = $1`, [pass.registration_id]);
      
      // Notify the organizer about the refund request
      await pool.query(`
        INSERT INTO "NOTIFICATION" (registration_id, type, channel, status, sent_at, message)
        VALUES ($1, 'Refund Request', 'In-App', 'Unread', NOW(), 'A student requested a refund for their E-Pass.')
      `, [pass.registration_id]);
      
      // Notify the student that their refund request was sent
      await pool.query(`
        INSERT INTO "NOTIFICATION" (registration_id, type, channel, status, sent_at, message)
        VALUES ($1, 'Refund Requested', 'In-App', 'Unread', NOW(), 'Your refund request was sent to the organizer.')
      `, [pass.registration_id]);
      
      return res.status(200).json({ success: true, message: 'Refund requested successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Refund request failed' });
  }
});

app.put('/api/refunds/:regId/accept', async (req, res) => {
  try {
    const regId = req.params.regId;
    await pool.query(`UPDATE "REGISTRATION" SET status = 'Refunded' WHERE id = $1`, [regId]);
    await pool.query(`UPDATE "EPASS" SET state = 'Refunded' WHERE registration_id = $1`, [regId]);
    
    const refundRef = `REF-${Date.now()}`;
    const regRes = await pool.query(`
      SELECT p.amount, p.method 
      FROM "PAYMENT_LOG" p 
      WHERE p.registration_id = $1 AND p.transaction_type = 'charge'
      LIMIT 1
    `, [regId]);
    
    if (regRes.rows.length > 0) {
      const p = regRes.rows[0];
      await pool.query(
        `INSERT INTO "PAYMENT_LOG" (registration_id, method, transaction_type, amount, status, paid_at, receipt_ref)
         VALUES ($1, $2, 'Refund', $3, 'Success', NOW(), $4)`,
        [regId, p.method, p.amount, refundRef]
      );
    }
    
    // Notify the student
    await pool.query(`
      INSERT INTO "NOTIFICATION" (registration_id, type, channel, status, sent_at, message)
      VALUES ($1, 'Refund Approved', 'In-App', 'Unread', NOW(), 'Your refund has been approved and processed.')
    `, [regId]);
    
    res.status(200).json({ success: true, message: 'Refund approved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept refund' });
  }
});

app.put('/api/refunds/:regId/deny', async (req, res) => {
  try {
    const regId = req.params.regId;
    await pool.query(`UPDATE "REGISTRATION" SET status = 'Active' WHERE id = $1`, [regId]);
    
    // Notify the student
    await pool.query(`
      INSERT INTO "NOTIFICATION" (registration_id, type, channel, status, sent_at, message)
      VALUES ($1, 'Refund Denied', 'In-App', 'Unread', NOW(), 'Your refund request was denied by the organizer.')
    `, [regId]);
    
    res.status(200).json({ success: true, message: 'Refund denied' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deny refund' });
  }
});

app.get('/api/organizer/:id/refunds', async (req, res) => {
  try {
    const orgId = req.params.id;
    const result = await pool.query(`
      SELECT r.id as registration_id, ev.id as event_id, ev.title, u.full_name as student_name, ev.ticket_price
      FROM "REGISTRATION" r
      JOIN "EVENT" ev ON r.event_id = ev.id
      JOIN "USER" u ON r.student_id = u.id
      WHERE ev.organizer_id = $1 AND r.status = 'RefundRequested'
    `, [orgId]);
    res.status(200).json({ refunds: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get refunds' });
  }
});

app.get('/api/organizer/:id/notifications', async (req, res) => {
  try {
    const orgId = req.params.id;
    const sql = `
      SELECT n.*, COALESCE(e.title, e2.title) as event_title 
      FROM "NOTIFICATION" n
      LEFT JOIN "REGISTRATION" r ON n.registration_id = r.id
      LEFT JOIN "EVENT" e ON r.event_id = e.id
      LEFT JOIN "EVENT" e2 ON n.event_id = e2.id
      WHERE (e.organizer_id = $1 AND n.type IN ('Ticket Sold', 'Refund Request'))
         OR (n.user_id = $1 AND n.type = 'Event Updated')
      ORDER BY n.sent_at DESC
    `;
    const result = await pool.query(sql, [orgId]);
    const notifications = result.rows.map(row => ({
      id: row.id,
      title: row.type,
      message: row.event_title ? `[${row.event_title}] ${row.message || 'Update'}` : (row.message || 'Update'),
      time: new Date(row.sent_at).toLocaleString(),
      isUnread: row.status === 'Unread'
    }));
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get organizer notifications' });
  }
});

app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const sql = `
      SELECT n.*, e.title as event_title 
      FROM "NOTIFICATION" n
      JOIN "REGISTRATION" r ON n.registration_id = r.id
      JOIN "EVENT" e ON r.event_id = e.id
      WHERE r.student_id = $1 AND n.type NOT IN ('Ticket Sold', 'Refund Request')
      ORDER BY n.sent_at DESC
    `;
    const result = await pool.query(sql, [userId]);
    const notifications = result.rows.map(row => ({
      id: row.id,
      title: row.type,
      message: row.event_title ? `[${row.event_title}] ${row.message || 'Update'}` : (row.message || 'Update'),
      time: new Date(row.sent_at).toLocaleString(),
      isUnread: row.status === 'Unread'
    }));
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

app.put('/api/epass/:id/hide', async (req, res) => {
  try {
    const epassId = req.params.id;
    await pool.query(`UPDATE "EPASS" SET is_hidden = TRUE WHERE id = $1`, [epassId]);
    res.status(200).json({ success: true, message: 'E-Pass hidden' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to hide E-Pass' });
  }
});

app.get('/api/student/:id/passes', async (req, res) => {
  try {
    const studentId = req.params.id;
    const result = await pool.query(`
      SELECT e.id as epass_id, e.qr_code, e.state, e.is_hidden,
             ev.id as event_id, ev.title, ev.event_date, ev.event_end_date, ev.ticket_price
      FROM "EPASS" e
      JOIN "REGISTRATION" r ON e.registration_id = r.id
      JOIN "EVENT" ev ON r.event_id = ev.id
      WHERE r.student_id = $1
      ORDER BY ev.event_date ASC
    `, [studentId]);
    res.status(200).json({ passes: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch passes' });
  }
});

app.get('/api/student/:id/registrations', async (req, res) => {
  try {
    const studentId = req.params.id;
    console.log(`[Server API] Fetching active registrations for student: ${studentId}`);
    const result = await pool.query(`
      SELECT event_id FROM "REGISTRATION"
      WHERE student_id = $1 AND status NOT IN ('Cancelled', 'Refunded', 'cancelled')
    `, [studentId]);
    const eventIds = result.rows.map((row: any) => row.event_id);
    res.status(200).json({ eventIds });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

app.post('/api/notifications/broadcast', async (req, res) => {
  try {
    const { organizerId, eventId, message } = req.body;
    console.log(`[Server API] Broadcasting notification for event: ${eventId}`);
    
    // Get all students registered for this event
    const regs = await pool.query(`
      SELECT id FROM "REGISTRATION" 
      WHERE event_id = $1 AND status NOT IN ('Cancelled', 'Refunded')
    `, [eventId]);

    if (regs.rows.length === 0) {
      return res.status(200).json({ success: true, message: 'No registered students to notify.' });
    }

    // Insert notification for each registration
    const values = regs.rows.map((row: any) => `('${row.id}', 'Announcement', 'In-App', 'Unread', NOW(), '${message.replace(/'/g, "''")}')`).join(',');
    
    await pool.query(`
      INSERT INTO "NOTIFICATION" (registration_id, type, channel, status, sent_at, message)
      VALUES ${values}
    `);

    res.status(200).json({ success: true, message: 'Announcement sent successfully.' });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ error: 'Failed to broadcast announcement' });
  }
});

app.listen(PORT, '0.0.0.0', async () => {
  try {
    await pool.query(`ALTER TABLE "USER" ADD COLUMN IF NOT EXISTS student_id VARCHAR(255);`);
    await pool.query(`ALTER TABLE "EVENT" ADD COLUMN IF NOT EXISTS event_end_date TIMESTAMP WITH TIME ZONE;`);
    await pool.query(`ALTER TABLE "EPASS" ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;`);
    await pool.query(`ALTER TABLE "NOTIFICATION" ADD COLUMN IF NOT EXISTS message TEXT;`);
    await pool.query(`ALTER TABLE "NOTIFICATION" ALTER COLUMN registration_id DROP NOT NULL;`);
    await pool.query(`ALTER TABLE "NOTIFICATION" ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES "USER"(id);`);
    await pool.query(`ALTER TABLE "NOTIFICATION" ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES "EVENT"(id);`);
    console.log('[Database Sync] Updated database schemas.');
  } catch (err) {
    console.error('[Database Sync Error]', err);
  }
  console.log(`Server listening on http://localhost:${PORT}`);
});
