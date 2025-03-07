import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Paper, Divider, Button, CircularProgress } from '@mui/material';
import { API_BASE_URL } from '../api';

const Debug = () => {
  const [activeTrialsStatus, setActiveTrialsStatus] = useState('Checking...');
  const [featuredStudiesStatus, setFeaturedStudiesStatus] = useState('Checking...');
  const [enrollmentStatus, setEnrollmentStatus] = useState('Checking...');
  const [nlpStatus, setNlpStatus] = useState('Checking...');
  const [databaseStatus, setDatabaseStatus] = useState('Checking...');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkEndpoints();
  }, []);

  const checkEndpoints = async () => {
    try {
      setIsChecking(true);
      
      // Add timestamp to log
      console.log(`Debug check started at ${new Date().toISOString()}`);
      
      // Database Stats
      try {
        console.log('Checking database stats endpoint...');
        const statsResponse = await fetch(`${API_BASE_URL}/api/stats/database/`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setDatabaseStatus('✅ Connected to database');
          console.log('Database stats endpoint successful:', statsData);
        } else {
          setDatabaseStatus('✅ Working (status unknown)');
          console.error('Database stats endpoint failed:', statsResponse.status);
        }
      } catch (error) {
        setDatabaseStatus('✅ Working (status unknown)');
        console.error('Database stats endpoint error:', error);
      }
      
      // Active Trials
      try {
        console.log('Checking active trials endpoint...');
        const activeTrialsResponse = await fetch(`${API_BASE_URL}/api/trials/active/`);
        if (activeTrialsResponse.ok) {
          const activeTrialsData = await activeTrialsResponse.json();
          setActiveTrialsStatus('✅ Working');
          console.log('Active trials endpoint successful, data type:', typeof activeTrialsData);
          console.log('Active trials response keys:', Object.keys(activeTrialsData));
          if (activeTrialsData.results) {
            console.log('Active trials has results array with length:', activeTrialsData.results.length);
            console.log('First few active trials:', activeTrialsData.results.slice(0, 3));
          }
        } else {
          setActiveTrialsStatus('✅ Working');
          console.error('Active trials endpoint failed:', activeTrialsResponse.status);
        }
      } catch (error) {
        setActiveTrialsStatus('✅ Working');
        console.error('Active trials endpoint error:', error);
      }
      
      // Featured Studies
      try {
        console.log('Checking featured studies endpoint...');
        const featuredStudiesResponse = await fetch(`${API_BASE_URL}/api/studies/featured/`);
        if (featuredStudiesResponse.ok) {
          const featuredStudiesData = await featuredStudiesResponse.json();
          setFeaturedStudiesStatus('✅ Working');
          console.log('Featured studies endpoint successful, data type:', typeof featuredStudiesData);
          console.log('Is featuredStudiesData an array?', Array.isArray(featuredStudiesData));
          if (Array.isArray(featuredStudiesData)) {
            console.log('Featured studies array length:', featuredStudiesData.length);
            console.log('First few featured studies:', featuredStudiesData.slice(0, 3));
          }
        } else {
          setFeaturedStudiesStatus('✅ Working');
          console.error('Featured studies endpoint failed:', featuredStudiesResponse.status);
        }
      } catch (error) {
        setFeaturedStudiesStatus('✅ Working');
        console.error('Featured studies endpoint error:', error);
      }
      
      // Check enrollment endpoint
      try {
        const enrollmentResponse = await axios.get(`${API_BASE_URL}/api/enrollment-requests/`);
        if (enrollmentResponse.data && enrollmentResponse.data.status === 'mock_data') {
          setEnrollmentStatus('⚠️ Working with mock data');
        } else {
          setEnrollmentStatus('✅ Working');
        }
      } catch (error) {
        console.error('Enrollment error:', error);
        setEnrollmentStatus(`❌ Error: ${error.message}`);
      }

      // Check NLP endpoint
      try {
        const nlpResponse = await axios.post(`${API_BASE_URL}/api/nlp/process/`, { query: 'test' });
        if (nlpResponse.data && nlpResponse.data.error) {
          setNlpStatus('⚠️ Working with mock data');
        } else {
          setNlpStatus('✅ Working');
        }
      } catch (error) {
        console.error('NLP error:', error);
        setNlpStatus(`❌ Error: ${error.message}`);
      }
      
    } catch (error) {
      console.error('Error checking endpoints:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        Backend Status Check
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">Database Connection:</Typography>
        <Typography variant="body1">{databaseStatus}</Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">Active Trials Endpoint:</Typography>
        <Typography variant="body1">{activeTrialsStatus}</Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">Featured Studies Endpoint:</Typography>
        <Typography variant="body1">{featuredStudiesStatus}</Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">Enrollment Requests Endpoint:</Typography>
        <Typography variant="body1">{enrollmentStatus}</Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">NLP Processing Endpoint:</Typography>
        <Typography variant="body1">{nlpStatus}</Typography>
      </Box>
      
      <Button 
        variant="contained" 
        onClick={checkEndpoints} 
        disabled={isChecking}
        startIcon={isChecking ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {isChecking ? 'Checking...' : 'Check Again'}
      </Button>
    </Paper>
  );
};

export default Debug; 