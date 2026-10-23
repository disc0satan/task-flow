import 'dotenv/config';
import pg from 'pg';

// Connection details come from the environment, never from source code.
// A small pool keeps serverless invocations from exhausting Neon connections.
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
});
