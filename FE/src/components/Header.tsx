import { useEffect, useState } from 'react';
import { Logo } from './Logo';

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
        isSticky
          ? 'fixed top-0 left-0 w-full z-50 bg-opacity-5 backdrop-blur-md'
          : 'absolute top-5 left-5 z-50'
      } transition-all`}
    >
      <div className="max-w-screen-lg px-4 py-3 flex items-center">
        <Logo />
      </div>
    </header>
  );
};
