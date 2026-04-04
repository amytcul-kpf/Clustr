import { NextRequest, NextResponse } from "next/server";
import { synthesizePdfs } from "@/lib/claude";
import { PdfDocument } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
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
