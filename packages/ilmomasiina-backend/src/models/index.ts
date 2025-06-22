import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import appConfig from '../config';
import * as relations from './relations';
import * as schema from './schema';

// Create connection string from config
let connectionString: string;

if (appConfig.clearDbUrl) {
  connectionString = appConfig.clearDbUrl;
} else if (appConfig.dbDialect === 'postgres') {
  const port = appConfig.dbPort ? `:${appConfig.dbPort}` : '';
  const password = appConfig.dbPassword ? `:${appConfig.dbPassword}` : '';
  connectionString = `postgresql://${appConfig.dbUser}${password}@${appConfig.dbHost}${port}/${appConfig.dbDatabase}`;
} else {
  throw new Error('Only PostgreSQL is supported with Drizzle');
}

const pool = new Pool({
  connectionString,
  ssl: appConfig.dbSsl ? { rejectUnauthorized: false } : false,
  max: appConfig.dbPoolMax,
  min: appConfig.dbPoolMin,
  connectionTimeoutMillis: appConfig.dbPoolAcquire,
  idleTimeoutMillis: appConfig.dbPoolIdle,
});

export const db = drizzle(pool, {
  schema: {
    ...schema,
    ...relations,
  },
  logger: appConfig.debugDbLogging,
});

// Export tables and schema for use in queries
export * from './schema';

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
