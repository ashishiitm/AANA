import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaShare } from 'react-icons/fa';
import axios from 'axios';

const EnrollmentModal = ({ isOpen, onClose, trial }) => {
  console.log('Received trial prop in EnrollmentModal:', trial);  // Debug the trial prop
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    conditionDescription: '',
    termsAccepted: false,
    licenseState: '',
    licenseNumber: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [doctorData, setDoctorData] = useState(null);  // Store fetched doctor data
  const [studyData, setStudyData] = useState(trial);  // Store study data locally

  useEffect(() => {
    if (isOpen && trial.nct_id) {
      // Validate NCT ID format (starts with "NCT" followed by numbers)
      const isValidNctId = /^NCT\d+$/i.test(trial.nct_id);
      if (!isValidNctId) {
        console.error('Invalid NCT ID format:', trial.nct_id);
        setError('Invalid NCT ID format. Must start with "NCT" followed by numbers.');
        return;
      }

      const apiUrl = `http://localhost:8000/api/studies/${trial.nct_id}/`;
      console.log('Fetching study details from:', apiUrl);
      setLoading(true);
      axios.get(apiUrl)
        .then(response => {
          console.log('API response for study:', response.data);
          setStudyData(response.data);  // Update study data with the API response
          setError(null);
        })
        .catch(error => {
          console.error('Error fetching study details:', error);
          setError(error.response?.data?.error || 'Failed to fetch study details');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, trial.nct_id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFindDoctor = async () => {
    const { licenseState, licenseNumber } = formData;
    if (!licenseState || !licenseNumber) {
      setError('License state and number are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:8000/api/doctors/license/?state=${encodeURIComponent(licenseState.toUpperCase().trim())}&number=${encodeURIComponent(licenseNumber.trim())}`
      );
      const doctor = response.data;

      if (doctor.doctor_id) {
        setDoctorData(doctor);
        setFormData(prev => ({
          ...prev,
          name: `${doctor.first_name} ${doctor.last_name}`,
          email: doctor.email || '',
          phone: doctor.phone || '',
          specialty_description: doctor.specialty_description || '',
        }));
        setError(null);  // Clear any previous errors
      }
    } catch (error) {
      setError(error.response?.status === 404 
        ? 'No doctor found with the provided license information' 
        : 'An error occurred while fetching doctor information');
      setDoctorData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/enrollment/request/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nct_id: studyData?.nct_id || studyData?.study_id,
          study_id: studyData?.study_id,
          ...formData,
          specialty_description: formData.specialty_description || doctorData?.specialty_description,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit enrollment request');
      }
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          conditionDescription: '',
          termsAccepted: false,
          licenseState: '',
          licenseNumber: '',
        });
        setDoctorData(null);  // Reset doctor data
        setStudyData(null);   // Reset study data
      }, 3000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleShare = () => {
    // Trigger the share modal event
    const shareEvent = new CustomEvent('openShareModal', { 
      detail: { 
        trial: studyData || trial 
      } 
    });
    window.dispatchEvent(shareEvent);
  };
  
  if (!isOpen) return null;
  
  console.log('Study data in EnrollmentModal:', studyData);  // Debug studyData
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Enroll in Clinical Trial</h2>
            <p className="text-sm text-gray-600">NCT ID: {studyData?.nct_id || studyData?.study_id || 'Not specified'}</p>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleShare}
              className="mr-3 text-blue-600 hover:text-blue-800 focus:outline-none flex items-center bg-blue-50 hover:bg-blue-100 transition-colors p-2 rounded-full"
              title="Share this trial"
            >
              <FaShare size={16} />
            </button>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>
        
        {/* Modal Body */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="text-green-600 text-xl mb-4">✓</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Enrollment Request Submitted!</h3>
              <p className="text-gray-600">
                Thank you for your interest. You will receive a confirmation email shortly.
              </p>
            </div>
          ) : (
            <>
              {loading && (
                <div className="flex justify-center items-center py-8">
                  <FaSpinner className="animate-spin text-blue-600" size={24} />
                </div>
              )}
              {error && (
                <div className="text-red-600 text-sm p-3 bg-red-50 rounded-md mb-4">
                  {error}
                </div>
              )}
              {!loading && !error && (
                <form onSubmit={handleSubmit}>
                  {/* Study Information */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-800 mb-2">{studyData?.official_title || studyData?.title || 'No title provided'}</h3>
                      <button
                        type="button"
                        onClick={handleShare}
                        className="text-blue-600 hover:text-blue-800 focus:outline-none flex items-center bg-white hover:bg-blue-50 transition-colors p-1.5 rounded-md border border-blue-200 shadow-sm"
                        title="Share this trial"
                      >
                        <FaShare size={14} className="mr-1" />
                        <span className="text-xs font-medium">Share</span>
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">{studyData?.brief_summary || 'No summary provided'}</p>
                    
                    {/* Additional Study Details */}
                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      <p><strong>Status:</strong> {studyData?.overall_status || 'Not specified'}</p>
                      <p><strong>Phase:</strong> {studyData?.phase || 'Phase not provided'}</p>
                      <p><strong>Location:</strong> {studyData?.location || 'Not specified'}</p>
                      <p><strong>Start Date:</strong> {studyData?.start_date ? new Date(studyData.start_date).toLocaleDateString() : 'Not specified'}</p>
                      <p><strong>Completion Date:</strong> {studyData?.completion_date ? new Date(studyData.completion_date).toLocaleDateString() : 'Not specified'}</p>
                      <p><strong>Sponsor:</strong> {studyData?.sponsor || 'Not specified'}</p>
                      <p><strong>Enrollment:</strong> {studyData?.enrollment || 'Not specified'}</p>
                      
                      {/* Eligibility Criteria */}
                      <div className="mt-2">
                        <h4 className="font-medium text-gray-800">Eligibility Criteria</h4>
                        {studyData?.eligibility_criteria && (studyData.eligibility_criteria.inclusion?.length > 0 || studyData.eligibility_criteria.exclusion?.length > 0) ? (
                          <>
                            {studyData.eligibility_criteria.inclusion?.length > 0 && (
                              <div>
                                <h5 className="font-semibold text-gray-700 mt-2">Inclusion Criteria:</h5>
                                <ul className="list-disc pl-5 text-gray-600">
                                  {studyData.eligibility_criteria.inclusion.map((criterion, index) => (
                                    <li key={index}>{criterion || 'Not specified'}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {studyData.eligibility_criteria.exclusion?.length > 0 && (
                              <div>
                                <h5 className="font-semibold text-gray-700 mt-2">Exclusion Criteria:</h5>
                                <ul className="list-disc pl-5 text-gray-600">
                                  {studyData.eligibility_criteria.exclusion.map((criterion, index) => (
                                    <li key={index}>{criterion || 'Not specified'}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-600">No eligibility criteria specified</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* License Information Section */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">License Information</h3>
                    <p className="text-sm text-gray-600 mb-2">Enter your license information to pre-fill your details</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          License State *
                        </label>
                        <input
                          type="text"
                          name="licenseState"
                          value={formData.licenseState}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          License Number *
                        </label>
                        <input
                          type="text"
                          name="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleFindDoctor}
                      disabled={loading}
                      className={`mt-4 w-full py-2 px-4 rounded-md text-white font-medium ${
                        loading 
                          ? 'bg-blue-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <FaSpinner className="animate-spin mr-2" />
                          Loading...
                        </span>
                      ) : (
                        'Find My Information'
                      )}
                    </button>
                  </div>
                  
                  {/* Form Fields (Auto-populated if doctor found) */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name.split(' ')[0] || ''}  // Split name to get first name
                          onChange={(e) => handleChange({ target: { name: 'name', value: `${e.target.value} ${formData.name.split(' ')[1] || ''}`.trim() }})}
                          required
                          disabled={!!doctorData}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name.split(' ')[1] || ''}  // Split name to get last name
                          onChange={(e) => handleChange({ target: { name: 'name', value: `${formData.name.split(' ')[0] || ''} ${e.target.value}`.trim() }})}
                          required
                          disabled={!!doctorData}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={!!doctorData}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        disabled={!!doctorData}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={[
                          doctorData?.address.address_line1 || '',
                          doctorData?.address.address_line2 || '',
                          doctorData?.address.city || '',
                          doctorData?.address.state || '',
                          doctorData?.address.zip_code || ''
                        ].filter(Boolean).join(', ')}
                        onChange={handleChange}
                        disabled={!!doctorData}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Degrees/Certifications *
                        </label>
                        <input
                          type="text"
                          name="degrees"
                          value={formData.degrees || ''}  // Placeholder for degrees (not fetched from backend currently)
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Specialty *
                        </label>
                        <input
                          type="text"
                          name="specialty_description"
                          value={formData.specialty_description}
                          onChange={handleChange}
                          required
                          disabled={!!doctorData}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Previous Experience as Investigator *
                      </label>
                      <textarea
                        name="investigatorExperience"
                        value={formData.investigatorExperience || ''}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Describe your condition (max 500 words) *
                      </label>
                      <textarea
                        name="conditionDescription"
                        value={formData.conditionDescription}
                        onChange={handleChange}
                        required
                        maxLength={5000}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {formData.conditionDescription.split(' ').length}/500 words
                      </p>
                    </div>
                    
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        name="termsAccepted"
                        checked={formData.termsAccepted}
                        onChange={handleChange}
                        required
                        className="mt-1 mr-2"
                      />
                      <label className="text-sm text-gray-600">
                        I understand that this is an application for consideration and does not guarantee enrollment.
                        I agree to be contacted regarding this clinical trial and confirm that all provided information is accurate. *
                      </label>
                    </div>
                    
                    {error && (
                      <div className="text-red-600 text-sm p-3 bg-red-50 rounded-md">
                        {error}
                      </div>
                    )}
                  </div>
                  
                  {/* Submit Button */}
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={loading || !formData.termsAccepted || !formData.conditionDescription || !formData.investigatorExperience || !formData.degrees || !formData.specialty_description}
                      className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                        loading || !formData.termsAccepted || !formData.conditionDescription || !formData.investigatorExperience || !formData.degrees || !formData.specialty_description
                          ? 'bg-blue-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <FaSpinner className="animate-spin mr-2" />
                          Submitting...
                        </span>
                      ) : (
                        'Submit Enrollment Request'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrollmentModal;