import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Chip,
  FormHelperText, Grid, Autocomplete, Divider, Alert,
  Stepper, Step, StepLabel, StepContent, Card, CardContent,
  IconButton, Tooltip, useTheme
} from '@mui/material';
import {
  MedicationOutlined as DrugIcon,
  WarningAmberOutlined as AdverseEventIcon,
  CalendarMonthOutlined as DateIcon,
  SettingsOutlined as SettingsIcon,
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { createSearchRule, fetchAdverseEventTermsByCategory } from '../api/pharmacovigilance';
import { createFilterOptions } from '../patchMUI';

const CreateSearchRule = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    drug_name: '',
    adverse_event_term_ids: [],
    additional_keywords: '',
    date_range_start: '',
    date_range_end: '',
    frequency: 'MANUAL',
    status: 'ACTIVE'
  });
  
  const [adverseEventTerms, setAdverseEventTerms] = useState({});
  const [selectedTerms, setSelectedTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const terms = await fetchAdverseEventTermsByCategory();
        setAdverseEventTerms(terms);
      } catch (err) {
        console.error('Error fetching adverse event terms:', err);
        setError('Failed to load adverse event terms. Some features may be limited.');
      }
    };
    fetchTerms();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleTermsChange = (event, newValue) => {
    setSelectedTerms(newValue);
    setFormData(prev => ({
      ...prev,
      adverse_event_term_ids: newValue.map(term => term.id)
    }));
    if (errors.adverse_event_term_ids) {
      setErrors(prev => ({
        ...prev,
        adverse_event_term_ids: null
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Basic Info
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.drug_name.trim()) newErrors.drug_name = 'Drug name is required';
        break;
      case 1: // Adverse Events
        if (formData.adverse_event_term_ids.length === 0 && !formData.additional_keywords.trim()) {
          newErrors.adverse_event_term_ids = 'At least one adverse event term or additional keyword is required';
          newErrors.additional_keywords = 'At least one adverse event term or additional keyword is required';
        }
        break;
      case 2: // Date Range
        if (formData.date_range_start && formData.date_range_end && 
            new Date(formData.date_range_start) > new Date(formData.date_range_end)) {
          newErrors.date_range_start = 'Start date cannot be after end date';
          newErrors.date_range_end = 'End date cannot be before start date';
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(activeStep)) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await createSearchRule(formData);
      if (result) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/pharmacovigilance');
        }, 2000);
      } else {
        setError('Failed to create search rule. Please try again.');
      }
    } catch (err) {
      console.error('Error creating search rule:', err);
      setError('Failed to create search rule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/pharmacovigilance');
  };

  const allTerms = Object.entries(adverseEventTerms).reduce((acc, [category, terms]) => {
    return [...acc, ...terms];
  }, []);

  const steps = [
    {
      label: 'Basic Information',
      icon: <DrugIcon />,
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Rule Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={!!errors.name}
              helperText={errors.name}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={2}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Drug Name"
              name="drug_name"
              value={formData.drug_name}
              onChange={handleInputChange}
              error={!!errors.drug_name}
              helperText={errors.drug_name}
              disabled={loading}
            />
          </Grid>
        </Grid>
      )
    },
    {
      label: 'Adverse Events',
      icon: <AdverseEventIcon />,
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={allTerms}
              getOptionLabel={(option) => `${option.term} (${option.category})`}
              value={selectedTerms}
              onChange={handleTermsChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Adverse Event Terms"
                  error={!!errors.adverse_event_term_ids}
                  helperText={errors.adverse_event_term_ids}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.term}
                    {...getTagProps({ index })}
                    color="primary"
                    variant="outlined"
                  />
                ))
              }
              disabled={loading || Object.keys(adverseEventTerms).length === 0}
              groupBy={(option) => option.category}
              filterOptions={createFilterOptions()}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Additional Keywords (comma separated)"
              name="additional_keywords"
              value={formData.additional_keywords}
              onChange={handleInputChange}
              error={!!errors.additional_keywords}
              helperText={errors.additional_keywords}
              disabled={loading}
            />
          </Grid>
        </Grid>
      )
    },
    {
      label: 'Date Range & Settings',
      icon: <SettingsIcon />,
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              name="date_range_start"
              value={formData.date_range_start}
              onChange={handleInputChange}
              error={!!errors.date_range_start}
              helperText={errors.date_range_start}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              name="date_range_end"
              value={formData.date_range_end}
              onChange={handleInputChange}
              error={!!errors.date_range_end}
              helperText={errors.date_range_end}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={loading}>
              <InputLabel>Frequency</InputLabel>
              <Select
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                label="Frequency"
              >
                <MenuItem value="MANUAL">Manual</MenuItem>
                <MenuItem value="DAILY">Daily</MenuItem>
                <MenuItem value="WEEKLY">Weekly</MenuItem>
                <MenuItem value="MONTHLY">Monthly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={loading}>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                label="Status"
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      )
    }
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={handleCancel}
          sx={{ mr: 2 }}
          color="primary"
        >
          <BackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          Create New Search Rule
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Search rule created successfully! Redirecting...
        </Alert>
      )}

      <Paper 
        sx={{ 
          p: 3,
          backgroundColor: theme.palette.background.default
        }}
        elevation={2}
      >
        <Stepper 
          activeStep={activeStep} 
          orientation="vertical"
          sx={{
            '& .MuiStepLabel-root': {
              padding: theme.spacing(2, 0),
            },
            '& .MuiStepContent-root': {
              borderLeft: `2px solid ${theme.palette.divider}`,
              marginLeft: theme.spacing(2),
              paddingLeft: theme.spacing(3),
            }
          }}
        >
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: activeStep >= index ? theme.palette.primary.main : theme.palette.grey[300],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: activeStep >= index ? theme.palette.primary.contrastText : theme.palette.text.secondary,
                    }}
                  >
                    {step.icon}
                  </Box>
                )}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  {step.label}
                </Typography>
              </StepLabel>
              <StepContent>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    mb: 2,
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: theme.shadows[1]
                  }}
                >
                  <CardContent>
                    {step.content}
                  </CardContent>
                </Card>
                <Box sx={{ mb: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                      sx={{ mt: 1, mr: 1 }}
                      disabled={loading}
                      startIcon={index === steps.length - 1 ? <SaveIcon /> : null}
                    >
                      {index === steps.length - 1 ? 'Create Rule' : 'Continue'}
                    </Button>
                    <Button
                      disabled={index === 0 || loading}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Back
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Container>
  );
};

export default CreateSearchRule; 