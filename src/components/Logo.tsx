import React from 'react';
import { useTheme } from '@mui/material';
import { Brain } from 'lucide-react';

interface LogoProps {
  width?: number;
  height?: number;
  includeText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  width = 140, 
  height = 40,
  includeText = true 
}) => {
  const theme = useTheme();
  
  // Colors for the logo - ensure visibility in both light and dark modes
  const primaryColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary.main;
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', width, height }}>
      <Brain 
        size={includeText ? height * 0.8 : height} 
        color={primaryColor} 
        strokeWidth={1.5}
      />
      
      {includeText && (
        <span style={{ 
          marginLeft: '8px', 
          fontWeight: 'bold', 
          fontSize: `${height * 0.5}px`,
          background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-block'
        }}>
          Sqordia
        </span>
      )}
    </div>
  );
};

export default Logo;