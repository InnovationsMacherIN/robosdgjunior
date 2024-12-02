import React from 'react';
import { Play, Square, Save, Menu, Radio } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../../styles/components/TopNavigation.css';

const TopNavigation = ({
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
        <button
          className={`button button-start ${isExecuting ? 'executing' : ''}`}
          onClick={onStartClick}
          disabled={isExecuting || !connected}
        >
          <Play size={24} />
          {isExecuting ? t('controls.executing') : t('controls.start')}
        </button>
        <button className="button button-stop">
          <Square size={24} />
          {t('controls.stop')}
        </button>
      </div>

      <div className="control-buttons">
        <button className="button button-save">
          <Save size={24} />
          {t('controls.save')}
        </button>
        <div className="dropdown">
          <button className="button button-menu">
            <Menu size={24} />
            {t('controls.menu')}
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
          <Radio size={24}/>
          {connected ? t('controls.disconnect') : t('controls.connect')}
        </button>
      </div>
    </div>
  );
};

export default TopNavigation;
