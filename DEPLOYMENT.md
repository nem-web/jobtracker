# 🚀 Job Tracker - Complete Deployment Guide

This guide will walk you through deploying the Job & Internship Tracker application using **only free services**.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Local Setup](#local-setup)
3. [Supabase Setup](#supabase-setup)
4. [Backend Deployment (Render)](#backend-deployment-render)
5. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
6. [OpenAI Setup (Optional)](#openai-setup-optional)
7. [Verification Checklist](#verification-checklist)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Vercel        │──────▶│   Render         │──────▶│   Supabase      │
│   (Frontend)    │      │   (Backend API)  │      │   (Database)    │
└─────────────────┘      └──────────────────┘      └─────────────────┘
        │                         │
        │                         │ (Optional)
        ▼                         ▼
┌─────────────────┐      ┌──────────────────┐
│  React + Vite   │      │  OpenAI API      │
│  Tailwind CSS   │      │  (Email Gen)     │
└─────────────────┘      └──────────────────┘
```

### Services Used (All Free Tier)

| Service | Purpose | Free Tier Limits |
|---------|---------|------------------|
| **Supabase** | Database + Auth | 500MB DB, 2GB bandwidth |
| **Render** | Backend Hosting | 512MB RAM, sleeps after 15min idle |
| **Vercel** | Frontend Hosting | 100GB bandwidth, 6000 build minutes |
| **OpenAI** | AI Email Generation | $5-18 free credits for new accounts |

---

## Local Setup

### Prerequisites

- Node.js 18+ installed
- Git installed
- A code editor (VS Code recommended)

### Step 1: Clone/Download the Project

```bash
# If using git
git clone <your-repo-url>
cd job-tracker

# Or extract the zip file
cd job-tracker
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Step 4: Set Up Environment Variables

#### Backend (.env)

```bash
cd ../backend
cp .env.example .env
```

Edit `.env` with your values (we'll get these from Supabase in the next section):

```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-key  # Optional
```

#### Frontend (.env)

```bash
cd ../frontend
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5000/api
```

### Step 5: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Your app should now be running at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose an organization (create one if needed)
4. Enter project details:
   - **Name**: `job-tracker` (or any name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait 1-2 minutes for the project to be created

### Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Project Settings** (gear icon)
2. Click **API** in the left sidebar
3. You'll see:
   - **Project URL** (e.g., `https://abcdefgh12345678.supabase.co`)
   - **anon/public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

**⚠️ IMPORTANT:**
- `anon` key → Used in frontend (safe to expose)
- `service_role` key → Used ONLY in backend (keep secret!)

### Step 3: Get JWT Secret

1. Still in **Project Settings > API**
2. Scroll down to **JWT Settings**
3. Click **Reveal** next to **JWT Secret**
4. Copy this value

### Step 4: Run the Database Schema

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy the entire contents of `database/schema.sql`
4. Paste into the SQL Editor
5. Click **Run**

You should see: "Success. No rows returned"

### Step 5: Enable Email/Password Auth

1. Go to **Authentication** (left sidebar)
2. Click **Providers** under Configuration
3. Find **Email** provider
4. Make sure it's **Enabled**
5. Settings:
   - **Confirm email**: Toggle ON (recommended for production)
   - **Secure email change**: ON
   - **Secure password change**: ON
6. Click **Save**

### Step 6: Update Environment Variables

Now update your `.env` files with the values from Supabase:

**Backend `.env`:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

**Frontend `.env`:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Backend Deployment (Render)

### Step 1: Create a Render Account

1. Go to [https://render.com](https://render.com)
2. Sign up with GitHub (recommended) or email
3. Verify your email

### Step 2: Create a New Web Service

1. In Render dashboard, click **New +**
2. Select **Web Service**
3. Choose **Build and deploy from a Git repository**
4. Connect your GitHub/GitLab account or use **Public Git repository**
5. If using public repo, enter your repo URL
6. Click **Continue**

### Step 3: Configure the Service

**Basic Settings:**
- **Name**: `job-tracker-api` (or any name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)

**Build & Start Commands:**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Important:** If your backend is in a subdirectory:
- **Root Directory**: `backend`

### Step 4: Add Environment Variables

Click **Advanced** and add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `SUPABASE_URL` | Your Supabase URL |
| `SUPABASE_SERVICE_KEY` | Your service role key |
| `SUPABASE_JWT_SECRET` | Your JWT secret |
| `OPENAI_API_KEY` | (Optional) Your OpenAI key |
| `FRONTEND_URL` | Your Vercel URL (add after deploying frontend) |

### Step 5: Deploy

1. Click **Create Web Service**
2. Render will build and deploy your backend
3. Wait for the build to complete (2-3 minutes)
4. Once done, you'll get a URL like: `https://job-tracker-api.onrender.com`

**⚠️ Note:** Render free tier spins down after 15 minutes of inactivity. The first request after idle may take 30-60 seconds to wake up.

### Step 6: Test the API

Open your browser and visit:
```
https://your-service.onrender.com/api/health
```

You should see:
```json
{
  "success": true,
  "message": "Job Tracker API is running",
  "version": "1.0.0"
}
```

---

## Frontend Deployment (Vercel)

### Step 1: Create a Vercel Account

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended) or email
3. Verify your email

### Step 2: Import Your Project

1. Click **Add New...** > **Project**
2. Import your Git repository
3. If not connected, authorize Vercel to access your GitHub

### Step 3: Configure Project

**Basic Settings:**
- **Project Name**: `job-tracker` (or any name)
- **Framework Preset**: Vite
- **Root Directory**: `frontend` (if your frontend is in a subdirectory)

**Build & Output Settings:**
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 4: Add Environment Variables

Expand **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | Your Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Your anon key |
| `VITE_API_URL` | Your Render backend URL + `/api` |

Example:
```
VITE_API_URL=https://job-tracker-api.onrender.com/api
```

### Step 5: Deploy

1. Click **Deploy**
2. Vercel will build and deploy your frontend
3. Wait for the build to complete (1-2 minutes)
4. You'll get a URL like: `https://job-tracker.vercel.app`

### Step 6: Update Backend CORS

After deploying the frontend, update your Render backend environment variables:

1. Go to Render dashboard
2. Click your web service
3. Go to **Environment** tab
4. Add/update:
   - `FRONTEND_URL`: `https://your-vercel-url.vercel.app`
5. The service will auto-redeploy

---

## OpenAI Setup (Optional)

The AI Email Generator works without OpenAI (uses templates), but adding an API key enables AI-powered emails.

### Step 1: Get OpenAI API Key

1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Sign up/login
3. Go to **API keys** in settings
4. Click **Create new secret key**
5. Copy the key (starts with `sk-`)

**Note:** New accounts get $5-18 in free credits.

### Step 2: Add to Environment Variables

Add to both backend environments:

**Local (.env):**
```env
OPENAI_API_KEY=sk-your-key
```

**Render (Production):**
1. Go to Render dashboard
2. Add environment variable: `OPENAI_API_KEY`

### What Happens If Key Is Missing?

✅ **The app works perfectly!** 

The AI controller detects missing/invalid keys and automatically falls back to professional email templates. Users see a friendly message explaining that templates are being used.

### What Happens If Quota Is Exceeded?

✅ **The app doesn't crash!**

If the OpenAI API returns a quota exceeded error, the controller catches it and returns a template-based email instead. The user sees:
> "AI generation encountered an error. Using template instead."

---

## Verification Checklist

Test each feature to ensure everything works:

### Authentication

- [ ] Sign up with email/password
- [ ] Confirm email (if enabled)
- [ ] Log in with credentials
- [ ] Log out
- [ ] Try accessing protected routes when logged out (should redirect to login)

### Job Applications

- [ ] Add a new job application
- [ ] View all applications
- [ ] Search applications by company name
- [ ] Filter by status
- [ ] Edit an application
- [ ] Delete an application
- [ ] Verify data persists after refresh

### Dashboard

- [ ] View statistics (total, applied, interview, offer, rejected)
- [ ] See recent applications list
- [ ] Progress bars update correctly

### AI Email Generator

- [ ] Generate cold email
- [ ] Generate follow-up email
- [ ] Generate referral email
- [ ] Copy email to clipboard
- [ ] Verify fallback works (if no OpenAI key)

### Cross-User Security

- [ ] Create a second account
- [ ] Verify User A cannot see User B's applications
- [ ] Verify User A cannot edit/delete User B's applications

---

## Troubleshooting

### Issue: "Failed to fetch" or CORS errors

**Solution:**
1. Check that `FRONTEND_URL` is set correctly in Render
2. Ensure `VITE_API_URL` in Vercel points to your Render backend
3. Both URLs must use HTTPS in production

### Issue: "Invalid token" errors

**Solution:**
1. Check that `SUPABASE_JWT_SECRET` is correct
2. Verify the user is logged in (token hasn't expired)
3. Check browser console for detailed error messages

### Issue: Database operations fail

**Solution:**
1. Verify `SUPABASE_SERVICE_KEY` is correct (not the anon key)
2. Check that the SQL schema was run successfully
3. Verify RLS policies are enabled in Supabase

### Issue: AI emails not generating

**Solution:**
1. Check if `OPENAI_API_KEY` is set
2. Verify the key is valid (starts with `sk-`)
3. Check OpenAI dashboard for quota status
4. The app will use templates if AI is unavailable (expected behavior)

### Issue: Render backend slow on first request

**Explanation:**
Render free tier spins down after 15 minutes of inactivity. First request wakes it up (30-60 seconds).

**Workaround:**
Use a service like [UptimeRobot](https://uptimerobot.com) to ping your backend every 10 minutes.

### Issue: "Module not found" errors

**Solution:**
1. Delete `node_modules` folder
2. Run `npm install` again
3. Check that all imports use correct paths

---

## Next Steps

After successful deployment:

1. **Add a custom domain** (optional):
   - Vercel: Settings > Domains
   - Render: Settings > Custom Domains

2. **Enable email confirmation** in Supabase Auth for production

3. **Set up monitoring**:
   - Use UptimeRobot to monitor your services
   - Check Render/Supabase dashboards for usage

4. **Regular backups**:
   - Supabase automatically backs up your database
   - You can export data from the SQL Editor if needed

---

## Support

If you encounter issues:

1. Check the logs in Render dashboard
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Review this deployment guide step-by-step

---

**Congratulations! Your Job Tracker is now live! 🎉**
