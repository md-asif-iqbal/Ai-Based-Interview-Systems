# 🚀 NaaSMind সেটআপ গাইড (বাংলা)

## AI Model সেটআপ করুন

### ধাপ ১: Google Gemini AI API Key নিন

1. **এই লিংকে যান**: https://makersuite.google.com/app/apikey
2. **Google দিয়ে Login করুন**
3. **"Create API Key" বাটনে ক্লিক করুন**
4. **API Key কপি করুন** (যেমন: `AIzaSyXXXXXXXXXXXXXXXXXX`)

### ধাপ ২: MongoDB Atlas সেটআপ করুন (সহজ উপায়)

#### A. Account তৈরি করুন
1. **এখানে যান**: https://www.mongodb.com/cloud/atlas/register
2. **Email দিয়ে Signup করুন** (ফ্রি)
3. **Email Verify করুন**

#### B. Free Cluster তৈরি করুন
1. **"Build a Database" ক্লিক করুন**
2. **"M0 Free" সিলেক্ট করুন** (একদম ফ্রি, ক্রেডিট কার্ড লাগবে না)
3. **Cloud Provider**: AWS সিলেক্ট করুন
4. **Region**: Singapore বা Mumbai সিলেক্ট করুন (আমাদের কাছাকাছি)
5. **Cluster Name**: `naasmind-cluster` লিখুন
6. **"Create Cluster" ক্লিক করুন** (3-5 মিনিট সময় লাগবে)

#### C. Database User তৈরি করুন
1. বাম পাশে **"Database Access" ক্লিক করুন**
2. **"Add New Database User" ক্লিক করুন**
3. **Username**: `admin` লিখুন
4. **Password**: একটা শক্তিশালী পাসওয়ার্ড দিন (যেমন: `Admin@123456`)
5. **Database User Privileges**: "Read and write to any database" সিলেক্ট করুন
6. **"Add User" ক্লিক করুন**

#### D. Network Access Allow করুন
1. বাম পাশে **"Network Access" ক্লিক করুন**
2. **"Add IP Address" ক্লিক করুন**
3. **"Allow Access from Anywhere" ক্লিক করুন** (0.0.0.0/0)
4. **"Confirm" ক্লিক করুন**

#### E. Connection String কপি করুন
1. **"Database" ক্লিক করুন** (বাম পাশে)
2. আপনার cluster এ **"Connect" বাটনে ক্লিক করুন**
3. **"Connect your application" সিলেক্ট করুন**
4. **Connection String কপি করুন**
   - এরকম দেখাবে: `mongodb+srv://admin:<password>@naasmind-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority`
5. **`<password>` এর জায়গায় আপনার পাসওয়ার্ড লিখুন**
6. **শেষে `/naasmind` যোগ করুন**
   - ফাইনাল: `mongodb+srv://admin:Admin@123456@naasmind-cluster.xxxxx.mongodb.net/naasmind?retryWrites=true&w=majority`

### ধাপ ৩: Environment Variables সেট করুন

আপনার `.env.local` ফাইল এভাবে আপডেট করুন:

```env
# MongoDB Atlas Connection (আপনার connection string দিন)
MONGODB_URI=mongodb+srv://admin:Admin@123456@naasmind-cluster.xxxxx.mongodb.net/naasmind?retryWrites=true&w=majority

# Google Gemini API Key (আপনার API key দিন)
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# এগুলো এমনই থাকবে
GEMINI_MODEL=gemini-1.5-flash
JWT_SECRET=dev_secret_key_change_in_production_12345
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### ধাপ ৪: App চালান

Terminal এ এই commands রান করুন:

```bash
# 1. নাসমাইন্ড ফোল্ডারে যান
cd /Users/asifiqbal/Dev/AI-Interview/naasmind

# 2. Development Server চালু করুন
npm run dev
```

App চালু হয়ে যাবে এখানে: **http://localhost:3000**

### ধাপ ৫: Database Seed করুন (Demo Data)

আরেকটা Terminal খুলে:

```bash
cd /Users/asifiqbal/Dev/AI-Interview/naasmind
npm run seed
```

এটি তৈরি করবে:
- ✅ 2 জন Recruiter (demo account)
- ✅ 3 জন Candidate (demo account)  
- ✅ 3 টি Company
- ✅ 5 টি Job posting

---

## 🔑 Demo Login Credentials

### Candidate হিসেবে Login করতে:
- **Email**: `candidate@example.com`
- **Password**: `password123`

### Recruiter হিসেবে Login করতে:
- **Email**: `recruiter@example.com`
- **Password**: `password123`

---

## ✅ AI Features যেগুলো কাজ করবে

1. **Resume Upload করলে AI Parse করবে**
   - PDF বা DOCX upload করুন
   - AI automatically skills, experience, education বের করবে

2. **Job Apply করলে AI Match Score দেবে**
   - Resume এর সাথে job requirement মিলিয়ে score দেবে
   - 4 category: Skills, Experience, Education, Overall

3. **AI Cover Letter Generate করবে**
   - Job description এবং resume থেকে automatic cover letter তৈরি করবে

4. **Interview Question Generate করবে**
   - Job description অনুযায়ী relevant questions তৈরি করবে
   - Technical, Behavioral, Situational - সব ধরনের

5. **Interview Answer Evaluate করবে**
   - আপনার উত্তর AI check করে score দেবে
   - Feedback এবং improvement suggestions দেবে

---

## 🐛 সমস্যা হলে

### "Cannot connect to MongoDB"
- আপনার MongoDB Atlas connection string সঠিক কিনা check করুন
- Password এ special characters থাকলে URL encode করতে হবে
- Network Access এ 0.0.0.0/0 allow করা আছে কিনা দেখুন

### "Invalid Gemini API Key"  
- Google AI Studio থেকে নতুন API key নিন
- `.env.local` এ সঠিকভাবে paste করুন
- Server restart করুন (Ctrl+C চেপে আবার `npm run dev`)

### "Port 3000 already in use"
```bash
# অন্য port ব্যবহার করুন:
PORT=3001 npm run dev
```

---

## 📚 আরও Documentation

- **README.md** - পুরো feature list এবং setup
- **API_DOCS.md** - সব API এর details
- **DEPLOYMENT.md** - Production এ deploy করার guide

---

## 🎯 পরের Steps

1. ✅ Google Gemini API Key নিন
2. ✅ MongoDB Atlas setup করুন  
3. ✅ `.env.local` আপডেট করুন
4. ✅ `npm run dev` দিয়ে app চালান
5. ✅ `npm run seed` দিয়ে demo data তৈরি করুন
6. ✅ http://localhost:3000 এ যান এবং test করুন

---

**সব ঠিক থাকলে app পুরোপুরি কাজ করবে! 🎉**
