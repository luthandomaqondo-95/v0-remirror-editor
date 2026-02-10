"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRemirrorContext } from "@remirror/react";
import { Sparkles, Send, X } from "lucide-react";
import {
  useSelectionCapture,
  type SelectionContext,
} from "./use-selection-context";

/**
 * A bottom-anchored bar that appears at the base of the editor area when
 * the user has selected text.  It does NOT auto-focus so the browser
 * selection highlight stays visible.
 */
export function InlineAIPopup() {
  const { view } = useRemirrorContext();
  const { capture } = useSelectionCapture();
  const [selectionCtx, setSelectionCtx] = useState<SelectionContext | null>(
    null,
  );
  const [inputValue, setInputValue] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dismissedSelectionRef = useRef<string>("");

  // Capture selection on mouseup and keyup (Shift+Arrow selections)
  useEffect(() => {
    const editorDom = view.dom;

    const handleSelectionEnd = () => {
      requestAnimationFrame(() => {
        const ctx = capture();

        if (!ctx.hasSelection) {
          setSelectionCtx(null);
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
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
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
  }, [view, capture, dismissed]);

  // Clear when clicking collapses selection
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (popupRef.current?.contains(e.target as Node)) return;

      requestAnimationFrame(() => {
        const ctx = capture();
        if (!ctx.hasSelection) {
          setSelectionCtx(null);
          setDismissed(false);
          dismissedSelectionRef.current = "";
        }
      });
    };

    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, [capture]);

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim() || !selectionCtx) return;

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

  if (!selectionCtx?.hasSelection || dismissed) return null;

  return (
    <div
      ref={popupRef}
      className="z-30 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]"
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="flex items-center gap-2 px-4 py-2.5 max-w-4xl mx-auto">
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
          placeholder="Ask AI to edit selection..."
          className="flex-1 text-sm bg-transparent border-none outline-none text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!inputValue.trim()}
          className="flex items-center justify-center w-7 h-7 rounded-md text-[hsl(var(--primary))] hover:bg-[hsl(var(--editor-active))] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={13} />
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex items-center justify-center w-7 h-7 rounded-md text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
