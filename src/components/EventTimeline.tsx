import React from 'react';
import { Clock, Trophy, Skull, Flag, Target, Mountain } from 'lucide-react';

interface EventTimelineProps {
  events: any;
  allPlayers: any[];
  activePlayer: any;
}

// Helper function to format time
const formatGameTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

// Helper function to determine if a name is for a player on the user's team
const isPlayerOnMyTeam = (name: string, allPlayers: any[], activePlayer: any): boolean => {
  if (!name || !allPlayers || !activePlayer) return false;
  
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

// Get appropriate icon for event type
const getEventIcon = (eventName: string) => {
  switch(eventName) {
    case 'ChampionKill':
      return <Skull size={14} className="text-red-500" />;
    case 'DragonKill':
      return <Mountain size={14} className="text-purple-500" />;
    case 'HeraldKill':
      return <Flag size={14} className="text-pink-500" />;
    case 'BaronKill':
      return <Target size={14} className="text-yellow-500" />;
    case 'TurretKilled':
      return <Trophy size={14} className="text-blue-500" />;
    case 'FirstBlood':
      return <Skull size={14} className="text-red-600 animate-pulse" />;
    default:
      return <Clock size={14} className="text-gray-400" />;
  }
};

const EventTimeline: React.FC<EventTimelineProps> = ({ events, allPlayers, activePlayer }) => {
  if (!events || !events.Events || !Array.isArray(events.Events) || events.Events.length === 0) {
    return (
      <div className="bg-gray-800 bg-opacity-90 rounded-lg p-3 text-white">
        <h3 className="text-sm font-bold text-purple-400 mb-2 flex items-center">
          <Clock size={14} className="mr-1" />
          Event Timeline
        </h3>
        <div className="text-xs text-gray-400 italic">No events recorded yet</div>
      </div>
    );
  }
  
  // Get the most significant events
  const significantEvents = events.Events.filter((event: any) => {
    return ['ChampionKill', 'DragonKill', 'HeraldKill', 'BaronKill', 'TurretKilled', 'FirstBlood', 'InhibKilled'].includes(event.EventName);
  }).slice(-12).reverse(); // Get the last 12 significant events, most recent first
  
  return (
    <div className="bg-gray-800 bg-opacity-90 rounded-lg p-3 text-white">
      <h3 className="text-sm font-bold text-purple-400 mb-2 flex items-center">
        <Clock size={14} className="mr-1" />
        Event Timeline
      </h3>
      
      <div className="max-h-40 overflow-y-auto pr-1">
        {significantEvents.length > 0 ? (
          <div className="space-y-2">
            {significantEvents.map((event: any, index: number) => (
              <div key={index} className="flex items-start text-xs">
                <div className="flex-shrink-0 w-8 text-right mr-2 text-gray-400">
                  {formatGameTime(event.EventTime)}
                </div>
                
                <div className="flex-shrink-0 mr-2 mt-0.5">
                  {getEventIcon(event.EventName)}
                </div>
                
                <div className="flex-grow">
                  {event.EventName === 'ChampionKill' && (
                    <div>
                      <span className={isPlayerOnMyTeam(event.KillerName, allPlayers, activePlayer) ? "text-blue-300 font-medium" : "text-red-300 font-medium"}>
                        {event.KillerName}
                      </span>
                      <span className="text-gray-400"> killed </span>
                      <span className={isPlayerOnMyTeam(event.VictimName, allPlayers, activePlayer) ? "text-blue-300 font-medium" : "text-red-300 font-medium"}>
                        {event.VictimName}
                      </span>
                      {event.Assisters && event.Assisters.length > 0 && (
                        <span className="text-gray-400"> (Assists: {event.Assisters.join(', ')})</span>
                      )}
                    </div>
                  )}
                  
                  {event.EventName === 'DragonKill' && (
                    <div>
                      <span className={isPlayerOnMyTeam(event.KillerName, allPlayers, activePlayer) ? "text-blue-300 font-medium" : "text-red-300 font-medium"}>
                        {event.KillerName}
                      </span>
                      <span className="text-gray-400"> killed </span>
                      <span className="text-purple-300 font-medium">
                        {event.DragonType || 'Dragon'}
                      </span>
                    </div>
                  )}
                  
                  {event.EventName === 'HeraldKill' && (
                    <div>
                      <span className={isPlayerOnMyTeam(event.KillerName, allPlayers, activePlayer) ? "text-blue-300 font-medium" : "text-red-300 font-medium"}>
                        {event.KillerName}
                      </span>
                      <span className="text-gray-400"> killed </span>
                      <span className="text-pink-300 font-medium">Herald</span>
                    </div>
                  )}
                  
                  {event.EventName === 'BaronKill' && (
                    <div>
                      <span className={isPlayerOnMyTeam(event.KillerName, allPlayers, activePlayer) ? "text-blue-300 font-medium" : "text-red-300 font-medium"}>
                        {event.KillerName}
                      </span>
                      <span className="text-gray-400"> killed </span>
                      <span className="text-yellow-300 font-medium">Baron Nashor</span>
                    </div>
                  )}
                  
                  {event.EventName === 'TurretKilled' && (
                    <div>
                      <span className={isPlayerOnMyTeam(event.KillerName, allPlayers, activePlayer) ? "text-blue-300 font-medium" : "text-red-300 font-medium"}>
                        {event.KillerName}
                      </span>
                      <span className="text-gray-400"> destroyed a </span>
                      <span className="text-blue-300 font-medium">Turret</span>
                    </div>
                  )}
                  
                  {event.EventName === 'FirstBlood' && (
                    <div>
                      <span className="text-red-400 font-medium">FIRST BLOOD: </span>
                      <span className={isPlayerOnMyTeam(event.KillerName, allPlayers, activePlayer) ? "text-blue-300 font-medium" : "text-red-300 font-medium"}>
                        {event.KillerName}
                      </span>
                    </div>
                  )}
                  
                  {event.EventName === 'InhibKilled' && (
                    <div>
                      <span className={isPlayerOnMyTeam(event.KillerName, allPlayers, activePlayer) ? "text-blue-300 font-medium" : "text-red-300 font-medium"}>
                        {event.KillerName}
                      </span>
                      <span className="text-gray-400"> destroyed an </span>
                      <span className="text-pink-300 font-medium">Inhibitor</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-400 italic">No significant events yet</div>
        )}
      </div>
    </div>
  );
};

export default EventTimeline; 