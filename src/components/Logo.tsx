import React from 'react';
import { useTheme } from '@mui/material';

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
  const lightMode = theme.palette.mode === 'light';
  
  // Colors for the logo - ensure visibility in both light and dark modes
  const primaryColor = theme.palette.mode === 'dark' ? '#4f46e5' : '#4338ca'; // Darker in light mode
  const accentColor = theme.palette.mode === 'dark' ? '#06b6d4' : '#0891b2'; // Darker in light mode
  const secondaryColor = theme.palette.mode === 'dark' ? '#7c3aed' : '#6d28d9'; // Darker in light mode
  
  // Adjust colors for dark mode
  const textColor = lightMode ? '#1e293b' : '#ffffff';
  
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 400 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main abstract shape - stylized "S" */}
      <path 
        d="M70 20 C50 20, 40 30, 40 45 C40 60, 55 65, 70 70 C85 75, 95 80, 95 90 C95 100, 80 105, 70 105 C55 105, 40 95, 40 85"
        stroke={primaryColor}
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Data visualization elements */}
      <circle cx="120" cy="50" r="10" fill={secondaryColor} opacity="0.8" />
      <circle cx="150" cy="35" r="6" fill={accentColor} />
      <circle cx="170" cy="60" r="8" fill={primaryColor} opacity="0.6" />
      <circle cx="190" cy="40" r="5" fill={secondaryColor} />
      
      {/* Connecting lines */}
      <path 
        d="M120 50 L150 35 L170 60 L190 40"
        stroke={accentColor}
        strokeWidth="2"
        fill="none"
      />
      
      {/* Rising graph line */}
      <path 
        d="M210 70 L225 55 L240 60 L255 40 L270 30"
        stroke={primaryColor}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* AI nodes */}
      <circle cx="225" cy="55" r="3" fill={accentColor} />
      <circle cx="240" cy="60" r="3" fill={accentColor} />
      <circle cx="255" cy="40" r="3" fill={accentColor} />
      <circle cx="270" cy="30" r="3" fill={accentColor} />
      
      {includeText && (
        <>
          {/* SQORDIA text */}
          <text
            x="85"
            y="63"
            fontFamily="'Inter', sans-serif"
            fontSize="36"
            fontWeight="700"
            fill={textColor}
          >
            SQORDIA
          </text>
        </>
      )}
    </svg>
  );
};

export default Logo;