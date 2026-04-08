export const NETWORKING_ROOM_DATA = {
  id: "networking-fundamentals",
  title: "Networking Fundamentals",
  category: "Networking",
  difficulty: "Beginner",
  duration: "60 min",
  description: "Master the OSI model, TCP/IP, DNS, and routing fundamentals to build a solid foundation in networking.",
  totalXP: 1500,
  enrollments: 3247,
  rating: 4.8,
  creator: "CyberVerse Team",
  tags: ["networking", "osi-model", "tcp-ip", "routing", "dns"],
  tasks: [
    {
      id: 1,
      title: "The OSI Model",
      subtitle: "The 7 Layers of Communication",
      icon: "layers",
      difficulty: "Beginner",
      xp: 150,
      image: "/images/rooms/osi-model.png",
      scenario: {
        title: "The Digital Tower",
        text: "The OSI model is like a skyscraper. Each floor (layer) has a specific job, and data must travel through every floor to reach its destination.",
        impact: "Troubleshooting starts here. If you can't ping a server, is it a Layer 1 (Physical) issue or a Layer 3 (Network) issue?"
      },
      content: [
        { type: "text", value: "The **OSI (Open Systems Interconnection)** model defines how data is transmitted across a network." },
        { type: "heading", value: "The 7 Layers" },
        { type: "list", items: [
          "**Layer 7: Application** – Where users interact (HTTP, FTP, SMTP).",
          "**Layer 4: Transport** – End-to-end delivery (TCP, UDP).",
          "**Layer 3: Network** – Routing and IP addressing (Router).",
          "**Layer 2: Data Link** – Local addressing (Switch, MAC).",
          "**Layer 1: Physical** – Cables, bits, and pulses (NIC, Cables)."
        ] }
      ],
      questions: [
        {
          id: "q1",
          text: "Which OSI layer is responsible for IP Addressing and Routing?",
          answer: "Network",
          acceptableAnswers: ["Network", "Layer 3"],
          hint: "Think about how routers move packets between different networks."
        }
      ]
    },
    {
      id: 2,
      title: "IP Addressing & Subnetting",
      subtitle: "Your Digital Fingerprint",
      icon: "hash",
      difficulty: "Beginner",
      xp: 250,
      image: "/images/rooms/ip-routing.png",
      scenario: {
        title: "The Global Post Office",
        text: "An IP address is like your home address. Without it, the network doesn't know where to send your data packets.",
        impact: "There are only 4.3 billion IPv4 addresses, but IPv6 provides 340 undecillion addresses (340 followed by 36 zeros)."
      },
      content: [
        { type: "text", value: "IP addresses come in two types: **IPv4** (e.g., 192.168.1.1) and **IPv6** (e.g., 2001:0db8::)." },
        { type: "heading", value: "Subnet Masks" },
        { type: "text", value: "A Subnet Mask (like 255.255.255.0) tells a computer which part of the address is the **Network** and which is the **Host**." },
        { type: "terminal", language: "bash", code: `# Check your local IP info
ipconfig // Windows
ifconfig // Linux/Mac

IPv4 Address: 192.168.0.42
Subnet Mask: 255.255.255.0
Default Gateway: 192.168.0.1` }
      ],
      questions: [
        {
          id: "q2",
          text: "How many bits are in an IPv4 address?",
          answer: "32",
          acceptableAnswers: ["32", "32-bit"],
          hint: "Four octets, and 4 x 8 = ?"
        }
      ]
    },
    {
      id: 3,
      title: "Protocols: TCP vs UDP",
      subtitle: "Reliability vs Speed",
      icon: "activity",
      difficulty: "Beginner",
      xp: 300,
      image: "/images/rooms/osi-model.png",
      scenario: {
        title: "The Handshake",
        text: "TCP is like a recorded delivery letter (requires signature). UDP is like shouting into a crowd (no guarantee of arrival).",
        impact: "Web browsing uses TCP (reliability), while video calling uses UDP (speed/low latency)."
      },
      content: [
        { type: "text", value: "**TCP (Transmission Control Protocol)** is connection-oriented and uses a 3-way handshake." },
        { type: "heading", value: "The 3-Way Handshake" },
        { type: "list", items: [
          "**SYN:** Client sends synchronization request.",
          "**SYN-ACK:** Server acknowledges and synchronizes back.",
          "**ACK:** Client acknowledges. Connection established."
        ] },
        { type: "text", value: "**UDP (User Datagram Protocol)** is 'fire-and-forget'. It doesn't check if data arrived." }
      ],
      questions: [
        {
          id: "q3",
          text: "Which protocol is 'connectionless' and faster for streaming?",
          answer: "UDP",
          acceptableAnswers: ["UDP"],
          hint: "It has no handshake and doesn't retransmit lost data."
        }
      ]
    },
    {
      id: 4,
      title: "DNS & DHCP",
      subtitle: "The Address Book and Assistant",
      icon: "globe",
      difficulty: "Beginner",
      xp: 350,
      image: "/images/rooms/ip-routing.png",
      scenario: {
        title: "The Phonebook",
        text: "DNS turns 'google.com' into '8.8.8.8'. Humans like names; machines like numbers.",
        impact: "Without DNS, you'd have to memorize hundreds of IP addresses just to browse the web."
      },
      content: [
        { type: "text", value: "**DNS (Domain Name System)** maps domain names to IP addresses." },
        { type: "text", value: "**DHCP (Dynamic Host Configuration Protocol)** automatically assigns IP addresses to devices on a network." },
        { type: "terminal", language: "bash", code: `# Looking up a domain's IP
nslookup cyberverse.org

Server: 1.1.1.1
Address: 104.21.78.221` }
      ],
      questions: [
        {
          id: "q4",
          text: "What protocol automatically assigns an IP address to your laptop when you join Wi-Fi?",
          answer: "DHCP",
          acceptableAnswers: ["DHCP"],
          hint: "D___ H___ C___ P___."
        }
      ]
    },
    {
      id: 5,
      title: "Routing & Switching",
      subtitle: "Moving Data Packets",
      icon: "router",
      difficulty: "Intermediate",
      xp: 450,
      image: "/images/rooms/osi-model.png",
      scenario: {
        title: "The Traffic Controller",
        text: "A Switch connects devices locally. A Router connects different networks together.",
        impact: "The Internet is simply a massive collection of routers talking to each other via BGP."
      },
      content: [
        { type: "text", value: "Data is sent in **Packets**. Each packet contains information like the source IP, destination IP, and the payload." },
        { type: "heading", value: "Network Devices" },
        { type: "list", items: [
          "**Hub:** Obsolete. Sends data to everyone.",
          "**Switch:** Layer 2. Sends data to the specific MAC address.",
          "**Router:** Layer 3. Finds the best path across different networks."
        ] }
      ],
      questions: [
        {
          id: "q5",
          text: "At which OSI layer does a SWITCH primarily operate?",
          answer: "Data Link",
          acceptableAnswers: ["Data Link", "Layer 2"],
          hint: "It uses MAC addresses, not IP addresses."
        }
      ]
    }
  ]
};

export const NETWORKING_BADGES = [
  { id: "layers", icon: "🏢", name: "OSI Architect", desc: "Understand the 7 layers" },
  { id: "packets", icon: "📦", name: "Packet Tracker", desc: "Master IP and Subnetting" },
  { id: "protocols", icon: "🤝", name: "Handshake Pro", desc: "Master TCP and UDP" },
  { id: "resolver", icon: "📖", name: "DNS Resolver", desc: "Master DNS and DHCP" },
  { id: "networker", icon: "🕸️", name: "Network Master", desc: "Complete all tasks" }
];

export const NETWORKING_QUIZ = [
  {
    id: "fq1",
    question: "Which OSI layer is responsible for end-to-end data delivery and error checking?",
    options: ["Network", "Transport", "Session", "Data Link"],
    correctAnswer: "Transport",
    explanation: "The Transport layer (Layer 4) handles reliable delivery via TCP or fast delivery via UDP."
  },
  {
    id: "fq2",
    question: "What is the standard subnet mask for a Class C network (/24)?",
    options: ["255.0.0.0", "255.255.0.0", "255.255.255.0", "255.255.255.255"],
    correctAnswer: "255.255.255.0",
    explanation: "A /24 subnet mask uses 24 bits for the network, leaving 8 bits (one octet) for hosts."
  },
  {
    id: "fq3",
    question: "During a TCP 3-way handshake, what is the second packet sent?",
    options: ["SYN", "ACK", "SYN-ACK", "FIN"],
    correctAnswer: "SYN-ACK",
    explanation: "The server responds to the client's SYN with a SYN-ACK (Synchronization Acknowledgment)."
  },
  {
    id: "fq4",
    question: "Which port does HTTPS use by default?",
    options: ["80", "21", "22", "443"],
    correctAnswer: "443",
    explanation: "Port 80 is for HTTP (unsecured), while 443 is for HTTPS (secured with TLS/SSL)."
  },
  {
    id: "fq5",
    question: "What does ARP stand for?",
    options: ["Address Resolution Protocol", "Active Routing Path", "Advanced Relay Packet", "All Router Ping"],
    correctAnswer: "Address Resolution Protocol",
    explanation: "ARP is used to map an IP address to a physical MAC address on a local network."
  },
  {
    id: "fq6",
    question: "Which of these is a PRIVATE IP address range?",
    options: ["8.8.8.8", "192.168.1.0", "157.240.22.35", "104.26.10.19"],
    correctAnswer: "192.168.1.0",
    explanation: "Private ranges like 10.x.x.x, 172.16.x.x-172.31.x.x, and 192.168.x.x are reserved for internal networks."
  },
  {
    id: "fq7",
    question: "What protocol does 'Ping' use?",
    options: ["TCP", "UDP", "ICMP", "HTTP"],
    correctAnswer: "ICMP",
    explanation: "ICMP (Internet Control Message Protocol) is used for network diagnostics and error reporting."
  },
  {
    id: "fq8",
    question: "What is the physical address of a network interface card (NIC)?",
    options: ["IP Address", "MAC Address", "Subnet Mask", "DHCP ID"],
    correctAnswer: "MAC Address",
    explanation: "The Media Access Control (MAC) address is a unique identifier hardcoded into the network hardware."
  },
  {
    id: "fq9",
    question: "What layer of the OSI model does a HUB operate on?",
    options: ["Physical", "Network", "Transport", "Data Link"],
    correctAnswer: "Physical",
    explanation: "Hubs are 'dumb' devices that just repeat electrical signals, hence they operate at Layer 1."
  },
  {
    id: "fq10",
    question: "How many octets are in an IPv4 address?",
    options: ["2", "4", "6", "8"],
    correctAnswer: "4",
    explanation: "An IPv4 address like 192.168.1.1 consists of 4 octets (groups of 8 bits)."
  }
];
