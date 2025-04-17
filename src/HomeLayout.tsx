import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Tooltip,
  Zoom,
  Paper,
  Badge
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  KeyboardArrowDown as KeyboardArrowDownIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { Brain } from 'lucide-react';
import LanguageSwitcher from './components/LanguageSwitcher';
import Logo from './components/Logo';

interface HomeLayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({ children, darkMode, toggleDarkMode }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  const navItems = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.features'), path: '/#features' },
    { label: t('nav.pricing'), path: '/#pricing' },
    { label: t('nav.businessPlan'), path: '/dashboard' },
  ];
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="sticky" 
        color="default" 
        elevation={0} 
        sx={{ 
          backgroundColor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          transition: 'background-color 0.3s ease'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ py: 1 }}>
            <RouterLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Logo width={140} height={40} />
            </RouterLink>
            
            <Box sx={{ flexGrow: 1 }} />
            
            {!isMobile && (
              <Stack direction="row" spacing={1} sx={{ mr: 2 }}>
                {navItems.map((item) => (
                  <Button 
                    key={item.label} 
                    component={RouterLink} 
                    to={item.path}
                    color="inherit"
                    sx={{ 
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      color: theme.palette.text.primary,
                      '&:hover': {
                        color: theme.palette.primary.main,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Stack>
            )}
            
            <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} TransitionComponent={Zoom}>
              <IconButton 
                color="inherit" 
                onClick={toggleDarkMode}
                sx={{
                  mr: 1,
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
            
            <LanguageSwitcher />
            
            {isMobile ? (
              <>
                <IconButton 
                  color="inherit" 
                  aria-label="open drawer" 
                  edge="start" 
                  onClick={() => setMobileMenuOpen(true)}
                  sx={{ 
                    ml: 1,
                    color: theme.palette.text.primary,
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.05)',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <MenuIcon />
                </IconButton>
                
                <Drawer
                  anchor="right"
                  open={mobileMenuOpen}
                  onClose={() => setMobileMenuOpen(false)}
                  PaperProps={{
                    sx: {
                      width: 250,
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(17, 24, 39, 0.95)' 
                        : 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  <Box
                    sx={{ width: 250, pt: 2 }}
                    role="presentation"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      px: 2, 
                      pb: 1,
                      mb: 1,
                      borderBottom: `1px solid ${theme.palette.divider}`
                    }}>
                      <Logo width={110} height={32} />
                    </Box>
                    
                    <List sx={{ px: 1 }}>
                      {navItems.map((item) => (
                        <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemButton 
                            component={RouterLink} 
                            to={item.path}
                            sx={{
                              py: 1.5,
                              px: 2,
                              borderRadius: 2,
                              '&:hover': {
                                backgroundColor: theme.palette.mode === 'dark' 
                                  ? 'rgba(255,255,255,0.1)' 
                                  : 'rgba(0,0,0,0.04)'
                              }
                            }}
                          >
                            <ListItemText 
                              primary={item.label}
                              primaryTypographyProps={{ 
                                fontWeight: 500,
                                color: theme.palette.text.primary
                              }} 
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <ListItem disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton 
                          component={RouterLink} 
                          to="/login"
                          sx={{
                            py: 1.5,
                            px: 2,
                            borderRadius: 2,
                            '&:hover': {
                              backgroundColor: theme.palette.mode === 'dark' 
                                ? 'rgba(255,255,255,0.1)' 
                                : 'rgba(0,0,0,0.04)'
                            }
                          }}
                        >
                          <ListItemText 
                            primary={t('auth.signIn')} 
                            primaryTypographyProps={{ 
                              fontWeight: 500,
                              color: theme.palette.text.primary
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                      
                      <ListItem disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton 
                          component={RouterLink} 
                          to="/register"
                          sx={{ 
                            py: 1.5,
                            px: 2,
                            borderRadius: 2,
                            bgcolor: theme.palette.primary.main,
                            color: 'white',
                            '&:hover': {
                              bgcolor: theme.palette.primary.dark,
                            }
                          }}
                        >
                          <ListItemText 
                            primary={t('auth.signUp')}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItemButton>
                      </ListItem>
                    </List>
                  </Box>
                </Drawer>
              </>
            ) : (
              <>
                <Button 
                  component={RouterLink} 
                  to="/login" 
                  color="inherit"
                  sx={{ 
                    fontWeight: 500, 
                    mr: 2,
                    color: theme.palette.text.primary,
                    '&:hover': {
                      color: theme.palette.primary.main,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {t('auth.signIn')}
                </Button>
                
                <Button 
                  component={RouterLink} 
                  to="/register" 
                  variant="contained"
                  sx={{ 
                    fontWeight: 500,
                    boxShadow: theme.shadows[4],
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {t('auth.signUp')}
                </Button>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      
      <Box 
        component="footer" 
        sx={{ 
          py: 8, 
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(17, 24, 39, 0.9)' : 'rgba(241, 245, 249, 0.9)',
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 2 }}>
                <Logo width={160} height={48} />
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t('appTagline')}
              </Typography>
              <Stack direction="row" spacing={1}>
                {/* Social media icons would go here */}
              </Stack>
            </Grid>
            
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                {t('footer.product')}
              </Typography>
              <List disablePadding>
                <ListItem disablePadding>
                  <Link href="#features" color="inherit" underline="hover">
                    <Typography variant="body2">{t('footer.features')}</Typography>
                  </Link>
                </ListItem>
                <ListItem disablePadding>
                  <Link href="#pricing" color="inherit" underline="hover">
                    <Typography variant="body2">{t('footer.pricing')}</Typography>
                  </Link>
                </ListItem>
                <ListItem disablePadding>
                  <Link href="#" color="inherit" underline="hover">
                    <Typography variant="body2">{t('footer.templates')}</Typography>
                  </Link>
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                {t('footer.company')}
              </Typography>
              <List disablePadding>
                <ListItem disablePadding>
                  <Link href="#" color="inherit" underline="hover">
                    <Typography variant="body2">{t('footer.about')}</Typography>
                  </Link>
                </ListItem>
                <ListItem disablePadding>
                  <Link href="#" color="inherit" underline="hover">
                    <Typography variant="body2">{t('footer.blog')}</Typography>
                  </Link>
                </ListItem>
                <ListItem disablePadding>
                  <Link href="#" color="inherit" underline="hover">
                    <Typography variant="body2">{t('footer.careers')}</Typography>
                  </Link>
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                {t('footer.resources')}
              </Typography>
              <List disablePadding>
                <ListItem disablePadding>
                  <Link href="#" color="inherit" underline="hover">
                    <Typography variant="body2">{t('footer.help')}</Typography>
                  </Link>
                </ListItem>
                <ListItem disablePadding>
                  <Link href="#" color="inherit" underline="hover">
                    <Typography variant="body2">{t('footer.support')}</Typography>
                  </Link>
                </ListItem>
                <ListItem disablePadding>
                  <Link href="#" color="inherit" underline="hover">
                    <Typography variant="body2">{t('footer.contact')}</Typography>
                  </Link>
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                {t('footer.legal')}
              </Typography>
              <List disablePadding>
                <ListItem disablePadding>
                  <Link href="#" color="inherit" underline="hover">
                    <Typography variant="body2">{t('footer.terms')}</Typography>
                  </Link>
                </ListItem>
                <ListItem disablePadding>
                  <Link href="#" color="inherit" underline="hover">
                    <Typography variant="body2">{t('footer.privacy')}</Typography>
                  </Link>
                </ListItem>
                <ListItem disablePadding>
                  <Link href="#" color="inherit" underline="hover">
                    <Typography variant="body2">{t('footer.cookies')}</Typography>
                  </Link>
                </ListItem>
              </List>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Sqordia. {t('footer.allRightsReserved')}.
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 3 }}>
              <Link href="#" color="inherit" underline="hover">
                <Typography variant="body2">{t('footer.terms')}</Typography>
              </Link>
              <Link href="#" color="inherit" underline="hover">
                <Typography variant="body2">{t('footer.privacy')}</Typography>
              </Link>
              <Link href="#" color="inherit" underline="hover">
                <Typography variant="body2">{t('footer.cookies')}</Typography>
              </Link>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

// Add missing Grid component
const Grid = ({ container, item, xs, sm, md, spacing, children, sx }: any) => {
  return (
    <Box
      sx={{
        display: container ? 'flex' : 'block',
        flexWrap: container ? 'wrap' : 'nowrap',
        width: '100%',
        ...(container && spacing && { margin: -1 * (spacing / 2) }),
        ...(item && xs && { flexBasis: `${(xs / 12) * 100}%`, maxWidth: `${(xs / 12) * 100}%` }),
        ...(item && sm && { '@media (min-width: 600px)': { flexBasis: `${(sm / 12) * 100}%`, maxWidth: `${(sm / 12) * 100}%` } }),
        ...(item && md && { '@media (min-width: 900px)': { flexBasis: `${(md / 12) * 100}%`, maxWidth: `${(md / 12) * 100}%` } }),
        ...(container && spacing && { '& > *': { padding: spacing / 2 } }),
        ...sx
      }}
    >
      {children}
    </Box>
  );
};

export default HomeLayout;