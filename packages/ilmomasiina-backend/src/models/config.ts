import { Options } from "sequelize";

import config from "../config";

const {
  dbHost,
  dbPort,
  dbSsl,
  dbDatabase,
  dbUser,
  dbPassword,
  debugDbLogging,
  dbPoolMax,
  dbPoolMin,
  dbPoolAcquire,
  dbPoolIdle,
} = config;

const sequelizeConfig: Options = {
  dialect: "postgres",
  host: dbHost,
  port: dbPort ?? undefined,
  database: dbDatabase,
  username: dbUser,
  password: dbPassword ?? undefined,
  dialectOptions: dbSsl ? { ssl: true } : {},
  logging: debugDbLogging,
  benchmark: debugDbLogging,
  pool: {
    max: dbPoolMax,
    min: dbPoolMin,
    acquire: dbPoolAcquire,
    idle: dbPoolIdle,
  },
};

export = {
  // Sequelize CLI uses development as default NODE_ENV
  development: sequelizeConfig,
  // ...but make sure we can also run migrate with NODE_ENV=production
  production: sequelizeConfig,
  // Also export it under a environment-neutral name
  default: sequelizeConfig,
};
