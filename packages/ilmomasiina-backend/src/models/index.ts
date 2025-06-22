import debug from "debug";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import appConfig from "../config";
import * as schema from "./schema";

const debugLog = debug("app:db");

const {
  clearDbUrl,
  dbDialect,
  dbHost,
  dbPort,
  dbDatabase,
  dbUser,
  dbPassword,
  dbSsl,
  debugDbLogging,
  dbPoolMax,
  dbPoolMin,
  dbPoolAcquire,
  dbPoolIdle,
} = appConfig;

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  if (!db) throw new Error("setupDatabase() has not been called");
  return db;
}

export function getPool() {
  if (!pool) throw new Error("setupDatabase() has not been called");
  return pool;
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
}

export default async function setupDatabase() {
  if (db) return db;

  debugLog("Connecting to database");
  
  try {
    let connectionConfig;
    
    if (clearDbUrl) {
      connectionConfig = {
        connectionString: clearDbUrl,
        ssl: dbSsl ? { rejectUnauthorized: false } : false,
      };
    } else if (dbDialect === 'postgres') {
      connectionConfig = {
        host: dbHost,
        port: dbPort,
        database: dbDatabase,
        user: dbUser,
        password: dbPassword,
        ssl: dbSsl ? { rejectUnauthorized: false } : false,
      };
    } else {
      throw new Error('Only PostgreSQL is supported with Drizzle');
    }

    pool = new Pool({
      ...connectionConfig,
      max: dbPoolMax,
      min: dbPoolMin,
      connectionTimeoutMillis: dbPoolAcquire,
      idleTimeoutMillis: dbPoolIdle,
    });
    
    db = drizzle(pool, { schema, logger: debugDbLogging });
    
    // Test connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    debugLog("Connected to database successfully");
    
    // Run migrations
    debugLog("Running database migrations");
    await migrate(db, { migrationsFolder: './src/models/migrations' });
    debugLog("Migrations completed");
    
  } catch (err) {
    console.error(`Error connecting to database: ${err}`);
    throw err;
  }

  return db;
}

// Export tables and schema for use in queries
export * from "./schema";

// Keep backward compatibility by exporting types that other parts expect
export type { 
  EventAttributes,
  QuestionAttributes,
  QuotaAttributes,
  SignupAttributes,
  AnswerAttributes,
  UserAttributes,
  AuditLogAttributes 
} from "@tietokilta/ilmomasiina-models/dist/models";
