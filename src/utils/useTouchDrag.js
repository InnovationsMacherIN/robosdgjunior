// src/utils/useTouchDrag.js

import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for handling touch drag operations on tablets
 * Provides touch-specific drag and drop functionality while preserving mouse events
 */
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
    // Prevent default only if we're not touching an input
    console.log("handleTouchStart");
    if (!e.target.closest('input, select')) {
      if (createClone) {
        e.preventDefault();
      }
    }

    const touch = e.touches[0];

    let target = null;

    // repeat blockit on block-container luokassa
    if (touch.target.closest('.block')) {
      target = touch.target.closest('.block');
      e.stopPropagation();
    } else if (touch.target.closest('.block-container')) {
      target = touch.target.closest('.block-container');
    }

    console.log(target)

    if (!target) return;

    dragState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      target: target,
      createClone,
      //clone: null,
      blockData: null
    };

    touchTimeout.current = setTimeout(() => {
      if (onDragStart) {
        onDragStart(dragState.current);
      }
      setIsDragging(true);
    }, 200); // Slightly longer delay to prevent accidental drags
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !dragState.current.target) return;

    //console.log("Handle handleTouchMove");

    //e.preventDefault();
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

    // Update clone position if it exists
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
      //console.log("Block from blockspanel handleTouchEnd", e, dragState.current);
      onDragEnd(e, dragState.current);
    }

    cleanupDrag();
  };

  // Clean up on unmount
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
      onTouchCancel: handleTouchEnd // Add touch cancel handler
    },
    isDragging,
    dragState // Export dragState for external access
  };
};
