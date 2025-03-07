import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  CircularProgress,
  Chip,
  Tooltip,
  IconButton,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import InfoIcon from '@mui/icons-material/Info';
import ShareIcon from '@mui/icons-material/Share';
import FilterListIcon from '@mui/icons-material/FilterList';
import axios from 'axios';
import TrialDetailModal from '../components/TrialDetailModal';
import ShareModal from '../components/ShareModal';
import { searchTrials } from '../api';
import { FaClipboardList, FaFlask, FaMapMarkerAlt } from 'react-icons/fa';

// Function to truncate text with tooltip for full text
const TruncatedText = ({ text, maxLength = 150 }) => {
  if (!text) return <span>Not specified</span>;
  
  // Convert to string if it's not already
  const textStr = typeof text === 'string' ? text : String(text);
  
  const truncated = textStr.length > maxLength ? `${textStr.substring(0, maxLength)}...` : textStr;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="body2" component="span">
        {truncated}
      </Typography>
      {textStr.length > maxLength && (
        <Tooltip title={textStr} placement="top">
          <IconButton size="small">
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

const TrialSearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNlpSearch, setIsNlpSearch] = useState(false);
  const [noResults, setNoResults] = useState(false);
  
  // New state variables for modal and sharing functionality
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareMode, setIsShareMode] = useState(false);
  const [selectedTrials, setSelectedTrials] = useState([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // New state variables for filtering
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [availableStatuses, setAvailableStatuses] = useState([]);

  // Update the status filter options to include all possible statuses
  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'RECRUITING', label: 'Recruiting' },
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'ACTIVE_NOT_RECRUITING', label: 'Active, not recruiting' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'ENROLLING_BY_INVITATION', label: 'Enrolling by invitation' },
    { value: 'NOT_YET_RECRUITING', label: 'Not yet recruiting' },
    { value: 'SUSPENDED', label: 'Suspended' },
    { value: 'TERMINATED', label: 'Terminated' },
    { value: 'WITHDRAWN', label: 'Withdrawn' },
    { value: 'UNKNOWN', label: 'Unknown' }
  ];

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      setSearchResults([]);
      setFilteredResults([]);
      setNoResults(false);

      try {
        // Extract search query and check if it's an NLP query
        const urlParams = new URLSearchParams(location.search);
        const query = urlParams.get('q') || '';
        const isNlpQuery = urlParams.get('nlp') === 'true';
        
        console.log('URL search query parameter:', query);
        console.log('Original location.search:', location.search);
        
        setIsNlpSearch(isNlpQuery);
        setSearchQuery(query);

        // Show debugging info in console
        console.log(`Fetching search results for query: "${query}", NLP: ${isNlpQuery}`);
        
        if (!query || !query.trim()) {
          console.log('Empty or whitespace-only search query detected');
          setNoResults(true);
          setLoading(false);
          return;
        }

        let results = [];

        try {
          if (isNlpQuery) {
            // NLP search logic...
          } else {
            // For regular search, use the searchTrials function
            console.log(`Calling searchTrials with query: "${query}"`);
            results = await searchTrials(query, {
              include_summary: true,
              full_details: true
            });
            
            console.log('Regular search results:', results);
            console.log('Results length:', results ? results.length : 0);
          }
          
          // Safety check for results
          if (!results) {
            console.error('searchTrials returned null or undefined');
            results = [];
          }
          
          // Log the number of results found
          console.log(`Found ${results.length} results for query: "${query}"`);
          
          if (results.length === 0) {
            console.log('No results found, setting noResults to true');
            setNoResults(true);
            setSearchResults([]);
            setFilteredResults([]);
          } else {
            // Convert the results to the expected format
            const processedResults = results.map(trial => {
              // Ensure each trial has the required properties
              return {
                ...trial,
                id: trial.id || trial.nct_id || `trial-${Math.random().toString(36).substr(2, 9)}`,
                nct_id: trial.nct_id || trial.id || '',
                brief_title: trial.brief_title || trial.official_title || trial.title || 'Untitled Trial',
                official_title: trial.official_title || trial.brief_title || trial.title || 'Untitled Trial',
                brief_summary: trial.brief_summary || trial.summary || 'No summary available',
                overall_status: trial.overall_status || 'UNKNOWN',
                phase: trial.phase || 'Not specified',
                sponsor: trial.sponsor || 'Not specified',
                location: trial.location || 'Multiple Locations'
              };
            });
            
            console.log('Processed results:', processedResults);
            setSearchResults(processedResults);
            setFilteredResults(processedResults);
            setNoResults(false);
          }
        } catch (apiError) {
          console.error('API error:', apiError);
          setError('There was an error connecting to the server. Showing mock data instead.');
          
          // Generate mock results based on the search query
          const mockResults = getMockResults(query);
          setSearchResults(mockResults);
          setFilteredResults(mockResults);
          setNoResults(false);
        }
      } catch (error) {
        console.error('Error in search results page:', error);
        setError('An unexpected error occurred. Please try again later.');
        setNoResults(true);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [location.search]);
  
  // Apply filters when statusFilter changes
  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredResults(searchResults);
    } else {
      setFilteredResults(searchResults.filter(trial => trial.overall_status === statusFilter));
    }
    setPage(0); // Reset to first page when filter changes
  }, [statusFilter, searchResults]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleBack = () => {
    navigate(-1);
  };
  
  // New handler for status filter
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };
  
  // New handlers for modal and sharing functionality
  const handleOpenModal = (trial) => {
    setSelectedTrial(trial);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTrial(null);
  };
  
  const toggleShareMode = () => {
    setIsShareMode(!isShareMode);
    if (isShareMode) {
      // If turning off share mode, clear selections
      setSelectedTrials([]);
    }
  };
  
  const handleTrialSelection = (trial) => {
    const trialId = trial.nct_id || trial.id;
    if (selectedTrials.includes(trialId)) {
      setSelectedTrials(selectedTrials.filter(id => id !== trialId));
    } else {
      setSelectedTrials([...selectedTrials, trialId]);
    }
  };
  
  const handleShareSelected = () => {
    if (selectedTrials.length === 0) {
      alert('Please select at least one trial to share');
      return;
    }
    
    // Find the selected trials from the search results
    const trialsToShare = searchResults.filter(trial => 
      selectedTrials.includes(trial.nct_id || trial.id)
    );
    
    // If only one trial is selected, pass it directly
    if (trialsToShare.length === 1) {
      setSelectedTrial(trialsToShare[0]);
    } else {
      // For multiple trials, pass them as an array
      setSelectedTrial(trialsToShare);
    }
    
    setIsShareModalOpen(true);
  };
  
  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    setSelectedTrial(null);
  };

  // Function to extract inclusion and exclusion criteria from eligibility text or object
  const extractCriteria = (eligibilityData) => {
    // If eligibilityData is null or undefined
    if (!eligibilityData) {
      return { inclusion: 'No inclusion criteria available', exclusion: 'No exclusion criteria available' };
    }
    
    // If eligibilityData is already an object with inclusion and exclusion properties
    if (typeof eligibilityData === 'object' && eligibilityData !== null) {
      // Handle case where inclusion and exclusion are arrays
      if (Array.isArray(eligibilityData.inclusion) && Array.isArray(eligibilityData.exclusion)) {
        return {
          inclusion: eligibilityData.inclusion.length > 0 
            ? eligibilityData.inclusion.join('\n• ') 
            : 'No inclusion criteria available',
          exclusion: eligibilityData.exclusion.length > 0 
            ? eligibilityData.exclusion.join('\n• ') 
            : 'No exclusion criteria available'
        };
      }
      
      // Handle case where inclusion and exclusion are strings
      if (eligibilityData.inclusion || eligibilityData.exclusion) {
        return {
          inclusion: eligibilityData.inclusion || 'No inclusion criteria available',
          exclusion: eligibilityData.exclusion || 'No exclusion criteria available'
        };
      }
    }
    
    // If eligibilityData is a string, use the original regex logic
    if (typeof eligibilityData === 'string') {
      // Try to match standard format first
      const inclusionMatch = eligibilityData.match(/Inclusion Criteria:(.+?)(?=Exclusion Criteria:|$)/is);
      const exclusionMatch = eligibilityData.match(/Exclusion Criteria:(.+)$/is);
      
      // If we found matches, use them
      if (inclusionMatch || exclusionMatch) {
        return {
          inclusion: inclusionMatch ? inclusionMatch[1].trim() : 'No inclusion criteria available',
          exclusion: exclusionMatch ? exclusionMatch[1].trim() : 'No exclusion criteria available'
        };
      }
      
      // If no matches, check if the text is already structured
      if (eligibilityData.toLowerCase().includes('include') || 
          eligibilityData.toLowerCase().includes('exclude') ||
          eligibilityData.toLowerCase().includes('criteria')) {
        // Just return the whole text as inclusion criteria
        return {
          inclusion: eligibilityData,
          exclusion: 'See inclusion criteria'
        };
      }
      
      // If all else fails, just return the text
      return {
        inclusion: eligibilityData,
        exclusion: 'Not specified'
      };
    }
    
    // Default fallback
    return { inclusion: 'No inclusion criteria available', exclusion: 'No exclusion criteria available' };
  };

  // Helper function to generate mock results
  const getMockResults = (query) => {
    return [
      {
        id: `mock-${query}-1`,
        nct_id: 'NCT12345678',
        brief_title: `Study on ${query}`,
        official_title: `Study on ${query}`,
        brief_summary: `This is a mock result for "${query}". The actual API endpoint returned an error.`,
        overall_status: 'RECRUITING',
        conditions: query,
        is_featured: false,
        location: 'Multiple Locations',
        phase: 'Phase 2',
        sponsor: 'Research Organization'
      },
      {
        id: `mock-${query}-2`,
        nct_id: 'NCT87654321',
        brief_title: `Advanced Research on ${query}`,
        official_title: `Advanced Research on ${query}`,
        brief_summary: `Another mock result for "${query}". The API is currently unavailable.`,
        overall_status: 'RECRUITING',
        conditions: query,
        is_featured: false,
        location: 'New York, NY',
        phase: 'Phase 3',
        sponsor: 'Academic Medical Center'
      }
    ];
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Box className="bg-blue-600 py-6">
        <Container maxWidth="lg">
          <Button 
            variant="outlined" 
            color="inherit" 
            startIcon={<ArrowBackIcon />} 
            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', mb: 2 }}
            onClick={handleBack}
          >
            Back to Search
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" color="white">
              Search Results
            </Typography>
            
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={<ShareIcon />} 
              onClick={toggleShareMode}
              sx={{ bgcolor: 'white', color: 'primary.main' }}
            >
              Share Trials
            </Button>
          </Box>
        </Container>
      </Box>
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Search Query: <span className="font-normal text-gray-600">{searchQuery}</span>
          </Typography>
          {isNlpSearch && (
            <Chip label="AI-Powered Search" color="primary" size="small" sx={{ mr: 1 }} />
          )}
        </Box>
        
        <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : noResults ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No results found. Please try a different search term or filter.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery ? (
                  <>We couldn't find any trials matching "{searchQuery}" in our database.</>
                ) : (
                  <>No search query was provided. Please enter a search term.</>
                )}
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={handleBack}
              >
                Try a new search
              </Button>
            </Box>
          ) : (
            <Box>
              {filteredResults.length > 0 ? (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found
                  </Typography>
                  
                  <Box>
                    {filteredResults.map((trial) => (
                      <Paper
                        key={trial.id || trial.nct_id}
                        elevation={0}
                        sx={{
                          mb: 2,
                          p: 0,
                          border: isShareMode ? (selectedTrials.includes(trial.id) ? '2px solid #1976d2' : '1px solid #e0e0e0') : '1px solid #e0e0e0',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          position: 'relative'
                        }}
                      >
                        {isShareMode && (
                          <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #e0e0e0' }}>
                            <Checkbox
                              checked={selectedTrials.includes(trial.id)}
                              onChange={() => handleTrialSelection(trial)}
                            />
                          </Box>
                        )}
                        
                        <Box
                          sx={{ 
                            p: 3,
                            cursor: isShareMode ? 'default' : 'pointer',
                            pl: isShareMode ? 5 : 3
                          }}
                          onClick={() => !isShareMode && handleOpenModal(trial)}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                              {trial.brief_title || trial.official_title || 'Untitled Trial'}
                            </Typography>
                            <Chip 
                              label={trial.overall_status || 'UNKNOWN'} 
                              color={
                                trial.overall_status === 'RECRUITING' ? 'success' :
                                trial.overall_status === 'ACTIVE_NOT_RECRUITING' ? 'primary' :
                                trial.overall_status === 'COMPLETED' ? 'secondary' :
                                'default'
                              }
                              size="small"
                              sx={{ fontWeight: '500' }}
                            />
                          </Box>
                          
                          <Typography variant="body2" paragraph>
                            <TruncatedText text={trial.brief_summary || 'No summary available'} />
                          </Typography>
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2, color: 'text.secondary' }}>
                            {trial.nct_id && (
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                <FaClipboardList className="mr-1" /> NCT ID: {trial.nct_id}
                              </Typography>
                            )}
                            
                            {trial.phase && (
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                <FaFlask className="mr-1" /> {trial.phase}
                              </Typography>
                            )}
                            
                            {trial.location && (
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                <FaMapMarkerAlt className="mr-1" /> {trial.location}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                  
                  {/* Pagination - only show if necessary */}
                  {filteredResults.length > 10 && (
                    <TablePagination
                      component="div"
                      count={filteredResults.length}
                      page={page}
                      onPageChange={handleChangePage}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      rowsPerPageOptions={[5, 10, 25]}
                    />
                  )}
                </>
              ) : (
                // This is a fallback for when filtered results are empty but general results exist
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No results match the current filter.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => setStatusFilter('ALL')}
                    sx={{ mt: 2 }}
                  >
                    Clear Filters
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Container>
      
      {/* Trial Detail Modal */}
      {isModalOpen && selectedTrial && (
        <TrialDetailModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          trial={selectedTrial} 
        />
      )}
      
      {/* Share Modal */}
      {isShareModalOpen && selectedTrial && (
        <ShareModal 
          isOpen={isShareModalOpen} 
          onClose={handleCloseShareModal} 
          trial={selectedTrial} 
        />
      )}
    </div>
  );
};

export default TrialSearchResults; 