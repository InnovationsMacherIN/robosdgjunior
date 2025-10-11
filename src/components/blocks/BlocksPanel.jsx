/**
 * @file BlocksPanel.jsx
 * @description A component that displays the available programming blocks, organized by category.
 * @module components/blocks/BlocksPanel
 * @param {Object} props - The component props.
 * @param {Array} props.categories - The available block categories.
 * @param {string} props.selectedCategory - The currently selected category.
 * @param {function} props.setSelectedCategory - A function to set the selected category.
 * @param {Object} props.blocksByCategory - The blocks, organized by category.
 * @param {function} props.handleDragStart - A function to handle the start of a drag event.
 * @param {function} props.handleDrop - A function to handle a drop event.
 * @param {function} props.onDragOverPosition - A function to handle the drag over position.
 * @returns {React.ReactElement} The BlocksPanel component.
 */
import React, {useState} from 'react';
import '../../styles/components/BlocksPanel.css';
import '../../styles/BlockVisualElements.css';
import BlockIconConfig from "../../config/blockIconConfig";
import '../../styles/blockIconConfig.css';
import {useTouchDrag} from "../../utils/useTouchDrag";
import icon_control from "../../assets/icons/robo-trafficlight.svg";
import icon_visual from "../../assets/icons/robo-screen.svg";
import icon_sounds from "../../assets/icons/robo-sound.svg";
import icon_movement from "../../assets/icons/robo-movement.svg";
import icon_robo_illustration from "../../assets/icons/robo-illustration.svg";


const BlocksPanel = ({
                       categories,
                       selectedCategory,
                       setSelectedCategory,
                       blocksByCategory,
                       handleDragStart,
                       handleDrop,
                       onDragOverPosition
                     }) => {

  const [blocks, setBlocks] = useState(blocksByCategory);
  const { handlers: touchHandlers, isDragging, dragState } = useTouchDrag({
      createClone: true,
      onDragStart: (dragData) => {
        const blockElement = dragData.target;
        if (!blockElement) return;

        const clone = blockElement.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.zIndex = 1000;
        clone.style.opacity = '0.8';
        clone.style.pointerEvents = 'none';
        clone.classList.add('block-dragging');
        document.body.appendChild(clone);

        dragState.current.clone = clone;
        dragState.current.blockData = blocks[selectedCategory].find(
          b => b.type === blockElement.dataset.blockId
        );

        clone.style.left = `${dragData.startX - clone.offsetWidth / 2}px`;
        clone.style.top = `${dragData.startY - clone.offsetHeight / 2}px`;
      },

      onDragMove: (moveData) => {
          if (!isDragging || !dragState.current.clone) return;

          const dropTarget = document.elementFromPoint(moveData.x, moveData.y);
          if (!dropTarget) return;

          const blockElement = dropTarget.closest('.block');
          if (blockElement) {
              const rect = blockElement.getBoundingClientRect();
              const relativeY = moveData.y - rect.top;
              const height = rect.height;

              const position = relativeY < height / 2 ? 'before' : 'after';

              const index = parseInt(blockElement.dataset.index, 10) || 0;
              const toIndex = (position === 'before') ? index : index + 1;

              if (onDragOverPosition) {
                  onDragOverPosition(toIndex);
              }

              document.querySelectorAll('.block.drop-target').forEach(el => {
                  el.classList.remove('drop-target');
              });
              blockElement.classList.add('drop-target');

          } else {
              const programmingArea = dropTarget.closest('.programming-area');
              if (programmingArea) {
                  if (onDragOverPosition) {
                      onDragOverPosition(null);
                  }
                  document.querySelectorAll('.block.drop-target').forEach(el => {
                      el.classList.remove('drop-target');
                  });
              }
          }
      },

      onDragEnd: (e, endData) => {
        handleDrop(e, endData);

        document.querySelectorAll('.drag-over').forEach(el => {
          el.classList.remove('drag-over');
        });
      }
    });

  /**
   * @function getCategoryImage
   * @description Returns an image element based on the category name.
   * @param {string} category - The category name.
   * @returns {React.ReactElement} The image element.
   */
  const getCategoryImage = (category) => {

    const getIconSrc = (category) => {
      switch (category) {
        case 'Control':
          return icon_control;
        case 'LED Display':
          return icon_visual;
        case 'Movement':
          return icon_movement;
        case 'Sounds':
          return icon_sounds;
        default:
          return '';
      }
    }

    return (
      <div>
        <img src={getIconSrc(category)} alt="Category Image" className="category-image"/>
      </div>
    );
  };

  return (
    <div className="categories">
      <div className="robo-illustration-container">
        <img src={icon_robo_illustration} alt="Robo Illustration" className="robo-illustration" />
      </div>
      <div className="category-buttons">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-button  ${
              selectedCategory === category ? 'active' : ''
            }`}
            onClick={() => setSelectedCategory(category)}
            data-category={category}
          >
            {getCategoryImage(category)}
          </button>
        ))}
      </div>

      <div className="blocks-container">
        {blocksByCategory[selectedCategory]?.map((block) => (
          <div
            key={block.type}
            className={`block ${block.className}`}
            draggable={!('ontouchstart' in window)}
            onDragStart={(e) => handleDragStart(e, block)}
            {...touchHandlers}
            data-block-id={block.type}
          >
            <BlockIconConfig blockType={block.type} />
            < div className="block-input-container">
            </div>
          </div>
            ))}
          </div>

          </div>
          );
        };

        export default BlocksPanel;