import React, { useState } from 'react';
import '../styles/CustomNumberInput.css';

const CustomNumberInput = ({ value, onChange }) => {
  const [showPopup, setShowPopup] = useState(false);

  const handleButtonClick = (number) => {
    onChange(number);
    setShowPopup(false);
  };

  return (
    <div className="custom-number-input">
      <input
        type="text"
        value={value}
        readOnly
        onClick={() => setShowPopup(true)}
      />
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
              <button key={number} onClick={() => handleButtonClick(number)}>
                {number}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomNumberInput;
