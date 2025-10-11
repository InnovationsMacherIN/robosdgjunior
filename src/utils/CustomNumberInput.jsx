/**
 * @file CustomNumberInput.jsx
 * @description A custom number input component that displays a popup numpad.
 * @module utils/CustomNumberInput
 * @param {Object} props - The component props.
 * @param {number|string} props.value - The current value of the input.
 * @param {function} props.onChange - A function to be called when the value changes.
 * @param {number|string} props.defaultValue - The default value of the input.
 * @returns {React.ReactElement} The CustomNumberInput component.
 */
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/CustomNumberInput.css';
import RoboClose from "../assets/icons/robo-close.jsx";

const CustomNumberInput = ({ value, onChange, defaultValue }) => {
  const [showPopup, setShowPopup] = useState(false);

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

  /**
   * @function handleButtonClick
   * @description Handles a click on a number button.
   * @param {number} number - The number that was clicked.
   */
  const handleButtonClick = (number) => {
    onChange(number);
    setShowPopup(false);
  };

  /**
   * @function handleInputClick
   * @description Handles a click on the input.
   * @param {Event} e - The click event.
   */
  const handleInputClick = (e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setShowPopup(true);
  };

  /**
   * @function renderPopup
   * @description Renders the number pad popup.
   * @returns {React.ReactElement} The number pad popup.
   */
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
      <div
          className="custom-number-input"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            zIndex: 10
          }}
      >
        <input
            type="text"
            value={value || defaultValue}
            readOnly
            onClick={handleInputClick}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
            }}
            style={{
              position: 'relative',
              zIndex: 5,
              pointerEvents: 'auto',
              cursor: 'pointer'
            }}
        />
        {renderPopup()}
      </div>
  );
};

export default CustomNumberInput;