import React from 'react';
import { FaMapMarkerAlt, FaInfoCircle, FaCalendarAlt } from 'react-icons/fa';

function TrialCard({ trial, onClick }) {
  if (!trial) return null;
  
  console.log('Trial prop in TrialCard:', trial);  // Debug the trial prop

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
 
  // Add a handler function to debug the onClick
  const handleClick = (e) => {
    console.log('TrialCard clicked, passing trial data:', trial);
    // Ensure we're passing the complete trial object
    onClick(trial);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer border border-gray-200 h-full flex flex-col"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-md font-semibold text-blue-800 line-clamp-2">{trial.official_title || 'No title'}</h3>
        <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ml-2 ${getStatusColor(trial.overall_status)}`}>
          {trial.overall_status || 'Unknown'}
        </span>
      </div>
      
      <div className="text-sm text-gray-600 mb-2 flex-grow">
        <div className="flex items-center mb-1">
          <FaInfoCircle className="mr-2 text-blue-600 flex-shrink-0" />
          <span>{trial.phase || <span className="text-gray-400">Phase not provided</span>}</span>
        </div>
        
        <div className="flex items-center mb-1">
          <FaCalendarAlt className="mr-2 text-blue-600 flex-shrink-0" />
          <span>{trial.start_date ? new Date(trial.start_date).toLocaleDateString() : <span className="text-gray-400">Start date not provided</span>}</span>
        </div>
        
        <div className="flex items-center">
          <FaMapMarkerAlt className="mr-2 text-blue-600 flex-shrink-0" />
          <span className="line-clamp-1">{trial.location || <span className="text-gray-400">Location not provided</span>}</span>
        </div>
      </div>
      
      <div className="mt-2 text-sm">
        <span className="font-medium">ID: </span> 
        <span className="line-clamp-1">{trial.nct_id || trial.id || 'Not specified'}</span>
      </div>
      
      <button 
        className="mt-3 text-white bg-blue-600 hover:bg-blue-700 text-sm px-4 py-1.5 rounded-md transition-colors w-full"
        onClick={(e) => {
          e.stopPropagation();
          console.log('View Details button clicked, passing trial data:', trial);
          onClick(trial);
        }}
      >
        View Details
      </button>
    </div>
  );
}

export default TrialCard;