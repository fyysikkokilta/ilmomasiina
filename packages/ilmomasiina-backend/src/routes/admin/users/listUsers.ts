import { FastifyReply, FastifyRequest } from "fastify";

import type { UserListResponse } from "@tietokilta/ilmomasiina-models";
import { getDatabase, user } from "../../../models";

export default async function listUsers(request: FastifyRequest, reply: FastifyReply): Promise<UserListResponse> {
  const db = getDatabase();
  
  const users = await db
    .select({
      id: user.id as any,
      email: user.email as any,
    })
    .from(user as any) as { id: number; email: string; }[];

  reply.status(200);
  return users;
}
