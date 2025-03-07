import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  AlertTitle,
  Grid,
  Paper,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Collapse,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  useTheme,
  Badge
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Description as DescriptionIcon,
  Star as StarIcon,
  Close as CloseIcon,
  PieChart as PieChartIcon,
  Group as GroupIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import siteSelectionService from '../../services/siteSelectionService';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

// Styled components
const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const ColoredBadge = styled(Badge)(({ theme, doctor }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: doctor.years_experience > 15 ? theme.palette.success.main : 
                     doctor.years_experience > 10 ? theme.palette.info.main :
                     theme.palette.warning.main,
    color: '#fff',
    width: 25,
    height: 25,
    borderRadius: '50%',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
}));

// TabPanel component
const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`site-selection-tabpanel-${index}`}
      aria-labelledby={`site-selection-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// USA Map component with state prevalence data
const USMapChart = ({ prevalenceData }) => {
  const theme = useTheme();
  
  // Create color scale for prevalence data
  const maxPrevalence = Math.max(...Object.values(prevalenceData || {}).map(d => d.prevalence || 0), 100);
  const colorScale = scaleLinear()
    .domain([0, maxPrevalence])
    .range(["#e8f5e9", theme.palette.success.dark]);
  
  return (
    <Box sx={{ height: 300, width: '100%' }}>
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 900 }}
      >
        <Geographies geography="https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json">
          {({ geographies }) =>
            geographies.map(geo => {
              const stateCode = geo.properties.postal;
              const stateData = prevalenceData?.[stateCode];
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={stateData ? colorScale(stateData.prevalence) : "#e0e0e0"}
                  stroke="#ffffff"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: theme.palette.primary.main, outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </Box>
  );
};

const SiteSelectionModal = ({ open, onClose, protocol }) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [expanded, setExpanded] = useState({});
  const theme = useTheme();
  
  // Fetch recommendations when modal opens
  useEffect(() => {
    if (open && protocol) {
      getRecommendations();
    }
  }, [open, protocol]);
  
  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setTabValue(0);
      setExpanded({});
    }
  }, [open]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Toggle doctor card expansion
  const handleExpandClick = (doctorId) => {
    setExpanded(prev => ({
      ...prev,
      [doctorId]: !prev[doctorId]
    }));
  };
  
  // Fetch recommendations from service
  const getRecommendations = async () => {
    if (!protocol) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await siteSelectionService.getRecommendations(protocol);
      setRecommendations(result);
    } catch (err) {
      console.error('Error getting site recommendations:', err);
      setError('Failed to get site recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationIcon color="primary" />
          <Typography variant="h6" component="span">
            AI-Powered Site & Investigator Recommendations
          </Typography>
        </Box>
        <IconButton onClick={() => !loading && onClose()} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Analyzing Protocol Data
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Our AI is analyzing your protocol to identify optimal sites and investigators
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        ) : recommendations ? (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              <AlertTitle>Analysis Complete</AlertTitle>
              Recommendations generated for <strong>{recommendations.condition}</strong> in the <strong>{protocol.trial_basics.therapeuticArea}</strong> therapeutic area.
            </Alert>
            
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="site selection tabs"
                  variant="fullWidth"
                >
                  <Tab 
                    label="Location Strategy" 
                    icon={<PieChartIcon />} 
                    iconPosition="start"
                  />
                  <Tab 
                    label="Recommended Investigators" 
                    icon={<PersonIcon />} 
                    iconPosition="start"
                  />
                  <Tab 
                    label="Site Criteria" 
                    icon={<HospitalIcon />} 
                    iconPosition="start"
                  />
                </Tabs>
              </Box>
              
              {/* Location Strategy Tab */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={7}>
                    <Typography variant="h6" gutterBottom>
                      Disease Prevalence Map
                    </Typography>
                    <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                      <USMapChart prevalenceData={recommendations.prevalenceData} />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                        States colored by prevalence rate for {recommendations.condition}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Typography variant="h6" gutterBottom>
                      Top States for Site Selection
                    </Typography>
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>State</TableCell>
                            <TableCell align="right">Prevalence Rate</TableCell>
                            <TableCell align="right">Rank</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recommendations.topStates.map(state => (
                            <TableRow key={state}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <LocationIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                                  {state}
                                </Box>
                              </TableCell>
                              <TableCell align="right">{recommendations.prevalenceData[state]?.prevalence || '–'}</TableCell>
                              <TableCell align="right">{recommendations.prevalenceData[state]?.rank || '–'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                    <Box sx={{ p: 2, bgcolor: theme.palette.info.light, borderRadius: 1, color: theme.palette.info.contrastText }}>
                      <Typography variant="subtitle2" gutterBottom>
                        <BarChartIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Recruitment Estimate
                      </Typography>
                      <Typography variant="body2">
                        {recommendations.aiRecommendations.patientRecruitmentEstimate}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        AI Recommendations
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Card>
                            <CardHeader
                              title="Recommended States"
                              titleTypographyProps={{ variant: 'subtitle1' }}
                            />
                            <CardContent sx={{ pt: 0 }}>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {recommendations.aiRecommendations.recommendedStates.map(state => (
                                  <Chip 
                                    key={state} 
                                    label={state} 
                                    color="primary" 
                                    variant="outlined"
                                    icon={<LocationIcon />}
                                  />
                                ))}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Card>
                            <CardHeader
                              title="Protocol-Specific Insights"
                              titleTypographyProps={{ variant: 'subtitle1' }}
                            />
                            <CardContent sx={{ pt: 0 }}>
                              <Typography variant="body2" paragraph>
                                Based on your {protocol.trial_basics.phase} protocol for {recommendations.condition}, 
                                we recommend focusing on sites with access to diverse patient populations and 
                                investigators with expertise in {protocol.trial_basics.therapeuticArea.toLowerCase()}.
                              </Typography>
                              <Typography variant="body2">
                                Condition prevalence is highest in {recommendations.topStates.slice(0, 3).join(', ')}, 
                                making these prime locations for site selection.
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
              </TabPanel>
              
              {/* Investigators Tab */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Recommended Investigators
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Found {recommendations.totalDoctors} investigators matching the criteria for your {protocol.trial_basics.phase} {recommendations.condition} study.
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {recommendations.recommendedDoctors.map(doctor => (
                      <Grid item xs={12} md={6} key={doctor.doctor_id}>
                        <Card>
                          <CardHeader
                            avatar={
                              <ColoredBadge
                                badgeContent={doctor.years_experience}
                                doctor={doctor}
                                anchorOrigin={{
                                  vertical: 'bottom',
                                  horizontal: 'right',
                                }}
                              >
                                <Avatar>
                                  {doctor.first_name[0]}{doctor.last_name[0]}
                                </Avatar>
                              </ColoredBadge>
                            }
                            title={`${doctor.first_name} ${doctor.last_name}, MD`}
                            subheader={
                              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                                <Chip 
                                  label={doctor.specialty_description} 
                                  size="small" 
                                  variant="outlined"
                                />
                                <Chip 
                                  icon={<LocationIcon fontSize="small" />}
                                  label={doctor.locations[0]?.city + ', ' + doctor.license_state} 
                                  size="small" 
                                  variant="outlined"
                                />
                              </Box>
                            }
                            action={
                              <ExpandMore
                                expand={expanded[doctor.doctor_id]}
                                onClick={() => handleExpandClick(doctor.doctor_id)}
                                aria-expanded={expanded[doctor.doctor_id]}
                                aria-label="show more"
                              >
                                <ExpandMoreIcon />
                              </ExpandMore>
                            }
                          />
                          <Divider />
                          <CardContent sx={{ pt: 1, pb: 1 }}>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Experience
                                </Typography>
                                <Typography variant="body2">
                                  {doctor.years_experience} years
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Publications
                                </Typography>
                                <Typography variant="body2">
                                  {doctor.publications} papers
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Active Trials
                                </Typography>
                                <Typography variant="body2">
                                  {doctor.active_trials} studies
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  License
                                </Typography>
                                <Typography variant="body2">
                                  {doctor.license_state} #{doctor.license_number}
                                </Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                          <Collapse in={expanded[doctor.doctor_id]} timeout="auto" unmountOnExit>
                            <Divider />
                            <CardContent>
                              <Typography variant="subtitle2" gutterBottom>
                                Education & Degrees
                              </Typography>
                              <List dense disablePadding>
                                {doctor.degrees.map((degree, index) => (
                                  <ListItem key={index} disableGutters disablePadding sx={{ mt: 0.5 }}>
                                    <ListItemAvatar sx={{ minWidth: 36 }}>
                                      <SchoolIcon fontSize="small" color="primary" />
                                    </ListItemAvatar>
                                    <ListItemText 
                                      primary={`${degree.name} - ${degree.institution}`}
                                      secondary={new Date(degree.awarded_date).getFullYear()}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                              
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Contact Information
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <EmailIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                                    <Typography variant="body2">{doctor.email}</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <PhoneIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                                    <Typography variant="body2">{doctor.phone}</Typography>
                                  </Box>
                                </Box>
                              </Box>
                            </CardContent>
                          </Collapse>
                          <Divider />
                          <CardActions>
                            <Button 
                              size="small" 
                              startIcon={<CheckCircleIcon />}
                              color="primary"
                            >
                              Select
                            </Button>
                            <Button 
                              size="small"
                              startIcon={<DescriptionIcon />}
                            >
                              View Profile
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </TabPanel>
              
              {/* Site Criteria Tab */}
              <TabPanel value={tabValue} index={2}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Investigator Criteria
                    </Typography>
                    
                    <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Specialty Focus
                        </Typography>
                        <Chip 
                          label={recommendations.aiRecommendations.investigatorCriteria.specialtyFocus} 
                          color="primary"
                        />
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Minimum Experience
                        </Typography>
                        <Typography variant="body1">
                          {recommendations.aiRecommendations.investigatorCriteria.minYearsExperience} years
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Recommended Qualifications
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {recommendations.aiRecommendations.investigatorCriteria.recommendedQualifications.map((qual, index) => (
                            <Chip 
                              key={index} 
                              label={qual} 
                              variant="outlined"
                              size="small"
                            />
                          ))}
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Site Requirements
                    </Typography>
                    
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <List>
                        {recommendations.aiRecommendations.siteCriteria.map((criterion, index) => (
                          <ListItem key={index} divider={index < recommendations.aiRecommendations.siteCriteria.length - 1}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                                <CheckCircleIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={criterion} />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: theme.palette.grey[50] }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <GroupIcon sx={{ mr: 1 }} />
                        Integration with Protocol Design
                      </Typography>
                      <Typography variant="body2">
                        This site selection strategy is optimized for your specific protocol requirements, including the {protocol.trial_basics.phase} design, 
                        {protocol.study_design?.population?.ageRange ? ` age range of ${protocol.study_design.population.ageRange[0]}-${protocol.study_design.population.ageRange[1]} years,` : ''} 
                        and the complexity of your study endpoints. We recommend selecting sites that have experience with similar trial designs 
                        and can accommodate the specific assessment schedule outlined in your protocol.
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </TabPanel>
            </Box>
          </Box>
        ) : (
          <Typography variant="body1">
            No protocol data available for analysis. Please provide a complete protocol.
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Button onClick={() => !loading && onClose()}>
          Close
        </Button>
        {recommendations && (
          <Button
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Export Recommendations
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SiteSelectionModal; 