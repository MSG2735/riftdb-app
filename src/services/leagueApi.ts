// Import Electron's IPC renderer
// We use the window require because we're in a React context
const { ipcRenderer } = window.require('electron');

/**
 * Fetches all game data from the League of Legends client API
 * Uses IPC to communicate with the main process to bypass SSL validation
 */
export const fetchGameData = async () => {
  try {
    return await ipcRenderer.invoke('fetch-league-data', '/allgamedata');
  } catch (error) {
    console.error('Error fetching game data:', error);
    throw error;
  }
};

/**
 * Fetches just the active player data
 */
export const fetchActivePlayerData = async () => {
  try {
    return await ipcRenderer.invoke('fetch-league-data', '/activeplayer');
  } catch (error) {
    console.error('Error fetching active player data:', error);
    throw error;
  }
};

/**
 * Fetches game event data
 */
export const fetchEventData = async () => {
  try {
    return await ipcRenderer.invoke('fetch-league-data', '/eventdata');
  } catch (error) {
    console.error('Error fetching event data:', error);
    throw error;
  }
};

/**
 * Fetches game stats
 */
export const fetchGameStats = async () => {
  try {
    return await ipcRenderer.invoke('fetch-league-data', '/gamestats');
  } catch (error) {
    console.error('Error fetching game stats:', error);
    throw error;
  }
};

/**
 * Check if the game is in progress
 * Returns true if the API is accessible, false otherwise
 */
export const isGameInProgress = async (): Promise<boolean> => {
  try {
    await ipcRenderer.invoke('fetch-league-data', '/gamestats');
    return true;
  } catch (error) {
    return false;
  }
}; 