import fastifyCompress from '@fastify/compress';
import fastifyCors from '@fastify/cors';
import fastifySensible from '@fastify/sensible';
import fastifyStatic from '@fastify/static';
import Ajv from 'ajv';
import ajvFormats from 'ajv-formats';
import fastify, { FastifyInstance } from 'fastify';
import cron from 'node-cron';
import path from 'path';

import AdminAuthSession from './authentication/adminAuthSession';
import config from './config';
import anonymizeOldSignups from './cron/anonymizeOldSignups';
import deleteOldAuditLogs from './cron/deleteOldAuditLogs';
import deleteUnconfirmedSignups from './cron/deleteUnconfirmedSignups';
import removeDeletedData from './cron/removeDeletedData';
import enforceHTTPS from './enforceHTTPS';
import setupDatabase from './models';
import setupRoutes from './routes';
import { isInitialSetupDone } from './routes/admin/users/createInitialUser';

// Disable type coercion for request bodies - we don't need it, and it breaks stuff like anyOf
const bodyCompiler = new Ajv({
  coerceTypes: false,
  useDefaults: true,
  removeAdditional: true,
  addUsedSchema: false,
  allErrors: false,
});
ajvFormats(bodyCompiler);

const defaultCompiler = new Ajv({
  coerceTypes: 'array',
  useDefaults: true,
  removeAdditional: true,
  addUsedSchema: false,
  allErrors: false,
});
ajvFormats(defaultCompiler);

export default async function initApp(): Promise<FastifyInstance> {
  await setupDatabase();

  const server = fastify({
    trustProxy: config.isAzure || config.trustProxy, // Get IPs from X-Forwarded-For
    logger: true, // Enable logger
  });
  server.setValidatorCompiler(({ httpPart, schema }) => (
    httpPart === 'body' ? bodyCompiler.compile(schema) : defaultCompiler.compile(schema)
  ));

  // Enable admin registration if no users are present
  server.decorate('initialSetupDone', await isInitialSetupDone());

  // Register fastify-sensible (https://github.com/fastify/fastify-sensible)
  server.register(fastifySensible);

  // Enable configurable CORS
  if (config.allowOrigin) {
    const corsOrigins = config.allowOrigin === '*' ? '*' : (config.allowOrigin?.split(',') ?? []);
    await server.register(fastifyCors, {
      origin: corsOrigins,
    });
  }

  // Enforce HTTPS connections in production
  if (config.nodeEnv === 'production') {
    if (config.enforceHttps) {
      server.addHook('onRequest', enforceHTTPS(config));
      console.info(
        'Enforcing HTTPS connections.\n'
        + 'Ensure your load balancer or reverse proxy sets X-Forwarded-Proto (or X-ARR-SSL in Azure).',
      );
    } else {
      console.warn(
        'HTTPS connections are not enforced by Ilmomasiina.\n'
        + 'For security reasons, please set ENFORCE_HTTPS=proxy and configure your load balancer or reverse proxy to '
        + 'forward only HTTPS connections to Ilmomasiina.',
      );
    }
  }

  // Serving frontend files if frontendFilesPath is not null.
  // Ideally these files should be served by a web server and not the app server,
  // but this helps run a low-effort server.
  // frontend files should not be gzipped on the fly, rather done on the build step.
  if (config.frontendFilesPath) {
    console.info(`Serving frontend files from '${config.frontendFilesPath}'`);
    server.register(fastifyStatic, {
      root: path.resolve(config.frontendFilesPath),
      preCompressed: true,
      wildcard: false, // Disable wildcard matching, so that own index.html is served
    });
    server.get('*', (_req, reply) => {
      reply.sendFile('index.html');
    });
  }
  // Add on-the-fly compression
  server.register(fastifyCompress, { inflateIfDeflated: true });

  server.register(setupRoutes, {
    prefix: '/api',
    adminSession: new AdminAuthSession(config.feathersAuthSecret),
  });

  // Every minute, remove signups that haven't been confirmed fast enough
  cron.schedule('* * * * *', deleteUnconfirmedSignups);

  // Daily at 8am, anonymize old signups
  cron.schedule('0 8 * * *', anonymizeOldSignups);

  // Daily at 8am, delete deleted items from the database
  cron.schedule('0 8 * * *', removeDeletedData);

  // Daily at 8am, delete old audit logs
  cron.schedule('0 8 * * *', deleteOldAuditLogs);

  return server;
}

declare module 'fastify' {
  interface FastifyInstance {
    /** If set to false, GET /api/events raises an error.
     * This is "cached" in the application instance to avoid an unnecessary database query.
     */
    initialSetupDone: boolean;
  }
}
