"use client";

import { GraphNode, getCategoryColor } from "@/lib/types";

interface DetailPanelProps {
  node: GraphNode | null;
  pdfNames: string[];
  onClose: () => void;
}

export default function DetailPanel({
  node,
  pdfNames,
  onClose,
}: DetailPanelProps) {
  if (!node) return null;

  const categoryColor = getCategoryColor(node.category);

  return (
    <div className="absolute top-4 right-4 w-80 max-h-[calc(100%-2rem)] bg-surface/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl overflow-y-auto z-50">
      <div className="sticky top-0 bg-surface/95 backdrop-blur-sm border-b border-border p-4 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: categoryColor }}
            />
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: categoryColor + "20",
                color: categoryColor,
              }}
            >
              {node.category}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-foreground truncate">
            {node.label}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-surface-hover text-text-muted hover:text-foreground transition-colors flex-shrink-0 ml-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <div>
          <p className="text-sm text-foreground/90 leading-relaxed">
            {node.description}
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Importance
          </h4>
          <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${node.importance * 100}%`,
                backgroundColor: categoryColor,
              }}
            />
          </div>
          <p className="text-xs text-text-dim mt-1">
            {Math.round(node.importance * 100)}%
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Keywords
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {node.keywords.map((kw) => (
              <span
                key={kw}
                className="px-2 py-0.5 text-xs bg-surface-hover rounded-md text-text-dim"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Source PDFs
          </h4>
          <div className="flex flex-col gap-1">
            {node.sourcePdfs.map((idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-2 py-1.5 bg-surface-hover rounded-md"
              >
                <svg
                  className="w-3.5 h-3.5 text-accent flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                <span className="text-xs text-text-dim truncate">
                  {pdfNames[idx] || `PDF ${idx + 1}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
