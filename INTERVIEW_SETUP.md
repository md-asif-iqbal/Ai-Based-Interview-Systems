# AI-Powered Interview System - Complete Setup ✅

## ✨ Features Implemented

### 1. **10 AI-Generated Questions** (20 minutes each)
- Questions personalized based on:
  - Candidate's resume (skills, experience, projects)
  - Job requirements (title, description, required skills)
- Generated using Gemini AI (gemini-2.5-flash)
- Distribution:
  - 4 Technical questions (job-specific)
  - 2 Behavioral questions
  - 2 Situational questions
  - 1 Company fit question
  - 1 Career goals question

### 2. **1 Minute Preparation Time**
- Countdown timer: `1:00` → `0:00`
- Shows helpful tips during preparation:
  - Find a quiet, well-lit place
  - Check camera and microphone
  - Have water nearby
  - Remember: 20 minutes per question
- Auto-starts first question when timer reaches zero

### 3. **20 Minutes Per Question**
- Each question has 1200 seconds (20 minutes)
- Timer shows remaining time: `20:00` → `0:00`
- Auto-advances to next question when time expires

## 🚀 How to Use

### Step 1: Generate Demo Interview
```bash
cd naasmind
node scripts/create-demo-interview.js
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Access Interview
1. Go to: http://localhost:3000
2. Login as:
   - Email: `candidate@example.com`
   - Password: `password123`
3. Navigate to: **Dashboard** → **Interviews** tab
4. Click: **Join** button

## 📋 Interview Flow

### Phase 1: Start Screen
- Shows interview requirements
- Camera/microphone access
- Fullscreen mode
- AI security monitoring
- Click "Start Interview" button

### Phase 2: Preparation (1 minute)
```
┌────────────────────────────┐
│    🕐 Prepare Yourself     │
│                            │
│         1:00               │
│                            │
│   Quick Tips:              │
│   1. Find quiet place      │
│   2. Check camera/mic      │
│   3. Have water nearby     │
│   4. Take your time        │
└────────────────────────────┘
```
- 60-second countdown
- Display helpful tips
- Auto-transitions to Q1

### Phase 3: Questions (10 × 20 min)
```
Question 1 of 10                 [🔊 Listen]
⏱️ Time: 20:00

[AI reads question aloud]

Your Answer:
┌──────────────────────────────┐
│ Type or use voice input...   │
│                              │
│ [🎤 Voice] [Submit Answer]   │
└──────────────────────────────┘

Security Score: 95% ✅
Progress: [■■□□□□□□□□] 1/10
```
- AI voice reads each question
- 20 minutes per question
- Voice-to-text OR text input
- Camera recording
- Face detection
- Security monitoring

### Phase 4: Complete
- Shows results
- AI evaluation
- Overall score
- Redirect to results page

## 🎯 Key Features

### AI Voice (Text-to-Speech)
- Automatically reads questions aloud
- Click "Listen" button to replay
- Click "Stop" to pause voice
- Rate: 0.9x speed, Pitch: 1.0

### Voice Input (Speech-to-Text)
- Click "Voice" button to start
- Speak your answer
- Live transcript appears
- Click "Stop" to finish

### Security Monitoring
- **Face Detection**: Ensures candidate is visible
- **Fullscreen Mode**: Prevents tab switching
- **Tab Focus**: Detects if user leaves interview
- **Recording**: Records entire interview
- **Violation Score**: 100% → 0% (terminates at 0%)

### Auto-Advance
- Timer hits `0:00` → auto-move to next question
- Last question → auto-complete interview

## 🔧 Technical Details

### Files Modified
1. **`scripts/create-demo-interview.js`**
   - Uses Gemini AI to generate questions
   - Analyzes resume + job requirements
   - Creates 10 questions × 1200 seconds

2. **`src/app/(interview)/interview/[id]/page.tsx`**
   - Added preparation state & timer (60 seconds)
   - Updated question timer (1200 seconds)
   - Added preparation UI component
   - Auto-transition after prep time

3. **`src/hooks/useTextToSpeech.ts`**
   - Web Speech API wrapper
   - Handles voice reading of questions

4. **`src/components/interview/QuestionDisplay.tsx`**
   - Listen/Stop speaker buttons
   - Voice control integration

### Configuration
- **Gemini Model**: `gemini-2.5-flash`
- **API Key**: Set in environment
- **Database**: MongoDB Atlas (naasmind)
- **Time Limits**:
  - Preparation: 60 seconds
  - Per Question: 1200 seconds (20 minutes)
  - Total: ~200 minutes (3.3 hours)

## 🐛 Troubleshooting

### Issue: Questions not AI-generated
**Solution**: Check Gemini API key in environment variables

### Issue: Voice not working
**Solution**: Allow microphone permissions in browser

### Issue: Camera not showing
**Solution**: Allow camera permissions in browser

### Issue: Preparation timer not showing
**Solution**: Clear cache and refresh browser

## 📊 Example AI Questions

Based on resume analysis + job requirements:

1. **Technical (React/Next.js)**:
   > "Given your experience with React, Next.js, Context API, and React Query, describe in detail how you would architect a real-time collaborative document editing feature..."

2. **Technical (Backend)**:
   > "Drawing from your expertise in Node.js, Express.js, Mongoose, and MongoDB, outline a comprehensive approach to designing and implementing a secure, scalable RESTful API..."

3. **Behavioral**:
   > "Tell me about a time when you had to make a significant architectural decision under pressure..."

4. **Situational**:
   > "Imagine you're tasked with migrating a legacy monolithic application to microservices..."

5. **Company Fit**:
   > "Based on your understanding of our organization and your career goals, how do you see yourself contributing to our team's mission..."

## ✅ Success Checklist

- [x] PDF parsing with full resume extraction
- [x] Gemini AI integration (gemini-2.5-flash)
- [x] 10 AI-powered personalized questions
- [x] 20 minutes per question (1200 seconds)
- [x] 1 minute preparation time
- [x] Text-to-speech (AI voice reads questions)
- [x] Speech-to-text (voice input for answers)
- [x] Video recording with camera
- [x] Face detection & proctoring
- [x] Security monitoring (fullscreen, tab focus)
- [x] Auto-advance on timeout
- [x] Complete interview flow

## 🎉 Ready to Interview!

Your AI-powered interview system is now complete with:
- ✅ Personalized AI questions
- ✅ 20-minute time limits
- ✅ 1-minute preparation
- ✅ Voice interaction
- ✅ Security monitoring

**Next Steps:**
1. Run: `node scripts/create-demo-interview.js`
2. Start: `npm run dev`
3. Login: candidate@example.com / password123
4. Join interview and test!

---
**Built with:** Next.js 16 + Gemini AI + MongoDB + Web Speech API
