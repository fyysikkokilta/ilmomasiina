import { faker } from "@faker-js/faker";
import { sql } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, expect, RunnerTaskBase, vi } from "vitest";

import type { ErrorCode, ErrorResponse } from "@tietokilta/ilmomasiina-models";
import initApp from "../src/app";
import setupDatabase, { closeDatabase } from "../src/db";
import EmailService from "../src/mail";
import type { InjectResponse } from "./routes/api";
import { testUser } from "./testData";

const needsDb = (suite: RunnerTaskBase) => suite.name.includes("test/routes");
const needsApi = (suite: RunnerTaskBase) => suite.name.includes("test/routes");

// Common setup for all backend test files: initialize the database & Fastify, tear down at test end.
// oxlint-disable-next-line no-empty-pattern -- vitest requires the context argument to be destructured
beforeAll(async ({}, suite) => {
  if (needsDb(suite)) {
    global.db = await setupDatabase();
    // Drop the trigger that prevents deleting payments to allow test data to be reset.
    await global.db.execute(sql`DROP TRIGGER IF EXISTS payment_prevent_delete ON payment`);
  } else {
    global.db = undefined;
  }
  if (needsApi(suite)) {
    global.server = await initApp();
  } else {
    global.server = undefined;
  }
});
afterAll(async () => {
  if (global.server) {
    await global.server.close();
    global.server = undefined;
  }
  if (global.db) {
    await closeDatabase();
    global.db = undefined;
  }
});

beforeEach(async () => {
  // Ensure deterministic test data.
  faker.seed(133742069);

  if (global.db && global.server) {
    // Delete test data that can conflict between tests. Event truncation cascades to all other event data.
    await global.db.execute(sql`TRUNCATE "user", "payment", "event", "auditlog" CASCADE`);

    // Create a test user to ensure full functionality.
    global.adminUser = await testUser();

    // Create a token for the admin.
    global.adminToken = global.server.adminSession.createSession(global.adminUser);
  }
});

// Mock email sending: ensure no actual email is sent and allow checking for calls.
beforeAll(() => {
  global.emailSend = vi.spyOn(EmailService, "send").mockImplementation(async () => {});
});

// Allow silencing console logs
beforeAll(() => {
  global.consoleLog = vi.spyOn(console, "log");
  global.consoleWarn = vi.spyOn(console, "warn");
  global.consoleError = vi.spyOn(console, "error");
});

expect.extend({
  toBeApiError(received: unknown, expectedStatus: number, expectedCode?: ErrorCode) {
    if (!Array.isArray(received) || received.length !== 2) {
      throw new Error("toBeApiError matcher expects an array of [data, response]");
    }
    const [data, response] = received as [ErrorResponse | null, InjectResponse];
    if (response.statusCode !== expectedStatus) {
      return {
        pass: false,
        message: () => `Expected status code ${expectedStatus}, but received ${response.statusCode}`,
        expected: expectedStatus,
        actual: response.statusCode,
      };
    }
    if (expectedCode && data?.code !== expectedCode) {
      return {
        pass: false,
        message: () => `Expected error code '${expectedCode}', but received '${data?.code}'`,
        expected: expectedCode,
        actual: data?.code,
      };
    }
    return {
      pass: true,
      message: () => "Received expected API error",
    };
  },
});
