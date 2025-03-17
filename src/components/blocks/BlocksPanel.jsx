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
          b => b.id === blockElement.dataset.blockId
        );

        // Position clone at touch point
        clone.style.left = `${dragData.startX - clone.offsetWidth / 2}px`;
        clone.style.top = `${dragData.startY - clone.offsetHeight / 2}px`;
      },

      onDragMove: (moveData) => {
        if (!isDragging || !dragState.current.clone) return;

        const dropTarget = document.elementFromPoint(moveData.x, moveData.y);
        const programmingArea = dropTarget?.closest('.programming-area');

        // Remove previous highlights
        document.querySelectorAll('.drag-over').forEach(el => {
          el.classList.remove('drag-over');
        });

        // Add highlight to current drop target
        if (programmingArea) {
          programmingArea.classList.add('drag-over');
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
            key={block.id}
            className={`block ${block.className}`}
            draggable={!('ontouchstart' in window)}
            onDragStart={(e) => handleDragStart(e, block)}
            {...touchHandlers}
            data-block-id={block.id}
          >
            <BlockIconConfig blockId={block.id} />
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
