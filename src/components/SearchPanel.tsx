import React, { useState } from 'react';
import { Product } from '../types';
import { Search, Tag, DollarSign } from 'lucide-react';

interface SearchPanelProps {
  results: Product[];
  onAddProduct: (product: Product) => void;
  isSearching: boolean;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  results,
  onAddProduct,
  isSearching
}) => {
  const [showFilters, setShowFilters] = useState(false);

  if (results.length === 0 && !isSearching) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Search</h3>
        <div className="flex items-center space-x-2 text-gray-500">
          <Search className="w-5 h-5" />
          <span className="text-sm">
            Say "Find organic apples" or "Show me toothpaste under $5"
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Search Results</h3>
        {results.length > 0 && (
          <span className="text-sm text-gray-500">
            {results.length} product{results.length !== 1 ? 's' : ''} found
          </span>
        )}
      </div>

      {isSearching && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}

      <div className="space-y-3">
        {results.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold text-gray-800">{product.name}</h4>
                  {product.brand && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      {product.brand}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <span>₹</span>
                    <span>{product.price.toFixed(2)}</span>
                  </div>

                  
                  <div className="flex items-center space-x-1">
                    <Tag className="w-3 h-3" />
                    <span className="capitalize">{product.category}</span>
                  </div>
                </div>

                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => onAddProduct(product)}
                className="ml-4 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add to List
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};