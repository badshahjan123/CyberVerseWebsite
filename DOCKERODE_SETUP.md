# Required Dependencies for Labs Feature

Add this dependency to your `backend/package.json`:

```json
{
  "dependencies": {
    "dockerode": "^4.0.2"
  }
}
```

## Installation

```bash
cd backend
npm install dockerode
```

## What is dockerode?

Dockerode is a Node.js module that allows you to interact with Docker Engine API programmatically. It's used in CyberVerse to:

- Start/stop lab containers
- Monitor container status
- Manage container lifecycle
- Retrieve container information

## Alternative (if dockerode fails)

If dockerode doesn't work on your system, you can modify `backend/utils/dockerManager.js` to use `child_process.exec` with Docker CLI commands instead. However, dockerode is the recommended approach for production use.
