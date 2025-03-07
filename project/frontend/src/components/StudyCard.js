import React from 'react';
import { Link } from 'react-router-dom';

function StudyCard({ study }) {
  return (
    <div className="bg-white border border-gray-200 p-6 mb-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{study.official_title}</h3>
      <div className="space-y-2 mb-4">
        <p className="text-sm"><span className="font-medium text-gray-700">Status:</span> <span className="text-gray-600">{study.overall_status}</span></p>
        <p className="text-sm"><span className="font-medium text-gray-700">Condition:</span> <span className="text-gray-600">{study.condition}</span></p>
        <p className="text-sm"><span className="font-medium text-gray-700">Location:</span> <span className="text-gray-600">{study.location}</span></p>
      </div>
      <Link 
        to={`/study/${study.study_id}`}
        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
      >
        View Details
      </Link>
    </div>
  );
}

export default StudyCard;