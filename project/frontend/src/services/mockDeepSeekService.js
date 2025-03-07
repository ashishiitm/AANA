/**
 * Mock DeepSeek AI Service
 * 
 * Provides fallback responses when the DeepSeek API is unavailable.
 * This service mimics the behavior of the real API for development and demo purposes.
 */

// Sample therapeutic areas for different conditions
const THERAPEUTIC_AREAS_MAP = {
  'cancer': ['Oncology'],
  'tumor': ['Oncology'],
  'leukemia': ['Oncology', 'Hematology'],
  'lymphoma': ['Oncology', 'Hematology'],
  'alzheimer': ['Neurology'],
  'parkinson': ['Neurology'],
  'multiple sclerosis': ['Neurology', 'Immunology'],
  'depression': ['Psychiatry', 'Neurology'],
  'anxiety': ['Psychiatry'],
  'schizophrenia': ['Psychiatry'],
  'diabetes': ['Endocrinology'],
  'asthma': ['Pulmonology', 'Immunology'],
  'copd': ['Pulmonology'],
  'arthritis': ['Rheumatology', 'Immunology'],
  'lupus': ['Rheumatology', 'Immunology'],
  'heart failure': ['Cardiology'],
  'hypertension': ['Cardiology'],
  'stroke': ['Cardiology', 'Neurology'],
  'hepatitis': ['Gastroenterology', 'Infectious Disease'],
  'hiv': ['Infectious Disease', 'Immunology'],
  'covid': ['Infectious Disease', 'Pulmonology'],
  'psoriasis': ['Dermatology', 'Immunology'],
  'eczema': ['Dermatology'],
};

// Sample inclusion/exclusion criteria by phase and therapeutic area
const CRITERIA_TEMPLATES = {
  'Oncology': {
    'Phase 1': {
      inclusion: [
        'Age ≥18 years',
        'Histologically confirmed advanced solid tumors',
        'ECOG performance status 0-1',
        'Adequate organ function',
        'Life expectancy ≥12 weeks',
        'Recovered from toxicities of prior treatments'
      ],
      exclusion: [
        'Prior treatment with [study drug] or similar agents',
        'Known hypersensitivity to the study drug',
        'Active CNS metastases',
        'Major surgery within 4 weeks',
        'Significant cardiovascular disease',
        'Pregnant or breastfeeding women'
      ]
    },
    'Phase 2': {
      inclusion: [
        'Age ≥18 years',
        'Histologically confirmed [specific cancer type]',
        'Measurable disease according to RECIST v1.1',
        'ECOG performance status 0-1',
        'Adequate organ function',
        'Failed at least one line of standard therapy'
      ],
      exclusion: [
        'Prior treatment with [study drug] or similar agents',
        'Known hypersensitivity to the study drug',
        'Unstable CNS metastases',
        'Major surgery within 4 weeks',
        'Significant cardiovascular disease',
        'Pregnant or breastfeeding women'
      ]
    }
  },
  'Neurology': {
    'Phase 1': {
      inclusion: [
        'Age ≥18 years',
        'Confirmed diagnosis of [neurological condition]',
        'Stable disease for at least 3 months',
        'Modified Rankin Scale score 0-3',
        'Able to comply with study procedures'
      ],
      exclusion: [
        'History of seizures within the past year',
        'Significant psychiatric disorder',
        'Concurrent neurological disorder other than [condition]',
        'Use of prohibited medications',
        'Pregnancy or breastfeeding'
      ]
    }
  }
};

// Sample endpoints by therapeutic area
const ENDPOINTS_TEMPLATES = {
  'Oncology': {
    primary: [
      {
        description: 'Objective Response Rate (ORR)',
        type: 'Efficacy',
        timeframe: 'Up to 24 weeks'
      },
      {
        description: 'Progression-Free Survival (PFS)',
        type: 'Efficacy',
        timeframe: 'Up to 12 months'
      }
    ],
    secondary: [
      {
        description: 'Overall Survival (OS)',
        type: 'Efficacy',
        timeframe: 'Up to 24 months'
      },
      {
        description: 'Duration of Response (DOR)',
        type: 'Efficacy',
        timeframe: 'Up to 12 months'
      },
      {
        description: 'Incidence of Treatment-Emergent Adverse Events',
        type: 'Safety',
        timeframe: 'Up to 30 days after last dose'
      }
    ]
  },
  'Neurology': {
    primary: [
      {
        description: 'Change from baseline in [specific neurological scale]',
        type: 'Efficacy',
        timeframe: 'Week 24'
      }
    ],
    secondary: [
      {
        description: 'Time to disease progression',
        type: 'Efficacy',
        timeframe: 'Up to 12 months'
      },
      {
        description: 'Change in quality of life measures',
        type: 'Patient-Reported Outcome',
        timeframe: 'Weeks 12, 24, and 48'
      }
    ]
  }
};

// Mock implementation of key functions from deepseekService
export const callDeepSeekAPI = async (prompt, options = {}) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Default response for general queries
  let response = `I'm a mock AI assistant providing fallback responses while the DeepSeek API is unavailable. 
Your query was: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"

This is a simulated response for development and testing purposes. In production, this would connect to the DeepSeek API.`;

  // Check if this is a therapeutic area query
  if (prompt.toLowerCase().includes('therapeutic area') || prompt.toLowerCase().includes('condition')) {
    // Extract potential condition words
    const conditionWords = Object.keys(THERAPEUTIC_AREAS_MAP);
    const matchedCondition = conditionWords.find(condition => 
      prompt.toLowerCase().includes(condition)
    );
    
    if (matchedCondition) {
      return JSON.stringify(THERAPEUTIC_AREAS_MAP[matchedCondition]);
    }
    
    // Default response for therapeutic area queries
    return JSON.stringify(['Oncology', 'Neurology']);
  }
  
  // Check if this is a criteria query
  if (prompt.toLowerCase().includes('criteria') || prompt.toLowerCase().includes('inclusion') || prompt.toLowerCase().includes('exclusion')) {
    let therapeuticArea = 'Oncology';
    let phase = 'Phase 1';
    
    // Try to extract therapeutic area from prompt
    Object.keys(CRITERIA_TEMPLATES).forEach(area => {
      if (prompt.includes(area)) {
        therapeuticArea = area;
      }
    });
    
    // Try to extract phase from prompt
    if (prompt.includes('Phase 2') || prompt.includes('phase 2') || prompt.includes('Phase II')) {
      phase = 'Phase 2';
    }
    
    // Get the criteria template for this area and phase
    const criteriaTemplate = CRITERIA_TEMPLATES[therapeuticArea][phase] || 
                            CRITERIA_TEMPLATES.Oncology['Phase 1'];
    
    return JSON.stringify(criteriaTemplate);
  }
  
  // Check if this is an endpoints query
  if (prompt.toLowerCase().includes('endpoint') || prompt.toLowerCase().includes('assessment')) {
    let therapeuticArea = 'Oncology';
    
    // Try to extract therapeutic area from prompt
    Object.keys(ENDPOINTS_TEMPLATES).forEach(area => {
      if (prompt.includes(area)) {
        therapeuticArea = area;
      }
    });
    
    // Get the endpoints template for this area
    const endpointsTemplate = ENDPOINTS_TEMPLATES[therapeuticArea] || 
                             ENDPOINTS_TEMPLATES.Oncology;
    
    return JSON.stringify(endpointsTemplate);
  }
  
  // Protocol generation query
  if (prompt.toLowerCase().includes('protocol') && 
      (prompt.toLowerCase().includes('template') || prompt.toLowerCase().includes('generate'))) {
    // Create a mock protocol template
    const mockProtocol = {
      trial_basics: {
        phase: prompt.includes('Phase 2') ? 'Phase 2' : 'Phase 1',
        therapeuticArea: 'Oncology',
        condition: 'Advanced Solid Tumors',
        drugName: 'MOCK-101',
        objective: 'Evaluate the safety and tolerability of MOCK-101'
      },
      study_design: {
        type: ['Randomized', 'Double-blind', 'Placebo-controlled'],
        population: {
          ageRange: [18, 75],
          inclusion: CRITERIA_TEMPLATES.Oncology['Phase 1'].inclusion,
          exclusion: CRITERIA_TEMPLATES.Oncology['Phase 1'].exclusion
        },
        intervention: {
          dosage: '100mg, 200mg, 300mg',
          frequency: 'Once daily',
          route: 'Oral'
        },
        comparator: 'Placebo'
      },
      endpoints: {
        primaryEndpoints: ENDPOINTS_TEMPLATES.Oncology.primary,
        secondaryEndpoints: ENDPOINTS_TEMPLATES.Oncology.secondary,
        assessments: [
          {
            name: 'RECIST v1.1 Tumor Assessment',
            type: 'Imaging',
            frequency: 'Every 8 weeks'
          },
          {
            name: 'Safety Laboratory Tests',
            type: 'Laboratory',
            frequency: 'Screening, Day 1 of each cycle, and EOT'
          }
        ]
      },
      team_assignment: {
        teamMembers: []
      }
    };
    
    return JSON.stringify(mockProtocol);
  }
  
  // Return the default response for any other query
  return response;
};

// Mock implementations of specific functions
export const generateProtocolTemplate = async (trialInfo) => {
  const { therapeuticArea, phase, condition, drugName } = trialInfo;
  
  // Create a mock protocol template
  const mockProtocol = {
    trial_basics: {
      phase: phase || 'Phase 1',
      therapeuticArea: therapeuticArea || 'Oncology',
      condition: condition || 'Advanced Solid Tumors',
      drugName: drugName || 'MOCK-101',
      objective: `Evaluate the safety and tolerability of ${drugName || 'MOCK-101'}`
    },
    study_design: {
      type: ['Randomized', 'Double-blind', 'Placebo-controlled'],
      population: {
        ageRange: [18, 75],
        inclusion: CRITERIA_TEMPLATES.Oncology['Phase 1'].inclusion,
        exclusion: CRITERIA_TEMPLATES.Oncology['Phase 1'].exclusion
      },
      intervention: {
        dosage: '100mg, 200mg, 300mg',
        frequency: 'Once daily',
        route: 'Oral'
      },
      comparator: 'Placebo'
    },
    endpoints: {
      primaryEndpoints: ENDPOINTS_TEMPLATES.Oncology.primary,
      secondaryEndpoints: ENDPOINTS_TEMPLATES.Oncology.secondary,
      assessments: [
        {
          name: 'RECIST v1.1 Tumor Assessment',
          type: 'Imaging',
          frequency: 'Every 8 weeks'
        },
        {
          name: 'Safety Laboratory Tests',
          type: 'Laboratory',
          frequency: 'Screening, Day 1 of each cycle, and EOT'
        }
      ]
    },
    team_assignment: {
      teamMembers: []
    }
  };
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return mockProtocol;
};

export const suggestTherapeuticAreas = async (conditionText) => {
  if (!conditionText || conditionText.trim().length < 3) {
    return [];
  }
  
  // Check if the condition matches any in our map
  const conditionWords = Object.keys(THERAPEUTIC_AREAS_MAP);
  const matchedCondition = conditionWords.find(condition => 
    conditionText.toLowerCase().includes(condition)
  );
  
  if (matchedCondition) {
    return THERAPEUTIC_AREAS_MAP[matchedCondition];
  }
  
  // Default response
  return ['Oncology', 'Neurology'];
};

export const suggestCriteria = async (therapeuticArea, condition, phase) => {
  if (!therapeuticArea || !condition) {
    return { inclusion: [], exclusion: [] };
  }
  
  // Find matching criteria template
  const areaTemplate = CRITERIA_TEMPLATES[therapeuticArea];
  if (!areaTemplate) {
    return {
      inclusion: CRITERIA_TEMPLATES.Oncology['Phase 1'].inclusion,
      exclusion: CRITERIA_TEMPLATES.Oncology['Phase 1'].exclusion
    };
  }
  
  const phaseTemplate = areaTemplate[phase] || areaTemplate['Phase 1'];
  if (!phaseTemplate) {
    return {
      inclusion: CRITERIA_TEMPLATES.Oncology['Phase 1'].inclusion,
      exclusion: CRITERIA_TEMPLATES.Oncology['Phase 1'].exclusion
    };
  }
  
  return phaseTemplate;
};

export const suggestEndpoints = async (therapeuticArea, phase, condition) => {
  if (!therapeuticArea) {
    return { primaryEndpoints: [], secondaryEndpoints: [] };
  }
  
  // Find matching endpoints template
  const endpointsTemplate = ENDPOINTS_TEMPLATES[therapeuticArea];
  if (!endpointsTemplate) {
    return ENDPOINTS_TEMPLATES.Oncology;
  }
  
  return endpointsTemplate;
};

export const checkCompliance = async (protocolData) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock compliance check results
  return {
    complianceScore: 85,
    complianceIssues: [
      {
        category: 'regulatory',
        description: 'Protocol version control information is missing',
        severity: 'medium',
        location: 'Header',
        status: 'open'
      },
      {
        category: 'scientific',
        description: 'Primary endpoint time frame is not clearly specified',
        severity: 'high',
        location: 'Endpoints section',
        status: 'open'
      },
      {
        category: 'ethics',
        description: 'Informed consent process should be described in more detail',
        severity: 'medium',
        location: 'Ethics section',
        status: 'open'
      }
    ]
  };
}; 