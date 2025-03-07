/**
 * This file is a patched version of the MUI Autocomplete component
 * It adds the missing createFilterOptions export
 */

// Import the original Autocomplete component
import Autocomplete from '@mui/material/Autocomplete/Autocomplete';

// Define our own createFilterOptions function
export const createFilterOptions = (config = {}) => {
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

// Export the original Autocomplete as default
export default Autocomplete; 