import React from 'react';
import icon_nuoli from '../assets/icons/nuoli.svg';
import icon_puoli from '../assets/icons/puoli-pallo.svg';

const BlockVisual = ({ blockId }) => {
  const getIconSrc = (blockId) => {
    switch (blockId) {
      case 'start':
        return icon_nuoli;
      case 'end':
        return icon_nuoli;
      case 'melody':
      case 'sound':
        return icon_puoli;
      // Add more cases for other block IDs
      default:
        return ''; // Default icon or empty string if no icon
    }
  };

  return (
    <div className="block-visual-container">
      <div className="icon-box">
        <img src={getIconSrc(blockId)} alt="Block Icon" className="block-icon" />
      </div>
      <div className="block-visual">
        {/* Existing visual elements */}
      </div>
    </div>
  );
};

export default BlockVisual;
