import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Card,
  Container,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Snackbar,
  Step,
  StepButton,
  StepLabel,
  Stepper,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Alert,
  useTheme,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Close,
  Help,
  InfoOutlined,
  Save,
  WarningAmber,
  AutoAwesome
} from '@mui/icons-material';
import { showNotification } from '../store/slices/uiSlice';
import { updateQuestionAnswer, autoSaveDone, autoSaveError } from '../store/slices/businessPlanSlice';
import { Brain } from 'lucide-react';

// Mock templates
const businessPlanTemplates = [
  {
    id: 'startup',
    name: 'Tech Startup',
    description: 'Perfect for software, SaaS, or tech product companies',
    sections: ['company_overview', 'product', 'market_analysis', 'strategy', 'team', 'financials']
  },
  {
    id: 'retail',
    name: 'Retail Business',
    description: 'For shops, boutiques, and retail stores',
    sections: ['company_overview', 'products_services', 'market_analysis', 'location', 'operations', 'financials']
  },
  {
    id: 'service',
    name: 'Service Business',
    description: 'Ideal for consulting, professional services, agencies',
    sections: ['company_overview', 'services', 'market_analysis', 'strategy', 'team', 'financials']
  },
  {
    id: 'restaurant',
    name: 'Restaurant/Food Service',
    description: 'For restaurants, cafes, food trucks or catering businesses',
    sections: ['company_overview', 'concept', 'menu', 'location', 'operations', 'marketing', 'financials']
  },
  {
    id: 'nonprofit',
    name: 'Non-Profit Organization',
    description: 'Customized for charitable and non-profit organizations',
    sections: ['organization_overview', 'mission', 'programs', 'impact_measurement', 'structure', 'funding']
  }
];

// Mock sections and questions
const questionnaireSections = [
  {
    id: 'basics',
    title: 'Business Basics',
    description: 'Let\'s start with the fundamentals of your business',
    questions: [
      {
        id: 'business_name',
        question: 'What is the name of your business?',
        type: 'text',
        required: true,
        placeholder: 'e.g., Acme Corporation'
      },
      {
        id: 'business_tagline',
        question: 'What is your business tagline or slogan? (optional)',
        type: 'text',
        required: false,
        placeholder: 'e.g., Innovation for a better tomorrow'
      },
      {
        id: 'business_type',
        question: 'What type of business are you creating?',
        type: 'select',
        required: true,
        options: [
          'Sole Proprietorship',
          'Partnership',
          'Limited Liability Company (LLC)',
          'Corporation',
          'S Corporation',
          'Non-profit'
        ]
      },
      {
        id: 'business_stage',
        question: 'What stage is your business in?',
        type: 'radio',
        required: true,
        options: [
          'Idea/Concept',
          'Startup (0-2 years)',
          'Growth (2-5 years)',
          'Established (5+ years)'
        ]
      }
    ]
  },
  {
    id: 'product',
    title: 'Products & Services',
    description: 'Tell us about what your business offers to customers',
    questions: [
      {
        id: 'product_description',
        question: 'Describe your main product or service in detail.',
        type: 'textarea',
        required: true,
        placeholder: 'Provide a comprehensive description of what you sell or offer'
      },
      {
        id: 'value_proposition',
        question: 'What is your unique value proposition? What makes your offering different?',
        type: 'textarea',
        required: true,
        placeholder: 'Explain what sets you apart from competitors'
      },
      {
        id: 'pricing_strategy',
        question: 'What is your pricing strategy?',
        type: 'select',
        required: true,
        options: [
          'Premium/Luxury',
          'Mid-market',
          'Budget/Economy',
          'Freemium',
          'Subscription-based',
          'Value-based',
          'Cost-plus',
          'Other'
        ]
      },
      {
        id: 'product_stage',
        question: 'What stage of development is your product/service in?',
        type: 'radio',
        required: true,
        options: [
          'Concept/Idea',
          'Prototype/MVP',
          'Beta/Testing',
          'Launched/Available',
          'Established with iterative improvements'
        ]
      }
    ]
  },
  {
    id: 'market',
    title: 'Market Analysis',
    description: 'Understand your market, customers, and competition',
    questions: [
      {
        id: 'target_audience',
        question: 'Who is your target customer or audience?',
        type: 'textarea',
        required: true,
        placeholder: 'Describe your ideal customer in detail (demographics, behaviors, needs)'
      },
      {
        id: 'market_size',
        question: 'What is the size of your target market?',
        type: 'select',
        required: true,
        options: [
          'Small niche market (Under $10M)',
          'Medium market ($10M-$100M)',
          'Large market ($100M-$1B)',
          'Massive market (Over $1B)'
        ]
      },
      {
        id: 'competitors',
        question: 'Who are your main competitors?',
        type: 'textarea',
        required: true,
        placeholder: 'List your top competitors and briefly describe them'
      },
      {
        id: 'competitive_advantage',
        question: 'What is your competitive advantage?',
        type: 'checkbox',
        required: true,
        options: [
          'Proprietary technology',
          'Unique features',
          'Lower price',
          'Better quality',
          'Superior customer service',
          'Stronger brand',
          'Better location',
          'Exclusive partnerships',
          'Other'
        ]
      }
    ]
  },
  {
    id: 'strategy',
    title: 'Business Strategy',
    description: 'Define your goals and how you plan to achieve them',
    questions: [
      {
        id: 'mission_statement',
        question: 'What is your mission statement?',
        type: 'textarea',
        required: true,
        placeholder: 'The purpose and core values that guide your business'
      },
      {
        id: 'vision_statement',
        question: 'What is your vision statement?',
        type: 'textarea',
        required: true,
        placeholder: 'Your aspirational description of what you want to achieve in the future'
      },
      {
        id: 'short_term_goals',
        question: 'What are your short-term goals (1 year)?',
        type: 'textarea',
        required: true,
        placeholder: 'List specific, measurable goals for the next year'
      },
      {
        id: 'long_term_goals',
        question: 'What are your long-term goals (3-5 years)?',
        type: 'textarea',
        required: true,
        placeholder: 'List your strategic objectives for the next 3-5 years'
      }
    ]
  },
  {
    id: 'financials',
    title: 'Financial Projections',
    description: 'Understand the financial aspects of your business',
    questions: [
      {
        id: 'startup_costs',
        question: 'What are your estimated startup costs?',
        type: 'text',
        required: true,
        placeholder: 'e.g., $50,000'
      },
      {
        id: 'revenue_model',
        question: 'What is your revenue model?',
        type: 'select',
        required: true,
        options: [
          'Direct sales',
          'Subscription',
          'Freemium',
          'Licensing',
          'Advertising',
          'Affiliate marketing',
          'Marketplace/Commission',
          'Mixed model',
          'Other'
        ]
      },
      {
        id: 'breakeven_projection',
        question: 'When do you expect to break even?',
        type: 'select',
        required: true,
        options: [
          'Less than 6 months',
          '6-12 months',
          '12-18 months',
          '18-24 months',
          '2-3 years',
          '3-5 years',
          'More than 5 years'
        ]
      },
      {
        id: 'funding_needed',
        question: 'Do you need external funding?',
        type: 'radio',
        required: true,
        options: [
          'No, self-funded/bootstrapped',
          'Yes, seeking seed/angel investment',
          'Yes, seeking venture capital',
          'Yes, seeking bank loans',
          'Yes, seeking government grants',
          'Yes, crowdfunding',
          'Other'
        ]
      }
    ]
  }
];

const QuestionnaireWizard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showTemplatePicker, setShowTemplatePicker] = useState(true);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [openAIDialog, setOpenAIDialog] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [showAutoSaveIndicator, setShowAutoSaveIndicator] = useState(false);
  const [openExitDialog, setOpenExitDialog] = useState(false);
  
  // Load data if editing existing plan
  useEffect(() => {
    const planId = location.state?.planId;
    
    if (planId) {
      // Mock loading existing plan data
      setShowTemplatePicker(false);
      setSelectedTemplate('startup');
      setAnswers({
        business_name: 'Acme Tech Solutions',
        business_tagline: 'Innovating for tomorrow',
        business_type: 'Limited Liability Company (LLC)',
        business_stage: 'Startup (0-2 years)',
        // ... other pre-filled answers would be loaded here
      });
    }
  }, [location.state]);
  
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowTemplatePicker(false);
  };
  
  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };
  
  const handleNext = () => {
    if (activeStep < questionnaireSections.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      // All steps complete, navigate to editor
      navigate('/editor');
    }
  };
  
  const handleBack = () => {
    setActiveStep(Math.max(0, activeStep - 1));
  };
  
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
    
    // Simulate saving answer to state
    dispatch(updateQuestionAnswer({
      sectionId: questionnaireSections[activeStep].id,
      questionId,
      answer: typeof value === 'string' ? value : JSON.stringify(value)
    }));
    
    // Show auto-save indicator
    setAutoSaveStatus('saving');
    setShowAutoSaveIndicator(true);
    
    // Simulate auto-save delay
    setTimeout(() => {
      setAutoSaveStatus('saved');
      dispatch(autoSaveDone());
      
      // Hide indicator after a delay
      setTimeout(() => {
        setShowAutoSaveIndicator(false);
      }, 2000);
    }, 1000);
  };
  
  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    const currentValues = answers[questionId] || [];
    let newValues;
    
    if (checked) {
      newValues = [...currentValues, option];
    } else {
      newValues = currentValues.filter((value: string) => value !== option);
    }
    
    handleAnswerChange(questionId, newValues);
  };
  
  const handleOpenAIDialog = () => {
    setOpenAIDialog(true);
  };
  
  const handleCloseAIDialog = () => {
    setOpenAIDialog(false);
  };
  
  const handleGenerateWithAI = () => {
    setGeneratingAI(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const currentSection = questionnaireSections[activeStep];
      const aiGenerated: Record<string, any> = {};
      
      // Generate mock answers for the current section
      currentSection.questions.forEach(question => {
        if (question.type === 'text' || question.type === 'textarea') {
          aiGenerated[question.id] = `AI-generated response for ${question.question}`;
        } else if (question.type === 'select' || question.type === 'radio') {
          aiGenerated[question.id] = question.options[Math.floor(Math.random() * question.options.length)];
        } else if (question.type === 'checkbox') {
          // Select random number of options
          const numOptions = Math.floor(Math.random() * (question.options.length - 1)) + 1;
          const shuffled = [...question.options].sort(() => 0.5 - Math.random());
          aiGenerated[question.id] = shuffled.slice(0, numOptions);
        }
      });
      
      // Update answers with AI generated content
      setAnswers({
        ...answers,
        ...aiGenerated
      });
      
      // Show notification
      dispatch(showNotification({
        message: 'AI successfully generated responses for this section',
        type: 'success'
      }));
      
      setGeneratingAI(false);
      setOpenAIDialog(false);
    }, 3000);
  };
  
  const handleExit = () => {
    setOpenExitDialog(true);
  };
  
  const confirmExit = () => {
    // Navigate back to dashboard
    navigate('/dashboard');
  };
  
  const renderQuestionnaireContent = () => {
    const currentSection = questionnaireSections[activeStep];
    
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
            {currentSection.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {currentSection.description}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        <Box sx={{ mb: 4 }}>
          {currentSection.questions.map((question) => (
            <Box key={question.id} sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" component="label" htmlFor={question.id} sx={{ fontWeight: 500 }}>
                  {question.question} {question.required && <span style={{ color: theme.palette.error.main }}>*</span>}
                </Typography>
                <Tooltip title="More information" arrow>
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <Help fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {question.type === 'text' && (
                <TextField
                  id={question.id}
                  fullWidth
                  variant="outlined"
                  placeholder={question.placeholder}
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  required={question.required}
                />
              )}
              
              {question.type === 'textarea' && (
                <TextField
                  id={question.id}
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={6}
                  variant="outlined"
                  placeholder={question.placeholder}
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  required={question.required}
                />
              )}
              
              {question.type === 'select' && (
                <FormControl fullWidth required={question.required}>
                  <Select
                    id={question.id}
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      <em>Select an option</em>
                    </MenuItem>
                    {question.options.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              {question.type === 'radio' && (
                <FormControl component="fieldset" required={question.required}>
                  <RadioGroup
                    id={question.id}
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  >
                    {question.options.map((option) => (
                      <FormControlLabel
                        key={option}
                        value={option}
                        control={<Radio />}
                        label={option}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              )}
              
              {question.type === 'checkbox' && (
                <FormControl component="fieldset" required={question.required}>
                  <FormGroup>
                    {question.options.map((option) => (
                      <FormControlLabel
                        key={option}
                        control={
                          <Checkbox
                            checked={answers[question.id]?.includes(option) || false}
                            onChange={(e) => handleCheckboxChange(question.id, option, e.target.checked)}
                          />
                        }
                        label={option}
                      />
                    ))}
                  </FormGroup>
                </FormControl>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    );
  };
  
  const renderTemplatePicker = () => (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
          Choose a Business Plan Template
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select a template that best fits your business type to get started. You can customize it later.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {businessPlanTemplates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                height: '100%',
                transition: 'all 0.2s',
                border: selectedTemplate === template.id 
                  ? `2px solid ${theme.palette.primary.main}` 
                  : '2px solid transparent',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {template.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {template.description}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  Includes {template.sections.length} sections
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          disabled={!selectedTemplate}
          onClick={() => setShowTemplatePicker(false)}
        >
          Continue with This Template
        </Button>
      </Box>
    </Box>
  );
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            {showTemplatePicker ? 'New Business Plan' : 'Business Plan Questionnaire'}
          </Typography>
          
          {!showTemplatePicker && (
            <Typography variant="subtitle1" color="text.secondary">
              {businessPlanTemplates.find(t => t.id === selectedTemplate)?.name || 'Custom'} Template
            </Typography>
          )}
        </Box>
        
        {!showTemplatePicker && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {showAutoSaveIndicator && (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                {autoSaveStatus === 'saving' ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Saving...
                    </Typography>
                  </Box>
                ) : autoSaveStatus === 'saved' ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" color="success.main">
                      Saved
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WarningAmber fontSize="small" color="error" sx={{ mr: 1 }} />
                    <Typography variant="caption" color="error">
                      Error saving
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
            
            <Button
              variant="outlined"
              startIcon={<AutoAwesome />}
              onClick={handleOpenAIDialog}
              sx={{ mr: 2 }}
            >
              Generate with AI
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleExit}
            >
              Exit
            </Button>
          </Box>
        )}
      </Box>
      
      {/* Main content */}
      {showTemplatePicker ? (
        renderTemplatePicker()
      ) : (
        <Grid container spacing={4}>
          {/* Stepper */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, position: 'sticky', top: 24 }}>
              <Stepper
                activeStep={activeStep}
                orientation="vertical"
                nonLinear
              >
                {questionnaireSections.map((section, index) => (
                  <Step key={section.id} completed={false}>
                    <StepButton onClick={() => handleStepChange(index)}>
                      {section.title}
                    </StepButton>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          </Grid>
          
          {/* Questions */}
          <Grid item xs={12} md={9}>
            <Paper sx={{ p: 4 }}>
              {renderQuestionnaireContent()}
              
              <Divider sx={{ mt: 4, mb: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  startIcon={<ArrowBack />}
                >
                  Back
                </Button>
                
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={activeStep < questionnaireSections.length - 1 ? <ArrowForward /> : undefined}
                >
                  {activeStep < questionnaireSections.length - 1 ? 'Continue' : 'Finish & Go to Editor'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* AI Generation Dialog */}
      <Dialog open={openAIDialog} onClose={handleCloseAIDialog}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Brain size={24} color={theme.palette.primary.main} />
            <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
              Generate with AI
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            Let our AI assistant help you complete this section of your business plan. The AI will analyze your business type and generate suggested responses for the current section.
          </DialogContentText>
          <DialogContentText paragraph>
            You can review and edit the AI-generated content before saving it.
          </DialogContentText>
          <Alert severity="info" sx={{ mt: 2 }}>
            AI-generated content is a helpful starting point but should always be reviewed and customized to accurately reflect your specific business.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAIDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleGenerateWithAI}
            disabled={generatingAI}
            startIcon={generatingAI ? <CircularProgress size={16} /> : <AutoAwesome />}
          >
            {generatingAI ? 'Generating...' : 'Generate Responses'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Exit Confirmation Dialog */}
      <Dialog open={openExitDialog} onClose={() => setOpenExitDialog(false)}>
        <DialogTitle>Exit Questionnaire?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your progress has been saved automatically. You can return to continue this questionnaire at any time.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExitDialog(false)}>Cancel</Button>
          <Button onClick={confirmExit} variant="contained" color="primary">
            Exit to Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionnaireWizard;