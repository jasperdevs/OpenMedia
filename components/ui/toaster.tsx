"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      theme="dark"
      toastOptions={{
        style: {
          background: "#111",
          border: "1px solid #262626",
          color: "#e5e5e5",
        },
      }}
    />
  );
}
