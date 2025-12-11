import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, X, Loader2 } from 'lucide-react';
import Button from './Button';
import { Attachment } from '../types';
import { fileToGenerativePart } from '../services/geminiService';

interface InputAreaProps {
  onSend: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;
    onSend(text, attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Allow Image and Video types
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        console.warn('Only image and video files are supported');
        return;
      }
      
      try {
        const part = await fileToGenerativePart(file);
        const previewUrl = URL.createObjectURL(file);
        setAttachments(prev => [...prev, { ...part, previewUrl }]);
      } catch (error) {
        console.error("Error reading file", error);
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6">
      <motion.div 
        layout
        className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl dark:shadow-2xl p-2 flex flex-col gap-2 transition-all focus-within:ring-1 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50"
      >
        {/* Attachment Previews */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex gap-2 px-2 pt-2 overflow-x-auto"
            >
              {attachments.map((att, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative group flex-shrink-0"
                >
                  {att.mimeType.startsWith('video/') ? (
                    <video 
                      src={att.previewUrl} 
                      className="h-16 w-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700 bg-black" 
                      autoPlay 
                      muted 
                      loop 
                      playsInline 
                    />
                  ) : (
                    <img 
                      src={att.previewUrl} 
                      alt="preview" 
                      className="h-16 w-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700" 
                    />
                  )}
                  
                  <button 
                    onClick={() => removeAttachment(idx)}
                    className="absolute -top-1 -right-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-300 dark:border-gray-600 z-10"
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2">
          {/* File Upload Button */}
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
          <Button 
            variant="icon" 
            onClick={() => fileInputRef.current?.click()}
            className="mb-1 text-gray-500 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400"
          >
            <Paperclip size={20} />
          </Button>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Lumina anything..."
            className="flex-1 max-h-[120px] bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-none focus:ring-0 resize-none py-3 px-1 text-base leading-relaxed"
            rows={1}
          />

          {/* Send Button */}
          <Button 
            variant={text || attachments.length > 0 ? 'primary' : 'secondary'}
            onClick={handleSend}
            disabled={(!text && attachments.length === 0) || isLoading}
            className={`mb-1 transition-all duration-200 ${(!text && attachments.length === 0) ? 'opacity-50' : 'opacity-100'}`}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </Button>
        </div>
      </motion.div>
      <div className="text-center mt-2">
         <p className="text-[10px] text-gray-400 dark:text-gray-600 font-medium tracking-wide transition-colors">POWERED BY GEMINI 2.5 FLASH</p>
      </div>
    </div>
  );
};

export default InputArea;