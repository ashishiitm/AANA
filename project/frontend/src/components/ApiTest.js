import React, { useState, useEffect } from 'react';
import { fetchActiveTrials, fetchFeaturedStudies } from '../api';

function ApiTest() {
  const [activeTrials, setActiveTrials] = useState([]);
  const [featuredStudies, setFeaturedStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testApis = async () => {
      try {
        setLoading(true);
        
        // Test active trials API
        console.log('Testing fetchActiveTrials...');
        const activeTrialsData = await fetchActiveTrials();
        console.log('Active Trials Data:', activeTrialsData);
        setActiveTrials(Array.isArray(activeTrialsData) ? activeTrialsData : []);
        
        // Test featured studies API
        console.log('Testing fetchFeaturedStudies...');
        const featuredStudiesData = await fetchFeaturedStudies();
        console.log('Featured Studies Data:', featuredStudiesData);
        setFeaturedStudies(Array.isArray(featuredStudiesData) ? featuredStudiesData : []);
        
        setError(null);
      } catch (err) {
        console.error('Error testing APIs:', err);
        setError('Failed to test APIs. Please check console for details.');
      } finally {
        setLoading(false);
      }
    };
    
    testApis();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Test Component</h1>
      
      {loading && <p className="text-gray-600">Loading API data...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Active Trials</h2>
        <p className="mb-2">Count: {activeTrials.length}</p>
        
        {activeTrials.length > 0 ? (
          <div className="bg-white shadow overflow-hidden rounded-md">
            <ul className="divide-y divide-gray-200">
              {activeTrials.map((trial, index) => (
                <li key={trial.nct_id || trial.id || index} className="px-6 py-4">
                  <p className="font-medium">{trial.title || trial.official_title || 'No Title'}</p>
                  <p className="text-sm text-gray-600">ID: {trial.nct_id || trial.id || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">Status: {trial.status || trial.overall_status || 'Unknown'}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-600">No active trials found.</p>
        )}
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Featured Studies</h2>
        <p className="mb-2">Count: {featuredStudies.length}</p>
        
        {featuredStudies.length > 0 ? (
          <div className="bg-white shadow overflow-hidden rounded-md">
            <ul className="divide-y divide-gray-200">
              {featuredStudies.map((study, index) => (
                <li key={study.nct_id || study.id || index} className="px-6 py-4">
                  <p className="font-medium">{study.title || study.official_title || study.brief_title || 'No Title'}</p>
                  <p className="text-sm text-gray-600">ID: {study.nct_id || study.id || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">Status: {study.status || study.overall_status || 'Unknown'}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-600">No featured studies found.</p>
        )}
      </div>
    </div>
  );
}

export default ApiTest; 