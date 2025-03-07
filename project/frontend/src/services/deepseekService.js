/**
 * DeepSeek AI Service
 * 
 * Handles integration with the DeepSeek AI API for protocol generation and recommendations.
 * This service provides the real AI power behind the aiProtocolService, replacing mock data
 * with actual AI-generated content.
 */

// Add imports for mock service
import * as mockDeepSeekService from './mockDeepSeekService';

// API configuration - will be populated with key from environment or direct setting
let API_CONFIG = {
  apiKey: process.env.REACT_APP_DEEPSEEK_API_KEY || '',
  apiUrl: process.env.REACT_APP_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
  modelId: 'deepseek-chat'
};

// Add flag to control fallback behavior
let USE_MOCK_FALLBACK = false;
let API_CONNECTION_VERIFIED = false;

/**
 * Set the API key for DeepSeek API
 * @param {string} apiKey - The API key for authentication
 */
export const setApiKey = (apiKey) => {
  API_CONFIG.apiKey = apiKey;
  console.log('DeepSeek API key set successfully');
};

/**
 * Set whether to use mock fallback when API fails
 * @param {boolean} useMock - Whether to use mock fallback
 */
export const setUseMockFallback = (useMock) => {
  USE_MOCK_FALLBACK = useMock;
  console.log(`Mock fallback ${useMock ? 'enabled' : 'disabled'}`);
};

/**
 * Set if the API connection has been verified
 * @param {boolean} verified - Whether the API connection is verified
 */
export const setApiConnectionVerified = (verified) => {
  API_CONNECTION_VERIFIED = verified;
  console.log(`API connection ${verified ? 'verified' : 'unverified'}`);
};

/**
 * General purpose function to make requests to the DeepSeek API
 * @param {string} prompt - The prompt to send to the model
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Object>} The AI response
 */
export const callDeepSeekAPI = async (prompt, options = {}) => {
  // Skip API call and use mock service if we know API isn't working
  if (!API_CONNECTION_VERIFIED && USE_MOCK_FALLBACK) {
    console.warn('Using mock DeepSeek service as API connection is not verified');
    return mockDeepSeekService.callDeepSeekAPI(prompt, options);
  }
  
  if (!API_CONFIG.apiKey) {
    console.error('DeepSeek API key not set');
    
    if (USE_MOCK_FALLBACK) {
      console.warn('Using mock DeepSeek service due to missing API key');
      return mockDeepSeekService.callDeepSeekAPI(prompt, options);
    }
    
    throw new Error('API key not configured. Please set the API key first.');
  }

  const defaultOptions = {
    temperature: 0.7,
    max_tokens: 3000,
    top_p: 0.95,
    stream: false
  };

  const apiUrl = API_CONFIG.apiUrl;
  const endpoint = `${apiUrl}/chat/completions`;
  
  console.log(`Calling DeepSeek API at: ${endpoint}`);
  console.log(`API key prefix: ${API_CONFIG.apiKey.substring(0, 5)}...`);
  
  try {
    const requestBody = {
      model: API_CONFIG.modelId,
      messages: [
        { role: 'system', content: 'You are an expert in clinical trial protocol design with deep knowledge of ICH, FDA, and EMA guidelines. Your task is to help generate high-quality, regulatory-compliant protocol content.' },
        { role: 'user', content: prompt }
      ],
      ...defaultOptions,
      ...options
    };
    
    console.log('Request payload:', JSON.stringify(requestBody).substring(0, 200) + '...');
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    // Enhanced error handling with detailed response information
    if (!response.ok) {
      const statusText = response.statusText;
      let errorMessage = `API Error: ${statusText} (${response.status})`;
      
      try {
        const errorData = await response.json();
        console.error('DeepSeek API error response:', errorData);
        errorMessage = `API Error: ${errorData.error?.message || statusText} (${response.status})`;
      } catch (jsonError) {
        console.error('Failed to parse error response:', jsonError);
        // If we can't parse the JSON, try to get the text
        const errorText = await response.text();
        errorMessage = `API Error: ${errorText || statusText} (${response.status})`;
      }
      
      if (USE_MOCK_FALLBACK) {
        console.warn('Using mock DeepSeek service due to API error:', errorMessage);
        return mockDeepSeekService.callDeepSeekAPI(prompt, options);
      }
      
      throw new Error(errorMessage);
    }

    // Parse successful response
    const data = await response.json();
    console.log('API Response structure:', Object.keys(data));
    
    if (!data.choices || data.choices.length === 0) {
      if (USE_MOCK_FALLBACK) {
        console.warn('Using mock DeepSeek service due to missing response data');
        return mockDeepSeekService.callDeepSeekAPI(prompt, options);
      }
      throw new Error('API response missing expected data structure');
    }
    
    // API call was successful
    setApiConnectionVerified(true);
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    
    // Enhanced error reporting
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      const networkErrorMsg = `Network error: Unable to connect to DeepSeek API. Please check your internet connection and API endpoint (${apiUrl}).`;
      
      if (USE_MOCK_FALLBACK) {
        console.warn('Using mock DeepSeek service due to network error');
        return mockDeepSeekService.callDeepSeekAPI(prompt, options);
      }
      
      throw new Error(networkErrorMsg);
    }
    
    if (USE_MOCK_FALLBACK) {
      console.warn('Using mock DeepSeek service due to error:', error.message);
      return mockDeepSeekService.callDeepSeekAPI(prompt, options);
    }
    
    throw error;
  }
};

/**
 * Generate regulatory-compliant protocol template based on basic trial information
 * @param {Object} trialInfo - Basic trial information (therapeutic area, phase, condition, drug)
 * @returns {Promise<Object>} Complete protocol data structure
 */
export const generateProtocolTemplate = async (trialInfo) => {
  const { therapeuticArea, phase, condition, drugName } = trialInfo;
  
  const systemPrompt = `
You are an expert in designing clinical trial protocols with deep knowledge of ICH, FDA, and EMA guidelines.
Create a comprehensive protocol template for a clinical trial with the following characteristics:
- Therapeutic Area: ${therapeuticArea || 'Not specified'}
- Phase: ${phase || 'Not specified'}
- Condition: ${condition || 'Not specified'}
- Drug Name: ${drugName || 'Not specified'}

Generate a detailed, structured protocol that includes appropriate elements based on this information.
Ensure all content is evidence-based and follows current regulatory guidelines.
Format your response as a JSON object with the following structure:
{
  "trial_basics": {
    "phase": "${phase}",
    "therapeuticArea": "${therapeuticArea}",
    "condition": "${condition}",
    "drugName": "${drugName}",
    "objective": "Primary objective goes here"
  },
  "study_design": {
    "type": ["list", "of", "design", "types"],
    "population": {
      "ageRange": [min_age, max_age],
      "inclusion": ["criterion 1", "criterion 2", ...],
      "exclusion": ["criterion 1", "criterion 2", ...]
    },
    "intervention": {
      "dosage": "Dosage details",
      "frequency": "frequency_value",
      "route": "route_value"
    },
    "comparator": "comparator_type"
  },
  "endpoints": {
    "primaryEndpoints": [
      {
        "description": "Endpoint description",
        "type": "endpoint_type",
        "timeframe": "Timeframe details"
      }
    ],
    "secondaryEndpoints": [
      {
        "description": "Endpoint description",
        "type": "endpoint_type",
        "timeframe": "Timeframe details"
      }
    ],
    "assessments": [
      {
        "name": "Assessment name",
        "type": "assessment_type",
        "frequency": "frequency_details"
      }
    ]
  },
  "team_assignment": {
    "teamMembers": []
  }
}

Provide only the JSON response without any additional text or explanation.
`;

  try {
    const result = await callDeepSeekAPI(systemPrompt, {
      temperature: 0.2, // Lower temperature for more consistent, deterministic results
      max_tokens: 4000 // Increased token limit for larger protocols
    });
    
    // Parse the JSON from the response
    // Handle case where result might contain markdown code blocks
    let jsonStr = result;
    if (result.includes('```json')) {
      jsonStr = result.split('```json')[1].split('```')[0].trim();
    } else if (result.includes('```')) {
      jsonStr = result.split('```')[1].split('```')[0].trim();
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error generating protocol template:', error);
    throw new Error('Failed to generate protocol template. Please try again later.');
  }
};

/**
 * Suggest therapeutic areas based on condition text
 * @param {string} conditionText - The condition being studied
 * @returns {Promise<Array>} Suggested therapeutic areas
 */
export const suggestTherapeuticAreas = async (conditionText) => {
  if (!conditionText || conditionText.trim().length < 3) {
    return [];
  }
  
  const prompt = `
Given this medical condition or disease: "${conditionText}"
What are the most appropriate therapeutic areas for clinical trials studying this condition?
Provide 1-3 of the most relevant therapeutic areas from the following list:
Oncology, Cardiology, Neurology, Immunology, Pulmonology, Gastroenterology, Endocrinology, 
Infectious Disease, Rheumatology, Dermatology, Hematology, Nephrology, Urology, Ophthalmology, 
Psychiatry, Pain Management, or Rare Diseases.

Format your response as a JSON array with ONLY the names of the therapeutic areas:
["Area1", "Area2", ...]

Provide ONLY the JSON array without any other text.
`;

  try {
    const result = await callDeepSeekAPI(prompt, { temperature: 0.3 });
    
    // Extract JSON array from response
    let jsonStr = result;
    if (result.includes('[') && result.includes(']')) {
      jsonStr = result.substring(result.indexOf('['), result.lastIndexOf(']') + 1);
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error suggesting therapeutic areas:', error);
    return []; // Return empty array on error to prevent UI from breaking
  }
};

/**
 * Suggest inclusion/exclusion criteria based on therapeutic area and condition
 * @param {string} therapeuticArea - The therapeutic area
 * @param {string} condition - The condition being studied
 * @param {string} phase - The trial phase
 * @returns {Promise<Object>} Suggested criteria
 */
export const suggestCriteria = async (therapeuticArea, condition, phase) => {
  if (!therapeuticArea || !condition) {
    return { inclusion: [], exclusion: [] };
  }
  
  const prompt = `
Generate appropriate inclusion and exclusion criteria for a ${phase || ''} clinical trial in ${therapeuticArea} 
studying ${condition || 'the specified condition'}.

The criteria should be realistic, specific, and follow current regulatory guidelines. 
Include both standard criteria for this type of trial and condition-specific criteria.

Format your response as a JSON object with the following structure:
{
  "inclusion": [
    "Criterion 1",
    "Criterion 2",
    ...
  ],
  "exclusion": [
    "Criterion 1",
    "Criterion 2",
    ...
  ]
}

Provide ONLY the JSON object without any additional text.
`;

  try {
    const result = await callDeepSeekAPI(prompt, { temperature: 0.4 });
    
    // Parse JSON from response
    let jsonStr = result;
    if (result.includes('{') && result.includes('}')) {
      jsonStr = result.substring(result.indexOf('{'), result.lastIndexOf('}') + 1);
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error suggesting criteria:', error);
    return { inclusion: [], exclusion: [] };
  }
};

/**
 * Suggest endpoints and assessments based on trial information
 * @param {string} therapeuticArea - The therapeutic area
 * @param {string} phase - The trial phase
 * @param {string} condition - The condition being studied
 * @returns {Promise<Object>} Suggested endpoints and assessments
 */
export const suggestEndpoints = async (therapeuticArea, phase, condition) => {
  if (!therapeuticArea || !phase) {
    return { primary: [], secondary: [], assessments: [] };
  }
  
  const prompt = `
Generate appropriate primary endpoints, secondary endpoints, and assessments for a ${phase} clinical trial 
in ${therapeuticArea} studying ${condition || 'the specified condition'}.

The endpoints should be specific, measurable, and appropriate for the phase and therapeutic area.
Include both standard endpoints for this type of trial and condition-specific endpoints.

Format your response as a JSON object with the following structure:
{
  "primary": [
    {
      "description": "Detailed description of the endpoint",
      "type": "efficacy or safety or pharmacokinetic or pharmacodynamic or biomarker or quality_of_life",
      "timeframe": "When the endpoint will be measured"
    },
    ...
  ],
  "secondary": [
    {
      "description": "Detailed description of the endpoint",
      "type": "efficacy or safety or pharmacokinetic or pharmacodynamic or biomarker or quality_of_life",
      "timeframe": "When the endpoint will be measured"
    },
    ...
  ],
  "assessments": [
    {
      "name": "Name of the assessment",
      "type": "clinical_exam or laboratory_test or imaging or questionnaire or patient_reported or physical_performance",
      "frequency": "How often the assessment will be performed"
    },
    ...
  ]
}

Provide ONLY the JSON object without any additional text.
`;

  try {
    const result = await callDeepSeekAPI(prompt, { 
      temperature: 0.4,
      max_tokens: 3500 // Increased for detailed endpoints
    });
    
    // Parse JSON from response
    let jsonStr = result;
    if (result.includes('{') && result.includes('}')) {
      jsonStr = result.substring(result.indexOf('{'), result.lastIndexOf('}') + 1);
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error suggesting endpoints:', error);
    return { primary: [], secondary: [], assessments: [] };
  }
};

/**
 * Check protocol compliance with regulatory guidelines
 * @param {Object} protocol - The complete protocol
 * @returns {Promise<Array>} Compliance issues and recommendations
 */
export const checkCompliance = async (protocol) => {
  const prompt = `
Evaluate this clinical trial protocol for compliance with ICH, FDA, and EMA guidelines.
Identify potential issues, gaps, or recommendations for improvement.

Protocol JSON:
${JSON.stringify(protocol, null, 2)}

Format your response as a JSON array of issues with the following structure:
[
  {
    "severity": "error or warning or info",
    "message": "Description of the issue",
    "section": "The protocol section with the issue",
    "recommendation": "Recommendation to address the issue"
  },
  ...
]

Consider all applicable regulatory requirements and best practices.
Focus on critical issues that could impact approval or patient safety.
Provide actionable recommendations to address each issue.

Provide ONLY the JSON array without any additional text.
`;

  try {
    const result = await callDeepSeekAPI(prompt, {
      temperature: 0.3,
      max_tokens: 3500
    });
    
    // Parse JSON from response
    let jsonStr = result;
    if (result.includes('[') && result.includes(']')) {
      jsonStr = result.substring(result.indexOf('['), result.lastIndexOf(']') + 1);
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error checking compliance:', error);
    // Return basic compliance checks in case of API failure
    return [
      {
        severity: 'info',
        message: 'Unable to perform complete compliance check. Basic checks follow.',
        section: 'general',
        recommendation: 'Review manually against ICH E6(R2) guidelines.'
      },
      {
        severity: 'warning',
        message: 'Ensure all required sections are included in the protocol.',
        section: 'general',
        recommendation: 'Check against ICH E6(R2) section 6.'
      }
    ];
  }
};

/**
 * Analyze drug composition to identify potential safety concerns
 * @param {string} drugDetails - Details about the drug composition
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeDrugComposition = async (drugDetails) => {
  if (!drugDetails || drugDetails.trim().length < 10) {
    return { safetyProfile: 'Not enough drug information provided for analysis.' };
  }
  
  const prompt = `
Analyze the following drug composition and provide safety information relevant for clinical trial protocol design:

Drug Details: ${drugDetails}

Consider:
1. Known mechanism of action
2. Potential contraindications
3. Special populations that should be excluded
4. Relevant drug interactions
5. Monitoring recommendations

Format your response as a JSON object with the following structure:
{
  "safetyProfile": "Brief overview of the safety profile",
  "contraindications": ["Contraindication 1", "Contraindication 2", ...],
  "specialPopulations": ["Population 1", "Population 2", ...],
  "potentialInteractions": ["Interaction 1", "Interaction 2", ...],
  "monitoringRecommendations": ["Recommendation 1", "Recommendation 2", ...]
}

Provide only factual information that would be relevant for protocol design.
Provide ONLY the JSON object without any additional text.
`;

  try {
    const result = await callDeepSeekAPI(prompt, { temperature: 0.3 });
    
    // Parse JSON from response
    let jsonStr = result;
    if (result.includes('{') && result.includes('}')) {
      jsonStr = result.substring(result.indexOf('{'), result.lastIndexOf('}') + 1);
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error analyzing drug composition:', error);
    return { 
      safetyProfile: 'Analysis could not be completed. Please review drug information manually.',
      contraindications: [],
      specialPopulations: [],
      potentialInteractions: [],
      monitoringRecommendations: []
    };
  }
};

/**
 * Translate protocol to a different language
 * @param {Object} protocol - The protocol to translate
 * @param {string} targetLanguage - The target language code
 * @returns {Promise<Object>} Translated protocol
 */
export const translateProtocol = async (protocol, targetLanguage) => {
  if (!protocol || !targetLanguage) {
    throw new Error('Protocol and target language are required');
  }
  
  const prompt = `
Translate the following clinical trial protocol to ${targetLanguage}.
Maintain all technical terminology correctly according to standard medical terminology in the target language.
Ensure formatting and structure remain intact.

Protocol JSON:
${JSON.stringify(protocol, null, 2)}

Translate ALL text fields but DO NOT translate field names or structural elements.
Return the complete translated protocol in the same JSON structure.

Provide ONLY the JSON object without any additional text.
`;

  try {
    const result = await callDeepSeekAPI(prompt, {
      temperature: 0.2,
      max_tokens: 4500 // Increased for full protocol translation
    });
    
    // Parse JSON from response
    let jsonStr = result;
    if (result.includes('{') && result.includes('}')) {
      jsonStr = result.substring(result.indexOf('{'), result.lastIndexOf('}') + 1);
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error translating protocol:', error);
    throw new Error(`Translation to ${targetLanguage} failed. Please try again later.`);
  }
};

export default {
  setApiKey,
  generateProtocolTemplate,
  suggestTherapeuticAreas,
  suggestCriteria,
  suggestEndpoints,
  checkCompliance,
  analyzeDrugComposition,
  translateProtocol
}; 