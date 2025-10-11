/**
 * @file DeleteZone.jsx
 * @description A component that provides a drop zone for deleting blocks.
 * @module components/programming/DeleteZone
 * @param {Object} props - The component props.
 * @param {function} props.onDelete - A function to delete a block.
 * @param {boolean} props.isDraggingBlock - Whether a block is being dragged.
 * @param {boolean} props.isDraggingExistingBlock - Whether an existing block is being dragged.
 * @param {function} props.onDragOverPosition - A function to handle the drag over position.
 * @returns {React.ReactElement} The DeleteZone component.
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/DeleteZone.css';
import RoboTrash from "../../assets/icons/RoboTrash.jsx";

const DeleteZone = ({ onDelete, isDraggingBlock, isDraggingExistingBlock, onDragOverPosition }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useTranslation();

  return (
    <div
        className={`delete-zone ${isHovered ? 'hovered' : ''} ${isDraggingBlock && isDraggingExistingBlock ? 'visible' : ''}`}      onDragOver={(e) => {
        e.preventDefault();
        setIsHovered(true);
        onDragOverPosition(-1);
      }}
      onDragLeave={() => setIsHovered(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsHovered(false);
        const blockData = e.dataTransfer.getData('application/json');
        const indexData = e.dataTransfer.getData('application/internal');
        if (blockData) {
          const block = JSON.parse(blockData);
          const index = JSON.parse(indexData).fromIndex;
          onDelete(block, index);
        }
      }}
    >
      <RoboTrash style={{width: '45px', height: '45px'}}/>
    </div>
  );
};

export default DeleteZone;