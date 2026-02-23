const { MongoClient, ObjectId } = require('mongodb');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const MONGODB_URI = "mongodb+srv://asifnaasmind_db_user:H8yd9uzKzfmnfF0Y@cluster0.krmw4r6.mongodb.net/naasmind?retryWrites=true&w=majority&appName=Cluster0";
const GEMINI_API_KEY = "AIzaSyB1TF0prW47mdj5IAsUV_lSnQvsM7Q1zdE";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function createDemoInterview() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('naasmind');
    
    // Get candidate user (Alice or candidate@example.com)
    let candidate = await db.collection('users').findOne({ 
      $or: [
        { email: 'candidate@example.com' },
        { fullName: /alice/i },
        { email: /alice/i }
      ]
    });
    
    // If no Alice found, use candidate@example.com
    if (!candidate) {
      candidate = await db.collection('users').findOne({ email: 'candidate@example.com' });
    }
    
    if (!candidate) {
      console.log('❌ No candidate user found');
      return;
    }
    console.log('✅ Found candidate:', candidate.email, '(' + candidate.fullName + ')');
    
    // Get candidate profile
    const candidateProfile = await db.collection('candidates').findOne({ userId: candidate._id });
    if (!candidateProfile) {
      console.log('❌ Candidate profile not found');
      return;
    }
    console.log('✅ Found candidate profile');
    
    // Get an application for this candidate
    let application = await db.collection('applications').findOne({ 
      candidateId: candidateProfile._id 
    });
    
    if (!application) {
      console.log('⚠️  No application found, creating one...');
      
      // Get first available job
      const job = await db.collection('jobpostings').findOne({});
      if (!job) {
        console.log('❌ No jobs found in database');
        return;
      }
      
      // Create application
      const newApp = await db.collection('applications').insertOne({
        candidateId: candidateProfile._id,
        jobId: job._id,
        status: 'interview_scheduled',
        resumeMatchScore: 85,
        appliedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      application = {
        _id: newApp.insertedId,
        candidateId: candidateProfile._id,
        jobId: job._id
      };
      
      console.log('✅ Created application:', application._id);
    }
    
    console.log('✅ Found application:', application._id);
    
    // Check if interview already exists - delete ALL old interviews for this app
    const existingCount = await db.collection('interviews').countDocuments({
      applicationId: application._id
    });
    
    if (existingCount > 0) {
      console.log('⚠️  Found', existingCount, 'existing interview(s), deleting...');
      await db.collection('interviews').deleteMany({ applicationId: application._id });
      console.log('✅ Deleted old interview(s)');
    }
    
    // Get job details for questions
    const job = await db.collection('jobpostings').findOne({ _id: application.jobId });
    if (!job) {
      console.log('❌ Job not found');
      return;
    }
    console.log('✅ Found job:', job.title);
    
    // Get candidate profile with resume data (already fetched above, just reuse)
    let resumeData = '';
    
    if (candidateProfile?.parsedResume) {
      const resume = candidateProfile.parsedResume;
      resumeData = `
Resume Summary:
- Name: ${resume.fullName || 'N/A'}
- Skills: ${resume.skills?.join(', ') || 'N/A'}
- Experience: ${resume.experience?.map(e => `${e.position} at ${e.company}`).join(', ') || 'N/A'}
- Education: ${resume.education?.map(e => `${e.degree} from ${e.institution}`).join(', ') || 'N/A'}
`;
      console.log('✅ Found candidate resume data');
    } else {
      console.log('⚠️  No resume data found, using generic questions');
    }
    
    // Generate AI interview questions based on job and resume
    console.log('🤖 Generating 15 AI questions based on job position and resume...');
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
You are an expert international-standard technical interviewer conducting a professional AI interview. Generate exactly 15 comprehensive interview questions for this job position and candidate.

JOB DETAILS:
Title: ${job.title}
Description: ${job.description}
Required Skills: ${job.requirements?.skills?.join(', ') || 'N/A'}
Experience Required: ${job.requirements?.experienceYears || 0} years
Department: ${job.department || 'N/A'}

${resumeData}

Generate exactly 15 detailed questions following this distribution:
- 6 Technical questions (testing specific skills from job requirements - in-depth coding, system design, architecture)
- 5 Behavioral questions (STAR method - leadership, teamwork, communication, career motivation, conflict resolution)
- 4 Situational questions (problem-solving, decision making, company fit, handling deadlines and pressure)

IMPORTANT: Questions should be PERSONALIZED and DETAILED based on:
1. The candidate's resume skills and experience
2. The job requirements and description
3. Specific technologies mentioned in the job posting

Start with easier questions and gradually increase difficulty. Mix categories naturally like a real interview.

Each question should require about 2 minutes to answer properly.

CRITICAL: Use ONLY these category values: "technical", "behavioral", or "situational"
CRITICAL: Generate EXACTLY 15 questions.

Return ONLY a JSON array with this structure:
[
  {
    "question": "The full question text (clear, professional, and conversational)",
    "category": "technical" | "behavioral" | "situational",
    "difficulty": "easy" | "medium" | "hard",
    "expectedKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7"],
    "timeLimit": 120
  }
]

Make questions specific, relevant, and personalized to THIS job and THIS candidate.
Questions should sound natural and conversational, as if a real interviewer is speaking.
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean JSON response
      text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }
      
      const aiQuestions = JSON.parse(text);
      console.log('✅ Generated', aiQuestions.length, 'AI-powered questions');
      
      // Format questions for database
      const questions = aiQuestions.map((q, index) => ({
        _id: new ObjectId(),
        question: q.question,
        questionText: q.question,
        category: q.category,
        difficulty: q.difficulty,
        expectedKeywords: q.expectedKeywords || [],
        timeLimit: 120, // 2 minutes per question
        order: index + 1
      }));
      
      // Create interview with AI-generated questions
      const interview = {
        applicationId: application._id,
        interviewType: 'technical',
        scheduledAt: new Date(),
        mode: 'ai_conducted',
        status: 'ready',
        questions: questions,
        answers: [],
        totalViolations: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const insertResult = await db.collection('interviews').insertOne(interview);
      console.log('✅ Demo interview created:', insertResult.insertedId);
      console.log('✅ Interview has', interview.questions.length, 'AI-generated questions');
      console.log('');
      console.log('📋 Sample questions:');
      interview.questions.slice(0, 2).forEach((q, i) => {
        console.log(`   ${i + 1}. ${q.question.substring(0, 80)}...`);
      });
      console.log('');
    } catch (error) {
      console.error('❌ AI generation failed:', error.message);
      console.log('⚠️  Falling back to generic questions...');
      
      // Fallback to generic questions if AI fails
      const fallbackQuestions = [
        {
          _id: new ObjectId(),
          question: `Explain in detail your experience with ${job.requirements?.skills?.[0] || 'software development'}, including specific projects, challenges, and outcomes.`,
          questionText: `Explain in detail your experience with ${job.requirements?.skills?.[0] || 'software development'}, including specific projects, challenges, and outcomes.`,
          category: "technical",
          difficulty: "medium",
          expectedKeywords: ["experience", "projects", "skills", job.requirements?.skills?.[0] || "development", "challenges", "solutions", "outcomes"],
          timeLimit: 120,
          order: 1
        },
        {
          _id: new ObjectId(),
          question: `Describe a complex technical problem you solved in your previous role. Walk me through your problem-solving approach, the technologies you used, and the impact of your solution.`,
          questionText: `Describe a complex technical problem you solved in your previous role. Walk me through your problem-solving approach, the technologies you used, and the impact of your solution.`,
          category: "situational",
          difficulty: "medium",
          expectedKeywords: ["problem", "solution", "approach", "result", "impact", "technologies"],
          timeLimit: 120,
          order: 2
        },
        {
          _id: new ObjectId(),
          question: `Tell me about a time when you had to learn a new technology or framework quickly. What was your learning process, and how did you apply it to your work?`,
          questionText: `Tell me about a time when you had to learn a new technology or framework quickly. What was your learning process, and how did you apply it to your work?`,
          category: "behavioral",
          difficulty: "medium",
          expectedKeywords: ["learning", "technology", "process", "application", "adaptation"],
          timeLimit: 120,
          order: 3
        },
        {
          _id: new ObjectId(),
          question: `Why are you interested in the ${job.title} position at our company? How do you see yourself contributing to our team and growing in this role?`,
          questionText: `Why are you interested in the ${job.title} position at our company? How do you see yourself contributing to our team and growing in this role?`,
          category: "behavioral",
          difficulty: "easy",
          expectedKeywords: ["motivation", "interest", "company", "goals", "contribution", "growth"],
          timeLimit: 120,
          order: 4
        }
      ];
      
      const interview = {
        applicationId: application._id,
        interviewType: 'technical',
        scheduledAt: new Date(),
        mode: 'ai_conducted',
        status: 'ready',
        questions: fallbackQuestions,
        answers: [],
        totalViolations: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const insertResult = await db.collection('interviews').insertOne(interview);
      console.log('✅ Interview created with fallback questions:', insertResult.insertedId);
    }
    console.log('🎉 Success! Now you can:');
    console.log(`   1. Login as ${candidate.email} / password123`);
    console.log('   2. Go to Dashboard');
    console.log('   3. Click "Interviews" tab');
    console.log('   4. Click "Join" button to start the interview');
    console.log('');
    console.log('📹 The interview will have:');
    console.log('   - Live video call with camera');
    console.log('   - AI voice reading questions');
    console.log('   - Voice-to-text for answers');
    console.log('   - Face detection & proctoring');
    console.log('   - Security monitoring');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('✅ Connection closed');
  }
}

createDemoInterview();
