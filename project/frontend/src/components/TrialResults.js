import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import './TrialResults.css';

function TrialResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const trials = location.state?.trials || [];

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.2, ease: 'easeOut' },
    }),
    hover: { scale: 1.05, boxShadow: '0px 10px 20px rgba(255, 215, 0, 0.3)' },
  };

  return (
    <div className="results-container">
      <h1>Active Trials</h1>
      <div className="trials-list">
        {trials.length ? (
          trials.map((trial, index) => (
            <motion.div
              key={trial.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className="trial-card"
              onClick={() => navigate(`/trial/${trial.id}/doctors`)}
            >
              <h3>{trial.title}</h3>
              <p>Condition: {trial.condition}</p>
              <p>Location: {trial.location}</p>
            </motion.div>
          ))
        ) : (
          <p>No trials found. Try a different search!</p>
        )}
      </div>
    </div>
  );
}

export default TrialResults;