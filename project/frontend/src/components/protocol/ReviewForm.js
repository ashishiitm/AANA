import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  Tooltip,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  AlertTitle
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BiotechIcon from '@mui/icons-material/Biotech';
import PeopleIcon from '@mui/icons-material/People';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LanguageIcon from '@mui/icons-material/Language';
import TranslationModal from './TranslationModal';
import SiteSelectionModal from './SiteSelectionModal';
import deepseekService from '../../services/deepseekService';
import { BusinessCenter as SiteIcon } from '@mui/icons-material';

const ReviewForm = ({ data = {}, trialBasics, studyDesign, endpoints, teamMembers, onGenerateProtocol }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProtocol, setGeneratedProtocol] = useState(null);
  const [complianceIssues, setComplianceIssues] = useState([]);
  const [translationModalOpen, setTranslationModalOpen] = useState(false);
  const [siteSelectionModalOpen, setSiteSelectionModalOpen] = useState(false);
  
  // Mock function to generate protocol document
  const handleGenerateProtocol = async () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Compile all the data
    const protocolData = {
      trialBasics,
      studyDesign,
      endpoints,
      teamMembers,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0',
      }
    };
    
    // Mock compliance check
    const mockComplianceIssues = [
      {
        severity: 'warning',
        message: 'Consider adding more detailed exclusion criteria for patient safety',
        section: 'studyDesign',
        recommendation: 'Review ICH E6 guidelines for recommended exclusion criteria'
      },
      {
        severity: 'info',
        message: 'Secondary endpoints could be more clearly linked to primary endpoints',
        section: 'endpoints',
        recommendation: 'Ensure secondary endpoints support the overall study objectives'
      }
    ];
    
    setComplianceIssues(mockComplianceIssues);
    setGeneratedProtocol(protocolData);
    setIsGenerating(false);
    
    // Call the parent handler if provided
    if (onGenerateProtocol) {
      onGenerateProtocol(protocolData);
    }
  };
  
  // Mock function to download protocol
  const handleDownloadProtocol = () => {
    // In a real implementation, this would trigger a download of the document
    // For now, we'll just create and download a JSON file
    if (generatedProtocol) {
      const dataStr = JSON.stringify(generatedProtocol, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const fileName = `${trialBasics?.drugName || 'Protocol'}_v1.0.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', fileName);
      linkElement.click();
      linkElement.remove();
    }
  };
  
  // Helper to check if a section is complete
  const isSectionComplete = (section) => {
    if (!section) return false;
    
    switch (section) {
      case trialBasics:
        return trialBasics?.phase && trialBasics?.therapeuticArea && trialBasics?.drugName && trialBasics?.objective;
      case studyDesign:
        return studyDesign?.type?.length > 0 && studyDesign?.intervention?.dosage && studyDesign?.intervention?.route;
      case endpoints:
        return endpoints?.primaryEndpoints?.length > 0;
      case teamMembers:
        return teamMembers?.teamMembers?.length > 0;
      default:
        return false;
    }
  };
  
  const getSectionCompletionStatus = (section) => {
    if (isSectionComplete(section)) {
      return (
        <Chip 
          icon={<CheckCircleIcon />} 
          label="Complete" 
          color="success" 
          size="small" 
          variant="outlined" 
        />
      );
    }
    return (
      <Chip 
        icon={<WarningAmberIcon />} 
        label="Incomplete" 
        color="warning" 
        size="small" 
        variant="outlined" 
      />
    );
  };

  // Open translation modal
  const handleOpenTranslation = () => {
    setTranslationModalOpen(true);
  };
  
  // Open site selection modal
  const handleOpenSiteSelection = () => {
    setSiteSelectionModalOpen(true);
  };
  
  // Check protocol compliance using DeepSeek AI
  const checkProtocolCompliance = async () => {
    if (!generatedProtocol) return;
    
    try {
      const issues = await deepseekService.checkCompliance(generatedProtocol);
      setComplianceIssues(issues);
    } catch (error) {
      console.error('Error checking compliance:', error);
      // Fall back to existing compliance issues
    }
  };
  
  // Use AI to check compliance after protocol generation
  React.useEffect(() => {
    if (generatedProtocol) {
      checkProtocolCompliance();
    }
  }, [generatedProtocol]);

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Review & Generate Protocol
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Review your protocol information and generate the final document.
        </Typography>
      </Box>
      
      {/* Section Summaries */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                <Typography variant="subtitle1">Trial Basics</Typography>
                {getSectionCompletionStatus(trialBasics)}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Drug Name" 
                    secondary={trialBasics?.drugName || 'Not specified'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Phase" 
                    secondary={trialBasics?.phase || 'Not specified'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Therapeutic Area" 
                    secondary={trialBasics?.therapeuticArea || 'Not specified'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Objective" 
                    secondary={trialBasics?.objective || 'Not specified'} 
                    secondaryTypographyProps={{ 
                      style: { 
                        whiteSpace: 'normal',
                        maxWidth: '100%'
                      } 
                    }}
                  />
                </ListItem>
                {trialBasics?.customObjective && (
                  <ListItem>
                    <ListItemText 
                      primary="Custom Objective" 
                      secondary={trialBasics.customObjective} 
                      secondaryTypographyProps={{ 
                        style: { 
                          whiteSpace: 'normal',
                          maxWidth: '100%'
                        } 
                      }}
                    />
                  </ListItem>
                )}
              </List>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                <Typography variant="subtitle1">Study Design</Typography>
                {getSectionCompletionStatus(studyDesign)}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Design Type" 
                    secondary={
                      studyDesign?.type?.length > 0 
                        ? studyDesign.type.join(', ')
                        : 'Not specified'
                    } 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Population Age Range" 
                    secondary={
                      studyDesign?.population?.ageRange
                        ? `${studyDesign.population.ageRange[0]} - ${studyDesign.population.ageRange[1]} years`
                        : 'Not specified'
                    } 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Inclusion Criteria" 
                    secondary={
                      studyDesign?.population?.inclusion?.length > 0 
                        ? (
                          <List dense disablePadding>
                            {studyDesign.population.inclusion.map((criterion, index) => (
                              <ListItem key={index} disablePadding>
                                <ListItemText primary={`${index + 1}. ${criterion}`} />
                              </ListItem>
                            ))}
                          </List>
                        )
                        : 'None specified'
                    } 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Exclusion Criteria" 
                    secondary={
                      studyDesign?.population?.exclusion?.length > 0 
                        ? (
                          <List dense disablePadding>
                            {studyDesign.population.exclusion.map((criterion, index) => (
                              <ListItem key={index} disablePadding>
                                <ListItemText primary={`${index + 1}. ${criterion}`} />
                              </ListItem>
                            ))}
                          </List>
                        )
                        : 'None specified'
                    } 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Intervention" 
                    secondary={
                      studyDesign?.intervention?.dosage
                        ? `${studyDesign.intervention.dosage} (${studyDesign.intervention.frequency}, ${studyDesign.intervention.route})`
                        : 'Not specified'
                    } 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Comparator" 
                    secondary={studyDesign?.comparator || 'Not specified'} 
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                <Typography variant="subtitle1">Endpoints & Assessments</Typography>
                {getSectionCompletionStatus(endpoints)}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle2" gutterBottom>Primary Endpoints</Typography>
              {endpoints?.primaryEndpoints?.length > 0 ? (
                <List dense>
                  {endpoints.primaryEndpoints.map((endpoint, index) => (
                    <ListItem key={endpoint.id || index}>
                      <ListItemText 
                        primary={endpoint.description}
                        secondary={`Type: ${endpoint.type}, Timeframe: ${endpoint.timeframe}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No primary endpoints specified
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>Secondary Endpoints</Typography>
              {endpoints?.secondaryEndpoints?.length > 0 ? (
                <List dense>
                  {endpoints.secondaryEndpoints.map((endpoint, index) => (
                    <ListItem key={endpoint.id || index}>
                      <ListItemText 
                        primary={endpoint.description}
                        secondary={`Type: ${endpoint.type}, Timeframe: ${endpoint.timeframe}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No secondary endpoints specified
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>Assessments</Typography>
              {endpoints?.assessments?.length > 0 ? (
                <List dense>
                  {endpoints.assessments.map((assessment, index) => (
                    <ListItem key={assessment.id || index}>
                      <ListItemText 
                        primary={assessment.name}
                        secondary={`Type: ${assessment.type}, Frequency: ${assessment.frequency}${assessment.details ? `, Details: ${assessment.details}` : ''}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No assessments specified
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                <Typography variant="subtitle1">Team Composition</Typography>
                {getSectionCompletionStatus(teamMembers)}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {teamMembers?.teamMembers?.length > 0 ? (
                <List dense>
                  {teamMembers.teamMembers.map((member, index) => (
                    <ListItem key={member.id || index}>
                      <ListItemText 
                        primary={`${member.memberName} (${member.roleDisplay})`}
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {member.memberSpecialization}, {member.memberOrganization}
                            </Typography>
                            {member.responsibilities && (
                              <Typography variant="body2" component="p" sx={{ mt: 0.5 }}>
                                <strong>Responsibilities:</strong> {member.responsibilities}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No team members assigned
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
      
      {/* Generate Protocol Button */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <BiotechIcon />}
          onClick={handleGenerateProtocol}
          disabled={isGenerating}
          sx={{ minWidth: 250 }}
        >
          {isGenerating ? 'Generating Protocol...' : 'Generate Protocol'}
        </Button>
      </Box>
      
      {/* Generated Protocol Section */}
      {generatedProtocol && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Generated Protocol
          </Typography>
          
          {/* Compliance Check Results */}
          {complianceIssues.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Compliance Check Results
                <Tooltip title="Issues identified by our automated compliance checker against regulatory standards">
                  <FactCheckIcon fontSize="small" sx={{ ml: 1, verticalAlign: 'middle' }} />
                </Tooltip>
              </Typography>
              
              <Stack spacing={2}>
                {complianceIssues.map((issue, index) => (
                  <Alert 
                    key={index} 
                    severity={issue.severity}
                    variant="outlined"
                  >
                    <AlertTitle>{issue.section === 'studyDesign' ? 'Study Design' : issue.section === 'endpoints' ? 'Endpoints' : issue.section}</AlertTitle>
                    {issue.message}
                    {issue.recommendation && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Recommendation:</strong> {issue.recommendation}
                      </Typography>
                    )}
                  </Alert>
                ))}
              </Stack>
            </Box>
          )}
          
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {`${trialBasics?.drugName || 'Study'} Protocol v1.0`}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Generated on {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<SiteIcon />}
                  onClick={handleOpenSiteSelection}
                  sx={{ mr: 1 }}
                >
                  Site Selection
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LanguageIcon />}
                  onClick={handleOpenTranslation}
                  sx={{ mr: 1 }}
                >
                  Translate
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadProtocol}
                  sx={{ mr: 1 }}
                >
                  Download
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(generatedProtocol, null, 2));
                  }}
                >
                  Copy JSON
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          <Typography variant="body2" color="text.secondary">
            This protocol document includes all the information you've provided across the various sections.
            You can download it as a JSON file or copy the JSON data for use in other systems.
            In a production environment, this would generate a properly formatted protocol document according to regulatory standards.
          </Typography>
        </Box>
      )}
      
      {/* Translation Modal */}
      <TranslationModal
        open={translationModalOpen}
        onClose={() => setTranslationModalOpen(false)}
        protocol={generatedProtocol || data}
      />
      
      {/* Site Selection Modal */}
      <SiteSelectionModal 
        open={siteSelectionModalOpen}
        onClose={() => setSiteSelectionModalOpen(false)}
        protocol={generatedProtocol || data}
      />
    </Paper>
  );
};

export default ReviewForm; 