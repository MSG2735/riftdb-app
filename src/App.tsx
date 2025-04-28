import React, { useEffect } from 'react';
import GameStats from './components/GameStats';
import { useGameContext } from './context/GameContext';

// Import the electron IPC renderer
const { ipcRenderer } = window.require('electron');

const App: React.FC = () => {
  const { gameData, loading, error, isInGame } = useGameContext();
  
  // Set up Tab key detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        // Prevent the default Tab behavior
        e.preventDefault();
        // Send message to main process
        ipcRenderer.send('tab-key-down');
        console.log('Tab key down in renderer');
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        // Send message to main process
        ipcRenderer.send('tab-key-up');
        console.log('Tab key up in renderer');
      }
    };

    // Handle window focus/blur events which might affect key state
    const handleWindowBlur = () => {
      // When window loses focus, treat as if tab key was released
      ipcRenderer.send('tab-key-up');
      console.log('Window blur - treating as tab key up');
    };
    
    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  if (loading && !gameData) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-xs">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !isInGame || !gameData) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent text-white">
        <div className="text-center p-3 rounded-lg bg-gray-800 bg-opacity-80 text-xs border border-gray-700">
          <p className="text-red-400 mb-1">{error || 'No game detected'}</p>
          <p className="text-xs">Start League of Legends game</p>
          <p className="text-xs mt-2 text-gray-400">The overlay will appear automatically</p>
        </div>
      </div>
    );
  }

  // Check if gameData has the required structure before rendering GameStats
  if (!gameData.gameStats || !gameData.allPlayers || !gameData.teams) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent text-white">
        <div className="text-center p-3 rounded-lg bg-gray-800 bg-opacity-80 text-xs border border-gray-700">
          <p className="text-yellow-400 mb-1">Waiting for data...</p>
          <p className="text-xs">Game data loading...</p>
          <div className="animate-pulse mt-2 h-2 w-24 bg-blue-500 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-transparent overflow-hidden flex items-start justify-end">
      <div className="mt-2 mr-2 max-h-[calc(100vh-20px)] overflow-y-auto">
        <GameStats gameData={gameData} />
      </div>
    </div>
  );
};

export default App; 