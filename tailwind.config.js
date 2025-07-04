/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: "Inter",
      },
      boxShadow: {
        'wrap': '0 4px 20px rgba(0, 0, 0, 0.15)',
      },
    },
    plugins: [],
  }
}