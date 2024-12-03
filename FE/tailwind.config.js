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
      boxShadow: {
        default: '0 4px 4px rgba(20, 33, 43, 0.04)'
      },
      cursor: {
        gameCursor: "url('/cursor.png') 14 16, auto", // 마우스 커서
        gameCursorPointer: "url('/cursor-pointer64.png') 26 32, auto", // 마우스 커서
        clickCursor: "url('/cursor.png') 16 16, auto" // 클릭 시 커서
      },
      keyframes: {
        popup: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        }
      },
      animation: {
        popup: 'popup 0.5s ease-out',
        gradient: 'gradient 6s infinite ease-in-out'
      },
      backgroundSize: {
        '300%': '300% 300%' // 커스텀 배경 크기
      }
    }
  },
  safelist: [
    'bg-gradient-to-r',
    'from-sky-300',
    'to-indigo-500',
    'from-pink-300',
    'via-purple-300',
    'to-indigo-300',
    'from-green-200',
    'to-blue-400',
    "bg-[url('/snowBg1.png')]",
    "bg-[url('/snowBg2.png')]",
    "bg-[url('/snowBg3.png')]",
    "bg-[url('/snowBg5.png')]",
    "bg-[url('/snowBg6.png')]",
    'bg-cover',
    'bg-center'
  ],
  plugins: [
    function ({ addUtilities, theme }) {
      const newUtilities = {
        '.component-default': {
          borderWidth: '1px',
          borderColor: theme('borderColor.default'),
          borderRadius: theme('borderRadius.m'),
          backgroundColor: '#FFFD'
        },
        '.component-popup': {
          borderRadius: theme('borderRadius.m'),
          backgroundColor: '#FFFD',
          boxShadow: theme('boxShadow.default')
        },
        '.center': {
          display: 'flex',
          justifyContent: 'center',

          alignItems: 'center'
        },
        '.text-shadow': {
          'text-shadow':
            '0 -3px 0 #333, 0 6px 8px rgba(0,0,0,.4), 0 9px 10px rgba(0,0,0,.15), 0 30px 10px rgba(0,0,0,.18), 0 15px 10px rgba(0,0,0,.21)'
        },
        '.gradation-animation': {
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, #1e3c72, #2a5298)',
          backgroundSize: '300% 300%',
          animation: 'gradientAnimation 6s infinite ease-in-out'
        }
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    }
  ]
};
