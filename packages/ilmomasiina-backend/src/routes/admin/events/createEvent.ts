import { FastifyReply, FastifyRequest } from "fastify";
import { omit } from "lodash";

import type { AdminEventResponse, EventCreateBody } from "@tietokilta/ilmomasiina-models";
import { AuditEvent } from "@tietokilta/ilmomasiina-models";
import { getDb } from "../../../db";
import { eventTable, questionTable, quotaTable } from "../../../db/schema";
import { convertEventDatabaseErrors } from "../../../models/errors";
import { validateEvent, validateLanguages } from "../../../models/event";
import { normalizeOptions, validateQuestion } from "../../../models/question";
import { basicEventInfoCached, eventDetailsForAdmin, eventDetailsForUserCached } from "../../events/getEventDetails";
import { eventsListForUserCached } from "../../events/getEventsList";
import { toDate } from "../../utils";

export default async function createEvent(
  request: FastifyRequest<{ Body: EventCreateBody }>,
  response: FastifyReply,
): Promise<AdminEventResponse> {
  // Ensure event id is always generated
  const { quotas, questions: rawQuestions, ...attrs } = omit(request.body, "id");
  const eventValues = {
    ...attrs,
    date: toDate(attrs.date),
    endDate: toDate(attrs.endDate),
    registrationStartDate: toDate(attrs.registrationStartDate),
    registrationEndDate: toDate(attrs.registrationEndDate),
  };
  // Remove options from question types that don't support them. This must be done before validateLanguages().
  const questions = rawQuestions.map((question) => ({
    ...question,
    ...normalizeOptions(question),
  }));

  validateEvent(eventValues);
  questions.forEach(validateQuestion);
  // Validate and fixup data within languages.
  validateLanguages(eventValues.languages, questions, quotas);

  try {
    const event = await getDb().transaction(async (transaction) => {
      const [created] = await transaction.insert(eventTable).values(eventValues).returning();
      if (questions.length) {
        // add order and eventId to questions
        await transaction
          .insert(questionTable)
          .values(questions.map((question, order) => ({ ...question, eventId: created.id, order })));
      }
      if (quotas.length) {
        // add order and eventId to quotas
        await transaction
          .insert(quotaTable)
          .values(quotas.map((quota, order) => ({ ...quota, eventId: created.id, order })));
      }

      await request.logEvent(AuditEvent.CREATE_EVENT, {
        event: created,
        transaction,
      });

      return created;
    });

    eventsListForUserCached.invalidate();
    basicEventInfoCached.invalidate();
    eventDetailsForUserCached.invalidate();

    const eventDetails = await eventDetailsForAdmin(event.id);

    response.status(201);
    return eventDetails;
  } catch (error) {
    throw convertEventDatabaseErrors(error);
  }
}
