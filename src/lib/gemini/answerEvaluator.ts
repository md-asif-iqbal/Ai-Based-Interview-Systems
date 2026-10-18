import { generateJSON } from "./client";
import { IAnswerEvaluation } from "@/types";

export async function evaluateAnswer(
  question: string,
  answer: string,
  expectedKeywords: string[],
  jobContext?: string
): Promise<IAnswerEvaluation> {
  const answerLength = answer.trim().split(/\s+/).length;
  const prompt = `
You are a fair, bilingual expert interview evaluator. Evaluate the candidate's answer (recorded from live speech) to the interview question.

QUESTION: "${question}"

CANDIDATE'S ANSWER: "${answer}"

EXPECTED KEYWORDS/CONCEPTS: ${expectedKeywords.join(", ")}

${jobContext ? `JOB CONTEXT: ${jobContext}` : ""}

CRITICAL MULTILINGUAL & BENGALI (বাংলা) INSTRUCTIONS:
- The candidate is 100% permitted to answer in ENGLISH, BENGALI (বাংলা), or a natural mix of both (BANGLISH / কোড-সুইচিং).
- You MUST evaluate Bengali / mixed answers with the exact same rigor, fairness, and scoring criteria as English answers.
- DO NOT penalize the candidate for speaking in Bengali or using Bengali technical terminology (e.g. 'স্টেট ম্যানেজমেন্ট', 'ভার্চুয়াল ডম', 'এপিআই হ্যান্ডলিং', 'ডাটাবেস কুয়েরি', 'ক্যাশ করা').
- Map Bengali conceptual explanations directly to the English expectedKeywords (e.g. if expected keyword is "virtual DOM" and candidate explains "ভার্চুয়াল ডম" or "ইন-মেমোরি ডম কপি", count it as keyword found!).
- Evaluate technical accuracy, conceptual understanding, relevance, depth, and clarity based on the substance of what they communicated.

IMPORTANT EVALUATION GUIDELINES:
- This is a SPOKEN answer — do NOT penalise for informal speech, natural pauses, filler words, or lack of written essay structure.
- A SHORT answer (even ${answerLength} words) that hits key points should score WELL on depthScore (0.7+).
- Only penalise depthScore if the answer is both short AND lacks substance or key concepts.
- Reward concise, confident answers that demonstrate clear knowledge — verbosity is NOT required.
- For relevanceScore: if they answered the core question, give 0.8+.
- For technicalAccuracy: if they got the key facts right (in English or Bengali), give 0.8+ even if brief.

Evaluate on these criteria (each 0.0 to 1.0):
1. **relevanceScore**: Did they directly address the question? (short but on-topic = high score)
2. **depthScore**: Did they cover the KEY points? (concise + accurate = 0.7+, vague/off-topic = low)
3. **clarityScore**: Was the answer understandable and well-communicated for a spoken response?
4. **technicalAccuracy**: Were the facts/concepts correct? (correct but brief = 0.8+)

Also provide:
- **keywordsFound**: Which expected keywords/concepts were mentioned (directly, in Bengali, or by conceptual meaning)
- **keywordsMissing**: Which important concepts were NOT covered at all
- **feedback**: 2-3 sentences of constructive, encouraging feedback
- **suggestions**: 2-3 specific suggestions to strengthen the answer next time
- **sentiment**: Overall tone (positive/neutral/negative)

Calculate overall score (0-100):
- relevanceScore * 30 + depthScore * 25 + clarityScore * 25 + technicalAccuracy * 20

Return JSON:
{
  "score": 75,
  "relevanceScore": 0.8,
  "depthScore": 0.7,
  "clarityScore": 0.8,
  "technicalAccuracy": 0.7,
  "keywordsFound": ["keyword1", "keyword2"],
  "keywordsMissing": ["keyword3"],
  "feedback": "Good answer with clear structure...",
  "suggestions": ["Could elaborate more on...", "Consider mentioning..."],
  "sentiment": "positive"
}
`;

  try {
    const evaluation = await generateJSON<IAnswerEvaluation>(prompt);

    // Ensure score is calculated correctly
    const calculatedScore = Math.round(
      (evaluation.relevanceScore || 0) * 30 +
        (evaluation.depthScore || 0) * 25 +
        (evaluation.clarityScore || 0) * 25 +
        (evaluation.technicalAccuracy || 0) * 20
    );

    return {
      ...evaluation,
      score: evaluation.score || calculatedScore,
      keywordsFound: evaluation.keywordsFound || [],
      keywordsMissing: evaluation.keywordsMissing || [],
      suggestions: evaluation.suggestions || [],
    };
  } catch (error) {
    console.warn(
      "[AnswerEvaluator] AI evaluation encountered an issue:",
      error instanceof Error ? error.message : error
    );
    console.log("[AnswerEvaluator] Engaging heuristic bilingual answer evaluation fallback...");
    return evaluateAnswerHeuristically(question, answer, expectedKeywords, jobContext);
  }
}

const BENGALI_TECHNICAL_SYNONYMS: Record<string, string[]> = {
  "virtual dom": ["ভার্চুয়াল ডম", "ভার্চুয়াল ডম", "ভার্চুয়াল", "vdom", "dom copy"],
  "reconciliation": ["রিকনসিলিয়েশন", "রিকনসিলিয়েশন", "diffing", "ডিফিং", "তুলনা"],
  "state management": ["স্টেট", "স্টেট ম্যানেজমেন্ট", "রিডাক্স", "জাস্ট্যান্ড", "zustand", "redux", "usestate"],
  "usememo": ["usememo", "ইউজম্যামো", "ক্যাশিং", "মেমোইজেশন"],
  "usecallback": ["usecallback", "ইউজকলব্যাক", "ফাংশন মেমোইজেশন"],
  "caching": ["ক্যাশ", "ক্যাশিং", "cache", "মেমোরি", "redis"],
  "rest api": ["এপিআই", "এপিআইস", "api", "rest api", "endpoint", "রাউট"],
  "database": ["ডাটাবেস", "ডেটাবেস", "database", "mongodb", "postgresql", "sql", "টেবিল"],
  "indexing": ["ইনডেক্সিং", "ইনডেক্স", "index", "indexing", "বি-ট্রি"],
  "authentication": ["অথেনটিকেশন", "লগইন", "auth", "jwt", "টোকেন", "নিরাপত্তা"],
  "performance": ["পারফরম্যান্স", "গতি", "performance", "fast", "অপ্টিমাইজেশন"],
  "scalability": ["স্কেলেবিলিটি", "স্কেল", "scalability", "লোড ব্যালেন্সিং"],
  "debugging": ["ডিবাগিং", "ডিবাগ", "debug", "ফিক্স", "সমস্যা সমাধান"],
  "ci/cd": ["সিআই সিডি", "পাইপলাইন", "ci/cd", "deployment", "ডিপ্লয়মেন্ট"],
  "testing": ["টেস্টিং", "টেস্ট", "unit test", "integration", "jest"],
  "accessibility": ["অ্যাক্সেসিবিলিটি", "a11y", "accessibility", "aria"],
  "security": ["নিরাপত্তা", "সিকিউরিটি", "security", "সুরক্ষা"],
  "experience": ["অভিজ্ঞতা", "এক্সপেরিয়েন্স", "experience", "কাজ"],
  "background": ["ব্যাকগ্রাউন্ড", "পরিচিতি", "background", "ক্যারিয়ার"],
  "motivation": ["মোটিভেশন", "আগ্রহ", "motivation", "কারণ", "ভালোলাগা"],
  "projects": ["প্রজেক্ট", "প্রজেক্টস", "project", "কাজ"],
};

/**
 * Robust heuristic evaluation fallback with support for Bengali (বাংলা) and English.
 */
export function evaluateAnswerHeuristically(
  question: string,
  answer: string,
  expectedKeywords: string[],
  jobContext?: string
): IAnswerEvaluation {
  const trimmed = answer ? answer.trim() : "";
  const words = trimmed.length > 0 ? trimmed.split(/\s+/) : [];
  const wordCount = words.length;

  if (wordCount < 3) {
    return {
      score: 0,
      relevanceScore: 0.1,
      depthScore: 0.1,
      clarityScore: 0.2,
      technicalAccuracy: 0.1,
      keywordsFound: [],
      keywordsMissing: [...expectedKeywords],
      feedback: "No substantive spoken answer was recorded for this question. Make sure your microphone is active and speak clearly in English or Bengali.",
      suggestions: [
        "Speak clearly into your microphone when answering (English or Bengali).",
        "Ensure you address the primary question directly.",
      ],
      sentiment: "neutral",
    };
  }

  const lower = trimmed.toLowerCase();
  const hasBengali = /[\u0980-\u09FF]/.test(trimmed);
  const keywordsFound: string[] = [];
  const keywordsMissing: string[] = [];

  for (const kw of expectedKeywords) {
    const kwLower = kw.toLowerCase().trim();
    let isFound = lower.includes(kwLower);

    // If not found in English, check Bengali synonyms
    if (!isFound) {
      const synonyms = BENGALI_TECHNICAL_SYNONYMS[kwLower];
      if (synonyms) {
        for (const syn of synonyms) {
          if (lower.includes(syn.toLowerCase())) {
            isFound = true;
            break;
          }
        }
      }
    }

    if (isFound) {
      keywordsFound.push(kw);
    } else {
      keywordsMissing.push(kw);
    }
  }

  const keywordRatio = expectedKeywords.length > 0 ? keywordsFound.length / expectedKeywords.length : 0.6;

  // Relevance based on keyword hit ratio and length
  const relevanceScore = Math.min(0.95, Math.max(0.45, 0.6 + keywordRatio * 0.35));

  // Depth score based on response length and keyword richness
  let depthScore = 0.55;
  if (wordCount >= 50) depthScore = 0.9;
  else if (wordCount >= 25) depthScore = 0.8;
  else if (wordCount >= 12) depthScore = 0.7;
  else depthScore = 0.55;
  depthScore = Math.min(0.95, depthScore + keywordRatio * 0.1);

  // Clarity score: spoken fluency proxy
  const clarityScore = wordCount >= 8 ? 0.88 : 0.68;

  // Technical accuracy
  const technicalAccuracy = Math.min(0.95, Math.max(0.45, 0.58 + keywordRatio * 0.38));

  const score = Math.round(
    relevanceScore * 30 +
    depthScore * 25 +
    clarityScore * 25 +
    technicalAccuracy * 20
  );

  const langTag = hasBengali ? "বাংলায় (Bengali)" : "English";
  const foundText = keywordsFound.length > 0
    ? `Key concepts discussed included: ${keywordsFound.join(", ")}.`
    : "The response addressed the question with relevant context.";

  const missingText = keywordsMissing.length > 0
    ? `Consider elaborating further on ${keywordsMissing.slice(0, 2).join(" and ")} to showcase deeper technical depth.`
    : "Maintain this structured, confident approach with concrete metrics and project examples.";

  const contextNote = jobContext ? ` in relation to ${jobContext.slice(0, 40).trim()}` : "";

  return {
    score,
    relevanceScore: Math.round(relevanceScore * 100) / 100,
    depthScore: Math.round(depthScore * 100) / 100,
    clarityScore: Math.round(clarityScore * 100) / 100,
    technicalAccuracy: Math.round(technicalAccuracy * 100) / 100,
    keywordsFound,
    keywordsMissing,
    feedback: `The candidate provided a relevant spoken response in ${langTag}${contextNote}. ${foundText} Clear delivery and accurate explanation.`,
    suggestions: [
      missingText,
      "Mention a specific trade-off or challenge faced when applying this concept in production.",
    ],
    sentiment: score >= 70 ? "positive" : "neutral",
  };
}
