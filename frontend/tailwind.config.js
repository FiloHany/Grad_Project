/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      // Extend the default palette with 950 shades (Tailwind v3 only ships up to 900)
      colors: {
        indigo: {
          950: '#1e1b4b',
        },
        gray: {
          950: '#030712',
        },
        slate: {
          950: '#020617',
        },
      },
    },
  },
  plugins: [],
}
