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
    <BrowserRouter>
      <div className="layout-wrapper">
        <Header />
        <Container>
          <Routes>
            <Route path={paths.eventsList} element={<EventList />} />
            <Route path={paths.eventDetails(":slug")} element={<SingleEvent />} />
            <Route path={paths.editSignup(":id", ":editToken")} element={<EditSignup />} />
            <Route path={paths.adminLogin} element={<Login />} />
            <Route path={paths.adminInitialSetup} element={<InitialSetup />} />
            <Route path={paths.adminEventsList} element={<AdminEventsList />} />
            <Route path={paths.adminUsersList} element={<AdminUsersList />} />
            <Route path={paths.adminEditEvent(":id")} element={<Editor />} />
            <Route path={paths.adminCopyEvent(":id")} element={<Editor copy />} />
            <Route path={paths.adminAuditLog} element={<AuditLog />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
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
    </BrowserRouter>
  );
};

export default AppContainer;
