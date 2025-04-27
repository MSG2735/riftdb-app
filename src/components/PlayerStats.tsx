import React from 'react';

interface PlayerStatsProps {
  player: any;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ player }) => {
  // Handle case if player data isn't available yet
  if (!player) return null;

  return (
    <div className="bg-gray-800 bg-opacity-90 rounded-lg p-4">
      <h2 className="text-center text-lg font-bold text-green-400 mb-2">Your Champion</h2>
      
      <div className="flex items-center">
        {/* Champion Image */}
        <div className="relative flex-shrink-0 w-16 h-16 mr-4">
          <img 
            src={`http://ddragon.leagueoflegends.com/cdn/13.7.1/img/champion/${player.championName}.png`}
            alt={player.championName}
            className="w-full h-full rounded-full object-cover border-2 border-yellow-400"
          />
          <div className="absolute -bottom-1 -right-1 bg-gray-900 text-yellow-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border border-yellow-500">
            {player.level}
          </div>
        </div>
        
        {/* Core Stats */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-lg">{player.summonerName}</span>
            <span className="text-yellow-400 font-bold">{Math.round(player.currentGold).toLocaleString()} gold</span>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <span className="block text-xs text-gray-400">KDA</span>
              <span className="font-medium text-green-400">{player.scores?.kills || 0}/{player.scores?.deaths || 0}/{player.scores?.assists || 0}</span>
            </div>
            <div className="text-center">
              <span className="block text-xs text-gray-400">CS</span>
              <span className="font-medium">{player.scores?.creepScore || 0}</span>
            </div>
            <div className="text-center">
              <span className="block text-xs text-gray-400">Vision</span>
              <span className="font-medium">{player.scores?.wardScore || 0}</span>
            </div>
            <div className="text-center">
              <span className="block text-xs text-gray-400">DMG</span>
              <span className="font-medium">{(player.scores?.totalDamageDealtToChampions || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Health/Mana Bars */}
      <div className="mt-3 space-y-2">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>HP</span>
            <span>{Math.round(player.championStats?.currentHealth || 0)}/{Math.round(player.championStats?.maxHealth || 0)}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 rounded-full h-2" 
              style={{
                width: `${player.championStats ? (player.championStats.currentHealth / player.championStats.maxHealth) * 100 : 0}%`
              }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Mana</span>
            <span>{Math.round(player.championStats?.resourceValue || 0)}/{Math.round(player.championStats?.resourceMax || 0)}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 rounded-full h-2" 
              style={{
                width: `${player.championStats ? (player.championStats.resourceValue / player.championStats.resourceMax) * 100 : 0}%`
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats; 