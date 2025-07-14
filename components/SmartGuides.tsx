import React from 'react';

interface SmartGuidesProps {
  horizontalGuides: number[];
  verticalGuides: number[];
}

const SmartGuides: React.FC<SmartGuidesProps> = ({ horizontalGuides, verticalGuides }) => {
  return (
    <>
      {horizontalGuides.map((top) => (
        <div
          key={`h-guide-${top}`}
          className="absolute bg-red-500"
          style={{ top, left: 0, width: '100%', height: 1 }}
        />
      ))}
      {verticalGuides.map((left) => (
        <div
          key={`v-guide-${left}`}
          className="absolute bg-red-500"
          style={{ left, top: 0, height: '100%', width: 1 }}
        />
      ))}
    </>
  );
};

export default SmartGuides;
