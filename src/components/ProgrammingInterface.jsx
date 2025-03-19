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
 * - TopNavigation: Top navigation bar with buttons for connecting, executing and clearing blocks.
 * - ZoomableArea: Wrapper for programming area with zoom and drag functionality.
 *    -> ProgrammingArea: Main area for dropping and managing blocks. LOCATED INSIDE ZOOMABLE AREA
 * - BlocksPanel: Block selection panel with categories and blocks.
 * - Ble3: Bluetooth connection component.
 *
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
import { useTranslation } from 'react-i18next';
import { saveBlocks, loadBlocks, hasSavedBlocks, clearSavedBlocks } from '../utils/blockStorage';
import ZoomableArea from '../utils/zoomableArea';
import {CodeViewPopUp} from "../utils/CodeViewPopUp.jsx";
import { v4 as uuidv4 } from 'uuid';

import '../styles/ProgrammingInterface.css';
import '../styles/CodeViewPopUp.css';

//import PasswordModal from "./PasswordModal.jsx";

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
   * @state {boolean} isDraggingBlock - Flag for block dragging status
   * @state {boolean} isBlocksView - Flag for block view status
   *
   */
  const [selectedCategory, setSelectedCategory] = useState('Steering');
  const [droppedBlocks, setDroppedBlocks] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [currentDropPosition, setCurrentDropPosition] = useState(null);
  const [isDraggingBlock, setIsDraggingBlock] = useState(false);
  const [isBlocksView, setIsBlocksView] = useState(true);

  //const [isTablet] = useState(/iPad|Android/.test(navigator.userAgent) && !/Mobile/.test(navigator.userAgent));



  const toggleView = () => {
    setIsBlocksView(!isBlocksView)
  }

  const ble3Ref = useRef();

  const handleConnected = (isConnected) => {
    setConnected(isConnected);
  };



  /**
   * saveBlocks - effect
   *
   * Loads saved blocks from local storage when component mounts
   *
   * @returns {void}
   *
   * TODO: FIX BUG IN TABLET/MOBILE DEVICE VIEW WHEN LOADING BLOCKS THE CHILD BLOCKS INSIDE REPEAT BLOCK ARE NOT DELETED PROPERLY ON CLEAR ALL
  */
  useEffect(() => {
    if (hasSavedBlocks()) {
      const savedBlocks = loadBlocks();
      if (savedBlocks) {
        setDroppedBlocks(savedBlocks);
      }
    }
  }, []);

  /**
   * saveBlocks - effect
   *
   * Saves blocks to local storage when droppedBlocks state changes
   *
   * @returns {void}
   */
  useEffect(() => {
    if (droppedBlocks.length > 0) {
      saveBlocks(droppedBlocks);
    }
    console.log(droppedBlocks)
  }, [droppedBlocks]);


  /**
   * handleUploadBlocks - handler
   * Updates droppedBlocks state with new blocks uploaded from file
   *
   *@param {data} data - Uploaded block data
   */
  const handleUploadBlocks = (data) => {
    setDroppedBlocks(data);
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

    console.log('Drag start:', block);
    setIsDraggingBlock(true);

    // Get isChildBlock and parentIndex from the internal data if available
    const isChildBlock = e.dataTransfer.types.includes('application/internal') ?
        JSON.parse(e.dataTransfer.getData('application/internal'))?.isChildBlock : false;

    const parentIndex = e.dataTransfer.types.includes('application/internal') ?
        JSON.parse(e.dataTransfer.getData('application/internal'))?.parentIndex : undefined;

    // Create the block with all necessary properties
    const blockToTransfer = {
      ...block,
      id: block.id || uuidv4(), // Ensure it has an ID
      inputValue: e.target.querySelector('input, select')?.value,
      isChildBlock: isChildBlock || false,
      parentIndex: parentIndex
    };

    // Add second input value if needed
    if (block.hasSecondInput) {
      blockToTransfer.secondInputValue = e.target.querySelector('[id$=second-input]')?.value;
    }

    console.log('Block to transfer:', blockToTransfer);
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
    //console.log('Drag over position:', toIndex);
    setCurrentDropPosition(toIndex);
  };

  /**
   * handleDrop - Handles block dropping in programming area
   *Manages both new block addition and reordering of existing blocks.
   *Cleanup removes visual indicators after drop operation.
   *
   * @param {DragEvent} e - Drop event
   * @param {Object} dropEvent - Drop event data
   * @returns {void}
   *
   * TODO: A LOT OF REPETITIVE AND UNNECESSARY CODE AND HARD TO UNDERSTAND, CLEAN UP!!
   */
  const handleDrop = (e, dropEvent) => {
    e.preventDefault();
    setIsDraggingBlock(false);

    // Clean up visual indicators after drop operation
    const cleanupVisualIndicators = () => {
      document.querySelectorAll('.block-drop-indicator').forEach(el => el.remove());
      document.querySelectorAll('.block.drop-target').forEach(el => el.classList.remove('drop-target'));
      document.querySelectorAll('.block.shift-right').forEach(el => el.classList.remove('shift-right'));
    };

    try {
      // desktopin drag/drop blockpaneelista
      if (handleDesktopDrop(e)) return;

      const isTouchEvent = e.type === 'touchend';

      if (isTouchEvent) {
        if (dropEvent.isInternalDrag === true) {
          console.log("INTERNAL TOUCH DROP")
          handleInternalTouchDrop(e, dropEvent);
        } else {
          console.log("EXTERNAL TOUCH DROP")

          handleExternalTouchDrop(e, dropEvent);
        }
      } else if (isInternalDrag(e)) {
        console.log("INTERNAL DESKTOP DROP")

        handleInternalDesktopDrop(e);
      }
    } finally {
      cleanupVisualIndicators();
      setCurrentDropPosition(null);
    }
  };

  // desktopin drag/drop blockpaneelista
  const handleDesktopDrop = (e) => {
    if (!e.dataTransfer?.types.includes('application/json')) return false;

    try {
      const blockData = JSON.parse(e.dataTransfer.getData('application/json'));
      const dropTarget = e.target.closest('.programming-area');

      if (dropTarget) {
        const newBlock = createNewBlockWithDefaults({
          ...blockData,
          id: uuidv4()
        });

        setDroppedBlocks(blocks => {
          // pistetään loppuun jos käyttäjä ei oo osunu mihinkään palikan väliin
          if (currentDropPosition == null || currentDropPosition === -1) {
            return [...blocks, newBlock];
          } else {
            const newBlocks = [...blocks];
            newBlocks.splice(currentDropPosition, 0, newBlock);
            return newBlocks;
          }
        });

        return true;
      }
    } catch (error) {
      console.error('Error processing drop:', error);
    }

    return false;
  };


  // luo uusi blocki default valueilla
  const createNewBlockWithDefaults = (block) => {
    const newBlock = { ...block };

    if (newBlock.defaultValue) {
      newBlock.inputValue = newBlock.defaultValue;
    } else if (newBlock.secondInputMin) {
      newBlock.inputValue = newBlock.secondInputMin;
    } else if (newBlock.options) {
      newBlock.inputValue = newBlock.options[0].value;
    }

    return newBlock;
  };

  // (KOSKETUS) handlataan palikoiden järjestely programmin arean sisällä
  const handleInternalTouchDrop = (e, dropEvent) => {
    const blockData = JSON.parse(dropEvent['application/json']);
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

    // tarkista onko delete zonessa
    if (dropTarget?.closest('.delete-zone')) {
      handleDeleteBlock(blockData, dropEvent.fromIndex);
      return;
    }

    // järjestele uudestaan
    const fromIndex = dropEvent.fromIndex;
    if (fromIndex !== currentDropPosition &&
        currentDropPosition !== -1 &&
        currentDropPosition !== null) {
      handleReorder(fromIndex, currentDropPosition);
    }
  };

  // (KOSKETUS) handlaa uuden blockin lisäys blockspaneelista
  const handleExternalTouchDrop = (e, dropEvent) => {
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

    // valinta joko repeatiin tai pääalueeseen
    if (dropTarget?.closest('.child-blocks-container')) {
      handleChildContainerDrop(dropEvent);
    } else if (dropTarget?.closest('.programming-area')) {
      handleProgrammingAreaTouchDrop(dropEvent);
    }
  };

  // (KOSKETUS) handlaa blockin laittaminen repeat blockiin
  const handleChildContainerDrop = (dropEvent) => {
    let droppedBlockData = {
      ...dropEvent.blockData,
      id: uuidv4()
    };

    // ei sallita start, end, repeat blockien laittaoa tänne
    if (['start', 'end', 'repeat'].includes(droppedBlockData.type)) return;

    const repeatBlockIndex = droppedBlocks.findIndex(block => block.type === 'repeat');
    if (repeatBlockIndex !== -1) {
      if (droppedBlockData.defaultValue) {
        droppedBlockData.inputValue = droppedBlockData.defaultValue;
      }

      setDroppedBlocks(blocks => {
        const newBlocks = [...blocks];
        newBlocks[repeatBlockIndex].childBlocks.push(droppedBlockData);
        return newBlocks;
      });
    }
  };

  // (KOSKETUS) handlaa blockin laitto pääalueeseen
  const handleProgrammingAreaTouchDrop = (dropEvent) => {
    let droppedBlockData = {
      ...dropEvent.blockData,
      id: uuidv4()
    };
    const newBlock = createNewBlockWithDefaults(droppedBlockData);

    setDroppedBlocks(blocks => {
      if (currentDropPosition === null || currentDropPosition === -1) {
        return [...blocks, newBlock];
      } else {
        const newBlocks = [...blocks];
        newBlocks.splice(currentDropPosition, 0, newBlock);
        return newBlocks;
      }
    });
  };

  // (DESKTOP) handlaa palikoiden laitto pääalueeseen
  const handleInternalDesktopDrop = (e) => {
    const { fromIndex } = JSON.parse(e.dataTransfer.getData('application/internal'));

    if (fromIndex !== currentDropPosition && currentDropPosition !== -1) {
      handleReorder(fromIndex, currentDropPosition);
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
    return e.dataTransfer.types.includes('application/internal') ?? false;
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
   *
   * TODO: FIX BUG IN TABLET/MOBILE DEVICE VIEW WHEN LOADING BLOCKS THE CHILD BLOCKS INSIDE REPEAT BLOCK ARE NOT DELETED PROPERLY ON CLEAR ALL
   */
  const handleClearBlocks = () => {
    if (window.confirm(t('confirms.clearAllBlocks'))) {
      console.log('clear blocks', droppedBlocks);
      for (let block of droppedBlocks) {
        console.log("deleting: ",block);
        if (block.childBlocks) {
          console.log("child blocks found", block.childBlocks);
          block.childBlocks = [];
          console.log("child blocks found 2", block.childBlocks);
        }
      }
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
    console.log('Execute program');
    if (!ble3Ref.current?.isConnected()) {
      console.log('Not connected');
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

    // Tarkista, että ketjussa ei ole enempää kuin yksi 'end' palikka
    const endBlocks = droppedBlocks.filter(block => block.type === 'end');
    if (endBlocks.length > 1) {
      alert(t('alerts.tooManyEndBlocks'));
      return;
    }

    // Tarkista, että viimeinen palikka on 'end'
    if (droppedBlocks[droppedBlocks.length - 1].type !== 'end') {
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

    // childblockeissa oma logiikkansa
    if (blockToDelete.isChildBlock === true && blockToDelete.parentIndex !== undefined) {
      console.log("HANDLING CHILD BLOCK DELETION");

      setDroppedBlocks(currentBlocks => {
        const newBlocks = [...currentBlocks];
        const parentIndex = blockToDelete.parentIndex;
        const parentBlock = newBlocks[parentIndex];

        if (parentBlock && Array.isArray(parentBlock.childBlocks)) {
          // poistetaan id:n perusteella
          const childIndexToDelete = parentBlock.childBlocks.findIndex(
              child => child.id === blockToDelete.id
          );

          if (childIndexToDelete !== -1) {
            // tee uus array ilman sitä aiempaa
            parentBlock.childBlocks = [
              ...parentBlock.childBlocks.slice(0, childIndexToDelete),
              ...parentBlock.childBlocks.slice(childIndexToDelete + 1)
            ];
          }
        }

        return newBlocks;
      });
    } else {
      console.log("HANDLING REGULAR BLOCK DELETION");

      setDroppedBlocks(currentBlocks => {
        console.log("Current blocks before deletion:", JSON.parse(JSON.stringify(currentBlocks)));

        // filtteröi poistettava palikka
        const newBlocks = currentBlocks.filter((block, index) => {
          const shouldKeep = !(block.id === blockToDelete.id && (index === blockToDeleteIndex || blockToDeleteIndex === undefined));
          console.log(`Block ${index} (id: ${block.id}) should keep? ${shouldKeep}`);
          return shouldKeep;
        });

        console.log("Blocks after deletion:", newBlocks);
        return newBlocks;
      });
    }
  };

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
          handleDrop={handleDrop}
          onDragOverPosition={handleDragOverPosition}
        />

        <Ble3 ref={ble3Ref} onConnected={handleConnected} />
      </div>
    );
  };

export default ProgrammingInterface;
