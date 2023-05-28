import React, { useEffect, useRef } from 'react';

import { useFormikContext } from 'formik';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { shallowEqual } from 'react-redux';

import { FieldRow } from '@tietokilta/ilmomasiina-components';
import { checkingSlugAvailability, checkSlugAvailability, loadCategories } from '../../../modules/editor/actions';
import { EditorEvent, EditorEventType } from '../../../modules/editor/types';
import { useTypedDispatch, useTypedSelector } from '../../../store/reducers';
import Autocomplete from './Autocomplete';
import DateTimePicker from './DateTimePicker';
import SelectBox from './SelectBox';
import SlugField from './SlugField';
import Textarea from './Textarea';

// How long to wait (in ms) for the user to finish typing the slug before checking it.
const SLUG_CHECK_DELAY = 250;

const BasicDetailsTab = () => {
  const dispatch = useTypedDispatch();
  const {
    isNew, slugAvailability, event, allCategories,
  } = useTypedSelector((state) => state.editor, shallowEqual);

  const {
    values: {
      title, slug, eventType, date, endDate,
    },
    touched: { slug: slugTouched },
    setFieldValue,
  } = useFormikContext<EditorEvent>();

  const { t } = useTranslation();

  useEffect(() => {
    if (isNew && !slugTouched && title !== undefined) {
      const generatedSlug = title
        .normalize('NFD') // converts e.g. ä to a + umlaut
        .replace(/[^A-Za-z0-9]+/g, '')
        .toLocaleLowerCase('fi');
      setFieldValue('slug', generatedSlug);
    }
  }, [setFieldValue, isNew, title, slugTouched]);

  const checkDelay = useRef<number | undefined>();

  useEffect(() => {
    dispatch(checkingSlugAvailability());
    window.clearTimeout(checkDelay.current);
    checkDelay.current = window.setTimeout(() => {
      if (slug) {
        dispatch(checkSlugAvailability(slug));
      }
    }, SLUG_CHECK_DELAY);
  }, [dispatch, slug]);

  useEffect(() => {
    dispatch(loadCategories());
  }, [dispatch]);

  let slugFeedback = null;
  if (slugAvailability === 'checking') {
    slugFeedback = (
      <Form.Text>{t('editor.basic.url.checking')}</Form.Text>
    );
  } else if (slugAvailability !== null) {
    if (slugAvailability.id === null || slugAvailability.id === event?.id) {
      slugFeedback = <Form.Text className="text-success">{t('editor.basic.url.free')}</Form.Text>;
    } else {
      slugFeedback = (
        <Form.Text className="text-danger">
          {t('editor.basic.url.reserved', { event: slugAvailability.title })}
        </Form.Text>
      );
    }
  }

  return (
    <div>
      <FieldRow
        name="title"
        label={t('editor.basic.name')}
        required
        alternateError={t('editor.basic.name.missing')}
      />
      <FieldRow
        name="slug"
        label={t('editor.basic.url')}
        required
        alternateError={t('editor.basic.url.missing')}
        extraFeedback={slugFeedback}
        as={SlugField}
      />
      <FieldRow
        name="listed"
        label={t('editor.basic.listed')}
        as={Form.Check}
        type="checkbox"
        checkAlign
        checkLabel={t('editor.basic.listed.check')}
        help={t('editor.basic.listed.info')}
      />
      <FieldRow
        name="eventType"
        label={t('editor.basic.type')}
        as={SelectBox}
        options={[
          [EditorEventType.ONLY_EVENT, t('editor.basic.type.onlyEvent')],
          [EditorEventType.EVENT_WITH_SIGNUP, t('editor.basic.type.eventWithSignup')],
          [EditorEventType.ONLY_SIGNUP, t('editor.basic.type.onlySignup')],
        ]}
      />
      {eventType !== EditorEventType.ONLY_SIGNUP && (
        <FieldRow
          name="date"
          label={t('editor.basic.startDate')}
          as={DateTimePicker}
          selectsStart
          endDate={endDate}
          required
          alternateError={t('editor.basic.startDate.missing')}
        />
      )}
      {eventType !== EditorEventType.ONLY_SIGNUP && (
        <FieldRow
          name="endDate"
          label={t('editor.basic.endDate')}
          as={DateTimePicker}
          selectsEnd
          startDate={date}
          help={t('editor.basic.endDate.info')}
        />
      )}
      <FieldRow
        name="category"
        label={t('editor.basic.category')}
        as={Autocomplete}
        options={allCategories || []}
        busy={allCategories === null}
      />
      <FieldRow
        name="webpageUrl"
        label={t('editor.basic.homePage')}
      />
      <FieldRow
        name="facebookUrl"
        label={t('editor.basic.facebook')}
      />
      <FieldRow
        name="location"
        label={t('editor.basic.location')}
      />
      <FieldRow
        name="description"
        label={t('editor.basic.description')}
        help={t('editor.basic.description.info')}
        as={Textarea}
        rows={8}
      />
    </div>
  );
};

export default BasicDetailsTab;
