"use client";

import React, { useCallback } from "react";
import { useCommands, useActive, useChainedCommands } from "@remirror/react";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Table,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
        active
          ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
          : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--editor-active))]"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-[hsl(var(--border))] mx-1" />;
}

export function EditorToolbar() {
  const commands = useCommands();
  const active = useActive();
  const chain = useChainedCommands();

  const insertTable = useCallback(() => {
    commands.createTable({ rowsCount: 3, columnsCount: 3, withHeaderRow: true });
  }, [commands]);

  const insertImage = useCallback(() => {
    const url = window.prompt("Enter the image URL:");
    if (url) {
      commands.insertImage({ src: url });
    }
  }, [commands]);

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--editor-toolbar))]">
      {/* Headings */}
      <ToolbarButton
        onClick={() => commands.toggleHeading({ level: 1 })}
        active={active.heading({ level: 1 })}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => commands.toggleHeading({ level: 2 })}
        active={active.heading({ level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => commands.toggleHeading({ level: 3 })}
        active={active.heading({ level: 3 })}
        title="Heading 3"
      >
        <Heading3 size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Text formatting */}
      <ToolbarButton
        onClick={() => commands.toggleBold()}
        active={active.bold()}
        title="Bold (Ctrl+B)"
      >
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => commands.toggleItalic()}
        active={active.italic()}
        title="Italic (Ctrl+I)"
      >
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => commands.toggleUnderline()}
        active={active.underline()}
        title="Underline (Ctrl+U)"
      >
        <Underline size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => commands.toggleBulletList()}
        active={active.bulletList()}
        title="Unordered List"
      >
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => commands.toggleOrderedList()}
        active={active.orderedList()}
        title="Ordered List"
      >
        <ListOrdered size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => commands.toggleTaskList()}
        active={active.taskList()}
        title="Checkbox List"
      >
        <CheckSquare size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => commands.leftAlign()}
        title="Align Left"
      >
        <AlignLeft size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => commands.centerAlign()}
        title="Align Center"
      >
        <AlignCenter size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => commands.rightAlign()}
        title="Align Right"
      >
        <AlignRight size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => commands.justifyAlign()}
        title="Justify"
      >
        <AlignJustify size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Insert */}
      <ToolbarButton onClick={insertTable} title="Insert Table">
        <Table size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={insertImage} title="Insert Image">
        <ImageIcon size={16} />
      </ToolbarButton>
    </div>
  );
}
