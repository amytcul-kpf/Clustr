"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

const MAX_FILES = 20;

interface PdfDropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  disabled?: boolean;
}

export default function PdfDropzone({
  onFilesAccepted,
  disabled,
}: PdfDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const pdfFiles = acceptedFiles
        .filter((f) => f.type === "application/pdf")
        .slice(0, MAX_FILES);
      if (pdfFiles.length > 0) {
        onFilesAccepted(pdfFiles);
      }
    },
    [onFilesAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: MAX_FILES,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative flex flex-col items-center justify-center
        w-full max-w-2xl mx-auto p-12
        border-2 border-dashed rounded-2xl
        transition-all duration-200 cursor-pointer
        ${
          isDragActive
            ? "border-accent bg-accent/10 scale-[1.02]"
            : "border-border hover:border-text-muted hover:bg-surface-hover/50"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center">
          <svg
            className="w-8 h-8 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>

        {isDragActive ? (
          <p className="text-lg font-medium text-accent">
            Drop your PDFs here...
          </p>
        ) : (
          <>
            <p className="text-lg font-medium text-foreground">
              Drag & drop PDF summaries here
            </p>
            <p className="text-sm text-text-dim">
              or click to browse — up to {MAX_FILES} files
            </p>
          </>
        )}
      </div>
    </div>
  );
}
