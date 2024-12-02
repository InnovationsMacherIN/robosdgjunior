/**
 * ProgrammingInterface.jsx
 *
 * Main React component of the application that manages:
 * - Programming block state and handling.
 * - Bluetooth connection to micro:bit device.
 * - Main UI elements and  layout
 *
 * Structure:
 *
 *
 * @component
 */

import React, { useState, useRef } from 'react';
import TopNavigation from './navigation/TopNavigation';
import ProgrammingArea from './programming/ProgrammingArea';
import BlocksPanel from './blocks/BlocksPanel';
import Ble3 from './bluetooth/Ble3';
import { categories, blocksByCategory } from '../config/blocksConfig';
import { convertBlocksToCommands } from '../utils/blocksConverter';
import '../styles/ProgrammingInterface.css';

const ProgrammingInterface = () => {
  /**
   * State declaratiions
   *
   * @state {string} selectedCategory - Currently selected block category
   * @state {Array} droppedBlocks - Blocks placed in the programming area
   * @state {boolean} isExecuting - Flag for program execution status.
   * @state {boolean} connected - Bluetooth connection status.
   *
   */
  const [selectedCategory, setSelectedCategory] = useState('Steering');
  const [droppedBlocks, setDroppedBlocks] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [connected, setConnected] = useState(false);

  /**
   * Reference to Bluetooth connection component
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
    const blockToTransfer = {
      ...block,
      inputValue: e.target.querySelector('input, select')?.value,
    };

    // Handle second input if it exists
    if (block.hasSecondInput) {
      blockToTransfer.secondInputValue = e.target.querySelector('[id$=second-input]')?.value;
    }

    //console.log('Dragging block with values:', blockToTransfer); FOR TESTING

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
   * handleDrop - handler
   * Handles block dropping into programming area
   * Adds new block to droppedBlocks state
   *
   * @param {DragEvent} e - Drop event
   */
  const handleDrop = (e) => {
    e.preventDefault();

    if (isInternalDrag(e)) {
      //get drag data from internal reordering
      const {fromIndex, toIndex} = JSON.parse(
        e.dataTransfer.getData('application/internal')
      );
      handleReorder(fromIndex, toIndex);
    } else {
      const blockData = e.dataTransfer.getData('application/json');

      //console.log('Dropped block data:', {
      //  raw: blockData,
      //  parsed: JSON.parse(blockData),
      //  currentBlocks: droppedBlocks
      //}); FOR TESTING

      const block = JSON.parse(blockData);

      //console.log('Dropped block with values:', block); FOR TESTING

      setDroppedBlocks([...droppedBlocks, block]);
    }
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
   * @param {number} index - Index of the block in droppedBlocks array
   * @param {string|number} value - New value for the input
   * @param {boolean} isSecondInput - Whether updating first or second input
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
    if (window.confirm('Haluatko varmasti tyhjentää kaikki lohkot?')) {
      setDroppedBlocks([]);
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
   * @returns {Promise<void>}
   */
  const handleExecute = async () => {
    if (!ble3Ref.current?.isConnected()) {
      alert('Yhdistä micro:bit ensin');
      return;
    }

    if (droppedBlocks.length === 0) {
      alert('Lisää lohkoja ennen suoritusta');
      return;
    }

    if (droppedBlocks[0].id !== 'start') {
      alert('Ohjelman pitää alkaa Start-lohkolla');
      return;
    }

    setIsExecuting(true);
    try {
      const commands = convertBlocksToCommands(droppedBlocks);
      console.log('Sending commands:', commands); // Debug log
      await ble3Ref.current.sendData(commands);
    } catch (error) {
      console.error('Ohjelman suoritus epäonnistui:', error);
      alert('Ohjelman suoritus epäonnistui. Tarkista yhteys ja yritä uudelleen.');
    } finally {
      setIsExecuting(false);
    }
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
      />

      <ProgrammingArea
        droppedBlocks={droppedBlocks}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        onClearBlocks={handleClearBlocks}
        onUpdateBlock={handleUpdateBlock}
        handleDragStart={handleDragStart}
        handleBlockInputChange={handleBlockInputChange}
      />

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
