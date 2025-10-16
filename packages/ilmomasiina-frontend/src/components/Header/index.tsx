import React from "react";

import { Button, Container, Navbar } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import logo from "../../assets/logo.svg";
import branding from "../../branding";
import i18n from "../../i18n";
import { logout } from "../../modules/auth/actions";
import paths from "../../paths";
import { useTypedDispatch, useTypedSelector } from "../../store/reducers";

import "./Header.scss";

const Header = () => {
  const dispatch = useTypedDispatch();
  const loggedIn = useTypedSelector((state) => state.auth.loggedIn);
  const {
    i18n: { language },
    t,
  } = useTranslation();

  return (
    <Navbar>
      <Container>
        <Link to={paths.eventsList} className="navbar-brand mr-auto">
          <img className="navbar-logo" src={logo} alt="Logo" />
          <span className="d-none d-sm-inline">{branding.headerTitle}</span>
          <span className="d-sm-none">{branding.headerTitleShort}</span>
        </Link>
        {language !== "fi" && (
          <Button onClick={() => i18n.changeLanguage("fi")}>{t("header.switchLanguage", { lng: "fi" })}</Button>
        )}
        {language !== "en" && (
          <Button onClick={() => i18n.changeLanguage("en")}>{t("header.switchLanguage", { lng: "en" })}</Button>
        )}
        {loggedIn && <Button onClick={() => dispatch(logout())}>{t("header.logout")}</Button>}
      </Container>
    </Navbar>
  );
};

export default Header;
