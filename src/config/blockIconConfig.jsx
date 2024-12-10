// src/config/blockIconConfig.jsx

import React from 'react';
import '../styles/blockIconConfig.css';

const BlockIconConfig = ({ blockId }) => {
  // Määrittelee onko kyseessä movement vai sound block
  const isMovementBlock = (id) => {
    const movementBlocks = [
      'forward',
      'backward',
      'left',
      'right',
      'turn-left',
      'turn-right'
    ];
    return movementBlocks.includes(id);
  };

  const isSoundBlock = (id) => {
    const soundBlocks = [
      'melody',
      'sound'
    ];
    return soundBlocks.includes(id);
  };

  // Määrittelee oikean polun ja kuvan blockin tyypin mukaan
  const getIconPath = (id) => {
    if (isMovementBlock(id)) {
      return '/src/assets/images/perhonen.png';
    } else if (isSoundBlock(id)) {
      return '/src/assets/icons/hammasratas.svg';
    }
    return null;
  };

  const iconPath = getIconPath(blockId);
  if (!iconPath) return null;

  return (
    <div className="block-icon-container">
      <img
        src={iconPath}
        alt={`Icon for ${blockId}`}
        className={`block-icon ${isMovementBlock(blockId) ? 'movement-icon' : 'sound-icon'}`}
      />
    </div>
  );
};

export default BlockIconConfig;
