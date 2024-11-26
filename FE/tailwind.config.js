/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@mui/**/*.{js,ts,jsx,tsx}'
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
        s: '0.625rem'
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
        default: 'E9E9E9'
      },
      borderRadius: {
        m: '1rem',
        s: '0.5rem'
      },
      dropShadow: {
        default: '0 4px 2px rgba(20, 33, 43, 0.02)'
      }
    }
  },
  plugins: [
    function ({ addUtilities, theme }) {
      const newUtilities = {
        '.component-default': {
          borderWidth: '1px',
          borderColor: theme('borderColor.default'),
          borderRadius: theme('borderRadius.m'),
          backgroundColor: theme('backgroundColor.surface.default')
        },
        '.component-popup': {
          borderRadius: theme('borderRadius.m'),
          backgroundColor: theme('backgroundColor.surface.default'),
          dropShadow: theme('dropShadow.default')
        },
        '.center': {
          display: 'flex',
          justifyContent: 'center',

          alignItems: 'center',
        },
        '.text-shadow': {
          'text-shadow': '0 -3px 0 #333, 0 6px 8px rgba(0,0,0,.4), 0 9px 10px rgba(0,0,0,.15), 0 30px 10px rgba(0,0,0,.18), 0 15px 10px rgba(0,0,0,.21)',
        }
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    }
  ]
};
