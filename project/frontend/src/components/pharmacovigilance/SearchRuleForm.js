import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Button,
  Divider,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { fetchAdverseEventTerms } from '../../api';

const FIELD_TYPES = [
  { value: 'keyword', label: 'Keyword' },
  { value: 'author', label: 'Author' },
  { value: 'exact_phrase', label: 'Exact Phrase' },
  { value: 'drug_name', label: 'Drug Name' },
  { value: 'company_name', label: 'Company Name' },
  { value: 'generic_name', label: 'Generic Name' },
  { value: 'inn_name', label: 'INN Name' },
  { value: 'adverse_event', label: 'Adverse Event Term' }
];

const OPERATORS = [
  { value: 'AND', label: 'AND' },
  { value: 'OR', label: 'OR' }
];

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: '8_hours', label: 'Every 8 Hours' },
  { value: '12_hours', label: 'Every 12 Hours' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

const EMPTY_CRITERION = {
  field_type: 'keyword',
  value: '',
  operator: 'AND',
  group: 0,
  order: 0
};

const SearchRuleForm = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    frequency: 'daily',
    email_notifications: true,
    notification_emails: '',
    ...initialData
  });
  
  const [criteria, setCriteria] = useState([{ ...EMPTY_CRITERION }]);
  const [errors, setErrors] = useState({});
  const [adverseEventTerms, setAdverseEventTerms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load initial criteria if provided
    if (initialData && initialData.criteria && initialData.criteria.length > 0) {
      setCriteria(initialData.criteria);
    }
    
    // Load adverse event terms
    const loadAdverseEventTerms = async () => {
      try {
        const terms = await fetchAdverseEventTerms();
        setAdverseEventTerms(terms);
      } catch (err) {
        console.error('Error fetching adverse event terms:', err);
      }
    };
    
    loadAdverseEventTerms();
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleCriterionChange = (index, field, value) => {
    const updatedCriteria = [...criteria];
    updatedCriteria[index] = {
      ...updatedCriteria[index],
      [field]: value
    };
    setCriteria(updatedCriteria);
    
    // Clear criterion errors if they exist
    if (errors.criteria && errors.criteria[index]) {
      const updatedErrors = { ...errors };
      updatedErrors.criteria[index] = {
        ...updatedErrors.criteria[index],
        [field]: null
      };
      setErrors(updatedErrors);
    }
  };

  const addCriterion = () => {
    setCriteria([
      ...criteria,
      {
        ...EMPTY_CRITERION,
        order: criteria.length
      }
    ]);
  };

  const removeCriterion = (index) => {
    if (criteria.length === 1) {
      // Don't remove the last criterion, just reset it
      setCriteria([{ ...EMPTY_CRITERION }]);
      return;
    }
    
    const updatedCriteria = criteria.filter((_, i) => i !== index);
    // Update order for remaining criteria
    updatedCriteria.forEach((criterion, i) => {
      criterion.order = i;
    });
    setCriteria(updatedCriteria);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate rule fields
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.email_notifications && !formData.notification_emails.trim()) {
      newErrors.notification_emails = 'Email addresses are required when notifications are enabled';
    } else if (formData.email_notifications) {
      // Validate email format
      const emails = formData.notification_emails.split(',').map(email => email.trim());
      const invalidEmails = emails.filter(email => !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));
      if (invalidEmails.length > 0) {
        newErrors.notification_emails = `Invalid email format: ${invalidEmails.join(', ')}`;
      }
    }
    
    // Validate criteria
    const criteriaErrors = [];
    let hasErrors = false;
    
    criteria.forEach((criterion, index) => {
      const criterionErrors = {};
      
      if (!criterion.value.trim()) {
        criterionErrors.value = 'Value is required';
        hasErrors = true;
      }
      
      criteriaErrors[index] = criterionErrors;
    });
    
    if (hasErrors) {
      newErrors.criteria = criteriaErrors;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const submissionData = {
      ...formData,
      criteria: criteria
    };
    
    onSubmit(submissionData);
  };

  const handleCancel = () => {
    navigate('/pharmacovigilance');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Search Rule Details
        </Typography>
        
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
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                label="Frequency"
              >
                {FREQUENCIES.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>How often to run this search</FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  color="primary"
                />
              }
              label="Active"
            />
            <FormHelperText>Enable or disable this search rule</FormHelperText>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  name="email_notifications"
                  checked={formData.email_notifications}
                  onChange={handleInputChange}
                  color="primary"
                />
              }
              label="Email Notifications"
            />
            <FormHelperText>Send email notifications when new results are found</FormHelperText>
          </Grid>
          
          {formData.email_notifications && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notification Emails"
                name="notification_emails"
                value={formData.notification_emails || ''}
                onChange={handleInputChange}
                error={!!errors.notification_emails}
                helperText={errors.notification_emails || 'Comma-separated list of email addresses'}
              />
            </Grid>
          )}
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Search Criteria
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={addCriterion}
            variant="outlined"
          >
            Add Criterion
          </Button>
        </Box>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Define what to search for in the medical literature. Criteria within the same group are combined with logical operators (AND/OR).
        </Alert>
        
        {criteria.map((criterion, index) => (
          <Card key={index} sx={{ mb: 2, border: errors.criteria && errors.criteria[index]?.value ? '1px solid red' : 'none' }}>
            <CardHeader
              title={`Criterion ${index + 1}`}
              action={
                <Tooltip title="Remove">
                  <IconButton onClick={() => removeCriterion(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              }
              sx={{ pb: 0 }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Field Type</InputLabel>
                    <Select
                      value={criterion.field_type}
                      onChange={(e) => handleCriterionChange(index, 'field_type', e.target.value)}
                      label="Field Type"
                    >
                      {FIELD_TYPES.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  {criterion.field_type === 'adverse_event' && adverseEventTerms.length > 0 ? (
                    <FormControl fullWidth>
                      <InputLabel>Adverse Event Term</InputLabel>
                      <Select
                        value={criterion.value}
                        onChange={(e) => handleCriterionChange(index, 'value', e.target.value)}
                        label="Adverse Event Term"
                        error={!!(errors.criteria && errors.criteria[index]?.value)}
                      >
                        {adverseEventTerms.map(term => (
                          <MenuItem key={term.id} value={term.term}>
                            {term.term}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.criteria && errors.criteria[index]?.value && (
                        <FormHelperText error>{errors.criteria[index].value}</FormHelperText>
                      )}
                    </FormControl>
                  ) : (
                    <TextField
                      fullWidth
                      label="Value"
                      value={criterion.value}
                      onChange={(e) => handleCriterionChange(index, 'value', e.target.value)}
                      error={!!(errors.criteria && errors.criteria[index]?.value)}
                      helperText={errors.criteria && errors.criteria[index]?.value}
                      required
                    />
                  )}
                </Grid>
                
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth>
                    <InputLabel>Operator</InputLabel>
                    <Select
                      value={criterion.operator}
                      onChange={(e) => handleCriterionChange(index, 'operator', e.target.value)}
                      label="Operator"
                    >
                      {OPERATORS.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Group</InputLabel>
                    <Select
                      value={criterion.group}
                      onChange={(e) => handleCriterionChange(index, 'group', e.target.value)}
                      label="Group"
                    >
                      {[0, 1, 2, 3, 4].map(group => (
                        <MenuItem key={group} value={group}>
                          Group {group}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Criteria in the same group are combined with the operator</FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
        
        {criteria.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
            No criteria defined. Click "Add Criterion" to add search criteria.
          </Typography>
        )}
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : (initialData ? 'Update Rule' : 'Create Rule')}
        </Button>
      </Box>
    </Box>
  );
};

export default SearchRuleForm; 