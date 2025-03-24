/**
 * BlocksPanel Component
 *
 * Displays available programming blocks organized by categories.
 * Allows users to select categories and drag blocks to programming area.
 * Manages block input configurations and provides visual feedback.
 *
 * @component
 * @param {Object} props
 * @param {string[]} props.categories - List of available block categories
 * @param {string} props.selectedCategory - Currently selected category
 * @param {function} props.setSelectedCategory - Handler to update selected category
 * @param {Object} props.blocksByCategory - Mapping of blocks organized by category
 * @param {function} props.handleDragStart - Handler for block drag start events
 * @param {function} props.handleDrop - Handler for block drop
 *
 * @returns {React.ReactElement} Panel containing categorized programming blocks
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

  /**
   * useTouchDrag -hook
   *
   * Custom hook for handling touch-based drag events
   *
   * onDragStart: Callback function for drag start events
   * onDragMove: Callback function for drag move events
   * onDragEnd: Callback function for drag end events
   *
   * @returns {Object} touchHandlers - Event handlers for touch-based drag events
   */
  const { handlers: touchHandlers, isDragging, dragState } = useTouchDrag({
      createClone: true,
      onDragStart: (dragData) => {
        const blockElement = dragData.target;
        if (!blockElement) return;

        // Create visual clone
        const clone = blockElement.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.zIndex = 1000;
        clone.style.opacity = '0.8';
        clone.style.pointerEvents = 'none';
        clone.classList.add('block-dragging');
        document.body.appendChild(clone);

        // Store clone and block data
        dragState.current.clone = clone;
        dragState.current.blockData = blocks[selectedCategory].find(
          b => b.type === blockElement.dataset.blockId
        );

        // Position clone at touch point
        clone.style.left = `${dragData.startX - clone.offsetWidth / 2}px`;
        clone.style.top = `${dragData.startY - clone.offsetHeight / 2}px`;
      },

      onDragMove: (moveData) => {
          if (!isDragging || !dragState.current.clone) return;

          // 1) Figure out the element under the finger
          const dropTarget = document.elementFromPoint(moveData.x, moveData.y);
          if (!dropTarget) return;

          // 2) Check if we’re over a .block
          const blockElement = dropTarget.closest('.block');
          if (blockElement) {
              // Use data-index from your existing block rendering
              const rect = blockElement.getBoundingClientRect();
              const relativeY = moveData.y - rect.top;
              const height = rect.height;

              // "before" if top half, "after" if bottom half
              const position = relativeY < height / 2 ? 'before' : 'after';

              // The block’s own index is stored in data-index
              const index = parseInt(blockElement.dataset.index, 10) || 0;
              const toIndex = (position === 'before') ? index : index + 1;

              // 3) Update insertion position
              if (onDragOverPosition) {
                  onDragOverPosition(toIndex);
              }

              // (Optional) Show highlight or “drop indicator” if you want
              // – you can do the same "shift-right" effect or drop-target effect:
              // remove old highlights, highlight blockElement, etc.
              // Example:
              document.querySelectorAll('.block.drop-target').forEach(el => {
                  el.classList.remove('drop-target');
              });
              blockElement.classList.add('drop-target');

          } else {
              // 4) If not over a .block, check if we’re still over the main .programming-area
              const programmingArea = dropTarget.closest('.programming-area');
              if (programmingArea) {
                  // e.g. put it at the end:
                  if (onDragOverPosition) {
                      onDragOverPosition(null);
                  }
                  // you can also remove highlights if needed
                  document.querySelectorAll('.block.drop-target').forEach(el => {
                      el.classList.remove('drop-target');
                  });
              }
          }
      },

      onDragEnd: (e, endData) => {
        console.log('onDragEnd endData', e,  endData);

        handleDrop(e, endData);


        // Clean up
        document.querySelectorAll('.drag-over').forEach(el => {
          el.classList.remove('drag-over');
        });
      }
    });

  /**
   * getCategoryImage -function
   *
   * Returns an image element based on the category name
   *
   * @param category
   * @returns {*}
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
          return ''; // Default icon or empty string if no icon
      }
    }

    return (
      <div>
        <img src={getIconSrc(category)} alt="Category Image" className="category-image"/>
      </div>
    );
  };

  /**
   * BlocksPanel -component
   *
   * CSS Class Names
   * blocks-container: Container for block elements
   * block-input-container: Container for block input elements
   * block-input-number: Number input styling
   * block-input-range: Range slider styling
   * block-input-select: Dropdown select styling
   * block-input-text: Text input styling
   * input-group: Container for input and label
   * range-container: Container for range input and value display
   * range-value: Display for current range value
   */
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
            {/*renderInput(block)*/}
            </div>
          </div>
            ))}
          </div>

          </div>
          );
        };

        export default BlocksPanel;
