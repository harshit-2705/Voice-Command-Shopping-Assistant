import { ShoppingItem } from '../types';

const STORAGE_KEY = 'voice-shopping-assistant';

export function saveToLocalStorage(data: any): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function loadFromLocalStorage(): any {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

export function saveShoppingList(list: ShoppingItem[]): void {
  const data = loadFromLocalStorage() || {};
  data.shoppingList = list;
  data.history = [...(data.history || []), ...list.filter(item => item.completed)];
  saveToLocalStorage(data);
}

export function loadShoppingList(): ShoppingItem[] {
  const data = loadFromLocalStorage();
  return data?.shoppingList || [];
}

export function loadHistory(): ShoppingItem[] {
  const data = loadFromLocalStorage();
  return data?.history || [];
}