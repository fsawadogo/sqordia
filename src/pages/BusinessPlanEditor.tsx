import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Alert,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  Chip,
  Zoom,
  Fade,
  useMediaQuery,
  Collapse,
  SwipeableDrawer
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Preview as PreviewIcon,
  Share as ShareIcon,
  Check as CheckIcon,
  Description as DescriptionIcon,
  Title as TitleIcon,
  Business as BusinessIcon,
  PeopleAlt as PeopleAltIcon,
  BarChart as BarChartIcon,
  Payments as PaymentsIcon,
  Settings as SettingsIcon,
  AutoAwesome as AutoAwesomeIcon,
  Loop as LoopIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon
} from '@mui/icons-material';
import { Brain, FileText, Share2 } from 'lucide-react';
import { updateSectionContent, autoSaveDone } from '../store/slices/businessPlanSlice';
import { showNotification } from '../store/slices/uiSlice';
import AnimatedWrapper from '../components/AnimatedWrapper';

// Mock business plan data
const businessPlanData = {
  id: '1',
  title: 'Tech Startup',
  createdAt: '2025-05-05T10:00:00Z',
  updatedAt: '2025-05-15T14:30:00Z',
  template: {
    id: 'startup',
    name: 'Tech Startup',
    description: 'Perfect for software, SaaS, or tech product companies',
    sections: ['executive_summary', 'company_overview', 'product', 'market_analysis', 'strategy', 'team', 'financials', 'appendix']
  },
  sections: [
    {
      id: 'executive_summary',
      title: 'Executive Summary',
      icon: <DescriptionIcon />,
      content: '<h2>Executive Summary</h2><p>Acme Tech Solutions is a software company that develops AI-powered tools for small businesses. Our flagship product, DataInsight, helps small business owners make better decisions through automated data analysis.</p><p>Founded in 2025, our mission is to democratize access to sophisticated data analysis tools that were previously only available to enterprise companies with large budgets.</p><p>With a growing market of over 30 million small businesses in the United States alone, we are positioning ourselves to capture significant market share by offering an affordable, user-friendly solution that delivers immediate value.</p>'
    },
    {
      id: 'company_overview',
      title: 'Company Overview',
      icon: <BusinessIcon />,
      content: '<h2>Company Overview</h2><p>Acme Tech Solutions is a Delaware C-Corporation founded in January 2025 by Jane Smith and John Doe. The company is headquartered in Austin, Texas with a remote team across the United States.</p><p>Our mission is to empower small businesses with enterprise-grade data analysis tools that are affordable, accessible, and actionable.</p><p>The company is currently in the seed stage, having raised $500,000 from angel investors to develop and launch our first product.</p>'
    },
    {
      id: 'product',
      title: 'Product & Services',
      icon: <TitleIcon />,
      content: '<h2>Product & Services</h2><p>DataInsight is a SaaS platform that connects to a small business\'s existing tools (accounting software, CRM, e-commerce platforms) and automatically generates actionable insights and recommendations.</p><p>Key features include:</p><ul><li>Automated financial health analysis</li><li>Customer segmentation and behavior insights</li><li>Inventory optimization recommendations</li><li>Cash flow forecasting</li><li>Competitor benchmarking</li></ul><p>The platform is designed to be user-friendly, requiring no technical expertise to implement or use. All insights are presented in plain language with clear recommendations.</p>'
    },
    {
      id: 'market_analysis',
      title: 'Market Analysis',
      icon: <BarChartIcon />,
      content: '<h2>Market Analysis</h2><p>The global small business analytics market is projected to reach $10 billion by 2027, growing at a CAGR of 14%. This growth is driven by:</p><ul><li>Increasing digitization of small businesses</li><li>Growing awareness of data-driven decision making</li><li>Decreasing cost of data storage and processing</li><li>Rising competition necessitating better business intelligence</li></ul><p>Our target market consists of small businesses with 5-100 employees across various industries, with a particular focus on retail, professional services, and food service businesses.</p>'
    },
    {
      id: 'strategy',
      title: 'Business Strategy',
      icon: <SettingsIcon />,
      content: '<h2>Business Strategy</h2><p>Our go-to-market strategy focuses on a freemium model to drive adoption, with tiered pricing based on business size and feature access.</p><p>Key strategic initiatives include:</p><ul><li>Partnerships with small business service providers (accountants, consultants)</li><li>Content marketing focused on small business data literacy and success stories</li><li>Integration marketplace to connect with popular small business tools</li><li>Regional expansion targeting English-speaking markets first, followed by localization</li></ul>'
    },
    {
      id: 'team',
      title: 'Management & Team',
      icon: <PeopleAltIcon />,
      content: '<h2>Management & Team</h2><p>Our leadership team brings together expertise in software development, data science, and small business operations:</p><ul><li><strong>Jane Smith, CEO:</strong> 10+ years experience in B2B SaaS companies, previously VP of Product at DataCorp</li><li><strong>John Doe, CTO:</strong> Former Lead Engineer at TechGiant, with expertise in AI and machine learning</li><li><strong>Sarah Johnson, CMO:</strong> 15+ years in small business marketing, former marketing director at SmallBiz Association</li></ul><p>The company currently employs 10 full-time staff across engineering, data science, marketing, and customer success.</p>'
    },
    {
      id: 'financials',
      title: 'Financial Plan',
      icon: <PaymentsIcon />,
      content: '<h2>Financial Plan</h2><p>Our financial projections show a path to profitability within 24 months:</p><table border="1" cellpadding="5"><tr><th></th><th>Year 1</th><th>Year 2</th><th>Year 3</th></tr><tr><td>Revenue</td><td>$250,000</td><td>$1.2M</td><td>$3.5M</td></tr><tr><td>Expenses</td><td>$750,000</td><td>$1.1M</td><td>$2.2M</td></tr><tr><td>Net Income</td><td>-$500,000</td><td>$100,000</td><td>$1.3M</td></tr></table><p>Key financial assumptions:</p><ul><li>Average customer lifetime value: $2,000</li><li>Customer acquisition cost: $500 (initial, decreasing over time)</li><li>Monthly churn rate: 5% (improving to 3% by Year 3)</li><li>Gross margin: 85%</li></ul>'
    },
    {
      id: 'appendix',
      title: 'Appendix',
      icon: <DescriptionIcon />,
      content: '<h2>Appendix</h2><p>Additional supporting information and documentation:</p><ul><li>Detailed market research reports</li><li>Competitor analysis</li><li>Product development roadmap</li><li>Customer testimonials and case studies</li><li>Marketing collateral</li><li>Detailed financial projections</li></ul>'
    }
  ]
};

const BusinessPlanEditor: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const editorRef = useRef<ReactQuill | null>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Define drawerWidth constant before it's used
  const drawerWidth = 240;
  
  // Animation variants
  const sidebarVariants = {
    open: { width: drawerWidth, opacity: 1 },
    closed: { width: 0, opacity: 0 }
  };
  
  const [businessPlan, setBusinessPlan] = useState(businessPlanData);
  const [selectedSection, setSelectedSection] = useState(businessPlanData.sections[0].id);
  const [content, setContent] = useState(businessPlanData.sections[0].content);
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('view');
  const [optionsMenuAnchor, setOptionsMenuAnchor] = useState<null | HTMLElement>(null);
  const [notification, setNotification] = useState<{ open: boolean, message: string, type: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    type: 'info'
  });
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // Load business plan if ID is provided
  useEffect(() => {
    const planId = location.state?.planId;
    
    if (planId) {
      setLoading(true);
      
      // Simulate loading data
      setTimeout(() => {
        // In a real app, fetch the plan data from API
        setBusinessPlan(businessPlanData);
        setSelectedSection(businessPlanData.sections[0].id);
        setContent(businessPlanData.sections[0].content);
        setLoading(false);
      }, 1000);
    }
  }, [location.state]);
  
  // Adjust sidebar state based on screen size
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);
  
  // Quill editor modules/formats configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'image', 'align'
  ];
  
  // Handlers
  const handleSectionChange = (sectionId: string) => {
    // Auto-save current content before switching
    autoSaveContent();
    
    const section = businessPlan.sections.find(s => s.id === sectionId);
    if (section) {
      setSelectedSection(sectionId);
      setContent(section.content);
    }
  };
  
  const handleEditorChange = (value: string) => {
    setContent(value);
  };
  
  const autoSaveContent = () => {
    // Update local state
    setBusinessPlan(prev => ({
      ...prev,
      sections: prev.sections.map(section => 
        section.id === selectedSection 
          ? { ...section, content: content }
          : section
      ),
      updatedAt: new Date().toISOString()
    }));
    
    // Dispatch to Redux store
    dispatch(updateSectionContent({
      sectionId: selectedSection,
      content: content
    }));
    
    // Show auto-save notification
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      dispatch(autoSaveDone());
    }, 1000);
  };
  
  const handleSave = () => {
    autoSaveContent();
    
    // Show success notification
    setNotification({
      open: true,
      message: 'Business plan saved successfully',
      type: 'success'
    });
  };
  
  const handlePreviewToggle = () => {
    if (isEditing) {
      // Switching to preview mode, save content first
      autoSaveContent();
    }
    setIsEditing(!isEditing);
    setShowPreview(!showPreview);
  };
  
  const handleOpenExportDialog = () => {
    setOpenExportDialog(true);
    setOptionsMenuAnchor(null);
  };
  
  const handleExport = () => {
    setLoading(true);
    
    // Simulate export process
    setTimeout(() => {
      setLoading(false);
      setOpenExportDialog(false);
      
      // Show success notification
      setNotification({
        open: true,
        message: `Business plan exported as ${exportFormat.toUpperCase()} successfully`,
        type: 'success'
      });
    }, 2000);
  };
  
  const handleOpenShareDialog = () => {
    setOpenShareDialog(true);
    setOptionsMenuAnchor(null);
  };
  
  const handleShare = () => {
    setLoading(true);
    
    // Simulate sharing process
    setTimeout(() => {
      setLoading(false);
      setOpenShareDialog(false);
      setShareEmail('');
      
      // Show success notification
      setNotification({
        open: true,
        message: `Business plan shared with ${shareEmail} successfully`,
        type: 'success'
      });
    }, 1500);
  };
  
  const handleOpenGenerateDialog = () => {
    setOpenGenerateDialog(true);
  };
  
  const handleGenerateWithAI = () => {
    setAiGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      // Mock AI-generated content
      const aiContent = `<h2>${businessPlan.sections.find(s => s.id === selectedSection)?.title}</h2>
      <p>This is AI-generated content for your business plan. It includes detailed information about this section based on your questionnaire answers and business type.</p>
      <p>Our AI has analyzed similar businesses in your industry and provided recommendations that are tailored to your specific circumstances.</p>
      <ul>
        <li>Key point 1 about this section</li>
        <li>Key point 2 with specific details relevant to your business</li>
        <li>Key point 3 with data-backed insights</li>
        <li>Key point 4 with strategic recommendations</li>
      </ul>
      <p>This section is crucial for your business plan because it demonstrates your understanding of the market and your strategic positioning.</p>`;
      
      // Update editor content
      setContent(aiContent);
      
      setAiGenerating(false);
      setOpenGenerateDialog(false);
      
      // Show success notification
      dispatch(showNotification({
        message: 'AI-generated content added successfully',
        type: 'success'
      }));
    }, 3000);
  };
  
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  const handleOptionsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOptionsMenuAnchor(event.currentTarget);
  };
  
  const handleCloseOptionsMenu = () => {
    setOptionsMenuAnchor(null);
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Find current section
  const currentSection = businessPlan.sections.find(section => section.id === selectedSection);
  
  // If loading, show loading indicator
  if (loading && !currentSection) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} color="primary" />
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            {businessPlan.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last updated: {new Date(businessPlan.updatedAt).toLocaleString()}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {saving && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <Typography variant="caption" color="text.secondary">
                {t('businessPlan.saving')}
              </Typography>
            </Box>
          )}
          
          <Button
            variant="outlined"
            startIcon={<AutoAwesomeIcon color="inherit" />}
            onClick={handleOpenGenerateDialog}
            sx={{ mr: { xs: 1, md: 2 }, display: { xs: 'none', sm: 'flex' } }}
          >
            {t('businessPlan.generateWithAI')}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<PreviewIcon color="inherit" />}
            onClick={handlePreviewToggle}
            sx={{ mr: { xs: 1, md: 2 }, display: { xs: 'none', sm: 'flex' } }}
          >
            {showPreview ? t('businessPlan.edit') : t('businessPlan.preview')}
          </Button>
          
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ mr: { xs: 1, md: 2 } }}
          >
            {t('businessPlan.save')}
          </Button>
          
          <Tooltip title="More options" TransitionComponent={Zoom}>
            <IconButton 
              onClick={handleOptionsMenu}
              sx={{
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.1)' 
                    : 'rgba(0,0,0,0.08)'
                }
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={optionsMenuAnchor}
            open={Boolean(optionsMenuAnchor)}
            onClose={handleCloseOptionsMenu}
            PaperProps={{
              elevation: 4,
              sx: {
                borderRadius: 2,
                mt: 1.5
              }
            }}
          >
            <MenuItem onClick={handleOpenExportDialog}>
              <ListItemIcon>
                <DownloadIcon fontSize="small" sx={{ color: theme.palette.info.main }} />
              </ListItemIcon>
              <ListItemText>{t('common.export')}</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleOpenShareDialog}>
              <ListItemIcon>
                <ShareIcon fontSize="small" sx={{ color: theme.palette.secondary.main }} />
              </ListItemIcon>
              <ListItemText>{t('common.share')}</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleCloseOptionsMenu}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>{t('common.delete')}</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Mobile Sidebar Toggle */}
        {isMobile && (
          <IconButton
            onClick={toggleSidebar}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1200,
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              boxShadow: theme.shadows[6],
              '&:hover': {
                backgroundColor: theme.palette.primary.dark
              }
            }}
          >
            {sidebarOpen ? <KeyboardArrowLeftIcon /> : <KeyboardArrowRightIcon />}
          </IconButton>
        )}
        
        {/* Sections Navigation */}
        <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Paper 
            sx={{ 
              position: 'sticky', 
              top: 84, // Below app bar
              maxHeight: 'calc(100vh - 100px)',
              overflowY: 'auto',
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: theme.shadows[8]
              }
            }}
          >
            <List component="nav" aria-label="business plan sections" dense={isMobile}>
              {businessPlan.sections.map((section) => (
                <ListItemButton
                  key={section.id}
                  selected={selectedSection === section.id}
                  onClick={() => handleSectionChange(section.id)}
                  sx={{
                    borderLeft: selectedSection === section.id 
                      ? `4px solid ${theme.palette.primary.main}` 
                      : '4px solid transparent',
                    transition: 'all 0.2s',
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(59, 130, 246, 0.15)' 
                        : 'rgba(59, 130, 246, 0.08)'
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(59, 130, 246, 0.2)' 
                        : 'rgba(59, 130, 246, 0.12)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                    {React.cloneElement(section.icon, { 
                      sx: { color: selectedSection === section.id ? theme.palette.primary.main : theme.palette.text.primary }
                    })}
                  </ListItemIcon>
                  <ListItemText primary={section.title} />
                  {selectedSection === section.id && <CheckIcon fontSize="small" color="primary" />}
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Mobile Sidebar Drawer */}
        {isMobile && (
          <SwipeableDrawer
            anchor="left"
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onOpen={() => setSidebarOpen(true)}
            sx={{
              '& .MuiDrawer-paper': {
                width: 280,
                borderRadius: '0 16px 16px 0',
                boxShadow: theme.shadows[10],
                mt: '64px', // Height of AppBar
                height: 'calc(100% - 64px)'
              }
            }}
          >
            <List component="nav" aria-label="business plan sections" dense>
              {businessPlan.sections.map((section) => (
                <ListItemButton
                  key={section.id}
                  selected={selectedSection === section.id}
                  onClick={() => {
                    handleSectionChange(section.id);
                    setSidebarOpen(false);
                  }}
                  sx={{
                    borderLeft: selectedSection === section.id 
                      ? `4px solid ${theme.palette.primary.main}` 
                      : '4px solid transparent'
                  }}
                >
                  <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                    {React.cloneElement(section.icon, { 
                      sx: { color: selectedSection === section.id ? theme.palette.primary.main : theme.palette.text.primary }
                    })}
                  </ListItemIcon>
                  <ListItemText primary={section.title} />
                  {selectedSection === section.id && <CheckIcon fontSize="small" color="primary" />}
                </ListItemButton>
              ))}
            </List>
          </SwipeableDrawer>
        )}
        
        {/* Editor */}
        <Grid item xs={12} md={9}>
          <Paper 
            sx={{ 
              p: { xs: 2, md: 3 },
              borderRadius: 2,
              transition: 'all 0.3s',
              '&:hover': {
                boxShadow: theme.shadows[8]
              }
            }}
          >
            {showPreview ? (
              // Preview mode
              <div>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
                    {currentSection?.title}
                  </Typography>
                  
                  <Box
                    sx={{ 
                      minHeight: '500px',
                      p: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      '& table': { borderCollapse: 'collapse' },
                      '& td, & th': { border: `1px solid ${theme.palette.divider}`, padding: '8px' }
                    }}
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                </Box>
              </div>
            ) : (
              // Edit mode
              <div>
                <Box>
                  <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 'bold', px: 1 }}>
                    {currentSection?.title}
                  </Typography>
                  
                  <Box sx={{ 
                    height: { xs: '400px', md: '500px' }, 
                    '.ql-container': { height: { xs: '350px', md: '450px' } },
                    '.ql-editor': { fontSize: '14px', fontFamily: 'Inter, sans-serif' }
                  }}>
                    <ReactQuill
                      ref={editorRef}
                      theme="snow"
                      value={content}
                      onChange={handleEditorChange}
                      modules={modules}
                      formats={formats}
                      onBlur={autoSaveContent}
                      placeholder="Start typing your content here..."
                    />
                  </Box>
                </Box>
              </div>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button 
                startIcon={<KeyboardArrowLeftIcon />}
                disabled={businessPlan.sections[0].id === selectedSection}
                onClick={() => {
                  const currentIndex = businessPlan.sections.findIndex(s => s.id === selectedSection);
                  if (currentIndex > 0) {
                    handleSectionChange(businessPlan.sections[currentIndex - 1].id);
                  }
                }}
                sx={{ 
                  color: theme.palette.text.primary,
                  '&:not(:disabled):hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(0,0,0,0.05)'
                  }
                }}
              >
                {t('businessPlan.previousSection')}
              </Button>
              
              <Button 
                endIcon={<KeyboardArrowRightIcon />}
                disabled={businessPlan.sections[businessPlan.sections.length - 1].id === selectedSection}
                onClick={() => {
                  const currentIndex = businessPlan.sections.findIndex(s => s.id === selectedSection);
                  if (currentIndex < businessPlan.sections.length - 1) {
                    handleSectionChange(businessPlan.sections[currentIndex + 1].id);
                  }
                }}
                sx={{ 
                  color: theme.palette.text.primary,
                  '&:not(:disabled):hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(0,0,0,0.05)'
                  }
                }}
              >
                {t('businessPlan.nextSection')}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* AI Generation Dialog */}
      <Dialog 
        open={openGenerateDialog} 
        onClose={() => setOpenGenerateDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Brain size={24} color={theme.palette.primary.main} />
            <Typography sx={{ ml: 1, fontWeight: 'bold' }}>
              {t('businessPlan.aiDialogTitle')}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            {t('businessPlan.aiDialogDesc')}
          </DialogContentText>
          <DialogContentText paragraph>
            {t('businessPlan.aiDialogReview')}
          </DialogContentText>
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('businessPlan.aiDialogWarning')}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGenerateDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button 
            variant="contained" 
            onClick={handleGenerateWithAI}
            disabled={aiGenerating}
            startIcon={aiGenerating ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
          >
            {aiGenerating ? t('businessPlan.generating') : t('businessPlan.generateContent')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Export Dialog */}
      <Dialog 
        open={openExportDialog} 
        onClose={() => setOpenExportDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DownloadIcon color="primary" />
            <Typography sx={{ ml: 1, fontWeight: 'bold' }}>
              {t('businessPlan.exportDialogTitle')}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('businessPlan.exportDialogDesc')}
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t('businessPlan.exportFormat')}</InputLabel>
              <Select
                value={exportFormat}
                label={t('businessPlan.exportFormat')}
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <MenuItem value="pdf">PDF Document</MenuItem>
                <MenuItem value="docx">Word Document (DOCX)</MenuItem>
                <MenuItem value="pptx">PowerPoint Presentation (PPTX)</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>{t('businessPlan.sectionsToInclude')}</InputLabel>
              <Select
                multiple
                value={businessPlan.sections.map(s => s.id)}
                label={t('businessPlan.sectionsToInclude')}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => {
                      const section = businessPlan.sections.find(s => s.id === value);
                      return (
                        <Chip 
                          key={value} 
                          label={section?.title} 
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {businessPlan.sections.map((section) => (
                  <MenuItem key={section.id} value={section.id}>
                    {section.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExportDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button 
            variant="contained" 
            onClick={handleExport}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <DownloadIcon />}
          >
            {loading ? t('businessPlan.exporting') : t('common.export')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Share Dialog */}
      <Dialog 
        open={openShareDialog} 
        onClose={() => setOpenShareDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Share2 size={20} color={theme.palette.primary.main} />
            <Typography sx={{ ml: 1, fontWeight: 'bold' }}>
              {t('businessPlan.shareDialogTitle')}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('businessPlan.shareDialogDesc')}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            sx={{ mb: 2, mt: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>{t('businessPlan.permission')}</InputLabel>
            <Select
              value={sharePermission}
              label={t('businessPlan.permission')}
              onChange={(e) => setSharePermission(e.target.value)}
            >
              <MenuItem value="view">{t('businessPlan.viewOnly')}</MenuItem>
              <MenuItem value="comment">{t('businessPlan.canComment')}</MenuItem>
              <MenuItem value="edit">{t('businessPlan.canEdit')}</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenShareDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button 
            variant="contained" 
            onClick={handleShare}
            disabled={loading || !shareEmail}
            startIcon={loading ? <CircularProgress size={16} /> : <Share2 size={16} />}
          >
            {loading ? t('businessPlan.sharing') : t('common.share')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.type} 
          variant="filled"
          sx={{ width: '100%', boxShadow: theme.shadows[6] }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BusinessPlanEditor;