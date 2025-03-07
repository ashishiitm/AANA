import { useState, useCallback } from 'react';
import siteMatchingService from '../services/siteMatchingService';

const useSiteMatching = (protocolData) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedSites, setSelectedSites] = useState([]);

  const findMatchingSites = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await siteMatchingService.getRecommendations(protocolData);
      setRecommendations(results);
      return results;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [protocolData]);

  const selectSite = useCallback((site) => {
    setSelectedSites(prev => {
      const exists = prev.some(s => s.doctor_id === site.doctor_id);
      if (exists) return prev;
      return [...prev, site];
    });
  }, []);

  const removeSite = useCallback((siteId) => {
    setSelectedSites(prev => prev.filter(site => site.doctor_id !== siteId));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSites([]);
  }, []);

  return {
    loading,
    error,
    recommendations,
    selectedSites,
    findMatchingSites,
    selectSite,
    removeSite,
    clearSelection
  };
};

export default useSiteMatching; 