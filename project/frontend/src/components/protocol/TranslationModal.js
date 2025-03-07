import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  AlertTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider,
  Tabs,
  Tab,
  Paper,
  Grow
} from '@mui/material';
import {
  Language as LanguageIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Translate as TranslateIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import deepseekService from '../../services/deepseekService';
import { styled } from '@mui/material/styles';

// Styled TabPanel component
const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`translation-tabpanel-${index}`}
      aria-labelledby={`translation-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Languages supported for translation
const languages = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ko', name: 'Korean' }
];

// Styled JSON container
const JsonContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  fontFamily: 'monospace',
  fontSize: '0.8rem',
  backgroundColor: theme.palette.grey[900],
  color: theme.palette.grey[300],
  overflow: 'auto',
  height: 400,
  whiteSpace: 'pre-wrap',
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.grey[700],
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: theme.palette.grey[900],
  }
}));

const TranslationModal = ({ open, onClose, protocol }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [translatedProtocol, setTranslatedProtocol] = useState(null);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // Handle language selection change
  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle translation
  const handleTranslate = async () => {
    if (!selectedLanguage || !protocol) return;
    
    setLoading(true);
    setError('');
    
    try {
      const translated = await deepseekService.translateProtocol(
        protocol, 
        languages.find(l => l.code === selectedLanguage).name
      );
      setTranslatedProtocol(translated);
      setTabValue(1); // Switch to translated tab
    } catch (err) {
      console.error('Error translating protocol:', err);
      setError(`Translation failed: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle protocol download
  const handleDownload = (isTranslated = false) => {
    const protocolToDownload = isTranslated ? translatedProtocol : protocol;
    if (!protocolToDownload) return;
    
    const dataStr = JSON.stringify(protocolToDownload, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const language = isTranslated ? languages.find(l => l.code === selectedLanguage).name : 'English';
    const fileName = `protocol_${language.toLowerCase()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', fileName);
    linkElement.click();
    linkElement.remove();
  };
  
  // Handle copy to clipboard
  const handleCopy = (isTranslated = false) => {
    const protocolToCopy = isTranslated ? translatedProtocol : protocol;
    if (!protocolToCopy) return;
    
    navigator.clipboard.writeText(JSON.stringify(protocolToCopy, null, 2))
      .then(() => {
        // Show success message (could use a toast or snackbar)
        console.log('Protocol copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy protocol:', err);
      });
  };
  
  // Reset state when modal closes
  const handleClose = () => {
    onClose();
    // Keep state for a moment in case modal reopens
    setTimeout(() => {
      if (!open) {
        setSelectedLanguage('');
        setTranslatedProtocol(null);
        setError('');
        setTabValue(0);
      }
    }, 300);
  };
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      TransitionComponent={Grow}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LanguageIcon color="primary" />
          <Typography variant="h6" component="span">
            Protocol Translation
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Translate your protocol to support global clinical trials
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Our AI-powered translation maintains technical accuracy and regulatory compliance
            while adapting your protocol for international use.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="language-select-label">Target Language</InputLabel>
            <Select
              labelId="language-select-label"
              value={selectedLanguage}
              onChange={handleLanguageChange}
              label="Target Language"
              disabled={loading}
            >
              {languages.map((language) => (
                <MenuItem key={language.code} value={language.code}>
                  {language.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleTranslate}
            disabled={!selectedLanguage || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <TranslateIcon />}
          >
            {loading ? 'Translating...' : 'Translate Protocol'}
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Protocol Display Tabs */}
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="protocol translation tabs">
              <Tab label="Original (English)" id="translation-tab-0" />
              {translatedProtocol && (
                <Tab 
                  label={`Translated (${languages.find(l => l.code === selectedLanguage)?.name || ''})`} 
                  id="translation-tab-1" 
                />
              )}
            </Tabs>
          </Box>
          
          {/* Original Protocol Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                size="small"
                startIcon={<CopyIcon />}
                onClick={() => handleCopy(false)}
              >
                Copy JSON
              </Button>
              <Button
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownload(false)}
              >
                Download
              </Button>
            </Box>
            
            <JsonContainer elevation={0}>
              {JSON.stringify(protocol, null, 2)}
            </JsonContainer>
          </TabPanel>
          
          {/* Translated Protocol Tab */}
          {translatedProtocol && (
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<CopyIcon />}
                  onClick={() => handleCopy(true)}
                >
                  Copy JSON
                </Button>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload(true)}
                >
                  Download
                </Button>
              </Box>
              
              <JsonContainer elevation={0}>
                {JSON.stringify(translatedProtocol, null, 2)}
              </JsonContainer>
            </TabPanel>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Button onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TranslationModal; 