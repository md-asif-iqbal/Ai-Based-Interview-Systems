import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Interview from "@/models/Interview";
import Application from "@/models/Application";
import { getAuthUserFromRequest } from "@/lib/auth/middleware";
import { evaluateAnswer } from "@/lib/gemini/answerEvaluator";
import { IInterviewAnswer } from "@/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const interview = await Interview.findById(id);
    if (!interview) {
      return NextResponse.json({ success: false, error: "Interview not found" }, { status: 404 });
    }

    const answers = interview.answers || [];

    // ═══ BATCH EVALUATE ALL ANSWERS AT ONCE ═══
    // Run all AI evaluations in parallel using Promise.all for speed
    const evaluationPromises = answers.map(async (answer: IInterviewAnswer, idx: number) => {
      const question = interview.questions[answer.questionIndex ?? idx];
      if (!question || !answer.answerText) return null;
      try {
        const evaluation = await evaluateAnswer(
          question.questionText,
          answer.answerText,
          question.expectedKeywords || []
        );
        return { index: idx, evaluation };
      } catch (err) {
        console.error(`Evaluation failed for Q${idx + 1}:`, err);
        return null;
      }
    });

    const evaluationResults = await Promise.all(evaluationPromises);

    // Apply evaluations back to answers
    for (const result of evaluationResults) {
      if (result && answers[result.index]) {
        answers[result.index].evaluation = result.evaluation;
        answers[result.index].score = result.evaluation.score;
      }
    }

    // Calculate overall scores
    const totalScore =
      answers.length > 0
        ? Math.round(answers.reduce((sum: number, a: { score?: number }) => sum + (a.score || 0), 0) / answers.length)
        : 0;

    // Calculate detailed scores
    const detailedScores = {
      technical: calculateCategoryScore(answers),
      communication: calculateCommunicationScore(answers),
      problemSolving: calculateCategoryScore(answers),
      confidence: Math.round(totalScore * 0.9),
    };

    // AI recommendation
    let aiRecommendation: "strong_hire" | "hire" | "maybe" | "no_hire";
    if (totalScore >= 80) aiRecommendation = "strong_hire";
    else if (totalScore >= 65) aiRecommendation = "hire";
    else if (totalScore >= 50) aiRecommendation = "maybe";
    else aiRecommendation = "no_hire";

    // Generate strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    for (const answer of answers) {
      if ((answer.score || 0) >= 75 && answer.evaluation?.feedback) {
        strengths.push(answer.evaluation.feedback);
      }
      if ((answer.score || 0) < 50 && answer.evaluation?.suggestions?.[0]) {
        weaknesses.push(answer.evaluation.suggestions[0]);
      }
    }

    const completedAt = new Date();
    const durationSeconds = interview.startedAt
      ? Math.round((completedAt.getTime() - interview.startedAt.getTime()) / 1000)
      : 0;

    // Update interview
    interview.status = "completed";
    interview.completedAt = completedAt;
    interview.durationSeconds = durationSeconds;
    interview.overallScore = totalScore;
    interview.detailedScores = detailedScores;
    interview.strengths = strengths.slice(0, 5);
    interview.weaknesses = weaknesses.slice(0, 5);
    interview.aiRecommendation = aiRecommendation;
    interview.answers = answers;
    await interview.save();

    // Update application status
    await Application.findByIdAndUpdate(interview.applicationId, {
      status: "interviewed",
    });

    // Build per-question scores for frontend
    const answerScores = answers.map((a: IInterviewAnswer, i: number) => ({
      questionIndex: a.questionIndex ?? i,
      score: a.score || 0,
      feedback: a.evaluation?.feedback || "",
      keywordsFound: a.evaluation?.keywordsFound || [],
      keywordsMissing: a.evaluation?.keywordsMissing || [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        overallScore: totalScore,
        detailedScores,
        aiRecommendation,
        strengths: interview.strengths,
        weaknesses: interview.weaknesses,
        durationSeconds,
        securityScore: interview.securityScore,
        answerScores,
      },
      message: "Interview completed successfully",
    });
  } catch (error) {
    console.error("Complete interview error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to complete interview" },
      { status: 500 }
    );
  }
}

function calculateCategoryScore(answers: IInterviewAnswer[]): number {
  const categoryAnswers = answers.filter(
    (a) => a.evaluation?.technicalAccuracy !== undefined
  );
  if (categoryAnswers.length === 0) return 0;
  return Math.round(
    categoryAnswers.reduce((sum, a) => sum + (a.score || 0), 0) / categoryAnswers.length
  );
}

function calculateCommunicationScore(answers: IInterviewAnswer[]): number {
  const scores = answers.map((a) => a.evaluation?.clarityScore || 0);
  if (scores.length === 0) return 0;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100);
}
