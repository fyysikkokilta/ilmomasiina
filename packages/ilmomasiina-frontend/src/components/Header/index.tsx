import React, { useCallback } from "react";

import { Button, Container, Navbar } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import logo from "../../assets/logo.svg";
import branding from "../../branding";
import i18n from "../../i18n";
import { loginToast } from "../../modules/auth";
import useStore from "../../modules/store";
import paths from "../../paths";

import "./Header.scss";

const Header = () => {
  const { loggedIn, resetAuth } = useStore((state) => state.auth);
  const navigate = useNavigate();
  const {
    i18n: { language },
    t,
  } = useTranslation();

  const logout = useCallback(() => {
    resetAuth();
    loginToast("success", i18n.t("auth.logoutSuccess"), 2000);
    navigate(paths.adminLogin);
  }, [resetAuth, navigate]);

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
        {loggedIn && <Button onClick={logout}>{t("header.logout")}</Button>}
      </Container>
    </Navbar>
  );
};

export default Header;
