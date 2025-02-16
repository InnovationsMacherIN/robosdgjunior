import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bird, Egg, Laugh, Square } from 'lucide-react';
import '../styles/components/IconSelector.css';

/**
 * IconSelector Component
 *
 * Displays a full-screen popup for selecting profile icons.
 * Uses similar styling and behavior to CustomNumberInput.
 *
 * @param {Object} props
 * @param {function} props.onSelectIcon - Callback when icon is selected
 * @param {Object} props.currentIcon - Currently selected icon component
 */
const IconSelector = ({ onSelectIcon, currentIcon }) => {
  const [showPopup, setShowPopup] = useState(false);

  // Available icons - currently using placeholders
  const iconOptions = [
    Bird, Egg, Laugh, Bird,    // Row 1 first half
    Egg, Laugh, Bird,          // Row 1 second half
    Egg, Laugh, Bird,          // Row 2 first half
    Egg, Laugh, Bird, Egg      // Row 2 second half
  ];

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

  const handleIconSelect = (Icon) => {
    onSelectIcon(Icon);
    setShowPopup(false);
  };

  // Render the popup using portal
  const renderPopup = () => {
    if (!showPopup) return null;

    return createPortal(
      <div className="icon-selector-container">
        <div className="popup-overlay" />
        <div className="icon-popup">
          <div className="icon-grid">
            {iconOptions.map((Icon, index) => (
              <button
                key={index}
                onClick={() => handleIconSelect(Icon)}
                className="icon-button"
              >
                <Icon size={30} />
              </button>
            ))}
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const IconComponent = currentIcon;

  return (
    <div className="icon-selector">
      <button
        className="icon-trigger"
        onClick={() => setShowPopup(true)}
      >
        <IconComponent style={{width: '30px', height: '30px', color:'white'}} />
      </button>
      {renderPopup()}
    </div>
  );
};

export default IconSelector;
