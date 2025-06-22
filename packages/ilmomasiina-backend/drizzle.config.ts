import type { Config } from 'drizzle-kit';

export default {
  schema: './src/models/schema.ts',
  out: './src/models/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://localhost:5432/ilmomasiina',
  },
  verbose: true,
  strict: true,
} satisfies Config;