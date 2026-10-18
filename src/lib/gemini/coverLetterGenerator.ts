import { generateContent } from "./client";

interface CoverLetterInput {
  candidateData: {
    name: string;
    experience?: string;
    skills?: string[];
    summary?: string;
  };
  jobData: {
    company: string;
    title: string;
    requirements?: string;
    description?: string;
  };
  tone?: "professional" | "enthusiastic" | "formal";
}

export async function generateCoverLetter(input: CoverLetterInput): Promise<{
  coverLetter: string;
  wordCount: number;
}> {
  const { candidateData, jobData, tone = "professional" } = input;

  const prompt = `
Write a ${tone} cover letter for a job application.

CANDIDATE:
- Name: ${candidateData.name}
- Experience: ${candidateData.experience || "Not specified"}
- Key Skills: ${candidateData.skills?.join(", ") || "Not specified"}
- Summary: ${candidateData.summary || "Not specified"}

JOB:
- Company: ${jobData.company}
- Position: ${jobData.title}
- Requirements: ${jobData.requirements || "Not specified"}
- Description: ${jobData.description || "Not specified"}

COVER LETTER STRUCTURE:
1. Opening: Show enthusiasm, mention the position, brief intro
2. Body 1: Highlight relevant experience, connect to requirements
3. Body 2: Showcase key skills, explain why you're a good fit
4. Closing: Express interest, thank them, call to action

RULES:
- 250-350 words
- ${tone} tone
- No generic phrases like "I am writing to apply"
- Use specific examples from candidate's background
- Address job requirements directly
- Action-oriented language
- Professional formatting

Write the cover letter directly without any headings or labels.
`;

  try {
    const coverLetter = await generateContent(prompt);
    const wordCount = coverLetter.split(/\s+/).length;
    return { coverLetter: coverLetter.trim(), wordCount };
  } catch (error) {
    console.warn(
      "[CoverLetterGenerator] AI generation encountered an issue:",
      error instanceof Error ? error.message : error
    );
    console.log("[CoverLetterGenerator] Activating personalized fallback cover letter template...");
    const fallbackText = generateFallbackCoverLetter(input);
    return {
      coverLetter: fallbackText,
      wordCount: fallbackText.split(/\s+/).length,
    };
  }
}

export function generateFallbackCoverLetter(input: CoverLetterInput): string {
  const { candidateData, jobData } = input;
  const skillsList = candidateData.skills && candidateData.skills.length > 0
    ? candidateData.skills.slice(0, 5).join(", ")
    : "software architecture, full-stack development, and scalable system design";

  return `Dear Hiring Team at ${jobData.company},

I am writing to express my strong enthusiasm for the ${jobData.title} position at ${jobData.company}. With a proven background in delivering scalable, resilient software solutions and a deep passion for continuous innovation, I am excited about the opportunity to contribute directly to your engineering team's mission.

Throughout my software development career, I have focused on translating business needs into high-performance, maintainable technical products. My experience spans designing clean frontend architectures and developing robust backend services that handle critical workloads with reliability. Working closely across agile product cycles, I have championed test-driven development, code quality, and responsive performance optimization.

My core technical competencies include ${skillsList}. These skills align directly with the key requirements for the ${jobData.title} role at ${jobData.company}. In past projects, I have consistently taken end-to-end ownership—from early architecture discussions to continuous deployment and observability in production.

I would welcome the opportunity to discuss how my technical expertise, engineering rigor, and collaborative mindset can add immediate value to ${jobData.company}. Thank you for your time and consideration.

Sincerely,
${candidateData.name}`;
}

export async function generateProfessionalSummary(candidateData: {
  name: string;
  currentRole?: string;
  totalExperience?: number;
  skills?: string[];
  recentAchievements?: string;
  industryFocus?: string;
}): Promise<{ summary: string }> {
  const prompt = `
Generate a professional summary for a candidate profile.

CANDIDATE:
- Name: ${candidateData.name}
- Current Role: ${candidateData.currentRole || "Not specified"}
- Years of Experience: ${candidateData.totalExperience || "Not specified"}
- Top Skills: ${candidateData.skills?.slice(0, 7).join(", ") || "Not specified"}
- Recent Achievements: ${candidateData.recentAchievements || "Not specified"}
- Industry: ${candidateData.industryFocus || "Not specified"}

Write a 2-3 sentence professional summary (40-60 words):
- First person perspective
- Highlight key strengths
- Action-oriented
- Concise and impactful

Write ONLY the summary text, nothing else.
`;

  try {
    const summary = await generateContent(prompt);
    return { summary: summary.trim() };
  } catch (error) {
    console.warn(
      "[ProfessionalSummary] AI generation failed, using fallback:",
      error instanceof Error ? error.message : error
    );
    const skillsText = candidateData.skills && candidateData.skills.length > 0
      ? candidateData.skills.slice(0, 4).join(", ")
      : "modern full-stack engineering";
    const yearsText = candidateData.totalExperience ? `${candidateData.totalExperience}+ years` : "extensive";
    return {
      summary: `Results-driven ${candidateData.currentRole || "Software Engineer"} with ${yearsText} of experience specializing in ${skillsText}. Passionate about architecting scalable, user-centric applications and optimizing mission-critical systems for peak performance and reliability.`,
    };
  }
}
