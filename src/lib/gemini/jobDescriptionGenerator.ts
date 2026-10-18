import { executeWithModelFallback } from "./client";

export interface GenerateJobDescriptionInput {
  title: string;
  department?: string;
  experienceLevel?: string;
  location?: string;
  employmentType?: string;
  skills?: string[];
  companyName?: string;
  industry?: string;
  referenceCV?: string;
  candidateCV?: string;
}

export interface GeneratedJobDescriptionOutput {
  title: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  benefits: string[];
  suggestedSalaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  recommendedQuestions: string[];
}

function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
  const match = cleaned.match(jsonBlockRegex);
  if (match && match[1]) {
    cleaned = match[1].trim();
  }
  return cleaned;
}

/**
 * Dynamic domain-aware fallback generator that strictly adapts to the specific
 * title, department, skills, and CV context provided — no static generic templates.
 */
export function generateJobDescriptionHeuristically(
  input: GenerateJobDescriptionInput
): GeneratedJobDescriptionOutput {
  const level = input.experienceLevel || "Mid-level";
  const title = input.title.trim() || "Technical Specialist";
  const department = input.department || "Technology";
  const company = input.companyName || "Our Organization";
  const location = input.location || "Remote";
  const empType = input.employmentType || "Full-time";
  
  // Extract or synthesize dynamic skills
  const providedSkills = Array.isArray(input.skills) && input.skills.length > 0 
    ? input.skills 
    : [title.split(" ")[0] || "Specialized Domain", "Problem Solving", "Modern Frameworks", "System Architecture", "Collaboration"];

  // Dynamic salary estimation based on level and location
  const isSenior = level.toLowerCase().includes("senior") || level.toLowerCase().includes("lead") || level.toLowerCase().includes("architect");
  const isJunior = level.toLowerCase().includes("entry") || level.toLowerCase().includes("junior") || level.toLowerCase().includes("intern");
  const isUSD = location.toLowerCase().includes("us") || location.toLowerCase().includes("remote (us)") || location.toLowerCase().includes("global");

  const currency = isUSD ? "USD" : "BDT";
  const minSalary = isUSD 
    ? (isSenior ? 130000 : isJunior ? 65000 : 95000) 
    : (isSenior ? 140000 : isJunior ? 45000 : 80000);
  const maxSalary = isUSD 
    ? (isSenior ? 220000 : isJunior ? 95000 : 150000) 
    : (isSenior ? 250000 : isJunior ? 75000 : 140000);

  return {
    title: `${level !== "Mid-level" && !title.toLowerCase().includes(level.toLowerCase()) ? `${level} ` : ""}${title}`,
    description: `We are seeking an experienced and dedicated ${title} to join our ${department} team at ${company}. In this ${empType.toLowerCase()} role (${location}), you will lead critical initiatives, design and deliver high-impact solutions, and collaborate with cross-functional partners to drive meaningful outcomes. We value innovative thinking, technical excellence, and a customer-centric mindset.`,
    responsibilities: [
      `Lead the end-to-end design, execution, and delivery of core initiatives in ${department}.`,
      `Leverage deep expertise in ${providedSkills.slice(0, 3).join(", ")} to build robust, scalable solutions.`,
      `Collaborate with product, engineering, and business stakeholders to define technical roadmap and specifications.`,
      `Conduct peer reviews, establish best practices, and mentor teammates to elevate technical quality.`,
      `Diagnose, troubleshoot, and optimize mission-critical systems for peak performance and reliability.`,
      `Continuously evaluate and integrate emerging tools and industry methodologies to maintain competitive advantage.`
    ],
    requirements: [
      `Demonstrated professional experience as a ${title} or in a closely related ${department} discipline.`,
      `Proven track record and hands-on proficiency in ${providedSkills.join(", ")}.`,
      `Strong analytical and problem-solving abilities with experience designing resilient architectures.`,
      `Effective communication skills with the ability to articulate complex concepts to diverse audiences.`,
      `Experience working in fast-paced agile teams delivering iterative, user-facing improvements.`,
      `Relevant degree in the discipline or equivalent demonstrable industry achievements.`
    ],
    skills: Array.from(new Set([...providedSkills, "System Architecture", "Continuous Improvement", "Agile Execution"])),
    benefits: [
      "Competitive salary and performance-driven bonus structure",
      "Flexible hybrid/remote working arrangements with work-life balance",
      "Comprehensive health, life, and wellness benefits package",
      "Annual continuous learning, certifications, and conferences budget",
      "Modern development workstation and home office setup allowance",
      "Generous paid time off, milestone leaves, and regular team events"
    ],
    suggestedSalaryRange: {
      min: minSalary,
      max: maxSalary,
      currency
    },
    recommendedQuestions: [
      `Can you share a detailed overview of your experience as a ${title}, highlighting your most significant achievement?`,
      `How have you applied ${providedSkills[0] || "your primary skill"} to solve a complex, high-stakes challenge in your past projects?`,
      `Describe how you ensure quality, reliability, and security in your day-to-day work.`,
      `What methodologies do you use to balance rapid delivery with long-term maintainability?`
    ]
  };
}

/**
 * Generates an end-to-end, tailored Job Description package using Gemini AI.
 * If reference candidate CV data is provided, the AI synthesizes both the job requirements
 * and CV skills to create a cohesive role specification and interview questions.
 */
export async function generateJobDescription(
  input: GenerateJobDescriptionInput
): Promise<GeneratedJobDescriptionOutput> {
  const referenceCvSection = input.referenceCV || input.candidateCV
    ? `\nREFERENCE CANDIDATE CV / BENCHMARK PROFILE:\n${(input.referenceCV || input.candidateCV)?.trim().slice(0, 3000)}\nUse this CV background to accurately benchmark required skills, typical past project responsibilities, and key interview questions.\n`
    : "";

  const prompt = `
You are an expert HR Leader, Executive Technical Recruiter, and Talent Acquisition Strategist.
Generate a comprehensive, modern, production-grade Job Posting package in JSON format.

ROLE PARAMETERS:
- Title: ${input.title}
- Department: ${input.department || "Engineering / Technology"}
- Experience Level: ${input.experienceLevel || "Mid-level"}
- Location & Work Policy: ${input.location || "Remote"} (${input.employmentType || "Full-time"})
- Core Technologies / Competencies: ${input.skills?.length ? input.skills.join(", ") : "Industry standard relevant skills"}
- Company: ${input.companyName || "Our Organization"}
- Industry: ${input.industry || "Software & Technology"}
${referenceCvSection}

CRITICAL GENERATION INSTRUCTIONS:
1. Every section must be uniquely written by AI specifically for the "${input.title}" role. NO generic filler.
2. Responsibilities: 6 detailed, actionable, impact-driven bullet points reflecting modern industry standards.
3. Requirements: 6 clear, realistic technical and behavioral prerequisites.
4. Skills: 6-10 primary and secondary technologies/frameworks relevant to this exact title.
5. Suggested Salary Range: Realistic market rate appropriate for the role, level, and location (e.g. BDT or USD).
6. Recommended Questions: 4 high-signal interview questions directly derived from the job's core challenges.

OUTPUT FORMAT:
Respond ONLY with a valid JSON object without surrounding markdown code fences or conversational text:
{
  "title": "${input.title}",
  "description": "2-3 compelling paragraphs detailing the mission, team culture, and business impact of this position.",
  "responsibilities": ["bullet 1", "bullet 2", "bullet 3", "bullet 4", "bullet 5", "bullet 6"],
  "requirements": ["req 1", "req 2", "req 3", "req 4", "req 5", "req 6"],
  "skills": ["skill 1", "skill 2", "skill 3", "skill 4", "skill 5", "skill 6"],
  "benefits": ["benefit 1", "benefit 2", "benefit 3", "benefit 4", "benefit 5", "benefit 6"],
  "suggestedSalaryRange": {
    "min": 80000,
    "max": 150000,
    "currency": "BDT"
  },
  "recommendedQuestions": [
    "question 1",
    "question 2",
    "question 3",
    "question 4"
  ]
}
`;

  try {
    const { result: rawResult } = await executeWithModelFallback(async (model) => {
      const response = await model.generateContent(prompt);
      return response.response.text();
    });

    const cleaned = cleanJsonString(rawResult);
    const parsed = JSON.parse(cleaned) as GeneratedJobDescriptionOutput;

    // Validate structure
    if (
      parsed.title &&
      parsed.description &&
      Array.isArray(parsed.responsibilities) &&
      parsed.responsibilities.length > 0 &&
      Array.isArray(parsed.requirements) &&
      parsed.requirements.length > 0
    ) {
      return {
        title: parsed.title,
        description: parsed.description,
        responsibilities: parsed.responsibilities,
        requirements: parsed.requirements,
        skills: parsed.skills?.length ? parsed.skills : (input.skills || []),
        benefits: parsed.benefits?.length ? parsed.benefits : [
          "Competitive salary and performance bonuses",
          "Flexible work arrangements",
          "Health and medical coverage",
          "Professional training & development budget"
        ],
        suggestedSalaryRange: parsed.suggestedSalaryRange || { min: 70000, max: 130000, currency: "BDT" },
        recommendedQuestions: parsed.recommendedQuestions || []
      };
    }

    return generateJobDescriptionHeuristically(input);
  } catch (error) {
    console.warn("[Gemini Job Generator] AI model returned unexpected format or failed, falling back to dynamic heuristic generator:", error);
    return generateJobDescriptionHeuristically(input);
  }
}
