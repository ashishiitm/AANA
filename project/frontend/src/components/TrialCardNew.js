import React, { useEffect } from 'react';
import { FaMapMarkerAlt, FaInfoCircle, FaCalendarAlt, FaShare } from 'react-icons/fa';

function TrialCardNew({ trial, onClick }) {
  useEffect(() => {
    console.log('TrialCardNew mounted with trial:', trial);
  }, [trial]);

  // Safety check for null/undefined trial
  if (!trial) {
    console.warn('TrialCardNew received null or undefined trial');
    return null;
  }
  
  // Extract and normalize data with fallbacks for all possible structures
  const trialData = {
    id: trial.id || trial.nct_id || 'Unknown ID',
    title: trial.official_title || trial.title || trial.brief_title || 'No title available',
    status: trial.overall_status || trial.status || 'Unknown',
    phase: trial.phase || 'Phase not specified',
    location: trial.location || trial.locations || 'Location not specified',
    startDate: trial.start_date || 'Date not specified',
    briefSummary: trial.brief_summary || 'No summary available',
    contactName: trial.contact_name || 'Not specified',
    contactEmail: trial.contact_email || 'Not specified'
  };
  
  console.log('Trial data normalized:', trialData);

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    status = status.toLowerCase();
    if (status.includes('recruiting')) {
      return 'bg-green-100 text-green-800';
    } else if (status.includes('active') || status.includes('enrolling')) {
      return 'bg-blue-100 text-blue-800';
    } else if (status.includes('completed')) {
      return 'bg-purple-100 text-purple-800';
    } else if (status.includes('terminated') || status.includes('withdrawn')) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };
 
  const handleClick = (e) => {
    console.log('TrialCardNew clicked, passing trial data:', trial);
    if (onClick) {
      onClick(trial);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    // We'll implement the share modal in a separate component
    // For now, we'll just trigger the global event to open the share modal
    const shareEvent = new CustomEvent('openShareModal', { 
      detail: { 
        trial: trial 
      } 
    });
    window.dispatchEvent(shareEvent);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer border border-gray-200 h-full flex flex-col"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-md font-semibold text-blue-800 line-clamp-2">{trialData.title}</h3>
        <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ml-2 ${getStatusColor(trialData.status)}`}>
          {trialData.status}
        </span>
      </div>
      
      <div className="text-sm text-gray-600 mb-2 flex-grow">
        <div className="flex items-center mb-1">
          <FaInfoCircle className="mr-2 text-blue-600 flex-shrink-0" />
          <span>{trialData.phase}</span>
        </div>
        
        <div className="flex items-center mb-1">
          <FaCalendarAlt className="mr-2 text-blue-600 flex-shrink-0" />
          <span>{trialData.startDate ? new Date(trialData.startDate).toLocaleDateString() : 'Start date not provided'}</span>
        </div>
        
        <div className="flex items-center">
          <FaMapMarkerAlt className="mr-2 text-blue-600 flex-shrink-0" />
          <span className="line-clamp-1">{trialData.location}</span>
        </div>
      </div>
      
      <div className="mt-2 text-sm">
        <span className="font-medium">ID: </span> 
        <span className="line-clamp-1">{trialData.id}</span>
      </div>
      
      <div className="flex mt-3 gap-2">
        <button 
          className="flex-grow text-white bg-blue-600 hover:bg-blue-700 text-sm px-4 py-1.5 rounded-md transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            console.log('View Details button clicked, passing trial data:', trial);
            onClick(trial);
          }}
        >
          View Details
        </button>
        <button 
          className="text-white bg-green-600 hover:bg-green-700 text-sm px-3 py-1.5 rounded-md transition-colors flex items-center justify-center"
          onClick={handleShare}
          title="Share this trial"
        >
          <FaShare />
        </button>
      </div>
    </div>
  );
}

export default TrialCardNew; 