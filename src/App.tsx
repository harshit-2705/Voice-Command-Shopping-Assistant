// src/App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingItem, Product, Suggestion, VoiceCommand, AppState } from './types';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { parseVoiceCommand } from './utils/nlp';
import { generateSuggestions } from './utils/suggestions';
import { saveShoppingList, loadShoppingList, loadHistory } from './utils/storage';
import { applyVoiceCommand } from './utils/commandExecutor';

// Components
import { VoiceButton } from './components/VoiceButton';
import { TranscriptDisplay } from './components/TranscriptDisplay';
import { ShoppingList } from './components/ShoppingList';
import { SuggestionsPanel } from './components/SuggestionsPanel';
import { SearchPanel } from './components/SearchPanel';
import { LanguageSelector } from './components/LanguageSelector';
import { ConfirmationToast } from './components/ConfirmationToast';

// Data
import categoriesData from './data/categories.json';
import productsData from './data/products.json';

const INITIAL_STATE: AppState = {
  isListening: false,
  transcript: '',
  shoppingList: [],
  suggestions: [],
  searchResults: [],
  isLoading: false,
  error: null,
  language: 'en-US'
};

function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error: speechError
  } = useSpeechRecognition({
    language: state.language,
    continuous: false,
    interimResults: true
  });

  // Load data on mount
  useEffect(() => {
    const savedList = loadShoppingList();
    const history = loadHistory();
    const suggestions = generateSuggestions(savedList, history);

    setState(prev => ({
      ...prev,
      shoppingList: savedList,
      suggestions
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save shopping list when it changes
  useEffect(() => {
    saveShoppingList(state.shoppingList);
  }, [state.shoppingList]);

  // Update suggestions when shopping list changes
  useEffect(() => {
    const history = loadHistory();
    const suggestions = generateSuggestions(state.shoppingList, history);
    setState(prev => ({ ...prev, suggestions }));
  }, [state.shoppingList]);

  // Process transcript when speech stops
  useEffect(() => {
    if (!isListening && transcript.trim()) {
      const run = async () => {
        try {
          const command = parseVoiceCommand(transcript.trim());

          if (!command) {
            showToast('Could not understand the command', 'error');
          } else {
            // ✅ Handle price queries separately
            if (command.action === 'search') {
              if (command.item) {
                const prices: Record<string, number> = {
                  apple: 120,
                  banana: 60,
                  milk: 55,
                  bread: 45,
                  rice: 80,
                  sugar: 50,
                  oil: 150,
                  egg: 6,
                };

                const price = prices[command.item.toLowerCase()];
                if (price) {
                  showToast(`The price of ${command.item} is ₹${price}`, 'info');
                // Update SearchPanel with a Product[] entry so it shows on the home page
                setState(prev => ({
                  ...prev,
                  searchResults: [
                    {
                      id: Date.now().toString(),
                      name: command.item,
                      price: price ?? 0,
                      category: 'search',
                      tags: [command.item.toLowerCase()]
                    }
                  ]
                }));
                } else {
                  showToast(`Sorry, I don't know the price of ${command.item}`, 'error');
                // Still surface a result card (price 0) so the user can add it
                setState(prev => ({
                  ...prev,
                  searchResults: [
                    {
                      id: Date.now().toString(),
                      name: command.item,
                      price: 0,
                      category: 'search',
                      tags: [command.item.toLowerCase(), 'unpriced']
                    }
                  ]
                }));
                }
              } else {
                showToast('Please specify an item to check price', 'error');
              setState(prev => ({ ...prev, searchResults: [] }));
              }
              return; // prevent applyVoiceCommand
            }

            // ✅ Default: execute normal shopping commands
            setState(prev => {
              const { list: updatedList, message } = applyVoiceCommand(prev.shoppingList, command);
              if (message) {
                setTimeout(() => showToast(message, 'success'), 50);
              }
              return { ...prev, shoppingList: updatedList };
            });
          }
        } catch (err) {
          console.error('Error processing transcript:', err);
          showToast('Error processing command', 'error');
        } finally {
          setTimeout(() => {
            resetTranscript();
            setState(prev => ({ ...prev, transcript: '' }));
          }, 1200);
        }
      };

      run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, transcript, resetTranscript]);

  // Update transcript in state
  useEffect(() => {
    setState(prev => ({ ...prev, transcript, isListening }));
  }, [transcript, isListening]);

  // Handle speech errors
  useEffect(() => {
    if (speechError) {
      setState(prev => ({ ...prev, error: speechError }));
      showToast(speechError, 'error');
    }
  }, [speechError]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const processVoiceCommand = useCallback((text: string) => {
    const command = parseVoiceCommand(text);

    if (!command) {
      showToast('Could not understand the command', 'error');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { list: updatedList, message } = applyVoiceCommand(state.shoppingList, command);
      setState(prev => ({ ...prev, shoppingList: updatedList }));
      if (message) {
        setTimeout(() => showToast(message, 'success'), 50);
      }
    } catch (error) {
      console.error('Error executing command', error);
      showToast('Error processing command', 'error');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.shoppingList]);

  // ... rest of your addItem, removeItem, searchProducts, etc. (unchanged)

  const addItem = (name: string, quantity?: number, unit?: string) => {
    const cat = (categoriesData as any)[name.toLowerCase()] || 'other';
    const qty = quantity ?? 1;
    setState(prev => {
      const existingIdx = prev.shoppingList.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
      if (existingIdx >= 0) {
        const copy = prev.shoppingList.slice();
        copy[existingIdx] = { ...copy[existingIdx], quantity: (copy[existingIdx].quantity || 0) + qty };
        setTimeout(() => showToast(`${copy[existingIdx].name} quantity increased by ${qty}`, 'success'), 50);
        return { ...prev, shoppingList: copy };
      } else {
        const newItem: ShoppingItem = {
          id: Date.now().toString(),
          name: name.charAt(0).toUpperCase() + name.slice(1),
          quantity: qty,
          unit,
          category: cat,
          dateAdded: new Date(),
          completed: false
        };
        setTimeout(() => showToast(`Added ${newItem.name} (${qty}) to your list`, 'success'), 50);
        return { ...prev, shoppingList: [...prev.shoppingList, newItem] };
      }
    });
  };

  // ... keep removeItemByName, searchProducts, clearList, handlers unchanged ...

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              🛒 Voice Shopping Assistant
            </h1>
            <div className="w-48">
              <LanguageSelector
                selectedLanguage={state.language}
                onLanguageChange={(lang) => setState(prev => ({ ...prev, language: lang }))}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Transcript */}
      <TranscriptDisplay
        transcript={state.transcript}
        isListening={state.isListening}
        error={state.error}
      />

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-8 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ShoppingList
              items={state.shoppingList}
              onToggleComplete={(id) => setState(prev => ({
                ...prev,
                shoppingList: prev.shoppingList.map(item =>
                  item.id === id ? { ...item, completed: !item.completed } : item
                )
              }))}
              onRemoveItem={(id) => setState(prev => ({
                ...prev,
                shoppingList: prev.shoppingList.filter(item => item.id !== id)
              }))}
            />
          </div>

          <div className="space-y-8">
            <SuggestionsPanel
              suggestions={state.suggestions}
              onAddSuggestion={(name) => addItem(name)}
            />

            <SearchPanel
              results={state.searchResults}
              onAddProduct={(product) => addItem(product.name)}
              isSearching={state.isLoading}
            />
          </div>
        </div>
      </main>

      <VoiceButton
        isListening={state.isListening}
        isSupported={isSupported}
        onClick={() => isListening ? stopListening() : startListening()}
        disabled={state.isLoading}
      />

      {toast && (
        <ConfirmationToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
