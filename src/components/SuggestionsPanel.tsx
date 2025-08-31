import React from 'react';
import { Suggestion } from '../types';
import { History, Calendar, RefreshCw, Plus } from 'lucide-react';

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
  onAddSuggestion: (name: string) => void;
}

export const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
  suggestions,
  onAddSuggestion
}) => {
  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Smart Suggestions</h3>
        <p className="text-gray-500 text-sm">
          Add some items to your list to see personalized suggestions
        </p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'history':
        return <History className="w-4 h-4" />;
      case 'seasonal':
        return <Calendar className="w-4 h-4" />;
      case 'substitute':
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <Plus className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'history':
        return 'Frequently bought';
      case 'seasonal':
        return 'Seasonal';
      case 'substitute':
        return 'Alternative';
      default:
        return 'Suggested';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'history':
        return 'text-blue-600 bg-blue-50';
      case 'seasonal':
        return 'text-green-600 bg-green-50';
      case 'substitute':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Smart Suggestions</h3>
      
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${getTypeColor(suggestion.type)}`}>
                {getIcon(suggestion.type)}
              </div>
              
              <div>
                <div className="font-medium text-gray-800 capitalize">
                  {suggestion.name}
                </div>
                <div className="text-xs text-gray-500">
                  {getTypeLabel(suggestion.type)}
                </div>
              </div>
            </div>

            <button
              onClick={() => onAddSuggestion(suggestion.name)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Add to list"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};