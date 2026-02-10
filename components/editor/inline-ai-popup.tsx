"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRemirrorContext } from "@remirror/react";
import { Sparkles, Send, X } from "lucide-react";
import {
  useSelectionCapture,
  type SelectionContext,
} from "./use-selection-context";

/**
 * A floating popup that appears just above the selected text in the editor.
 * Contains an input field for future inline AI edits.
 * Selection is only captured on mouseup / keyup so the cursor never jumps
 * while the user is still dragging.
 */
export function InlineAIPopup() {
  const { view } = useRemirrorContext();
  const { capture } = useSelectionCapture();
  const [selectionCtx, setSelectionCtx] = useState<SelectionContext | null>(
    null,
  );
  const [popupPos, setPopupPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dismissedSelectionRef = useRef<string>("");

  // Position the popup for a given selection context
  const positionPopup = useCallback(
    (ctx: SelectionContext) => {
      if (!ctx.hasSelection) {
        setPopupPos(null);
        return;
      }
      try {
        const coords = view.coordsAtPos(ctx.from);
        const editorRect = view.dom
          .closest(".overflow-auto")
          ?.getBoundingClientRect();

        if (coords && editorRect) {
          setPopupPos({
            top: coords.top - editorRect.top - 52,
            left: Math.max(8, coords.left - editorRect.left),
          });
        }
      } catch {
        setPopupPos(null);
      }
    },
    [view],
  );

  // Capture selection on mouseup and keyup (Shift+Arrow selections)
  useEffect(() => {
    const editorDom = view.dom;

    const handleSelectionEnd = () => {
      // Use requestAnimationFrame to let the browser finalize the selection
      requestAnimationFrame(() => {
        const ctx = capture();

        if (!ctx.hasSelection) {
          setSelectionCtx(null);
          setPopupPos(null);
          setDismissed(false);
          dismissedSelectionRef.current = "";
          return;
        }

        // If user dismissed this particular selection, don't re-show
        if (
          dismissed &&
          dismissedSelectionRef.current === ctx.selectedText
        ) {
          return;
        }

        // If selection changed, reset dismissed state
        if (dismissedSelectionRef.current !== ctx.selectedText) {
          setDismissed(false);
          dismissedSelectionRef.current = "";
        }

        setSelectionCtx(ctx);
        positionPopup(ctx);
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Only trigger on shift+arrow or other selection-related keys
      if (e.shiftKey || e.key === "Escape") {
        handleSelectionEnd();
      }
    };

    editorDom.addEventListener("mouseup", handleSelectionEnd);
    editorDom.addEventListener("keyup", handleKeyUp);

    return () => {
      editorDom.removeEventListener("mouseup", handleSelectionEnd);
      editorDom.removeEventListener("keyup", handleKeyUp);
    };
  }, [view, capture, positionPopup, dismissed]);

  // Clear popup when clicking in the editor collapses the selection
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      // If clicking inside the popup itself, don't clear
      if (popupRef.current?.contains(e.target as Node)) return;

      // After a click that isn't a selection, check if selection collapsed
      requestAnimationFrame(() => {
        const ctx = capture();
        if (!ctx.hasSelection) {
          setSelectionCtx(null);
          setPopupPos(null);
          setDismissed(false);
          dismissedSelectionRef.current = "";
        }
      });
    };

    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, [capture]);

  // Focus input when popup first appears (not during drag)
  useEffect(() => {
    if (popupPos && selectionCtx?.hasSelection && inputRef.current && !dismissed) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [popupPos, selectionCtx?.hasSelection, dismissed]);

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim() || !selectionCtx) return;

    console.log("Inline AI edit request:", {
      prompt: inputValue,
      selection: selectionCtx,
    });

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
    if (selectionCtx) {
      dismissedSelectionRef.current = selectionCtx.selectedText;
    }
  }, [selectionCtx]);

  if (!selectionCtx?.hasSelection || !popupPos || dismissed) return null;

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
