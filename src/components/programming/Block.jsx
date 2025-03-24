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
import '../../styles/BlockVisualElements.css';
import BlockIconConfig from "../../config/blockIconConfig";
import '../../styles/blockIconConfig.css';
import CustomNumberInput from "../../utils/CustomNumberInput.jsx";
import { useTouchDrag } from "../../utils/useTouchDrag.js";
import { v4 as uuidv4 } from 'uuid';

const DroppedBlock = ({
                        block,
                        index,
                        onDragStart,
                        onInputChange,
                        onChildInputChange,
                        onDragEnd,
                        onDragOverPosition,
                        handleDrop,
                        isChildBlock = false,
                        parentIndex = null,
                      }) => {

  const [hasChildren, setHasChildren] = useState(false);

  // Block.jsx:ssä
  const { handlers: touchHandlers, isDragging: isTouchDragging, dragState } = useTouchDrag({
    createClone: false,
    onDragStart: (dragData) => {
      const blockElement = dragData.target;
      if (!blockElement) return;
      dragData.isChildBlock = !!block.isChildBlock;

      // ei sallita dragia start blockissa
      const isStartOrEndBlock = block.type === 'start' || block.type === 'end';
      if (isStartOrEndBlock) return;

      if (onDragStart) {
        dragState.current.isInternalDrag = true;
        dragState.current.fromIndex = index;
        dragState.current.isChildBlock = isChildBlock || false;
        dragState.current.parentIndex = parentIndex;

        // luo synteettinen event
        const syntheticEvent = {
          target: {
            querySelector: (selector) => blockElement.querySelector(selector)
          },
          currentTarget: blockElement,
          preventDefault: () => {},
          stopPropagation: () => {},
          dataTransfer: {
            setData: (type, data) => {
              dragState.current[type] = data;
            },
            getData: (type) => dragState.current[type],
            types: ['application/json', 'application/internal']
          }
        };

        // sisällä isChildBlock ja parentindex block dataan
        const blockForDrag = {
          ...block,
          isChildBlock: isChildBlock,
          parentIndex: parentIndex
        };

        dragState.current['application/json'] = JSON.stringify(blockForDrag);
        dragState.current['application/internal'] = JSON.stringify({
          fromIndex: index,
          isChildBlock: isChildBlock || false,
          parentIndex: parentIndex
        });

        onDragStart(syntheticEvent, blockForDrag);
        blockElement.classList.add('dragging');
      }
    },
    onDragMove: (moveData) => {
      if (!isTouchDragging) return;

      // Liikuta draggattavaa elementtiä
      const block = dragState.current.target;
      if (block) {
        block.style.position = 'relative';
        block.style.zIndex = '1000';
        //block.style.transition = 'none';
        block.style.transform = `translate(${moveData.dx}px, ${moveData.dy}px)`;
      }

      // Etsi kohde elementti
      const dropTarget = document.elementFromPoint(moveData.x, moveData.y);
      const blockElement = dropTarget?.closest('.block, .block-container');

      if (blockElement && blockElement !== block) {
        const rect = blockElement.getBoundingClientRect();
        const relativeY = moveData.y - rect.top;
        const height = rect.height;

        // Poista vanhat indikaattorit
        document.querySelectorAll('.block-drop-indicator').forEach(el => el.remove());
        document.querySelectorAll('.block.drop-target').forEach(el =>
            el.classList.remove('drop-target'));
        document.querySelectorAll('.block.shift-right').forEach(el =>
            el.classList.remove('shift-right'));

        // Lisää visuaaliset indikaattorit
        blockElement.classList.add('drop-target');

        // Lisää shift-right luokka seuraaville blokeille
        let nextElement = blockElement.nextElementSibling;
        while (nextElement) {
          nextElement.classList.add('shift-right');
          nextElement = nextElement.nextElementSibling;
        }

        // Päivitä drop positio
        if (onDragOverPosition) {
          const position = relativeY < height / 2 ? 'before' : 'after';
          const toIndex = parseInt(blockElement.dataset.index || '0');
          onDragOverPosition(position === 'before' ? toIndex : toIndex + 1);
        }
      }
    },

    onDragEnd: (e, endData) => {
      const block = dragState.current.target;
      if (block) {
        // Poista kaikki draggaukseen liittyvät tyylit
        block.style.transform = '';
        block.style.position = '';
        block.style.zIndex = '';
        block.style.transition = '';
        block.classList.remove('dragging');
        block.classList.remove('drop-target');
      }

      // Poista kaikki visuaaliset indikaattorit kaikilta elementeiltä
      document.querySelectorAll('.block-drop-indicator').forEach(el => el.remove());
      document.querySelectorAll('.block.drop-target').forEach(el => {
        el.classList.remove('drop-target');
        el.style.transform = '';
        el.style.position = '';
        el.style.zIndex = '';
      });
      document.querySelectorAll('.block.shift-right').forEach(el => {
        el.classList.remove('shift-right');
        el.style.transform = '';
      });
      document.querySelectorAll('.block.dragging').forEach(el => {
        el.classList.remove('dragging');
        el.style.transform = '';
        el.style.position = '';
        el.style.zIndex = '';
      });

      handleDrop(e, endData);

      if (onDragEnd) {
        onDragEnd(e);
      }
    }
  });

  useEffect(() => {
    //console.log("child blocks use effect");
    if (block.isContainer && block.childBlocks && block.childBlocks.length > 0) {
      if (!hasChildren) {
        setHasChildren(true);
      }
      //console.log('child blocks:', block.childBlocks);
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
        if (block.type === 'start') {
          e.preventDefault();
          return;
        }

        if (onDragStart) {
          const blockForDrag = {
            ...block,
            isChildBlock: isChildBlock,
            parentIndex: parentIndex
          };

          onDragStart(e, blockForDrag);
        }

        // Mark data for internal reorder
        e.dataTransfer.setData('application/internal', JSON.stringify({
          fromIndex: index,
          isChildBlock,
          parentIndex
        }));
        if (isChildBlock) {
          e.stopPropagation();
        }
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
    // Just set the drop position, no direct DOM manipulation
    const rect = blockRef.current?.getBoundingClientRect();
    if (!rect) return;
    const position = (e.clientY - rect.top) < (rect.height / 2) ? 'before' : 'after';
    const toIndex = position === 'before' ? index : index + 1;
    onDragOverPosition?.(toIndex);
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

  /**
   * handleInputChange - handler (function)
   * Handles input value changes for a block
   * Updates block state through parent callback
   *
   * @param {string|number} value - New value from input
   * @param {boolean} isSecondInput - Whether updating first or second input
   */
  const handleInputChange = (value, isSecondInput = false) => {
    onInputChange(index, value, isSecondInput, block.isChildBlock, block.parentIndex);
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
  // In Block.jsx, modify the renderBlockInput function:
  const renderBlockInput = (block, index) => {
    switch(block.inputType) {
      case 'number':
        return (
            <CustomNumberInput
                value={block.inputValue}
                defaultValue={block.defaultValue}
                onChange={(value) => {
                  handleInputChange(value);
                }}
                onClick={() => {
                }}
            />
        );
      case 'select':
        return (
            <>
            </>
        );
      case 'text':
        return (
            <input
                type="text"
                defaultValue={block.defaultValue}
                onChange={(e) => handleInputChange(e.target.value)}
            />
        );
      default:
        console.warn("Unknown input type:", block.inputType, "for block:", block.type);
        return (
            <div></div>
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
          <CustomNumberInput
              value={block.secondInputValue || block.secondInputDefault || block.secondInputMin}
              defaultValue={block.secondInputDefault || block.secondInputMin}
              onChange={(value) => handleInputChange(value, true)}
          />
      );
    }
    return (
        <>
        </>
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

  if (block.isContainer) {
    return (
        <div
            data-index={index}
            ref={blockRef}
            className={`block-container ${hasChildren ? 'has-children' : ''}`}
            draggable="true"
            onDragStart={handleDragStart}
            onDragOver={handleContainerDragOver}
            onDragLeave={handleContainerDragLeave}
            {...touchHandlers}
        >
          <div className="block-content">
            <div className="block-header">
            </div>
            {block.hasInput && (
                <div className="block-input-container">
                  {renderBlockInput(block, index)}
                </div>
            )}
          </div>
          <div className="child-blocks-container">
            {block.childBlocks?.map((childBlock, childIndex) => (
                <div>
                  <DroppedBlock
                      key={`child-${childBlock.id || childIndex}`}
                      block={childBlock}
                      index={childIndex}
                      onInputChange={(childIndex, value) => {
                        const updatedChildBlocks = [...block.childBlocks];
                        updatedChildBlocks[childIndex] = {
                          ...updatedChildBlocks[childIndex],
                          inputValue: value
                        };
                        block.childBlocks = updatedChildBlocks;
                        onChildInputChange(index, childIndex, value);
                      }}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                      onDragOverPosition={onDragOverPosition}
                      handleDrop={handleDrop}
                      isChildBlock={true}
                      parentIndex={index}
                      {...touchHandlers}
                  />
                </div>
            ))}
          </div>
        </div>
    );
  }
    return (
      <div
          ref={blockRef}
          className={`block ${block.className || ''}`}
          draggable={!(block.type === 'start' || block.type === 'end')}
          {...(block.type === 'start' || block.type === 'end' ? {} : touchHandlers)}
          data-index={index}
          onDragStart={block.type === 'start' || block.type === 'end' ? null : handleDragStart}
          onDragEnd={block.type === 'start' || block.type === 'end' ? null : onDragEnd}
          onDragLeave={block.type === 'start' || block.type === 'end' ? null : handleDragLeave}
          onDragOver={block.type === 'start' || block.type === 'end' ? null : handleDragOver}
      >
        <BlockIconConfig blockType={block.type} />
        {block.hasInput && (
          <div className="block-input-container">
            {renderBlockInput(block, index)}
          </div>
        )}
        {block.hasSecondInput && (
          <div className="block-input-container">
            {renderSecondInput(block)}
          </div>
        )}
      </div>
    );
};

export default DroppedBlock;
