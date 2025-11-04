import { FastifyReply, FastifyRequest } from "fastify";
import { omit } from "lodash";

import type { AdminEventResponse, EventCreateBody } from "@tietokilta/ilmomasiina-models";
import { AuditEvent } from "@tietokilta/ilmomasiina-models";
import { getSequelize } from "../../../models";
import { convertSequelizeValidationErrors } from "../../../models/errors";
import { Event } from "../../../models/event";
import { Question } from "../../../models/question";
import { Quota } from "../../../models/quota";
import { basicEventInfoCached, eventDetailsForAdmin, eventDetailsForUserCached } from "../../events/getEventDetails";
import { eventsListForUserCached } from "../../events/getEventsList";
import { toDate } from "../../utils";

export default async function createEvent(
  request: FastifyRequest<{ Body: EventCreateBody }>,
  response: FastifyReply,
): Promise<AdminEventResponse> {
  try {
    // Create the event, quotas and questions - Sequelize will handle validation
    const event = await getSequelize().transaction(async (transaction) => {
      const toCreate = new Event({
        // Ensure event id is always generated
        ...omit(request.body, "id"),
        date: toDate(request.body.date),
        endDate: toDate(request.body.endDate),
        registrationStartDate: toDate(request.body.registrationStartDate),
        registrationEndDate: toDate(request.body.registrationEndDate),
      });
      // Validate and fixup data within languages.
      toCreate.validateLanguages(request.body.questions, request.body.quotas);

      const created = await toCreate.save({ transaction });
      await Question.bulkCreate(
        // add order and eventId to questions and convert options to array
        request.body.questions.map((question, order) => ({
          ...question,
          eventId: created.id,
          order,
          options: question.options?.length ? question.options : [],
        })),
        { transaction },
      );
      await Quota.bulkCreate(
        // add order and eventId to quotas
        request.body.quotas.map((question, order) => ({
          ...question,
          eventId: created.id,
          order,
        })),
        { transaction },
      );

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
    throw convertSequelizeValidationErrors(error);
  }
}
