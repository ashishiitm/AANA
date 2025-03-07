import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  CircularProgress,
  Paper,
  Alert,
  Divider,
  Snackbar
} from '@mui/material';
import * as deepseekService from '../services/deepseekService';

const DeepSeekTest = () => {
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('Explain what a clinical trial protocol is in one paragraph');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [apiKeyVerified, setApiKeyVerified] = useState(false);
  const [envApiKey, setEnvApiKey] = useState('');

  // Check for environment API key on mount
  useEffect(() => {
    const currentApiKey = process.env.REACT_APP_DEEPSEEK_API_KEY;
    setEnvApiKey(currentApiKey || 'Not set in environment');
    if (currentApiKey) {
      setApiKey(currentApiKey);
    }
  }, []);

  const handleChangeApiKey = (e) => {
    setApiKey(e.target.value);
  };

  const handleVerifyApiKey = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Set the API key in the service
      deepseekService.setApiKey(apiKey);
      
      // Make a simple call to verify the API key works
      const result = await deepseekService.callDeepSeekAPI('Hello, are you working?', { 
        max_tokens: 20 
      });
      
      setSuccess('API key verified successfully! ✅');
      setApiKeyVerified(true);
      console.log('DeepSeek API response:', result);
    } catch (err) {
      console.error('API Key verification error:', err);
      setError(`API key verification failed: ${err.message}`);
      setApiKeyVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const handleTestCall = async () => {
    if (!apiKeyVerified && !apiKey) {
      setError('Please verify your API key first');
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');
    
    try {
      // Make sure the API key is set
      deepseekService.setApiKey(apiKey);
      
      // Call the API with the user prompt
      const result = await deepseekService.callDeepSeekAPI(prompt);
      
      setResponse(result);
      setSuccess('API call completed successfully! ✅');
    } catch (err) {
      console.error('API call error:', err);
      setError(`API call failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        DeepSeek API Integration Test
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Current Environment API Key:
        </Typography>
        <Typography variant="body2" 
          sx={{ 
            p: 1, 
            bgcolor: 'grey.100', 
            borderRadius: 1,
            fontFamily: 'monospace',
            wordBreak: 'break-all'
          }}
        >
          {envApiKey || 'Not set'}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          API Key Verification
        </Typography>
        <TextField
          label="DeepSeek API Key"
          fullWidth
          value={apiKey}
          onChange={handleChangeApiKey}
          margin="normal"
          type="password"
          placeholder="sk-..."
        />
        <Button 
          variant="contained" 
          onClick={handleVerifyApiKey}
          disabled={loading || !apiKey}
          sx={{ mt: 1 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Verify API Key'}
        </Button>
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Test API Call
        </Typography>
        <TextField
          label="Test Prompt"
          fullWidth
          multiline
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          margin="normal"
        />
        <Button 
          variant="contained" 
          onClick={handleTestCall}
          disabled={loading || !prompt}
          sx={{ mt: 1 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Test API Call'}
        </Button>
      </Box>
      
      {response && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            API Response:
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              maxHeight: 300,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace'
            }}
          >
            {response}
          </Paper>
        </Box>
      )}
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default DeepSeekTest; 