import { generateContentCreative, extractJSON } from "./client";
import { IInterviewQuestion } from "@/types";

export interface CandidateResumeData {
  name?: string;
  fullName?: string;
  summary?: string;
  skills?: string[];
  experience?: Array<{ position?: string; title?: string; company?: string; duration?: string; description?: string }>;
  education?: Array<{ degree?: string; institution?: string }>;
  projects?: Array<{ title?: string; name?: string; description?: string; technologies?: string[] }>;
}

export interface QuestionGeneratorOptions {
  jobTitle?: string;
  jobDescription: string;
  requiredSkills?: string[];
  candidateResume?: CandidateResumeData | string;
  count?: number;
  type?: string;
}

interface GeneratedQuestion {
  questionText: string;
  category: "technical" | "behavioral" | "situational";
  difficulty: "easy" | "medium" | "hard";
  expectedKeywords: string[];
  timeLimitSeconds?: number;
  followUpQuestions?: string[];
}

function formatCandidateCv(resume?: CandidateResumeData | string): string {
  if (!resume) return "";
  if (typeof resume === "string") return resume.trim();

  const parts: string[] = [];
  const name = resume.fullName || resume.name;
  if (name) parts.push(`Candidate Name: ${name}`);
  if (resume.summary) parts.push(`Professional Summary: ${resume.summary}`);
  if (resume.skills && resume.skills.length > 0) parts.push(`Skills: ${resume.skills.join(", ")}`);
  
  if (resume.experience && resume.experience.length > 0) {
    const expStr = resume.experience
      .map((e) => {
        const title = e.position || e.title || "Engineer";
        const company = e.company ? ` at ${e.company}` : "";
        const desc = e.description ? ` (${e.description.slice(0, 100)})` : "";
        return `${title}${company}${desc}`;
      })
      .join("; ");
    parts.push(`Work Experience: ${expStr}`);
  }

  if (resume.projects && resume.projects.length > 0) {
    const projStr = resume.projects
      .map((p) => {
        const pName = p.title || p.name || "Project";
        const techs = p.technologies?.length ? ` [Tech: ${p.technologies.join(", ")}]` : "";
        return `${pName}${techs}`;
      })
      .join("; ");
    parts.push(`Key Projects: ${projStr}`);
  }

  if (resume.education && resume.education.length > 0) {
    const eduStr = resume.education
      .map((ed) => `${ed.degree || "Degree"} from ${ed.institution || "University"}`)
      .join("; ");
    parts.push(`Education: ${eduStr}`);
  }

  return parts.join("\n");
}

export async function generateInterviewQuestions(
  inputOrDesc: QuestionGeneratorOptions | string,
  legacyCount: number = 8,
  legacyType?: string
): Promise<IInterviewQuestion[]> {
  // Normalize input
  const isOptions = typeof inputOrDesc === "object";
  const jobTitle = isOptions ? (inputOrDesc.jobTitle || "Open Role") : "Open Role";
  const jobDesc = isOptions ? inputOrDesc.jobDescription : inputOrDesc;
  const count = isOptions ? (inputOrDesc.count || 8) : legacyCount;
  const type = isOptions ? (inputOrDesc.type || "mixed") : (legacyType || "mixed");
  const candidateCvText = isOptions ? formatCandidateCv(inputOrDesc.candidateResume) : "";

  // Unique session seed for maximum freshness
  const seed = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  const cvContext = candidateCvText
    ? `\n=== CANDIDATE'S CV / RESUME PROFILE ===\n${candidateCvText}\n`
    : `\n=== CANDIDATE PROFILE ===\nCandidate is applying with skills matching the role.\n`;

  const prompt = `You are an expert senior technical interviewer and hiring committee leader.
Generate exactly ${count} bespoke, highly relevant interview questions tailored to BOTH the Job Requirements AND the Candidate's CV.
Session seed: ${seed}

=== TARGET JOB REQUIREMENTS ===
Role Title: ${jobTitle}
Job Details & Tech Stack:
${jobDesc}
${cvContext}
Interview Focus Type: ${type}

CRITICAL GENERATION RULES:
1. NEVER use generic boilerplate questions. Every question must be dynamically synthesized based on the intersection between the Job Description and the Candidate's CV!
2. Question 1 (Personal Background & Fit): Welcome the candidate by referencing their specific background, experience, or projects from their CV, and ask what motivated them to transition to this ${jobTitle} role.
3. Questions 2-4 (Technical Deep Dive & Architecture): Ask challenging technical questions directly testing the overlap between the skills/technologies required for this job and what the candidate lists on their CV. Probe architecture, implementation trade-offs, debugging, and real-world system design.
4. Questions 5-6 (Behavioral & Experience Validation): Ask STAR-method behavioral questions asking how they solved difficult technical challenges, managed deadlines, or resolved disagreements during past roles mentioned on their CV.
5. Questions 7-8 (Role-Specific Situational): Present realistic, high-impact scenarios they will face on the job in this role.
6. Order: progressive difficulty (easy → medium → hard).
7. For each question, provide exactly 5 targeted expectedKeywords that reflect a strong, comprehensive answer.

Return ONLY valid JSON in this exact structure without markdown commentary:
{
  "questions": [
    {
      "questionText": "Specific, tailored question text here",
      "category": "technical",
      "difficulty": "medium",
      "expectedKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
    }
  ]
}`;

  try {
    const fullPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown code blocks, no explanation text.`;
    const raw = await generateContentCreative(fullPrompt, 1.15);
    const cleaned = extractJSON(raw);
    const result = JSON.parse(cleaned) as { questions: GeneratedQuestion[] };

    if (!result.questions || !Array.isArray(result.questions) || result.questions.length === 0) {
      throw new Error("AI returned empty or invalid questions array");
    }

    return result.questions.slice(0, count).map((q, index) => ({
      questionText: q.questionText,
      category: q.category,
      difficulty: q.difficulty,
      expectedKeywords: q.expectedKeywords || [],
      timeLimitSeconds: 50,
      followUpQuestions: q.followUpQuestions,
      order: index + 1,
    }));
  } catch (error) {
    console.warn(
      "[QuestionGenerator] AI question generation throttled or failed, using dynamic candidate-tailored fallback:",
      error instanceof Error ? error.message : error
    );
    return generateFallbackQuestions(inputOrDesc, count, type);
  }
}

/**
 * Dynamic fallback question generator that synthesizes questions specifically
 * from the Candidate's CV (skills, projects, past companies) and Job Title.
 */
export function generateFallbackQuestions(
  inputOrDesc: QuestionGeneratorOptions | string,
  count: number = 8,
  type?: string
): IInterviewQuestion[] {
  const isOptions = typeof inputOrDesc === "object";
  const jobTitle = isOptions ? (inputOrDesc.jobTitle || "Software Engineer") : "Software Engineer";
  const jobDesc = isOptions ? inputOrDesc.jobDescription : inputOrDesc;
  const resume = isOptions && typeof inputOrDesc.candidateResume === "object" ? inputOrDesc.candidateResume : null;

  // Extract candidate specific details
  const candidateSkills = resume?.skills && resume.skills.length > 0
    ? resume.skills
    : ["Modern Software Architecture", "Problem Solving", "API Design", "Database Management"];
  
  const candidateCompany = resume?.experience?.[0]?.company || "your previous engineering team";
  const candidateProject = resume?.projects?.[0]?.title || resume?.projects?.[0]?.name || "a major technical project";
  const primarySkill = candidateSkills[0] || "core technologies";
  const secondarySkill = candidateSkills[1] || "system design";

  const pool: Array<{
    questionText: string;
    category: "technical" | "behavioral" | "situational";
    difficulty: "easy" | "medium" | "hard";
    expectedKeywords: string[];
  }> = [
    {
      questionText: `To begin, could you introduce yourself, walk us through your professional journey at ${candidateCompany}, and explain what excites you most about this ${jobTitle} position?`,
      category: "behavioral",
      difficulty: "easy",
      expectedKeywords: ["background", "experience", "journey", "motivation", "fit"],
    },
    {
      questionText: `In your resume, you highlighted hands-on experience with ${primarySkill}. How have you leveraged ${primarySkill} to solve complex production issues, and what trade-offs did you consider?`,
      category: "technical",
      difficulty: "medium",
      expectedKeywords: [primarySkill.toLowerCase(), "architecture", "trade-offs", "scalability", "performance"],
    },
    {
      questionText: `For this ${jobTitle} role, we focus heavily on scalable architecture. Looking back at ${candidateProject}, how did you structure the solution, and what would you improve if you rebuilt it today?`,
      category: "technical",
      difficulty: "medium",
      expectedKeywords: ["architecture", "design", "refactoring", "optimization", "clean code"],
    },
    {
      questionText: `How do you approach testing, code quality, and continuous integration when deploying features involving ${secondarySkill}?`,
      category: "technical",
      difficulty: "medium",
      expectedKeywords: [secondarySkill.toLowerCase(), "testing", "CI/CD", "code review", "quality"],
    },
    {
      questionText: `Tell me about a high-pressure situation or critical outage you handled at ${candidateCompany}. Walk me through your debugging methodology, root-cause analysis, and how you communicated with the team.`,
      category: "behavioral",
      difficulty: "medium",
      expectedKeywords: ["incident", "root cause", "debugging", "communication", "resolution"],
    },
    {
      questionText: `Describe a time when you and another engineer or stakeholder had differing views on a technical direction. How did you resolve the disagreement constructively?`,
      category: "behavioral",
      difficulty: "medium",
      expectedKeywords: ["collaboration", "compromise", "communication", "perspective", "consensus"],
    },
    {
      questionText: `If you joined our team as a ${jobTitle} and inherited a mission-critical service with high latency and poor documentation, what would be your step-by-step roadmap during your first 30 days?`,
      category: "situational",
      difficulty: "hard",
      expectedKeywords: ["profiling", "documentation", "roadmap", "prioritization", "incremental"],
    },
    {
      questionText: `Imagine our production traffic suddenly spikes by 10x, causing bottleneck failures in our downstream APIs. How would you triage the issue, implement circuit breakers, and protect system availability?`,
      category: "situational",
      difficulty: "hard",
      expectedKeywords: ["rate limiting", "circuit breaker", "caching", "failover", "monitoring"],
    },
  ];

  let selected = [...pool];
  if (type === "technical") {
    selected = pool.filter((q) => q.category === "technical" || q.difficulty === "easy");
  } else if (type === "behavioral") {
    selected = pool.filter((q) => q.category === "behavioral" || q.category === "situational");
  }

  while (selected.length < count) {
    selected.push({
      questionText: `How do you stay continuously updated with emerging industry standards, tools, and best practices relevant to ${jobTitle}?`,
      category: "behavioral",
      difficulty: "easy",
      expectedKeywords: ["learning", "growth", "best practices", "technology", "community"],
    });
  }

  return selected.slice(0, count).map((q, idx) => ({
    questionText: q.questionText,
    category: q.category,
    difficulty: q.difficulty,
    expectedKeywords: q.expectedKeywords,
    timeLimitSeconds: 50,
    order: idx + 1,
  }));
}
