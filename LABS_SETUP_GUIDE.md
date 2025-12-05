# CyberVerse Labs - Setup Guide

**Assumes:** 
- Docker Desktop installed and running on Windows
- Node.js v18+ installed
- npm installed

## 🚀 Quick Start

### 1. Install Dependencies

First, install dockerode for container management:

```bash
cd backend
npm install dockerode
```

### 2. Build Lab Docker Image

Build the Linux Forensics lab container:

```bash
# From project root
docker compose build linux-forensics-lab
```

This will:
- Build the Ubuntu-based lab image
- Install ttyd web terminal
- Create forensic evidence files
- Set up the lab environment

### 3. Start Backend Server

The backend must be running to manage lab containers:

```bash
cd backend
npm start
```

The server will start on `http://localhost:5000`

### 4. Start Frontend

In a separate terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### 5. Access the Lab

Navigate to: `http://localhost:5173/labs/linux-forensics`

## 📡 API Endpoints

### Start Lab
```bash
curl -X POST http://localhost:5000/api/labs/start/linux-forensics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "containerId": "abc123...",
  "webTerminalUrl": "http://localhost:8083",
  "status": "started"
}
```

### Stop Lab
```bash
curl -X POST http://localhost:5000/api/labs/stop/linux-forensics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Lab Status
```bash
curl http://localhost:5000/api/labs/status/linux-forensics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### List Available Labs
```bash
curl http://localhost:5000/api/labs/available
```

## 🐳 Docker Commands

### Manual Container Management (for testing)

**Start container manually:**
```bash
docker run -d -p 8083:7681 --name cyberverse-linux-forensics cyberverse-linux-forensics
```

**Stop container:**
```bash
docker stop cyberverse-linux-forensics
docker rm cyberverse-linux-forensics
```

**View container logs:**
```bash
docker logs cyberverse-linux-forensics
```

**Access container shell (for debugging):**
```bash
docker exec -it cyberverse-linux-forensics /bin/bash
```

## 🔧 Troubleshooting

### Container won't start
1. Check if Docker Desktop is running
2. Verify port 8083 is not in use: `netstat -ano | findstr 8083`
3. Check Docker logs: `docker logs cyberverse-linux-forensics`

### Terminal not loading
1. Wait 5-10 seconds after starting (ttyd needs time to initialize)
2. Check if container is running: `docker ps`
3. Try accessing directly: `http://localhost:8083`

### Permission errors
1. Make sure Docker Desktop has proper permissions
2. Run backend with administrator privileges if needed

## 📁 Project Structure

```
CyberVerseWeb-main/
├── labs/
│   └── linux-forensics/
│       ├── Dockerfile
│       ├── setup-lab.sh
│       ├── welcome.sh
│       ├── lab-files/
│       └── README.md
├── backend/
│   ├── routes/
│   │   └── labs.js
│   └── utils/
│       └── dockerManager.js
├── frontend/
│   └── src/
│       └── pages/
│           └── labs/
│               └── LinuxForensicsLab.jsx
└── docker-compose.yml
```

## 🎯 Lab Workflow

1. User navigates to `/labs/linux-forensics`
2. Clicks "Start Lab" button
3. Frontend calls `POST /api/labs/start/linux-forensics`
4. Backend starts Docker container
5. Container exposes ttyd web terminal on port 8083
6. Frontend unlocks exercise content
7. User completes forensic tasks in terminal
8. User clicks "Stop Lab" when done
9. Backend stops and removes container

## 🔒 Security Notes

- Containers are isolated (no host mounts)
- Lab IDs are whitelisted in `dockerManager.js`
- Authentication required for lab management endpoints
- Containers have resource limits (CPU/memory)
- No privileged access granted to containers

## 📝 Adding New Labs

1. Create new lab folder in `labs/`
2. Add Dockerfile and setup scripts
3. Add lab config to `ALLOWED_LABS` in `backend/utils/dockerManager.js`
4. Add service to `docker-compose.yml`
5. Create React component in `frontend/src/pages/labs/`
6. Build and test!

## 🆘 Support

If you encounter issues:
1. Check Docker Desktop is running
2. Verify all dependencies are installed
3. Check backend console for errors
4. Review Docker container logs
5. Ensure ports 5000, 5173, and 8083 are available
