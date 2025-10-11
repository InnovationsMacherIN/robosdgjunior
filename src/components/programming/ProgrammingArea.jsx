/**
 * @file ProgrammingArea.jsx
 * @description The main programming area where blocks are dropped and arranged.
 * @module components/programming/ProgrammingArea
 * @param {Object} props - The component props.
 * @param {Array} props.droppedBlocks - The blocks dropped in the programming area.
 * @param {boolean} props.isExecuting - Whether the program is executing.
 * @param {function} props.handleDragOver - A function to handle the drag over event.
 * @param {function} props.handleDrop - A function to handle a drop event.
 * @param {function} props.onUpdateBlock - A function to update a block.
 * @param {function} props.handleDragStart - A function to handle the start of a drag event.
 * @param {function} props.handleBlockInputChange - A function to handle a change in a block's input value.
 * @param {function} props.onChildInputChange - A function to handle a change in a child block's input value.
 * @param {function} props.onDeleteBlock - A function to delete a block.
 * @param {function} props.onDragOverPosition - A function to handle the drag over position.
 * @param {boolean} props.resetView - Whether to reset the view.
 * @param {boolean} props.isDraggingBlock - Whether a block is being dragged.
 * @param {boolean} props.isDraggingExistingBlock - Whether an existing block is being dragged.
 * @returns {React.ReactElement} The ProgrammingArea component.
 */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Play, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DeleteZone from './DeleteZone';
import '../../styles/components/ProgrammingArea.css';
import '../../styles/draggableBlocks.css';
import DroppedBlock from './Block';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_SPEED = 0.001;

const ProgrammingArea = ({
                           droppedBlocks,
                           isExecuting,
                           handleDragOver,
                           handleDrop,
                           onUpdateBlock,
                           handleDragStart,
                           handleBlockInputChange,
                           onChildInputChange,
                           onDeleteBlock,
                           onDragOverPosition,
                           resetView,
                           isDraggingBlock,
                           isDraggingExistingBlock,
                         }) => {
  const { t } = useTranslation();

  const [activeChain, setActiveChain] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [chainPositions, setChainPositions] = useState({});
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const touchCount = useRef(0);
  const previousTouchDistance = useRef(null);
  const [gestureType, setGestureType] = useState(null);
  const initialTouchDistance = useRef(null);
  const ZOOM_THRESHOLD = 30;

  const areaRef = useRef(null);

  /**
   * @function calculatePanBoundaries
   * @description Calculates the boundaries for panning.
   * @returns {Object} The minimum and maximum x coordinates for panning.
   */
  const calculatePanBoundaries = useCallback(() => {
    if (!areaRef.current) return { minX: -Infinity, maxX: Infinity };

    const containerWidth = areaRef.current.clientWidth;
    const contentElement = areaRef.current.querySelector('.zoomable-content');
    const blockChain = contentElement?.querySelector('.block-chain-container');

    let contentWidth = 0;
    if (blockChain) {
      const blockChainRect = blockChain.getBoundingClientRect();
      const positionOffset = chainPositions["main-chain"]?.x || 20;
      contentWidth = (blockChainRect.width / scale) + positionOffset;
    } else {
      contentWidth = contentElement.scrollWidth;
    }

    const buffer = 100 / scale;
    const minX = Math.min(containerWidth/scale - contentWidth - buffer, 0);
    const maxX = buffer;

    return { minX, maxX };
  }, [scale, chainPositions]);

  /**
   * @function centerViewOnContent
   * @description Centers the view on the content.
   */
  const centerViewOnContent = useCallback(() => {
    if (!areaRef.current) return;

    setTimeout(() => {
      const container = areaRef.current;
      const content = container.querySelector('.zoomable-content');
      const blockChain = content?.querySelector('.block-chain-container');

      if (container && blockChain) {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      }
    }, 50);
  }, []);

  useEffect(() => {
    if (droppedBlocks.length === 1) {
      centerViewOnContent();
    }
  }, [droppedBlocks.length, centerViewOnContent]);

  useEffect(() => {
    const container = areaRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (!container.contains(e.target)) return;

      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();

        const delta = -e.deltaY * ZOOM_SPEED;
        const newScale = Math.min(Math.max(scale + delta, MIN_ZOOM), MAX_ZOOM);

        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;

        const newTranslateX = x - (x * newScale) / scale + translate.x;
        const newTranslateY = 0;

        setScale(newScale);
        setTranslate({ x: newTranslateX, y: newTranslateY });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [scale, translate]);

  /**
   * @function handleMouseDown
   * @description Handles the mouse down event for panning.
   * @param {Event} e - The mouse down event.
   */
  const handleMouseDown = useCallback((e) => {
    if (e.button === 0 && (e.ctrlKey || e.metaKey)) {
      setIsPanning(true);
      setStartPos({ x: e.clientX, y: 0 });
      if (areaRef.current) areaRef.current.style.cursor = 'grabbing';
      e.preventDefault();
    }
  }, []);

  /**
   * @function handleMouseMove
   * @description Handles the mouse move event for panning.
   * @param {Event} e - The mouse move event.
   */
  const handleMouseMove = useCallback((e) => {
    if (isPanning) {
      const dx = (e.clientX - startPos.x) / scale;
      const newX = translate.x + dx;
      const { minX, maxX } = calculatePanBoundaries();
      const constrainedX = Math.min(Math.max(newX, minX), maxX);

      setTranslate(prev => ({ x: constrainedX, y: prev.y }));
      setStartPos({ x: e.clientX, y: e.clientY });
    } else if (activeChain) {
      handleChainDrag(e);
    }
  }, [isPanning, startPos, scale, activeChain, translate, calculatePanBoundaries]);

  /**
   * @function handleMouseUp
   * @description Handles the mouse up event for panning.
   */
  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      if (areaRef.current) {
        areaRef.current.style.cursor = 'default';
      }
    }
    if (activeChain) {
      handleChainDragEnd();
    }
  }, [isPanning, activeChain]);

  /**
   * @function getTouchDistance
   * @description Calculates the distance between two touches.
   * @param {Array} touches - The touches.
   * @returns {number} The distance between the touches.
   */
  const getTouchDistance = (touches) => {
    if (touches.length < 2) return null;

    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  /**
   * @function getTouchMidpoint
   * @description Calculates the midpoint between two touches.
   * @param {Array} touches - The touches.
   * @returns {Object} The midpoint between the touches.
   */
  const getTouchMidpoint = (touches) => {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  };

  /**
   * @function handleTouchStart
   * @description Handles the touch start event for panning and zooming.
   * @param {Event} e - The touch start event.
   */
  const handleTouchStart = useCallback((e) => {
    touchCount.current = e.touches.length;

    if (e.touches.length === 2) {
      setIsPanning(true);
      setStartPos(getTouchMidpoint(e.touches));

      const distance = getTouchDistance(e.touches);
      previousTouchDistance.current = distance;
      initialTouchDistance.current = distance;
      setGestureType(null);
    }
  }, []);

  /**
   * @function handleTouchMove
   * @description Handles the touch move event for panning and zooming.
   * @param {Event} e - The touch move event.
   */
  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2) {
      const currentMidpoint = getTouchMidpoint(e.touches);
      const currentDistance = getTouchDistance(e.touches);

      if (gestureType === null && initialTouchDistance.current) {
        const distanceDelta = Math.abs(currentDistance - initialTouchDistance.current);
        if (distanceDelta > ZOOM_THRESHOLD) {
          setGestureType('zoom');
        } else if (
            Math.abs(currentMidpoint.x - startPos.x) > 10 ||
            Math.abs(currentMidpoint.y - startPos.y) > 10
        ) {
          setGestureType('pan');
        }
      }

      if (gestureType === 'pan' || gestureType === null) {
        const dx = (currentMidpoint.x - startPos.x) / scale;
        const newX = translate.x + dx;
        const { minX, maxX } = calculatePanBoundaries();
        const constrainedX = Math.min(Math.max(newX, minX), maxX);

        setTranslate(prev => ({ x: constrainedX, y: prev.y }));
        setStartPos(currentMidpoint);
      } else if ((gestureType === 'zoom') &&
          previousTouchDistance.current &&
          currentDistance) {

        const pinchRatio = currentDistance / previousTouchDistance.current;
        if (Math.abs(pinchRatio - 1) > 0.03) {
          const smoothingFactor = 0.7;
          const smoothedPinchRatio = 1 + (pinchRatio - 1) * smoothingFactor;
          const newScale = Math.min(Math.max(scale * smoothedPinchRatio, MIN_ZOOM), MAX_ZOOM);
          const rect = areaRef.current.getBoundingClientRect();
          const touchX = (currentMidpoint.x - rect.left) / scale;

          const newTranslateX = touchX - (touchX * newScale) / scale + translate.x;
          const newTranslateY = 0;

          setScale(newScale);
          setTranslate({ x: newTranslateX, y: newTranslateY });
          previousTouchDistance.current = currentDistance;
        }
      }

      previousTouchDistance.current = currentDistance;
    }
  }, [isPanning, startPos, scale, translate, gestureType, calculatePanBoundaries]);

  /**
   * @function handleTouchEnd
   * @description Handles the touch end event for panning and zooming.
   * @param {Event} e - The touch end event.
   */
  const handleTouchEnd = useCallback((e) => {
    touchCount.current = e.touches.length;
    if (touchCount.current < 2) {
      setIsPanning(false);
      previousTouchDistance.current = null;
      initialTouchDistance.current = null;
      setGestureType(null);
    }
  }, []);

  /**
   * @function handleChainDragStart
   * @description Handles the start of a chain drag event.
   * @param {Event} e - The drag event.
   * @param {string} chainId - The ID of the chain being dragged.
   */
  const handleChainDragStart = useCallback((e, chainId) => {
    let target = null;

    if (e.target.closest('.block')) {
      target = e.target.closest('.block');
      e.stopPropagation();
    } else if (e.target.closest('.block-container')) {
      target = e.target.closest('.block-container');
    }

    if (target && target.querySelector('[data-block-id]')?.dataset.typeId !== 'start') {
      return;
    }

    const chain = e.currentTarget;
    const rect = chain.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setActiveChain(chainId);
    setDragOffset({ x: offsetX, y: offsetY });
    chain.classList.add('dragging');
  }, []);

  /**
   * @function handleChainDrag
   * @description Handles a chain drag event.
   * @param {Event} e - The drag event.
   */
  const handleChainDrag = useCallback((e) => {
    if (!activeChain) return;

    const areaRect = areaRef.current.getBoundingClientRect();
    const x = (e.clientX - areaRect.left - dragOffset.x) / scale;
    const y = (e.clientY - areaRect.top - dragOffset.y) / scale;

    setChainPositions(prev => ({
      ...prev,
      [activeChain]: { x, y }
    }));
  }, [activeChain, dragOffset, scale]);

  /**
   * @function handleChainDragEnd
   * @description Handles the end of a chain drag event.
   */
  const handleChainDragEnd = useCallback(() => {
    if (!activeChain) return;

    const chain = document.querySelector(`[data-chain-id="${activeChain}"]`);
    if (chain) {
      chain.classList.remove('dragging');
    }

    setActiveChain(null);
  }, [activeChain]);

  /**
   * @function handleBlockDragStart
   * @description Handles the start of a block drag event.
   * @param {Event} e - The drag event.
   * @param {Object} block - The block being dragged.
   */
  const handleBlockDragStart = (e, block) => {
    if (handleDragStart) {
      handleDragStart(e, block);
    }
  };

  /**
   * @function handleBlockDragEnd
   * @description Handles the end of a block drag event.
   */
  const handleBlockDragEnd = () => {
  };

  useEffect(() => {
    const preventDefault = (e) => {
      if (e.ctrlKey && (e.key === '-' || e.key === '=' || e.key === '+')) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', preventDefault);
    return () => window.removeEventListener('keydown', preventDefault);
  }, []);

  useEffect(() => {
    document.addEventListener('dragend', handleBlockDragEnd);
    return () => {
      document.removeEventListener('dragend', handleBlockDragEnd);
    };
  }, []);

  return (
      <div className="programming-area"
           onMouseDown={handleMouseDown}
           onMouseMove={handleMouseMove}
           onMouseUp={handleMouseUp}
           onMouseLeave={handleMouseUp}
           onTouchStart={handleTouchStart}
           onTouchMove={handleTouchMove}
           onTouchEnd={handleTouchEnd}>
        <div
            ref={areaRef}
            className="programming-area-blocks"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
              overflow: 'hidden',
              position: 'relative',
              width: '100%',
              height: '100%',
              touchAction: 'none'
            }}
        >
          <DeleteZone
              isDraggingExistingBlock={isDraggingExistingBlock}
              isDraggingBlock={isDraggingBlock}
              onDelete={(block, index) => {
                onDeleteBlock(block, index);
              }}
              onDragOverPosition={onDragOverPosition}
          />

          <div
              className="zoomable-content"
              style={{
                transform: `scale(${scale}) translate(${translate.x}px, ${translate.y}px)`,
                transformOrigin: '0 0',
                transition: isPanning ? 'none' : 'transform 0.1s',
                position: 'relative',
                minHeight: '100%',
                width: 'fit-content'
              }}
          >
            <div
                className="block-chain-container"
                data-chain-id="main-chain"
                style={{
                  position: 'relative',
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
                        onChildInputChange={onChildInputChange}
                        onDragOverPosition={onDragOverPosition}
                    />
                ))}
              </div>
            </div>
          </div>

          <div className={`programming-area-overlay ${activeChain !== null ? 'active' : ''}`} />
        </div>
      </div>
  );
};

export default ProgrammingArea;