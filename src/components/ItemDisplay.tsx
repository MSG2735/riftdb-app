import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface ItemDisplayProps {
  items: any[];
}

const ItemDisplay: React.FC<ItemDisplayProps> = ({ items }) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return (
      <div className="bg-gray-800 bg-opacity-90 rounded-lg p-3 text-white">
        <h3 className="text-sm font-bold text-orange-400 mb-2 flex items-center">
          <ShoppingCart size={14} className="mr-1" />
          Items
        </h3>
        <div className="text-xs text-gray-400 italic">No items purchased yet</div>
      </div>
    );
  }
  
  // Sort items by slot
  const sortedItems = [...items].sort((a, b) => a.slot - b.slot);
  
  return (
    <div className="bg-gray-800 bg-opacity-90 rounded-lg p-3 text-white">
      <h3 className="text-sm font-bold text-orange-400 mb-2 flex items-center">
        <ShoppingCart size={14} className="mr-1" />
        Items
      </h3>
      
      <div className="grid grid-cols-4 gap-1">
        {sortedItems.map((item, index) => (
          <div key={index} className="relative group">
            <div 
              className={`w-10 h-10 rounded border ${item.canUse ? 'border-green-500' : 'border-gray-600'} flex items-center justify-center bg-gray-700 overflow-hidden`}
              title={item.displayName}
            >
              {item.itemID && (
                <img 
                  src={`http://ddragon.leagueoflegends.com/cdn/13.7.1/img/item/${item.itemID}.png`} 
                  alt={item.displayName || 'Item'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = ''; // Clear src on error
                    e.currentTarget.style.background = 'rgba(0,0,0,0.5)';
                  }}
                />
              )}
              {item.consumable && (
                <div className="absolute bottom-0 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {item.count > 1 ? item.count : ''}
                </div>
              )}
            </div>
            
            {/* Item tooltip */}
            <div className="absolute z-10 hidden group-hover:block bg-gray-900 text-white p-2 rounded shadow-lg text-xs w-48 left-0 mt-1">
              <p className="font-bold text-yellow-400">{item.displayName}</p>
              <p className="text-green-400">{item.price} gold</p>
              {item.canUse && <p className="text-blue-400">Usable</p>}
              {item.consumable && <p className="text-red-400">Consumable</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemDisplay; 