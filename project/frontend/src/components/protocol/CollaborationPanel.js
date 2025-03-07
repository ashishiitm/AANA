import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  TextField,
  Button,
  Paper,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  styled,
  alpha
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Share as ShareIcon,
  Comment as CommentIcon,
  History as HistoryIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Send as SendIcon,
  FileCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  People as PeopleIcon,
  InsertComment as CommentsIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import collaborationService from '../../services/collaborationService';

// Styled components
const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const OnlineIndicator = styled('span')(({ theme, status }) => ({
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: 12,
  height: 12,
  borderRadius: '50%',
  border: `2px solid ${theme.palette.background.paper}`,
  backgroundColor: status === 'online' ? theme.palette.success.main : theme.palette.grey[500]
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    fontSize: 10,
    minWidth: 16,
    height: 16,
  }
}));

// TabPanel component for drawer tabs
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`collaboration-tabpanel-${index}`}
      aria-labelledby={`collaboration-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const CollaborationPanel = ({ 
  protocolId, 
  onStartCollaboration,
  onJoinCollaboration,
  currentStep,
  onAddComment
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [activeUsers, setActiveUsers] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [expandedComment, setExpandedComment] = useState(null);
  const [totalUnreadComments, setTotalUnreadComments] = useState(0);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  
  // Initialize collaboration when component mounts
  useEffect(() => {
    const initUser = collaborationService.initCollaboration();
    setCurrentUser(initUser);
    
    if (protocolId) {
      joinExistingProtocol(protocolId);
    }
    
    // Set up event listeners for collaboration events
    const handleUsersChanged = (event) => {
      setActiveUsers(event.detail.users);
    };
    
    const handleCommentsChanged = (event) => {
      const { comments, section } = event.detail;
      setComments(prev => ({
        ...prev,
        [section]: comments
      }));
      
      // Calculate total unread comments
      calculateTotalUnreadComments();
    };
    
    window.addEventListener('activeUsersChanged', handleUsersChanged);
    window.addEventListener('commentsChanged', handleCommentsChanged);
    
    return () => {
      window.removeEventListener('activeUsersChanged', handleUsersChanged);
      window.removeEventListener('commentsChanged', handleCommentsChanged);
      collaborationService.leaveProtocolSession();
    };
  }, []);
  
  // Effect to handle protocol ID changes
  useEffect(() => {
    if (protocolId && currentUser) {
      joinExistingProtocol(protocolId);
    }
  }, [protocolId, currentUser]);
  
  // Join an existing protocol session
  const joinExistingProtocol = async (id) => {
    try {
      const success = await collaborationService.joinProtocolSession(id);
      
      if (success) {
        // Subscribe to comments for all sections
        const sections = ['trial_basics', 'study_design', 'endpoints', 'team_assignment'];
        sections.forEach(section => {
          collaborationService.subscribeToComments(id, section, (sectionComments) => {
            setComments(prev => ({
              ...prev,
              [section]: sectionComments
            }));
          });
        });
        
        if (onJoinCollaboration) {
          onJoinCollaboration(id);
        }
      }
    } catch (error) {
      console.error('Error joining protocol session:', error);
    }
  };
  
  // Start a new collaboration session
  const startNewCollaboration = async (protocolData) => {
    try {
      const newProtocolId = await collaborationService.createCollaborativeProtocol(protocolData);
      
      if (onStartCollaboration) {
        onStartCollaboration(newProtocolId);
      }
      
      return newProtocolId;
    } catch (error) {
      console.error('Error starting collaboration:', error);
      return null;
    }
  };
  
  // Toggle the collaboration drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
    if (!drawerOpen) {
      // Reset unread count when opening drawer
      setTotalUnreadComments(0);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Toggle comment expansion
  const handleExpandComment = (commentId) => {
    setExpandedComment(expandedComment === commentId ? null : commentId);
  };
  
  // Calculate total unread comments
  const calculateTotalUnreadComments = () => {
    let count = 0;
    Object.values(comments).forEach(sectionComments => {
      if (sectionComments) {
        count += Object.values(sectionComments).filter(comment => !comment.read).length;
      }
    });
    setTotalUnreadComments(count);
  };
  
  // Add a new comment
  const handleAddComment = async () => {
    if (!commentText.trim() || !currentStep) return;
    
    try {
      const success = await collaborationService.addComment(currentStep, commentText);
      
      if (success) {
        setCommentText('');
        
        if (onAddComment) {
          onAddComment(currentStep, commentText);
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  
  // Delete a comment
  const handleDeleteComment = async (section, commentId) => {
    try {
      await collaborationService.deleteComment(section, commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };
  
  // Mark a comment as resolved
  const handleResolveComment = async (section, commentId) => {
    // In a real implementation, this would update the comment's resolved status
    console.log('Resolving comment:', section, commentId);
  };
  
  // Copy collaboration link to clipboard
  const copyCollaborationLink = () => {
    if (!protocolId) return;
    
    const link = `${window.location.origin}/protocol-design/collaborate/${protocolId}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopiedToClipboard(true);
        setTimeout(() => setCopiedToClipboard(false), 2000);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };
  
  // Get comments for the current step/section
  const getCurrentStepComments = () => {
    return comments[currentStep] || {};
  };
  
  // Render the collaboration panel
  return (
    <>
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
        <Tooltip title="Collaboration Tools">
          <StyledBadge badgeContent={totalUnreadComments} color="error">
            <IconButton
              color="primary"
              onClick={toggleDrawer}
              sx={{ 
                bgcolor: 'background.paper',
                boxShadow: 3,
                '&:hover': { bgcolor: alpha('#1976d2', 0.1) },
                height: 56,
                width: 56
              }}
            >
              <PeopleIcon />
            </IconButton>
          </StyledBadge>
        </Tooltip>
      </Box>
      
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer}
        PaperProps={{
          sx: { width: 350 }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6">Collaboration</Typography>
          <IconButton onClick={toggleDrawer}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
          >
            <Tab 
              icon={<PeopleIcon />} 
              label="Team" 
              id="collaboration-tab-0" 
            />
            <Tab 
              icon={<CommentsIcon />} 
              label="Comments" 
              id="collaboration-tab-1"
              iconPosition="start"
            />
          </Tabs>
        </Box>
        
        {/* Team Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              fullWidth
              onClick={() => setShareDialogOpen(true)}
            >
              Share Protocol
            </Button>
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>
            Active Users
          </Typography>
          
          <List>
            {Object.values(activeUsers).map((user) => (
              <ListItem key={user.id}>
                <ListItemAvatar>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar sx={{ bgcolor: user.color }}>
                      {user.name.charAt(0)}
                    </Avatar>
                    <OnlineIndicator status={user.status} />
                  </Box>
                </ListItemAvatar>
                <ListItemText 
                  primary={user.name}
                  secondary={user.status === 'online' ? 'Online' : 'Offline'} 
                />
                {user.isOwner && (
                  <Chip 
                    label="Owner" 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                )}
              </ListItem>
            ))}
            
            {Object.keys(activeUsers).length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                No active users at the moment
              </Typography>
            )}
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Invite Others
          </Typography>
          
          <Button
            variant="outlined"
            startIcon={<PersonAddIcon />}
            fullWidth
            onClick={() => setShareDialogOpen(true)}
          >
            Add Collaborators
          </Button>
        </TabPanel>
        
        {/* Comments Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Add a comment"
              multiline
              rows={2}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton 
                    color="primary" 
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                  >
                    <SendIcon />
                  </IconButton>
                )
              }}
            />
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>
            Recent Comments
          </Typography>
          
          {Object.entries(comments).map(([section, sectionComments]) => (
            <React.Fragment key={section}>
              {sectionComments && Object.keys(sectionComments).length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    {section === 'trial_basics' ? 'Trial Basics' : 
                     section === 'study_design' ? 'Study Design' : 
                     section === 'endpoints' ? 'Endpoints & Assessments' : 
                     section === 'team_assignment' ? 'Team Assignment' : 
                     section}
                  </Typography>
                  
                  {Object.values(sectionComments).map((comment) => (
                    <Card key={comment.id} sx={{ mb: 2 }}>
                      <CardContent sx={{ pb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar 
                            sx={{ 
                              width: 28, 
                              height: 28, 
                              mr: 1, 
                              fontSize: '0.875rem',
                              bgcolor: comment.user === currentUser?.id ? 'primary.main' : 'grey.500'
                            }}
                          >
                            {comment.userName?.charAt(0) || 'U'}
                          </Avatar>
                          <Typography variant="subtitle2" component="span">
                            {comment.userName}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ ml: 1 }}
                          >
                            {comment.timestamp && new Date(comment.timestamp).toLocaleString()}
                          </Typography>
                          <ExpandMore
                            expand={expandedComment === comment.id}
                            onClick={() => handleExpandComment(comment.id)}
                            aria-expanded={expandedComment === comment.id}
                            aria-label="show more"
                            size="small"
                          >
                            <ExpandMoreIcon fontSize="small" />
                          </ExpandMore>
                        </Box>
                        
                        <Typography variant="body2">
                          {comment.text}
                        </Typography>
                      </CardContent>
                      
                      <Collapse in={expandedComment === comment.id} timeout="auto" unmountOnExit>
                        <CardActions disableSpacing>
                          <Button 
                            size="small" 
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleResolveComment(section, comment.id)}
                          >
                            Resolve
                          </Button>
                          {comment.user === currentUser?.id && (
                            <Button 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteComment(section, comment.id)}
                            >
                              Delete
                            </Button>
                          )}
                        </CardActions>
                      </Collapse>
                    </Card>
                  ))}
                </>
              )}
            </React.Fragment>
          ))}
          
          {Object.values(comments).every(section => !section || Object.keys(section).length === 0) && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
              No comments yet. Add a comment to start a discussion.
            </Typography>
          )}
        </TabPanel>
      </Drawer>
      
      {/* Share Dialog */}
      <Dialog 
        open={shareDialogOpen} 
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Share Protocol
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Share this link with your team members to collaborate on this protocol:
          </Typography>
          
          <Box sx={{ display: 'flex', mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              value={protocolId ? `${window.location.origin}/protocol-design/collaborate/${protocolId}` : 'No protocol ID available'}
              InputProps={{
                readOnly: true,
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={copyCollaborationLink}
              startIcon={copiedToClipboard ? <CheckCircleIcon /> : <CopyIcon />}
              sx={{ ml: 1, whiteSpace: 'nowrap' }}
            >
              {copiedToClipboard ? 'Copied!' : 'Copy'}
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Anyone with this link can view and edit this protocol. You can revoke access at any time.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CollaborationPanel; 