import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  useMediaQuery,
  Stack,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Assignment as AssignmentIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Edit as EditIcon,
  InsertChart as InsertChartIcon,
  Timeline as TimelineIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Brain, FileText, Check, Clock, User } from 'lucide-react';
import AnimatedWrapper from '../components/AnimatedWrapper';
import { useAuth } from '../context/AuthProvider';
import { getDashboardStats, getBusinessPlans, getRecentActivities, DashboardStats, BusinessPlan, Activity } from '../api/dashboard';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [stats, setStats] = useState<DashboardStats>({
    totalPlans: 0,
    completedPlans: 0,
    aiGenerations: 0,
    avgCompletion: 0
  });
  const [businessPlans, setBusinessPlans] = useState<BusinessPlan[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState({
    stats: false,
    plans: false,
    activities: false
  });
  const [errors, setErrors] = useState({
    stats: null as string | null,
    plans: null as string | null,
    activities: null as string | null
  });
  
  // Setup intersection observer to trigger animations
  const [statsRef, statsInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  
  const [plansRef, plansInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  
  const [activityRef, activityInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  
  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!user?.id) return;
    
    // Fetch stats
    setLoading(prev => ({ ...prev, stats: true }));
    setErrors(prev => ({ ...prev, stats: null }));
    try {
      const statsData = await getDashboardStats(user.id);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setErrors(prev => ({ ...prev, stats: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
    
    // Fetch business plans
    setLoading(prev => ({ ...prev, plans: true }));
    setErrors(prev => ({ ...prev, plans: null }));
    try {
      const plansData = await getBusinessPlans(user.id);
      setBusinessPlans(plansData);
    } catch (error) {
      console.error('Error fetching business plans:', error);
      setErrors(prev => ({ ...prev, plans: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, plans: false }));
    }
    
    // Fetch recent activities
    setLoading(prev => ({ ...prev, activities: true }));
    setErrors(prev => ({ ...prev, activities: null }));
    try {
      const activitiesData = await getRecentActivities(user.id);
      setRecentActivity(activitiesData);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setErrors(prev => ({ ...prev, activities: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, activities: false }));
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Get relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    return formatDate(dateString);
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check size={20} color={theme.palette.success.main} />;
      case 'in_progress':
        return <Clock size={20} color={theme.palette.info.main} />;
      default:
        return null;
    }
  };
  
  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'edit':
        return <EditIcon fontSize="small" sx={{ color: theme.palette.info.main }} />;
      case 'ai_generation':
        return <Brain size={20} color={theme.palette.primary.main} />;
      case 'questionnaire':
        return <AssignmentIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />;
      case 'export':
        return <FileText size={20} color={theme.palette.success.main} />;
      default:
        return null;
    }
  };
  
  // Get user initials for avatar
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
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  const statCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({ 
      opacity: 1, 
      scale: 1, 
      transition: { 
        delay: i * 0.1,
        duration: 0.5
      } 
    })
  };
  
  // Render mobile activity list
  const renderMobileActivityList = () => (
    <List disablePadding>
      {recentActivity.map((activity) => (
        <ListItem 
          key={activity.id}
          sx={{ 
            mb: 2, 
            p: 2, 
            bgcolor: theme.palette.background.paper,
            borderRadius: 1,
            boxShadow: theme.shadows[1]
          }}
        >
          <ListItemAvatar>
            <Avatar sx={{ 
              bgcolor: activity.type === 'edit' ? theme.palette.info.main : 
                      activity.type === 'ai_generation' ? theme.palette.primary.main :
                      activity.type === 'questionnaire' ? theme.palette.warning.main :
                      theme.palette.success.main
            }}>
              {getActivityIcon(activity.type)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="subtitle2">
                {activity.type === 'edit' ? t('dashboard.edited') : 
                 activity.type === 'ai_generation' ? t('dashboard.aiGenerated') :
                 activity.type === 'questionnaire' ? t('dashboard.questionnaire') :
                 t('dashboard.exported')}
              </Typography>
            }
            secondary={
              <>
                <Typography variant="body2" component="span" color="text.primary">
                  {activity.businessPlan}
                </Typography>
                <Typography variant="body2" display="block" color="text.secondary">
                  {activity.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getRelativeTime(activity.timestamp)}
                </Typography>
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
  
  // Render error state with retry button
  const renderErrorState = (errorMessage: string, onRetry: () => void) => (
    <Box sx={{ textAlign: 'center', py: 3 }}>
      <ErrorIcon color="error" sx={{ fontSize: 40, mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Something went wrong
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {errorMessage}
      </Typography>
      <Button 
        variant="outlined" 
        startIcon={<RefreshIcon />}
        onClick={onRetry}
      >
        Retry
      </Button>
    </Box>
  );
  
  return (
    <AnimatedWrapper>
      <Box sx={{ px: { xs: 1, sm: 2 } }}>
        <Box sx={{ 
          mb: 4, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 'bold',
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' }
          }}>
            {t('dashboard.title')}
          </Typography>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/questionnaire')}
              sx={{
                boxShadow: theme.shadows[4],
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: theme.shadows[8],
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {t('dashboard.newBusinessPlan')}
            </Button>
          </motion.div>
        </Box>
        
        {/* Stats Overview */}
        <motion.div 
          ref={statsRef}
          initial="hidden" 
          animate={statsInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {[
              { 
                icon: <InsertChartIcon fontSize="large" color="primary" />, 
                value: stats.totalPlans, 
                text: t('dashboard.totalBusinessPlans'), 
                custom: 0,
                loading: loading.stats,
                error: errors.stats
              },
              { 
                icon: <Check size={28} color={theme.palette.success.main} />, 
                value: stats.completedPlans, 
                text: t('dashboard.completedPlans'), 
                custom: 1,
                loading: loading.stats,
                error: errors.stats
              },
              { 
                icon: <Brain size={28} color={theme.palette.primary.main} />, 
                value: stats.aiGenerations, 
                text: t('dashboard.aiGenerations'), 
                custom: 2,
                loading: loading.stats,
                error: errors.stats
              },
              { 
                icon: <TimelineIcon fontSize="large" sx={{ color: theme.palette.warning.main }} />, 
                value: `${stats.avgCompletion}%`, 
                text: t('dashboard.averageCompletion'), 
                custom: 3,
                loading: loading.stats,
                error: errors.stats
              }
            ].map((item, index) => (
              <Grid item xs={6} sm={6} md={3} key={index}>
                <motion.div custom={item.custom} variants={statCardVariants}>
                  <Card sx={{
                    height: '100%',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: theme.shadows[10]
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}>
                    <CardContent sx={{ 
                      textAlign: 'center',
                      p: { xs: 1.5, sm: 2 } 
                    }}>
                      <Box sx={{ 
                        mb: { xs: 1, sm: 2 },
                        display: 'flex',
                        justifyContent: 'center'
                      }}>
                        {item.icon}
                      </Box>
                      
                      {item.loading ? (
                        <CircularProgress size={24} />
                      ) : item.error ? (
                        <Typography variant="body2" color="error">
                          Error loading data
                        </Typography>
                      ) : (
                        <Typography variant="h4" component="div" sx={{ 
                          fontWeight: 'bold', 
                          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                        }}>
                          {item.value}
                        </Typography>
                      )}
                      
                      <Typography variant="body2" color="text.secondary" sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>
                        {item.text}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
        
        {/* Your Business Plans */}
        <Typography variant="h5" component="h2" sx={{ 
          mb: 2, 
          fontWeight: 'bold',
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}>
          {t('dashboard.yourBusinessPlans')}
        </Typography>
        
        <motion.div 
          ref={plansRef}
          initial="hidden" 
          animate={plansInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {errors.plans ? (
            <Paper sx={{ p: 3, mb: 4 }}>
              {renderErrorState(errors.plans, () => {
                setErrors(prev => ({ ...prev, plans: null }));
                if (user?.id) {
                  setLoading(prev => ({ ...prev, plans: true }));
                  getBusinessPlans(user.id)
                    .then(data => setBusinessPlans(data))
                    .catch(err => setErrors(prev => ({ ...prev, plans: err.message })))
                    .finally(() => setLoading(prev => ({ ...prev, plans: false })));
                }
              })}
            </Paper>
          ) : loading.plans ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {businessPlans.map((plan, index) => (
                <Grid item xs={12} sm={6} md={4} key={plan.id}>
                  <motion.div variants={itemVariants}>
                    <Card sx={{
                      height: '100%',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.shadows[8]
                      }
                    }}>
                      <CardActionArea onClick={() => navigate('/editor', { state: { planId: plan.id } })}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <FileText size={isMobile ? 20 : 24} />
                              <Typography variant="h6" component="div" sx={{ 
                                ml: 1,
                                fontSize: { xs: '1rem', sm: '1.25rem' }
                              }}>
                                {plan.title}
                              </Typography>
                            </Box>
                            {getStatusIcon(plan.status)}
                          </Box>
                          
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: { xs: 'column', sm: 'row' }, 
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            mb: 2, 
                            gap: { xs: 1, sm: 2 }
                          }}>
                            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                              <CircularProgress
                                variant="determinate"
                                value={plan.progress}
                                size={isMobile ? 40 : 50}
                                thickness={4}
                                sx={{
                                  color: plan.progress === 100 
                                    ? theme.palette.success.main 
                                    : theme.palette.primary.main,
                                  transition: 'color 0.5s ease'
                                }}
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
                                <Typography variant="caption" component="div" color="text.secondary" sx={{
                                  fontSize: { xs: '0.65rem', sm: '0.75rem' }
                                }}>
                                  {`${Math.round(plan.progress)}%`}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{
                                fontSize: { xs: '0.7rem', sm: '0.775rem' }
                              }}>
                                {t('dashboard.lastUpdated')}
                              </Typography>
                              <Typography variant="body2" sx={{
                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
                              }}>
                                {getRelativeTime(plan.updatedAt || plan.createdAt)}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                              size="small"
                              color="primary"
                              endIcon={<ArrowForwardIcon />}
                              sx={{
                                transition: 'all 0.2s',
                                '&:hover': {
                                  transform: 'translateX(4px)'
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(plan.progress === 100 ? '/editor' : '/questionnaire', { state: { planId: plan.id } });
                              }}
                            >
                              {plan.progress === 100 ? t('dashboard.viewPlan') : t('dashboard.continue')}
                            </Button>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
              
              <Grid item xs={12} sm={6} md={4}>
                <motion.div variants={itemVariants}>
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    minHeight: { xs: 150, sm: 180 },
                    border: `1px dashed ${theme.palette.divider}`,
                    bgcolor: 'background.default',
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(37, 99, 235, 0.1)' 
                        : 'rgba(243, 244, 246, 1)'
                    }
                  }}>
                    <CardActionArea onClick={() => navigate('/questionnaire')} sx={{ height: '100%', p: { xs: 2, sm: 3 } }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <CreateNewFolderIcon 
                          fontSize="large" 
                          sx={{ 
                            color: theme.palette.primary.main, 
                            mb: 2,
                            fontSize: { xs: 36, sm: 48 },
                            transition: 'transform 0.3s',
                            '&:hover': {
                              transform: 'scale(1.1)'
                            }
                          }} 
                        />
                        <Typography variant="h6" component="div" sx={{
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}>
                          {t('dashboard.createNewBusinessPlan')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          mt: 1,
                          display: { xs: 'none', sm: 'block' }
                        }}>
                          {t('dashboard.startFromScratch')}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          )}
        </motion.div>
        
        {/* Recent Activity */}
        <Typography variant="h5" component="h2" sx={{ 
          mb: 2, 
          fontWeight: 'bold',
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}>
          {t('dashboard.recentActivity')}
        </Typography>
        
        <motion.div 
          ref={activityRef}
          initial="hidden" 
          animate={activityInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {errors.activities ? (
            <Paper sx={{ p: 3, mb: 4 }}>
              {renderErrorState(errors.activities, () => {
                setErrors(prev => ({ ...prev, activities: null }));
                if (user?.id) {
                  setLoading(prev => ({ ...prev, activities: true }));
                  getRecentActivities(user.id)
                    .then(data => setRecentActivity(data))
                    .catch(err => setErrors(prev => ({ ...prev, activities: err.message })))
                    .finally(() => setLoading(prev => ({ ...prev, activities: false })));
                }
              })}
            </Paper>
          ) : loading.activities ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : recentActivity.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', mb: 4 }}>
              <Typography variant="body1">No recent activity found.</Typography>
              <Typography variant="body2" color="text.secondary">
                Your recent actions will appear here as you work on your business plans.
              </Typography>
            </Paper>
          ) : (
            <>
              {/* Desktop Activity Table */}
              {!isMobile && (
                <TableContainer 
                  component={Paper} 
                  sx={{ 
                    mb: 4,
                    borderRadius: 2, 
                    overflow: 'hidden',
                    boxShadow: theme.shadows[2],
                    '&:hover': {
                      boxShadow: theme.shadows[4]
                    }
                  }}
                >
                  <Table size={isTablet ? "small" : "medium"}>
                    <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                      <TableRow>
                        <TableCell>{t('dashboard.activity')}</TableCell>
                        <TableCell>{t('dashboard.businessPlan')}</TableCell>
                        <TableCell>{t('dashboard.description')}</TableCell>
                        <TableCell>{t('dashboard.date')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentActivity.map((activity, index) => (
                        <motion.tr
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          style={{ 
                            backgroundColor: index % 2 === 0 
                              ? (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)') 
                              : 'transparent'
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                sx={{ 
                                  width: 32, 
                                  height: 32,
                                  mr: 1,
                                  bgcolor: activity.type === 'edit' ? theme.palette.info.main : 
                                           activity.type === 'ai_generation' ? theme.palette.primary.main :
                                           activity.type === 'questionnaire' ? theme.palette.warning.main :
                                           theme.palette.success.main
                                }}
                              >
                                {getActivityIcon(activity.type)}
                              </Avatar>
                              <Typography variant="body2">
                                {activity.type === 'edit' ? t('dashboard.edited') : 
                                  activity.type === 'ai_generation' ? t('dashboard.aiGenerated') :
                                  activity.type === 'questionnaire' ? t('dashboard.questionnaire') :
                                  t('dashboard.exported')}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{activity.businessPlan}</TableCell>
                          <TableCell>{activity.description}</TableCell>
                          <TableCell>
                            <Tooltip title={formatDate(activity.timestamp)}>
                              <Typography variant="body2">
                                {getRelativeTime(activity.timestamp)}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Mobile Activity List */}
              {isMobile && renderMobileActivityList()}
            </>
          )}
        </motion.div>
      </Box>
    </AnimatedWrapper>
  );
};

export default Dashboard;