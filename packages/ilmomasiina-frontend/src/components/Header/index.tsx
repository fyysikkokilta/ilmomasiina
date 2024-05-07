import React from 'react';

import { Button, Container, Navbar } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import i18n from 'src/i18n';

import branding from '../../branding';
import { logout } from '../../modules/auth/actions';
import appPaths from '../../paths';
import { useTypedDispatch, useTypedSelector } from '../../store/reducers';

import './Header.scss';

const Header = () => {
  const dispatch = useTypedDispatch();
  const loggedIn = useTypedSelector((state) => state.auth.loggedIn);
  const { i18n: { language } } = useTranslation();

  return (
    <Navbar>
      <img alt="Logo" src={branding.headerLogoUrl} />
      <Container>
        <Link to={appPaths.eventsList} className="navbar-brand mr-auto">
          {branding.headerTitle}
        </Link>
        {language !== 'fi' && <Button onClick={() => i18n.changeLanguage('fi')}>Suomeksi</Button>}
        {language !== 'en' && <Button onClick={() => i18n.changeLanguage('en')}>In English</Button>}
        {loggedIn && (
          <Button
            onClick={() => dispatch(logout())}
          >
            Logout
          </Button>
        )}
      </Container>
    </Navbar>
  );
};

export default Header;
