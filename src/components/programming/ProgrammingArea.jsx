import React, { useEffect, useState } from 'react';
import { Play, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DeleteZone from './DeleteZone';
import '../../styles/components/ProgrammingArea.css';
import DroppedBlock from './Block'

const ProgrammingArea = ({
                           droppedBlocks,
                           handleDragOver,
                           handleDrop,
                           onClearBlocks,
                           onUpdateBlock,
                           handleDragStart,
                           handleBlockInputChange,
                           onDeleteBlock,
                           onDragOverPosition,
                         }) => {

  const { t } = useTranslation();
  const [isDraggingBlock, setIsDraggingBlock] = useState(false);

  // Päivitetty handleBlockDragStart wrapper-funktio
  const handleBlockDragStart = (e, block) => {
    setIsDraggingBlock(true);
    if (handleDragStart) {
      handleDragStart(e, block);
    }
  };

  const handleBlockDragEnd = () => {
    setIsDraggingBlock(false);
  };

  // Komponentti unmount cleanup
  useEffect(() => {
    document.addEventListener('dragend', handleBlockDragEnd);
    return () => {
      document.removeEventListener('dragend', handleBlockDragEnd);
    };
  }, []);


  // Lisätään useEffect debuggausta varten
  useEffect(() => {
    if (droppedBlocks.length > 0) {
      console.log('Current blocks in programming area:', droppedBlocks);
    }
  }, [droppedBlocks]);


  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    if (!bleConnection?.isConnected) {
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
      // Tässä voidaan käyttää joko lohkojen omia command-funktioita
      // tai ulkopuolista convertBlocksToCommands funktiota
      const commands = droppedBlocks.map(block => {
        if (typeof block.command === 'function') {
          return block.command(block.inputValue, block.secondInputValue);
        }
        return block.command;
      }).join('');

      await bleConnection.sendData(commands);
    } catch (error) {
      console.error('Ohjelman suoritus epäonnistui:', error);
      alert('Ohjelman suoritus epäonnistui. Tarkista yhteys ja yritä uudelleen.');
    } finally {
      setIsExecuting(false);
    }
  };

  const renderBlockInput = (block, index) => {
    switch(block.inputType) {
      case 'text':
        return (
          <input
            type="text"
            value={block.inputValue || ''}
            maxLength={block.maxLength || 8}
            onChange={(e) => onUpdateBlock(index, { ...block, inputValue: e.target.value })}
            className="block-input block-input-text"
          />
        );
      case 'select':
        return (
          <select
            value={block.inputValue}
            onChange={(e) => onUpdateBlock(index, { ...block, inputValue: e.target.value })}
            className="block-input block-input-select"
          >
            {block.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            value={block.inputValue}
            min={block.inputMin}
            max={block.inputMax}
            step={block.inputStep}
            onChange={(e) => onUpdateBlock(index, { ...block, inputValue: e.target.value })}
            className="block-input block-input-number"
          />
        );
      default:
        return null;
    }
  };


  return (
    <div className="programming-area-container">
      <div className="programming-area-header">
        <h2>Ohjelmointialue</h2>
        <div className="programming-area-controls">

          <button
            className="button button-clear"
            onClick={onClearBlocks}
            disabled={droppedBlocks.length === 0}
          >
            <Trash2 className="w-4 h-4" />
            Tyhjennä kaikki
          </button>
        </div>
      </div>

      <div
        className="programming-area-content"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {droppedBlocks.length === 0 ? (
          <div className="programming-area-placeholder">
            Raahaa ja pudota lohkoja tänne luodaksesi ohjelman
          </div>
        ) : (
          <div className="dropped-blocks">
          {droppedBlocks?.filter(block => block !== null && block !== undefined)
            .map((block, index) => (
            block && (
            <DroppedBlock
              key={`${block.id}-${index}`}
              block={block}
              index={index}
              onInputChange={handleBlockInputChange}
              onDragStart={(e) => handleBlockDragStart(e, block)}
              onDragEnd={handleBlockDragEnd}
              onDragOverPosition={onDragOverPosition}
            />
            )
          ))}
          </div>
        )}
        <DeleteZone
          onDelete={(block, index) => onDeleteBlock(block, index)}
          isDraggingBlock={isDraggingBlock}
          onDragOverPosition={onDragOverPosition}
        />
      </div>

    </div>
  );
};

export default ProgrammingArea;
