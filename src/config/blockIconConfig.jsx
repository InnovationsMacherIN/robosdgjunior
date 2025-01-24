// src/config/blockIconConfig.jsx

import React from 'react';
import '../styles/blockIconConfig.css';
import icon_nuoli from "../assets/icons/robo-arrow-ahead.svg";
import icon_nuoli_taakse from "../assets/icons/robo-arrow-backwards.svg";
import icon_puoli from "../assets/icons/puoli-pallo.svg";
import icon_rengas_vasen from "../assets/icons/robo-tyre-left.svg";
import icon_rengas_oikea from "../assets/icons/robo-tyre-right.svg";

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
      case 'backward':
        return icon_nuoli_taakse;
      case 'turn-left':
        return icon_rengas_vasen;
      case 'turn-right':
        return icon_rengas_oikea;
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
