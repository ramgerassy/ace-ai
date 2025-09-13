import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
    plugins: [react()],

    test: {
        // Test environment
        environment: 'jsdom',

        // Setup files to run before all tests
        setupFiles: ['./src/test/setup.ts'],

        // Global test configuration
        globals: true,

        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            reportsDirectory: './coverage',
            exclude: [
                'node_modules/',
                'src/test/',
                '**/*.d.ts',
                '**/*.config.*',
                'dist/',
                'build/',
                'coverage/',
                '**/{test,tests,__tests__}/',
                '**/*.{test,spec}.{js,jsx,ts,tsx}',
                '**/index.{js,jsx,ts,tsx}',
                'src/main.tsx',
                'src/vite-env.d.ts'
            ],
            include: ['src/**/*.{js,jsx,ts,tsx}'],
            thresholds: {
                global: {
                    branches: 80,
                    functions: 80,
                    lines: 80,
                    statements: 80
                }
            }
        },

        // Test file patterns
        include: [
            'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
            'tests/unit/**/*.{test,spec}.{js,jsx,ts,tsx}'
        ],

        // Exclude patterns
        exclude: [
            'node_modules/',
            'dist/',
            'build/',
            'tests/e2e/',
            '**/*.config.*'
        ],

        // Test timeout
        testTimeout: 10000,

        // Retry failed tests
        retry: process.env.CI ? 2 : 0,

        // Mock configuration
        clearMocks: true,
        restoreMocks: true
    },

    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@/components': path.resolve(__dirname, './src/components'),
            '@/hooks': path.resolve(__dirname, './src/hooks'),
            '@/utils': path.resolve(__dirname, './src/utils'),
            '@/types': path.resolve(__dirname, './src/types'),
            '@/test': path.resolve(__dirname, './src/test')
        }
    }
})