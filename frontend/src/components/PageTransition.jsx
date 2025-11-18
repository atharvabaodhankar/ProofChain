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
    const previousIndex = previousPath ? (pageOrder[previousPath] || 0) : 0;
    
    // Determine slide direction: 1 for forward (right-to-left), -1 for backward (left-to-right)
    const slideDirection = currentIndex > previousIndex ? 1 : -1;
    setDirection(slideDirection);
    
    // Store current path for next navigation
    sessionStorage.setItem('previousPath', location.pathname);
  }, [location.pathname]);
  
  // Calculate animation values based on direction
  const enterX = direction > 0 ? '100%' : '-100%'; // Forward: from RIGHT, Backward: from LEFT
  const exitX = direction > 0 ? '-100%' : '100%';  // Forward: to LEFT, Backward: to RIGHT
  
  const variants = {
    enter: {
      x: enterX,
      opacity: 0,
      scale: 0.98,
    },
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: {
      x: exitX,
      opacity: 0,
      scale: 0.98,
    },
  };
  
  const transition = {
    type: "tween",
    ease: [0.22, 1, 0.36, 1], // More fluid cubic-bezier easing
    duration: 0.6, // Slower for more elegant feel
  };
  
  return (
    <motion.div
      key={location.pathname}
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