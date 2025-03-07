import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Chip, 
  Button, 
  IconButton,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { formatDistanceToNow } from 'date-fns';

const frequencyLabels = {
  'daily': 'Daily',
  '8_hours': 'Every 8 Hours',
  '12_hours': 'Every 12 Hours',
  'weekly': 'Weekly',
  'monthly': 'Monthly'
};

const SearchRulesList = ({ rules, emptyMessage }) => {
  const navigate = useNavigate();

  if (!rules || rules.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          {emptyMessage || 'No search rules found.'}
        </Typography>
      </Box>
    );
  }

  const handleViewResults = (ruleId) => {
    navigate(`/pharmacovigilance/results/${ruleId}`);
  };

  const handleEditRule = (ruleId) => {
    navigate(`/pharmacovigilance/edit-rule/${ruleId}`);
  };

  const handleRunSearch = (ruleId) => {
    // This would be implemented to call the API to run the search
    console.log(`Running search for rule ID: ${ruleId}`);
  };

  return (
    <Grid container spacing={3}>
      {rules.map((rule) => (
        <Grid item xs={12} key={rule.id}>
          <Card 
            sx={{ 
              borderLeft: 6, 
              borderColor: rule.is_active ? 'primary.main' : 'text.disabled',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h6" component="div">
                    {rule.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {rule.description || 'No description provided.'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Chip 
                      label={frequencyLabels[rule.frequency] || rule.frequency} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                    
                    {rule.last_run && (
                      <Chip 
                        label={`Last run: ${formatDistanceToNow(new Date(rule.last_run))} ago`} 
                        size="small" 
                        color="default" 
                        variant="outlined"
                      />
                    )}
                    
                    {rule.email_notifications && (
                      <Chip 
                        label="Email notifications" 
                        size="small" 
                        color="info" 
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="View Results">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleViewResults(rule.id)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Edit Rule">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEditRule(rule.id)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Run Search Now">
                    <IconButton 
                      color="secondary" 
                      onClick={() => handleRunSearch(rule.id)}
                    >
                      <PlayArrowIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => handleViewResults(rule.id)}
                >
                  View Results
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default SearchRulesList; 