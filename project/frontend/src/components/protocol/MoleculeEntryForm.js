import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Button,
  Grid,
  CircularProgress,
  Autocomplete,
  Chip,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  Collapse,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Snackbar
} from '@mui/material';
import {
  Science as ScienceIcon,
  Biotech as BiotechIcon,
  BusinessCenter as CompanyIcon,
  AdsClick as TargetIcon,
  Layers as LayersIcon,
  Lightbulb as LightbulbIcon,
  Edit as EditIcon,
  Help as HelpIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  AutoAwesome as AIIcon,
  Draw as DrawIcon,
  Send as SendIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import * as deepseekService from '../../services/deepseekService';
import { runDeepSeekTest } from '../../services/debugDeepSeek';

// Therapeutic areas common in clinical trials
const THERAPEUTIC_AREAS = [
  'Oncology',
  'Neurology',
  'Cardiology',
  'Immunology',
  'Infectious Disease',
  'Gastroenterology',
  'Pulmonology',
  'Endocrinology',
  'Dermatology',
  'Hematology',
  'Nephrology',
  'Rheumatology',
  'Urology',
  'Ophthalmology',
  'Psychiatry'
];

// Study objectives common in clinical trials
const STUDY_OBJECTIVES = [
  'Evaluate safety and tolerability',
  'Determine maximum tolerated dose (MTD)',
  'Assess pharmacokinetics (PK)',
  'Assess pharmacodynamics (PD)',
  'Evaluate efficacy',
  'Determine recommended Phase 2 dose (RP2D)',
  'Evaluate biomarker response',
  'Assess overall response rate (ORR)',
  'Evaluate progression-free survival (PFS)',
  'Evaluate overall survival (OS)',
  'Assess quality of life (QoL)',
  'Evaluate drug-drug interactions',
  'Assess immunogenicity',
  'Determine optimal dosing regimen'
];

// Molecule types common in clinical trials
const MOLECULE_TYPES = [
  'Small Molecule',
  'Monoclonal Antibody',
  'Antibody-Drug Conjugate (ADC)',
  'Peptide',
  'Protein',
  'Bispecific Antibody',
  'Oligonucleotide',
  'mRNA',
  'Cell Therapy',
  'Gene Therapy',
  'Vaccine',
  'Radiopharmaceutical',
  'Kinase Inhibitor',
  'Enzyme',
  'Enzyme Inhibitor',
  'Receptor Modulator'
];

// Sample companies for demo
const SAMPLE_COMPANIES = [
  'Pfizer',
  'Merck',
  'Roche',
  'Novartis',
  'Johnson & Johnson',
  'AstraZeneca',
  'Sanofi',
  'Amgen',
  'Gilead Sciences',
  'AbbVie',
  'Bristol Myers Squibb',
  'GlaxoSmithKline',
  'Eli Lilly',
  'Bayer',
  'Boehringer Ingelheim',
  'Biogen',
  'Regeneron Pharmaceuticals',
  'CytomX',
  'Moderna',
  'BioNTech'
];

const MoleculeEntryForm = ({ onNext, onSaveDraft }) => {
  const [formData, setFormData] = useState({
    moleculeName: '',
    moleculeDescription: '',
    moleculeType: null,
    therapeuticArea: null,
    condition: '',
    studyObjective: null,
    company: '',
    additionalContext: ''
  });
  
  const [customTherapeuticArea, setCustomTherapeuticArea] = useState('');
  const [customObjective, setCustomObjective] = useState('');
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);
  const [aiSuggestionsOpen, setAiSuggestionsOpen] = useState(false);
  const [customPromptOpen, setCustomPromptOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [uncertaintyFlags, setUncertaintyFlags] = useState([]);
  const [templateSelected, setTemplateSelected] = useState('ICH-GCP');
  const [useAiAssistance, setUseAiAssistance] = useState(true);
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState({});
  const [validating, setValidating] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState('');
  
  // Handle basic form field changes
  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
    
    // Clear validation error when field is edited
    if (validationErrors[field]) {
      setValidationErrors({
        ...validationErrors,
        [field]: null
      });
    }
  };
  
  // Handle Autocomplete changes
  const handleAutocompleteChange = (field, newValue) => {
    setFormData({
      ...formData,
      [field]: newValue
    });
    
    // Clear validation error when field is edited
    if (validationErrors[field]) {
      setValidationErrors({
        ...validationErrors,
        [field]: null
      });
    }
  };
  
  // Handle custom therapeutic area input
  const handleCustomTherapeuticAreaChange = (event) => {
    setCustomTherapeuticArea(event.target.value);
  };
  
  // Add custom therapeutic area
  const addCustomTherapeuticArea = () => {
    if (customTherapeuticArea.trim()) {
      setFormData({
        ...formData,
        therapeuticArea: customTherapeuticArea.trim()
      });
      setCustomTherapeuticArea('');
    }
  };
  
  // Handle custom objective input
  const handleCustomObjectiveChange = (event) => {
    setCustomObjective(event.target.value);
  };
  
  // Add custom objective
  const addCustomObjective = () => {
    if (customObjective.trim()) {
      setFormData({
        ...formData,
        studyObjective: customObjective.trim()
      });
      setCustomObjective('');
    }
  };
  
  // Toggle advanced options
  const toggleAdvancedOptions = () => {
    setAdvancedOptionsOpen(!advancedOptionsOpen);
  };
  
  // Handle template selection
  const handleTemplateChange = (template) => {
    setTemplateSelected(template);
  };
  
  // Handle AI assistance toggle
  const handleAiAssistanceToggle = (event) => {
    setUseAiAssistance(event.target.checked);
  };
  
  // Open AI suggestions dialog
  const handleOpenAiSuggestions = async () => {
    if (!formData.moleculeName.trim()) {
      setValidationErrors({
        ...validationErrors,
        moleculeName: 'Please enter a molecule name first'
      });
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Call DeepSeek API to get suggestions based on molecule
      const prompt = `Analyze this drug molecule and provide insights for clinical trial design:
      Molecule Name: ${formData.moleculeName}
      Description: ${formData.moleculeDescription || 'Not provided'}
      Type: ${formData.moleculeType || 'Not specified'}
      
      Provide the following information:
      1. Most appropriate therapeutic areas and conditions
      2. Suggested study phase
      3. Potential inclusion/exclusion criteria
      4. Key safety considerations
      5. Recommended dosing approach
      6. Potential biomarkers to monitor
      7. Special populations to consider`;
      
      const results = await deepseekService.callDeepSeekAPI(prompt);
      
      setAiSuggestions(results);
      setAiSuggestionsOpen(true);
    } catch (err) {
      console.error('Error getting AI suggestions:', err);
      setError('Failed to get AI suggestions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Apply AI suggestions to form
  const applyAiSuggestions = (suggestions) => {
    if (!suggestions) return;
    
    // Parse suggestions and update form data
    // This would depend on the exact format returned by the AI
    // For now, we'll use a simplified approach
    
    const updatedFormData = {
      ...formData
    };
    
    // Extract therapeutic area if present
    if (suggestions.therapeuticArea) {
      updatedFormData.therapeuticArea = suggestions.therapeuticArea;
    }
    
    // Extract condition if present
    if (suggestions.condition) {
      updatedFormData.condition = suggestions.condition;
    }
    
    // Extract study objective if present
    if (suggestions.studyObjective) {
      updatedFormData.studyObjective = suggestions.studyObjective;
    }
    
    setFormData(updatedFormData);
    setAiSuggestionsOpen(false);
  };
  
  // Open custom prompt dialog
  const handleOpenCustomPrompt = () => {
    setCustomPromptOpen(true);
    
    // Pre-populate with a template prompt
    setCustomPrompt(`Please analyze this molecule and suggest clinical trial protocol details:
    
Molecule: ${formData.moleculeName}
Description: ${formData.moleculeDescription || '[No description provided]'}
Type: ${formData.moleculeType || '[Not specified]'}
Company: ${formData.company || '[Not specified]'}

I need suggestions for:
1. Appropriate therapeutic areas and target conditions
2. Study phase recommendation
3. Key inclusion/exclusion criteria
4. Dosing strategy
5. Primary and secondary endpoints
6. Safety monitoring requirements
7. Biomarkers to evaluate

Please format your response as structured data that can be directly used in our protocol generation system.`);
  };
  
  // Send custom prompt to AI
  const handleSendCustomPrompt = async () => {
    if (!customPrompt.trim()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const results = await deepseekService.callDeepSeekAPI(customPrompt);
      
      setAiSuggestions(results);
      setCustomPromptOpen(false);
      setAiSuggestionsOpen(true);
    } catch (err) {
      console.error('Error processing custom prompt:', err);
      setError('Failed to process custom prompt. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Validate the form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.moleculeName.trim()) {
      errors.moleculeName = 'Molecule name is required';
    }
    
    if (!formData.therapeuticArea) {
      errors.therapeuticArea = 'Therapeutic area is required';
    }
    
    if (!formData.condition.trim()) {
      errors.condition = 'Condition is required';
    }
    
    if (!formData.studyObjective) {
      errors.studyObjective = 'Study objective is required';
    }
    
    if (!formData.company.trim()) {
      errors.company = 'Company name is required';
    }
    
    return errors;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    setValidating(true);
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setValidating(false);
      return;
    }
    
    setLoading(true);
    
    try {
      // Check if any company-specific templates exist
      // This would be a real API call in production
      let template = 'ICH-GCP';
      const companyTemplateExists = SAMPLE_COMPANIES.includes(formData.company);
      
      if (companyTemplateExists) {
        template = `${formData.company}-Template`;
      }
      
      let protocolOutline = '';
      let flags = [];
      
      // Process with DeepSeek AI to get initial protocol structure
      if (useAiAssistance) {
        try {
          // Generate a trial protocol outline using AI
          protocolOutline = await deepseekService.callDeepSeekAPI(`
            Generate a clinical trial protocol outline for the following:
            
            Molecule: ${formData.moleculeName}
            Description: ${formData.moleculeDescription || 'Not provided'}
            Type: ${formData.moleculeType || 'Not specified'}
            Therapeutic Area: ${formData.therapeuticArea}
            Condition: ${formData.condition}
            Objective: ${formData.studyObjective}
            Company: ${formData.company}
            Additional Context: ${formData.additionalContext || 'None provided'}
            
            Follow the ${template} format.
            
            Identify any uncertain fields with [REVIEW: reason for uncertainty].
          `);
        } catch (apiError) {
          console.error('DeepSeek API error:', apiError);
          // Create a default protocol outline with the minimal information
          protocolOutline = `
# CLINICAL TRIAL PROTOCOL - DRAFT

## Study Information
- **Molecule Name**: ${formData.moleculeName}
- **Therapeutic Area**: ${formData.therapeuticArea}
- **Condition**: ${formData.condition}
- **Study Objective**: ${formData.studyObjective}
- **Company**: ${formData.company}
- **Template Used**: ${template}

## Notes
This is a basic outline generated without AI assistance due to a temporary API connection issue.
Please use the manual editing tools to complete the protocol or try again later.

[REVIEW: API connection issue - protocol requires manual completion]
          `;
          
          // Add a warning flag about the API issue
          flags.push("API connection issue - protocol requires manual completion");
        }
        
        // Extract uncertainty flags (if we have a protocol outline)
        if (protocolOutline) {
          const uncertaintyRegex = /\[REVIEW: ([^\]]+)\]/g;
          let match;
          
          while ((match = uncertaintyRegex.exec(protocolOutline)) !== null) {
            flags.push(match[1]);
          }
          
          setUncertaintyFlags(flags);
          
          // Prepare complete data for next step
          const completeData = {
            ...formData,
            templateUsed: template,
            protocolOutline,
            uncertaintyFlags: flags,
            createdAt: new Date().toISOString()
          };
          
          // Move to next step
          onNext(completeData);
        } else {
          throw new Error("Failed to generate protocol outline");
        }
      } else {
        // Proceed without AI pre-processing
        const completeData = {
          ...formData,
          templateUsed: template,
          createdAt: new Date().toISOString()
        };
        
        // Move to next step
        onNext(completeData);
      }
    } catch (err) {
      console.error('Error in protocol creation:', err);
      setError('Failed to generate protocol outline. Please try again later or proceed with manual protocol creation.');
    } finally {
      setLoading(false);
      setValidating(false);
    }
  };
  
  // Save as draft
  const handleSaveDraft = () => {
    const draft = {
      ...formData,
      lastSaved: new Date().toISOString(),
      isDraft: true
    };
    
    onSaveDraft(draft);
  };
  
  // Handle API test button 
  const handleTestApi = async () => {
    setLoading(true);
    setError('');
    try {
      const testResult = await runDeepSeekTest();
      console.log('API Test Result:', testResult);
      if (testResult.success) {
        setError(''); // Clear any previous errors
        setNotification('DeepSeek API connection test successful! Check the console for details.');
      } else {
        setError('DeepSeek API connection test failed. Check the console for error details.');
      }
    } catch (err) {
      console.error('Error testing API:', err);
      setError('Error testing API connection: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ScienceIcon color="primary" sx={{ fontSize: 30, mr: 2 }} />
        <Typography variant="h5" component="h2">
          Molecule-Driven Protocol Creation
        </Typography>
      </Box>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Start by entering your molecule details. The AI will suggest appropriate clinical trial parameters based on the molecule's characteristics.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Molecule Information Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <BiotechIcon sx={{ mr: 1 }} />
            Molecule Information
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="Molecule Name"
            fullWidth
            value={formData.moleculeName}
            onChange={handleChange('moleculeName')}
            placeholder="e.g., Anti-CD166 ADC with DM4"
            required
            error={!!validationErrors.moleculeName}
            helperText={validationErrors.moleculeName}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BiotechIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={MOLECULE_TYPES}
            value={formData.moleculeType}
            onChange={(event, newValue) => handleAutocompleteChange('moleculeType', newValue)}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Molecule Type" 
                placeholder="Select or type a molecule type"
              />
            )}
            freeSolo
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Molecule Description"
            fullWidth
            multiline
            rows={3}
            value={formData.moleculeDescription}
            onChange={handleChange('moleculeDescription')}
            placeholder="Enter a detailed description of the molecule, its mechanism of action, and any relevant properties"
          />
        </Grid>
        
        {/* Target & Objective Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1" sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
            <TargetIcon sx={{ mr: 1 }} />
            Target & Objective
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Autocomplete
              options={THERAPEUTIC_AREAS}
              value={formData.therapeuticArea}
              onChange={(event, newValue) => handleAutocompleteChange('therapeuticArea', newValue)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Therapeutic Area" 
                  placeholder="Select or add a therapeutic area"
                  error={!!validationErrors.therapeuticArea}
                  helperText={validationErrors.therapeuticArea}
                  required
                />
              )}
              freeSolo
            />
            
            <Box sx={{ display: 'flex', mt: 1 }}>
              <TextField
                label="Add Custom Area"
                size="small"
                value={customTherapeuticArea}
                onChange={handleCustomTherapeuticAreaChange}
                sx={{ flexGrow: 1, mr: 1 }}
              />
              <Button 
                variant="outlined" 
                onClick={addCustomTherapeuticArea}
                disabled={!customTherapeuticArea.trim()}
              >
                Add
              </Button>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="Condition"
            fullWidth
            value={formData.condition}
            onChange={handleChange('condition')}
            placeholder="e.g., HER2+ Breast Cancer"
            required
            error={!!validationErrors.condition}
            helperText={validationErrors.condition}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Autocomplete
              options={STUDY_OBJECTIVES}
              value={formData.studyObjective}
              onChange={(event, newValue) => handleAutocompleteChange('studyObjective', newValue)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Primary Study Objective" 
                  placeholder="Select or add a study objective"
                  error={!!validationErrors.studyObjective}
                  helperText={validationErrors.studyObjective}
                  required
                />
              )}
              freeSolo
            />
            
            <Box sx={{ display: 'flex', mt: 1 }}>
              <TextField
                label="Add Custom Objective"
                size="small"
                value={customObjective}
                onChange={handleCustomObjectiveChange}
                sx={{ flexGrow: 1, mr: 1 }}
              />
              <Button 
                variant="outlined" 
                onClick={addCustomObjective}
                disabled={!customObjective.trim()}
              >
                Add
              </Button>
            </Box>
          </Box>
        </Grid>
        
        {/* Company & Context */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1" sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
            <CompanyIcon sx={{ mr: 1 }} />
            Company & Context
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={SAMPLE_COMPANIES}
            value={formData.company}
            onChange={(event, newValue) => handleAutocompleteChange('company', newValue)}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Company" 
                placeholder="Enter company name"
                error={!!validationErrors.company}
                helperText={validationErrors.company}
                required
              />
            )}
            freeSolo
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Button
            variant="outlined"
            onClick={toggleAdvancedOptions}
            endIcon={<EditIcon />}
            fullWidth
            sx={{ height: '100%' }}
          >
            {advancedOptionsOpen ? 'Hide Advanced Options' : 'Show Advanced Options'}
          </Button>
        </Grid>
        
        <Grid item xs={12}>
          <Collapse in={advancedOptionsOpen}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Advanced Options
                </Typography>
                
                <TextField
                  label="Additional Context"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.additionalContext}
                  onChange={handleChange('additionalContext')}
                  placeholder="Enter any additional information or context that might be relevant for protocol generation"
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Template Selection
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item>
                      <Chip
                        label="ICH-GCP Standard"
                        onClick={() => handleTemplateChange('ICH-GCP')}
                        color={templateSelected === 'ICH-GCP' ? 'primary' : 'default'}
                        variant={templateSelected === 'ICH-GCP' ? 'filled' : 'outlined'}
                      />
                    </Grid>
                    <Grid item>
                      <Chip
                        label="FDA Recommended"
                        onClick={() => handleTemplateChange('FDA')}
                        color={templateSelected === 'FDA' ? 'primary' : 'default'}
                        variant={templateSelected === 'FDA' ? 'filled' : 'outlined'}
                      />
                    </Grid>
                    <Grid item>
                      <Chip
                        label="EMA Format"
                        onClick={() => handleTemplateChange('EMA')}
                        color={templateSelected === 'EMA' ? 'primary' : 'default'}
                        variant={templateSelected === 'EMA' ? 'filled' : 'outlined'}
                      />
                    </Grid>
                    {formData.company && (
                      <Grid item>
                        <Chip
                          label={`${formData.company} Template`}
                          onClick={() => handleTemplateChange(`${formData.company}-Template`)}
                          color={templateSelected === `${formData.company}-Template` ? 'primary' : 'default'}
                          variant={templateSelected === `${formData.company}-Template` ? 'filled' : 'outlined'}
                        />
                      </Grid>
                    )}
                  </Grid>
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={useAiAssistance}
                      onChange={handleAiAssistanceToggle}
                      color="primary"
                    />
                  }
                  label="Use AI assistance for protocol generation"
                />
              </CardContent>
            </Card>
          </Collapse>
        </Grid>
        
        {/* AI Assistant Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', my: 2 }}>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
              <AIIcon sx={{ mr: 1 }} />
              AI Assistance
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={handleTestApi}
                startIcon={<RefreshIcon />}
              >
                Test API Connection
              </Button>
              <Tooltip title="Use custom prompt">
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={handleOpenCustomPrompt}
                >
                  Custom Prompt
                </Button>
              </Tooltip>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<LightbulbIcon />}
                onClick={handleOpenAiSuggestions}
                disabled={loading || !formData.moleculeName.trim()}
              >
                Get AI Suggestions
              </Button>
            </Box>
          </Box>
        </Grid>
        
        {loading && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              <Typography variant="body2">
                {validating ? 'Validating form...' : 'Processing with AI...'}
              </Typography>
            </Box>
          </Grid>
        )}
        
        {/* Action Buttons */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleSaveDraft}
              disabled={loading}
            >
              Save as Draft
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
              endIcon={<ArrowForwardIcon />}
            >
              Generate Protocol
            </Button>
          </Box>
        </Grid>
      </Grid>
      
      {/* AI Suggestions Dialog */}
      <Dialog open={aiSuggestionsOpen} onClose={() => setAiSuggestionsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LightbulbIcon sx={{ mr: 1 }} color="primary" />
            AI Suggestions
          </Box>
        </DialogTitle>
        <DialogContent>
          {aiSuggestions ? (
            <Box>
              <Typography variant="body1" gutterBottom>
                Based on the molecule "{formData.moleculeName}", the AI suggests:
              </Typography>
              
              <Box sx={{ whiteSpace: 'pre-wrap', my: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                {aiSuggestions}
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button onClick={() => setAiSuggestionsOpen(false)} sx={{ mr: 1 }}>
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => applyAiSuggestions(aiSuggestions)}
                >
                  Apply Suggestions
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Custom Prompt Dialog */}
      <Dialog open={customPromptOpen} onClose={() => setCustomPromptOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EditIcon sx={{ mr: 1 }} color="primary" />
            Custom AI Prompt
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Customize the prompt sent to the AI. This allows you to ask for specific information or focus on particular aspects of the protocol.
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={10}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Enter your custom prompt here..."
            variant="outlined"
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => setCustomPromptOpen(false)} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSendCustomPrompt}
              disabled={!customPrompt.trim() || loading}
              endIcon={<SendIcon />}
            >
              Send to AI
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      
      {/* Notification snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification('')}
        message={notification}
      />
    </Paper>
  );
};

export default MoleculeEntryForm; 