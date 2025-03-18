import React, { ChangeEvent, Fragment, useCallback, useMemo, useState } from "react";

import { Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import { useActionDateTimeFormatter } from "@tietokilta/ilmomasiina-components/dist/utils/dateFormat";
import { stringifyAnswer } from "@tietokilta/ilmomasiina-components/dist/utils/signupUtils";
import useEvent from "@tietokilta/ilmomasiina-components/dist/utils/useEvent";
import { AdminEventResponse, SignupStatus } from "@tietokilta/ilmomasiina-models";
import { deleteSignup, getEvent } from "../../../modules/editor/actions";
import { useTypedDispatch, useTypedSelector } from "../../../store/reducers";
import CSVLink, { CSVOptions } from "./CSVLink";
import {
  FormattedSignup,
  getSignupsByQuotaForAdminList,
  getSignupsForAdminList,
  useConvertSignupsToCSV,
} from "./formatSignups";

import "../Editor.scss";

type SignupProps = {
  position: number;
  signup: FormattedSignup;
  showQuota: boolean;
};

const SignupRow = ({ position, signup, showQuota }: SignupProps) => {
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

  const nameEmailCols = (event.nameQuestion ? 2 : 0) + (event.emailQuestion ? 1 : 0);

  const signupStatus =
    signup.status && signup.status !== SignupStatus.IN_QUOTA
      ? t(`editor.signups.column.status.${signup.status}`)
      : null;

  return (
    <tr className={!signup.confirmed ? "text-muted" : ""}>
      <td key="position">{`${position}.`}</td>
      {signup.confirmed && event.nameQuestion && <td key="firstName">{signup.firstName}</td>}
      {signup.confirmed && event.nameQuestion && <td key="lastName">{signup.lastName}</td>}
      {signup.confirmed && event.emailQuestion && <td key="email">{signup.email}</td>}
      {!signup.confirmed && nameEmailCols && (
        <td colSpan={nameEmailCols} className="font-italic">
          {t("editor.signups.unconfirmed")}
        </td>
      )}
      {showQuota && (
        <td key="quota">{signupStatus ? `${signup.quota.title} (${signupStatus})` : signup.quota.title}</td>
      )}
      {event.questions.map((question) => (
        <td key={question.id}>{stringifyAnswer(signup.answers[question.id])}</td>
      ))}
      <td key="timestamp">{actionDateFormat.format(signup.createdAt)}</td>
      <td key="delete">
        <Button type="button" variant="danger" size="sm" onClick={onDelete}>
          {t("editor.signups.action.delete")}
        </Button>
      </td>
    </tr>
  );
};

type TableProps = {
  event: AdminEventResponse;
  signups: FormattedSignup[];
  showQuota: boolean;
};

const SignupTable = ({ event, signups, showQuota }: TableProps) => {
  const { t } = useTranslation();

  if (!signups.length) return <p>{t("editor.signups.emptyQuota")}</p>;

  return (
    <table className="event-editor--signup-table table table-condensed table-responsive">
      <thead>
        <tr className="active">
          <th key="position">#</th>
          {event.nameQuestion && <th key="firstName">{t("editor.signups.column.firstName")}</th>}
          {event.nameQuestion && <th key="lastName">{t("editor.signups.column.lastName")}</th>}
          {event.emailQuestion && <th key="email">{t("editor.signups.column.email")}</th>}
          {showQuota && <th key="quota">{t("editor.signups.column.quota")}</th>}
          {event.questions.map((q) => (
            <th key={q.id}>{q.question}</th>
          ))}
          <th key="timestamp">{t("editor.signups.column.time")}</th>
          <th key="delete" aria-label={t("editor.signups.column.delete")} />
        </tr>
      </thead>
      <tbody>
        {signups.map((signup, index) => (
          <SignupRow key={signup.id} position={index + 1} signup={signup} showQuota={showQuota} />
        ))}
      </tbody>
    </table>
  );
};

const csvOptions: CSVOptions = { delimiter: "\t" };

const SignupsTab = () => {
  const event = useTypedSelector((state) => state.editor.event);
  const signups = useMemo(() => event && getSignupsForAdminList(event), [event]);
  const signupsByQuota = useMemo(() => event && getSignupsByQuotaForAdminList(event), [event]);
  const csvSignups = useConvertSignupsToCSV(event, signups);

  const [grouped, setGrouped] = useState(false);
  const onGroupedChange = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => setGrouped(evt.currentTarget.checked),
    [],
  );

  const { t } = useTranslation();

  if (!event || !signups?.length || !signupsByQuota) {
    return <p>{t("editor.signups.noSignups")}</p>;
  }

  const isSingleQuota = event.quotas.length <= 1;

  return (
    <div>
      <nav className="mb-3 d-flex align-items-center flex-wrap">
        <Form.Check
          id="groupByQuota"
          label={t("editor.signups.groupByQuota")}
          checked={grouped}
          onChange={onGroupedChange}
        />
        <div className="flex-grow-1" />
        <CSVLink
          data={csvSignups!}
          csvOptions={csvOptions}
          download={t("editor.signups.download.filename", { event: event.title })}
        >
          {t("editor.signups.download")}
        </CSVLink>
      </nav>
      {grouped ? (
        signupsByQuota.map((quota) => (
          <Fragment key={quota.id ?? quota.type}>
            <h3>{quota.type === SignupStatus.IN_QUEUE ? t("editor.signups.inQueue") : quota.title}</h3>
            <SignupTable event={event} signups={quota.signups} showQuota={false} />
          </Fragment>
        ))
      ) : (
        <SignupTable event={event} signups={signups} showQuota={!isSingleQuota} />
      )}
    </div>
  );
};

export default SignupsTab;
