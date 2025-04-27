import React from 'react';

interface PlayerListProps {
  players: any[];
  activePlayer?: string;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, activePlayer }) => {
  return (
    <div className="bg-gray-800 bg-opacity-80 rounded-lg p-2">
      <h3 className="text-gray-400 text-sm font-semibold mb-2">Players</h3>
      
      <div className="space-y-2">
        {players.map((player, index) => {
          const isActivePlayer = player.summonerName === activePlayer;
          
          return (
            <div 
              key={index} 
              className={`flex items-center text-sm p-1 rounded ${isActivePlayer ? 'bg-green-900 bg-opacity-50 border border-green-500' : 'hover:bg-gray-700'}`}
            >
              <div className="flex-shrink-0 w-8 h-8 mr-2">
                <img 
                  src={`http://ddragon.leagueoflegends.com/cdn/13.7.1/img/champion/${player.championName}.png`} 
                  alt={player.championName}
                  className={`w-full h-full rounded-full object-cover ${isActivePlayer ? 'border-2 border-green-500' : ''}`}
                />
              </div>
              
              <div className="flex-grow">
                <div className="flex justify-between">
                  <span className={`font-medium ${isActivePlayer ? 'text-green-400' : ''}`}>
                    {isActivePlayer ? '★ ' : ''}{player.summonerName}
                  </span>
                  <span className="text-green-400">{player.scores.kills}/{player.scores.deaths}/{player.scores.assists}</span>
                </div>
                
                <div className="flex justify-between text-xs text-gray-400">
                  <span>CS: {player.scores.creepScore}</span>
                  <span>Gold: {Math.round(player.currentGold).toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerList; 