import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Tooltip,
  CircularProgress
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import format from 'date-fns/format';
import { markResultReviewed } from '../../api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`results-tabpanel-${index}`}
      aria-labelledby={`results-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `results-tab-${index}`,
    'aria-controls': `results-tabpanel-${index}`,
  };
}

const ArticleCard = ({ result, onReviewed, onRefresh }) => {
  const { article, is_reviewed, notes } = result;
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState(notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenArticle = () => {
    window.open(article.url, '_blank');
  };

  const handleToggleNotes = () => {
    setShowNotes(!showNotes);
  };

  const handleMarkReviewed = async () => {
    try {
      setIsSubmitting(true);
      await markResultReviewed(result.id, noteText);
      onReviewed(result.id);
      onRefresh();
    } catch (error) {
      console.error('Error marking result as reviewed:', error);
    } finally {
      setIsSubmitting(false);
      setShowNotes(false);
    }
  };

  return (
    <Card 
      sx={{ 
        mb: 3, 
        borderLeft: 6, 
        borderColor: is_reviewed ? 'success.main' : 'primary.main',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" component="div" gutterBottom>
            {article.title}
          </Typography>
          
          {is_reviewed && (
            <Tooltip title="Reviewed">
              <CheckCircleIcon color="success" />
            </Tooltip>
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Authors:</strong> {article.authors_list?.join(', ') || 'Unknown'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Journal:</strong> {article.journal} | <strong>Published:</strong> {format(new Date(article.publication_date), 'MMM d, yyyy')}
        </Typography>
        
        <Typography variant="body2" paragraph sx={{ mt: 2 }}>
          {article.abstract?.substring(0, 300)}
          {article.abstract?.length > 300 ? '...' : ''}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          {article.keywords_list?.slice(0, 5).map((keyword, index) => (
            <Chip 
              key={index} 
              label={keyword} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          ))}
          
          {article.mesh_terms_list?.slice(0, 3).map((term, index) => (
            <Chip 
              key={`mesh-${index}`} 
              label={term} 
              size="small" 
              color="secondary" 
              variant="outlined" 
            />
          ))}
        </Box>
        
        {notes && !showNotes && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Notes:</strong> {notes}
            </Typography>
          </Box>
        )}
        
        {showNotes && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Review Notes"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              variant="outlined"
              placeholder="Add your notes about this article..."
            />
          </Box>
        )}
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ justifyContent: 'space-between' }}>
        <Box>
          <Button 
            startIcon={<OpenInNewIcon />} 
            onClick={handleOpenArticle}
          >
            View on PubMed
          </Button>
          
          <Button 
            startIcon={showNotes ? <BookmarkIcon /> : <BookmarkBorderIcon />} 
            onClick={handleToggleNotes}
            color={showNotes ? 'secondary' : 'primary'}
          >
            {showNotes ? 'Cancel' : (notes ? 'Edit Notes' : 'Add Notes')}
          </Button>
        </Box>
        
        {!is_reviewed && (
          <Button 
            variant="contained" 
            color="success" 
            onClick={handleMarkReviewed}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Mark as Reviewed'}
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

const SearchResults = ({ results, searchRule, onRefresh }) => {
  const [tabValue, setTabValue] = useState(0);
  const [reviewedResults, setReviewedResults] = useState([]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleResultReviewed = (resultId) => {
    setReviewedResults([...reviewedResults, resultId]);
  };

  // Filter results
  const unreviewedResults = results.filter(result => 
    !result.is_reviewed && !reviewedResults.includes(result.id)
  );
  
  const reviewedResultsList = results.filter(result => 
    result.is_reviewed || reviewedResults.includes(result.id)
  );

  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="search results tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={`Unreviewed (${unreviewedResults.length})`} 
            {...a11yProps(0)} 
          />
          <Tab 
            label={`Reviewed (${reviewedResultsList.length})`} 
            {...a11yProps(1)} 
          />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          {unreviewedResults.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No unreviewed articles found.
            </Typography>
          ) : (
            unreviewedResults.map(result => (
              <ArticleCard 
                key={result.id} 
                result={result} 
                onReviewed={handleResultReviewed}
                onRefresh={onRefresh}
              />
            ))
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {reviewedResultsList.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No reviewed articles found.
            </Typography>
          ) : (
            reviewedResultsList.map(result => (
              <ArticleCard 
                key={result.id} 
                result={result} 
                onReviewed={handleResultReviewed}
                onRefresh={onRefresh}
              />
            ))
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default SearchResults; 