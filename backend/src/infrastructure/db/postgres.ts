// backend/src/infrastructure/db/postgres.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// A quick helper to test the connection later
export const testDbConnection = async () => {
  try {
    const client = await dbPool.connect();
    console.log("✅ Successfully connected to PostgreSQL");
    client.release();
  } catch (err) {
    console.error("❌ Database connection error", err);
  }
};