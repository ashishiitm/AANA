import React from 'react';
import { Link } from 'react-router-dom';

const StudyList = ({ studies = [] }) => {
  if (studies.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-card p-8 text-center">
        <h2 className="text-2xl font-bold text-text-dark mb-4">No Studies Found</h2>
        <p className="text-text-light">
          Try adjusting your search criteria or check back later for new studies.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text-dark">Available Studies</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studies.map((study, index) => (
          <div key={study.id || index} className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-text-dark mb-2 line-clamp-2">
                {study.official_title || 'Untitled Study'}
              </h3>
              <div className="flex items-center mb-4">
                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {study.overall_status || 'Unknown Status'}
                </span>
              </div>
              <p className="text-text-light mb-4 line-clamp-3">
                {study.brief_summary || 'No description available.'}
              </p>
              <Link 
                to={`/study/${study.id}`} 
                className="btn-primary inline-block"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyList; 