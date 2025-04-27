import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { fetchGameData, fetchEventData } from '../services/leagueApi';

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
    
    return {
      ...player,
      totalGold,
      gameTime: data.gameData?.gameTime || 0
    };
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

  // Create team structures based on players
  const blueTeam = {
    teamID: 100,
    team: 'BLUE',
    totalGold: blueTeamGold,
    score: {
      kills: blueTeamKills
    },
    objectives: {
      dragon: { 
        kills: objectives.blueTeam.dragons,
        types: objectives.blueTeam.dragonTypes || []
      },
      baron: { kills: 0 },
      turret: { kills: objectives.blueTeam.turrets },
      inhibitor: { kills: 0 }
    }
  };

  const redTeam = {
    teamID: 200,
    team: 'RED',
    totalGold: redTeamGold,
    score: {
      kills: redTeamKills
    },
    objectives: {
      dragon: { 
        kills: objectives.redTeam.dragons,
        types: objectives.redTeam.dragonTypes || []
      },
      baron: { kills: 0 },
      turret: { kills: objectives.redTeam.turrets },
      inhibitor: { kills: 0 }
    }
  };

  return [blueTeam, redTeam];
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for game data
  const [gameData, setGameData] = useState<any>(null);
  const [activePlayer, setActivePlayer] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInGame, setIsInGame] = useState<boolean>(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [pollingInterval, setPollingIntervalState] = useState<number>(DEFAULT_POLLING_INTERVAL);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Function to fetch game data
  const refreshGameData = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await fetchGameData();
      
      // Validate the data has the expected structure
      if (isValidGameData(data)) {
        // If the event data seems incomplete, try to fetch it directly
        if (!data.events || !data.events.Events || data.events.Events.length === 0) {
          try {
            const eventData = await fetchEventData();
            if (eventData && eventData.Events) {
              data.events = eventData;
            }
          } catch (eventError) {
            // Continue with the original data even if event fetching failed
          }
        }
        
        // Transform data to match expected format before setting it
        const transformedData = transformGameData(data);
        setGameData(transformedData);
        
        // Extract active player data if available
        if (data.activePlayer) {
          setActivePlayer(data.activePlayer);
        }
        
        setIsInGame(true);
        setError(null);
      } else {
        setError('Received invalid data from League client');
        setGameData(null);
        setActivePlayer(null);
        setIsInGame(false);
      }
      
      setLastRefresh(new Date());
    } catch (err) {
      setError('Unable to connect to League of Legends client');
      setGameData(null);
      setActivePlayer(null);
      setIsInGame(false);
    } finally {
      setLoading(false);
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
    gameData,
    activePlayer,
    loading,
    error,
    isInGame,
    lastRefresh,
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