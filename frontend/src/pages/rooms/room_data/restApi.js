export const REST_API_ROOM_DATA = {
  id: "rest-api-mastery",
  title: "Introduction to RESTful APIs",
  category: "Development",
  difficulty: "Beginner",
  duration: "40 min",
  description: "Learn REST API fundamentals, HTTP methods, JSON, and build your first endpoint with Express.js.",
  totalXP: 100,
  enrollments: 4827,
  rating: 4.8,
  creator: "CyberVerse Team",
  tags: ["api", "rest", "backend", "http", "express"],
  tasks: [
    {
      id: 1,
      title: "What is an API?",
      subtitle: "The bridge between systems",
      icon: "globe",
      difficulty: "Beginner",
      xp: 20,
      image: "/images/rooms/api-intro.png",
      scenario: {
        title: "The Digital Waiter",
        text: "Think of an API like a waiter in a restaurant. You (the client) tell the waiter (the API) what you want from the menu (the endpoint), and the waiter brings the food (the data) from the kitchen (the server).",
        impact: "APIs power 80% of modern web traffic, connecting everything from mobile apps to weather stations."
      },
      content: [
        { type: "text", value: "An **API (Application Programming Interface)** is a set of rules that allow two computers to talk to each other. In web development, we most commonly use **REST (Representational State Transfer)** APIs." },
        { type: "heading", value: "Core Principles of REST" },
        { type: "list", items: [
          "**Stateless:** Each request contains all the information needed to process it.",
          "**Client-Server:** The UI and the data storage are separate.",
          "**Resource-Based:** Everything is a 'resource' identified by a URL."
        ] },
        { type: "heading", value: "The HTTP Methods" },
        { type: "text", value: "We use standard HTTP verbs to perform actions on resources:" },
        { type: "list", items: [
          "**GET:** Retrieve data (Read)",
          "**POST:** Create new data",
          "**PUT:** Update existing data",
          "**DELETE:** Remove data"
        ] }
      ],
      questions: [
        {
          id: "q1",
          text: "Which HTTP method is used to RETRIEVE data from a server?",
          answer: "GET",
          acceptableAnswers: ["GET"],
          hint: "It's synonymous with 'fetching' or 'obtaining'."
        }
      ]
    },
    {
      id: 2,
      title: "Request & Response",
      subtitle: "The Anatomy of Digital Communication",
      icon: "activity",
      difficulty: "Beginner",
      xp: 20,
      image: "/images/rooms/api-endpoint.png",
      scenario: {
        title: "The Sealed Envelope",
        text: "An HTTP request is like sending a letter. It has an address (URL), a method (GET/POST), headers (postage info), and sometimes a body (the letter content).",
        impact: "Understanding status codes is vital for debugging. A 404 is a missing page, but a 500 means the server crashed."
      },
      content: [
        { type: "text", value: "When you send a request, the server sends back a **Response**. This response contains a **Status Code** and usually some **Data** (often in JSON format)." },
        { type: "heading", value: "Status Code Cheat Sheet" },
        { type: "list", items: [
          "**200 OK:** Everything went perfect.",
          "**201 Created:** Success! Data was saved.",
          "**400 Bad Request:** You sent something the server doesn't understand.",
          "**401 Unauthorized:** You forgot your ID badge (API key).",
          "**404 Not Found:** That resource doesn't exist.",
          "**500 Server Error:** The server exploded (code bug)."
        ] },
        { type: "terminal", language: "json", code: `// Example JSON Response
{
  "status": "success",
  "data": {
    "id": 101,
    "username": "cyber_ninja",
    "level": 42
  }
}` }
      ],
      questions: [
        {
          id: "q2",
          text: "What status code is returned when a resource is NOT found?",
          answer: "404",
          acceptableAnswers: ["404"],
          hint: "It's the most famous error code on the internet."
        }
      ]
    },
    {
      id: 3,
      title: "JSON: The Language of APIs",
      subtitle: "JavaScript Object Notation",
      icon: "code",
      difficulty: "Beginner",
      xp: 20,
      image: "/images/rooms/api-intro.png",
      scenario: {
        title: "The Data Bridge",
        text: "JSON is the universal language of the web. It's easy for humans to read and easy for machines to parse.",
        impact: "JSON replaced XML because it's much lighter and faster for mobile networks."
      },
      content: [
        { type: "text", value: "JSON stores data in **key-value pairs**. It supports strings, numbers, booleans, arrays, and nested objects." },
        { type: "terminal", language: "javascript", code: `const user = {
  name: 'Alice',
  isAdmin: true,
  roles: ['dev', 'admin'],
  stats: { hp: 100, mp: 50 }
};
// Transformed to JSON
JSON.stringify(user);` },
        { type: "heading", value: "JSON Syntax Rules" },
        { type: "list", items: [
          "Strings must be in **double quotes**.",
          "Keys must be in **double quotes**.",
          "No trailing commas.",
          "Bracket mapping: {} for objects, [] for arrays."
        ] }
      ],
      questions: [
        {
          id: "q3",
          text: "In JSON, what bracket character is used to define an ARRAY?",
          answer: "[",
          acceptableAnswers: ["[", "square bracket", "square brackets"],
          hint: "Think about lists like [1, 2, 3]."
        }
      ]
    },
    {
      id: 4,
      title: "Headers & Auth",
      subtitle: "Security and Metadata",
      icon: "lock",
      difficulty: "Beginner",
      xp: 20,
      image: "/images/rooms/api-endpoint.png",
      scenario: {
        title: "The VIP Pass",
        text: "You wouldn't let just anyone into your server. Authentication headers prove you're an authorized user.",
        impact: "API breaches often happen because developers leave sensitive keys in client-side code."
      },
      content: [
        { type: "text", value: "HTTP Headers carry information about the request. The most important header for security is `Authorization`." },
        { type: "heading", value: "Common Headers" },
        { type: "list", items: [
          "**Content-Type:** Tells the server the data format (e.g., application/json).",
          "**User-Agent:** Identifies your browser or tool.",
          "**Authorization:** Carries your API Key or JWT Token."
        ] },
        { type: "terminal", language: "http", code: `POST /api/users
Content-Type: application/json
Authorization: Bearer my-secret-token-123

{ "username": "new_user" }` }
      ],
      questions: [
        {
          id: "q4",
          text: "Which header name is most commonly used for sending security tokens?",
          answer: "Authorization",
          acceptableAnswers: ["Authorization"],
          hint: "It sounds like 'Permission'."
        }
      ]
    },
    {
      id: 5,
      title: "Building your First Endpoint",
      subtitle: "Express.js Basics",
      icon: "server",
      difficulty: "Beginner",
      xp: 20,
      image: "/images/rooms/api-intro.png",
      scenario: {
        title: "The Architect",
        text: "Now you'll see how to actually build an API using Express.js, the most popular Node.js framework.",
        impact: "Companies like Netflix and Uber use Express for their microservices."
      },
      content: [
        { type: "text", value: "Building a GET endpoint in Express is as simple as defining a route and a callback function." },
        { type: "terminal", language: "javascript", code: `const express = require('express');
const app = express();

// Define a resource
app.get('/api/message', (req, res) => {
  res.status(200).json({
    msg: 'Hello CyberVerse!'
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));` }
      ],
      questions: [
        {
          id: "q5",
          text: "In the code above, which function call sends the final data back to the user?",
          answer: "res.json",
          acceptableAnswers: ["res.json", "json", "res.json()"],
          hint: "Check the line inside the app.get callback."
        }
      ]
    }
  ]
};

export const REST_API_BADGES = [
  { id: "methods", icon: "🌐", name: "Verb Master", desc: "Understand HTTP methods" },
  { id: "status", icon: "🔢", name: "Status Pro", desc: "Master HTTP status codes" },
  { id: "json", icon: "📦", name: "JSON Wiz", desc: "Perfectly parse JSON data" },
  { id: "secure", icon: "🔑", name: "Gatekeeper", desc: "Secure your endpoints" },
  { id: "architect", icon: "🏗️", name: "API Builder", desc: "Complete all 5 tasks" }
];

export const REST_API_QUIZ = [
  {
    id: "fq1",
    question: "What does REST stand for?",
    options: ["Remote Efficient State Transfer", "Representational State Transfer", "Request Send Total", "Relational Server Transmission"],
    correctAnswer: "Representational State Transfer",
    explanation: "REST is an architectural style for providing standards between computer systems on the web."
  },
  {
    id: "fq2",
    question: "Which HTTP method is specifically used for UPDATING existing data?",
    options: ["GET", "POST", "PUT", "DELETE"],
    correctAnswer: "PUT",
    explanation: "PUT (or PATCH) is used to modify existing resources on the server."
  },
  {
    id: "fq3",
    question: "A status code of 201 indicates what?",
    options: ["OK", "Created", "Accepted", "No Content"],
    correctAnswer: "Created",
    explanation: "201 Created is the standard response for a successful POST request that creates a new resource."
  },
  {
    id: "fq4",
    question: "Which of these is VALID JSON syntax?",
    options: ["{ name: 'John' }", "{ 'name': 'John' }", "{ \"name\": \"John\" }", "[ 'name': 'John' ]"],
    correctAnswer: "{ \"name\": \"John\" }",
    explanation: "JSON requires double quotes for both keys and string values."
  },
  {
    id: "fq5",
    question: "What is the purpose of the 'Content-Type' header?",
    options: ["To encrypt the data", "To specify the data format (e.g. JSON)", "To identify the user", "To set the server time"],
    correctAnswer: "To specify the data format (e.g. JSON)",
    explanation: "It tells the receiver how to interpret the body of the message."
  },
  {
    id: "fq6",
    question: "Which status code represents a CLIENT-side error?",
    options: ["200", "302", "404", "500"],
    correctAnswer: "404",
    explanation: "Codes in the 4xx range indicate errors made by the client sending the request."
  },
  {
    id: "fq7",
    question: "What does 'Stateless' mean in REST?",
    options: ["Server remembers user history", "Server doesn't store client session", "Database is not used", "API is always offline"],
    correctAnswer: "Server doesn't store client session",
    explanation: "Statelessness means each request from a client to a server must contain all the information necessary to understand the request."
  },
  {
    id: "fq8",
    question: "Which Node.js framework is most commonly used to build APIs?",
    options: ["React", "Express", "Vite", "Next.js"],
    correctAnswer: "Express",
    explanation: "Express.js is the standard minimal framework for building web servers in Node.js."
  },
  {
    id: "fq9",
    question: "How do you send sensitive tokens securely in an API request?",
    options: ["In the URL query", "In the Request Body", "In the Authorization Header", "In a Cookie"],
    correctAnswer: "In the Authorization Header",
    explanation: "Headers are the standard and most secure place for authentication tokens."
  },
  {
    id: "fq10",
    question: "Which method is 'Idempotent' (calling it many times has the same effect)?",
    options: ["POST", "GET", "PATCH", "None"],
    correctAnswer: "GET",
    explanation: "GET requests should only retrieve data and not change state, making them idempotent."
  }
];
