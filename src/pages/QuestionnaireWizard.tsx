import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Card,
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
  TextField,
  Tooltip,
  Typography,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Alert,
  useTheme,
  Chip,
  useMediaQuery,
  MobileStepper,
  CardActionArea,
  Stack
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Close,
  Help,
  InfoOutlined,
  Save,
  WarningAmber,
  AutoAwesome,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  TouchApp
} from '@mui/icons-material';
import { showNotification } from '../store/slices/uiSlice';
import { updateQuestionAnswer, autoSaveDone, autoSaveError } from '../store/slices/businessPlanSlice';
import { Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedWrapper from '../components/AnimatedWrapper';
import { useAuth } from '../context/AuthProvider';
import { 
  getTemplates, 
  createBusinessPlan, 
  getQuestionnaireSections, 
  getBusinessPlan, 
  saveQuestionnaireAnswers, 
  Template, 
  QuestionnaireSection
} from '../api/businessPlans';

const QuestionnaireWizard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showTemplatePicker, setShowTemplatePicker] = useState(true);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [openAIDialog, setOpenAIDialog] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [showAutoSaveIndicator, setShowAutoSaveIndicator] = useState(false);
  const [openExitDialog, setOpenExitDialog] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState({
    templates: false,
    plan: false,
    creating: false,
    saving: false
  });
  
  // Data states
  const [templates, setTemplates] = useState<Template[]>([]);
  const [questionnaireSections, setQuestionnaireSections] = useState<QuestionnaireSection[]>([]);
  const [businessPlanId, setBusinessPlanId] = useState<string | null>(null);
  const [businessPlanTitle, setBusinessPlanTitle] = useState<string>('');
  const [businessPlanDescription, setBusinessPlanDescription] = useState<string>('');
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  
  // Load templates on component mount
  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(prev => ({ ...prev, templates: true }));
      try {
        const { templates: templateData, error: templateError } = await getTemplates();
        if (templateError) throw templateError;
        setTemplates(templateData);
      } catch (error) {
        console.error('Error loading templates:', error);
        setError('Failed to load templates. Please try again later.');
      } finally {
        setLoading(prev => ({ ...prev, templates: false }));
      }
    };
    
    loadTemplates();
  }, []);
  
  // Load existing business plan if ID is provided
  useEffect(() => {
    const planId = location.state?.planId;
    
    if (planId) {
      setLoading(prev => ({ ...prev, plan: true }));
      
      const loadBusinessPlan = async () => {
        try {
          const { plan, error } = await getBusinessPlan(planId);
          if (error) throw error;
          
          if (plan) {
            setBusinessPlanId(plan.id);
            setBusinessPlanTitle(plan.title);
            setBusinessPlanDescription(plan.description || '');
            setSelectedTemplate(plan.templateId || '');
            setShowTemplatePicker(false);
            
            // Load questionnaire sections
            if (plan.templateId) {
              await loadQuestionnaireSections(plan.templateId);
            }
            
            // Set answers if available
            if (plan.answers) {
              const formattedAnswers: Record<string, any> = {};
              
              // Format answers based on type
              Object.entries(plan.answers).forEach(([questionId, answer]) => {
                // Try to parse JSON string answers 
                if (typeof answer === 'string' && (answer.startsWith('[') || answer.startsWith('{'))) {
                  try {
                    formattedAnswers[questionId] = JSON.parse(answer);
                  } catch (e) {
                    formattedAnswers[questionId] = answer;
                  }
                } else {
                  formattedAnswers[questionId] = answer;
                }
              });
              
              setAnswers(formattedAnswers);
            }
          }
        } catch (error) {
          console.error('Error loading business plan:', error);
          setError('Failed to load business plan. Please try again.');
        } finally {
          setLoading(prev => ({ ...prev, plan: false }));
        }
      };
      
      loadBusinessPlan();
    }
  }, [location.state]);
  
  // Load questionnaire sections when template is selected
  const loadQuestionnaireSections = async (templateId: string) => {
    try {
      const { sections, error } = await getQuestionnaireSections(templateId);
      if (error) throw error;
      setQuestionnaireSections(sections);
    } catch (error) {
      console.error('Error loading questionnaire sections:', error);
      setError('Failed to load questionnaire sections. Please try again.');
      return false;
    }
    return true;
  };
  
  // Handle template selection
  const handleSelectTemplate = async (templateId: string) => {
    setSelectedTemplate(templateId);
    
    // Load questionnaire sections
    const success = await loadQuestionnaireSections(templateId);
    if (success) {
      setShowTemplatePicker(false);
    }
  };
  
  // Handle business plan creation
  const handleCreateBusinessPlan = async () => {
    if (!user?.id || !selectedTemplate || !businessPlanTitle) {
      setError('Missing required information to create business plan');
      return;
    }
    
    setLoading(prev => ({ ...prev, creating: true }));
    try {
      const { plan, error } = await createBusinessPlan(
        user.id,
        selectedTemplate,
        businessPlanTitle,
        businessPlanDescription || undefined
      );
      
      if (error) throw error;
      
      if (plan) {
        setBusinessPlanId(plan.id);
        dispatch(showNotification({
          message: 'Business plan created successfully!',
          type: 'success'
        }));
      }
    } catch (error) {
      console.error('Error creating business plan:', error);
      setError('Failed to create business plan. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, creating: false }));
    }
  };
  
  // Setup business plan when first moving away from template picker
  useEffect(() => {
    const setupBusinessPlan = async () => {
      if (!showTemplatePicker && !businessPlanId && user?.id) {
        // Need to create the business plan
        await handleCreateBusinessPlan();
      }
    };
    
    setupBusinessPlan();
  }, [showTemplatePicker, businessPlanId, user?.id]);
  
  // Handle step change
  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };
  
  // Navigate to next step
  const handleNext = () => {
    if (activeStep < questionnaireSections.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      // All steps complete, navigate to editor
      navigate('/editor', { state: { planId: businessPlanId } });
    }
  };
  
  // Navigate to previous step
  const handleBack = () => {
    setActiveStep(Math.max(0, activeStep - 1));
  };
  
  // Handle answer changes
  const handleAnswerChange = (questionId: string, value: any) => {
    const newAnswers = {
      ...answers,
      [questionId]: value
    };
    
    setAnswers(newAnswers);
    
    // Save to database if we have a business plan ID
    if (businessPlanId) {
      saveAnswer(businessPlanId, questionId, value);
    }
    
    // Simulate saving answer to state
    dispatch(updateQuestionAnswer({
      sectionId: questionnaireSections[activeStep]?.id || '',
      questionId,
      answer: typeof value === 'string' ? value : JSON.stringify(value)
    }));
    
    // Show auto-save indicator
    setAutoSaveStatus('saving');
    setShowAutoSaveIndicator(true);
  };
  
  // Save answer to database
  const saveAnswer = async (planId: string, questionId: string, value: any) => {
    setLoading(prev => ({ ...prev, saving: true }));
    
    try {
      const answerObj = { [questionId]: value };
      
      const { saved, error } = await saveQuestionnaireAnswers(planId, answerObj);
      
      if (error) throw error;
      
      setAutoSaveStatus('saved');
      dispatch(autoSaveDone());
      
      // Hide indicator after a delay
      setTimeout(() => {
        setShowAutoSaveIndicator(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error saving answer:', error);
      setAutoSaveStatus('error');
      dispatch(autoSaveError());
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };
  
  // Handle checkbox changes
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
  
  // Open AI dialog
  const handleOpenAIDialog = () => {
    setOpenAIDialog(true);
  };
  
  // Close AI dialog
  const handleCloseAIDialog = () => {
    setOpenAIDialog(false);
  };
  
  // Generate answers with AI
  const handleGenerateWithAI = () => {
    if (!businessPlanId) return;
    
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
          aiGenerated[question.id] = question.options?.[Math.floor(Math.random() * (question.options?.length || 1))];
        } else if (question.type === 'checkbox') {
          // Select random number of options
          if (question.options && question.options.length > 0) {
            const numOptions = Math.floor(Math.random() * (question.options.length - 1)) + 1;
            const shuffled = [...question.options].sort(() => 0.5 - Math.random());
            aiGenerated[question.id] = shuffled.slice(0, numOptions);
          }
        }
      });
      
      // Update answers with AI generated content
      setAnswers({
        ...answers,
        ...aiGenerated
      });
      
      // Save AI generated answers
      if (businessPlanId) {
        saveQuestionnaireAnswers(businessPlanId, aiGenerated)
          .then(() => {
            // Log AI generation activity
            supabase
              .from('user_activities')
              .insert([{
                user_id: user?.id,
                business_plan_id: businessPlanId,
                activity_type: 'ai_generation',
                description: `Generated AI responses for ${currentSection.title} section`
              }])
              .then(() => {
                // Show notification
                dispatch(showNotification({
                  message: 'AI successfully generated responses for this section',
                  type: 'success'
                }));
              });
          })
          .catch(error => {
            console.error('Error saving AI generated answers:', error);
            dispatch(showNotification({
              message: 'Error saving AI generated answers',
              type: 'error'
            }));
          });
      }
      
      setGeneratingAI(false);
      setOpenAIDialog(false);
    }, 3000);
  };
  
  // Handle exit
  const handleExit = () => {
    setOpenExitDialog(true);
  };
  
  // Confirm exit
  const confirmExit = () => {
    // Navigate back to dashboard
    navigate('/dashboard');
  };
  
  // Business plan title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusinessPlanTitle(e.target.value);
  };
  
  // Business plan description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusinessPlanDescription(e.target.value);
  };
  
  // Render mobile stepper
  const renderMobileStepper = () => (
    <MobileStepper
      variant="dots"
      steps={questionnaireSections.length}
      position="static"
      activeStep={activeStep}
      sx={{ 
        flexGrow: 1, 
        mb: 2, 
        backgroundColor: 'transparent',
        '& .MuiMobileStepper-dot': {
          mx: 0.5,
          width: 8,
          height: 8
        },
        '& .MuiMobileStepper-dotActive': {
          backgroundColor: theme.palette.primary.main
        }
      }}
      nextButton={
        <Button 
          size="small" 
          onClick={handleNext}
          disabled={activeStep === questionnaireSections.length - 1}
          sx={{ minWidth: 'auto' }}
        >
          {activeStep === questionnaireSections.length - 1 ? 'Finish' : 'Next'}
          <KeyboardArrowRight />
        </Button>
      }
      backButton={
        <Button 
          size="small" 
          onClick={handleBack} 
          disabled={activeStep === 0}
          sx={{ minWidth: 'auto' }}
        >
          <KeyboardArrowLeft />
          Back
        </Button>
      }
    />
  );
  
  // Render questionnaire content
  const renderQuestionnaireContent = () => {
    const currentSection = questionnaireSections[activeStep];
    if (!currentSection) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">No questions available for this section.</Typography>
        </Box>
      );
    }
    
    return (
      <Box>
        <Box sx={{ mb: { xs: 2, md: 4 } }}>
          <Typography variant="h5" component="h2" sx={{ 
            fontWeight: 'bold',
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
            mb: 1
          }}>
            {currentSection.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}>
            {currentSection.description}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: { xs: 2, md: 4 } }} />
        
        {isMobile && renderMobileStepper()}
        
        <Box sx={{ mb: { xs: 2, md: 4 } }}>
          {currentSection.questions.map((question) => (
            <Box key={question.id} sx={{ mb: { xs: 3, md: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <Typography 
                  variant="subtitle1" 
                  component="label" 
                  htmlFor={question.id} 
                  sx={{ 
                    fontWeight: 500,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    lineHeight: 1.4,
                    pr: 1,
                    flex: 1
                  }}
                >
                  {question.question} {question.required && <span style={{ color: theme.palette.error.main }}>*</span>}
                </Typography>
                <Tooltip title="More information" arrow>
                  <IconButton size="small" sx={{ ml: 1, mt: 0 }}>
                    <Help fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {question.type === 'text' && (
                <TextField
                  id={question.id}
                  fullWidth
                  variant="outlined"
                  placeholder={question.placeholder || undefined}
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  required={question.required}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5
                    }
                  }}
                />
              )}
              
              {question.type === 'textarea' && (
                <TextField
                  id={question.id}
                  fullWidth
                  multiline
                  minRows={isMobile ? 2 : 3}
                  maxRows={isMobile ? 4 : 6}
                  variant="outlined"
                  placeholder={question.placeholder || undefined}
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  required={question.required}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5
                    }
                  }}
                />
              )}
              
              {question.type === 'select' && question.options && (
                <FormControl 
                  fullWidth 
                  required={question.required}
                  size={isMobile ? "small" : "medium"}
                >
                  <Select
                    id={question.id}
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    displayEmpty
                    sx={{
                      borderRadius: 1.5,
                      '& .MuiSelect-select': {
                        py: isMobile ? 1 : 1.5
                      }
                    }}
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
              
              {question.type === 'radio' && question.options && (
                <FormControl 
                  component="fieldset" 
                  required={question.required} 
                  sx={{ width: '100%' }}
                >
                  <RadioGroup
                    id={question.id}
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    sx={{
                      '& .MuiFormControlLabel-root': {
                        marginY: isMobile ? 0.5 : 1
                      }
                    }}
                  >
                    {question.options.map((option) => (
                      <FormControlLabel
                        key={option}
                        value={option}
                        control={
                          <Radio 
                            sx={{ 
                              padding: isMobile ? 0.5 : 1,
                              '&.Mui-checked': {
                                color: theme.palette.primary.main
                              }
                            }} 
                          />
                        }
                        label={
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: { xs: '0.875rem', sm: '1rem' } 
                            }}
                          >
                            {option}
                          </Typography>
                        }
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              )}
              
              {question.type === 'checkbox' && question.options && (
                <FormControl component="fieldset" required={question.required} sx={{ width: '100%' }}>
                  <FormGroup>
                    {question.options.map((option) => (
                      <FormControlLabel
                        key={option}
                        control={
                          <Checkbox
                            checked={Array.isArray(answers[question.id]) && answers[question.id]?.includes(option) || false}
                            onChange={(e) => handleCheckboxChange(question.id, option, e.target.checked)}
                            sx={{ 
                              padding: isMobile ? 0.5 : 1,
                              '&.Mui-checked': {
                                color: theme.palette.primary.main
                              }
                            }}
                          />
                        }
                        label={
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: { xs: '0.875rem', sm: '1rem' } 
                            }}
                          >
                            {option}
                          </Typography>
                        }
                        sx={{ marginY: isMobile ? 0.5 : 1 }}
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
  
  // Render template picker
  const renderTemplatePicker = () => (
    <Box>
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography variant="h5" component="h2" sx={{ 
          fontWeight: 'bold', 
          mb: 1,
          fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
        }}>
          Choose a Business Plan Template
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{
          fontSize: { xs: '0.875rem', sm: '1rem' }
        }}>
          Select a template that best fits your business type to get started. You can customize it later.
        </Typography>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Business Plan Title"
          placeholder="Enter a title for your business plan"
          value={businessPlanTitle}
          onChange={handleTitleChange}
          required
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Description (optional)"
          placeholder="Briefly describe your business plan"
          value={businessPlanDescription}
          onChange={handleDescriptionChange}
          multiline
          rows={2}
        />
      </Box>
      
      {loading.templates ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            {templates.map((template) => (
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
                >
                  <CardActionArea 
                    onClick={() => setSelectedTemplate(template.id)}
                    sx={{ height: '100%' }}
                  >
                    <Box sx={{ p: { xs: 2, sm: 3 } }}>
                      <Typography variant="h6" component="h3" sx={{ 
                        fontWeight: 'bold', 
                        mb: 1,
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      }}>
                        {template.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        {template.description}
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        Includes {template.sections.length} sections
                      </Typography>
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          disabled={!selectedTemplate || !businessPlanTitle || loading.creating}
          onClick={() => {
            if (selectedTemplate) {
              // Business plan will be created when moving away from template picker
              setShowTemplatePicker(false);
            }
          }}
          size={isMobile ? "medium" : "large"}
          sx={{ 
            px: { xs: 3, sm: 4 },
            py: { xs: 1, sm: 1.5 },
            borderRadius: 2
          }}
        >
          {loading.creating ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Continue with This Template'
          )}
        </Button>
      </Box>
    </Box>
  );
  
  // Step labels for stepper
  const stepLabels = questionnaireSections.map(section => section.title);
  
  return (
    <AnimatedWrapper animation="fadeIn">
      <Box sx={{ px: { xs: 1, sm: 2 } }}>
        {/* Header */}
        <Box sx={{ 
          mb: { xs: 2, sm: 4 }, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' }
            }}>
              {showTemplatePicker ? 'New Business Plan' : 'Business Plan Questionnaire'}
            </Typography>
            
            {!showTemplatePicker && (
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                {templates.find(t => t.id === selectedTemplate)?.name || 'Custom'} Template
              </Typography>
            )}
          </Box>
          
          {!showTemplatePicker && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 1,
              width: { xs: '100%', sm: 'auto' }
            }}>
              {showAutoSaveIndicator && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  mb: { xs: 1, sm: 0 },
                  mr: { sm: 2 }
                }}>
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
                sx={{ 
                  mb: { xs: 1, sm: 0 }, 
                  mr: { sm: 2 },
                  width: { xs: '100%', sm: 'auto' }
                }}
                size={isMobile ? "medium" : "large"}
              >
                Generate with AI
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleExit}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
                size={isMobile ? "medium" : "large"}
              >
                Exit
              </Button>
            </Box>
          )}
        </Box>
        
        {/* Main content */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        
        {showTemplatePicker ? (
          renderTemplatePicker()
        ) : (
          <Grid container spacing={{ xs: 2, md: 4 }}>
            {/* Desktop Stepper */}
            {!isMobile && (
              <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
                <Paper sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  position: 'sticky', 
                  top: { xs: 80, md: 24 },
                  borderRadius: 2,
                  boxShadow: theme.shadows[2]
                }}>
                  <Stepper
                    activeStep={activeStep}
                    orientation="vertical"
                    nonLinear
                    sx={{
                      '& .MuiStepLabel-root': {
                        padding: theme.spacing(1, 0)
                      },
                      '& .MuiStepConnector-line': {
                        minHeight: 20
                      }
                    }}
                  >
                    {questionnaireSections.map((section, index) => (
                      <Step key={section.id} completed={false}>
                        <StepButton onClick={() => handleStepChange(index)}>
                          <Typography 
                            variant="body2"
                            sx={{ 
                              fontWeight: activeStep === index ? 'bold' : 'normal',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                          >
                            {section.title}
                          </Typography>
                        </StepButton>
                      </Step>
                    ))}
                  </Stepper>
                </Paper>
              </Grid>
            )}
            
            {/* Tablet Stepper - Horizontal */}
            {!isMobile && isTablet && (
              <Grid item xs={12} sx={{ display: { md: 'none' } }}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Stepper 
                    activeStep={activeStep} 
                    alternativeLabel
                    sx={{
                      '& .MuiStepLabel-labelContainer': {
                        mt: 0.5,
                      }
                    }}
                  >
                    {questionnaireSections.map((section, index) => (
                      <Step key={section.id}>
                        <StepLabel 
                          onClick={() => handleStepChange(index)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <Typography variant="caption">
                            {section.title}
                          </Typography>
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Paper>
              </Grid>
            )}
            
            {/* Questions */}
            <Grid item xs={12} md={9}>
              <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
                {loading.plan ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  renderQuestionnaireContent()
                )}
                
                <Divider sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 2, sm: 2 } }} />
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 2, sm: 0 }
                }}>
                  {!isMobile && (
                    <>
                      <Button
                        onClick={handleBack}
                        disabled={activeStep === 0}
                        startIcon={<ArrowBack />}
                        size={isMobile ? "medium" : "large"}
                        sx={{ 
                          width: { xs: '100%', sm: 'auto' },
                          order: { xs: 2, sm: 1 }
                        }}
                      >
                        Back
                      </Button>
                      
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        endIcon={activeStep < questionnaireSections.length - 1 ? <ArrowForward /> : undefined}
                        size={isMobile ? "medium" : "large"}
                        sx={{ 
                          width: { xs: '100%', sm: 'auto' },
                          order: { xs: 1, sm: 2 }
                        }}
                      >
                        {activeStep < questionnaireSections.length - 1 ? 'Continue' : 'Finish & Go to Editor'}
                      </Button>
                    </>
                  )}
                  
                  {/* Mobile Navigation Buttons */}
                  {isMobile && (
                    <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        disabled={activeStep === 0}
                        startIcon={<ArrowBack />}
                        size="medium"
                        sx={{ flex: 1 }}
                      >
                        Back
                      </Button>
                      
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        endIcon={activeStep < questionnaireSections.length - 1 ? <ArrowForward /> : undefined}
                        size="medium"
                        sx={{ flex: 1 }}
                      >
                        {activeStep < questionnaireSections.length - 1 ? 'Next' : 'Finish'}
                      </Button>
                    </Stack>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
        
        {/* AI Generation Dialog */}
        <Dialog 
          open={openAIDialog} 
          onClose={handleCloseAIDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: { xs: 2, sm: 3 },
              px: { xs: 1, sm: 2 },
              py: { xs: 1, sm: 1 },
              width: { xs: '95%', sm: '100%' },
              m: { xs: 1, sm: 2 }
            }
          }}
        >
          <DialogTitle sx={{ pt: { xs: 2, sm: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Brain size={isMobile ? 20 : 24} color={theme.palette.primary.main} />
              <Typography 
                variant="h6" 
                sx={{ 
                  ml: 1, 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                Generate with AI
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <DialogContentText 
              paragraph
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Let our AI assistant help you complete this section of your business plan. The AI will analyze your business type and generate suggested responses for the current section.
            </DialogContentText>
            <DialogContentText 
              paragraph
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              You can review and edit the AI-generated content before saving it.
            </DialogContentText>
            <Alert 
              severity="info" 
              sx={{ 
                mt: 2,
                '& .MuiAlert-message': { 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' } 
                }
              }}
            >
              AI-generated content is a helpful starting point but should always be reviewed and customized to accurately reflect your specific business.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
            <Button 
              onClick={handleCloseAIDialog}
              size={isMobile ? "small" : "medium"}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleGenerateWithAI}
              disabled={generatingAI}
              startIcon={generatingAI ? <CircularProgress size={16} /> : <AutoAwesome />}
              size={isMobile ? "small" : "medium"}
            >
              {generatingAI ? 'Generating...' : 'Generate Responses'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Exit Confirmation Dialog */}
        <Dialog 
          open={openExitDialog} 
          onClose={() => setOpenExitDialog(false)}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: {
              borderRadius: { xs: 2, sm: 3 },
              width: { xs: '95%', sm: '100%' }
            }
          }}
        >
          <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            Exit Questionnaire?
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Your progress has been saved automatically. You can return to continue this questionnaire at any time.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 2 }}>
            <Button 
              onClick={() => setOpenExitDialog(false)}
              size={isMobile ? "small" : "medium"}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmExit} 
              variant="contained" 
              color="primary"
              size={isMobile ? "small" : "medium"}
            >
              Exit to Dashboard
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Error Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setError(null)} 
            severity="error"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </AnimatedWrapper>
  );
};

export default QuestionnaireWizard;