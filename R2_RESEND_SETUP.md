# 📦 R2 এবং Resend Setup Guide (বাংলা)

## 🎯 এগুলো কী এবং কেন দরকার?

### Cloudflare R2 (File Storage)
- **কাজ**: Resume files, interview recordings store করার জন্য
- **বিকল্প**: AWS S3 এর মতো, কিন্তু সস্তা (egress fees নেই)
- **Optional**: এখন না করলেও চলবে, local filesystem ব্যবহার করবে

### Resend (Email Service)
- **কাজ**: Email notifications পাঠানোর জন্য (interview invites, application updates)
- **বিকল্প**: SendGrid, AWS SES
- **Optional**: এখন না করলেও চলবে, শুধু email যাবে না

---

## 📁 Option 1: Cloudflare R2 Setup (File Storage)

### Step 1: Cloudflare Account তৈরি করুন
1. যান: https://dash.cloudflare.com/sign-up
2. Email এবং Password দিয়ে Signup করুন
3. Email verify করুন

### Step 2: R2 Enable করুন
1. Cloudflare Dashboard এ login করুন
2. বাম sidebar এ **"R2"** ক্লিক করুন
3. **"Get Started"** বা **"Purchase R2"** ক্লিক করুন
4. ক্রেডিট কার্ড add করতে হবে (কিন্তু ফ্রি tier আছে: 10 GB storage free)

### Step 3: Bucket তৈরি করুন
1. **"Create bucket"** ক্লিক করুন
2. **Bucket name**: `naasmind-files` (অথবা যেকোনো নাম)
3. **Location**: Automatic সিলেক্ট থাকুক
4. **Create bucket** ক্লিক করুন

### Step 4: API Token তৈরি করুন
1. Dashboard এ উপরে **"Manage R2 API Tokens"** ক্লিক করুন
2. **"Create API Token"** ক্লিক করুন
3. **Token name**: `naasmind-token`
4. **Permissions**: 
   - ✅ Object Read
   - ✅ Object Write
5. **Apply to specific buckets only** সিলেক্ট করুন
6. আপনার bucket (`naasmind-files`) সিলেক্ট করুন
7. **"Create API Token"** ক্লিক করুন

### Step 5: Credentials কপি করুন
Token তৈরি হলে আপনি এই information পাবেন:
```
Access Key ID: xxxxxxxxxxxxxxxxxxxxx
Secret Access Key: yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
Account ID: zzzzzzzzzzzzzzzzzzzzzz
```
⚠️ **খুব গুরুত্বপূর্ণ**: এগুলো একবারই দেখাবে! এখনই কপি করুন!

### Step 6: Public URL তৈরি করুন (Optional)
1. আপনার bucket এ যান
2. **Settings** ট্যাবে ক্লিক করুন
3. **Public Access** enable করুন (যদি public files চান)
4. Public URL কপি করুন: `https://pub-xxxxxxxx.r2.dev`

### Step 7: .env.local আপডেট করুন
```env
R2_ACCOUNT_ID=আপনার_account_id
R2_ACCESS_KEY_ID=আপনার_access_key_id
R2_SECRET_ACCESS_KEY=আপনার_secret_access_key
R2_BUCKET_NAME=naasmind-files
R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev
```

---

## 📧 Option 2: Resend Setup (Email Service)

### Step 1: Resend Account তৈরি করুন
1. যান: https://resend.com/signup
2. Email এবং Password দিয়ে Signup করুন
3. Email verify করুন

### Step 2: Domain যোগ করুন (Optional - এখন skip করতে পারেন)
**Free tier:** 100 emails/day, শুধুমাত্র আপনার own email এ পাঠাতে পারবেন
**With domain:** Unlimited recipients (প্রথম 3000 emails free)

#### নিজের Domain না থাকলে:
- Skip করুন, development এর জন্য free tier যথেষ্ট

#### নিজের Domain থাকলে:
1. Dashboard এ **"Domains"** যান
2. **"Add Domain"** ক্লিক করুন
3. আপনার domain name লিখুন (যেমন: `yourdomain.com`)
4. DNS records add করুন আপনার domain provider এ:
   - SPF record
   - DKIM records
   - DMARC record (optional)
5. **"Verify"** ক্লিক করুন

### Step 3: API Key তৈরি করুন
1. Dashboard এ **"API Keys"** যান
2. **"Create API Key"** ক্লিক করুন
3. **Name**: `NaaSMind Production` (বা যেকোনো নাম)
4. **Permission**: **"Full Access"** অথবা **"Sending Access"**
5. **"Create"** ক্লিক করুন
6. API Key কপি করুন: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   ⚠️ **গুরুত্বপূর্ণ**: এটি একবারই দেখাবে!

### Step 4: .env.local আপডেট করুন
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 5: Test Email পাঠান (Optional)
আপনার terminal এ:
```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "your-email@example.com",
    "subject": "Test Email from NaaSMind",
    "html": "<p>Hello! This is a test email.</p>"
  }'
```

---

## 🚀 Quick Setup (শুধু Local Development এর জন্য)

**R2 এবং Resend ছাড়াই চালাতে চান?** কোন সমস্যা নেই!

`.env.local` এ এগুলো empty রাখুন:
```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=naasmind-files
R2_PUBLIC_URL=
RESEND_API_KEY=
```

### কী হবে?
- ✅ **Resume uploads** - Local filesystem এ save হবে (`/public/uploads/`)
- ✅ **Login/Signup** - পুরোপুরি কাজ করবে
- ✅ **Job applications** - সব কাজ করবে
- ❌ **Email notifications** - যাবে না (কিন্তু database এ record হবে)
- ⚠️ **Interview recordings** - Local এ save হবে (production এ R2 লাগবে)

---

## 💰 খরচ কত?

### Cloudflare R2
- **Free Tier**: 
  - 10 GB storage (ফ্রি চিরকালের জন্য)
  - 1 মিলিয়ন Class A operations/month (ফ্রি)
  - 10 মিলিয়ন Class B operations/month (ফ্রি)
- **Paid** (শুধু ফ্রি শেষ হলে):
  - $0.015 per GB/month storage

### Resend
- **Free Tier**: 
  - 3,000 emails/month (ফ্রি চিরকালের জন্য)
  - 100 emails/day
- **Paid** (শুধু ফ্রি শেষ হলে):
  - $20/month for 50,000 emails

**উপসংহার**: শুরুতে সবকিছু ফ্রি! 🎉

---

## 🔧 Troubleshooting

### R2 Errors
**"Access Denied"**
- API Token permissions check করুন
- Bucket name সঠিক আছে কিনা verify করুন

**"Invalid credentials"**
- Access Key এবং Secret Key আবার কপি করে paste করুন
- Account ID ঠিক আছে কিনা check করুন

### Resend Errors
**"Invalid API key"**
- API key সঠিকভাবে কপি করেছেন কিনা check করুন
- `re_` দিয়ে শুরু হচ্ছে কিনা verify করুন

**"Domain not verified"**
- DNS records সঠিকভাবে add করেছেন কিনা check করুন
- 24-48 ঘন্টা অপেক্ষা করুন DNS propagation এর জন্য
- অথবা development এ domain ছাড়াই চালান

---

## 🎯 সুপারিশ

### Development এর জন্য:
- ❌ R2 setup করার দরকার নেই - local filesystem যথেষ্ট
- ❌ Resend setup করার দরকার নেই - console এ log দেখবেন

### Production এর জন্য:
- ✅ R2 setup করুন - proper file storage
- ✅ Resend setup করুন - email notifications
- ✅ Custom domain add করুন Resend এ

---

## 📝 Final .env.local Example

### Development (R2/Resend ছাড়া):
```env
MONGODB_URI=mongodb+srv://...
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-1.5-flash
JWT_SECRET=vrgp+1iHds28/rKMjQUwAjRzdTSc8Z8UOhDp83rQigo=
JWT_EXPIRES_IN=7d
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=naasmind-files
R2_PUBLIC_URL=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Production (সব setup সহ):
```env
MONGODB_URI=mongodb+srv://...
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-1.5-flash
JWT_SECRET=vrgp+1iHds28/rKMjQUwAjRzdTSc8Z8UOhDp83rQigo=
JWT_EXPIRES_IN=7d
R2_ACCOUNT_ID=xxxxxxxxxxxxx
R2_ACCESS_KEY_ID=yyyyyyyyyyy
R2_SECRET_ACCESS_KEY=zzzzzzzzzzzzzz
R2_BUCKET_NAME=naasmind-files
R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev
RESEND_API_KEY=re_xxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

---

**এখন development এর জন্য R2/Resend ছাড়াই চালাতে পারবেন! পরে production এ নিলে setup করবেন। 🚀**
