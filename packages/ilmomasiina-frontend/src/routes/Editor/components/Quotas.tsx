import React from 'react';

import { useField } from 'formik';
import {
  Button, Col, Form, Row,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { SortEnd } from 'react-sortable-hoc';

import { FieldRow } from '@tietokilta/ilmomasiina-components';
import { EditorQuota } from '../../../modules/editor/types';
import Sortable from './Sortable';

const Quotas = () => {
  const [{ value: quotas }, , { setValue }] = useField<EditorQuota[]>('quotas');
  const { t } = useTranslation();

  function addQuota() {
    setValue([
      ...quotas,
      {
        key: `new-${Math.random()}`,
        title: '',
        size: null,
      },
    ]);
  }

  function updateOrder({ newIndex, oldIndex }: SortEnd) {
    const newQuotas = quotas.slice();
    const [elementToMove] = newQuotas.splice(oldIndex, 1);
    newQuotas.splice(newIndex, 0, elementToMove);
    setValue(newQuotas);
  }

  const quotaItems = quotas.map((quota, index) => {
    const thisQuota = quota.key;

    function updateField<F extends keyof EditorQuota>(field: F, value: EditorQuota[F]) {
      setValue(quotas.map((item) => {
        if (item.key === thisQuota) {
          if (field === 'size' && !value) {
            return {
              ...item,
              [field]: null,
            };
          }
          return {
            ...item,
            [field]: value,
          };
        }
        return item;
      }));
    }

    function removeQuota() {
      setValue(quotas.filter((_quota, i) => i !== index));
    }

    return (
      <Row key={quota.key} className="quota-body">
        <Col xs="12" sm="10">
          <FieldRow
            name={`quota-${quota.key}-title`}
            label={t('editor.quotas.quotaName')}
            help={
              [
                quotas.length === 1 ? t('editor.quotas.quotaName.singleQuota') : '',
                index === 0 ? t('editor.quotas.quotaName.reorder') : '',
              ].filter(Boolean).join(' ')
            }
            required
          >
            <Form.Control
              type="text"
              required
              value={quota.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </FieldRow>
          <FieldRow
            name={`quota-${quota.key}-max-attendees`}
            label={t('editor.quotas.quotaSize')}
            help={t('editor.quotas.quotaSize.info')}
          >
            <Form.Control
              type="number"
              min={1}
              required
              value={quota.size || ''}
              onChange={(e) => updateField('size', Number(e.target.value))}
            />
          </FieldRow>
        </Col>
        {
          index > 0 && (
            <Col xs="12" sm="2" className="no-focus">
              <Button type="button" variant="danger" onClick={removeQuota}>
                {t('editor.quotas.deleteQuota')}
              </Button>
            </Col>
          )
        }
      </Row>
    );
  });

  return (
    <>
      <Sortable
        collection="quotas"
        items={quotaItems}
        onSortEnd={updateOrder}
        useDragHandle
      />
      <div className="text-center mb-3">
        <Button type="button" variant="primary" onClick={addQuota}>
          {t('editor.quotas.addQuota')}
        </Button>
      </div>
    </>
  );
};

export default Quotas;
