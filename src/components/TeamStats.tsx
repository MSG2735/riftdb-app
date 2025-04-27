import React from 'react';
import { Coins, Sword, ShieldAlert, Shield, Flame } from 'lucide-react';

interface TeamStatsProps {
  team: any;
  color: 'blue' | 'red';
}

const TeamStats: React.FC<TeamStatsProps> = ({ team, color }) => {
  const colorClasses = {
    blue: 'bg-blue-600 bg-opacity-50 text-blue-100 border-blue-500',
    red: 'bg-red-600 bg-opacity-50 text-red-100 border-red-500'
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
              <Shield size={12} /> <span className="font-mono">{team.objectives.tower?.kills || 0}</span> towers
            </span>
            <span className="flex items-center gap-1">
              <span className="font-mono">{team.objectives.dragon?.kills || 0}</span> dragons <Flame size={12} className="text-orange-400" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamStats; 