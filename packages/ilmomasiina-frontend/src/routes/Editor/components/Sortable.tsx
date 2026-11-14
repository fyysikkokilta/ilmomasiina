import React, { ComponentType } from "react";

import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { Card } from "react-bootstrap";

type SortableItemProps = {
  id: string;
  name: string;
};

type SortableItemComponentProps = SortableItemProps & {
  index: number;
};

type SortableRowProps = SortableItemComponentProps & {
  component: ComponentType<SortableItemComponentProps>;
};

const SortableRow = ({ id, index, name, component: Component }: SortableRowProps) => {
  const { ref, handleRef, isDragging } = useSortable({ id, index });
  return (
    <Card
      ref={ref}
      // Set .ilmo--form to keep styling of form elements
      className={`sortable-item ${isDragging ? "sorting" : ""} ilmo--form`}
    >
      <span ref={handleRef} className="handler" />
      <Component id={id} index={index} name={name} />
    </Card>
  );
};

type SortableProps = {
  items: SortableItemProps[];
  component: ComponentType<SortableItemComponentProps>;
  move: (oldIndex: number, newIndex: number) => void;
};

export default function Sortable({ items, component, move }: SortableProps) {
  return (
    <div>
      <DragDropProvider
        onDragEnd={(event) => {
          const { source } = event.operation;
          // The library moves the dragged item while dragging; store the result when it's dropped.
          if (!event.canceled && isSortable(source) && source.initialIndex !== source.index) {
            move(source.initialIndex, source.index);
          }
        }}
      >
        {items.map((value, index) => (
          <SortableRow key={value.id} id={value.id} index={index} name={value.name} component={component} />
        ))}
      </DragDropProvider>
    </div>
  );
}
