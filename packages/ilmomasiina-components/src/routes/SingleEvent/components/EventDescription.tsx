import React, { useContext } from 'react';

import moment from 'moment-timezone';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import '../../../utils/i18n';

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
            {t('Edit')}
          </Button>
        )}
      </nav>
      <div className="ilmo--event-heading">
        {event.category && (
          <p>
            <strong>
              {t('Category')}
              :
            </strong>
            {' '}
            {event.category}
          </p>
        )}
        {event.date && (
          <p>
            <strong>{event.endDate ? `${t('Starts')}` : `${t('Date')}:`}</strong>
            {' '}
            {moment(event.date).tz(timezone()).format(`D.M.Y ${t('at')} HH:mm`)}
          </p>
        )}
        {event.endDate && (
          <p>
            <strong>
              {t('Ends')}
              :
            </strong>
            {' '}
            {moment(event.endDate).tz(timezone()).format(`D.M.Y ${t('at')} HH:mm`)}
          </p>
        )}
        {event.location && (
          <p>
            <strong>
              {t('Location')}
              :
            </strong>
            {' '}
            {event.location}
          </p>
        )}
        {event.price && (
          <p>
            <strong>
              {t('Price')}
              :
            </strong>
            {' '}
            {event.price}
          </p>
        )}
        {event.webpageUrl && (
          <p>
            <strong>
              {t('Homepage')}
              :
            </strong>
            {' '}
            <a href={event.webpageUrl} title="Kotisivut / Home page">
              {event.webpageUrl}
            </a>
          </p>
        )}
        {event.facebookUrl && (
          <p>
            <strong>
              {t('Facebook event')}
              :
            </strong>
            {' '}
            <a href={event.facebookUrl} title="Facebook-tapahtuma / Facebook event">
              {event.facebookUrl}
            </a>
          </p>
        )}
      </div>
      <div className="ilmo--event-description">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {event.description || ''}
        </ReactMarkdown>
        <hr/>
          <p>Ilmoittautumisen sulkeuduttua ilmoittautuminen on sitova. Tämän jälkeen maksulliseen tapahtumaan ilmoittautunut on velvollinen maksamaan osallistumismaksun tai löytämään paikalleen toisen osallistujan. Fyysikkokillan peruutuskäytännöt löydät <a href="https://www.fyysikkokilta.fi/peruutuskaytannot-ja-korvausvelvollisuus/">täältä</a>.</p>
          <p>The sign up is binding when sign-up closes. After this, the person who has signed up to a paid event is obligated to pay the participation fee or find another participant to attend in one’s place. The Guild of Physics' sign-up cancellation -policy can be found <a href="https://www.fyysikkokilta.fi/en/peruutuskaytannot-ja-korvausvelvollisuus/">here</a>.</p>
        <hr/>
      </div>
    </>
  );
};

export default EventDescription;
