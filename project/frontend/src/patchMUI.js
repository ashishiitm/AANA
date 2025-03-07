/**
 * This file patches the MUI Autocomplete component to fix the missing createFilterOptions export
 */

// Define our own createFilterOptions function
const createFilterOptions = (config = {}) => {
  const {
    ignoreAccents = true,
    ignoreCase = true,
    limit = null,
    matchFrom = 'any',
    stringify = (option) => option.toString(),
    trim = false,
  } = config;

  return (options, { inputValue, getOptionLabel }) => {
    let input = trim ? inputValue.trim() : inputValue;
    if (ignoreCase) {
      input = input.toLowerCase();
    }

    if (ignoreAccents) {
      input = input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    const filteredOptions = options.filter((option) => {
      let candidate = getOptionLabel(option);
      if (ignoreCase) {
        candidate = candidate.toLowerCase();
      }
      if (ignoreAccents) {
        candidate = candidate.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      }
      if (trim) {
        candidate = candidate.trim();
      }

      return matchFrom === 'start'
        ? candidate.indexOf(input) === 0
        : candidate.indexOf(input) !== -1;
    });

    return typeof limit === 'number' ? filteredOptions.slice(0, limit) : filteredOptions;
  };
};

// Patch the module
try {
  // Get the module object
  const moduleId = Object.keys(require.cache).find(id => 
    id.includes('@mui/material/Autocomplete/index.js')
  );
  
  if (moduleId) {
    const module = require.cache[moduleId];
    
    // Add our createFilterOptions to the exports
    if (module && module.exports) {
      module.exports.createFilterOptions = createFilterOptions;
      console.log('Successfully patched @mui/material/Autocomplete');
    }
  } else {
    console.warn('Could not find @mui/material/Autocomplete module in require.cache');
  }
} catch (error) {
  console.error('Failed to patch @mui/material/Autocomplete:', error);
}

// Also export our own version for direct use
export { createFilterOptions }; 