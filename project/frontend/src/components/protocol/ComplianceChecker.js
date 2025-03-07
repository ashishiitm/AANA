import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  LinearProgress,
  Button,
  Alert,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  Gavel as GavelIcon,
  WarningAmber as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import * as deepseekService from '../../services/deepseekService';

// Compliance rule categories
const COMPLIANCE_CATEGORIES = {
  'ethics': 'Ethics & Safety',
  'scientific': 'Scientific Design',
  'regulatory': 'Regulatory Requirements',
  'procedural': 'Procedural Clarity',
  'statistical': 'Statistical Methods',
  'operational': 'Operational Feasibility'
};

const ComplianceChecker = ({ protocolData, section, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [overallScore, setOverallScore] = useState(0);
  const [rulesByCategory, setRulesByCategory] = useState({});
  
  useEffect(() => {
    // Only auto-check if we have protocol data
    if (protocolData && Object.keys(protocolData).length > 0) {
      checkCompliance();
    }
  }, [protocolData]);
  
  // Run AI-powered compliance check
  const checkCompliance = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Call the AI service to check compliance
      const checkResults = await deepseekService.checkCompliance(protocolData);
      
      // Process and organize results
      processResults(checkResults);
    } catch (err) {
      console.error('Error checking compliance:', err);
      setError('Failed to check protocol compliance. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Process and organize the compliance check results
  const processResults = (checkResults) => {
    // This would normally parse the AI response
    // For demo, we'll use a sample result format
    
    // Sample results structure for demonstration
    const sampleResults = {
      overallScore: 78,
      rules: [
        {
          id: 'rule1',
          category: 'ethics',
          name: 'Informed Consent Documentation',
          description: 'Protocol must include a comprehensive informed consent process',
          status: 'passed',
          confidence: 95,
          location: 'Section 10.1'
        },
        {
          id: 'rule2',
          category: 'ethics',
          name: 'Vulnerable Population Protection',
          description: 'Special protections for vulnerable populations must be detailed',
          status: 'warning',
          confidence: 75,
          details: 'Consider adding specific protections for pregnant women',
          location: 'Section 10.3'
        },
        {
          id: 'rule3',
          category: 'scientific',
          name: 'Primary Endpoint Definition',
          description: 'Primary endpoint must be clearly defined with timeframe',
          status: 'failed',
          confidence: 90,
          details: 'Primary endpoint lacks precise timing of assessment',
          location: 'Section 6.1'
        },
        {
          id: 'rule4',
          category: 'scientific',
          name: 'Inclusion/Exclusion Criteria Clarity',
          description: 'Criteria must be specific, measurable, and relevant to study objectives',
          status: 'passed',
          confidence: 98,
          location: 'Section 5.2'
        },
        {
          id: 'rule5',
          category: 'regulatory',
          name: 'Protocol Version Control',
          description: 'Protocol must include version number and date',
          status: 'passed',
          confidence: 100,
          location: 'Header'
        },
        {
          id: 'rule6',
          category: 'procedural',
          name: 'Adverse Event Reporting Procedures',
          description: 'Clear procedures for AE reporting including timeframes',
          status: 'warning',
          confidence: 80,
          details: 'Reporting timeframe for non-serious AEs not specified',
          location: 'Section 11.2'
        },
        {
          id: 'rule7',
          category: 'statistical',
          name: 'Sample Size Calculation',
          description: 'Statistical justification for sample size provided',
          status: 'passed',
          confidence: 95,
          location: 'Section 9.1'
        },
        {
          id: 'rule8',
          category: 'operational',
          name: 'Drug Supply Management',
          description: 'Procedures for drug handling, storage and accountability',
          status: 'failed',
          confidence: 85,
          details: 'Temperature requirements for drug storage not specified',
          location: 'Section 8.3'
        }
      ]
    };
    
    // Use checkResults in a real implementation
    const resultsToUse = section ? 
      // Filter for section-specific rules if a section is specified
      {
        ...sampleResults,
        rules: sampleResults.rules.filter(rule => 
          rule.location.toLowerCase().includes(section.toLowerCase())
        )
      } : sampleResults;
    
    // Set the overall score
    setOverallScore(resultsToUse.overallScore);
    
    // Organize rules by category
    const byCategory = {};
    Object.keys(COMPLIANCE_CATEGORIES).forEach(cat => {
      byCategory[cat] = resultsToUse.rules.filter(rule => rule.category === cat);
    });
    
    setRulesByCategory(byCategory);
    setResults(resultsToUse);
    
    // Expand categories with issues by default
    const initialExpanded = {};
    Object.keys(byCategory).forEach(cat => {
      const hasIssues = byCategory[cat].some(rule => 
        rule.status === 'failed' || rule.status === 'warning'
      );
      
      if (hasIssues) {
        initialExpanded[cat] = true;
      }
    });
    
    setExpanded(initialExpanded);
  };
  
  // Toggle expansion of category accordion
  const handleToggleExpand = (category) => {
    setExpanded({
      ...expanded,
      [category]: !expanded[category]
    });
  };
  
  // Get color for compliance status
  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'success';
      case 'warning':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Get icon for compliance status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };
  
  // Render the compliance summary
  const renderSummary = () => {
    if (!results) return null;
    
    const passedCount = results.rules.filter(rule => rule.status === 'passed').length;
    const warningCount = results.rules.filter(rule => rule.status === 'warning').length;
    const failedCount = results.rules.filter(rule => rule.status === 'failed').length;
    const totalCount = results.rules.length;
    
    // Set score color based on overall compliance
    let scoreColor = 'error';
    if (overallScore >= 80) {
      scoreColor = 'success';
    } else if (overallScore >= 60) {
      scoreColor = 'warning';
    }
    
    return (
      <Box sx={{ mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 2
        }}>
          <Typography variant="h6">Compliance Score</Typography>
          
          <Tooltip title="Refresh compliance check">
            <IconButton onClick={checkCompliance} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 2
        }}>
          <Box sx={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: `${scoreColor}.light`,
            color: `${scoreColor}.dark`,
            border: 2,
            borderColor: `${scoreColor}.main`
          }}>
            <Typography variant="h4">{overallScore}</Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1, mx: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={overallScore} 
              color={scoreColor}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          flexWrap: 'wrap',
          gap: 1,
          mb: 2
        }}>
          <Chip
            icon={<CheckCircleIcon />}
            label={`${passedCount} Passed`}
            color="success"
            variant="outlined"
          />
          <Chip
            icon={<WarningIcon />}
            label={`${warningCount} Warnings`}
            color="warning"
            variant="outlined"
          />
          <Chip
            icon={<ErrorIcon />}
            label={`${failedCount} Failed`}
            color="error"
            variant="outlined"
          />
        </Box>
        
        {failedCount > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Your protocol has {failedCount} compliance issues that need to be addressed before submission.
          </Alert>
        )}
      </Box>
    );
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <GavelIcon color="primary" sx={{ fontSize: 30, mr: 2 }} />
        <Typography variant="h5" component="h2">
          Protocol Compliance Checker
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Checking protocol compliance...
          </Typography>
        </Box>
      ) : results ? (
        <>
          {renderSummary()}
          
          <Typography variant="subtitle1" gutterBottom>
            Compliance Details by Category
          </Typography>
          
          {Object.keys(COMPLIANCE_CATEGORIES).map(category => (
            <Accordion 
              key={category}
              expanded={!!expanded[category]}
              onChange={() => handleToggleExpand(category)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                  <Typography sx={{ flexGrow: 1 }}>
                    {COMPLIANCE_CATEGORIES[category]}
                  </Typography>
                  
                  <Box>
                    {rulesByCategory[category]?.filter(rule => rule.status === 'passed').length > 0 && (
                      <Chip
                        size="small"
                        icon={<CheckCircleIcon />}
                        label={rulesByCategory[category]?.filter(rule => rule.status === 'passed').length}
                        color="success"
                        sx={{ mr: 0.5 }}
                      />
                    )}
                    
                    {rulesByCategory[category]?.filter(rule => rule.status === 'warning').length > 0 && (
                      <Chip
                        size="small"
                        icon={<WarningIcon />}
                        label={rulesByCategory[category]?.filter(rule => rule.status === 'warning').length}
                        color="warning"
                        sx={{ mr: 0.5 }}
                      />
                    )}
                    
                    {rulesByCategory[category]?.filter(rule => rule.status === 'failed').length > 0 && (
                      <Chip
                        size="small"
                        icon={<ErrorIcon />}
                        label={rulesByCategory[category]?.filter(rule => rule.status === 'failed').length}
                        color="error"
                      />
                    )}
                  </Box>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                <List dense>
                  {rulesByCategory[category]?.map((rule) => (
                    <React.Fragment key={rule.id}>
                      <ListItem
                        sx={{
                          bgcolor: rule.status === 'failed' ? 'error.lightest' : 
                                  rule.status === 'warning' ? 'warning.lightest' : 
                                  'success.lightest',
                          borderRadius: 1,
                          my: 1
                        }}
                      >
                        <ListItemIcon>
                          {getStatusIcon(rule.status)}
                        </ListItemIcon>
                        
                        <ListItemText
                          primary={rule.name}
                          secondary={
                            <Box>
                              <Typography variant="body2" component="span">
                                {rule.description}
                              </Typography>
                              
                              {rule.details && (
                                <Box sx={{ color: getStatusColor(rule.status) + '.main', mt: 1 }}>
                                  <Typography variant="body2" component="span">
                                    <strong>Issue:</strong> {rule.details}
                                  </Typography>
                                </Box>
                              )}
                              
                              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="caption" component="span">
                                  Location: {rule.location}
                                </Typography>
                                
                                <Chip
                                  size="small"
                                  label={`${rule.confidence}% confidence`}
                                  variant="outlined"
                                />
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary" paragraph>
            Enter protocol details to check compliance with ICH-GCP guidelines and regulatory requirements.
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<GavelIcon />}
            onClick={checkCompliance}
            disabled={!protocolData || Object.keys(protocolData).length === 0}
          >
            Check Protocol Compliance
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ComplianceChecker; 