/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/**/*.{js,ts,jsx,tsx,mdx}", // Include shared packages
  ],
  theme: {
    extend: {
      colors: {
        walmart: {
          blue: "#0152E2",
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'), // For product image aspect ratios
  ],
}; 