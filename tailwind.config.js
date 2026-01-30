/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#60A5FA',
        tertiary: '#DBEAFE',
        background: '#F8FAFC',
        accent: '#2563EB',
        'accent-2': '#2C25EB',
        dark: '#1E293B',
        overlay: 'rgba(37, 99, 235, 0.1)',
      },
      fontFamily: {
        sans: ['Pretendard', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
