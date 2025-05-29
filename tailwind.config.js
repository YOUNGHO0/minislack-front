/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        nav: '#166E48',
        chat: '#FAFAFA',
        message: '#F0F0F0',
      },
    },
  },
  plugins: [],
};
