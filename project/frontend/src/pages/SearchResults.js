import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Button, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, IconButton, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Tabs, Tab, Card, CardContent, Link, Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlagIcon from '@mui/icons-material/Flag';
import VisibilityIcon from '@mui/icons-material/Visibility';
import format from 'date-fns/format';
import { fetchSearchRule, fetchSearchResults, runSearch, markResultReviewed } from '../api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`results-tabpanel-${index}`}
      aria-labelledby={`results-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SearchResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchRule, setSearchRule] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningSearch, setRunningSearch] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // For the review dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch the search rule
        const rule = await fetchSearchRule(id);
        if (!rule) {
          setError('Search rule not found');
          setLoading(false);
          return;
        }
        setSearchRule(rule);
        
        // Fetch the results
        const resultsData = await fetchSearchResults(id);
        setResults(resultsData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load search results. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleRunSearch = async () => {
    try {
      setRunningSearch(true);
      setError(null);
      
      const response = await runSearch(id);
      if (response) {
        // Refresh the results
        const resultsData = await fetchSearchResults(id);
        setResults(resultsData);
      }
    } catch (err) {
      console.error('Error running search:', err);
      setError('Failed to run search. Please try again.');
    } finally {
      setRunningSearch(false);
    }
  };

  const handleOpenReviewDialog = (result) => {
    setSelectedResult(result);
    setReviewNotes('');
    setOpenDialog(true);
  };

  const handleCloseReviewDialog = () => {
    setOpenDialog(false);
    setSelectedResult(null);
  };

  const handleReviewSubmit = async () => {
    if (!selectedResult) return;
    
    try {
      setReviewLoading(true);
      
      const response = await markResultReviewed(selectedResult.id, reviewNotes);
      if (response) {
        // Update the result in the local state
        setResults(prevResults => 
          prevResults.map(result => 
            result.id === selectedResult.id 
              ? { ...result, review_status: 'REVIEWED', reviewer_notes: reviewNotes, reviewed_at: new Date().toISOString() }
              : result
          )
        );
        
        handleCloseReviewDialog();
      }
    } catch (err) {
      console.error('Error marking result as reviewed:', err);
      setError('Failed to mark result as reviewed. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'PENDING':
        return <Chip label="Pending Review" color="warning" size="small" />;
      case 'REVIEWED':
        return <Chip label="Reviewed" color="success" size="small" icon={<CheckCircleIcon />} />;
      case 'FLAGGED':
        return <Chip label="Flagged" color="error" size="small" icon={<FlagIcon />} />;
      case 'DISMISSED':
        return <Chip label="Dismissed" color="default" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  // Filter results based on tab
  const pendingResults = results.filter(result => result.review_status === 'PENDING');
  const reviewedResults = results.filter(result => result.review_status === 'REVIEWED');
  const flaggedResults = results.filter(result => result.review_status === 'FLAGGED');
  const dismissedResults = results.filter(result => result.review_status === 'DISMISSED');

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate('/pharmacovigilance')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          Search Results
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {searchRule && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{searchRule.name}</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={handleRunSearch}
              disabled={runningSearch}
            >
              {runningSearch ? 'Running...' : 'Run Search'}
            </Button>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                <strong>Drug:</strong> {searchRule.drug_name}
              </Typography>
              {searchRule.description && (
                <Typography variant="body2" color="textSecondary">
                  <strong>Description:</strong> {searchRule.description}
                </Typography>
              )}
              <Typography variant="body2" color="textSecondary">
                <strong>Status:</strong> {searchRule.status}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                <strong>Last Run:</strong> {searchRule.last_run ? formatDate(searchRule.last_run) + ' ' + format(new Date(searchRule.last_run), 'h:mm a') : 'Never'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Date Range:</strong> {searchRule.date_range_start ? formatDate(searchRule.date_range_start) : 'Any'} to {searchRule.date_range_end ? formatDate(searchRule.date_range_end) : 'Present'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Frequency:</strong> {searchRule.frequency}
              </Typography>
            </Grid>
          </Grid>
          
          {searchRule.adverse_event_terms && searchRule.adverse_event_terms.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Adverse Event Terms:</strong>
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {searchRule.adverse_event_terms.map(term => (
                  <Chip 
                    key={term.id} 
                    label={term.term} 
                    size="small" 
                    variant="outlined" 
                  />
                ))}
              </Box>
            </Box>
          )}
          
          {searchRule.additional_keywords && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              <strong>Additional Keywords:</strong> {searchRule.additional_keywords}
            </Typography>
          )}
        </Paper>
      )}
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Literature Review Results
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="results tabs">
            <Tab label={`All (${results.length})`} />
            <Tab label={`Pending (${pendingResults.length})`} />
            <Tab label={`Reviewed (${reviewedResults.length})`} />
            <Tab label={`Flagged (${flaggedResults.length})`} />
            <Tab label={`Dismissed (${dismissedResults.length})`} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {renderResultsTable(results)}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {renderResultsTable(pendingResults)}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          {renderResultsTable(reviewedResults)}
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          {renderResultsTable(flaggedResults)}
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          {renderResultsTable(dismissedResults)}
        </TabPanel>
      </Paper>
      
      {/* Review Dialog */}
      <Dialog open={openDialog} onClose={handleCloseReviewDialog} maxWidth="md" fullWidth>
        <DialogTitle>Review Article</DialogTitle>
        <DialogContent>
          {selectedResult && (
            <Box>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {selectedResult.article_title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>PMID:</strong> {selectedResult.article_pmid}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Publication Date:</strong> {formatDate(selectedResult.article_date)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Matched Terms:</strong> {selectedResult.matched_terms}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Link 
                      href={`https://pubmed.ncbi.nlm.nih.gov/${selectedResult.article_pmid}/`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View on PubMed
                    </Link>
                  </Box>
                </CardContent>
              </Card>
              
              <TextField
                fullWidth
                label="Review Notes"
                multiline
                rows={4}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                variant="outlined"
                placeholder="Enter your notes about this article..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewDialog} disabled={reviewLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleReviewSubmit} 
            color="primary" 
            variant="contained"
            disabled={reviewLoading}
          >
            {reviewLoading ? 'Saving...' : 'Mark as Reviewed'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
  
  function renderResultsTable(resultsToShow) {
    if (resultsToShow.length === 0) {
      return (
        <Typography sx={{ py: 2 }}>
          No results found in this category.
        </Typography>
      );
    }
    
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Article</TableCell>
              <TableCell>Publication Date</TableCell>
              <TableCell>Matched Terms</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resultsToShow.map((result) => (
              <TableRow key={result.id}>
                <TableCell>
                  <Typography variant="body2">
                    <Link 
                      href={`https://pubmed.ncbi.nlm.nih.gov/${result.article_pmid}/`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {result.article_title}
                    </Link>
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    PMID: {result.article_pmid}
                  </Typography>
                </TableCell>
                <TableCell>{formatDate(result.article_date)}</TableCell>
                <TableCell>{result.matched_terms}</TableCell>
                <TableCell>{getStatusChip(result.review_status)}</TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => handleOpenReviewDialog(result)}
                    title="Review Article"
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
};

export default SearchResults; 