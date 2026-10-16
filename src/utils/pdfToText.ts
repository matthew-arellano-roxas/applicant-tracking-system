// src/pdfUtils.ts
import { readFile } from 'node:fs/promises';
import { PDFParse } from 'pdf-parse';

export type PdfSource = string | Buffer | Uint8Array;

/** Extract all text from a PDF given a file path or raw bytes. */
export async function pdfToText(source: PdfSource): Promise<string> {
  const data = typeof source === 'string' ? await readFile(source) : source;

  const parser = new PDFParse({ data });
  try {
    const result = await parser.getText();
    return result.text.trim();
  } finally {
    await parser.destroy(); // free the parser's resources
  }
}
