// src/pages/LearnMore.js
import React from 'react';
// Remove styled-components import
// import styled from 'styled-components';

// Remove styled components definitions
// const LearnMoreWrapper = styled.div`...`;

function LearnMore() {
  return (
    <div className="container-custom py-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-card p-8">
        <h1 className="text-3xl font-bold text-text-dark mb-6 border-b border-gray-200 pb-4">
          Learn More about Clinical Studies
        </h1>
        
        <div className="space-y-6 text-text leading-relaxed">
          <p>
            Clinical studies are research investigations where volunteers test new treatments,
            interventions, or diagnostics to prevent, detect, treat, or manage diseases.
          </p>
          
          <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Why Participate in Clinical Trials?</h2>
          <p>
            Participating in clinical trials helps researchers find better treatments for future patients.
            Volunteers may gain access to new treatments before they're widely available and receive
            expert medical care during the trial.
          </p>
          
          <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Types of Clinical Studies</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Treatment trials</strong> - Test new treatments, drugs, or approaches</li>
            <li><strong>Prevention trials</strong> - Look for better ways to prevent disease</li>
            <li><strong>Diagnostic trials</strong> - Find better tests or procedures for diagnosing diseases</li>
            <li><strong>Screening trials</strong> - Test the best way to detect certain diseases</li>
            <li><strong>Quality of life trials</strong> - Explore ways to improve comfort for people with chronic illnesses</li>
          </ul>
          
          <div className="bg-blue-50 p-6 rounded-lg mt-8">
            <h3 className="text-xl font-bold text-primary mb-3">Ready to Get Involved?</h3>
            <p className="mb-4">
              Use our search tool to find clinical trials that match your needs and interests.
              Your participation could help advance medical knowledge and improve healthcare for everyone.
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="btn-primary"
            >
              Find Clinical Trials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearnMore;