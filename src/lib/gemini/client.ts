import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

// Ordered priority chain for fallback models
export const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-1.5-pro",
  "gemini-3.8-flash",
];

/**
 * Returns the chain of models to try in order.
 * If process.env.GEMINI_MODEL is set, it takes precedence as the primary model.
 */
export function getModelChain(): string[] {
  const envModel = process.env.GEMINI_MODEL?.trim();
  if (envModel) {
    return [envModel, ...FALLBACK_MODELS.filter((m) => m !== envModel)];
  }
  return [...FALLBACK_MODELS];
}

/**
 * Returns the currently preferred primary model name
 */
export function getResolvedModelName(): string {
  const chain = getModelChain();
  return chain[0] || DEFAULT_GEMINI_MODEL;
}

let genAIInstance: GoogleGenerativeAI | null = null;
let cachedApiKey: string | null = null;

export function getGenAI(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
  }
  if (!genAIInstance || cachedApiKey !== apiKey) {
    genAIInstance = new GoogleGenerativeAI(apiKey);
    cachedApiKey = apiKey;
  }
  return genAIInstance;
}

export function getGeminiModel(modelName?: string, options: {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
} = {}): GenerativeModel {
  const genAI = getGenAI();
  const selectedModel = modelName || getResolvedModelName();
  return genAI.getGenerativeModel({
    model: selectedModel,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      topP: options.topP ?? 0.8,
      topK: options.topK ?? 40,
      maxOutputTokens: options.maxOutputTokens ?? 8192,
    },
  });
}

export interface ModelExecutionOptions {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
}

/**
 * Executes a Gemini operation across the fallback model chain.
 * If a model returns 503 (high demand), 429 (rate limit), 404 (not found), or 5xx,
 * it automatically moves to the next model in the fallback chain.
 */
export async function executeWithModelFallback<T>(
  operation: (model: GenerativeModel, modelName: string) => Promise<T>,
  options: ModelExecutionOptions = {}
): Promise<{ result: T; usedModel: string }> {
  const models = getModelChain();
  let lastError: Error | null = null;
  const attemptsLog: string[] = [];

  const genAI = getGenAI();

  for (let mIdx = 0; mIdx < models.length; mIdx++) {
    const modelName = models[mIdx];
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        topP: options.topP ?? 0.8,
        topK: options.topK ?? 40,
        maxOutputTokens: options.maxOutputTokens ?? 8192,
      },
    });

    // Try each model with up to 2 attempts for momentary hiccups
    const maxTriesForModel = 2;
    for (let attempt = 0; attempt < maxTriesForModel; attempt++) {
      try {
        const result = await operation(model, modelName);
        if (mIdx > 0 || attempt > 0) {
          console.log(`[Gemini Fallback] Succeeded using fallback model "${modelName}" (attempt ${attempt + 1})`);
        }
        return { result, usedModel: modelName };
      } catch (err: unknown) {
        const error = err as Error;
        lastError = error;
        const msg = error.message || String(error);

        const is503HighDemand = msg.includes("503") || msg.toLowerCase().includes("high demand") || msg.toLowerCase().includes("service unavailable");
        const is429RateLimit = msg.includes("429") || msg.toLowerCase().includes("quota") || msg.includes("RESOURCE_EXHAUSTED");
        const is404NotFound = msg.includes("404") || msg.toLowerCase().includes("not found");
        const isLeakedOrPermission = msg.includes("403") || msg.includes("PERMISSION_DENIED") || msg.toLowerCase().includes("leaked");

        if (isLeakedOrPermission) {
          attemptsLog.push(`${modelName}: API key permission denied/leaked (403)`);
          // Stop chain if key is completely blocked
          throw new Error(`Gemini API key is invalid or flagged as leaked (403 Permission Denied). Please update GEMINI_API_KEY in .env.local.`);
        }

        if (is404NotFound) {
          attemptsLog.push(`${modelName}: Model not found (404)`);
          // Model does not exist, break to next model immediately
          break;
        }

        if (attempt < maxTriesForModel - 1) {
          const delay = is503HighDemand || is429RateLimit ? 1000 : 400;
          await new Promise((r) => setTimeout(r, delay));
        } else {
          attemptsLog.push(`${modelName}: ${msg.slice(0, 100)}`);
          if (mIdx < models.length - 1) {
            console.warn(`[Gemini Fallback] Model "${modelName}" failed (${msg.slice(0, 120)}). Trying fallback model "${models[mIdx + 1]}"...`);
          }
        }
      }
    }
  }

  throw new Error(
    `All Gemini fallback models exhausted [${models.join(", ")}]. Errors: ${attemptsLog.join(" | ")} | Last error: ${lastError?.message || "Unknown error"}`
  );
}

export async function generateContent(prompt: string): Promise<string> {
  const { result } = await executeWithModelFallback(async (model) => {
    const response = await model.generateContent(prompt);
    return response.response.text();
  }, { temperature: 0.7 });

  return result;
}

// Generate with custom temperature — used for question generation (higher creativity)
export async function generateContentCreative(prompt: string, temperature = 1.2): Promise<string> {
  const { result } = await executeWithModelFallback(async (model) => {
    const response = await model.generateContent(prompt);
    return response.response.text();
  }, {
    temperature,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
  });

  return result;
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
