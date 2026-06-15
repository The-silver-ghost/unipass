import { Pool } from 'pg';
import dotenv from 'dotenv';

// This tells Node to open the .env file and load the variables
dotenv.config();

export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'unipass_db',
  password: process.env.DB_PASSWORD, // Pulls securely from the .env file
  port: 5432,
});

pool.on('connect', () => {
  console.log('Securely connected to the PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});