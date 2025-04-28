import React from 'react';
import { Users, Swords, Mountain } from 'lucide-react';

interface TeamStatsProps {
  team: any;
  color: 'blue' | 'red';
}

const TeamStats: React.FC<TeamStatsProps> = ({ team, color }) => {
  const isBlue = color === 'blue';
  
  // Handle case where team data isn't available yet
  if (!team) return null;
  
  // Get dragon icons based on types
  const getDragonIcon = (type: string) => {
    const typeColorMap: Record<string, string> = {
      'Fire': 'text-red-500',
      'Infernal': 'text-red-500',
      'Ocean': 'text-blue-500',
      'Water': 'text-blue-500',
      'Mountain': 'text-amber-700',
      'Earth': 'text-amber-700',
      'Cloud': 'text-gray-400',
      'Air': 'text-gray-400',
      'Elder': 'text-purple-500',
      'Hextech': 'text-cyan-500',
      'Chemtech': 'text-green-500',
      'Default': 'text-purple-400'
    };
    
    return <Mountain size={12} className={typeColorMap[type] || typeColorMap['Default']} />;
  };
  
  return (
    <div className={`p-3 rounded-lg text-white ${isBlue ? 'bg-blue-900 bg-opacity-40' : 'bg-red-900 bg-opacity-40'} border ${isBlue ? 'border-blue-500' : 'border-red-500'}`}>
      <div className="flex items-center justify-between mb-2">
        <h2 className={`text-sm font-bold ${isBlue ? 'text-blue-300' : 'text-red-300'}`}>
          {isBlue ? 'BLUE TEAM' : 'RED TEAM'}
        </h2>
        <div className="flex items-center space-x-1">
          <Swords size={14} className="text-yellow-400" />
          <span className="text-sm font-bold">{team.score?.kills || 0}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-1 text-xs">
        {/* KDA */}
        <div className="bg-gray-800 bg-opacity-50 p-1 rounded">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">KDA</span>
            <span className="font-mono">
              {team.score?.kills || 0}/{team.score?.deaths || 0}/{team.score?.assists || 0}
            </span>
          </div>
        </div>
        
        {/* Turrets */}
        <div className="bg-gray-800 bg-opacity-50 p-1 rounded">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Turrets</span>
            <span className="font-mono">{team.objectives?.turrets || 0}</span>
          </div>
        </div>
        
        {/* Dragons */}
        <div className="bg-gray-800 bg-opacity-50 p-1 rounded">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Dragons</span>
            <span className="font-mono">{team.objectives?.dragons || 0}</span>
          </div>
        </div>
      </div>
      
      {/* Dragon Types */}
      {team.objectives?.dragonTypes && team.objectives.dragonTypes.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center text-xs text-gray-300 mb-1">
            <Mountain size={12} className="mr-1" />
            <span>Dragon Types:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {team.objectives.dragonTypes.map((type: string, index: number) => (
              <div 
                key={index} 
                className="flex items-center bg-gray-800 bg-opacity-50 px-1 py-0.5 rounded text-xs"
                title={type}
              >
                {getDragonIcon(type)}
                <span className="ml-1">{type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Gold */}
      <div className="mt-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">Total Gold</span>
          <span className={`font-bold ${isBlue ? 'text-blue-300' : 'text-red-300'}`}>
            {Math.round(team.totalGold || 0).toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* Player Names */}
      <div className="mt-2">
        <div className="flex items-center text-xs text-gray-300 mb-1">
          <Users size={12} className="mr-1" />
          <span>Players:</span>
        </div>
        <div className="space-y-1">
          {team.players && team.players.map((player: any, index: number) => (
            <div 
              key={index} 
              className="flex justify-between items-center text-xs bg-gray-800 bg-opacity-50 py-0.5 px-1 rounded"
            >
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full overflow-hidden mr-1 flex-shrink-0"
                  title={player.championName}
                >
                  <img 
                    src={`http://ddragon.leagueoflegends.com/cdn/13.7.1/img/champion/${player.championName}.png`}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.style.background = 'rgba(0,0,0,0.5)';
                    }}
                  />
                </div>
                <span className="truncate max-w-[80px]" title={player.summonerName}>
                  {player.summonerName}
                </span>
              </div>
              <div className="text-green-400 font-mono">
                {player.scores?.kills || 0}/{player.scores?.deaths || 0}/{player.scores?.assists || 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamStats; 