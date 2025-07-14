"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BetaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BetaModal({ isOpen, onClose }: BetaModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to the Beta!</DialogTitle>
          <DialogDescription>
            The template builder is a new feature and may have bugs or undergo
            changes. We appreciate your feedback!
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose}>Got it, let's build!</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
