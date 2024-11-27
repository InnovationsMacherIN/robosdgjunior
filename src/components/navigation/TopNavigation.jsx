import React from 'react';
import { Play, Square, Save, Menu, Radio } from 'lucide-react';
import '../../styles/components/TopNavigation.css';

const TopNavigation = ({
                         onConnectClick,
                         onDisconnectClick,
                         onStartClick,
                         connected,
                         isExecuting
                       }) => {
  return (
    <div className="top-nav">
      <div className="control-buttons">
        <button
          className={`button button-start ${isExecuting ? 'executing' : ''}`}
          onClick={onStartClick}
          disabled={isExecuting || !connected}
        >
          <Play size={24} />
          {isExecuting ? 'Suoritetaan...' : 'Suorita ohjelma'}
        </button>
        <button className="button button-stop">
          <Square size={24} />
          Pysäytä
        </button>
      </div>

      <div className="control-buttons">
        <button className="button button-save">
          <Save size={24} />
          Tallenna ohjelma
        </button>
        <button className="button button-menu">
          <Menu size={24} />
          Valikko
        </button>
        <button
          className={`button button-connect ${connected ? 'connected' : ''}`}
          onClick={connected ? onDisconnectClick : onConnectClick}
        >
          <Radio size={24}/>
          {connected ? 'Katkaise yhteys' : 'Yhdistä'}
        </button>
      </div>
    </div>
  );
};

export default TopNavigation;
