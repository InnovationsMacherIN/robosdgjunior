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
  const [isDraggingExistingBlock, setIsDraggingExistingBlock] = useState(false);
  const [hasStartBlock, setHasStartBlock] = useState(false);
  const [hasEndBlock, setHasEndBlock] = useState(false);
  const [resetView, setResetView] = useState(false);
  const [wasJustCleared, setWasJustCleared] = useState(false);

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
    console.log('Drag start:', block);

    e.stopPropagation();

    // ei sallita startin tai endin liikuttelua
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

    // palikan luonti kaikilla tarpeellisilla tiedoilla
    const blockToTransfer = {
      ...block,
      id: block.id || uuidv4(),
      inputValue: e.target.querySelector('input, select')?.value,
    };

    // Add second input value if needed
    if (block.hasSecondInput) {
      blockToTransfer.secondInputValue = e.target.querySelector('[id$=second-input]')?.value;
    }

    // data sisäisille dragauksille
    const internalData = {
      fromIndex: parseInt(e.currentTarget.dataset.index, 10),
      isChildBlock: block.isChildBlock || false,
      parentIndex: block.parentIndex
    };

    e.dataTransfer.setData('application/json', JSON.stringify(blockToTransfer));
    e.dataTransfer.setData('application/internal', JSON.stringify(internalData));
  };

  /**
   * handleDragOver - event
   * Prevents default behavior during drag over to allow dropping
   *
   * @param {DragEvent} e - Drag event
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    // We don't need any additional logic here as the actual
    // drag over handling happens in the Block component
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
   */
  const handleDrop = (e, dropEvent) => {
    e.preventDefault();
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

      // desktopin drag/drop blockpaneelista
      if (!isTouchEvent && handleDesktopDrop(e)) return;

      // drop target elementti
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

      // katotaan onko se childcontainer
      const childContainer = dropTarget?.closest('.child-blocks-container');
      const isChildContainer = !!childContainer;

      // TOUCH EVENT HANDLING
      if (isTouchEvent) {
        if (dropEvent?.isInternalDrag === true) {
          console.log("INTERNAL TOUCH DROP");
          handleInternalTouchDrop(e, dropEvent);
        } else {
          console.log("EXTERNAL TOUCH DROP");
          handleExternalTouchDrop(e, dropEvent);
        }
        return;
      }

      if (e.dataTransfer?.types.includes('application/internal')) {
        const internalData = JSON.parse(e.dataTransfer.getData('application/internal') || '{}');
        const blockData = JSON.parse(e.dataTransfer.getData('application/json') || '{}');

        // liikutetaan repeatista mainiin
        if (internalData.isChildBlock && !isChildContainer) {
          handleMoveFromChildToMain(internalData, blockData);
          return;
        }

        // liikutetaan mainista repeatiin
        if (!internalData.isChildBlock && isChildContainer) {
          // otetaan ensin talteen parent container
          const parentContainer = childContainer.closest('.block-container');
          if (!parentContainer) return;

          const parentIndex = parseInt(parentContainer.dataset.index, 10);
          if (isNaN(parentIndex)) return;

          handleMoveFromMainToChild(internalData, blockData, parentIndex);
          return;
        }

        // perus järjestely
        if (internalData.fromIndex !== currentDropPosition &&
            currentDropPosition !== null &&
            currentDropPosition !== -1) {
          handleReorder(internalData.fromIndex, currentDropPosition);
        }
      }
    } finally {
      cleanupVisualIndicators();
      setCurrentDropPosition(null);
    }
  };

  const handleMoveFromChildToMain = (internalData, blockData) => {
    const { parentIndex, fromIndex } = internalData;

    setDroppedBlocks(blocks => {
      // kopio blockeista
      const newBlocks = JSON.parse(JSON.stringify(blocks));

      // parent block talteen
      const parentBlock = newBlocks[parentIndex];
      if (!parentBlock?.childBlocks) return newBlocks;

      // liikutettava block talteen
      const blockToMove = parentBlock.childBlocks[fromIndex];
      if (!blockToMove) return newBlocks;

      // muokataan repeatin ominaisuudet pois
      const movedBlock = {
        ...blockToMove,
        isChildBlock: false,
        parentIndex: null
      };

      // poistetaan childblockeista
      parentBlock.childBlocks = parentBlock.childBlocks.filter((_, idx) => idx !== fromIndex);

      // liikutetaan drop positioon
      let insertPos = currentDropPosition !== null && currentDropPosition !== -1
          ? currentDropPosition
          : newBlocks.length;

      // etsitään start ja end jos ne on olemassa
      const startBlockIndex = newBlocks.findIndex(block => block.type === 'start');
      const endBlockIndex = newBlocks.findIndex(block => block.type === 'end');

      // varmistetaan ettei aseteta starttia edelle
      if (startBlockIndex !== -1 && insertPos <= startBlockIndex) {
        insertPos = startBlockIndex + 1; // laitetaan startin jälkeen
      }

      // varmistetaan ettei aseteta endin jälkeen
      if (endBlockIndex !== -1 && insertPos > endBlockIndex) {
        insertPos = endBlockIndex; // laitetaan endin edelle
      }

      // laitetaan blocki pääalueelle
      newBlocks.splice(insertPos, 0, movedBlock);
      return newBlocks;
    });
  };

  // aika sama kuin siirrossa childista mainiin
  const handleMoveFromMainToChild = (internalData, blockData, targetParentIndex) => {
    const { fromIndex } = internalData;

    setDroppedBlocks(blocks => {
      const newBlocks = JSON.parse(JSON.stringify(blocks));

      const blockToMove = {
        ...newBlocks[fromIndex],
        isChildBlock: true,
        parentIndex: targetParentIndex
      };

      // alustetaan childblocks array jos tarvitaan
      if (!newBlocks[targetParentIndex].childBlocks) {
        newBlocks[targetParentIndex].childBlocks = [];
      }

      newBlocks[targetParentIndex].childBlocks.push(blockToMove);

      // poistetaan pääalueelta
      newBlocks.splice(fromIndex, 1);

      return newBlocks;
    });
  };

  const handleChildBlockReorder = (parentIndex, fromIndex, toIndex) => {
    setDroppedBlocks(blocks => {
      const newBlocks = JSON.parse(JSON.stringify(blocks));
      const parentBlock = newBlocks[parentIndex];

      if (!parentBlock?.childBlocks) return newBlocks;

      // siirrettävä blocki
      const [blockToMove] = parentBlock.childBlocks.splice(fromIndex, 1);

      // uusi positio
      parentBlock.childBlocks.splice(toIndex, 0, blockToMove);

      return newBlocks;
    });
  };

  // desktopin drag/drop blockpaneelista
  const handleDesktopDrop = (e) => {
    if (!e.dataTransfer?.types.includes('application/json')) {
      return false;
    }

    try {
      const blockData = JSON.parse(e.dataTransfer.getData('application/json'));

      // tarkasta onko tämä sisäinen uudelleen järjestely
      const internalData = JSON.parse(e.dataTransfer.getData('application/internal') || '{}');
      const isInternalMove = typeof internalData.fromIndex === 'number' && !isNaN(internalData.fromIndex);

      if (isInternalMove) {
        if (currentDropPosition !== null && currentDropPosition !== -1) {
          handleReorder(internalData.fromIndex, currentDropPosition);
          return true;
        }
        return false;
      }

      // startin käsittely
      if (blockData.type === 'start') {
        if (hasStartBlock) return true;
        setDroppedBlocks((blocks) => [createNewBlockWithDefaults(blockData), ...blocks]);
        setHasStartBlock(true);
        return true;
      }

      // endin käsittely
      if (blockData.type === 'end') {
        if (hasEndBlock) return true;
        setDroppedBlocks((blocks) => [...blocks, createNewBlockWithDefaults(blockData)]);
        setHasEndBlock(true);
        return true;
      }

      // tavallisten palikoiden käsittely
      const newBlock = createNewBlockWithDefaults({ ...blockData, id: uuidv4() });

      setDroppedBlocks(blocks => {
        const newBlocks = [...blocks];
        const endIndex = blocks.findIndex(b => b.type === 'end');

        // jos ei ole palikoita
        if (blocks.length === 0) {
          return [newBlock];
        }

        // jos ollaan laittamassa tiettyyn paikkaan
        if (currentDropPosition !== null && currentDropPosition !== -1) {
          // ei sallita laittamista ennen starttia
          if (blocks[0]?.type === 'start' && currentDropPosition === 0) {
            return blocks;
          }

          // ei sallita laittamista endin jälkeen
          if (endIndex !== -1 && currentDropPosition > endIndex) {
            return blocks;
          }

          newBlocks.splice(currentDropPosition, 0, newBlock);
          return newBlocks;
        }

        // jos end on olemassa, laita sitä ennen
        if (endIndex !== -1) {
          newBlocks.splice(endIndex, 0, newBlock);
          return newBlocks;
        }

        return [...blocks, newBlock];
      });

      return true;
    } catch (error) {
      console.error('Error processing drop:', error);
      return false;
    }
  };

  // luo uusi blocki default valueilla
  const createNewBlockWithDefaults = (block) => {
    const newBlock = { ...block };

    // jos tehdään uusi, nollataan childBlocks
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

  const handleMoveBetweenChildContainers = (sourceParentIndex, sourceChildIndex, targetParentIndex) => {
    setDroppedBlocks(blocks => {
      const newBlocks = JSON.parse(JSON.stringify(blocks));

      // otetaan alkuperäinen repeat block talteen
      const sourceParent = newBlocks[sourceParentIndex];
      if (!sourceParent?.childBlocks) return newBlocks;

      // kohde repeat block
      const targetParent = newBlocks[targetParentIndex];
      if (!targetParent?.childBlocks) return newBlocks;

      // liikutettava block
      const blockToMove = sourceParent.childBlocks[sourceChildIndex];
      if (!blockToMove) return newBlocks;

      // kopio ja uusi parent index
      const movedBlock = {
        ...blockToMove,
        parentIndex: targetParentIndex
      };

      // poistetaan vanhasta
      sourceParent.childBlocks = sourceParent.childBlocks.filter((_, idx) => idx !== sourceChildIndex);

      // lisätään uuteen
      targetParent.childBlocks.push(movedBlock);

      return newBlocks;
    });
  };

  // (KOSKETUS) handlataan palikoiden järjestely programmin arean sisällä
  const handleInternalTouchDrop = (e, dropEvent) => {
    e._touchHandled = true;

    const blockData = JSON.parse(dropEvent['application/json']);

    console.log("BLOCKDATA", blockData)

    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

    // estetään repeatien siirto repeatien sisään
    if ((blockData.isContainer || blockData.type === 'repeat') && touch) {
      const elementsAtPoint = document.elementsFromPoint(touch.clientX, touch.clientY);

      if (elementsAtPoint.some(el => el.closest('.child-blocks-container'))) {
        return;
      }
    }

    // tarkista onko delete zonessa
    if (dropTarget?.closest('.delete-zone')) {
      handleDeleteBlock(blockData, dropEvent.fromIndex);
      return;
    }

    // data dropeventistä
    const fromIndex = dropEvent.fromIndex;
    const isChildBlock = dropEvent.isChildBlock;
    const parentIndex = dropEvent.parentIndex;

    // etsi target container/blocki
    const targetContainer = dropTarget?.closest('.child-blocks-container');
    const targetBlock = dropTarget?.closest('.block');
    let targetIndex = -1;

    if (targetBlock) {
      targetIndex = parseInt(targetBlock.dataset.index, 10);
    }

    // tarkasta ollaanko järjestelemässä uudelleen repeatin sisällä
    if (isChildBlock && targetContainer) {
      const targetParentIndex = parseInt(targetContainer.closest('.block-container').dataset.index, 10);

      if (targetParentIndex === parentIndex && !isNaN(targetIndex)) {
        // järjestellään uudelleen jos indeksi on eri kuin aluksi
        if (fromIndex !== targetIndex) {
          handleChildBlockReorder(parentIndex, fromIndex, targetIndex);
        }
        return;
      }

      // tarkista jos ollaan liikuttamassa repeatista toiseen
      if (targetParentIndex !== parentIndex) {
        handleMoveBetweenChildContainers(parentIndex, fromIndex, targetParentIndex);
        return;
      }
    }

    // tarkista jos ollaan liikuttamassa repeatista mainiin
    if (isChildBlock && !targetContainer) {
      handleMoveFromChildToMain({ parentIndex, fromIndex }, blockData);
      return;
    }

    // tarkista jos ollaan liikuttamassa mainista repeatiin
    if (!isChildBlock && targetContainer) {
      const targetParentBlock = targetContainer.closest('.block-container');
      const targetParentIndex = parseInt(targetParentBlock.dataset.index, 10);

      if (!isNaN(targetParentIndex)) {
        handleMoveFromMainToChild({ fromIndex }, blockData, targetParentIndex);
      }
      return;
    }

    // järjestele uudestaan
    if (fromIndex !== currentDropPosition &&
        currentDropPosition !== null &&
        currentDropPosition !== -1) {
      handleReorder(fromIndex, currentDropPosition);
    }
  };

  // (KOSKETUS) handlaa uuden blockin lisäys blockspaneelista
  const handleExternalTouchDrop = (e, dropEvent) => {
    const blockData = dropEvent.blockData;
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

    // handlaa start palikka
    if (blockData.type === 'start') {
      if (hasStartBlock) return;
      setDroppedBlocks((blocks) => [createNewBlockWithDefaults(blockData), ...blocks]);
      setHasStartBlock(true);
      return;
    }

    // handlaa end palikka
    if (blockData.type === 'end') {
      if (hasEndBlock) return;
      setDroppedBlocks((blocks) => [...blocks, createNewBlockWithDefaults(blockData)]);
      setHasEndBlock(true);
      return;
    }

    // tarkista, ollaanko laittamassa repeatiin
    const repeatContainer = dropTarget?.closest('.child-blocks-container');
    if (repeatContainer) {
      const parentBlock = repeatContainer.closest('.block-container');
      if (parentBlock) {
        const parentIndex = parseInt(parentBlock.dataset.index, 10);
        handleChildContainerDrop(dropEvent, dropTarget);
        return;
      }
    }

    // käsittele peruspalikat programmin arealla
    const newBlock = createNewBlockWithDefaults({ ...blockData, id: uuidv4() });

    setDroppedBlocks(blocks => {
      const endIndex = blocks.findIndex(b => b.type === 'end');

      // jos ollaan laittamassa tiettyyn paikkaan ja se on validi
      if (currentDropPosition !== null && currentDropPosition !== -1) {
        const newBlocks = [...blocks];
        // älä salli ennen startia tai jälkeen endin
        if (currentDropPosition <= 0 && blocks[0]?.type === 'start') return blocks;
        if (endIndex !== -1 && currentDropPosition >= endIndex) return blocks;
        newBlocks.splice(currentDropPosition, 0, newBlock);
        return newBlocks;
      }

      // jos end olemassa, laita ennen sitä
      if (endIndex !== -1) {
        const newBlocks = [...blocks];
        newBlocks.splice(endIndex, 0, newBlock);
        return newBlocks;
      }

      return [...blocks, newBlock];
    });
  };

  // (KOSKETUS) handlaa blockin laittaminen repeat blockiin
  const handleChildContainerDrop = (dropEvent, dropTarget) => {
    const parentIndex = parseInt(dropTarget.closest('.block-container').dataset.index, 10);
    let droppedBlockData = { ...dropEvent.blockData, id: uuidv4() };

    // ei sallita start/end blockien laittoa
    if (['start', 'end', 'repeat'].includes(droppedBlockData.type)) return;

    // primary input
    if (droppedBlockData.hasInput) {
      if (droppedBlockData.defaultValue !== undefined) {
        droppedBlockData.inputValue = droppedBlockData.defaultValue;
      } else if (droppedBlockData.inputType === 'select' && droppedBlockData.options?.length > 0) {
        droppedBlockData.inputValue = droppedBlockData.options[0].value;
      } else if (droppedBlockData.inputMin !== undefined) {
        droppedBlockData.inputValue = droppedBlockData.inputMin;
      }
    }

    // secondary input
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
   * handleReorder - handler
   * Updates block order when block is dragged within programming area.
   *
   * @param {number} fromIndex - Original position
   * @param {number} toIndex - new position, where block is dropped
   */
  const handleReorder = (fromIndex, toIndex) => {
    setDroppedBlocks((blocks) => {
      // validoi indeksit ensin
      if (fromIndex < 0 || fromIndex >= blocks.length || toIndex < 0) {
        return blocks;
      }

      const blockToMove = blocks[fromIndex];
      if (!blockToMove) {
        return blocks;
      }

      // ei saa siirtää aloitus tai lopetuspalikotia
      if (blockToMove.type === 'start' || blockToMove.type === 'end') {
        return blocks;
      }

      // tarkasta aloitus ja lopetuspalikoiden paikka
      const startPos = blocks.findIndex((b) => b.type === 'start');
      const endPos = blocks.findIndex((b) => b.type === 'end');

      // älä salli laittaa ennen aloitusta tai lopetuksen jälkeen
      if (startPos !== -1 && toIndex <= startPos) return blocks;
      if (endPos !== -1 && toIndex >= endPos) return blocks;

      const newBlocks = [...blocks];
      newBlocks.splice(fromIndex, 1);
      newBlocks.splice(toIndex, 0, blockToMove);
      return newBlocks;
    });
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
   * handleClearBlocks - handler
   * Clears all blocks from the programming area
   * Prompts user for confirmation
   *
   * @returns {boolean} - true if user confirms
   * @function
   *
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

      // Force a refresh of local storage
      localStorage.removeItem('savedBlocks');

      return true;
    }
    return false;
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
    setIsDraggingExistingBlock(false);

    // eritellään childblockin ja tavallisen blockin poisto
    if (blockToDelete.isChildBlock && blockToDelete.parentIndex !== undefined) {
      handleChildBlockDeletion(blockToDelete);
    } else {
      handleRegularBlockDeletion(blockToDeleteIndex);
    }
  };

  // poisto repeat blockin sisältä
  const handleChildBlockDeletion = (blockToDelete) => {
    setDroppedBlocks(currentBlocks => {
      const newBlocks = [...currentBlocks];
      const parentIndex = blockToDelete.parentIndex;
      const parentBlock = newBlocks[parentIndex];

      if (parentBlock && Array.isArray(parentBlock.childBlocks)) {
        // etsi ja poista chilblock id:n perusteella
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

  // perus blockien poisto
  const handleRegularBlockDeletion = (blockToDeleteIndex) => {
    setDroppedBlocks(currentBlocks => {
      return currentBlocks.filter((_, index) => index !== blockToDeleteIndex);
    });
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
