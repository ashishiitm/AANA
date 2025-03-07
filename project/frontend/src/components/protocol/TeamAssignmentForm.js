import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  Divider,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Autocomplete,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ScienceIcon from '@mui/icons-material/Science';
import { alpha } from '@mui/material/styles';

// Team role options
const roleOptions = [
  { value: 'principal_investigator', label: 'Principal Investigator', icon: <PersonIcon /> },
  { value: 'co_investigator', label: 'Co-Investigator', icon: <PersonIcon /> },
  { value: 'study_coordinator', label: 'Study Coordinator', icon: <GroupsIcon /> },
  { value: 'clinical_research_associate', label: 'Clinical Research Associate', icon: <LocalHospitalIcon /> },
  { value: 'biostatistician', label: 'Biostatistician', icon: <ScienceIcon /> },
  { value: 'data_manager', label: 'Data Manager', icon: <ScienceIcon /> },
  { value: 'pharmacist', label: 'Pharmacist', icon: <LocalHospitalIcon /> },
  { value: 'regulatory_specialist', label: 'Regulatory Specialist', icon: <GroupsIcon /> },
  { value: 'medical_monitor', label: 'Medical Monitor', icon: <LocalHospitalIcon /> },
  { value: 'other', label: 'Other', icon: <PersonIcon /> },
];

// Mock team members (would come from your user database in production)
const mockTeamMembers = [
  { id: 1, name: 'Dr. Sarah Johnson', email: 'sarah.johnson@example.com', specialization: 'Oncology', department: 'Clinical Research', organization: 'Memorial Hospital' },
  { id: 2, name: 'Dr. Michael Chen', email: 'michael.chen@example.com', specialization: 'Cardiology', department: 'Medicine', organization: 'University Medical Center' },
  { id: 3, name: 'Amanda Garcia', email: 'amanda.garcia@example.com', specialization: 'Project Management', department: 'Clinical Operations', organization: 'BioResearch Inc' },
  { id: 4, name: 'Dr. Robert Williams', email: 'robert.williams@example.com', specialization: 'Neurology', department: 'Clinical Research', organization: 'Memorial Hospital' },
  { id: 5, name: 'Jennifer Smith', email: 'jennifer.smith@example.com', specialization: 'Biostatistics', department: 'Data Science', organization: 'PharmCo' },
  { id: 6, name: 'Dr. Emily Thompson', email: 'emily.thompson@example.com', specialization: 'Pharmacology', department: 'Drug Development', organization: 'BioResearch Inc' },
  { id: 7, name: 'David Park', email: 'david.park@example.com', specialization: 'Regulatory Affairs', department: 'Compliance', organization: 'PharmCo' },
];

// Get color for role chip
const getRoleColor = (role) => {
  const colorMap = {
    principal_investigator: '#4caf50',
    co_investigator: '#8bc34a',
    study_coordinator: '#2196f3',
    clinical_research_associate: '#03a9f4',
    biostatistician: '#9c27b0',
    data_manager: '#673ab7',
    pharmacist: '#ff9800',
    regulatory_specialist: '#795548',
    medical_monitor: '#f44336',
    other: '#607d8b',
  };
  
  return colorMap[role] || '#607d8b';
};

const TeamAssignmentForm = ({ data = {}, onUpdate, trialBasics }) => {
  // Initialize form state with provided data or defaults
  const [formState, setFormState] = useState({
    teamMembers: data.teamMembers || [],
    ...data
  });

  // State for new team member assignment
  const [newAssignment, setNewAssignment] = useState({
    teamMember: null,
    role: '',
    responsibilities: '',
    customRole: ''
  });

  // State for add external member dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [externalMember, setExternalMember] = useState({
    name: '',
    email: '',
    specialization: '',
    department: '',
    organization: ''
  });

  // Update parent component when form state changes
  useEffect(() => {
    onUpdate(formState);
  }, [formState, onUpdate]);

  // Handle team member selection
  const handleTeamMemberChange = (event, newValue) => {
    setNewAssignment(prev => ({
      ...prev,
      teamMember: newValue
    }));
  };

  // Handle role selection
  const handleRoleChange = (event) => {
    setNewAssignment(prev => ({
      ...prev,
      role: event.target.value
    }));
  };

  // Handle responsibilities input
  const handleResponsibilitiesChange = (event) => {
    setNewAssignment(prev => ({
      ...prev,
      responsibilities: event.target.value
    }));
  };

  // Handle custom role input
  const handleCustomRoleChange = (event) => {
    setNewAssignment(prev => ({
      ...prev,
      customRole: event.target.value
    }));
  };

  // Add new team member assignment
  const addTeamMemberAssignment = () => {
    if (newAssignment.teamMember && newAssignment.role) {
      const role = newAssignment.role === 'other' 
        ? newAssignment.customRole 
        : roleOptions.find(r => r.value === newAssignment.role)?.label;
      
      const assignment = {
        id: `team-${Date.now()}`,
        memberId: newAssignment.teamMember.id,
        memberName: newAssignment.teamMember.name,
        memberEmail: newAssignment.teamMember.email,
        memberSpecialization: newAssignment.teamMember.specialization,
        memberDepartment: newAssignment.teamMember.department,
        memberOrganization: newAssignment.teamMember.organization,
        role: newAssignment.role,
        roleDisplay: role,
        responsibilities: newAssignment.responsibilities
      };
      
      setFormState(prev => ({
        ...prev,
        teamMembers: [...prev.teamMembers, assignment]
      }));
      
      // Reset the form
      setNewAssignment({
        teamMember: null,
        role: '',
        responsibilities: '',
        customRole: ''
      });
    }
  };

  // Remove a team member assignment
  const removeTeamMemberAssignment = (id) => {
    setFormState(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(member => member.id !== id)
    }));
  };

  // Open dialog to add external team member
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle external member form changes
  const handleExternalMemberChange = (field) => (event) => {
    setExternalMember(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Add external team member
  const addExternalMember = () => {
    // Create a new member object with a unique ID
    const newMember = {
      id: `external-${Date.now()}`,
      ...externalMember
    };
    
    // Add to mockTeamMembers (in a real app, you would add to your database)
    mockTeamMembers.push(newMember);
    
    // Set as selected member
    setNewAssignment(prev => ({
      ...prev,
      teamMember: newMember
    }));
    
    // Reset form and close dialog
    setExternalMember({
      name: '',
      email: '',
      specialization: '',
      department: '',
      organization: ''
    });
    setOpenDialog(false);
  };

  // Format string for the team members whose specialties match the therapeutic area
  const getRecommendedSpecialists = () => {
    if (!trialBasics?.therapeuticArea) return '';
    
    const matchingMembers = mockTeamMembers.filter(member => 
      member.specialization.toLowerCase().includes(trialBasics.therapeuticArea.toLowerCase())
    );
    
    return matchingMembers.length > 0 
      ? `Recommended specialists: ${matchingMembers.map(m => m.name).join(', ')}`
      : '';
  };

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Team Assignment
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Assign team members to roles in your study protocol.
        </Typography>
        
        {trialBasics?.therapeuticArea && (
          <Chip 
            label={`${trialBasics.therapeuticArea}`}
            color="primary" 
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          />
        )}
        {trialBasics?.phase && (
          <Chip 
            label={trialBasics.phase}
            color="primary" 
            variant="outlined"
            size="small"
          />
        )}
      </Box>

      {/* Team Member Assignment Form */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Add Team Member
            <Tooltip title="Assign a team member to a specific role within your study">
              <IconButton size="small">
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Autocomplete
                    options={mockTeamMembers}
                    getOptionLabel={(option) => option.name}
                    value={newAssignment.teamMember}
                    onChange={handleTeamMemberChange}
                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Select Team Member" 
                        required
                        helperText={getRecommendedSpecialists()} 
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body1">{option.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.specialization}, {option.organization}
                          </Typography>
                        </Box>
                      </li>
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={handleOpenDialog}
                    sx={{ height: '56px' }}
                  >
                    Add External
                  </Button>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth required>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={newAssignment.role}
                      onChange={handleRoleChange}
                      label="Role"
                    >
                      {roleOptions.map((role) => (
                        <MenuItem key={role.value} value={role.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ mr: 1 }}>{role.icon}</Box>
                            {role.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  {newAssignment.role === 'other' && (
                    <TextField
                      fullWidth
                      required
                      label="Custom Role"
                      value={newAssignment.customRole}
                      onChange={handleCustomRoleChange}
                    />
                  )}
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Responsibilities"
                    placeholder="Describe this team member's specific responsibilities in the study"
                    value={newAssignment.responsibilities}
                    onChange={handleResponsibilitiesChange}
                  />
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={addTeamMemberAssignment}
                    disabled={!newAssignment.teamMember || !newAssignment.role || (newAssignment.role === 'other' && !newAssignment.customRole)}
                  >
                    Add Team Member
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Team Member List */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Team Composition
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Box>

          {formState.teamMembers.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ my: 2, textAlign: 'center', fontStyle: 'italic' }}>
              No team members assigned yet
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {formState.teamMembers.map((member) => (
                <Grid item xs={12} md={6} key={member.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            sx={{
                              mr: 2,
                              bgcolor: alpha(getRoleColor(member.role), 0.8)
                            }}
                          >
                            {member.memberName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1">{member.memberName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {member.memberSpecialization}, {member.memberOrganization}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Chip
                                label={member.roleDisplay}
                                size="small"
                                sx={{
                                  bgcolor: alpha(getRoleColor(member.role), 0.1),
                                  color: getRoleColor(member.role),
                                  fontWeight: 500,
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>
                        <IconButton
                          edge="end"
                          onClick={() => removeTeamMemberAssignment(member.id)}
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      {member.responsibilities && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Responsibilities:</strong> {member.responsibilities}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
      
      {/* External Team Member Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add External Team Member</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Add a team member who is not yet in the system.
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Name"
                value={externalMember.name}
                onChange={handleExternalMemberChange('name')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Email"
                type="email"
                value={externalMember.email}
                onChange={handleExternalMemberChange('email')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Specialization"
                value={externalMember.specialization}
                onChange={handleExternalMemberChange('specialization')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                value={externalMember.department}
                onChange={handleExternalMemberChange('department')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Organization"
                value={externalMember.organization}
                onChange={handleExternalMemberChange('organization')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={addExternalMember}
            disabled={!externalMember.name || !externalMember.email || !externalMember.specialization || !externalMember.organization}
            variant="contained"
          >
            Add Member
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TeamAssignmentForm; 