/**
 * @file Block.jsx
 * @description A component that represents a single block in the programming area.
 * @module components/programming/Block
 * @param {Object} props - The component props.
 * @param {Object} props.block - The block data.
 * @param {number} props.index - The block's index in the programming area.
 * @param {function} props.onInputChange - A function to handle input value changes.
 * @param {function} props.onChildInputChange - A function to handle child input value changes.
 * @param {function} props.onDragStart - A function to handle the start of a drag event.
 * @param {function} props.onDragEnd - A function to handle the end of a drag event.
 * @param {function} props.onDragOverPosition - A function to handle the drag over position.
 * @param {function} props.handleDrop - A function to handle a drop event.
 * @param {boolean} props.isChildBlock - Whether the block is a child block.
 * @param {number} props.parentIndex - The index of the parent block.
 * @returns {React.ReactElement} The DroppedBlock component.
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
  const { handlers: touchHandlers, isDragging: isTouchDragging, dragState } = useTouchDrag({
    createClone: false,
    onDragStart: (dragData) => {
      const blockElement = dragData.target;
      if (!blockElement) return;
      dragData.isChildBlock = !!block.isChildBlock;

      const isStartOrEndBlock = block.type === 'start' || block.type === 'end';
      if (isStartOrEndBlock) return;

      if (onDragStart) {
        dragState.current.isInternalDrag = true;
        dragState.current.fromIndex = index;
        dragState.current.isChildBlock = isChildBlock || false;
        dragState.current.parentIndex = parentIndex;

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

      const block = dragState.current.target;
      if (block) {
        block.style.position = 'relative';
        block.style.zIndex = '1000';
        block.style.transform = `translate(${moveData.dx}px, ${moveData.dy}px)`;
      }

      const dropTarget = document.elementFromPoint(moveData.x, moveData.y);
      const blockElement = dropTarget?.closest('.block, .block-container');

      if (blockElement && blockElement !== block) {
        const rect = blockElement.getBoundingClientRect();
        const relativeY = moveData.y - rect.top;
        const height = rect.height;

        document.querySelectorAll('.block-drop-indicator').forEach(el => el.remove());
        document.querySelectorAll('.block.drop-target').forEach(el =>
            el.classList.remove('drop-target'));
        document.querySelectorAll('.block.shift-right').forEach(el =>
            el.classList.remove('shift-right'));

        blockElement.classList.add('drop-target');

        let nextElement = blockElement.nextElementSibling;
        while (nextElement) {
          nextElement.classList.add('shift-right');
          nextElement = nextElement.nextElementSibling;
        }

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
        block.style.transform = '';
        block.style.position = '';
        block.style.zIndex = '';
        block.style.transition = '';
        block.classList.remove('dragging');
        block.classList.remove('drop-target');
      }

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
    if (block.isContainer && block.childBlocks && block.childBlocks.length > 0) {
      if (!hasChildren) {
        setHasChildren(true);
      }
    }
  }, [block.childBlocks]);

  const blockRef = useRef(null);

  /**
   * @function handleDragStart
   * @description Handles the start of a drag operation.
   * @param {DragEvent} e - The drag event object.
   */
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
   * @function handleDragOver
   * @description Handles drag over events on the block.
   * @param {DragEvent} e - The drag event object.
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    const rect = blockRef.current?.getBoundingClientRect();
    if (!rect) return;
    const position = (e.clientY - rect.top) < (rect.height / 2) ? 'before' : 'after';
    const toIndex = position === 'before' ? index : index + 1;
    onDragOverPosition?.(toIndex);
  };

  /**
   * @function handleDragLeave
   * @description Handles drag leave events on the block.
   * @param {DragEvent} e - The drag event object.
   */
  const handleDragLeave = (e) => {
    const blockElement = blockRef.current;
    if (!blockElement) return;

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
   * @function handleContainerDragOver
   * @description Handles drag over events on the container.
   * @param {DragEvent} e - The drag event object.
   */
  const handleContainerDragOver = (e) => {
    if (block.isContainer) {
      e.preventDefault();
      e.stopPropagation();
      blockRef.current.classList.add('drag-over');
    }
  };

  /**
   * @function handleContainerDragLeave
   * @description Handles drag leave events on the container.
   */
  const handleContainerDragLeave = () => {
    if (block.isContainer) {
      blockRef.current.classList.remove('drag-over');
    }
  };

  /**
   * @function handleInputChange
   * @description Handles input value changes for a block.
   * @param {string|number} value - The new value from the input.
   * @param {boolean} isSecondInput - Whether the input is the second input.
   */
  const handleInputChange = (value, isSecondInput = false) => {
    onInputChange(index, value, isSecondInput, block.isChildBlock, block.parentIndex);
  };

  /**
   * @function renderBlockInput
   * @description Renders the appropriate input element based on the input type.
   * @param {Object} block - The block containing the input configuration.
   * @param {number} index - The index of the block.
   * @returns {React.ReactElement} The input element.
   */
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
        return (
            <div></div>
        );
    }
  };

  /**
   * @function renderSecondInput
   * @description Renders the second input element for a block.
   * @param {Object} block - The block containing the second input configuration.
   * @returns {React.ReactElement} The second input element.
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
   * @function renderBlockValue
   * @description Renders the text representation of a block's current values.
   * @param {Object} block - The block to render the value for.
   * @returns {string} The formatted string representing the block's current values.
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