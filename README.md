# Clustr

A web app that synthesizes conference PDF summaries into an interactive 3D knowledge graph. Drop in up to 20 PDFs and discover hidden patterns, themes, and connections across your notes.

## Features

- **PDF Upload** — Drag & drop up to 20 PDF summaries
- **AI Synthesis** — Claude API extracts themes, patterns, and connections
- **3D Graph** — Interactive Obsidian-style force-directed graph visualization
- **Word Cloud** — Visual term frequency display with clickable words
- **Detail Panel** — Click any node to see theme details, keywords, and source PDFs

## Getting Started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Setup

```bash
# Install dependencies
npm install

# Copy environment template and add your API key
cp .env.local.example .env.local
# Edit .env.local and set ANTHROPIC_API_KEY=your-key-here

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Next.js 15** (App Router)
- **Tailwind CSS** (dark theme)
- **react-force-graph-3d** (3D visualization)
- **pdf-parse** (PDF text extraction)
- **Claude API** (AI synthesis)
