import React, { useState, useCallback, useRef, useEffect } from 'react';
import DeleteZone from "../components/programming/DeleteZone.jsx";
import '../styles/DeleteZone.css';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_SPEED = 0.001;

const ZoomableArea = ({ children,
                        onDeleteBlock,
                        onDragOverPosition,
                        isDraggingBlock
                      }) => {
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const touchCount = useRef(0);


  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (!container.contains(e.target)) return;

      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();

        const delta = -e.deltaY * ZOOM_SPEED;
        const newScale = Math.min(Math.max(scale + delta, MIN_ZOOM), MAX_ZOOM);

        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        const newTranslateX = x - (x * newScale) / scale + translate.x;
        const newTranslateY = y - (y * newScale) / scale + translate.y;

        setScale(newScale);
        setTranslate({ x: newTranslateX, y: newTranslateY });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [scale, translate]);

  const handleMouseDown = useCallback((e) => {
    // Aloita panorointi vain jos ctrl/cmd on painettu
    if (e.button === 0 && (e.ctrlKey || e.metaKey)) {
      setIsPanning(true);
      setStartPos({ x: e.clientX, y: e.clientY });
      containerRef.current.style.cursor = 'grabbing';
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isPanning) {
      const dx = (e.clientX - startPos.x) / scale;
      const dy = (e.clientY - startPos.y) / scale;
      setTranslate(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setStartPos({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, startPos, scale]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      if (containerRef.current) {
        containerRef.current.style.cursor = 'default';
      }
    }
  }, [isPanning]);

  // Kosketusnäyttö tuki
  const handleTouchStart = useCallback((e) => {
    touchCount.current = e.touches.length;
    // Aloita panorointi vain kahdella sormella
    if (e.touches.length === 2) {
      setIsPanning(true);
      setStartPos({
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      });
      e.preventDefault();
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (isPanning && e.touches.length === 2) {
      const currentX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const currentY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

      const dx = (currentX - startPos.x) / scale;
      const dy = (currentY - startPos.y) / scale;

      setTranslate(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setStartPos({ x: currentX, y: currentY });

      e.preventDefault();
    }
  }, [isPanning, startPos, scale]);

  const handleTouchEnd = useCallback((e) => {
    touchCount.current = e.touches.length;
    if (touchCount.current < 2) {
      setIsPanning(false);
    }
  }, []);

  // Estä selaimen oma zoomaus
  useEffect(() => {
    const preventDefault = (e) => {
      if (e.ctrlKey && (e.key === '-' || e.key === '=' || e.key === '+')) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', preventDefault);
    return () => window.removeEventListener('keydown', preventDefault);
  }, []);

  return (
    <div
      ref={containerRef}
      className="zoomable-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        height: '100%',
        touchAction: 'none'
      }}
    >
      <DeleteZone
        isDraggingBlock={isDraggingBlock} // Muutettu tämä rivi
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
        {children}
      </div>
    </div>
  );
};

export default ZoomableArea;
