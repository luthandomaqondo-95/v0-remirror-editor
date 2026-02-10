"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, Copy, Check, FileCode2 } from "lucide-react";
import {
  useSelectionCapture,
  type SelectionContext,
} from "./use-selection-context";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** If this message was sent with a selection, store it */
  selectionContext?: {
    selectedMarkdown: string;
    markdownFrom: number;
    markdownTo: number;
  };
}

/**
 * Cursor-style side chat panel.
 * Top section shows the current selection context (markdown).
 * Below is a chat message list and an input to interact with AI.
 */
export function ChatPanel() {
  const { capture } = useSelectionCapture();
  const [selectionCtx, setSelectionCtx] = useState<SelectionContext | null>(
    null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Capture selection on mouseup so the chat panel stays in sync
  useEffect(() => {
    const handleSelectionChange = () => {
      requestAnimationFrame(() => {
        const ctx = capture();
        setSelectionCtx(ctx.hasSelection ? ctx : null);
      });
    };

    document.addEventListener("mouseup", handleSelectionChange);
    document.addEventListener("keyup", handleSelectionChange);
    return () => {
      document.removeEventListener("mouseup", handleSelectionChange);
      document.removeEventListener("keyup", handleSelectionChange);
    };
  }, [capture]);

  // Listen for inline AI popup events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.prompt && detail?.selection) {
        const msg: ChatMessage = {
          id: Date.now().toString(),
          role: "user",
          content: detail.prompt,
          selectionContext: {
            selectedMarkdown: detail.selection.selectedMarkdown,
            markdownFrom: detail.selection.markdownFrom,
            markdownTo: detail.selection.markdownTo,
          },
        };
        setMessages((prev) => [...prev, msg]);

        // Simulate assistant response placeholder
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: `I received your request to edit the selected text. The selection context (markdown positions ${detail.selection.markdownFrom}-${detail.selection.markdownTo}) has been captured. AI integration will process this in a future update.`,
            },
          ]);
        }, 500);
      }
    };
    window.addEventListener("editor-ai-request", handler);
    return () => window.removeEventListener("editor-ai-request", handler);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;

    const msg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      selectionContext: selectionCtx?.hasSelection
        ? {
            selectedMarkdown: selectionCtx.selectedMarkdown,
            markdownFrom: selectionCtx.markdownFrom,
            markdownTo: selectionCtx.markdownTo,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, msg]);
    setInputValue("");

    // Placeholder assistant response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: selectionCtx?.hasSelection
            ? `Noted. I see you've selected text at markdown positions ${selectionCtx.markdownFrom}-${selectionCtx.markdownTo}. AI processing will be connected here.`
            : "I can help you edit the document. Select some text first for targeted edits, or ask me anything about the content.",
        },
      ]);
    }, 500);
  }, [inputValue, selectionCtx]);

  const handleCopy = useCallback(async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--card))] border-l border-[hsl(var(--border))]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--editor-toolbar))]">
        <Sparkles size={16} className="text-[hsl(var(--primary))]" />
        <span className="text-sm font-medium text-[hsl(var(--foreground))]">
          AI Chat
        </span>
      </div>

      {/* Selection context preview (Cursor-style) */}
      {selectionCtx?.hasSelection && (
        <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
          <div className="flex items-center gap-2 px-3 py-2">
            <FileCode2
              size={13}
              className="text-[hsl(var(--muted-foreground))] flex-shrink-0"
            />
            <span className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
              Selection Context
            </span>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))] ml-auto">
              pos {selectionCtx.markdownFrom}-{selectionCtx.markdownTo}
            </span>
          </div>
          <div className="px-3 pb-2 max-h-[140px] overflow-auto">
            <pre className="text-xs font-mono leading-relaxed text-[hsl(var(--foreground))] whitespace-pre-wrap break-words bg-[hsl(var(--card))] rounded-md p-2 border border-[hsl(var(--border))]">
              {selectionCtx.selectedMarkdown || selectionCtx.selectedText}
            </pre>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-auto px-3 py-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-4">
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center">
              <Sparkles
                size={20}
                className="text-[hsl(var(--muted-foreground))]"
              />
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
              Select text in the editor and ask AI to edit it, or type a
              question about your document.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-1">
                {/* Selection badge */}
                {msg.selectionContext && (
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <FileCode2
                      size={11}
                      className="text-[hsl(var(--muted-foreground))]"
                    />
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                      Selection: pos{" "}
                      {msg.selectionContext.markdownFrom}-
                      {msg.selectionContext.markdownTo}
                    </span>
                  </div>
                )}

                <div
                  className={`rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] ml-6"
                      : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] mr-6"
                  }`}
                >
                  {msg.content}
                </div>

                {/* Copy button for assistant messages */}
                {msg.role === "assistant" && (
                  <button
                    type="button"
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="flex items-center gap-1 self-start ml-1 text-[10px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors cursor-pointer"
                  >
                    {copiedId === msg.id ? (
                      <Check size={10} />
                    ) : (
                      <Copy size={10} />
                    )}
                    {copiedId === msg.id ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[hsl(var(--border))] p-3">
        <div className="flex items-end gap-2 bg-[hsl(var(--muted))] rounded-lg px-3 py-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              selectionCtx?.hasSelection
                ? "Ask AI about the selection..."
                : "Ask AI about the document..."
            }
            rows={1}
            className="flex-1 text-sm bg-transparent border-none outline-none resize-none text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] max-h-[80px]"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="flex items-center justify-center w-7 h-7 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send size={13} />
          </button>
        </div>
        {selectionCtx?.hasSelection && (
          <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1.5 px-1">
            Context attached: {selectionCtx.selectedText.slice(0, 50)}
            {selectionCtx.selectedText.length > 50 ? "..." : ""}
          </p>
        )}
      </div>
    </div>
  );
}
