import React from 'react';

import { useFormikContext } from 'formik';
import { Button, ButtonGroup, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { shallowEqual } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import { EditorEvent } from '../../../modules/editor/types';
import appPaths from '../../../paths';
import { useTypedSelector } from '../../../store/reducers';

interface EditorToolbarProps {
  onSubmitClick: (asDraft: boolean) => void;
}

type Props = EditorToolbarProps & RouteComponentProps<{ id: string }>;

const EditorToolbar = ({ onSubmitClick }: Props) => {
  const { isSubmitting } = useFormikContext<EditorEvent>();
  const { event, isNew } = useTypedSelector((state) => state.editor, shallowEqual);

  const isDraft = event?.draft || isNew;

  const { t } = useTranslation();

  return (
    <>
      <h1>
        {isNew
          ? t('editor.title.new')
          : t('editor.title.edit')}
      </h1>
      <div className="event-editor--buttons-wrapper">
        <div className="flex-fill">
          <Link to={appPaths.adminEventsList}>
            &#8592;
            {' '}
            {t('editor.action.goBack')}
          </Link>
        </div>
        {isSubmitting && <Spinner animation="border" />}
        <div className="event-editor--public-status">
          <div className={`event-editor--bubble ${isDraft ? 'draft' : 'public'} event-editor--animated`} />
          <span>
            {isDraft ? t('editor.status.draft') : (
              <Link to={appPaths.eventDetails(event!.slug)} target="_blank">{t('editor.status.published')}</Link>
            )}
          </span>
        </div>
        <ButtonGroup>
          {!isNew && (
            <Button
              type="button"
              disabled={isSubmitting}
              variant={isDraft ? 'success' : 'warning'}
              formNoValidate
              onClick={() => onSubmitClick(!isDraft)}
            >
              {isDraft ? t('editor.action.publish') : t('editor.action.convertToDraft')}
            </Button>
          )}
          <Button
            type="button"
            disabled={isSubmitting}
            variant="secondary"
            formNoValidate
            onClick={() => onSubmitClick(isDraft)}
          >
            {isNew ? t('editor.action.saveDraft') : t('editor.action.saveChanges')}
          </Button>
        </ButtonGroup>
      </div>
    </>
  );
};

export default withRouter(EditorToolbar);
