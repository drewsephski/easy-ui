"use client";

import { useState } from 'react';
import TemplateBuilder from './TemplateBuilder';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BetaModal } from '@/components/BetaModal';

export default function TemplateBuilderPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <DndProvider backend={HTML5Backend}>
      <TemplateBuilder />
      <BetaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </DndProvider>
  );
}
