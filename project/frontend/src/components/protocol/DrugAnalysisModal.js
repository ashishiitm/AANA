import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
  AlertTitle,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Paper,
  Zoom,
  Slide,
  Fade
} from '@mui/material';
import {
  WarningAmber as WarningIcon,
  MedicalServices as MedicalIcon,
  Bloodtype as BloodtypeIcon,
  MonitorHeart as MonitorIcon,
  Person as PersonIcon,
  Science as ScienceIcon,
  Biotech as BiotechIcon
} from '@mui/icons-material';
import deepseekService from '../../services/deepseekService';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Zoom ref={ref} {...props} />;
});

const DrugAnalysisModal = ({ open, onClose, onAnalysisComplete, drugName }) => {
  const [drugDetails, setDrugDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [submittable, setSubmittable] = useState(false);
  
  // Reset state when modal opens or drugName changes
  React.useEffect(() => {
    if (open) {
      setDrugDetails(drugName ? `Drug Name: ${drugName}\nComposition and Details: ` : '');
      setAnalysis(null);
      setError('');
      setSubmittable(!!drugName);
    }
  }, [open, drugName]);
  
  // Check if form is submittable
  React.useEffect(() => {
    setSubmittable(drugDetails.trim().length > 20);
  }, [drugDetails]);
  
  const handleDetailsChange = (event) => {
    setDrugDetails(event.target.value);
  };
  
  const handleAnalyze = async () => {
    if (!submittable) return;
    
    setLoading(true);
    setError('');
    
    try {
      const analysisResult = await deepseekService.analyzeDrugComposition(drugDetails);
      setAnalysis(analysisResult);
      
      // Notify parent component
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult);
      }
    } catch (err) {
      console.error('Error analyzing drug composition:', err);
      setError('Failed to analyze drug composition. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    if (loading) return;
    onClose(analysis);
  };
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      TransitionComponent={Transition}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <BiotechIcon color="primary" />
        <Typography variant="h6" component="span">
          AI Drug Analysis
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        {!analysis ? (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Enter drug composition details for AI analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Provide as much detail as possible about the drug composition, mechanism of action, 
              known side effects, and pharmacological class. This will help generate accurate 
              protocol recommendations.
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={8}
              label="Drug Composition Details"
              value={drugDetails}
              onChange={handleDetailsChange}
              placeholder="Enter drug composition, chemical structure, mechanism of action, and known pharmacological information..."
              variant="outlined"
              sx={{ mb: 3 }}
              disabled={loading}
            />
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        ) : (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              <AlertTitle>Analysis Complete</AlertTitle>
              The drug analysis has been completed successfully. Review the findings below to inform your protocol design.
            </Alert>
            
            <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="h6" gutterBottom>Safety Profile</Typography>
              <Typography variant="body1">{analysis.safetyProfile}</Typography>
            </Paper>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ height: '100%' }}>
                  <Box sx={{ p: 2, bgcolor: '#f44336', color: 'white' }}>
                    <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon fontSize="small" />
                      Contraindications
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    {analysis.contraindications && analysis.contraindications.length > 0 ? (
                      <List dense>
                        {analysis.contraindications.map((item, index) => (
                          <Fade in key={index} style={{ transitionDelay: `${index * 100}ms` }}>
                            <ListItem>
                              <ListItemIcon>
                                <MedicalIcon fontSize="small" color="error" />
                              </ListItemIcon>
                              <ListItemText primary={item} />
                            </ListItem>
                          </Fade>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No specific contraindications identified.</Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ height: '100%' }}>
                  <Box sx={{ p: 2, bgcolor: '#ff9800', color: 'white' }}>
                    <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" />
                      Special Populations
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    {analysis.specialPopulations && analysis.specialPopulations.length > 0 ? (
                      <List dense>
                        {analysis.specialPopulations.map((item, index) => (
                          <Fade in key={index} style={{ transitionDelay: `${index * 100}ms` }}>
                            <ListItem>
                              <ListItemIcon>
                                <PersonIcon fontSize="small" color="warning" />
                              </ListItemIcon>
                              <ListItemText primary={item} />
                            </ListItem>
                          </Fade>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No special populations identified.</Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ height: '100%' }}>
                  <Box sx={{ p: 2, bgcolor: '#9c27b0', color: 'white' }}>
                    <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BloodtypeIcon fontSize="small" />
                      Potential Interactions
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    {analysis.potentialInteractions && analysis.potentialInteractions.length > 0 ? (
                      <List dense>
                        {analysis.potentialInteractions.map((item, index) => (
                          <Fade in key={index} style={{ transitionDelay: `${index * 100}ms` }}>
                            <ListItem>
                              <ListItemIcon>
                                <ScienceIcon fontSize="small" sx={{ color: '#9c27b0' }} />
                              </ListItemIcon>
                              <ListItemText primary={item} />
                            </ListItem>
                          </Fade>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No significant interactions identified.</Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ height: '100%' }}>
                  <Box sx={{ p: 2, bgcolor: '#2196f3', color: 'white' }}>
                    <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MonitorIcon fontSize="small" />
                      Monitoring Recommendations
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    {analysis.monitoringRecommendations && analysis.monitoringRecommendations.length > 0 ? (
                      <List dense>
                        {analysis.monitoringRecommendations.map((item, index) => (
                          <Fade in key={index} style={{ transitionDelay: `${index * 100}ms` }}>
                            <ListItem>
                              <ListItemIcon>
                                <MonitorIcon fontSize="small" color="primary" />
                              </ListItemIcon>
                              <ListItemText primary={item} />
                            </ListItem>
                          </Fade>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No specific monitoring recommendations.</Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                These recommendations are based on AI analysis and should be verified by qualified medical professionals.
                Always refer to current regulatory guidelines and product information.
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
        {!analysis ? (
          <>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleAnalyze} 
              disabled={!submittable || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <BiotechIcon />}
            >
              {loading ? 'Analyzing...' : 'Analyze Drug'}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose}>
              Close
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleClose}
            >
              Apply to Protocol
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DrugAnalysisModal; 