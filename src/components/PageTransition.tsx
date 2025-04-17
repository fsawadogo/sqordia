import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  location: string; // To detect location changes
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, location }) => {
  return (
    <div style={{ width: '100%' }}>
      {children}
    </div>
  );
};

export default PageTransition;