import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  IconButton, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Avatar, 
  Menu, 
  MenuItem, 
  useTheme,
  useMediaQuery,
  Tooltip,
  Fade,
  Zoom,
  Slide,
  SwipeableDrawer,
  Backdrop,
  CircularProgress,
  Paper,
  Badge,
  Fab,
  BottomNavigation,
  BottomNavigationAction,
  Container,
  Button
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu as MenuIcon, 
  ChevronLeft as ChevronLeftIcon, 
  Dashboard as DashboardIcon, 
  Assignment as AssignmentIcon, 
  Edit as EditIcon, 
  CreditCard as CreditCardIcon, 
  AccountCircle as AccountCircleIcon, 
  Settings as SettingsIcon, 
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import NotificationCenter from '../components/NotificationCenter';
import LanguageSwitcher from '../components/LanguageSwitcher';
import AnimatedWrapper from '../components/AnimatedWrapper';
import { Brain } from 'lucide-react';
import Logo from '../components/Logo';

interface MainLayoutProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const drawerWidth = 240;

const MainLayout: React.FC<MainLayoutProps> = ({ darkMode, toggleDarkMode }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileNavValue, setMobileNavValue] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Mock user data - would come from auth state
  const user = {
    name: "Jane Doe",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80",
    role: "administrator" // or 'user', 'consultant', 'obnl'
  };
  
  // Handle page loading visualization (simulated)
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  // Set mobile nav value based on current route
  useEffect(() => {
    if (location.pathname === '/dashboard') setMobileNavValue(0);
    else if (location.pathname === '/questionnaire') setMobileNavValue(1);
    else if (location.pathname === '/editor') setMobileNavValue(2);
    else if (location.pathname === '/subscription') setMobileNavValue(3);
    else if (location.pathname === '/profile') setMobileNavValue(4);
  }, [location.pathname]);
  
  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };
  
  const handleCloseNotificationsMenu = () => {
    setNotificationsAnchorEl(null);
  };
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  const navigationItems = [
    { icon: <DashboardIcon />, text: t('nav.dashboard'), path: '/dashboard' },
    { icon: <AssignmentIcon />, text: t('nav.questionnaire'), path: '/questionnaire' },
    { icon: <EditIcon />, text: t('nav.businessPlan'), path: '/editor' },
    { icon: <CreditCardIcon />, text: t('nav.subscription'), path: '/subscription' },
  ];
  
  if (user.role === 'administrator') {
    navigationItems.push({ 
      icon: <AdminPanelSettingsIcon />, 
      text: t('nav.adminPanel'), 
      path: '/admin' 
    });
  }
  
  // Variants for mobile drawer animations
  const drawerVariants = {
    hidden: { x: "-100%" },
    visible: { 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 300,
        damping: 30
      }
    }
  };
  
  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: custom * 0.05,
        duration: 0.3
      }
    })
  };
  
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && !isMobile && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
          backdropFilter: 'blur(10px)',
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(17, 24, 39, 0.85)' 
            : 'rgba(255, 255, 255, 0.85)',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 4px 20px 0 rgba(0,0,0,0.4)' 
            : '0 4px 20px 0 rgba(0,0,0,0.1)',
        }}
        elevation={0}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
            <IconButton
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2,
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.1)'
                },
                transition: 'transform 0.3s, background-color 0.3s',
                transform: open && !isMobile ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            >
              <MenuIcon />
            </IconButton>
            
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}
            >
              <Logo width={40} height={40} includeText={false} />
              <Typography variant="h6" component="div" sx={{ 
                ml: 1, 
                fontWeight: 'bold', 
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)' 
                  : 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: { xs: 'none', sm: 'block' }
              }}>
                Sqordia
              </Typography>
            </motion.div>
            
            <Box sx={{ display: 'flex' }}>
              {!isMobile && <LanguageSwitcher />}
              
              <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} TransitionComponent={Zoom}>
                <IconButton 
                  aria-label="toggle dark mode" 
                  onClick={toggleDarkMode}
                  sx={{
                    transition: 'all 0.5s ease',
                    transform: darkMode ? 'rotate(180deg)' : 'rotate(0deg)',
                    color: theme.palette.mode === 'dark' 
                      ? theme.palette.warning.light 
                      : theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.1)' 
                        : 'rgba(0,0,0,0.08)'
                    }
                  }}
                >
                  {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
              
              {!isMobile && (
                <>
                  <Tooltip title={t('nav.notifications')} TransitionComponent={Zoom}>
                    <IconButton 
                      aria-label="notifications"
                      onClick={handleNotificationsMenu}
                      aria-controls="notifications-menu"
                      aria-haspopup="true"
                      sx={{
                        transition: 'transform 0.2s ease',
                        color: theme.palette.text.primary,
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <Badge badgeContent={3} color="error">
                        <NotificationsIcon />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={t('nav.help')} TransitionComponent={Zoom}>
                    <IconButton 
                      aria-label="help"
                      sx={{
                        transition: 'transform 0.2s ease',
                        color: theme.palette.text.primary,
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <HelpIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <IconButton
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <Avatar 
                    alt={user.name} 
                    src={user.avatar} 
                    sx={{ 
                      width: 32, 
                      height: 32,
                      border: `2px solid ${theme.palette.primary.main}`
                    }}
                  />
                </IconButton>
              </motion.div>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Profile Menu */}
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        TransitionComponent={Fade}
        transitionDuration={300}
        sx={{ 
          '& .MuiPaper-root': { 
            borderRadius: 2,
            boxShadow: theme.shadows[10],
            padding: 1,
            minWidth: 200
          } 
        }}
      >
        <Box sx={{ px: 2, py: 1, mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{user.name}</Typography>
          <Typography variant="body2" color="text.secondary">{user.role}</Typography>
        </Box>
        <Divider sx={{ mb: 1 }} />
        <MenuItem onClick={() => { navigate('/profile'); handleCloseMenu(); }} sx={{ borderRadius: 1 }}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>{t('nav.profile')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleCloseMenu(); }} sx={{ borderRadius: 1 }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" color="action" />
          </ListItemIcon>
          <ListItemText>{t('common.settings')}</ListItemText>
        </MenuItem>
        {isMobile && (
          <MenuItem onClick={toggleDarkMode} sx={{ borderRadius: 1 }}>
            <ListItemIcon>
              {darkMode ? 
                <LightModeIcon fontSize="small" sx={{ color: theme.palette.warning.light }} /> : 
                <DarkModeIcon fontSize="small" color="primary" />
              }
            </ListItemIcon>
            <ListItemText>{darkMode ? "Light Mode" : "Dark Mode"}</ListItemText>
          </MenuItem>
        )}
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleLogout} sx={{ borderRadius: 1, color: theme.palette.error.main }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>{t('nav.logout')}</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Notifications Menu */}
      <Menu
        id="notifications-menu"
        anchorEl={notificationsAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(notificationsAnchorEl)}
        onClose={handleCloseNotificationsMenu}
        TransitionComponent={Fade}
        transitionDuration={300}
        sx={{ 
          '& .MuiPaper-root': { 
            borderRadius: 2,
            boxShadow: theme.shadows[10],
            mt: 1.5
          } 
        }}
      >
        <NotificationCenter onClose={handleCloseNotificationsMenu} />
      </Menu>
      
      {/* Mobile Drawer */}
      {isMobile ? (
        <SwipeableDrawer
          variant="temporary"
          open={open}
          onClose={handleDrawerToggle}
          onOpen={() => setOpen(true)}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: '85%',
              maxWidth: 320,
              boxSizing: 'border-box',
              boxShadow: theme.shadows[10],
              borderRadius: '0 16px 16px 0',
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(17, 24, 39, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              padding: theme.spacing(2, 0)
            },
          }}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            p: 0
          }}>
            {/* Header */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              px: 2,
              pt: 2,
              pb: 1
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Logo width={40} height={40} includeText={false} />
                <Typography variant="h6" sx={{ 
                  ml: 1, 
                  fontWeight: 'bold',
                  background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)' 
                    : 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Sqordia
                </Typography>
              </Box>
              <IconButton 
                onClick={handleDrawerToggle}
                sx={{ 
                  borderRadius: '50%',
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.05)' 
                    : 'rgba(0,0,0,0.05)',
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'rgba(0,0,0,0.1)',
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            
            {/* User profile quick access */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              px: 3,
              py: 2,
              mx: 2,
              mb: 2,
              borderRadius: theme.shape.borderRadius,
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.05)' 
                : 'rgba(0,0,0,0.02)'
            }}>
              <Avatar 
                alt={user.name} 
                src={user.avatar} 
                sx={{ 
                  width: 48, 
                  height: 48,
                  border: `2px solid ${theme.palette.primary.main}` 
                }}
              />
              <Box sx={{ ml: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{user.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}>
                  <Badge 
                    sx={{ 
                      '& .MuiBadge-badge': {
                        backgroundColor: user.role === 'administrator' 
                          ? theme.palette.error.main 
                          : theme.palette.primary.main,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        minWidth: 'auto',
                        p: 0
                      }
                    }}
                  />
                  {user.role === 'administrator' ? 'Administrator' : 
                   user.role === 'consultant' ? 'Consultant' : 
                   user.role === 'obnl' ? 'Non-Profit' : 'User'}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ mx: 2, mb: 1 }} />
            
            {/* Navigation */}
            <List sx={{ px: 1 }}>
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={listItemVariants}
                >
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton 
                      onClick={() => {
                        navigate(item.path);
                        setOpen(false);
                      }}
                      selected={location.pathname === item.path}
                      sx={{
                        borderRadius: 2,
                        p: 1.5,
                        transition: 'all 0.2s',
                        '&.Mui-selected': {
                          backgroundColor: theme.palette.primary.main,
                          color: '#fff',
                          '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                          },
                          '& .MuiListItemIcon-root': {
                            color: '#fff'
                          }
                        },
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255,255,255,0.1)' 
                            : 'rgba(0,0,0,0.04)'
                        }
                      }}
                    >
                      <ListItemIcon 
                        sx={{ 
                          minWidth: 40,
                          color: location.pathname === item.path 
                            ? '#fff' 
                            : theme.palette.primary.main
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 'bold' : 'normal' }}
                      />
                    </ListItemButton>
                  </ListItem>
                </motion.div>
              ))}
            </List>
            
            <Divider sx={{ my: 2, mx: 2 }} />
            
            {/* Additional features */}
            <List sx={{ px: 1 }}>
              <ListItem disablePadding>
                <ListItemButton 
                  sx={{ 
                    borderRadius: 2,
                    p: 1.5,
                    mb: 0.5
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: theme.palette.secondary.main }}>
                    <HelpIcon />
                  </ListItemIcon>
                  <ListItemText primary="Help & Support" />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding>
                <ListItemButton 
                  sx={{ 
                    borderRadius: 2,
                    p: 1.5,
                    mb: 0.5
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <LanguageSwitcher iconOnly />
                  </ListItemIcon>
                  <ListItemText primary="Language" />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={toggleDarkMode}
                  sx={{ 
                    borderRadius: 2,
                    p: 1.5,
                    mb: 0.5
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 40, 
                    color: darkMode ? theme.palette.warning.light : theme.palette.primary.main
                  }}>
                    {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                  </ListItemIcon>
                  <ListItemText primary={darkMode ? "Light Mode" : "Dark Mode"} />
                </ListItemButton>
              </ListItem>
            </List>
            
            <Box sx={{ mt: 'auto', px: 2, pb: 2 }}>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  p: 1,
                  borderRadius: 2,
                  justifyContent: 'flex-start'
                }}
              >
                {t('nav.logout')}
              </Button>
            </Box>
          </Box>
        </SwipeableDrawer>
      ) : (
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            width: open ? drawerWidth : theme.spacing(7),
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : theme.spacing(7),
              boxSizing: 'border-box',
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              boxShadow: theme.shadows[3]
            },
          }}
        >
          <Toolbar />
          <Box 
            sx={{ 
              overflow: 'auto', 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              pt: 1
            }}
          >
            <List>
              {navigationItems.map((item, index) => (
                <motion.div key={item.path} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.05 * index }}>
                  <ListItem disablePadding>
                    <Tooltip 
                      title={open ? '' : item.text} 
                      placement="right"
                      TransitionComponent={Zoom}
                    >
                      <ListItemButton 
                        onClick={() => navigate(item.path)}
                        selected={location.pathname === item.path}
                        sx={{
                          borderRadius: '0 24px 24px 0',
                          mx: 1,
                          minHeight: 48,
                          justifyContent: open ? 'initial' : 'center',
                          transition: 'all 0.2s',
                          '&.Mui-selected': {
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'primary.dark',
                            },
                            '& .MuiListItemIcon-root': {
                              color: 'white'
                            }
                          }
                        }}
                      >
                        <ListItemIcon 
                          sx={{
                            minWidth: 0,
                            mr: open ? 3 : 'auto',
                            justifyContent: 'center',
                            color: location.pathname === item.path 
                              ? 'white' 
                              : theme.palette.primary.main
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <Slide direction="right" in={open} mountOnEnter unmountOnExit>
                          <ListItemText primary={item.text} />
                        </Slide>
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                </motion.div>
              ))}
            </List>
            
            <Box sx={{ mt: 'auto' }}>
              <Divider />
              <List>
                <ListItem disablePadding>
                  <Tooltip 
                    title={open ? '' : t('nav.profile')} 
                    placement="right"
                    TransitionComponent={Zoom}
                  >
                    <ListItemButton 
                      onClick={() => navigate('/profile')}
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                      }}
                    >
                      <ListItemIcon 
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : 'auto',
                          justifyContent: 'center',
                          color: theme.palette.primary.main
                        }}
                      >
                        <AccountCircleIcon />
                      </ListItemIcon>
                      <Slide direction="right" in={open} mountOnEnter unmountOnExit>
                        <ListItemText primary={t('nav.profile')} />
                      </Slide>
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
                
                <ListItem disablePadding>
                  <Tooltip 
                    title={open ? '' : t('nav.logout')} 
                    placement="right"
                    TransitionComponent={Zoom}
                  >
                    <ListItemButton 
                      onClick={handleLogout}
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                      }}
                    >
                      <ListItemIcon 
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : 'auto',
                          justifyContent: 'center',
                          color: theme.palette.error.main
                        }}
                      >
                        <LogoutIcon />
                      </ListItemIcon>
                      <Slide direction="right" in={open} mountOnEnter unmountOnExit>
                        <ListItemText primary={t('nav.logout')} />
                      </Slide>
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              </List>
            </Box>
          </Box>
        </Drawer>
      )}
      
      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3 }, 
          width: { md: `calc(100% - ${open ? drawerWidth : theme.spacing(7)}px)` },
          ml: { md: open ? `${drawerWidth}px` : `${theme.spacing(7)}px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          pb: { xs: 7, sm: 3 }, // Add padding bottom for mobile nav
        }}
      >
        <Toolbar /> {/* Spacer */}
        
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: theme.zIndex.drawer + 2,
                backgroundColor: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(4px)'
              }}
            >
              <CircularProgress color="primary" size={60} />
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatedWrapper animation="fadeIn">
          <Outlet />
        </AnimatedWrapper>
      </Box>
      
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            zIndex: 1100,
            borderRadius: '16px 16px 0 0',
            overflow: 'hidden',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(31, 41, 55, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
          elevation={3}
        >
          <BottomNavigation
            value={mobileNavValue}
            onChange={(event, newValue) => {
              setMobileNavValue(newValue);
              switch(newValue) {
                case 0:
                  navigate('/dashboard');
                  break;
                case 1:
                  navigate('/questionnaire');
                  break;
                case 2:
                  navigate('/editor');
                  break;
                case 3:
                  navigate('/subscription');
                  break;
                case 4:
                  navigate('/profile');
                  break;
              }
            }}
            showLabels
            sx={{
              height: 64,
              '& .MuiBottomNavigationAction-root': {
                padding: '6px 0',
                minWidth: 'auto',
                '&.Mui-selected': {
                  color: theme.palette.primary.main
                }
              }
            }}
          >
            <BottomNavigationAction 
              label="Dashboard" 
              icon={
                <motion.div 
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <DashboardIcon />
                </motion.div>
              } 
            />
            <BottomNavigationAction 
              label="Questions" 
              icon={
                <motion.div 
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <AssignmentIcon />
                </motion.div>
              } 
            />
            <BottomNavigationAction 
              label="Edit" 
              icon={
                <motion.div 
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <EditIcon />
                </motion.div>
              } 
            />
            <BottomNavigationAction 
              label="Plans" 
              icon={
                <motion.div 
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <CreditCardIcon />
                </motion.div>
              } 
            />
            <BottomNavigationAction 
              label="Profile" 
              icon={
                <motion.div 
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <motion.div>
                    <Avatar 
                      src={user.avatar} 
                      alt={user.name} 
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        border: mobileNavValue === 4 ? `2px solid ${theme.palette.primary.main}` : 'none'
                      }} 
                    />
                  </motion.div>
                </motion.div>
              } 
            />
          </BottomNavigation>
        </Paper>
      )}
      
      {/* Floating Action Button for mobile */}
      {isMobile && (
        <Zoom in={true}>
          <Fab
            color="primary"
            aria-label="add business plan"
            sx={{
              position: 'fixed',
              bottom: 76, // Above the bottom navigation
              right: 16,
              boxShadow: theme.shadows[8],
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
              zIndex: 1200
            }}
            onClick={() => navigate('/questionnaire')}
          >
            <AddIcon />
          </Fab>
        </Zoom>
      )}
    </Box>
  );
};

export default MainLayout;