import React from 'react';
import { Volume2 } from 'lucide-react';

interface TranscriptDisplayProps {
  transcript: string;
  isListening: boolean;
  error: string | null;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  transcript,
  isListening,
  error
}) => {
  if (!transcript && !isListening && !error) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-40 max-w-2xl mx-auto">
      <div className={`
        bg-white rounded-lg shadow-lg border-l-4 p-4 transition-all duration-300
        ${error 
          ? 'border-red-500 bg-red-50' 
          : isListening 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-green-500 bg-green-50'
        }
      `}>
        <div className="flex items-start space-x-3">
          <div className={`
            p-2 rounded-full 
            ${error 
              ? 'bg-red-100 text-red-600' 
              : isListening 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-green-100 text-green-600'
            }
          `}>
            <Volume2 className="w-4 h-4" />
          </div>
          
          <div className="flex-1">
            <div className={`
              text-sm font-medium 
              ${error 
                ? 'text-red-800' 
                : isListening 
                  ? 'text-blue-800' 
                  : 'text-green-800'
              }
            `}>
              {error 
                ? 'Error' 
                : isListening 
                  ? 'Listening...' 
                  : 'Heard:'
              }
            </div>
            
            <div className={`
              mt-1 text-sm 
              ${error 
                ? 'text-red-700' 
                : isListening 
                  ? 'text-blue-700' 
                  : 'text-green-700'
              }
            `}>
              {error || transcript || 'Speak now...'}
              {isListening && !transcript && (
                <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};