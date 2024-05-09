import React, { ReactNode } from 'react';

import { Card } from 'react-bootstrap';
import {
  Offset,
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc';

const DragHandle = SortableHandle(() => <span className="handler" />);

type SortableItemProps = {
  value: ReactNode;
};

const SortableItem = SortableElement(({ value }: SortableItemProps) => (
  // Set .ilmo--form to keep styling of form elements
  <Card className="sortable-item ilmo--form">
    <DragHandle />
    {value}
  </Card>
));

type SortableItemsProps = {
  collection: Offset;
  items: JSX.Element[];
};

const Sortable = SortableContainer(({ collection, items }: SortableItemsProps) => (
  <div className="sortable">
    {items.map((value, index) => (
      <SortableItem
        collection={collection}
        key={value.key}
        index={index}
        value={value}
      />
    ))}
  </div>
));

export default Sortable;
