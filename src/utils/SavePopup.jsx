/**
 * @file SavePopup.jsx
 * @description A component that provides a popup for saving and loading block data.
 * @module utils/SavePopup
 * @param {Object} props - The component props.
 * @param {function} props.onClose - A function to close the popup.
 * @param {function} props.onDownload - A function to download the block data.
 * @param {function} props.onUpload - A function to upload block data.
 * @returns {React.ReactElement} The SavePopup component.
 */
import React from 'react';
import { createPortal } from 'react-dom';
import '../styles/SavePopup.css';
import RoboClose from '../assets/icons/robo-close.jsx';

const SavePopup = ({ onClose, onDownload, onUpload }) => {
  /**
   * @function handleFileChange
   * @description Handles the file change event for the file input.
   * @param {Event} event - The file change event.
   */
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        onUpload(data);
      };
      reader.readAsText(file);
    }
  };

  return createPortal(
    <div className="save-popup-container">
      <div className="popup-overlay" onClick={onClose} />
      <div className="save-popup">
        <button className="close-button" onClick={onClose}>
          <RoboClose style={{ width: '26px', height: '26px', color: 'white' }} />
        </button>
        <div className="save-popup-content">
          <button className="save-popup-button" onClick={onDownload}>Download</button>
          <input type="file" accept=".json" onChange={handleFileChange} />
          <button className="save-popup-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SavePopup;