import {
  getResolvedModelName,
  DEFAULT_GEMINI_MODEL,
  FALLBACK_MODELS,
  getModelChain,
  extractJSON,
  getGeminiModel,
  executeWithModelFallback,
} from "../src/lib/gemini/client";
import { parseResumeHeuristically } from "../src/lib/gemini/resumeParser";
import { generateFallbackQuestions } from "../src/lib/gemini/questionGenerator";
import { evaluateAnswerHeuristically } from "../src/lib/gemini/answerEvaluator";
import { generateFallbackCoverLetter } from "../src/lib/gemini/coverLetterGenerator";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

async function runTests() {
  console.log("=== 1. Testing Gemini Model Priority & Fallback Chain ===");

  const originalEnv = process.env.GEMINI_MODEL;
  const originalApiKey = process.env.GEMINI_API_KEY;

  try {
    delete process.env.GEMINI_MODEL;
    const defaultChain = getModelChain();
    assert(defaultChain[0] === DEFAULT_GEMINI_MODEL, `Chain starts with DEFAULT_GEMINI_MODEL (${DEFAULT_GEMINI_MODEL})`);
    assert(defaultChain.length >= 4, `Chain contains multiple fallback options (got ${defaultChain.length})`);

    // Custom model set in env (e.g., gemini-3.8-flash)
    process.env.GEMINI_MODEL = "gemini-3.8-flash";
    const customChain = getModelChain();
    assert(customChain[0] === "gemini-3.8-flash", "Puts user-specified gemini-3.8-flash as primary model");
    assert(customChain.includes("gemini-2.5-flash") && customChain.includes("gemini-2.0-flash"), "Retains secondary fallbacks in chain");
    assert(getResolvedModelName() === "gemini-3.8-flash", "getResolvedModelName returns configured model");

    // Setting another model (e.g., gemini-2.0-flash)
    process.env.GEMINI_MODEL = "gemini-2.0-flash";
    const flashChain = getModelChain();
    assert(flashChain[0] === "gemini-2.0-flash", "Allows switching primary model to gemini-2.0-flash");
    assert(flashChain[1] !== "gemini-2.0-flash", "Deduplicates model list in chain");

    console.log("\n=== 2. Testing Gemini Model Instance Creation ===");
    process.env.GEMINI_API_KEY = "test-mock-api-key";
    process.env.GEMINI_MODEL = "gemini-3.8-flash";

    const model = getGeminiModel();
    assert(
      model.model === "models/gemini-3.8-flash" || model.model === "gemini-3.8-flash",
      `Model instance initialized with primary model (got ${model.model})`
    );

    console.log("\n=== 3. Testing JSON Extraction Utility ===");
    const rawMarkdown = "```json\n{\"test\": true, \"score\": 95}\n```";
    const extracted = extractJSON(rawMarkdown);
    const parsed = JSON.parse(extracted);
    assert(parsed.test === true && parsed.score === 95, "Successfully extracts JSON from markdown code blocks");

    const plainJson = "{\"status\": \"ok\"}";
    assert(extractJSON(plainJson) === plainJson, "Passes through plain JSON correctly");

    console.log("\n=== 4. Testing Multi-Model Fallback Simulation (503 High Demand) ===");
    let callCount = 0;
    const attemptedModels: string[] = [];

    const mockOperation = async (_modelInstance: any, modelName: string) => {
      callCount++;
      attemptedModels.push(modelName);

      // Simulate 503 high demand on the first model (e.g. gemini-3.8-flash)
      if (modelName === "gemini-3.8-flash") {
        throw new Error("[503 Service Unavailable] This model is currently experiencing high demand. Please try again later.");
      }

      // Second model succeeds
      return `Success from ${modelName}`;
    };

    const fallbackResult = await executeWithModelFallback(mockOperation);
    assert(
      fallbackResult.usedModel !== "gemini-3.8-flash",
      `Gracefully fell back from overloaded gemini-3.8-flash to ${fallbackResult.usedModel}`
    );
    assert(
      fallbackResult.result.startsWith("Success from"),
      "Fallback operation completed with successful result"
    );

    console.log("\n=== 5. Testing Heuristic Resume Parser Fallback ===");
    const sampleResume = `
Jane Doe
Email: jane.doe@techcorp.io
Phone: +1 555-123-4567
LinkedIn: https://linkedin.com/in/janedoe
GitHub: https://github.com/janedoe

PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 5+ years of experience specializing in React, Next.js, Node.js, and TypeScript.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, SQL, HTML, CSS
Frameworks: React, Next.js, Node.js, Express, Tailwind CSS
Databases & Cloud: PostgreSQL, MongoDB, Docker, AWS, Git

WORK EXPERIENCE
Senior Full Stack Developer
TechCorp Systems | 2022 - Present
- Architected enterprise cloud dashboards with Next.js and MongoDB.
- Reduced API response latency by 40% through Redis caching.

Software Engineer
InnoSoft Inc | 2020 - 2022
- Built scalable REST APIs using Node.js and PostgreSQL.

EDUCATION
Bachelor of Science in Computer Science
State University | 2020
`;

    const parsedResume = parseResumeHeuristically(sampleResume);
    assert(parsedResume.name?.includes("Jane Doe") === true, `Extracts name correctly: got "${parsedResume.name}"`);
    assert(parsedResume.email === "jane.doe@techcorp.io", `Extracts email correctly: got "${parsedResume.email}"`);
    assert(parsedResume.skills.includes("React") && parsedResume.skills.includes("TypeScript"), "Extracts tech skills accurately");
    assert(parsedResume.experience.length >= 2, `Extracts experience items: got ${parsedResume.experience.length}`);
    assert(parsedResume.education.length >= 1, `Extracts education items: got ${parsedResume.education.length}`);
    assert(parsedResume.overallScore >= 60, `Calculates readiness score: got ${parsedResume.overallScore}`);

    console.log("\n=== 6. Testing Fallback Question Generator ===");
    const questions = generateFallbackQuestions("Senior React Frontend Engineer with Next.js experience", 6);
    assert(questions.length === 6, `Generates exactly requested count (got ${questions.length})`);
    assert(questions[0].category === "behavioral", "Starts with warm introductory behavioral question");
    assert(questions.some((q) => q.category === "technical"), "Includes in-depth technical questions");
    assert(questions.every((q) => q.expectedKeywords.length > 0), "All questions have expectedKeywords for evaluation");

    console.log("\n=== 7. Testing Heuristic Answer Evaluator Fallback ===");
    const evaluation = evaluateAnswerHeuristically(
      "How does the virtual DOM work in React?",
      "The virtual DOM is an in-memory lightweight copy of the real DOM. When component state changes, React uses reconciliation to diff the virtual DOM and only updates changed nodes with useCallback and useMemo optimizations.",
      ["virtual DOM", "reconciliation", "useMemo", "useCallback", "diff"]
    );
    assert(evaluation.score >= 70, `Accurately evaluates answer quality (score: ${evaluation.score})`);
    assert(evaluation.keywordsFound.includes("virtual DOM"), "Identifies mentioned keywords");
    assert(evaluation.feedback.length > 20, "Generates encouraging, constructive feedback");
    assert(evaluation.suggestions.length > 0, "Provides actionable improvement suggestions");

    console.log("\n=== 8. Testing Fallback Cover Letter Generator ===");
    const coverLetter = generateFallbackCoverLetter({
      candidateData: {
        name: "Jane Doe",
        skills: ["React", "TypeScript", "Node.js"],
      },
      jobData: {
        company: "Stripe",
        title: "Staff Engineer",
      },
    });
    assert(coverLetter.includes("Jane Doe"), "Includes candidate name");
    assert(coverLetter.includes("Stripe"), "Includes company name");
    assert(coverLetter.includes("Staff Engineer"), "Includes position title");

    console.log("\n🎉 ALL GEMINI INTEGRATION & FALLBACK TESTS PASSED SUCCESSFULLY!");
  } finally {
    if (originalEnv !== undefined) {
      process.env.GEMINI_MODEL = originalEnv;
    } else {
      delete process.env.GEMINI_MODEL;
    }

    if (originalApiKey !== undefined) {
      process.env.GEMINI_API_KEY = originalApiKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  }
}

runTests();
