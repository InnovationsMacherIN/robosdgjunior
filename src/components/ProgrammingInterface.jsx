import React, { useState, useRef } from 'react';
import TopNavigation from './navigation/TopNavigation';
import ProgrammingArea from './programming/ProgrammingArea';
import BlocksPanel from './blocks/BlocksPanel';
import Ble3 from './bluetooth/Ble3';
import { categories, blocksByCategory } from '../config/blocksConfig';
import { convertBlocksToCommands } from '../utils/blocksConverter';
import '../styles/ProgrammingInterface.css';

const ProgrammingInterface = () => {
  const [selectedCategory, setSelectedCategory] = useState('Steering');
  const [droppedBlocks, setDroppedBlocks] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [connected, setConnected] = useState(false);
  const ble3Ref = useRef();

  const handleConnected = (isConnected) => {
    setConnected(isConnected);
  };

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

    console.log('Dragging block with values:', blockToTransfer);
    e.dataTransfer.setData('application/json', JSON.stringify(blockToTransfer));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const blockData = e.dataTransfer.getData('application/json');
    const block = JSON.parse(blockData);

    console.log('Dropped block with values:', block);
    setDroppedBlocks([...droppedBlocks, block]);
  };

  const handleClearBlocks = () => {
    if (window.confirm('Haluatko varmasti tyhjentää kaikki lohkot?')) {
      setDroppedBlocks([]);
    }
  };

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
