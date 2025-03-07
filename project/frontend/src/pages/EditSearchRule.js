import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Chip,
  FormHelperText, Grid, Autocomplete, Divider, Alert, CircularProgress
} from '@mui/material';
import { fetchSearchRule, updateSearchRule, fetchAdverseEventTermsByCategory } from '../api';
import { createFilterOptions } from '../patchMUI';

const EditSearchRule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form validation
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch the search rule
        const rule = await fetchSearchRule(id);
        if (!rule) {
          setError('Search rule not found');
          setLoading(false);
          return;
        }
        
        // Fetch adverse event terms
        const terms = await fetchAdverseEventTermsByCategory();
        setAdverseEventTerms(terms);
        
        // Find the selected terms
        const allTerms = Object.values(terms).flat();
        const selectedTermObjects = rule.adverse_event_terms || [];
        setSelectedTerms(selectedTermObjects);
        
        // Format dates if they exist
        const formattedRule = {
          ...rule,
          date_range_start: rule.date_range_start ? rule.date_range_start.substring(0, 10) : '',
          date_range_end: rule.date_range_end ? rule.date_range_end.substring(0, 10) : '',
          adverse_event_term_ids: selectedTermObjects.map(term => term.id)
        };
        
        setFormData(formattedRule);
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load search rule data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleTermsChange = (event, newValue) => {
    setSelectedTerms(newValue);
    setFormData({
      ...formData,
      adverse_event_term_ids: newValue.map(term => term.id)
    });
    
    // Clear error for this field if it exists
    if (errors.adverse_event_term_ids) {
      setErrors({
        ...errors,
        adverse_event_term_ids: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.drug_name.trim()) {
      newErrors.drug_name = 'Drug name is required';
    }
    
    if (formData.adverse_event_term_ids.length === 0 && !formData.additional_keywords.trim()) {
      newErrors.adverse_event_term_ids = 'At least one adverse event term or additional keyword is required';
      newErrors.additional_keywords = 'At least one adverse event term or additional keyword is required';
    }
    
    if (formData.date_range_start && formData.date_range_end && 
        new Date(formData.date_range_start) > new Date(formData.date_range_end)) {
      newErrors.date_range_start = 'Start date cannot be after end date';
      newErrors.date_range_end = 'End date cannot be before start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const result = await updateSearchRule(id, formData);
      if (result) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/pharmacovigilance');
        }, 2000);
      } else {
        setError('Failed to update search rule. Please try again.');
      }
    } catch (err) {
      console.error('Error updating search rule:', err);
      setError('Failed to update search rule. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/pharmacovigilance');
  };

  // Flatten the terms by category for the Autocomplete component
  const allTerms = Object.entries(adverseEventTerms).reduce((acc, [category, terms]) => {
    return [...acc, ...terms];
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Edit Search Rule
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Search rule updated successfully! Redirecting...
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
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
                disabled={saving}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                multiline
                rows={2}
                disabled={saving}
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
                disabled={saving}
              />
            </Grid>
            
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
                disabled={saving || Object.keys(adverseEventTerms).length === 0}
                groupBy={(option) => option.category}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                filterOptions={createFilterOptions()}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Keywords (comma separated)"
                name="additional_keywords"
                value={formData.additional_keywords || ''}
                onChange={handleInputChange}
                error={!!errors.additional_keywords}
                helperText={errors.additional_keywords}
                disabled={saving}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date Range Start"
                name="date_range_start"
                type="date"
                value={formData.date_range_start}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.date_range_start}
                helperText={errors.date_range_start}
                disabled={saving}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date Range End"
                name="date_range_end"
                type="date"
                value={formData.date_range_end}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.date_range_end}
                helperText={errors.date_range_end}
                disabled={saving}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={saving}>
                <InputLabel id="frequency-label">Search Frequency</InputLabel>
                <Select
                  labelId="frequency-label"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  label="Search Frequency"
                >
                  <MenuItem value="MANUAL">Manual</MenuItem>
                  <MenuItem value="DAILY">Daily</MenuItem>
                  <MenuItem value="WEEKLY">Weekly</MenuItem>
                  <MenuItem value="MONTHLY">Monthly</MenuItem>
                </Select>
                <FormHelperText>
                  How often should this search be run automatically
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={saving}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                  <MenuItem value="ARCHIVED">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditSearchRule; 