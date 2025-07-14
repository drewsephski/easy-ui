import React from 'react';
import { useDragLayer, XYCoord } from 'react-dnd';
import { COMPONENT_MAP } from '@/app/template-builder/component-mapping';

const layerStyles: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

function getItemStyles(initialOffset: XYCoord | null, currentOffset: XYCoord | null) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }

  const { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

export const CustomDragLayer = () => {
  const { itemType, isDragging, item, initialOffset, currentOffset } = useDragLayer(
    (monitor) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    })
  );

  if (!isDragging) {
    return null;
  }

  const renderPreview = () => {
    if (!itemType) return null;

    const componentDef = COMPONENT_MAP[item.id];
    if (!componentDef) {
      return (
        <div className="flex items-center p-2 text-white bg-indigo-600 rounded shadow-lg">
          {item.id}
        </div>
      );
    }

    const { icon: Icon, displayName } = componentDef;
    return (
      <div className="flex gap-2 items-center px-3 py-2 text-white bg-indigo-600 rounded-lg border border-indigo-500 border-solid shadow-2xl">
        <Icon width={20} height={20} />
        <span className="font-semibold">{displayName}</span>
      </div>
    );
  };

  return (
    <div style={layerStyles}>
      <div style={getItemStyles(initialOffset, currentOffset)}>
        {renderPreview()}
      </div>
    </div>
  );
};
