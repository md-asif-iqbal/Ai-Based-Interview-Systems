# SoftLanding - AI-Powered Interview Platform

A comprehensive, next-generation interview platform powered by Google Gemini AI with advanced proctoring capabilities, intelligent resume matching, and automated interview evaluation.

## 🚀 Features

### For Candidates
- **Smart Resume Analysis**: AI-powered resume parsing and matching with job requirements
- **AI-Generated Cover Letters**: Personalized cover letters based on job descriptions
- **Real-time Interview Experience**: Live video interviews with AI-generated questions
- **Comprehensive Dashboard**: Track applications, upcoming interviews, and resume status
- **Automated Feedback**: Instant evaluation of interview responses

### For Recruiters
- **Intelligent Job Posting**: Create jobs with AI-assisted descriptions
- **Automated Applicant Screening**: AI-powered resume matching and ranking
- **Interview Management**: Schedule and manage interviews with candidates
- **Advanced Analytics**: Track hiring metrics and candidate performance
- **Bulk Operations**: Efficiently manage multiple applications

### AI Interview System
- **Dynamic Question Generation**: Context-aware questions based on job requirements
- **Real-time Proctoring**: Multi-layered security monitoring
  - Face detection and tracking
  - Tab switching detection
  - Fullscreen enforcement
  - Copy/paste blocking
  - Screen recording
  - Voice-to-text transcription
- **Automated Evaluation**: AI-powered answer scoring across multiple criteria
- **Security Reports**: Comprehensive violation tracking and analysis

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** with App Router and Turbopack
- **React 19** with Server Components
- **TypeScript** (Strict mode)
- **Tailwind CSS v4** with custom design system
- **shadcn/ui** - 22+ components
- **Framer Motion** - Smooth animations
- **Zustand** - State management
- **React Hook Form** + Zod - Form validation

### Backend
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with httpOnly cookies
- **Google Gemini AI** (gemini-1.5-flash)
- **Node.js** runtime
- **bcryptjs** - Password hashing

### AI Capabilities
- Resume parsing and analysis
- Interview question generation
- Answer evaluation with multi-criteria scoring
- Cover letter generation
- Professional summary generation

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MongoDB database (local or Atlas)
- Google Gemini API key

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd naasmind
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/naasmind
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/naasmind

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars
JWT_EXPIRES_IN=7d

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key-here

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Build the project**
```bash
npm run build
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Mode
```bash
npm run build
npm start
```

## 🔑 Demo Credentials

The login page includes demo credentials for quick testing:

**Candidate Account:**
- Email: `candidate@example.com`
- Password: `password123`

**Recruiter Account:**
- Email: `recruiter@example.com`
- Password: `password123`

## 📁 Project Structure

```
naasmind/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, signup)
│   │   ├── (candidate)/       # Candidate dashboard
│   │   ├── (interview)/       # Interview interface
│   │   ├── (public)/          # Public pages (jobs)
│   │   ├── api/               # API routes
│   │   └── recruiter/         # Recruiter dashboard
│   ├── components/            # React components
│   │   ├── forms/            # Form components
│   │   ├── interview/        # Interview-specific components
│   │   ├── resume/           # Resume components
│   │   ├── shared/           # Shared components (Navbar, Footer)
│   │   └── ui/               # shadcn/ui components
│   ├── hooks/                # Custom React hooks
│   │   └── interview/        # Interview security hooks
│   ├── lib/                  # Core utilities
│   │   ├── auth/            # JWT authentication
│   │   ├── db/              # MongoDB connection
│   │   ├── gemini/          # Gemini AI integration
│   │   └── utils/           # Utility functions
│   ├── models/              # Mongoose models
│   ├── store/               # Zustand stores
│   └── types/               # TypeScript types
├── .env.local               # Environment variables
├── next.config.ts           # Next.js configuration
└── package.json             # Dependencies
```

## 🔐 Security Features

### Interview Proctoring
- **Face Detection**: Monitors candidate presence during interview
- **Fullscreen Enforcement**: Ensures focus on interview interface
- **Tab Switch Detection**: Tracks when candidate leaves the tab
- **Copy/Paste Blocking**: Prevents cheating via clipboard
- **Screen Recording**: Optional screen capture
- **Video Recording**: Records candidate during interview
- **Violation Logging**: Real-time tracking of security breaches

### Authentication
- JWT-based authentication with httpOnly cookies
- Password hashing with bcrypt (12 rounds)
- Role-based access control (Candidate/Recruiter)
- Protected API routes with middleware

## 🎨 Design System

Custom color palette using OKLCH color space:
- **Primary**: Cyan/Teal gradient
- **Accent**: Purple tones
- **Semantic**: Success (green), Warning (yellow), Destructive (red)
- **Dark Mode**: Full support with automatic switching

## 📊 API Routes

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - List all jobs (with search/filters)
- `POST /api/jobs` - Create new job (Recruiter only)
- `GET /api/jobs/[id]` - Get job details
- `PUT /api/jobs/[id]` - Update job (Recruiter only)
- `DELETE /api/jobs/[id]` - Delete job (Recruiter only)

### Applications
- `POST /api/applications` - Apply for job
- `GET /api/applications/my` - Get user's applications
- `GET /api/applications/[id]` - Get application details
- `PUT /api/applications/[id]` - Update application status

### Resume
- `POST /api/resume/upload` - Upload and parse resume with AI

### Interviews
- `POST /api/interviews` - Create interview
- `GET /api/interviews/[id]` - Get interview details
- `POST /api/interviews/[id]/start` - Start interview
- `POST /api/interviews/[id]/answer` - Submit answer
- `POST /api/interviews/[id]/complete` - Complete interview
- `POST /api/interviews/[id]/violations` - Log security violations

### AI Services
- `POST /api/ai/generate-questions` - Generate interview questions
- `POST /api/ai/evaluate-answer` - Evaluate interview answer
- `POST /api/ai/generate-cover-letter` - Generate cover letter

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production
Make sure to set all variables from `.env.local` in your hosting platform.

### MongoDB Atlas Setup
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster and database
3. Whitelist your deployment IP/network
4. Copy connection string to `MONGODB_URI`

### Gemini API Setup
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Set as `GEMINI_API_KEY` environment variable

## 🐛 Known Issues

- Mongoose duplicate index warnings (non-critical, safe to ignore)
- Next.js 16 middleware deprecation warning (will be updated)

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Google Gemini AI, and modern web technologies.
