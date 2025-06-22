import { FastifyReply, FastifyRequest } from "fastify";

import type { UserListResponse } from "@tietokilta/ilmomasiina-models";
import { getPool } from "../../../models";

export default async function listUsers(request: FastifyRequest, reply: FastifyReply): Promise<UserListResponse> {
  const pool = getPool();
  
  const result = await pool.query('SELECT id, email FROM "user"');
  const users = result.rows as { id: number; email: string; }[];

  reply.status(200);
  return users;
}
