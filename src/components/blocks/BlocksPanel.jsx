/**
 * BlocksPanel Component
 *
 * Displays available programming blocks organized by categories.
 * Allows users to select categories and drag blocks to programming area.
 * Manages block input configurations and provides visual feedback.
 *
 * @component
 * @param {Object} props
 * @param {string[]} props.categories - List of available block categories
 * @param {string} props.selectedCategory - Currently selected category
 * @param {function} props.setSelectedCategory - Handler to update selected category
 * @param {Object} props.blocksByCategory - Mapping of blocks organized by category
 * @param {function} props.handleDragStart - Handler for block drag start events
 * @returns {React.ReactElement} Panel containing categorized programming blocks
 */

import React, {useState} from 'react';
import '../../styles/components/BlocksPanel.css';
import '../../styles/BlockVisualElements.css';
import BlockVisual from '../../utils/BlockVisual';
import BlockIconConfig from "../../config/blockIconConfig";
import '../../styles/blockIconConfig.css';
//import BlockTooltip from "../BlockTooltip.jsx";
//import '../../styles/BlockTooltip.css';
import CustomNumberInput from "../../utils/CustomNumberInput.jsx";

import icon_control from "../../assets/icons/robo-trafficlight.svg";
import icon_visual from "../../assets/icons/robo-screen.svg";
import icon_sounds from "../../assets/icons/robo-sound.svg";
import icon_movement from "../../assets/icons/robo-movement.svg";


const BlocksPanel = ({
                       categories,
                       selectedCategory,
                       setSelectedCategory,
                       blocksByCategory,
                       handleDragStart
                     }) => {

  const [blocks, setBlocks] = useState(blocksByCategory);

  /**
   * Tooltip state
   * */
  const [showTooltip, setShowTooltip] = useState(false);
  const [mousePosition, setMousePosition] = useState(null);

  /**
   * ToolTip functions
   * */

  const handleMouseEnter = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    setShowTooltip(true);
  };

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
    setMousePosition(null);
  };

  ///////////////


      /**
   * handleInputChange - handler (function)
   * Updates block input values during configuration
   * Handles both primary and secondary inputs for blocks
   *
   * @param {Event|string|number} valueOrEvent - Input change event or direct value
   * @param {string} blockId - Unique identifier for the block
   * @param {string} [inputType='primary'] - Type of input being updated
   *
   * @returns {void}
   */
  const handleInputChange = (valueOrEvent, blockId, inputType = 'primary') => {
    const value = valueOrEvent.target ? valueOrEvent.target.value : valueOrEvent;
    console.log('handleInputChange', value, blockId, inputType);
    console.log('blocks', blocks);
    console.log('selectedCategory', selectedCategory);
    const block = blocks[selectedCategory].find(b => b.id === blockId);
    if (!block) return;

    const updatedBlock = { ...block };

    if (inputType === 'primary') {
      updatedBlock.inputValue = value;
      console.log('updatedBlock', updatedBlock);
    } else {
      updatedBlock.secondInputValue = value;
    }

    const updatedBlocks = blocks[selectedCategory].map(b =>
      b.id === blockId ? updatedBlock : b
    );

    setBlocks({
      ...blocks,
      [selectedCategory]: updatedBlocks
    });

    const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
    if (blockElement) {
      const originalDragStart = (e) => handleDragStart(e, updatedBlock);
      blockElement.ondragstart = originalDragStart;
    }
  };

  /**
   * renderInput - funktio
   *
   * Renders appropriate input element based on block configuration
   * Supports number, range, select, and text inputs
   *
   * @param {Object} block - Block configuration object
   * @param {string} block.inputType - Type of input to render
   * @param {Object} block.config - Input-specific configuration
   *
   * @returns {React.ReactElement|null} Rendered input element or null
   */
  const renderInput = (block) => {
    if (!block.hasInput) return null;

    switch (block.inputType) {
      case 'number':
        return (
          <div className="input-group">
            {/*block.inputLabel && (
              <label htmlFor={`${block.id}-input`}>{block.inputLabel}</label>
            )
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
            />*/}
            <CustomNumberInput
              id={`${block.id}-input`}
              value={block.inputValue}
              onChange={(value) => handleInputChange(value, block.id)}
              className="block-input-number"
            />
          </div>
        );

      case 'range':
        return (
          <div className="input-group">
            {/*block.inputLabel && (
              <label htmlFor={`${block.id}-input`}>{block.inputLabel}</label>
            )*/}
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
            {/*block.inputLabel && (
              <label htmlFor={`${block.id}-input`}>{block.inputLabel}</label>
            )*/}
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
            {/*block.inputLabel && (
              <label htmlFor={`${block.id}-input`}>{block.inputLabel}</label>
            )*/}
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


  const getCategoryImage = (category) => {

    const getIconSrc = (category) => {
      switch (category) {
        case 'Control':
          return icon_control;
        case 'LED Display':
          return icon_visual;
        case 'Movement':
          return icon_movement;
        case 'Sounds':
          return icon_sounds;
        default:
          return ''; // Default icon or empty string if no icon
      }
    }

    return (
      <div>
        <img src={getIconSrc(category)} alt="Category Image" className="category-image"/>
      </div>
    );
  };



  /**
   * BlocksPanel -komponentti
   *
   * CSS Class Names
   * block-input-number: Number input styling
   * block-input-range: Range slider styling
   * block-input-select: Dropdown select styling
   * block-input-text: Text input styling
   * input-group: Container for input and label
   * range-container: Container for range input and value display
   * range-value: Display for current range value
   */
  return (
    <div className="categories">
      <div className="category-buttons">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-button  ${
              selectedCategory === category ? 'active' : ''
            }`}
            onClick={() => setSelectedCategory(category)}
            data-category={category}
          >
            {/*
              {category}
              */}
            {getCategoryImage(category)}
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
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <BlockVisual blockId={block.id} />
            {/*showTooltip && (
              <BlockTooltip
                title={block.title}
                description={block.description}
                mousePosition={mousePosition}
              />
            )*/}
            {/*<div className="block-header">
              <span className="block-title">{block.title}</span>
            </div>
            <p className="block-description">{block.description}</p>*/}
            <BlockIconConfig blockId={block.id} />
            < div className="block-input-container">
            {renderInput(block)}
              </div>
            {block.hasSecondInput && (
                <div className="second-input">
                  {block.secondInputType === 'number' ? (
                    <div className="input-group">
                      <label htmlFor={`${block.id}-second-input`}>
                        {block.secondInputLabel}
                      </label>
                      {/*
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
                      */}
                      <CustomNumberInput />
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
