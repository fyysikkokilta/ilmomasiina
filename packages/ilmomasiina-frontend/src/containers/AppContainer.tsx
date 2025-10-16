import React from "react";

import { ConnectedRouter } from "connected-react-router";
import { Container } from "react-bootstrap";
import { Provider } from "react-redux";
import { Route, Switch } from "react-router-dom";
import { Flip, ToastContainer } from "react-toastify";
import { PersistGate } from "redux-persist/integration/react";

import Footer from "../components/Footer";
import Header from "../components/Header";
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
import configureStore, { history } from "../store/configureStore";
import { AuthProvider } from "./AuthProvider";

import "react-toastify/scss/main.scss";
import "../styles/app.scss";

const { store, persistor } = configureStore();

const AppContainer = () => (
  <div className="layout-wrapper">
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <ConnectedRouter history={history}>
          <AuthProvider>
            <Header />
            <Container>
              <Switch>
                <Route exact path={paths.eventsList}>
                  <EventList />
                </Route>
                <Route exact path={paths.eventDetails(":slug")}>
                  <SingleEvent />
                </Route>
                <Route exact path={paths.editSignup(":id", ":editToken")}>
                  <EditSignup />
                </Route>
                <Route exact path={paths.adminLogin}>
                  <Login />
                </Route>
                <Route exact path={paths.adminInitialSetup}>
                  <InitialSetup />
                </Route>
                <Route exact path={paths.adminEventsList}>
                  <AdminEventsList />
                </Route>
                <Route exact path={paths.adminUsersList}>
                  <AdminUsersList />
                </Route>
                <Route exact path={paths.adminEditEvent(":id")}>
                  <Editor />
                </Route>
                <Route exact path={paths.adminAuditLog}>
                  <AuditLog />
                </Route>
                <Route path="*">
                  <PageNotFound />
                </Route>
              </Switch>
            </Container>
            <Footer />
          </AuthProvider>
        </ConnectedRouter>
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
      </PersistGate>
    </Provider>
  </div>
);

export default AppContainer;
