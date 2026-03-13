"use client";

import { cn } from "@/lib/utils";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function MobileSidebar({ open, onClose, children }: MobileSidebarProps) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}
      {/* Slide-in panel */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[320px] bg-background border-r border-border transform transition-transform duration-300 ease-in-out md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {children}
      </div>
    </>
  );
}
