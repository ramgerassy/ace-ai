# QuizMaster Frontend - Project Description

## Overview

QuizMaster is a modern, AI-powered quiz application frontend built with React, TypeScript, and Vite. The application provides an intelligent learning experience with AI-powered content validation, real-time feedback, and comprehensive performance analytics.

## Architecture Overview

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend │    │   Vite Proxy     │    │  Backend API    │
│   (Port 5173)   │◄──►│   (CORS Handler) │◄──►│  (Port 3000)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│  LocalStorage   │
│  (User Data)    │
└─────────────────┘
```

### Component Architecture

The application follows a feature-based component architecture with clear separation of concerns:

```
src/components/
├── Global/           # Reusable UI components
├── GenerateQuiz/     # Quiz creation workflow
├── TakeQuiz/         # Quiz taking interface
├── QuizResults/      # Results and analytics
└── WelcomeScreen/    # User onboarding
```

## Key Architectural Decisions

### 1. State Management Strategy

**Decision**: React Context API + localStorage persistence

**Rationale**:
- **React Context**: Chosen over Redux for its simplicity and built-in React integration
- **localStorage**: Provides offline-first experience and persistence across sessions
- **Dual Context Pattern**: Separate contexts for User and Quiz state to avoid unnecessary re-renders

**Implementation**:
```typescript
// src/context/
├── AppContext.tsx     # Combined provider wrapper
├── UserContext.tsx    # Authentication and user management
└── QuizContext.tsx    # Quiz state and lifecycle management
```

**Benefits**:
- No additional dependencies
- Type-safe with TypeScript
- Automatic persistence
- Simplified debugging

### 2. API Integration Pattern

**Decision**: Custom HTTP client with comprehensive error handling

**Rationale**:
- **Custom Client**: More control over request/response handling than Axios
- **Error Boundaries**: Centralized error handling for CORS, network, and validation issues
- **Type Safety**: Full TypeScript integration with API contracts

**Implementation**:
```typescript
// src/api/apiClient.ts
export const ApiClient = {
  verifySubject: (request: VerifySubjectRequest): Promise<ApiResponse<VerifySubjectResponse>>,
  verifySubSubject: (request: VerifySubSubjectRequest): Promise<ApiResponse<VerifySubSubjectResponse>>,
  generateQuiz: (request: GenerateQuizRequest): Promise<ApiResponse<GenerateQuizResponse>>,
  reviewQuiz: (request: QuizReviewRequest): Promise<ApiResponse<ReviewQuizResponse>>
}
```

**Benefits**:
- Consistent error handling
- Type-safe API calls
- Easy to mock for testing
- Comprehensive validation

### 3. Styling Architecture

**Decision**: Tailwind CSS 4 with CSS custom properties for theming

**Rationale**:
- **Utility-First**: Rapid development and consistent spacing/colors
- **Mobile-First**: Responsive design built into the utility classes
- **Custom Properties**: Dynamic theming without CSS-in-JS overhead
- **Purging**: Only used styles are included in production build

**Implementation**:
```css
/* Tailwind utilities + custom theme variables */
:root {
  --color-quiz-text: #1f2937;
  --color-quiz-primary: #10b981;
  --color-quiz-secondary: #f59e0b;
}
```

**Benefits**:
- Fast development
- Consistent design system
- Small bundle size
- Easy theme switching

### 4. TypeScript Strategy

**Decision**: Strict TypeScript with comprehensive type definitions

**Rationale**:
- **Strict Mode**: Catch errors at compile time
- **API Contracts**: Ensure frontend-backend type consistency
- **Developer Experience**: Better IDE support and refactoring

**Implementation**:
```typescript
// Strict tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**Benefits**:
- Fewer runtime errors
- Better code documentation
- Safer refactoring
- Enhanced IDE experience

### 5. Testing Strategy

**Decision**: Multi-layered testing with Vitest + Playwright

**Rationale**:
- **Unit Tests**: Component logic and utilities (Vitest + jsdom)
- **E2E Tests**: User workflows and integration (Playwright)
- **Coverage**: 80% threshold for code quality

**Implementation**:
```
tests/
├── unit/           # Component and utility tests
├── e2e/           # End-to-end user journeys
└── mocks/         # MSW handlers for API mocking
```

**Benefits**:
- Confidence in deployments
- Regression prevention
- Documentation of expected behavior
- Cross-browser validation

## Technical Decisions Deep Dive

### React 19 Features

**Concurrent Features**:
- Automatic batching for better performance
- Suspense for data fetching patterns
- Transitions for non-urgent state updates

**New Hooks Used**:
- `useId` for accessible form controls
- `useDeferredValue` for search/filter performance
- Error boundaries for graceful failure handling

### Vite Configuration

**Build Optimization**:
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        }
      }
    }
  }
})
```

**Benefits**:
- Faster cold starts (2-3x faster than webpack)
- Native ES modules in development
- Optimized production bundles
- Built-in TypeScript support

### Component Design Patterns

**1. Compound Components**:
```typescript
// RadioGroup with RadioOption children
<RadioGroup name="difficulty">
  <RadioOption value="easy">Easy</RadioOption>
  <RadioOption value="hard">Hard</RadioOption>
</RadioGroup>
```

**2. Render Props Pattern**:
```typescript
// Flexible progress display
<ProgressBar 
  value={progress} 
  render={({ percentage }) => `${percentage}% Complete`}
/>
```

**3. Custom Hooks**:
```typescript
// Reusable quiz logic
const useQuiz = () => {
  // Quiz state and operations
  return { session, startQuiz, nextQuestion, ... }
}
```

### Performance Optimizations

**1. Code Splitting**:
- Route-based chunks using React.lazy
- Component-level splitting for large features
- Vendor chunk separation

**2. State Optimization**:
- Context splitting to prevent unnecessary re-renders
- useMemo/useCallback for expensive computations
- Lazy loading of heavy components

**3. Bundle Optimization**:
- Tree shaking with ES modules
- Dynamic imports for optional features
- Asset optimization with Vite

### Accessibility Implementation

**WCAG 2.1 AA Compliance**:
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast validation

**Implementation Details**:
```typescript
// Accessible form controls
<input 
  id={useId()} 
  aria-describedby={`${id}-error`}
  aria-invalid={hasError}
  role="textbox"
/>
```

## Data Flow Architecture

### Quiz Generation Flow
```
User Input → Validation → API Call → Response Processing → State Update → UI Update
     ↓            ↓          ↓              ↓               ↓           ↓
  FormData   → Sanitize  → POST     → Transform    → Context   → React
```

### Quiz Taking Flow  
```
Question Display → User Answer → Validation → Progress Update → Next/Complete
       ↓              ↓           ↓              ↓               ↓
   Component   → Event Handler → LocalStorage → Context    → Navigation
```

### State Persistence Flow
```
Context State ↔ LocalStorage ↔ Background Sync
     ↓              ↓              ↓
  Live Data   → Persistent   → Recovery
```

## Security Considerations

### Input Sanitization
- XSS prevention with DOMPurify-style validation
- SQL injection prevention (backend responsibility)
- Content validation before API submission

### Data Protection
- No sensitive data in localStorage
- Client-side validation + server-side verification
- Error message sanitization

### CORS Security
- Vite proxy configuration for development
- Production CORS headers managed by backend
- No credentials in client-side code

## Development Workflow

### Code Organization
```
Feature-First Structure:
├── components/Feature/
│   ├── index.tsx          # Main component
│   ├── Feature.test.tsx   # Unit tests
│   ├── Feature.types.ts   # Type definitions
│   └── hooks/             # Feature-specific hooks
```

### Quality Gates
1. **TypeScript**: Strict type checking
2. **ESLint**: Code quality and consistency  
3. **Prettier**: Code formatting
4. **Vitest**: Unit test coverage (80%+)
5. **Playwright**: E2E test suite
6. **Lighthouse**: Performance auditing

### Deployment Strategy
```
Development → Staging → Production
     ↓          ↓          ↓
  Vite Dev  → Preview → Optimized Build
```

## Integration Points

### Backend API Contract
- RESTful endpoints with JSON payloads
- Standardized error response format
- Versioned API for backward compatibility
- OpenAPI specification compliance

### Third-Party Services
- **Analytics**: Planned integration with privacy-focused analytics
- **Monitoring**: Error tracking and performance monitoring
- **CDN**: Asset delivery optimization

## Future Architecture Considerations

### Scalability
- Progressive Web App (PWA) capabilities
- Offline-first architecture with service workers
- Micro-frontend architecture for team scaling

### Performance
- Server-Side Rendering (SSR) with Next.js migration path
- Edge computing for API proximity
- Advanced caching strategies

### Features
- Real-time collaboration with WebSocket integration
- Advanced analytics dashboard
- Plugin architecture for custom question types

This architecture provides a solid foundation for the current application while maintaining flexibility for future enhancements and scaling requirements.