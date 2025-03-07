/**
 * Site Selection Service
 * 
 * Provides AI-powered site and investigator recommendations based on protocol details,
 * disease prevalence data, and doctor qualifications from the database.
 */

import deepseekService from './deepseekService';

// Simulated API call to the backend that would query the doctors table
const queryDoctors = async (params) => {
  try {
    // In a real implementation, this would be a fetch to your backend API
    // For now, we're simulating the response
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock database with doctors data
    const mockDoctors = [
      {
        doctor_id: "e8f9a012-3456-7890-abcd-ef1234567890",
        first_name: "Sarah",
        last_name: "Johnson",
        primary_specialty_id: 5,
        specialty_description: "Medical Oncology",
        years_experience: 15,
        npi_number: "1234567890",
        email: "sarah.johnson@hospital.org",
        phone: "212-555-1234",
        license_state: "NY",
        license_number: "MD12345",
        degrees: [
          { degree_id: 1, name: "MD", institution: "Harvard Medical School", awarded_date: "2005-05-15" },
          { degree_id: 4, name: "PhD", institution: "Columbia University", awarded_date: "2008-06-20" }
        ],
        publications: 28,
        active_trials: 7,
        locations: [
          { city: "New York", state: "NY", zip: "10021", primary: true }
        ]
      },
      {
        doctor_id: "a1b2c3d4-5678-90ef-ghij-klmnopqrstuv",
        first_name: "Michael",
        last_name: "Chen",
        primary_specialty_id: 5,
        specialty_description: "Medical Oncology",
        years_experience: 12,
        npi_number: "0987654321",
        email: "michael.chen@medical.edu",
        phone: "650-555-4321",
        license_state: "CA",
        license_number: "CA54321",
        degrees: [
          { degree_id: 1, name: "MD", institution: "Stanford University", awarded_date: "2008-05-20" }
        ],
        publications: 15,
        active_trials: 5,
        locations: [
          { city: "San Francisco", state: "CA", zip: "94143", primary: true }
        ]
      },
      {
        doctor_id: "w1x2y3z4-5678-90ab-cdef-ghijklmnopqr",
        first_name: "Emily",
        last_name: "Rodriguez",
        primary_specialty_id: 13,
        specialty_description: "Neurology",
        years_experience: 10,
        npi_number: "2468013579",
        email: "emily.rodriguez@neuro.edu",
        phone: "512-555-7890",
        license_state: "TX",
        license_number: "TX98765",
        degrees: [
          { degree_id: 1, name: "MD", institution: "Baylor College of Medicine", awarded_date: "2010-05-15" },
          { degree_id: 3, name: "MS", institution: "UT Austin", awarded_date: "2008-05-20" }
        ],
        publications: 12,
        active_trials: 3,
        locations: [
          { city: "Austin", state: "TX", zip: "78712", primary: true }
        ]
      },
      {
        doctor_id: "s1t2u3v4-5678-90wx-yzab-cdefghijklmn",
        first_name: "Robert",
        last_name: "Williams",
        primary_specialty_id: 2,
        specialty_description: "Cardiology",
        years_experience: 18,
        npi_number: "1357924680",
        email: "robert.williams@heart.org",
        phone: "305-555-6789",
        license_state: "FL",
        license_number: "FL24680",
        degrees: [
          { degree_id: 1, name: "MD", institution: "University of Miami", awarded_date: "2002-05-15" }
        ],
        publications: 22,
        active_trials: 6,
        locations: [
          { city: "Miami", state: "FL", zip: "33136", primary: true }
        ]
      },
      {
        doctor_id: "m1n2o3p4-5678-90qr-stuv-wxyzabcdefgh",
        first_name: "Jennifer",
        last_name: "Taylor",
        primary_specialty_id: 5,
        specialty_description: "Medical Oncology",
        years_experience: 14,
        npi_number: "5678901234",
        email: "jennifer.taylor@cancer.org",
        phone: "713-555-2345",
        license_state: "TX",
        license_number: "TX54321",
        degrees: [
          { degree_id: 1, name: "MD", institution: "UT Southwestern", awarded_date: "2006-05-20" },
          { degree_id: 4, name: "PhD", institution: "MD Anderson", awarded_date: "2010-06-15" }
        ],
        publications: 19,
        active_trials: 8,
        locations: [
          { city: "Houston", state: "TX", zip: "77030", primary: true }
        ]
      }
    ];
    
    // Filter the doctors based on the parameters
    let filteredDoctors = [...mockDoctors];
    
    if (params.specialty) {
      filteredDoctors = filteredDoctors.filter(doctor => 
        doctor.specialty_description.toLowerCase().includes(params.specialty.toLowerCase())
      );
    }
    
    if (params.states && params.states.length) {
      filteredDoctors = filteredDoctors.filter(doctor => 
        params.states.includes(doctor.license_state)
      );
    }
    
    if (params.minExperience) {
      filteredDoctors = filteredDoctors.filter(doctor => 
        doctor.years_experience >= params.minExperience
      );
    }
    
    if (params.minPublications) {
      filteredDoctors = filteredDoctors.filter(doctor => 
        doctor.publications >= params.minPublications
      );
    }
    
    return {
      doctors: filteredDoctors,
      totalCount: filteredDoctors.length
    };
  } catch (error) {
    console.error('Error querying doctors:', error);
    throw error;
  }
};

/**
 * Get disease prevalence data by location
 * @param {string} condition - The disease/condition being studied
 * @returns {Promise<Object>} Prevalence data by state
 */
const getDiseasePrevalenceByLocation = async (condition) => {
  try {
    // In a real implementation, this would query a database or API with disease prevalence data
    // For now, we'll use simulated data
    
    // Map of conditions to prevalence by state
    const prevalenceMap = {
      "breast cancer": {
        "CA": { prevalence: 132.5, rank: 1 },
        "NY": { prevalence: 129.2, rank: 2 },
        "TX": { prevalence: 111.7, rank: 3 },
        "FL": { prevalence: 117.3, rank: 4 },
        "PA": { prevalence: 129.0, rank: 5 }
      },
      "lung cancer": {
        "KY": { prevalence: 93.5, rank: 1 },
        "MS": { prevalence: 81.5, rank: 2 },
        "WV": { prevalence: 79.2, rank: 3 },
        "AR": { prevalence: 77.6, rank: 4 },
        "TN": { prevalence: 75.8, rank: 5 }
      },
      "alzheimer": {
        "FL": { prevalence: 14.1, rank: 1 },
        "CA": { prevalence: 12.2, rank: 2 },
        "TX": { prevalence: 9.8, rank: 3 },
        "NY": { prevalence: 8.5, rank: 4 },
        "PA": { prevalence: 6.9, rank: 5 }
      },
      "diabetes": {
        "MS": { prevalence: 14.8, rank: 1 },
        "WV": { prevalence: 14.5, rank: 2 },
        "AL": { prevalence: 14.1, rank: 3 },
        "LA": { prevalence: 13.9, rank: 4 },
        "AR": { prevalence: 13.7, rank: 5 }
      },
      "heart disease": {
        "MS": { prevalence: 223.2, rank: 1 },
        "OK": { prevalence: 220.4, rank: 2 },
        "AL": { prevalence: 217.5, rank: 3 },
        "AR": { prevalence: 213.6, rank: 4 },
        "LA": { prevalence: 211.8, rank: 5 }
      }
    };
    
    // Find the closest matching condition
    let matchedCondition = null;
    let bestMatchScore = 0;
    
    if (condition) {
      const lowerCondition = condition.toLowerCase();
      
      for (const key of Object.keys(prevalenceMap)) {
        if (lowerCondition.includes(key) || key.includes(lowerCondition)) {
          // Simple matching score based on string length
          const matchScore = key.length;
          if (matchScore > bestMatchScore) {
            bestMatchScore = matchScore;
            matchedCondition = key;
          }
        }
      }
    }
    
    if (matchedCondition) {
      return {
        condition: matchedCondition,
        prevalenceByState: prevalenceMap[matchedCondition]
      };
    }
    
    // Default response if no matching condition is found
    return {
      condition: condition || "unknown",
      prevalenceByState: {
        "CA": { prevalence: 100, rank: 1 },
        "NY": { prevalence: 90, rank: 2 },
        "TX": { prevalence: 80, rank: 3 },
        "FL": { prevalence: 70, rank: 4 },
        "IL": { prevalence: 60, rank: 5 }
      }
    };
  } catch (error) {
    console.error('Error getting disease prevalence:', error);
    throw error;
  }
};

/**
 * Get AI-powered site and investigator recommendations based on protocol details
 * @param {Object} protocolData - The protocol data
 * @returns {Promise<Object>} Recommended sites and investigators
 */
export const getRecommendations = async (protocolData) => {
  try {
    const { trial_basics, study_design } = protocolData;
    const condition = trial_basics?.condition || '';
    const therapeuticArea = trial_basics?.therapeuticArea || '';
    
    // Get disease prevalence data
    const prevalenceData = await getDiseasePrevalenceByLocation(condition);
    
    // Get top states by prevalence
    const topStates = Object.entries(prevalenceData.prevalenceByState)
      .sort((a, b) => a[1].rank - b[1].rank)
      .slice(0, 5)
      .map(entry => entry[0]);
    
    // Map therapeutic area to specialty
    const specialtyMap = {
      'Oncology': 'Oncology',
      'Cardiology': 'Cardiology',
      'Neurology': 'Neurology',
      'Immunology': 'Immunology',
      'Pulmonology': 'Pulmonology',
      'Gastroenterology': 'Gastroenterology',
      'Endocrinology': 'Endocrinology'
      // Add more mappings as needed
    };
    
    const specialty = specialtyMap[therapeuticArea] || '';
    
    // Query for suitable doctors
    const doctorsResult = await queryDoctors({
      specialty,
      states: topStates,
      minExperience: 10,
      minPublications: 5
    });
    
    // Get site selection recommendations from AI
    let aiRecommendations = {};
    
    try {
      // Use DeepSeek AI to get additional insights
      const aiPrompt = `
Based on this clinical trial protocol information, provide site selection recommendations:

Condition: ${condition}
Therapeutic Area: ${therapeuticArea}
Phase: ${trial_basics?.phase || ''}
Population: Adults aged ${study_design?.population?.ageRange?.[0] || 18} to ${study_design?.population?.ageRange?.[1] || 65}

Format your response as JSON with the following structure:
{
  "recommendedStates": ["List of 3-5 US states with high prevalence of condition"],
  "patientRecruitmentEstimate": "Estimate of recruitment rate per site per month",
  "investigatorCriteria": {
    "specialtyFocus": "Ideal specialty focus",
    "minYearsExperience": number,
    "recommendedQualifications": ["List of ideal qualifications"]
  },
  "siteCriteria": ["List of important site characteristics"]
}

Response should be fact-based and specific to this therapeutic area and condition.
`;

      const aiResponse = await deepseekService.callDeepSeekAPI(aiPrompt, { temperature: 0.2 });
      
      // Extract JSON from response
      let jsonStr = aiResponse;
      if (aiResponse.includes('{') && aiResponse.includes('}')) {
        jsonStr = aiResponse.substring(aiResponse.indexOf('{'), aiResponse.lastIndexOf('}') + 1);
      }
      
      aiRecommendations = JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      // Provide default AI recommendations if AI call fails
      aiRecommendations = {
        recommendedStates: topStates,
        patientRecruitmentEstimate: "3-5 patients per site per month",
        investigatorCriteria: {
          specialtyFocus: therapeuticArea,
          minYearsExperience: 10,
          recommendedQualifications: ["MD", "Previous trial experience", "Publications in relevant field"]
        },
        siteCriteria: [
          "Access to relevant patient population",
          "Experience with similar trials",
          "Adequate facilities and staff",
          "History of good regulatory compliance"
        ]
      };
    }
    
    // Combine data sources for final recommendations
    return {
      condition: prevalenceData.condition,
      prevalenceData: prevalenceData.prevalenceByState,
      topStates,
      recommendedDoctors: doctorsResult.doctors,
      totalDoctors: doctorsResult.totalCount,
      aiRecommendations
    };
  } catch (error) {
    console.error('Error getting site recommendations:', error);
    throw error;
  }
};

export default {
  getRecommendations,
  getDiseasePrevalenceByLocation,
  queryDoctors
}; 