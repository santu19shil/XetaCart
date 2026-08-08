/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#0d1117',
        mid: '#161b22',
        gold: '#f5c518',
        orange: '#ff9900',
        'deal-red': '#cc0c39',
        'deal-green': '#067d62',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
