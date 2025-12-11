import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, Role, Attachment, ChatSession } from './types';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import TypingIndicator from './components/TypingIndicator';
import Toast from './components/Toast';
import { streamGeminiResponse } from './services/geminiService';
import { Sparkles, Menu, Plus, Sun, Moon, ArrowDown, MessageSquare, X } from 'lucide-react';
import Button from './components/Button';

// Initial welcome message
const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: Role.MODEL,
  text: "Hello! I'm Lumina. I can see, read, and think. Show me an image or ask me anything.",
  timestamp: Date.now()
};

// Reusable Sidebar Component
const Sidebar = ({ 
  sessions, 
  activeSessionId, 
  onSessionSelect, 
  onNewChat, 
  toggleTheme, 
  isDarkMode,
  onClose 
}: {
  sessions: ChatSession[];
  activeSessionId: string;
  onSessionSelect: (id: string) => void;
  onNewChat: () => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
  onClose?: () => void;
}) => {
  return (
    <div className="flex flex-col h-full">
       <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Lumina</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 -mr-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
           <div className="flex gap-2">
             <Button variant="primary" className="flex-1 justify-center gap-2 shadow-md" onClick={() => { onNewChat(); onClose?.(); }}>
               <Plus size={16} /> New Chat
             </Button>
             <Button variant="secondary" className="px-3" onClick={toggleTheme} aria-label="Toggle Theme">
               {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
             </Button>
           </div>
           
           <div className="mt-6">
             <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">History</h3>
             <div className="space-y-1">
               {sessions.map(session => (
                 <button
                   key={session.id}
                   onClick={() => { onSessionSelect(session.id); onClose?.(); }}
                   className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors truncate flex items-center gap-2 ${
                     activeSessionId === session.id 
                       ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium'
                       : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50'
                   }`}
                 >
                   <MessageSquare size={14} className={activeSessionId === session.id ? 'opacity-100' : 'opacity-50'} />
                   <span className="truncate">{session.title}</span>
                 </button>
               ))}
             </div>
           </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
           <div className="flex items-center gap-3 px-2">
             <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 flex items-center justify-center text-xs font-bold text-gray-500">
                AI
             </div>
             <div className="flex flex-col">
               <span className="text-sm font-medium">Engineer</span>
               <span className="text-xs text-gray-500">Pro Plan</span>
             </div>
           </div>
        </div>
    </div>
  );
};

function App() {
  // Session State
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'default',
      title: 'New Chat',
      messages: [WELCOME_MESSAGE],
      timestamp: Date.now()
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>('default');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Scroll & UI State
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Derived State
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Auto-Scroll Logic
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Scroll on new messages or thinking state change
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isThinking, activeSessionId]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      // Show button if user is more than 100px away from the bottom
      const isDistanceFromBottom = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isDistanceFromBottom);
    }
  };

  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    if (!activeSessionId) return;

    const currentSessionId = activeSessionId;
    const currentSession = sessions.find(s => s.id === currentSessionId);
    
    // History context
    const historyForApi = currentSession ? currentSession.messages : [];

    const userMsgId = Date.now().toString();
    const userMsg: Message = {
      id: userMsgId,
      role: Role.USER,
      text: text,
      attachments: attachments,
      timestamp: Date.now()
    };

    // 1. Add User Message
    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        const newMessages = [...session.messages, userMsg];
        
        let newTitle = session.title;
        if (session.title === 'New Chat') {
           newTitle = text.trim().slice(0, 30) || 'Image Analysis';
           if (text.length > 30) newTitle += '...';
        }
        
        return { ...session, messages: newMessages, title: newTitle };
      }
      return session;
    }));

    setIsLoading(true);
    setIsThinking(true);
    setError(null);

    try {
      const stream = streamGeminiResponse(historyForApi, text, attachments);
      let fullText = '';
      let aiMsgId: string | null = null;

      for await (const chunk of stream) {
        // First chunk received: stop thinking animation, create message
        if (!aiMsgId) {
          setIsThinking(false);
          aiMsgId = (Date.now() + 1).toString();
          
          const aiMsgPlaceholder: Message = {
            id: aiMsgId,
            role: Role.MODEL,
            text: '',
            isStreaming: true,
            timestamp: Date.now()
          };

          setSessions(prev => prev.map(session => {
            if (session.id === currentSessionId) {
              return { ...session, messages: [...session.messages, aiMsgPlaceholder] };
            }
            return session;
          }));
        }

        fullText += chunk;
        
        setSessions(prev => prev.map(session => {
          if (session.id === currentSessionId) {
            const updatedMessages = session.messages.map(msg => 
              msg.id === aiMsgId 
                ? { ...msg, text: fullText }
                : msg
            );
            return { ...session, messages: updatedMessages };
          }
          return session;
        }));
      }
      
      // Finalize message
      if (aiMsgId) {
        setSessions(prev => prev.map(session => {
          if (session.id === currentSessionId) {
            const updatedMessages = session.messages.map(msg => 
              msg.id === aiMsgId 
                ? { ...msg, isStreaming: false }
                : msg
            );
            return { ...session, messages: updatedMessages };
          }
          return session;
        }));
      }

    } catch (error: any) {
      console.error("Streaming error", error);
      setIsThinking(false);
      setError("Unable to connect to Lumina. Please check your internet connection and try again.");
    } finally {
      setIsLoading(false);
      setIsThinking(false);
    }
  };

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Chat',
      messages: [WELCOME_MESSAGE],
      timestamp: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#030712] text-gray-900 dark:text-gray-100 overflow-hidden font-sans selection:bg-indigo-500/30 transition-colors duration-300">
      
      {/* Toast Notification */}
      <Toast message={error} onClose={() => setError(null)} />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 lg:hidden shadow-2xl h-full"
            >
              <Sidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSessionSelect={setActiveSessionId}
                onNewChat={handleNewChat}
                toggleTheme={toggleTheme}
                isDarkMode={isDarkMode}
                onClose={() => setIsMobileMenuOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Hidden on mobile, visible on lg */}
      <motion.aside 
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex w-72 flex-col border-r border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-xl"
      >
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSessionSelect={setActiveSessionId}
          onNewChat={handleNewChat}
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
        />
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-[#050816] transition-colors duration-300">
        
        {/* Mobile Header - Updated Order */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsMobileMenuOpen(true)}
               className="text-gray-500 dark:text-gray-400 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
               aria-label="Open Menu"
             >
               <Menu size={24} />
             </button>
             <div className="flex items-center gap-2">
               <Sparkles className="text-indigo-500 w-5 h-5" />
               <span className="font-bold text-lg">Lumina</span>
             </div>
          </div>
          <div>
             <button onClick={toggleTheme} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
          </div>
        </div>

        {/* Chat Area */}
        <div 
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth"
        >
          <div className="max-w-3xl mx-auto flex flex-col min-h-full">
            <div className="flex-1 pb-4">
              <AnimatePresence initial={false} mode='wait'>
                <motion.div
                   key={activeSessionId} 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ duration: 0.2 }}
                >
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Typing Indicator Bubble */}
              <AnimatePresence>
                {isThinking && (
                   <TypingIndicator key="typing-indicator" />
                )}
              </AnimatePresence>

              {/* Dummy div for auto-scroll */}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>
        </div>

        {/* Scroll To Bottom Button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              onClick={() => scrollToBottom('smooth')}
              className="absolute bottom-28 right-6 md:right-10 z-30 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 p-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              aria-label="Scroll to bottom"
            >
              <ArrowDown size={20} strokeWidth={2.5} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="w-full bg-gradient-to-t from-gray-50 via-gray-50 dark:from-[#030712] dark:via-[#030712] to-transparent pt-10 transition-colors duration-300">
          <InputArea onSend={handleSendMessage} isLoading={isLoading} />
        </div>

      </main>
    </div>
  );
}

export default App;