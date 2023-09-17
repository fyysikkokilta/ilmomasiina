import React, { useContext } from 'react';

import moment from 'moment-timezone';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { timezone } from '../../../config';
import { linkComponent } from '../../../config/router';
import AuthContext from '../../../contexts/auth';
import { usePaths } from '../../../contexts/paths';
import { useSingleEventContext } from '../../../modules/singleEvent';

const EventDescription = () => {
  const event = useSingleEventContext().event!;
  const { loggedIn } = useContext(AuthContext);
  const Link = linkComponent();
  const paths = usePaths();
  const { t } = useTranslation();
  return (
    <>
      <nav className="ilmo--title-nav">
        <h1>{event.title}</h1>
        {loggedIn && paths.hasAdmin && (
          <Button as={Link} variant="primary" to={paths.adminEditEvent(event.id)}>
            {t('singleEvent.editEvent')}
          </Button>
        )}
      </nav>
      <div className="ilmo--event-heading">
        {event.category && (
          <p>
            <strong>
              {t('singleEvent.info.category')}
            </strong>
            {' '}
            {event.category}
          </p>
        )}
        {event.date && (
          <p>
            <strong>{event.endDate ? t('singleEvent.info.startDate') : t('singleEvent.info.date')}</strong>
            {' '}
            {moment(event.date).tz(timezone()).format(`D.M.Y [${t('dateFormat.dateTimeSep')}] HH:mm`)}
          </p>
        )}
        {event.endDate && (
          <p>
            <strong>
              {t('singleEvent.info.endDate')}
            </strong>
            {' '}
            {moment(event.endDate).tz(timezone()).format(`D.M.Y [${t('dateFormat.dateTimeSep')}] HH:mm`)}
          </p>
        )}
        {event.location && (
          <p>
            <strong>
              {t('singleEvent.info.location')}
            </strong>
            {' '}
            {event.location}
          </p>
        )}
        {event.price && (
          <p>
            <strong>
              {t('singleEvent.info.price')}
            </strong>
            {' '}
            {event.price}
          </p>
        )}
        {event.webpageUrl && (
          <p>
            <strong>
              {t('singleEvent.info.website')}
            </strong>
            {' '}
            <a href={event.webpageUrl} title={t('singleEvent.info.website')}>
              {event.webpageUrl}
            </a>
          </p>
        )}
        {event.facebookUrl && (
          <p>
            <strong>
              {t('singleEvent.info.facebookEvent')}
            </strong>
            {' '}
            <a href={event.facebookUrl} title={t('singleEvent.info.facebookEvent')}>
              {event.facebookUrl}
            </a>
          </p>
        )}
      </div>
      <div className="ilmo--event-description">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {event.description || ''}
        </ReactMarkdown>
      </div>
    </>
  );
};

export default EventDescription;
