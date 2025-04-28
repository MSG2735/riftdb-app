import React from 'react';
import { Shield, Swords, Zap, Heart, Activity } from 'lucide-react';

interface ChampionDetailsProps {
  championStats: any;
}

const ChampionDetails: React.FC<ChampionDetailsProps> = ({ championStats }) => {
  if (!championStats) return null;
  
  return (
    <div className="bg-gray-800 bg-opacity-90 rounded-lg p-3 text-white">
      <h3 className="text-sm font-bold text-blue-400 mb-2 flex items-center">
        <Activity size={14} className="mr-1" />
        Champion Stats
      </h3>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center">
          <Swords size={12} className="text-red-400 mr-1" />
          <span className="text-gray-400 mr-1">AD:</span>
          <span>{Math.round(championStats.attackDamage || 0)}</span>
        </div>
        
        <div className="flex items-center">
          <Zap size={12} className="text-blue-400 mr-1" />
          <span className="text-gray-400 mr-1">AP:</span>
          <span>{Math.round(championStats.abilityPower || 0)}</span>
        </div>
        
        <div className="flex items-center">
          <Shield size={12} className="text-yellow-400 mr-1" />
          <span className="text-gray-400 mr-1">Armor:</span>
          <span>{Math.round(championStats.armor || 0)}</span>
        </div>
        
        <div className="flex items-center">
          <Shield size={12} className="text-purple-400 mr-1" />
          <span className="text-gray-400 mr-1">MR:</span>
          <span>{Math.round(championStats.magicResist || 0)}</span>
        </div>
        
        <div className="flex items-center">
          <Heart size={12} className="text-green-400 mr-1" />
          <span className="text-gray-400 mr-1">HP Regen:</span>
          <span>{championStats.healthRegenRate?.toFixed(1) || 0}</span>
        </div>
        
        <div className="flex items-center">
          <Zap size={12} className="text-yellow-400 mr-1" />
          <span className="text-gray-400 mr-1">AS:</span>
          <span>{championStats.attackSpeed?.toFixed(2) || 0}</span>
        </div>
        
        <div className="flex items-center">
          <Zap size={12} className="text-cyan-400 mr-1" />
          <span className="text-gray-400 mr-1">Move:</span>
          <span>{Math.round(championStats.moveSpeed || 0)}</span>
        </div>
        
        <div className="flex items-center">
          <Activity size={12} className="text-blue-400 mr-1" />
          <span className="text-gray-400 mr-1">CDR:</span>
          <span>{Math.round((championStats.abilityHaste || 0) / (100 + (championStats.abilityHaste || 0)) * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default ChampionDetails; 