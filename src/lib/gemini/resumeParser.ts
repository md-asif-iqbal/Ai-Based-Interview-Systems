import { generateJSON } from "./client";
import { IParsedResume } from "@/types";

export async function parseResumeWithGemini(resumeText: string): Promise<IParsedResume> {
  if (!resumeText || resumeText.trim().length < 50) {
    throw new Error("Resume text is too short or empty");
  }

  const prompt = `
You are an expert resume parser with years of HR experience. Your job is to extract EVERY SINGLE piece of information from this resume. Do NOT miss anything.

RESUME TEXT:
---
${resumeText}
---

Extract ALL information and return as JSON with this EXACT structure:
{
  "name": "Full name",
  "email": "Email address",
  "phone": "Phone number",
  "location": "City, State/Country or full address",
  "summary": "Professional summary or objective statement (write one if not explicitly stated, based on the resume content, 2-3 sentences)",
  "skills": ["EVERY skill mentioned — programming languages, frameworks, tools, databases, methodologies, soft skills, technologies, platforms, libraries, APIs, protocols, etc."],
  "experience": [
    {
      "company": "Company name",
      "title": "Job title / Position",
      "startDate": "Start date (e.g., Jan 2020)",
      "endDate": "End date or null if current",
      "description": "Full description of responsibilities and achievements in this role. Include ALL bullet points combined into a paragraph.",
      "current": false
    }
  ],
  "education": [
    {
      "degree": "Degree name (e.g., Bachelor of Science in Computer Science)",
      "institution": "University/School/College name",
      "year": "Graduation year or expected year",
      "gpa": "GPA/CGPA if available",
      "field": "Field of study / Major"
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "What the project does, technologies used, your role",
      "technologies": ["Tech1", "Tech2"],
      "url": "Project URL if available"
    }
  ],
  "totalExperienceYears": 0,
  "certifications": ["Full certification names with issuing organization, e.g., 'AWS Certified Solutions Architect - Amazon'"],
  "languages": ["Languages spoken with proficiency if mentioned, e.g., 'English (Fluent)', 'Spanish (Intermediate)'"],
  "achievements": ["Awards, honors, publications, patents, competitions won, notable accomplishments"],
  "volunteerWork": ["Volunteer activities, community service, open source contributions"],
  "hobbies": ["Interests, hobbies, extracurricular activities"],
  "references": [
    {
      "name": "Reference person name",
      "title": "Their job title",
      "company": "Their company",
      "contact": "Phone or email if provided"
    }
  ],
  "linkedinUrl": "LinkedIn URL",
  "githubUrl": "GitHub URL",
  "portfolioUrl": "Portfolio/personal website URL",
  "websiteUrl": "Any other website URL",
  "overallScore": 0
}

CRITICAL RULES:
1. Extract EVERY skill — do NOT summarize or group. If they list "React, Next.js, Vue.js", list all three separately.
2. Include ALL experience entries, even internships, freelance, or part-time work.
3. Include ALL education entries including certifications courses, bootcamps, online courses.
4. Include ALL projects mentioned anywhere in the resume.
5. Calculate totalExperienceYears by summing all work experience durations accurately.
6. If a section is not found, use null for strings and empty arrays [] for arrays.
7. For "current" in experience, set true if they currently work there (no end date, or says "Present").
8. The overallScore (0-100) should be calculated based on:
   - Completeness of information (20 points)
   - Number and quality of skills (20 points)
   - Work experience depth and relevance (25 points)
   - Education quality (15 points)
   - Projects and certifications (10 points)
   - Overall presentation and clarity (10 points)
9. DO NOT invent or hallucinate information that is not in the resume.
10. If "References available upon request" is written, set references to empty array.
`;

  try {
    const parsed = await generateJSON<IParsedResume>(prompt);

    // Validate and clean the result
    return {
      name: parsed.name || null,
      email: parsed.email || null,
      phone: parsed.phone || null,
      location: parsed.location || null,
      summary: parsed.summary || null,
      skills: Array.isArray(parsed.skills) ? parsed.skills.filter(Boolean) : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      totalExperienceYears: parsed.totalExperienceYears || 0,
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
      languages: Array.isArray(parsed.languages) ? parsed.languages : [],
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
      volunteerWork: Array.isArray(parsed.volunteerWork) ? parsed.volunteerWork : [],
      hobbies: Array.isArray(parsed.hobbies) ? parsed.hobbies : [],
      references: Array.isArray(parsed.references) ? parsed.references : [],
      linkedinUrl: parsed.linkedinUrl || undefined,
      githubUrl: parsed.githubUrl || undefined,
      portfolioUrl: parsed.portfolioUrl || undefined,
      websiteUrl: parsed.websiteUrl || undefined,
      overallScore: parsed.overallScore || 0,
    } as IParsedResume;
  } catch (error) {
    console.error("Resume parsing error:", error);
    throw new Error("Failed to parse resume with AI");
  }
}
