import React from 'react';

import { Col, Row, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { linkComponent, useParams } from '../../config/router';
import { usePaths } from '../../contexts/paths';
import { I18nProvider } from '../../i18n';
import {
  SingleEventProps, SingleEventProvider, useSingleEventContext,
} from '../../modules/singleEvent';
import { errorDesc, errorTitle } from '../../utils/errorMessage';
import EventDescription from './components/EventDescription';
import QuotaStatus from './components/QuotaStatus';
import SignupCountdown from './components/SignupCountdown';
import SignupList from './components/SignupList';

const SingleEventView = () => {
  const {
    event, signupsByQuota, pending, error,
  } = useSingleEventContext();
  const Link = linkComponent();
  const paths = usePaths();
  const { t } = useTranslation();

  if (error) {
    return (
      <div className="ilmo--loading-container">
        <h1>{errorTitle(t, error, 'singleEvent.loadError')}</h1>
        <p>{errorDesc(t, error, 'singleEvent.loadError')}</p>
        <Link to={paths.eventsList}>{t('errors.returnToEvents')}</Link>
      </div>
    );
  }

  if (pending) {
    return (
      <div className="ilmo--loading-container">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <>
      <Link to={paths.eventsList} style={{ margin: 0 }}>
        {`\u2190 ${t('singleEvent.returnToEvents')}`}
      </Link>
      <Row>
        <Col sm={12} md={8}>
          <EventDescription />
        </Col>
        <Col sm={12} md={4}>
          <SignupCountdown />
          <QuotaStatus />
        </Col>
      </Row>
      {event!.signupsPublic && (
        <>
          <h2>{t('singleEvent.signups.title')}</h2>
          {signupsByQuota!.map((quota) => (
            <SignupList
              key={quota.id}
              quota={quota}
            />
          ))}
        </>
      )}
    </>
  );
};

const SingleEvent = () => {
  const { slug } = useParams<SingleEventProps>();
  return (
    <SingleEventProvider slug={slug}>
      <I18nProvider>
        <SingleEventView />
      </I18nProvider>
    </SingleEventProvider>
  );
};

export default SingleEvent;
