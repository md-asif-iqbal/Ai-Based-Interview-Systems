import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const DEPRECATED_MODELS = new Set([
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash",
  "gemini-2.0-flash-exp",
]);

export const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash";

export function getResolvedModelName(): string {
  const envModel = process.env.GEMINI_MODEL?.trim();
  if (!envModel || DEPRECATED_MODELS.has(envModel)) {
    return DEFAULT_GEMINI_MODEL;
  }
  return envModel;
}

let genAIInstance: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
  }
  if (!genAIInstance) {
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
}

export function getGeminiModel(): GenerativeModel {
  const genAI = getGenAI();
  return genAI.getGenerativeModel({
    model: getResolvedModelName(),
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 8192,
    },
  });
}

export async function generateContent(prompt: string): Promise<string> {
  const model = getGeminiModel();

  try {
    const result = await retryWithBackoff(async () => {
      const response = await model.generateContent(prompt);
      return response.response.text();
    });
    return result;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate content from Gemini API");
  }
}

// Generate with custom temperature — used for question generation (higher creativity)
export async function generateContentCreative(prompt: string, temperature = 1.2): Promise<string> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: getResolvedModelName(),
    generationConfig: {
      temperature,   // higher = more varied questions per interview
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
    },
  });

  try {
    const result = await retryWithBackoff(async () => {
      const response = await model.generateContent(prompt);
      return response.response.text();
    });
    return result;
  } catch (error) {
    console.error("Gemini creative API error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate content from Gemini API");
  }
}

export async function generateJSON<T>(prompt: string): Promise<T> {
  const fullPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanation.`;
  const text = await generateContent(fullPrompt);
  const cleaned = extractJSON(text);
  return JSON.parse(cleaned) as T;
}

// Utility: Extract JSON from potential markdown code blocks
export function extractJSON(text: string): string {
  // Try to extract from markdown code blocks
  const jsonBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (jsonBlockMatch) {
    return jsonBlockMatch[1].trim();
  }
  // Try to find JSON object or array
  const jsonMatch = text.match(/[\[{][\s\S]*[\]}]/);
  if (jsonMatch) {
    return jsonMatch[0].trim();
  }
  return text.trim();
}

// Retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
