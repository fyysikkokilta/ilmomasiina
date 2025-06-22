import debug from "debug";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

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

let connectionString: string;

if (clearDbUrl) {
  connectionString = clearDbUrl;
} else if (dbDialect === 'postgres') {
  const port = dbPort ? `:${dbPort}` : '';
  const password = dbPassword ? `:${dbPassword}` : '';
  connectionString = `postgresql://${dbUser}${password}@${dbHost}${port}/${dbDatabase}`;
} else {
  throw new Error('Only PostgreSQL is supported with Drizzle');
}

let sql: postgres.Sql | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  if (!db) throw new Error("setupDatabase() has not been called");
  return db;
}

export function getSql() {
  if (!sql) throw new Error("setupDatabase() has not been called");
  return sql;
}

export async function closeDatabase() {
  if (sql) {
    await sql.end();
    sql = null;
    db = null;
  }
}

export default async function setupDatabase() {
  if (db) return db;

  debugLog("Connecting to database");
  
  try {
    sql = postgres(connectionString, {
      max: dbPoolMax,
      idle_timeout: dbPoolIdle,
      connect_timeout: dbPoolAcquire,
      debug: debugDbLogging,
      ssl: dbSsl ? { rejectUnauthorized: false } : false,
    });
    
    db = drizzle(sql, { schema });
    
    // Test connection
    await sql`SELECT 1`;
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