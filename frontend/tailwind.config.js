/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        josefin: ['"Josefin Sans"', "sans-serif"],
        kanit: ['"Kanit"', "sans-serif"],
        anton: ['"Anton"', "sans-serif"],
      },
      colors: {
        primary: "#173f67",
        secondary: "#1e6eab",
      },
    },
  },
  plugins: [],
};
