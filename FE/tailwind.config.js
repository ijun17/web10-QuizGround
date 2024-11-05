/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@mui/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        main: '#7890E7'
      },
      fontSize: {
        l: '1.5rem',
        m: '1rem',
        r: '0.75rem',
        s: '0.625rem',
      },
      textColor: {
        default: '#5F6E76',
        weak: '#879298'
      },
      backgroundColor: {
        surface: {
          default: 'white',
          alt: '#F5F7F9'
        }
      },
      borderColor: {
        default: '#879298'
      },
      borderRadius: {
        m: '1rem',
        s: '0.5rem'
      },
      dropShadow: {
        popup: '0 4px 2px rgba(20, 33, 43, 0.02)'
      }
    },
  },
  plugins: [
    function ({ addUtilities, theme }) {
      const newUtilities = {
        '.component-default': {
          borderWidth: '1px',
          borderColor: '#879298',
          borderRadius: theme('borderRadius.m'),
          backgroundColor: theme('backgroundColor.default'),
        },
        '.component-popup': {
          borderRadius: theme('borderRadius.m'),
          dropShadow: theme('dropShadow.popup'),
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    }
  ],
}