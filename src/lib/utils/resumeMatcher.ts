import { IParsedResume } from "@/types";

interface JobRequirements {
  skills: string[];
  experienceYears: number;
  education: string;
}

interface MatchResult {
  totalScore: number;
  breakdown: {
    skillsScore: number;
    experienceScore: number;
    educationScore: number;
    qualityScore: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  recommendation: "Strong Match" | "Good Match" | "Moderate Match" | "Weak Match";
}

export function calculateResumeMatch(
  parsedResume: IParsedResume,
  jobRequirements: JobRequirements
): MatchResult {
  // 1. Skills Match (40 points)
  const { skillsScore, matchedSkills, missingSkills } = calculateSkillsMatch(
    parsedResume.skills || [],
    jobRequirements.skills || []
  );

  // 2. Experience Level (30 points)
  const experienceScore = calculateExperienceScore(
    parsedResume.totalExperienceYears || 0,
    jobRequirements.experienceYears || 0
  );

  // 3. Education (20 points)
  const educationScore = calculateEducationScore(
    parsedResume.education || [],
    jobRequirements.education || ""
  );

  // 4. Resume Quality (10 points)
  const qualityScore = calculateQualityScore(parsedResume);

  const totalScore = Math.min(100, Math.round(skillsScore + experienceScore + educationScore + qualityScore));

  let recommendation: MatchResult["recommendation"];
  if (totalScore >= 80) recommendation = "Strong Match";
  else if (totalScore >= 65) recommendation = "Good Match";
  else if (totalScore >= 45) recommendation = "Moderate Match";
  else recommendation = "Weak Match";

  return {
    totalScore,
    breakdown: {
      skillsScore: Math.round(skillsScore),
      experienceScore: Math.round(experienceScore),
      educationScore: Math.round(educationScore),
      qualityScore: Math.round(qualityScore),
    },
    matchedSkills,
    missingSkills,
    recommendation,
  };
}

function calculateSkillsMatch(
  candidateSkills: string[],
  requiredSkills: string[]
): { skillsScore: number; matchedSkills: string[]; missingSkills: string[] } {
  if (requiredSkills.length === 0) {
    return { skillsScore: 40, matchedSkills: [], missingSkills: [] };
  }

  const normalizedCandidate = candidateSkills.map((s) => s.toLowerCase().trim());
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skill of requiredSkills) {
    const normalized = skill.toLowerCase().trim();
    const found = normalizedCandidate.some(
      (cs) => cs === normalized || cs.includes(normalized) || normalized.includes(cs)
    );

    if (found) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  const matchRatio = matchedSkills.length / requiredSkills.length;
  return {
    skillsScore: matchRatio * 40,
    matchedSkills,
    missingSkills,
  };
}

function calculateExperienceScore(candidateYears: number, requiredYears: number): number {
  if (requiredYears === 0) return 30;
  const ratio = candidateYears / requiredYears;

  if (ratio >= 1) return 30;
  if (ratio >= 0.8) return 24;
  if (ratio >= 0.6) return 18;
  if (ratio >= 0.4) return 12;
  return 6;
}

function calculateEducationScore(
  education: { degree: string; institution: string; field?: string }[],
  requiredEducation: string
): number {
  if (!requiredEducation || education.length === 0) return 10;

  const required = requiredEducation.toLowerCase();
  const degreeHierarchy = ["phd", "master", "bachelor", "diploma", "certificate"];

  let bestScore = 0;

  for (const edu of education) {
    const degree = (edu.degree || "").toLowerCase();
    const field = (edu.field || "").toLowerCase();

    // Exact match
    if (degree.includes(required) || required.includes(degree)) {
      bestScore = Math.max(bestScore, 20);
    }
    // Higher degree
    else if (
      degreeHierarchy.indexOf(degree.split(" ")[0]) <
      degreeHierarchy.indexOf(required.split(" ")[0])
    ) {
      bestScore = Math.max(bestScore, 20);
    }
    // Related field
    else if (field && required.includes(field)) {
      bestScore = Math.max(bestScore, 15);
    }
    // Any degree
    else {
      bestScore = Math.max(bestScore, 10);
    }
  }

  return bestScore;
}

function calculateQualityScore(resume: IParsedResume): number {
  let score = 0;

  // Has quantifiable achievements (check for numbers in experience descriptions)
  const hasNumbers = resume.experience?.some((exp) => /\d+/.test(exp.description || ""));
  if (hasNumbers) score += 3;

  // Has professional links
  if (resume.linkedinUrl || resume.githubUrl || resume.portfolioUrl) score += 2;

  // Has multiple skills
  if ((resume.skills?.length || 0) >= 5) score += 2;

  // Has education details
  if ((resume.education?.length || 0) > 0) score += 2;

  // Has certifications
  if ((resume.certifications?.length || 0) > 0) score += 1;

  return Math.min(10, score);
}
