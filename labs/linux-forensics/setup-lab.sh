#!/bin/bash
# Setup script to create forensic evidence files
# This runs during Docker build

# Create hidden secret note
cat > /home/labuser/investigation/.secret_note << 'EOF'
CLASSIFIED MEMO
===============
Project: Shadow Protocol
Status: ACTIVE
Contact: agent_x@darkweb.onion

This file should not exist.
EOF

# Create mystery binary (Base64 encoded message)
echo "U2VjcmV0IE1lc3NhZ2U6IFRoZSBhdHRhY2tlciB1c2VkIHRoZSBhbGlhcyAiZ2hvc3RfcnVubmVyIgpIaWRkZW4gTGluZTogRkxBR3tCQVNFNjRfREVDT0RFRF9TVUNDRVNTFQ==" | base64 -d > /tmp/decoded_temp
base64 /tmp/decoded_temp > /home/labuser/investigation/mystery.bin
rm /tmp/decoded_temp

# Create normal looking files as decoys
echo "System log backup - nothing suspicious here" > /home/labuser/investigation/backup.log
echo "Configuration file v2.1" > /home/labuser/investigation/config.txt

# Create bash history with suspicious commands
mkdir -p /home/labuser
cat > /home/labuser/.bash_history << 'EOF'
ls -la
cd /tmp
echo "FLAG{NOT_THE_REAL_FLAG}" > /tmp/flag_storage
cat /tmp/flag_storage
rm -rf /tmp/flag_storage
history -c
cd ~
ls
EOF

# Create the actual hidden flag file
echo "FLAG{FORENSIC_DISCOVERY_COMPLETE}" > /home/labuser/.backup_flag.txt

# Create a decoy flag in another location
echo "FLAG{NICE_TRY_BUT_KEEP_SEARCHING}" > /home/labuser/investigation/fake_flag.txt

# Set timestamps to make it look old (forensic clue)
touch -t 202312150830.00 /home/labuser/investigation/.secret_note

echo "✅ Lab forensic evidence created successfully"
