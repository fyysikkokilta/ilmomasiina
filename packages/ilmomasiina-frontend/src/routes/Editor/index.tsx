import React, { useEffect } from "react";

import { Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { errorDesc, errorTitle } from "@tietokilta/ilmomasiina-client";
import requireAuth from "../../containers/requireAuth";
import type { TKey } from "../../i18n";
import { copyEvent, getEvent, newEvent, resetState } from "../../modules/editor/actions";
import paths from "../../paths";
import { useTypedDispatch, useTypedSelector } from "../../store/reducers";
import EditForm from "./components/EditForm";

import "./Editor.scss";

interface Props {
  copy?: boolean;
}

interface MatchParams {
  id: string;
}

const Editor = ({ copy = false }: Props) => {
  const dispatch = useTypedDispatch();
  const loaded = useTypedSelector((state) => state.editor.event != null);
  const loadError = useTypedSelector((state) => state.editor.loadError);
  const { t } = useTranslation();

  const urlEventId = useParams<MatchParams>().id;
  const urlIsNew = urlEventId === "new";

  useEffect(() => {
    if (urlIsNew) {
      dispatch(newEvent());
    } else if (copy) {
      dispatch(copyEvent(urlEventId));
    } else {
      dispatch(getEvent(urlEventId));
    }
    return () => {
      dispatch(resetState());
    };
  }, [dispatch, urlIsNew, copy, urlEventId]);

  if (loadError) {
    return (
      <div className="ilmo--loading-container">
        <h1>{t(errorTitle<TKey>(loadError, "editor.loadError"))}</h1>
        <p>{t(errorDesc<TKey>(loadError, "editor.loadError"), { eventId: urlEventId })}</p>
        <Link to={paths.adminEventsList}>{t("errors.returnToEvents")}</Link>
      </div>
    );
  }

  if (!urlIsNew && !loaded) {
    return (
      <>
        <h1>{t("editor.title.edit")}</h1>
        <Link to={paths.adminEventsList}>&#8592; {t("editor.action.goBack")}</Link>
        <div className="ilmo--loading-container">
          <Spinner animation="border" />
        </div>
      </>
    );
  }

  return <EditForm />;
};

export default requireAuth(Editor);
