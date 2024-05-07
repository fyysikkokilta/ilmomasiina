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
        <h1>{t('Whoops, something went wrong')}</h1>
        <p>{t('Failed to load events')}</p>
      </>
    );
  }

  if (pending) {
    return (
      <>
        <h1>{t('Events')}</h1>
        <Spinner animation="border" />
      </>
    );
  }

  const tableRows = eventsToRows(events!).map((row, index) => {
    if (row.isEvent) {
      const {
        slug, title, date, signupState, signupCount, quotaSize,
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
          key={slug}
        />
      );
    }
    if (row.title !== WAITLIST) {
      const { title, signupCount, quotaSize } = row;
      return (
        <TableRow
          className="ilmo--quota-row"
          title={title === OPENQUOTA ? t('Open') : title}
          signupCount={signupCount}
          quotaSize={quotaSize}
          // No real alternatives for key :(
          // eslint-disable-next-line react/no-array-index-key
          key={index}
        />
      );
    }
    return null;
  });

  return (
    <>
      <h1>{t('Events')}</h1>
      <Table className="ilmo--event-list">
        <thead>
          <tr>
            <th>{t('Name')}</th>
            <th>{t('Date')}</th>
            <th>{t('Signup')}</th>
            <th>{t('Quota')}</th>
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
