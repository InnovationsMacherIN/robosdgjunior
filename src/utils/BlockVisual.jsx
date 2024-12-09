import React from 'react';

const BlockVisual = ({ blockId }) => {
  const getVisualClass = (id) => {
    switch (id) {
      case 'forward':
        return 'visual-forward';
      case 'backward':
        return 'visual-backward';
      case 'left':
      case 'turn-left':
        return 'visual-turn-left';
      case 'right':
      case 'turn-right':
        return 'visual-turn-right';
      case 'melody':
      case 'sound':
        return 'visual-sound';
      case 'show-text':
      case 'show-picture':
      case 'leds-off':
        return 'visual-display';
      case 'motor':
      case 'wait':
        return 'visual-settings'
      default:
        return '';
    }
  };

  const visualClass = getVisualClass(blockId);
  if (!visualClass) return null;

  if (visualClass === 'visual-forward') {
    return (
    <div className="block-visual">
      <div className="visual-forward">
        <div className="visual-forward-wave wave-1" />
        <div className="visual-forward-wave wave-2" />
        <div className="visual-forward-wave wave-3" />
        <div className="visual-forward-arrow" />
      </div>
    </div>
    );
  } else {
    return (
      <div className={`block-visual ${visualClass}`}/>
    );
  }

};

export default BlockVisual;
