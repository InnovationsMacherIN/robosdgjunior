/**
 * ProgrammingInterface.jsx
 *
 * Main React component of the application that manages:
 * - Programming block state and handling.
 * - Bluetooth connection to micro:bit device.
 * - Main UI elements and  layout
 *
 * Uses refs for maintaining Bluetooth connection and state management
 * for block handling and program execution.
 *
 * Structure:
 *
 *
 * @component
 */

import React, { useState, useRef, useEffect } from 'react';
import TopNavigation from './navigation/TopNavigation';
import ProgrammingArea from './programming/ProgrammingArea';
import BlocksPanel from './blocks/BlocksPanel';
import Ble3 from './bluetooth/Ble3';
import { categories, blocksByCategory } from '../config/blocksConfig';
import { convertBlocksToCommands } from '../utils/blocksConverter';
import '../styles/ProgrammingInterface.css';
import { useTranslation } from 'react-i18next';
import { saveBlocks, loadBlocks, hasSavedBlocks, clearSavedBlocks } from '../utils/blockStorage';
import ZoomableArea from '../utils/zoomableArea';

const ProgrammingInterface = () => {
  const { t } = useTranslation();



  /**
   * State declaratiions
   *
   * @state {string} selectedCategory - Currently selected block category
   * @state {Array} droppedBlocks - Blocks placed in the programming area
   * @state {boolean} isExecuting - Flag for program execution status.
   * @state {boolean} connected - Bluetooth connection status.
   * @state {number} currentDropPosition - Current drop position for block reordering
   *
   */
  const [selectedCategory, setSelectedCategory] = useState('Steering');
  const [droppedBlocks, setDroppedBlocks] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [currentDropPosition, setCurrentDropPosition] = useState(null);
  const [isDraggingBlock, setIsDraggingBlock] = useState(false);

  /**
   * Reference to Bluetooth connection component
   * Uses useRef hook to maintain connection between component re-renders
   *
   * @type {React.RefObject}
   */
  const ble3Ref = useRef();

  /**
   * handleConnected - handler
   * Updates connection status when Bluetooth connection changes in ble3 component
   * Does not handle the actual bluetooth connection (this is done in ble3.jsx file).
   *
   * @param {boolean} isConnected - new connection status
   */
  const handleConnected = (isConnected) => {
    setConnected(isConnected);
  };

  // Ladataan tallennetut lohkot kun komponentti mountataan
  useEffect(() => {
    if (hasSavedBlocks()) {
      const savedBlocks = loadBlocks();
      if (savedBlocks) {
        setDroppedBlocks(savedBlocks);
      }
    }
  }, []);

  // Tallennetaan lohkot kun ne muuttuvat
  useEffect(() => {
    if (droppedBlocks.length > 0) {
      saveBlocks(droppedBlocks);
    }
  }, [droppedBlocks]);

  /**
   * handleDragStart - handler
   * Handles the start of block dragging
   * Prepares block data for transfer including input values
   *
   * @param {DreagEvent} e - Drag event
   * @param {Oblect} block - Block data object
   */
  const handleDragStart = (e, block) => {
    // Clone the block to avoid reference issues
    console.log('Drag start:', block);
    setIsDraggingBlock(true);

    const blockToTransfer = {
      ...block,
      inputValue: e.target.querySelector('input, select')?.value,
    };
    if (block.hasSecondInput) {
      blockToTransfer.secondInputValue = e.target.querySelector('[id$=second-input]')?.value;
    }
    e.dataTransfer.setData('application/json', JSON.stringify(blockToTransfer));
  };

  /**
   * handleDragOver - event
   * Prevents default behavior during drag over to allow dropping
   *
   * @param {DragEvent} e - Drag event
   */
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  /**
   * handleDragOverPosition - handler
   * Updates the current drop position during drag operation
   * Used as a callback for drag over events to track where blocks can be dropped
   *
   * @param {number} toIndex - Target index for the block being dragged
   *                          -1 indicates drop in delete zone
   *                          null indicates drop at end of list
   * @returns {void}
   *
   * @example
   * // When dragging over second block position
   * handleDragOverPosition(1)
   *
   * // When dragging over delete zone
   * handleDragOverPosition(-1)
   */
  const handleDragOverPosition = (toIndex) => {
    setCurrentDropPosition(toIndex);
  };

  /**
   * handleDrop - Handles block dropping in programming area
   *Manages both new block addition and reordering of existing blocks.
   *Cleanup removes visual indicators after drop operation.
   *
   * @param {DragEvent} e - Drop event
   * @returns {void}
   */
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingBlock(false);

    const cleanup = () => {
      document.querySelectorAll('.block-drop-indicator').forEach(el => el.remove());
      document.querySelectorAll('.block.drop-target').forEach(el =>
        el.classList.remove('drop-target'));
      document.querySelectorAll('.block.shift-right').forEach(el =>
        el.classList.remove('shift-right'));
    };

    if (isInternalDrag(e)) {

      //get drag data from internal reordering
      const {fromIndex} = JSON.parse(
        e.dataTransfer.getData('application/internal')
      );
      //console.log('From index:', fromIndex, 'To index:', currentDropPosition);
      if ( fromIndex !== currentDropPosition && currentDropPosition !== -1) {
        handleReorder(fromIndex, currentDropPosition);
      } else {
        return;
      }
    } else {
      console.log('Dropping block:', currentDropPosition);
      const blockData = e.dataTransfer.getData('application/json');
      const block = JSON.parse(blockData);
      if (currentDropPosition !== null) {
        setDroppedBlocks(blocks => {
          const newBlocks = [...blocks];
          newBlocks.splice(currentDropPosition, 0, block);
          return newBlocks;
        });
      } else {
        setDroppedBlocks([...droppedBlocks, block]);
      }
    }
    cleanup();
    setCurrentDropPosition(null);
  };

  /**
   * handleReorder - handler
   * Updates block order when block is dragged within programming area.
   *
   * @param {number} fromIndex - Original position
   * @param {number} toIndex - new position, where block is dropped
   */
  const handleReorder = (fromIndex, toIndex) => {
    setDroppedBlocks(blocks => {
      //console.log('handle reorder:', blocks, fromIndex, toIndex);
      const newBlocks = [...blocks];
      const [movedBlock] = newBlocks.splice(fromIndex, 1)
      newBlocks.splice(toIndex, 0, movedBlock);
      return newBlocks;
    })
  };

  /**
   * isINternalDrag - handler
   * Identifies if block is being dragged within programming area.
   *
   * @param {DragEvent} e - Drop event
   * @returns {boolean} - true if internal drag
   */
  const isInternalDrag = (e) => {
    return e.dataTransfer.types.includes('application/internal');
  }

  /**
   * Updates block input values when they are changed in programming area
   *
   * @param {number} index - Index of the block in droppedBlocks array
   * @param {string|number} value - New value for the input
   * @param {boolean} isSecondInput - Whether updating first or second input
   * @returns {void}
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
   * handleClearBlocks - handler
   * Clears all blocks from the programming area
   * Prompts user for confirmation
   *
   * @returns {boolean} - true if user confirms
   * @function
   */
  const handleClearBlocks = () => {
    if (window.confirm(t('confirms.clearAllBlocks'))) {
      setDroppedBlocks([]);
      clearSavedBlocks();
    }
  };

  /**
   * handleExecute - handler
   * Handles program execution
   * Checks if micro:bit is connected and if blocks are present and if program starts with 'start' block
   * If all conditions are met, setIsExecuting flag to true and sends commands to micro:bit
   * Converts blocks to commands (using convertBlocksToCommands method from utils/blocksConverter.js component)
   * and sends them to micro:bit via Bluetooth (using ble3Ref.current.sendData method from Ble3 component)
   *
   * @throws {Error} If connection is missing or execution fails
   * @returns {Promise<void>}
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

    if (droppedBlocks[0].id !== 'start') {
      alert(t('alerts.startBlockRequired'));
      return;
    }

    // Tarkista, että ketjussa ei ole enempää kuin yksi 'end' palikka
    const endBlocks = droppedBlocks.filter(block => block.id === 'end');
    if (endBlocks.length > 1) {
      alert(t('alerts.tooManyEndBlocks'));
      return;
    }

    // Tarkista, että viimeinen palikka on 'end'
    if (droppedBlocks[droppedBlocks.length - 1].id !== 'end') {
      alert(t('alerts.endBlockRequired'));
      return;
    }


    setIsExecuting(true);
    try {
      const commands = convertBlocksToCommands(droppedBlocks);
      //console.log('Sending commands:', commands); // Debug log
      await ble3Ref.current.sendData(commands);
    } catch (error) {
      //console.error(t('errors.executionFailed'), error);
      alert(t('alerts.executionFailed'));
    } finally {
      setIsExecuting(false);
    }
  };

  /**
   * handleDeleteBlock - Removes block from programming area
   *
   * @param {Object} blockToDelete - Block to be deleted
   * @param {number} blockToDeleteIndex - Index of block to delete
   * @returns {void}
   */
  const handleDeleteBlock = (blockToDelete, blockToDeleteIndex) => {
    setIsDraggingBlock(false);
    setDroppedBlocks(currentBlocks => {
      const newBlocks = currentBlocks.filter((block, index) => {
        if (!block) {
          return false;
        }
        const shouldKeep = !(block.id === blockToDelete.id &&
          block.inputValue === blockToDelete.inputValue &&
        index === blockToDeleteIndex);
        return shouldKeep;
      });
      return newBlocks;
    });
  };

  /**
   * Updates a single block in programming area
   * Creates a new array of blocks to maintain React state immutability
   *
   * @param {number} index - Index of block to be updated in droppedBlocks array
   * @param {Object} updatedBlock - New block object to replace the old one
   * @returns {void}
   */
  const handleUpdateBlock = (index, updatedBlock) => {
    const newBlocks = [...droppedBlocks];
    newBlocks[index] = updatedBlock;
    setDroppedBlocks(newBlocks);
  };


  return (
    <div className="programming-container">
      <TopNavigation
        onConnectClick={() => ble3Ref.current.connect()}
        onDisconnectClick={() => ble3Ref.current.disconnect()}
        onStartClick={handleExecute}
        connected={connected}
        isExecuting={isExecuting}
        onClearBlocks={handleClearBlocks}
        droppedBlocks={droppedBlocks}
      />

      <ZoomableArea
        onDeleteBlock={handleDeleteBlock}
        onDragOverPosition={handleDragOverPosition}
        isDraggingBlock={isDraggingBlock}
      >
        <ProgrammingArea
          droppedBlocks={droppedBlocks}
          isExecuting={isExecuting}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}

          onUpdateBlock={handleUpdateBlock}
          handleDragStart={handleDragStart}
          handleBlockInputChange={handleBlockInputChange}
          onDragOverPosition={handleDragOverPosition}
        />
      </ZoomableArea>

      <BlocksPanel
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        blocksByCategory={blocksByCategory}
        handleDragStart={handleDragStart}
      />

      <Ble3 ref={ble3Ref} onConnected={handleConnected} />
    </div>
  );
};

export default ProgrammingInterface;
