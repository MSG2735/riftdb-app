import React from 'react';
import ChampionDetails from './ChampionDetails';
import { User, Star } from 'lucide-react';

interface PlayerDetailViewProps {
  player: any;
  isActivePlayer: boolean;
}

const PlayerDetailView: React.FC<PlayerDetailViewProps> = ({ player, isActivePlayer }) => {
  if (!player) return null;
  
  return (
    <div className="bg-gray-900 bg-opacity-70 backdrop-blur-sm rounded-lg p-4 text-white mb-3">
      <div className="flex items-center mb-3">
        {/* Champion Image */}
        <div className="relative flex-shrink-0 w-16 h-16 mr-4">
          <img 
            src={`http://ddragon.leagueoflegends.com/cdn/13.7.1/img/champion/${player.championName}.png`}
            alt={player.championName}
            className={`w-full h-full rounded-full object-cover border-2 ${isActivePlayer ? 'border-yellow-400' : 'border-gray-400'}`}
            onError={(e) => {
              e.currentTarget.src = '';
              e.currentTarget.style.background = 'rgba(0,0,0,0.5)';
            }}
          />
          <div className="absolute -bottom-1 -right-1 bg-gray-900 text-yellow-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border border-yellow-500">
            {player.level}
          </div>
          {isActivePlayer && (
            <div className="absolute -top-1 -left-1">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
            </div>
          )}
        </div>
        
        {/* Player Info */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <User size={14} className="text-blue-400 mr-1" />
              <span className={`font-bold text-lg ${isActivePlayer ? 'text-yellow-400' : 'text-white'}`}>
                {player.summonerName}
              </span>
            </div>
            <span className="text-yellow-400 font-bold">{Math.round(player.totalGold || 0).toLocaleString()} gold</span>
          </div>
          
          <div className="grid grid-cols-4 gap-2 bg-gray-800 bg-opacity-70 p-2 rounded-md">
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
      
      {/* Champion Stats */}
      {player.championStats && (
        <ChampionDetails championStats={player.championStats} />
      )}
    </div>
  );
};

export default PlayerDetailView; 