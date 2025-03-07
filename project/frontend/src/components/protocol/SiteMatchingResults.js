import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Rating,
  Chip,
  Button,
  Tooltip,
  Alert
} from '@mui/material';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';
import siteMatchingService from '../../services/siteMatchingService';
import usStatesGeoData from '../../utils/usStatesGeoData';

const SiteMatchingResults = ({ 
  protocolData, 
  selectedSites = [], 
  onSiteSelect,
  loading = false 
}) => {
  const [prevalenceData, setPrevalenceData] = useState(null);
  const [compatibilityScores, setCompatibilityScores] = useState({});
  const [recruitmentPredictions, setRecruitmentPredictions] = useState({});
  const [mapLoading, setMapLoading] = useState(true);

  useEffect(() => {
    if (protocolData?.trial_basics?.condition) {
      loadPrevalenceData();
    }
  }, [protocolData]);

  useEffect(() => {
    if (selectedSites.length > 0) {
      loadSiteMetrics();
    }
  }, [selectedSites]);

  const loadPrevalenceData = async () => {
    try {
      const data = await siteMatchingService.getDiseasePrevalence(
        protocolData.trial_basics.condition
      );
      setPrevalenceData(data);
    } catch (error) {
      console.error('Error loading prevalence data:', error);
    } finally {
      setMapLoading(false);
    }
  };

  const loadSiteMetrics = async () => {
    try {
      const siteIds = selectedSites.map(site => site.doctor_id);
      
      // Load compatibility scores
      const compatibility = await siteMatchingService.getSiteCompatibility(
        protocolData,
        siteIds
      );
      setCompatibilityScores(compatibility);

      // Load recruitment predictions
      const recruitment = await siteMatchingService.predictRecruitment(
        selectedSites,
        protocolData.study_design
      );
      setRecruitmentPredictions(recruitment);
    } catch (error) {
      console.error('Error loading site metrics:', error);
    }
  };

  const colorScale = scaleQuantile()
    .domain(prevalenceData ? Object.values(prevalenceData) : [0, 100])
    .range([
      "#ffedea",
      "#ffcec5",
      "#ffad9f",
      "#ff8a75",
      "#ff5533",
      "#e2492d",
      "#be3d26",
      "#9a311f",
      "#782618"
    ]);

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Site Matching Results
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Disease Prevalence Map */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Disease Prevalence by Region
                </Typography>
                
                {mapLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ height: 400 }}>
                    <ComposableMap projection="geoAlbersUsa">
                      <Geographies geography={usStatesGeoData}>
                        {({ geographies }) =>
                          geographies.map(geo => {
                            const stateValue = prevalenceData?.[geo.properties.name] || 0;
                            return (
                              <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill={colorScale(stateValue)}
                                stroke="#FFFFFF"
                                strokeWidth={0.5}
                              />
                            );
                          })
                        }
                      </Geographies>
                      
                      {selectedSites.map(site => (
                        <Marker
                          key={site.doctor_id}
                          coordinates={[
                            site.locations?.[0]?.longitude || 0,
                            site.locations?.[0]?.latitude || 0
                          ]}
                        >
                          <circle r={5} fill="#1976d2" />
                        </Marker>
                      ))}
                    </ComposableMap>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Site Cards */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {selectedSites.map(site => {
                const compatibility = compatibilityScores[site.doctor_id] || {};
                const recruitment = recruitmentPredictions[site.doctor_id] || {};
                
                return (
                  <Grid item xs={12} md={6} lg={4} key={site.doctor_id}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1">
                          {site.first_name} {site.last_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {site.specialty_description}
                        </Typography>

                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            Compatibility Score
                          </Typography>
                          <Rating 
                            value={compatibility.score || 0}
                            readOnly
                            precision={0.5}
                            max={5}
                          />
                        </Box>

                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            Strengths
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {compatibility.strengths?.map((strength, index) => (
                              <Chip
                                key={index}
                                label={strength}
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>

                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            Recruitment Potential
                          </Typography>
                          <Alert severity={
                            recruitment.potential > 80 ? "success" :
                            recruitment.potential > 50 ? "info" :
                            "warning"
                          }>
                            {recruitment.potential}% match with target population
                          </Alert>
                        </Box>

                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          sx={{ mt: 2 }}
                          onClick={() => onSiteSelect(site)}
                        >
                          Select Site
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default SiteMatchingResults; 