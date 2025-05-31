import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import AuthProvider from './context/AuthProvider';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Profile from './pages/Profile';
import QuestionnaireWizard from './pages/QuestionnaireWizard';
import BusinessPlanEditor from './pages/BusinessPlanEditor';
import SubscriptionPlans from './pages/SubscriptionPlans';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from './pages/NotFound';

// Components
import PageTransition from './components/PageTransition';
import ScrollToTop from './components/ScrollToTop';
import { useAuth } from './context/AuthProvider';

// Theme and darkmode configuration
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Blue
    },
    secondary: {
      main: '#6366f1', // Indigo
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          transition: 'all 0.3s ease'
        }
      }
    }
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6', // Lighter blue for dark mode
    },
    secondary: {
      main: '#818cf8', // Lighter indigo for dark mode
    },
    background: {
      default: '#111827',
      paper: '#1f2937',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          transition: 'all 0.3s ease'
        }
      }
    }
  },
});

// ProtectedRoute component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    // You could render a loading spinner here
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    // Redirect to login, but save the current location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// AdminRoute component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'administrator') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Create a context for the dark mode
export const ThemeContext = React.createContext({
  darkMode: false,
  toggleDarkMode: () => {}
});

// AppContent component to handle page transitions
const AppContent = ({ darkMode, toggleDarkMode }: { darkMode: boolean, toggleDarkMode: () => void }) => {
  const location = useLocation();
  
  return (
    <>
      <PageTransition location={location.pathname}>
        <Routes>
          {/* Public home route */}
          <Route path="/" element={<Home />} />
          
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>
          
          {/* Protected routes */}
          <Route element={<MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/questionnaire" element={<QuestionnaireWizard />} />
            <Route path="/editor" element={<BusinessPlanEditor />} />
            <Route path="/subscription" element={<SubscriptionPlans />} />
            
            {/* Admin routes */}
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Route>
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
      
      {/* Global scroll to top button */}
      <ScrollToTop 
        position={{ 
          bottom: { xs: 80, sm: 30 }, 
          right: 30 
        }}
        threshold={300}
        zIndex={1100}
      />
    </>
  );
};

function App() {
  const [darkMode, setDarkMode] = useState(false);
  
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const theme = darkMode ? darkTheme : lightTheme;

  // Check for saved dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
    }
  }, []);

  // Save dark mode preference when it changes
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Set auth in local storage to bypass login
  React.useEffect(() => {
    localStorage.setItem('auth', 'true');
    localStorage.setItem('role', 'admin'); // Set as admin to see all features
  }, []);

  const themeContextValue = {
    darkMode,
    toggleDarkMode
  };

  return (
    <Provider store={store}>
      <ThemeContext.Provider value={themeContextValue}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <Router>
              <AppContent darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </ThemeContext.Provider>
    </Provider>
  );
}

export default App;