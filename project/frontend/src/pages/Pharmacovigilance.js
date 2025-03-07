import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Button, Paper, Table, 
  TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Chip, IconButton, Grid, TextField, InputAdornment
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { fetchSearchRules, deleteSearchRule } from '../api';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import format from 'date-fns/format';

const Pharmacovigilance = () => {
  const [searchRules, setSearchRules] = useState([]);
  const [filteredRules, setFilteredRules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSearchRules = async () => {
      try {
        setLoading(true);
        const data = await fetchSearchRules();
        setSearchRules(data);
        setFilteredRules(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading search rules:', err);
        setError('Failed to load search rules. Please try again later.');
        setLoading(false);
      }
    };

    loadSearchRules();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRules(searchRules);
    } else {
      const filtered = searchRules.filter(rule => 
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.drug_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRules(filtered);
    }
  }, [searchTerm, searchRules]);

  const handleDeleteRule = async (id) => {
    if (window.confirm('Are you sure you want to delete this search rule?')) {
      try {
        const success = await deleteSearchRule(id);
        if (success) {
          setSearchRules(prevRules => prevRules.filter(rule => rule.id !== id));
        } else {
          setError('Failed to delete search rule. Please try again.');
        }
      } catch (err) {
        console.error('Error deleting search rule:', err);
        setError('Failed to delete search rule. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'default';
      case 'ARCHIVED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Pharmacovigilance
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/pharmacovigilance/create-rule"
        >
          Create New Rule
        </Button>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#ffebee' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Search Rules
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name, drug, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Typography>Loading search rules...</Typography>
        ) : filteredRules.length === 0 ? (
          <Typography>No search rules found. Create your first rule to get started.</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Drug</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Run</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <Typography variant="body1">{rule.name}</Typography>
                      {rule.description && (
                        <Typography variant="body2" color="textSecondary" noWrap>
                          {rule.description.length > 50 
                            ? `${rule.description.substring(0, 50)}...` 
                            : rule.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{rule.drug_name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={rule.status} 
                        color={getStatusColor(rule.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{formatDate(rule.last_run)}</TableCell>
                    <TableCell>
                      <IconButton 
                        component={RouterLink} 
                        to={`/pharmacovigilance/results/${rule.id}`}
                        title="View Results"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton 
                        component={RouterLink} 
                        to={`/pharmacovigilance/edit-rule/${rule.id}`}
                        title="Edit Rule"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteRule(rule.id)}
                        title="Delete Rule"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default Pharmacovigilance; 