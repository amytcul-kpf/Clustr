import { NextRequest, NextResponse } from "next/server";
import { synthesizePdfs } from "@/lib/claude";
import { PdfDocument } from "@/lib/types";

// Allow up to 60 seconds for Claude API response
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const { documents } = (await request.json()) as {
      documents: PdfDocument[];
    };

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { error: "No documents provided" },
        { status: 400 }
      );
    }

    const result = await synthesizePdfs(documents);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Synthesis error:", error);
    const message =
      error instanceof Error ? error.message : "Synthesis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
