import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomeLayout from '../HomeLayout';
import { ThemeContext } from '../App';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
  useTheme,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Skeleton
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  ExpandMore as ExpandMoreIcon,
  DoneAll as DoneAllIcon,
  Speed as SpeedIcon,
  Share as ShareIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { Brain, FileText, BarChart2, Users, Sparkles, Clock, MessageSquare, Award } from 'lucide-react';
import Logo from '../components/Logo';
import { motion } from 'framer-motion';

// Testimonial interface
interface Testimonial {
  id: number;
  name: string;
  company: string;
  position: string;
  quote: string;
  avatarUrl: string;
}

// Pricing plan interface
interface PricingPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: string;
  features: string[];
  description: string;
  popular: boolean;
  buttonText: string;
}

// FAQ interface
interface FAQ {
  question: string;
  answer: string;
}

const Home: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  
  // Mock data for testimonials
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      company: 'TechStart Inc.',
      position: 'Founder & CEO',
      quote: 'Sqordia transformed how we approach our business planning. The AI-powered suggestions saved us weeks of research and helped us identify opportunities we hadn\'t considered.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80'
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      company: 'Horizon Consulting',
      position: 'Senior Consultant',
      quote: 'As a consultant, I now create professional business plans for my clients in a fraction of the time. The collaborative features make it easy to gather input and refine the plans together.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80'
    },
    {
      id: 3,
      name: 'Emma Chen',
      company: 'GreenEarth Foundation',
      position: 'Program Director',
      quote: 'The non-profit specific templates helped us secure grant funding by clearly communicating our mission, impact metrics, and financial sustainability plan. Truly game-changing.',
      avatarUrl: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80'
    }
  ];
  
  // Pricing plans
  const pricingPlans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      billingPeriod: 'forever',
      description: 'Perfect for individuals just getting started',
      features: [
        'Single business plan',
        'Basic AI assistance',
        'PDF export',
        'Share with 1 user',
        'Basic templates'
      ],
      popular: false,
      buttonText: 'Sign Up Free'
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 19.99,
      billingPeriod: 'month',
      description: 'Ideal for entrepreneurs and small businesses',
      features: [
        'Up to 5 business plans',
        'Advanced AI assistance',
        'All export formats',
        'Share with 5 users',
        'All templates',
        'Financial projections',
        'Email support'
      ],
      popular: true,
      buttonText: 'Start Pro Trial'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 49.99,
      billingPeriod: 'month',
      description: 'For agencies, consultants and larger teams',
      features: [
        'Unlimited business plans',
        'Priority AI processing',
        'All export formats',
        'Unlimited user sharing',
        'Custom templates',
        'Advanced analytics',
        'Priority support',
        'API access'
      ],
      popular: false,
      buttonText: 'Contact Sales'
    }
  ];
  
  // FAQs
  const faqs: FAQ[] = [
    {
      question: 'How does the AI assist with creating a business plan?',
      answer: 'Our AI analyzes your questionnaire responses and industry data to generate tailored content for each section of your business plan. It suggests market insights, financial projections, and strategic recommendations based on successful businesses in your industry.'
    },
    {
      question: 'Can I export my business plan in different formats?',
      answer: 'Yes, Sqordia allows you to export your business plan in multiple formats including PDF, Word (DOCX), and PowerPoint (PPTX). This makes it easy to share with stakeholders, investors, or financial institutions.'
    },
    {
      question: 'Is my data secure and confidential?',
      answer: 'Absolutely. We employ enterprise-grade security measures to protect your data. All information is encrypted both in transit and at rest. We never share your business plan data with third parties without your explicit permission.'
    },
    {
      question: 'Can I collaborate with others on my business plan?',
      answer: 'Yes, our platform enables seamless collaboration. You can invite team members, stakeholders, or advisors to view or edit your business plan. You control permission levels for each collaborator.'
    },
    {
      question: 'Do you offer specialized templates for different industries?',
      answer: 'Yes, we provide a wide range of templates tailored to specific industries including tech startups, retail businesses, service businesses, restaurants, and non-profit organizations. Each template is designed with industry-specific sections and suggestions.'
    }
  ];
  
  // Preload hero image
  useEffect(() => {
    const img = new Image();
    img.src = "https://images.unsplash.com/photo-1677442135136-760c813028c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80";
    img.onload = () => setImageLoaded(true);
  }, []);
  
  const features = [
    {
      icon: <Brain size={40} color={theme.palette.primary.main} />,
      title: 'AI-Powered Content Generation',
      description: 'Our advanced AI generates customized business plan content based on your inputs and industry standards.'
    },
    {
      icon: <Clock size={40} color={theme.palette.secondary.main} />,
      title: 'Save Valuable Time',
      description: 'Create comprehensive business plans in hours instead of weeks with our intuitive platform.'
    },
    {
      icon: <FileText size={40} color={theme.palette.success.main} />,
      title: 'Professional Templates',
      description: 'Choose from a variety of industry-specific templates designed by business experts.'
    },
    {
      icon: <BarChart2 size={40} color={theme.palette.info.main} />,
      title: 'Financial Projections',
      description: 'Generate realistic financial forecasts with our easy-to-use financial modeling tools.'
    },
    {
      icon: <Users size={40} color={theme.palette.warning.main} />,
      title: 'Seamless Collaboration',
      description: 'Invite team members, stakeholders, or advisors to review and contribute to your plan.'
    },
    {
      icon: <Sparkles size={40} color={theme.palette.error.main} />,
      title: 'Guided Questionnaire',
      description: 'Our step-by-step questionnaire helps you articulate your business vision clearly and comprehensively.'
    }
  ];

  // Handle the Get Started button click
  const handleGetStarted = () => {
    navigate('/register');
  };
  
  const HomeContent = () => (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: `linear-gradient(135deg, ${theme.palette.mode === 'dark' ? '#1a237e' : '#e8f5fe'} 0%, ${theme.palette.mode === 'dark' ? '#000000' : '#ffffff'} 100%)`,
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 16 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Logo width={220} height={80} />
              </Box>
              
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)' 
                    : 'linear-gradient(90deg, #1a56db 0%, #7c3aed 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {t('home.hero.title')}
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                  fontWeight: 400,
                  maxWidth: '90%'
                }}
              >
                {t('home.hero.subtitle')}
              </Typography>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button 
                  variant="contained" 
                  size="large"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={handleGetStarted}
                  sx={{ 
                    py: 1.5, 
                    px: 3,
                    fontSize: '1rem',
                    boxShadow: theme.shadows[8],
                    background: 'linear-gradient(90deg, #2563eb 0%, #4f46e5 100%)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #1d4ed8 0%, #4338ca 100%)',
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[12]
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {t('home.hero.getStarted')}
                </Button>
                
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => {
                    const featuresSection = document.getElementById('features');
                    if (featuresSection) {
                      featuresSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  sx={{ 
                    py: 1.5, 
                    px: 3,
                    fontSize: '1rem',
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4]
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {t('home.hero.learnMore')}
                </Button>
              </Stack>
              
              <Box sx={{ mt: 5, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon color="success" sx={{ mr: 0.5 }} fontSize="small" />
                  <Typography variant="body2">
                    {t('home.hero.benefit1')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon color="success" sx={{ mr: 0.5 }} fontSize="small" />
                  <Typography variant="body2">
                    {t('home.hero.benefit2')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon color="success" sx={{ mr: 0.5 }} fontSize="small" />
                  <Typography variant="body2">
                    {t('home.hero.benefit3')}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 4 }}>
                  {!imageLoaded && (
                    <Skeleton 
                      variant="rectangular" 
                      animation="wave"
                      width="100%" 
                      height={{ xs: 300, sm: 400, md: 500 }}
                      sx={{ 
                        borderRadius: 4,
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  )}
                  
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1677442135136-760c813028c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
                    alt="AI business planning interface with neural network visualization"
                    sx={{
                      display: imageLoaded ? 'block' : 'none',
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: 4,
                      boxShadow: theme.shadows[10],
                      transform: 'perspective(1000px) rotateY(-5deg)',
                      transition: 'transform 0.5s ease-in-out, box-shadow 0.5s ease-in-out',
                      '&:hover': {
                        transform: 'perspective(1000px) rotateY(0deg) translateY(-10px)',
                        boxShadow: theme.shadows[15],
                      }
                    }}
                  />
                  
                  {/* Overlay with AI elements for visual effect */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 4,
                      boxShadow: 'inset 0 0 30px rgba(0,0,0,0.2)',
                      pointerEvents: 'none',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      overflow: 'hidden'
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.4 }}
                      transition={{ delay: 1.2, duration: 1 }}
                    >
                      <Brain 
                        size={120} 
                        color={theme.palette.mode === 'dark' ? '#ffffff' : '#4f46e5'} 
                        strokeWidth={1}
                        style={{ opacity: 0.15 }}
                      />
                    </motion.div>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
        
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, rgba(79,70,229,0) 70%)',
            zIndex: 0,
            display: { xs: 'none', md: 'block' }
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '5%',
            left: '10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, rgba(37,99,235,0) 70%)',
            zIndex: 0,
            display: { xs: 'none', md: 'block' }
          }}
        />
      </Box>
      
      {/* Stats Section */}
      <Box 
        sx={{ 
          py: 4, 
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
          borderTop: `1px solid ${theme.palette.divider}`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={6} md={3}>
              <Typography 
                variant="h3" 
                align="center" 
                color="primary" 
                sx={{ fontWeight: 'bold', mb: 1 }}
              >
                10,000+
              </Typography>
              <Typography variant="body1" align="center" color="text.secondary">
                {t('home.stats.users')}
              </Typography>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Typography 
                variant="h3" 
                align="center" 
                color="secondary" 
                sx={{ fontWeight: 'bold', mb: 1 }}
              >
                25,000+
              </Typography>
              <Typography variant="body1" align="center" color="text.secondary">
                {t('home.stats.plans')}
              </Typography>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Typography 
                variant="h3" 
                align="center" 
                color="success" 
                sx={{ fontWeight: 'bold', mb: 1 }}
              >
                98%
              </Typography>
              <Typography variant="body1" align="center" color="text.secondary">
                {t('home.stats.satisfaction')}
              </Typography>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Typography 
                variant="h3" 
                align="center" 
                color="info" 
                sx={{ fontWeight: 'bold', mb: 1 }}
              >
                150+
              </Typography>
              <Typography variant="body1" align="center" color="text.secondary">
                {t('home.stats.countries')}
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Box id="features" sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ fontWeight: 'bold', mb: 2 }}
            >
              {t('home.features.title')}
            </Typography>
            <Typography 
              variant="h6" 
              component="p" 
              color="text.secondary" 
              sx={{ maxWidth: 700, mx: 'auto' }}
            >
              {t('home.features.subtitle')}
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    transition: 'transform 0.3s', 
                    '&:hover': { 
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[10]
                    },
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 4 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* How It Works Section */}
      <Box 
        sx={{ 
          py: 10, 
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(26, 32, 44, 0.8)' : 'rgba(247, 250, 252, 0.8)' 
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ fontWeight: 'bold', mb: 2 }}
            >
              {t('home.howItWorks.title')}
            </Typography>
            <Typography 
              variant="h6" 
              component="p" 
              color="text.secondary" 
              sx={{ maxWidth: 700, mx: 'auto' }}
            >
              {t('home.howItWorks.subtitle')}
            </Typography>
          </Box>
          
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Sqordia dashboard"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 2,
                    boxShadow: theme.shadows[5]
                  }}
                />
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <List sx={{ '& .MuiListItem-root': { pb: 3 } }}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      1
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {t('home.howItWorks.step1.title')}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body1" color="text.secondary">
                        {t('home.howItWorks.step1.description')}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: 'secondary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      2
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {t('home.howItWorks.step2.title')}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body1" color="text.secondary">
                        {t('home.howItWorks.step2.description')}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      3
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {t('home.howItWorks.step3.title')}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body1" color="text.secondary">
                        {t('home.howItWorks.step3.description')}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: 'info.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      4
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {t('home.howItWorks.step4.title')}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body1" color="text.secondary">
                        {t('home.howItWorks.step4.description')}
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
              
              <Button 
                variant="contained" 
                size="large" 
                sx={{ mt: 3 }}
                onClick={() => navigate('/register')}
              >
                {t('home.howItWorks.startNow')}
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Testimonials Section */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ fontWeight: 'bold', mb: 2 }}
            >
              {t('home.testimonials.title')}
            </Typography>
            <Typography 
              variant="h6" 
              component="p" 
              color="text.secondary" 
              sx={{ maxWidth: 700, mx: 'auto' }}
            >
              {t('home.testimonials.subtitle')}
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial) => (
              <Grid item xs={12} md={4} key={testimonial.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 3,
                    boxShadow: theme.shadows[2],
                    '&:hover': {
                      boxShadow: theme.shadows[10],
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ mb: 2 }}>
                      <MessageSquare size={24} color={theme.palette.primary.main} />
                      <MessageSquare size={24} color={theme.palette.primary.main} />
                      <MessageSquare size={24} color={theme.palette.primary.main} />
                    </Box>
                    <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', mb: 2 }}>
                      "{testimonial.quote}"
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Box
                        component="img"
                        src={testimonial.avatarUrl}
                        alt={testimonial.name}
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          mr: 2
                        }}
                      />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.position}, {testimonial.company}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* Pricing Section */}
      <Box 
        id="pricing" 
        sx={{ 
          py: 10, 
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(26, 32, 44, 0.8)' : 'rgba(247, 250, 252, 0.8)'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ fontWeight: 'bold', mb: 2 }}
            >
              {t('home.pricing.title')}
            </Typography>
            <Typography 
              variant="h6" 
              component="p" 
              color="text.secondary" 
              sx={{ maxWidth: 700, mx: 'auto' }}
            >
              {t('home.pricing.subtitle')}
            </Typography>
          </Box>
          
          <Grid container spacing={4} justifyContent="center">
            {pricingPlans.map((plan) => (
              <Grid item xs={12} md={4} key={plan.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[10]
                    },
                    ...(plan.popular && {
                      borderTop: `4px solid ${theme.palette.primary.main}`,
                      transform: 'scale(1.05)',
                      zIndex: 1,
                      boxShadow: theme.shadows[10],
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.05)',
                      }
                    })
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label={t('home.pricing.mostPopular')}
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        right: 24,
                        fontWeight: 'bold'
                      }}
                    />
                  )}
                  
                  <CardContent sx={{ p: 4, flexGrow: 1 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold' }}>
                        {plan.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {plan.description}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ my: 3 }}>
                      <Typography variant="h3" component="p" sx={{ fontWeight: 'bold' }}>
                        ${plan.price}
                        <Typography variant="body1" component="span" color="text.secondary">
                          /{plan.price === 0 ? t('home.pricing.forever') : t('home.pricing.month')}
                        </Typography>
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <List sx={{ mb: 2 }}>
                      {plan.features.map((feature, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 34 }}>
                            <DoneAllIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  
                  <Box sx={{ p: 4, pt: 0 }}>
                    <Button 
                      variant={plan.popular ? "contained" : "outlined"} 
                      fullWidth 
                      size="large"
                      onClick={() => navigate('/register')}
                    >
                      {plan.buttonText}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* FAQ Section */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ fontWeight: 'bold', mb: 2 }}
            >
              {t('home.faq.title')}
            </Typography>
            <Typography 
              variant="h6" 
              component="p" 
              color="text.secondary" 
              sx={{ maxWidth: 700, mx: 'auto' }}
            >
              {t('home.faq.subtitle')}
            </Typography>
          </Box>
          
          <Box>
            {faqs.map((faq, index) => (
              <Accordion 
                key={index} 
                sx={{ 
                  mb: 2, 
                  boxShadow: 'none', 
                  border: `1px solid ${theme.palette.divider}`,
                  '&:before': { display: 'none' } 
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${index}-content`}
                  id={`panel${index}-header`}
                  sx={{ px: 3 }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
          
          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t('home.faq.stillHaveQuestions')}
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              startIcon={<MessageSquare size={18} />}
            >
              {t('home.faq.contactSupport')}
            </Button>
          </Box>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Box 
        sx={{ 
          py: 10, 
          backgroundColor: theme.palette.primary.main,
          color: 'white'
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ fontWeight: 'bold', mb: 3 }}
            >
              {t('home.cta.title')}
            </Typography>
            <Typography 
              variant="h6" 
              component="p" 
              sx={{ mb: 4, color: 'rgba(255,255,255,0.9)' }}
            >
              {t('home.cta.subtitle')}
            </Typography>
            
            <Button 
              variant="contained" 
              size="large"
              color="secondary"
              sx={{ 
                py: 1.5, 
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
              onClick={() => navigate('/register')}
            >
              {t('home.cta.button')}
            </Button>
            
            <Typography variant="body2" sx={{ mt: 3, color: 'rgba(255,255,255,0.7)' }}>
              {t('home.cta.noCreditCard')}
            </Typography>
          </Box>
        </Container>
      </Box>
      
      {/* Partners and Trust Signals */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h6" 
            component="p" 
            color="text.secondary" 
            align="center" 
            sx={{ mb: 4 }}
          >
            {t('home.partners.title')}
          </Typography>
          
          <Grid container spacing={4} justifyContent="center" alignItems="center">
            {['TechCrunch', 'Forbes', 'Entrepreneur', 'Inc.', 'Business Insider'].map((partner) => (
              <Grid item key={partner} xs={6} sm={4} md={2} sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}
                >
                  {partner}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
  
  return (
    <HomeLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <HomeContent />
    </HomeLayout>
  );
};

export default Home;