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
      <Form.Text>
        {t('editor.basic.url.checking')}
        &hellip;
      </Form.Text>
    );
  } else if (slugAvailability !== null) {
    if (slugAvailability.id === null || slugAvailability.id === event?.id) {
      slugFeedback = <Form.Text className="text-success">{t('editor.basic.url.free')}</Form.Text>;
    } else {
      slugFeedback = (
        <Form.Text className="text-danger">
          {t('editor.basic.urlExists')}
          {slugAvailability.title}
        </Form.Text>
      );
    }
  }

  return (
    <div>
      <FieldRow
        name="title"
        label={t('editor.basic.name') as string}
        required
        alternateError={t('editor.basic.nameError') as string}
      />
      <FieldRow
        name="slug"
        label={t('editor.basic.url') as string}
        required
        alternateError={t('editor.basicurlError') as string}
        extraFeedback={slugFeedback}
        as={SlugField}
      />
      <FieldRow
        name="listed"
        label={t('editor.basic.publicity') as string}
        as={Form.Check}
        type="checkbox"
        checkAlign
        checkLabel={t('editor.basic.showEvent') as string}
        help={t('editor.basic.hiddenEventInfo') as string}
      />
      <FieldRow
        name="eventType"
        label={t('editor.basic.type') as string}
        as={SelectBox}
        options={[
          [EditorEventType.ONLY_EVENT, t('editor.onlyEvent')],
          [EditorEventType.EVENT_WITH_SIGNUP, t('editor.eventWithSignup')],
          [EditorEventType.ONLY_SIGNUP, t('editor.onlySignup')],
        ]}
      />
      {eventType !== EditorEventType.ONLY_SIGNUP && (
        <FieldRow
          name="date"
          label={t('editor.time.start') as string}
          as={DateTimePicker}
          selectsStart
          endDate={endDate}
          required
          alternateError={t('editor.startDateError') as string}
        />
      )}
      {eventType !== EditorEventType.ONLY_SIGNUP && (
        <FieldRow
          name="endDate"
          label={t('editor.time.end') as string}
          as={DateTimePicker}
          selectsEnd
          startDate={date}
          help={t('editor.basic.dateWarning') as string}
        />
      )}
      <FieldRow
        name="category"
        label={t('editor.basic.category') as string}
        as={Autocomplete}
        options={allCategories || []}
        busy={allCategories === null}
      />
      <FieldRow
        name="webpageUrl"
        label={t('editor.basic.homePage') as string}
      />
      <FieldRow
        name="facebookUrl"
        label={t('editor.basic.facebook') as string}
      />
      <FieldRow
        name="location"
        label={t('editor.basic.location') as string}
      />
      <FieldRow
        name="description"
        label={t('editor.basic.description') as string}
        help={t('editor.basic.markdown') as string}
        as={Textarea}
        rows={8}
      />
    </div>
  );
};

export default BasicDetailsTab;
