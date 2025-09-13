# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuizMaster is a modern, AI-powered quiz application built with React and TypeScript. This frontend delivers an intelligent, mobile-first learning experience with real-time feedback and performance analytics.

## Development Commands

### Core Development
- `npm run dev` - Start Vite development server with HMR
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run preview` - Preview production build locally

### Code Quality & Validation
- `npm run lint` - Run ESLint with error reporting
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run lint:quiet` - Run ESLint in quiet mode
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is properly formatted
- `npm run type-check` - Run TypeScript type checking without emission
- `npm run validate` - Run all checks: type-check + lint + format:check
- `npm run fix` - Auto-fix linting and formatting issues

### Testing
- `npm run test` - Run unit tests with Vitest
- `npm run test:ui` - Run Vitest with UI interface
- `npm run test:coverage` - Generate test coverage report
- `npm run test:watch` - Run tests in watch mode

### End-to-End Testing (Playwright)
- `npm run test:e2e` - Run all E2E tests
- `npm run test:e2e:ui` - Run E2E tests with Playwright UI
- `npm run test:e2e:headed` - Run E2E tests with visible browser
- `npm run test:e2e:debug` - Debug E2E tests
- `npm run test:e2e:chromium` - Run E2E tests on Chromium only
- `npm run test:e2e:firefox` - Run E2E tests on Firefox only
- `npm run test:e2e:webkit` - Run E2E tests on WebKit only
- `npm run test:e2e:mobile` - Run E2E tests on mobile viewports
- `npm run test:e2e:report` - Show Playwright test report
- `npm run test:e2e:install` - Install Playwright browsers
- `npm run test:e2e:install-deps` - Install Playwright system dependencies

## Architecture

### Tech Stack
- **React 19** with TypeScript and Vite
- **Tailwind CSS 4** for styling (using new Vite plugin)
- **Vitest** for unit testing with jsdom environment
- **Playwright** for end-to-end testing
- **React Testing Library** for component testing

### Current Project Structure
```
src/
├── app/                    # Application entry and routing
│   ├── App.tsx            # Main app component (currently basic)
│   └── router.tsx         # Client-side routing (placeholder)
├── components/            # Feature-based components
│   ├── GenerateQuiz/     # Quiz generation forms (placeholders)
│   ├── Global/           # Shared UI components
│   │   ├── badge.tsx     # Badge component (to implement)
│   │   ├── button.tsx    # Button component (to implement)
│   │   ├── card.tsx      # Card component (to implement)
│   │   ├── input.tsx     # Input component (to implement)
│   │   ├── navbar.tsx    # Navigation bar (to implement)
│   │   ├── progressBar.tsx # Progress bar component (to implement)
│   │   └── radioGroup.tsx # Radio group component (to implement)
│   ├── QuizResults/      # Results display and review (placeholders)
│   ├── TakeQuiz/         # Quiz taking interface (placeholders)
│   └── WelcomeScreen/    # User onboarding (placeholders)
├── context/              # React Context providers (empty)
├── services/             # API communication layer
│   └── quizApi.ts        # Quiz API service (placeholder)
├── test/                 # Test utilities and mocks
│   └── mocks/           # MSW handlers and test data
├── types/               # TypeScript type definitions
│   └── quiz.types.ts    # Quiz-related types (placeholder)
└── utils/               # Utility functions
    ├── formmaters.ts    # Formatting utilities (placeholder)
    ├── localStorage.ts  # Local storage utilities (placeholder)
    └── validation.ts    # Validation utilities (placeholder)
```

### Planned Features (per ProjectDefinition.md)
1. **User Onboarding & Welcome** - Clean welcome interface with name input
2. **Dynamic Quiz Generation** - Subject/difficulty selection with form validation
3. **Interactive Quiz Experience** - Navigation, progress tracking, auto-save
4. **Comprehensive Results & Analytics** - Score visualization, question review
5. **Progressive Enhancement** - Local storage, offline-first approach

### State Management Strategy
The application will use React's built-in state management:
- **useState/useReducer** for component state
- **Custom hooks** for shared logic (hooks directory to be created)
- **Context API** for global state when needed
- **Local storage utilities** for persistence

### Testing Configuration
- **Unit tests**: Vitest with jsdom, React Testing Library, 80% coverage thresholds
- **E2E tests**: Playwright with cross-browser support
- **Test aliases**: Configured for `@/` imports pointing to `src/`
- **MSW**: Mock service worker for API testing

### Code Quality Setup
- **ESLint**: Comprehensive configuration with React, TypeScript, accessibility, and Prettier integration
- **TypeScript**: Strict type checking enabled
- **Import sorting**: Automated with ESLint rules
- **Accessibility**: jsx-a11y plugin enforces WCAG compliance
- **Code limits**: Components under 50 lines, files under 300 lines

## Development Notes

### Current State
The project is in early development phase:
- Basic project structure is established
- UI components in Global folder are created but empty (need implementation)
- Most feature components are placeholders
- No custom hooks implemented yet
- Context providers directory is empty
- API services are placeholder files

### Key Implementation Patterns
- Use TypeScript strictly - no `any` types in production code
- Follow React 19 patterns (no React imports needed)
- Implement mobile-first responsive design with Tailwind CSS
- Maintain 80%+ test coverage
- Use semantic HTML and ARIA attributes for accessibility
- Component composition over inheritance
- Custom hooks for shared logic and state management

### Design System (per ProjectDefinition.md)
- **Color Scheme**: Deep Green + Gold (wisdom & achievement theme)
- **Typography**: Inter + Space Grotesk (modern, professional)
- **Mobile-First**: Responsive design starting at 320px
- **Theme Support**: Light and dark mode compatibility

### API Integration Plan
The app will integrate with quiz generation and submission APIs:
- Quiz generation endpoint for creating questions
- Quiz submission endpoint for scoring and feedback
- Error handling and loading states for all API interactions

### Performance Targets
- **Initial bundle**: < 200KB gzipped
- **Route chunks**: < 50KB gzipped each
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1