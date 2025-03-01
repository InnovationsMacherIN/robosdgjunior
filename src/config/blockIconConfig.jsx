// src/config/blockIconConfig.jsx

import React from 'react';
import '../styles/blockIconConfig.css';
import icon_nuoli from "../assets/icons/robo-arrow-ahead.svg";
import icon_nuoli_taakse from "../assets/icons/robo-arrow-backwards.svg";
import icon_arrow_left from "../assets/icons/robo-arrow-left.svg";
import icon_arrow_right from "../assets/icons/robo-arrow-right.svg";
import icon_puoli from "../assets/icons/puoli-pallo.svg";
import icon_rengas_vasen from "../assets/icons/robo-tyre-left.svg";
import icon_rengas_oikea from "../assets/icons/robo-tyre-right.svg";
import icon_start from "../assets/icons/robo-play-category.svg";
import icon_displayoff from "../assets/icons/robo-display-turn-off.svg";
import icon_emoji_love from "../assets/icons/robo-sound-heart.svg";
import icon_dance from "../assets/icons/robo-disco.svg";
import icon_zigzag from "../assets/icons/robo-zigzag.svg";
import icon_shake from "../assets/icons/robo-shake.svg";
import icon_picture from "../assets/icons/robo-emoji-love.svg";
import icon_wait from "../assets/icons/robo-wait.svg";
import icon_repeat from "../assets/icons/robo-repeat-v2.svg";
import icon_stop from "../assets/icons/robo-stop-block.svg";
import icon_pirouette from "../assets/icons/robo-pirouette.svg";

const BlockIconConfig = ({ blockId }) => {

  const getIconSrc = (blockId) => {
    switch (blockId) {
      case 'start':
        return icon_start;
      case 'end':
        return icon_stop;
      case 'melody_1':
        return icon_emoji_love;
      case 'melody_2':
        return icon_emoji_love;
      case 'melody_3':
        return icon_emoji_love;
      case 'melody_4':
        return icon_emoji_love;
      case 'melody_5':
        return icon_emoji_love;
      case 'melody_6':
        return icon_emoji_love;
      case 'melody_7':
        return icon_emoji_love;
      case 'melody_8':
        return icon_emoji_love;
      case 'melody_9':
        return icon_emoji_love;
      case 'melody_10':
        return icon_emoji_love;
      case 'sound_1':
        return icon_emoji_love;
      case 'sound_2':
        return icon_emoji_love;
      case 'sound_3':
        return icon_emoji_love;
      case 'sound_4':
        return icon_emoji_love;
      case 'sound_5':
        return icon_emoji_love;
      case 'sound_6':
        return icon_emoji_love;
      case 'sound_7':
        return icon_emoji_love;
      case 'sound_8':
        return icon_emoji_love;
      case 'sound_9':
        return icon_emoji_love;
      case 'sound_10':
        return icon_emoji_love;
        //return icon_puoli;
      case 'forward':
        return icon_nuoli;
      case 'backward':
        return icon_nuoli_taakse;
      case 'turn-left':
        return icon_rengas_vasen;
      case 'turn-right':
        return icon_rengas_oikea;
      case 'left':
        return icon_arrow_left;
      case 'right':
        return icon_arrow_right;
      case 'leds-off':
        return icon_displayoff;
      case 'dance':
        return icon_dance
      case 'zigzag':
        return icon_zigzag
      case 'shake':
        return icon_shake
      case 'pirouette':
        return icon_pirouette
      case 'show-picture_1':
        return icon_picture
      case 'show-picture_2':
        return icon_picture
      case 'show-picture_3':
        return icon_picture
      case 'show-picture_4':
        return icon_picture
      case 'show-picture_5':
        return icon_picture
      case 'show-picture_6':
        return icon_picture
      case 'show-picture_7':
        return icon_picture
      case 'show-picture_8':
        return icon_picture
      case 'show-picture_9':
        return icon_picture
      case 'show-picture_10':
        return icon_picture
      case 'show-picture_11':
        return icon_picture
      case 'show-picture_12':
        return icon_picture
      case 'show-picture_13':
        return icon_picture
      case 'wait':
        return icon_wait
      case 'repeat':
        return icon_repeat
      // Add more cases for other block IDs
      default:
        return ''; // Default icon or empty string if no icon
    }
  };

  return (
    <div className="block-icon-container">
      <img src={getIconSrc(blockId)} alt="Block Icon" className="block-icon"/>
    </div>
  );
};

export default BlockIconConfig;
