import React from 'react';
/**
 * Block.jsx
 * Individual programming block component used in programming area
 * handles dragging and reordering of blocks and input changes
 *
 * @component
 */

const DroppedBlock = ({ block, index, onDragStart, onInputChange }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/internal',
      JSON.stringify({ fromIndex: index }));
    onDragStart(e, index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    const dropZone = e.currentTarget.getBoundingClientRect();
    const dropPosition = e.clientY - dropZone.top;
    const toIndex = dropPosition < dropZone.height / 2 ? index : index + 1;
  };

  const handleInputChange = (value, isSecondInput = false) => {
    onInputChange(index, value, isSecondInput);
  };

  const renderBlockInput = (block, index) => {
    switch(block.inputType) {
      case 'number':
        return (
          <input
            type="number"
            min={block.inputMin}
            max={block.inputMax}
            step={block.inputStep}
            defaultValue={block.defaultValue}
            onChange={(e) => handleInputChange(e.target.value)}
          />
        );
      case 'select':
        return (
          <select
            defaultValue={block.defaultValue}
            onChange={(e) => handleInputChange(e.target.value)}
          >
            {block.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            defaultValue={block.defaultValue}
            onChange={(e) => handleInputChange(e.target.value)}
          />
        );
    }
  };

  const renderSecondInput = (block) => {
    if (block.secondInputType === 'number') {
      return (
        <input
          type="number"
          min={block.secondInputMin}
          max={block.secondInputMax}
          defaultValue={block.secondInputDefault}
          onChange={(e) => handleInputChange(e.target.value, true)}
        />
      );
    }
    return (
      <select
        defaultValue={block.secondInputDefault}
        onChange={(e) => handleInputChange(e.target.value, true)}
      >
        {block.options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };

  const renderBlockValue = (block) => {
    let valueText = '';

    if (block.inputValue !== undefined) {
      if (block.inputType === 'select') {
        const option = block.options?.find(opt => opt.value === block.inputValue);
        valueText = option ? option.label : block.inputValue;
      } else {
        valueText = block.inputValue;
      }
    }

    if (block.secondInputValue !== undefined) {
      if (block.secondInputType === 'select') {
        const option = block.options?.find(opt => opt.value === block.secondInputValue);
        valueText += ` ${option ? option.label : block.secondInputValue}`;
      } else {
        valueText += ` ${block.secondInputValue}`;
      }
    }

    return valueText ? ` (${valueText})` : '';
  };

  return (
    <div
      className={`block ${block.className || ''}`}
      draggable="true"
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
    >
      <div className="block-header">
        <span className="block-title">
          {block.title}
          {renderBlockValue(block)}
        </span>
      </div>
      {block.hasInput && (
        <div className="block-input-container">
          <label>{block.inputLabel}</label>
          {renderBlockInput(block, index)}
        </div>
      )}
      {block.hasSecondInput && (
        <div className="block-input-container">
          <label>{block.secondInputLabel}</label>
          {renderSecondInput(block)}
        </div>
      )}
      <p className="block-description">{block.description}</p>
    </div>
  );
};

export default DroppedBlock;
