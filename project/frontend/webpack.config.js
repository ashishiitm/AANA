const path = require('path');

module.exports = {
  resolve: {
    alias: {
      // Alias for the problematic module
      '@mui/material/Autocomplete': path.resolve(__dirname, 'src/patches/Autocomplete.js'),
    },
  },
}; 