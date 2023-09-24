import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';

import momentPlugin from './src/rollupMomentPlugin';

/* eslint-disable no-console */

const BACKEND_HOST = process.env.HOST || '127.0.0.1';
const BACKEND_PORT = 3001;

const PATH_PREFIX = process.env.PATH_PREFIX || '';
if (PATH_PREFIX.endsWith('/')) {
  console.error('PATH_PREFIX must omit the final /');
  process.exit(1);
}

const TIMEZONE = process.env.APP_TIMEZONE || 'Europe/Helsinki';

export default defineConfig(({ mode }) => ({
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: `http://${BACKEND_HOST}:${BACKEND_PORT}`,
      },
    },
  },

  base: `${PATH_PREFIX}/`,

  build: {
    outDir: 'build',
    sourcemap: true,
  },

  define: Object.fromEntries(Object.entries({
    DEV: mode === 'development',
    PROD: mode === 'production',
    TEST: mode === 'test',

    SENTRY_DSN: process.env.SENTRY_DSN || '',

    PATH_PREFIX,
    API_URL: process.env.API_URL || '',
    BRANDING_HEADER_TITLE_TEXT: process.env.BRANDING_HEADER_TITLE_TEXT,
    BRANDING_FOOTER_GDPR_TEXT: process.env.BRANDING_FOOTER_GDPR_TEXT,
    BRANDING_FOOTER_GDPR_LINK: process.env.BRANDING_FOOTER_GDPR_LINK,
    BRANDING_FOOTER_HOME_TEXT: process.env.BRANDING_FOOTER_HOME_TEXT,
    BRANDING_FOOTER_HOME_LINK: process.env.BRANDING_FOOTER_HOME_LINK,
    TIMEZONE,
  }).map(([key, value]) => [key, JSON.stringify(value)])),

  plugins: [
    react(),
    tsconfigPaths(),
    momentPlugin({ timezone: TIMEZONE }),
    checker({
      // We already do type checking & linting separately in CI
      enableBuild: false,
      // buildMode is necessary with composite projects
      typescript: {
        buildMode: true,
      },
      eslint: {
        lintCommand: 'eslint ../../packages',
      },
    }),
  ],
}));
