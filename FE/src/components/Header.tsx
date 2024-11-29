import { useEffect, useState } from 'react';
import { Logo } from './Logo';

// export const Header = () => {
//   const navigate = useNavigate();
//   return (
//     <header className="sticky top-0 left-0 w-full z-50">
//       <div className="max-w-screen-lg mx-auto px-4 py-3 flex items-center">
//         <h1
//           className="font-logo text-blue-700 text-3xl cursor-pointer transition-all hover:text-purple-300"
//           onClick={() => navigate('/')}
//         >
//           QuizGround
//         </h1>
//       </div>
//     </header>
//   );
// };
export const Header = () => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 950) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    const handleScroll = () => {
      if (window.scrollY > 50 || window.innerWidth <= 950) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={`${
        isSticky ? 'fixed top-0 left-0 w-full z-50 bg-white shadow-md' : 'absolute top-5 left-5'
      } transition-all`}
    >
      <div className="max-w-screen-lg mx-auto px-4 py-3 flex items-center">
        {/* <h1
          className="text-gray-900 text-3xl font-bold cursor-pointer transition-all hover:text-purple-500"
          onClick={() => navigate('/')}
        >
          QuizGround
        </h1> */}
        <Logo />
      </div>
    </header>
  );
};
