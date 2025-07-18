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
      animation:{
        'bounce-once':'bounce 1s 1'
      },
      backgroundImage: {
        'black-radial': 'radial-gradient(circle at 50% 50%, #1a1a1a, #0f0f0f, #000000)',
        'black-linear': 'linear-gradient(135deg, #0a0a0a, #111111, #1a1a1a)',
      },
    },
  },
  plugins: [],
};
