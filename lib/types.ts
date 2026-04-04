export interface Theme {
  id: string;
  label: string;
  description: string;
  importance: number; // 0-1, used for node sizing
  category: string;
  sourcePdfs: number[]; // indices into the original PDF array
  keywords: string[];
}

export interface Connection {
  source: string; // theme id
  target: string; // theme id
  label: string;
  strength: number; // 0-1, used for edge thickness/opacity
}

export interface WordFrequency {
  text: string;
  value: number;
}

export interface SynthesisResult {
  themes: Theme[];
  connections: Connection[];
  wordFrequencies: WordFrequency[];
}

export interface GraphNode {
  id: string;
  label: string;
  description: string;
  importance: number;
  category: string;
  sourcePdfs: number[];
  keywords: string[];
  color?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  label: string;
  strength: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface PdfDocument {
  name: string;
  text: string;
  index: number;
}

export type AppState = "upload" | "extracting" | "synthesizing" | "results";

// Category color mapping for consistent theming
export const CATEGORY_COLORS: Record<string, string> = {
  Technology: "#89b4fa",
  Business: "#a6e3a1",
  Design: "#f5c2e7",
  Research: "#fab387",
  Strategy: "#f9e2af",
  Operations: "#94e2d5",
  Culture: "#cba6f7",
  Innovation: "#89dceb",
  Leadership: "#eba0ac",
  Default: "#b4befe",
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Default;
}
