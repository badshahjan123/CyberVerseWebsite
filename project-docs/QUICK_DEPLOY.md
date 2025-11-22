# ⚡ Quick Deploy Reference

## 🎯 What You Need to Do Right Now

### 1️⃣ Deploy Backend to Railway (5 minutes)
```
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select CyberVerseWeb repo
4. Set root directory: backend
5. Add environment variables (see below)
6. Copy your Railway URL
```

**Environment Variables for Railway:**
```
PORT=5000
MONGODB_URI=mongodb+srv://cyberverse:cyberverse123@cyberverse-cluster.8ygufmn.mongodb.net/cyberverse?retryWrites=true&w=majority&appName=cyberverse-cluster
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=production
```

### 2️⃣ Update Netlify Environment Variable (2 minutes)
```
1. Go to Netlify dashboard
2. Site settings → Environment variables
3. Add: VITE_API_URL = https://YOUR-RAILWAY-URL.railway.app/api
4. Trigger redeploy
```

### 3️⃣ Update Backend CORS (1 minute)
In `backend/server.js` line 23, replace:
```javascript
origin: process.env.NODE_ENV === 'production' 
  ? ['https://YOUR-NETLIFY-SITE.netlify.app'] 
  : ['http://localhost:5173', 'http://localhost:3000'],
```

Then commit and push to trigger Railway redeploy.

---

## ✅ Test Your Deployment

1. Visit: `https://YOUR-RAILWAY-URL.railway.app/api/health`
   - Should return: `{"status":"OK","message":"CyberVerse API is running"}`

2. Visit: `https://YOUR-NETLIFY-SITE.netlify.app`
   - Should load without errors

3. Try logging in with:
   - Email: badshahkha656@gmail.com
   - Password: Badshah@123

---

## 🐛 Quick Fixes

**"Failed to fetch"** → Check VITE_API_URL in Netlify
**CORS error** → Update backend/server.js with Netlify URL
**404 on refresh** → Already fixed with _redirects file
**Backend won't start** → Check Railway logs and environment variables

---

## 📱 Your URLs

After deployment, fill these in:

- Frontend: `https://_________________.netlify.app`
- Backend: `https://_________________.railway.app`
- API: `https://_________________.railway.app/api`

---

That's it! 🎉