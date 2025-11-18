import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [direction, setDirection] = useState(0);
  
  // Define the order of pages for slide direction
  const pageOrder = {
    '/': 0,
    '/create': 1,
    '/verify': 2,
    '/dashboard': 3,
    '/history': 4
  };
  
  useEffect(() => {
    const currentIndex = pageOrder[location.pathname] || 0;
    const previousPath = sessionStorage.getItem('previousPath');
    const previousIndex = pageOrder[previousPath] || 0;
    
    // Determine slide direction: 1 for right-to-left, -1 for left-to-right
    const slideDirection = currentIndex > previousIndex ? 1 : -1;
    setDirection(slideDirection);
    
    // Store current path for next navigation
    sessionStorage.setItem('previousPath', location.pathname);
  }, [location.pathname]);
  
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%', // New page enters from opposite direction
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%', // Current page exits in navigation direction
      opacity: 0,
    }),
  };
  
  const transition = {
    type: "tween",
    ease: [0.25, 0.46, 0.45, 0.94], // Smooth cubic-bezier easing
    duration: 0.4, // Optimal duration for smooth feel
  };
  
  return (
    <motion.div
      key={location.pathname}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
      className="w-full min-h-screen"
      style={{
        position: 'absolute',
        width: '100%',
        top: 0,
        left: 0,
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;