import React from "react";
import { FaLinkedin, FaYoutube, FaTwitter, FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-background-dark text-white py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Section - Logo and Tagline */}
          <div className="space-y-4">
            <img src="/logo.png" alt="AANA logo" className="h-10" />
            <p className="text-gray-300 max-w-xs">Unlocking Potential in the Workplace</p>
            <p className="text-sm text-gray-400 mt-4">
              AANA AI helps connect patients with innovative clinical trials.
            </p>
          </div>

          {/* Center Section - Company & Product Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-200">COMPANY</h3>
              <ul className="space-y-2">
                <li><a href="/about" className="text-gray-300 hover:text-white transition-colors">About us</a></li>
                <li><a href="/careers" className="text-gray-300 hover:text-white transition-colors">Careers</a></li>
                <li><a href="/blog" className="text-gray-300 hover:text-white transition-colors">Blog</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-200">PRODUCT</h3>
              <ul className="space-y-2">
                <li><a href="/platform" className="text-gray-300 hover:text-white transition-colors">Platform</a></li>
                <li><a href="/integrations" className="text-gray-300 hover:text-white transition-colors">Integrations</a></li>
                <li><a href="/white-label" className="text-gray-300 hover:text-white transition-colors">White Label</a></li>
                <li><a href="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
          </div>

          {/* Right Section - Social Links & Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-200">CONNECT</h3>
            <div className="flex space-x-4 mb-6">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <FaLinkedin className="text-2xl" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <FaYoutube className="text-2xl" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <FaTwitter className="text-2xl" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <FaGithub className="text-2xl" />
              </a>
            </div>
            
            <h4 className="text-md font-bold mb-2 text-gray-200">Subscribe to our newsletter</h4>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="px-4 py-2 bg-gray-700 text-white rounded-l focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button 
                type="submit" 
                className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-r transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom Section - Legal & Copyright */}
        <div className="border-t border-gray-700 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-6 mb-4 md:mb-0">
            <a href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">Terms</a>
            <a href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy</a>
            <a href="/cookies" className="text-sm text-gray-400 hover:text-white transition-colors">Cookies</a>
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} AANA AI, Corp. All rights reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
