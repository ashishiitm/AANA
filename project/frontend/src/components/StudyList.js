import React from 'react';
import { Link } from 'react-router-dom';

function StudyList({ studies }) {
  if (!studies || studies.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No studies found</h3>
        <p className="text-gray-500">Try adjusting your search criteria or check back later for new studies.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Studies</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studies.map(study => (
          <div key={study.study_id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2">{study.official_title}</h3>
              <div className="space-y-2 mb-4">
                <p className="text-sm"><span className="font-medium text-gray-700">Status:</span> <span className="text-gray-600">{study.overall_status}</span></p>
                <p className="text-sm"><span className="font-medium text-gray-700">Condition:</span> <span className="text-gray-600">{study.condition}</span></p>
                <p className="text-sm"><span className="font-medium text-gray-700">Location:</span> <span className="text-gray-600">{study.location}</span></p>
              </div>
              <Link 
                to={`/study/${study.study_id}`}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudyList;