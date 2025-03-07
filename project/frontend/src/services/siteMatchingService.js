import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Service for AI-powered site matching and recommendations
 */
class SiteMatchingService {
  /**
   * Get site recommendations based on protocol criteria
   */
  async getRecommendations(protocolData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/sites/match`, {
        protocol: protocolData
      });
      return response.data;
    } catch (error) {
      console.error('Error getting site recommendations:', error);
      throw error;
    }
  }

  /**
   * Get disease prevalence data by location
   */
  async getDiseasePrevalence(condition, region = 'US') {
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/prevalence`, {
        params: { condition, region }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting disease prevalence:', error);
      throw error;
    }
  }

  /**
   * Get investigator performance metrics
   */
  async getInvestigatorMetrics(investigatorIds) {
    try {
      const response = await axios.post(`${API_BASE_URL}/investigators/metrics`, {
        investigatorIds
      });
      return response.data;
    } catch (error) {
      console.error('Error getting investigator metrics:', error);
      throw error;
    }
  }

  /**
   * Predict recruitment potential for selected sites
   */
  async predictRecruitment(sites, protocolCriteria) {
    try {
      const response = await axios.post(`${API_BASE_URL}/sites/recruitment-prediction`, {
        sites,
        criteria: protocolCriteria
      });
      return response.data;
    } catch (error) {
      console.error('Error predicting recruitment:', error);
      throw error;
    }
  }

  /**
   * Get site compatibility scores
   */
  async getSiteCompatibility(protocolData, siteIds) {
    try {
      const response = await axios.post(`${API_BASE_URL}/sites/compatibility`, {
        protocol: protocolData,
        siteIds
      });
      return response.data;
    } catch (error) {
      console.error('Error getting site compatibility:', error);
      throw error;
    }
  }
}

export default new SiteMatchingService(); 