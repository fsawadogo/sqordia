import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  Tab,
  Tabs,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  LockPerson as LockPersonIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  ManageAccounts as ManageAccountsIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bell, 
  DollarSign, 
  LineChart, 
  PieChart, 
  Users, 
  UserCheck, 
  UserX, 
  ShieldCheck 
} from 'lucide-react';

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
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

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  
  // State
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  
  // Mock data
  const users = [
    { 
      id: '1', 
      name: 'John Doe', 
      email: 'john.doe@example.com', 
      role: 'administrator', 
      status: 'active',
      plans: 3,
      lastLogin: '2025-05-15T14:30:00Z',
      subscription: 'Enterprise'
    },
    { 
      id: '2', 
      name: 'Jane Smith', 
      email: 'jane.smith@example.com', 
      role: 'user', 
      status: 'active',
      plans: 1,
      lastLogin: '2025-05-14T10:15:00Z',
      subscription: 'Professional'
    },
    { 
      id: '3', 
      name: 'Robert Johnson', 
      email: 'robert.johnson@example.com', 
      role: 'user', 
      status: 'active',
      plans: 2,
      lastLogin: '2025-05-12T09:30:00Z',
      subscription: 'Professional'
    },
    { 
      id: '4', 
      name: 'Sarah Williams', 
      email: 'sarah.williams@example.com', 
      role: 'consultant', 
      status: 'active',
      plans: 5,
      lastLogin: '2025-05-10T16:45:00Z',
      subscription: 'Enterprise'
    },
    { 
      id: '5', 
      name: 'Michael Brown', 
      email: 'michael.brown@example.com', 
      role: 'user', 
      status: 'inactive',
      plans: 0,
      lastLogin: '2025-04-25T11:20:00Z',
      subscription: 'Free'
    },
    { 
      id: '6', 
      name: 'Emily Davis', 
      email: 'emily.davis@example.com', 
      role: 'obnl', 
      status: 'active',
      plans: 1,
      lastLogin: '2025-05-08T13:10:00Z',
      subscription: 'Professional'
    },
    { 
      id: '7', 
      name: 'David Wilson', 
      email: 'david.wilson@example.com', 
      role: 'user', 
      status: 'active',
      plans: 1,
      lastLogin: '2025-05-05T09:45:00Z',
      subscription: 'Free'
    },
    { 
      id: '8', 
      name: 'Jessica Taylor', 
      email: 'jessica.taylor@example.com', 
      role: 'consultant', 
      status: 'active',
      plans: 4,
      lastLogin: '2025-05-03T10:30:00Z',
      subscription: 'Enterprise'
    },
    { 
      id: '9', 
      name: 'James Anderson', 
      email: 'james.anderson@example.com', 
      role: 'user', 
      status: 'suspended',
      plans: 1,
      lastLogin: '2025-04-20T14:25:00Z',
      subscription: 'Professional'
    },
    { 
      id: '10', 
      name: 'Lisa Thomas', 
      email: 'lisa.thomas@example.com', 
      role: 'obnl', 
      status: 'active',
      plans: 2,
      lastLogin: '2025-05-01T11:50:00Z',
      subscription: 'Professional'
    },
    { 
      id: '11', 
      name: 'Christopher Harris', 
      email: 'christopher.harris@example.com', 
      role: 'user', 
      status: 'active',
      plans: 1,
      lastLogin: '2025-04-29T16:15:00Z',
      subscription: 'Free'
    },
    { 
      id: '12', 
      name: 'Amanda Martin', 
      email: 'amanda.martin@example.com', 
      role: 'user', 
      status: 'active',
      plans: 1,
      lastLogin: '2025-04-28T13:40:00Z',
      subscription: 'Professional'
    }
  ];
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Charts data
  const userRolesData = {
    labels: ['Users', 'Consultants', 'Non-Profits', 'Administrators'],
    datasets: [
      {
        data: [
          users.filter(u => u.role === 'user').length,
          users.filter(u => u.role === 'consultant').length,
          users.filter(u => u.role === 'obnl').length,
          users.filter(u => u.role === 'administrator').length
        ],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.error.main
        ]
      }
    ]
  };
  
  const subscriptionData = {
    labels: ['Free', 'Professional', 'Enterprise'],
    datasets: [
      {
        data: [
          users.filter(u => u.subscription === 'Free').length,
          users.filter(u => u.subscription === 'Professional').length,
          users.filter(u => u.subscription === 'Enterprise').length
        ],
        backgroundColor: [
          theme.palette.grey[500],
          theme.palette.primary.main,
          theme.palette.secondary.main
        ]
      }
    ]
  };
  
  // Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setUserMenuAnchorEl(event.currentTarget);
    setOpenMenu(userId);
    setSelectedUserId(userId);
  };
  
  const handleCloseUserMenu = () => {
    setUserMenuAnchorEl(null);
    setOpenMenu(null);
  };
  
  const handleEditUser = () => {
    setOpenUserDialog(true);
    handleCloseUserMenu();
  };
  
  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
    handleCloseUserMenu();
  };
  
  const handleDeleteUser = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setOpenDeleteDialog(false);
      // In a real app, would remove the user from the list
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
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const getRoleChip = (role: string) => {
    switch (role) {
      case 'administrator':
        return <Chip label="Admin" color="error" size="small" />;
      case 'consultant':
        return <Chip label="Consultant" color="info" size="small" />;
      case 'obnl':
        return <Chip label="Non-Profit" color="success" size="small" />;
      default:
        return <Chip label="User" size="small" />;
    }
  };
  
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage users, view statistics, and monitor platform activity
        </Typography>
      </Box>
      
      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Users size={40} color={theme.palette.primary.main} style={{ marginRight: 16 }} />
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {users.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Users
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <UserCheck size={40} color={theme.palette.success.main} style={{ marginRight: 16 }} />
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {users.filter(user => user.status === 'active').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Users
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <DollarSign size={40} color={theme.palette.warning.main} style={{ marginRight: 16 }} />
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {users.filter(user => user.subscription !== 'Free').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Paid Subscriptions
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <LineChart size={40} color={theme.palette.info.main} style={{ marginRight: 16 }} />
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {users.reduce((total, user) => total + user.plans, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Business Plans
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Main content */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="admin tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Users" />
          <Tab label="Analytics" />
          <Tab label="Security" />
        </Tabs>
        
        {/* Users Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
            <TextField
              placeholder="Search users..."
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ width: 300 }}
            />
            
            <Box>
              <Button 
                variant="outlined" 
                startIcon={<FilterListIcon />}
                sx={{ mr: 2 }}
              >
                Filter
              </Button>
              
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
              >
                Add User
              </Button>
            </Box>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Subscription</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleChip(user.role)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status.charAt(0).toUpperCase() + user.status.slice(1)} 
                          color={getStatusColor(user.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.subscription}</TableCell>
                      <TableCell>{formatDate(user.lastLogin)}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(e) => handleOpenUserMenu(e, user.id)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
          
          {/* User Actions Menu */}
          <Menu
            anchorEl={userMenuAnchorEl}
            open={Boolean(userMenuAnchorEl)}
            onClose={handleCloseUserMenu}
          >
            <MenuItem onClick={handleEditUser}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit User
            </MenuItem>
            <MenuItem>
              <ManageAccountsIcon fontSize="small" sx={{ mr: 1 }} />
              Change Role
            </MenuItem>
            <MenuItem>
              <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
              View Details
            </MenuItem>
            <Divider />
            <MenuItem>
              {users.find(u => u.id === selectedUserId)?.status === 'active' ? (
                <>
                  <LockIcon fontSize="small" sx={{ mr: 1 }} />
                  Suspend User
                </>
              ) : (
                <>
                  <LockOpenIcon fontSize="small" sx={{ mr: 1 }} />
                  Activate User
                </>
              )}
            </MenuItem>
            <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: theme.palette.error.main }}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete User
            </MenuItem>
          </Menu>
        </TabPanel>
        
        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    User Roles Distribution
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <PieChart size={240} color={theme.palette.primary.main} />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      {userRolesData.labels.map((label, index) => (
                        <Grid item xs={6} sm={3} key={label}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box 
                              sx={{ 
                                width: 16, 
                                height: 16, 
                                borderRadius: '50%', 
                                backgroundColor: userRolesData.datasets[0].backgroundColor[index],
                                mr: 1
                              }} 
                            />
                            <Typography variant="body2">{label}: {userRolesData.datasets[0].data[index]}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Subscription Types
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <BarChart size={240} color={theme.palette.primary.main} />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      {subscriptionData.labels.map((label, index) => (
                        <Grid item xs={4} key={label}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box 
                              sx={{ 
                                width: 16, 
                                height: 16, 
                                borderRadius: '50%', 
                                backgroundColor: subscriptionData.datasets[0].backgroundColor[index],
                                mr: 1
                              }} 
                            />
                            <Typography variant="body2">{label}: {subscriptionData.datasets[0].data[index]}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    User Growth Over Time
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <LineChart size={480} color={theme.palette.primary.main} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Security Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ShieldCheck size={24} color={theme.palette.success.main} />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      Security Overview
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="body1" paragraph>
                    Platform security status: <Chip label="Secure" color="success" size="small" />
                  </Typography>
                  
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Last security scan:</strong> {formatDate(new Date().toISOString())}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Active login sessions:</strong> 18
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Failed login attempts (24h):</strong> 7
                    </Typography>
                  </Box>
                  
                  <Button 
                    variant="outlined" 
                    startIcon={<RefreshIcon />}
                    sx={{ mt: 2 }}
                  >
                    Run Security Scan
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Security Settings
                  </Typography>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Password Policy</InputLabel>
                    <Select
                      value="strong"
                      label="Password Policy"
                    >
                      <MenuItem value="basic">Basic (8+ characters)</MenuItem>
                      <MenuItem value="medium">Medium (8+ chars with numbers)</MenuItem>
                      <MenuItem value="strong">Strong (8+ chars with numbers, symbols, mixed case)</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControlLabel
                    control={<Switch checked={true} />}
                    label="Require 2FA for administrators"
                  />
                  
                  <FormControlLabel
                    control={<Switch checked={false} />}
                    label="Require 2FA for all users"
                  />
                  
                  <FormControlLabel
                    control={<Switch checked={true} />}
                    label="Block suspicious login attempts"
                  />
                  
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                  >
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Security Alerts
                  </Typography>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Alert</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>IP Address</TableCell>
                          <TableCell>Date/Time</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Multiple failed login attempts</TableCell>
                          <TableCell>michael.brown@example.com</TableCell>
                          <TableCell>192.168.1.105</TableCell>
                          <TableCell>{formatDate(new Date().toISOString())}</TableCell>
                          <TableCell><Chip label="Resolved" color="success" size="small" /></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Suspicious location login</TableCell>
                          <TableCell>jane.smith@example.com</TableCell>
                          <TableCell>45.23.126.98</TableCell>
                          <TableCell>{formatDate(new Date().toISOString())}</TableCell>
                          <TableCell><Chip label="Investigating" color="warning" size="small" /></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Password changed</TableCell>
                          <TableCell>amanda.martin@example.com</TableCell>
                          <TableCell>172.16.254.1</TableCell>
                          <TableCell>{formatDate(new Date().toISOString())}</TableCell>
                          <TableCell><Chip label="Normal" color="info" size="small" /></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      {/* Edit User Dialog */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                fullWidth
                defaultValue={selectedUserId && users.find(u => u.id === selectedUserId)?.name.split(' ')[0]}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                fullWidth
                defaultValue={selectedUserId && users.find(u => u.id === selectedUserId)?.name.split(' ')[1]}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                fullWidth
                defaultValue={selectedUserId && users.find(u => u.id === selectedUserId)?.email}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  label="Role"
                  defaultValue={selectedUserId && users.find(u => u.id === selectedUserId)?.role}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="consultant">Consultant</MenuItem>
                  <MenuItem value="obnl">Non-Profit (OBNL)</MenuItem>
                  <MenuItem value="administrator">Administrator</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  defaultValue={selectedUserId && users.find(u => u.id === selectedUserId)?.status}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Subscription</InputLabel>
                <Select
                  label="Subscription"
                  defaultValue={selectedUserId && users.find(u => u.id === selectedUserId)?.subscription}
                >
                  <MenuItem value="Free">Free</MenuItem>
                  <MenuItem value="Professional">Professional</MenuItem>
                  <MenuItem value="Enterprise">Enterprise</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)}>Cancel</Button>
          <Button variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action cannot be undone, and all of the user's data will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button 
            color="error" 
            onClick={handleDeleteUser}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;