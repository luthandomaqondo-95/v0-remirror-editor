"use client";

import React, { useCallback, useState } from "react";
import { Remirror, useRemirror } from "@remirror/react";
import {
  BoldExtension,
  ItalicExtension,
  UnderlineExtension,
  HeadingExtension,
  BulletListExtension,
  OrderedListExtension,
  TaskListExtension,
  ImageExtension,
  MarkdownExtension,
  HardBreakExtension,
  LinkExtension,
  PlaceholderExtension,
  NodeFormattingExtension,
  TableExtension,
  BlockquoteExtension,
  CodeExtension,
  CodeBlockExtension,
  HorizontalRuleExtension,
  DropCursorExtension,
  GapCursorExtension,
  StrikeExtension,
} from "remirror/extensions";
import { EditorToolbar } from "./editor-toolbar";
import { MarkdownSelectionPanel } from "./markdown-selection-panel";
import { PanelLeft, PanelLeftClose } from "lucide-react";

import "remirror/styles/all.css";

const INITIAL_MARKDOWN = `# Welcome to the Document Editor

This is a **rich text editor** built with _Remirror_ and the Markdown extension.

## Features

You can use the toolbar above or markdown shortcuts to format your content:

- **Bold** text with \`Ctrl+B\`
- *Italic* text with \`Ctrl+I\`
- __Underline__ text with \`Ctrl+U\`

### Ordered Lists

1. First item
2. Second item
3. Third item

### Task List

- [ ] Unchecked task
- [x] Completed task

> This is a blockquote for important callouts.

---

Select any text and check the **Markdown Output** panel on the right to see the markdown representation of your selection.
`;

/**
 * All children of <Remirror> share the editor context.
 * Toolbar + Markdown panel both live here as context consumers.
 * The actual editable area is auto-rendered by Remirror via autoRender.
 */
function EditorChildren({ showPanel }: { showPanel: boolean }) {
  return (
    <>
      {/* Toolbar sits above the auto-rendered editor area */}
      <EditorToolbar />

      {/* We use a portal-style approach: the markdown panel is an absolutely
          positioned overlay on the right side, so it visually sits beside
          the editor but is still a child of the Remirror context. */}
      {showPanel && (
        <div
          className="hidden lg:flex fixed right-0 top-[calc(49px+1px)] bottom-0 w-[360px] z-10"
          style={{ pointerEvents: "auto" }}
        >
          <MarkdownSelectionPanel />
        </div>
      )}
    </>
  );
}

export function DocumentEditor() {
  const [showPanel, setShowPanel] = useState(true);

  const { manager, state, onChange } = useRemirror({
    extensions: () => [
      new MarkdownExtension({ copyAsMarkdown: false }),
      new BoldExtension(),
      new ItalicExtension(),
      new UnderlineExtension(),
      new HeadingExtension(),
      new BulletListExtension(),
      new OrderedListExtension(),
      new TaskListExtension(),
      new ImageExtension({ enableResizing: true }),
      new HardBreakExtension(),
      new LinkExtension({ autoLink: true }),
      new PlaceholderExtension({ placeholder: "Start writing..." }),
      new NodeFormattingExtension(),
      new TableExtension(),
      new BlockquoteExtension(),
      new CodeExtension(),
      new CodeBlockExtension(),
      new HorizontalRuleExtension(),
      new DropCursorExtension(),
      new GapCursorExtension(),
      new StrikeExtension(),
    ],
    content: INITIAL_MARKDOWN,
    stringHandler: "markdown",
  });

  const togglePanel = useCallback(() => {
    setShowPanel((prev) => !prev);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[hsl(var(--background))]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center">
            <span className="text-sm font-bold text-[hsl(var(--primary-foreground))]">
              D
            </span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Document Editor
            </h1>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Markdown-powered rich text editing
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={togglePanel}
          title={showPanel ? "Hide markdown panel" : "Show markdown panel"}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors cursor-pointer"
        >
          {showPanel ? (
            <PanelLeftClose size={16} />
          ) : (
            <PanelLeft size={16} />
          )}
          <span className="hidden sm:inline">
            {showPanel ? "Hide" : "Show"} Markdown
          </span>
        </button>
      </header>

      {/* Single Remirror instance - autoRender places the editor after children */}
      <div
        className={`remirror-theme flex-1 overflow-hidden ${
          showPanel ? "lg:mr-[360px]" : ""
        }`}
      >
        <Remirror
          manager={manager}
          initialContent={state}
          onChange={onChange}
          autoRender="end"
          classNames={[
            "remirror-editor-wrapper",
            "h-full",
            "flex",
            "flex-col",
          ]}
        >
          <EditorChildren showPanel={showPanel} />
        </Remirror>
      </div>
    </div>
  );
}
