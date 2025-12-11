import React from 'react';
import { motion } from 'framer-motion';
import { Message, Role } from '../types';
import { User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  // Custom configuration for ReactMarkdown
  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      
      // Block Code
      if (!inline && match) {
        return (
          <div className="rounded-lg overflow-hidden my-3 shadow-md border border-gray-200 dark:border-gray-800">
            <SyntaxHighlighter
              {...props}
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              customStyle={{
                margin: 0,
                padding: '1.25rem',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                backgroundColor: '#1e1e1e', // Matches vscDarkPlus background
              }}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
        );
      }

      // Inline Code
      return (
        <code 
          className="font-mono text-xs md:text-sm bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700/50 break-words" 
          {...props}
        >
          {children}
        </code>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 30 
      }}
      className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[90%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg mt-1 ${isUser ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
          {isUser ? <User size={16} className="text-gray-500 dark:text-gray-300" /> : <Sparkles size={16} className="text-white" />}
        </div>

        {/* Content */}
        <div className={`flex flex-col gap-2 min-w-0 w-full ${isUser ? 'items-end' : 'items-start'}`}>
          
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {message.attachments.map((att, idx) => (
                <img 
                  key={idx}
                  src={att.previewUrl || `data:${att.mimeType};base64,${att.data}`} 
                  alt="attachment" 
                  className="h-32 w-auto rounded-lg border border-gray-200 dark:border-gray-700 object-cover shadow-md"
                />
              ))}
            </div>
          )}

          {/* Text Bubble */}
          <div 
            className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed overflow-hidden w-full ${
              isUser 
                ? 'bg-white text-gray-900 border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 rounded-tr-sm' 
                : 'bg-transparent text-gray-800 dark:text-gray-200 border border-transparent pl-0 pt-1'
            }`}
          >
            {isUser ? (
               <div className="whitespace-pre-wrap font-sans">{message.text}</div>
            ) : (
               <div className="markdown-body font-sans">
                 <ReactMarkdown components={components}>
                    {message.text}
                 </ReactMarkdown>
               </div>
            )}
            
            {message.isStreaming && (
               <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-indigo-400 animate-pulse rounded-full" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;