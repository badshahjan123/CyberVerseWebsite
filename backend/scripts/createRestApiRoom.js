const mongoose = require('mongoose');
const Room = require('../models/Room');
require('dotenv').config();

const restApiRoom = {
  "slug": "intro-restful-apis-backend-basics",
  "title": "Introduction to RESTful APIs (Backend Development Basics)",
  "short_description": "Learn the fundamentals of REST APIs and build your first Express.js endpoint from scratch",
  "long_description_markdown": "# Welcome to the World of APIs! 🚀\n\nAb dekh bhai, ye hi base hai har backend project ka! APIs are the backbone of modern web development, connecting frontend applications to databases and enabling communication between different services.\n\n## What You'll Learn\n\nIn this room, you'll discover how web applications communicate behind the scenes. We'll start with the basics of HTTP and REST architecture, then dive into building your first API using Node.js and Express. By the end, you'll understand how to create endpoints that can handle different types of requests and return JSON data.\n\n## Learning Path\n\n1. **Understanding APIs and HTTP** - Learn what APIs are and how HTTP requests work\n2. **REST Architecture Principles** - Master the four main HTTP methods (GET, POST, PUT, DELETE)\n3. **Building Your First API** - Create a simple Express.js server with CRUD operations\n\nThis hands-on approach will give you the confidence to start building backend services and understand how modern web applications work under the hood.",
  "difficulty": "Beginner",
  "category": "Development",
  "tags": ["REST", "API", "HTTP", "Express.js", "Node.js", "Backend", "CRUD", "JSON"],
  "cover_image_url": "https://placeholder.com/600x400/1e293b/60a5fa?text=REST+API+Basics",
  "creator": "CyberVerse Team",
  "estimated_time_minutes": 40,
  "prerequisites": ["Basic understanding of JavaScript", "Familiarity with command line", "Text editor installed"],
  "learning_objectives": [
    "Understand what APIs are and how they enable communication between applications",
    "Master the four main HTTP methods (GET, POST, PUT, DELETE) and when to use each",
    "Build a simple Express.js server with basic CRUD operations",
    "Test API endpoints using tools like Postman or curl",
    "Handle JSON data in API requests and responses"
  ],
  "topics": [
    {
      "id": 1,
      "title": "What is an API and How Does HTTP Work?",
      "order": 1,
      "estimated_time_minutes": 12,
      "content_markdown": "# Understanding APIs and HTTP\n\n## What is an API?\n\nAn **API (Application Programming Interface)** is like a waiter in a restaurant. You (the client) tell the waiter (API) what you want from the menu (available endpoints), and the waiter brings your order from the kitchen (server/database).\n\n### Real-World Example\nWhen you check the weather on your phone:\n1. Your app sends a request to a weather API\n2. The API fetches data from weather databases\n3. The API returns the weather data to your app\n4. Your app displays the weather information\n\n## HTTP Basics\n\n**HTTP (HyperText Transfer Protocol)** is the language that web browsers and servers use to communicate.\n\n### HTTP Request Structure\n```\nGET /api/users HTTP/1.1\nHost: example.com\nContent-Type: application/json\n```\n\n### HTTP Response Structure\n```\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  \"users\": [\n    {\"id\": 1, \"name\": \"Ahmed\"}\n  ]\n}\n```\n\n## Common HTTP Status Codes\n\n- **200 OK** - Request successful\n- **201 Created** - Resource created successfully\n- **400 Bad Request** - Invalid request\n- **404 Not Found** - Resource not found\n- **500 Internal Server Error** - Server error\n\n## Key Takeaways\n\n- APIs enable different applications to communicate\n- HTTP is the protocol used for web communication\n- Every HTTP request has a method, URL, headers, and optional body\n- HTTP responses include status codes and data"
    },
    {
      "id": 2,
      "title": "HTTP Status Codes Deep Dive",
      "order": 2,
      "estimated_time_minutes": 8,
      "content_markdown": "# HTTP Status Codes\\n\\nHTTP status codes tell you whether a request was successful or not.\\n\\n## Success Codes (2xx)\\n- **200 OK**: The request succeeded\\n- **201 Created**: A new resource was created\\n- **204 No Content**: Success, but no data to return\\n\\n## Client Error (4xx)\\n- **400 Bad Request**: Invalid syntax\\n- **401 Unauthorized**: Authentication required\\n- **404 Not Found**: Resource doesn't exist\\n\\n## Server Error (5xx)\\n- **500 Internal Server Error**: Generic server error\\n- **503 Service Unavailable**: Server is down\\n\\nUnderstanding status codes helps you debug API issues quickly!"
    },
    {
      "id": 3,
      "title": "HTTP Methods (GET, POST, PUT, DELETE)",
      "order": 3,
      "estimated_time_minutes": 10,
      "content_markdown": "# HTTP Methods\\n\\nHTTP methods (also called verbs) define the action you want to perform.\\n\\n## GET - Retrieve Data\\nUsed to fetch data from a server. **Read-only** - doesn't modify anything.\\n```\\nGET /api/users/123\\n```\\n\\n## POST - Create New Data\\nUsed to create new resources.\\n```\\nPOST /api/users\\n{name: 'John', email: 'john@example.com'}\\n```\\n\\n## PUT - Update Existing Data\\nReplaces an entire resource.\\n```\\nPUT /api/users/123\\n{name: 'John Updated'}\\n```\\n\\n## DELETE - Remove Data\\nDeletes a resource.\\n```\\nDELETE /api/users/123\\n```"
    },
    {
      "id": 4,
      "title": "JSON - The Language of APIs",
      "order": 4,
      "estimated_time_minutes": 6,
      "content_markdown": "# JSON (JavaScript Object Notation)\\n\\nJSON is the most popular format for sending and receiving data in REST APIs.\\n\\n## Why JSON?\\n- Easy to read and write\\n- Lightweight\\n- Supported by all programming languages\\n- Perfect for web APIs\\n\\n## JSON Structure\\n```json\\n{\\n  \\\"name\\\": \\\"John Doe\\\",\\n  \\\"age\\\": 30,\\n  \\\"skills\\\": [\\\"JavaScript\\\", \\\"Python\\\"],\\n  \\\"active\\\": true\\n}\\n```\\n\\n## Common Data Types\\n- Strings: `\\\"hello\\\"`\\n- Numbers: `42`, `3.14`\\n- Booleans: `true`, `false`\\n- Arrays: `[1, 2, 3]`\\n- Objects: `{key: 'value'}`\\n- null: `null`"
    },
    {
      "id": 5,
      "title": "API Authentication & Security",
      "order": 5,
      "estimated_time_minutes": 8,
      "content_markdown": "# API Authentication\\n\\nAPIs need to know **who** is making requests to protect sensitive data.\\n\\n## Common Authentication Methods\\n\\n### 1. API Keys\\nSimple tokens passed in headers or URL\\n```\\nGET /api/data?api_key=abc123\\n```\\n\\n### 2. JWT (JSON Web Tokens)\\nSecure tokens that contain user information\\n```\\nAuthorization: Bearer eyJhbGc...\\n```\\n\\n### 3. OAuth 2.0\\nUsed by Google, Facebook, etc. for third-party access\\n\\n## 401 Unauthorized\\nWhen authentication is missing or invalid, the server returns a **401** status code.\\n\\n## Security Best Practices\\n- Always use HTTPS\\n- Never expose API keys in client-side code\\n- Implement rate limiting\\n- Validate all inputs"
    }
  ],
  "quizzes": [
    {
      "id": 1,
      "title": "REST API Fundamentals Quiz",
      "order": 1,
      "time_limit_seconds": 300,
      "pass_percentage": 70,
      "questions": [
        {
          "id": 1,
          "type": "single",
          "question_text": "Which HTTP method should you use to retrieve data from an API?",
          "options": ["GET", "POST", "PUT", "DELETE"],
          "correct_answer": "GET",
          "points": 10,
          "explanation": "GET is used to retrieve data from a server. It's a safe method that doesn't modify any data."
        },
        {
          "id": 2,
          "type": "single",
          "question_text": "What does API stand for?",
          "options": ["Application Programming Interface", "Advanced Program Integration", "Automated Process Interface", "Application Process Integration"],
          "correct_answer": "Application Programming Interface",
          "points": 10,
          "explanation": "API stands for Application Programming Interface, which allows different applications to communicate."
        },
        {
          "id": 3,
          "type": "single",
          "question_text": "Which HTTP status code indicates 'Internal Server Error'?",
          "options": ["400", "404", "500", "503"],
          "correct_answer": "500",
          "points": 10,
          "explanation": "500 Internal Server Error indicates a generic server-side error."
        },
        {
          "id": 4,
          "type": "single",
          "question_text": "In REST API design, what does CRUD stand for?",
          "options": ["Create Read Update Delete", "Connect Retrieve Upload Destroy", "Control Read Update Deploy", "Create Restore Update Deploy"],
          "correct_answer": "Create Read Update Delete",
          "points": 10,
          "explanation": "CRUD represents the four basic operations for persistent storage: Create, Read, Update, Delete."
        },
        {
          "id": 5,
          "type": "single",
          "question_text": "Which REST principle states that each request should contain all necessary information?",
          "options": ["Cacheable", "Stateless", "Layered System", "Uniform Interface"],
          "correct_answer": "Stateless",
          "points": 10,
          "explanation": "Stateless means each request must contain all information needed to process it, without relying on server-side session state."
        }
      ]
    }
  ],
  "exercises": [
    {
      "id": 1,
      "title": "HTTP Methods Matching Challenge",
      "order": 1,
      "type": "static",
      "description_markdown": "## Match the HTTP Methods\n\nFor each scenario below, identify the correct HTTP method that should be used:\n\n### Scenarios:\n1. **Adding a new product to an e-commerce catalog**\n2. **Viewing a user's profile information**\n3. **Updating a customer's shipping address**\n4. **Removing a blog post from a website**\n5. **Fetching a list of all available courses**\n\n### Your Task:\nType the correct HTTP method (GET, POST, PUT, DELETE) for each scenario in order, separated by commas.\n\n**Example format:** POST, GET, PUT, DELETE, GET",
      "hint": "Remember: POST creates, GET retrieves, PUT updates, DELETE removes",
      "expected_flag": "POST,GET,PUT,DELETE,GET",
      "auto_validate": true,
      "points": 25,
      "admin_note": "STORE HASHED (sha256 + salt) IN PRODUCTION. Validate submissions server-side and rate-limit attempts."
    },
    {
      "id": 2,
      "title": "HTTP Status Code",
      "order": 2,
      "type": "static",
      "description_markdown": "What HTTP status code indicates a successful request?",
      "hint": "It's the most common success code, in the 2xx range",
      "expected_flag": "200",
      "auto_validate": true,
      "points": 20
    },
    {
      "id": 3,
      "title": "API Request Method",
      "order": 3,
      "type": "static",
      "description_markdown": "Which HTTP method should you use to retrieve data from an API?",
      "hint": "This method is read-only and doesn't modify anything",
      "expected_flag": "GET",
      "auto_validate": true,
      "points": 15,
      "caseSensitive": false
    },
    {
      "id": 4,
      "title": "API Response Format",
      "order": 4,
      "type": "static",
      "description_markdown": "What is the most common data format returned by modern REST APIs?",
      "hint": "It's a JavaScript-based format, commonly used for data exchange",
      "expected_flag": "JSON",
      "auto_validate": true,
      "points": 20,
      "caseSensitive": false
    },
    {
      "id": 5,
      "title": "Authentication Status Code",
      "order": 5,
      "type": "static",
      "description_markdown": "What HTTP status code indicates that authentication is required?",
      "hint": "It's a 4xx error code that means you're not authorized",
      "expected_flag": "401",
      "auto_validate": true,
      "points": 25
    }
  ],
  "additional_notes": "This room is designed to be beginner-friendly and provides a solid foundation for backend development."
};

async function createRoom() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Use findOneAndUpdate with upsert to ensure reliable updates
    const room = await Room.findOneAndUpdate(
      { slug: restApiRoom.slug },
      restApiRoom,
      { upsert: true, new: true, overwrite: true }
    );

    console.log('✅ REST API Room created/updated successfully!');
    console.log('Slug:', room.slug);
    console.log('Title:', room.title);

  } catch (error) {
    console.error('❌ Error creating room:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createRoom();