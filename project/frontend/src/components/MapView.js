// src/components/MapView.js
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const MapWrapper = styled.div`
  height: 500px;
  width: 100%;
`;

function MapView({ studies }) {
  const locations = studies.flatMap(study =>
    study.locations.map(location => ({ study, location }))
  );

  return (
    <MapWrapper>
      <MapContainer center={[51.505, -0.09]} zoom={2} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {locations.map(({ study, location }, index) => (
          <Marker key={index} position={[location.lat, location.lng]}>
            <Popup>
              <h3>{study.official_title}</h3>
              <p>{location.facility_name}, {location.city}, {location.country}</p>
              <Link to={`/study/${study.study_id}`}>View Details</Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </MapWrapper>
  );
}

export default MapView;