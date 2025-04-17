import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  FileDownload as FileDownloadIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Zap, Users, BarChart, Waves, ZapOff } from 'lucide-react';

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
      id={`subscription-tabpanel-${index}`}
      aria-labelledby={`subscription-tab-${index}`}
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

// Mock subscription plans
const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    billingPeriod: 'forever',
    description: 'Basic features for individuals and small businesses',
    features: [
      { name: 'Single business plan', included: true },
      { name: 'Basic AI assistance', included: true },
      { name: 'PDF export', included: true },
      { name: 'Share with 1 user', included: true },
      { name: 'Basic templates', included: true },
      { name: 'Advanced AI features', included: false },
      { name: 'Multiple business plans', included: false },
      { name: 'Priority support', included: false },
      { name: 'Premium templates', included: false },
    ],
    popular: false,
    buttonText: 'Current Plan'
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 19.99,
    billingPeriod: 'month',
    description: 'Advanced features for growing businesses',
    features: [
      { name: 'Up to 5 business plans', included: true },
      { name: 'Full AI assistance', included: true },
      { name: 'PDF and Word export', included: true },
      { name: 'Share with 5 users', included: true },
      { name: 'All templates', included: true },
      { name: 'Advanced AI features', included: true },
      { name: 'Financial projections', included: true },
      { name: 'Email support', included: true },
      { name: 'Premium templates', included: false },
    ],
    popular: true,
    buttonText: 'Upgrade'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    billingPeriod: 'month',
    description: 'Complete solution for consulting firms and larger organizations',
    features: [
      { name: 'Unlimited business plans', included: true },
      { name: 'Full AI assistance', included: true },
      { name: 'All export formats', included: true },
      { name: 'Unlimited users', included: true },
      { name: 'All templates', included: true },
      { name: 'Advanced AI features', included: true },
      { name: 'Financial projections', included: true },
      { name: 'Priority support', included: true },
      { name: 'Premium templates', included: true },
    ],
    popular: false,
    buttonText: 'Upgrade'
  }
];

// Mock billing history
const billingHistory = [
  {
    id: 'INV-2025-0012',
    date: '2025-05-01',
    amount: 19.99,
    status: 'Paid',
    plan: 'Professional'
  },
  {
    id: 'INV-2025-0008',
    date: '2025-04-01',
    amount: 19.99,
    status: 'Paid',
    plan: 'Professional'
  },
  {
    id: 'INV-2025-0004',
    date: '2025-03-01',
    amount: 19.99,
    status: 'Paid',
    plan: 'Professional'
  },
  {
    id: 'INV-2025-0001',
    date: '2025-02-01',
    amount: 9.99,
    status: 'Paid',
    plan: 'Basic'
  }
];

const SubscriptionPlans: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openUpgradeDialog, setOpenUpgradeDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [currentPlan] = useState('free'); // Mock current plan
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setOpenUpgradeDialog(true);
  };
  
  const handleUpgrade = () => {
    setLoading(true);
    
    // Simulate upgrade process
    setTimeout(() => {
      setLoading(false);
      setOpenUpgradeDialog(false);
      
      // Navigate to success page or show confirmation
      navigate('/dashboard');
    }, 2000);
  };
  
  const handleOpenCancelDialog = () => {
    setOpenCancelDialog(true);
  };
  
  const handleCancelSubscription = () => {
    setLoading(true);
    
    // Simulate cancellation process
    setTimeout(() => {
      setLoading(false);
      setOpenCancelDialog(false);
      
      // Update UI or navigate
      navigate('/dashboard');
    }, 1500);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Subscription Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your subscription plan and billing information
        </Typography>
      </Box>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="subscription tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Plans" />
          <Tab label="Billing History" />
          <Tab label="Payment Methods" />
        </Tabs>
        
        {/* Plans Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3 }}>
            <Alert severity="info">
              Your current plan: <strong>{subscriptionPlans.find(plan => plan.id === currentPlan)?.name || 'Free'}</strong>
            </Alert>
          </Box>
          
          <Grid container spacing={3}>
            {subscriptionPlans.map((plan) => (
              <Grid item xs={12} md={4} key={plan.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    ...(plan.popular && {
                      border: `2px solid ${theme.palette.primary.main}`,
                      boxShadow: 4
                    })
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="Most Popular"
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        fontWeight: 'bold',
                      }}
                    />
                  )}
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      {plan.id === 'free' ? (
                        <ZapOff size={24} />
                      ) : plan.id === 'pro' ? (
                        <Zap size={24} color={theme.palette.primary.main} />
                      ) : (
                        <BarChart size={24} color={theme.palette.secondary.main} />
                      )}
                      <Typography variant="h5" component="div" sx={{ ml: 1, fontWeight: 'bold' }}>
                        {plan.name}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                        ${plan.price}
                        <Typography variant="body1" component="span" color="text.secondary">
                          /{plan.price === 0 ? 'forever' : plan.billingPeriod}
                        </Typography>
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {plan.description}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <List dense>
                      {plan.features.map((feature, index) => (
                        <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            {feature.included ? (
                              <CheckIcon color="success" fontSize="small" />
                            ) : (
                              <CloseIcon color="disabled" fontSize="small" />
                            )}
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature.name} 
                            primaryTypographyProps={{ 
                              variant: 'body2',
                              color: feature.included ? 'textPrimary' : 'text.secondary',
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant={plan.id === currentPlan ? "outlined" : "contained"}
                      color={plan.id === currentPlan ? "secondary" : "primary"}
                      size="large"
                      disabled={plan.id === currentPlan || loading}
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {currentPlan !== 'free' && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button 
                variant="text" 
                color="error"
                onClick={handleOpenCancelDialog}
              >
                Cancel Subscription
              </Button>
            </Box>
          )}
        </TabPanel>
        
        {/* Billing History Tab */}
        <TabPanel value={tabValue} index={1}>
          {billingHistory.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {billingHistory.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.id}</TableCell>
                      <TableCell>{formatDate(invoice.date)}</TableCell>
                      <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                      <TableCell>{invoice.plan}</TableCell>
                      <TableCell>
                        <Chip 
                          label={invoice.status} 
                          color={invoice.status === 'Paid' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" title="Download Invoice">
                          <FileDownloadIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ReceiptIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6">No Billing History</Typography>
              <Typography variant="body2" color="text.secondary">
                Your billing history will appear here once you subscribe to a paid plan.
              </Typography>
            </Box>
          )}
        </TabPanel>
        
        {/* Payment Methods Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CreditCard size={48} color={theme.palette.text.disabled} style={{ marginBottom: 16 }} />
            <Typography variant="h6">No Payment Methods</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              You haven't added any payment methods yet.
            </Typography>
            <Button variant="outlined" startIcon={<CreditCard size={16} />}>
              Add Payment Method
            </Button>
          </Box>
        </TabPanel>
      </Paper>
      
      {/* Upgrade Dialog */}
      <Dialog open={openUpgradeDialog} onClose={() => setOpenUpgradeDialog(false)}>
        <DialogTitle>Upgrade Subscription</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You're about to upgrade to the {subscriptionPlans.find(plan => plan.id === selectedPlan)?.name} plan.
            {' '}This will give you access to additional features and benefits.
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Plan Details:
            </Typography>
            <Typography variant="body2">
              <strong>Price:</strong> ${subscriptionPlans.find(plan => plan.id === selectedPlan)?.price}/
              {subscriptionPlans.find(plan => plan.id === selectedPlan)?.billingPeriod}
            </Typography>
            <Typography variant="body2">
              <strong>Billing:</strong> You will be billed immediately and then on a 
              {' '}{subscriptionPlans.find(plan => plan.id === selectedPlan)?.billingPeriod}ly basis.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpgradeDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm Upgrade'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Cancel Dialog */}
      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle>Cancel Subscription</DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.
          </DialogContentText>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Any business plans you've created will remain accessible, but you won't be able to use premium features after cancellation.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)} variant="outlined">
            Keep Subscription
          </Button>
          <Button 
            onClick={handleCancelSubscription}
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Cancel Subscription'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionPlans;