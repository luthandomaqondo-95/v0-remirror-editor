"use client";

import { useMemo } from "react";
import { useHelpers, useEditorState } from "@remirror/react";

export interface SelectionContext {
  /** Is there a non-empty selection? */
  hasSelection: boolean;
  /** ProseMirror from position */
  from: number;
  /** ProseMirror to position */
  to: number;
  /** The plain text of the selection */
  selectedText: string;
  /** The markdown of the selection (best-effort extraction) */
  selectedMarkdown: string;
  /** Full document markdown */
  fullMarkdown: string;
  /** Character offset of the selection start within the full markdown */
  markdownFrom: number;
  /** Character offset of the selection end within the full markdown */
  markdownTo: number;
  /** Context: a few lines before and after the selection in markdown */
  surroundingContext: string;
}

/**
 * Hook that captures the current editor selection and maps it to positions
 * in the full markdown output. Designed for passing to an AI chat component.
 */
export function useSelectionContext(): SelectionContext {
  const state = useEditorState({ update: true });
  const helpers = useHelpers(true);

  return useMemo(() => {
    const { from, to, empty } = state.selection;

    let fullMarkdown = "";
    try {
      fullMarkdown = helpers.getMarkdown() || "";
    } catch {
      fullMarkdown = "";
    }

    if (empty) {
      return {
        hasSelection: false,
        from,
        to,
        selectedText: "",
        selectedMarkdown: "",
        fullMarkdown,
        markdownFrom: -1,
        markdownTo: -1,
        surroundingContext: "",
      };
    }

    // Get plain text of the selection
    const selectedText = state.doc.textBetween(from, to, "\n", "\n");

    // Map selected text to markdown position
    const selectedLines = selectedText
      .split("\n")
      .filter((l) => l.trim());
    const mdLines = fullMarkdown.split("\n");

    let selectedMarkdown = "";
    let markdownFrom = -1;
    let markdownTo = -1;

    if (selectedLines.length > 0) {
      const firstLine = selectedLines[0].trim();
      const lastLine = selectedLines[selectedLines.length - 1].trim();

      let startLineIdx = -1;
      let endLineIdx = -1;

      for (let i = 0; i < mdLines.length; i++) {
        if (startLineIdx === -1 && mdLines[i].includes(firstLine)) {
          startLineIdx = i;
        }
        if (startLineIdx !== -1 && mdLines[i].includes(lastLine)) {
          endLineIdx = i;
        }
      }

      if (startLineIdx !== -1 && endLineIdx !== -1) {
        selectedMarkdown = mdLines
          .slice(startLineIdx, endLineIdx + 1)
          .join("\n");

        // Calculate character positions
        let charPos = 0;
        for (let i = 0; i < startLineIdx; i++) {
          charPos += mdLines[i].length + 1; // +1 for \n
        }
        markdownFrom = charPos;
        markdownTo = charPos + selectedMarkdown.length;
      } else {
        selectedMarkdown = selectedText;
      }
    }

    // Build surrounding context (3 lines before and after)
    const contextPadding = 3;
    const allLines = fullMarkdown.split("\n");
    let startCtx = 0;
    let endCtx = allLines.length;

    if (markdownFrom >= 0) {
      // Find the line index of markdownFrom
      let charCount = 0;
      for (let i = 0; i < allLines.length; i++) {
        if (charCount >= markdownFrom) {
          startCtx = Math.max(0, i - contextPadding);
          break;
        }
        charCount += allLines[i].length + 1;
      }
      charCount = 0;
      for (let i = 0; i < allLines.length; i++) {
        charCount += allLines[i].length + 1;
        if (charCount >= markdownTo) {
          endCtx = Math.min(allLines.length, i + contextPadding + 1);
          break;
        }
      }
    }

    const surroundingContext = allLines.slice(startCtx, endCtx).join("\n");

    return {
      hasSelection: true,
      from,
      to,
      selectedText,
      selectedMarkdown,
      fullMarkdown,
      markdownFrom,
      markdownTo,
      surroundingContext,
    };
  }, [state, helpers]);
}
