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
You are a fair and expert interview evaluator. Evaluate the candidate's spoken answer (recorded from speech) to the interview question.

QUESTION: "${question}"

CANDIDATE'S ANSWER: "${answer}"

EXPECTED KEYWORDS/CONCEPTS: ${expectedKeywords.join(", ")}

${jobContext ? `JOB CONTEXT: ${jobContext}` : ""}

IMPORTANT EVALUATION GUIDELINES:
- This is a SPOKEN answer — do NOT penalise for informal speech, filler words, or lack of written structure
- A SHORT answer (even ${answerLength} words) that hits key points should score WELL on depthScore (0.7+)
- Only penalise depthScore if the answer is both short AND lacks substance or key concepts
- Reward concise, confident answers that demonstrate clear knowledge — verbosity is NOT required
- For relevanceScore: if they answered the core question, give 0.8+
- For technicalAccuracy: if they got the key facts right, give 0.8+ even if brief

Evaluate on these criteria (each 0.0 to 1.0):
1. **relevanceScore**: Did they directly address the question? (short but on-topic = high score)
2. **depthScore**: Did they cover the KEY points? (concise + accurate = 0.7+, vague/off-topic = low)
3. **clarityScore**: Was the answer understandable and well-communicated for a spoken response?
4. **technicalAccuracy**: Were the facts/concepts correct? (correct but brief = 0.8+)

Also provide:
- **keywordsFound**: Which expected keywords/concepts were mentioned (directly or by meaning)
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
    console.error("Answer evaluation error:", error);
    throw new Error("Failed to evaluate answer");
  }
}
