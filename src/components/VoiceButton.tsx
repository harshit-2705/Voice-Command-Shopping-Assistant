import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceButtonProps {
  isListening: boolean;
  isSupported: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  isListening,
  isSupported,
  onClick,
  disabled = false
}) => {
  if (!isSupported) {
    return (
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-gray-400 text-white px-6 py-3 rounded-full shadow-lg">
          Voice not supported
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          relative w-16 h-16 rounded-full shadow-lg transition-all duration-300
          flex items-center justify-center text-white text-xl
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110' 
            : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-4 focus:ring-blue-300
        `}
      >
        {disabled ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isListening ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
        
        {isListening && (
          <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
        )}
      </button>
      
      <div className="mt-2 text-center">
        <span className="text-sm text-gray-600">
          {isListening ? 'Listening...' : 'Tap to speak'}
        </span>
      </div>
    </div>
  );
};