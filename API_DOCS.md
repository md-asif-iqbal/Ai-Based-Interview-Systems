# 📡 API Documentation - SoftLanding

Complete reference for all API endpoints in the SoftLanding platform.

**Base URL**: `http://localhost:3000/api` (development)

**Authentication**: JWT token in httpOnly cookie (automatically handled by browser)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Jobs](#jobs)
3. [Applications](#applications)
4. [Resume](#resume)
5. [Interviews](#interviews)
6. [AI Services](#ai-services)
7. [Error Responses](#error-responses)

---

## Authentication

### POST `/api/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "candidate" // or "recruiter"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "candidate"
  }
}
```

**Errors:**
- `400` - Validation error (missing fields, weak password)
- `409` - Email already registered

---

### POST `/api/auth/login`

Login to existing account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "candidate"
  }
}
```

**Errors:**
- `400` - Validation error
- `401` - Invalid credentials

---

### POST `/api/auth/logout`

Logout current user.

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET `/api/auth/me`

Get current authenticated user.

**Authentication Required**: Yes

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "candidate",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
- `401` - Not authenticated

---

## Jobs

### GET `/api/jobs`

Get list of all job postings with optional filters.

**Query Parameters:**
- `search` (optional) - Search in title/description/company
- `location` (optional) - Filter by location
- `jobType` (optional) - Filter by type: `full-time`, `part-time`, `contract`, `internship`
- `workMode` (optional) - Filter by mode: `remote`, `on-site`, `hybrid`
- `experienceLevel` (optional) - Filter by level: `entry`, `junior`, `mid`, `senior`, `lead`
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page
- `sort` (optional, default: `-createdAt`) - Sort field: `createdAt`, `title`, `salary`

**Example Request:**
```
GET /api/jobs?search=developer&location=San Francisco&jobType=full-time&page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "jobs": [
    {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "title": "Senior Full Stack Developer",
      "company": {
        "id": "65f1a2b3c4d5e6f7g8h9i0j2",
        "name": "TechCorp Solutions",
        "logo": "https://example.com/logo.png"
      },
      "location": "San Francisco, CA",
      "jobType": "full-time",
      "workMode": "hybrid",
      "experienceLevel": "senior",
      "salaryRange": {
        "min": 120000,
        "max": 180000,
        "currency": "USD"
      },
      "description": "We are seeking...",
      "requirements": ["5+ years experience", "..."],
      "skills": ["React", "Node.js", "TypeScript"],
      "benefits": ["Health Insurance", "401(k)"],
      "applicationDeadline": "2024-02-15T23:59:59.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### POST `/api/jobs`

Create a new job posting (Recruiter only).

**Authentication Required**: Yes (Recruiter)

**Request Body:**
```json
{
  "companyId": "65f1a2b3c4d5e6f7g8h9i0j2",
  "title": "Senior Full Stack Developer",
  "description": "We are seeking an experienced...",
  "requirements": [
    "5+ years of full-stack development",
    "Strong React and Node.js skills"
  ],
  "skills": ["React", "Node.js", "TypeScript"],
  "experienceLevel": "senior",
  "jobType": "full-time",
  "location": "San Francisco, CA",
  "workMode": "hybrid",
  "salaryRange": {
    "min": 120000,
    "max": 180000,
    "currency": "USD"
  },
  "benefits": ["Health Insurance", "401(k)"],
  "applicationDeadline": "2024-02-15T23:59:59.000Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Job posted successfully",
  "job": { /* full job object */ }
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Not a recruiter
- `400` - Validation error

---

### GET `/api/jobs/[id]`

Get details of a specific job.

**Response (200):**
```json
{
  "success": true,
  "job": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "title": "Senior Full Stack Developer",
    "company": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "name": "TechCorp Solutions",
      "description": "Leading tech company...",
      "logo": "https://example.com/logo.png",
      "website": "https://techcorp.com"
    },
    "recruiter": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "name": "Jane Recruiter"
    },
    /* ... all job fields ... */
  }
}
```

**Errors:**
- `404` - Job not found

---

### PUT `/api/jobs/[id]`

Update a job posting (Recruiter only, own jobs).

**Authentication Required**: Yes (Recruiter)

**Request Body:** (same as POST, all fields optional)

**Response (200):**
```json
{
  "success": true,
  "message": "Job updated successfully",
  "job": { /* updated job object */ }
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized (not your job)
- `404` - Job not found
- `400` - Validation error

---

### DELETE `/api/jobs/[id]`

Delete a job posting (Recruiter only, own jobs).

**Authentication Required**: Yes (Recruiter)

**Response (200):**
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized
- `404` - Job not found

---

## Applications

### POST `/api/applications`

Apply for a job (Candidate only).

**Authentication Required**: Yes (Candidate)

**Request Body:**
```json
{
  "jobId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "coverLetter": "I am excited to apply..." // optional
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j4",
    "job": { /* job details */ },
    "candidate": { /* candidate details */ },
    "status": "pending",
    "matchScore": {
      "overall": 85,
      "skills": 90,
      "experience": 80,
      "education": 85
    },
    "appliedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Not a candidate
- `404` - Job not found
- `409` - Already applied to this job
- `400` - Missing required fields

---

### GET `/api/applications/my`

Get current user's applications.

**Authentication Required**: Yes

**Query Parameters:**
- `status` (optional) - Filter by status: `pending`, `reviewing`, `shortlisted`, `rejected`, `accepted`
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Response (200):**
```json
{
  "success": true,
  "applications": [
    {
      "id": "65f1a2b3c4d5e6f7g8h9i0j4",
      "job": {
        "id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "title": "Senior Full Stack Developer",
        "company": {
          "name": "TechCorp Solutions",
          "logo": "https://example.com/logo.png"
        }
      },
      "status": "reviewing",
      "matchScore": {
        "overall": 85,
        "skills": 90,
        "experience": 80,
        "education": 85
      },
      "appliedAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-16T14:20:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### GET `/api/applications/[id]`

Get details of a specific application.

**Authentication Required**: Yes

**Response (200):**
```json
{
  "success": true,
  "application": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j4",
    "job": { /* full job object */ },
    "candidate": { /* full candidate object */ },
    "status": "reviewing",
    "matchScore": { /* scores */ },
    "coverLetter": "I am excited...",
    "reviewNotes": "Strong technical background", // recruiter only
    "appliedAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T14:20:00.000Z"
  }
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized (not your application)
- `404` - Application not found

---

### PUT `/api/applications/[id]`

Update application status (Recruiter only).

**Authentication Required**: Yes (Recruiter)

**Request Body:**
```json
{
  "status": "shortlisted", // or "reviewing", "rejected", "accepted"
  "reviewNotes": "Strong technical skills" // optional
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Application updated successfully",
  "application": { /* updated application */ }
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized
- `404` - Application not found
- `400` - Invalid status

---

## Resume

### POST `/api/resume/upload`

Upload and parse resume with AI (Candidate only).

**Authentication Required**: Yes (Candidate)

**Content-Type**: `multipart/form-data`

**Form Data:**
- `file` - PDF or DOCX file (max 5MB)

**Response (200):**
```json
{
  "success": true,
  "message": "Resume uploaded and parsed successfully",
  "data": {
    "resumeUrl": "/uploads/resumes/65f1a2b3_resume.pdf",
    "parsedResume": {
      "personalInfo": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "location": "San Francisco, CA",
        "linkedin": "linkedin.com/in/johndoe",
        "github": "github.com/johndoe"
      },
      "summary": "Experienced full-stack developer...",
      "skills": ["React", "Node.js", "TypeScript"],
      "experience": [
        {
          "title": "Senior Software Engineer",
          "company": "Tech Corp",
          "startDate": "2021-01-01T00:00:00.000Z",
          "endDate": "2024-01-01T00:00:00.000Z",
          "description": "Led development of...",
          "current": false
        }
      ],
      "education": [
        {
          "degree": "Bachelor of Science",
          "field": "Computer Science",
          "institution": "Stanford University",
          "startDate": "2015-09-01T00:00:00.000Z",
          "endDate": "2019-06-01T00:00:00.000Z",
          "gpa": 3.7
        }
      ],
      "certifications": [
        {
          "name": "AWS Solutions Architect",
          "issuer": "Amazon Web Services",
          "issueDate": "2022-06-01T00:00:00.000Z"
        }
      ],
      "projects": [
        {
          "name": "E-commerce Platform",
          "description": "Built scalable...",
          "technologies": ["React", "Node.js"],
          "url": "https://github.com/johndoe/project"
        }
      ]
    }
  }
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Not a candidate
- `400` - No file uploaded / Invalid file type / File too large
- `500` - AI parsing error

---

## Interviews

### POST `/api/interviews`

Create a new interview (Recruiter only).

**Authentication Required**: Yes (Recruiter)

**Request Body:**
```json
{
  "applicationId": "65f1a2b3c4d5e6f7g8h9i0j4",
  "scheduledAt": "2024-01-20T14:00:00.000Z",
  "duration": 60, // minutes
  "interviewType": "technical" // or "screening", "behavioral", "final"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Interview scheduled successfully",
  "interview": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j5",
    "application": { /* application details */ },
    "scheduledAt": "2024-01-20T14:00:00.000Z",
    "duration": 60,
    "interviewType": "technical",
    "status": "scheduled",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### GET `/api/interviews/[id]`

Get interview details.

**Authentication Required**: Yes

**Response (200):**
```json
{
  "success": true,
  "interview": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j5",
    "application": { /* application */ },
    "scheduledAt": "2024-01-20T14:00:00.000Z",
    "duration": 60,
    "interviewType": "technical",
    "status": "in-progress",
    "questions": [ /* if started */ ],
    "answers": [ /* candidate's answers */ ],
    "securityScore": 95,
    "totalViolations": 2,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### POST `/api/interviews/[id]/start`

Start an interview (generates AI questions).

**Authentication Required**: Yes (Candidate)

**Response (200):**
```json
{
  "success": true,
  "message": "Interview started",
  "interview": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j5",
    "status": "in-progress",
    "startedAt": "2024-01-20T14:00:00.000Z",
    "questions": [
      {
        "id": "q1",
        "text": "Explain the difference between REST and GraphQL",
        "category": "technical",
        "difficulty": "medium",
        "timeLimit": 180 // seconds
      }
    ]
  }
}
```

---

### POST `/api/interviews/[id]/answer`

Submit answer to interview question.

**Authentication Required**: Yes (Candidate)

**Request Body:**
```json
{
  "questionId": "q1",
  "answer": "REST is an architectural style...",
  "timeSpent": 120 // seconds
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Answer submitted successfully",
  "evaluation": {
    "score": 85,
    "feedback": "Good explanation of core concepts...",
    "strengths": ["Clear communication", "Technical accuracy"],
    "improvements": ["Could elaborate on scalability differences"]
  },
  "nextQuestion": { /* next question object or null if done */ }
}
```

---

### POST `/api/interviews/[id]/complete`

Complete an interview.

**Authentication Required**: Yes (Candidate)

**Response (200):**
```json
{
  "success": true,
  "message": "Interview completed successfully",
  "results": {
    "overallScore": 82,
    "technicalScore": 85,
    "communicationScore": 80,
    "securityScore": 95,
    "totalViolations": 2,
    "completedAt": "2024-01-20T15:00:00.000Z",
    "duration": 3600 // seconds
  }
}
```

---

### POST `/api/interviews/[id]/violations`

Log security violation during interview.

**Authentication Required**: Yes (Candidate)

**Request Body:**
```json
{
  "type": "tab_switch", // or "face_not_visible", "fullscreen_exit", etc.
  "severity": "medium", // "low", "medium", "high", "critical"
  "details": {
    "timestamp": "2024-01-20T14:15:30.000Z",
    "additionalInfo": "Switched to browser tab"
  },
  "videoTimestamp": 930 // seconds into interview
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Violation logged",
  "securityScore": 90, // updated score
  "warningCount": 3
}
```

---

## AI Services

### POST `/api/ai/generate-questions`

Generate AI interview questions.

**Authentication Required**: Yes

**Request Body:**
```json
{
  "jobDescription": "We are looking for a senior developer...",
  "count": 10,
  "interviewType": "technical" // optional
}
```

**Response (200):**
```json
{
  "success": true,
  "questions": [
    {
      "id": "q1",
      "text": "Explain the concept of closure in JavaScript",
      "category": "technical",
      "difficulty": "medium",
      "timeLimit": 180
    }
  ]
}
```

---

### POST `/api/ai/evaluate-answer`

Evaluate candidate's answer with AI.

**Authentication Required**: Yes

**Request Body:**
```json
{
  "question": "Explain the concept of closure in JavaScript",
  "answer": "A closure is a function that has access...",
  "context": {
    "jobTitle": "Senior Frontend Developer",
    "expectedLevel": "senior"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "evaluation": {
    "score": 85,
    "feedback": "Excellent understanding of closures...",
    "criteria": {
      "relevance": 90,
      "technicalAccuracy": 85,
      "communication": 80,
      "depth": 85
    },
    "strengths": ["Clear explanation", "Good examples"],
    "improvements": ["Could mention performance implications"]
  }
}
```

---

### POST `/api/ai/generate-cover-letter`

Generate AI cover letter.

**Authentication Required**: Yes (Candidate)

**Request Body:**
```json
{
  "jobId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "candidateInfo": {
    "name": "John Doe",
    "experience": "5 years as full-stack developer...",
    "skills": ["React", "Node.js"]
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "coverLetter": "Dear Hiring Manager,\n\nI am writing to express...",
  "professionalSummary": "Experienced full-stack developer..."
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created successfully
- `400` - Bad request (validation error, missing fields)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (authenticated but not authorized)
- `404` - Not found
- `409` - Conflict (duplicate entry)
- `500` - Internal server error

---

## Rate Limiting

Currently no rate limiting implemented. For production, consider:
- 100 requests/minute for authenticated users
- 20 requests/minute for unauthenticated
- Stricter limits for AI endpoints

---

## Authentication Flow

1. **Signup/Login** - Receive JWT token in httpOnly cookie
2. **Subsequent Requests** - Cookie automatically sent by browser
3. **Logout** - Cookie cleared
4. **Token Expiry** - Default 7 days, configurable via `JWT_EXPIRES_IN`

---

*Last Updated: 2024*
