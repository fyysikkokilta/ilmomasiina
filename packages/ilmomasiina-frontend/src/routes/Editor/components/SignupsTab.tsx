import React, { useMemo, useState } from "react";

import { Button, Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import { useActionDateTimeFormatter } from "@tietokilta/ilmomasiina-components/dist/utils/dateFormat";
import {
  convertSignupsToCSV,
  FormattedSignup,
  getSignupsForAdminList,
  stringifyAnswer,
} from "@tietokilta/ilmomasiina-components/dist/utils/signupUtils";
import useEvent from "@tietokilta/ilmomasiina-components/dist/utils/useEvent";
import { deleteSignup, getEvent } from "../../../modules/editor/actions";
import { useTypedDispatch, useTypedSelector } from "../../../store/reducers";
import CheckMembershipsTextArea from "./CheckMembershipsTextArea";
import CSVLink, { CSVOptions } from "./CSVLink";

import "../Editor.scss";

type SignupProps = {
  position: number;
  signup: FormattedSignup;
};

const SignupRow = ({ position, signup }: SignupProps) => {
  const event = useTypedSelector((state) => state.editor.event)!;
  const dispatch = useTypedDispatch();
  const { t } = useTranslation();
  const actionDateFormat = useActionDateTimeFormatter();

  const onDelete = useEvent(async () => {
    // eslint-disable-next-line no-alert
    const confirmation = window.confirm(t("editor.signups.action.delete.confirm"));
    if (confirmation) {
      await dispatch(deleteSignup(signup.id!));
      dispatch(getEvent(event.id));
    }
  });

  const nameEmailCols = (event.nameQuestion ? 2 : 0) + (event.emailQuestion ? 2 : 0);

  return (
    <tr className={!signup.confirmed ? "text-muted" : ""}>
      <td key="position">{`${position}.`}</td>
      {signup.confirmed && event.nameQuestion && <td key="firstName">{signup.firstName}</td>}
      {signup.confirmed && event.nameQuestion && <td key="lastName">{signup.lastName}</td>}
      {signup.confirmed && event.emailQuestion && <td key="email">{signup.email}</td>}
      {signup.confirmed && event.emailQuestion && <td key="membership">{signup.isMember && "\u2705"}</td>}
      {!signup.confirmed && nameEmailCols && (
        <td colSpan={nameEmailCols} className="font-italic">
          {t("editor.signups.unconfirmed")}
        </td>
      )}
      <td key="quota">{signup.quota}</td>
      {event.questions.map((question) => (
        <td key={question.id}>{stringifyAnswer(signup.answers[question.id])}</td>
      ))}
      <td key="timestamp">{actionDateFormat.format(signup.createdAt)}</td>
      <td key="delete">
        <Button type="button" variant="danger" onClick={onDelete}>
          {t("editor.signups.action.delete")}
        </Button>
      </td>
    </tr>
  );
};

const csvOptions: CSVOptions = { delimiter: "\t" };

const SignupsTab = () => {
  const [emails, setEmails] = useState<string[]>([]);

  const event = useTypedSelector((state) => state.editor.event);

  const signups = useMemo(() => event && getSignupsForAdminList(event, emails), [event, emails]);

  const csvSignups = useMemo(
    () => event && convertSignupsToCSV(event, signups!, emails.length > 0),
    [event, signups, emails],
  );

  const { t } = useTranslation();

  if (!event || !signups?.length) {
    return <p>{t("editor.signups.noSignups")}</p>;
  }

  return (
    <div>
      <Row>
        <Col sm={6} className="mb-4">
          <CSVLink
            data={csvSignups!}
            csvOptions={csvOptions}
            download={t("editor.signups.download.filename", { event: event.title })}
          >
            {t("editor.signups.download")}
          </CSVLink>
        </Col>
        <Col sm={6}>
          <CheckMembershipsTextArea disabled={!event.emailQuestion} setEmails={setEmails} />
        </Col>
      </Row>
      <br />
      <br />
      <table className="event-editor--signup-table table table-condensed table-responsive">
        <thead>
          <tr className="active">
            <th key="position">#</th>
            {event.nameQuestion && <th key="firstName">{t("editor.signups.column.firstName")}</th>}
            {event.nameQuestion && <th key="lastName">{t("editor.signups.column.lastName")}</th>}
            {event.emailQuestion && <th key="email">{t("editor.signups.column.email")}</th>}
            {event.emailQuestion && <th key="membership">{t("editor.signups.column.membership")}</th>}
            <th key="quota">{t("editor.signups.column.quota")}</th>
            {event.questions.map((q) => (
              <th key={q.id}>{q.question}</th>
            ))}
            <th key="timestamp">{t("editor.signups.column.time")}</th>
            <th key="delete" aria-label={t("editor.signups.column.delete")} />
          </tr>
        </thead>
        <tbody>
          {signups.map((signup, index) => (
            <SignupRow key={signup.id} position={index + 1} signup={signup} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SignupsTab;
