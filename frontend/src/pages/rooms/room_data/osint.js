export const OSINT_ROOM_DATA = {
  id: "osint-investigation",
  title: "OSINT Investigation",
  category: "Recon",
  difficulty: "Advanced",
  duration: "90 min",
  description: "Master the art of Open Source Intelligence. Learn to track digital footprints, exploit search engine dorks, and uncover hidden infrastructure using professional-grade tools.",
  totalXP: 250,
  enrollments: 1200,
  rating: 4.8,
  creator: "CyberVerse Team",
  tags: ["osint", "recon", "investigation", "social-engineering", "intelligence"],
  tasks: [
    {
      id: 1,
      title: "The OSINT Mindset",
      subtitle: "Information is Power",
      icon: "search",
      difficulty: "Beginner",
      xp: 50,
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800",
      scenario: {
        title: "Total Visibility",
        text: "You are an intelligence officer. Your target has left a trail of data across the public web. Your mission is to collect this data without ever touching their servers directly.",
        impact: "OSINT is the backbone of modern espionage. 90% of a breach starts with data found in the public domain."
      },
      content: [
        { type: "text", value: "**OSINT (Open Source Intelligence)** is the collection and analysis of data gathered from open sources to produce actionable intelligence." },
        { type: "heading", value: "The OSINT Lifecycle" },
        { type: "list", items: [
          "**Planning**: Defining the scope and requirements.",
          "**Collection**: Gathering raw data from social media, public records, and technical databases.",
          "**Processing**: Cleaning and organizing the data.",
          "**Analysis**: Connecting the dots to identify patterns or vulnerabilities.",
          "**Dissemination**: Presenting the findings."
        ] },
        { type: "callout", variant: "info", title: "Passive Recon", text: "In OSINT, we never send packets to the target. We only look at what the world already knows about them." }
      ],
      questions: [
        {
          id: "osint_q1",
          text: "What does the 'O' in OSINT stand for?",
          answer: "Open",
          acceptableAnswers: ["Open"],
          hint: "The data is accessible to anyone."
        }
      ]
    },
    {
      id: 2,
      title: "Advanced Google Dorking",
      subtitle: "Bypassing the Surface Web",
      icon: "globe",
      difficulty: "Intermediate",
      xp: 50,
      image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800",
      scenario: {
        title: "The GitHub Leaks",
        text: "Most companies accidentally leak secrets via public search engines. You need to use advanced operators to find sensitive configuration files exposed online.",
        impact: "A single 'site:github.com' dork can uncover hardcoded API keys and database credentials."
      },
      content: [
        { type: "text", value: "Google Dorking (Google Hacking) uses advanced search operators to find information that is not usually visible." },
        { type: "heading", value: "Essential Operators" },
        { type: "comparison", 
          left: { title: "Basic Filters", color: "#00F5FF", items: ["`site:` - Limit to domain", "`filetype:` - Specific format", "`intitle:` - Text in title"] }, 
          right: { title: "Deep Searches", color: "#EF4444", items: ["`inurl:` - Text in the URL", "`allintext:` - Text in page body", "`link:` - Find referring pages"] } 
        },
        { type: "terminal", language: "text", code: `site:target.com filetype:env "DB_PASSWORD"\nsite:github.com "password" extension:yml` },
        { type: "callout", variant: "warning", title: "Honey Dorks", text: "Security teams often set up 'Honey Dorks' to catch attackers searching for specific sensitive files." }
      ],
      questions: [
        {
          id: "osint_q2",
          text: "Which operator is used to search for specific file formats like PDF or DOCX?",
          answer: "filetype:",
          acceptableAnswers: ["filetype:", "filetype"],
          hint: "f___t___:"
        }
      ]
    },
    {
      id: 3,
      title: "Social Media Intelligence (SOCMINT)",
      subtitle: "Mapping the Human Network",
      icon: "users",
      difficulty: "Intermediate",
      xp: 50,
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800",
      scenario: {
        title: "Connecting the Dots",
        text: "A target executive has a private profile, but their family members don't. You need to map the relationship web to find the executive's birthday and pet's name (common password resets).",
        impact: "Human beings are the weakest link. Their digital footprints are scattered across multiple platforms."
      },
      content: [
        { type: "text", value: "**SOCMINT** is a subset of OSINT that focuses on social media platforms. It's used for profiling and identifying social engineering targets." },
        { type: "heading", value: "Username Correlation" },
        { type: "text", value: "People often reuse usernames across different platforms. Tools like **Sherlock** can search for a username across hundreds of sites in seconds." },
        { type: "exploitSim", steps: [
          { label: "Identify Username", code: "Searching: @johndoe_sec", status: "normal" },
          { label: "Cross-platform check", code: "Found on: Twitter, IG, Reddit, GitHub", status: "attack" },
          { label: "Extract PII", code: "Location found in old Reddit post ✓", status: "success" }
        ] }
      ],
      questions: [
        {
          id: "osint_q3",
          text: "What is the process of finding the same user across different social networks called?",
          answer: "Correlation",
          acceptableAnswers: ["Correlation", "Username Correlation", "Cross-Platform Tracking"],
          hint: "Linking data across different sources."
        }
      ]
    },
    {
      id: 4,
      title: "Infrastructure & Domain Intelligence",
      subtitle: "Tracing the Digital Skeleton",
      icon: "mail",
      difficulty: "Advanced",
      xp: 50,
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
      scenario: {
        title: "The Ghost Server",
        text: "The main site is secure, but a forgotten dev server is still running an old version of Windows. You need to use WHOIS and DNS history to find these 'forgotten' assets.",
        impact: "Abandoned subdomains and legacy infrastructure are the easiest path for many attackers."
      },
      content: [
        { type: "text", value: "Technical OSINT involves investigating domains, IP addresses, and digital certificates." },
        { type: "heading", value: "The OSINT Toolbox" },
        { type: "list", items: [
          "**WHOIS**: Identifying the owner and registrar of a domain.",
          "**DNS History**: Viewing old IP records to find leaked server locations.",
          "**Censys / Shodan**: Searching for all devices connected to the internet.",
          "**CRT.sh**: Viewing SSL certificate history to find hidden subdomains."
        ] },
        { type: "terminal", language: "bash", code: `# Using dig to find DNS records\ndig target.com ANY\n\n# Checking historical WHOIS data\nwhois -h whois.iana.org target.com` }
      ],
      questions: [
        {
          id: "osint_q4",
          text: "Which protocol is used to query databases that store the registered users or assignees of an Internet resource?",
          answer: "WHOIS",
          acceptableAnswers: ["WHOIS"],
          hint: "W___H___I___S"
        }
      ]
    },
    {
      id: 5,
      title: "Automation & Investigation Tools",
      subtitle: "Force Multipliers",
      icon: "tool",
      difficulty: "Advanced",
      xp: 50,
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
      scenario: {
        title: "The Industrial Search",
        text: "Manual searching is too slow. You need to build a workspace in **Maltego** or use **theHarvester** to suck up thousands of emails and subdomains in minutes.",
        impact: "Automated tools can transform a few clues into a massive intelligence report in minutes."
      },
      content: [
        { type: "text", value: "Professional OSINT investigators use specialized tools to automate data collection and visualization." },
        { type: "heading", value: "Top-Tier OSINT Tools" },
        { type: "list", items: [
          "**theHarvester**: Gathers emails, subdomains, hosts, and employee names.",
          "**Maltego**: A graphical link analysis tool for mapping relationships.",
          "**Recon-ng**: A full-featured reconnaissance framework with modular plugins.",
          "**SpiderFoot**: An automation tool that queries over 100 public data sources."
        ] },
        { type: "terminal", language: "bash", code: `# Running theHarvester on a target\ntheHarvester -d megacorp.com -b google,linkedin,bing` }
      ],
      questions: [
        {
          id: "osint_q5",
          text: "Which link analysis tool uses 'Transforms' to find relationships between data points?",
          answer: "Maltego",
          acceptableAnswers: ["Maltego"],
          hint: "It starts with an M and has a highly visual UI."
        }
      ]
    }
  ]
};

export const OSINT_BADGES = [
  { id: "investigator", icon: "🕵️", name: "Digital Investigator", desc: "Start OSINT journey" },
  { id: "dork-master", icon: "🌐", name: "Google Dorker", desc: "Master search techniques" },
  { id: "tracker", icon: "📍", name: "Tracker", desc: "Track digital footprints" },
  { id: "domain-hunter", icon: "📡", name: "Domain Hunter", desc: "Analyze domains" },
  { id: "osint-master", icon: "🔥", name: "OSINT Master", desc: "Complete all OSINT tasks" }
];

export const OSINT_QUIZ = [
  {
    id: "osint_fq1",
    question: "Which of the following describes OSINT accurately?",
    options: ["Hacking into private databases", "Collecting publicly available information", "Stealing passwords via phishing", "Cracking encrypted files"],
    correctAnswer: "Collecting publicly available information",
    explanation: "OSINT focuses exclusively on data that is publicly accessible."
  },
  {
    id: "osint_fq2",
    question: "Which Google operator would you use to find only PDF files on a site?",
    options: ["type:pdf", "ext:pdf", "filetype:pdf", "format:pdf"],
    correctAnswer: "filetype:pdf",
    explanation: "The 'filetype:' operator is the standard Google dork for filtering file extensions."
  },
  {
    id: "osint_fq3",
    question: "What is the primary risk of 'Forgotten Infrastructure' like abandoned subdomains?",
    options: ["Higher hosting costs", "Slow site speed", "Easy entry point for attackers", "Poor SEO ranking"],
    correctAnswer: "Easy entry point for attackers",
    explanation: "Unpatched or forgotten servers are often the first target in a reconnaissance phase."
  },
  {
    id: "osint_fq4",
    question: "Which tool is known for its graphical link analysis of OSINT data?",
    options: ["Nmap", "Maltego", "Wireshark", "Metasploit"],
    correctAnswer: "Maltego",
    explanation: "Maltego is the industry standard for visualizing complex relationships between people, domains, and IP addresses."
  },
  {
    id: "osint_fq5",
    question: "What is 'Honey Dorking'?",
    options: ["Using sweet treats to lure hackers", "Setting up fake sensitive files to catch dorkers", "A high-speed search algorithm", "A way to hack🍯 servers"],
    correctAnswer: "Setting up fake sensitive files to catch dorkers",
    explanation: "Blue teams use Honey Dorks to detect when an attacker is performing reconnaissance on their domain."
  }
];
