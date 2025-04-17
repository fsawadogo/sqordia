import React, { useState, useEffect } from 'react';
import { Fab, Zoom, useTheme, useScrollTrigger } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';

interface ScrollToTopProps {
  threshold?: number; // Minimum scroll height to show button
  position?: {
    bottom: number | string;
    right: number | string;
  };
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default';
  zIndex?: number;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({
  threshold = 400,
  position = { bottom: 20, right: 20 },
  size = 'medium',
  color = 'primary',
  zIndex = 1050
}) => {
  const theme = useTheme();
  const [showButton, setShowButton] = useState(false);
  
  // Use MUI's useScrollTrigger for better performance
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: threshold,
  });
  
  useEffect(() => {
    setShowButton(trigger);
  }, [trigger]);

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Zoom in={showButton}>
      <Fab 
        size={size}
        color={color}
        aria-label="scroll to top"
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: position.bottom,
          right: position.right,
          zIndex: zIndex,
          boxShadow: theme.shadows[4],
          '&:hover': {
            boxShadow: theme.shadows[8],
            transform: 'translateY(-4px)'
          },
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        <KeyboardArrowUp />
      </Fab>
    </Zoom>
  );
};

export default ScrollToTop;