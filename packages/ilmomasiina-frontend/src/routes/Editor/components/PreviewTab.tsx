import React, { useMemo } from "react";

import { Col, Row } from "react-bootstrap";
import { useFormState } from "react-final-form";

import { SingleEventContextProvider, SingleEventState } from "@tietokilta/ilmomasiina-components";
import EventDescription from "@tietokilta/ilmomasiina-components/dist/routes/SingleEvent/components/EventDescription";
import SignupCountdown from "@tietokilta/ilmomasiina-components/dist/routes/SingleEvent/components/SignupCountdown";
import { editorEventToServer } from "../../../modules/editor/actions";
import { EditorEvent } from "../../../modules/editor/types";

const PreviewTab = () => {
  const { values } = useFormState<EditorEvent>();

  // Render SingleEvent route contents with a simulated saved event.
  const contextVal = useMemo((): SingleEventState => {
    const converted = editorEventToServer(values);
    return {
      pending: false,
      event: {
        ...converted,
        id: "preview",
        quotas: converted.quotas.map((quota) => ({
          ...quota,
          id: quota.id ?? `preview${Math.random()}`,
          signupCount: 0,
          signups: [],
        })),
        questions: converted.questions.map((question) => ({
          ...question,
          id: question.id ?? `preview${Math.random()}`,
        })),
        registrationClosed: false,
        millisTillOpening: Infinity,
      },
      preview: true,
    };
  }, [values]);

  return (
    <SingleEventContextProvider value={contextVal}>
      <Row className="event-editor--preview">
        <Col sm={12} md={8}>
          <EventDescription />
        </Col>
        <Col sm={12} md={4}>
          <SignupCountdown />
        </Col>
      </Row>
    </SingleEventContextProvider>
  );
};

export default PreviewTab;
