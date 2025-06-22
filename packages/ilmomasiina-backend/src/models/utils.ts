import { and, eq, isNull, not, SQL, sql } from "drizzle-orm";
import { generateRandomId } from "./randomId";

// Helper function to generate random IDs for new records
export const generateId = generateRandomId;

// Helper function to handle soft deletes (paranoid mode)
export function whereNotDeleted<T extends Record<string, any>>(table: T, deletedAtColumn = 'deletedAt') {
  return isNull(table[deletedAtColumn]);
}

// Helper function to create a soft delete condition
export function whereDeleted<T extends Record<string, any>>(table: T, deletedAtColumn = 'deletedAt') {
  return not(isNull(table[deletedAtColumn]));
}

// Helper function to combine conditions with soft delete check
export function withNotDeleted<T extends Record<string, any>>(
  table: T, 
  additionalConditions?: SQL,
  deletedAtColumn = 'deletedAt'
): SQL {
  const notDeletedCondition = whereNotDeleted(table, deletedAtColumn);
  return additionalConditions 
    ? and(notDeletedCondition, additionalConditions)!
    : notDeletedCondition;
}

// Helper function to simulate Sequelize scopes
export function createScope<T extends Record<string, any>>(
  table: T,
  scopeConditions: (table: T) => SQL
) {
  return scopeConditions(table);
}

// Helper for timestamp operations
export function updateTimestamp() {
  return sql`now()`;
}

// Helper for getting current timestamp
export function now() {
  return new Date();
}