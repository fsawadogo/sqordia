import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  InputAdornment,
  IconButton,
  Link,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface RegisterFormInputs {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  accountType: 'user' | 'consultant' | 'obnl';
  companyName?: string;
  jobTitle?: string;
}

const Register: React.FC = () => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const { control, handleSubmit, watch, formState: { errors, isValid, isDirty } } = useForm<RegisterFormInputs>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      accountType: 'user',
      companyName: '',
      jobTitle: ''
    },
    mode: 'onChange'
  });
  
  const password = watch('password');
  const accountType = watch('accountType');
  
  const steps = [
    t('auth.steps.account'),
    t('auth.steps.personal'),
    t('auth.steps.complete')
  ];
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const onSubmit = async (data: RegisterFormInputs) => {
    setRegistrationError(null);
    setIsLoading(true);
    
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock success
      console.log('Registration data:', data);
      navigate('/login');
    } catch (error) {
      if (error instanceof Error) {
        setRegistrationError(error.message);
      } else {
        setRegistrationError(t('common.error'));
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return !errors.email && !errors.password && !errors.confirmPassword && 
                !!watch('email') && !!watch('password') && !!watch('confirmPassword');
      case 1:
        return !errors.firstName && !errors.lastName && 
                !!watch('firstName') && !!watch('lastName') && 
                (accountType !== 'user' ? !!watch('companyName') : true);
      default:
        return true;
    }
  };
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <Box>
        <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
          {t('auth.createAccount')}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('auth.startWithSqordia')}
        </Typography>
        
        {registrationError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {registrationError}
          </Alert>
        )}
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {activeStep === 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box>
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
                      value: 8,
                      message: t('auth.passwordMinLength')
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message: t('auth.passwordRequirements')
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
                
                <Controller
                  name="confirmPassword"
                  control={control}
                  rules={{
                    required: t('auth.requiredField'),
                    validate: value => value === password || t('auth.passwordsDoNotMatch')
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      margin="normal"
                      required
                      fullWidth
                      label={t('auth.confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle confirm password visibility"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
            </motion.div>
          )}
          
          {activeStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="firstName"
                      control={control}
                      rules={{ required: t('auth.requiredField') }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          autoComplete="given-name"
                          required
                          fullWidth
                          id="firstName"
                          label={t('auth.firstName')}
                          error={!!errors.firstName}
                          helperText={errors.firstName?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="lastName"
                      control={control}
                      rules={{ required: t('auth.requiredField') }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          required
                          fullWidth
                          id="lastName"
                          label={t('auth.lastName')}
                          autoComplete="family-name"
                          error={!!errors.lastName}
                          helperText={errors.lastName?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                
                <FormControl component="fieldset" margin="normal" fullWidth>
                  <FormLabel component="legend">{t('auth.accountType')}</FormLabel>
                  <Controller
                    name="accountType"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup row {...field}>
                        <FormControlLabel value="user" control={<Radio />} label={t('auth.individual')} />
                        <FormControlLabel value="consultant" control={<Radio />} label={t('auth.consultant')} />
                        <FormControlLabel value="obnl" control={<Radio />} label={t('auth.nonProfit')} />
                      </RadioGroup>
                    )}
                  />
                </FormControl>
                
                {(accountType === 'consultant' || accountType === 'obnl') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <Controller
                      name="companyName"
                      control={control}
                      rules={{ required: accountType !== 'user' ? t('auth.requiredField') : false }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          margin="normal"
                          required={accountType !== 'user'}
                          fullWidth
                          id="companyName"
                          label={t('auth.companyName')}
                          error={!!errors.companyName}
                          helperText={errors.companyName?.message}
                        />
                      )}
                    />
                    
                    <Controller
                      name="jobTitle"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          margin="normal"
                          fullWidth
                          id="jobTitle"
                          label={t('auth.jobTitle')}
                          error={!!errors.jobTitle}
                          helperText={errors.jobTitle?.message}
                        />
                      )}
                    />
                  </motion.div>
                )}
              </Box>
            </motion.div>
          )}
          
          {activeStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  {t('auth.almostThere')}
                </Alert>
                
                <Typography variant="h6" gutterBottom>
                  {t('auth.accountSummary')}
                </Typography>
                
                <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">{t('auth.email')}</Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>{watch('email')}</Typography>
                      
                      <Typography variant="subtitle2" color="text.secondary">{t('auth.accountType')}</Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {accountType === 'user' ? t('auth.individual') : 
                        accountType === 'consultant' ? t('auth.consultant') : t('auth.nonProfit')}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">{t('common.name')}</Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {watch('firstName')} {watch('lastName')}
                      </Typography>
                      
                      {(accountType === 'consultant' || accountType === 'obnl') && (
                        <>
                          <Typography variant="subtitle2" color="text.secondary">{t('auth.companyName')}</Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>{watch('companyName')}</Typography>
                          
                          {watch('jobTitle') && (
                            <>
                              <Typography variant="subtitle2" color="text.secondary">{t('auth.jobTitle')}</Typography>
                              <Typography variant="body1" sx={{ mb: 2 }}>{watch('jobTitle')}</Typography>
                            </>
                          )}
                        </>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
                
                <FormHelperText>
                  {t('auth.termsAgreement')}
                </FormHelperText>
              </Box>
            </motion.div>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="text"
            >
              {t('common.back')}
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                type="submit"
                disabled={isLoading}
                sx={{ minWidth: 150 }}
              >
                {isLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  t('auth.completeRegistration')
                )}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid(activeStep)}
              >
                {t('common.next')}
              </Button>
            )}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container justifyContent="center">
            <Grid item>
              <Typography variant="body2">
                {t('auth.alreadyHaveAccount')}{' '}
                <Link component={RouterLink} to="/login" variant="body2">
                  {t('auth.signIn')}
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </motion.div>
  );
};

export default Register;