/**
 * Block - Component ( returns DroppedBlock )
 * Represents a single block in the programming area
 *
 * @component
 * @param {Object} props
 * @param {Object} props.block - The block data
 * @param {number} props.index - Block's index in programming area
 * @param {function} props.onInputChange - Handler for input value changes
 * @param {function} props.onDragStart - Handler for drag start event
 * @param {function} props.onDragEnd - Handler for drag end event
 * @param {function} props.onDragOverPosition - Handler for drag over position updates
 * @returns {React.ReactElement} A draggable programming block
 */

import React, {useRef, useState, useEffect} from 'react';
import BlockVisual from "../../utils/BlockVisual.jsx";
import '../../styles/BlockVisualElements.css';

const DroppedBlock = ({ block, index, onDragStart, onInputChange, onDragEnd, onDragOverPosition }) => {

  const [hasChildren, setHasChildren] = useState(false);

  useEffect(() => {
    if (block.isContainer && block.childBlocks && block.childBlocks.length > 0) {
      setHasChildren(true);
    }
  }, [block.childBlocks]);

  /**
   * blockRef - Reference
   * Reference to block DOM element for drag and drop operations in programming area
   *
   * @type {React.RefObject}
   */
  const blockRef = useRef(null);

  /**
   * handleDragStart - handler (function)
   * Handles the start of drag operation
   * Sets drag data and calls parent drag start handler
   *
   * @param {DragEvent} e - Drag event object
   */
      // DroppedBlock (Block.jsx) komponentissa
  const handleDragStart = (e) => {
        const isStartBlock = block.id === 'start';
        if (isStartBlock) {
          e.preventDefault();
          return;
        }

        e.dataTransfer.setData('application/json', JSON.stringify(block));
        e.dataTransfer.setData('application/internal',
            JSON.stringify({ fromIndex: index }));
        console.log('Drag start:', index, block);
        onDragStart(e, block);
      };

  /**
   * handleDragOver - handler (function)
   *
   * Handles drag over events on block
   * Updates visual indicators and calculates drop position
   *
   * @param {DragEvent} e - Drag event object
   */
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

    if (onDragOverPosition) {
      onDragOverPosition(toIndex);
    }

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

  /**
   * handleDragLeave - handler (function)
   *
   * Handles drag leave events
   * Removes visual indicators when dragged block leaves the area
   *
   * @param {DragEvent} e - Drag event object
   */
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


  /**
   * uusi
   */
  const handleContainerDragOver = (e) => {
    if (block.isContainer) {
      e.preventDefault();
      e.stopPropagation();
      blockRef.current.classList.add('drag-over');
    }
  };

  const handleContainerDragLeave = () => {
    if (block.isContainer) {
      blockRef.current.classList.remove('drag-over');
    }
  };

  const handleContainerDrop = (e) => {
    if (!block.isContainer) return;

    e.preventDefault();
    e.stopPropagation();

    const droppedBlockData = JSON.parse(e.dataTransfer.getData('application/json'));
    block.childBlocks.push(droppedBlockData);
    setHasChildren(true);

    blockRef.current.classList.remove('drag-over');
  };

  const handleChildInputChange = (childIndex, value, isSecondInput = false) => {
    if (!block.childBlocks) return;

    const updatedChildBlocks = [...block.childBlocks];
    if (isSecondInput) {
      updatedChildBlocks[childIndex] = {
        ...updatedChildBlocks[childIndex],
        secondInputValue: value
      };
    } else {
      updatedChildBlocks[childIndex] = {
        ...updatedChildBlocks[childIndex],
        inputValue: value
      };
    }
    block.childBlocks = updatedChildBlocks;
  };

  /**
   * handleInputChange - handler (function)
   * Handles input value changes for a block
   * Updates block state through parent callback
   *
   * @param {string|number} value - New value from input
   * @param {boolean} isSecondInput - Whether updating first or second input
   */
  const handleInputChange = (value, isSecondInput = false) => {
    onInputChange(index, value, isSecondInput);
  };

  /**
   * renderBlockInput - function
   * Renders appropriate input element based on input type
   * Supports number and select inputs
   *
   * @param {Object} block - Block containing input configuration
   * @param {string} block.inputType - Type of input ('number' or 'select')
   * @param {Array} [block.options] - Options for select input
   * @param {number} [block.inputMin] - Minimum value for number input
   * @param {number} [block.inputMax] - Maximum value for number input
   * @param {number} [block.inputStep] - Step value for number input
   * @param {*} block.defaultValue - Default value for the input
   * @returns {React.ReactElement} Input element based on block type
   */
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

  /**
   * renderSecondInput - function
   * Renders secondary input element for block
   * Used when block requires two inputs (e.g., duration and intensity)
   *
   * @param {Object} block - Block containing second input configuration
   * @param {string} block.secondInputType - Type of second input ('number' or 'select')
   * @param {number} [block.secondInputMin] - Minimum value for number input
   * @param {number} [block.secondInputMax] - Maximum value for number input
   * @param {*} block.secondInputDefault - Default value for the second input
   * @param {Array} [block.options] - Options array for select input
   * @returns {React.ReactElement} Secondary input element based on input type
   *
   * @example
   * // For a number input
   * renderSecondInput({
   *   secondInputType: 'number',
   *   secondInputMin: 0,
   *   secondInputMax: 10,
   *   secondInputDefault: 5
   * });
   *
   * @example
   * // For a select input
   * renderSecondInput({
   *   secondInputType: 'select',
   *   options: [{value: 'easy', label: 'Easy'}, {value: 'hard', label: 'Hard'}],
   *   secondInputDefault: 'easy'
   * });
   */
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


  /**
   * renderBlockValue - function
   * Renders text representation of block's current values
   * Formats both primary and secondary input values for display
   *
   * @param {Object} block - Block to render value for
   * @param {*} [block.inputValue] - Primary input value
   * @param {*} [block.secondInputValue] - Secondary input value
   * @param {string} [block.inputType] - Type of primary input
   * @param {Array} [block.options] - Options array for select inputs
   * @returns {string} Formatted string representing block's current values
   *
   * @example
   * // For a block with single value
   * // Returns "(5)"
   * renderBlockValue({ inputValue: 5 });
   *
   * @example
   * // For a block with two values
   * // Returns "(5, easy)"
   * renderBlockValue({
   *   inputValue: 5,
   *   secondInputValue: 'easy'
   * });
   */
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


// Jos kyseessä on container-lohko
  if (block.isContainer) {
    return (
      <div
        ref={blockRef}
        className={`block ${block.className} ${hasChildren ? 'has-children' : ''}`}
        draggable="true"
        onDragStart={handleDragStart}
        onDragOver={handleContainerDragOver}
        onDragLeave={handleContainerDragLeave}
        onDrop={handleContainerDrop}
      >
        <BlockVisual blockId={block.id} />
        <div className="block-header">
          <span className="block-title">
            {block.title}
            {block.inputValue && ` (${block.inputValue}${block.secondInputValue ? `, ${block.secondInputValue}` : ''})`}
          </span>
        </div>
        {block.hasInput && (
          <div className="block-input-container">
            <label>{block.inputLabel}</label>
            {renderBlockInput(block, index)}
          </div>
        )}
        <div className="child-blocks">
          {block.childBlocks?.map((childBlock, childIndex) => (
            <DroppedBlock
              key={`child-${childIndex}`}
              block={childBlock}
              index={childIndex}
              onInputChange={(value) => handleChildInputChange(childIndex, value)}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOverPosition={onDragOverPosition}
            />
          ))}
        </div>
      </div>
    );
  }
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
        <BlockVisual blockId={block.id} />
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
