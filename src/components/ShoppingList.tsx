import React from 'react';
import { ShoppingItem } from '../types';
import { ShoppingCart, Check, X, Package } from 'lucide-react';

interface ShoppingListProps {
  items: ShoppingItem[];
  onToggleComplete: (id: string) => void;
  onRemoveItem: (id: string) => void;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({
  items,
  onToggleComplete,
  onRemoveItem
}) => {
  // Group items by category
  const groupedItems = items.reduce((groups, item) => {
    const category = item.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, ShoppingItem[]>);

  const categories = Object.keys(groupedItems).sort();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <ShoppingCart className="w-16 h-16 mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">Your shopping list is empty</h3>
        <p className="text-sm text-center">
          Use voice commands like "Add milk" or "Add 2 bottles of water" to get started
        </p>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      dairy: '🥛',
      produce: '🥬',
      meat: '🥩',
      bakery: '🍞',
      pantry: '🏺',
      beverages: '🥤',
      snacks: '🍿',
      'personal care': '🧼',
      household: '🧽',
      breakfast: '🥣'
    };
    return icons[category] || <Package className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Shopping List</h2>
        <div className="text-sm text-gray-500">
          {items.filter(item => !item.completed).length} of {items.length} items
        </div>
      </div>

      {categories.map(category => (
        <div key={category} className="space-y-2">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg">{getCategoryIcon(category)}</span>
            <h3 className="text-lg font-semibold text-gray-700 capitalize">
              {category.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="grid gap-2">
            {groupedItems[category].map(item => (
              <div
                key={item.id}
                className={`
                  bg-white rounded-lg border shadow-sm p-4 transition-all duration-200
                  ${item.completed 
                    ? 'opacity-60 bg-gray-50 border-gray-200' 
                    : 'hover:shadow-md border-gray-300'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onToggleComplete(item.id)}
                      className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center
                        transition-colors duration-200
                        ${item.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-400'
                        }
                      `}
                    >
                      {item.completed && <Check className="w-3 h-3" />}
                    </button>

                    <div className={`
                      ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}
                    `}>
                      <span className="font-medium">{item.name}</span>
                      {item.quantity && (
                        <span className="text-sm text-gray-600 ml-2">
                          ({item.quantity} {item.unit || 'item'}{item.quantity > 1 && item.unit !== 'item' ? 's' : ''})
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};