// src/pages/Home.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaSearch, 
  FaMapMarkerAlt, 
  FaInfoCircle, 
  FaArrowRight, 
  FaCalendarAlt, 
  FaUsers, 
  FaHospital, 
  FaChevronLeft, 
  FaChevronRight,
  FaFlask,
  FaFilter,
  FaRobot,
  FaComments
} from 'react-icons/fa';
import StudyList from '../components/StudyList';
import TrialMap from '../components/TrialMap';
import DatabaseStats from '../components/DatabaseStats';
import { fetchActiveTrials, fetchFeaturedStudies, searchStudies, processNlpQuery } from '../api';
import TrialDetailModal from '../components/TrialDetailModal';
import TrialCardNew from '../components/TrialCardNew';
import DebugPanel from '../components/DebugPanel';

function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNlpSearch, setIsNlpSearch] = useState(false);
  const [nlpPrompt, setNlpPrompt] = useState('');
  const [studies, setStudies] = useState([]);
  const [featuredStudies, setFeaturedStudies] = useState([]);
  const [activeTrials, setActiveTrials] = useState([]);
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [currentStudyIndex, setCurrentStudyIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState(false);
  const [error, setError] = useState(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const carouselRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [activeTrialsLoading, setActiveTrialsLoading] = useState(false);
  const [activeTrialsError, setActiveTrialsError] = useState(null);
  const [featuredStudiesLoading, setFeaturedStudiesLoading] = useState(false);
  const [featuredStudiesError, setFeaturedStudiesError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const trialsPerPage = 5;
  
  // Refs for scrolling
  const trialListRef = useRef(null);
  const studyListRef = useRef(null);

  const navigate = useNavigate();

  const fetchTrialsData = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log('Fetching trials data...');
      const [activeTrialsResponse, featuredStudiesData] = await Promise.all([
        fetchActiveTrials(20, 0), // Fetch first 20 trials with pagination
        fetchFeaturedStudies()
      ]);
      
      console.log('Active Trials Response:', activeTrialsResponse);
      
      // Extract trials array from the paginated response
      const activeTrialsData = activeTrialsResponse.results || [];
      
      // Ensure we always set arrays and they have the required properties 
      // for TrialCardNew component
      const processedActiveTrials = Array.isArray(activeTrialsData) 
        ? activeTrialsData.map(trial => ({
            ...trial,
            id: trial.id || trial.nct_id || trial.study_id || `trial-${Math.random().toString(36).substring(2, 10)}`,
            title: trial.title || trial.official_title || trial.brief_title || 'No title available',
            status: trial.status || trial.overall_status || 'Unknown',
            phase: trial.phase || 'Phase not specified',
            location: trial.location || 'Location not specified'
          }))
        : [];
      
      const processedFeaturedStudies = Array.isArray(featuredStudiesData)
        ? featuredStudiesData.map(study => ({
            ...study,
            id: study.id || study.nct_id || study.study_id || `study-${Math.random().toString(36).substring(2, 10)}`,
            title: study.title || study.official_title || study.brief_title || 'No title available',
            status: study.status || study.overall_status || 'Unknown',
            phase: study.phase || 'Phase not specified',
            location: study.location || 'Location not specified'
          }))
        : [];
      
      console.log('Processed Active Trials:', processedActiveTrials.length);
      console.log('Processed Featured Studies:', processedFeaturedStudies.length);
      
      setActiveTrials(processedActiveTrials);
      setFeaturedStudies(processedFeaturedStudies);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching trials data:', err);
      setError('Failed to load trials data. Please try again later.');
      // Set empty arrays on error
      setActiveTrials([]);
      setFeaturedStudies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrialsData();
  }, [fetchTrialsData]);

  // Functions
  const handlePrevTrial = useCallback(() => {
    if (!Array.isArray(activeTrials) || activeTrials.length === 0) return;
    
    if (currentTrialIndex > 0) {
      setCurrentTrialIndex(currentTrialIndex - 1);
    } else {
      setCurrentTrialIndex(activeTrials.length - 1);
    }
  }, [currentTrialIndex, activeTrials]);

  const handleNextTrial = useCallback(() => {
    if (!Array.isArray(activeTrials) || activeTrials.length === 0) return;
    
    if (currentTrialIndex < activeTrials.length - 1) {
      setCurrentTrialIndex(currentTrialIndex + 1);
    } else {
      setCurrentTrialIndex(0);
    }
  }, [currentTrialIndex, activeTrials]);

  // Update current trials when active trials or index changes
  useEffect(() => {
    // No need to call updateCurrentTrials since currentTrials is defined as a constant
    // that automatically updates when activeTrials or currentTrialIndex changes
  }, [activeTrials, currentTrialIndex]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!Array.isArray(activeTrials) || activeTrials.length === 0) return;
    
    const interval = setInterval(() => {
      if (!isScrolling) {
        handleNextTrial();
      }
    }, 10000); // Auto-scroll every 10 seconds
    
    return () => clearInterval(interval);
  }, [activeTrials, isScrolling, handleNextTrial]);

  // Carousel scroll controls
  const scrollLeft = () => {
    if (carouselRef.current && activeTrials.length > 0) {
      setIsScrolling(true);
      carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
      setTimeout(() => setIsScrolling(false), 500);
    }
  };

  const scrollRight = () => {
    if (carouselRef.current && activeTrials.length > 0) {
      setIsScrolling(true);
      carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
      setTimeout(() => setIsScrolling(false), 500);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log(`Searching for: "${searchQuery}"`);
      // Navigate directly to search-results instead of /search
      navigate(`/search-results?q=${encodeURIComponent(searchQuery)}`);
    } else {
      console.warn('Empty search query, not navigating');
    }
  };

  // Handle NLP search
  const handleNlpSearch = (e) => {
    e.preventDefault();
    if (nlpPrompt.trim()) {
      console.log(`NLP search for: "${nlpPrompt}"`);
      // Navigate directly to search-results instead of /search
      navigate(`/search-results?q=${encodeURIComponent(nlpPrompt)}&nlp=true`);
    } else {
      console.warn('Empty NLP prompt, not navigating');
    }
  };

  // Handle trial click
  const handleTrialClick = (trial) => {
    console.log('Trial clicked:', trial);
    setSelectedTrial(trial);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    console.log('Modal closing');
    setIsModalOpen(false);
    setSelectedTrial(null);
  };

  // Current trials to display - with safety check
  const currentTrials = Array.isArray(activeTrials) 
    ? activeTrials.slice(currentTrialIndex, currentTrialIndex + trialsPerPage)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Clinical Trials That Match Your Needs</h1>
            <p className="text-xl opacity-90">Search from thousands of clinical trials to find the right one for you or your loved ones.</p>
          </div>
          
          {/* Search Tabs */}
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center mb-4">
              <button
                onClick={() => setIsNlpSearch(false)}
                className={`px-6 py-3 rounded-tl-lg rounded-bl-lg ${
                  !isNlpSearch 
                    ? 'bg-white text-blue-800' 
                    : 'bg-blue-700 text-white'
                }`}
              >
                <FaSearch className="inline mr-2" />
                Standard Search
              </button>
              <button
                onClick={() => setIsNlpSearch(true)}
                className={`px-6 py-3 rounded-tr-lg rounded-br-lg ${
                  isNlpSearch 
                    ? 'bg-white text-blue-800' 
                    : 'bg-blue-700 text-white'
                }`}
              >
                <FaRobot className="inline mr-2" />
                AI-Powered Search
              </button>
            </div>
            
            {/* Standard Search Form */}
            {!isNlpSearch ? (
              <form onSubmit={handleSearch} className="flex">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by condition, treatment, or NCT ID..."
                    className="w-full px-4 py-3 pl-10 rounded-l-lg focus:outline-none text-gray-800"
                  />
                  <FaSearch className="absolute left-3 top-4 text-gray-400" />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-900 text-white rounded-r-lg hover:bg-blue-950 transition-colors"
                >
                  Search
                </button>
              </form>
            ) : (
              /* NLP Search Form */
              <form onSubmit={handleNlpSearch} className="flex flex-col">
                <div className="relative">
                  <textarea
                    value={nlpPrompt}
                    onChange={(e) => setNlpPrompt(e.target.value)}
                    placeholder="Describe what you're looking for in natural language. For example: 'Find me clinical trials for breast cancer that are recruiting patients in New York'"
                    className="w-full px-4 py-3 pl-10 rounded-t-lg focus:outline-none min-h-[100px] text-gray-800"
                  />
                  <FaComments className="absolute left-3 top-3 text-gray-400" />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-900 text-white rounded-b-lg hover:bg-blue-950 transition-colors"
                >
                  Process with AI
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <DatabaseStats />
        
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Active Clinical Trials</h2>
            <div className="flex space-x-2">
              <button 
                onClick={handlePrevTrial}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full"
                disabled={activeTrials.length <= trialsPerPage}
                aria-label="Previous trials"
              >
                <FaChevronLeft />
              </button>
              <button 
                onClick={handleNextTrial}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full"
                disabled={activeTrials.length <= trialsPerPage}
                aria-label="Next trials"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {currentTrials.map((trial) => (
                <TrialCardNew
                  key={trial.nct_id || trial.id || Math.random().toString(36).substr(2, 9)} 
                  trial={trial} 
                  onClick={(selectedTrial) => handleTrialClick(selectedTrial)}
                />
              ))}
            </div>
          )}
          
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {Array.from({ length: Math.ceil(activeTrials.length / trialsPerPage) }).map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    Math.floor(currentTrialIndex / trialsPerPage) === index
                      ? 'bg-blue-600'
                      : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentTrialIndex(index * trialsPerPage)}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Featured Studies</h2>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredStudies.slice(0, 3).map((study) => (
                <div 
                  key={study.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 cursor-pointer"
                  onClick={() => handleTrialClick(study)}
                >
                  <h3 className="text-xl font-semibold text-slate-800 mb-2 line-clamp-2">{study.title}</h3>
                  <div className="mb-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2">
                      {study.condition}
                    </span>
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {study.phase}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-3">{study.brief_summary}</p>
                  <button 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTrialClick(study);
                    }}
                  >
                    Learn More →
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {isModalOpen && selectedTrial && (
          <TrialDetailModal
            isOpen={isModalOpen}
            trial={selectedTrial}
            onClose={handleCloseModal}
          />
        )}

        {/* Debug Panel */}
        <DebugPanel 
          activeTrials={activeTrials}
          featuredStudies={featuredStudies}
          currentTrials={currentTrials}
          currentTrialIndex={currentTrialIndex}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}

export default Home;