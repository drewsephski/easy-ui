"use client";

import React from "react";
import { CommandPaletteProvider } from "@/contexts/CommandPaletteContext";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function TemplateBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DndProvider backend={HTML5Backend}>
      <CommandPaletteProvider>
        <div className="overflow-hidden w-full h-full">{children}</div>
      </CommandPaletteProvider>
    </DndProvider>
  );
}
