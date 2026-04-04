import Anthropic from "@anthropic-ai/sdk";
import { SynthesisResult, PdfDocument } from "./types";

const client = new Anthropic();

export async function synthesizePdfs(
  documents: PdfDocument[]
): Promise<SynthesisResult> {
  const pdfSummaries = documents
    .map(
      (doc, i) =>
        `--- PDF ${i}: "${doc.name}" ---\n${doc.text.slice(0, 8000)}\n`
    )
    .join("\n");

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are an expert research analyst. I have ${documents.length} PDF summaries from conferences. Analyze them and identify the key themes, patterns, and connections across all documents.

Here are the documents:

${pdfSummaries}

Respond with ONLY valid JSON (no markdown fences) matching this exact structure:
{
  "themes": [
    {
      "id": "t1",
      "label": "Theme Name",
      "description": "2-3 sentence description of this theme and why it matters",
      "importance": 0.9,
      "category": "One of: Technology, Business, Design, Research, Strategy, Operations, Culture, Innovation, Leadership",
      "sourcePdfs": [0, 2, 5],
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ],
  "connections": [
    {
      "source": "t1",
      "target": "t2",
      "label": "Brief description of how these themes connect",
      "strength": 0.7
    }
  ],
  "wordFrequencies": [
    { "text": "term", "value": 45 }
  ]
}

Guidelines:
- Extract 8-20 themes depending on content richness
- Each theme should appear in at least 1 PDF (sourcePdfs references PDF indices)
- Create connections between themes that share concepts, build on each other, or contrast
- importance should range from 0.3 to 1.0 based on how central the theme is
- strength should range from 0.2 to 1.0 based on connection strength
- wordFrequencies should contain 40-80 key terms with frequency counts
- Categories must be one of: Technology, Business, Design, Research, Strategy, Operations, Culture, Innovation, Leadership`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Strip markdown fences if present
  const cleaned = text
    .replace(/^```json?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  return JSON.parse(cleaned) as SynthesisResult;
}
