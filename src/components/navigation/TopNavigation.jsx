import React from 'react';
import {Play, Square, Save, Menu, Radio, Trash2} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../../styles/components/TopNavigation.css';
import RoboStop from '../../assets/icons/StopIcon.jsx';
import RoboStart from '../../assets/icons/StartIcon.jsx';
import RoboLogo from '../../assets/icons/robo-sdg-jr-logo.jsx';
import RoboSave from '../../assets/icons/RoboSave.jsx';
import RoboConnect from '../../assets/icons/RoboConnect.jsx';


const TopNavigation = ({
                         droppedBlocks,
                         onClearBlocks,
                         onConnectClick,
                         onDisconnectClick,
                         onStartClick,
                         connected,
                         isExecuting
                       }) => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
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
                disabled={isExecuting || !connected}
            >
                <RoboStart style={{width: '30px', height: '30px'}}/>
                {/*isExecuting ? t('controls.executing') : t('controls.start')*/}
            </button>
            <button className="button button-stop">
                <RoboStop style={{width: '30px', height: '30px'}}/>
                {/*t('controls.stop')*/}
            </button>
        </div>

        <div className="control-buttons">
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
          <Trash2 className="w-4 h-4"/>
          {/*t('controls.clear')*/}
        </button>
      </div>
    </div>
  );
};

export default TopNavigation;
