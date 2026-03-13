"use client";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirm({ open, onCancel, onConfirm }: DeleteConfirmProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="max-w-sm">
        <DialogTitle>Delete generation?</DialogTitle>
        <DialogDescription>This will permanently delete the file. This cannot be undone.</DialogDescription>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={onConfirm}>Delete</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
