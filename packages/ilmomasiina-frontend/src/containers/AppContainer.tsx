import React, { useEffect } from "react";

import { Container } from "react-bootstrap";
import { BrowserRouter, Route, Routes } from "react-router";
import { Flip, ToastContainer } from "react-toastify";

import Footer from "../components/Footer";
import Header from "../components/Header";
import useStore from "../modules/store";
import paths from "../paths";
import PageNotFound from "../routes/404/PageNotFound";
import AdminEventsList from "../routes/AdminEventsList";
import AdminUsersList from "../routes/AdminUsers";
import AuditLog from "../routes/AuditLog";
import Editor from "../routes/Editor";
import EditSignup from "../routes/EditSignup";
import EventList from "../routes/EventList";
import InitialSetup from "../routes/InitialSetup";
import Login from "../routes/Login";
import SingleEvent from "../routes/SingleEvent";

import "react-toastify/dist/ReactToastify.css";
import "../styles/app.scss";

const LOGIN_RENEW_INTERVAL = 60 * 1000;

const AppContainer = () => {
  const renewLogin = useStore((state) => state.auth.renewLogin);
  useEffect(() => {
    // Renew login immediately on page load if necessary.
    renewLogin();
    // Then, check every minute and renew if necessary.
    const timer = window.setInterval(() => renewLogin(), LOGIN_RENEW_INTERVAL);
    return () => window.clearTimeout(timer);
  }, [renewLogin]);

  return (
    <div className="layout-wrapper">
      <Header />
      <Container>
        <BrowserRouter>
          <Routes>
            <Route path={paths.eventsList}>
              <EventList />
            </Route>
            <Route path={paths.eventDetails(":slug")}>
              <SingleEvent />
            </Route>
            <Route path={paths.editSignup(":id", ":editToken")}>
              <EditSignup />
            </Route>
            <Route path={paths.adminLogin}>
              <Login />
            </Route>
            <Route path={paths.adminInitialSetup}>
              <InitialSetup />
            </Route>
            <Route path={paths.adminEventsList}>
              <AdminEventsList />
            </Route>
            <Route path={paths.adminUsersList}>
              <AdminUsersList />
            </Route>
            <Route path={paths.adminEditEvent(":id")}>
              <Editor />
            </Route>
            <Route path={paths.adminCopyEvent(":id")}>
              <Editor copy />
            </Route>
            <Route path={paths.adminAuditLog}>
              <AuditLog />
            </Route>
            <Route path="*">
              <PageNotFound />
            </Route>
          </Routes>
        </BrowserRouter>
      </Container>
      <Footer />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Flip}
      />
    </div>
  );
};

export default AppContainer;
