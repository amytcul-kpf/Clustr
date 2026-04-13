"use client";

import { useState, useCallback } from "react";
import {
  AppState,
  GraphData,
  GraphNode,
  SynthesisResult,
  PdfDocument,
  WordFrequency,
  getCategoryColor,
} from "@/lib/types";
import { extractTextFromPdf } from "@/lib/pdf";
import PdfDropzone from "@/components/PdfDropzone";
import ProcessingStatus from "@/components/ProcessingStatus";
import GraphView from "@/components/GraphView";
import WordCloud from "@/components/WordCloud";
import DetailPanel from "@/components/DetailPanel";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("upload");
  const [error, setError] = useState<string | null>(null);
  const [pdfNames, setPdfNames] = useState<string[]>([]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [wordFrequencies, setWordFrequencies] = useState<WordFrequency[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [viewMode, setViewMode] = useState<"graph" | "cloud">("graph");

  const processFiles = useCallback(async (files: File[]) => {
    setError(null);
    setPdfNames(files.map((f) => f.name));
    setAppState("extracting");

    try {
      // Step 1: Extract text from PDFs (client-side)
      const documents: PdfDocument[] = [];
      for (let i = 0; i < files.length; i++) {
        const text = await extractTextFromPdf(files[i]);
        documents.push({ name: files[i].name, text, index: i });
      }

      // Step 2: Synthesize with Claude
      setAppState("synthesizing");

      const synthRes = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documents }),
      });

      if (!synthRes.ok) {
        const text = await synthRes.text();
        try {
          const err = JSON.parse(text);
          throw new Error(err.error || "Synthesis failed");
        } catch {
          throw new Error(`Synthesis failed (status ${synthRes.status})`);
        }
      }

      const result = (await synthRes.json()) as SynthesisResult;

      // Build graph data
      const nodes: GraphNode[] = result.themes.map((theme) => ({
        id: theme.id,
        label: theme.label,
        description: theme.description,
        importance: theme.importance,
        category: theme.category,
        sourcePdfs: theme.sourcePdfs,
        keywords: theme.keywords,
        color: getCategoryColor(theme.category),
      }));

      const links = result.connections.map((conn) => ({
        source: conn.source,
        target: conn.target,
        label: conn.label,
        strength: conn.strength,
      }));

      setGraphData({ nodes, links });
      setWordFrequencies(result.wordFrequencies);
      setAppState("results");
    } catch (err) {
      console.error("Processing error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setAppState("upload");
    }
  }, []);

  const handleReset = () => {
    setAppState("upload");
    setGraphData(null);
    setWordFrequencies([]);
    setSelectedNode(null);
    setPdfNames([]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-surface/80 backdrop-blur-sm px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Clustr
            </h1>
            <span className="text-xs text-text-muted font-medium px-2 py-0.5 bg-surface-hover rounded-full">
              PDF Synthesizer
            </span>
          </div>

          {appState === "results" && (
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center bg-surface rounded-lg p-0.5 border border-border">
                <button
                  onClick={() => setViewMode("graph")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    viewMode === "graph"
                      ? "bg-accent text-surface text-white"
                      : "text-text-dim hover:text-foreground"
                  }`}
                >
                  3D Graph
                </button>
                <button
                  onClick={() => setViewMode("cloud")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    viewMode === "cloud"
                      ? "bg-accent text-surface text-white"
                      : "text-text-dim hover:text-foreground"
                  }`}
                >
                  Word Cloud
                </button>
              </div>

              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-medium text-text-dim hover:text-foreground bg-surface hover:bg-surface-hover border border-border rounded-lg transition-colors"
              >
                New Analysis
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden relative">
        {/* Upload state */}
        {appState === "upload" && (
          <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
            <div className="text-center mb-4">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Synthesize Your Conference Notes
              </h2>
              <p className="text-text-dim max-w-md mx-auto">
                Drop in your PDF summaries and discover hidden patterns,
                connections, and themes across all your documents.
              </p>
            </div>

            <PdfDropzone onFilesAccepted={processFiles} />

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm max-w-md">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                {error}
              </div>
            )}
          </div>
        )}

        {/* Processing state */}
        {(appState === "extracting" || appState === "synthesizing") && (
          <div className="flex items-center justify-center h-full">
            <ProcessingStatus
              state={appState}
              fileCount={pdfNames.length}
              fileNames={pdfNames}
            />
          </div>
        )}

        {/* Results state */}
        {appState === "results" && graphData && (
          <div className="w-full h-full relative">
            {viewMode === "graph" ? (
              <GraphView
                data={graphData}
                onNodeClick={setSelectedNode}
                selectedNodeId={selectedNode?.id || null}
              />
            ) : (
              <div className="w-full h-full p-8">
                <WordCloud
                  words={wordFrequencies}
                  onWordClick={(word) => {
                    const node = graphData.nodes.find(
                      (n) =>
                        n.keywords.some((k) =>
                          k.toLowerCase().includes(word.toLowerCase())
                        ) ||
                        n.label.toLowerCase().includes(word.toLowerCase())
                    );
                    if (node) {
                      setSelectedNode(node);
                      setViewMode("graph");
                    }
                  }}
                />
              </div>
            )}

            <DetailPanel
              node={selectedNode}
              pdfNames={pdfNames}
              onClose={() => setSelectedNode(null)}
            />

            {/* Stats bar */}
            <div className="absolute bottom-4 right-4 flex items-center gap-3 bg-surface/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 z-10">
              <span className="text-xs text-text-muted">
                <strong className="text-foreground">
                  {graphData.nodes.length}
                </strong>{" "}
                themes
              </span>
              <span className="text-border">|</span>
              <span className="text-xs text-text-muted">
                <strong className="text-foreground">
                  {graphData.links.length}
                </strong>{" "}
                connections
              </span>
              <span className="text-border">|</span>
              <span className="text-xs text-text-muted">
                <strong className="text-foreground">{pdfNames.length}</strong>{" "}
                PDFs
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
