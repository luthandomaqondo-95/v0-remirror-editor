"use client";

import React, { useCallback, useState, useMemo } from "react";
import { useHelpers, useEditorState } from "@remirror/react";
import { Copy, Check, FileText, MousePointerClick } from "lucide-react";

export function MarkdownSelectionPanel() {
  const state = useEditorState({ update: true });
  const helpers = useHelpers(true);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"selection" | "full">("selection");

  // Get full document markdown
  const fullMarkdown = useMemo(() => {
    try {
      return helpers.getMarkdown() || "";
    } catch {
      return "";
    }
  }, [helpers]);

  // Get selected content as markdown
  const selectedMarkdown = useMemo(() => {
    try {
      const { from, to, empty } = state.selection;
      if (empty) return "";

      // Get full doc markdown
      const fullMd = helpers.getMarkdown(state);

      // Get plain text of selection for reference
      const selectedPlainText = state.doc.textBetween(from, to, "\n", "\n");
      if (!selectedPlainText.trim()) return "";

      // Strategy: find the selected plain text lines within the full markdown
      // and extract the markdown-formatted version
      const selectedLines = selectedPlainText.split("\n").filter((l) => l.trim());
      const mdLines = fullMd.split("\n");

      if (selectedLines.length === 0) return "";

      // Find the first selected line in the markdown
      const firstLine = selectedLines[0].trim();
      const lastLine = selectedLines[selectedLines.length - 1].trim();

      let startIdx = -1;
      let endIdx = -1;

      for (let i = 0; i < mdLines.length; i++) {
        if (startIdx === -1 && mdLines[i].includes(firstLine)) {
          startIdx = i;
        }
        if (startIdx !== -1 && mdLines[i].includes(lastLine)) {
          endIdx = i;
        }
      }

      if (startIdx !== -1 && endIdx !== -1) {
        return mdLines.slice(startIdx, endIdx + 1).join("\n");
      }

      // Fallback: return plain text with basic markdown reconstruction
      return selectedPlainText;
    } catch {
      return "";
    }
  }, [state, helpers]);

  const displayMarkdown = mode === "full" ? fullMarkdown : selectedMarkdown;
  const hasContent = displayMarkdown.length > 0;

  const handleCopy = useCallback(async () => {
    if (!hasContent) return;
    try {
      await navigator.clipboard.writeText(displayMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [displayMarkdown, hasContent]);

  return (
    <div className="flex flex-col h-full w-full bg-[hsl(var(--card))] border-l border-[hsl(var(--border))]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--editor-toolbar))]">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-[hsl(var(--muted-foreground))]" />
          <span className="text-sm font-medium text-[hsl(var(--foreground))]">
            Markdown Output
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!hasContent}
          title="Copy markdown"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            hasContent
              ? "text-[hsl(var(--primary))] hover:bg-[hsl(var(--editor-active))] cursor-pointer"
              : "text-[hsl(var(--muted-foreground))] opacity-50 cursor-not-allowed"
          }`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="flex border-b border-[hsl(var(--border))]">
        <button
          type="button"
          onClick={() => setMode("selection")}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
            mode === "selection"
              ? "text-[hsl(var(--primary))] border-b-2 border-[hsl(var(--primary))] bg-[hsl(var(--editor-active))]"
              : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          }`}
        >
          Selection
        </button>
        <button
          type="button"
          onClick={() => setMode("full")}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
            mode === "full"
              ? "text-[hsl(var(--primary))] border-b-2 border-[hsl(var(--primary))] bg-[hsl(var(--editor-active))]"
              : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          }`}
        >
          Full Document
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {hasContent ? (
          <pre className="text-sm font-mono leading-relaxed text-[hsl(var(--foreground))] whitespace-pre-wrap break-words">
            {displayMarkdown}
          </pre>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-4">
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center">
              {mode === "selection" ? (
                <MousePointerClick
                  size={20}
                  className="text-[hsl(var(--muted-foreground))]"
                />
              ) : (
                <FileText
                  size={20}
                  className="text-[hsl(var(--muted-foreground))]"
                />
              )}
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
              {mode === "selection"
                ? "Select text in the editor to see its markdown representation here"
                : "Start typing in the editor to see the full markdown output"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
