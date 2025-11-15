/** @type {import('tailwindcss').Config} */
export default {
  content: ['index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Design System Colors from UI_DESIGN_SYSTEM_AND_SCREENS.md
        neutral: {
          50: '#edede9',   // Main backgrounds, page bg
          100: '#f5ebe0',  // Elevated surfaces, cards
          200: '#e3d5ca',  // Borders, dividers
          300: '#d6ccc2',  // Disabled states, placeholders
          400: '#d5bdaf',  // Secondary text
          500: '#b8a398',  // Body text light
          600: '#8f7d70',  // Headings, emphasis
          700: '#6b5a4d',  // Primary text (WCAG AA)
          800: '#4a3f35',  // Heavy emphasis
          900: '#2d2520',  // Maximum contrast
        },
        accent: {
          blue: '#7a9aaf',       // Primary actions, links
          green: '#7a9b76',      // Success, eco-actions
          gold: '#d4a574',       // Warnings, alerts
          terracotta: '#b87d6f', // Errors, destructive
        },
        // Semantic colors
        primary: '#7a9aaf',
        success: '#7a9b76',
        warning: '#d4a574',
        error: '#b87d6f',
        info: '#7a9aaf',
      },
      fontFamily: {
        primary: ['Inter', 'Helvetica Neue', 'system-ui', 'sans-serif'],
        display: ['Lexend', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs: '0.75rem',    // 12px - Labels, captions
        sm: '0.875rem',   // 14px - Body small
        base: '1rem',     // 16px - Body text
        lg: '1.125rem',   // 18px - Emphasized text
        xl: '1.25rem',    // 20px - Section headings
        '2xl': '1.5rem',  // 24px - Page titles
        '3xl': '2rem',    // 32px - Hero text
        '4xl': '2.5rem',  // 40px - Marketing hero
      },
      spacing: {
        1: '0.25rem',  // 4px
        2: '0.5rem',   // 8px
        3: '0.75rem',  // 12px
        4: '1rem',     // 16px
        5: '1.25rem',  // 20px
        6: '1.5rem',   // 24px
        8: '2rem',     // 32px
        10: '2.5rem',  // 40px
        12: '3rem',    // 48px
        16: '4rem',    // 64px
        20: '5rem',    // 80px
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(45, 37, 32, 0.06)',
        'card-hover': '0 8px 24px rgba(45, 37, 32, 0.1)',
      },
      transitionDuration: {
        DEFAULT: '300ms',
      },
    },
  },
  plugins: [],
}
