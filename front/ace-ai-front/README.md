# QuizMaster Frontend

A modern, AI-powered quiz application built with React, TypeScript, and Vite. This frontend delivers an intelligent, mobile-first learning experience with real-time feedback and performance analytics.

## Features

- ✨ AI-powered quiz generation with content validation
- 📱 Mobile-first responsive design
- 🎯 Multiple choice and single choice questions
- 📊 Real-time performance analytics and feedback
- 🔒 User management with localStorage persistence
- ⚡ Fast development with Vite and HMR
- 🎨 Modern UI with Tailwind CSS
- 🧪 Comprehensive testing with Vitest and Playwright

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher) or **yarn** (v1.22 or higher)
- **Backend Server** (for API endpoints - see API Integration section)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ace-ai-front
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

The application uses environment variables for configuration. Key settings:

- **Development mode**: Automatically detected via `import.meta.env.DEV`
- **API Base URL**: Configured in `vite.config.ts` proxy settings
- **CORS handling**: Vite proxy forwards `/api/*` requests to `http://localhost:3000`

### 4. Start Development Server

```bash
npm run dev
```

This will start the Vite development server at `http://localhost:5173` with:
- Hot Module Replacement (HMR)
- TypeScript compilation
- Tailwind CSS processing

### 5. Backend Server Setup

The frontend expects a backend server running on `http://localhost:3000` with the following endpoints:

- `POST /api/verify-subject` - Subject validation
- `POST /api/verify-sub-subject` - Sub-subject validation  
- `POST /api/generate-quiz` - Quiz generation
- `POST /api/review-quiz` - Quiz review and feedback

See `src/api/apiClient.ts` and `API_CONTRACT.md` for detailed API specifications.

## Development Commands

### Core Development
```bash
npm run dev          # Start Vite development server with HMR
npm run build        # Build for production (TypeScript + Vite)
npm run preview      # Preview production build locally
```

### Code Quality & Validation
```bash
npm run lint         # Run ESLint with error reporting
npm run lint:fix     # Auto-fix ESLint issues
npm run lint:quiet   # Run ESLint in quiet mode
npm run format       # Format code with Prettier
npm run format:check # Check if code is properly formatted
npm run type-check   # Run TypeScript type checking
npm run validate     # Run all checks: type-check + lint + format:check
npm run fix          # Auto-fix linting and formatting issues
```

### Testing
```bash
npm run test         # Run unit tests with Vitest
npm run test:ui      # Run Vitest with UI interface
npm run test:coverage # Generate test coverage report
npm run test:watch   # Run tests in watch mode
```

### End-to-End Testing (Playwright)
```bash
npm run test:e2e              # Run all E2E tests
npm run test:e2e:ui           # Run E2E tests with Playwright UI
npm run test:e2e:headed       # Run E2E tests with visible browser
npm run test:e2e:debug        # Debug E2E tests
npm run test:e2e:chromium     # Run E2E tests on Chromium only
npm run test:e2e:firefox      # Run E2E tests on Firefox only
npm run test:e2e:webkit       # Run E2E tests on WebKit only
npm run test:e2e:mobile       # Run E2E tests on mobile viewports
npm run test:e2e:report       # Show Playwright test report
npm run test:e2e:install      # Install Playwright browsers
npm run test:e2e:install-deps # Install Playwright system dependencies
```

## Project Structure

```
src/
├── api/                    # API client and types
│   ├── apiClient.ts       # HTTP client for backend communication
│   └── types.ts           # TypeScript interfaces for API contracts
├── components/            # Feature-based React components
│   ├── GenerateQuiz/     # Quiz generation forms and validation
│   ├── Global/           # Reusable UI components (buttons, cards, etc.)
│   ├── QuizResults/      # Results display and performance analytics
│   ├── TakeQuiz/         # Interactive quiz-taking interface
│   └── WelcomeScreen/    # User onboarding and welcome
├── context/              # React Context providers
│   ├── AppContext.tsx    # Combined provider wrapper
│   ├── QuizContext.tsx   # Quiz state management
│   └── UserContext.tsx   # User authentication and management
├── utils/                # Utility functions
│   ├── inputSanitization.ts # Input validation and sanitization
│   ├── localStorage.ts   # LocalStorage utilities with error handling
│   └── userStorage.ts    # User data persistence
├── types/                # TypeScript type definitions
│   └── user.types.ts     # User-related type definitions
└── assets/               # Static assets (images, icons, etc.)
```

## API Integration

The frontend communicates with a backend server through a REST API. Key integration points:

### CORS Configuration
CORS is handled via Vite's proxy configuration in `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

### Error Handling
The API client includes comprehensive error handling for:
- Network connectivity issues
- CORS problems
- Timeout scenarios
- Server validation errors
- Rate limiting

### Data Flow
1. **Quiz Generation**: Subject validation → Sub-subject validation → Quiz generation
2. **Quiz Taking**: Question display → Answer collection → Progress tracking
3. **Results**: Answer submission → AI review → Performance analytics

## Browser Support

- ✅ Chrome (latest 2 versions)
- ✅ Firefox (latest 2 versions)  
- ✅ Safari (latest 2 versions)
- ✅ Edge (latest 2 versions)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Targets

- **Initial bundle**: < 200KB gzipped
- **Route chunks**: < 50KB gzipped each
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Lighthouse Score**: > 90 for Performance, Accessibility, Best Practices

## Troubleshooting

### Common Issues

**1. CORS Errors**
```
Access to fetch at 'http://localhost:3000/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Solution**: Ensure the backend server is running on port 3000 and supports CORS, or check the Vite proxy configuration.

**2. Hot Reload Issues**
```
[vite] hmr invalidate /src/... Could not Fast Refresh
```
**Solution**: Hard refresh the browser (Ctrl+Shift+R) or restart the dev server.

**3. TypeScript Errors**
```
Module '"..."' has no exported member '...'
```
**Solution**: Run `npm run type-check` to identify type issues, and ensure all imports are correct.

**4. Build Failures**
```
Build failed due to TypeScript errors
```
**Solution**: Fix TypeScript errors before building. Run `npm run lint` and `npm run type-check` to identify issues.

### Development Tips

- Use `npm run validate` before committing to catch all linting and type issues
- Enable Prettier extension in your editor for automatic formatting
- Use React Developer Tools for debugging component state
- Check the browser's Network tab for API request/response debugging

## Contributing

1. Follow the existing code style and conventions
2. Run `npm run validate` before submitting changes
3. Ensure all tests pass with `npm run test` and `npm run test:e2e`
4. Maintain test coverage above 80%
5. Update documentation for significant changes

## Tech Stack

- **React 19** - UI framework with latest features
- **TypeScript** - Type safety and developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS 4** - Utility-first CSS framework
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **ESLint + Prettier** - Code quality and formatting