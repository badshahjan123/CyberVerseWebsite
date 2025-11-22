# 🕐 Session Timeout Feature

## ✅ What Was Implemented

Your CyberVerse application now has **automatic session timeout** functionality!

### 🎯 How It Works:

1. **Activity Tracking**: The app tracks user activity (clicks, scrolls, keyboard input, etc.)
2. **Last Activity Timestamp**: Every time a user interacts with the app, the timestamp is updated
3. **Session Expiration Check**: When a user returns after being away, the app checks if they've been inactive too long
4. **Auto-Logout**: If inactive for more than the configured time, the user is automatically logged out

---

## ⏱️ Current Configuration

**Default Session Timeout: 7 DAYS**

This means if a user doesn't interact with the app for 7 days, they will be automatically logged out.

---

## 🔧 How to Change the Timeout Duration

Edit the file: `frontend/src/config/api.js`

Find this line:
```javascript
export const SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 7 days
```

### Common Timeout Options:

```javascript
// 1 hour
export const SESSION_TIMEOUT = 60 * 60 * 1000;

// 12 hours
export const SESSION_TIMEOUT = 12 * 60 * 60 * 1000;

// 1 day
export const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

// 3 days
export const SESSION_TIMEOUT = 3 * 24 * 60 * 60 * 1000;

// 7 days (current)
export const SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000;

// 30 days
export const SESSION_TIMEOUT = 30 * 24 * 60 * 60 * 1000;
```

---

## 🧪 How to Test

### Test 1: Quick Test (Manual)
1. Login to your app
2. Open browser DevTools (F12)
3. Go to **Application** tab → **Local Storage**
4. Find `lastActivity` - note the timestamp
5. Manually delete `lastActivity` or change it to an old timestamp
6. Refresh the page
7. You should be logged out!

### Test 2: Real-World Test
1. Login to your app
2. Close the browser completely
3. Wait for the configured timeout period (7 days by default)
4. Open the browser and go to your app
5. You should see the home page (logged out)

### Test 3: Quick Test with Short Timeout
1. Temporarily change timeout to 1 minute:
   ```javascript
   export const SESSION_TIMEOUT = 60 * 1000; // 1 minute
   ```
2. Deploy to Netlify
3. Login to your app
4. Wait 1 minute without any interaction
5. Refresh the page
6. You should be logged out!
7. **Don't forget to change it back to your preferred duration!**

---

## 📊 What Gets Tracked as "Activity"

The following user actions reset the inactivity timer:
- ✅ Mouse clicks
- ✅ Keyboard input
- ✅ Scrolling
- ✅ Touch events (mobile)
- ✅ Any mouse movement with button pressed

---

## 🔒 Security Benefits

1. **Prevents Unauthorized Access**: If someone leaves their computer unlocked, the session will expire
2. **Shared Computers**: Great for users on public/shared computers
3. **Stolen Devices**: Limits access window if a device is stolen
4. **Compliance**: Meets security requirements for many organizations

---

## 📝 Technical Details

### Files Modified:
1. `frontend/src/config/api.js` - Session timeout configuration
2. `frontend/src/contexts/app-context.jsx` - Session management logic

### How It Works Internally:
1. On login: `lastActivity` timestamp is saved to localStorage
2. On any user interaction: `lastActivity` is updated
3. On app load: Checks if `(current time - lastActivity) > SESSION_TIMEOUT`
4. If expired: Clears token and user data, shows home page
5. If valid: User stays logged in

### Storage:
- `localStorage.token` - JWT authentication token
- `localStorage.lastActivity` - Unix timestamp of last user activity

---

## 🚀 Deployment

Changes have been pushed to GitHub. Now deploy to Netlify:

1. Go to Netlify dashboard
2. Trigger a new deployment
3. Wait 2-3 minutes
4. Test the feature!

---

## ⚠️ Important Notes

1. **Browser Storage**: Session timeout is per-browser. If a user logs in on Chrome and Firefox, they're separate sessions.
2. **Multiple Tabs**: Activity in ANY tab of your app will reset the timer for ALL tabs.
3. **Background Tabs**: If the tab is in the background, activity tracking still works.
4. **Incognito Mode**: Works the same, but session is cleared when incognito window closes.

---

## 🎉 Summary

✅ Users are automatically logged out after 7 days of inactivity
✅ Activity tracking works seamlessly in the background
✅ Easy to configure different timeout durations
✅ Improves security and user experience
✅ Works across all devices and browsers

---

**Need to change the timeout? Edit `frontend/src/config/api.js` and redeploy!**