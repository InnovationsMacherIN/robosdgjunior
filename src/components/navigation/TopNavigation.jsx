import React, {useState} from 'react';
import {Square, Menu, Circle, Bird, Egg, Laugh} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../../styles/components/TopNavigation.css';
import RoboStop from '../../assets/icons/StopIcon.jsx';
import RoboStart from '../../assets/icons/StartIcon.jsx';
import RoboLogo from '../../assets/icons/robo-sdg-jr-logo.jsx';
import RoboSave from '../../assets/icons/RoboSave.jsx';
import RoboConnect from '../../assets/icons/RoboConnect.jsx';
import RoboClose from '../../assets/icons/robo-close.jsx';


const TopNavigation = ({
                         droppedBlocks,
                         onClearBlocks,
                         onConnectClick,
                         onDisconnectClick,
                         onStartClick,
                         connected,
                         isExecuting,
                         isBlocksView,
                         toggleView
                       }) => {
  const { t, i18n } = useTranslation();
  const [Icon, setIcon] = useState(Bird);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const changeIcon = (newIcon) => {
    setIcon(newIcon);
  }

  return (
    <div className="top-nav">

        <div className="control-buttons">
            <div className="logo">
                <RoboLogo style={{width: '120px',marginRight: '10px'}}/>
            </div>

            <button
                className={`button button-start ${isExecuting ? 'executing' : ''}`}
                onClick={onStartClick}
                disabled={isExecuting || !connected}
            >
                <RoboStart style={{width: '30px', height: '30px'}}/>
                {/*isExecuting ? t('controls.executing') : t('controls.start')*/}
            </button>
            <button className="button button-stop">
                <RoboStop style={{width: '30px', height: '30px'}}/>
                {/*t('controls.stop')*/}
            </button>
            <button className="button button-code-view" onClick={toggleView}>
              {isBlocksView ? (
                <Square style={{ width: '30px', height: '30px' }} />
              ) : (
                <Circle style={{ width: '30px', height: '30px' }} />
              )}
              {/*t('controls.code')*/}
            </button>
        </div>

        <div className="control-buttons">
          <div className="dropdown">
            <button className="button button-profile">
              <Icon style={{width: '40px', height: '40px', color:'white'}}/>
              {/*t('controls.menu')*/}
            </button>
            <div className="dropdown-content">
              <div className="language-selector">
                <span>{t('controls.icon')}</span>
                <button onClick={() => changeIcon(Bird)}><Bird/></button>
                <button onClick={() => changeIcon(Egg)}><Egg/></button>
                <button onClick={() => changeIcon(Laugh)}><Laugh/></button>
              </div>
            </div>
          </div>
        <button className="button button-save">
          <RoboSave style={{width: '30px', height: '30px'}}/>
          {/*t('controls.save')*/}
        </button>
        <div className="dropdown">
          <button className="button button-menu">
            <Menu size={44}/>
            {/*t('controls.menu')*/}
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
          {/*connected ? t('controls.disconnect') : t('controls.connect')*/}
        </button>
        <button
          className="button button-clear"
          onClick={onClearBlocks}
          disabled={droppedBlocks.length === 0}
        >
            <RoboClose style={{width: '26px', height: '50px'}}/>
          {/*t('controls.clear')*/}
        </button>
      </div>
    </div>
  );
};

export default TopNavigation;
