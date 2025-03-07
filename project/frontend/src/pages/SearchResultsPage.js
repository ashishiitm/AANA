import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Alert, 
  Button, 
  CircularProgress,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import SearchResults from '../components/pharmacovigilance/SearchResults';
import { fetchSearchRule, fetchSearchResults, runSearch } from '../api';
import format from 'date-fns/format';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const frequencyLabels = {
  'daily': 'Daily',
  '8_hours': 'Every 8 Hours',
  '12_hours': 'Every 12 Hours',
  'weekly': 'Weekly',
  'monthly': 'Monthly'
};

const SearchResultsPage = () => {
  const [searchRule, setSearchRule] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningSearch, setRunningSearch] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch search rule details
      const rule = await fetchSearchRule(id);
      setSearchRule(rule);
      
      // Fetch search results
      const resultsData = await fetchSearchResults(id);
      setResults(resultsData);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleRunSearch = async () => {
    try {
      setRunningSearch(true);
      setError(null);
      
      await runSearch(id);
      
      // Reload results after running the search
      await loadData();
    } catch (err) {
      console.error('Error running search:', err);
      setError('Failed to run search. Please try again.');
    } finally {
      setRunningSearch(false);
    }
  };

  const handleEditRule = () => {
    navigate(`/pharmacovigilance/edit-rule/${id}`);
  };

  const handleBack = () => {
    navigate('/pharmacovigilance');
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !searchRule) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Back to Search Rules
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/pharmacovigilance" underline="hover" color="inherit">
            Pharmacovigilance
          </Link>
          <Typography color="text.primary">Search Results</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {searchRule.name}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              {searchRule.description || 'No description provided.'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />}
              onClick={handleEditRule}
            >
              Edit Rule
            </Button>
            
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<PlayArrowIcon />}
              onClick={handleRunSearch}
              disabled={runningSearch}
            >
              {runningSearch ? 'Running...' : 'Run Search Now'}
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Search Rule Details
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Chip 
              label={`Frequency: ${frequencyLabels[searchRule.frequency] || searchRule.frequency}`} 
              color="primary" 
              variant="outlined"
            />
            
            <Chip 
              label={`Status: ${searchRule.is_active ? 'Active' : 'Inactive'}`} 
              color={searchRule.is_active ? 'success' : 'default'} 
              variant="outlined"
            />
            
            {searchRule.last_run && (
              <Chip 
                label={`Last run: ${format(new Date(searchRule.last_run), 'MMM d, yyyy h:mm a')}`} 
                color="default" 
                variant="outlined"
              />
            )}
            
            {searchRule.email_notifications && (
              <Chip 
                label="Email notifications enabled" 
                color="info" 
                variant="outlined"
              />
            )}
          </Box>
          
          <Typography variant="subtitle2" gutterBottom>
            Search Criteria:
          </Typography>
          
          {searchRule.criteria && searchRule.criteria.length > 0 ? (
            <Box component="ul" sx={{ pl: 3 }}>
              {searchRule.criteria.map((criterion, index) => (
                <Typography component="li" key={index} variant="body2">
                  {criterion.field_type}: <strong>{criterion.value}</strong> 
                  {index < searchRule.criteria.length - 1 && ` ${criterion.operator}`}
                </Typography>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No criteria defined.
            </Typography>
          )}
        </Paper>
        
        <Typography variant="h5" gutterBottom>
          Search Results
        </Typography>
        
        {results.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" paragraph>
              No results found for this search rule.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleRunSearch}
              disabled={runningSearch}
            >
              {runningSearch ? 'Running...' : 'Run Search Now'}
            </Button>
          </Paper>
        ) : (
          <SearchResults 
            results={results} 
            searchRule={searchRule}
            onRefresh={loadData}
          />
        )}
      </Box>
    </Container>
  );
};

export default SearchResultsPage; 