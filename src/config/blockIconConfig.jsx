/**
 * @file blockIconConfig.jsx
 * @description A component that displays an icon for a block based on the block type.
 * @module config/blockIconConfig
 * @param {Object} props - The component props.
 * @param {string} props.blockType - The type of the block.
 * @returns {React.ReactElement} The BlockIconConfig component.
 */
import React from 'react';
import '../styles/blockIconConfig.css';
import icon_nuoli from "../assets/icons/robo-arrow-ahead.svg";
import icon_nuoli_taakse from "../assets/icons/robo-arrow-backwards.svg";
import icon_arrow_left from "../assets/icons/robo-arrow-left.svg";
import icon_arrow_right from "../assets/icons/robo-arrow-right.svg";
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
import icon_happy from "../assets/icons/icon-emoji-happy.svg";
import icon_sad from "../assets/icons/icon-emoji-sad.svg";
import icon_clap from "../assets/icons/icon-emoji-clap.svg";
import icon_mushroom from "../assets/icons/icon-emoji-mushroom.svg";
import icon_saber from "../assets/icons/icon-emoji-saber.svg";
import icon_laugh from "../assets/icons/icon-emoji-laugh.svg";
import icon_rainbow from "../assets/icons/icon-emoji-rainbow.svg";
import icon_magic from "../assets/icons/icon-emoji-magic.svg";
import icon_gift from "../assets/icons/icon-emoji-gift.svg";
import icon_richtig from "../assets/icons/icon-emoji-checkmark.svg";
import icon_falsch from "../assets/icons/icon-emoji-stop.svg";
import icon_wink from "../assets/icons/icon-emoji-wink.svg";
import icon_links from "../assets/icons/icon-emoji-left.svg";
import icon_rechts from "../assets/icons/icon-emoji-right.svg";


const BlockIconConfig = ({ blockType }) => {

  /**
   * @function getIconSrc
   * @description Returns the source of the icon for a given block type.
   * @param {string} blockType - The type of the block.
   * @returns {string} The source of the icon.
   */
  const getIconSrc = (blockType) => {
    switch (blockType) {
      case 'start':
        return icon_start;
      case 'end':
        return icon_stop;
      case 'melody_1':
        return icon_clap;
      case 'melody_2':
        return icon_emoji_love;
      case 'melody_3':
        return icon_saber;
      case 'melody_4':
        return icon_mushroom;
      case 'melody_5':
        return icon_emoji_love;
      case 'melody_6':
        return icon_emoji_love;
      case 'melody_7':
        return icon_laugh;
      case 'melody_8':
        return icon_rainbow;
      case 'melody_9':
        return icon_magic;
      case 'melody_10':
        return icon_gift;
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
        return icon_laugh
      case 'show-picture_2':
        return icon_emoji_love
      case 'show-picture_3':
        return icon_picture
      case 'show-picture_4':
        return icon_sad
      case 'show-picture_5':
        return icon_picture
      case 'show-picture_6':
        return icon_picture
      case 'show-picture_7':
        return icon_picture
      case 'show-picture_8':
        return icon_richtig
      case 'show-picture_9':
        return icon_falsch
      case 'show-picture_10':
        return icon_wink
      case 'show-picture_11':
        return icon_picture
      case 'show-picture_12':
        return icon_links
      case 'show-picture_13':
        return icon_rechts
      case 'wait':
        return icon_wait
      case 'repeat':
        return icon_repeat
      default:
        return '';
    }
  };

  return (
    <div className="block-icon-container">
      <img src={getIconSrc(blockType)} alt="Block Icon" className="block-icon"/>
    </div>
  );
};

export default BlockIconConfig;