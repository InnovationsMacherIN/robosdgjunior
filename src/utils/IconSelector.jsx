import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bird, Egg, Laugh, Square } from 'lucide-react';
import ArrowUp from "../assets/icons/robo-usericon-arrow-up.jsx";
import Coin from "../assets/icons/robo-usericon-coin.jsx";
import Book from "../assets/icons/robo-usericon-book.jsx";
import Equality from "../assets/icons/robo-usericon-equality.jsx";
import Water from "../assets/icons/robo-usericon-water.jsx";
import Sun from "../assets/icons/robo-usericon-sun.jsx";
import Heart from "../assets/icons/robo-usericon-heart.jsx";
import House from "../assets/icons/robo-usericon-house.jsx";
import Eight from "../assets/icons/robo-usericon-eight.jsx";
import Transport from "../assets/icons/robo-usericon-transport.jsx";
import Tree from "../assets/icons/robo-usericon-tree.jsx";
import Soup from "../assets/icons/robo-usericon-soup.jsx";
import Fish from "../assets/icons/robo-usericon-fish.jsx";
import Peace from "../assets/icons/robo-usericon-peace.jsx";
import '../styles/components/IconSelector.css';
import RoboClose from '../assets/icons/robo-close.jsx';

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
    ArrowUp, Coin, Book, Equality,    // Row 1 first half
    Water, Sun, Heart,          // Row 1 second half
    House, Eight, Transport,          // Row 2 first half
    Tree, Soup, Fish, Peace      // Row 2 second half
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
          <button onClick={() => setShowPopup(false)} className="close-button">
            <RoboClose style={{ width: '26px', height: '50px' }} />
          </button>
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
