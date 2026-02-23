# 🚀 Quick Start Guide - SoftLanding

Get up and running with SoftLanding in under 5 minutes!

---

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] MongoDB installed locally OR MongoDB Atlas account
- [ ] Google Gemini API key ([Get it here](https://makersuite.google.com/app/apikey))
- [ ] Git installed (optional, for cloning)

---

## Step 1: Install Dependencies (1 minute)

```bash
cd naasmind
npm install
```

---

## Step 2: Configure Environment (2 minutes)

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set these **required** variables:

```env
# MongoDB - Use ONE of these:
# Option A: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/naasmind

# Option B: MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/naasmind

# JWT Secret - Generate a random string
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# Gemini API - Get from https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key-here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Generate JWT Secret (MacOS/Linux)
```bash
openssl rand -base64 32
```

### Start Local MongoDB (if using local)
```bash
# MacOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Start MongoDB service from Services app
```

---

## Step 3: Seed Database (1 minute)

Populate the database with demo data:

```bash
npm run seed
```

This creates:
- 2 recruiter accounts
- 3 candidate accounts  
- 3 companies
- 5 job postings
- Demo candidate profiles

**Demo Credentials:**
- Recruiter: `recruiter@example.com` / `password123`
- Candidate: `candidate@example.com` / `password123`

---

## Step 4: Start Development Server (30 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

---

## ✅ Verify Installation

### Test These Features:

1. **Homepage** - Should load with hero and features
   - Visit: `http://localhost:3000`

2. **Login** - Try demo credentials
   - Visit: `http://localhost:3000/login`
   - Email: `candidate@example.com`
   - Password: `password123`

3. **Jobs Page** - Should show seeded jobs
   - Visit: `http://localhost:3000/jobs`

4. **Candidate Dashboard** - After logging in as candidate
   - Visit: `http://localhost:3000/dashboard`

5. **Recruiter Dashboard** - After logging in as recruiter
   - Visit: `http://localhost:3000/recruiter/dashboard`

---

## 🎯 What to Try First

### As a Candidate:
1. ✅ Browse available jobs at `/jobs`
2. ✅ Upload your resume (PDF or DOCX) - AI will parse it!
3. ✅ Apply for a job - Get AI match score
4. ✅ View your applications in dashboard
5. ✅ Generate an AI cover letter

### As a Recruiter:
1. ✅ Create a new job posting
2. ✅ View applicants with AI match scores
3. ✅ Schedule an interview
4. ✅ Review candidate profiles
5. ✅ View analytics

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Check if MongoDB is running
# MacOS/Linux:
ps aux | grep mongod

# Start MongoDB if not running:
brew services start mongodb-community
# or
sudo systemctl start mongod
```

### "Invalid Gemini API Key"
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Copy to `.env.local` as `GEMINI_API_KEY`
4. Restart dev server (`Ctrl+C`, then `npm run dev`)

### "Port 3000 already in use"
```bash
# Use a different port:
PORT=3001 npm run dev

# Or find and kill the process using port 3000:
# MacOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Build Errors
```bash
# Clear cache and reinstall:
rm -rf .next node_modules
npm install
npm run dev
```

---

## 📚 Next Steps

1. **Read the Full Documentation**
   - [README.md](./README.md) - Complete feature list and API docs
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
   - [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Technical overview

2. **Customize for Your Needs**
   - Update colors in `src/app/globals.css`
   - Modify landing page content
   - Add your branding/logo

3. **Deploy to Production**
   - Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Deploy to Vercel (recommended)
   - Set up MongoDB Atlas
   - Configure production environment variables

---

## 🎓 Key Technologies

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, MongoDB, Mongoose
- **AI**: Google Gemini (gemini-1.5-flash)
- **Auth**: JWT with httpOnly cookies
- **UI**: shadcn/ui components
- **State**: Zustand
- **Forms**: React Hook Form + Zod

---

## 🆘 Need Help?

- **Issues**: Check existing issues or create new one
- **Documentation**: See README.md and DEPLOYMENT.md
- **MongoDB Help**: [MongoDB Docs](https://docs.mongodb.com)
- **Next.js Help**: [Next.js Docs](https://nextjs.org/docs)
- **Gemini API**: [Google AI Docs](https://ai.google.dev/docs)

---

## 🎉 You're Ready!

Your AI interview platform is now running at **http://localhost:3000**

Explore the features, test the AI capabilities, and customize to your needs!

---

*Need to deploy? See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup.*
