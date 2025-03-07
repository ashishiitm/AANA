import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from './api';

function SearchPage() {
  // State definitions
  const [conditions, setConditions] = useState([]);
  const [locations, setLocations] = useState([]);
  const [phases, setPhases] = useState([]);
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');
  const [phase, setPhase] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTrials, setActiveTrials] = useState([]);
  const [featuredStudies, setFeaturedStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize with mock data to test rendering
  useEffect(() => {
    const initialMockTrials = [
      { nct_id: 'NCT01234567', official_title: 'Example Active Trial 1', overall_status: 'RECRUITING', location: 'New York, NY' },
      { nct_id: 'NCT02345678', official_title: 'Example Active Trial 2', overall_status: 'RECRUITING', location: 'Boston, MA' },
    ];
    console.log('Initializing with mock data for Active Trials:', initialMockTrials);
    setActiveTrials(initialMockTrials); // Set mock data immediately
    setLoading(false); // Set loading to false after mock data is set
  }, []);

  // Fetch dropdown options and featured studies
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching initial data...');
        const [conditionsRes, locationsRes, phasesRes, featuredStudiesData] = await Promise.all([
          axios.get('http://localhost:8000/api/conditions/'),
          axios.get('http://localhost:8000/api/locations/'),
          axios.get('http://localhost:8000/api/phases/'),
          api.fetchFeaturedStudies(),
        ]);
        console.log('Conditions Response:', conditionsRes.data);
        console.log('Locations Response:', locationsRes.data);
        console.log('Phases Response:', phasesRes.data);
        console.log('Featured Studies Raw Response:', featuredStudiesData);
        setConditions(conditionsRes.data || []);
        setLocations(locationsRes.data || []);
        setPhases(phasesRes.data || []);
        setFeaturedStudies(featuredStudiesData || []);
      } catch (error) {
        console.error('Error fetching initial data:', error.message, error.stack);
        setError('Failed to fetch initial data. Check server connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch active trials (with fallback to mock data if API fails)
  useEffect(() => {
    const fetchActiveTrialsData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching active trials with page:', 1);
        const activeTrialsData = await api.fetchActiveTrials({ page: 1, page_size: 10 });
        console.log('Active Trials Raw Response:', activeTrialsData);
        const trials = activeTrialsData.results || activeTrialsData || [];
        console.log('Extracted Trials:', trials);
        if (!Array.isArray(trials) || trials.length === 0) {
          console.warn('No valid trials data, using mock data');
          const mockTrials = [
            { nct_id: 'NCT01234567', official_title: 'Mock Trial 1', overall_status: 'RECRUITING', location: 'New York, NY' },
            { nct_id: 'NCT02345678', official_title: 'Mock Trial 2', overall_status: 'RECRUITING', location: 'Boston, MA' },
          ];
          setActiveTrials(mockTrials);
        } else {
          setActiveTrials(trials);
        }
      } catch (error) {
        console.error('Error fetching active trials:', error.message, error.stack);
        setError('Failed to fetch active trials. Using mock data.');
        const mockTrials = [
          { nct_id: 'NCT01234567', official_title: 'Mock Trial 1', overall_status: 'RECRUITING', location: 'New York, NY' },
          { nct_id: 'NCT02345678', official_title: 'Mock Trial 2', overall_status: 'RECRUITING', location: 'Boston, MA' },
        ];
        setActiveTrials(mockTrials);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveTrialsData();
  }, []);

  // Handle search
  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Performing search with params:', { query: condition, location, phase, status: 'RECRUITING' });
      const response = await axios.get('http://localhost:8000/api/studies/search/', {
        params: { query: condition || '', location: location || '', phase: phase || '', status: 'RECRUITING' },
      });
      console.log('Search Results Response:', response.data);
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Error searching trials:', error.message, error.stack);
      setError('Failed to fetch search results.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Render
  if (loading) return <div style={{ color: 'white', textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;

  return (
    <div style={{ backgroundColor: '#1e3a8a', minHeight: '100vh', color: 'white', padding: '20px' }}>
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px' }}>Discover Clinical Trials</h1>

        {/* Dropdowns */}
        <div style={{ marginBottom: '20px' }}>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            style={{ width: '200px', margin: '5px', padding: '8px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '4px' }}
          >
            <option value="">Select Condition</option>
            {conditions.map((cond) => (
              <option key={cond} value={cond}>{cond}</option>
            ))}
          </select>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ width: '200px', margin: '5px', padding: '8px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '4px' }}
          >
            <option value="">Select Location</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <select
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
            style={{ width: '200px', margin: '5px', padding: '8px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '4px' }}
          >
            <option value="">Select Phase</option>
            {phases.map((ph) => (
              <option key={ph} value={ph}>{ph}</option>
            ))}
          </select>
          <button
            onClick={handleSearch}
            style={{ width: '200px', padding: '10px', backgroundColor: '#facc15', border: 'none', borderRadius: '4px', color: 'black', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
          >
            Search
          </button>
        </div>

        {/* Active Clinical Trials */}
        <div style={{ marginTop: '40px' }}>
          <h2>Active Clinical Trials</h2>
          {activeTrials.length > 0 ? (
            activeTrials.map((trial) => (
              <div key={trial.nct_id} style={{ margin: '10px 0', padding: '15px', backgroundColor: '#4a5568', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <p><strong>Title:</strong> {trial.official_title || 'No title'}</p>
                <p><strong>NCT ID:</strong> {trial.nct_id || 'Not specified'}</p>
                <p><strong>Status:</strong> {trial.overall_status || 'Not specified'}</p>
                <p><strong>Location:</strong> {trial.location || 'Not specified'}</p>
              </div>
            ))
          ) : (
            <p style={{ color: '#e53e3e' }}>No active trials found. Check server connection.</p>
          )}
        </div>

        {/* Featured Studies */}
        <div style={{ marginTop: '40px' }}>
          <h2>Featured Studies</h2>
          {featuredStudies.length > 0 ? (
            featuredStudies.map((study) => (
              <div key={study.nct_id} style={{ margin: '10px 0', padding: '15px', backgroundColor: '#4a5568', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <p><strong>Title:</strong> {study.official_title || 'No title'}</p>
                <p><strong>NCT ID:</strong> {study.nct_id || 'Not specified'}</p>
                <p><strong>Status:</strong> {study.overall_status || 'Not specified'}</p>
                <p><strong>Location:</strong> {study.location || 'Not specified'}</p>
              </div>
            ))
          ) : (
            <p style={{ color: '#e53e3e' }}>No featured studies found.</p>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h2>Search Results</h2>
            {searchResults.map((result) => (
              <div key={result.nct_id} style={{ margin: '10px 0', padding: '15px', backgroundColor: '#4a5568', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <p><strong>Title:</strong> {result.official_title || result.title || 'No title'}</p>
                <p><strong>NCT ID:</strong> {result.nct_id || 'Not specified'}</p>
                <p><strong>Status:</strong> {result.overall_status || result.status || 'Not specified'}</p>
                <p><strong>Location:</strong> {result.location || 'Not specified'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;