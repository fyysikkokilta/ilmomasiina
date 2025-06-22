import { FastifyReply, FastifyRequest } from "fastify";

import type { UserListResponse } from "@tietokilta/ilmomasiina-models";
// TODO: Update to use Drizzle - see DRIZZLE_MIGRATION.md
// import { getDatabase, user } from "../../../models";

export default async function listUsers(request: FastifyRequest, reply: FastifyReply): Promise<UserListResponse> {
  // TODO: Implement Drizzle query once type issues are resolved
  // const db = getDatabase();
  // const users = await db.select().from(user);
  
  // Temporary placeholder - this needs to be updated to use Drizzle
  throw new Error("Route needs to be updated for Drizzle ORM - see DRIZZLE_MIGRATION.md");
}
