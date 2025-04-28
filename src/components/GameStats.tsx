import React from 'react';
import TeamStats from './TeamStats';
import GameTimer from './GameTimer';
import { useGameContext } from '../context/GameContext';
import { Timer, Swords, TrendingUp, BadgeInfo, Award } from 'lucide-react';

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
  
  const bluePlayers = allPlayers.filter((player: any) => player.team === 'BLUE');
  const redPlayers = allPlayers.filter((player: any) => player.team === 'RED');
  
  // Get recent events (last 5) with defensive check
  const recentEvents = events && events.Events ? 
    events.Events.slice(-5).reverse() : [];

  return (
    <div className="p-3 bg-gray-900 bg-opacity-50 backdrop-blur-sm rounded-lg text-white max-w-xl border border-gray-700 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-base font-bold bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">RiftDB</h1>
        <div className="flex items-center space-x-1 text-sky-400">
          <Timer size={14} />
          <GameTimer gameTime={gameStats.gameTime} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="col-span-3 md:col-span-1">
          <TeamStats team={blueTeam} color="blue" />
        </div>
        
        <div className="col-span-3 md:col-span-1">
          {/* Recent Events */}
          <div className="w-full">
            <div className="flex items-center mb-1 gap-1">
              <BadgeInfo size={14} className="text-gray-400" />
              <h3 className="text-gray-300 text-xs font-semibold">Recent Events</h3>
            </div>
            <div className="bg-gray-800 bg-opacity-50 rounded-md p-2 max-h-32 overflow-y-auto text-xs border border-gray-700">
              {recentEvents.length > 0 ? (
                <ul className="space-y-1">
                  {recentEvents.slice(0, 4).map((event: any, index: number) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-cyan-400 flex-shrink-0">{event.EventTime.toFixed(0)}s:</span> 
                      <Award size={12} className="text-yellow-400 flex-shrink-0 mt-1" />
                      {event.EventName === 'ChampionKill' ? (
                        <span className="truncate">
                          <span className={isPlayerOnMyTeam(event.KillerName, allPlayers, activePlayer) ? "text-blue-300" : "text-red-300"}>
                            {formatEventEntityName(event.KillerName)}
                          </span>
                          <span className="text-gray-300"> killed </span>
                          <span className={isPlayerOnMyTeam(event.VictimName, allPlayers, activePlayer) ? "text-blue-300" : "text-red-300"}>
                            {formatEventEntityName(event.VictimName)}
                          </span>
                        </span>
                      ) : event.EventName === 'TurretKilled' ? (
                        <span className="truncate">
                          <span className="text-gray-300">TurretKilled - </span>
                          <span className={isPlayerOnMyTeam(event.KillerName, allPlayers, activePlayer) ? "text-blue-300" : "text-red-300"}>
                            {formatEventEntityName(event.KillerName)}
                          </span>
                        </span>
                      ) : event.EventName === 'InhibKilled' ? (
                        <span className="truncate">
                          <span className="text-gray-300">InhibKilled - </span>
                          <span className={isPlayerOnMyTeam(event.KillerName, allPlayers, activePlayer) ? "text-blue-300" : "text-red-300"}>
                            {formatEventEntityName(event.KillerName)}
                          </span>
                        </span>
                      ) : (
                        <span className="truncate text-gray-300">
                          {event.EventName.replace('Champion', '')}
                          {event.KillerName && ` - ${formatEventEntityName(event.KillerName)}`}
                          {event.VictimName && ` ${formatEventEntityName(event.VictimName)}`}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-xs italic flex items-center gap-1">
                  <BadgeInfo size={12} />
                  No recent events
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-span-3 md:col-span-1">
          <TeamStats team={redTeam} color="red" />
        </div>
        
        {/* Gold Difference Indicator */}
        <div className="col-span-3 mt-1">
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
            <span className="text-blue-300 font-mono">{blueTeam.totalGold?.toLocaleString() || 0}</span>
            <span className="text-red-300 font-mono">{redTeam.totalGold?.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStats; 