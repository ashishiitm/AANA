import React, { useState, useEffect } from 'react';
import { FaTimes, FaEnvelope, FaSpinner } from 'react-icons/fa';
import { sendEmail } from '../api';

function ShareModal({ isOpen, onClose, trial }) {
  const [senderName, setSenderName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    // Reset form when modal opens with new trial
    if (isOpen) {
      setSenderName('');
      setRecipientEmail('');
      setMessage(`I found this clinical trial that might be of interest to you.`);
      setError('');
      setSuccess(false);
      setDebugInfo('');
      
      // Log trial data for debugging
      console.log('Trial data in ShareModal:', trial);
    }
  }, [isOpen, trial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setDebugInfo('');
    
    // Validate inputs
    if (!senderName.trim()) {
      setError('Please enter your name');
      setIsSubmitting(false);
      return;
    }
    
    if (!recipientEmail.trim()) {
      setError('Please enter recipient email');
      setIsSubmitting(false);
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      setDebugInfo('Preparing email data...');
      
      // Format inclusion and exclusion criteria if available
      const formatCriteria = (criteriaList) => {
        if (!criteriaList || !Array.isArray(criteriaList) || criteriaList.length === 0) {
          return '<p>Not specified</p>';
        }
        
        return `
          <ul style="padding-left: 20px; margin-top: 5px;">
            ${criteriaList.map(criterion => `<li style="margin-bottom: 5px;">${criterion}</li>`).join('')}
          </ul>
        `;
      };
      
      // Prepare trial information
      const trialInfo = {
        title: trial.official_title || trial.title || trial.brief_title || 'Clinical Trial',
        id: trial.nct_id || trial.id || trial.study_id || 'Not specified',
        phase: trial.phase || 'Not specified',
        status: trial.overall_status || trial.status || 'Unknown',
        startDate: trial.start_date ? new Date(trial.start_date).toLocaleDateString() : 'Not specified',
        location: trial.location || 'Not specified',
        summary: trial.brief_summary || 'No summary available',
        inclusionCriteria: formatCriteria(trial.eligibility_criteria?.inclusion),
        exclusionCriteria: formatCriteria(trial.eligibility_criteria?.exclusion)
      };
      
      setDebugInfo(prev => prev + '\nPreparing email content...');
      
      // Prepare email content
      const emailData = {
        to: recipientEmail,
        to_name: recipientEmail.split('@')[0], // Use part before @ as name
        subject: `${senderName} has shared a clinical trial with you`,
        from: {
          email: "ashish.c.chaudhary@gmail.com",
          name: "AANA Clinical Trials"
        },
        nct_id: trialInfo.id,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #4a5568; margin-bottom: 10px;">Clinical Trial Shared With You</h1>
              <div style="height: 4px; background-color: #3b82f6; width: 100px; margin: 0 auto;"></div>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
              ${senderName} has shared a clinical trial with you and would like you to see it.
            </p>
            
            <p style="font-style: italic; font-size: 16px; line-height: 1.6; color: #4a5568; background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
              "${message}"
            </p>
            
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h2 style="color: #2c5282; margin-top: 0; font-size: 20px;">${trialInfo.title}</h2>
              
              <div style="margin-top: 15px;">
                <p style="margin: 5px 0;"><strong>ID:</strong> ${trialInfo.id}</p>
                <p style="margin: 5px 0;"><strong>Phase:</strong> ${trialInfo.phase}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> ${trialInfo.status}</p>
                <p style="margin: 5px 0;"><strong>Start Date:</strong> ${trialInfo.startDate}</p>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${trialInfo.location}</p>
              </div>
              
              <div style="margin-top: 20px;">
                <h3 style="color: #2c5282; font-size: 18px; margin-bottom: 10px;">Brief Summary</h3>
                <p style="color: #4a5568; line-height: 1.6;">${trialInfo.summary}</p>
              </div>
              
              <div style="margin-top: 20px;">
                <h3 style="color: #2c5282; font-size: 18px; margin-bottom: 10px;">Eligibility Criteria</h3>
                
                <div style="margin-top: 15px;">
                  <h4 style="color: #2c5282; font-size: 16px; margin-bottom: 5px;">Inclusion Criteria:</h4>
                  ${trialInfo.inclusionCriteria}
                </div>
                
                <div style="margin-top: 15px;">
                  <h4 style="color: #2c5282; font-size: 16px; margin-bottom: 5px;">Exclusion Criteria:</h4>
                  ${trialInfo.exclusionCriteria}
                </div>
              </div>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
              To view more details about this trial, please visit our platform.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #94a3b8; text-align: center;">
              <p>This email was sent via the AANA Clinical Trials Platform.</p>
              <p>© 2023 AANA Clinical Trials. All rights reserved.</p>
            </div>
          </div>
        `
      };
      
      setDebugInfo(prev => prev + '\nSending email...');
      
      // Send email using the existing API function
      const result = await sendEmail(emailData);
      
      setDebugInfo(prev => prev + `\nEmail sent successfully: ${JSON.stringify(result)}`);
      console.log('Email sent successfully:', result);
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      console.error('Error sending email:', err);
      setError(`Failed to send email: ${err.message || 'Unknown error'}`);
      setDebugInfo(prev => prev + `\nError sending email: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Share Clinical Trial</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        
        {success ? (
          <div className="p-6">
            <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Email sent successfully!
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your name"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Recipient Email
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter recipient email"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="3"
                placeholder="Add a personal message"
              />
            </div>
            
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Sending...
                  </span>
                ) : (
                  <>
                    <FaEnvelope className="mr-2" />
                    Send Email
                  </>
                )}
              </button>
            </div>
            
            {debugInfo && (
              <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs font-mono text-gray-700 whitespace-pre-wrap">
                <strong>Debug Info:</strong>
                {debugInfo}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default ShareModal; 