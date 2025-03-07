import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaUser, FaBuilding, FaEnvelope, FaLock, FaPhone } from "react-icons/fa";
import countryCodes from "./countryCodes.json";
import industriesList from "./industries.json";

const SignupModal = ({ closeModal, onCompleteSignup }) => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
    password: "",
    phone: "",
    countryCode: "+1",
    role: "",
    businessDetails: { name: "", industry: "", address: "" },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: { ...formData[parent], [child]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNextStep = () => {
    if (step === 1 && (!formData.firstName || !formData.lastName)) {
      alert("Please enter your first and last name.");
      return;
    }
    if (step === 2 && (!formData.email || formData.email !== formData.confirmEmail || !formData.password)) {
      alert("Please ensure emails match and enter a password.");
      return;
    }
    if (step === 3 && !formData.phone) {
      alert("Please enter your phone number.");
      return;
    }
    setStep(step + 1);
  };

  const handleCompleteSignup = () => {
    if (formData.role === "business" && (!formData.businessDetails.name || !formData.businessDetails.industry)) {
      alert("Please complete business details.");
      return;
    }
    console.log("Signup Complete:", formData);
    if (onCompleteSignup) {
      onCompleteSignup(formData.firstName);
    }
    closeModal();
    if (!onCompleteSignup) {
      navigate(`/welcome/${formData.firstName}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative overflow-hidden fade-in">
        <button 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          onClick={closeModal}
        >
          <FaTimes size={24} />
        </button>

        <div className="p-8">
          {step === 1 && (
            <div className="slide-up">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-primary mb-4 mx-auto">
                <FaUser size={20} />
              </div>
              <h2 className="text-2xl font-bold text-center text-text-dark mb-2">Let's Get You Started!</h2>
              <p className="text-text-light text-center mb-6">Fill in your details to create a seamless experience.</p>
              
              <div className="space-y-4">
                <div className="input-group">
                  <input 
                    type="text" 
                    name="firstName" 
                    placeholder="First Name" 
                    onChange={handleChange} 
                    className="input" 
                    autoFocus 
                    required 
                  />
                </div>
                <div className="input-group">
                  <input 
                    type="text" 
                    name="lastName" 
                    placeholder="Last Name" 
                    onChange={handleChange} 
                    className="input" 
                    required 
                  />
                </div>
                <button 
                  onClick={handleNextStep}
                  className="btn-primary w-full mt-4"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="slide-up">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-primary mb-4 mx-auto">
                <FaEnvelope size={20} />
              </div>
              <h2 className="text-2xl font-bold text-center text-text-dark mb-2">Your Email & Password</h2>
              <p className="text-text-light text-center mb-6">Enter your email and set a strong password.</p>
              
              <div className="space-y-4">
                <div className="input-group">
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Enter Email" 
                    onChange={handleChange} 
                    className="input" 
                    required 
                  />
                </div>
                <div className="input-group">
                  <input 
                    type="email" 
                    name="confirmEmail" 
                    placeholder="Confirm Email" 
                    onChange={handleChange} 
                    className="input" 
                    required 
                  />
                </div>
                <div className="input-group">
                  <input 
                    type="password" 
                    name="password" 
                    placeholder="Set Password (6+ characters)" 
                    onChange={handleChange} 
                    className="input" 
                    required 
                  />
                </div>
                <button 
                  onClick={handleNextStep}
                  className="btn-primary w-full mt-4"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="slide-up">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-primary mb-4 mx-auto">
                <FaPhone size={20} />
              </div>
              <h2 className="text-2xl font-bold text-center text-text-dark mb-2">Your Contact Information</h2>
              <p className="text-text-light text-center mb-6">Choose your country and enter your mobile number.</p>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <select 
                    name="countryCode" 
                    onChange={handleChange} 
                    value={formData.countryCode}
                    className="input w-1/3"
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.dial_code}>
                        {country.flag} {country.dial_code}
                      </option>
                    ))}
                  </select>
                  <input 
                    type="text" 
                    name="phone" 
                    placeholder="Mobile Number" 
                    onChange={handleChange} 
                    className="input w-2/3" 
                    required 
                  />
                </div>
                <button 
                  onClick={handleNextStep}
                  className="btn-primary w-full mt-4"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="slide-up">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-primary mb-4 mx-auto">
                <FaBuilding size={20} />
              </div>
              <h2 className="text-2xl font-bold text-center text-text-dark mb-2">How Will You Use This?</h2>
              <p className="text-text-light text-center mb-6">Choose an option that best fits your needs.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className="card p-4 cursor-pointer hover:border-primary"
                  onClick={() => { 
                    setFormData({ ...formData, role: "personal" }); 
                    handleCompleteSignup(); 
                  }}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-primary mb-2 mx-auto">
                    <FaUser size={16} />
                  </div>
                  <h3 className="text-lg font-bold text-center mb-1">Personal Use</h3>
                  <p className="text-sm text-text-light text-center">For individual users who need a seamless experience.</p>
                </div>
                
                <div 
                  className="card p-4 cursor-pointer hover:border-primary"
                  onClick={() => setStep(5)}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-primary mb-2 mx-auto">
                    <FaBuilding size={16} />
                  </div>
                  <h3 className="text-lg font-bold text-center mb-1">Business</h3>
                  <p className="text-sm text-text-light text-center">For teams and companies needing AI-powered automation.</p>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="slide-up">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-primary mb-4 mx-auto">
                <FaBuilding size={20} />
              </div>
              <h2 className="text-2xl font-bold text-center text-text-dark mb-2">Business Details</h2>
              <p className="text-text-light text-center mb-6">Enter details to set up your business account.</p>
              
              <div className="space-y-4">
                <div className="input-group">
                  <input 
                    type="text" 
                    name="businessDetails.name" 
                    placeholder="Business Name" 
                    onChange={handleChange} 
                    className="input" 
                    required 
                  />
                </div>
                <div className="input-group">
                  <select 
                    name="businessDetails.industry" 
                    onChange={handleChange} 
                    className="input" 
                    required
                  >
                    <option value="">Select Industry</option>
                    {industriesList.map((industry, index) => (
                      <option key={index} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <input 
                    type="text" 
                    name="businessDetails.address" 
                    placeholder="Business Address" 
                    onChange={handleChange} 
                    className="input" 
                  />
                </div>
                <button 
                  onClick={handleCompleteSignup}
                  className="btn-primary w-full mt-4"
                >
                  Complete Signup
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-100 px-8 py-4">
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5].map((stepNumber) => (
              <div 
                key={stepNumber}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= stepNumber ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;
