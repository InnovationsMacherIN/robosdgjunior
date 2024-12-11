import React from 'react';

const BlockVisual = ({ blockId }) => {

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

  const isSettingBlock = (id) => {
    const settingBlocks = [
      'motor',
      'wait'
    ];
    return settingBlocks.includes(id);
  };

  // Määrittelee oikean polun ja kuvan blockin tyypin mukaan
  const getIconPath = (id) => {
    if (isMovementBlock(id)) {
      return '/src/assets/icons/nuoli.svg';
    } else if (isSoundBlock(id)) {
      return '/src/assets/images/perhonen.png';
    } else if (isSettingBlock(id)) {
      return '/src/assets/icons/hammasratas.svg';
    }
    return null;
  };

  const iconPath = getIconPath(blockId);
  if (!iconPath) return null;



  return (
    <div className="block-visual-container">
      <div className="icon-box">
        <img
          src={iconPath}
          alt={`Icon for ${blockId}`}
          className={`block-icon ${isMovementBlock(blockId) ? 'movement-icon' : 'sound-icon'}`}
        />
      </div>
      <div className="block-visual">
        {/* Existing visual elements */}
      </div>
    </div>
  );
};

export default BlockVisual;
