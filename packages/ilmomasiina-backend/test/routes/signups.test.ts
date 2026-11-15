import { testEvent, testSignups } from "test/testData";
import { describe, expect, test } from "vitest";

import { PaymentMode, SignupPaymentStatus } from "@tietokilta/ilmomasiina-models";
import { getDb } from "../../src/db";
import { sendSignupConfirmationMail } from "../../src/mail/signups";
import { eventAsICalCached, icsAttrsFromEvent, isICalExportable } from "../../src/routes/ical";
import { refreshSignupPositionsAndGet } from "../../src/routes/signups/computeSignupPosition";
import { generateToken } from "../../src/routes/signups/editTokens";
import * as api from "./api";

describe("getSignupForEdit", () => {
  test("returns signup for editing", async () => {
    const event = await testEvent({}, { payments: PaymentMode.ONLINE });
    const [signup] = await testSignups({ event, count: 1, confirmed: true });
    const quota = event.quotas.find((q) => q.id === signup.quotaId)!;
    const answers = await getDb().query.answer.findMany({ where: { signupId: signup.id } });

    const [data, response] = await api.fetchSignupForEdit(signup.id);

    expect(response.statusCode).toBe(200);

    expect(data).toEqual({
      event: expect.any(Object),
      signup: {
        id: signup.id,
        firstName: signup.firstName,
        lastName: signup.lastName,
        email: signup.email,
        namePublic: signup.namePublic,
        answers: expect.arrayContaining(answers.map(({ questionId, answer }) => ({ questionId, answer }))),
        confirmed: true,
        createdAt: signup.createdAt.toISOString(),
        quota: {
          id: quota.id,
          title: quota.title,
          size: quota.size,
          price: quota.price,
        },
        position: null,
        status: null,
        confirmableForMillis: 0,
        editableForMillis: expect.any(Number),
        price: signup.price,
        currency: signup.currency,
        products: signup.products,
        paymentStatus: SignupPaymentStatus.PENDING,
        deletedAt: null,
      },
    });
  });

  test("returns nulls for unconfirmed signup", async () => {
    const event = await testEvent();
    const [signup] = await testSignups({ event, count: 1, confirmed: false });

    const [data] = await api.fetchSignupForEdit(signup.id);

    expect(data).toMatchObject({
      signup: {
        firstName: null,
        lastName: null,
        email: null,
        answers: [],
      },
    });
  });

  test("returns correct status information", async () => {
    const event = await testEvent();
    const signups = await testSignups({ event, count: 40 });
    const signup = signups[0]; // created in random order, so this suffices
    const status = await refreshSignupPositionsAndGet(event, signup.id);

    const [data] = await api.fetchSignupForEdit(signup.id);

    expect(data.signup.status).toEqual(status.status);
    expect(data.signup.position).toEqual(status.position);
    expect(data.signup.price).toEqual(signup.price);
    expect(data.signup.currency).toEqual(signup.currency);
    expect(data.signup.products).toEqual(signup.products);
  });

  test("checks edit token authentication", async () => {
    const event = await testEvent();
    const [signup, other] = await testSignups({ event, count: 2, confirmed: true });

    let [data, response] = await api.fetchSignupForEdit(signup.id, false);
    expect(response.statusCode).toBe(403);
    expect(data.signup).toBe(undefined);

    [data, response] = await api.fetchSignupForEdit(signup.id, generateToken(other.id));
    expect(response.statusCode).toBe(403);
    expect(data.signup).toBe(undefined);
  });
});

describe("signup confirmation email", () => {
  test("attaches invite.ics only if event has start and end dates", async () => {
    const datedEvent = await testEvent({ hasDate: true });
    const [datedSignup] = await testSignups({ event: datedEvent, count: 1, confirmed: true });
    const undatedEvent = await testEvent({ hasDate: false });
    const [undatedSignup] = await testSignups({ event: undatedEvent, count: 1, confirmed: true });
    emailSend.mockClear();

    await sendSignupConfirmationMail(datedSignup, "signup", false);
    expect(emailSend).toHaveBeenNthCalledWith(1, datedSignup.email, expect.any(String), expect.any(String), [
      {
        filename: "invite.ics",
        contentType: expect.stringContaining("text/calendar"),
        content: expect.stringMatching(new RegExp(`BEGIN:VEVENT[\\s\\S]*UID:${datedEvent.id}@`)),
      },
    ]);
    await sendSignupConfirmationMail(undatedSignup, "signup", false);
    expect(emailSend).toHaveBeenNthCalledWith(
      2,
      undatedSignup.email,
      expect.any(String),
      expect.any(String),
      undefined,
    );
    expect(emailSend).toHaveBeenCalledTimes(2);
  });

  test("invite.ics uses the language version of the event when one exists", async () => {
    const event = await testEvent({ hasDate: true });
    const languageVersion = {
      title: "English title",
      description: "English description",
      location: "", // empty fields fall back to the default language
      price: null,
      webpageUrl: null,
      facebookUrl: null,
      verificationEmail: null,
      quotas: [],
      questions: [],
    };
    const localized = { ...event, languages: { en: languageVersion } };
    if (!isICalExportable(localized)) throw new Error("test event should have dates");

    expect(icsAttrsFromEvent(localized, "en")).toMatchObject({
      title: "English title",
      description: "English description",
      location: event.location,
    });
    // Languages without a version use the default texts.
    expect(icsAttrsFromEvent(localized, "sv")).toMatchObject({ title: event.title, location: event.location });
    expect(icsAttrsFromEvent(localized)).toMatchObject({ title: event.title });
  });

  test("invite.ics is built once per event and language until the event is edited", async () => {
    const event = await testEvent({ hasDate: true });
    if (!isICalExportable(event)) throw new Error("test event should have dates");
    // Same id and updatedAt, so these would only differ if the file was rebuilt.
    const sameVersion = { ...event, title: "Should not be used" };
    const edited = { ...sameVersion, title: "Edited title", updatedAt: new Date(event.updatedAt.getTime() + 1) };

    const first = await eventAsICalCached({ event, lang: "fi" });
    expect(await eventAsICalCached({ event: sameVersion, lang: "fi" })).toBe(first);
    expect(await eventAsICalCached({ event: sameVersion, lang: "en" })).toContain("Should not be used");
    expect(await eventAsICalCached({ event: edited, lang: "fi" })).toContain("Edited title");
  });
});
