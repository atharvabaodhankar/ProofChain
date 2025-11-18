import { Link, useLocation } from 'react-router-dom';

const AnimatedLink = ({ to, children, className, ...props }) => {
  const location = useLocation();
  
  const handleClick = () => {
    // Store the current location for transition direction calculation
    window.history.replaceState(
      { ...window.history.state, from: location.pathname },
      ''
    );
  };
  
  return (
    <Link
      to={to}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
};

export default AnimatedLink;