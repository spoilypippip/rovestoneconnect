"use client";

import { useEffect, type RefObject } from "react";

// Shared by the account menu, currency menu, and mobile nav sheet - each is a
// small popover that should close on an outside click or Escape.
export function useClickOutside(ref: RefObject<HTMLElement | null>, onOutside: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    function handlePointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutside();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOutside();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref, onOutside, enabled]);
}
