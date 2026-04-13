export const LINUX_ROOM_DATA = {
  id: "linux-fundamentals",
  title: "Linux Fundamentals",
  category: "System",
  difficulty: "Intermediate",
  duration: "60 min",
  description: "Master the Linux command line, manage file systems, control user permissions, and handle system level processes like a pro.",
  totalXP: 175,
  enrollments: 1800,
  rating: 4.8,
  creator: "CyberVerse Team",
  tags: ["linux", "terminal", "sysadmin", "system-security"],
  tasks: [
    {
      id: 1,
      title: "Environmental Awareness",
      subtitle: "Navigating the Hierarchical Maze",
      icon: "terminal",
      difficulty: "Beginner",
      xp: 35,
      image: "/images/rooms/linux.png",
      scenario: {
        title: "Dropped in the Deep End",
        text: "You've successfully gained remote access to a server. You have no GUI, only a blinking cursor. You need to identify where you are and what this machine is.",
        impact: "Orientation is critical in any system engagement. Without knowing your environment, you cannot plan your next move."
      },
      content: [
        { type: "text", value: "Linux follows a strict hierarchical structure starting from the **Root** (`/`) directory. Every file, device, and process is accessible through this tree." },
        { type: "heading", value: "Orientation Commands" },
        { type: "list", items: [
          "`pwd` - **Print Working Directory**: Tells you exactly where you are.",
          "`whoami` - Tells you which user account you are currently using.",
          "`uname -a` - Prints all system information (Kernel version, architecture).",
          "`ls -la` - Lists all files, including hidden ones (starting with a dot)."
        ] },
        { type: "terminal", language: "bash", code: `whoami\npwd\nuname -a\nls -F` },
        { type: "callout", variant: "info", title: "Pro Tip", text: "The `~` symbol represents your home directory (e.g., /home/user)." }
      ],
      questions: [
        {
          id: "q1",
          text: "What command is used to display the kernel name and system information?",
          answer: "uname -a",
          acceptableAnswers: ["uname -a", "uname"],
          hint: "U___ Name"
        }
      ]
    },
    {
      id: 2,
      title: "File & Directory Control",
      subtitle: "The Art of Manipulation",
      icon: "folder",
      difficulty: "Beginner",
      xp: 35,
      image: "/images/rooms/linux.png",
      scenario: {
        title: "Managing the Evidence",
        text: "You need to create a staging directory for your tools, copy configuration files for analysis, and securely remove temporary files once done.",
        impact: "Efficient file management is the bread and butter of system administration and forensic analysis."
      },
      content: [
        { type: "text", value: "In Linux, **everything is a file**. Managing them effectively requires mastering a few core utilities." },
        { type: "heading", value: "Core File Actions" },
        { type: "comparison", 
          left: { title: "Creation & Movement", color: "#00F5FF", items: ["`mkdir` - Create directory", "`touch` - Create empty file", "`mv` - Move or Rename file", "`cp` - Copy file/dir"] }, 
          right: { title: "Viewing & Deleting", color: "#EF4444", items: ["`cat` - View entire file", "`head` - View top 10 lines", "`tail` - View last 10 lines", "`rm` - Remove permanently"] } 
        },
        { type: "terminal", language: "bash", code: `mkdir workspace && cd workspace\ntouch notes.txt\necho "Confidential" > notes.txt\ncp notes.txt backup.txt` },
        { type: "callout", variant: "warning", title: "Be Careful", text: "The `rm -rf` command is extremely powerful and will delete files and directories recursively without confirmation!" }
      ],
      questions: [
        {
          id: "q2",
          text: "Which command combined with -r is used to delete directories and their contents?",
          answer: "rm",
          acceptableAnswers: ["rm"],
          hint: "Short for Remove."
        }
      ]
    },
    {
      id: 3,
      title: "Permissions & Ownership",
      subtitle: "The Gatekeeper's Keys",
      icon: "lock",
      difficulty: "Intermediate",
      xp: 35,
      image: "/images/rooms/linux.png",
      scenario: {
        title: "Escalating Control",
        text: "You've found a sensitive backup file, but you cannot read it due to 'Permission Denied'. You must understand how Linux permissions work to bypass or fix this.",
        impact: "Permissions are the primary defense against unauthorized data access in multi-user systems."
      },
      content: [
        { type: "text", value: "Permissions are divided into three groups: **User** (u), **Group** (g), and **Others** (o). Each group can have **Read** (r), **Write** (w), and **Execute** (x) rights." },
        { type: "heading", value: "The Octal Notation" },
        { type: "text", value: "While we often see permissions as `rwxr-xr-x`, they are numerically represented by octal numbers:" },
        { type: "list", items: [
          "**4** - Read (r)",
          "**2** - Write (w)",
          "**1** - Execute (x)"
        ] },
        { type: "callout", variant: "tip", title: "Math Trick", text: "Read (4) + Write (2) + Execute (1) = **7** (Full Control). Read (4) + Execute (1) = **5**." },
        { type: "codeComparison", 
          vulnerable: { label: "INSECURE PERMS", language: "bash", code: "chmod 777 sensitive_data.txt\n# Anyone can read/write/delete!" }, 
          secure: { label: "SECURE PERMS", language: "bash", code: "chmod 600 private_key.pem\n# Only the owner can read/write." } 
        }
      ],
      questions: [
        {
          id: "q3",
          text: "What octal number represents 'Read and Write' permissions for a single digit?",
          answer: "6",
          acceptableAnswers: ["6"],
          hint: "4 (Read) + 2 (Write) = ?"
        }
      ]
    },
    {
      id: 4,
      title: "Search, Gills & Pipes",
      subtitle: "Finding a Needle in a Haystack",
      icon: "search",
      difficulty: "Intermediate",
      xp: 35,
      image: "/images/rooms/linux.png",
      scenario: {
        title: "Sifting Through Logs",
        text: "A web server has been compromised. Your task is to find all log entries that mention a specific IP address within thousands of files.",
        impact: "The ability to filter large datasets is what separates a beginner from a power user."
      },
      content: [
        { type: "text", value: "Linux uses 'Pipes' (`|`) to send the output of one command as input to another, allowing for complex data processing." },
        { type: "heading", value: "The Search Arsenal" },
        { type: "list", items: [
          "`grep` - Searches for text patterns within files.",
          "`find` - Searches for files based on name, size, or time.",
          "`awk/sed` - Powerful tools for text transformation and filtering."
        ] },
        { type: "exploitSim", steps: [
          { label: "Find all .log files", code: "find /var/log -name \"*.log\"", status: "attack" },
          { label: "Search for specific IP", code: "grep \"192.168.1.10\" access.log", status: "exploit" },
          { label: "Count occurrences", code: "grep \"Failed password\" auth.log | wc -l", status: "success" }
        ] }
      ],
      questions: [
        {
          id: "q4",
          text: "Which character is used to pipe the output of one command to another?",
          answer: "|",
          acceptableAnswers: ["|", "pipe"],
          hint: "The vertical bar symbol."
        }
      ]
    },
    {
      id: 5,
      title: "Processes & Services",
      subtitle: "Monitoring the Pulse",
      icon: "activity",
      difficulty: "Intermediate",
      xp: 35,
      image: "/images/rooms/linux.png",
      scenario: {
        title: "Stopping the Malware",
        text: "A malicious process is consuming 90% of your CPU. You need to identify it, trace its origin, and terminate it immediately.",
        impact: "System health and security depend on constant monitoring of running processes."
      },
      content: [
        { type: "text", value: "Every running program in Linux is a **Process** with a unique **PID** (Process ID)." },
        { type: "heading", value: "Management Commands" },
        { type: "list", items: [
          "`ps aux` - Snapshot of all running processes.",
          "`top` - Real-time monitoring of system resources.",
          "`kill [PID]` - Sends a signal to a process to stop.",
          "`systemctl status [service]` - Checks if a background service is running."
        ] },
        { type: "terminal", language: "bash", code: `ps aux | grep "apache"\nkill -9 1234\nsudo systemctl restart ssh` },
        { type: "callout", variant: "warning", title: "Kill -9", text: "Signal 9 is 'SIGKILL'. It forces a process to exit immediately without saving data. Use it as a last resort!" }
      ],
      questions: [
        {
          id: "q5",
          text: "Which command provides a real-time, dynamic view of running processes?",
          answer: "top",
          acceptableAnswers: ["top", "htop"],
          hint: "Like a 'Task Manager' for Linux."
        }
      ]
    }
  ]
};

export const LINUX_BADGES = [
  { id: "navigator", icon: "🧭", name: "System Navigator", desc: "Understand basic navigation" },
  { id: "file-master", icon: "📁", name: "File Handler", desc: "Manage files effectively" },
  { id: "permission-pro", icon: "🔐", name: "Permission Pro", desc: "Control access rights" },
  { id: "search-expert", icon: "🔎", name: "Search Expert", desc: "Find files efficiently" },
  { id: "linux-master", icon: "🐧", name: "Linux Master", desc: "Complete all Linux tasks" }
];

export const LINUX_QUIZ = [
  {
    id: "q1",
    question: "What does 'ls -la' command do?",
    options: ["Delete all files", "List all files including hidden ones", "Move files to a new directory", "Change file owner"],
    correctAnswer: "List all files including hidden ones",
    explanation: "The -a flag stands for 'all', which includes hidden files starting with a dot."
  },
  {
    id: "q2",
    question: "Which numerical value represents 'Write' permission alone?",
    options: ["1", "2", "4", "7"],
    correctAnswer: "2",
    explanation: "In octal, Read is 4, Write is 2, and Execute is 1."
  },
  {
    id: "q3",
    question: "Which command searches for patterns of text inside files?",
    options: ["find", "grep", "cat", "locate"],
    correctAnswer: "grep",
    explanation: "grep (Global Regular Expression Print) is the standard tool for searching text in Linux."
  },
  {
    id: "q4",
    question: "What is the PID 1 typically attributed to in a modern Linux system?",
    options: ["The Kernel", "Systemd (init)", "The Shell", "The Web Server"],
    correctAnswer: "Systemd (init)",
    explanation: "The first process started by the kernel during boot is init (usually systemd), which always gets PID 1."
  },
  {
    id: "q5",
    question: "Which directory typically contains system configuration files?",
    options: ["/bin", "/etc", "/var", "/home"],
    correctAnswer: "/etc",
    explanation: "The /etc directory is the standard location for all system-wide configuration files."
  }
];
