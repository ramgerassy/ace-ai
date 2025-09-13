# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
AI-powered quiz generation REST API built with Node.js, Express, TypeScript, and LangChain. Uses OpenAI's GPT models to generate educational quizzes and provide personalized feedback.

## Development Commands

### Core Development
```bash
# Install dependencies
npm install

# Development server (hot-reload)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Production server
npm start

# Format code with Prettier
npm run format
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Required environment variables:
# - OPENAI_API_KEY: OpenAI API key for LLM access
# - PORT: Server port (default: 3000)
# - CORS_ORIGIN: Frontend origin (default: http://localhost:3001)
# - NODE_ENV: Environment mode (development/production)
```

## Architecture & Structure

### High-Level Architecture
```
┌─────────────────┐    ┌──────────────┐    ┌─────────────┐
│   HTTP Client   │────│  Express.js  │────│  LangChain  │
│   (Frontend)    │    │   Routes     │    │   Agents    │
└─────────────────┘    └──────────────┘    └─────────────┘
                              │                     │
                       ┌──────────────┐    ┌─────────────┐
                       │ Controllers  │    │   OpenAI    │
                       │   & Logic    │    │    APIs     │
                       └──────────────┘    └─────────────┘
```

### Directory Structure
```
src/
├── index.ts                 # Application entry point & Express setup
├── routes/                  # HTTP endpoint definitions
│   └── quiz.routes.ts       # Quiz API routes with middleware
├── controller/              # Request/response handling & business logic
│   └── quiz.controller.ts   # Quiz operations controller
├── agent/                   # AI agent system (LangChain integration)
│   ├── coordinator.ts       # High-level AI operations & prompts
│   └── llm.ts              # LLM configuration & model selection
├── middleware/              # Express middleware
│   ├── validation.ts        # Request validation middleware
│   ├── rateLimit.ts        # Rate limiting configurations
│   └── noteFound.ts        # 404 error handling
├── utils/                   # Shared utilities
│   └── validation.ts        # Zod schemas & type definitions
└── types/                   # TypeScript type definitions
```

## API Endpoints

### Core Endpoints
- `POST /api/verify-subject` - Validate subject for quiz generation
- `POST /api/verify-sub-subject` - Verify sub-topic relation to main subject
- `POST /api/generate-quiz` - Generate 10 AI-powered quiz questions
- `POST /api/review-quiz` - Review answers & provide personalized feedback

### Health Checks
- `GET /health` - Server health status
- `GET /api/health` - API service health with endpoints info

## AI Architecture

### Multi-Model LLM Strategy
```typescript
// Three LLM configurations for different use cases:
deterministicLLM    // Temperature 0 - validation, scoring
creativeLLM         // Temperature 0.6 - question generation, feedback  
fastLLM            // GPT-3.5 - simple operations
```

### Agent Responsibilities
- **Subject Validation**: Verify educational appropriateness
- **Quiz Generation**: Create diverse, engaging questions
- **Answer Review**: Provide personalized learning feedback
- **Content Safety**: Filter inappropriate subjects

## Technology Stack

### Core Technologies
- **Node.js + TypeScript**: Runtime & type safety
- **Express.js 5.x**: Web framework with modern features
- **LangChain**: AI orchestration & prompt management
- **OpenAI API**: GPT-4 & GPT-3.5 models
- **Zod**: Runtime type validation & parsing

### Security & Middleware
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **express-rate-limit**: Multi-tier rate limiting
- **express-validator**: Input validation & sanitization
- **Morgan**: HTTP request logging

### Development Tools
- **nodemon**: Development hot-reload
- **ts-node**: TypeScript execution
- **Prettier**: Code formatting

## Development Guidelines

### Code Patterns
1. **Layered Architecture**: Routes → Controllers → Agents → LLMs
2. **Type Safety**: Zod schemas for runtime validation + TypeScript types
3. **Error Handling**: Structured error responses with codes
4. **Rate Limiting**: Endpoint-specific limits based on AI cost
5. **Environment Config**: `.env` based configuration management

### AI Best Practices
- Use deterministic LLMs for consistent operations
- Use creative LLMs for content generation
- Implement fallback responses for AI failures
- Structure prompts for reliable JSON output
- Validate AI responses before returning to clients

### Security Considerations
- Input sanitization via Zod schemas
- Rate limiting per endpoint type
- CORS configuration for frontend integration
- Structured error responses (no sensitive info leakage)

## Configuration

### Environment Variables
```bash
# Server
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001

# OpenAI
OPENAI_API_KEY=your_api_key
OPENAI_MODEL_DETERMINISTIC=gpt-4-turbo-preview
OPENAI_MODEL_CREATIVE=gpt-4-turbo-preview

# Rate Limiting (optional overrides)
SUBJECT_VERIFY_MAX_REQUESTS=30
QUIZ_GEN_MAX_REQUESTS=10
QUIZ_REVIEW_MAX_REQUESTS=20
GLOBAL_MAX_REQUESTS=100
```

### TypeScript Configuration
- **Target**: ES2020 with CommonJS modules
- **Strict Mode**: All strict checks enabled
- **Path Mapping**: `@/*` maps to `src/*`
- **Output**: Compiled to `./dist/` directory
- **Source Maps**: Enabled for debugging

## Testing Strategy

### Current Status
- **No Testing Framework**: Testing setup needed
- **Manual Testing**: Use `/health` endpoints for basic checks
- **API Testing**: Consider Postman/Insomnia for endpoint testing

### Recommended Testing Approach
```bash
# Suggested additions:
npm install --save-dev jest @types/jest supertest

# Test structure:
src/__tests__/
├── routes/        # API endpoint tests
├── controller/    # Business logic tests  
├── agent/         # AI integration tests
└── utils/         # Validation & utility tests
```

## Deployment Considerations

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper OpenAI API keys
- [ ] Set up reverse proxy (nginx/Apache)
- [ ] Configure CORS origins for production frontend
- [ ] Set up proper logging & monitoring
- [ ] Consider Redis for rate limiting in multi-instance deployments

### Performance Notes
- Quiz generation is AI-intensive (45s timeout)
- Rate limiting prevents API abuse
- No database - stateless service
- Consider caching for repeated subject validations

## Common Development Tasks

### Adding New Endpoints
1. Define route in `/routes/quiz.routes.ts`
2. Add controller function in `/controller/quiz.controller.ts`
3. Create validation schema in `/utils/validation.ts`
4. Add agent function if AI is needed in `/agent/coordinator.ts`

### Modifying AI Behavior
1. Update prompts in `/agent/coordinator.ts`
2. Adjust LLM parameters in `/agent/llm.ts`
3. Test with different model configurations
4. Update validation schemas if response format changes

### Debugging Issues
1. Check server logs via `npm run dev`
2. Verify API responses at `/health` endpoints
3. Test individual endpoints with proper request format
4. Monitor OpenAI API usage and quotas