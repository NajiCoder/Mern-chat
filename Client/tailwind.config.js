/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Add your custom colors here
        "purple-light": "#8294C4",
        peach: "#FFead2",
        lavender: "#DBDFEA",
        "blue-gray": "#ACB1D6",
      },
    },
  },

  plugins: [],
};
