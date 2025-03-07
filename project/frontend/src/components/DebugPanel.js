import React from 'react';

function DebugPanel({ activeTrials, featuredStudies, currentTrials, currentTrialIndex, loading, error }) {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="mt-12 p-4 border border-gray-300 rounded-lg bg-gray-50">
      <h2 className="text-xl font-bold mb-4">Debug Information</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Active Trials State</h3>
        <p>Is Array: {Array.isArray(activeTrials) ? 'Yes' : 'No'}</p>
        <p>Length: {Array.isArray(activeTrials) ? activeTrials.length : 'N/A'}</p>
        <p>Current Index: {currentTrialIndex}</p>
        <p>Current Trials Length: {Array.isArray(currentTrials) ? currentTrials.length : 'N/A'}</p>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Error: {error ? error : 'None'}</p>
        <div className="mt-2">
          <h4 className="font-medium">Raw Data:</h4>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(activeTrials, null, 2)}
          </pre>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Featured Studies State</h3>
        <p>Is Array: {Array.isArray(featuredStudies) ? 'Yes' : 'No'}</p>
        <p>Length: {Array.isArray(featuredStudies) ? featuredStudies.length : 'N/A'}</p>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Error: {error ? error : 'None'}</p>
        <div className="mt-2">
          <h4 className="font-medium">Raw Data:</h4>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(featuredStudies, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default DebugPanel; 