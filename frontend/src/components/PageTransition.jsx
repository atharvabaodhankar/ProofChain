import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const location = useLocation();
  
  // Define the order of pages for slide direction
  const pageOrder = {
    '/': 0,
    '/create': 1,
    '/verify': 2,
    '/dashboard': 3,
    '/history': 4
  };
  
  // Get slide direction based on page order
  const getSlideDirection = (pathname) => {
    const currentIndex = pageOrder[pathname] || 0;
    const prevIndex = pageOrder[location.state?.from] || 0;
    
    return currentIndex > prevIndex ? 1 : -1;
  };
  
  const slideDirection = getSlideDirection(location.pathname);
  
  const pageVariants = {
    initial: {
      opacity: 0,
      x: slideDirection * 100,
      scale: 0.98,
    },
    in: {
      opacity: 1,
      x: 0,
      scale: 1,
    },
    out: {
      opacity: 0,
      x: slideDirection * -100,
      scale: 0.98,
    }
  };
  
  const pageTransition = {
    type: "tween",
    ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier for smooth feel
    duration: 0.4
  };
  
  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;