import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaServer, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE_URL } from '../api';

const BackendStatusNotification = () => {
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/stats/database/`, { timeout: 3000 });
        
        // Check if we're getting mock data
        if (response.data && (response.data.status === 'mock_data' || response.data.status === 'error')) {
          console.warn('Backend is returning mock data:', response.data.message || 'Database connection issues');
          setIsBackendAvailable(false);
          setStatusMessage(response.data.message || 'Using mock data due to database connection issues');
        } else {
          setIsBackendAvailable(true);
          setStatusMessage('');
        }
      } catch (error) {
        console.error('Backend check failed:', error);
        setIsBackendAvailable(false);
        setStatusMessage('Cannot connect to the backend server');
      }
    };

    // Check immediately on component mount
    checkBackendStatus();

    // Then check periodically
    const interval = setInterval(checkBackendStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (isBackendAvailable || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-lg z-50">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800 flex items-center">
            <FaServer className="mr-1" /> Backend Connection Issue
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              The application is currently running in offline mode. Some features may be limited, and you'll see demo data instead of live data.
            </p>
            {statusMessage && (
              <p className="mt-1 text-xs italic">
                {statusMessage}
              </p>
            )}
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={() => setIsDismissed(true)}
              className="inline-flex bg-yellow-50 rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <span className="sr-only">Dismiss</span>
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendStatusNotification; 