const path = require('path');

module.exports = function override(config) {
  // Add alias for the problematic module
  config.resolve.alias = {
    ...config.resolve.alias,
    '@mui/material/Autocomplete': path.resolve(__dirname, 'src/patches/Autocomplete.js'),
  };
  
  return config;
}; 