import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedWrapperProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'scaleUp' | 'fadeInLeft' | 'fadeInRight';
  delay?: number;
  duration?: number;
  className?: string;
}

const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 }
  },
  scaleUp: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 }
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 }
  },
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 }
  }
};

const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({ 
  children, 
  animation = 'fadeIn',
  delay = 0,
  duration = 0.5,
  className
}) => {
  const selectedAnimation = animations[animation];
  
  return (
    <motion.div
      initial={selectedAnimation.initial}
      animate={selectedAnimation.animate}
      transition={{ 
        duration: duration, 
        delay: delay,
        ease: 'easeOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedWrapper;