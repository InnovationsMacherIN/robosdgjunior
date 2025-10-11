/**
 * @file ProgrammingInterface.jsx
 * @description Main component for the programming interface.
 * @module components/ProgrammingInterface
 * @param {Object} props - The component props.
 * @returns {React.ReactElement} The main programming interface.
 */
import React, { useState, useRef, useEffect } from 'react';
import TopNavigation from './navigation/TopNavigation';
import ProgrammingArea from './programming/ProgrammingArea';
import BlocksPanel from './blocks/BlocksPanel';
import Ble3 from './bluetooth/Ble3';
import { categories, blocksByCategory } from '../config/blocksConfig';
import { convertBlocksToCommands } from '../utils/blocksConverter';
import { useTranslation } from 'react-i18next';
import { saveBlocks, loadBlocks, hasSavedBlocks, clearSavedBlocks } from '../utils/blockStorage';
import ZoomableArea from '../utils/zoomableArea';
import {CodeViewPopUp} from "../utils/CodeViewPopUp.jsx";
import { v4 as uuidv4 } from 'uuid';
import '../styles/ProgrammingInterface.css';
import '../styles/CodeViewPopUp.css';

const ProgrammingInterface = () => {
  const { t } = useTranslation();

  const [selectedCategory, setSelectedCategory] = useState('Steering');
  const [droppedBlocks, setDroppedBlocks] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [currentDropPosition, setCurrentDropPosition] = useState(null);
  const [isDraggingBlock, setIsDraggingBlock] = useState(false);
  const [isBlocksView, setIsBlocksView] = useState(true);
  const [isDraggingExistingBlock, setIsDraggingExistingBlock] = useState(false);
  const [hasStartBlock, setHasStartBlock] = useState(false);
  const [hasEndBlock, setHasEndBlock] = useState(false);
  const [resetView, setResetView] = useState(false);
  const [wasJustCleared, setWasJustCleared] = useState(false);
  const ble3Ref = useRef();

  /**
   * @function toggleView
   * @description Toggles the view between the programming interface and the code view.
   */
  const toggleView = () => {
    setIsBlocksView(!isBlocksView)
  }

  /**
   * @function handleConnected
   * @description Handles the connection status of the Bluetooth device.
   * @param {boolean} isConnected - The connection status.
   */
  const handleConnected = (isConnected) => {
    setConnected(isConnected);
  };

  useEffect(() => {
    if (hasSavedBlocks()) {
      const savedBlocks = loadBlocks();
      if (savedBlocks) {
        setDroppedBlocks(savedBlocks);
      }
    }
  }, []);

  useEffect(() => {
    if (droppedBlocks.length > 0) {
      saveBlocks(droppedBlocks);
    }
  }, [droppedBlocks]);

  /**
   * @function handleUploadBlocks
   * @description Handles the upload of blocks from a file.
   * @param {Object} data - The block data to upload.
   */
  const handleUploadBlocks = (data) => {
    setDroppedBlocks(data);
  };

  /**
   * @function handleDragStart
   * @description Handles the start of a drag event.
   * @param {Event} e - The drag event.
   * @param {Object} block - The block being dragged.
   */
  const handleDragStart = (e, block) => {
    e.stopPropagation();

    if (
        (block.type === 'start' && hasStartBlock) ||
        (block.type === 'end' && hasEndBlock)
    ) {
      e.preventDefault();
      return;
    }

    const fromIndex = parseInt(e.currentTarget.dataset.index, 10);

    setIsDraggingBlock(true);
    setIsDraggingExistingBlock(!isNaN(fromIndex));

    const blockToTransfer = {
      ...block,
      id: block.id || uuidv4(),
      inputValue: e.target.querySelector('input, select')?.value,
    };

    if (block.hasSecondInput) {
      blockToTransfer.secondInputValue = e.target.querySelector('[id$=second-input]')?.value;
    }

    const internalData = {
      fromIndex: parseInt(e.currentTarget.dataset.index, 10),
      isChildBlock: block.isChildBlock || false,
      parentIndex: block.parentIndex
    };

    e.dataTransfer.setData('application/json', JSON.stringify(blockToTransfer));
    e.dataTransfer.setData('application/internal', JSON.stringify(internalData));
  };

  /**
   * @function handleDragOver
   * @description Handles the drag over event.
   * @param {Event} e - The drag event.
   */
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  /**
   * @function handleDragOverPosition
   * @description Handles the drag over position.
   * @param {number} toIndex - The index of the block being dragged over.
   */
  const handleDragOverPosition = (toIndex) => {
    setCurrentDropPosition(toIndex);
  };

  /**
   * @function handleDrop
   * @description Handles the drop event.
   * @param {Event} e - The drop event.
   * @param {Object} dropEvent - The drop event data.
   */
  const handleDrop = (e, dropEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingBlock(false);

    if (wasJustCleared && droppedBlocks.length === 0) {
      setResetView(true);
      setTimeout(() => {
        setResetView(false);
      }, 100);
      setWasJustCleared(false);
    }

    const cleanupVisualIndicators = () => {
      document.querySelectorAll('.block-drop-indicator').forEach(el => el.remove());
      document.querySelectorAll('.block.drop-target').forEach(el => el.classList.remove('drop-target'));
      document.querySelectorAll('.block.shift-right').forEach(el => el.classList.remove('shift-right'));
    };

    try {
      const isTouchEvent = e.type === 'touchend';

      if (!isTouchEvent && handleDesktopDrop(e)) return;

      let dropTarget;
      if (isTouchEvent) {
        const touch = e.changedTouches?.[0];
        if (touch) {
          dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
        } else {
          dropTarget = e.target;
        }
      } else {
        dropTarget = e.target;
      }

      const childContainer = dropTarget?.closest('.child-blocks-container');
      const isChildContainer = !!childContainer;

      if (isTouchEvent) {
        if (dropEvent?.isInternalDrag === true) {
          handleInternalTouchDrop(e, dropEvent);
        } else {
          handleExternalTouchDrop(e, dropEvent);
        }
        return;
      }

    } finally {
      cleanupVisualIndicators();
      setCurrentDropPosition(null);
    }
  };

  /**
   * @function handleDesktopDrop
   * @description Handles the drop event for desktop devices.
   * @param {Event} e - The drop event.
   * @returns {boolean} - Whether the drop was handled.
   */
  const handleDesktopDrop = (e) => {
    if (!e.dataTransfer?.types.includes('application/json')) {
      return false;
    }

    try {
      const hasInternalData = e.dataTransfer.types.includes('application/internal');
      let internalData = null;

      if (hasInternalData) {
        try {
          internalData = JSON.parse(e.dataTransfer.getData('application/internal'));
          const isInternalDrag = internalData && typeof internalData.fromIndex === 'number';

          if (isInternalDrag) {
            return handleDesktopInternalDrop(e);
          }
        } catch (err) {
          console.error('Error parsing internal drag data:', err);
        }
      }

      return handleDesktopExternalDrop(e);

    } catch (error) {
      console.error('Error processing drop:', error);
      return false;
    }
  };

  /**
   * @function handleMoveFromChildToMain
   * @description Moves a block from a child container to the main programming area.
   * @param {Object} internalData - The internal data of the block being moved.
   * @param {Object} blockData - The data of the block being moved.
   */
  const handleMoveFromChildToMain = (internalData, blockData) => {
    const { parentIndex, fromIndex } = internalData;

    setDroppedBlocks(blocks => {
      const newBlocks = JSON.parse(JSON.stringify(blocks));
      const parentBlock = newBlocks[parentIndex];
      if (!parentBlock?.childBlocks) return newBlocks;

      const blockToMove = parentBlock.childBlocks[fromIndex];
      if (!blockToMove) return newBlocks;

      const movedBlock = {
        ...blockToMove,
        isChildBlock: false,
        parentIndex: null
      };

      parentBlock.childBlocks = parentBlock.childBlocks.filter((_, idx) => idx !== fromIndex);

      let insertPos = currentDropPosition !== null && currentDropPosition !== -1
          ? currentDropPosition
          : newBlocks.length;

      const startBlockIndex = newBlocks.findIndex(block => block.type === 'start');
      const endBlockIndex = newBlocks.findIndex(block => block.type === 'end');

      if (startBlockIndex !== -1 && insertPos <= startBlockIndex) {
        insertPos = startBlockIndex + 1;
      }

      if (endBlockIndex !== -1 && insertPos > endBlockIndex) {
        insertPos = endBlockIndex;
      }

      newBlocks.splice(insertPos, 0, movedBlock);
      return newBlocks;
    });
  };

  /**
   * @function handleMoveFromMainToChild
   * @description Moves a block from the main programming area to a child container.
   * @param {Object} internalData - The internal data of the block being moved.
   * @param {Object} blockData - The data of the block being moved.
   * @param {number} targetParentIndex - The index of the target parent block.
   */
  const handleMoveFromMainToChild = (internalData, blockData, targetParentIndex) => {
    const { fromIndex } = internalData;

    setDroppedBlocks(blocks => {
      const newBlocks = JSON.parse(JSON.stringify(blocks));

      const blockToMove = {
        ...newBlocks[fromIndex],
        isChildBlock: true,
        parentIndex: targetParentIndex
      };

      if (!newBlocks[targetParentIndex].childBlocks) {
        newBlocks[targetParentIndex].childBlocks = [];
      }

      newBlocks[targetParentIndex].childBlocks.push(blockToMove);
      newBlocks.splice(fromIndex, 1);

      return newBlocks;
    });
  };

  /**
   * @function handleChildBlockReorder
   * @description Reorders a block within a child container.
   * @param {number} parentIndex - The index of the parent block.
   * @param {number} fromIndex - The original index of the block.
   * @param {number} toIndex - The new index of the block.
   */
  const handleChildBlockReorder = (parentIndex, fromIndex, toIndex) => {
    setDroppedBlocks(blocks => {
      const newBlocks = JSON.parse(JSON.stringify(blocks));
      const parentBlock = newBlocks[parentIndex];

      if (!parentBlock?.childBlocks) return newBlocks;

      const [blockToMove] = parentBlock.childBlocks.splice(fromIndex, 1);
      parentBlock.childBlocks.splice(toIndex, 0, blockToMove);

      return newBlocks;
    });
  };

  /**
   * @function handleDesktopInternalDrop
   * @description Handles an internal drop event on a desktop device.
   * @param {Event} e - The drop event.
   * @returns {boolean} - Whether the drop was handled.
   */
  const handleDesktopInternalDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const blockData = JSON.parse(e.dataTransfer.getData('application/json'));
    const internalData = JSON.parse(e.dataTransfer.getData('application/internal') || '{}');
    const dropTarget = e.target;

    if (dropTarget?.closest('.delete-zone')) {
      handleDeleteBlock(blockData, internalData.fromIndex);
      return true;
    }

    if (internalData.fromIndex === currentDropPosition) {
      return true;
    }

    if (internalData.isChildBlock && !e.target?.closest('.child-blocks-container')) {
      handleMoveFromChildToMain(internalData, blockData);
      return true;
    }

    const targetContainer = e.target?.closest('.child-blocks-container');
    if (!internalData.isChildBlock && targetContainer) {
      const parentContainer = targetContainer.closest('.block-container');
      if (parentContainer) {
        const parentIndex = parseInt(parentContainer.dataset.index, 10);
        if (!isNaN(parentIndex)) {
          handleMoveFromMainToChild(internalData, blockData, parentIndex);
          return true;
        }
      }
    }

    if (internalData.isChildBlock && targetContainer) {
      const targetParentBlock = targetContainer.closest('.block-container');
      const targetParentIndex = parseInt(targetParentBlock?.dataset.index, 10);

      if (!isNaN(targetParentIndex) && targetParentIndex !== internalData.parentIndex) {
        handleMoveBetweenChildContainers(
            internalData.parentIndex,
            internalData.fromIndex,
            targetParentIndex
        );
        return true;
      }
    }

    if (internalData.fromIndex !== currentDropPosition &&
        currentDropPosition !== null &&
        currentDropPosition !== -1) {
      handleReorder(internalData.fromIndex, currentDropPosition);
      return true;
    }

    return false;
  };

  /**
   * @function handleDesktopExternalDrop
   * @description Handles an external drop event on a desktop device.
   * @param {Event} e - The drop event.
   * @returns {boolean} - Whether the drop was handled.
   */
  const handleDesktopExternalDrop = (e) => {
    const blockData = JSON.parse(e.dataTransfer.getData('application/json'));

    if (blockData.type === 'start') {
      if (hasStartBlock) return true;
      setDroppedBlocks((blocks) => [createNewBlockWithDefaults(blockData), ...blocks]);
      setHasStartBlock(true);
      return true;
    }

    if (blockData.type === 'end') {
      if (hasEndBlock) return true;
      setDroppedBlocks((blocks) => [...blocks, createNewBlockWithDefaults(blockData)]);
      setHasEndBlock(true);
      return true;
    }

    const dropTarget = e.target;
    const repeatContainer = dropTarget?.closest('.child-blocks-container');
    if (repeatContainer) {
      const parentContainer = repeatContainer.closest('.block-container');
      if (parentContainer) {
        const parentIndex = parseInt(parentContainer.dataset.index, 10);
        if (!isNaN(parentIndex)) {
          if (blockData.type === 'start' || blockData.type === 'end' || blockData.type === 'repeat') {
            return true;
          }

          const newBlock = {
            ...blockData,
            id: uuidv4(),
            isChildBlock: true,
            parentIndex: parentIndex
          };

          if (newBlock.hasInput) {
            if (newBlock.defaultValue !== undefined) {
              newBlock.inputValue = newBlock.defaultValue;
            } else if (newBlock.inputType === 'select' && newBlock.options?.length > 0) {
              newBlock.inputValue = newBlock.options[0].value;
            } else if (newBlock.inputMin !== undefined) {
              newBlock.inputValue = newBlock.inputMin;
            }
          }

          if (newBlock.hasSecondInput) {
            if (newBlock.secondInputDefault !== undefined) {
              newBlock.secondInputValue = newBlock.secondInputDefault;
            } else if (newBlock.secondInputMin !== undefined) {
              newBlock.secondInputValue = newBlock.secondInputMin;
            }
          }

          setDroppedBlocks(blocks => {
            const newBlocks = JSON.parse(JSON.stringify(blocks));
            const parentBlock = newBlocks[parentIndex];

            if (!parentBlock.childBlocks) {
              parentBlock.childBlocks = [];
            }

            const newBlock = createNewBlockWithDefaults({ ...blockData, id: uuidv4() });
            parentBlock.childBlocks.push(newBlock);
            return newBlocks;
          });

          return true;
        }
      }
    }

    const newBlock = createNewBlockWithDefaults({ ...blockData, id: uuidv4() });

    setDroppedBlocks(blocks => {
      const endIndex = blocks.findIndex(b => b.type === 'end');

      if (currentDropPosition !== null && currentDropPosition !== -1) {
        const newBlocks = [...blocks];
        if (currentDropPosition <= 0 && blocks[0]?.type === 'start') return blocks;
        if (endIndex !== -1 && currentDropPosition >= endIndex) return blocks;
        newBlocks.splice(currentDropPosition, 0, newBlock);
        return newBlocks;
      }

      if (endIndex !== -1) {
        const newBlocks = [...blocks];
        newBlocks.splice(endIndex, 0, newBlock);
        return newBlocks;
      }

      return [...blocks, newBlock];
    });

    return true;
  };

  /**
   * @function createNewBlockWithDefaults
   * @description Creates a new block with default values.
   * @param {Object} block - The block to create.
   * @returns {Object} - The new block.
   */
  const createNewBlockWithDefaults = (block) => {
    const newBlock = { ...block };

    if (newBlock.type === 'repeat') {
      newBlock.childBlocks = [];
    }

    if (newBlock.defaultValue) {
      newBlock.inputValue = newBlock.defaultValue;
    } else if (newBlock.secondInputMin) {
      newBlock.inputValue = newBlock.secondInputMin;
    } else if (newBlock.options) {
      newBlock.inputValue = newBlock.options[0].value;
    }

    return newBlock;
  };

  /**
   * @function handleMoveBetweenChildContainers
   * @description Moves a block between child containers.
   * @param {number} sourceParentIndex - The index of the source parent block.
   * @param {number} sourceChildIndex - The index of the source child block.
   * @param {number} targetParentIndex - The index of the target parent block.
   */
  const handleMoveBetweenChildContainers = (sourceParentIndex, sourceChildIndex, targetParentIndex) => {
    setDroppedBlocks(blocks => {
      const newBlocks = JSON.parse(JSON.stringify(blocks));
      const sourceParent = newBlocks[sourceParentIndex];
      if (!sourceParent?.childBlocks) return newBlocks;

      const targetParent = newBlocks[targetParentIndex];
      if (!targetParent?.childBlocks) return newBlocks;

      const blockToMove = sourceParent.childBlocks[sourceChildIndex];
      if (!blockToMove) return newBlocks;

      const movedBlock = {
        ...blockToMove,
        parentIndex: targetParentIndex
      };

      sourceParent.childBlocks = sourceParent.childBlocks.filter((_, idx) => idx !== sourceChildIndex);
      targetParent.childBlocks.push(movedBlock);

      return newBlocks;
    });
  };

  /**
   * @function handleInternalTouchDrop
   * @description Handles an internal drop event on a touch device.
   * @param {Event} e - The drop event.
   * @param {Object} dropEvent - The drop event data.
   */
  const handleInternalTouchDrop = (e, dropEvent) => {
    e._touchHandled = true;

    const blockData = JSON.parse(dropEvent['application/json']);
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

    if ((blockData.isContainer || blockData.type === 'repeat') && touch) {
      const elementsAtPoint = document.elementsFromPoint(touch.clientX, touch.clientY);

      if (elementsAtPoint.some(el => el.closest('.child-blocks-container'))) {
        return;
      }
    }

    if (dropTarget?.closest('.delete-zone')) {
      handleDeleteBlock(blockData, dropEvent.fromIndex);
      return;
    }

    const fromIndex = dropEvent.fromIndex;
    const isChildBlock = dropEvent.isChildBlock;
    const parentIndex = dropEvent.parentIndex;

    const targetContainer = dropTarget?.closest('.child-blocks-container');
    const targetBlock = dropTarget?.closest('.block');
    let targetIndex = -1;

    if (targetBlock) {
      targetIndex = parseInt(targetBlock.dataset.index, 10);
    }

    if (isChildBlock && targetContainer) {
      const targetParentIndex = parseInt(targetContainer.closest('.block-container').dataset.index, 10);

      if (targetParentIndex === parentIndex && !isNaN(targetIndex)) {
        if (fromIndex !== targetIndex) {
          handleChildBlockReorder(parentIndex, fromIndex, targetIndex);
        }
        return;
      }

      if (targetParentIndex !== parentIndex) {
        handleMoveBetweenChildContainers(parentIndex, fromIndex, targetParentIndex);
        return;
      }
    }

    if (isChildBlock && !targetContainer) {
      handleMoveFromChildToMain({ parentIndex, fromIndex }, blockData);
      return;
    }

    if (!isChildBlock && targetContainer) {
      const targetParentBlock = targetContainer.closest('.block-container');
      const targetParentIndex = parseInt(targetParentBlock.dataset.index, 10);

      if (!isNaN(targetParentIndex)) {
        handleMoveFromMainToChild({ fromIndex }, blockData, targetParentIndex);
      }
      return;
    }

    if (fromIndex !== currentDropPosition &&
        currentDropPosition !== null &&
        currentDropPosition !== -1) {
      handleReorder(fromIndex, currentDropPosition);
    }
  };

  /**
   * @function handleExternalTouchDrop
   * @description Handles an external drop event on a touch device.
   * @param {Event} e - The drop event.
   * @param {Object} dropEvent - The drop event data.
   */
  const handleExternalTouchDrop = (e, dropEvent) => {
    const blockData = dropEvent.blockData;
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

    if (blockData.type === 'start') {
      if (hasStartBlock) return;
      setDroppedBlocks((blocks) => [createNewBlockWithDefaults(blockData), ...blocks]);
      setHasStartBlock(true);
      return;
    }

    if (blockData.type === 'end') {
      if (hasEndBlock) return;
      setDroppedBlocks((blocks) => [...blocks, createNewBlockWithDefaults(blockData)]);
      setHasEndBlock(true);
      return;
    }

    const repeatContainer = dropTarget?.closest('.child-blocks-container');
    if (repeatContainer) {
      const parentBlock = repeatContainer.closest('.block-container');
      if (parentBlock) {
        const parentIndex = parseInt(parentBlock.dataset.index, 10);
        handleChildContainerDrop(dropEvent, dropTarget);
        return;
      }
    }

    const newBlock = createNewBlockWithDefaults({ ...blockData, id: uuidv4() });

    setDroppedBlocks(blocks => {
      const endIndex = blocks.findIndex(b => b.type === 'end');

      if (currentDropPosition !== null && currentDropPosition !== -1) {
        const newBlocks = [...blocks];
        if (currentDropPosition <= 0 && blocks[0]?.type === 'start') return blocks;
        if (endIndex !== -1 && currentDropPosition >= endIndex) return blocks;
        newBlocks.splice(currentDropPosition, 0, newBlock);
        return newBlocks;
      }

      if (endIndex !== -1) {
        const newBlocks = [...blocks];
        newBlocks.splice(endIndex, 0, newBlock);
        return newBlocks;
      }

      return [...blocks, newBlock];
    });
  };

  /**
   * @function handleChildContainerDrop
   * @description Handles a drop event on a child container.
   * @param {Object} dropEvent - The drop event data.
   * @param {HTMLElement} dropTarget - The drop target element.
   */
  const handleChildContainerDrop = (dropEvent, dropTarget) => {
    const parentIndex = parseInt(dropTarget.closest('.block-container').dataset.index, 10);
    let droppedBlockData = { ...dropEvent.blockData, id: uuidv4() };

    if (['start', 'end', 'repeat'].includes(droppedBlockData.type)) return;

    if (droppedBlockData.hasInput) {
      if (droppedBlockData.defaultValue !== undefined) {
        droppedBlockData.inputValue = droppedBlockData.defaultValue;
      } else if (droppedBlockData.inputType === 'select' && droppedBlockData.options?.length > 0) {
        droppedBlockData.inputValue = droppedBlockData.options[0].value;
      } else if (droppedBlockData.inputMin !== undefined) {
        droppedBlockData.inputValue = droppedBlockData.inputMin;
      }
    }

    if (droppedBlockData.hasSecondInput) {
      if (droppedBlockData.secondInputDefault !== undefined) {
        droppedBlockData.secondInputValue = droppedBlockData.secondInputDefault;
      } else if (droppedBlockData.secondInputMin !== undefined) {
        droppedBlockData.secondInputValue = droppedBlockData.secondInputMin;
      }
    }

    setDroppedBlocks(blocks => {
      const newBlocks = [...blocks];
      newBlocks[parentIndex].childBlocks.push(droppedBlockData);
      return newBlocks;
    });
  };

  /**
   * @function handleReorder
   * @description Reorders the blocks in the programming area.
   * @param {number} fromIndex - The original index of the block.
   * @param {number} toIndex - The new index of the block.
   */
  const handleReorder = (fromIndex, toIndex) => {
    setDroppedBlocks((blocks) => {
      if (fromIndex < 0 || fromIndex >= blocks.length || toIndex < 0) {
        return blocks;
      }

      const blockToMove = blocks[fromIndex];
      if (!blockToMove) {
        return blocks;
      }

      if (blockToMove.type === 'start' || blockToMove.type === 'end') {
        return blocks;
      }

      const startPos = blocks.findIndex((b) => b.type === 'start');
      const endPos = blocks.findIndex((b) => b.type === 'end');

      if (startPos !== -1 && toIndex <= startPos) return blocks;
      if (endPos !== -1 && toIndex >= endPos) return blocks;

      const newBlocks = [...blocks];
      newBlocks.splice(fromIndex, 1);
      newBlocks.splice(toIndex, 0, blockToMove);
      return newBlocks;
    });
  };

  /**
   * @function isInternalDrag
   * @description Checks if a drag event is internal.
   * @param {Event} e - The drag event.
   * @returns {boolean} - Whether the drag event is internal.
   */
  const isInternalDrag = (e) => {
    return e.dataTransfer.types.includes('application/internal') ?? false;
  }

  /**
   * @function handleBlockInputChange
   * @description Handles a change in a block's input value.
   * @param {number} index - The index of the block.
   * @param {*} value - The new value.
   * @param {boolean} isSecondInput - Whether the input is the second input.
   */
  const handleBlockInputChange = (index, value, isSecondInput) => {
    setDroppedBlocks(blocks => {
      const newBlocks = [...blocks];
      const block = { ...newBlocks[index] };

      if (isSecondInput) {
        block.secondInputValue = value;
      } else {
        block.inputValue = value;
      }

      newBlocks[index] = block;
      return newBlocks;
    });
  };

  /**
   * @function handleChildBlockInputChange
   * @description Handles a change in a child block's input value.
   * @param {number} parentIndex - The index of the parent block.
   * @param {number} childIndex - The index of the child block.
   * @param {*} value - The new value.
   * @param {boolean} isSecondInput - Whether the input is the second input.
   */
  const handleChildBlockInputChange = (parentIndex, childIndex, value, isSecondInput) => {
    setDroppedBlocks(blocks => {
      const newBlocks = [...blocks];
      const parentBlock = {...newBlocks[parentIndex]};
      const childBlock = {...parentBlock.childBlocks[childIndex]};

      if (isSecondInput) {
        childBlock.secondInputValue = value;
      } else {
        childBlock.inputValue = value;
      }

      parentBlock.childBlocks[childIndex] = childBlock;
      newBlocks[parentIndex] = parentBlock;
      return newBlocks;
    });
  };

  /**
   * @function handleClearBlocks
   * @description Clears all blocks from the programming area.
   * @returns {boolean} - Whether the blocks were cleared.
   */
  const handleClearBlocks = () => {
    if (window.confirm(t('confirms.clearAllBlocks'))) {

      setHasStartBlock(false);
      setHasEndBlock(false);
      setDroppedBlocks([]);
      clearSavedBlocks();

      setResetView(true);
      setWasJustCleared(true);

      setTimeout(() => {
        setResetView(false);
      }, 100);

      localStorage.removeItem('savedBlocks');

      return true;
    }
    return false;
  };

  /**
   * @function handleExecute
   * @description Executes the program.
   */
  const handleExecute = async () => {
    if (!ble3Ref.current?.isConnected()) {
      alert(t('alerts.connectMicrobit'));
      return;
    }

    if (droppedBlocks.length === 0) {
      alert(t('alerts.addBlocksFirst'));
      return;
    }

    if (droppedBlocks[0].type !== 'start') {
      alert(t('alerts.startBlockRequired'));
      return;
    }

    const endBlocks = droppedBlocks.filter(block => block.type === 'end');
    if (endBlocks.length > 1) {
      alert(t('alerts.tooManyEndBlocks'));
      return;
    }

    if (droppedBlocks[droppedBlocks.length - 1].type !== 'end') {
      alert(t('alerts.endBlockRequired'));
      return;
    }


    setIsExecuting(true);
    try {
      const commands = convertBlocksToCommands(droppedBlocks);
      await ble3Ref.current.sendData(commands);
    } catch (error) {
      alert(t('alerts.executionFailed'));
    } finally {
      setIsExecuting(false);
    }
  };

  /**
   * @function handleDeleteBlock
   * @description Deletes a block from the programming area.
   * @param {Object} blockToDelete - The block to delete.
   * @param {number} blockToDeleteIndex - The index of the block to delete.
   */
  const handleDeleteBlock = (blockToDelete, blockToDeleteIndex) => {
    setIsDraggingBlock(false);
    setIsDraggingExistingBlock(false);

    if (blockToDelete.isChildBlock && blockToDelete.parentIndex !== undefined) {
      handleChildBlockDeletion(blockToDelete);
    } else {
      handleRegularBlockDeletion(blockToDelete);
    }
  };

  /**
   * @function handleChildBlockDeletion
   * @description Deletes a child block from a parent block.
   * @param {Object} blockToDelete - The block to delete.
   */
  const handleChildBlockDeletion = (blockToDelete) => {
    setDroppedBlocks(currentBlocks => {
      const newBlocks = [...currentBlocks];
      const parentIndex = blockToDelete.parentIndex;
      const parentBlock = newBlocks[parentIndex];

      if (parentBlock && Array.isArray(parentBlock.childBlocks)) {
        const childIndexToDelete = parentBlock.childBlocks.findIndex(
            child => child.id === blockToDelete.id
        );

        if (childIndexToDelete !== -1) {
          parentBlock.childBlocks = [
            ...parentBlock.childBlocks.slice(0, childIndexToDelete),
            ...parentBlock.childBlocks.slice(childIndexToDelete + 1)
          ];
        }
      }
      return newBlocks;
    });
  };

  /**
   * @function handleRegularBlockDeletion
   * @description Deletes a regular block from the programming area.
   * @param {Object} blockToDelete - The block to delete.
   */
  const handleRegularBlockDeletion = (blockToDelete) => {
    const blockId = typeof blockToDelete === 'object' ? blockToDelete.id : blockToDelete;

    setDroppedBlocks(currentBlocks => {
      return currentBlocks.filter(block => block.id !== blockId);
    });
  };

  /**
   * @function handleUpdateBlock
   * @description Updates a block in the programming area.
   * @param {number} index - The index of the block to update.
   * @param {Object} updatedBlock - The updated block.
   */
  const handleUpdateBlock = (index, updatedBlock) => {
    const newBlocks = [...droppedBlocks];
    newBlocks[index] = updatedBlock;
    setDroppedBlocks(newBlocks);
  };

    return (
      <div className="programming-container">
        {!isBlocksView && (
            <CodeViewPopUp
              toggleView={toggleView}
              blocks={droppedBlocks}/>
        )}
        <TopNavigation
          onConnectClick={() => ble3Ref.current.connect()}
          onDisconnectClick={() => ble3Ref.current.disconnect()}
          onStartClick={handleExecute}
          connected={connected}
          isExecuting={isExecuting}
          onClearBlocks={handleClearBlocks}
          droppedBlocks={droppedBlocks}
          isBlocksView={isBlocksView}
          toggleView={toggleView}
          onUploadBlocks={handleUploadBlocks}
        />

        <ProgrammingArea
            droppedBlocks={droppedBlocks}
            resetView={resetView}
            isExecuting={isExecuting}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            onChildInputChange={handleChildBlockInputChange}
            onUpdateBlock={handleUpdateBlock}
            handleDragStart={handleDragStart}
            handleBlockInputChange={handleBlockInputChange}
            onDragOverPosition={handleDragOverPosition}
            onDeleteBlock={handleDeleteBlock}
            isDraggingBlock={isDraggingBlock}
            isDraggingExistingBlock={isDraggingExistingBlock}
        />

        <BlocksPanel
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          blocksByCategory={blocksByCategory}
          handleDragStart={handleDragStart}
          handleDrop={handleDrop}
          onDragOverPosition={handleDragOverPosition}
        />

        <Ble3 ref={ble3Ref} onConnected={handleConnected} />
      </div>
    );
  };

export default ProgrammingInterface;