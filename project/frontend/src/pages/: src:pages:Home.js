// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import StudyList from '../components/StudyList';
import MapView from '../components/MapView';

const HomeWrapper = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Tabs = styled.div`
  margin: 1rem 0;
  button {
    padding: 0.5rem 1.5rem;
    margin-right: 1rem;
    background-color: ${props => props.theme.colors.secondary};
    color: ${props => props.theme.colors.white};
    border: none;
    border-radius: 4px;
    cursor: pointer;
    &.active {
      background-color: ${props => props.theme.colors.accent};
    }
    &:hover {
      background-color: ${props => props.theme.colors.accent};
    }
  }
`;

function Home() {
  const [searchParams, setSearchParams] = useState({ keyword: '' });
  const [studies, setStudies] = useState([]);
  const [view, setView] = useState('list');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudies = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/studies', { params: searchParams });
        setStudies(response.data);
      } catch (error) {
        console.error('Error fetching studies:', error);
      }
      setLoading(false);
    };
    fetchStudies();
  }, [searchParams]);

  return (
    <HomeWrapper>
      <SearchBar onSearch={setSearchParams} />
      <Tabs>
        <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
          List View
        </button>
        <button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')}>
          Map View
        </button>
      </Tabs>
      {loading ? (
        <p>Loading...</p>
      ) : view === 'list' ? (
        <StudyList studies={studies} />
      ) : (
        <MapView studies={studies} />
      )}
    </HomeWrapper>
  );
}

export default Home;