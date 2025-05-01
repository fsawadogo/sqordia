import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  useTheme,
  Alert,
  Tooltip,
  Chip,
  SelectChangeEvent,
  Snackbar
} from '@mui/material';
import {
  Close as CloseIcon,
  FileDownload as FileDownloadIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  RemoveCircleOutline as EmptyIcon,
  ContentCopy as ContentCopyIcon,
  Download as DownloadIcon,
  Article as ArticleIcon,
  TableChart as TableChartIcon,
  Numbers as NumbersIcon
} from '@mui/icons-material';
import { FileText, Download } from 'lucide-react';
import { exportBusinessPlan } from '../api/export';

interface Section {
  id: string;
  title: string;
  content: string | null;
}

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  sections: Section[];
  businessPlanTitle: string;
  businessPlanId: string;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onClose,
  sections,
  businessPlanTitle,
  businessPlanId
}) => {
  const theme = useTheme();
  
  // State
  const [exportFormat, setExportFormat] = useState<string>('pdf');
  const [selectedSections, setSelectedSections] = useState<string[]>(
    sections.map(section => section.id)
  );
  const [includeTitle, setIncludeTitle] = useState(true);
  const [includeTOC, setIncludeTOC] = useState(true);
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle format change
  const handleFormatChange = (event: SelectChangeEvent<string>) => {
    setExportFormat(event.target.value);
  };
  
  // Handle section selection
  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
  };
  
  // Select or deselect all sections
  const handleSelectAll = () => {
    setSelectedSections(sections.map(section => section.id));
  };
  
  const handleDeselectAll = () => {
    setSelectedSections([]);
  };
  
  // Handle export
  const handleExport = async () => {
    if (selectedSections.length === 0) {
      setError("Please select at least one section to export");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Call the exportBusinessPlan function from the API with the valid businessPlanId
      const { success, error } = await exportBusinessPlan(businessPlanId, {
        format: exportFormat as 'pdf' | 'docx' | 'pptx' | 'html' | 'txt',
        includeTitle,
        includeTOC,
        includePageNumbers,
        sections: selectedSections
      });
      
      if (error) throw error;
      
      if (success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Error exporting business plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to export business plan');
    } finally {
      setLoading(false);
    }
  };
  
  // Reset state on dialog close
  const handleClose = () => {
    setError(null);
    onClose();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        bgcolor: theme.palette.primary.main,
        color: 'white',
        py: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FileText size={24} style={{ marginRight: 12 }} />
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            Export Business Plan
          </Typography>
        </Box>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={handleClose} 
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Export Options
            </Typography>
            
            <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
              <InputLabel id="export-format-label">Format</InputLabel>
              <Select
                labelId="export-format-label"
                id="export-format"
                value={exportFormat}
                onChange={handleFormatChange}
                label="Format"
              >
                <MenuItem value="pdf">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      component="img" 
                      src="https://cdn-icons-png.flaticon.com/512/337/337946.png" 
                      alt="PDF" 
                      sx={{ width: 24, height: 24, mr: 1 }}
                    />
                    PDF Document
                  </Box>
                </MenuItem>
                <MenuItem value="docx">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      component="img" 
                      src="https://cdn-icons-png.flaticon.com/512/337/337932.png" 
                      alt="Word" 
                      sx={{ width: 24, height: 24, mr: 1 }}
                    />
                    Word Document (DOCX)
                  </Box>
                </MenuItem>
                <MenuItem value="pptx">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      component="img" 
                      src="https://cdn-icons-png.flaticon.com/512/337/337949.png" 
                      alt="PowerPoint" 
                      sx={{ width: 24, height: 24, mr: 1 }}
                    />
                    PowerPoint (PPTX)
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
            
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
              Document Options
            </Typography>
            
            <FormGroup>
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={includeTitle} 
                    onChange={(e) => setIncludeTitle(e.target.checked)}
                  />
                } 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ArticleIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 20 }} />
                    <Typography variant="body2">Include title page</Typography>
                  </Box>
                }
              />
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={includeTOC} 
                    onChange={(e) => setIncludeTOC(e.target.checked)}
                  />
                } 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TableChartIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 20 }} />
                    <Typography variant="body2">Include table of contents</Typography>
                  </Box>
                }
              />
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={includePageNumbers} 
                    onChange={(e) => setIncludePageNumbers(e.target.checked)}
                  />
                } 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <NumbersIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 20 }} />
                    <Typography variant="body2">Include page numbers</Typography>
                  </Box>
                }
              />
            </FormGroup>
            
            <Box sx={{ mt: 3, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.03)', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Preview
              </Typography>
              <Box 
                component="img" 
                src={`/preview-${exportFormat}.png`}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                alt="Export preview" 
                sx={{ 
                  width: '100%', 
                  height: 'auto', 
                  maxHeight: 150,
                  objectFit: 'contain',
                  borderRadius: 1,
                  display: 'block',
                  mx: 'auto',
                  border: `1px solid ${theme.palette.divider}`
                }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Sections to Include
              </Typography>
              
              <Box>
                <Button 
                  color="primary" 
                  onClick={handleSelectAll}
                  size="small"
                  sx={{ mr: 1, fontWeight: 500 }}
                >
                  Select All
                </Button>
                <Button 
                  color="primary" 
                  onClick={handleDeselectAll}
                  size="small"
                  sx={{ fontWeight: 500 }}
                >
                  Deselect All
                </Button>
              </Box>
            </Box>
            
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 0, 
                maxHeight: 300, 
                overflow: 'auto',
                borderRadius: 2,
                borderColor: theme.palette.divider,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
                }
              }}
            >
              <Box sx={{ p: 2 }}>
                {sections.map((section) => (
                  <Box 
                    key={section.id}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      py: 1.5,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      '&:last-child': {
                        borderBottom: 'none'
                      }
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedSections.includes(section.id)}
                          onChange={() => handleSectionToggle(section.id)}
                          color="primary"
                          sx={{ 
                            '& .MuiSvgIcon-root': { 
                              fontSize: 24,
                              color: selectedSections.includes(section.id) ? theme.palette.primary.main : undefined
                            }
                          }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {section.title}
                          </Typography>
                          {section.content ? (
                            <Chip 
                              icon={<CheckCircleIcon fontSize="small" />}
                              label="Content ready" 
                              size="small" 
                              color="success"
                              variant="outlined"
                              sx={{ ml: 2, height: 24 }}
                            />
                          ) : (
                            <Chip 
                              icon={<EmptyIcon fontSize="small" />}
                              label="Empty" 
                              size="small" 
                              color="default"
                              variant="outlined"
                              sx={{ ml: 2, height: 24 }}
                            />
                          )}
                        </Box>
                      }
                      sx={{ 
                        m: 0, 
                        width: '100%',
                        '& .MuiFormControlLabel-label': {
                          width: '100%'
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
            
            <Alert 
              severity="info" 
              icon={<InfoIcon />}
              sx={{ 
                mt: 2, 
                borderRadius: 2,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(41, 182, 246, 0.1)' 
                  : 'rgba(41, 182, 246, 0.1)',
                border: `1px solid ${theme.palette.info.main}`,
                '& .MuiAlert-icon': {
                  color: theme.palette.info.main
                }
              }}
            >
              <Typography variant="body2">
                Only selected sections will be included in the export.
                Sections without content will be included as empty placeholders.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          sx={{ px: 3 }}
        >
          Cancel
        </Button>
        
        <Button 
          onClick={handleExport}
          variant="contained" 
          color="primary"
          disabled={loading || selectedSections.length === 0}
          startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
          sx={{ px: 3, position: 'relative' }}
        >
          {success ? 'Exported Successfully!' : loading ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
          {success && (
            <CheckCircleIcon 
              sx={{
                position: 'absolute',
                right: -10,
                top: -10,
                color: 'success.main',
                bgcolor: 'background.paper',
                borderRadius: '50%'
              }}
            />
          )}
        </Button>
      </DialogActions>
      
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        message={error}
      />
    </Dialog>
  );
};

export default ExportDialog;