import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

// Define a type for the expected request body
interface ParseDocumentRequestBody {
  url: string;
}

// Helper function to extract text from PDF buffer
async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    // It's good practice to wrap third-party errors in more generic messages
    throw new Error(`Failed to parse PDF document: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url }: ParseDocumentRequestBody = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required.' }, { status: 400 });
    }

    let response: Response; // Use the native `Response` type
    try {
      // Use the native `fetch` API directly
      response = await fetch(url);

      // fetch API does NOT throw on 4xx/5xx responses, you must check `response.ok`
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
      }
    } catch (downloadError: any) {
      console.error(`Failed to download document from ${url}:`, downloadError);
      return NextResponse.json(
        { error: `Failed to download document: ${downloadError.message || 'Network or unknown error'}` },
        { status: 400 }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    const arrayBuffer = await response.arrayBuffer(); // Get content as ArrayBuffer
    const buffer = Buffer.from(arrayBuffer); // Convert ArrayBuffer to Node.js Buffer

    let extractedText = '';
    let documentType = 'unknown'; // Initialize, will be 'pdf' or 'unsupported'

    if (contentType.includes('application/pdf')) {
      extractedText = await extractTextFromPdf(buffer);
      documentType = 'pdf';
    } else {
      // If it's not a PDF, return an error
      return NextResponse.json(
        { error: `Unsupported document type: ${contentType}. Only PDF documents are supported.` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      extracted_text: extractedText,
      document_type: documentType,
      message: 'Document parsed successfully.'
    });

  } catch (error: any) {
    console.error("Error in parse-document API route:", error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred during document parsing.' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Increase max duration for potentially long parsing tasks (in seconds)