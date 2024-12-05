/**
 * ProgrammingArea Component
 *
 * Main area where users can drop and arrange programming blocks.
 * Handles block arrangement, deletion, and provides visual feedback
 * during drag and drop operations.
 *
 * @component
 * @param {Object} props
 * @param {Array} props.droppedBlocks - Array of blocks currently in programming area
 * @param {boolean} props.isExecuting - Flag for program execution state
 * @param {function} props.handleDragOver - Handler for drag over events
 * @param {function} props.handleDrop - Handler for drop events
 * @param {function} props.onClearBlocks - Handler for clearing all blocks
 * @param {function} props.onUpdateBlock - Handler for updating block properties
 * @param {function} props.handleDragStart - Handler for starting block drag
 * @param {function} props.handleBlockInputChange - Handler for block input changes
 * @param {function} props.onDeleteBlock - Handler for block deletion
 * @param {function} props.onDragOverPosition - Handler for updating drop position
 */

import React, { useEffect, useState } from 'react';
import { Play, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DeleteZone from './DeleteZone';
import '../../styles/components/ProgrammingArea.css';
import DroppedBlock from './Block'

const ProgrammingArea = ({
                           droppedBlocks,
                           isExecuting,
                           handleDragOver,
                           handleDrop,
                           onClearBlocks,
                           onUpdateBlock,
                           handleDragStart,
                           handleBlockInputChange,
                           onDeleteBlock,
                           onDragOverPosition,
                         }) => {

  const { t } = useTranslation();
  const [isDraggingBlock, setIsDraggingBlock] = useState(false);

  /**
   * Wrapper function for block drag start events
   * Updates drag state and calls parent handler if provided
   *
   * @param {DragEvent} e - The drag event object
   * @param {Object} block - The block being dragged
   * @returns {void}
   */
  const handleBlockDragStart = (e, block) => {
    setIsDraggingBlock(true);
    if (handleDragStart) {
      handleDragStart(e, block);
    }
  };

  /**
   * Resets dragging state when drag operation ends
   *
   * @returns {void}
   */
  const handleBlockDragEnd = () => {
    setIsDraggingBlock(false);
  };

  /**
   * Sets up global drag end event listener and cleanup
   * Ensures drag state is reset even if drop happens outside component
   *
   * @effect
   * @returns {function} Cleanup function to remove event listener
   */
  useEffect(() => {
    document.addEventListener('dragend', handleBlockDragEnd);
    return () => {
      document.removeEventListener('dragend', handleBlockDragEnd);
    };
  }, []);


  /**
   * Debug logging for monitoring blocks in programming area
   * Only logs when blocks array is not empty
   *
   * @effect
   * @listens droppedBlocks
   *
   * @returns {void}
   */
  //useEffect(() => {
  //  if (droppedBlocks.length > 0) {
  //    console.log('Current blocks in programming area:', droppedBlocks);
  //  }
  //}, [droppedBlocks]);


  /**
   * renderBlockInput - function
   * Renders input field for a block based on input type
   * Supports three input types: text, select, and number
   * Each input type has specific validation and display properties
   *
   * @param {Object} block - Block configuration object
   * @param {string} block.inputType - Type of input ('text', 'select', or 'number')
   * @param {string} [block.inputValue] - Current value of the input
   * @param {number} [block.maxLength] - Maximum length for text input
   * @param {number} [block.inputMin] - Minimum value for number input
   * @param {number} [block.inputMax] - Maximum value for number input
   * @param {Array} [block.options] - Options array for select input
   * @param {number} index - Index of block in programming area
   * @returns {React.ReactElement|null} Rendered input element or null if input type not supported
   *
   * @example
   * // For a number input
   * renderBlockInput({
   *   inputType: 'number',
   *   inputValue: 5,
   *   inputMin: 0,
   *   inputMax: 10
   * }, 0);
   *
   * @example
   * // For a select input
   * renderBlockInput({
   *   inputType: 'select',
   *   inputValue: 'option1',
   *   options: [
   *     { value: 'option1', label: 'Option 1' },
   *     { value: 'option2', label: 'Option 2' }
   *   ]
   * }, 1);
   */
  const renderBlockInput = (block, index) => {
    switch(block.inputType) {
      case 'text':
        return (
          <input
            type="text"
            value={block.inputValue || ''}
            maxLength={block.maxLength || 8}
            onChange={(e) => onUpdateBlock(index, { ...block, inputValue: e.target.value })}
            className="block-input block-input-text"
          />
        );
      case 'select':
        return (
          <select
            value={block.inputValue}
            onChange={(e) => onUpdateBlock(index, { ...block, inputValue: e.target.value })}
            className="block-input block-input-select"
          >
            {block.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            value={block.inputValue}
            min={block.inputMin}
            max={block.inputMax}
            step={block.inputStep}
            onChange={(e) => onUpdateBlock(index, { ...block, inputValue: e.target.value })}
            className="block-input block-input-number"
          />
        );
      default:
        return null;
    }
  };

  /**
   * Renders the programming area interface
   * Includes header controls, block dropping area, and delete zone
   * Provides visual feedback for drag and drop operations
   *
   * @component
   * @returns {React.ReactElement} The programming area UI
   */
  return (
    <div className="programming-area-container">
      <div className="programming-area-header">
        <h2>Ohjelmointialue</h2>
        <div className="programming-area-controls">

          <button
            className="button button-clear"
            onClick={onClearBlocks}
            disabled={droppedBlocks.length === 0}
          >
            <Trash2 className="w-4 h-4" />
            Tyhjennä kaikki
          </button>
        </div>
      </div>

      <div
        className="programming-area-content"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {droppedBlocks.length === 0 ? (
          <div className="programming-area-placeholder">
            {t('programmingArea.dragDropHint')}
          </div>
        ) : (
          <div className="dropped-blocks">
            {droppedBlocks?.filter(block => block !== null && block !== undefined)
            .map((block, index) => (
            block && (
            <DroppedBlock
              key={`${block.id}-${index}`}
              block={block}
              index={index}
              onInputChange={handleBlockInputChange}
              onDragStart={(e) => handleBlockDragStart(e, block)}
              onDragEnd={handleBlockDragEnd}
              onDragOverPosition={onDragOverPosition}
            />
            )
          ))}
          </div>
        )}
        <DeleteZone
          onDelete={(block, index) => onDeleteBlock(block, index)}
          isDraggingBlock={isDraggingBlock}
          onDragOverPosition={onDragOverPosition}
        />
      </div>

    </div>
  );
};

export default ProgrammingArea;
