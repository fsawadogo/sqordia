import React from 'react';
import { Box, Button, Container, Typography, Paper, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2, boxShadow: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Brain size={64} color={theme.palette.primary.main} />
        </Box>
        
        <Typography variant="h1" component="h1" sx={{ fontSize: '5rem', fontWeight: 'bold', mb: 2 }}>
          404
        </Typography>
        
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
          The page you are looking for doesn't exist or has been moved.
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound;