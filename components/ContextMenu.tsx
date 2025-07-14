'use client';

import React from 'react';

interface MenuItem {
  label: string;
  action: () => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  return (
    <div
      className="absolute z-50 bg-white rounded-md border border-gray-200 border-solid shadow-lg"
      style={{ top: y, left: x }}
      onClick={onClose}
    >
      <ul>
        {items.map((item, index) => (
          <li
            key={index}
            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            onClick={item.action}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContextMenu;
