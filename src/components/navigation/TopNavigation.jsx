/**
 * @file TopNavigation.jsx
 * @description The top navigation bar of the application.
 * @module components/navigation/TopNavigation
 * @param {Object} props - The component props.
 * @param {Array} props.droppedBlocks - The blocks dropped in the programming area.
 * @param {function} props.onClearBlocks - The function to call when the clear blocks button is clicked.
 * @param {function} props.onConnectClick - The function to call when the connect button is clicked.
 * @param {function} props.onDisconnectClick - The function to call when the disconnect button is clicked.
 * @param {function} props.onStartClick - The function to call when the start button is clicked.
 * @param {boolean} props.connected - Whether the application is connected to the robot.
 * @param {boolean} props.isExecuting - Whether the program is executing.
 * @param {boolean} props.isBlocksView - Whether the blocks view is active.
 * @param {function} props.toggleView - The function to call to toggle the view.
 * @param {function} props.onUploadBlocks - The function to call when blocks are uploaded.
 * @returns {React.ReactElement} The top navigation component.
 */
import React, { useState, useEffect } from 'react';
import { Menu,} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../../styles/components/TopNavigation.css';
import RoboStop from '../../assets/icons/StopIcon.jsx';
import RoboStart from '../../assets/icons/StartIcon.jsx';
import RoboLogo from '../../assets/icons/robo-sdg-jr-logo.jsx';
import RoboSave from '../../assets/icons/RoboSave.jsx';
import RoboConnect from '../../assets/icons/RoboConnect.jsx';
import RoboClose from '../../assets/icons/robo-close.jsx';
import RoboCodeView from '../../assets/icons/RoboCodeView.jsx';
import IconSelector from '../../utils/IconSelector.jsx';
import SavePopup from "../../utils/SavePopup.jsx";
import defaultIcon from '../../assets/icons/icon-emoji-gift.svg';

const TopNavigation = ({
                         droppedBlocks,
                         onClearBlocks,
                         onConnectClick,
                         onDisconnectClick,
                         onStartClick,
                         connected,
                         isExecuting,
                         isBlocksView,
                         toggleView,
                         onUploadBlocks,
                       }) => {
  const { t, i18n } = useTranslation();
  const [Icon, setIcon] = useState(defaultIcon);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (connected) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [connected]);

  /**
   * @function changeLanguage
   * @description Changes the language of the application.
   * @param {string} lng - The language to change to.
   */
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  /**
   * @function changeIcon
   * @description Changes the icon of the application.
   * @param {string} newIcon - The new icon to use.
   */
  const changeIcon = (newIcon) => {
    setIcon(newIcon);
  };

  /**
   * @function handleDownload
   * @description Downloads the dropped blocks as a JSON file.
   */
  const handleDownload = () => {
    const dataStr = JSON.stringify(droppedBlocks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blocks.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="top-nav">
      <div className="control-buttons">
        <div className="logo">
          <RoboLogo style={{width: '120px',marginRight: '10px'}}/>
        </div>

        <button
          className={`button button-start ${isExecuting ? 'executing' : ''}`}
          onClick={onStartClick}
        >
          <RoboStart style={{width: '30px', height: '30px'}}/>
        </button>
        <button className="button button-stop">
          <RoboStop style={{width: '30px', height: '30px'}}/>
        </button>
        <button className="button button-code-view" onClick={toggleView}>
          {isBlocksView ? (
            <RoboCodeView style={{width: '30px', height: '30px'}}/>
          ) : (
            <RoboClose style={{width: '26px', height: '50px'}}/>
          )}
        </button>
      </div>

      <div className="control-buttons">
          <div className="button button-profile">
            <IconSelector
              currentIcon={Icon}
              onSelectIcon={changeIcon}
            />
          </div>
        <button className="button button-save" onClick={() => setShowSavePopup(true)}>
          <RoboSave style={{width: '30px', height: '30px'}}/>
        </button>
        <div className="dropdown">
          <button className="button button-menu">
            <Menu size={44}/>
          </button>
          <div className="dropdown-content">
            <div className="language-selector">
              <span>{t('menu.language')}</span>
              <button onClick={() => changeLanguage('de')}>{t('menu.languages.de')}</button>
              <button onClick={() => changeLanguage('en')}>{t('menu.languages.en')}</button>
              <button onClick={() => changeLanguage('fi')}>{t('menu.languages.fi')}</button>
              <button onClick={() => changeLanguage('ja')}>{t('menu.languages.ja')}</button>
            </div>
          </div>
        </div>
        <button
          className={`button button-connect ${connected ? 'connected' : ''} ${isPulsing ? 'pulse' : ''}`}
          onClick={connected ? onDisconnectClick : onConnectClick}
          style={{ backgroundColor: connected ? 'green' : '#993399' }}
        >
          <RoboConnect style={{ width: '30px', height: '30px' }} />
        </button>
        <button
          className="button button-clear"
          onClick={onClearBlocks}
          disabled={droppedBlocks.length === 0}
        >
          <RoboClose style={{width: '26px', height: '50px'}}/>
        </button>
      </div>
      {showSavePopup && (
        <SavePopup
          onClose={() => setShowSavePopup(false)}
          onDownload={handleDownload}
          onUpload={onUploadBlocks}/>
      )}
    </div>
  );
};

export default TopNavigation;