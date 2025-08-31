import { ShoppingItem, Suggestion } from '../types';
import seasonalData from '../data/seasonal.json';
import substitutesData from '../data/substitutes.json';

export function generateSuggestions(
  shoppingList: ShoppingItem[],
  history: ShoppingItem[] = []
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Get current season
  const month = new Date().getMonth();
  let currentSeason: 'winter' | 'spring' | 'summer' | 'fall';
  
  if (month >= 11 || month <= 1) currentSeason = 'winter';
  else if (month >= 2 && month <= 4) currentSeason = 'spring';
  else if (month >= 5 && month <= 7) currentSeason = 'summer';
  else currentSeason = 'fall';

  // Historical suggestions (frequently bought items not in current list)
  const currentItems = new Set(shoppingList.map(item => item.name.toLowerCase()));
  const itemFrequency = new Map<string, number>();
  
  history.forEach(item => {
    const name = item.name.toLowerCase();
    if (!currentItems.has(name)) {
      itemFrequency.set(name, (itemFrequency.get(name) || 0) + 1);
    }
  });

  // Add top 5 historical items
  Array.from(itemFrequency.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([name, frequency]) => {
      suggestions.push({
        id: `hist-${name}`,
        name,
        type: 'history',
        confidence: Math.min(frequency / 10, 1)
      });
    });

  // Seasonal suggestions
  const seasonalItems = seasonalData[currentSeason] || [];
  seasonalItems.slice(0, 3).forEach(item => {
    if (!currentItems.has(item.toLowerCase())) {
      suggestions.push({
        id: `seasonal-${item}`,
        name: item,
        type: 'seasonal',
        confidence: 0.7
      });
    }
  });

  // Substitute suggestions (if certain items are in the list)
  shoppingList.forEach(item => {
    const substitutes = substitutesData[item.name.toLowerCase() as keyof typeof substitutesData];
    if (substitutes) {
      substitutes.slice(0, 2).forEach(substitute => {
        if (!currentItems.has(substitute.toLowerCase())) {
          suggestions.push({
            id: `sub-${item.id}-${substitute}`,
            name: substitute,
            type: 'substitute',
            confidence: 0.6
          });
        }
      });
    }
  });

  return suggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 8); // Limit to 8 suggestions
}