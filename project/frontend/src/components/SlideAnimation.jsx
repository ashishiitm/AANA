import React from 'react';
import './SlideAnimation.css';

const SlideAnimation = ({ color }) => {
  return (
    <div className="slide-animation">
      {/* Central Ring */}
      <div className="central-ring" style={{ borderColor: color }}></div>
      
      {/* Outer Rings Container */}
      <div className="outer-rings">
        <div className="outer-ring-wrapper outer-ring-wrapper-1">
          <div className="outer-ring"></div>
        </div>
        <div className="outer-ring-wrapper outer-ring-wrapper-2">
          <div className="outer-ring"></div>
        </div>
        <div className="outer-ring-wrapper outer-ring-wrapper-3">
          <div className="outer-ring"></div>
        </div>
        <div className="outer-ring-wrapper outer-ring-wrapper-4">
          <div className="outer-ring"></div>
        </div>
        <div className="outer-ring-wrapper outer-ring-wrapper-5">
          <div className="outer-ring"></div>
        </div>
        <div className="outer-ring-wrapper outer-ring-wrapper-6">
          <div className="outer-ring"></div>
        </div>
      </div>
    </div>
  );
};

export default SlideAnimation;
