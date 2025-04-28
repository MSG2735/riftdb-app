import React from 'react';
import { Zap } from 'lucide-react';

interface SummonerSpellsProps {
  summonerSpells: any;
}

const SummonerSpells: React.FC<SummonerSpellsProps> = ({ summonerSpells }) => {
  if (!summonerSpells) return null;
  
  // For active player, the API returns D and F keys
  // For other players, it returns summonerSpellOne and summonerSpellTwo
  const spellD = summonerSpells.D || summonerSpells.summonerSpellOne;
  const spellF = summonerSpells.F || summonerSpells.summonerSpellTwo;
  
  if (!spellD && !spellF) return null;
  
  return (
    <div className="bg-gray-800 bg-opacity-90 rounded-lg p-3 text-white">
      <h3 className="text-sm font-bold text-yellow-400 mb-2 flex items-center">
        <Zap size={14} className="mr-1" />
        Summoner Spells
      </h3>
      
      <div className="flex justify-around">
        {spellD && (
          <div className="text-center">
            <div className="w-12 h-12 rounded bg-gray-700 flex items-center justify-center overflow-hidden">
              <img 
                src={`http://ddragon.leagueoflegends.com/cdn/13.7.1/img/spell/${getSpellImageName(spellD.displayName)}.png`}
                alt={spellD.displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '';
                  e.currentTarget.style.background = 'rgba(0,0,0,0.5)';
                }}
              />
            </div>
            <div className="text-xs mt-1">{spellD.displayName}</div>
            <div className="bg-gray-900 text-white text-xs px-2 py-0.5 rounded-full mt-1">D</div>
          </div>
        )}
        
        {spellF && (
          <div className="text-center">
            <div className="w-12 h-12 rounded bg-gray-700 flex items-center justify-center overflow-hidden">
              <img 
                src={`http://ddragon.leagueoflegends.com/cdn/13.7.1/img/spell/${getSpellImageName(spellF.displayName)}.png`}
                alt={spellF.displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '';
                  e.currentTarget.style.background = 'rgba(0,0,0,0.5)';
                }}
              />
            </div>
            <div className="text-xs mt-1">{spellF.displayName}</div>
            <div className="bg-gray-900 text-white text-xs px-2 py-0.5 rounded-full mt-1">F</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to convert spell names to image names
function getSpellImageName(displayName: string): string {
  const spellMap: { [key: string]: string } = {
    'Flash': 'SummonerFlash',
    'Ignite': 'SummonerDot',
    'Exhaust': 'SummonerExhaust',
    'Heal': 'SummonerHeal',
    'Teleport': 'SummonerTeleport',
    'Cleanse': 'SummonerBoost',
    'Barrier': 'SummonerBarrier',
    'Ghost': 'SummonerHaste',
    'Smite': 'SummonerSmite',
    'Mark': 'SummonerSnowball',
    'Clarity': 'SummonerMana'
  };
  
  return spellMap[displayName] || 'SummonerFlash'; // Default to Flash if unknown
}

export default SummonerSpells; 