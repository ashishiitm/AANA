import React, { useState, useEffect } from 'react';
import { fetchDatabaseStats } from '../api';
import { FaDatabase, FaFlask, FaCheckCircle, FaMapMarkerAlt, FaListUl } from 'react-icons/fa';

const DatabaseStats = () => {
  const [stats, setStats] = useState({
    totalTrials: 0,
    activeTrials: 0,
    completedTrials: 0,
    locations: 0,
    conditions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getStats = async () => {
      try {
        setLoading(true);
        const data = await fetchDatabaseStats();
        
        // Map the API response to our expected format
        const mappedData = {
          totalTrials: data.total_studies || data.totalTrials || 0,
          activeTrials: data.active_studies || data.activeTrials || 0,
          completedTrials: data.completed_studies || data.completedTrials || 0,
          recruitingTrials: data.recruiting_studies || data.recruitingTrials || 0,
          locations: data.locations || 0,
          conditions: data.conditions || 0
        };
        
        setStats(mappedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching database stats:', err);
        setError('Failed to load database statistics');
      } finally {
        setLoading(false);
      }
    };

    getStats();
  }, []);

  // Helper function to safely format numbers
  const formatNumber = (num) => {
    return num !== undefined && num !== null ? num.toLocaleString() : '0';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 rounded-lg mb-8 animate-pulse">
        <div className="h-12 bg-blue-400 rounded w-full"></div>
      </div>
    );
  }

  if (error) {
    return null; // Don't show anything if there's an error
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-lg mb-8 shadow-md">
      <h2 className="text-xl font-bold mb-4">Clinical Trials Database</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
        <div className="p-3 bg-blue-600 bg-opacity-30 rounded-lg">
          <FaDatabase className="inline-block mb-2 text-2xl" />
          <h3 className="text-2xl font-bold">{formatNumber(stats.totalTrials)}</h3>
          <p className="text-sm">Total Trials</p>
        </div>
        
        <div className="p-3 bg-blue-600 bg-opacity-30 rounded-lg">
          <FaFlask className="inline-block mb-2 text-2xl" />
          <h3 className="text-2xl font-bold">{formatNumber(stats.activeTrials)}</h3>
          <p className="text-sm">Active Trials</p>
        </div>
        
        <div className="p-3 bg-blue-600 bg-opacity-30 rounded-lg">
          <FaCheckCircle className="inline-block mb-2 text-2xl" />
          <h3 className="text-2xl font-bold">{formatNumber(stats.completedTrials)}</h3>
          <p className="text-sm">Completed Trials</p>
        </div>
        
        <div className="p-3 bg-blue-600 bg-opacity-30 rounded-lg">
          <FaMapMarkerAlt className="inline-block mb-2 text-2xl" />
          <h3 className="text-2xl font-bold">{formatNumber(stats.recruitingTrials)}</h3>
          <p className="text-sm">Recruiting Trials</p>
        </div>
        
        <div className="p-3 bg-blue-600 bg-opacity-30 rounded-lg">
          <FaListUl className="inline-block mb-2 text-2xl" />
          <h3 className="text-2xl font-bold">{formatNumber(stats.conditions)}</h3>
          <p className="text-sm">Conditions</p>
        </div>
      </div>
    </div>
  );
};

export default DatabaseStats; 