const mongoose = require('mongoose');
const Room = require('../models/Room');
require('dotenv').config();

const createSampleRoom = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if room already exists
    const existingRoom = await Room.findOne({ slug: 'intro-restful-apis-backend-basics' });
    if (existingRoom) {
      console.log('Room already exists, updating...');
      await Room.deleteOne({ slug: 'intro-restful-apis-backend-basics' });
    }

    const sampleRoom = new Room({
      title: 'Introduction to RESTful APIs and Backend Basics',
      slug: 'intro-restful-apis-backend-basics',
      short_description: 'Learn the fundamentals of RESTful APIs and backend development',
      long_description_markdown: `Introduction to RESTful APIs and Backend Basics

This comprehensive course will teach you everything you need to know about RESTful APIs and backend development.

What You'll Learn:
• Understanding REST architecture
• HTTP methods and status codes
• API design best practices
• Backend development fundamentals
• Database integration
• Authentication and security

Prerequisites:
• Basic programming knowledge
• Understanding of web technologies
• Familiarity with JavaScript (recommended)`,
      category: 'Development',
      difficulty: 'Beginner',
      estimated_time_minutes: 20,
      creator: 'CyberVerse Team',
      tags: ['REST', 'API', 'Backend', 'JavaScript', 'Node.js'],
      prerequisites: [
        'Basic programming knowledge',
        'Understanding of HTTP protocol',
        'Familiarity with JavaScript'
      ],
      learning_objectives: [
        'Understand REST architecture principles',
        'Learn HTTP methods and status codes',
        'Design and implement RESTful APIs',
        'Integrate with databases',
        'Implement authentication'
      ],
      topics: [
        {
          id: 1,
          title: 'What is REST?',
          content_markdown: `What is REST?

REST (Representational State Transfer) is an architectural style for designing networked applications. It relies on a stateless, client-server communication protocol.

Key Principles of REST:

1. Stateless: Each request contains all information needed to process it
2. Client-Server: Separation of concerns between client and server
3. Cacheable: Responses should be cacheable when appropriate
4. Uniform Interface: Consistent way to interact with resources
5. Layered System: Architecture can be composed of hierarchical layers

REST vs SOAP

REST is simpler and more lightweight compared to SOAP (Simple Object Access Protocol).

Example REST endpoints:
GET /api/users/123
POST /api/users
PUT /api/users/123
DELETE /api/users/123`,
          estimated_time_minutes: 3
        },
        {
          id: 2,
          title: 'HTTP Methods and Status Codes',
          content_markdown: `HTTP Methods and Status Codes

Common HTTP Methods:

• GET: Retrieve data from server
• POST: Create new resource
• PUT: Update existing resource (complete replacement)
• PATCH: Partial update of resource
• DELETE: Remove resource

HTTP Status Codes:

2xx Success
• 200 OK: Request successful
• 201 Created: Resource created successfully
• 204 No Content: Successful request with no response body

4xx Client Errors
• 400 Bad Request: Invalid request syntax
• 401 Unauthorized: Authentication required
• 404 Not Found: Resource not found

5xx Server Errors
• 500 Internal Server Error: Generic server error
• 503 Service Unavailable: Server temporarily unavailable

Example API responses:
GET /api/users/123
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com"
}

POST /api/users (201 Created)
{
  "id": 124,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "created_at": "2024-01-15T10:30:00Z"
}`,
          estimated_time_minutes: 4
        },
        {
          id: 3,
          title: 'API Design Best Practices',
          content_markdown: `API Design Best Practices

1. Use Nouns for Resources
• Good: /api/users, /api/products
• Bad: /api/getUsers, /api/createProduct

2. Use HTTP Methods Correctly
• GET for reading
• POST for creating
• PUT/PATCH for updating
• DELETE for removing

3. Use Proper Status Codes
Return appropriate HTTP status codes for different scenarios.

4. Version Your APIs
/api/v1/users
/api/v2/users

5. Use Consistent Naming
• Use lowercase letters
• Use hyphens for multi-word resources
• Be consistent across all endpoints

6. Implement Proper Error Handling
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}`,
          estimated_time_minutes: 5
        },
        {
          id: 4,
          title: 'Database Integration',
          content_markdown: `Database Integration

Connecting your API to a database is essential for persistent data storage.

Common Database Types:
• SQL Databases: MySQL, PostgreSQL, SQLite
• NoSQL Databases: MongoDB, Redis, DynamoDB

Database Operations:
• Create: INSERT new records
• Read: SELECT existing records
• Update: UPDATE existing records
• Delete: DELETE records

Best Practices:
• Use connection pooling
• Implement proper error handling
• Validate data before database operations
• Use transactions for complex operations`,
          estimated_time_minutes: 4
        },
        {
          id: 5,
          title: 'Authentication and Security',
          content_markdown: `Authentication and Security

Securing your API is crucial for protecting user data and preventing unauthorized access.

Authentication Methods:
• JWT (JSON Web Tokens)
• OAuth 2.0
• API Keys
• Session-based authentication

Security Best Practices:
• Use HTTPS for all communications
• Implement rate limiting
• Validate and sanitize all inputs
• Use proper password hashing
• Implement CORS properly`,
          estimated_time_minutes: 4
        }
      ],
      exercises: [
        {
          id: 1,
          title: 'REST Basics',
          description_markdown: 'What does REST stand for? (First word only)',
          hint: 'Think about the R in REST, mentioned in the first topic.',
          points: 50,
          expected_flag: 'Representational',
          answer: 'Representational',
          caseSensitive: false
        },
        {
          id: 2,
          title: 'HTTP Method',
          description_markdown: 'Which HTTP method is used to create new resources?',
          hint: 'Check the HTTP methods list (create new resource).',
          points: 30,
          expected_flag: 'POST',
          answer: 'POST',
          caseSensitive: false
        },
        {
          id: 3,
          title: 'Created Status Code',
          description_markdown: 'Which HTTP status code indicates that a resource was created successfully?',
          hint: 'In the 2xx success section, look for “Resource created successfully”.',
          points: 35,
          expected_flag: '201',
          answer: '201',
          caseSensitive: false
        },
        {
          id: 4,
          title: 'NoSQL Database',
          description_markdown: 'Name one NoSQL database mentioned in the Database Integration topic.',
          hint: 'Examples include document-based and key-value databases like MongoDB.',
          points: 40,
          expected_flag: 'MongoDB',
          answer: 'MongoDB',
          caseSensitive: false
        },
        {
          id: 5,
          title: 'Auth Method',
          description_markdown: 'Which token-based authentication method is mentioned in the Authentication and Security section?',
          hint: 'It is commonly abbreviated as three capital letters and used in modern APIs.',
          points: 45,
          expected_flag: 'JWT',
          answer: 'JWT',
          caseSensitive: false
        }
      ],
      quizzes: [
        {
          id: 1,
          title: 'REST Fundamentals Quiz',
          pass_percentage: 70,
          time_limit_seconds: 300,
          questions: [
            {
              id: 1,
              question_text: 'What is a key principle of REST architecture regarding server state?',
              type: 'single',
              options: ['Stateful', 'Stateless', 'Session-based', 'Cookie-dependent'],
              correct_answer: 'Stateless',
              points: 10,
              explanation: 'REST is stateless - each request must contain all information needed to process it.'
            },
            {
              id: 2,
              question_text: 'What is the most common data format used in REST API responses?',
              type: 'single',
              options: ['XML', 'JSON', 'CSV', 'HTML'],
              correct_answer: 'JSON',
              points: 10,
              explanation: 'JSON (JavaScript Object Notation) is the most widely used format for REST APIs.'
            },
            {
              id: 3,
              question_text: 'In API versioning, what is a common way to version your API endpoints?',
              type: 'single',
              options: ['/api/users/v1', '/api/v1/users', '/v1/api/users', '/users/api/v1'],
              correct_answer: '/api/v1/users',
              points: 15,
              explanation: 'The standard pattern is /api/version/resource, such as /api/v1/users.'
            }
          ]
        }
      ],
      isActive: true,
      completedBy: []
    });

    await sampleRoom.save();
    console.log('✅ Sample room created successfully!');
    console.log('Room slug:', sampleRoom.slug);

  } catch (error) {
    console.error('❌ Error creating sample room:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createSampleRoom();
