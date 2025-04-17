import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Container, Paper, Typography, useTheme, FormControl, Select, MenuItem, Fade, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import Logo from '../components/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { ThemeContext } from '../App';
import { DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material';

const AuthLayout: React.FC = () => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { darkMode, toggleDarkMode } = React.useContext(ThemeContext);
  
  // Get the current page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/login') return t('auth.signIn');
    if (path === '/register') return t('auth.createAccount');
    if (path === '/forgot-password') return t('auth.resetPassword');
    return '';
  };
  
  const backgroundAnimation = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 1, ease: "easeInOut" }
    }
  };
  
  const logoAnimation = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.5,
        duration: 0.8, 
        ease: "easeOut" 
      }
    }
  };
  
  const formAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.8,
        duration: 0.8, 
        ease: "easeOut"
      }
    }
  };
  
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={backgroundAnimation}
    >
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(120deg, #1a237e 0%, #000000 100%)' 
            : 'linear-gradient(120deg, #e8f5fe 0%, #ffffff 100%)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.palette.primary.main} 0%, transparent 70%)`,
            zIndex: 0
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '10%',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.palette.secondary.main} 0%, transparent 70%)`,
            zIndex: 0
          }}
        />
        
        <Container maxWidth="sm">
          <motion.div 
            variants={logoAnimation}
            initial="hidden"
            animate="visible"
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 4,
              }}
            >
              <Logo width={180} height={60} />
              <Typography 
                variant="subtitle1" 
                sx={{
                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'inherit',
                  mt: 1
                }}
              >
                {t('appTagline')}
              </Typography>
            </Box>
          </motion.div>
          
          {/* Theme and language controls */}
          <Box sx={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 1 }}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.1)' 
                    : 'rgba(0,0,0,0.05)',
                  color: theme.palette.mode === 'dark' 
                    ? theme.palette.warning.light 
                    : theme.palette.primary.main,
                  transition: 'transform 0.3s ease, background-color 0.3s ease',
                  transform: darkMode ? 'rotate(180deg)' : 'rotate(0deg)',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.2)' 
                      : 'rgba(0,0,0,0.1)',
                  }
                }}
                onClick={toggleDarkMode}
              >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </Box>
            </motion.div>
            <LanguageSwitcher />
          </Box>
          
          <motion.div 
            variants={formAnimation}
            initial="hidden"
            animate="visible"
          >
            <Paper
              elevation={8}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: 2,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(31,41,55,0.8)' 
                  : 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: theme.shadows[12]
                }
              }}
            >
              <Outlet />
            </Paper>
          </motion.div>
          
          {/* Footer with language options */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary'}>
              © {new Date().getFullYear()} Sqordia. {t('footer.allRightsReserved')}
            </Typography>
          </Box>
        </Container>
      </Box>
    </motion.div>
  );
};

export default AuthLayout;