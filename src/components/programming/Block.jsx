import React, {useRef} from 'react';
/**
 * Block.jsx
 * Individual programming block component used in programming area
 * handles dragging and reordering of blocks and input changes
 *
 * @component
 */

const DroppedBlock = ({ block, index, onDragStart, onInputChange, onDragEnd, onDragOverPosition }) => {
  const blockRef = useRef(null);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/internal',
      JSON.stringify({ fromIndex: index }));
    onDragStart(e, index);
    console.log('Dragging block:', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    const blockElement = blockRef.current;
    if (!blockElement) return;

    const rect = blockElement.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const height = rect.height;

    // Määritellään pudotusalueet: ylä- ja alapuolisko
    const position = relativeY < height / 2 ? 'before' : 'after';
    const toIndex = position === 'before' ? index : index + 1;

    onDragOverPosition(toIndex);

    // Poistetaan vanhat indikaattorit ja siirtymät
    document.querySelectorAll('.block-drop-indicator').forEach(el => el.remove());
    document.querySelectorAll('.block.drop-target').forEach(el =>
      el.classList.remove('drop-target'));
    document.querySelectorAll('.block.shift-right').forEach(el =>
      el.classList.remove('shift-right'));

    // Lisätään kohde-blokin highlight ja siirto
    blockElement.classList.add('drop-target');

    // Luodaan ja lisätään uusi indikaattori alkuperäiselle paikalle
    const indicator = document.createElement('div');
    indicator.className = 'block-drop-indicator';
    blockElement.parentElement.insertBefore(indicator, blockElement);

    // Lisätään shift-right luokka kaikille seuraaville blokeille
    let nextElement = blockElement.nextElementSibling;
    while (nextElement) {
      nextElement.classList.add('shift-right');
      nextElement = nextElement.nextElementSibling;
    }

    // Tallenna tieto dataTransferiin
    e.dataTransfer.setData('application/drop-position',
      JSON.stringify({ toIndex, position }));

    //console.log('Drag over:', { index, position, toIndex });
  };

  const handleDragLeave = (e) => {
    const blockElement = blockRef.current;
    if (!blockElement) return;

    // Poistetaan indikaattorit ja siirtymät viiveellä
    setTimeout(() => {
      if (!blockElement.matches(':hover')) {
        blockElement.classList.remove('drop-target');
        document.querySelectorAll('.block-drop-indicator').forEach(el => el.remove());
        document.querySelectorAll('.block.shift-right').forEach(el =>
          el.classList.remove('shift-right'));
      }
    }, 50);
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
      ref={blockRef}
      className={`block ${block.className || ''}`}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
    >
      <div className="block-header">
        <span className="block-title">
          {block.title}
          {//renderBlockValue(block)}
            block.inputValue && ` (${block.inputValue}${block.secondInputValue ? `, ${block.secondInputValue}` : ''})`}
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
