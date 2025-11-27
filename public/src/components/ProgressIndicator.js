import React from 'react';
import './ProgressIndicator.css';

const ProgressIndicator = ({ steps, currentStep }) => {
  return (
    <div className="progress-indicator">
      {steps.map((step, index) => (
        <div key={index} className="progress-step-wrapper">
          <div className={`progress-step ${index < currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}>
            <div className="progress-step-circle">
              {index < currentStep ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <div className="progress-step-label">{step}</div>
          </div>
          {index < steps.length - 1 && (
            <div className={`progress-line ${index < currentStep ? 'completed' : ''}`}></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressIndicator;
