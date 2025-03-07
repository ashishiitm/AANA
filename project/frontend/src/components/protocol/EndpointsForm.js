import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  Divider,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Endpoint types
const endpointTypes = [
  { value: 'efficacy', label: 'Efficacy' },
  { value: 'safety', label: 'Safety' },
  { value: 'pharmacokinetic', label: 'Pharmacokinetic' },
  { value: 'pharmacodynamic', label: 'Pharmacodynamic' },
  { value: 'biomarker', label: 'Biomarker' },
  { value: 'quality_of_life', label: 'Quality of Life' },
  { value: 'other', label: 'Other' },
];

// Measurement timeframes options
const timeframeOptions = [
  { value: 'baseline', label: 'Baseline' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'end_of_treatment', label: 'End of Treatment' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'custom', label: 'Custom' },
];

// Assessment type options
const assessmentTypes = [
  { value: 'clinical_exam', label: 'Clinical Examination' },
  { value: 'laboratory_test', label: 'Laboratory Test' },
  { value: 'imaging', label: 'Imaging' },
  { value: 'questionnaire', label: 'Questionnaire/Survey' },
  { value: 'patient_reported', label: 'Patient-Reported Outcome' },
  { value: 'physical_performance', label: 'Physical Performance Test' },
  { value: 'other', label: 'Other' },
];

const EndpointsForm = ({ data = {}, onUpdate, trialBasics }) => {
  // Initialize form state with provided data or defaults
  const [formState, setFormState] = useState({
    primaryEndpoints: data.primaryEndpoints || [],
    secondaryEndpoints: data.secondaryEndpoints || [],
    assessments: data.assessments || [],
    ...data
  });

  // State for new endpoint/assessment inputs
  const [newPrimaryEndpoint, setNewPrimaryEndpoint] = useState({
    description: '',
    type: '',
    timeframe: '',
    customTimeframe: ''
  });
  
  const [newSecondaryEndpoint, setNewSecondaryEndpoint] = useState({
    description: '',
    type: '',
    timeframe: '',
    customTimeframe: ''
  });
  
  const [newAssessment, setNewAssessment] = useState({
    name: '',
    type: '',
    frequency: '',
    details: ''
  });

  // Update parent component when form state changes
  useEffect(() => {
    onUpdate(formState);
  }, [formState, onUpdate]);

  // Handle input changes for primary endpoint
  const handlePrimaryEndpointChange = (field) => (event) => {
    setNewPrimaryEndpoint(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Handle input changes for secondary endpoint
  const handleSecondaryEndpointChange = (field) => (event) => {
    setNewSecondaryEndpoint(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Handle input changes for assessment
  const handleAssessmentChange = (field) => (event) => {
    setNewAssessment(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Add new primary endpoint
  const addPrimaryEndpoint = () => {
    if (newPrimaryEndpoint.description && newPrimaryEndpoint.type) {
      const timeframe = newPrimaryEndpoint.timeframe === 'custom' 
        ? newPrimaryEndpoint.customTimeframe 
        : newPrimaryEndpoint.timeframe;
      
      const endpoint = {
        ...newPrimaryEndpoint,
        id: `primary-${Date.now()}`,
        timeframe
      };
      
      setFormState(prev => ({
        ...prev,
        primaryEndpoints: [...prev.primaryEndpoints, endpoint]
      }));
      
      // Reset the form
      setNewPrimaryEndpoint({
        description: '',
        type: '',
        timeframe: '',
        customTimeframe: ''
      });
    }
  };

  // Add new secondary endpoint
  const addSecondaryEndpoint = () => {
    if (newSecondaryEndpoint.description && newSecondaryEndpoint.type) {
      const timeframe = newSecondaryEndpoint.timeframe === 'custom' 
        ? newSecondaryEndpoint.customTimeframe 
        : newSecondaryEndpoint.timeframe;
      
      const endpoint = {
        ...newSecondaryEndpoint,
        id: `secondary-${Date.now()}`,
        timeframe
      };
      
      setFormState(prev => ({
        ...prev,
        secondaryEndpoints: [...prev.secondaryEndpoints, endpoint]
      }));
      
      // Reset the form
      setNewSecondaryEndpoint({
        description: '',
        type: '',
        timeframe: '',
        customTimeframe: ''
      });
    }
  };

  // Add new assessment
  const addAssessment = () => {
    if (newAssessment.name && newAssessment.type) {
      const assessment = {
        ...newAssessment,
        id: `assessment-${Date.now()}`
      };
      
      setFormState(prev => ({
        ...prev,
        assessments: [...prev.assessments, assessment]
      }));
      
      // Reset the form
      setNewAssessment({
        name: '',
        type: '',
        frequency: '',
        details: ''
      });
    }
  };

  // Remove a primary endpoint
  const removePrimaryEndpoint = (id) => {
    setFormState(prev => ({
      ...prev,
      primaryEndpoints: prev.primaryEndpoints.filter(endpoint => endpoint.id !== id)
    }));
  };

  // Remove a secondary endpoint
  const removeSecondaryEndpoint = (id) => {
    setFormState(prev => ({
      ...prev,
      secondaryEndpoints: prev.secondaryEndpoints.filter(endpoint => endpoint.id !== id)
    }));
  };

  // Remove an assessment
  const removeAssessment = (id) => {
    setFormState(prev => ({
      ...prev,
      assessments: prev.assessments.filter(assessment => assessment.id !== id)
    }));
  };

  // Validate endpoint before adding
  const validatePrimaryEndpoint = () => {
    return newPrimaryEndpoint.description && newPrimaryEndpoint.type && 
      (newPrimaryEndpoint.timeframe && newPrimaryEndpoint.timeframe !== 'custom' || 
       newPrimaryEndpoint.timeframe === 'custom' && newPrimaryEndpoint.customTimeframe);
  };

  const validateSecondaryEndpoint = () => {
    return newSecondaryEndpoint.description && newSecondaryEndpoint.type && 
      (newSecondaryEndpoint.timeframe && newSecondaryEndpoint.timeframe !== 'custom' || 
       newSecondaryEndpoint.timeframe === 'custom' && newSecondaryEndpoint.customTimeframe);
  };

  // Get endpoint recommendations based on therapeutic area (future AI integration)
  const getAIRecommendations = () => {
    // This would call an API to get recommendations
    alert('AI Endpoint Recommendations feature will be implemented in the next phase.');
  };

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Endpoints & Assessments
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Define the primary and secondary endpoints of your study and the assessments needed to measure them.
        </Typography>
        
        {trialBasics?.therapeuticArea && (
          <Chip 
            label={`${trialBasics.therapeuticArea}`}
            color="primary" 
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          />
        )}
        {trialBasics?.phase && (
          <Chip 
            label={trialBasics.phase}
            color="primary" 
            variant="outlined"
            size="small"
          />
        )}
      </Box>

      {/* Primary Endpoints Section */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Primary Endpoints
            <Tooltip title="The main outcomes that are measured to determine whether the intervention being studied is beneficial">
              <IconButton size="small">
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Endpoint Description"
                    placeholder="E.g., Change in tumor size from baseline"
                    value={newPrimaryEndpoint.description}
                    onChange={handlePrimaryEndpointChange('description')}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth required>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={newPrimaryEndpoint.type}
                      onChange={handlePrimaryEndpointChange('type')}
                      label="Type"
                    >
                      {endpointTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth required>
                    <InputLabel>Timeframe</InputLabel>
                    <Select
                      value={newPrimaryEndpoint.timeframe}
                      onChange={handlePrimaryEndpointChange('timeframe')}
                      label="Timeframe"
                    >
                      {timeframeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {newPrimaryEndpoint.timeframe === 'custom' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Custom Timeframe"
                      placeholder="E.g., 6 months after treatment initiation"
                      value={newPrimaryEndpoint.customTimeframe}
                      onChange={handlePrimaryEndpointChange('customTimeframe')}
                    />
                  </Grid>
                )}
                
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={addPrimaryEndpoint}
                    disabled={!validatePrimaryEndpoint()}
                  >
                    Add Primary Endpoint
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* List of Primary Endpoints */}
          <List>
            {formState.primaryEndpoints.map((endpoint) => (
              <ListItem key={endpoint.id} divider>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleOutlineIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2">{endpoint.description}</Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={endpointTypes.find(t => t.value === endpoint.type)?.label || endpoint.type}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`Measured at: ${endpoint.timeframe}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => removePrimaryEndpoint(endpoint.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {formState.primaryEndpoints.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ my: 2, fontStyle: 'italic', textAlign: 'center' }}>
                No primary endpoints added yet
              </Typography>
            )}
          </List>
        </Grid>

        {/* Secondary Endpoints Section */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Secondary Endpoints
            <Tooltip title="Additional outcomes that are measured to support or provide context to the primary endpoints">
              <IconButton size="small">
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Endpoint Description"
                    placeholder="E.g., Reduction in adverse events"
                    value={newSecondaryEndpoint.description}
                    onChange={handleSecondaryEndpointChange('description')}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth required>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={newSecondaryEndpoint.type}
                      onChange={handleSecondaryEndpointChange('type')}
                      label="Type"
                    >
                      {endpointTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth required>
                    <InputLabel>Timeframe</InputLabel>
                    <Select
                      value={newSecondaryEndpoint.timeframe}
                      onChange={handleSecondaryEndpointChange('timeframe')}
                      label="Timeframe"
                    >
                      {timeframeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {newSecondaryEndpoint.timeframe === 'custom' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Custom Timeframe"
                      placeholder="E.g., 3 months after treatment initiation"
                      value={newSecondaryEndpoint.customTimeframe}
                      onChange={handleSecondaryEndpointChange('customTimeframe')}
                    />
                  </Grid>
                )}
                
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={addSecondaryEndpoint}
                    disabled={!validateSecondaryEndpoint()}
                  >
                    Add Secondary Endpoint
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* List of Secondary Endpoints */}
          <List>
            {formState.secondaryEndpoints.map((endpoint) => (
              <ListItem key={endpoint.id} divider>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleOutlineIcon color="secondary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2">{endpoint.description}</Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={endpointTypes.find(t => t.value === endpoint.type)?.label || endpoint.type}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`Measured at: ${endpoint.timeframe}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => removeSecondaryEndpoint(endpoint.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {formState.secondaryEndpoints.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ my: 2, fontStyle: 'italic', textAlign: 'center' }}>
                No secondary endpoints added yet
              </Typography>
            )}
          </List>
        </Grid>

        {/* Assessments Section */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Assessments
            <Tooltip title="Tests, exams, or measurements used to evaluate the endpoints">
              <IconButton size="small">
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    required
                    label="Assessment Name"
                    placeholder="E.g., Blood Pressure Measurement"
                    value={newAssessment.name}
                    onChange={handleAssessmentChange('name')}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={newAssessment.type}
                      onChange={handleAssessmentChange('type')}
                      label="Type"
                    >
                      {assessmentTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required>
                    <InputLabel>Frequency</InputLabel>
                    <Select
                      value={newAssessment.frequency}
                      onChange={handleAssessmentChange('frequency')}
                      label="Frequency"
                    >
                      {timeframeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Details (Optional)"
                    placeholder="Additional details about the assessment"
                    value={newAssessment.details}
                    onChange={handleAssessmentChange('details')}
                  />
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={addAssessment}
                    disabled={!newAssessment.name || !newAssessment.type || !newAssessment.frequency}
                  >
                    Add Assessment
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* List of Assessments */}
          <List>
            {formState.assessments.map((assessment) => (
              <ListItem key={assessment.id} divider>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle2">{assessment.name}</Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={assessmentTypes.find(t => t.value === assessment.type)?.label || assessment.type}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`Frequency: ${timeframeOptions.find(t => t.value === assessment.frequency)?.label || assessment.frequency}`}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      {assessment.details && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {assessment.details}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => removeAssessment(assessment.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {formState.assessments.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ my: 2, fontStyle: 'italic', textAlign: 'center' }}>
                No assessments added yet
              </Typography>
            )}
          </List>
        </Grid>
      </Grid>
      
      {/* AI Recommendations */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Tooltip title="Get AI-powered endpoint recommendations based on your therapeutic area and phase">
          <Chip
            label="Get Endpoint Recommendations"
            color="secondary"
            onClick={getAIRecommendations}
            clickable
            sx={{ cursor: 'pointer' }}
          />
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default EndpointsForm; 