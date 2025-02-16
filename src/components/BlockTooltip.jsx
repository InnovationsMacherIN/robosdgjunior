import React, { useState, useEffect } from 'react';

const BlockTooltip = ({ title, description, mousePosition }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!mousePosition) return null;

  // Asetetaan tooltip suoraan hiiren kohdalle
  const position = {
    left: `${mousePosition.x}px`,
    top: `${mousePosition.y}px`
  };

  return (
    <div
      className={`block-tooltip ${isVisible ? 'visible' : ''}`}
      style={position}
    >
      <div className="block-tooltip-title">{title}</div>
      <div className="block-tooltip-description">{description}</div>
    </div>
  );
};

export default BlockTooltip;
