/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sabu-primary': '#00BF63',
        'sabu-primary-dark': '#00A052',
        'sabu-secondary': '#0D146B',
        'sabu-secondary-dark': '#090F51',
      },
    },
  },
  plugins: [],
}
