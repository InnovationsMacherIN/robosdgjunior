import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/CustomNumberInput.css';
import RoboClose from "../assets/icons/robo-close.jsx";

/**
 * CustomNumberInput Component
 *
 * Enhanced number input that shows a full-screen popup numpad.
 * Uses React Portal to render the popup at the root level.
 *
 * @param {Object} props
 * @param {number|string} props.value - Current input value
 * @param {function} props.onChange - Value change handler
 * @param {number|string} props.defaultValue - Default value
 */
const CustomNumberInput = ({ value, onChange, defaultValue }) => {
  const [showPopup, setShowPopup] = useState(false);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.classList.contains('popup-overlay')) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopup]);

  const handleButtonClick = (number) => {
    onChange(number);
    setShowPopup(false);
  };

  // Render the popup using portal
  const renderPopup = () => {
    if (!showPopup) return null;

    return createPortal(
      <div className="number-input-container">
        <div className="popup-overlay" />
        <div className="popup">
          <button onClick={() => setShowPopup(false)} className="close-button">
            <RoboClose style={{ width: '26px', height: '50px' }} />
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <button
              key={number}
              onClick={() => handleButtonClick(number)}
              className="number-button"
            >
              {number}
            </button>
          ))}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="custom-number-input">
      <input
        type="text"
        value={value || defaultValue}
        readOnly
        onClick={() => setShowPopup(true)}
      />
      {renderPopup()}
    </div>
  );
};

export default CustomNumberInput;
