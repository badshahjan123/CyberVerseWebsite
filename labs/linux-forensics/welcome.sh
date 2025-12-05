#!/bin/bash
# Welcome message displayed when user starts terminal

cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🔍 CYBERVERSE LAB — Linux File Forensics                  ║
║                                                              ║
║   Mission: Hidden Secrets Investigation                     ║
║   Difficulty: Beginner to Intermediate                      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

Welcome, Agent.

You are now inside a compromised server environment.
A suspicious folder has been recovered: /home/labuser/investigation/

Your mission:
  → Discover hidden files
  → Analyze file metadata
  → Decode encrypted messages
  → Extract the final flag

Current directory: /home/labuser/investigation/
Type 'ls' to begin your investigation.

Good luck, agent. 🕵️

EOF

# Change to investigation directory
cd /home/labuser/investigation/
