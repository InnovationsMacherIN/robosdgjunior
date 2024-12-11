// src/config/blockIconConfig.jsx

import React from 'react';
import '../styles/blockIconConfig.css';
import icon_nuoli from "../assets/icons/nuoli.svg";
import icon_puoli from "../assets/icons/puoli-pallo.svg";

const BlockIconConfig = ({ blockId }) => {

  const getIconSrc = (blockId) => {
    switch (blockId) {
      case 'start':
        return '';
      case 'end':
        return '';
      case 'melody':
      case 'sound':
        return icon_puoli;
      case 'forward':
        return icon_nuoli;
      // Add more cases for other block IDs
      default:
        return ''; // Default icon or empty string if no icon
    }
  };

  return (
    <div className="block-icon-container">
      <img src={getIconSrc(blockId)} alt="Block Icon" className="block-icon"/>
    </div>
  );
};

export default BlockIconConfig;
