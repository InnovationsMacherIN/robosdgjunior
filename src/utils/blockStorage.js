// src/utils/blockStorage.js

/**
 * Vakiot tallennusavaimille
 * Keskitetty paikka kaikille sovelluksen käyttämille tallennusavaimille
 */
export const STORAGE_KEYS = {
  SESSION_ID: 'r4e_session_id',
  BLOCKS: 'r4e_blocks',
  TEMP_BLOCKS: 'r4e_temp_blocks',
  LAST_SAVE: 'r4e_last_save_time'
};

/**
 * Luo tai palauttaa nykyisen session ID:n
 * @returns {string} Uniikki session ID
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
 * Tallentaa ohjelmointilohkot sessioon
 * @param {Array} blocks Tallennettavat lohkot
 * @returns {boolean} Onnistuiko tallennus
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
    console.error('Virhe lohkojen tallennuksessa:', error);
    return false;
  }
};

/**
 * Lataa tallennetut lohkot sessiosta
 * @returns {Array|null} Tallennetut lohkot tai null jos ei löydy
 */
export const loadBlocks = () => {
  try {
    const saveData = sessionStorage.getItem(STORAGE_KEYS.BLOCKS);
    if (!saveData) return null;

    const parsedData = JSON.parse(saveData);

    // Tarkistetaan että data on samasta sessiosta
    if (parsedData.sessionId !== getSessionId()) {
      console.warn('Ladattu data on eri sessiosta');
      return null;
    }

    return parsedData.blocks;
  } catch (error) {
    console.error('Virhe lohkojen latauksessa:', error);
    return null;
  }
};

/**
 * Tallentaa väliaikaiset lohkot (esim. automaattitallennus)
 * @param {Array} blocks Tallennettavat lohkot
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
    console.error('Virhe väliaikaisten lohkojen tallennuksessa:', error);
  }
};

/**
 * Tarkistaa onko sessiossa tallennettuja lohkoja
 * @returns {boolean} true jos löytyy tallennettuja lohkoja
 */
export const hasSavedBlocks = () => {
  return !!sessionStorage.getItem(STORAGE_KEYS.BLOCKS);
};

/**
 * Tyhjentää kaikki tallennetut lohkot sessiosta
 */
export const clearSavedBlocks = () => {
  sessionStorage.removeItem(STORAGE_KEYS.BLOCKS);
  sessionStorage.removeItem(STORAGE_KEYS.TEMP_BLOCKS);
  sessionStorage.removeItem(STORAGE_KEYS.LAST_SAVE);
};

/**
 * Palauttaa viimeisimmän tallennuksen aikaleiman
 * @returns {number|null} Aikaleima millisekunteina tai null jos ei tallennuksia
 */
export const getLastSaveTime = () => {
  const timestamp = sessionStorage.getItem(STORAGE_KEYS.LAST_SAVE);
  return timestamp ? parseInt(timestamp) : null;
};
