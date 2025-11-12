/** @type {import('tailwindcss').Config} */
export default {
  content: ['index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#60a5fa',
          dark: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
}

