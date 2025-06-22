import { FastifyReply, FastifyRequest } from "fastify";

import type { UserListResponse } from "@tietokilta/ilmomasiina-models";
import { db } from "../../../models";
import { user } from "../../../models/schema";

export default async function listUsers(request: FastifyRequest, reply: FastifyReply): Promise<UserListResponse> {
  
  const users = await db
    .select({
      id: user.id,
      email: user.email,
    })
    .from(user);

  reply.status(200);
  return users;
}
