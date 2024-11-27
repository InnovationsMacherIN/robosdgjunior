import React from 'react';
import '../../styles/components/BlocksPanel.css';

const BlocksPanel = ({
                       categories,
                       selectedCategory,
                       setSelectedCategory,
                       blocksByCategory,
                       handleDragStart
                     }) => {
  const handleInputChange = (e, blockId, inputType = 'primary') => {
    const block = blocksByCategory[selectedCategory].find(b => b.id === blockId);
    if (!block) return;

    // Luo kopio lohkosta päivitetyillä arvoilla
    const updatedBlock = { ...block };

    if (inputType === 'primary') {
      updatedBlock.inputValue = e.target.value;
    } else {
      updatedBlock.secondInputValue = e.target.value;
    }

    // Kun lohkoa raahataan, handleDragStart saa päivitetyn version
    const originalDragStart = (e) => handleDragStart(e, updatedBlock);
    e.target.closest('.block').ondragstart = originalDragStart;
  };

  const renderInput = (block) => {
    if (!block.hasInput) return null;

    switch (block.inputType) {
      case 'number':
        return (
          <div className="input-group">
            {block.inputLabel && (
              <label htmlFor={`${block.id}-input`}>{block.inputLabel}</label>
            )}
            <input
              id={`${block.id}-input`}
              type="number"
              min={block.inputMin}
              max={block.inputMax}
              step={block.inputStep || 1}
              defaultValue={block.defaultValue}
              onChange={(e) => handleInputChange(e, block.id)}
              onClick={(e) => e.stopPropagation()}
              className="block-input-number"
            />
          </div>
        );

      case 'range':
        return (
          <div className="input-group">
            {block.inputLabel && (
              <label htmlFor={`${block.id}-input`}>{block.inputLabel}</label>
            )}
            <div className="range-container">
              <input
                id={`${block.id}-input`}
                type="range"
                min={block.inputMin}
                max={block.inputMax}
                defaultValue={block.defaultValue}
                onChange={(e) => handleInputChange(e, block.id)}
                onClick={(e) => e.stopPropagation()}
                className="block-input-range"
              />
              <span className="range-value">{block.defaultValue}</span>
            </div>
          </div>
        );

      case 'select':
        return (
          <div className="input-group">
            {block.inputLabel && (
              <label htmlFor={`${block.id}-input`}>{block.inputLabel}</label>
            )}
            <select
              id={`${block.id}-input`}
              defaultValue={block.defaultValue}
              onChange={(e) => handleInputChange(e, block.id)}
              onClick={(e) => e.stopPropagation()}
              className="block-input-select"
            >
              {block.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'text':
      default:
        return (
          <div className="input-group">
            {block.inputLabel && (
              <label htmlFor={`${block.id}-input`}>{block.inputLabel}</label>
            )}
            <input
              id={`${block.id}-input`}
              type="text"
              maxLength={block.maxLength}
              defaultValue={block.defaultValue}
              onChange={(e) => handleInputChange(e, block.id)}
              onClick={(e) => e.stopPropagation()}
              className="block-input-text"
            />
          </div>
        );
    }
  };

  return (
    <div className="categories">
      <div className="category-buttons">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-button ${
              selectedCategory === category ? 'active' : ''
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="blocks-container">
        {blocksByCategory[selectedCategory]?.map((block) => (
          <div
            key={block.id}
            className={`block ${block.className}`}
            draggable="true"
            onDragStart={(e) => handleDragStart(e, block)}
          >
            <div className="block-header">
              <span className="block-title">{block.title}</span>
            </div>
            <p className="block-description">{block.description}</p>
            {renderInput(block)}
            {block.hasSecondInput && (
              <div className="second-input">
                {block.secondInputType === 'number' ? (
                  <div className="input-group">
                    <label htmlFor={`${block.id}-second-input`}>
                      {block.secondInputLabel}
                    </label>
                    <input
                      id={`${block.id}-second-input`}
                      type="number"
                      min={block.secondInputMin}
                      max={block.secondInputMax}
                      defaultValue={block.secondInputDefault}
                      onChange={(e) => handleInputChange(e, block.id, 'secondary')}
                      onClick={(e) => e.stopPropagation()}
                      className="block-input-number"
                    />
                  </div>
                ) : (
                  <div className="input-group">
                    <label htmlFor={`${block.id}-second-input`}>
                      {block.secondInputLabel}
                    </label>
                    <select
                      id={`${block.id}-second-input`}
                      defaultValue={block.secondInputDefault}
                      onChange={(e) => handleInputChange(e, block.id, 'secondary')}
                      onClick={(e) => e.stopPropagation()}
                      className="block-input-select"
                    >
                      {block.options.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlocksPanel;
