// src/pages/StudyDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaMapMarkerAlt, FaCalendarAlt, FaEnvelope, FaPhone, FaArrowLeft } from 'react-icons/fa';
import TrialMap from '../components/TrialMap';

function StudyDetail() {
  const { studyId } = useParams();
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchStudy = async () => {
      try {
        const response = await axios.get(`/api/study/${studyId}`);
        setStudy(response.data);
      } catch (error) {
        console.error('Error fetching study:', error);
      }
      setLoading(false);
    };
    fetchStudy();
  }, [studyId]);

  if (loading) return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">Loading study details...</span>
    </div>
  );
  
  if (!study) return (
    <div className="container mx-auto px-4 py-12 text-center">
      <div className="bg-red-50 text-red-600 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-2">Study Not Found</h2>
        <p>The study you're looking for could not be found. Please check the ID and try again.</p>
        <Link 
          to="/"
          className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Back to Search
        </Link>
      </div>
    </div>
  );

  // Format contact persons for display
  const contactPersons = study.contacts || [];

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:text-blue-800 flex items-center">
            <FaArrowLeft className="mr-2" /> Back to Search
          </Link>
        </div>

        {/* Study Header */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{study.official_title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="inline-flex items-center">
                  <FaCalendarAlt className="mr-1 text-blue-600" /> {study.start_date || 'Date not specified'}
                </span>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                  {study.overall_status}
                </span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="text-sm text-gray-500">Study ID: {study.study_id}</span>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap ${
                activeTab === 'overview' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('eligibility')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap ${
                activeTab === 'eligibility' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Eligibility
            </button>
            <button 
              onClick={() => setActiveTab('locations')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap ${
                activeTab === 'locations' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Locations
            </button>
            <button 
              onClick={() => setActiveTab('contacts')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap ${
                activeTab === 'contacts' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Contacts
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Study Overview</h2>
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Condition</h3>
                <p className="text-gray-600">{study.condition || 'Not specified'}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Brief Summary</h3>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-md leading-relaxed">
                  {study.brief_summary || 'No summary available'}
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Detailed Description</h3>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-md leading-relaxed whitespace-pre-line">
                  {study.detailed_description || 'No detailed description available'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Study Type</h3>
                  <p className="text-gray-600">{study.study_type || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Phase</h3>
                  <p className="text-gray-600">{study.phase || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Eligibility Tab */}
          {activeTab === 'eligibility' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Eligibility Criteria</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-semibold text-gray-700 mb-2">Gender</h3>
                  <p className="text-gray-600">{study.gender || 'Not specified'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-semibold text-gray-700 mb-2">Minimum Age</h3>
                  <p className="text-gray-600">{study.minimum_age || 'Not specified'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-semibold text-gray-700 mb-2">Maximum Age</h3>
                  <p className="text-gray-600">{study.maximum_age || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Inclusion Criteria</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-600 whitespace-pre-line">{study.inclusion_criteria || 'No inclusion criteria specified'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Exclusion Criteria</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-600 whitespace-pre-line">{study.exclusion_criteria || 'No exclusion criteria specified'}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Locations Tab */}
          {activeTab === 'locations' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Study Locations</h2>
              
              {study.locations && study.locations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {study.locations.map((location, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-md">
                      <h3 className="font-semibold text-gray-700 mb-2">{location.facility_name}</h3>
                      <div className="flex items-start mb-2">
                        <FaMapMarkerAlt className="text-blue-600 mt-1 mr-2 flex-shrink-0" />
                        <p className="text-gray-600">
                          {[location.city, location.state, location.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                      {location.status && (
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">Status:</span>{' '}
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            {location.status}
                          </span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No location information available</p>
              )}
              
              {/* Map with locations */}
              {study.locations && study.locations.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-semibold text-gray-700 mb-4">Map View</h3>
                  <TrialMap trials={[{
                    ...study,
                    locations: study.locations
                  }]} />
                </div>
              )}
            </div>
          )}
          
          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h2>
              
              {contactPersons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {contactPersons.map((contact, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-md">
                      <h3 className="font-semibold text-gray-700 mb-2">
                        {contact.name || 'Unnamed Contact'}
                        {contact.role && <span className="text-sm font-normal text-gray-500 ml-2">({contact.role})</span>}
                      </h3>
                      
                      {contact.phone && (
                        <div className="flex items-center mb-2">
                          <FaPhone className="text-blue-600 mr-2 flex-shrink-0" />
                          <a href={`tel:${contact.phone}`} className="text-gray-600 hover:text-blue-600">
                            {contact.phone}
                          </a>
                        </div>
                      )}
                      
                      {contact.email && (
                        <div className="flex items-center">
                          <FaEnvelope className="text-blue-600 mr-2 flex-shrink-0" />
                          <a href={`mailto:${contact.email}`} className="text-gray-600 hover:text-blue-600">
                            {contact.email}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-500 italic">No contact information available</p>
                </div>
              )}
              
              {/* Central Contact */}
              {study.central_contact && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-700 mb-2">Central Contact</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="font-medium">{study.central_contact.name}</p>
                    {study.central_contact.phone && (
                      <div className="flex items-center mt-2">
                        <FaPhone className="text-blue-600 mr-2 flex-shrink-0" />
                        <a href={`tel:${study.central_contact.phone}`} className="text-gray-600 hover:text-blue-600">
                          {study.central_contact.phone}
                        </a>
                      </div>
                    )}
                    {study.central_contact.email && (
                      <div className="flex items-center mt-2">
                        <FaEnvelope className="text-blue-600 mr-2 flex-shrink-0" />
                        <a href={`mailto:${study.central_contact.email}`} className="text-gray-600 hover:text-blue-600">
                          {study.central_contact.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudyDetail;