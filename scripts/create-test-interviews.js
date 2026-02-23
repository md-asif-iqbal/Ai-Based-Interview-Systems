require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });
const { MongoClient } = require('mongodb');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const MONGODB_URI = "mongodb+srv://asifnaasmind_db_user:H8yd9uzKzfmnfF0Y@cluster0.krmw4r6.mongodb.net/naasmind?retryWrites=true&w=majority&appName=Cluster0";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });

const COMPANIES = [
  { name: "TechNova Solutions", logo: "🚀" },
  { name: "BrightCode Labs", logo: "💡" },
  { name: "PixelCraft Digital", logo: "🎨" },
  { name: "CloudSpark Inc", logo: "☁️" },
];

// AI-generate 8 questions based on job description + candidate CV
async function generateQuestionsWithAI(companyName, jobTitle, jobDescription, requiredSkills, candidateSkills, candidateExperience) {
  const prompt = `You are an expert interviewer at ${companyName}. Generate exactly 8 interview questions for this candidate.

JOB INFO:
Company: ${companyName}
Job Title: ${jobTitle}
Description: ${jobDescription}
Required Skills: ${requiredSkills.join(', ')}

CANDIDATE CV:
Skills: ${candidateSkills.join(', ')}
Experience: ${candidateExperience}

Distribution:
- 3 Technical questions (specific to the job's required skills and the candidate's CV gaps)
- 3 Behavioral questions (past experience using STAR format)
- 2 Situational questions (what would you do if...)

Return ONLY valid JSON:
{
  "questions": [
    {
      "questionText": "full question text",
      "category": "technical",
      "difficulty": "easy",
      "expectedKeywords": ["kw1", "kw2", "kw3", "kw4", "kw5"]
    }
  ]
}

Rules:
- Q1 must be a warm intro/background question mentioning ${companyName}
- Questions must be specific to THIS job and THIS candidate's CV — not generic
- Identify skill gaps between required and candidate skills and ask about them
- Include exactly 5 expectedKeywords per question
- Order: easy → medium → hard
- Do NOT include timeLimitSeconds
- Return ONLY the JSON, no extra text`;

  try {
    const result = await geminiModel.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(text);

    if (!parsed.questions || parsed.questions.length === 0) {
      throw new Error('Empty questions from AI');
    }

    return parsed.questions.map((q, i) => ({
      questionText: q.questionText,
      question: q.questionText,
      category: q.category,
      difficulty: q.difficulty,
      expectedKeywords: q.expectedKeywords || [],
      timeLimit: 60,
      timeLimitSeconds: 60,
      order: i + 1,
    }));
  } catch (err) {
    console.error('  ⚠️  AI generation failed:', err.message, '— using fallback questions');
    // Minimal fallback if AI fails
    return [
      { questionText: `Welcome to ${companyName}! Please introduce yourself and tell us about your experience with ${requiredSkills[0] || 'your main skill'}.`, question: `Welcome to ${companyName}! Please introduce yourself.`, category: 'behavioral', difficulty: 'easy', expectedKeywords: ['experience', 'background', 'skills', 'projects', 'motivation'], timeLimit: 60, timeLimitSeconds: 60, order: 1 },
      { questionText: `What experience do you have with ${requiredSkills.slice(0, 3).join(', ')}? Give a specific example.`, question: `Experience with ${requiredSkills[0]}?`, category: 'technical', difficulty: 'easy', expectedKeywords: requiredSkills.slice(0, 5), timeLimit: 60, timeLimitSeconds: 60, order: 2 },
      { questionText: `Describe a challenging project you worked on as a ${jobTitle}. What was your approach?`, question: 'Challenging project?', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['challenge', 'solution', 'result', 'learning', 'team'], timeLimit: 60, timeLimitSeconds: 60, order: 3 },
      { questionText: `How would you handle a situation where a deadline is approaching but the feature isn't ready?`, question: 'Deadline pressure?', category: 'situational', difficulty: 'medium', expectedKeywords: ['priority', 'communication', 'planning', 'tradeoff', 'delivery'], timeLimit: 60, timeLimitSeconds: 60, order: 4 },
      { questionText: `What's your approach to writing clean, maintainable code?`, question: 'Code quality?', category: 'technical', difficulty: 'medium', expectedKeywords: ['clean code', 'testing', 'review', 'documentation', 'refactoring'], timeLimit: 60, timeLimitSeconds: 60, order: 5 },
      { questionText: `Tell me about a time you had to learn a new technology quickly for a project.`, question: 'Learning new tech?', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['learning', 'adapt', 'research', 'apply', 'result'], timeLimit: 60, timeLimitSeconds: 60, order: 6 },
      { questionText: `If you found a critical bug in production, what steps would you take?`, question: 'Production bug?', category: 'situational', difficulty: 'hard', expectedKeywords: ['hotfix', 'communication', 'rollback', 'root cause', 'prevention'], timeLimit: 60, timeLimitSeconds: 60, order: 7 },
      { questionText: `Where do you see yourself growing in the next 2 years, and how does this role at ${companyName} fit those goals?`, question: 'Career goals?', category: 'behavioral', difficulty: 'easy', expectedKeywords: ['growth', 'goals', 'skills', 'team', 'contribute'], timeLimit: 60, timeLimitSeconds: 60, order: 8 },
    ];
  }
}

async function main() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('naasmind');

    // ─── Find candidate user ───
    const candidateUser = await db.collection('users').findOne({
      $or: [
        { email: 'candidate@example.com' },
        { role: 'candidate' }
      ]
    });
    if (!candidateUser) {
      console.log('❌ No candidate user found. Create one first.');
      return;
    }
    console.log(`✅ Candidate: ${candidateUser.fullName} (${candidateUser.email})`);

    // Get or create candidate profile
    let candidateProfile = await db.collection('candidates').findOne({ userId: candidateUser._id });
    if (!candidateProfile) {
      const result = await db.collection('candidates').insertOne({
        userId: candidateUser._id,
        skills: ["JavaScript", "React", "HTML", "CSS", "TypeScript", "Next.js", "Tailwind CSS", "Git"],
        parsedResume: {
          skills: ["JavaScript", "React", "HTML", "CSS", "TypeScript", "Next.js", "Tailwind CSS"],
          experience: [
            { position: "Frontend Developer Intern", company: "StartupXYZ", duration: "6 months" },
            { position: "Freelance Web Developer", company: "Self-employed", duration: "1 year" },
          ],
          education: [
            { degree: "BSc Computer Science", institution: "State University", year: "2024" }
          ],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      candidateProfile = await db.collection('candidates').findOne({ _id: result.insertedId });
      console.log('✅ Created candidate profile with resume data');
    } else {
      // Update resume if empty
      if (!candidateProfile.parsedResume || !candidateProfile.parsedResume.skills) {
        await db.collection('candidates').updateOne(
          { _id: candidateProfile._id },
          {
            $set: {
              skills: ["JavaScript", "React", "HTML", "CSS", "TypeScript", "Next.js", "Tailwind CSS", "Git"],
              parsedResume: {
                skills: ["JavaScript", "React", "HTML", "CSS", "TypeScript", "Next.js", "Tailwind CSS"],
                experience: [
                  { position: "Frontend Developer Intern", company: "StartupXYZ", duration: "6 months" },
                  { position: "Freelance Web Developer", company: "Self-employed", duration: "1 year" },
                ],
                education: [
                  { degree: "BSc Computer Science", institution: "State University", year: "2024" }
                ],
              },
            }
          }
        );
        console.log('✅ Updated candidate resume data');
      }
    }
    console.log(`✅ Candidate profile ID: ${candidateProfile._id}`);

    // ─── Find or create recruiter ───
    let recruiter = await db.collection('users').findOne({ role: 'recruiter' });
    if (!recruiter) {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('password123', 10);
      const result = await db.collection('users').insertOne({
        fullName: 'Recruiter Admin',
        email: 'recruiter@example.com',
        password: hash,
        role: 'recruiter',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      recruiter = await db.collection('users').findOne({ _id: result.insertedId });
      console.log('✅ Created recruiter user');
    }
    console.log(`✅ Recruiter: ${recruiter.fullName} (${recruiter.email})`);

    // ─── Create 4 Jobs + 4 Applications + 4 Interviews ───
    const interviewIds = [];

    for (let i = 0; i < 4; i++) {
      const company = COMPANIES[i];
      const jobTitle = "Junior Frontend Developer";

      console.log(`\n📋 Creating job ${i + 1}/4: ${jobTitle} at ${company.name}...`);

      // Create job
      const jobResult = await db.collection('jobpostings').insertOne({
        title: jobTitle,
        description: `${company.name} is looking for a passionate Junior Frontend Developer to join our growing team. You'll work with React, TypeScript, and modern frontend tools to build beautiful, responsive web applications. This is a great opportunity for someone early in their career who wants to grow fast in a supportive environment.`,
        location: i % 2 === 0 ? "Remote" : "Dhaka, Bangladesh",
        type: i % 2 === 0 ? "remote" : "full-time",
        experienceLevel: "entry",
        status: "active",
        postedBy: recruiter._id,
        requirements: {
          skills: ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind CSS", "Git"],
          experienceYears: 1,
          education: "Bachelor's degree in CS or related field",
        },
        responsibilities: [
          "Build and maintain responsive UI components using React",
          "Write clean, maintainable TypeScript code",
          "Collaborate with designers and backend developers",
          "Participate in code reviews and team standups",
          "Debug and fix frontend issues",
        ],
        salary: {
          min: 25000 + (i * 5000),
          max: 45000 + (i * 5000),
          currency: "USD",
        },
        applicationCount: 1,
        createdAt: new Date(Date.now() - (i * 86400000)), // stagger dates
        updatedAt: new Date(),
      });
      const jobId = jobResult.insertedId;
      console.log(`  ✅ Job created: ${jobId}`);

      // Create application with good match score
      const matchScore = 65 + Math.floor(Math.random() * 25); // 65-89%
      const appResult = await db.collection('applications').insertOne({
        jobId: jobId,
        candidateId: candidateProfile._id,
        status: "interview_scheduled",
        resumeMatchScore: matchScore,
        coverLetter: `I'm excited to apply for the Junior Frontend Developer position at ${company.name}. With my experience in React, TypeScript, and modern web development, I believe I can make a meaningful contribution to your team.`,
        createdAt: new Date(Date.now() - (i * 86400000) + 3600000),
        updatedAt: new Date(),
      });
      const appId = appResult.insertedId;
      console.log(`  ✅ Application created: ${appId} (match: ${matchScore}%)`);

      // AI-generate 8 questions based on job description + candidate CV
      const candidateSkills = candidateProfile.parsedResume?.skills || ["JavaScript", "React", "HTML", "CSS"];
      const candidateExperience = (candidateProfile.parsedResume?.experience || [])
        .map(e => `${e.position} at ${e.company}`).join(', ') || 'No experience listed';
      const requiredSkills = ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind CSS", "Git"];
      const jobDescription = `${company.name} is looking for a passionate ${jobTitle} to build responsive web applications using React, TypeScript, and modern tools.`;

      console.log(`  🤖 Generating AI questions for ${jobTitle} at ${company.name}...`);
      const questions = await generateQuestionsWithAI(
        company.name,
        jobTitle,
        jobDescription,
        requiredSkills,
        candidateSkills,
        candidateExperience
      );
      console.log(`  ✅ AI generated ${questions.length} questions`);

      const interviewResult = await db.collection('interviews').insertOne({
        applicationId: appId,
        interviewType: "technical",
        scheduledAt: new Date(),
        mode: "ai_conducted",
        status: "ready",
        questions: questions,
        answers: [],
        totalViolations: 0,
        securityScore: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const interviewId = interviewResult.insertedId;
      interviewIds.push(interviewId);
      console.log(`  ✅ Interview created: ${interviewId} (${questions.length} AI questions, 60s each)`);
    }

    console.log('\n' + '═'.repeat(60));
    console.log('🎉 ALL DONE! Created 4 jobs + 4 applications + 4 interviews');
    console.log('═'.repeat(60));
    console.log('\n📝 Interview IDs (use these to test):');
    interviewIds.forEach((id, i) => {
      console.log(`  ${i + 1}. ${COMPANIES[i].name}: http://localhost:3000/interview/${id}`);
    });
    console.log(`\n🔑 Login: ${candidateUser.email} / password123`);
    console.log('📊 Recruiter: recruiter@example.com / password123');
    console.log(`\n⏱️  Each question: 60 seconds (1 min) — AI-generated, job+CV specific`);
    console.log('🎤 Voice-only answers — speak clearly!');
    console.log('📋 8 questions per interview: Intro → Technical → Behavioral → Situational\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

main();
