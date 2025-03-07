import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Slider,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Radio,
  RadioGroup,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  InputAdornment,
  Card,
  CardContent,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

// Study design types
const designTypes = [
  { value: 'randomized', label: 'Randomized' },
  { value: 'single_arm', label: 'Single-arm' },
  { value: 'open_label', label: 'Open-label' },
  { value: 'double_blind', label: 'Double-blind' },
  { value: 'crossover', label: 'Crossover' },
  { value: 'parallel', label: 'Parallel' },
  { value: 'case_control', label: 'Case-control' },
];

// Administration routes
const routeOptions = [
  { value: 'oral', label: 'Oral' },
  { value: 'iv', label: 'Intravenous (IV)' },
  { value: 'subcutaneous', label: 'Subcutaneous' },
  { value: 'intramuscular', label: 'Intramuscular' },
  { value: 'topical', label: 'Topical' },
  { value: 'intradermal', label: 'Intradermal' },
  { value: 'inhalation', label: 'Inhalation' },
  { value: 'other', label: 'Other' },
];

// Dosing frequency options
const frequencyOptions = [
  { value: 'once', label: 'Once (single dose)' },
  { value: 'daily', label: 'Daily' },
  { value: 'twice_daily', label: 'Twice daily' },
  { value: 'three_times_daily', label: 'Three times daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'other', label: 'Other' },
];

// Placeholder component - will be expanded with full functionality
const StudyDesignForm = ({ data = {}, onUpdate, trialBasics }) => {
  // Initialize form state with provided data or defaults
  const [formState, setFormState] = useState({
    type: data.type || [],
    population: {
      ageRange: data.population?.ageRange || [18, 65],
      inclusion: data.population?.inclusion || [],
      exclusion: data.population?.exclusion || [],
    },
    intervention: {
      dosage: data.intervention?.dosage || '',
      frequency: data.intervention?.frequency || '',
      route: data.intervention?.route || '',
    },
    comparator: data.comparator || 'none',
    ...data
  });

  // New inclusion/exclusion criteria text state
  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');

  // Update parent component when form state changes
  useEffect(() => {
    onUpdate(formState);
  }, [formState, onUpdate]);

  // Handle checkbox changes for study types
  const handleTypeChange = (type) => (event) => {
    const isChecked = event.target.checked;
    
    setFormState(prev => {
      let updatedTypes;
      
      if (isChecked) {
        updatedTypes = [...prev.type, type];
      } else {
        updatedTypes = prev.type.filter(t => t !== type);
      }
      
      return {
        ...prev,
        type: updatedTypes
      };
    });
  };

  // Handle age range slider changes
  const handleAgeRangeChange = (event, newValue) => {
    setFormState(prev => ({
      ...prev,
      population: {
        ...prev.population,
        ageRange: newValue
      }
    }));
  };

  // Handle intervention field changes
  const handleInterventionChange = (field) => (event) => {
    const value = event.target.value;
    
    setFormState(prev => ({
      ...prev,
      intervention: {
        ...prev.intervention,
        [field]: value
      }
    }));
  };

  // Handle comparator selection
  const handleComparatorChange = (event) => {
    setFormState(prev => ({
      ...prev,
      comparator: event.target.value
    }));
  };

  // Add inclusion criteria
  const addInclusion = () => {
    if (newInclusion.trim()) {
      setFormState(prev => ({
        ...prev,
        population: {
          ...prev.population,
          inclusion: [...prev.population.inclusion, newInclusion.trim()]
        }
      }));
      setNewInclusion('');
    }
  };

  // Add exclusion criteria
  const addExclusion = () => {
    if (newExclusion.trim()) {
      setFormState(prev => ({
        ...prev,
        population: {
          ...prev.population,
          exclusion: [...prev.population.exclusion, newExclusion.trim()]
        }
      }));
      setNewExclusion('');
    }
  };

  // Remove inclusion criteria
  const removeInclusion = (index) => {
    setFormState(prev => ({
      ...prev,
      population: {
        ...prev.population,
        inclusion: prev.population.inclusion.filter((_, i) => i !== index)
      }
    }));
  };

  // Remove exclusion criteria
  const removeExclusion = (index) => {
    setFormState(prev => ({
      ...prev,
      population: {
        ...prev.population,
        exclusion: prev.population.exclusion.filter((_, i) => i !== index)
      }
    }));
  };

  // Get study design recommendations based on therapeutic area (future AI integration)
  const getAIRecommendations = () => {
    // This would call an API to get recommendations
    alert('AI Design Recommendations feature will be implemented in the next phase.');
  };

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Study Design
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Define the design methodology, participant population, and intervention details.
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

      <Grid container spacing={3}>
        {/* Study Type Selection */}
        <Grid item xs={12}>
          <FormControl component="fieldset" required>
            <FormLabel component="legend">
              Study Type
              <Tooltip title="Select all that apply to your study design">
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </FormLabel>
            <FormGroup row>
              {designTypes.map((type) => (
                <FormControlLabel
                  key={type.value}
                  control={
                    <Checkbox
                      checked={formState.type.includes(type.value)}
                      onChange={handleTypeChange(type.value)}
                    />
                  }
                  label={type.label}
                />
              ))}
            </FormGroup>
          </FormControl>
        </Grid>

        {/* Population - Age Range */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Population
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ px: 2, mb: 3 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <Typography id="age-range-slider" gutterBottom>
                Age Range: {formState.population.ageRange[0]} - {formState.population.ageRange[1]} years
              </Typography>
              <Slider
                value={formState.population.ageRange}
                onChange={handleAgeRangeChange}
                valueLabelDisplay="auto"
                min={0}
                max={100}
                aria-labelledby="age-range-slider"
              />
            </FormControl>
          </Box>
        </Grid>

        {/* Inclusion Criteria */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Inclusion Criteria
                <Tooltip title="Characteristics that potential participants must have to be included in the study">
                  <IconButton size="small">
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              
              <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Add inclusion criteria"
                  value={newInclusion}
                  onChange={(e) => setNewInclusion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addInclusion()}
                />
                <IconButton color="primary" onClick={addInclusion}>
                  <AddCircleOutlineIcon />
                </IconButton>
              </Box>
              
              <List dense>
                {formState.population.inclusion.map((criterion, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={`${index + 1}. ${criterion}`} />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => removeInclusion(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {formState.population.inclusion.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ my: 1, fontStyle: 'italic' }}>
                    No inclusion criteria added yet
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Exclusion Criteria */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Exclusion Criteria
                <Tooltip title="Characteristics that disqualify potential participants from the study">
                  <IconButton size="small">
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              
              <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Add exclusion criteria"
                  value={newExclusion}
                  onChange={(e) => setNewExclusion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addExclusion()}
                />
                <IconButton color="primary" onClick={addExclusion}>
                  <AddCircleOutlineIcon />
                </IconButton>
              </Box>
              
              <List dense>
                {formState.population.exclusion.map((criterion, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={`${index + 1}. ${criterion}`} />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => removeExclusion(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {formState.population.exclusion.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ my: 1, fontStyle: 'italic' }}>
                    No exclusion criteria added yet
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Intervention Details */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Intervention
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Dosage"
                value={formState.intervention.dosage}
                onChange={handleInterventionChange('dosage')}
                required
                helperText="Enter the dose amount"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Specify the amount of drug administered in each dose (e.g., 10 mg, 100 mL)">
                      <InputAdornment position="end">
                        <HelpOutlineIcon fontSize="small" />
                      </InputAdornment>
                    </Tooltip>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={formState.intervention.frequency}
                  onChange={handleInterventionChange('frequency')}
                  label="Frequency"
                >
                  {frequencyOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Route</InputLabel>
                <Select
                  value={formState.intervention.route}
                  onChange={handleInterventionChange('route')}
                  label="Route"
                >
                  {routeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>

        {/* Comparator */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Comparator
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <FormControl component="fieldset" required>
            <RadioGroup
              name="comparator"
              value={formState.comparator}
              onChange={handleComparatorChange}
            >
              <FormControlLabel value="placebo" control={<Radio />} label="Placebo" />
              <FormControlLabel value="standard_of_care" control={<Radio />} label="Standard of Care" />
              <FormControlLabel value="active_comparator" control={<Radio />} label="Active Comparator" />
              <FormControlLabel value="none" control={<Radio />} label="None (Single Arm)" />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
      
      {/* AI Recommendations */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Tooltip title="Get AI-powered design recommendations based on your trial details">
          <Chip
            label="Get Design Recommendations"
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

export default StudyDesignForm; 