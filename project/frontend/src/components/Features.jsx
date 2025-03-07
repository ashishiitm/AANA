import React from "react";
import "./Features.css"; // Ensure CSS is linked properly

// Sample data for features
const features = [
  {
    title: "API Automation",
    description: "Create automations across 200+ API integrations in natural language with API Skill, purpose-built for every integration. Reimagine iPaaS for the new world of AI.",
    image: "/images/apiautomation.png", // Replace with correct image path
    link: "#"
  },
  {
    title: "Browser Automation",
    description: "No APIs? No problem. Connect to applications using browser login and automate with purpose-built skills for scraping, browser automation, crawling, and more.",
    image: "/images/browserautomation.png",
    link: "#"
  },
  {
    title: "AI Agents",
    description: "Build enterprise AI agents with AI Agent Skill, combining the power of agents and workflows to get the best outcome.",
    image: "/assets/aiagent.png",
    link: "#"
  },
  {
    title: "AI Document Processing",
    description: "Harness advanced document processing skills to read, analyze, manage, and generate a variety of files and documents with AI precision.",
    image: "/images/browserautomation.png",
    link: "#"
  },
  {
    title: "Agentic Workflows",
    description: "Bring the magic of large language models (LLMs) in every workflow across all leading LLM providers such as Claude, OpenAI, Perplexity, and more.",
    image: "/images/agenticworkflow.png",
    link: "#"
  },
  {
    title: "Data Processing & Reporting",
    description: "Process structured and unstructured data in simple English as needed in automation.",
    image: "/images/dataanalysis.png",
    link: "#"
  }
];

const Features = () => {
  return (
    <section className="features-container">
      {/* Heading Section */}
      <div className="features-header">
        <h2>One Complete Platform </h2>
        <h2 className="highlight">AI, workflow automations, and agents</h2>
        <p>Explore AI Skills that makes generative automation fast and delightful</p>
      </div>

      {/* Feature Cards */}
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <img src={feature.image} alt={feature.title} className="feature-image" />
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            <a href={feature.link} className="learn-more">
              Learn More →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
