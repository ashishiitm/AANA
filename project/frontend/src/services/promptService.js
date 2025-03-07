/**
 * Prompt Management Service
 * 
 * Handles storage, optimization, and versioning of prompts for protocol design.
 * Includes analytics for prompt performance and effectiveness.
 */

// Prompt categories for protocol design
export const PROMPT_CATEGORIES = {
  PROTOCOL_TEMPLATE: 'protocol_template',
  THERAPEUTIC_AREAS: 'therapeutic_areas',
  INCLUSION_CRITERIA: 'inclusion_criteria',
  ENDPOINTS: 'endpoints',
  SAFETY_ANALYSIS: 'safety_analysis',
  REGULATORY_COMPLIANCE: 'regulatory_compliance'
};

// Base prompts with versioning
export const BASE_PROMPTS = {
  [PROMPT_CATEGORIES.PROTOCOL_TEMPLATE]: {
    version: '1.0',
    template: `As an expert in clinical trial protocol design with deep knowledge of ICH, FDA, and EMA guidelines, create a comprehensive protocol template for:
- Therapeutic Area: {therapeuticArea}
- Phase: {phase}
- Condition: {condition}
- Drug: {drugName}

Consider:
1. Latest regulatory requirements
2. Industry best practices
3. Safety considerations
4. Study design optimization
5. Patient-centric approach

Format as structured JSON with sections for:
{structuredOutputFormat}`,
    parameters: ['therapeuticArea', 'phase', 'condition', 'drugName'],
    metadata: {
      successRate: 0,
      averageResponseTime: 0,
      totalUses: 0,
      lastOptimized: null
    }
  },
  [PROMPT_CATEGORIES.THERAPEUTIC_AREAS]: {
    version: '1.0',
    template: `Analyze this medical condition: "{condition}"
Recommend 1-3 most appropriate therapeutic areas from standard classifications.
Consider:
1. Disease pathophysiology
2. Treatment modalities
3. Affected organ systems
4. Current clinical trial landscape

Format response as JSON array of therapeutic areas.`,
    parameters: ['condition'],
    metadata: {
      successRate: 0,
      averageResponseTime: 0,
      totalUses: 0,
      lastOptimized: null
    }
  }
};

// Track prompt performance metrics
const promptMetrics = new Map();

/**
 * Generate a complete prompt by filling in template parameters
 * @param {string} category - The prompt category
 * @param {Object} parameters - Parameters to fill in the template
 * @returns {string} The complete prompt
 */
export const generatePrompt = (category, parameters) => {
  const basePrompt = BASE_PROMPTS[category];
  if (!basePrompt) {
    throw new Error(`No prompt template found for category: ${category}`);
  }

  let prompt = basePrompt.template;
  Object.entries(parameters).forEach(([key, value]) => {
    prompt = prompt.replace(`{${key}}`, value);
  });

  return prompt;
};

/**
 * Record metrics for a prompt execution
 * @param {string} category - The prompt category
 * @param {Object} metrics - Performance metrics
 */
export const recordPromptMetrics = (category, metrics) => {
  const { success, responseTime, outputQuality } = metrics;
  const promptData = promptMetrics.get(category) || {
    successCount: 0,
    totalCalls: 0,
    totalResponseTime: 0,
    qualityScores: []
  };

  promptData.totalCalls++;
  if (success) promptData.successCount++;
  promptData.totalResponseTime += responseTime;
  promptData.qualityScores.push(outputQuality);

  promptMetrics.set(category, promptData);
  
  // Update base prompt metadata
  if (BASE_PROMPTS[category]) {
    BASE_PROMPTS[category].metadata.successRate = 
      promptData.successCount / promptData.totalCalls;
    BASE_PROMPTS[category].metadata.averageResponseTime = 
      promptData.totalResponseTime / promptData.totalCalls;
    BASE_PROMPTS[category].metadata.totalUses = promptData.totalCalls;
  }
};

/**
 * Get optimization suggestions for a prompt based on its performance metrics
 * @param {string} category - The prompt category
 * @returns {Object} Optimization suggestions
 */
export const getOptimizationSuggestions = (category) => {
  const metrics = promptMetrics.get(category);
  if (!metrics) {
    return { suggestions: [], confidence: 0 };
  }

  const suggestions = [];
  const basePrompt = BASE_PROMPTS[category];

  // Analyze success rate
  if (metrics.successCount / metrics.totalCalls < 0.8) {
    suggestions.push({
      type: 'structure',
      message: 'Consider adding more specific guidance in the prompt structure',
      confidence: 0.8
    });
  }

  // Analyze response time
  if (metrics.totalResponseTime / metrics.totalCalls > 5000) {
    suggestions.push({
      type: 'complexity',
      message: 'Prompt might be too complex, consider breaking into smaller components',
      confidence: 0.7
    });
  }

  // Analyze quality scores
  const avgQuality = metrics.qualityScores.reduce((a, b) => a + b, 0) / metrics.qualityScores.length;
  if (avgQuality < 0.7) {
    suggestions.push({
      type: 'quality',
      message: 'Add more specific quality criteria to the prompt',
      confidence: 0.9
    });
  }

  return {
    suggestions,
    confidence: suggestions.length > 0 ? 0.8 : 0.5
  };
};

/**
 * Save an optimized version of a prompt
 * @param {string} category - The prompt category
 * @param {string} newTemplate - The optimized template
 * @param {string} optimizationNotes - Notes about the optimization
 */
export const saveOptimizedPrompt = (category, newTemplate, optimizationNotes) => {
  if (!BASE_PROMPTS[category]) {
    throw new Error(`Invalid prompt category: ${category}`);
  }

  // Version control for prompts
  const currentVersion = BASE_PROMPTS[category].version;
  const [major, minor] = currentVersion.split('.').map(Number);
  const newVersion = `${major}.${minor + 1}`;

  // Archive current version before updating
  const archiveKey = `${category}_v${currentVersion}`;
  promptArchive.set(archiveKey, { ...BASE_PROMPTS[category] });

  // Update with new version
  BASE_PROMPTS[category] = {
    ...BASE_PROMPTS[category],
    version: newVersion,
    template: newTemplate,
    metadata: {
      ...BASE_PROMPTS[category].metadata,
      lastOptimized: new Date().toISOString()
    },
    optimizationHistory: [
      ...(BASE_PROMPTS[category].optimizationHistory || []),
      {
        date: new Date().toISOString(),
        notes: optimizationNotes,
        previousVersion: currentVersion
      }
    ]
  };
};

// Archive for storing previous versions of prompts
const promptArchive = new Map();

/**
 * Get the history of a prompt's optimizations
 * @param {string} category - The prompt category
 * @returns {Array} History of optimizations
 */
export const getPromptHistory = (category) => {
  const prompt = BASE_PROMPTS[category];
  if (!prompt) {
    throw new Error(`Invalid prompt category: ${category}`);
  }

  return {
    currentVersion: prompt.version,
    history: prompt.optimizationHistory || [],
    metrics: promptMetrics.get(category) || null
  };
};

export default {
  PROMPT_CATEGORIES,
  generatePrompt,
  recordPromptMetrics,
  getOptimizationSuggestions,
  saveOptimizedPrompt,
  getPromptHistory
}; 