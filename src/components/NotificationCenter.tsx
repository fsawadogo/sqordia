import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Divider,
  IconButton,
  Button,
  useTheme
} from '@mui/material';
import { 
  Notifications as NotificationIcon, 
  Check as CheckIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';

interface NotificationCenterProps {
  onClose: () => void;
}

// Mock notifications
const notifications = [
  {
    id: 1,
    title: 'Business Plan Updated',
    message: 'Your "Tech Startup" business plan was updated with AI suggestions.',
    time: '10 minutes ago',
    read: false,
    type: 'update'
  },
  {
    id: 2,
    title: 'Subscription Renewal',
    message: 'Your premium subscription will renew in 3 days.',
    time: '2 hours ago',
    read: true,
    type: 'billing'
  },
  {
    id: 3,
    title: 'Questionnaire Progress',
    message: 'You\'ve completed 75% of your business plan questionnaire.',
    time: '1 day ago',
    read: true,
    type: 'progress'
  }
];

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  return (
    <Box sx={{ width: 320, maxHeight: 400, overflow: 'auto' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{t('notifications.title')}</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: theme.palette.text.primary }}>
          <CheckIcon fontSize="small" />
        </IconButton>
      </Box>
      
      <Divider />
      
      <List sx={{ p: 0 }}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <React.Fragment key={notification.id}>
              <ListItem 
                alignItems="flex-start"
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" sx={{ color: theme.palette.text.primary }}>
                    <DeleteIcon />
                  </IconButton>
                }
                sx={{
                  backgroundColor: notification.read ? 'transparent' : 'action.hover',
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <NotificationIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" component="span">
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        sx={{ display: 'block' }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        {notification.time}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))
        ) : (
          <ListItem>
            <ListItemText 
              primary={t('notifications.noNotifications')}
              secondary={t('notifications.allCaughtUp')}
            />
          </ListItem>
        )}
      </List>
      
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button size="small" sx={{ color: theme.palette.primary.main }}>
          {t('notifications.markAllRead')}
        </Button>
        <Button size="small" color="primary">
          {t('notifications.viewAll')}
        </Button>
      </Box>
    </Box>
  );
};

export default NotificationCenter;