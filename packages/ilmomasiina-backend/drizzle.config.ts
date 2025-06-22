import type { Config } from 'drizzle-kit';
import appConfig from './src/config';

const {
  clearDbUrl,
  dbDialect,
  dbHost,
  dbPort,
  dbDatabase,
  dbUser,
  dbPassword,
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

export default {
  schema: './src/models/schema.ts',
  out: './src/models/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
  verbose: true,
  strict: true,
} satisfies Config;