import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Service for managing protocols
 */
class ProtocolService {
  /**
   * Get all protocols with pagination and filtering
   */
  async getProtocols(params = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/protocols/`, {
        params,
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting protocols:', error);
      throw error;
    }
  }

  /**
   * Get a protocol by ID
   */
  async getProtocolById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/protocols/${id}/`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error getting protocol ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new protocol
   */
  async createProtocol(protocolData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/protocols/`, protocolData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating protocol:', error);
      throw error;
    }
  }

  /**
   * Update an existing protocol
   */
  async updateProtocol(id, protocolData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/protocols/${id}/`, protocolData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating protocol ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a protocol
   */
  async deleteProtocol(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/protocols/${id}/`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting protocol ${id}:`, error);
      throw error;
    }
  }

  /**
   * Check protocol compliance
   */
  async checkCompliance(id) {
    try {
      const response = await axios.post(`${API_BASE_URL}/protocols/${id}/compliance_check/`, {}, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error checking compliance for protocol ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find matching sites for a protocol
   */
  async findMatchingSites(id) {
    try {
      const response = await axios.post(`${API_BASE_URL}/protocols/${id}/site_matching/`, {}, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error finding matching sites for protocol ${id}:`, error);
      throw error;
    }
  }

  /**
   * Generate protocol PDF
   */
  async generateProtocolPDF(id) {
    try {
      const response = await axios.post(`${API_BASE_URL}/protocols/${id}/generate_pdf/`, {}, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error generating PDF for protocol ${id}:`, error);
      throw error;
    }
  }

  /**
   * Convert frontend form data to backend schema format
   */
  convertToBackendFormat(formData) {
    // Extract basic fields
    const {
      moleculeName,
      moleculeDescription,
      moleculeType,
      therapeuticArea,
      condition,
      studyObjective,
      company,
      templateUsed,
      protocolOutline,
      uncertaintyFlags,
      phase
    } = formData;

    // Create properly structured protocol document
    return {
      title: `${moleculeName} ${phase || ''} Protocol for ${condition}`,
      status: 'draft',
      molecule_name: moleculeName,
      molecule_description: moleculeDescription,
      molecule_type: moleculeType,
      phase: phase || 'Phase 1',
      therapeutic_area: therapeuticArea,
      condition: condition,
      objectives: [
        {
          type: 'primary',
          description: studyObjective
        }
      ],
      company,
      template_used: templateUsed,
      protocol_outline: protocolOutline,
      uncertainty_flags: uncertaintyFlags
    };
  }
}

export default new ProtocolService(); 