import { and, eq, isNull, notInArray } from "drizzle-orm";
import { FastifyReply, FastifyRequest } from "fastify";
import { NotFound } from "http-errors";
import { isUndefined, omitBy } from "lodash";

import type {
  AdminEventPathParams,
  AdminEventResponse,
  EditConflictError,
  EventUpdateBody,
  WouldMoveSignupsToQueueError,
} from "@tietokilta/ilmomasiina-models";
import { AuditEvent } from "@tietokilta/ilmomasiina-models";
import { getDb } from "../../../db";
import { eventTable, questionTable, quotaTable } from "../../../db/schema";
import { convertEventDatabaseErrors } from "../../../models/errors";
import { Event, validateEvent, validateLanguages } from "../../../models/event";
import { normalizeOptions, validateQuestion } from "../../../models/question";
import { basicEventInfoCached, eventDetailsForAdmin, eventDetailsForUserCached } from "../../events/getEventDetails";
import { eventsListForUserCached } from "../../events/getEventsList";
import { refreshSignupPositions } from "../../signups/computeSignupPosition";
import { toDate } from "../../utils";
import { EditConflict } from "./errors";

export default async function updateEvent(
  request: FastifyRequest<{
    Params: AdminEventPathParams;
    Body: EventUpdateBody;
  }>,
  response: FastifyReply,
): Promise<AdminEventResponse | EditConflictError | WouldMoveSignupsToQueueError> {
  const {
    quotas: bodyQuotas,
    questions: bodyQuestions,
    moveSignupsToQueue,
    updatedAt: bodyUpdatedAt,
    ...attrs
  } = request.body;

  try {
    await getDb().transaction(async (transaction) => {
      // Get the event with all relevant information for the update
      const [event] = await transaction
        .select()
        .from(eventTable)
        .where(and(eq(eventTable.id, request.params.id), isNull(eventTable.deletedAt)))
        .for("update");
      if (!(event as Event | undefined)) {
        throw new NotFound("No event found with id");
      }
      // Postgres doesn't support FOR UPDATE with LEFT JOIN
      const oldQuotas = await transaction
        .select({ id: quotaTable.id, title: quotaTable.title, size: quotaTable.size, price: quotaTable.price })
        .from(quotaTable)
        .where(and(eq(quotaTable.eventId, event.id), isNull(quotaTable.deletedAt)))
        .for("update");
      const oldQuestions = await transaction
        .select()
        .from(questionTable)
        .where(and(eq(questionTable.eventId, event.id), isNull(questionTable.deletedAt)))
        .for("update");

      // Find existing questions and quotas for requested IDs, and add order fields
      const updatedQuestions = bodyQuestions?.map((question, order) => ({
        ...question,
        ...normalizeOptions(question),
        order,
        existing: question.id ? oldQuestions.find((old) => question.id === old.id) : undefined,
      }));
      const updatedQuotas = bodyQuotas?.map((quota, order) => ({
        ...quota,
        order,
        existing: quota.id ? oldQuotas.find((old) => quota.id === old.id) : undefined,
      }));

      // Find questions and quotas that were requested by ID but don't exist
      const deletedQuestions =
        updatedQuestions?.filter((question) => !question.existing && question.id).map((question) => question.id!) ?? [];
      const deletedQuotas =
        updatedQuotas?.filter((quota) => !quota.existing && quota.id).map((quota) => quota.id!) ?? [];

      // Check for edit conflicts
      const expectedUpdatedAt = new Date(bodyUpdatedAt ?? "");
      if (
        event.updatedAt.getTime() !== expectedUpdatedAt.getTime() ||
        deletedQuestions.length ||
        deletedQuotas.length
      ) {
        throw new EditConflict(event.updatedAt, deletedQuotas, deletedQuestions);
      }

      // Update the Event. Fields missing from the request are left unchanged.
      const wasPublic = !event.draft;
      const changes = omitBy(
        {
          ...attrs,
          registrationEndDate: toDate(attrs.registrationEndDate),
          registrationStartDate: toDate(attrs.registrationStartDate),
          date: toDate(attrs.date),
          endDate: toDate(attrs.endDate),
        },
        isUndefined,
      );
      const updated: Event = { ...event, ...changes };

      validateEvent(updated);
      updatedQuestions?.forEach(validateQuestion);
      // Validate and fixup data within languages.
      validateLanguages(updated.languages, updatedQuestions ?? oldQuestions, updatedQuotas ?? oldQuotas);

      // Always written, so that updatedAt changes with every save.
      await transaction
        .update(eventTable)
        .set({ ...changes, languages: updated.languages })
        .where(eq(eventTable.id, event.id));

      if (updatedQuestions !== undefined) {
        const reuseQuestionIds = updatedQuestions.flatMap((question) =>
          question.existing ? [question.existing.id] : [],
        );

        // Remove previous Questions not present in request
        await transaction
          .update(questionTable)
          .set({ deletedAt: new Date() })
          .where(
            and(
              eq(questionTable.eventId, event.id),
              isNull(questionTable.deletedAt),
              reuseQuestionIds.length ? notInArray(questionTable.id, reuseQuestionIds) : undefined,
            ),
          );

        // Update or create the new Questions
        for (const { existing, id: _id, ...question } of updatedQuestions) {
          if (existing) {
            // oxlint-disable-next-line no-await-in-loop -- queries in a transaction share a connection and run in sequence
            await transaction.update(questionTable).set(question).where(eq(questionTable.id, existing.id));
          } else {
            // oxlint-disable-next-line no-await-in-loop -- queries in a transaction share a connection and run in sequence
            await transaction.insert(questionTable).values({ ...question, eventId: event.id });
          }
        }
      }

      if (updatedQuotas !== undefined) {
        const reuseQuotaIds = updatedQuotas.flatMap((quota) => (quota.existing ? [quota.existing.id] : []));

        // Remove previous Quotas not present in request
        await transaction
          .update(quotaTable)
          .set({ deletedAt: new Date() })
          .where(
            and(
              eq(quotaTable.eventId, event.id),
              isNull(quotaTable.deletedAt),
              reuseQuotaIds.length ? notInArray(quotaTable.id, reuseQuotaIds) : undefined,
            ),
          );

        // Update or create the new Quotas
        for (const { existing, id: _id, ...quota } of updatedQuotas) {
          if (existing) {
            // oxlint-disable-next-line no-await-in-loop -- queries in a transaction share a connection and run in sequence
            await transaction.update(quotaTable).set(quota).where(eq(quotaTable.id, existing.id));
          } else {
            // oxlint-disable-next-line no-await-in-loop -- queries in a transaction share a connection and run in sequence
            await transaction.insert(quotaTable).values({ ...quota, eventId: event.id });
          }
        }
      }

      // Refresh positions, but don't move signups to queue unless explicitly allowed
      await refreshSignupPositions(updated, transaction, moveSignupsToQueue);

      const isPublic = !updated.draft;
      let action: AuditEvent;
      if (isPublic === wasPublic) action = AuditEvent.EDIT_EVENT;
      else action = isPublic ? AuditEvent.PUBLISH_EVENT : AuditEvent.UNPUBLISH_EVENT;

      await request.logEvent(action, { event: updated, transaction });
    });
  } catch (error) {
    throw convertEventDatabaseErrors(error);
  }

  eventsListForUserCached.invalidate();
  basicEventInfoCached.invalidate();
  eventDetailsForUserCached.invalidate();

  const updatedEvent = await eventDetailsForAdmin(request.params.id);

  response.status(200);
  return updatedEvent;
}
