import { generateContentCreative, extractJSON } from "./client";
import { IInterviewQuestion } from "@/types";

interface GeneratedQuestion {
  questionText: string;
  category: "technical" | "behavioral" | "situational";
  difficulty: "easy" | "medium" | "hard";
  expectedKeywords: string[];
  timeLimitSeconds: number;
  followUpQuestions?: string[];
}

export async function generateInterviewQuestions(
  jobDescription: string,
  count: number = 8,
  type?: string
): Promise<IInterviewQuestion[]> {
  // Unique seed per call so AI generates a different question set every time
  const seed = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  const prompt = `You are an expert senior technical interviewer. Generate exactly ${count} UNIQUE interview questions for this specific job. Session seed: ${seed}

JOB INFO:
${jobDescription}

Interview type: ${type || "mixed"}

Distribution:
- 3 Technical questions (deep, job-specific — ask about real implementation, trade-offs, debugging scenarios)
- 3 Behavioral questions (STAR-format situations from past experience)
- 2 Situational questions (hypothetical "what would you do" scenarios)

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "questionText": "full question text here",
      "category": "technical",
      "difficulty": "easy",
      "expectedKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
    }
  ]
}

CRITICAL RULES:
- NEVER repeat or reuse questions from any previous session — the seed guarantees uniqueness
- First question must be a warm personal intro (background + motivation)
- All questions must be specific to this exact job role and tech stack — NOT boilerplate generic questions
- Vary question angles: avoid asking the same concept twice
- Include exactly 5 expectedKeywords per question
- Order: easy → medium → hard
- category must be exactly: technical, behavioral, or situational
- difficulty must be exactly: easy, medium, or hard
- Do NOT include timeLimitSeconds in your response
- Return ONLY the JSON, no extra text`;

  try {
    const fullPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanation.`;
    const raw = await generateContentCreative(fullPrompt, 1.2);
    const cleaned = extractJSON(raw);
    const result = JSON.parse(cleaned) as { questions: GeneratedQuestion[] };

    if (!result.questions || !Array.isArray(result.questions) || result.questions.length === 0) {
      throw new Error("AI returned empty or invalid questions array");
    }

    return result.questions.map((q, index) => ({
      questionText: q.questionText,
      category: q.category,
      difficulty: q.difficulty,
      expectedKeywords: q.expectedKeywords || [],
      timeLimitSeconds: 50,
      followUpQuestions: q.followUpQuestions,
      order: index + 1,
    }));
  } catch (error) {
    console.error("Question generation error:", error);
    throw new Error("Failed to generate interview questions");
  }
}
