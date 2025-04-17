import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Typography,
  useTheme,
  Tooltip,
  Zoom
} from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';

interface LanguageSwitcherProps {
  onClose?: () => void;
  iconOnly?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ onClose, iconOnly = false }) => {
  const { i18n } = useTranslation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];
  
  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === i18n.language) || languages[0];
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    if (onClose) onClose();
  };

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    handleClose();
  };

  return (
    <Box>
      <Tooltip title="Change language" TransitionComponent={Zoom}>
        <IconButton 
          aria-label="change language"
          onClick={handleClick}
          aria-controls="language-menu"
          aria-haspopup="true"
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.1)' 
                : 'rgba(0,0,0,0.08)'
            }
          }}
        >
          {!iconOnly && (
            <Typography variant="caption" sx={{ mr: 0.5, display: { xs: 'none', sm: 'block' } }}>
              {getCurrentLanguage().flag}
            </Typography>
          )}
          <LanguageIcon fontSize={iconOnly ? 'medium' : undefined} />
        </IconButton>
      </Tooltip>
      
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 2,
            boxShadow: theme.shadows[8],
            minWidth: 180
          }
        }}
      >
        {languages.map((language) => (
          <MenuItem 
            key={language.code} 
            onClick={() => handleLanguageChange(language.code)}
            selected={i18n.language === language.code}
            sx={{
              minWidth: 150,
              fontWeight: i18n.language === language.code ? 'bold' : 'normal',
              borderRadius: 1,
              mx: 1,
              px: 2,
              py: 1,
              my: 0.5,
              '&.Mui-selected': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(59, 130, 246, 0.15)' 
                  : 'rgba(59, 130, 246, 0.08)',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(59, 130, 246, 0.25)' 
                    : 'rgba(59, 130, 246, 0.12)'
                }
              }
            }}
          >
            <Box sx={{ mr: 1, fontSize: '1.2rem' }}>{language.flag}</Box>
            {language.name}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default LanguageSwitcher;