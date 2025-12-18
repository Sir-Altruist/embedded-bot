'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../tools'; // Make sure this import works

export default function EmbedChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [chat, setChat] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const scroll = useRef<HTMLDivElement>(null);

  const handler = {
    chatToggle: (action?: string) => {
      if (action === "close") {
        setIsOpen(false);
      } else {
        setIsOpen(!isOpen);
      }
    },
    
    sendMessage: async () => {
      if (!chat.trim() || isTyping) return;
      
      const userMessage = { 
        role: "user", 
        content: chat,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setChat('');
      setIsTyping(true);

      try {
        const response = await fetch('/api/rag', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: chat,
            history: messages 
          }),
        });

        const data = await response.json();
        
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.response || "I'm here to help!",
          timestamp: Date.now()
        }]);
      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: Date.now()
        }]);
      } finally {
        setIsTyping(false);
      }
    },

    keyPress: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handler.sendMessage();
      }
    },

    clearHistory: () => {
      setMessages([]);
      setIsReturningUser(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('chatHistory');
      }
    }
  };

  // Auto-scroll effect
  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load chat history on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem('chatHistory');
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          setMessages(parsed);
          setIsReturningUser(true);
        } catch (e) {
          console.error('Failed to load chat history', e);
        }
      }
    }
  }, []);

  // Save chat history
  useEffect(() => {
    if (messages.length > 0 && typeof window !== 'undefined') {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  const messageVariants: any = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  const typingVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2 }
    },
    exit: { opacity: 0, transition: { duration: 0.1 } }
  };

  // return (
  //   <div className='w-full h-screen overflow-hidden' style={{ background: 'transparent' }}>
  //     <div className="w-full fixed bottom-0 right-0 z-9999 flex flex-col gap-3 p-5">
  //       <AnimatePresence>
  //         {isOpen && (
  //           <div className='flex justify-end'>
  //             <motion.div 
  //               initial={{ opacity: 0, scale: 0.75, y: 20 }}
  //               animate={{ opacity: 1, scale: 1, y: 0 }}
  //               exit={{ opacity: 0, scale: 0.75, y: 20 }}
  //               transition={{ type: "spring", stiffness: 300, damping: 25 }}
  //               className="flex w-full max-w-100 p-2 bg-white rounded-2xl shadow-2xl flex-col border border-gray-500/20"
  //             >
  //               {/* Header */}
  //               <div className="bg-transparent text-white px-4 py-2 rounded-t-2xl flex justify-between items-center">
  //                 <motion.span
  //                   initial={{ opacity: 0, x: -10 }}
  //                   animate={{ opacity: 1, x: 0 }}
  //                   className="text-xs bg-[#5F3DF4] text-white px-2 py-1 rounded-full"
  //                 >
  //                   {isReturningUser ? '✨ Returning User' : '✨ New User'}
  //                 </motion.span>
  //                 <button 
  //                   className="text-gray-900 cursor-pointer hover:scale-110 transition-transform ml-auto" 
  //                   onClick={() => handler.chatToggle("close")}
  //                 >
  //                   ✖
  //                 </button>
  //               </div>

  //               {/* Logo */}
  //               <motion.div 
  //                 initial={{ opacity: 0, y: -10 }}
  //                 animate={{ opacity: 1, y: 0 }}
  //                 transition={{ delay: 0.1 }}
  //                 className="w-full flex justify-between p-3 text-sm"
  //               >
  //                 <div className="w-10 h-10 bg-[#5F3DF4] rounded-full flex items-center justify-center text-white font-bold">
  //                   S
  //                 </div>
  //                 <button 
  //                   onClick={handler.clearHistory}
  //                   className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
  //                   title="Start as new user"
  //                 >
  //                   🔄 Start Fresh
  //                 </button>
  //               </motion.div>

  //               {/* Chat messages */}
  //               <div 
  //                 ref={chatContainerRef}
  //                 className='flex overflow-y-auto flex-col gap-5 mb-5 px-2'
  //                 style={{ height: '400px', scrollbarWidth: 'thin' }}
  //               >
  //                 <AnimatePresence 
  //                 // mode="popLayout"
  //                 >
  //                   {messages.map((message, idx) => (
  //                     <motion.div  
  //                       key={`${message.timestamp}-${idx}`}
  //                       variants={messageVariants}
  //                       initial="hidden"
  //                       animate="visible"
  //                       exit="exit"
  //                       layout
  //                       className={cn('flex w-full', message.role === "assistant" && "justify-end")} 
  //                     >
  //                       <motion.div
  //                         className={cn(
  //                           'w-[90%] p-3 rounded-lg bg-[#F7F7F7] text-[#3D3D3D] shadow-sm', 
  //                           message?.role === "assistant" && "bg-[#5F3DF4] text-white"
  //                         )} 
  //                         whileHover={{ scale: 1.02 }}
  //                         transition={{ type: "spring", stiffness: 400 }}
  //                       >
  //                         <span className='text-sm whitespace-pre-wrap wrap-break-word'>
  //                           {message.content}
  //                         </span>
  //                       </motion.div>
  //                     </motion.div>
  //                   ))}
                    
  //                   {/* Typing Indicator */}
  //                   {isTyping && (
  //                     <motion.div 
  //                       key="typing-indicator"
  //                       variants={typingVariants}
  //                       initial="hidden"
  //                       animate="visible"
  //                       exit="exit"
  //                       className="flex w-full justify-end"
  //                     >
  //                       <div className="w-[90%] p-3 rounded-lg bg-[#5F3DF4] text-white shadow-sm">
  //                         <div className="flex items-center gap-2">
  //                           <div className="flex gap-1">
  //                             {[0, 0.2, 0.4].map((delay, i) => (
  //                               <motion.span 
  //                                 key={i}
  //                                 className="w-2 h-2 bg-white rounded-full"
  //                                 animate={{ y: [0, -8, 0] }}
  //                                 transition={{ 
  //                                   duration: 0.6, 
  //                                   repeat: Infinity,
  //                                   ease: "easeInOut",
  //                                   delay
  //                                 }}
  //                               />
  //                             ))}
  //                           </div>
  //                           <span className="text-xs opacity-75">Sona is typing</span>
  //                         </div>
  //                       </div>
  //                     </motion.div>
  //                   )}
  //                 </AnimatePresence>
                  
  //                 <div ref={scroll} />
  //               </div>

  //               {/* Input field */}
  //               <motion.div 
  //                 initial={{ opacity: 0, y: 10 }}
  //                 animate={{ opacity: 1, y: 0 }}
  //                 transition={{ delay: 0.2 }}
  //                 className="p-2 flex justify-between items-center relative"
  //               >
  //                 <textarea
  //                   onChange={e => setChat(e.target.value)}
  //                   onKeyDown={handler.keyPress}
  //                   value={chat}
  //                   placeholder="Ask me anything..." 
  //                   className="w-full p-3 pr-12 text-sm border rounded-lg bg-[#F7F7F7] focus:outline-none focus:ring-2 focus:border-transparent border-gray-300 focus:ring-[#5F3DF4] disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none"
  //                   disabled={isTyping}
  //                   rows={1}
  //                 />
  //                 <motion.button 
  //                   whileHover={{ scale: 1.1 }}
  //                   whileTap={{ scale: 0.95 }}
  //                   className='absolute top-1/2 -translate-y-1/2 right-5 cursor-pointer disabled:opacity-50'
  //                   disabled={isTyping || !chat.trim()}
  //                   onClick={handler.sendMessage}
  //                 >
  //                   <span className='text-[#5F3DF4] text-xl'>
  //                     {chat.trim().length ? '➤' : '🎤'}
  //                   </span>
  //                 </motion.button>
  //               </motion.div>
  //             </motion.div>
  //           </div>
  //         )}
  //       </AnimatePresence>

  //       {/* Chat toggle button */}
  //       <div className='flex justify-end'>
  //         <motion.div
  //           whileHover={{ scale: 1.1, rotate: 5 }}
  //           whileTap={{ scale: 0.9 }}
  //           transition={{ type: "spring", stiffness: 400, damping: 17 }}
  //         >
  //           <button
  //             onClick={() => handler.chatToggle()}
  //             className="w-16 h-16 bg-[#5F3DF4] rounded-full flex items-center justify-center shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
  //           >
  //             <span className="text-white text-2xl font-bold">
  //               {isOpen ? '✕' : '💬'}
  //             </span>
  //           </button>
  //         </motion.div>
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'transparent',
      position: 'fixed',
      top: 0,
      left: 0,
      pointerEvents: 'none',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pointerEvents: 'auto'
      }}>
        {/* Chat Window */}
        {isOpen && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '12px'
          }}>
            <div style={{
              width: '400px',
              maxWidth: '90vw',
              padding: '8px',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid rgba(0,0,0,0.1)'
            }}>
              {/* Header */}
              <div style={{
                background: 'transparent',
                color: 'white',
                padding: '16px',
                borderRadius: '16px 16px 0 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '12px',
                  background: '#5F3DF4',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '999px'
                }}>
                  {isReturningUser ? '✨ Returning User' : '✨ New User'}
                </span>
                <button 
                  onClick={() => handler.chatToggle("close")}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3D3D3D',
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '4px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  ✖
                </button>
              </div>

              {/* Logo and Clear */}
              <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px',
                fontSize: '14px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: '#5F3DF4',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  S
                </div>
                <button 
                  onClick={handler.clearHistory}
                  style={{
                    fontSize: '12px',
                    color: '#666',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  title="Start as new user"
                >
                  🔄 Start Fresh
                </button>
              </div>

              {/* Chat Messages */}
              <div 
                ref={chatContainerRef}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  marginBottom: '20px',
                  height: '400px',
                  padding: '8px',
                  overflowY: 'auto'
                }}
              >
                {messages.map((message, idx) => (
                  <div  
                    key={`${message.timestamp}-${idx}`}
                    style={{
                      display: 'flex',
                      width: '100%',
                      justifyContent: message.role === "assistant" ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      width: '90%',
                      padding: '12px',
                      borderRadius: '8px',
                      background: message.role === "assistant" ? '#5F3DF4' : '#F7F7F7',
                      color: message.role === "assistant" ? 'white' : '#3D3D3D',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      fontSize: '14px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {message.content}
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div style={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'flex-end'
                  }}>
                    <div style={{
                      width: '90%',
                      padding: '12px',
                      borderRadius: '8px',
                      background: '#5F3DF4',
                      color: 'white',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <span style={{ 
                            width: '8px', 
                            height: '8px', 
                            background: 'white', 
                            borderRadius: '50%',
                            display: 'inline-block'
                          }} />
                          <span style={{ 
                            width: '8px', 
                            height: '8px', 
                            background: 'white', 
                            borderRadius: '50%',
                            display: 'inline-block'
                          }} />
                          <span style={{ 
                            width: '8px', 
                            height: '8px', 
                            background: 'white', 
                            borderRadius: '50%',
                            display: 'inline-block'
                          }} />
                        </div>
                        <span style={{ fontSize: '12px', opacity: 0.75 }}>Sona is typing</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={scroll} />
              </div>

              {/* Input Field */}
              <div style={{
                padding: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative'
              }}>
                <textarea
                  onChange={e => setChat(e.target.value)}
                  onKeyDown={handler.keyPress}
                  value={chat}
                  placeholder="Ask me anything..." 
                  disabled={isTyping}
                  rows={1}
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingRight: '48px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    background: '#F7F7F7',
                    outline: 'none',
                    resize: 'none',
                    opacity: isTyping ? 0.5 : 1,
                    cursor: isTyping ? 'not-allowed' : 'text'
                  }}
                />
                <button 
                  disabled={isTyping || !chat.trim()}
                  onClick={handler.sendMessage}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '20px',
                    transform: 'translateY(-50%)',
                    cursor: (isTyping || !chat.trim()) ? 'not-allowed' : 'pointer',
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    opacity: (isTyping || !chat.trim()) ? 0.5 : 1,
                    color: '#5F3DF4'
                  }}
                >
                  {chat.trim().length ? '➤' : '🎤'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => handler.chatToggle()}
            style={{
              width: '64px',
              height: '64px',
              background: '#5F3DF4',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(95, 61, 244, 0.3)',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(95, 61, 244, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(95, 61, 244, 0.3)';
            }}
          >
            <span style={{
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              {isOpen ? '✕' : '💬'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}