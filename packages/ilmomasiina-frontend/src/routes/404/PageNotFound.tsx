import React from 'react';

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import appPaths from '../../paths';

const PageNotFound = () => {
  const { t } = useTranslation();
  return (
    <div className="ilmo--status-container">
      <h1>{t('errors.404.title')}</h1>
      <p>
        {t('errors.404.description')}
      </p>
      <p>
        <Link to={appPaths.eventsList}>{t('errors.returnToEvents')}</Link>
      </p>
    </div>
  );
};

export default PageNotFound;
