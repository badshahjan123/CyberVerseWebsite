export const RE_ROOM_DATA = {
  id: "reverse-engineering-basics",
  title: "Reverse Engineering Basics",
  category: "Reverse Engineering",
  difficulty: "Advanced",
  duration: "75 min",
  description: "Peel back the layers of compiled software. Learn how to disassemble binaries, analyze machine instructions, and uncover hidden program logic without ever seeing the source code.",
  totalXP: 250,
  enrollments: 850,
  rating: 4.9,
  creator: "CyberVerse Team",
  tags: ["reverse", "binary", "analysis", "malware", "assembly"],
  tasks: [
    {
      id: 1,
      title: "The Dark Art of Reversing",
      subtitle: "Breaking the Black Box",
      icon: "cpu",
      difficulty: "Beginner",
      xp: 50,
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
      scenario: {
        title: "The Unknown Executable",
        text: "You've discovered a mysterious program on a secure server. You don't have the source code, but you need to know exactly what it does. This was the exact challenge faced by analysts when the Stuxnet virus was first discovered.",
        impact: "Reverse Engineering allows you to understand the functionality, security flaws, and hidden behaviors of any compiled software."
      },
      content: [
        { type: "text", value: "**Reverse Engineering (RE)** is the process of deconstructing a machine, tool, structure, or software to reveal its designs, architecture, or to extract knowledge from the object." },
        { type: "heading", value: "Primary Motivations" },
        { type: "list", items: [
          "**Malware Analysis**: Understanding how a virus spreads and what it steals.",
          "**Vulnerability Research**: Finding security bugs in closed-source software.",
          "**Interoperability**: Making two different systems work together.",
          "**Legacy Software**: Recovering logic from old programs whose source code is lost."
        ] }
      ],
      questions: [
        {
          id: "re_q1",
          text: "What is the primary goal of reverse engineering compiled software?",
          answer: "Understand program logic",
          acceptableAnswers: ["Understand program logic", "understand logic", "analyzing compiled code", "analyze binary"],
          hint: "Think about what's hidden inside the 'Black Box'."
        }
      ]
    },
    {
      id: 2,
      title: "Binary Anatomy",
      subtitle: "Inside the Executable",
      icon: "box",
      difficulty: "Intermediate",
      xp: 50,
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
      scenario: {
        title: "Extracting Secrets",
        text: "The binary might look like gibberish to a human, but it's packed with information. Often, developers leave 'Easter eggs' or even hardcoded credentials inside the binary's string table.",
        impact: "Using basic tools like 'strings', you can often find IP addresses, file paths, and secret messages without even running the program."
      },
      content: [
        { type: "text", value: "A **Binary** (like an .exe or .elf file) is a collection of machine instructions (CPU code), data (images/text), and metadata (headers) that the operating system uses to run the program." },
        { type: "heading", value: "Readable Artifacts" },
        { type: "text", value: "Strings are sequences of printable characters embedded in the file. They can provide massive clues about the program's purpose." },
        { type: "terminal", language: "bash", code: "# Extracting strings from a suspicious binary\n$ strings unknown_tool.exe | grep 'http'\nhttp://evil-server.com/upload\nhttp://internal-dev-portal.local" },
        { type: "callout", variant: "tip", title: "ELF vs PE", text: "Linux uses the **ELF** (Executable and Linkable Format) while Windows uses **PE** (Portable Executable)." }
      ],
      questions: [
        {
          id: "re_q2",
          text: "Which command-line tool is used to extract printable character sequences from a binary file?",
          answer: "strings",
          acceptableAnswers: ["strings", "strings command"],
          hint: "It's the plural of a sequence of characters."
        }
      ]
    },
    {
      id: 3,
      title: "Static Analysis",
      subtitle: "The Mathematical Blueprint",
      icon: "search",
      difficulty: "Advanced",
      xp: 50,
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800",
      scenario: {
        title: "Disassembling the Virus",
        text: "Running a virus is dangerous. Instead, you use a **Disassembler** to turn the 1s and 0s back into Assembly language. You can now see the logic flow as a graph, identifying the exact line where the program checks for an admin password.",
        impact: "Static analysis is the safest way to analyze malware. You see every possible path the code can take without ever pulling the trigger."
      },
      content: [
        { type: "text", value: "**Static Analysis** involves inspecting the code without executing it. We use **Disassemblers** (like IDA Pro, Ghidra, or Binary Ninja) to turn machine code into human-readable Assembly." },
        { type: "heading", value: "The Reversing Workflow" },
        { type: "list", items: [
          "**Disassembly**: Machine Code -> Assembly (MOV, JMP, CALL).",
          "**Decompilation**: Assembly -> Pseudo-C Code (If/Else, Loops).",
          "**Control Flow Graph (CFG)**: A visual map of jumps and branches in the code."
        ] },
        { type: "terminal", language: "x86asm", code: "; Simple assembly block\ncmp eax, 0x42      ; Compare value to 66\nje  access_granted  ; Jump if equal\ncall trigger_alarm  ; Otherwise, fail" }
      ],
      questions: [
        {
          id: "re_q3",
          text: "What is the name for the process of converting machine code back into Assembly language?",
          answer: "Disassembly",
          acceptableAnswers: ["Disassembly", "disassembling"],
          hint: "The opposite of Assembly."
        }
      ]
    },
    {
      id: 4,
      title: "Dynamic Analysis",
      subtitle: "Debugging the Runtime",
      icon: "activity",
      difficulty: "Advanced",
      xp: 50,
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800",
      scenario: {
        title: "Tracing the Malware",
        text: "Some programs are 'obfuscated' or packed to hide their static logic. To understand them, you must run them in a **Debugger** (like x64dbg or GDB). You step through the code one instruction at a time, watching the CPU registers change in real-time.",
        impact: "Dynamic analysis reveals what the code *actually* does when it touches the operating system—files it writes, network connections it makes, and keys it logs."
      },
      content: [
        { type: "text", value: "**Dynamic Analysis** is performed while the program is running. Pentesters use **Debuggers** to set **Breakpoints**, allowing them to pause the program at a specific memory address." },
        { type: "heading", value: "Debugger Essentials" },
        { type: "list", items: [
          "**Step Over**: Execute the next line and move to the next.",
          "**Step Into**: Go inside a function call to see its inner logic.",
          "**Breakpoint**: An intentional stopping point for debugging.",
          "**Registers**: High-speed memory locations in the CPU (EAX, ESP, EIP)."
        ] },
        { type: "terminal", language: "bash", code: "# Running a program in GDB (Gnu Debugger)\n$ gdb ./malware_sample\n(gdb) break main\n(gdb) run\n(gdb) info registers eax" }
      ],
      questions: [
        {
          id: "re_q4",
          text: "What is the term for a specific location in code where you tell a debugger to pause execution?",
          answer: "Breakpoint",
          acceptableAnswers: ["Breakpoint", "break point", "breakpoints"],
          hint: "A point where you 'break' the flow."
        }
      ]
    },
    {
      id: 5,
      title: "Bypassing the Logic",
      subtitle: "The Final Crack",
      icon: "unlock",
      difficulty: "Advanced",
      xp: 50,
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
      scenario: {
        title: "The Logic Bomb",
        text: "You find a 'Logic Bomb' in a corporate application that will delete all files if a specific employee's name isn't in the database. You use your reversing skills to change the 'JNE' (Jump if Not Equal) instruction to a 'NOP' (No Operation), effectively neutralizing the threat.",
        impact: "By patching a binary, you can change its behavior permanently to bypass licensing, crack passwords, or disable malicious triggers."
      },
      content: [
        { type: "text", value: "Patching is the process of modifying a binary's machine code to alter its logic. This is commonly done in CTFs to 'crack' a program." },
        { type: "heading", value: "Common Patches" },
        { type: "comparison", 
          left: { title: "Vulnerable Path", color: "#EF4444", items: ["`JZ` (Jump if Zero)", "`CMP EAX, 1`", "Require valid Key"] }, 
          right: { title: "Patched Path", color: "#39FF14", items: ["`JNZ` (Jump if Not Zero)", "`NOP` (No Operation)", "Bypass Key Check"] } 
        },
        { type: "terminal", language: "text", code: "Original Hex: 74 12 (JZ instruction)\nPatched Hex : 90 90 (NOP instructions)\nResult      : The program ignores the security check." }
      ],
      questions: [
        {
          id: "re_q5",
          text: "What is the Assembly instruction used to tell the CPU to do 'Nothing' for a cycle?",
          answer: "NOP",
          acceptableAnswers: ["NOP", "No Operation", "0x90"],
          hint: "N___O___P"
        }
      ]
    }
  ]
};

export const RE_BADGES = [
  { id: "analyzer", icon: "🔍", name: "Code Analyzer", desc: "Understand binaries" },
  { id: "binary-reader", icon: "📦", name: "Binary Reader", desc: "Extract data" },
  { id: "static-pro", icon: "🧠", name: "Static Pro", desc: "Analyze without execution" },
  { id: "dynamic-hacker", icon: "⚡", name: "Dynamic Hacker", desc: "Run analysis" },
  { id: "reverse-master", icon: "🔥", name: "Reverse Master", desc: "Complete all tasks" }
];

export const RE_QUIZ = [
  {
    id: "re_fq1",
    question: "What is the primary difference between Static and Dynamic analysis?",
    options: ["Static is faster", "Dynamic involves executing the program", "Static only works on Windows", "Dynamic is safer for malware"],
    correctAnswer: "Dynamic involves executing the program",
    explanation: "Static analysis is reading the code; dynamic analysis is watching the code run in a controlled environment."
  },
  {
    id: "re_fq2",
    question: "A 'strings' attack on a binary is most useful for finding what?",
    options: ["The CPU architecture", "Hardcoded credentials or IP addresses", "The original C++ source code", "System vulnerabilities"],
    correctAnswer: "Hardcoded credentials or IP addresses",
    explanation: "Plaintext strings embedded in the binary often reveal sensitive information like URLs or passcodes."
  },
  {
    id: "re_fq3",
    question: "Which tool would a reverse engineer use for 'Static' disassembly of a complex binary?",
    options: ["GDB", "Ghidra", "Wireshark", "Nmap"],
    correctAnswer: "Ghidra",
    explanation: "Ghidra (Open Source) and IDA Pro (Commercial) are the leading tools for static disassembly and decompilation."
  },
  {
    id: "re_fq4",
    question: "What is a 'Register' in the context of Reverse Engineering?",
    options: ["A list of all users", "High-speed memory inside the CPU", "The software license plate", "A log of all errors"],
    correctAnswer: "High-speed memory inside the CPU",
    explanation: "Registers (EAX, EBX, etc.) are tiny, ultra-fast storage locations used by the CPU to perform operations."
  },
  {
    id: "re_fq5",
    question: "What does patching a JNE (Jump if Not Equal) instruction to a NOP achieve?",
    options: ["Deletes the program", "Speeds up execution", "Bypasses a conditional check", "Encrypts the binary"],
    correctAnswer: "Bypasses a conditional check",
    explanation: "Using NOPs (No Operation) to overwrite jump instructions effectively makes the program ignore the result of a security comparison."
  }
];
