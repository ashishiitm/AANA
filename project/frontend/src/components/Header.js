import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaUser, FaChevronDown, FaChevronUp } from "react-icons/fa";
import SignupModal from "./SignupModal";

const Header = () => {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleCompleteSignup = (name) => {
    setUserName(name);
    alert(`Welcome, ${name}! Signup Complete.`);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  // Define dropdown content for each menu item
  const dropdownMenus = {
    product: [
      { title: "Pharmacovigilance", path: "/pharmacovigilance", description: "Advanced safety monitoring and signal detection" },
      { title: "Enrollment", path: "/enrollment", description: "Streamline patient recruitment and enrollment" },
      { title: "Protocol Design", path: "/protocol-design", description: "AI-powered protocol optimization" },
      { title: "Deep Analytics", path: "/deep-analytics", description: "Comprehensive clinical data insights" }
    ],
    useCases: [
      { title: "For Sponsors", path: "/use-cases/sponsors", description: "Optimize your clinical trial portfolio" },
      { title: "For CROs", path: "/use-cases/cros", description: "Enhance operational efficiency" },
      { title: "For Sites", path: "/use-cases/sites", description: "Streamline site operations" }
    ],
    pricing: [
      { title: "Packages", path: "/pricing/packages", description: "Flexible pricing options" },
      { title: "Enterprise", path: "/pricing/enterprise", description: "Custom solutions for large organizations" },
      { title: "Contact Sales", path: "/pricing/contact", description: "Get a personalized quote" }
    ],
    partner: [
      { title: "Technology Partners", path: "/partner/technology", description: "Integration with leading platforms" },
      { title: "Become a Partner", path: "/partner/join", description: "Join our growing partner ecosystem" },
      { title: "Partner Success Stories", path: "/partner/success-stories", description: "See how partners succeed with us" }
    ],
    company: [
      { title: "About Us", path: "/about", description: "Our mission and vision" },
      { title: "Leadership", path: "/company/leadership", description: "Meet our team" },
      { title: "Careers", path: "/company/careers", description: "Join our team" },
      { title: "Contact Us", path: "/company/contact", description: "Get in touch" }
    ]
  };

  return (
    <>
      <header className="bg-white shadow-md py-4 sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex justify-between items-center">
          {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <img src="/logo.png" alt="AANA Logo" className="h-10" />
            </Link>
          </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-text-dark hover:text-primary transition-colors"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <ul className="flex space-x-6">
                {/* Product Dropdown */}
                <li className="relative group">
                  <button 
                    className="flex items-center text-text-dark hover:text-primary font-medium transition-colors"
                    onMouseEnter={() => setActiveDropdown('product')}
                    onClick={() => toggleDropdown('product')}
                  >
                    Product
                    {activeDropdown === 'product' ? <FaChevronUp className="ml-1" size={12} /> : <FaChevronDown className="ml-1" size={12} />}
                  </button>
                  {activeDropdown === 'product' && (
                    <div 
                      className="absolute top-full left-0 w-80 mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-50"
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <h3 className="font-semibold text-primary">Our Products</h3>
                        <p className="text-sm text-gray-600">Comprehensive solutions for clinical trials</p>
                      </div>
                      <div className="p-2">
                        {dropdownMenus.product.map((item, index) => (
                          <Link 
                            key={index} 
                            to={item.path}
                            className="block p-3 hover:bg-gray-50 rounded-md transition-colors"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="font-medium text-text-dark">{item.title}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </li>

                {/* Use Cases Dropdown */}
                <li className="relative group">
                  <button 
                    className="flex items-center text-text-dark hover:text-primary font-medium transition-colors"
                    onMouseEnter={() => setActiveDropdown('useCases')}
                    onClick={() => toggleDropdown('useCases')}
                  >
                    Use Cases
                    {activeDropdown === 'useCases' ? <FaChevronUp className="ml-1" size={12} /> : <FaChevronDown className="ml-1" size={12} />}
                  </button>
                  {activeDropdown === 'useCases' && (
                    <div 
                      className="absolute top-full left-0 w-80 mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-50"
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <h3 className="font-semibold text-primary">Use Cases</h3>
                        <p className="text-sm text-gray-600">Solutions tailored to your needs</p>
                      </div>
                      <div className="p-2">
                        {dropdownMenus.useCases.map((item, index) => (
                          <Link 
                            key={index} 
                            to={item.path}
                            className="block p-3 hover:bg-gray-50 rounded-md transition-colors"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="font-medium text-text-dark">{item.title}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </li>

                {/* Pricing Dropdown */}
                <li className="relative group">
                  <button 
                    className="flex items-center text-text-dark hover:text-primary font-medium transition-colors"
                    onMouseEnter={() => setActiveDropdown('pricing')}
                    onClick={() => toggleDropdown('pricing')}
                  >
                    Pricing
                    {activeDropdown === 'pricing' ? <FaChevronUp className="ml-1" size={12} /> : <FaChevronDown className="ml-1" size={12} />}
                  </button>
                  {activeDropdown === 'pricing' && (
                    <div 
                      className="absolute top-full left-0 w-80 mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-50"
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <h3 className="font-semibold text-primary">Pricing</h3>
                        <p className="text-sm text-gray-600">Flexible options for all needs</p>
                      </div>
                      <div className="p-2">
                        {dropdownMenus.pricing.map((item, index) => (
                          <Link 
                            key={index} 
                            to={item.path}
                            className="block p-3 hover:bg-gray-50 rounded-md transition-colors"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="font-medium text-text-dark">{item.title}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </li>

                {/* Partner Dropdown */}
                <li className="relative group">
                  <button 
                    className="flex items-center text-text-dark hover:text-primary font-medium transition-colors"
                    onMouseEnter={() => setActiveDropdown('partner')}
                    onClick={() => toggleDropdown('partner')}
                  >
                    Partner
                    {activeDropdown === 'partner' ? <FaChevronUp className="ml-1" size={12} /> : <FaChevronDown className="ml-1" size={12} />}
                  </button>
                  {activeDropdown === 'partner' && (
                    <div 
                      className="absolute top-full left-0 w-80 mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-50"
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <h3 className="font-semibold text-primary">Partner With Us</h3>
                        <p className="text-sm text-gray-600">Join our growing ecosystem</p>
                      </div>
                      <div className="p-2">
                        {dropdownMenus.partner.map((item, index) => (
                          <Link 
                            key={index} 
                            to={item.path}
                            className="block p-3 hover:bg-gray-50 rounded-md transition-colors"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="font-medium text-text-dark">{item.title}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </li>

                {/* Company Dropdown */}
                <li className="relative group">
                  <button 
                    className="flex items-center text-text-dark hover:text-primary font-medium transition-colors"
                    onMouseEnter={() => setActiveDropdown('company')}
                    onClick={() => toggleDropdown('company')}
                  >
                    Company
                    {activeDropdown === 'company' ? <FaChevronUp className="ml-1" size={12} /> : <FaChevronDown className="ml-1" size={12} />}
                  </button>
                  {activeDropdown === 'company' && (
                    <div 
                      className="absolute top-full left-0 w-80 mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-50"
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <h3 className="font-semibold text-primary">Our Company</h3>
                        <p className="text-sm text-gray-600">Learn more about us</p>
                      </div>
                      <div className="p-2">
                        {dropdownMenus.company.map((item, index) => (
                          <Link 
                            key={index} 
                            to={item.path}
                            className="block p-3 hover:bg-gray-50 rounded-md transition-colors"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="font-medium text-text-dark">{item.title}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
            </ul>
          </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {userName ? (
                <div className="flex items-center space-x-2 text-text-dark">
                  <FaUser />
                  <span>{userName}</span>
                </div>
              ) : (
                <>
                  <button className="text-text-dark hover:text-primary font-medium transition-colors">
                    Sign In
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={() => setIsSignupOpen(true)}
                  >
              Get Started
            </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-gray-200">
              <ul className="space-y-4">
                {Object.entries(dropdownMenus).map(([key, items], index) => (
                  <li key={index} className="py-2">
                    <button 
                      className="flex items-center justify-between w-full text-left font-medium"
                      onClick={() => toggleDropdown(key)}
                    >
                      <span className="text-text-dark">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                      {activeDropdown === key ? 
                        <FaChevronUp className="text-gray-400" size={12} /> : 
                        <FaChevronDown className="text-gray-400" size={12} />
                      }
                    </button>
                    
                    {activeDropdown === key && (
                      <div className="mt-2 pl-4 border-l-2 border-gray-100 space-y-2">
                        {items.map((item, idx) => (
                          <Link 
                            key={idx} 
                            to={item.path}
                            className="block py-2 text-gray-700 hover:text-primary"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-6 space-y-4">
                {userName ? (
                  <div className="flex items-center space-x-2 text-text-dark">
                    <FaUser />
                    <span>{userName}</span>
                  </div>
                ) : (
                  <>
                    <button className="block w-full text-left text-text-dark hover:text-primary font-medium transition-colors">
                      Sign In
                    </button>
                    <button 
                      className="btn-primary w-full"
                      onClick={() => setIsSignupOpen(true)}
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Signup Walkthrough Modal */}
      {isSignupOpen && <SignupModal closeModal={() => setIsSignupOpen(false)} onCompleteSignup={handleCompleteSignup} />}
    </>
  );
};

export default Header;
