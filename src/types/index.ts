export interface ShoppingItem {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category: string;
  dateAdded: Date;
  completed: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  price: number;
  category: string;
  tags: string[];
}

export interface VoiceCommand {
  action: 'add' | 'remove' | 'modify' | 'search' | 'complete' | 'clear';
  item?: string;
  quantity?: number;
  unit?: string;
  filters?: {
    price?: number;
    brand?: string;
    organic?: boolean;
  };
}

export interface Suggestion {
  id: string;
  name: string;
  type: 'history' | 'seasonal' | 'substitute';
  confidence: number;
}

export interface AppState {
  isListening: boolean;
  transcript: string;
  shoppingList: ShoppingItem[];
  suggestions: Suggestion[];
  searchResults: Product[];
  isLoading: boolean;
  error: string | null;
  language: string;
}