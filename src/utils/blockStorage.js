/**
 * @file blockStorage.js
 * @description This file contains utility functions for managing the storage of programming blocks in the session storage.
 * @module utils/blockStorage
 */
export const STORAGE_KEYS = {
  SESSION_ID: 'r4e_session_id',
  BLOCKS: 'r4e_blocks',
  TEMP_BLOCKS: 'r4e_temp_blocks',
  LAST_SAVE: 'r4e_last_save_time'
};

/**
 * @function getSessionId
 * @description Creates or returns the current session ID.
 * @returns {string} The unique session ID.
 */
export const getSessionId = () => {
  let sessionId = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
  if (!sessionId) {
    sessionId = `r4e_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  }
  return sessionId;
};

/**
 * @function saveBlocks
 * @description Saves the programming blocks to the session.
 * @param {Array} blocks - The blocks to be saved.
 * @returns {boolean} Whether the save was successful.
 */
export const saveBlocks = (blocks) => {
  try {
    const saveData = {
      sessionId: getSessionId(),
      timestamp: Date.now(),
      blocks: blocks
    };
    sessionStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(saveData));
    sessionStorage.setItem(STORAGE_KEYS.LAST_SAVE, Date.now().toString());
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * @function loadBlocks
 * @description Loads the saved blocks from the session.
 * @returns {Array|null} The saved blocks or null if none are found.
 */
export const loadBlocks = () => {
  try {
    const saveData = sessionStorage.getItem(STORAGE_KEYS.BLOCKS);
    if (!saveData) return null;

    const parsedData = JSON.parse(saveData);

    if (parsedData.sessionId !== getSessionId()) {
      return null;
    }

    return parsedData.blocks;
  } catch (error) {
    return null;
  }
};

/**
 * @function saveTempBlocks
 * @description Saves temporary blocks (e.g., for autosave).
 * @param {Array} blocks - The blocks to be saved.
 */
export const saveTempBlocks = (blocks) => {
  try {
    const saveData = {
      sessionId: getSessionId(),
      timestamp: Date.now(),
      blocks: blocks
    };
    sessionStorage.setItem(STORAGE_KEYS.TEMP_BLOCKS, JSON.stringify(saveData));
  } catch (error) {
  }
};

/**
 * @function hasSavedBlocks
 * @description Checks if there are saved blocks in the session.
 * @returns {boolean} True if there are saved blocks.
 */
export const hasSavedBlocks = () => {
  return !!sessionStorage.getItem(STORAGE_KEYS.BLOCKS);
};

/**
 * @function clearSavedBlocks
 * @description Clears all saved blocks from the session.
 */
export const clearSavedBlocks = () => {
  sessionStorage.removeItem(STORAGE_KEYS.BLOCKS);
  sessionStorage.removeItem(STORAGE_KEYS.TEMP_BLOCKS);
  sessionStorage.removeItem(STORAGE_KEYS.LAST_SAVE);
};

/**
 * @function getLastSaveTime
 * @description Returns the timestamp of the last save.
 * @returns {number|null} The timestamp in milliseconds or null if there are no saves.
 */
export const getLastSaveTime = () => {
  const timestamp = sessionStorage.getItem(STORAGE_KEYS.LAST_SAVE);
  return timestamp ? parseInt(timestamp) : null;
};