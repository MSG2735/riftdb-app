import React from 'react';
import { Coins, Sword, ShieldAlert, Shield, Flame } from 'lucide-react';

interface TeamStatsProps {
  team: any;
  color: 'blue' | 'red';
}

const TeamStats: React.FC<TeamStatsProps> = ({ team, color }) => {
  const colorClasses = {
    blue: 'bg-blue-600 bg-opacity-30 text-blue-100 border-blue-500',
    red: 'bg-red-600 bg-opacity-30 text-red-100 border-red-500'
  };
  
  // Function to get icons for dragon types
  const getDragonIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'fire':
        return <span className="w-2 h-2 inline-block rounded-full bg-red-500"></span>;
      case 'water':
      case 'ocean':
        return <span className="w-2 h-2 inline-block rounded-full bg-blue-400"></span>;
      case 'earth':
      case 'mountain':
        return <span className="w-2 h-2 inline-block rounded-full bg-orange-800"></span>;
      case 'air':
      case 'cloud':
        return <span className="w-2 h-2 inline-block rounded-full bg-gray-300"></span>;
      case 'elder':
        return <span className="w-2 h-2 inline-block rounded-full bg-purple-500"></span>;
      case 'hextech':
        return <span className="w-2 h-2 inline-block rounded-full bg-cyan-400"></span>;
      case 'chemtech':
        return <span className="w-2 h-2 inline-block rounded-full bg-green-500"></span>;
      case 'infernal':
        return <span className="w-2 h-2 inline-block rounded-full bg-red-600"></span>;
      default:
        return <span className="w-2 h-2 inline-block rounded-full bg-gray-500"></span>;
    }
  };
  
  return (
    <div className={`p-2 ${colorClasses[color]} rounded-md mb-2 text-xs border shadow-md`}>
      <h2 className="text-center font-bold text-sm mb-2 flex items-center justify-center gap-1">
        {color === 'blue' ? (
          <>
            <Shield size={14} className="text-blue-200" />
            <span>Blue Team</span>
          </>
        ) : (
          <>
            <ShieldAlert size={14} className="text-red-200" />
            <span>Red Team</span>
          </>
        )}
      </h2>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1">
          <Coins size={14} className="text-yellow-300" />
          <div>
            <span className="block text-white font-semibold">Gold</span>
            <span className="font-mono">{team.totalGold ? team.totalGold.toLocaleString() : '0'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Sword size={14} className={color === 'blue' ? 'text-blue-200' : 'text-red-200'} />
          <div>
            <span className="block text-white font-semibold">Kills</span>
            <span className="font-mono">{team.score?.kills || 0}</span>
          </div>
        </div>
        
        <div className="col-span-2 mt-1">
          <div className="flex justify-between text-xs text-gray-300">
            <span className="flex items-center gap-1">
              <Shield size={12} className="text-gray-300" /> 
              <span className="font-mono">{team.objectives.turret?.kills || 0}</span> turrets
            </span>
            <span className="flex items-center gap-1">
              <span className="font-mono">{team.objectives.dragon?.kills || 0}</span> dragons 
              <Flame size={12} className="text-orange-400" />
            </span>
          </div>
        </div>
        
        {team.objectives.dragon?.types && team.objectives.dragon.types.length > 0 && (
          <div className="col-span-2 mt-1 flex gap-1 justify-center">
            {team.objectives.dragon.types.map((type: string, index: number) => (
              <span key={index} title={type}>
                {getDragonIcon(type)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamStats; 