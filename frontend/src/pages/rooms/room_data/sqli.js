export const SQLI_ROOM_DATA = {
  id: "sql-injection-fundamentals",
  title: "SQL Injection Fundamentals",
  category: "Web",
  difficulty: "Beginner",
  duration: "50 min",
  description: "Learn how SQL Injection works and how attackers bypass authentication and extract data from databases.",
  totalXP: 100,
  enrollments: 2100,
  rating: 4.7,
  creator: "CyberVerse Team",
  tags: ["sqli", "database", "web-security", "injection"],
  tasks: [
    {
      id: 1,
      title: "What is SQL Injection?",
      subtitle: "The Digital Sabotage",
      icon: "database",
      difficulty: "Beginner",
      xp: 25,
      image: "/images/rooms/sqli.png",
      scenario: {
        title: "The Vulnerable Login",
        text: "Imagine a high-security vault that opens when you say your name. But instead of saying your name, you say: 'Open the door and give me all the money'. If the vault is poorly designed, it might just obey.",
        impact: "SQL Injection (SQLi) is one of the most critical web vulnerabilities, allowing attackers to manipulate queries and steal entire databases."
      },
      content: [
        { type: "text", value: "SQL Injection is a code injection technique where an attacker executes malicious SQL statements that control a web application's database server." },
        { type: "heading", value: "How Applications Talk to Databases" },
        { type: "text", value: "Most web apps use SQL (**Structured Query Language**) to interact with data. When you log in, the app often builds a query like this:" },
        { type: "terminal", language: "sql", code: `SELECT * FROM users WHERE username = 'user_input' AND password = 'pass_input';` },
        { type: "callout", variant: "warning", title: "The Vulnerability", text: "If the application simply 'glues' your input into the query string without cleaning it, it becomes vulnerable to SQL Injection." },
        { type: "list", items: [
          "**Input Fields:** Login forms, search bars, and profile settings.",
          "**URL Parameters:** Data passed in the browser address bar.",
          "**Headers:** Metadata like User-Agent or Cookies."
        ] }
      ],
      questions: [
        {
          id: "q1",
          text: "What does SQL stand for?",
          answer: "Structured Query Language",
          acceptableAnswers: ["Structured Query Language"],
          hint: "S___ Q___ L___"
        }
      ]
    },
    {
      id: 2,
      title: "Authentication Bypass",
      subtitle: "Breaking the Logic",
      icon: "unlock",
      difficulty: "Beginner",
      xp: 25,
      image: "/images/rooms/sqli.png",
      scenario: {
        title: "Bypassing the Gatekeeper",
        text: "You are attempting to access an administrative dashboard, but you don't have the password. By injecting a logical 'TRUE' statement, you can trick the database into thinking you successfully authenticated.",
        impact: "A successful login bypass grants an attacker full access to protected areas of the application."
      },
      content: [
        { type: "text", value: "The most classic SQLi attack is the **Authentication Bypass**. Attackers use the `OR` operator and comments to ignore the password check." },
        { type: "heading", value: "The Tautology Attack" },
        { type: "text", value: "A tautology is a statement that is always true (like 1=1). Look at what happens to the query when an attacker enters `' OR 1=1 --` into the username field:" },
        { type: "terminal", language: "sql", code: `SELECT * FROM users WHERE username = '' OR 1=1 --' AND password = '...';` },
        { type: "callout", variant: "info", title: "The Result", text: "Because 1=1 is always true, and the '--' comments out the rest of the query, the database returns the first user in the table (usually the Admin) and logs the attacker in." },
        { type: "comparison", left: { title: "Original Intent", color: "#00F5FF", items: ["Check username matches", "Check password matches", "Return user if both match"] }, right: { title: "Attacker Manipulation", color: "#EF4444", items: ["Ignore username", "Ignore password", "Force TRUE condition", "Return Admin user"] } }
      ],
      questions: [
        {
          id: "q2",
          text: "Which SQL characters are commonly used to 'comment out' the rest of a query?",
          answer: "--",
          acceptableAnswers: ["--", "#"],
          hint: "Double dash or a hash symbol."
        }
      ]
    },
    {
      id: 3,
      title: "UNION-Based Extraction",
      subtitle: "Dumping Private Data",
      icon: "download",
      difficulty: "Intermediate",
      xp: 25,
      image: "/images/rooms/sqli.png",
      scenario: {
        title: "The Information Leak",
        text: "Simply bypassing login isn't enough for some attackers. They want the entire user table, including emails, hashes, and personal data.",
        impact: "UNION-based SQLi allows attackers to 'append' their own queries to the application's legitimate results."
      },
      content: [
        { type: "text", value: "The `UNION` operator is used in SQL to combine the result-set of two or more `SELECT` statements." },
        { type: "heading", value: "Extraction Requirements" },
        { type: "list", items: [
          "**Same Column Count:** Both queries must return the same number of columns.",
          "**Compatible Data Types:** The data types in corresponding columns must be similar.",
          "**Visible Output:** The results must be displayed back to the user on the screen."
        ] },
        { type: "exploitSim", steps: [
          { label: "Find column count", code: "' ORDER BY 3 --", status: "attack" },
          { label: "Find vulnerable column", code: "' UNION SELECT 1,2,3 --", status: "exploit" },
          { label: "Dump user data", code: "' UNION SELECT username, password FROM users --", status: "success" }
        ] },
        { type: "callout", variant: "tip", title: "Pro Tip", text: "If the application doesn't show errors, you might need 'Blind SQLi' techniques which are much more time-consuming!" }
      ],
      questions: [
        {
          id: "q3",
          text: "What operator is used to join several SELECT statements into one result?",
          answer: "UNION",
          acceptableAnswers: ["UNION", "UNION SELECT"],
          hint: "U___ N"
        }
      ]
    },
    {
      id: 4,
      title: "Defending the Database",
      subtitle: "Secure Coding Patterns",
      icon: "shield",
      difficulty: "Beginner",
      xp: 25,
      image: "/images/rooms/sqli.png",
      scenario: {
        title: "Hardening the Walls",
        text: "As a security engineer, your job is to ensure that code is 'secure by design'. We must move away from 'string concatenation' and towards safer patterns.",
        impact: "Correct prevention makes SQL Injection virtually impossible to exploit."
      },
      content: [
        { type: "text", value: "The absolute best way to prevent SQL Injection is by using **Prepared Statements** (also known as Parameterized Queries)." },
        { type: "codeComparison", 
          vulnerable: { label: "VULNERABLE (PHP)", language: "php", code: "$query = \"SELECT * FROM users WHERE id = \" . $_GET['id'];" }, 
          secure: { label: "SECURE (PHP/PDO)", language: "php", code: "$stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');\n$stmt->execute([$_GET['id']]);" } 
        },
        { type: "heading", value: "Why this works" },
        { type: "text", value: "By using placeholders (`?`), the database engine treats the user input strictly as **Data**, never as **Code**. Even if an attacker enters `' OR 1=1`, it will just look for a user whose ID is literally that string." },
        { type: "defenseLayer", layers: [
          { name: "Input Validation", desc: "Check if the input is in the expected format (e.g., is it actually a number?).", color: "#F59E0B" },
          { name: "Least Privilege", desc: "The database user used by the app should only have access to what it needs.", color: "#8B5CF6" },
          { name: "WAF (Web App Firewall)", desc: "Filter out common attack payloads before they reach the server.", color: "#00F5FF" }
        ] }
      ],
      questions: [
        {
          id: "q4",
          text: "What is the industry-standard method for preventing SQL Injection?",
          answer: "Prepared Statements",
          acceptableAnswers: ["Prepared Statements", "Parameterized Queries"],
          hint: "P___ S___"
        }
      ]
    }
  ]
};

export const SQLI_BADGES = [
  { id: "sqli-junior", icon: "💉", name: "Infection Junior", desc: "Complete the first SQL Injection task" },
  { id: "bypass-master", icon: "🔓", name: "Bypass Master", desc: "Successfully bypass the login sequence" },
  { id: "data-extractor", icon: "📥", name: "Data Extractor", desc: "Extract sensitive data using UNION techniques" },
  { id: "sql-guardian", icon: "🛡️", name: "SQL Guardian", desc: "Learn all prevention techniques" },
  { id: "sqli-complete", icon: "🏆", name: "SQLi Specialist", desc: "Complete the SQL Injection Fundamentals room" }
];

export const SQLI_QUIZ = [
  {
    id: "sq1",
    question: "What does SQL Injection target?",
    options: ["Frontend", "Database", "CSS", "Images"],
    correctAnswer: "Database",
    explanation: "SQL Injection targets database queries by manipulating the input sent to the database."
  },
  {
    id: "sq2",
    question: "Which symbol is used to comment out SQL queries in MySQL?",
    options: ["//", "--", "#", "/*"],
    correctAnswer: "--",
    explanation: "-- (followed by a space) is used for single-line comments in SQL."
  },
  {
    id: "sq3",
    question: "Which keyword is used to combine results from multiple SELECT statements?",
    options: ["JOIN", "MERGE", "UNION", "CONNECT"],
    correctAnswer: "UNION",
    explanation: "UNION combines the result set of two or more SELECT statements."
  }
];
