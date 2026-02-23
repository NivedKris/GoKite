/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#137fec',
        'primary-dark': '#0e6bc8',
        'bg-light': '#f6f7f8',
        'bg-dark': '#101922',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      keyframes: {
        kitefloat: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-4deg)' },
          '50%':       { transform: 'translateY(-14px) rotate(4deg)' },
        },
      },
      animation: {
        'kite-float': 'kitefloat 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

