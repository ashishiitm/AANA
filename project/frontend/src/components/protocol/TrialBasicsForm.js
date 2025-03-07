import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Chip,
  Autocomplete,
  Paper,
  Grid,
  Tooltip,
  IconButton,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BiochemistryIcon from '@mui/icons-material/Biotech';
import DrugAnalysisModal from './DrugAnalysisModal';
import aiProtocolService from '../../services/aiProtocolService';
import deepseekService from '../../services/deepseekService';

// Predefined options
const phaseOptions = [
  { value: 'Phase I', label: 'Phase I' },
  { value: 'Phase II', label: 'Phase II' },
  { value: 'Phase III', label: 'Phase III' },
  { value: 'Phase IV', label: 'Phase IV' },
  { value: 'Phase I/II', label: 'Phase I/II' },
  { value: 'Phase II/III', label: 'Phase II/III' },
];

const therapeuticAreas = [
  { value: 'oncology', label: 'Oncology' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'infectious_diseases', label: 'Infectious Diseases' },
  { value: 'respiratory', label: 'Respiratory' },
  { value: 'immunology', label: 'Immunology' },
  { value: 'endocrinology', label: 'Endocrinology' },
  { value: 'gastroenterology', label: 'Gastroenterology' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'rheumatology', label: 'Rheumatology' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'psychiatry', label: 'Psychiatry' },
  { value: 'ophthalmology', label: 'Ophthalmology' },
  { value: 'urology', label: 'Urology' },
  { value: 'nephrology', label: 'Nephrology' },
  { value: 'hematology', label: 'Hematology' },
  { value: 'hepatology', label: 'Hepatology' },
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'other', label: 'Other' },
];

const objectiveOptions = [
  { value: 'safety', label: 'Safety' },
  { value: 'efficacy', label: 'Efficacy' },
  { value: 'dose_finding', label: 'Dose-finding' },
  { value: 'pharmacokinetics', label: 'Pharmacokinetics' },
  { value: 'pharmacodynamics', label: 'Pharmacodynamics' },
  { value: 'bioequivalence', label: 'Bioequivalence' },
  { value: 'bioavailability', label: 'Bioavailability' },
];

const TrialBasicsForm = ({ data = {}, onUpdate }) => {
  // Initialize form state with provided data or defaults
  const [formState, setFormState] = useState({
    phase: data.phase || '',
    therapeuticArea: data.therapeuticArea || '',
    drugName: data.drugName || '',
    condition: data.condition || '',
    objective: data.objective || '',
    customObjective: data.customObjective || '',
    ...data
  });

  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingProtocol, setLoadingProtocol] = useState(false);
  const [suggestedAreas, setSuggestedAreas] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [protocolGenerated, setProtocolGenerated] = useState(false);
  const [drugAnalysisOpen, setDrugAnalysisOpen] = useState(false);
  const [drugAnalysisResults, setDrugAnalysisResults] = useState(null);
  const [deepseekKeyDialogOpen, setDeepseekKeyDialogOpen] = useState(false);
  const [deepseekApiKey, setDeepseekApiKey] = useState('');

  // Update parent component when form state changes
  useEffect(() => {
    onUpdate(formState);
  }, [formState, onUpdate]);

  // Handle field changes
  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));

    // If condition changes, suggest therapeutic areas
    if (field === 'condition' && value.trim().length > 3) {
      suggestTherapeuticArea(value);
    }
  };

  // Handle autocomplete changes
  const handleAutocompleteChange = (field) => (event, newValue) => {
    setFormState(prev => ({
      ...prev,
      [field]: newValue
    }));
  };

  // Use custom objective if selected
  const isCustomObjective = formState.objective === 'custom';

  // Suggest therapeutic area based on condition
  const suggestTherapeuticArea = async (conditionText) => {
    if (!conditionText || conditionText.trim().length < 3) return;
    
    setLoadingSuggestions(true);
    try {
      const suggestions = await aiProtocolService.suggestTherapeuticAreas(conditionText);
      setSuggestedAreas(suggestions);
      
      // Auto-select the first suggestion if we only have one
      if (suggestions.length === 1 && !formState.therapeuticArea) {
        setFormState(prev => ({
          ...prev,
          therapeuticArea: suggestions[0]
        }));
        
        // Show toast notification
        setSnackbarMessage(`Therapeutic area '${suggestions[0]}' suggested based on condition`);
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error getting therapeutic area suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Check for similar existing protocols (placeholder for future AI integration)
  const suggestSimilarProtocols = async () => {
    // This would integrate with the backend to find similar protocols
    // For now, just provide an example suggestion
    const suggestion = {
      phase: formState.phase || 'Phase II',
      similarTrials: ['NCT04385368', 'NCT03769506'],
      suggestions: 'Consider adaptive design based on recent similar trials.'
    };
    
    // In a real implementation, this would be a modal or a more sophisticated UI component
    alert(`AI Suggestion: ${suggestion.suggestions}`);
  };

  // Generate complete protocol using AI
  const generateProtocol = async () => {
    // Requires therapeutic area, phase, and condition
    if (!formState.therapeuticArea || !formState.phase || !formState.condition) {
      setSnackbarMessage('Please enter therapeutic area, phase, and condition');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    
    setLoadingProtocol(true);
    try {
      const protocol = await aiProtocolService.generateProtocolTemplate({
        therapeuticArea: formState.therapeuticArea,
        phase: formState.phase,
        condition: formState.condition,
        drugName: formState.drugName
      });
      
      // Update the basic form with generated objective if it's empty
      if (!formState.objective && protocol.trial_basics.objective) {
        setFormState(prev => ({
          ...prev,
          objective: 'custom',
          customObjective: protocol.trial_basics.objective
        }));
      }
      
      // Call parent update with full protocol data
      onUpdate({
        ...formState,
        objective: formState.objective || 'custom',
        customObjective: formState.customObjective || protocol.trial_basics.objective,
        generatedProtocol: protocol
      });
      
      setProtocolGenerated(true);
      setSnackbarMessage('Protocol successfully generated! Continue to the next step to review and edit.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error generating protocol:', error);
      setSnackbarMessage('Failed to generate protocol. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoadingProtocol(false);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Open drug analysis modal
  const handleOpenDrugAnalysis = () => {
    if (!formState.drugName) {
      setSnackbarMessage('Please enter a drug name first');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    setDrugAnalysisOpen(true);
  };

  // Handle drug analysis completion
  const handleAnalysisComplete = (results) => {
    setDrugAnalysisResults(results);
    
    // You could automatically update the protocol with this drug information
    // For now, we'll just store it in the form state
    setFormState(prev => ({
      ...prev,
      drugAnalysis: results
    }));
  };

  // Handle API key dialog
  const handleOpenApiKeyDialog = () => {
    setDeepseekKeyDialogOpen(true);
  };

  const handleSetApiKey = () => {
    if (deepseekApiKey) {
      deepseekService.setApiKey(deepseekApiKey);
      setDeepseekKeyDialogOpen(false);
      setSnackbarMessage('DeepSeek API key set successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Trial Basics
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Please provide the fundamental details about your clinical trial.
        </Typography>
      </Box>

      <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
        <Button
          size="small"
          startIcon={<SmartToyIcon />}
          color="primary"
          variant="outlined"
          onClick={handleOpenApiKeyDialog}
        >
          Set API Key
        </Button>
      </Box>
      
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={loadingProtocol ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
          onClick={generateProtocol}
          disabled={loadingProtocol || !formState.therapeuticArea || !formState.phase || !formState.condition}
          sx={{ mr: 2 }}
        >
          {loadingProtocol ? 'Generating...' : 'Auto-Generate Protocol'}
        </Button>
        
        <Typography variant="body2" color="text.secondary">
          Let AI create your protocol based on therapeutic area, phase, and condition
        </Typography>
      </Box>
      
      {protocolGenerated && (
        <Fade in={protocolGenerated}>
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="subtitle2">Protocol Generated Successfully!</Typography>
            <Typography variant="body2">
              We've generated a complete protocol template for you. Continue to the next steps to review and customize the details.
            </Typography>
          </Alert>
        </Fade>
      )}
      
      <Divider sx={{ mb: 4 }} />

      <Grid container spacing={3}>
        {/* Phase Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel id="phase-label">Trial Phase</InputLabel>
            <Select
              labelId="phase-label"
              id="phase"
              value={formState.phase}
              label="Trial Phase"
              onChange={handleChange('phase')}
            >
              {phaseOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Select the clinical trial phase
              <Tooltip title="Phase I: First-in-human studies to evaluate safety. Phase II: Evaluate effectiveness and side effects. Phase III: Confirm effectiveness in larger population. Phase IV: Post-marketing studies.">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* Therapeutic Area */}
        <Grid item xs={12} md={6}>
          <Autocomplete
            id="therapeutic-area"
            options={therapeuticAreas}
            getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
            value={therapeuticAreas.find(area => area.value === formState.therapeuticArea) || null}
            onChange={(event, newValue) => {
              setFormState(prev => ({
                ...prev,
                therapeuticArea: newValue ? newValue.value : ''
              }));
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Therapeutic Area" 
                required
                helperText={
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                    Select the main therapeutic area
                    <Tooltip title="The medical specialty or disease area that this trial targets">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            )}
          />
        </Grid>

        {/* Drug Name */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Drug / Intervention Name"
            value={formState.drugName}
            onChange={handleChange('drugName')}
            placeholder="e.g., Example-mab, Study Drug XYZ-123"
            helperText="Name of the drug or intervention being studied"
          />
        </Grid>

        {/* Condition */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Condition"
            placeholder="e.g., Type 2 Diabetes, Lung Cancer, Rheumatoid Arthritis"
            value={formState.condition}
            onChange={handleChange('condition')}
            helperText="The disease or condition being studied"
            InputProps={{
              endAdornment: loadingSuggestions && (
                <CircularProgress size={20} color="inherit" />
              )
            }}
          />
        </Grid>

        {/* Objective */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel id="objective-label">Primary Objective</InputLabel>
            <Select
              labelId="objective-label"
              id="objective"
              value={formState.objective}
              label="Primary Objective"
              onChange={handleChange('objective')}
            >
              {objectiveOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
              <MenuItem value="custom">Custom Objective</MenuItem>
            </Select>
            <FormHelperText>
              Select the primary objective of this trial
              <Tooltip title="The main purpose of conducting this clinical trial">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* Custom Objective (conditional) */}
        {isCustomObjective && (
          <Grid item xs={12}>
            <TextField
              id="custom-objective"
              label="Custom Objective"
              fullWidth
              required
              value={formState.customObjective}
              onChange={handleChange('customObjective')}
              helperText="Enter your custom trial objective"
              multiline
              rows={2}
            />
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
            <Button
              variant="outlined"
              startIcon={<BiochemistryIcon />}
              onClick={handleOpenDrugAnalysis}
              disabled={!formState.drugName}
              sx={{ mt: 1 }}
            >
              Analyze Drug Composition
            </Button>
            
            {drugAnalysisResults && (
              <Chip
                label="Analysis Available"
                color="success"
                size="small"
                variant="outlined"
                sx={{ ml: 1, mt: 1 }}
              />
            )}
          </Box>
        </Grid>
      </Grid>

      {/* AI Suggestion Button */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Tooltip title="Get AI suggestions based on similar protocols in our database">
          <Chip 
            label="Get AI Protocol Suggestions" 
            color="info" 
            onClick={suggestSimilarProtocols}
            clickable
            sx={{ cursor: 'pointer' }}
          />
        </Tooltip>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      {/* Drug Analysis Modal */}
      <DrugAnalysisModal
        open={drugAnalysisOpen}
        onClose={() => setDrugAnalysisOpen(false)}
        onAnalysisComplete={handleAnalysisComplete}
        drugName={formState.drugName}
      />
      
      {/* DeepSeek API Key Dialog */}
      <Dialog
        open={deepseekKeyDialogOpen}
        onClose={() => setDeepseekKeyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Set DeepSeek API Key</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              Enter your DeepSeek API key to enable AI-powered protocol generation and drug analysis.
              The key will be stored in memory for this session only.
            </Typography>
            <TextField
              fullWidth
              label="DeepSeek API Key"
              type="password"
              value={deepseekApiKey}
              onChange={(e) => setDeepseekApiKey(e.target.value)}
              variant="outlined"
              placeholder="sk-..."
              helperText="Get your API key from the DeepSeek dashboard"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeepseekKeyDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSetApiKey}
            disabled={!deepseekApiKey}
          >
            Set API Key
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TrialBasicsForm; 