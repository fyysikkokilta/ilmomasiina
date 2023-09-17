import React, { useMemo } from 'react';

import { Button } from 'react-bootstrap';
import { CSVLink } from 'react-csv';
import { useTranslation } from 'react-i18next';

import { convertSignupsToCSV, getSignupsForAdminList } from '@tietokilta/ilmomasiina-components/dist/utils/signupUtils';
import { deleteSignup, getEvent } from '../../../modules/editor/actions';
import { useTypedDispatch, useTypedSelector } from '../../../store/reducers';

import '../Editor.scss';

const SignupsTab = () => {
  const dispatch = useTypedDispatch();
  const event = useTypedSelector((state) => state.editor.event);

  const signups = useMemo(() => event && getSignupsForAdminList(event), [event]);

  const csvSignups = useMemo(() => event && convertSignupsToCSV(event, signups!), [event, signups]);

  const { t } = useTranslation();

  if (!event || !signups?.length) {
    return (
      <p>{t('editor.signups.noSignups')}</p>
    );
  }

  return (
    <div>
      <CSVLink
        data={csvSignups!}
        separator={'\t'}
        filename={`${event.title} osallistujalista.csv`}
      >
        {t('editor.signups.download')}
      </CSVLink>
      <br />
      <br />
      <table className="event-editor--signup-table table table-condensed table-responsive">
        <thead>
          <tr className="active">
            <th key="position">#</th>
            {event.nameQuestion && <th key="firstName">{t('editor.signups.column.firstName')}</th>}
            {event.nameQuestion && <th key="lastName">{t('editor.signups.column.lastName')}</th>}
            {event.emailQuestion && <th key="email">{t('editor.signups.column.email')}</th>}
            <th key="quota">{t('editor.signups.column.quota')}</th>
            {event.questions.map((q) => (
              <th key={q.id}>{q.question}</th>
            ))}
            <th key="timestamp">{t('editor.signups.column.time')}</th>
            <th key="delete" aria-label={t('editor.signups.column.delete')} />
          </tr>
        </thead>
        <tbody>
          {signups.map((signup, index) => (
            <tr key={signup.id} className={!signup.confirmed ? 'text-muted' : ''}>
              <td key="position">{`${index + 1}.`}</td>
              {event.nameQuestion && <td key="firstName">{signup.firstName}</td>}
              {event.nameQuestion && <td key="lastName">{signup.lastName}</td>}
              {event.emailQuestion && <td key="email">{signup.email}</td>}
              <td key="quota">{signup.quota}</td>
              {event.questions.map((question) => (
                <td key={question.id}>{signup.answers[question.id]}</td>
              ))}
              <td key="timestamp">{signup.createdAt}</td>
              <td key="delete">
                <Button
                  type="button"
                  variant="danger"
                  onClick={async () => {
                    const confirmation = window.confirm(t('editor.signups.action.delete.confirm'));
                    if (confirmation) {
                      await dispatch(deleteSignup(signup.id!));
                      dispatch(getEvent(event.id));
                    }
                  }}
                >
                  {t('editor.signups.action.delete')}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SignupsTab;
