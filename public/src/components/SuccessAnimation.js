import React, { useEffect, useState } from 'react';
import './SuccessAnimation.css';

const SuccessAnimation = ({ message = 'Success!', onComplete, duration = 2000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!visible) return null;

  return (
    <div className="success-animation-overlay">
      <div className="success-animation">
        <div className="success-checkmark">
          <svg className="checkmark" viewBox="0 0 52 52">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
        <h3 className="success-message">{message}</h3>
      </div>
    </div>
  );
};

export default SuccessAnimation;
