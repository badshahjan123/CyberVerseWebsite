const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const labData = {
  title: "Web Security: Infrastructure Forensics",
  slug: "web_security",
  description: "Investigate a high-profile breach of an enterprise web server. Analyze logs, audit configurations, and track down attacker persistence across 8 immersive tasks.",
  content: "# Case File: #CV-2024-0892 (Web Infrastructure Breach)\n**Status: Critical (Post-Compromise Forensic Audit)**\n\nLate-night telemetry from our EDR identified suspicious outbound connections originating from the production web cluster. Initial triage confirmed the presence of unauthorized file-less execution events. The perimeter has been secured, but the adversary's footprints remain across the local infrastructure.\n\n### Tactical Objectives\n1.  **Persistence Analysis**: Audit the `/var/www` web root for resident webshells and reverse-tunnel entry points.\n2.  **Credential Spill Check**: Inspect application configuration trees for clear-text database secrets and leaked environmental variables.\n3.  **Threat Attribution**: Reconstruct the ingress timeline from raw logs to identify the adversary's source IP.\n4.  **Exfiltration Audit**: Recovery and verification of tactical flags hidden within service directories to confirm the extent of the data breach.",
  difficulty: "Expert",
  category: "Web Security",
  points: 500,
  estimatedTime: 90,
  isActive: true,
  cover_image_url: "/images/labs/web-security-cover.png",
  createdBy: "68ea889ba106726082503cde",
  dockerId: "web-security",
  k8sYaml: "web-security.yaml",
  k8sUrl: "http://localhost:32235",
  tasks: [
    {
      id: 1,
      title: "Web Root Audit",
      instructions: "Inspect the web root directory for any suspicious scripts left by the attacker.",
      question: "Identify the name of the PHP webshell file in /var/www/html.",
      commands: ["ls -la /var/www/html", "ls /var/www/html"],
      correctAnswer: "shell.php.txt"
    },
    {
      id: 2,
      title: "Configuration Leakage",
      instructions: "Attackers often search for environment variables. Audit the /opt/app/config directory.",
      question: "What is the database password (DB_PASS) found in the .env file?",
      commands: ["ls -la /opt/app/config", "cat /opt/app/config/.env"],
      correctAnswer: "cyber_secure_99"
    },
    {
      id: 3,
      title: "Log Forensics",
      instructions: "Find the attacker's source IP address in the standard web server logs.",
      question: "Identify the Attacker's IP address from /var/log/apache2/access.log.",
      commands: ["tail /var/log/apache2/access.log", "cat /var/log/apache2/access.log"],
      correctAnswer: "192.168.1.45"
    },
    {
      id: 4,
      title: "Credential Extraction",
      instructions: "Hashed passwords may be stored in hidden sensitive folders. Check /etc/apache2.",
      question: "What is the password hash for the admin user in the .htpasswd file?",
      commands: ["cat /etc/apache2/.htpasswd"],
      correctAnswer: "e99a18c428cb38d5f260853678922e03"
    },
    {
      id: 5,
      title: "Recon Mastery (Flag 1)",
      instructions: "A hidden flag is stored in the web backup directory.",
      question: "Find the flag stored in /var/www/html/backup/.flag1.",
      commands: ["ls -la /var/www/html/backup", "cat /var/www/html/backup/.flag1"],
      correctAnswer: "flag{WEB_RECON_MASTER_2024}"
    },
    {
      id: 6,
      title: "Log Analyst (Flag 2)",
      instructions: "Attackers often hide data in service directories. Audit /var/log/apache2.",
      question: "What is the flag found hidden in the apache2 log directory?",
      commands: ["ls -la /var/log/apache2", "cat /var/log/apache2/.flag2"],
      correctAnswer: "flag{LOG_ANALYST_EXPERT}"
    },
    {
      id: 7,
      title: "Database Exfill (Flag 3)",
      instructions: "Check the configuration directory for a third evidence flag.",
      question: "Find the flag stored in /opt/app/config/.flag3.",
      commands: ["cat /opt/app/config/.flag3"],
      correctAnswer: "flag{DB_EXFIL_SUCCESS_99}"
    },
    {
      id: 8,
      title: "Root Authority (Final Flag)",
      instructions: "The ultimate proof of compromise is located in the root directory.",
      question: "Identify the final flag stored in /root/root.flag.",
      commands: ["ls /root", "cat /root/root.flag"],
      correctAnswer: "flag{WEB_SECURITY_ELITE_FINAL}"
    }
  ]
};

const seedLab = async () => {
    try {
      const mongoUri = process.env.MONGODB_URI;
      await mongoose.connect(mongoUri);

      // Use the real Lab model so it targets the correct collection with correct schema
      const Lab = require('../models/Lab');

      const data = {
        ...labData,
        createdBy: new mongoose.Types.ObjectId(labData.createdBy)
      };

      const result = await Lab.findOneAndUpdate(
        { slug: data.slug },
        { $set: data },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`✅ Advanced Lab "${result.title}" seeded to Atlas successfully!`);
      process.exit(0);
    } catch (error) {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    }
  };
  
seedLab();
