import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Switch,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  useTheme,
  Skeleton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  PhotoCamera as PhotoCameraIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Error as ErrorIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, CheckCircle2, MailCheck, MailX, ShieldCheck, ShieldX, Upload, RefreshCw } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { updateProfile, changePassword } from '../api/auth';
import { updateUserProfile } from '../store/slices/authSlice';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
  phone: string;
  bio: string;
}

interface SecurityFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const isLoading = useSelector((state: RootState) => state.auth.loading);
  
  // State
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [profileUpdated, setProfileUpdated] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [openAvatarDialog, setOpenAvatarDialog] = useState(false);
  
  // File input ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Default placeholder avatar URL
  const placeholderAvatar = "";
  
  // Form setup
  const { control: profileControl, handleSubmit: handleProfileSubmit, reset: resetProfileForm, formState: { errors: profileErrors, isDirty: isProfileDirty } } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      company: user?.company || '',
      jobTitle: user?.jobTitle || '',
      phone: user?.phone || '',
      bio: user?.bio || ''
    }
  });
  
  const { control: securityControl, handleSubmit: handleSecuritySubmit, reset: resetSecurityForm, watch: watchSecurity, formState: { errors: securityErrors } } = useForm<SecurityFormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });
  
  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      resetProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        company: user.company || '',
        jobTitle: user.jobTitle || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
    }
  }, [user, resetProfileForm]);
  
  const newPassword = watchSecurity('newPassword');
  
  // Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleEditToggle = () => {
    setEditMode(!editMode);
    
    // If canceling edit, reset form to current user values
    if (editMode) {
      resetProfileForm({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        company: user?.company || '',
        jobTitle: user?.jobTitle || '',
        phone: user?.phone || '',
        bio: user?.bio || ''
      });
    }
  };
  
  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;
    
    setSaving(true);
    setProfileUpdated(false);
    
    try {
      const { user: updatedUser, error } = await updateProfile(user.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        jobTitle: data.jobTitle,
        phone: data.phone,
        bio: data.bio
      });
      
      if (error) throw error;
      
      if (updatedUser) {
        dispatch(updateUserProfile({
          userId: user.id,
          updates: updatedUser
        }));
        setEditMode(false);
        setProfileUpdated(true);
        
        // Hide success message after a delay
        setTimeout(() => {
          setProfileUpdated(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    // Validate file type
    const fileType = file.type;
    if (!fileType.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      setAvatarError('Please upload an image file (JPEG, PNG, GIF, or WebP)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image file is too large. Maximum size is 5MB');
      return;
    }
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
      setOpenAvatarDialog(true);
    };
    reader.readAsDataURL(file);
    
    // Reset errors
    setAvatarError(null);
  };
  
  const handleOpenFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleAvatarUpload = async () => {
    if (!avatarPreview || !user?.id || !fileInputRef.current?.files?.[0]) return;

    const file = fileInputRef.current.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    setUploadingAvatar(true);
    setAvatarError(null);
    setUploadProgress(0);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload the file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) throw uploadError;
      
      setUploadProgress(95);
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
        
      // Update user profile with the avatar URL
      const { user: updatedUser, error: updateError } = await updateProfile(user.id, {
        avatarUrl: urlData.publicUrl
      });
      
      if (updateError) throw updateError;
      
      // Update Redux store
      if (updatedUser) {
        dispatch(updateUserProfile({
          userId: user.id,
          updates: updatedUser
        }));
        setProfileUpdated(true);
        setTimeout(() => {
          setProfileUpdated(false);
        }, 5000);
      }
      
      // Close dialog
      setOpenAvatarDialog(false);
      setAvatarPreview(null);
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setAvatarError('Failed to upload profile picture. Please try again.');
    } finally {
      setUploadingAvatar(false);
      setUploadProgress(0);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleCancelAvatarUpload = () => {
    setOpenAvatarDialog(false);
    setAvatarPreview(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const onSecuritySubmit = async (data: SecurityFormData) => {
    setSaving(true);
    setPasswordChanged(false);
    setPasswordError(null);
    
    try {
      const { error } = await changePassword(data.currentPassword, data.newPassword);
      
      if (error) throw error;
      
      setPasswordChanged(true);
      resetSecurityForm();
      
      // Hide success message after a delay
      setTimeout(() => {
        setPasswordChanged(false);
      }, 5000);
    } catch (error) {
      if (error instanceof Error) {
        setPasswordError(error.message);
      } else {
        setPasswordError('An error occurred while changing your password');
      }
    } finally {
      setSaving(false);
    }
  };
  
  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };
  
  const handleDeleteAccount = () => {
    setDeleteLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setDeleteLoading(false);
      setOpenDeleteDialog(false);
      navigate('/login');
    }, 2000);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get user initials for avatar placeholder
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    } else if (user?.firstName) {
      return user.firstName.charAt(0);
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Show loading state when fetching user data
  if (isLoading && !user) {
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton variant="text" width="250px" height={60} />
        <Skeleton variant="text" width="400px" height={30} />
        
        <Paper sx={{ mt: 2, mb: 4 }}>
          <Skeleton variant="rectangular" height={60} />
          
          <Box sx={{ p: 3 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Skeleton variant="circular" width={128} height={128} sx={{ mx: 'auto', mb: 2 }} />
                    <Skeleton variant="text" width="80%" sx={{ mx: 'auto' }} />
                    <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
                    <Skeleton variant="rounded" width="40%" height={24} sx={{ mx: 'auto', mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="200px" height={32} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={2} sx={{ mb: 3 }} />
                    
                    <Grid container spacing={2}>
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <Grid item xs={12} sm={item % 2 ? 6 : 12} key={item}>
                          <Skeleton variant="rectangular" height={56} />
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Profile Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="profile tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Profile" />
          <Tab label="Security" />
          <Tab label="Notifications" />
        </Tabs>
        
        {/* Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant={editMode ? "contained" : "outlined"}
              startIcon={editMode ? <SaveIcon /> : <EditIcon />}
              onClick={editMode ? handleProfileSubmit(onProfileSubmit) : handleEditToggle}
              disabled={saving || (editMode && !isProfileDirty)}
            >
              {saving ? <CircularProgress size={24} /> : (editMode ? 'Save Changes' : 'Edit Profile')}
            </Button>
          </Box>
          
          {profileUpdated && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Profile updated successfully
            </Alert>
          )}
          
          {avatarError && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setAvatarError(null)}>
              {avatarError}
            </Alert>
          )}
          
          <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
            <Grid container spacing={4}>
              {/* Profile Photo */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          <Tooltip title="Change profile picture">
                            <IconButton 
                              sx={{
                                bgcolor: theme.palette.primary.main,
                                color: 'white',
                                '&:hover': {
                                  bgcolor: theme.palette.primary.dark,
                                },
                                border: `2px solid ${theme.palette.background.paper}`,
                                width: 32,
                                height: 32
                              }}
                              onClick={handleOpenFileSelect}
                              disabled={uploadingAvatar}
                            >
                              {uploadingAvatar ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                <PhotoCameraIcon sx={{ fontSize: 16 }} />
                              )}
                            </IconButton>
                          </Tooltip>
                        }
                      >
                        <Avatar
                          src={user?.avatarUrl || placeholderAvatar}
                          alt={user?.firstName ? `${user.firstName} ${user.lastName}` : 'User Profile'}
                          sx={{ 
                            width: 128, 
                            height: 128,
                            bgcolor: user?.avatarUrl ? 'transparent' : theme.palette.primary.main,
                            fontSize: '3rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {!user?.avatarUrl && getUserInitials()}
                        </Avatar>
                      </Badge>
                      
                      {/* Hidden file input */}
                      <input
                        type="file"
                        hidden
                        ref={fileInputRef}
                        accept="image/jpeg, image/png, image/gif, image/webp"
                        onChange={handleAvatarSelect}
                      />
                    </Box>
                    
                    <Typography variant="h6" gutterBottom>
                      {user?.firstName} {user?.lastName}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {user?.email}
                    </Typography>
                    
                    <Chip 
                      label={user?.role === 'user' ? 'User' : 
                             user?.role === 'consultant' ? 'Consultant' : 
                             user?.role === 'obnl' ? 'Non-profit' : 'Administrator'}
                      color={user?.role === 'administrator' ? 'error' : 
                             user?.role === 'consultant' ? 'info' : 'default'}
                      size="small"
                    />
                    
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CloudUploadIcon />}
                        onClick={handleOpenFileSelect}
                      >
                        Upload New Picture
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Profile Details */}
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Personal Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="firstName"
                          control={profileControl}
                          rules={{ required: 'First name is required' }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="First Name"
                              fullWidth
                              disabled={!editMode}
                              error={!!profileErrors.firstName}
                              helperText={profileErrors.firstName?.message}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="lastName"
                          control={profileControl}
                          rules={{ required: 'Last name is required' }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Last Name"
                              fullWidth
                              disabled={!editMode}
                              error={!!profileErrors.lastName}
                              helperText={profileErrors.lastName?.message}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Controller
                          name="email"
                          control={profileControl}
                          rules={{ 
                            required: 'Email is required',
                            pattern: {
                              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                              message: 'Please enter a valid email address'
                            }
                          }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Email Address"
                              fullWidth
                              disabled={true} // Email can't be changed
                              error={!!profileErrors.email}
                              helperText={profileErrors.email?.message}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="company"
                          control={profileControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Company"
                              fullWidth
                              disabled={!editMode}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="jobTitle"
                          control={profileControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Job Title"
                              fullWidth
                              disabled={!editMode}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Controller
                          name="phone"
                          control={profileControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Phone Number"
                              fullWidth
                              disabled={!editMode}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Controller
                          name="bio"
                          control={profileControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Bio"
                              fullWidth
                              multiline
                              rows={4}
                              disabled={!editMode}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
        
        {/* Security Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Change Password
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  {passwordChanged && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                      Password changed successfully
                    </Alert>
                  )}
                  
                  {passwordError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {passwordError}
                    </Alert>
                  )}
                  
                  <form onSubmit={handleSecuritySubmit(onSecuritySubmit)}>
                    <Controller
                      name="currentPassword"
                      control={securityControl}
                      rules={{ required: 'Current password is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Current Password"
                          type={showCurrentPassword ? 'text' : 'password'}
                          fullWidth
                          margin="normal"
                          error={!!securityErrors.currentPassword}
                          helperText={securityErrors.currentPassword?.message}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                  edge="end"
                                >
                                  {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                    
                    <Controller
                      name="newPassword"
                      control={securityControl}
                      rules={{ 
                        required: 'New password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters'
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                          message: 'Password must include uppercase, lowercase, number and special character'
                        }
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="New Password"
                          type={showNewPassword ? 'text' : 'password'}
                          fullWidth
                          margin="normal"
                          error={!!securityErrors.newPassword}
                          helperText={securityErrors.newPassword?.message}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  edge="end"
                                >
                                  {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                    
                    <Controller
                      name="confirmPassword"
                      control={securityControl}
                      rules={{ 
                        required: 'Please confirm your password',
                        validate: value => value === newPassword || 'Passwords do not match'
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Confirm New Password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          fullWidth
                          margin="normal"
                          error={!!securityErrors.confirmPassword}
                          helperText={securityErrors.confirmPassword?.message}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  edge="end"
                                >
                                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                    
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{ mt: 3 }}
                      disabled={saving}
                    >
                      {saving ? <CircularProgress size={24} /> : 'Change Password'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Two-Factor Authentication
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ShieldX size={24} color={theme.palette.error.main} />
                    <Typography variant="body1" sx={{ ml: 2 }}>
                      Two-factor authentication is disabled
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="outlined"
                    color="primary"
                  >
                    Enable Two-Factor Authentication
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sessions
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Session Timeout</InputLabel>
                    <Select
                      value="30"
                      label="Session Timeout"
                    >
                      <MenuItem value="15">15 minutes</MenuItem>
                      <MenuItem value="30">30 minutes</MenuItem>
                      <MenuItem value="60">1 hour</MenuItem>
                      <MenuItem value="120">2 hours</MenuItem>
                      <MenuItem value="240">4 hours</MenuItem>
                    </Select>
                    <FormHelperText>
                      You will be automatically logged out after this period of inactivity
                    </FormHelperText>
                  </FormControl>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Last password change:</strong> {user?.lastPasswordChange 
                        ? formatDate(user.lastPasswordChange)
                        : 'Not available'}
                    </Typography>
                    
                    <Button 
                      variant="outlined" 
                      color="secondary"
                      sx={{ mt: 1 }}
                    >
                      Sign Out All Devices
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ color: theme.palette.error.main }}>
                    Danger Zone
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1">Delete Account</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Once you delete your account, there is no going back. Please be certain.
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleOpenDeleteDialog}
                    >
                      Delete Account
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={2}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Email Notifications
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={true} 
                          color="primary"
                        />
                      }
                      label="Receive email notifications"
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Receive emails for:
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={true} 
                          color="primary"
                        />
                      }
                      label="Account updates and security alerts"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={false} 
                          color="primary"
                        />
                      }
                      label="Marketing and promotional offers"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={true} 
                          color="primary"
                        />
                      }
                      label="Weekly newsletter and tips"
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      In-App Notifications
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={true} 
                          color="primary"
                        />
                      }
                      label="Receive in-app notifications"
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      SMS Notifications
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={false} 
                          color="primary"
                        />
                      }
                      label="Receive SMS notifications"
                    />
                    
                    <Typography variant="body2" color="text.secondary">
                      Standard message rates may apply
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
            >
              Save Notification Preferences
            </Button>
          </Box>
        </TabPanel>
      </Paper>
      
      {/* Avatar Preview Dialog */}
      <Dialog 
        open={openAvatarDialog} 
        onClose={handleCancelAvatarUpload}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Set Profile Picture</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            {avatarPreview && (
              <Box sx={{ mb: 2, mt: 1 }}>
                <Avatar 
                  src={avatarPreview} 
                  alt="Preview"
                  sx={{ 
                    width: 150, 
                    height: 150, 
                    mx: 'auto',
                    border: `3px solid ${theme.palette.primary.main}`
                  }}
                />
              </Box>
            )}
            
            {uploadingAvatar && (
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                <CircularProgress 
                  variant="determinate" 
                  value={uploadProgress} 
                  size={40} 
                  sx={{ color: theme.palette.primary.main }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    component="div"
                    color="text.secondary"
                  >
                    {`${Math.round(uploadProgress)}%`}
                  </Typography>
                </Box>
              </Box>
            )}
            
            {avatarError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setAvatarError(null)}>
                {avatarError}
              </Alert>
            )}
            
            <Typography variant="body2" color="text.secondary">
              This will be displayed on your profile and in your contributions across the platform.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAvatarUpload} disabled={uploadingAvatar}>
            Cancel
          </Button>
          <Button 
            onClick={handleAvatarUpload} 
            color="primary" 
            variant="contained"
            disabled={uploadingAvatar}
            startIcon={uploadingAvatar ? <CircularProgress size={16} /> : <CloudUploadIcon />}
          >
            {uploadingAvatar ? 'Uploading...' : 'Set as Profile Picture'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Account Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
          </DialogContentText>
          <DialogContentText paragraph>
            To confirm, please type <strong>DELETE</strong> below:
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            placeholder="Type DELETE to confirm"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount}
            color="error"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;