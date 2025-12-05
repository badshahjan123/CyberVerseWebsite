# CyberVerse Labs - Complete File List

## 📦 Files Created

### Docker Lab Files (7 files)

1. **`labs/linux-forensics/Dockerfile`**
   - Purpose: Builds Ubuntu-based lab container with ttyd web terminal

2. **`labs/linux-forensics/setup-lab.sh`**
   - Purpose: Creates all forensic evidence files during Docker build

3. **`labs/linux-forensics/welcome.sh`**
   - Purpose: Welcome banner displayed when user starts terminal

4. **`labs/linux-forensics/README.md`**
   - Purpose: Lab documentation and task descriptions

5. **`labs/linux-forensics/lab-files/.gitkeep`**
   - Purpose: Placeholder directory for additional lab files

6. **`docker-compose.yml`** (project root)
   - Purpose: Docker Compose configuration for all lab containers

### Backend Files (2 files)

7. **`backend/utils/dockerManager.js`**
   - Purpose: Docker container management utility using dockerode

8. **`backend/routes/labs.js`**
   - Purpose: Express API routes for lab management (start/stop/status)

9. **`backend/server.js`** (modified)
   - Purpose: Added labs routes mounting

### Frontend Files (1 file)

10. **`frontend/src/pages/labs/LinuxForensicsLab.jsx`**
    - Purpose: React component for Linux Forensics lab page with UI lock/unlock

### Documentation Files (3 files)

11. **`LABS_SETUP_GUIDE.md`** (project root)
    - Purpose: Complete setup guide with commands and troubleshooting

12. **`DOCKERODE_SETUP.md`** (project root)
    - Purpose: Documentation for dockerode dependency installation

13. **`LAB_FILES_SUMMARY.md`** (this file)
    - Purpose: Complete file list and summary

---

## 🎯 Total Files Created: 13

## 📋 Next Steps

1. **Install dockerode:**
   ```bash
   cd backend
   npm install dockerode
   ```

2. **Build the lab image:**
   ```bash
   docker compose build linux-forensics-lab
   ```

3. **Start backend:**
   ```bash
   cd backend
   npm start
   ```

4. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

5. **Access lab:**
   Navigate to `http://localhost:5173/labs/linux-forensics`

---

## ✅ Features Implemented

- ✅ Complete Docker lab environment with ttyd web terminal
- ✅ Forensic evidence files (hidden files, Base64 encoded data, bash history)
- ✅ Backend API for container management (start/stop/status)
- ✅ Frontend React component with lock/unlock UI
- ✅ Embedded terminal iframe + new tab option
- ✅ Security: whitelisted lab IDs, isolated containers
- ✅ Error handling and loading states
- ✅ Complete documentation and setup guides

---

## 🔒 Security Features

- Container isolation (no host mounts)
- Whitelisted lab IDs in dockerManager.js
- Authentication required for lab endpoints
- Resource limits (CPU/memory)
- No privileged container access

---

## 🎓 Lab Content

**Linux File Forensics: Hidden Secrets**

Tasks:
1. Find hidden files with `ls -a`
2. Check file metadata with `stat`
3. Decode Base64 mystery file
4. Search bash history for clues
5. Extract final flag with `grep -R`

Final Flag: `FLAG{FORENSIC_DISCOVERY_COMPLETE}`

---

## 📞 Support

See `LABS_SETUP_GUIDE.md` for:
- Detailed setup instructions
- API endpoint documentation
- Troubleshooting guide
- Docker commands reference
