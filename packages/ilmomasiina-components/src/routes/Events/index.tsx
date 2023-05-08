import React from 'react';

import { Spinner, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import '../../utils/i18n';

import { timezone } from '../../config';
import { linkComponent } from '../../config/router';
import { usePaths } from '../../contexts/paths';
import { EventListProps, EventListProvider, useEventListContext } from '../../modules/events';
import { eventsToRows, OPENQUOTA, WAITLIST } from '../../utils/eventListUtils';
import { signupStateText } from '../../utils/signupStateText';
import TableRow from './components/TableRow';

const EventListView = () => {
  const { events, error, pending } = useEventListContext();
  const { t } = useTranslation();
  const Link = linkComponent();
  const paths = usePaths();

  if (error) {
    return (
      <>
        <h1>{t('errorTitle')}</h1>
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
    if (row.isEvent) {
      const {
        id, slug, title, date, signupState, signupCount, quotaSize,
      } = row;
      const stateText = signupStateText(signupState);
      return (
        <TableRow
          className={stateText.class}
          title={<Link to={paths.eventDetails(slug)}>{title}</Link>}
          date={date ? date.tz(timezone()).format('DD.MM.YYYY') : ''}
          signupStatus={stateText}
          signupCount={signupCount}
          quotaSize={quotaSize}
          key={id}
        />
      );
    }
    if (row.id !== WAITLIST) {
      const {
        id, title, signupCount, quotaSize,
      } = row;
      return (
        <TableRow
          className="ilmo--quota-row"
          title={id === OPENQUOTA ? t('events.openQuota') : title}
          signupCount={signupCount}
          quotaSize={quotaSize}
          // No real alternatives for key :(
          // eslint-disable-next-line react/no-array-index-key
          key={id}
        />
      );
    }
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
    <EventListView />
  </EventListProvider>
);

export default EventList;
