import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface ConfirmationToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export const ConfirmationToast: React.FC<ConfirmationToastProps> = ({
  message,
  type,
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`
      fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50
      max-w-sm w-full mx-4 animate-slide-up
    `}>
      <div className={`
        ${getBgColor()}
        border rounded-lg p-4 shadow-lg
        flex items-center space-x-3
      `}>
        {getIcon()}
        <p className="text-sm font-medium text-gray-800 flex-1">
          {message}
        </p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};