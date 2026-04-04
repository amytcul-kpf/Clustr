"use client";

import { AppState } from "@/lib/types";

interface ProcessingStatusProps {
  state: AppState;
  fileCount: number;
  fileNames: string[];
}

export default function ProcessingStatus({
  state,
  fileCount,
  fileNames,
}: ProcessingStatusProps) {
  if (state === "upload" || state === "results") return null;

  const stages = [
    { key: "extracting", label: "Extracting text from PDFs" },
    { key: "synthesizing", label: "Synthesizing themes with Claude" },
  ];

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6 p-8">
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full border-4 border-accent/30 border-t-accent animate-spin" />
        <p className="text-lg font-medium text-foreground mt-4">
          Analyzing {fileCount} PDF{fileCount !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="w-full flex flex-col gap-3">
        {stages.map((stage) => {
          const isActive = state === stage.key;
          const isDone =
            stage.key === "extracting" && state === "synthesizing";

          return (
            <div
              key={stage.key}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : isDone
                  ? "bg-accent-tertiary/10 text-accent-tertiary"
                  : "text-text-muted"
              }`}
            >
              {isDone ? (
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : isActive ? (
                <div className="w-5 h-5 flex-shrink-0 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
              ) : (
                <div className="w-5 h-5 flex-shrink-0 rounded-full border-2 border-text-muted/30" />
              )}
              <span className="text-sm font-medium">{stage.label}</span>
            </div>
          );
        })}
      </div>

      <div className="w-full mt-2">
        <p className="text-xs text-text-muted mb-2">Files:</p>
        <div className="flex flex-wrap gap-1.5">
          {fileNames.map((name) => (
            <span
              key={name}
              className="px-2 py-0.5 text-xs bg-surface rounded-md text-text-dim truncate max-w-[200px]"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
