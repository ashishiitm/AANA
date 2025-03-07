/**
 * AI Protocol Service
 * 
 * Provides AI-powered functions for generating protocol templates, making recommendations,
 * and enhancing the protocol design process through automated content generation.
 */

// Mock data for different therapeutic areas
const therapeuticAreaTemplates = {
  'Oncology': {
    recommendedPhases: ['Phase 1', 'Phase 2', 'Phase 3'],
    commonObjectives: [
      'To determine the maximum tolerated dose (MTD)',
      'To evaluate the safety and tolerability profile',
      'To assess tumor response rate according to RECIST criteria',
      'To evaluate progression-free survival and overall survival'
    ],
    studyDesigns: ['Randomized', 'Double-blind', 'Open-label'],
    inclusionCriteria: [
      'Histologically or cytologically confirmed diagnosis of target cancer type',
      'Age ≥ 18 years',
      'ECOG performance status of 0-1',
      'Adequate organ function',
      'Measurable disease according to RECIST v1.1',
      'Life expectancy > 3 months'
    ],
    exclusionCriteria: [
      'Prior treatment with study drug or similar agents',
      'Known brain metastases unless adequately treated',
      'History of another malignancy within the past 3 years',
      'Significant cardiovascular disease',
      'Active infection requiring systemic therapy'
    ],
    primaryEndpoints: [
      { description: 'Objective response rate (ORR)', type: 'efficacy', timeframe: 'Week 24' },
      { description: 'Incidence of adverse events', type: 'safety', timeframe: 'Throughout study duration' },
      { description: 'Progression-free survival (PFS)', type: 'efficacy', timeframe: '12 months' }
    ],
    secondaryEndpoints: [
      { description: 'Duration of response (DOR)', type: 'efficacy', timeframe: 'From first response to progression' },
      { description: 'Overall survival (OS)', type: 'efficacy', timeframe: '24 months' },
      { description: 'Quality of life assessment', type: 'quality_of_life', timeframe: 'Baseline and every 3 months' }
    ],
    assessments: [
      { name: 'Tumor imaging', type: 'imaging', frequency: 'Every 8 weeks' },
      { name: 'Physical examination', type: 'clinical_exam', frequency: 'Every cycle' },
      { name: 'Laboratory evaluations', type: 'laboratory_test', frequency: 'Every cycle' },
      { name: 'Adverse event monitoring', type: 'clinical_exam', frequency: 'Continuous' }
    ],
    recommendedRoles: ['principal_investigator', 'co_investigator', 'study_coordinator', 'biostatistician', 'data_manager']
  },
  'Cardiology': {
    recommendedPhases: ['Phase 2', 'Phase 3', 'Phase 4'],
    commonObjectives: [
      'To evaluate the efficacy of the study drug in reducing major adverse cardiovascular events',
      'To assess the safety and tolerability in patients with cardiovascular disease',
      'To determine the effect on blood pressure/lipid levels/heart rate',
      'To evaluate long-term cardiovascular outcomes'
    ],
    studyDesigns: ['Randomized', 'Double-blind', 'Placebo-controlled'],
    inclusionCriteria: [
      'Documented history of cardiovascular disease',
      'Age ≥ 40 years',
      'Stable medical regimen for at least 30 days',
      'Elevated risk factors (specify: hypertension, hyperlipidemia, etc.)',
      'Able to comply with study procedures'
    ],
    exclusionCriteria: [
      'Recent acute coronary syndrome or stroke (within 3 months)',
      'Uncontrolled hypertension',
      'Significant valve disease requiring intervention',
      'History of heart failure NYHA class III-IV',
      'Significant renal or hepatic impairment'
    ],
    primaryEndpoints: [
      { description: 'Reduction in major adverse cardiovascular events (MACE)', type: 'efficacy', timeframe: '3 years' },
      { description: 'Change in blood pressure from baseline', type: 'efficacy', timeframe: '12 weeks' }
    ],
    secondaryEndpoints: [
      { description: 'All-cause mortality', type: 'efficacy', timeframe: 'Throughout study duration' },
      { description: 'Hospitalization for heart failure', type: 'efficacy', timeframe: 'Throughout study duration' },
      { description: 'Change in quality of life scores', type: 'quality_of_life', timeframe: 'Baseline, 6 months, 12 months' }
    ],
    assessments: [
      { name: 'ECG', type: 'clinical_exam', frequency: 'Baseline, weeks 4, 12, 24' },
      { name: 'Echocardiogram', type: 'imaging', frequency: 'Baseline and 12 months' },
      { name: 'Lipid panel', type: 'laboratory_test', frequency: 'Baseline, weeks 12, 24' },
      { name: 'Blood pressure monitoring', type: 'clinical_exam', frequency: 'Every visit' }
    ],
    recommendedRoles: ['principal_investigator', 'cardiologist', 'study_coordinator', 'medical_monitor', 'biostatistician']
  },
  'Neurology': {
    recommendedPhases: ['Phase 2', 'Phase 3'],
    commonObjectives: [
      'To evaluate the efficacy of the study drug in improving neurological function',
      'To assess the safety and tolerability in patients with neurological disorders',
      'To determine the effect on disease progression',
      'To evaluate impact on quality of life'
    ],
    studyDesigns: ['Randomized', 'Double-blind', 'Placebo-controlled', 'Crossover'],
    inclusionCriteria: [
      'Confirmed diagnosis of target neurological condition',
      'Age ≥ 18 years',
      'Stable disease for at least 30 days prior to enrollment',
      'Modified Rankin Scale score of 0-4',
      'Able to comply with study assessments'
    ],
    exclusionCriteria: [
      'History of other significant neurological disorders',
      'Cognitive impairment that limits ability to provide informed consent',
      'Significant psychiatric disorders',
      'Recent use of investigational drugs (within 30 days)',
      'Contraindications to MRI'
    ],
    primaryEndpoints: [
      { description: 'Change in neurological function score', type: 'efficacy', timeframe: '6 months' },
      { description: 'Rate of disease progression', type: 'efficacy', timeframe: '12 months' }
    ],
    secondaryEndpoints: [
      { description: 'Change in quality of life measures', type: 'quality_of_life', timeframe: 'Baseline, 3, 6, 12 months' },
      { description: 'Time to clinically meaningful deterioration', type: 'efficacy', timeframe: 'Throughout study duration' },
      { description: 'Incidence of treatment-emergent adverse events', type: 'safety', timeframe: 'Throughout study duration' }
    ],
    assessments: [
      { name: 'Neurological examination', type: 'clinical_exam', frequency: 'Every visit' },
      { name: 'MRI brain scan', type: 'imaging', frequency: 'Baseline, 6 months, 12 months' },
      { name: 'Cognitive function tests', type: 'clinical_exam', frequency: 'Baseline, 3, 6, 12 months' },
      { name: 'Patient-reported outcomes', type: 'patient_reported', frequency: 'Monthly' }
    ],
    recommendedRoles: ['principal_investigator', 'neurologist', 'study_coordinator', 'neuroradiologist', 'biostatistician']
  }
};

// More general templates for phases
const phaseTemplates = {
  'Phase 1': {
    typicalDesign: ['Open-label', 'Dose-escalation', 'Single-arm'],
    sampleSizeRange: [20, 80],
    typicalDuration: '6-12 months',
    commonEndpoints: [
      { description: 'Safety and tolerability assessment', type: 'safety' },
      { description: 'Maximum tolerated dose determination', type: 'pharmacokinetic' },
      { description: 'Pharmacokinetic profile', type: 'pharmacokinetic' }
    ]
  },
  'Phase 2': {
    typicalDesign: ['Randomized', 'Controlled', 'Blinded when possible'],
    sampleSizeRange: [100, 300],
    typicalDuration: '12-24 months',
    commonEndpoints: [
      { description: 'Preliminary efficacy assessment', type: 'efficacy' },
      { description: 'Dose-response relationship', type: 'efficacy' },
      { description: 'Extended safety assessment', type: 'safety' }
    ]
  },
  'Phase 3': {
    typicalDesign: ['Randomized', 'Double-blind', 'Placebo or active-controlled', 'Multicenter'],
    sampleSizeRange: [300, 3000],
    typicalDuration: '1-4 years',
    commonEndpoints: [
      { description: 'Confirmation of efficacy', type: 'efficacy' },
      { description: 'Long-term safety', type: 'safety' },
      { description: 'Quality of life assessment', type: 'quality_of_life' }
    ]
  },
  'Phase 4': {
    typicalDesign: ['Open-label', 'Observational', 'Registry-based'],
    sampleSizeRange: [1000, 10000],
    typicalDuration: '2-5 years',
    commonEndpoints: [
      { description: 'Post-marketing safety surveillance', type: 'safety' },
      { description: 'Real-world effectiveness', type: 'efficacy' },
      { description: 'Quality of life in clinical practice', type: 'quality_of_life' }
    ]
  }
};

/**
 * Generate a protocol template based on basic information.
 * 
 * @param {Object} basicInfo - Basic trial information
 * @param {string} basicInfo.therapeuticArea - The therapeutic area
 * @param {string} basicInfo.phase - The trial phase
 * @param {string} basicInfo.condition - The specific condition being studied
 * @returns {Object} Complete protocol template
 */
export const generateProtocolTemplate = async (basicInfo) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const { therapeuticArea, phase, condition, drugName } = basicInfo;
  
  // Get template based on therapeutic area or use a generic one
  const areaTemplate = therapeuticAreaTemplates[therapeuticArea] || {};
  const phaseTemplate = phaseTemplates[phase] || {};
  
  // Generate protocol template
  return {
    trial_basics: {
      ...basicInfo,
      objective: suggestObjective(areaTemplate, phaseTemplate, condition, drugName)
    },
    study_design: {
      type: suggestStudyDesign(areaTemplate, phaseTemplate),
      population: {
        ageRange: [18, 65],
        inclusion: areaTemplate.inclusionCriteria || [],
        exclusion: areaTemplate.exclusionCriteria || []
      },
      intervention: {
        dosage: '',
        frequency: '',
        route: ''
      },
      comparator: suggestComparator(areaTemplate, phaseTemplate)
    },
    endpoints: {
      primaryEndpoints: areaTemplate.primaryEndpoints || phaseTemplate.commonEndpoints || [],
      secondaryEndpoints: areaTemplate.secondaryEndpoints || [],
      assessments: areaTemplate.assessments || []
    },
    team_assignment: {
      teamMembers: []
    }
  };
};

/**
 * Suggest a primary objective based on therapeutic area, phase, and condition.
 */
const suggestObjective = (areaTemplate, phaseTemplate, condition, drugName) => {
  if (!areaTemplate.commonObjectives || areaTemplate.commonObjectives.length === 0) {
    // Fallback to phase-based generic objective
    if (phaseTemplate.commonEndpoints && phaseTemplate.commonEndpoints.length > 0) {
      return `To evaluate the ${phaseTemplate.commonEndpoints[0].type} of ${drugName || 'the study drug'} in patients with ${condition || 'the target condition'}`;
    }
    return '';
  }
  
  // Use the first objective from the therapeutic area template and customize it
  let objective = areaTemplate.commonObjectives[0];
  
  // Replace placeholders with actual values if they exist
  if (condition) {
    objective = objective.replace(/target .+?(?=\s|$)/, condition);
  }
  
  if (drugName) {
    objective = objective.replace(/study drug/, drugName);
  }
  
  return objective;
};

/**
 * Suggest study design based on therapeutic area and phase templates.
 */
const suggestStudyDesign = (areaTemplate, phaseTemplate) => {
  // Combine designs from both templates, prioritizing area-specific designs
  const designs = [
    ...(areaTemplate.studyDesigns || []),
    ...(phaseTemplate.typicalDesign || [])
  ];
  
  // Remove duplicates
  return [...new Set(designs.map(d => d.toLowerCase()))];
};

/**
 * Suggest comparator based on therapeutic area and phase.
 */
const suggestComparator = (areaTemplate, phaseTemplate) => {
  // Logic to determine appropriate comparator
  const designs = [...(areaTemplate.studyDesigns || []), ...(phaseTemplate.typicalDesign || [])];
  
  if (designs.some(d => d.toLowerCase().includes('placebo'))) {
    return 'placebo';
  } else if (designs.some(d => d.toLowerCase().includes('control'))) {
    return 'standard_of_care';
  } else if (designs.some(d => d.toLowerCase().includes('single'))) {
    return 'none';
  }
  
  return 'placebo'; // Default to placebo
};

/**
 * Get therapeutic area suggestions based on condition text.
 * 
 * @param {string} conditionText - The condition being studied
 * @returns {Array} Suggested therapeutic areas
 */
export const suggestTherapeuticAreas = async (conditionText) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Map conditions to therapeutic areas (in a real implementation, this would call an AI service)
  const conditionMap = {
    'cancer': 'Oncology',
    'tumor': 'Oncology',
    'leukemia': 'Oncology',
    'lymphoma': 'Oncology',
    'carcinoma': 'Oncology',
    'sarcoma': 'Oncology',
    'melanoma': 'Oncology',
    
    'heart': 'Cardiology',
    'cardiac': 'Cardiology',
    'hypertension': 'Cardiology',
    'artery': 'Cardiology',
    'atherosclerosis': 'Cardiology',
    'stroke': 'Cardiology',
    'vascular': 'Cardiology',
    
    'brain': 'Neurology',
    'nerve': 'Neurology',
    'alzheimer': 'Neurology',
    'parkinson': 'Neurology',
    'seizure': 'Neurology',
    'epilepsy': 'Neurology',
    'multiple sclerosis': 'Neurology',
    'dementia': 'Neurology',
    
    'asthma': 'Pulmonology',
    'lung': 'Pulmonology',
    'copd': 'Pulmonology',
    'respiratory': 'Pulmonology',
    'pneumonia': 'Pulmonology',
    
    'diabetes': 'Endocrinology',
    'thyroid': 'Endocrinology',
    'hormone': 'Endocrinology',
    'insulin': 'Endocrinology',
    
    'arthritis': 'Rheumatology',
    'lupus': 'Rheumatology',
    'rheumatoid': 'Rheumatology',
    'autoimmune': 'Rheumatology',
    
    'liver': 'Gastroenterology',
    'hepatitis': 'Gastroenterology',
    'crohn': 'Gastroenterology',
    'ulcerative colitis': 'Gastroenterology',
    'gastric': 'Gastroenterology',
    
    'infection': 'Infectious Disease',
    'hiv': 'Infectious Disease',
    'bacterial': 'Infectious Disease',
    'viral': 'Infectious Disease',
    'fungal': 'Infectious Disease'
  };
  
  if (!conditionText) return [];
  
  const lowerCondition = conditionText.toLowerCase();
  const areas = new Set();
  
  // Check if condition text contains any of our mapped keywords
  Object.entries(conditionMap).forEach(([key, area]) => {
    if (lowerCondition.includes(key)) {
      areas.add(area);
    }
  });
  
  return Array.from(areas);
};

/**
 * Get recommendations for inclusion/exclusion criteria based on therapeutic area and condition.
 * 
 * @param {string} therapeuticArea - The therapeutic area
 * @param {string} condition - The specific condition
 * @returns {Object} Recommended criteria
 */
export const suggestCriteria = async (therapeuticArea, condition) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const template = therapeuticAreaTemplates[therapeuticArea] || {};
  
  return {
    inclusion: template.inclusionCriteria || [],
    exclusion: template.exclusionCriteria || []
  };
};

/**
 * Get endpoint recommendations based on therapeutic area, phase, and condition.
 * 
 * @param {string} therapeuticArea - The therapeutic area
 * @param {string} phase - The trial phase
 * @param {string} condition - The specific condition
 * @returns {Object} Recommended endpoints
 */
export const suggestEndpoints = async (therapeuticArea, phase, condition) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const areaTemplate = therapeuticAreaTemplates[therapeuticArea] || {};
  const phaseTemplate = phaseTemplates[phase] || {};
  
  return {
    primary: areaTemplate.primaryEndpoints || phaseTemplate.commonEndpoints || [],
    secondary: areaTemplate.secondaryEndpoints || [],
    assessments: areaTemplate.assessments || []
  };
};

/**
 * Check protocol compliance with regulatory guidelines.
 * 
 * @param {Object} protocol - The complete protocol
 * @returns {Array} Compliance issues
 */
export const checkCompliance = async (protocol) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const issues = [];
  
  // Check for required protocol elements
  if (!protocol.trial_basics.phase) {
    issues.push({
      severity: 'error',
      message: 'Trial phase is required',
      section: 'trial_basics'
    });
  }
  
  // Check for primary endpoints
  if (!protocol.endpoints.primaryEndpoints || protocol.endpoints.primaryEndpoints.length === 0) {
    issues.push({
      severity: 'error',
      message: 'At least one primary endpoint is required',
      section: 'endpoints'
    });
  }
  
  // Check for study design
  if (!protocol.study_design.type || protocol.study_design.type.length === 0) {
    issues.push({
      severity: 'error',
      message: 'Study design type must be specified',
      section: 'study_design'
    });
  }
  
  // Check for inclusion/exclusion criteria
  if (!protocol.study_design.population || 
      !protocol.study_design.population.inclusion || 
      protocol.study_design.population.inclusion.length === 0) {
    issues.push({
      severity: 'warning',
      message: 'Inclusion criteria should be specified',
      section: 'study_design'
    });
  }
  
  // Add general recommendations
  issues.push({
    severity: 'info',
    message: 'Consider adding more detailed exclusion criteria for patient safety',
    section: 'study_design',
    recommendation: 'Review ICH E6 guidelines for recommended exclusion criteria'
  });
  
  issues.push({
    severity: 'info',
    message: 'Secondary endpoints could be more clearly linked to primary endpoints',
    section: 'endpoints',
    recommendation: 'Ensure secondary endpoints support the overall study objectives'
  });
  
  return issues;
};

export default {
  generateProtocolTemplate,
  suggestTherapeuticAreas,
  suggestCriteria,
  suggestEndpoints,
  checkCompliance
}; 