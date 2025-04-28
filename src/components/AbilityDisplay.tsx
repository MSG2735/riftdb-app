import React from 'react';

interface AbilityDisplayProps {
  abilities: any;
}

const AbilityDisplay: React.FC<AbilityDisplayProps> = ({ abilities }) => {
  if (!abilities) return null;
  
  // Ordering the keys to ensure we get Passive, Q, W, E, R
  const abilityOrder = ['Passive', 'Q', 'W', 'E', 'R'];
  
  return (
    <div className="bg-gray-800 bg-opacity-90 rounded-lg p-3 text-white">
      <h3 className="text-sm font-bold text-blue-400 mb-2">Abilities</h3>
      
      <div className="flex justify-between space-x-1">
        {abilityOrder.map((key) => {
          const ability = abilities[key];
          if (!ability) return null;
          
          return (
            <div key={key} className="relative">
              <div className="w-10 h-10 relative">
                <div className={`w-full h-full rounded bg-gray-700 flex items-center justify-center font-bold ${key === 'Passive' ? 'text-yellow-400' : 'text-blue-400'}`}>
                  {key}
                </div>
                {key !== 'Passive' && ability.abilityLevel > 0 && (
                  <div className="absolute bottom-0 right-0 bg-green-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {ability.abilityLevel}
                  </div>
                )}
              </div>
              <div className="text-center text-xs mt-1 w-10 truncate" title={ability.displayName}>
                {ability.displayName?.length > 8 ? `${ability.displayName.substring(0, 6)}...` : ability.displayName}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AbilityDisplay; 