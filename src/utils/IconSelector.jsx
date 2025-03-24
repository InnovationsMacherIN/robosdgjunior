import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bird, Egg, Laugh, Square } from 'lucide-react';
import ArrowUp from "../assets/icons/robo-usericon-arrow-up.svg";
import Coin from "../assets/icons/robo-usericon-coin.svg";
import Book from "../assets/icons/robo-usericon-book.svg";
import Equality from "../assets/icons/robo-usericon-equality.svg";
import Water from "../assets/icons/robo-usericon-water.svg";
import Sun from "../assets/icons/robo-usericon-sun.svg";
import Heart from "../assets/icons/robo-usericon-heart.svg";
import House from "../assets/icons/robo-usericon-house.svg";
import Eight from "../assets/icons/robo-usericon-eight.svg";
import Transport from "../assets/icons/robo-usericon-transport.svg";
import Tree from "../assets/icons/robo-usericon-tree.svg";
import Soup from "../assets/icons/robo-usericon-soup.svg";
import Fish from "../assets/icons/robo-usericon-fish.svg";
import Peace from "../assets/icons/robo-usericon-peace.svg";
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
    console.log(Icon)
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
              <div
                key={index}
                onClick={() => handleIconSelect(Icon)}
                className="icon-button"
              >
                <img src={Icon} alt="Icon" width="40" height="40"  />
              </div>
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
        <img src={IconComponent} alt="Icon" width="30" height="30" />
      </button>
      {renderPopup()}
    </div>
  );
};

export default IconSelector;
