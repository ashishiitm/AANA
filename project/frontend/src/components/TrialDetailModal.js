import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaFlask, FaUserMd, FaMapMarkerAlt, FaUsers, FaClipboardList, FaInfoCircle, FaTimes, FaExternalLinkAlt, FaEnvelope, FaPhone, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { fetchStudyDetails, submitEnrollmentRequest, fetchDoctorByLicense } from '../api';
import AddressAutocomplete from './AddressAutocomplete';
import { Typography, Accordion, AccordionSummary, AccordionDetails, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CircularProgress from '@mui/material/CircularProgress';

const TrialDetailModal = ({ isOpen, onClose, trial }) => {
  // Add debug logging for the trial prop
  console.log('TrialDetailModal received trial:', trial);
  
  const [detailedTrial, setDetailedTrial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [enrollmentType, setEnrollmentType] = useState('patient'); // 'patient' or 'doctor'
  const [enrollmentExpanded, setEnrollmentExpanded] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    termsAccepted: false,
    nct_id: '',
    studyTitle: '',
    // Doctor-specific fields
    licenseState: '',
    licenseNumber: '',
    degrees: '',
    specialty: '',
    experience: '',
    suitabilityStatement: ''
  });
  
  const [enrollmentStatus, setEnrollmentStatus] = useState({
    loading: false,
    error: null,
    success: false
  });
  
  const [doctorSearchStatus, setDoctorSearchStatus] = useState({
    loading: false,
    found: false,
    error: null
  });

  useEffect(() => {
    const fetchDetails = async () => {
      if (trial && (trial.nct_id || trial.id)) {
        try {
          setLoading(true);
          setError(null);
          const studyId = trial.nct_id || trial.id;
          console.log(`Fetching details for study: ${studyId}`);
          const data = await fetchStudyDetails(studyId);
          
          if (data) {
            console.log('Received detailed trial data:', data);
            
            // Merge data with trial data with proper fallbacks
            const mergedData = {
              ...trial,
              ...data,
              // Make sure we have values for all expected fields
              phase: data.phase || trial.phase || 'Not Applicable',
              location: data.location || trial.location || 'Not specified',
              sponsor: data.sponsor || trial.sponsor || 'Not specified',
              start_date: data.start_date || trial.start_date || null,
              completion_date: data.completion_date || trial.completion_date || null,
              enrollment: data.enrollment || trial.enrollment || 'Not specified',
              // Ensure we have eligibility criteria data
              eligibility_criteria: data.eligibility_criteria || trial.eligibility_criteria || 'No eligibility criteria available',
              inclusion_criteria: data.inclusion_criteria || extractInclusionCriteria(data.eligibility_criteria || trial.eligibility_criteria),
              exclusion_criteria: data.exclusion_criteria || extractExclusionCriteria(data.eligibility_criteria || trial.eligibility_criteria)
            };
            
            console.log('Processed trial data for display:', mergedData);
            setDetailedTrial(mergedData);
          } else {
            console.warn('No data returned from fetchStudyDetails');
            setError('Could not retrieve detailed information for this trial');
            // Still use what we have
            setDetailedTrial(trial);
          }
          setLoading(false);
        } catch (error) {
          console.error('Error fetching trial details:', error);
          setError('An error occurred while retrieving trial details');
          // Still use what we have
          setDetailedTrial(trial);
          setLoading(false);
        }
      }
    };
    
    fetchDetails();
  }, [trial]);

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Not specified') {
      return 'Not specified';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original if not a valid date
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddressChange = (addressData) => {
    if (typeof addressData === 'string') {
      setFormData(prev => ({ ...prev, address: addressData }));
    } else {
      setFormData(prev => ({
        ...prev,
        address: addressData.fullAddress,
        streetAddress: addressData.streetAddress,
        city: addressData.city,
        state: addressData.state,
        zipCode: addressData.zipCode,
        coordinates: addressData.coordinates
      }));
    }
  };

  const handleEnrollmentSubmit = async (e) => {
    e.preventDefault();
    setEnrollmentStatus({ loading: true, error: null, success: false });
    
    try {
      // Add enrollment type to the data
      await submitEnrollmentRequest({
        ...formData,
        enrollmentType: enrollmentType
      });
      
      setEnrollmentStatus({
        loading: false,
        error: null,
        success: true
      });
      
      // Reset form
      setFormData({
        ...formData,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        termsAccepted: false,
        // Doctor-specific fields
        licenseState: '',
        licenseNumber: '',
        degrees: '',
        specialty: '',
        experience: '',
        suitabilityStatement: ''
      });
      
      // Close enrollment form after 2 seconds
      setTimeout(() => {
        setShowEnrollForm(false);
        setEnrollmentStatus({ loading: false, error: null, success: false });
      }, 2000);
    } catch (error) {
      setEnrollmentStatus({
        loading: false,
        error: 'Failed to submit enrollment request. Please try again.',
        success: false
      });
    }
  };

  const handleDoctorSearch = async () => {
    if (!formData.licenseState || !formData.licenseNumber) {
      setDoctorSearchStatus({
        loading: false,
        found: false,
        error: "Please enter both license state and number"
      });
      return;
    }
    
    setDoctorSearchStatus({
      loading: true,
      found: false,
      error: null
    });
    
    try {
      const doctorData = await fetchDoctorByLicense(formData.licenseState, formData.licenseNumber);
      
      if (doctorData) {
        setFormData({
          ...formData,
          firstName: doctorData.first_name || '',
          lastName: doctorData.last_name || '',
          email: doctorData.email || '',
          phone: doctorData.phone || '',
          specialty: doctorData.specialty_description || '',
          experience: doctorData.years_experience ? `${doctorData.years_experience} years` : ''
        });
        
        setDoctorSearchStatus({
          loading: false,
          found: true,
          error: null
        });
      } else {
        setDoctorSearchStatus({
          loading: false,
          found: false,
          error: "No doctor found with the provided license information"
        });
      }
    } catch (error) {
      setDoctorSearchStatus({
        loading: false,
        found: false,
        error: "Error searching for doctor information"
      });
    }
  };

  // Helper functions to extract inclusion and exclusion criteria
  const extractInclusionCriteria = (criteria) => {
    if (!criteria) return 'No inclusion criteria available';
    
    // Try to find inclusion criteria section
    const inclusionMatch = criteria.match(/inclusion criteria:?([\s\S]*?)(?:exclusion criteria|$)/i);
    if (inclusionMatch && inclusionMatch[1]) {
      return inclusionMatch[1].trim() || 'No specific inclusion criteria listed';
    }
    
    // If no clear section, look for inclusion-related points
    const lines = criteria.split('\n');
    const inclusionLines = lines.filter(line => 
      line.toLowerCase().includes('include') || 
      line.toLowerCase().includes('eligible') || 
      (line.match(/^\s*-\s+/) && !line.toLowerCase().includes('exclude'))
    );
    
    return inclusionLines.length > 0 
      ? inclusionLines.join('\n') 
      : 'No specific inclusion criteria identified';
  };

  const extractExclusionCriteria = (criteria) => {
    if (!criteria) return 'No exclusion criteria available';
    
    // Try to find exclusion criteria section
    const exclusionMatch = criteria.match(/exclusion criteria:?([\s\S]*?)(?:$)/i);
    if (exclusionMatch && exclusionMatch[1]) {
      return exclusionMatch[1].trim() || 'No specific exclusion criteria listed';
    }
    
    // If no clear section, look for exclusion-related points
    const lines = criteria.split('\n');
    const exclusionLines = lines.filter(line => 
      line.toLowerCase().includes('exclude') || 
      line.toLowerCase().includes('ineligible') ||
      line.toLowerCase().includes('not eligible')
    );
    
    return exclusionLines.length > 0 
      ? exclusionLines.join('\n') 
      : 'No specific exclusion criteria identified';
  };

  if (!isOpen || !trial) return null;

  const displayTrial = detailedTrial || trial;
  const canEnroll = displayTrial.overall_status === 'RECRUITING';

  return (
    <div className={`fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex justify-center items-center ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-white rounded-lg w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">{displayTrial.brief_title || displayTrial.title || 'Clinical Trial Details'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <CircularProgress />
            <Typography variant="body1" className="ml-2">
              Loading trial details...
            </Typography>
          </div>
        ) : (
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                {error}
                <p className="text-sm mt-1">Showing basic information only.</p>
              </div>
            )}
            
            {/* Brief Summary */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaInfoCircle className="mr-2 text-blue-600" />
                Brief Summary
              </h3>
              <p className="text-gray-700 whitespace-pre-line">{displayTrial.brief_summary || 'No summary available'}</p>
            </section>

            {/* Key Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Left Column */}
              <div>
                <div className="flex items-start mb-4">
                  <FaFlask className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Phase</h4>
                    <p className="text-gray-700">{displayTrial.phase || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-start mb-4">
                  <FaMapMarkerAlt className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Location</h4>
                    <p className="text-gray-700">{displayTrial.location || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-start mb-4">
                  <FaUsers className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Enrollment</h4>
                    <p className="text-gray-700">{displayTrial.enrollment || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              
              {/* Right Column */}
              <div>
                <div className="flex items-start mb-4">
                  <FaCalendarAlt className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Start Date</h4>
                    <p className="text-gray-700">{displayTrial.start_date || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-start mb-4">
                  <FaCalendarAlt className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Completion Date</h4>
                    <p className="text-gray-700">{displayTrial.completion_date || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-start mb-4">
                  <FaUserMd className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Sponsor</h4>
                    <p className="text-gray-700">{displayTrial.sponsor || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Eligibility Criteria */}
            <section className="mb-8">
              <Typography variant="h6" gutterBottom>
                Eligibility Criteria
              </Typography>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Inclusion Criteria</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                    {displayTrial.inclusion_criteria || 'No inclusion criteria available'}
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Exclusion Criteria</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                    {displayTrial.exclusion_criteria || 'No exclusion criteria available'}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </section>

            {/* Eligibility Criteria */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaClipboardList className="mr-2 text-blue-600" />
                Eligibility Criteria
              </h3>
              
              <Accordion 
                expanded={enrollmentExpanded} 
                onChange={() => setEnrollmentExpanded(!enrollmentExpanded)}
                sx={{ width: enrollmentExpanded ? '100%' : 'auto' }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Enrollment</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ width: '100%' }}>
                  <Box sx={{ width: '100%' }}>
                    {/* Enrollment form content */}
                    {showEnrollForm ? (
                      <div className="mt-8 border-t pt-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Enrollment Request Form</h3>
                        
                        {enrollmentStatus.success ? (
                          <div className="bg-green-50 text-green-800 p-4 rounded-md">
                            Your enrollment request has been submitted successfully! We will contact you soon.
                          </div>
                        ) : (
                          <form onSubmit={handleEnrollmentSubmit}>
                            {/* Enrollment Type Selection */}
                            <div className="mb-6">
                              <div className="flex space-x-4">
                                <button
                                  type="button"
                                  onClick={() => setEnrollmentType('patient')}
                                  className={`px-4 py-2 rounded-lg ${
                                    enrollmentType === 'patient' 
                                      ? 'bg-blue-500 text-white' 
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  Enroll as Patient
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEnrollmentType('doctor')}
                                  className={`px-4 py-2 rounded-lg ${
                                    enrollmentType === 'doctor' 
                                      ? 'bg-blue-500 text-white' 
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  Enroll as Healthcare Provider
                                </button>
                              </div>
                            </div>
                            
                            {/* Doctor-specific license search */}
                            {enrollmentType === 'doctor' && (
                              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-semibold text-gray-800 mb-2">License Information</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                  Enter your license information to pre-fill your details
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                      License State*
                                    </label>
                                    <input
                                      type="text"
                                      name="licenseState"
                                      value={formData.licenseState}
                                      onChange={handleInputChange}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      maxLength="2"
                                      placeholder="e.g. CA"
                                      required={enrollmentType === 'doctor'}
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                      License Number*
                                    </label>
                                    <input
                                      type="text"
                                      name="licenseNumber"
                                      value={formData.licenseNumber}
                                      onChange={handleInputChange}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="Enter license number"
                                      required={enrollmentType === 'doctor'}
                                    />
                                  </div>
                                </div>
                                
                                <button
                                  type="button"
                                  onClick={handleDoctorSearch}
                                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
                                  disabled={!formData.licenseState || !formData.licenseNumber || doctorSearchStatus.loading}
                                >
                                  {doctorSearchStatus.loading ? (
                                    <>
                                      <FaSpinner className="inline-block animate-spin mr-2" />
                                      Searching...
                                    </>
                                  ) : (
                                    'Find My Information'
                                  )}
                                </button>
                                
                                {doctorSearchStatus.found && (
                                  <div className="mt-2 text-sm text-green-600">
                                    <FaCheck className="inline-block mr-1" /> Information found and pre-filled
                                  </div>
                                )}
                                
                                {doctorSearchStatus.error && (
                                  <div className="mt-2 text-sm text-red-600">
                                    {doctorSearchStatus.error}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Common fields for both patient and doctor */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                  First Name*
                                </label>
                                <input
                                  type="text"
                                  name="firstName"
                                  value={formData.firstName}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                  Last Name*
                                </label>
                                <input
                                  type="text"
                                  name="lastName"
                                  value={formData.lastName}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                  Email*
                                </label>
                                <input
                                  type="email"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                  Phone*
                                </label>
                                <input
                                  type="tel"
                                  name="phone"
                                  value={formData.phone}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                />
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <label className="block text-gray-700 text-sm font-medium mb-1">
                                Address
                              </label>
                              <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="col-span-2">
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                  City
                                </label>
                                <input
                                  type="text"
                                  name="city"
                                  value={formData.city}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                  State
                                </label>
                                <input
                                  type="text"
                                  name="state"
                                  value={formData.state}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  maxLength="2"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                  ZIP Code
                                </label>
                                <input
                                  type="text"
                                  name="zipCode"
                                  value={formData.zipCode}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                            
                            {/* Doctor-specific fields */}
                            {enrollmentType === 'doctor' && (
                              <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                      Degrees/Certifications*
                                    </label>
                                    <input
                                      type="text"
                                      name="degrees"
                                      value={formData.degrees}
                                      onChange={handleInputChange}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="e.g. MD, PhD, MBBS"
                                      required={enrollmentType === 'doctor'}
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                      Specialty*
                                    </label>
                                    <input
                                      type="text"
                                      name="specialty"
                                      value={formData.specialty}
                                      onChange={handleInputChange}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="e.g. Cardiology, Oncology"
                                      required={enrollmentType === 'doctor'}
                                    />
                                  </div>
                                </div>
                                
                                <div className="mb-4">
                                  <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Previous Experience as Investigator*
                                  </label>
                                  <textarea
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="2"
                                    placeholder="Briefly describe your previous experience with clinical trials"
                                    required={enrollmentType === 'doctor'}
                                  ></textarea>
                                </div>
                                
                                <div className="mb-4">
                                  <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Why are you suitable for this trial?*
                                  </label>
                                  <textarea
                                    name="suitabilityStatement"
                                    value={formData.suitabilityStatement}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Explain why you believe you would be a good investigator for this trial"
                                    required={enrollmentType === 'doctor'}
                                  ></textarea>
                                </div>
                              </>
                            )}
                            
                            <div className="mb-6">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  name="termsAccepted"
                                  checked={formData.termsAccepted}
                                  onChange={handleInputChange}
                                  className="mr-2"
                                  required
                                />
                                <span className="text-sm text-gray-700">
                                  I understand that submitting this form does not guarantee {enrollmentType === 'patient' ? 'enrollment in' : 'selection as an investigator for'} the trial.
                                </span>
                              </label>
                            </div>
                            
                            {enrollmentStatus.error && (
                              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
                                <FaExclamationTriangle className="inline-block mr-2" />
                                {enrollmentStatus.error}
                              </div>
                            )}
                            
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => setShowEnrollForm(false)}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 mr-2"
                              >
                                Cancel
                              </button>
                              
                              <button
                                type="submit"
                                className={`px-4 py-2 bg-blue-500 text-white rounded-md ${
                                  enrollmentStatus.loading || !formData.termsAccepted ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-600'
                                }`}
                                disabled={enrollmentStatus.loading || !formData.termsAccepted}
                              >
                                {enrollmentStatus.loading ? (
                                  <>
                                    <FaSpinner className="inline-block animate-spin mr-2" />
                                    Submitting...
                                  </>
                                ) : (
                                  `Submit ${enrollmentType === 'patient' ? 'Enrollment' : 'Application'}`
                                )}
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    ) : (
                      <div className="mt-8 border-t pt-8 flex justify-between items-center">
                        <div className="text-gray-600">
                          {canEnroll ? (
                            <p>This trial is currently recruiting participants.</p>
                          ) : (
                            <p>This trial is not currently recruiting participants.</p>
                          )}
                        </div>
                        
                        {canEnroll && (
                          <button
                            onClick={() => setShowEnrollForm(true)}
                            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium transition-colors duration-300"
                          >
                            Enroll Now
                          </button>
                        )}
                      </div>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrialDetailModal; 