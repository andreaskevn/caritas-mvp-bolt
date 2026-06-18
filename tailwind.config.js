/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#FF6B35',
          dark: '#E85A26',
          light: '#FF8556',
          50: '#FFF4EF',
          100: '#FFE5D9',
          500: '#FF6B35',
          600: '#E85A26',
        },
      },
    },
  },
  plugins: [],
};
