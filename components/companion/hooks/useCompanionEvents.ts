"use client";

/**
 * useCompanionEvents — bridges the existing global custom-event bus so every
 * existing window.dispatchEvent(new CustomEvent("toggle-aira")) call across
 * CommandPalette, other components, and external scripts continues to work
 * without modification.
 *
 * Events consumed:
 *   toggle-chat      → toggle()
 *   toggle-aira      → toggle()
 *   toggle-notebook  → open()   (CompanionChat renders notebook tab on open)
 *   close-all-panels → close()
 *
 * Note: `aira-prefill` is handled inside CompanionChat directly (populates
 * the input field), not here.
 */

import { useEffect } from "react";

interface UseCompanionEventsProps {
  open:   () => void;
  close:  () => void;
  toggle: () => void;
}

export function useCompanionEvents({
  open,
  close,
  toggle,
}: UseCompanionEventsProps): void {
  useEffect(() => {
    const onToggleChat     = () => toggle();
    const onToggleAira     = () => toggle();
    const onToggleNotebook = () => open();
    const onCloseAll       = () => close();

    window.addEventListener("toggle-chat",      onToggleChat);
    window.addEventListener("toggle-aira",      onToggleAira);
    window.addEventListener("toggle-notebook",  onToggleNotebook);
    window.addEventListener("close-all-panels", onCloseAll);

    return () => {
      window.removeEventListener("toggle-chat",      onToggleChat);
      window.removeEventListener("toggle-aira",      onToggleAira);
      window.removeEventListener("toggle-notebook",  onToggleNotebook);
      window.removeEventListener("close-all-panels", onCloseAll);
    };
  }, [open, close, toggle]);
}
