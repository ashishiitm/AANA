import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stepper, 
  Step, 
  StepLabel, 
  Paper,
  styled,
  Alert,
  AlertTitle,
  Grid,
  Card,
  CardContent,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip,
  Divider,
  Avatar,
  Fade,
  Zoom,
  CircularProgress,
  Snackbar,
  Fab,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { 
  AddCircleOutline as AddIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
  CloudUpload as UploadIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  Check as CheckIcon,
  AutoFixHigh as AIIcon,
  Article as DocumentIcon,
  Speed as SpeedIcon,
  Science as ScienceIcon,
  Psychology as PsychologyIcon,
  ViewTimeline as TimelineIcon,
  MenuBook as GuidelineIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
  Lightbulb as LightbulbIcon,
  AutoAwesome as AIIconTwo,
  CloudDownload as CloudDownloadIcon,
} from '@mui/icons-material';
import TrialBasicsForm from '../components/protocol/TrialBasicsForm';
import StudyDesignForm from '../components/protocol/StudyDesignForm';
import EndpointsForm from '../components/protocol/EndpointsForm';
import TeamAssignmentForm from '../components/protocol/TeamAssignmentForm';
import ReviewForm from '../components/protocol/ReviewForm';
import ProtocolAnimation from '../components/animations/ProtocolAnimation';
import ProtocolVisualization from '../components/animations/ProtocolVisualization';
import TimeSavingsCalculator from '../components/protocol/TimeSavingsCalculator';
import MoleculeEntryForm from '../components/protocol/MoleculeEntryForm';
import ComplianceChecker from '../components/protocol/ComplianceChecker';
import * as deepseekService from '../services/deepseekService';

const steps = [
  'Molecule Information',
  'Protocol Structure',
  'Study Design',
  'Endpoints',
  'Review & Generate'
];

// Styled components for better UI
const StepContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: '#fff',
  boxShadow: theme.shadows[1],
  transition: 'all 0.3s ease'
}));

const ActionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  fontWeight: 600,
  padding: '10px 20px'
}));

const GradientBackground = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #303f9f 100%)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(6),
  color: '#fff',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1), transparent 30%)',
    zIndex: 1,
  }
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

const CircleIcon = styled(Box)(({ theme, color }) => ({
  backgroundColor: color || theme.palette.primary.main,
  borderRadius: '50%',
  padding: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  width: 56,
  height: 56,
  boxShadow: `0 4px 14px ${color ? color + '40' : theme.palette.primary.main + '40'}`,
}));

const HeroButton = styled(Button)(({ theme }) => ({
  padding: '12px 24px',
  fontSize: '1rem',
  fontWeight: 700,
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  textTransform: 'none',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  },
}));

const LandingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 'calc(100vh - 180px)',
  textAlign: 'center',
  padding: theme.spacing(4),
}));

const ProtocolDesign = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeStep, setActiveStep] = useState(0);
  const [protocolData, setProtocolData] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [showCompliance, setShowCompliance] = useState(false);
  const [aiSuggestionsOpen, setAiSuggestionsOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiSuggestionsLoading, setAiSuggestionsLoading] = useState(false);
  const [generatedProtocolUrl, setGeneratedProtocolUrl] = useState(null);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('hasVisitedProtocolDesign');
    if (hasVisitedBefore) {
      setIsFirstVisit(false);
    } else {
      setIsFirstVisit(true);
      localStorage.setItem('hasVisitedProtocolDesign', 'true');
    }
  }, []);

  const getAiSuggestions = async () => {
    if (!protocolData) return;
    
    setAiSuggestionsLoading(true);
    
    try {
      let suggestions = '';
      
      switch (activeStep) {
        case 0:
          suggestions = await deepseekService.callDeepSeekAPI(
            `Suggest therapeutic areas and study objectives for a molecule named "${protocolData.moleculeName}" with description "${protocolData.moleculeDescription || 'Not provided'}"`
          );
          break;
        case 1:
          suggestions = await deepseekService.suggestCriteria(
            protocolData.therapeuticArea,
            protocolData.condition,
            protocolData.phase || 'Unknown'
          );
          break;
        case 2:
          suggestions = await deepseekService.callDeepSeekAPI(
            `Suggest study design options for a clinical trial of "${protocolData.moleculeName}" for ${protocolData.condition} with primary objective "${protocolData.studyObjective}"`
          );
          break;
        case 3:
          suggestions = await deepseekService.suggestEndpoints(
            protocolData.therapeuticArea,
            protocolData.phase || 'Unknown',
            protocolData.condition
          );
          break;
        case 4:
          suggestions = await deepseekService.callDeepSeekAPI(
            `Based on the protocol being developed for "${protocolData.moleculeName}" to treat ${protocolData.condition}, suggest key appendices that should be included in the final protocol document.`
          );
          break;
        default:
          suggestions = "No AI suggestions available for this step.";
      }
      
      setAiSuggestions(suggestions);
      setAiSuggestionsOpen(true);
    } catch (err) {
      console.error('Error getting AI suggestions:', err);
      setError('Failed to get AI suggestions. Please try again.');
    } finally {
      setAiSuggestionsLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setProtocolData(data);
        setNotification('Protocol data loaded successfully');
      } catch (err) {
        setError('Failed to parse the uploaded file. Please ensure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveDraft = (data) => {
    const currentData = data || protocolData;
    
    if (!currentData) {
      setError('No protocol data to save');
      return;
    }
    
    const blob = new Blob([JSON.stringify(currentData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `protocol_draft_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setNotification('Protocol draft saved as JSON file');
  };

  const handleNext = (data) => {
    if (data) {
      setProtocolData(current => ({ ...current, ...data }));
    }
    
    setCompletedSteps({ ...completedSteps, [activeStep]: true });
    
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const generateProtocol = async () => {
    if (!protocolData) {
      setError('No protocol data available');
      return;
    }
    
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setGeneratedProtocolUrl('#');
      
      setNotification('Protocol generated successfully');
    } catch (err) {
      console.error('Error generating protocol:', err);
      setError('Failed to generate protocol. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderLandingContent = () => (
    <LandingContainer>
      <ScienceIcon color="primary" sx={{ fontSize: 80, mb: 4 }} />
      
      <Typography variant="h4" gutterBottom>
        Molecule-Driven Protocol Design
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Start with your molecule details and let AI guide you through creating a compliant clinical trial protocol.
      </Typography>
      
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<ScienceIcon />}
          onClick={() => setActiveStep(0)}
          sx={{ mb: 2 }}
        >
          Start New Protocol
        </Button>
        
        <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
          Or upload an existing protocol draft
        </Typography>
        
        <Box>
          <input
            id="protocol-file-upload"
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <label htmlFor="protocol-file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudDownloadIcon />}
            >
              Upload Protocol JSON
            </Button>
          </label>
        </Box>
      </Box>
      
      {isFirstVisit && (
        <Alert severity="info" sx={{ mt: 4, maxWidth: 600 }}>
          <AlertTitle>New Feature!</AlertTitle>
          Our new AI-powered protocol design tool helps you create clinical trial protocols starting from your molecule details. The system will suggest appropriate trial parameters and ensure compliance with regulatory requirements.
        </Alert>
      )}
    </LandingContainer>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <MoleculeEntryForm
            onNext={handleNext}
            onSaveDraft={handleSaveDraft}
          />
        );
      case 1:
        return (
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <DescriptionIcon color="primary" sx={{ fontSize: 30, mr: 2 }} />
              <Typography variant="h5" component="h2">
                Protocol Structure
              </Typography>
            </Box>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              Here you would define the overall structure of your protocol based on {protocolData?.templateUsed || 'standard template'}.
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              This step would allow customization of protocol sections, including the addition of company-specific sections.
            </Alert>
            
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" paragraph>
                The AI has generated a baseline protocol structure for {protocolData?.moleculeName}.
              </Typography>
              
              <Button variant="contained" onClick={() => handleNext()}>
                Accept Structure & Continue
              </Button>
            </Box>
          </Paper>
        );
      case 2:
        return (
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <DescriptionIcon color="primary" sx={{ fontSize: 30, mr: 2 }} />
              <Typography variant="h5" component="h2">
                Study Design
              </Typography>
            </Box>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              Here you would define the study design, including randomization, blinding, and treatment arms.
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              This step would include AI suggestions for appropriate study design based on your molecule and therapeutic area.
            </Alert>
            
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" paragraph>
                The AI has suggested a study design appropriate for {protocolData?.moleculeName} in {protocolData?.therapeuticArea}.
              </Typography>
              
              <Button variant="contained" onClick={() => handleNext()}>
                Accept Design & Continue
              </Button>
            </Box>
          </Paper>
        );
      case 3:
        return (
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <DescriptionIcon color="primary" sx={{ fontSize: 30, mr: 2 }} />
              <Typography variant="h5" component="h2">
                Endpoints & Assessments
              </Typography>
            </Box>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              Here you would define primary and secondary endpoints, as well as assessment schedules.
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              This step would include AI suggestions for appropriate endpoints based on your molecule, therapeutic area, and study design.
            </Alert>
            
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" paragraph>
                The AI has suggested endpoints appropriate for {protocolData?.condition} in {protocolData?.therapeuticArea}.
              </Typography>
              
              <Button variant="contained" onClick={() => handleNext()}>
                Accept Endpoints & Continue
              </Button>
            </Box>
          </Paper>
        );
      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CheckIcon color="primary" sx={{ fontSize: 30, mr: 2 }} />
                  <Typography variant="h5" component="h2">
                    Review & Generate
                  </Typography>
                </Box>
                
                <Typography variant="body1" paragraph>
                  Your protocol for {protocolData?.moleculeName} is ready to be finalized.
                </Typography>
                
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Protocol Summary
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Molecule</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {protocolData?.moleculeName || 'Not specified'}
                        </Typography>
                        
                        <Typography variant="subtitle2">Therapeutic Area</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {protocolData?.therapeuticArea || 'Not specified'}
                        </Typography>
                        
                        <Typography variant="subtitle2">Condition</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {protocolData?.condition || 'Not specified'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Study Objective</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {protocolData?.studyObjective || 'Not specified'}
                        </Typography>
                        
                        <Typography variant="subtitle2">Company</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {protocolData?.company || 'Not specified'}
                        </Typography>
                        
                        <Typography variant="subtitle2">Template Used</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {protocolData?.templateUsed || 'Standard template'}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    {protocolData?.uncertaintyFlags && protocolData.uncertaintyFlags.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Items Needing Review
                        </Typography>
                        
                        <Alert severity="warning" sx={{ mb: 2 }}>
                          <AlertTitle>The following items need your attention:</AlertTitle>
                          <ul style={{ margin: 0, paddingLeft: 16 }}>
                            {protocolData.uncertaintyFlags.map((flag, index) => (
                              <li key={index}>{flag}</li>
                            ))}
                          </ul>
                        </Alert>
                      </Box>
                    )}
                  </CardContent>
                </Card>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    onClick={() => handleSaveDraft()}
                    sx={{ mb: 2 }}
                  >
                    Save as Draft
                  </Button>
                  
                  {generatedProtocolUrl ? (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<DownloadIcon />}
                      href={generatedProtocolUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download Protocol PDF
                    </Button>
                  ) : (
                    <Box sx={{ position: 'relative' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={loading ? null : <DescriptionIcon />}
                        onClick={generateProtocol}
                        disabled={loading}
                      >
                        Generate Protocol
                      </Button>
                      {loading && (
                        <CircularProgress
                          size={24}
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-12px',
                            marginLeft: '-12px',
                          }}
                        />
                      )}
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <ComplianceChecker protocolData={protocolData} />
            </Grid>
          </Grid>
        );
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {activeStep < 0 ? (
        renderLandingContent()
      ) : (
        <>
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Stepper 
              activeStep={activeStep} 
              alternativeLabel={!isMobile}
              orientation={isMobile ? 'vertical' : 'horizontal'}
            >
              {steps.map((label, index) => (
                <Step key={label} completed={completedSteps[index]}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
          
          <StepContent>
            {renderStepContent()}
          </StepContent>
          
          {activeStep !== 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                startIcon={<BackIcon />}
                disabled={loading}
              >
                Back
              </Button>
              
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={() => handleSaveDraft()}
                  sx={{ mr: 1 }}
                  disabled={loading}
                >
                  Save Draft
                </Button>
                
                {activeStep < steps.length - 1 && (
                  <Button
                    variant="contained"
                    onClick={() => handleNext()}
                    endIcon={<NextIcon />}
                    disabled={loading}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          )}
          
          <Tooltip title="Get AI suggestions for this step">
            <Fab
              color="secondary"
              sx={{ position: 'fixed', bottom: 16, right: 16 }}
              onClick={getAiSuggestions}
              disabled={aiSuggestionsLoading || !protocolData}
            >
              {aiSuggestionsLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <LightbulbIcon />
              )}
            </Fab>
          </Tooltip>
          
          <Dialog 
            open={aiSuggestionsOpen} 
            onClose={() => setAiSuggestionsOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LightbulbIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    AI Suggestions for {steps[activeStep]}
                  </Typography>
                </Box>
                <IconButton onClick={() => setAiSuggestionsOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              {aiSuggestionsLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                  <CircularProgress sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Generating AI suggestions...
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ whiteSpace: 'pre-wrap' }}>
                  {aiSuggestions}
                </Box>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
      
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification('')}
        message={notification}
      />
      
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProtocolDesign; 