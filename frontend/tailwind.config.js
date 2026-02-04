/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e63946',
        secondary: '#1d3557',
        accent: '#f4a261',
      },
    },
  },
  plugins: [],
}
