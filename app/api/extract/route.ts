import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdf } from "@/lib/pdf";
import { PdfDocument } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > 20) {
      return NextResponse.json(
        { error: "Maximum 20 files allowed" },
        { status: 400 }
      );
    }

    const documents: PdfDocument[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const text = await extractTextFromPdf(buffer);
      documents.push({
        name: file.name,
        text,
        index: i,
      });
    }

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("PDF extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract text from PDFs" },
      { status: 500 }
    );
  }
}
