# Google OAuth Setup Guide

This guide will help you configure Google OAuth authentication for the CyberVerse application.

## Prerequisites

- Google account
- CyberVerse application (backend and frontend)
- Node.js and npm installed

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter project name (e.g., "CyberVerse") and click **Create**
4. Wait for the project to be created and select it

## Step 2: Enable Google+ API

1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and press **Enable**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Fill in App name: "CyberVerse"
   - User support email: your email
   - Developer contact: your email
   - Click **Save and Continue** through all steps
4. Back on credentials page, click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Configure:
   - **Name**: CyberVerse Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:5173`
     - `http://localhost:5174`
     - Add your production URL when deploying
   - **Authorized redirect URIs**:
     - `http://localhost:5173`
     - `http://localhost:5174`
     - Add your production URL when deploying
7. Click **Create**
8. **IMPORTANT**: Copy your **Client ID** - you'll need this for both backend and frontend

## Step 4: Configure Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create or update `.env` file (copy from `.env.example` if needed):
   ```bash
   cp .env.example .env
   ```

3. Add your Google Client ID to `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   ```

4. Ensure other required variables are set:
   ```env
   PORT=5000
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret
   JWT_EXPIRE=7d
   ```

## Step 5: Configure Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Create or update `.env` file (copy from `.env.example` if needed):
   ```bash
   cp .env.example .env
   ```

3. Add your Google Client ID to `.env`:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   VITE_API_URL=http://localhost:5000/api
   ```

   **Note**: Use the **same Client ID** as the backend!

## Step 6: Start the Application

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser to the frontend URL (usually `http://localhost:5173`)

## Step 7: Test Google Authentication

### Sign Up with Google

1. Navigate to the **Sign Up** page
2. Click **Continue with Google** button
3. Select your Google account
4. Grant permissions when prompted
5. You should be redirected to the dashboard
6. Verify in your database that a new user was created with `authProvider: 'google'`

### Sign In with Google

1. Log out from the application
2. Navigate to the **Login** page
3. Click **Continue with Google** button
4. Select the same Google account
5. You should be redirected to the dashboard

## Troubleshooting

### "Google OAuth setup required" alert still appears

- Make sure you've set `VITE_GOOGLE_CLIENT_ID` in frontend `.env`
- Restart the frontend dev server after adding environment variables
- Clear browser cache

### "Invalid client ID" error

- Verify the Client ID is correct in both `.env` files
- Ensure there are no extra spaces or quotes around the Client ID
- Make sure you copied the Client ID, not the Client Secret

### "Redirect URI mismatch" error

- Go back to Google Cloud Console → Credentials
- Edit your OAuth 2.0 Client ID
- Add your current URL to **Authorized JavaScript origins** and **Authorized redirect URIs**
- Make sure to save changes

### "Access blocked: This app's request is invalid"

- Go to Google Cloud Console → OAuth consent screen
- Ensure all required fields are filled
- Add your email to the test users list if using External user type in testing mode

### Database connection errors

- Verify your MongoDB connection string is correct
- Ensure MongoDB is running
- Check firewall settings

### Google button doesn't appear

- Check browser console for errors
- Verify `@react-oauth/google` package is installed: `npm list @react-oauth/google`
- Ensure `GoogleOAuthProvider` is wrapping your app in `main.jsx`

## Production Deployment

When deploying to production:

1. **Update Google Cloud Console**:
   - Add your production domain to Authorized JavaScript origins
   - Add your production domain to Authorized redirect URIs

2. **Update Environment Variables**:
   - Backend: Set `GOOGLE_CLIENT_ID` in your production environment
   - Frontend: Set `VITE_GOOGLE_CLIENT_ID` in your production environment
   - Update `VITE_API_URL` to point to your production backend

3. **OAuth Consent Screen**:
   - Consider publishing your OAuth consent screen for public access
   - Or add specific users to the test users list

## Security Notes

- **Never commit `.env` files** to version control
- Keep your Client ID public-facing but protect your Client Secret
- Only the Client ID is used in this implementation (no Client Secret needed for frontend)
- Ensure your backend validates Google tokens properly
- Use HTTPS in production

## Support

If you continue to have issues:

1. Check the browser console for detailed error messages
2. Check the backend server logs
3. Verify all environment variables are set correctly
4. Ensure Google Cloud project is properly configured

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)
- [Google Cloud Console](https://console.cloud.google.com/)
