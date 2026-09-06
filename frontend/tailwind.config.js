/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B0F17',
        surface: '#121824',
        card: '#182234',
        primary: '#00F0FF',
        danger: '#FF2A55',
        warning: '#FFAA00',
        success: '#00E676'
      }
    },
  },
  plugins: [],
}
