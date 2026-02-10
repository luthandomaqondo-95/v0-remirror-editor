"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRemirrorContext } from "@remirror/react";
import { Sparkles, Send, X } from "lucide-react";
import { useSelectionContext } from "./use-selection-context";

/**
 * A floating popup that appears just above the selected text in the editor.
 * Contains an input field for future inline AI edits.
 * Currently captures selection context for passing to AI.
 */
export function InlineAIPopup() {
  const { view } = useRemirrorContext();
  const selectionCtx = useSelectionContext();
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dismissedSelectionRef = useRef<string>("");

  // Calculate popup position based on selection coordinates
  useEffect(() => {
    if (!selectionCtx.hasSelection) {
      setPopupPos(null);
      setDismissed(false);
      dismissedSelectionRef.current = "";
      return;
    }

    // If user dismissed this particular selection, don't show again
    if (dismissed && dismissedSelectionRef.current === selectionCtx.selectedText) {
      return;
    }

    // Reset dismissed state if selection changed
    if (dismissedSelectionRef.current !== selectionCtx.selectedText) {
      setDismissed(false);
      dismissedSelectionRef.current = "";
    }

    try {
      const { state } = view;
      const { from } = state.selection;
      const coords = view.coordsAtPos(from);
      const editorRect = view.dom.closest(".overflow-auto")?.getBoundingClientRect();

      if (coords && editorRect) {
        setPopupPos({
          top: coords.top - editorRect.top - 52, // above the selection
          left: Math.max(8, coords.left - editorRect.left),
        });
      }
    } catch {
      setPopupPos(null);
    }
  }, [selectionCtx, view, dismissed]);

  // Focus input when popup appears
  useEffect(() => {
    if (popupPos && inputRef.current && !dismissed) {
      // small delay to avoid stealing focus from the selection
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [popupPos, dismissed]);

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim()) return;

    // This is the callback point where you would pass to AI chat.
    // For now we log the context for integration.
    console.log("Inline AI edit request:", {
      prompt: inputValue,
      selection: selectionCtx,
    });

    // Dispatch a custom event that the ChatPanel can listen to
    window.dispatchEvent(
      new CustomEvent("editor-ai-request", {
        detail: {
          prompt: inputValue,
          selection: selectionCtx,
        },
      }),
    );

    setInputValue("");
    setDismissed(true);
    dismissedSelectionRef.current = selectionCtx.selectedText;
  }, [inputValue, selectionCtx]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    dismissedSelectionRef.current = selectionCtx.selectedText;
  }, [selectionCtx]);

  if (!selectionCtx.hasSelection || !popupPos || dismissed) return null;

  return (
    <div
      ref={popupRef}
      className="absolute z-30 transition-opacity duration-150"
      style={{ top: popupPos.top, left: popupPos.left }}
      // Prevent clicks from removing editor selection
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="flex items-center gap-1.5 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-lg px-2 py-1.5">
        <Sparkles
          size={14}
          className="text-[hsl(var(--primary))] flex-shrink-0"
        />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
            if (e.key === "Escape") {
              handleDismiss();
            }
          }}
          placeholder="Ask AI to edit..."
          className="text-sm bg-transparent border-none outline-none text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] w-48"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!inputValue.trim()}
          className="flex items-center justify-center w-6 h-6 rounded text-[hsl(var(--primary))] hover:bg-[hsl(var(--editor-active))] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={12} />
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex items-center justify-center w-6 h-6 rounded text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
