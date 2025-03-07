import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Chip,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Checkbox,
  Collapse,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  Email as EmailIcon,
  Send as SendIcon,
  ContactMail as ContactMailIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  FileCopy as CopyIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const StyledFileInput = styled('input')({
  display: 'none',
});

const OutreachModal = ({ 
  open, 
  onClose, 
  selectedSites = [], 
  protocolData = {}, 
  onOutreachComplete 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [outreachData, setOutreachData] = useState({
    subject: '',
    messageTemplate: '',
    includeProtocolSummary: true,
    includeFullProtocol: false,
    selectedSites: [...selectedSites],
    customFields: [],
    additionalFiles: []
  });
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [previewTemplateExpanded, setPreviewTemplateExpanded] = useState(false);
  const [emailPreview, setEmailPreview] = useState(null);
  const [error, setError] = useState('');
  
  const theme = useTheme();
  
  // Steps for the stepper
  const steps = [
    'Select Sites',
    'Create Message',
    'Review & Send'
  ];
  
  // Default email template based on protocol data
  const getDefaultEmailTemplate = () => {
    const { trial_basics = {} } = protocolData;
    
    return `Dear [Investigator Name],

I am writing to invite you to participate as an investigator in our upcoming clinical trial: ${trial_basics.drugName || '[Drug Name]'} for ${trial_basics.condition || '[Condition]'}.

Based on your expertise in ${trial_basics.therapeuticArea || 'this therapeutic area'} and your previous experience with similar studies, we believe your site would be an excellent candidate for this trial.

Key details:
- Phase: ${trial_basics.phase || '[Phase]'}
- Therapeutic Area: ${trial_basics.therapeuticArea || '[Therapeutic Area]'}
- Target Patient Population: Adults with ${trial_basics.condition || '[Condition]'}
- Estimated Start Date: [Start Date]

[Additional details about the study]

Please let me know if you are interested in learning more about this opportunity. We can arrange a call to discuss the protocol in detail and provide you with any additional information you may need.

Thank you for your consideration.

Best regards,
[Your Name]
[Your Title]
[Your Contact Information]`;
  };
  
  // Handle input changes
  const handleInputChange = (field) => (event) => {
    setOutreachData({
      ...outreachData,
      [field]: event.target.value
    });
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (field) => (event) => {
    setOutreachData({
      ...outreachData,
      [field]: event.target.checked
    });
  };
  
  // Handle file upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    
    setOutreachData({
      ...outreachData,
      additionalFiles: [...outreachData.additionalFiles, ...files]
    });
  };
  
  // Remove a file
  const handleRemoveFile = (index) => {
    const updatedFiles = [...outreachData.additionalFiles];
    updatedFiles.splice(index, 1);
    
    setOutreachData({
      ...outreachData,
      additionalFiles: updatedFiles
    });
  };
  
  // Add custom field
  const handleAddCustomField = () => {
    setOutreachData({
      ...outreachData,
      customFields: [...outreachData.customFields, { key: '', value: '' }]
    });
  };
  
  // Remove custom field
  const handleRemoveCustomField = (index) => {
    const updatedFields = [...outreachData.customFields];
    updatedFields.splice(index, 1);
    
    setOutreachData({
      ...outreachData,
      customFields: updatedFields
    });
  };
  
  // Update custom field
  const handleCustomFieldChange = (index, field) => (event) => {
    const updatedFields = [...outreachData.customFields];
    updatedFields[index][field] = event.target.value;
    
    setOutreachData({
      ...outreachData,
      customFields: updatedFields
    });
  };
  
  // Toggle a site selection
  const handleToggleSite = (site) => {
    const isSiteSelected = outreachData.selectedSites.some(s => s.doctor_id === site.doctor_id);
    
    if (isSiteSelected) {
      setOutreachData({
        ...outreachData,
        selectedSites: outreachData.selectedSites.filter(s => s.doctor_id !== site.doctor_id)
      });
    } else {
      setOutreachData({
        ...outreachData,
        selectedSites: [...outreachData.selectedSites, site]
      });
    }
  };
  
  // Handle next step
  const handleNext = () => {
    if (activeStep === 0 && outreachData.selectedSites.length === 0) {
      setError('Please select at least one site before proceeding.');
      return;
    }
    
    if (activeStep === 1) {
      if (!outreachData.subject.trim()) {
        setError('Please enter an email subject.');
        return;
      }
      
      if (!outreachData.messageTemplate.trim()) {
        setError('Please enter a message template.');
        return;
      }
      
      // Generate email preview for the first site
      if (outreachData.selectedSites.length > 0) {
        const site = outreachData.selectedSites[0];
        generateEmailPreview(site);
      }
    }
    
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Generate email preview for a specific site
  const generateEmailPreview = (site) => {
    let message = outreachData.messageTemplate;
    
    // Replace placeholders with actual values
    message = message.replace(/\[Investigator Name\]/g, `${site.first_name} ${site.last_name}`);
    
    // Replace custom fields
    outreachData.customFields.forEach(field => {
      const regex = new RegExp(`\\[${field.key}\\]`, 'g');
      message = message.replace(regex, field.value);
    });
    
    // Create protocol summary if needed
    let protocolSummary = '';
    if (outreachData.includeProtocolSummary) {
      const { trial_basics = {}, study_design = {} } = protocolData;
      
      protocolSummary = `
Protocol Summary:
----------------
Drug Name: ${trial_basics.drugName || 'N/A'}
Phase: ${trial_basics.phase || 'N/A'}
Therapeutic Area: ${trial_basics.therapeuticArea || 'N/A'}
Condition: ${trial_basics.condition || 'N/A'}
Primary Objective: ${trial_basics.objective || trial_basics.customObjective || 'N/A'}

Study Design: ${study_design.type ? study_design.type.join(', ') : 'N/A'}
Target Population: Adults aged ${study_design.population?.ageRange?.[0] || 18} to ${study_design.population?.ageRange?.[1] || 65}
`;
    }
    
    // Set preview
    setEmailPreview({
      to: site.email,
      subject: outreachData.subject,
      message: message + (protocolSummary ? '\n\n' + protocolSummary : '')
    });
  };
  
  // Send outreach emails
  const handleSendOutreach = async () => {
    setLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would call an API to send emails
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCompleted(true);
      
      if (onOutreachComplete) {
        onOutreachComplete({
          sentTo: outreachData.selectedSites.map(site => ({
            id: site.doctor_id,
            name: `${site.first_name} ${site.last_name}`,
            email: site.email
          })),
          subject: outreachData.subject,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error sending outreach emails:', error);
      setError('Failed to send outreach emails. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Select Sites for Outreach
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Choose the investigators you want to contact about your protocol.
            </Typography>
            
            <List sx={{ mb: 3 }}>
              {selectedSites.map((site) => (
                <ListItem 
                  key={site.doctor_id}
                  secondaryAction={
                    <Checkbox
                      edge="end"
                      checked={outreachData.selectedSites.some(s => s.doctor_id === site.doctor_id)}
                      onChange={() => handleToggleSite(site)}
                    />
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      {site.first_name?.[0]}{site.last_name?.[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${site.first_name} ${site.last_name}, ${site.specialty_description}`}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {site.locations?.[0]?.city}, {site.license_state}
                        </Typography>
                        {" — "}
                        {site.email}
                      </>
                    }
                  />
                </ListItem>
              ))}
              
              {selectedSites.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                  No sites available. Please select sites from the site selection tool first.
                </Typography>
              )}
            </List>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2">
                Selected: {outreachData.selectedSites.length} of {selectedSites.length} sites
              </Typography>
              
              {outreachData.selectedSites.length > 0 && (
                <Button 
                  size="small" 
                  onClick={() => setOutreachData({ ...outreachData, selectedSites: [] })}
                  sx={{ ml: 2 }}
                >
                  Clear All
                </Button>
              )}
              
              {outreachData.selectedSites.length < selectedSites.length && (
                <Button 
                  size="small" 
                  onClick={() => setOutreachData({ ...outreachData, selectedSites: [...selectedSites] })}
                  sx={{ ml: 2 }}
                >
                  Select All
                </Button>
              )}
            </Box>
          </Box>
        );
      
      case 1:
        return (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Create Message Template
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Customize your outreach message to the selected investigators. 
              Use placeholders like [Investigator Name] which will be replaced with actual values.
            </Typography>
            
            <TextField
              fullWidth
              label="Email Subject"
              value={outreachData.subject}
              onChange={handleInputChange('subject')}
              margin="normal"
              required
              placeholder="Invitation to participate in a clinical trial for [Condition]"
            />
            
            <TextField
              fullWidth
              label="Message Template"
              value={outreachData.messageTemplate || getDefaultEmailTemplate()}
              onChange={handleInputChange('messageTemplate')}
              margin="normal"
              required
              multiline
              rows={12}
              placeholder="Enter your message template here..."
              helperText="Use placeholders like [Investigator Name] which will be replaced with actual values."
            />
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Add Custom Placeholders
              </Typography>
              
              {outreachData.customFields.map((field, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 2 }}>
                  <TextField
                    label="Placeholder Name"
                    value={field.key}
                    onChange={handleCustomFieldChange(index, 'key')}
                    size="small"
                    sx={{ mr: 2, width: '40%' }}
                    placeholder="e.g., Start Date"
                  />
                  <TextField
                    label="Value"
                    value={field.value}
                    onChange={handleCustomFieldChange(index, 'value')}
                    size="small"
                    sx={{ width: '60%' }}
                    placeholder="e.g., January 15, 2023"
                  />
                  <IconButton onClick={() => handleRemoveCustomField(index)} color="error">
                    <RemoveIcon />
                  </IconButton>
                </Box>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                size="small"
                onClick={handleAddCustomField}
                sx={{ mt: 1 }}
              >
                Add Custom Placeholder
              </Button>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Attachments
            </Typography>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={outreachData.includeProtocolSummary}
                  onChange={handleCheckboxChange('includeProtocolSummary')}
                />
              }
              label="Include protocol summary"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={outreachData.includeFullProtocol}
                  onChange={handleCheckboxChange('includeFullProtocol')}
                />
              }
              label="Attach full protocol document"
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Additional Attachments:
              </Typography>
              
              <List>
                {outreachData.additionalFiles.map((file, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                        <RemoveIcon />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <FileIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={file.name}
                      secondary={`${(file.size / 1024).toFixed(1)} KB`}
                    />
                  </ListItem>
                ))}
              </List>
              
              <label htmlFor="upload-attachment">
                <StyledFileInput
                  id="upload-attachment"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                />
                <Button
                  component="span"
                  startIcon={<AddIcon />}
                  variant="outlined"
                  size="small"
                >
                  Add Attachment
                </Button>
              </label>
            </Box>
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Review & Send
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Review your outreach message before sending it to {outreachData.selectedSites.length} investigators.
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Recipients ({outreachData.selectedSites.length})
              </Typography>
              
              <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {outreachData.selectedSites.map((site) => (
                  <Chip
                    key={site.doctor_id}
                    label={`${site.first_name} ${site.last_name}`}
                    size="small"
                    avatar={<Avatar>{site.first_name[0]}{site.last_name[0]}</Avatar>}
                  />
                ))}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Subject
              </Typography>
              <Typography variant="body1" paragraph>
                {outreachData.subject}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                Attachments
              </Typography>
              <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {outreachData.includeProtocolSummary && (
                  <Chip
                    icon={<FileIcon />}
                    label="Protocol Summary"
                    size="small"
                    variant="outlined"
                  />
                )}
                {outreachData.includeFullProtocol && (
                  <Chip
                    icon={<FileIcon />}
                    label="Full Protocol Document"
                    size="small"
                    variant="outlined"
                  />
                )}
                {outreachData.additionalFiles.map((file, index) => (
                  <Chip
                    key={index}
                    icon={<FileIcon />}
                    label={file.name}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>
                Message Preview
                <Button 
                  size="small" 
                  onClick={() => setPreviewTemplateExpanded(!previewTemplateExpanded)}
                  sx={{ ml: 1 }}
                >
                  {previewTemplateExpanded ? 'Hide Template' : 'Show Template'}
                </Button>
              </Typography>
              
              <Collapse in={previewTemplateExpanded}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    whiteSpace: 'pre-wrap',
                    mb: 2,
                    maxHeight: 200,
                    overflow: 'auto'
                  }}
                >
                  {outreachData.messageTemplate}
                </Paper>
              </Collapse>
              
              {emailPreview && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Sample Email (to {emailPreview.to})
                    </Typography>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'background.default', 
                        whiteSpace: 'pre-wrap',
                        maxHeight: 300,
                        overflow: 'auto'
                      }}
                    >
                      <Typography variant="body2" component="div">
                        <strong>Subject:</strong> {emailPreview.subject}<br />
                        <strong>To:</strong> {emailPreview.to}<br />
                        <Divider sx={{ my: 1 }} />
                        {emailPreview.message}
                      </Typography>
                    </Paper>
                  </CardContent>
                </Card>
              )}
              
              {outreachData.selectedSites.length > 1 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <AlertTitle>Personalization</AlertTitle>
                  Each email will be personalized for the recipient with their name and details.
                </Alert>
              )}
            </Paper>
          </Box>
        );
      
      default:
        return null;
    }
  };
  
  const renderCompletedContent = () => (
    <Box sx={{ textAlign: 'center', py: 3 }}>
      <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
      
      <Typography variant="h5" gutterBottom>
        Outreach Completed!
      </Typography>
      
      <Typography variant="body1" paragraph>
        Your invitation has been sent to {outreachData.selectedSites.length} investigators.
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        You will be notified when investigators respond to your invitation.
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary"
        onClick={() => onClose()}
      >
        Close
      </Button>
    </Box>
  );
  
  return (
    <Dialog
      open={open}
      onClose={() => !loading && !completed && onClose()}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ContactMailIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Site Outreach
            </Typography>
          </Box>
          {!loading && !completed && (
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pb: 4 }}>
        {completed ? (
          renderCompletedContent()
        ) : (
          <>
            <Stepper activeStep={activeStep} sx={{ py: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Sending Outreach Emails
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please wait while we send your invitations to {outreachData.selectedSites.length} investigators.
                </Typography>
              </Box>
            ) : (
              renderStepContent()
            )}
          </>
        )}
      </DialogContent>
      
      {!loading && !completed && (
        <DialogActions sx={{ px: 3, py: 2 }}>
          {activeStep > 0 && (
            <Button 
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
            >
              Back
            </Button>
          )}
          
          {activeStep < steps.length - 1 ? (
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
              disabled={
                (activeStep === 0 && outreachData.selectedSites.length === 0) ||
                (activeStep === 1 && (!outreachData.subject.trim() || !outreachData.messageTemplate.trim()))
              }
            >
              Next
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSendOutreach}
              endIcon={<SendIcon />}
              disabled={loading}
            >
              Send Outreach
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default OutreachModal; 