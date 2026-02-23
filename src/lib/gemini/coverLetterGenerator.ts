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

  const coverLetter = await generateContent(prompt);
  const wordCount = coverLetter.split(/\s+/).length;

  return { coverLetter: coverLetter.trim(), wordCount };
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

  const summary = await generateContent(prompt);
  return { summary: summary.trim() };
}
