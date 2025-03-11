import React, { useState } from 'react';
import { Square, Menu, Circle, Bird, Egg, Laugh } from 'lucide-react';
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

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const changeIcon = (newIcon) => {
    setIcon(newIcon);
  };

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
          className={`button button-connect ${connected ? 'connected' : ''}`}
          onClick={connected ? onDisconnectClick : onConnectClick}
        >
          <RoboConnect style={{width: '30px', height: '30px'}}/>
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
