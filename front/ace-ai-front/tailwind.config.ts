import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        quiz: {
          primary: 'var(--color-quiz-primary)',
          secondary: 'var(--color-quiz-secondary)', 
          accent: 'var(--color-quiz-accent)',
          light: 'var(--color-quiz-light)',
          surface: 'var(--color-quiz-surface)',
          text: 'var(--color-quiz-text)',
          border: 'var(--color-quiz-border)',
          bg: 'var(--color-quiz-bg)',
        },
        forest: {
          50: 'var(--color-forest-50)',
          100: 'var(--color-forest-100)',
          500: 'var(--color-forest-500)',
          900: 'var(--color-forest-900)',
        },
        gold: {
          50: 'var(--color-gold-50)',
          600: 'var(--color-gold-600)',
          900: 'var(--color-gold-900)',
        }
      },
      fontFamily: {
        heading: ['var(--font-family-heading)', 'system-ui', 'sans-serif'],
        body: ['var(--font-family-body)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '3xs': 'var(--font-size-3xs)',
        '2xs': 'var(--font-size-2xs)', 
        'quiz-lg': 'var(--font-size-quiz-lg)',
        'quiz-2xl': 'var(--font-size-quiz-2xl)',
        'quiz-3xl': 'var(--font-size-quiz-3xl)',
      },
      spacing: {
        '7': 'var(--spacing-7)',
        '18': 'var(--spacing-18)',
      },
      boxShadow: {
        'quiz-sm': 'var(--box-shadow-quiz-sm)',
        'quiz-md': 'var(--box-shadow-quiz-md)',
        'quiz-lg': 'var(--box-shadow-quiz-lg)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'pulse-glow': 'pulse-glow 2s infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
} satisfies Config