/**
 * @file useTouchDrag.js
 * @description A custom hook for handling touch-based drag and drop functionality.
 * @module utils/useTouchDrag
 * @param {Object} options - The options for the hook.
 * @param {function} options.onDragStart - The function to call when a drag starts.
 * @param {function} options.onDragMove - The function to call when a drag moves.
 * @param {function} options.onDragEnd - The function to call when a drag ends.
 * @param {boolean} options.createClone - Whether to create a clone of the dragged element.
 * @returns {Object} The handlers for the touch events, a boolean indicating if a drag is in progress, and the drag state.
 */
import { useEffect, useRef, useState } from 'react';

export const useTouchDrag = ({ onDragStart, onDragMove, onDragEnd, createClone = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({
    clone: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    target: null,
    blockData: null
  });
  const touchTimeout = useRef(null);


  const cleanupDrag = () => {
    if (dragState.current.clone) {
      dragState.current.clone.remove();
      dragState.current.clone = null;
    }
    if (touchTimeout.current) {
      clearTimeout(touchTimeout.current);
      touchTimeout.current = null;
    }
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (!e.target.closest('input, select')) {
      if (createClone) {
        e.preventDefault();
      }
    }

    const touch = e.touches[0];

    let target = null;

    if (touch.target.closest('.block')) {
      target = touch.target.closest('.block');
      e.stopPropagation();
    } else if (touch.target.closest('.block-container')) {
      target = touch.target.closest('.block-container');
    }

    if (!target) return;

    dragState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      target: target,
      createClone,
      blockData: null
    };

    touchTimeout.current = setTimeout(() => {
      if (onDragStart) {
        onDragStart(dragState.current);
      }
      setIsDragging(true);
    }, 200);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !dragState.current.target) return;

    const touch = e.touches[0];

    dragState.current.currentX = touch.clientX;
    dragState.current.currentY = touch.clientY;

    if (onDragMove) {
      onDragMove({
        x: touch.clientX,
        y: touch.clientY,
        dx: touch.clientX - dragState.current.startX,
        dy: touch.clientY - dragState.current.startY,
        target: dragState.current.target
      });
    }

    if (dragState.current.clone) {
      dragState.current.clone.style.left = `${touch.clientX - dragState.current.clone.offsetWidth / 2}px`;
      dragState.current.clone.style.top = `${touch.clientY - dragState.current.clone.offsetHeight / 2}px`;
    }
  };

  const handleTouchEnd = (e) => {
    if (!isDragging) {
      if (touchTimeout.current) {
        clearTimeout(touchTimeout.current);
      }
      return;
    }

    if (onDragEnd) {
      onDragEnd(e, dragState.current);
    }

    cleanupDrag();
  };

  useEffect(() => {
    return () => {
      cleanupDrag();
    };
  }, []);

  useEffect(() => {
    const options = { passive: false };

    document.addEventListener('touchmove', handleTouchMove, options);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove, options);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);


  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd
    },
    isDragging,
    dragState
  };
};