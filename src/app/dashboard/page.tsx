"use client";

import dynamic from "next/dynamic";

const DocumentEditor = dynamic(
    () =>
        import("@/components/editor-remirror/document-editor").then(
            (mod) => mod.DocumentEditor
        ),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-screen bg-[hsl(var(--background))]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center animate-pulse">
                        <span className="text-lg font-bold text-[hsl(var(--primary-foreground))]">
                            D
                        </span>
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Loading editor...
                    </p>
                </div>
            </div>
        ),
    }
);

export default function DashboardPage() {
    return <DocumentEditor />;
}

