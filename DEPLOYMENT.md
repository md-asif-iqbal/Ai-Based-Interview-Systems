# Deployment Guide for SoftLanding

This guide will help you deploy the SoftLanding platform to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [MongoDB Atlas Setup](#mongodb-atlas-setup)
4. [Google Gemini API Setup](#google-gemini-api-setup)
5. [Deployment on Vercel](#deployment-on-vercel)
6. [Alternative Deployment Options](#alternative-deployment-options)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:
- Git repository (GitHub, GitLab, or Bitbucket)
- Vercel account (or other hosting platform)
- MongoDB Atlas account (or other MongoDB hosting)
- Google Cloud account for Gemini API
- Domain name (optional, for custom domain)

---

## Environment Setup

### Required Environment Variables

Create these environment variables in your hosting platform:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/naasmind?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-random-string
JWT_EXPIRES_IN=7d

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key-here

# Next.js (Update with your domain)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Node Environment
NODE_ENV=production
```

### Generating Secure JWT Secret

Generate a secure random string for `JWT_SECRET`:

```bash
# On macOS/Linux
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Sign up for free account
- Create new organization and project

### 2. Create Cluster
1. Click "Build a Cluster"
2. Choose **M0 Free** tier for testing (or paid tier for production)
3. Select your preferred cloud provider and region
4. Name your cluster (e.g., `naasmind-cluster`)
5. Click "Create Cluster" (takes 3-5 minutes)

### 3. Configure Network Access
1. Go to **Network Access** in sidebar
2. Click "Add IP Address"
3. For Vercel/production:
   - Click "Allow Access from Anywhere" (`0.0.0.0/0`)
   - **Note**: This is safe with proper authentication
4. Click "Confirm"

### 4. Create Database User
1. Go to **Database Access** in sidebar
2. Click "Add New Database User"
3. Choose **Password** authentication
4. Create username and strong password
5. Set role to "Read and write to any database"
6. Click "Add User"

### 5. Get Connection String
1. Go to **Database** in sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `naasmind`

**Example:**
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/naasmind?retryWrites=true&w=majority
```

---

## Google Gemini API Setup

### 1. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Get API Key"
4. Click "Create API Key in new project" (or use existing project)
5. Copy the generated API key

### 2. API Key Best Practices
- **Never commit API keys to Git**
- Store only in environment variables
- Rotate keys periodically
- Monitor usage in Google Cloud Console
- Set up billing alerts

### 3. Enable Required APIs
The Gemini API should work out of the box, but ensure:
- Generative Language API is enabled in your Google Cloud project
- Billing is set up (free tier available with limits)

---

## Deployment on Vercel

### Method 1: Vercel Dashboard (Recommended)

#### 1. Push Code to Git
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. Import Project to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (or leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### 3. Add Environment Variables
In Vercel project settings:
1. Go to **Settings** → **Environment Variables**
2. Add all variables from [Environment Setup](#environment-setup)
3. Make sure to add them for **Production**, **Preview**, and **Development**

#### 4. Deploy
1. Click "Deploy"
2. Wait 2-5 minutes for build to complete
3. Visit your deployment URL

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts to configure project

# Deploy to production
vercel --prod
```

---

## Alternative Deployment Options

### Deploy on Railway

1. Go to [Railway](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables
6. Deploy

### Deploy on Render

1. Go to [Render](https://render.com)
2. Create "New Web Service"
3. Connect GitHub repository
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables
6. Create web service

### Deploy on DigitalOcean App Platform

1. Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Choose GitHub and select repository
4. Configure app settings
5. Add environment variables
6. Launch app

### Self-Hosted (VPS/Docker)

See [SELF_HOSTING.md](./SELF_HOSTING.md) for detailed instructions on deploying to your own server.

---

## Post-Deployment

### 1. Verify Deployment
Check these endpoints:
- `https://your-domain.com` - Homepage loads
- `https://your-domain.com/login` - Login page works
- `https://your-domain.com/api/auth/me` - Returns 401 (authentication working)

### 2. Seed Database (Optional)
```bash
# Connect to your production database
# Update MONGODB_URI in .env.local to point to Atlas

# Run seed script
npx tsx scripts/seed.ts
```

### 3. Test Key Features
- [ ] Sign up new user
- [ ] Login with demo credentials
- [ ] Browse jobs
- [ ] Upload resume (test AI parsing)
- [ ] Create job posting (as recruiter)
- [ ] Apply for job
- [ ] Start interview (test proctoring)

### 4. Set Up Custom Domain (Optional)

#### On Vercel:
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning

#### Update Environment Variables:
```env
NEXT_PUBLIC_APP_URL=https://your-custom-domain.com
```

### 5. Set Up Monitoring

#### Vercel Analytics
- Enable in Vercel dashboard → **Analytics** tab
- View performance metrics and user activity

#### Error Tracking (Optional)
Consider integrating:
- [Sentry](https://sentry.io) for error tracking
- [LogRocket](https://logrocket.com) for session replay
- [Datadog](https://www.datadoghq.com) for infrastructure monitoring

---

## Troubleshooting

### Build Fails

**Error: Module not found**
```bash
# Solution: Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

**Error: TypeScript errors**
```bash
# Solution: Run type check locally first
npm run build
# Fix all TypeScript errors before deploying
```

### Runtime Errors

**Error: Cannot connect to MongoDB**
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas network access (allow 0.0.0.0/0)
- Verify database user credentials
- Check MongoDB Atlas cluster is running

**Error: Gemini API errors**
- Verify `GEMINI_API_KEY` is set correctly
- Check API key is valid in Google AI Studio
- Verify billing is set up (even for free tier)
- Check API quotas/limits in Google Cloud Console

**Error: JWT authentication not working**
- Verify `JWT_SECRET` is set
- Ensure `JWT_SECRET` is at least 32 characters
- Check cookies are enabled in browser
- Verify `NEXT_PUBLIC_APP_URL` matches your domain

### Performance Issues

**Slow page loads**
- Enable Vercel Edge Network
- Implement ISR (Incremental Static Regeneration) for job listings
- Add Redis caching layer
- Optimize database queries (add indexes)

**High MongoDB costs**
- Review and optimize queries
- Add proper indexes to collections
- Consider upgrading cluster tier
- Implement pagination for large datasets

### Security Issues

**CORS errors**
- Verify `NEXT_PUBLIC_APP_URL` is correct
- Check API routes have proper CORS headers
- Ensure credentials are included in fetch requests

**Unauthorized API access**
- Verify JWT middleware is working
- Check token expiration settings
- Ensure cookies are httpOnly and secure

---

## Production Checklist

Before going live:

- [ ] All environment variables set correctly
- [ ] MongoDB Atlas properly configured with backups enabled
- [ ] Gemini API key valid and billing configured
- [ ] JWT secret is strong and unique
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate provisioned
- [ ] Error tracking configured
- [ ] Analytics configured
- [ ] Database indexes created
- [ ] Test all critical user flows
- [ ] Monitor logs after deployment
- [ ] Set up regular database backups
- [ ] Document any custom configurations
- [ ] Set up status page monitoring
- [ ] Configure email notifications for errors

---

## Support

For deployment issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Check [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- Check [Google AI Documentation](https://ai.google.dev/docs)
- Open issue on GitHub repository

---

## Next Steps

After successful deployment:
1. Monitor application logs
2. Set up automated backups
3. Configure CI/CD pipelines
4. Implement additional security measures
5. Optimize performance based on metrics
6. Plan for scaling based on usage

---

Built with ❤️ using Next.js, Google Gemini AI, and modern web technologies.
