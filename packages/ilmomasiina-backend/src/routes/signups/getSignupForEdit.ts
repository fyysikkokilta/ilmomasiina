import { FastifyReply, FastifyRequest } from 'fastify';

import type { SignupForEditResponse, SignupPathParams } from '@tietokilta/ilmomasiina-models';
import { Answer } from '../../models/answer';
import { Event } from '../../models/event';
import { Question } from '../../models/question';
import { Quota } from '../../models/quota';
import { Signup } from '../../models/signup';
import { StringifyApi } from '../utils';
import { NoSuchSignup } from './errors';

/** Requires editTokenVerification */
export default async function getSignupForEdit(
  request: FastifyRequest<{ Params: SignupPathParams }>,
  reply: FastifyReply,
): Promise<SignupForEditResponse> {
  const signup = await Signup.scope('active').findByPk(request.params.id, {
    include: [
      {
        model: Answer,
        required: false,
      },
      {
        model: Quota,
        include: [
          {
            model: Event,
            include: [
              {
                model: Question,
                required: false,
              },
            ],
          },
        ],
      },
    ],
    order: [[Quota, Event, Question, 'order', 'ASC']],
  });
  if (signup === null) {
    // Event not found with id, probably deleted
    throw new NoSuchSignup('No signup found with given id');
  }

  const event = signup.quota!.event!;

  const response = {
    signup: {
      ...signup.get({ plain: true }),
      confirmed: Boolean(signup.confirmedAt),
      status: signup.status,
      answers: signup.answers!,
      quota: signup.quota!,
    },
    event: {
      ...event.get({ plain: true }),
      questions: event.questions!.map((question) => question.get({ plain: true })),
    },
  };

  reply.status(200);

  return response as unknown as StringifyApi<typeof response>;
}
