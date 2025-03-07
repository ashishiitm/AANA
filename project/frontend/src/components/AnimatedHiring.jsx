import React from 'react';
import './AnimatedHiring.css';

const agents = [
  { id: 1, angle: 0 },
  { id: 2, angle: 60 },
  { id: 3, angle: 120 },
  { id: 4, angle: 180 },
  { id: 5, angle: 240 },
  { id: 6, angle: 300 },
];

const AnimatedHiring = () => {
  const radius = 150; // distance from center to each agent

  return (
    <div className="circle-container">
      {/* Human at center */}
      <div className="human">
        <img src="/images/human.png" alt="Human" />
      </div>

      {agents.map(agent => (
        <div key={agent.id}>
          {/* Arrow from center to agent */}
          <div
            className="arrow"
            style={{
              transform: `rotate(${agent.angle}deg)`,
              width: `${radius}px`,
            }}
          ></div>
          {/* Virtual Agent positioned along circle */}
          <div
            className="agent"
            style={{
              transform: `translate(-50%, -50%) rotate(${agent.angle}deg) translate(${radius}px) rotate(-${agent.angle}deg)`,
            }}
          >
            <img src="/images/agent.png" alt="Virtual Agent" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnimatedHiring;
