# QuizMaster API Contract Documentation

## Base URL
```
http://localhost:3000/api
```

## Common Headers
```http
Content-Type: application/json
Accept: application/json
```

## Rate Limiting

All endpoints are rate-limited to prevent abuse:

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| `/api/verify-subject` | 30 requests | 15 minutes |
| `/api/verify-sub-subject` | 30 requests | 15 minutes |
| `/api/generate-quiz` | 10 requests | 15 minutes |
| `/api/review-quiz` | 20 requests | 15 minutes |
| Global (all endpoints) | 100 requests | 15 minutes |

## Error Response Format

All error responses follow this standard structure:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any; // Additional error context
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `API_ENDPOINT_NOT_FOUND` | 404 | Endpoint does not exist |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error occurred |
| `AI_PROCESSING_ERROR` | 500 | AI agent failed to process request |

---

## API Endpoints

### 1. Verify Subject

Validates if a subject is appropriate for quiz generation. If invalid, returns 5 alternative suggestions.

#### Endpoint
```http
POST /api/verify-subject
```

#### Request Body
```typescript
interface VerifySubjectRequest {
  subject: string; // 2-100 characters, alphanumeric + basic punctuation
}
```

#### Example Request
```json
{
  "subject": "World History"
}
```

#### Success Responses

**Valid Subject (200 OK)**
```typescript
interface ValidSubjectResponse {
  success: true;
  valid: true;
  subject: string;      // Normalized subject name
  message: string;      // Confirmation message
}
```

**Invalid Subject (200 OK)**
```typescript
interface InvalidSubjectResponse {
  success: true;
  valid: false;
  suggestions: string[]; // Exactly 5 alternative subjects
  message: string;       // Explanation why invalid
}
```

#### Example Responses

**Valid Subject:**
```json
{
  "success": true,
  "valid": true,
  "subject": "World History",
  "message": "Subject 'World History' is valid for quiz generation"
}
```

**Invalid Subject:**
```json
{
  "success": true,
  "valid": false,
  "suggestions": [
    "Ancient World History",
    "Modern World History",
    "European History",
    "American History",
    "Asian History"
  ],
  "message": "Subject 'History' is too broad. Please choose a more specific topic."
}
```

#### Validation Errors (400)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "subject": ["Subject must be at least 2 characters"]
    }
  }
}
```

---

### 2. Verify Sub-Subject

Validates if a sub-subject is related to the main subject. If invalid, returns up to 5 related suggestions.

#### Endpoint
```http
POST /api/verify-sub-subject
```

#### Request Body
```typescript
interface VerifySubSubjectRequest {
  subject: string;    // 2-100 characters
  subSubject: string; // 2-150 characters
}
```

#### Example Request
```json
{
  "subject": "Mathematics",
  "subSubject": "Calculus"
}
```

#### Success Responses

**Valid Sub-Subject (200 OK)**
```typescript
interface ValidSubSubjectResponse {
  success: true;
  valid: true;
  subject: string;     // Normalized subject
  subSubject: string;  // Normalized sub-subject
  message: string;     // Confirmation message
}
```

**Invalid Sub-Subject (200 OK)**
```typescript
interface InvalidSubSubjectResponse {
  success: true;
  valid: false;
  suggestions: string[]; // Up to 5 related sub-subjects
  message: string;       // Explanation why invalid
}
```

#### Example Responses

**Valid Sub-Subject:**
```json
{
  "success": true,
  "valid": true,
  "subject": "Mathematics",
  "subSubject": "Calculus",
  "message": "Sub-subject 'Calculus' is valid for Mathematics"
}
```

**Invalid Sub-Subject:**
```json
{
  "success": true,
  "valid": false,
  "suggestions": [
    "Algebra",
    "Geometry",
    "Trigonometry",
    "Statistics",
    "Calculus"
  ],
  "message": "Sub-subject 'Cooking' is not related to Mathematics"
}
```

---

### 3. Generate Quiz

Generates 10 multiple-choice questions based on subject, sub-subjects, and difficulty level.

#### Endpoint
```http
POST /api/generate-quiz
```

#### Request Body
```typescript
interface GenerateQuizRequest {
  subject: string;           // 2-100 characters
  subSubjects: string[];     // 0-10 sub-subjects, each 2-150 chars
  level: 'easy' | 'intermediate' | 'hard';
}
```

#### Example Request
```json
{
  "subject": "Computer Science",
  "subSubjects": ["Data Structures", "Algorithms"],
  "level": "intermediate"
}
```

#### Success Response (200 OK)
```typescript
interface GenerateQuizResponse {
  success: true;
  questions: Question[]; // Array of exactly 10 questions
  metadata: {
    subject: string;
    subSubjects: string[];
    level: 'easy' | 'intermediate' | 'hard';
    generatedAt: string; // ISO 8601 datetime
  }
}

interface Question {
  questionNum: number;        // 1-10
  question: string;          // 10-500 characters
  possibleAnswers: string[]; // Exactly 4 options
  correctAnswer: number[];   // Indices of correct answers (0-3)
}
```

#### Example Response
```json
{
  "success": true,
  "questions": [
    {
      "questionNum": 1,
      "question": "What is the time complexity of binary search?",
      "possibleAnswers": [
        "O(n)",
        "O(log n)",
        "O(n²)",
        "O(1)"
      ],
      "correctAnswer": [1]
    },
    {
      "questionNum": 2,
      "question": "Which data structures use LIFO principle? (Select all that apply)",
      "possibleAnswers": [
        "Stack",
        "Queue",
        "Array",
        "Recursion Call Stack"
      ],
      "correctAnswer": [0, 3]
    }
    // ... 8 more questions
  ],
  "metadata": {
    "subject": "Computer Science",
    "subSubjects": ["Data Structures", "Algorithms"],
    "level": "intermediate",
    "generatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Validation Errors (400)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "level": ["Difficulty must be either \"easy\", \"intermediate\", or \"hard\""],
      "subSubjects": ["Maximum 10 sub-subjects allowed"]
    }
  }
}
```

#### AI Processing Error (500)
```json
{
  "success": false,
  "error": {
    "code": "AI_PROCESSING_ERROR",
    "message": "Failed to generate quiz",
    "details": "Unable to generate appropriate questions for the given parameters"
  }
}
```

---

### 4. Review Quiz

Reviews user's quiz answers and provides detailed feedback with personalized learning insights.

#### Endpoint
```http
POST /api/review-quiz
```

#### Request Body
```typescript
interface QuizReviewRequest {
  userAnswers: UserAnswer[]; // Exactly 10 answers
}

interface UserAnswer {
  questionNum: number;        // 1-10
  question: string;          // The original question
  possibleAnswers: string[]; // The 4 options
  correctAnswer: number[];   // Correct answer indices
  userAnswer: number[];      // User's selected indices (can be empty)
}
```

#### Example Request
```json
{
  "userAnswers": [
    {
      "questionNum": 1,
      "question": "What is the time complexity of binary search?",
      "possibleAnswers": ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      "correctAnswer": [1],
      "userAnswer": [1]
    },
    {
      "questionNum": 2,
      "question": "Which data structures use LIFO principle?",
      "possibleAnswers": ["Stack", "Queue", "Array", "Recursion Call Stack"],
      "correctAnswer": [0, 3],
      "userAnswer": [0]
    }
    // ... 8 more answers
  ]
}
```

#### Success Response (200 OK)
```typescript
interface ReviewQuizResponse {
  success: true;
  score: number;              // 0-100 percentage
  correctAnswers: number;     // 0-10
  totalQuestions: 10;         // Always 10
  reflection: string;         // 100-1000 chars personalized feedback
  questionReviews: {
    questionNum: number;
    isCorrect: boolean;
    explanation?: string;     // Why answer was wrong/partial
  }[]
}
```

#### Example Response
```json
{
  "success": true,
  "score": 75,
  "correctAnswers": 7.5,
  "totalQuestions": 10,
  "reflection": "Great job on your Computer Science quiz! You demonstrated strong understanding of time complexity and basic data structures. Your performance shows particular strength in algorithm analysis. To improve further, I recommend reviewing stack operations and recursion concepts, as you missed some multi-select questions about LIFO structures. Focus on understanding when multiple data structures share similar properties. Keep practicing with more complex scenarios to solidify your knowledge.",
  "questionReviews": [
    {
      "questionNum": 1,
      "isCorrect": true
    },
    {
      "questionNum": 2,
      "isCorrect": false,
      "explanation": "Partial credit: You correctly identified Stack but missed Recursion Call Stack which also uses LIFO"
    }
    // ... 8 more reviews
  ]
}
```

#### Validation Errors (400)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "userAnswers": ["Must submit exactly 10 answers"]
    }
  }
}
```

---

## Health Check Endpoints

### System Health
```http
GET /health
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development",
  "uptime": 3600.5,
  "memory": {
    "rss": 56123392,
    "heapTotal": 35123200,
    "heapUsed": 28456789,
    "external": 1234567,
    "arrayBuffers": 123456
  }
}
```

### API Health
```http
GET /api/health
```

**Response (200 OK):**
```json
{
  "service": "quiz-api",
  "status": "healthy",
  "version": "1.0.0",
  "endpoints": [
    {
      "method": "POST",
      "path": "/api/verify-subject",
      "description": "Verify subject validity"
    },
    {
      "method": "POST",
      "path": "/api/verify-sub-subject",
      "description": "Verify sub-subject relation to subject"
    },
    {
      "method": "POST",
      "path": "/api/generate-quiz",
      "description": "Generate 10 multiple choice questions"
    },
    {
      "method": "POST",
      "path": "/api/review-quiz",
      "description": "Review quiz answers and provide feedback"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## HTTP Status Codes

| Status | Description | Usage |
|--------|-------------|-------|
| 200 | OK | Successful request |
| 400 | Bad Request | Validation errors, malformed request |
| 404 | Not Found | Endpoint doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server or AI processing error |

---

## Request Validation Rules

### String Fields
- **Subject**: 2-100 characters, alphanumeric + spaces + basic punctuation (- & , . ( ))
- **Sub-Subject**: 2-150 characters, same as subject + forward slash and colon
- **Difficulty Level**: Must be exactly "easy", "intermediate", or "hard"

### Array Fields
- **subSubjects**: 0-10 items, each following sub-subject validation rules
- **possibleAnswers**: Exactly 4 string items
- **correctAnswer**: 1-4 integers, each between 0-3
- **userAnswer**: 0-4 integers, each between 0-3
- **userAnswers**: Exactly 10 UserAnswer objects

### Numeric Fields
- **questionNum**: Integer 1-10
- **score**: Number 0-100
- **correctAnswers**: Number 0-10

---

## CORS Configuration

The API is configured to accept requests from:
- Default: `http://localhost:3001`
- Configurable via `CORS_ORIGIN` environment variable

---

## Timeout Settings

- Standard endpoints: 30 seconds
- Quiz generation: 45 seconds (AI-intensive operation)

---

## Example Error Scenarios

### 1. Invalid Request Body
```json
{
  "subject": "a"  // Too short
}
```
**Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "subject": ["Subject must be at least 2 characters"]
    }
  }
}
```

### 2. Rate Limit Exceeded
**Response (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later",
    "details": {
      "retryAfter": 900
    }
  }
}
```

### 3. Unknown Endpoint
**Request:** `POST /api/unknown`

**Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "API_ENDPOINT_NOT_FOUND",
    "message": "API endpoint /api/unknown not found",
    "details": {
      "method": "POST",
      "path": "/api/unknown",
      "baseUrl": "/api",
      "hint": "Check the API documentation for available endpoints"
    }
  }
}
```

### 4. AI Processing Failure
**Response (500):**
```json
{
  "success": false,
  "error": {
    "code": "AI_PROCESSING_ERROR",
    "message": "Failed to process request with AI agent",
    "details": "The AI model returned an invalid response format"
  }
}
```