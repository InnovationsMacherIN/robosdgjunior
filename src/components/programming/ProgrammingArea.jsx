import React, { useEffect, useState } from 'react';
import { Play, Trash2 } from 'lucide-react';
import '../../styles/components/ProgrammingArea.css';

const ProgrammingArea = ({
                           droppedBlocks,
                           handleDragOver,
                           handleDrop,
                           onClearBlocks
                         }) => {
  // Lisätään useEffect debuggausta varten
  useEffect(() => {
    if (droppedBlocks.length > 0) {
      console.log('Current blocks in programming area:', droppedBlocks);
    }
  }, [droppedBlocks]);


  const [isExecuting, setIsExecuting] = useState(false);
  const renderBlockValue = (block) => {
    let valueText = '';

    // Näytä ensisijainen syöte
    if (block.inputValue !== undefined) {
      if (block.inputType === 'select') {
        // Etsi valitun arvon label options-listasta
        const option = block.options?.find(opt => opt.value === block.inputValue);
        valueText = option ? option.label : block.inputValue;
      } else {
        valueText = block.inputValue;
      }
    }

    // Lisää toinen syöte jos se on olemassa
    if (block.secondInputValue !== undefined) {
      if (block.secondInputType === 'select') {
        const option = block.options?.find(opt => opt.value === block.secondInputValue);
        valueText += ` ${option ? option.label : block.secondInputValue}`;
      } else {
        valueText += ` ${block.secondInputValue}`;
      }
    }

    return valueText ? ` (${valueText})` : '';
  };

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
            {droppedBlocks.map((block, index) => (
              <div
                key={`${block.id}-${index}`}
                className={`block ${block.className || ''}`}
              >
                <div className="block-header">
                  <span className="block-title">
                    {block.title}
                    {renderBlockValue(block)}
                  </span>
                </div>
                <p className="block-description">{block.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgrammingArea;
