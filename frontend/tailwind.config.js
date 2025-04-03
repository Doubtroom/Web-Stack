/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily:{
        'custom-font1':['Josefin Sans',"sans-serif"],
      },
      colors: {
        primary: '#173f67',
        secondary: '#1e6eab',
      },
    },
  },
  plugins: [],
}