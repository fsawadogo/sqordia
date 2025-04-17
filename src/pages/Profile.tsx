import React, { useState } from 'react';
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
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  PhotoCamera as PhotoCameraIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Check as CheckIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, CheckCircle2, MailCheck, MailX, ShieldCheck, ShieldX } from 'lucide-react';

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
  
  // Mock user data
  const [userData] = useState({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    company: 'Acme Corporation',
    jobTitle: 'VP of Marketing',
    phone: '(555) 123-4567',
    bio: 'Marketing professional with 10+ years of experience in the technology sector.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80',
    role: 'user',
    // Settings
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    emailPreferences: {
      updates: true,
      marketing: false,
      newsletter: true
    },
    security: {
      twoFactor: false,
      sessionTimeout: '30',
      lastPasswordChange: '2025-04-15T10:30:00Z'
    }
  });
  
  // Form setup
  const { control: profileControl, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      company: userData.company,
      jobTitle: userData.jobTitle,
      phone: userData.phone,
      bio: userData.bio
    }
  });
  
  const { control: securityControl, handleSubmit: handleSecuritySubmit, reset: resetSecurityForm, watch: watchSecurity, formState: { errors: securityErrors } } = useForm<SecurityFormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });
  
  const newPassword = watchSecurity('newPassword');
  
  // Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleEditToggle = () => {
    setEditMode(!editMode);
  };
  
  const onProfileSubmit = (data: ProfileFormData) => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Profile data:', data);
      setEditMode(false);
      setSaving(false);
    }, 1500);
  };
  
  const onSecuritySubmit = (data: SecurityFormData) => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Security data:', data);
      setSaving(false);
      setPasswordChanged(true);
      resetSecurityForm();
      
      // Hide success message after a delay
      setTimeout(() => {
        setPasswordChanged(false);
      }, 5000);
    }, 1500);
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
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : (editMode ? 'Save Changes' : 'Edit Profile')}
            </Button>
          </Box>
          
          <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
            <Grid container spacing={4}>
              {/* Profile Photo */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <Avatar
                        src={userData.avatarUrl}
                        alt={`${userData.firstName} ${userData.lastName}`}
                        sx={{ width: 128, height: 128, mb: 2 }}
                      />
                      {editMode && (
                        <IconButton
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 0,
                            backgroundColor: 'background.paper',
                            '&:hover': { backgroundColor: 'background.default' },
                          }}
                          aria-label="change profile picture"
                          component="label"
                        >
                          <input hidden accept="image/*" type="file" />
                          <PhotoCameraIcon />
                        </IconButton>
                      )}
                    </Box>
                    
                    <Typography variant="h6" gutterBottom>
                      {userData.firstName} {userData.lastName}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {userData.email}
                    </Typography>
                    
                    <Chip 
                      label={userData.role === 'user' ? 'User' : 
                             userData.role === 'consultant' ? 'Consultant' : 
                             userData.role === 'obnl' ? 'Non-profit' : 'Administrator'}
                      color={userData.role === 'administrator' ? 'error' : 
                             userData.role === 'consultant' ? 'info' : 'default'}
                      size="small"
                    />
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
                              disabled={!editMode}
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
                    {userData.security.twoFactor ? (
                      <ShieldCheck size={24} color={theme.palette.success.main} />
                    ) : (
                      <ShieldX size={24} color={theme.palette.error.main} />
                    )}
                    <Typography variant="body1" sx={{ ml: 2 }}>
                      {userData.security.twoFactor 
                        ? 'Two-factor authentication is enabled' 
                        : 'Two-factor authentication is disabled'}
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="outlined"
                    color={userData.security.twoFactor ? 'error' : 'primary'}
                  >
                    {userData.security.twoFactor ? 'Disable' : 'Enable'} Two-Factor Authentication
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
                      value={userData.security.sessionTimeout}
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
                      <strong>Last password change:</strong> {formatDate(userData.security.lastPasswordChange)}
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
                          checked={userData.notifications.email} 
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
                          checked={userData.emailPreferences.updates} 
                          color="primary"
                          disabled={!userData.notifications.email}
                        />
                      }
                      label="Account updates and security alerts"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={userData.emailPreferences.marketing} 
                          color="primary" 
                          disabled={!userData.notifications.email}
                        />
                      }
                      label="Marketing and promotional offers"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={userData.emailPreferences.newsletter} 
                          color="primary"
                          disabled={!userData.notifications.email}
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
                          checked={userData.notifications.push} 
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
                          checked={userData.notifications.sms} 
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