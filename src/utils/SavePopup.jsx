import React from 'react';
import { createPortal } from 'react-dom';
import '../styles/SavePopup.css';
import RoboClose from '../assets/icons/robo-close.jsx';

const SavePopup = ({ onClose, onDownload, onUpload }) => {
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
