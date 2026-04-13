export const CRYPTO_ROOM_DATA = {
  id: "cryptography-basics",
  title: "Cryptography & Hashing",
  category: "Crypto",
  difficulty: "Intermediate",
  duration: "60 min",
  description: "Master the fundamental pillars of digital security. Learn how to encrypt data, securely hash passwords, and understand the core differences between symmetric and asymmetric protocols.",
  totalXP: 175,
  enrollments: 1400,
  rating: 4.8,
  creator: "CyberVerse Team",
  tags: ["crypto", "hashing", "encryption", "ctf", "security"],
  tasks: [
    {
      id: 1,
      title: "The Core of Confidentiality",
      subtitle: "Protecting Information",
      icon: "lock",
      difficulty: "Beginner",
      xp: 35,
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
      scenario: {
        title: "The Secure Channel",
        text: "You are setting up a communication line between two agents. You need to ensure that even if an attacker intercepts the messages, they cannot read the content. This is the goal of cryptography.",
        impact: "Cryptography provides Confidentiality (keep it secret), Integrity (ensure it hasn't changed), and Authenticity (prove who sent it)."
      },
      content: [
        { type: "text", value: "**Cryptography** is the science of using mathematics to encrypt and decrypt data. It allows you to store sensitive information or transmit it across insecure networks so that it cannot be read by anyone except the intended recipient." },
        { type: "heading", value: "The CIA Triad" },
        { type: "list", items: [
          "**Confidentiality**: Ensuring data is accessible only to those authorized to have access.",
          "**Integrity**: Ensuring data is accurate and has not been tampered with.",
          "**Availability**: Ensuring data is accessible when needed by authorized users."
        ] }
      ],
      questions: [
        {
          id: "crypto_q1",
          text: "Which pillar of the CIA triad focuses specifically on keeping data secret?",
          answer: "Confidentiality",
          acceptableAnswers: ["Confidentiality", "confidentiality"],
          hint: "Think about 'strictly confidential' files."
        }
      ]
    },
    {
      id: 2,
      title: "Encoding vs Encryption",
      subtitle: "The Beginner's Trap",
      icon: "code",
      difficulty: "Beginner",
      xp: 35,
      image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800",
      scenario: {
        title: "The Misidentified Secret",
        text: "You find a password in a database that looks like 'YWRtaW4='. New developers think this is 'encrypted', but you know better. This is just encoded, and anyone can reverse it without a key.",
        impact: "Encoding is for data transport, NOT security. If there is no secret key, there is no security."
      },
      content: [
        { type: "text", value: "**Encoding** transforms data into a different format using a public scheme (like Base64 or Hex). **Encryption** transforms data using a secret key." },
        { type: "heading", value: "Common Formats" },
        { type: "comparison", 
          left: { title: "Base64 Encoding", color: "#00F5FF", items: ["Reversible without key", "Used for binary transport", "Characters: A-Z, a-z, 0-9, +, /"] }, 
          right: { title: "AES Encryption", color: "#EF4444", items: ["Irreversible without key", "Industry standard for security", "Uses complex math (Rijndael)"] } 
        },
        { type: "terminal", language: "text", code: "# Base64 encoding 'admin'\n$ echo -n 'admin' | base64\nYWRtaW4=\n\n# Decoding it\n$ echo 'YWRtaW4=' | base64 -d\nadmin" }
      ],
      questions: [
        {
          id: "crypto_q2",
          text: "What common 64-character encoding scheme is often mistaken for encryption?",
          answer: "Base64",
          acceptableAnswers: ["Base64", "base-64", "b64"],
          hint: "Look at the terminal example above."
        }
      ]
    },
    {
      id: 3,
      title: "The One-Way Street: Hashing",
      subtitle: "Data Integrity & Password Security",
      icon: "hash",
      difficulty: "Intermediate",
      xp: 35,
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800",
      scenario: {
        title: "The Digital Fingerprint",
        text: "You are downloading a massive system update. To ensure the file wasn't corrupted or injected with a virus during download, you compare its MD5 hash to the developer's original hash.",
        impact: "Hashing proves integrity. A single bit change in the file results in a completely different hash string."
      },
      content: [
        { type: "text", value: "A **Hash** is a one-way mathematical function that takes an input of any size and produces a fixed-length string of characters." },
        { type: "heading", value: "Key Properties of Hashing" },
        { type: "list", items: [
          "**One-Way**: You cannot reverse a hash to see the original data.",
          "**Deterministic**: The same input always produces the exact same hash.",
          "**Fixed Length**: No matter how big the file is, the hash length stays the same.",
          "**Avalanche Effect**: Change one letter, and the entire hash changes."
        ] },
        { type: "terminal", language: "bash", code: "# hashing a secret password with SHA-256\n$ echo -n 'P@ssword123' | sha256sum\nef92b778ba71d2b8660a5e2f75062... " }
      ],
      questions: [
        {
          id: "crypto_q3",
          text: "True or False: A secure hashing algorithm can be easily reversed to find the original password.",
          answer: "False",
          acceptableAnswers: ["False", "false", "F"],
          hint: "Hashing is a one-way street."
        }
      ]
    },
    {
      id: 4,
      title: "Cracking the Hash",
      subtitle: "Brute Force vs Optimization",
      icon: "unlock",
      difficulty: "Intermediate",
      xp: 35,
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800",
      scenario: {
        title: "The Leaked Database",
        text: "You've successfully dumped a database from a target server. The passwords aren't in plain text—they are SHA-1 hashes. You need to use a tool like John the Ripper to find common passwords.",
        impact: "Weak passwords with no 'salt' can be cracked in seconds using pre-computed tables or powerful GPUs."
      },
      content: [
        { type: "text", value: "While hashes can't be 'decrypted', they can be 'cracked' by guessing millions of passwords, hashing them, and comparing the results." },
        { type: "heading", value: "Attack Techniques" },
        { type: "list", items: [
          "**Dictionary Attack**: Trying every word in a giant list of common passwords.",
          "**Brute Force**: Trying every possible combination of characters (aaaa, aaab, aaac...).",
          "**Rainbow Tables**: Using pre-computed tables of hashes to find matches instantly.",
          "**Salting**: A defense where random data is added to the password BEFORE hashing to prevent pre-computed attacks."
        ] },
        { type: "terminal", language: "bash", code: "# Using hashcat to crack a MD5 hash\n$ hashcat -m 0 -a 0 hashes.txt rockyou.txt\n\n# Found: 5f4dcc3b5aa765d61d8327deb882cf99:password" }
      ],
      questions: [
        {
          id: "crypto_q4",
          text: "What is the security practice of adding random data to a password before hashing called?",
          answer: "Salting",
          acceptableAnswers: ["Salting", "Salt", "salting"],
          hint: "Think about seasoning food."
        }
      ]
    },
    {
      id: 5,
      title: "Symmetric vs Asymmetric",
      subtitle: "The Key Management Dilemma",
      icon: "key",
      difficulty: "Intermediate",
      xp: 35,
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
      scenario: {
        title: "The Handshake",
        text: "Two strangers need to exchange a key over the internet without anyone else seeing it. They use Asymmetric encryption to share a Symmetric key for the rest of the conversation.",
        impact: "This hybrid approach is how modern HTTPS/TLS works—the backbone of the secure web."
      },
      content: [
        { type: "text", value: "Modern encryption is divided into two main categories based on how keys are managed." },
        { type: "heading", value: "The Comparison" },
        { type: "comparison", 
          left: { title: "Symmetric Encryption", color: "#EF4444", items: ["One key for both Encrypt/Decrypt", "Very fast (good for files)", "Examples: AES, DES, ChaCha20"] }, 
          right: { title: "Asymmetric Encryption", color: "#39FF14", items: ["Two keys: Public and Private", "Slower (good for signatures)", "Examples: RSA, ECC, Diffie-Hellman"] } 
        },
        { type: "callout", variant: "tip", title: "Public Key Rule", text: "You can share your Public Key with the whole world. Anyone can use it to encrypt a message for you, but ONLY your Private Key can decrypt it." }
      ],
      questions: [
        {
          id: "crypto_q5",
          text: "Which type of encryption uses a pair of keys (Public and Private)?",
          answer: "Asymmetric",
          acceptableAnswers: ["Asymmetric", "asymmetric encryption", "asymmetric"],
          hint: "The keys are not 'symmetric'."
        }
      ]
    }
  ]
};

export const CRYPTO_BADGES = [
  { id: "crypto-beginner", icon: "🔐", name: "Crypto Starter", desc: "Learn basics" },
  { id: "encoder", icon: "🧾", name: "Encoder", desc: "Understand encoding" },
  { id: "hasher", icon: "#️⃣", name: "Hash Master", desc: "Master hashing" },
  { id: "cracker", icon: "💥", name: "Hash Cracker", desc: "Break hashes" },
  { id: "crypto-master", icon: "🔥", name: "Crypto Master", desc: "Complete all tasks" }
];

export const CRYPTO_QUIZ = [
  {
    id: "crypto_fq1",
    question: "What is the primary difference between Encoding and Encryption?",
    options: ["Encoding is faster", "Encryption requires a secret key", "Encoding only works on text", "Encryption is an old technique"],
    correctAnswer: "Encryption requires a secret key",
    explanation: "Encoding is for data representation and is public; Encryption requires a private key for security."
  },
  {
    id: "crypto_fq2",
    question: "Why is Hashing considered a 'One-Way' function?",
    options: ["It only moves data to the left", "It cannot be reversed to find the original input", "It only works once per day", "It destroys the original file"],
    correctAnswer: "It cannot be reversed to find the original input",
    explanation: "Once data is hashed, the original input cannot be mathematically recovered from the hash string."
  },
  {
    id: "crypto_fq3",
    question: "Which hash algorithm is commonly used today for password storage?",
    options: ["MD5", "SHA-1", "bcrypt", "Base64"],
    correctAnswer: "bcrypt",
    explanation: "bcrypt is purpose-built for password hashing as it is intentionally slow and has built-in salting."
  },
  {
    id: "crypto_fq4",
    question: "What does Symmetric encryption use for encryption and decryption?",
    options: ["One shared key", "A public and private pair", "A password and a username", "A random number"],
    correctAnswer: "One shared key",
    explanation: "Symmetric algorithms like AES use the same identical key to both lock and unlock the data."
  },
  {
    id: "crypto_fq5",
    question: "How does HTTPS (TLS) use encryption during a website visit?",
    options: ["It only uses Symmetric encryption", "It only uses Hashing", "It uses Asymmetric to share a Symmetric key", "It doesn't use any cryptography"],
    correctAnswer: "It uses Asymmetric to share a Symmetric key",
    explanation: "This hybrid approach combines the security of asymmetric key exchange with the speed of symmetric data transfer."
  }
];
