import React from "react";
import { CommandPaletteProvider } from "@/contexts/CommandPaletteContext";

export default function TemplateBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CommandPaletteProvider>
      <div className="overflow-hidden w-full h-full">{children}</div>
    </CommandPaletteProvider>
  );
}
