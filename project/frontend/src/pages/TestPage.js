import React, { useState, useEffect } from 'react';
import { 
  fetchActiveTrials, 
  fetchFeaturedStudies, 
  fetchDatabaseStats,
  searchStudies,
  processNlpQuery
} from '../api';

const TestPage = () => {
  // State for Django API data
  const [activeTrials, setActiveTrials] = useState([]);
  const [featuredStudies, setFeaturedStudies] = useState([]);
  const [databaseStats, setDatabaseStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for Node.js API data
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchQuery, setSearchQuery] = useState({
    conditions: '',
    location: '',
    disease: '',
    eligibility: ''
  });
  
  // State for NLP processing
  const [nlpQuery, setNlpQuery] = useState('');
  const [nlpResults, setNlpResults] = useState(null);
  const [nlpLoading, setNlpLoading] = useState(false);
  const [nlpError, setNlpError] = useState(null);

  // Fetch data from Django API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [trialsData, studiesData, statsData] = await Promise.all([
          fetchActiveTrials(),
          fetchFeaturedStudies(),
          fetchDatabaseStats()
        ]);
        
        setActiveTrials(trialsData);
        setFeaturedStudies(studiesData);
        setDatabaseStats(statsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle search form submission (Node.js API)
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    try {
      const results = await searchStudies(searchQuery);
      setSearchResults(results);
      setSearchError(null);
    } catch (err) {
      console.error('Error searching studies:', err);
      setSearchError('Failed to search studies. Please try again later.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle NLP query submission (Node.js API)
  const handleNlpQuery = async (e) => {
    e.preventDefault();
    if (!nlpQuery.trim()) return;
    
    setNlpLoading(true);
    try {
      const results = await processNlpQuery(nlpQuery);
      setNlpResults(results);
      setNlpError(null);
    } catch (err) {
      console.error('Error processing NLP query:', err);
      setNlpError('Failed to process NLP query. Please try again later.');
      setNlpResults(null);
    } finally {
      setNlpLoading(false);
    }
  };

  // Handle search input changes
  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchQuery(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div>Loading statistics...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">API Integration Test Page</h1>
      
      {/* Debug Information */}
      <div className="bg-gray-100 p-4 mb-8 rounded">
        <h2 className="text-xl font-semibold mb-2">Debug Information</h2>
        <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
        <p><strong>Django API URL:</strong> {process.env.NODE_ENV === 'production' ? 'http://localhost:8000' : '[proxy]'}</p>
        <p><strong>Node.js API URL:</strong> {process.env.NODE_ENV === 'production' ? 'http://localhost:3001' : '/node-api'}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Django API Section */}
        <div className="border p-4 rounded">
          <h2 className="text-2xl font-bold mb-4">Django API Data</h2>
          
          {/* Active Trials */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Active Trials ({activeTrials.length})</h3>
            {activeTrials.length > 0 ? (
              <ul className="list-disc pl-5">
                {activeTrials.slice(0, 3).map((trial, index) => (
                  <li key={index} className="mb-2">
                    <p className="font-medium">{trial.title || trial.official_title}</p>
                    <p className="text-sm text-gray-600">{trial.status || trial.overall_status}</p>
                  </li>
                ))}
                {activeTrials.length > 3 && <li className="text-gray-500">...and {activeTrials.length - 3} more</li>}
              </ul>
            ) : (
              <p className="text-gray-600">No active trials found.</p>
            )}
          </div>
          
          {/* Featured Studies */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Featured Studies ({featuredStudies.length})</h3>
            {featuredStudies.length > 0 ? (
              <ul className="list-disc pl-5">
                {featuredStudies.slice(0, 3).map((study, index) => (
                  <li key={index} className="mb-2">
                    <p className="font-medium">{study.title}</p>
                    <p className="text-sm text-gray-600">{study.description?.substring(0, 100)}...</p>
                  </li>
                ))}
                {featuredStudies.length > 3 && <li className="text-gray-500">...and {featuredStudies.length - 3} more</li>}
              </ul>
            ) : (
              <p className="text-gray-600">No featured studies found.</p>
            )}
          </div>
          
          {/* Database Stats */}
          {databaseStats && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-semibold mb-2">Trial Statistics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Total Trials:</p>
                    <p className="text-2xl font-bold">{databaseStats.totalTrials || 0}</p>
                  </div>
                  <div>
                    <p className="font-medium">Active Trials:</p>
                    <p className="text-2xl font-bold">{databaseStats.activeTrials || 0}</p>
                  </div>
                  <div>
                    <p className="font-medium">Completed Trials:</p>
                    <p className="text-2xl font-bold">{databaseStats.completedTrials || 0}</p>
                  </div>
                  <div>
                    <p className="font-medium">Locations:</p>
                    <p className="text-2xl font-bold">{databaseStats.locations || 0}</p>
                  </div>
                  <div>
                    <p className="font-medium">Conditions:</p>
                    <p className="text-2xl font-bold">{databaseStats.conditions || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Node.js API Section */}
        <div className="border p-4 rounded">
          <h2 className="text-2xl font-bold mb-4">Node.js API Data</h2>
          
          {/* Search Form */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Search Studies</h3>
            <form onSubmit={handleSearch} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Conditions</label>
                <input
                  type="text"
                  name="conditions"
                  value={searchQuery.conditions}
                  onChange={handleSearchInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Diabetes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={searchQuery.location}
                  onChange={handleSearchInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., New York"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Disease</label>
                <input
                  type="text"
                  name="disease"
                  value={searchQuery.disease}
                  onChange={handleSearchInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Cancer"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={searchLoading}
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>
          
          {/* Search Results */}
          {searchError ? (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-6">
              <p>{searchError}</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Search Results ({searchResults.length})</h3>
              <ul className="list-disc pl-5">
                {searchResults.slice(0, 3).map((result, index) => (
                  <li key={index} className="mb-2">
                    <p className="font-medium">{result.official_title}</p>
                    <p className="text-sm text-gray-600">{result.brief_summary?.substring(0, 100)}...</p>
                    <p className="text-xs text-gray-500">Status: {result.overall_status}</p>
                  </li>
                ))}
                {searchResults.length > 3 && <li className="text-gray-500">...and {searchResults.length - 3} more</li>}
              </ul>
            </div>
          ) : null}
          
          {/* NLP Query Form */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">NLP Processing</h3>
            <form onSubmit={handleNlpQuery} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Natural Language Query</label>
                <textarea
                  value={nlpQuery}
                  onChange={(e) => setNlpQuery(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Find me clinical trials for diabetes in patients over 65 years old"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                disabled={nlpLoading || !nlpQuery.trim()}
              >
                {nlpLoading ? 'Processing...' : 'Process Query'}
              </button>
            </form>
          </div>
          
          {/* NLP Results */}
          {nlpError ? (
            <div className="bg-red-100 text-red-700 p-3 rounded">
              <p>{nlpError}</p>
            </div>
          ) : nlpResults ? (
            <div>
              <h3 className="text-xl font-semibold mb-2">NLP Results</h3>
              <pre className="bg-gray-100 p-3 rounded overflow-x-auto text-sm">
                {JSON.stringify(nlpResults, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TestPage; 