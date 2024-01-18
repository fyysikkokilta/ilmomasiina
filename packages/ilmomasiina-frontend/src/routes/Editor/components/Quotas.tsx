import React, { useMemo } from 'react';

import { Button, Col, Row } from 'react-bootstrap';
import { UseFieldConfig } from 'react-final-form';
import { FieldArrayRenderProps, useFieldArray } from 'react-final-form-arrays';
import { useTranslation } from 'react-i18next';
import { SortEnd } from 'react-sortable-hoc';

import { FieldRow } from '@tietokilta/ilmomasiina-components';
import useEvent from '@tietokilta/ilmomasiina-components/dist/utils/useEvent';
import useShallowMemo from '@tietokilta/ilmomasiina-components/dist/utils/useShallowMemo';
import { EditorQuota } from '../../../modules/editor/types';
import Sortable from './Sortable';

type QuotaRowProps = {
  name: string;
  index: number;
  isOnly: boolean;
  remove: FieldArrayRenderProps<EditorQuota, HTMLElement>['fields']['remove'];
};

const numberConfig: UseFieldConfig<number> = {
  parse: (value) => Number(value),
};

const QuotaRow = ({
  name, index, isOnly, remove,
}: QuotaRowProps) => {
  const { t } = useTranslation();

  const removeThis = useEvent(() => remove(index));

  return (
    <Row className="quota-body">
      <Col xs="12" sm="10">
        <FieldRow
          name={`${name}.title`}
          label={t('editor.quotas.quotaName')}
          help={[
            isOnly ? t('editor.quotas.quotaName.singleQuota') : '',
            index === 0 ? t('editor.quotas.quotaName.reorder') : '',
          ].filter(Boolean).join(' ')}
          type="text"
          required
        />
        <FieldRow
          name={`${name}.size`}
          label={t('editor.quotas.quotaSize')}
          help={t('editor.quotas.quotaSize.info')}
          type="number"
          min={1}
          config={numberConfig}
          required
        />
      </Col>
      {index > 0 && (
        <Col xs="12" sm="2" className="no-focus">
          <Button type="button" variant="danger" onClick={removeThis}>
            {t('editor.quotas.deleteQuota')}
          </Button>
        </Col>
      )}
    </Row>
  );
};

const Quotas = () => {
  const { t } = useTranslation();

  const { fields } = useFieldArray<EditorQuota>('quotas');

  const addQuota = useEvent(() => {
    fields.push({
      key: `new-${Math.random()}`,
      title: '',
      size: null,
    });
  });

  const updateOrder = useEvent(({ newIndex, oldIndex }: SortEnd) => fields.move(oldIndex, newIndex));

  const keys = useShallowMemo(fields.value.map((item) => item.key));
  const quotaItems = useMemo(() => fields.map((name, i) => (
    <QuotaRow key={keys[i]} name={name} index={i} remove={fields.remove} isOnly={fields.length === 1} />
  // This list only invalidates when the question positions or count change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  )), [keys]);

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
