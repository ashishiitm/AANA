import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from './api';

function SearchPage() {
  const [conditions, setConditions] = useState([]);
  const [locations, setLocations] = useState([]);
  const [phases, setPhases] = useState([]);
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');
  const [phase, setPhase] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTrials, setActiveTrials] = useState([]);
  const [featuredStudies, setFeaturedStudies] = useState([]);
  const [activeTrialsPage, setActiveTrialsPage] = useState(1);
  const [hasMoreActiveTrials, setHasMoreActiveTrials] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set mock data immediately on component mount to test rendering
  useEffect(() => {
    const mockTrials = [
      {
        nct_id: 'NCT01234567',
        official_title: 'Example Active Trial 1',
        overall_status: 'RECRUITING',
        location: 'New York, NY'
      },
      {
        nct_id: 'NCT02345678',
        official_title: 'Example Active Trial 2',
        overall_status: 'RECRUITING',
        location: 'Boston, MA'
      }
    ];
    setActiveTrials(mockTrials);
    console.log('Set initial mock data for Active Trials:', mockTrials);
  }, []);

  // Fetch dropdown options and featured studies
  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      setError(null);
      try {
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
        setError('Failed to fetch options or featured studies. Check the backend server and console.');
        console.error('Error fetching options:', error.message, error.stack);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  // Fetch active trials with pagination
  useEffect(() => {
    const fetchActiveTrialsData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Calling fetchActiveTrials with params:', { page: activeTrialsPage, page_size: 10 });
        const activeTrialsData = await api.fetchActiveTrials({ page: activeTrialsPage, page_size: 10 });
        console.log('Active Trials Raw Response:', activeTrialsData);
        const trials = activeTrialsData.results || activeTrialsData || [];
        console.log('Extracted Trials:', trials);
        if (!Array.isArray(trials) || trials.length === 0) {
          console.error('Trials is not an array or is empty:', trials);
          return; // Mock data already set on mount
        }
        setActiveTrials(prev => {
          const updatedTrials = [...prev, ...trials];
          console.log('Updated Active Trials:', updatedTrials);
          return updatedTrials;
        });
        setHasMoreActiveTrials(!!activeTrialsData.next);
      } catch (error) {
        setError('Failed to fetch active trials. Check the backend server and console.');
        console.error('Error fetching active trials:', error.message, error.stack);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveTrialsData();
  }, [activeTrialsPage]);

  const loadMoreActiveTrials = useCallback(() => {
    if (hasMoreActiveTrials && !loading) {
      setActiveTrialsPage(prev => prev + 1);
    }
  }, [hasMoreActiveTrials, loading]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8000/api/studies/search/', {
        params: {
          query: condition || '',
          location: location || '',
          phase: phase || '',
          status: 'RECRUITING',
        },
      });
      console.log('Search Results Response:', response.data);
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Error searching trials:', error.message, error.stack);
      setError('Failed to fetch search results. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && activeTrials.length === 0) return <div style={{ color: 'white' }}>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ backgroundColor: '#1e3a8a', minHeight: '100vh', color: 'white', padding: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: '20px' }}>Discover Active Trials</h1>

        {/* Dropdowns */}
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          style={{ width: '200px', margin: '10px 0', padding: '5px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '4px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
        >
          <option value="">Select Condition</option>
          {conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
        </select>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ width: '200px', margin: '10px 0', padding: '5px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '4px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
        >
          <option value="">Select Location</option>
          {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>
        <select
          value={phase}
          onChange={(e) => setPhase(e.target.value)}
          style={{ width: '200px', margin: '10px 0', padding: '5px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '4px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
        >
          <option value="">Select Phase</option>
          {phases.map(ph => <option key={ph} value={ph}>{ph}</option>)}
        </select>
        <button
          onClick={handleSearch}
          style={{ width: '200px', padding: '10px', backgroundColor: '#facc15', border: 'none', borderRadius: '4px', color: 'black', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
        >
          Search
        </button>

        {/* Active Clinical Trials */}
        <div style={{ marginTop: '40px' }}>
          <h2>Active Clinical Trials</h2>
          {activeTrials.length > 0 ? (
            <>
              {activeTrials.map(trial => (
                <div key={trial.nct_id} style={{ margin: '10px 0', padding: '10px', backgroundColor: '#4a5568', borderRadius: '4px' }}>
                  <p><strong>Title:</strong> {trial.official_title || 'No title'}</p>
                  <p><strong>NCT ID:</strong> {trial.nct_id || 'Not specified'}</p>
                  <p><strong>Status:</strong> {trial.overall_status || 'Not specified'}</p>
                  <p><strong>Location:</strong> {trial.location || 'Not specified'}</p>
                </div>
              ))}
              {hasMoreActiveTrials && (
                <button
                  onClick={loadMoreActiveTrials}
                  disabled={loading}
                  style={{ padding: '10px', backgroundColor: loading ? '#ccc' : '#facc15', border: 'none', borderRadius: '4px', color: 'black', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px' }}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              )}
            </>
          ) : (
            <p>No active trials found.</p>
          )}
        </div>

        {/* Featured Studies */}
        <div style={{ marginTop: '40px' }}>
          <h2>Featured Studies</h2>
          {featuredStudies.length > 0 ? (
            featuredStudies.map(study => (
              <div key={study.nct_id} style={{ margin: '10px 0', padding: '10px', backgroundColor: '#4a5568', borderRadius: '4px' }}>
                <p><strong>Title:</strong> {study.official_title || 'No title'}</p>
                <p><strong>NCT ID:</strong> {study.nct_id || 'Not specified'}</p>
                <p><strong>Status:</strong> {study.overall_status || 'Not specified'}</p>
                <p><strong>Location:</strong> {study.location || 'Not specified'}</p>
              </div>
            ))
          ) : (
            <p>No featured studies found.</p>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h2>Search Results</h2>
            {searchResults.map(result => (
              <div key={result.nct_id} style={{ margin: '10px 0', padding: '10px', backgroundColor: '#4a5568', borderRadius: '4px' }}>
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