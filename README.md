# CyberVerse - Cybersecurity Learning Platform

## Quick Start

### Option 1: Automated Start (Recommended)
```bash
# Double-click start-project.bat or run:
start-project.bat
```

### Option 2: Manual Start
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Admin Panel**: http://localhost:5173/secure-admin-login

## Admin Credentials
- **Email**: badshahkha656@gmail.com
- **Password**: Badshah@123

## Troubleshooting VS Code Errors

The console errors you see are mostly warnings and don't affect functionality:

### Common Warnings (Safe to Ignore):
- `punycode module is deprecated` - Node.js deprecation warning
- `SQLite is an experimental feature` - VS Code internal warning
- `Failed to fetch MCP registry` - GitHub Copilot service unavailable
- `chatParticipant must be declared` - Extension configuration issue
- `Content Security Policy` warnings - VS Code webview security notices

### Solutions Applied:
1. ✅ Created VS Code settings to suppress warnings
2. ✅ Fixed admin authentication system
3. ✅ Created diagnostic scripts
4. ✅ Updated package dependencies
5. ✅ Added startup automation

## Project Structure
```
CyberVerseWeb-main/
├── backend/           # Node.js API server
├── frontend/          # React application  
├── .vscode/          # VS Code configuration
└── start-project.bat # Quick start script
```

## Development Commands

### Backend
```bash
npm start          # Start production server
npm run dev        # Start with nodemon
npm run create-admin # Create admin user
npm run check-admin  # Check admin users
npm run test-setup   # Run diagnostics
```

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## System Status
✅ MongoDB Connected  
✅ Admin User Created  
✅ Authentication Working  
✅ File Structure Complete  
✅ Dependencies Installed