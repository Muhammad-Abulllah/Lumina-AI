import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[60] flex items-center gap-3 bg-red-50 dark:bg-red-900/90 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-100 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm max-w-sm w-full mx-4"
        >
          <AlertCircle size={20} className="flex-shrink-0 text-red-600 dark:text-red-400" />
          <p className="text-sm font-medium flex-1">{message}</p>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-red-100 dark:hover:bg-red-800/50 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;