import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Slider,
  Card,
  CardContent,
  Grid,
  Divider,
  Tooltip,
  Paper,
  Stack,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SpeedIcon from '@mui/icons-material/Speed';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

// Styled components
const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  background: '-webkit-linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const ProgressLabel = styled(Box)(({ theme, value, color }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(0.5),
  '& .MuiTypography-root': {
    fontWeight: 500,
    color: color || theme.palette.text.primary,
  }
}));

const CounterSpan = ({ targetValue, duration = 2000, prefix = '', suffix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const requestRef = useRef();
  const startTimeRef = useRef();

  const animate = (timestamp) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }
    
    const progress = timestamp - startTimeRef.current;
    const percentage = Math.min(progress / duration, 1);
    
    countRef.current = percentage * targetValue;
    setCount(countRef.current);
    
    if (percentage < 1) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    setCount(0);
    countRef.current = 0;
    startTimeRef.current = null;
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [targetValue]);

  return (
    <span>
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
};

const TimeSavingsCalculator = () => {
  const [protocolComplexity, setProtocolComplexity] = useState(3); // 1-5 scale
  const [teamSize, setTeamSize] = useState(5); // People
  
  // Calculate traditional timeline and costs
  const traditionalDays = protocolComplexity * 30; // 30-150 days
  const aiDays = Math.max(protocolComplexity * 3, 7); // 7-15 days
  const timeSaved = traditionalDays - aiDays;
  const costPerDay = 2500; // $2,500 per day for traditional
  const traditionalCost = traditionalDays * costPerDay * teamSize / 5; // Adjusted for team size
  const aiCost = aiDays * costPerDay * 0.3; // 70% cost reduction
  const costSaved = traditionalCost - aiCost;
  
  // Calculate percentages for visualization
  const timeReduction = Math.round((timeSaved / traditionalDays) * 100);
  const costReduction = Math.round((costSaved / traditionalCost) * 100);

  return (
    <Card elevation={3} sx={{ mb: 4, overflow: 'visible' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom fontWeight={700} sx={{ mb: 3 }}>
          Protocol Development ROI Calculator
        </Typography>
        
        <Grid container spacing={3}>
          {/* Input Controls */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Protocol Parameters
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography id="protocol-complexity-slider" gutterBottom>
                  Protocol Complexity: {protocolComplexity}/5
                </Typography>
                <Slider
                  value={protocolComplexity}
                  onChange={(_, value) => setProtocolComplexity(value)}
                  aria-labelledby="protocol-complexity-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={1}
                  max={5}
                />
                <Typography variant="caption" color="text.secondary">
                  {protocolComplexity === 1 && 'Simple protocol with minimal endpoints'}
                  {protocolComplexity === 2 && 'Basic protocol with standard design'}
                  {protocolComplexity === 3 && 'Moderate complexity with multiple endpoints'}
                  {protocolComplexity === 4 && 'Complex design with numerous criteria'}
                  {protocolComplexity === 5 && 'Highly complex protocol with advanced design'}
                </Typography>
              </Box>
              
              <Box>
                <Typography id="team-size-slider" gutterBottom>
                  Team Size: {teamSize} people
                </Typography>
                <Slider
                  value={teamSize}
                  onChange={(_, value) => setTeamSize(value)}
                  aria-labelledby="team-size-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={2}
                  max={10}
                />
                <Typography variant="caption" color="text.secondary">
                  Number of people involved in protocol development process
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          {/* Results */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <StatCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2">Time Saved</Typography>
                    </Box>
                    <StatValue>
                      <CounterSpan targetValue={timeSaved} suffix=" days" />
                    </StatValue>
                    <Typography variant="body2" color="text.secondary">
                      From {traditionalDays} days to just {aiDays} days
                    </Typography>
                  </CardContent>
                  <LinearProgress 
                    variant="determinate" 
                    value={timeReduction} 
                    color="success"
                    sx={{ height: 6 }}
                  />
                </StatCard>
              </Grid>
              
              <Grid item xs={6}>
                <StatCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <MonetizationOnIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2">Cost Saved</Typography>
                    </Box>
                    <StatValue>
                      <CounterSpan 
                        targetValue={costSaved / 1000} 
                        prefix="$" 
                        suffix="K" 
                        decimals={1}
                      />
                    </StatValue>
                    <Typography variant="body2" color="text.secondary">
                      <CounterSpan targetValue={costReduction} suffix="%" /> cost reduction
                    </Typography>
                  </CardContent>
                  <LinearProgress 
                    variant="determinate" 
                    value={costReduction} 
                    color="success"
                    sx={{ height: 6 }}
                  />
                </StatCard>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Efficiency Metrics
                  </Typography>
                  
                  <Stack spacing={1}>
                    <Box>
                      <ProgressLabel>
                        <Typography variant="body2">Traditional Protocol</Typography>
                        <Typography variant="body2">{traditionalDays} days</Typography>
                      </ProgressLabel>
                      <LinearProgress 
                        variant="determinate" 
                        value={100} 
                        color="inherit"
                        sx={{ height: 8, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { bgcolor: '#f44336' } }}
                      />
                    </Box>
                    
                    <Box>
                      <ProgressLabel>
                        <Typography variant="body2">AI-Assisted Protocol</Typography>
                        <Typography variant="body2">{aiDays} days</Typography>
                      </ProgressLabel>
                      <LinearProgress 
                        variant="determinate" 
                        value={(aiDays / traditionalDays) * 100} 
                        color="success"
                        sx={{ height: 8 }}
                      />
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TimeSavingsCalculator; 