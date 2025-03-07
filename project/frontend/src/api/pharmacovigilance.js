import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Fetch all search rules
export const fetchSearchRules = async () => {
  try {
    const response = await api.get('/api/pv/search-rules/');
    return response.data;
  } catch (error) {
    console.error('Error fetching search rules:', error);
    throw error;
  }
};

// Create a new search rule
export const createSearchRule = async (ruleData) => {
  try {
    const response = await api.post('/api/pv/search-rules/', ruleData);
    return response.data;
  } catch (error) {
    console.error('Error creating search rule:', error);
    throw error;
  }
};

// Update an existing search rule
export const updateSearchRule = async (ruleId, ruleData) => {
  try {
    const response = await api.put(`/api/pv/search-rules/${ruleId}/`, ruleData);
    return response.data;
  } catch (error) {
    console.error('Error updating search rule:', error);
    throw error;
  }
};

// Delete a search rule
export const deleteSearchRule = async (ruleId) => {
  try {
    await api.delete(`/api/pv/search-rules/${ruleId}/`);
    return true;
  } catch (error) {
    console.error('Error deleting search rule:', error);
    throw error;
  }
};

// Run a search rule manually
export const runSearchRule = async (ruleId) => {
  try {
    const response = await api.post(`/api/pv/search-rules/${ruleId}/run_search/`);
    return response.data;
  } catch (error) {
    console.error('Error running search rule:', error);
    throw error;
  }
};

// Fetch adverse event terms by category
export const fetchAdverseEventTermsByCategory = async () => {
  try {
    const response = await api.get('/api/pv/adverse-event-terms/by_category/');
    return response.data;
  } catch (error) {
    console.error('Error fetching adverse event terms:', error);
    throw error;
  }
};

// Fetch search results for a rule
export const fetchSearchResults = async (ruleId, params = {}) => {
  try {
    const response = await api.get(`/api/pv/search-rules/${ruleId}/get_results/`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
};

// Mark a search result as reviewed
export const markSearchResultReviewed = async (resultId, notes = '') => {
  try {
    const response = await api.post(`/api/pv/search-results/${resultId}/mark_reviewed/`, { notes });
    return response.data;
  } catch (error) {
    console.error('Error marking search result as reviewed:', error);
    throw error;
  }
}; 