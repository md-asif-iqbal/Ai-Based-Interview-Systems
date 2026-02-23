import * as mammothModule from "mammoth";
import { readFile } from "fs/promises";

// Handle both ESM default and CJS module exports
const mammoth = (mammothModule as { default?: typeof mammothModule }).default || mammothModule;

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Lazy load pdf-parse to avoid module evaluation issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (buffer: Buffer) => Promise<{ text: string; numpages: number; info: Record<string, string> }>;
    
    const data = await pdfParse(buffer);
    if (!data.text || data.text.trim().length === 0) {
      throw new Error("No text found in PDF. The file might be a scanned image.");
    }
    return cleanText(data.text);
  } catch (error) {
    if ((error as Error).message.includes("scanned image")) throw error;
    throw new Error("Failed to parse PDF file. It may be corrupted or password-protected.");
  }
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    if (!result.value || result.value.trim().length === 0) {
      throw new Error("No text found in DOCX file.");
    }
    return cleanText(result.value);
  } catch (error) {
    if ((error as Error).message.includes("No text")) throw error;
    throw new Error("Failed to parse DOCX file. It may be corrupted.");
  }
}

export async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  const buffer = await readFile(filePath);
  return extractTextFromBuffer(buffer, mimeType);
}

export async function extractTextFromBuffer(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf" || mimeType.includes("pdf")) {
    return extractTextFromPDF(buffer);
  }
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType.includes("docx") ||
    mimeType.includes("word")
  ) {
    return extractTextFromDOCX(buffer);
  }
  throw new Error(`Unsupported file type: ${mimeType}. Only PDF and DOCX files are accepted.`);
}

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .replace(/^\s+$/gm, "")
    .trim();
}

export function validateFileSize(size: number, maxMB: number = 5): boolean {
  return size <= maxMB * 1024 * 1024;
}

export function validateFileType(mimeType: string): boolean {
  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  return allowed.includes(mimeType);
}
