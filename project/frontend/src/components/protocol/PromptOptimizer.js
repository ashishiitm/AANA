import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Edit as EditIcon, History as HistoryIcon, Analytics as AnalyticsIcon } from '@mui/icons-material';
import promptService, { PROMPT_CATEGORIES, BASE_PROMPTS } from '../../services/promptService';

const PromptOptimizer = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [optimizationHistory, setOptimizationHistory] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState('');
  const [optimizationNotes, setOptimizationNotes] = useState('');
  const [alert, setAlert] = useState({ show: false, severity: 'info', message: '' });

  useEffect(() => {
    if (selectedCategory) {
      const prompt = BASE_PROMPTS[selectedCategory];
      setCurrentPrompt(prompt.template);
      loadPromptData();
    }
  }, [selectedCategory]);

  const loadPromptData = async () => {
    try {
      const history = promptService.getPromptHistory(selectedCategory);
      setOptimizationHistory(history);
      
      const optimizationSuggestions = promptService.getOptimizationSuggestions(selectedCategory);
      setSuggestions(optimizationSuggestions.suggestions);
      
      setMetrics(history.metrics);
    } catch (error) {
      console.error('Error loading prompt data:', error);
      setAlert({
        show: true,
        severity: 'error',
        message: 'Failed to load prompt data'
      });
    }
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleEditClick = () => {
    setEditedTemplate(currentPrompt);
    setIsEditing(true);
  };

  const handleSaveOptimization = async () => {
    try {
      await promptService.saveOptimizedPrompt(
        selectedCategory,
        editedTemplate,
        optimizationNotes
      );
      
      setIsEditing(false);
      setCurrentPrompt(editedTemplate);
      loadPromptData();
      
      setAlert({
        show: true,
        severity: 'success',
        message: 'Prompt optimized successfully'
      });
    } catch (error) {
      console.error('Error saving optimization:', error);
      setAlert({
        show: true,
        severity: 'error',
        message: 'Failed to save optimization'
      });
    }
  };

  const renderMetrics = () => {
    if (!metrics) return null;

    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Performance Metrics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="subtitle2">Success Rate</Typography>
              <LinearProgress 
                variant="determinate" 
                value={metrics.successRate * 100} 
                sx={{ mt: 1 }}
              />
              <Typography variant="body2">
                {(metrics.successRate * 100).toFixed(1)}%
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="subtitle2">Avg Response Time</Typography>
              <Typography variant="body2">
                {metrics.averageResponseTime.toFixed(0)}ms
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="subtitle2">Total Uses</Typography>
              <Typography variant="body2">
                {metrics.totalUses}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderSuggestions = () => {
    if (!suggestions.length) return null;

    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Optimization Suggestions
          </Typography>
          {suggestions.map((suggestion, index) => (
            <Alert 
              key={index} 
              severity="info" 
              sx={{ mb: 1 }}
              icon={<AnalyticsIcon />}
            >
              {suggestion.message}
              <Chip 
                label={`Confidence: ${(suggestion.confidence * 100).toFixed(0)}%`}
                size="small"
                sx={{ ml: 1 }}
              />
            </Alert>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderHistory = () => {
    if (!optimizationHistory?.history.length) return null;

    return (
      <Dialog
        open={showHistory}
        onClose={() => setShowHistory(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Optimization History</DialogTitle>
        <DialogContent>
          <List>
            {optimizationHistory.history.map((entry, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2">
                        Version {entry.previousVersion} → {entry.version}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="textSecondary">
                          {new Date(entry.date).toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          {entry.notes}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < optimizationHistory.history.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Protocol Design Prompt Optimizer
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Prompt Category</InputLabel>
        <Select
          value={selectedCategory}
          onChange={handleCategoryChange}
          label="Prompt Category"
        >
          {Object.entries(PROMPT_CATEGORIES).map(([key, value]) => (
            <MenuItem key={key} value={value}>
              {key.replace(/_/g, ' ').toLowerCase()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedCategory && (
        <>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Current Prompt Template
              </Typography>
              <Box>
                <IconButton onClick={() => setShowHistory(true)} title="History">
                  <HistoryIcon />
                </IconButton>
                <IconButton onClick={handleEditClick} title="Edit">
                  <EditIcon />
                </IconButton>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {currentPrompt}
            </Typography>
          </Paper>

          {renderMetrics()}
          {renderSuggestions()}

          <Dialog
            open={isEditing}
            onClose={() => setIsEditing(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Optimize Prompt</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                multiline
                rows={10}
                value={editedTemplate}
                onChange={(e) => setEditedTemplate(e.target.value)}
                sx={{ mb: 2, mt: 2 }}
                label="Prompt Template"
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                value={optimizationNotes}
                onChange={(e) => setOptimizationNotes(e.target.value)}
                label="Optimization Notes"
                helperText="Describe the changes and reasoning"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button 
                onClick={handleSaveOptimization}
                variant="contained"
                disabled={!editedTemplate || !optimizationNotes}
              >
                Save Optimization
              </Button>
            </DialogActions>
          </Dialog>

          {renderHistory()}
        </>
      )}

      <Alert
        severity={alert.severity}
        open={alert.show}
        onClose={() => setAlert({ ...alert, show: false })}
        sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16,
          display: alert.show ? 'flex' : 'none'
        }}
      >
        {alert.message}
      </Alert>
    </Box>
  );
};

export default PromptOptimizer; 