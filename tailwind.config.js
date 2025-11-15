/** @type {import('tailwindcss').Config} */
export default {
  content: ['index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neutral: {
          50: '#edede9',
          100: '#f5ebe0',
          200: '#e3d5ca',
          300: '#d6ccc2',
          400: '#d5bdaf',
          500: '#b8a398',
          600: '#8f7d70',
          700: '#6b5a4d',
          800: '#4a3f35',
          900: '#2d2520',
        },
        accent: {
          blue: '#7a9aaf',
          green: '#7a9b76',
          gold: '#d4a574',
          terracotta: '#b87d6f',
        },
        brand: {
          DEFAULT: '#7a9aaf',
          dark: '#4a6070',
        },
      },
      fontFamily: {
        primary: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Lexend"', '"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
      spacing: {
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
      },
    },
  },
  plugins: [],
}

