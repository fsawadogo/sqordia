import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Link,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface ForgotPasswordFormInputs {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormInputs>({
    defaultValues: {
      email: '',
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const onSubmit = async (data: ForgotPasswordFormInputs) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock success
      setIsSubmitted(true);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(t('common.error'));
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
          {t('auth.resetPassword')}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {t('auth.resetPasswordInstructions')}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {isSubmitted ? (
          <Box sx={{ mt: 3 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              {t('auth.passwordResetSent')}
            </Alert>
            
            <Typography variant="body2" paragraph>
              {t('auth.passwordResetNote')}
            </Typography>
            
            <Button
              component={RouterLink}
              to="/login"
              startIcon={<ArrowBack />}
              sx={{ mt: 2 }}
            >
              {t('auth.backToLogin')}
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 2 }}>
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
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : t('auth.sendResetInstructions')}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link component={RouterLink} to="/login" variant="body2">
                {t('auth.rememberPassword')}
              </Link>
            </Box>
          </Box>
        )}
      </Box>
    </motion.div>
  );
};

export default ForgotPassword;