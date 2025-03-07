import React from "react";
import "./WhyAana.css";

const NewBanner = () => {
  return (
    <section className="new-banner">
      <div className="new-banner-content">
        {/* Left Content */}
        <div className="new-banner-text">
          <h3 className="subheading">WHY Build with AANA</h3>
          <h2 className="heading">Multiply your workforce in minutes</h2>
         
          <p>
            With its Generative Workflow Engine™ and pre-built library of agents, Ema conversationally activates
            new AI employees to execute any complex workflow in the enterprise. Pre-integrated with hundreds
            of apps, Ema is easy to configure and deploy.
          </p>
          <button className="cta-button">Explore integrations</button>
        </div>

        {/* Right Image/Animation */}
        <div className="new-banner-image">
          <img src="/images/workflow-cards.png" alt="Workflow Cards" />
        </div>
      </div>
    </section>
  );
};

export default NewBanner;
