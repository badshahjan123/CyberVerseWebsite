# Linux File Forensics Lab

This directory contains the Docker lab environment for the "Linux File Forensics: Hidden Secrets" challenge.

## Lab Structure

- **Dockerfile**: Builds the Ubuntu-based lab container with ttyd web terminal
- **setup-lab.sh**: Creates all forensic evidence files during build
- **welcome.sh**: Welcome banner shown to users
- **lab-files/**: Additional static files (if needed)

## What's Inside the Lab

The lab contains:
- Hidden files (`.secret_note`)
- Base64 encoded mystery file (`mystery.bin`)
- Bash history with suspicious commands
- Hidden flag file (`.backup_flag.txt`)
- Decoy files to make investigation realistic

## Building the Lab

```bash
# From project root
docker compose build linux-forensics-lab
```

## Running Standalone (for testing)

```bash
docker run -p 8083:7681 --name linux-forensics-test cyberverse-linux-forensics
```

Then open: http://localhost:8083

## Lab Tasks

1. Find hidden files with `ls -a`
2. Check file metadata with `stat`
3. Decode Base64 with `base64 -d mystery.bin`
4. Search bash history
5. Find the final flag with `grep -R "FLAG"`

## Final Flag

`FLAG{FORENSIC_DISCOVERY_COMPLETE}`
