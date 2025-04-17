import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Link,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { motion } from 'framer-motion';

interface LoginFormInputs {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Login: React.FC = () => {
  const { t } = useTranslation();
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const onSubmit = async (data: LoginFormInputs) => {
    setLoginError(null);
    setIsLoading(true);
    dispatch(loginStart());
    
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock success response
      if (data.email === 'admin@example.com' && data.password === 'password') {
        const user = {
          id: '123',
          email: data.email,
          firstName: 'Admin',
          lastName: 'User',
          role: 'administrator' as const
        };
        
        dispatch(loginSuccess({ user, token: 'mock-jwt-token' }));
        navigate('/dashboard');
      } else if (data.email === 'user@example.com' && data.password === 'password') {
        const user = {
          id: '456',
          email: data.email,
          firstName: 'Regular',
          lastName: 'User',
          role: 'user' as const
        };
        
        dispatch(loginSuccess({ user, token: 'mock-jwt-token' }));
        navigate('/dashboard');
      } else {
        throw new Error(t('auth.invalidCredentials'));
      }
    } catch (error) {
      if (error instanceof Error) {
        dispatch(loginFailure(error.message));
        setLoginError(error.message);
      } else {
        dispatch(loginFailure(t('common.error')));
        setLoginError(t('common.error'));
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box>
        <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
          {t('auth.signIn')}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('auth.welcomeBack')}
        </Typography>
        
        {loginError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {loginError}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
          <Controller
            name="email"
            control={control}
            rules={{
              required: t('auth.requiredField'),
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: t('auth.invalidEmail')
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                id="email"
                label={t('auth.email')}
                autoComplete="email"
                autoFocus
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
          
          <Controller
            name="password"
            control={control}
            rules={{
              required: t('auth.requiredField'),
              minLength: {
                value: 6,
                message: t('auth.passwordMinLength')
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                label={t('auth.password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Controller
              name="rememberMe"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} color="primary" />}
                  label={t('auth.rememberMe')}
                />
              )}
            />
            
            <Link component={RouterLink} to="/forgot-password" variant="body2">
              {t('auth.forgotPassword')}
            </Link>
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : t('auth.signIn')}
          </Button>
          
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t('common.or')}
            </Typography>
          </Divider>
          
          <Grid container justifyContent="center">
            <Grid item>
              <Typography variant="body2">
                {t('auth.dontHaveAccount')}{' '}
                <Link component={RouterLink} to="/register" variant="body2">
                  {t('auth.createAccount')}
                </Link>
              </Typography>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {t('auth.demoCredentials')}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
              <Box>
                <Typography variant="caption">{t('auth.admin')}</Typography>
                <Typography variant="caption" display="block">admin@example.com / password</Typography>
              </Box>
              <Box>
                <Typography variant="caption">{t('auth.user')}</Typography>
                <Typography variant="caption" display="block">user@example.com / password</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default Login;