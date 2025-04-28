import React, { useState } from 'react';
import GameTimer from './GameTimer';
import TeamStats from './TeamStats';
import EventTimeline from './EventTimeline';
import { useGameContext } from '../context/GameContext';
import { Timer, TrendingUp } from 'lucide-react';

interface GameStatsProps {
  gameData: any;
}

// Helper function to format entity names in events
const formatEventEntityName = (name: string): string => {
  if (!name) return '';
  
  // Shorten turret names
  if (name.startsWith('Turret') || name.toLowerCase().includes('turret')) {
    return 'Turret';
  }

  // Shorten inhib names
  if (name.startsWith('Inhib') || name.toLowerCase().includes('inhib')) {
    return 'Inhib';
  }
  
  // Shorten minion names
  if (name.startsWith('Minion') || name.toLowerCase().includes('minion')) {
    return 'Minion';
  }
  
  return name;
};

// Helper function to determine if a name is for a player on the user's team
const isPlayerOnMyTeam = (name: string, allPlayers: any[], activePlayer: any): boolean => {
  // Check if it's a bot - bots are never on the player's team
  if (name.toLowerCase().includes('bot')) {
    return false;
  }
  
  // Get the active player's team
  let myTeam = 'BLUE'; // Default to blue if we can't determine
  
  if (activePlayer && activePlayer.team) {
    myTeam = activePlayer.team;
  } else {
    // If we don't have active player data, use the first 5 players as the player's team
    // This assumes the first 5 players in the array are on the player's team
    const firstPlayer = allPlayers && allPlayers.length > 0 ? allPlayers[0] : null;
    if (firstPlayer && firstPlayer.team) {
      myTeam = firstPlayer.team;
    }
  }
  
  // Check if the name appears in the players list for my team
  const teamPlayers = allPlayers.filter(player => player.team === myTeam);
  
  // Relaxed matching - check if any part of the player name matches
  return teamPlayers.some(player => 
    player.summonerName && 
    (player.summonerName === name || 
     name.includes(player.summonerName) || 
     player.summonerName.includes(name))
  );
};

const GameStats: React.FC<GameStatsProps> = ({ gameData }) => {
  const { activePlayer } = useGameContext();
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  
  // Add defensive checks to ensure all required data is available
  if (!gameData || !gameData.gameStats || !gameData.allPlayers || !gameData.teams) {
    return (
      <div className="p-4 bg-gray-900 bg-opacity-80 rounded-lg text-white">
        <h2 className="text-center text-lg font-bold text-yellow-400">Loading game data...</h2>
      </div>
    );
  }
  
  const { gameStats, allPlayers, teams, events } = gameData;
  
  const blueTeam = teams.find((team: any) => team.teamID === 100);
  const redTeam = teams.find((team: any) => team.teamID === 200);
  
  // Add defensive checks in case teams aren't found
  if (!blueTeam || !redTeam) {
    return (
      <div className="p-4 bg-gray-900 bg-opacity-80 rounded-lg text-white">
        <h2 className="text-center text-lg font-bold text-red-400">Error: Team data not available</h2>
      </div>
    );
  }
  
  // Get active player information
  const activePlayerData = allPlayers.find((player: any) => 
    activePlayer && player.summonerName === activePlayer.summonerName
  );
  
  // Find the active player or the first player on blue team if active player isn't found
  const defaultSelectedPlayer = activePlayerData || allPlayers[0];
  
  // If no player is selected, set the default
  if (!selectedPlayer && defaultSelectedPlayer) {
    setSelectedPlayer(defaultSelectedPlayer);
  }

  return (
    <div className="p-3 bg-gray-900 bg-opacity-70 backdrop-blur-sm rounded-lg text-white max-w-xl border border-gray-700 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-base font-bold bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">RiftDB</h1>
        <div className="flex items-center space-x-1 text-sky-400">
          <Timer size={14} />
          <GameTimer gameTime={gameStats.gameTime} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {/* Top Section: Teams and Gold Difference */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="col-span-3 md:col-span-1">
            <TeamStats team={blueTeam} color="blue" />
          </div>
          
          <div className="col-span-3 md:col-span-1">
            <EventTimeline events={events} allPlayers={allPlayers} activePlayer={activePlayer} />
          </div>
          
          <div className="col-span-3 md:col-span-1">
            <TeamStats team={redTeam} color="red" />
          </div>
        </div>
        
        {/* Gold Difference Indicator */}
        <div>
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp size={14} className="text-yellow-400" />
            <h3 className="text-gray-300 text-xs font-semibold">Gold Difference</h3>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            {blueTeam.totalGold && redTeam.totalGold ? (
              <div 
                className={`h-full ${blueTeam.totalGold >= redTeam.totalGold ? 'bg-gradient-to-r from-blue-600 to-blue-400' : 'bg-gradient-to-l from-red-600 to-red-400'}`}
                style={{ 
                  width: `${Math.abs((blueTeam.totalGold / (blueTeam.totalGold + redTeam.totalGold) - 0.5) * 200)}%`,
                  marginLeft: blueTeam.totalGold >= redTeam.totalGold ? '50%' : 'auto',
                  marginRight: blueTeam.totalGold < redTeam.totalGold ? '50%' : 'auto',
                  transform: blueTeam.totalGold >= redTeam.totalGold ? 'translateX(-100%)' : 'none'
                }}
              />
            ) : (
              <div className="h-full bg-gray-700 w-1/2" />
            )}
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-blue-300 font-mono">{Math.round(blueTeam.totalGold || 0).toLocaleString()}</span>
            <span className="text-red-300 font-mono">{Math.round(redTeam.totalGold || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStats; 