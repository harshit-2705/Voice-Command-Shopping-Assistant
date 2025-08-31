import { useState, useEffect, useRef, useCallback } from 'react';


interface UseSpeechRecognitionProps {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
  error: string | null;
}

export const useSpeechRecognition = ({
  language = 'en-US',
  continuous = false,
  interimResults = true
}: UseSpeechRecognitionProps = {}): UseSpeechRecognitionReturn => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isSupported =
    typeof window !== 'undefined' &&
    (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window));

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionAPI: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    try {
      recognitionRef.current = new SpeechRecognitionAPI();
    } catch (e) {
      console.warn('SpeechRecognition init failed', e);
      recognitionRef.current = null;
      return;
    }

    const recognition: any = recognitionRef.current;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
        } else if (result[0] && result[0].transcript) {
          // interim can be handled if desired
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => (prev ? prev + ' ' + finalTranscript.trim() : finalTranscript.trim()));
      }
    };

    recognition.onerror = (event: any) => {
      setError(`Speech recognition error: ${event?.error ?? 'unknown'}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {}
    };
  }, [language, continuous, interimResults, isSupported]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setError(null);
      try {
        recognitionRef.current.lang = language;
        recognitionRef.current.start();
      } catch (e) {
        console.warn('startListening failed', e);
      }
    }
  }, [isListening, language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error
  };
};
