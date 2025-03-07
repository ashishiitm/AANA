import React, { useState, useEffect } from "react";
import "./WorkflowAnimation.css";

const steps = [
  { key: "virtualagent1", img: "/images/virtualagent1.png", label: "Virtual Agent 1", dataSource: "/images/datasource1.png" },
  { key: "virtualagent2", img: "/images/virtualagent2.png", label: "Virtual Agent 2", dataSource: "/images/datasource2.png" },
  { key: "human", img: "/images/human.png", label: "Human Executive", dataSource: null },
  { key: "virtualagent3", img: "/images/virtualagent3.png", label: "Virtual Agent 3", dataSource: "/images/datasource3.png" }
];

const WorkflowAnimation = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="workflow-section">
      {/* Heading */}
      <h2 className="workflow-heading">Connected Network of Agents</h2>

      <div className="workflow-container">
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            {/* Agent + Data Source */}
            <div className="agent-group">
              <div className={`agent ${activeStep >= index ? "active" : ""}`}>
                <img src={step.img} alt={step.label} />
              </div>
              {step.dataSource && (
                <>
                  <div className={`double-arrow ${activeStep >= index ? "active" : ""}`}>&#x2195;</div>
                  <div className={`data-source ${activeStep >= index ? "active" : ""}`}>
                    <img src={step.dataSource} alt={`Data Source ${index + 1}`} />
                  </div>
                </>
              )}
            </div>

            {/* Arrow between Agents */}
            {index < steps.length - 1 && <div className={`arrow ${activeStep > index ? "visible" : ""}`}>&#10140;</div>}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default WorkflowAnimation;
