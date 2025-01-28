import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../../styles/DeleteZone.css';

const DeleteZone = ({ onDelete, isDraggingBlock, onDragOverPosition }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (isDraggingBlock) {
      console.log('Block is being dragged');
    }
  }, [isDraggingBlock]);

  useEffect(() => {
    if (isHovered) {
      console.log('Block is being hovered');
    }
  }, [isHovered]);

  return (
    <div
      className={`delete-zone ${isHovered ? 'hovered' : ''} ${isDraggingBlock ? 'visible' : ''}`}
      onDragOver={(e) => {
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
      <Trash2 size={24} />
      <span>{t('deleteBlock')}</span>
    </div>
  );
};

export default DeleteZone;
