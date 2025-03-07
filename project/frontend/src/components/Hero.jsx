// src/components/Home/Hero.jsx
import React from 'react';
import './Hero.css'; // Optional: Create and import a CSS file for Hero styling

const Hero = () => {
  return (
    <section className="hero">
      <h1>Transform Your Workflow with AI Assistance</h1>
      <p>
        Automate repetitive tasks and enhance productivity with our intelligent assistant powered by advanced machine learning.
      </p>
      <a href="#cta" className="cta-button">Start Free Trial</a>
    </section>
  );
};

export default Hero;
