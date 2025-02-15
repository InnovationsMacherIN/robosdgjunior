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

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Play, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DeleteZone from './DeleteZone';
import '../../styles/components/ProgrammingArea.css';
import '../../styles/draggableBlocks.css';
import DroppedBlock from './Block'

const ProgrammingArea = ({
                           droppedBlocks,
                           isExecuting,
                           handleDragOver,
                           handleDrop,
                           onUpdateBlock,
                           handleDragStart,
                           handleBlockInputChange,
                           onDeleteBlock,
                           onDragOverPosition,
                         }) => {

  const { t } = useTranslation();

  // Lisää nämä tilamuuttujat komponentin alkuun
  const [activeChain, setActiveChain] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [chainPositions, setChainPositions] = useState({});
  const areaRef = useRef(null);
  ////////////////////////

  // Lisää nämä handlerit ennen returnia
  const handleChainDragStart = useCallback((e, chainId) => {
    // Jos käyttäjä raahaa mitä tahansa muuta kuin start-blockia, ei siirretä koko ketjua
    const draggingBlock = e.target.closest('.block');
    if (draggingBlock && draggingBlock.querySelector('[data-block-id]')?.dataset.blockId !== 'start') {
      return;
    }

    // Jos raahataan start-blockista tai tyhjästä alueesta, siirretään koko ketju
    const chain = e.currentTarget;
    const rect = chain.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setActiveChain(chainId);
    setDragOffset({ x: offsetX, y: offsetY });
    chain.classList.add('dragging');
  }, []);

  const handleChainDrag = useCallback((e) => {
    if (!activeChain) return;

    const areaRect = areaRef.current.getBoundingClientRect();
    const x = e.clientX - areaRect.left - dragOffset.x;
    const y = e.clientY - areaRect.top - dragOffset.y;

    setChainPositions(prev => ({
      ...prev,
      [activeChain]: { x, y }
    }));
  }, [activeChain, dragOffset]);

  const handleChainDragEnd = useCallback(() => {
    if (!activeChain) return;

    const chain = document.querySelector(`[data-chain-id="${activeChain}"]`);
    if (chain) {
      chain.classList.remove('dragging');
    }

    setActiveChain(null);
  }, [activeChain]);
  //////////////////////

  /**
   * Wrapper function for block drag start events
   * Updates drag state and calls parent handler if provided
   *
   * @param {DragEvent} e - The drag event object
   * @param {Object} block - The block being dragged
   * @returns {void}
   */
  const handleBlockDragStart = (e, block) => {
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
    //setIsDraggingBlock(false);
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
  useEffect(() => {
    if (droppedBlocks.length > 0) {
      //console.log('Current blocks in programming area:', droppedBlocks);
    }
  }, [droppedBlocks]);


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
    <div className="programming-area">
    <div
      ref={areaRef}
      className="programming-area-blocks"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseMove={handleChainDrag}
      onMouseUp={handleChainDragEnd}
    >
      <div
        className="block-chain-container"
        data-chain-id="main-chain"
        style={{
          left: chainPositions["main-chain"]?.x || '20px',
          top: chainPositions["main-chain"]?.y || '20px'
        }}
        onMouseDown={(e) => handleChainDragStart(e, "main-chain")}
      >
        <div className="dropped-blocks">
          {droppedBlocks.map((block, index) => (
            <DroppedBlock
              key={index}
              block={block}
              index={index}
              onDragStart={handleBlockDragStart}
              handleDrop={handleDrop}
              onInputChange={handleBlockInputChange}
              onDragOverPosition={onDragOverPosition}
            />
          ))}
        </div>
      </div>

      <div className={`programming-area-overlay ${activeChain !== null ? 'active' : ''}`} />

    </div>
    </div>
  );
};

export default ProgrammingArea;
