# 🚀 CyberVerse Deployment Guide

## Overview
This guide will help you deploy your CyberVerse application with:
- **Frontend**: Netlify
- **Backend**: Railway
- **Database**: MongoDB Atlas (already configured)

---

## 📋 Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)
- Netlify account (sign up at https://netlify.com)
- Your code pushed to GitHub

---

## 🔧 Part 1: Deploy Backend to Railway

### Step 1: Create Railway Project
1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your **CyberVerseWeb** repository
5. Railway will auto-detect the backend

### Step 2: Configure Backend Settings
1. In Railway dashboard, select your project
2. Go to **Settings** → **Root Directory**
3. Set root directory to: `backend`
4. Click **Save**

### Step 3: Add Environment Variables
In Railway dashboard, go to **Variables** tab and add:

```
PORT=5000
MONGODB_URI=mongodb+srv://cyberverse:cyberverse123@cyberverse-cluster.8ygufmn.mongodb.net/cyberverse?retryWrites=true&w=majority&appName=cyberverse-cluster
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=production
```

### Step 4: Deploy Backend
1. Railway will automatically deploy
2. Wait for deployment to complete (2-3 minutes)
3. Copy your Railway backend URL (e.g., `https://your-app.railway.app`)

### Step 5: Update CORS Settings
After getting your Netlify URL, update `backend/server.js` line 23:
```javascript
origin: process.env.NODE_ENV === 'production' 
  ? ['https://your-netlify-site.netlify.app'] 
  : ['http://localhost:5173', 'http://localhost:3000'],
```

---

## 🌐 Part 2: Deploy Frontend to Netlify

### Step 1: Add Environment Variable to Netlify
1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Click **Add a variable**
4. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.railway.app/api` (your Railway URL + /api)

### Step 2: Trigger Redeploy
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**
3. Wait for deployment to complete

### Step 3: Verify Deployment
1. Visit your Netlify site URL
2. Try logging in or registering
3. Check browser console for any errors

---

## ✅ Verification Checklist

### Backend (Railway)
- [ ] Backend is deployed and running
- [ ] Environment variables are set
- [ ] Health check endpoint works: `https://your-backend.railway.app/api/health`
- [ ] CORS is configured with your Netlify URL

### Frontend (Netlify)
- [ ] Frontend is deployed
- [ ] `VITE_API_URL` environment variable is set
- [ ] All routes work (no 404 errors)
- [ ] API calls are successful (no CORS errors)

### Database (MongoDB Atlas)
- [ ] Database connection is working
- [ ] Default admin user is created
- [ ] Sample data is populated

---

## 🔍 Troubleshooting

### Issue: "Failed to fetch" error
**Solution**: Make sure `VITE_API_URL` is set in Netlify environment variables

### Issue: CORS error
**Solution**: Update `backend/server.js` CORS configuration with your Netlify URL

### Issue: 404 on page refresh
**Solution**: Ensure `_redirects` file is in the `dist` folder (already configured)

### Issue: Backend not connecting to database
**Solution**: Check MongoDB Atlas network access settings (allow all IPs: 0.0.0.0/0)

---

## 📝 Important URLs to Save

After deployment, save these URLs:

- **Frontend URL**: `https://your-site.netlify.app`
- **Backend URL**: `https://your-backend.railway.app`
- **API Base URL**: `https://your-backend.railway.app/api`
- **Health Check**: `https://your-backend.railway.app/api/health`

---

## 🔐 Default Admin Credentials

After first deployment, you can login with:
- **Email**: badshahkha656@gmail.com
- **Password**: Badshah@123

**⚠️ IMPORTANT**: Change these credentials immediately after first login!

---

## 🎉 You're Done!

Your CyberVerse application should now be fully deployed and accessible online!

### Next Steps:
1. Test all features thoroughly
2. Update admin credentials
3. Monitor Railway logs for any errors
4. Set up custom domain (optional)

---

## 📞 Need Help?

If you encounter any issues:
1. Check Railway logs for backend errors
2. Check Netlify deploy logs for frontend errors
3. Check browser console for client-side errors
4. Verify all environment variables are set correctly