/**
 * @file IconSelector.jsx
 * @description A component for selecting a profile icon.
 * @module utils/IconSelector
 * @param {Object} props - The component props.
 * @param {function} props.onSelectIcon - A function to be called when an icon is selected.
 * @param {string} props.currentIcon - The currently selected icon.
 * @returns {React.ReactElement} The IconSelector component.
 */
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

const IconSelector = ({ onSelectIcon, currentIcon }) => {
  const [showPopup, setShowPopup] = useState(false);

  const iconOptions = [
    ArrowUp, Coin, Book, Equality,
    Water, Sun, Heart,
    House, Eight, Transport,
    Tree, Soup, Fish, Peace
  ];

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
   * @function handleIconSelect
   * @description Handles the selection of an icon.
   * @param {string} Icon - The selected icon.
   */
  const handleIconSelect = (Icon) => {
    onSelectIcon(Icon);
    setShowPopup(false);
  };

  /**
   * @function renderPopup
   * @description Renders the icon selection popup.
   * @returns {React.ReactElement} The icon selection popup.
   */
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