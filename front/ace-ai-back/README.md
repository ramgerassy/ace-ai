# QuizMaster Backend

AI-powered quiz generation REST API built with Node.js, Express, TypeScript, and LangChain. Uses OpenAI's GPT models to generate educational quizzes and provide personalized feedback.

## Features

- **Subject Validation**: Verify if subjects are suitable for quiz generation
- **Sub-Subject Validation**: Ensure sub-topics are related to main subjects
- **AI Quiz Generation**: Create 10 multiple-choice questions with varying difficulty
- **Answer Review**: Provide personalized feedback on quiz performance
- **Multi-tier Rate Limiting**: Protect against abuse with endpoint-specific limits
- **Robust Error Handling**: Comprehensive error responses with helpful suggestions
- **Type Safety**: Full TypeScript implementation with Zod validation

## Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **OpenAI API Key** (GPT-4 access recommended)

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd ace-ai-back

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

**Required Environment Variables:**

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3001

# Rate Limiting (Optional - defaults provided)
SUBJECT_VERIFY_MAX_REQUESTS=30
QUIZ_GEN_MAX_REQUESTS=10
QUIZ_REVIEW_MAX_REQUESTS=20
GLOBAL_MAX_REQUESTS=100
```

### 3. Development Commands

```bash
# Development server with hot-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Production server (after build)
npm start

# Format code with Prettier
npm run format
```

### 4. Verify Installation

Once the server starts, you should see:
```
🚀 Server is running on port 3000
🏥 Health check: http://localhost:3000/health
📚 API root: http://localhost:3000/api
🌍 Environment: development
```

Test the health endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development",
  "uptime": 3600.5,
  "memory": { ... }
}
```

## API Testing

### Using the Test Script

A comprehensive test script is provided:

```bash
# Make script executable
chmod +x test_api.sh

# Run all tests
./test_api.sh all

# Test specific endpoints
./test_api.sh health      # Health checks
./test_api.sh verify      # Subject verification
./test_api.sh generate    # Quiz generation
./test_api.sh review      # Answer review
./test_api.sh errors      # Error scenarios
```

### Manual API Testing

**Generate a Quiz:**
```bash
curl -X POST "http://localhost:3000/api/generate-quiz" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "World History",
    "subSubjects": ["World War II", "Ancient Rome"],
    "level": "intermediate"
  }'
```

**Verify Subject:**
```bash
curl -X POST "http://localhost:3000/api/verify-subject" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Computer Science"
  }'
```

## Project Structure

```
src/
├── index.ts                 # Express server setup
├── routes/
│   └── quiz.routes.ts       # API route definitions
├── controller/
│   └── quiz.controller.ts   # Request/response handling
├── agent/
│   ├── coordinator.ts       # AI orchestration & prompts
│   └── llm.ts              # LLM configurations
├── middleware/
│   ├── validation.ts        # Request validation
│   ├── rateLimit.ts        # Rate limiting configs
│   └── noteFound.ts        # 404 handling
├── types/
│   ├── validation.types.ts  # Validation interfaces
│   ├── agent.types.ts      # AI agent types
│   ├── quiz.types.ts       # Quiz-related types
│   └── index.ts           # Type exports
└── utils/
    ├── validation.ts        # Zod schemas
    └── llm-json-parser.ts  # Robust JSON parsing
```

## Development Workflow

### Adding New Endpoints

1. **Define route** in `src/routes/quiz.routes.ts`
2. **Add controller** in `src/controller/quiz.controller.ts`
3. **Create validation schema** in `src/utils/validation.ts`
4. **Add types** in appropriate `src/types/*.ts` file
5. **Update API documentation** in `API_CONTRACT.md`

### AI Agent Development

1. **Update prompts** in `src/agent/coordinator.ts`
2. **Adjust LLM parameters** in `src/agent/llm.ts`
3. **Test with different models** via environment variables
4. **Update validation** if response format changes

### Testing Strategy

```bash
# Test endpoint functionality
./test_api.sh generate

# Test error handling
./test_api.sh errors

# Test rate limiting (be careful!)
./test_api.sh rate

# Performance testing
./test_api.sh performance
```

## Production Deployment

### Pre-deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure secure OpenAI API keys
- [ ] Set up reverse proxy (nginx/Apache)
- [ ] Configure production CORS origins
- [ ] Set up logging & monitoring
- [ ] Configure Redis for distributed rate limiting (if using multiple instances)
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up backup strategies

### Environment Variables for Production

```bash
NODE_ENV=production
PORT=3000
OPENAI_API_KEY=prod_openai_key_here
CORS_ORIGIN=https://your-frontend-domain.com
# Adjust rate limits for production traffic
GLOBAL_MAX_REQUESTS=1000
```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["npm", "start"]
```

## Monitoring and Maintenance

### Health Checks

- **System**: `GET /health`
- **API**: `GET /api/health`

### Logging

Development logs include:
- Request/response details
- AI processing status
- Error stack traces
- Performance metrics

### Performance Considerations

- Quiz generation: ~30-45 seconds (AI-intensive)
- Subject verification: ~5-10 seconds
- Rate limiting prevents overload
- No database - stateless service
- Consider caching for repeated validations

## Troubleshooting

### Common Issues

**Server won't start:**
```bash
# Check if port is in use
lsof -i :3000

# Kill process if needed
fuser -k 3000/tcp
```

**API key errors:**
- Verify OpenAI API key is valid
- Check API key has sufficient credits
- Ensure key has GPT-4 access if using advanced models

**Rate limiting issues:**
- Check current limits in environment variables
- Wait for rate limit window to reset (15 minutes)
- Consider upgrading OpenAI plan for higher limits

**Quiz generation failures:**
- Try simpler subjects (avoid complex math)
- Reduce number of sub-subjects
- Use different difficulty levels
- Check OpenAI API status

### Debug Mode

Enable verbose logging:
```bash
NODE_ENV=development npm run dev
```

## Contributing

1. **Code Style**: Use Prettier for formatting (`npm run format`)
2. **Type Safety**: Maintain full TypeScript coverage
3. **Testing**: Add tests for new endpoints
4. **Documentation**: Update API_CONTRACT.md for changes
5. **Security**: Follow secure coding practices

## API Documentation

Detailed API documentation is available in `API_CONTRACT.md`, including:
- Complete endpoint specifications
- Request/response examples
- Error handling details
- Authentication requirements

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review API_CONTRACT.md for usage details
3. Check server logs for error details
4. Verify environment configuration