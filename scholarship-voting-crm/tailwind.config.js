/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7f6',
          100: '#e8ede9',
          200: '#d1dbd4',
          300: '#a8bfad',
          400: '#7a9d82',
          500: '#5a8062',
          600: '#2d4a3e',
          700: '#253a32',
          800: '#1e2f28',
          900: '#1a2e24',
        },
        accent: {
          50: '#faf8f5',
          100: '#f5f1e8',
          200: '#ebe3d1',
          300: '#dfd0b0',
          400: '#d4c5a0',
          500: '#c9b88f',
          600: '#b5a47d',
          700: '#998a68',
          800: '#7d7156',
          900: '#665d47',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
