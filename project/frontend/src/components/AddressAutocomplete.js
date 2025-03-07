import React, { useEffect, useRef, useState } from 'react';

const AddressAutocomplete = ({ value, onChange, className }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [apiLoaded, setApiLoaded] = useState(true);

  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps JavaScript API not loaded');
      setApiLoaded(false);
      return;
    }

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'US' }
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        
        if (!place.geometry) {
          console.error('No details available for input:', place.name);
          onChange(inputRef.current.value);
          return;
        }

        const addressComponents = {
          street_number: '',
          route: '',
          locality: '',
          administrative_area_level_1: '',
          postal_code: '',
          formatted_address: place.formatted_address
        };

        // Extract address components
        place.address_components.forEach(component => {
          const type = component.types[0];
          if (addressComponents.hasOwnProperty(type)) {
            addressComponents[type] = component.long_name;
          }
        });

        // Format the address
        const formattedAddress = {
          fullAddress: place.formatted_address,
          streetAddress: `${addressComponents.street_number} ${addressComponents.route}`.trim(),
          city: addressComponents.locality,
          state: addressComponents.administrative_area_level_1,
          zipCode: addressComponents.postal_code,
          coordinates: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }
        };

        onChange(formattedAddress);
      });

      return () => {
        if (autocompleteRef.current) {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }
      };
    } catch (error) {
      console.error('Error initializing Google Maps Autocomplete:', error);
      setApiLoaded(false);
    }
  }, [onChange]);

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your address"
        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      />
      {!apiLoaded && (
        <p className="text-xs text-red-500 mt-1">
          Address autocomplete unavailable. Please enter your address manually.
        </p>
      )}
    </div>
  );
};

export default AddressAutocomplete; 