import React from 'react';

import { Spinner, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { timezone } from '../../config';
import { linkComponent } from '../../config/router';
import { usePaths } from '../../contexts/paths';
import { I18nProvider } from '../../i18n';
import { EventListProps, EventListProvider, useEventListContext } from '../../modules/events';
import {
  EventRow, eventsToRows, OPENQUOTA, QuotaRow, WAITLIST,
} from '../../utils/eventListUtils';
import { useSignupStateText } from '../../utils/signupStateText';
import TableRow from './components/TableRow';

const ListEventRow = ({
  row: {
    slug, title, date, signupState, signupCount, quotaSize,
  },
}: { row: EventRow }) => {
  const Link = linkComponent();
  const paths = usePaths();
  const stateText = useSignupStateText(signupState);
  return (
    <TableRow
      className={stateText.class}
      title={<Link to={paths.eventDetails(slug)}>{title}</Link>}
      date={date ? date.tz(timezone()).format('DD.MM.YYYY') : ''}
      signupStatus={stateText}
      signupCount={signupCount}
      quotaSize={quotaSize}
    />
  );
};

const ListQuotaRow = ({
  row: {
    id, title, signupCount, quotaSize,
  },
}: { row: QuotaRow }) => {
  const { t } = useTranslation();
  return (
    <TableRow
      className="ilmo--quota-row"
      title={id === OPENQUOTA ? t('events.openQuota') : title}
      signupCount={signupCount}
      quotaSize={quotaSize}
    />
  );
};

const EventListView = () => {
  const { events, error, pending } = useEventListContext();
  const { t } = useTranslation();

  if (error) {
    return (
      <>
        <h1>{t('errors.title')}</h1>
        <p>{t('events.loadFailed')}</p>
      </>
    );
  }

  if (pending) {
    return (
      <>
        <h1>{t('events.title')}</h1>
        <Spinner animation="border" />
      </>
    );
  }

  const tableRows = eventsToRows(events!).map((row) => {
    if (row.isEvent) return <ListEventRow key={row.id} row={row} />;
    if (row.id !== WAITLIST) return <ListQuotaRow key={row.id} row={row} />;
    return null;
  });

  return (
    <>
      <h1>{t('events.title')}</h1>
      <Table className="ilmo--event-list">
        <thead>
          <tr>
            <th>{t('events.column.name')}</th>
            <th>{t('events.column.date')}</th>
            <th>{t('events.column.signupStatus')}</th>
            <th>{t('events.column.signupCount')}</th>
          </tr>
        </thead>
        <tbody>{tableRows}</tbody>
      </Table>
    </>
  );
};

const EventList = ({ category }: EventListProps) => (
  <EventListProvider category={category}>
    <I18nProvider>
      <EventListView />
    </I18nProvider>
  </EventListProvider>
);

export default EventList;
