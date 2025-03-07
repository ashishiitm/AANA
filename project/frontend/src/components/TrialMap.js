import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { FaMapMarkerAlt } from 'react-icons/fa';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 39.8283,
  lng: -98.5795
};

const TrialMap = ({ trials = [] }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  const [map, setMap] = useState(null);

  const onLoad = useCallback((map) => {
    if (trials.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      trials.forEach(trial => {
        const position = trial.location || {
          lat: 35 + Math.random() * 10,
          lng: -120 + Math.random() * 40
        };
        bounds.extend(position);
      });
      map.fitBounds(bounds);
    }
    setMap(map);
  }, [trials]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (!isLoaded) {
    return (
      <div className="h-96 bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-96 w-full rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={4}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {trials.map((trial, index) => {
          const position = trial.location || {
            lat: 35 + Math.random() * 10,
            lng: -120 + Math.random() * 40
          };
          
          return (
            <Marker
              key={trial.study_id || index}
              position={position}
              title={trial.official_title}
              label={{
                text: String(index + 1),
                color: 'white'
              }}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: trial.overall_status === 'RECRUITING' ? '#10B981' : 
                          trial.overall_status === 'ACTIVE' ? '#3B82F6' : '#6B7280',
                fillOpacity: 1,
                strokeWeight: 1,
                strokeColor: '#FFFFFF',
                scale: 10
              }}
            />
          );
        })}
      </GoogleMap>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 p-3 rounded-md shadow-md">
        <h4 className="text-sm font-medium mb-2">Legend</h4>
        <div className="flex items-center mb-1">
          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
          <span className="text-xs">Recruiting</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-xs">Active, not recruiting</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-gray-500 mr-2"></div>
          <span className="text-xs">Other status</span>
        </div>
      </div>

      {/* Empty State */}
      {trials.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90">
          <div className="text-center p-6">
            <FaMapMarkerAlt className="text-gray-400 text-4xl mx-auto mb-3" />
            <p className="text-gray-500">No trials to display on the map</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrialMap; 
