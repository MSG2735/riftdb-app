import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { fetchGameData, fetchEventData, isGameInProgress } from '../services/leagueApi';

// Define the interface for the game state
export interface GameState {
  gameData: any;
  activePlayer: any;
  loading: boolean;
  error: string | null;
  isInGame: boolean;
  lastRefresh: Date | null;
}

// Define the interface for the context value
interface GameContextValue extends GameState {
  refreshGameData: () => Promise<void>;
  setPollingInterval: (intervalMs: number) => void;
}

// Create the context with default values
const GameContext = createContext<GameContextValue | undefined>(undefined);

// Polling interval in milliseconds (default to 1 second)
const DEFAULT_POLLING_INTERVAL = 1000;

// Validate if game data has required structure
const isValidGameData = (data: any): boolean => {
  return (
    data && 
    typeof data === 'object' && 
    data.activePlayer && 
    data.allPlayers && 
    Array.isArray(data.allPlayers) && 
    data.events && 
    data.gameData
  );
};

// Transform the API response to match our expected structure
const transformGameData = (data: any): any => {
  if (!data || !data.allPlayers) {
    return null;
  }

  // Calculate gold for each player if possible
  const enrichedPlayers = data.allPlayers.map((player: any) => {
    // Try to find gold information
    const isActivePlayer = data.activePlayer && data.activePlayer.summonerName === player.summonerName;
    
    // For active player, we might have currentGold
    let totalGold = 0;
    if (isActivePlayer && data.activePlayer.currentGold !== undefined) {
      totalGold = data.activePlayer.currentGold;
    }
    
    // Add item values if available
    if (player.items && Array.isArray(player.items)) {
      // Sum up the price of all items
      const itemsValue = player.items.reduce((sum: number, item: any) => {
        return sum + (item.price || 0);
      }, 0);
      totalGold += itemsValue;
    }
    
    // For active player, add additional stats
    let enhancedPlayer = {
      ...player,
      totalGold,
      gameTime: data.gameData?.gameTime || 0
    };

    // If this is the active player, add champion stats
    if (isActivePlayer && data.activePlayer) {
      enhancedPlayer = {
        ...enhancedPlayer,
        championStats: data.activePlayer.championStats,
        currentGold: data.activePlayer.currentGold,
        level: data.activePlayer.level || enhancedPlayer.level,
      };
    }
    
    return enhancedPlayer;
  });

  // Process events to extract objectives
  const processedEvents = processEvents(data.events);

  return {
    gameStats: data.gameData,
    allPlayers: enrichedPlayers,
    teams: extractTeamsFromPlayers(enrichedPlayers, processedEvents),
    events: data.events,
    activePlayer: data.activePlayer
  };
};

// Process events to extract objective information
const processEvents = (eventsData: any): any => {
  if (!eventsData || !eventsData.Events || !Array.isArray(eventsData.Events)) {
    return {
      blueTeam: { dragons: 0, turrets: 0, dragonTypes: [] as string[] },
      redTeam: { dragons: 0, turrets: 0, dragonTypes: [] as string[] }
    };
  }
  
  const objectives = {
    blueTeam: { dragons: 0, turrets: 0, dragonTypes: [] as string[] },
    redTeam: { dragons: 0, turrets: 0, dragonTypes: [] as string[] }
  };

  // Process each event to extract objective information
  eventsData.Events.forEach((event: any) => {
    // Handle dragon kills
    if (event.EventName === 'DragonKill') {
      // In League API, turret and dragon kills are attributed to a team directly
      // The format is typically "T1" (blue/ORDER) or "T2" (red/CHAOS)
      if (event.KillerName && typeof event.KillerName === 'string') {
        const dragonType = event.DragonType || 'Unknown';
        
        // Check if the killer is from blue team
        if (event.KillerName.includes('T1') || 
            event.KillerName.toLowerCase().includes('blue') || 
            event.KillerName.toLowerCase().includes('order')) {
          objectives.blueTeam.dragons++;
          objectives.blueTeam.dragonTypes.push(dragonType);
        } 
        // Check if the killer is from red team
        else if (event.KillerName.includes('T2') || 
                event.KillerName.toLowerCase().includes('red') || 
                event.KillerName.toLowerCase().includes('chaos')) {
          objectives.redTeam.dragons++;
          objectives.redTeam.dragonTypes.push(dragonType);
        }
      }
    }
    
    // Handle turret kills (look for TurretKilled or BuildingKill events)
    if (event.EventName === 'TurretKilled' || 
        (event.EventName === 'BuildingKill' && event.BuildingType === 'TOWER_BUILDING')) {
      
      // The API often includes information about which team's turret was destroyed
      // For example, "Turret_T1_L_03_A" is a blue team turret
      // "Turret_T2_L_03_A" is a red team turret
      let blueTeamKilledTurret = false;
      let redTeamKilledTurret = false;
      
      // Check turret information if available
      if (event.TurretKilled && typeof event.TurretKilled === 'string') {
        // If a T2 (red) turret was killed, blue team gets credit
        if (event.TurretKilled.includes('T2')) {
          blueTeamKilledTurret = true;
        } 
        // If a T1 (blue) turret was killed, red team gets credit
        else if (event.TurretKilled.includes('T1')) {
          redTeamKilledTurret = true;
        }
      }
      
      // If turret info wasn't helpful, try killer name
      if (!blueTeamKilledTurret && !redTeamKilledTurret && event.KillerName) {
        if (event.KillerName.includes('T1') || 
            event.KillerName.toLowerCase().includes('blue') || 
            event.KillerName.toLowerCase().includes('order')) {
          blueTeamKilledTurret = true;
        } else if (event.KillerName.includes('T2') || 
                  event.KillerName.toLowerCase().includes('red') || 
                  event.KillerName.toLowerCase().includes('chaos')) {
          redTeamKilledTurret = true;
        }
      }
      
      // Update the counts
      if (blueTeamKilledTurret) {
        objectives.blueTeam.turrets++;
      } else if (redTeamKilledTurret) {
        objectives.redTeam.turrets++;
      }
    }
  });
  
  return objectives;
};

// Helper function to extract teams data from players
const extractTeamsFromPlayers = (players: any[], objectives: any): any[] => {
  // Map 'ORDER' team to 'BLUE' and 'CHAOS' team to 'RED'
  const teamMap: any = {
    'ORDER': 'BLUE',
    'CHAOS': 'RED'
  };

  // Get all blue and red players
  const bluePlayers = players.filter(p => teamMap[p.team] === 'BLUE' || p.team === 'BLUE');
  const redPlayers = players.filter(p => teamMap[p.team] === 'RED' || p.team === 'RED');

  // Calculate team gold by summing individual player gold
  const blueTeamGold = bluePlayers.reduce((sum, player) => sum + (player.totalGold || 0), 0);
  const redTeamGold = redPlayers.reduce((sum, player) => sum + (player.totalGold || 0), 0);

  // Calculate team kills
  const blueTeamKills = bluePlayers.reduce((sum, player) => {
    return sum + (player.scores && player.scores.kills ? player.scores.kills : 0);
  }, 0);
  
  const redTeamKills = redPlayers.reduce((sum, player) => {
    return sum + (player.scores && player.scores.kills ? player.scores.kills : 0);
  }, 0);

  // Calculate team deaths
  const blueTeamDeaths = bluePlayers.reduce((sum, player) => {
    return sum + (player.scores && player.scores.deaths ? player.scores.deaths : 0);
  }, 0);
  
  const redTeamDeaths = redPlayers.reduce((sum, player) => {
    return sum + (player.scores && player.scores.deaths ? player.scores.deaths : 0);
  }, 0);

  // Calculate team assists
  const blueTeamAssists = bluePlayers.reduce((sum, player) => {
    return sum + (player.scores && player.scores.assists ? player.scores.assists : 0);
  }, 0);
  
  const redTeamAssists = redPlayers.reduce((sum, player) => {
    return sum + (player.scores && player.scores.assists ? player.scores.assists : 0);
  }, 0);

  // Create team structures based on players
  const blueTeam = {
    teamID: 100,
    team: 'BLUE',
    totalGold: blueTeamGold,
    score: {
      kills: blueTeamKills,
      deaths: blueTeamDeaths,
      assists: blueTeamAssists
    },
    objectives: {
      dragons: objectives.blueTeam.dragons,
      turrets: objectives.blueTeam.turrets,
      dragonTypes: objectives.blueTeam.dragonTypes
    },
    players: bluePlayers
  };
  
  const redTeam = {
    teamID: 200,
    team: 'RED',
    totalGold: redTeamGold,
    score: {
      kills: redTeamKills,
      deaths: redTeamDeaths,
      assists: redTeamAssists
    },
    objectives: {
      dragons: objectives.redTeam.dragons,
      turrets: objectives.redTeam.turrets,
      dragonTypes: objectives.redTeam.dragonTypes
    },
    players: redPlayers
  };
  
  return [blueTeam, redTeam];
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({
    gameData: null,
    activePlayer: null,
    loading: true,
    error: null,
    isInGame: false,
    lastRefresh: null
  });
  
  const [pollingInterval, setPollingIntervalState] = useState<number>(DEFAULT_POLLING_INTERVAL);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Function to refresh game data
  const refreshGameData = async (): Promise<void> => {
    try {
      // First check if game is in progress to avoid API errors
      const gameInProgress = await isGameInProgress();
      
      if (!gameInProgress) {
        setGameState({
          gameData: null,
          activePlayer: null,
          loading: false,
          error: "No active game detected",
          isInGame: false,
          lastRefresh: new Date()
        });
        return;
      }
      
      // Fetch all game data at once
      const allGameData = await fetchGameData();
      
      // Validate the response to ensure it has required data
      if (!isValidGameData(allGameData)) {
        setGameState(prev => ({
          ...prev,
          loading: false,
          error: "Invalid game data format",
          isInGame: gameInProgress,
          lastRefresh: new Date()
        }));
        return;
      }
      
      // Transform the raw API data into our application structure
      const transformedData = transformGameData(allGameData);
      
      setGameState({
        gameData: transformedData,
        activePlayer: allGameData.activePlayer,
        loading: false,
        error: null,
        isInGame: true,
        lastRefresh: new Date()
      });
    } catch (error: any) {
      console.error('Error refreshing game data:', error);
      setGameState(prev => ({
        ...prev,
        loading: false,
        error: error.message || "Error connecting to League client",
        isInGame: false,
        lastRefresh: new Date()
      }));
    }
  };

  // Function to change polling interval
  const setPollingInterval = (intervalMs: number): void => {
    setPollingIntervalState(intervalMs);
    
    // Clear existing interval if any
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    // Start new polling with updated interval
    const newIntervalId = setInterval(refreshGameData, intervalMs);
    setIntervalId(newIntervalId);
  };

  // Set up initial polling
  useEffect(() => {
    // Initial fetch
    refreshGameData();
    
    // Set up polling interval
    const id = setInterval(refreshGameData, pollingInterval);
    setIntervalId(id);
    
    // Cleanup on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  // Context value
  const contextValue: GameContextValue = {
    gameData: gameState.gameData,
    activePlayer: gameState.activePlayer,
    loading: gameState.loading,
    error: gameState.error,
    isInGame: gameState.isInGame,
    lastRefresh: gameState.lastRefresh,
    refreshGameData,
    setPollingInterval
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook for using the game context
export const useGameContext = (): GameContextValue => {
  const context = useContext(GameContext);
  
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  
  return context;
}; 