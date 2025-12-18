"use client";

// import { Container } from "@/components/ui";
import { useChatClient } from "../../use-client";
import { useRef, useState, useEffect } from "react";
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from "../../tools";
import { SendIcon, SonaChatIcon, VoiceChatIcon } from '../../icons'

export default function ChatBox() {
    const [isOpen, setIsOpen] = useState(false)
    const [chat, setChat] = useState("");
    const [hasGreeted, setHasGreeted] = useState(false);
    const scroll = useRef<any>(null)
    const chatContainerRef = useRef<any>(null)
    const [leadId, setLeadId] = useState<string>('');
    const [sessionId, setSessionId] = useState<string>('');
    const [isInitialized, setIsInitialized] = useState(false);
    const [isReturningUser, setIsReturningUser] = useState(false);

    // Initialize IDs safely on client side only
    useEffect(() => {
      // Generate or retrieve leadId from localStorage
      let storedLeadId = null;
      try {
          storedLeadId = localStorage.getItem('chatLeadId');
      } catch (error) {
          console.error('localStorage access failed:', error);
      }

      if (storedLeadId) {
          setLeadId(storedLeadId);
          setIsReturningUser(true);
      } else {
          const newLeadId = `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          try {
              localStorage.setItem('chatLeadId', newLeadId);
          } catch (error) {
              console.error('localStorage write failed:', error);
          }
          setLeadId(newLeadId);
          setIsReturningUser(false);
      }

      // Generate session ID (changes per session)
      const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      
      setIsInitialized(true);
    }, []);

    const { messages, setMessages, sendMessage, requestGreeting, setIsTyping, isConnected, isTyping } = useChatClient(
        leadId,
        "lead",
        sessionId
    );


    const handler = {
        sendMessage(){
            if (!chat.trim()) return; 
            
            const userMessage = {
                role: "user" as const,
                content: chat,
                timestamp: new Date().toISOString()
            };
            
            setMessages((prev) => [...prev, userMessage]);
            
            // Send to server
            sendMessage(leadId, process.env.NEXT_PUBLIC_SONA_AGENT_ID as string, chat);
            setChat("")
        },

        keyPress(e: React.KeyboardEvent<HTMLTextAreaElement>) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); 
                handler.sendMessage();
            }
        },

        chatToggle(action?: string){
            if(action === "close"){
                setIsOpen(false)
                setChat("")
            } else {
                setIsOpen(true)
            }
        },

        clearHistory() {
            if (confirm('Are you sure you want to clear your chat history and start fresh?')) {
                try {
                    localStorage.removeItem('chatLeadId');
                    window.location.reload();
                } catch (error) {
                    console.error('Failed to clear history:', error);
                }
            }
        }
    }

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // Request greeting from backend when chat opens
    useEffect(() => {
        if (isOpen && !hasGreeted && messages.length === 0 && isInitialized) {
            setIsTyping(true)

           const instantGreeting = {
                role: "assistant" as const,
                content: isReturningUser 
                    ? "👋 Welcome back! It's great to see you again. Would you like to continue from where we stopped or start afresh? To start afresh, click the button above"
                    : "Hello! 👋 I'm Sona, your AI assistant.",
                timestamp: new Date().toISOString()
            };
            
            setMessages([instantGreeting]);

            if(isConnected){
                setTimeout(() => requestGreeting(
                    process.env.NEXT_PUBLIC_SONA_AGENT_ID as string,
                    leadId
                ).then(() => {
                    setHasGreeted(true)
                }), 1000)
            }
        }
    }, [isOpen, hasGreeted, messages.length, isConnected, requestGreeting, leadId, isInitialized, isReturningUser]);

    // Message animation variants
    const messageVariants: any = {
        hidden: { 
            opacity: 0, 
            y: 20,
            scale: 0.95
        },
        visible: { 
            opacity: 1, 
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 1
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.2 }
        }
    };

    // Typing indicator animation
    const typingVariants: any = {
        hidden: { opacity: 0, y: 10 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 25
            }
        },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
    };

    if (!isInitialized) {
        return (
            <div className='w-full px-5 md:p-0 md:max-w-7xl mx-auto'>
                <div 
                className="w-full fixed bottom-10 right-5 md:right-25 lg:right-50 z-20 flex flex-col gap-3"
                // className="w-full fixed bottom-10 right-5 md:right-[100px] lg:right-[200px] z-20 flex flex-col gap-3"
                >
                    <div className='flex justify-end'>
                        <SonaChatIcon className='cursor-pointer opacity-50' />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='w-full px-5 md:p-0 md:max-w-7xl mx-auto'>
            <div id="chatbot" className="w-full fixed bottom-10 right-5 md:right-[5%] z-20 flex flex-col gap-3">
                <AnimatePresence>
                    {
                        isOpen && (
                            <div className='flex justify-end'>
                                <motion.div 
                                initial={{ opacity: 0, scale: 0.75, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.75, y: 20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="flex ml-10 md:ml-0 md:mt-2 w-[90%] md:w-100 p-2 bg-white rounded-2xl shadow-xl flex-col border border-gray-500/20"
                                >
                                    {/* Close Button */}
                                    <div className="bg-transparent text-white px-4 py-2 rounded-t-2xl flex justify-between items-center">
                                        {/* {isReturningUser && ( */}
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="text-xs bg-[#5F3DF4] text-white px-2 py-1 rounded-full"
                                            >
                                                {isReturningUser ? '✨ Returning User' : '✨ New User'}
                                            </motion.span>
                                        {/* )} */}
                                        <button 
                                            id="closeChat" 
                                            className="text-gray-900 cursor-pointer hover:scale-110 transition-transform ml-auto" 
                                            onClick={() => handler.chatToggle("close")}
                                        >
                                            ✖
                                        </button>
                                    </div>

                                    {/* Header */}
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="w-full flex justify-between p-3 text-sm"
                                    >
                                        <SonaChatIcon size={40} />
                                        <button 
                                            onClick={handler.clearHistory}
                                            className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                                            title="Start as new user"
                                        >
                                            🔄 Start Fresh
                                        </button>
                                        {/* <h1 className='text-2xl font-bold mt-4'>Chat with Sona</h1> */}
                                    </motion.div>

                                    {/* Chat messages */}
                                    <div 
                                        ref={chatContainerRef}
                                        className='flex chatbox overflow-y-auto flex-col gap-5 mb-5 h-50 md:h-75 px-2'
                                    >
                                        <AnimatePresence mode="popLayout">
                                            {
                                                messages.map((message: any, idx) => (
                                                    <motion.div  
                                                        key={`${message.timestamp}-${idx}`}
                                                        variants={messageVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                        layout
                                                        className={cn('flex w-full', message.role === "assistant" && "justify-end")} 
                                                    >
                                                        <motion.div
                                                            className={cn(
                                                                'w-[90%] p-3 rounded-lg bg-[#F7F7F7] text-[#3D3D3D] shadow-sm', 
                                                                message?.role === "assistant" && "bg-[#5F3DF4] text-white"
                                                            )} 
                                                            whileHover={{ scale: 1.02 }}
                                                            transition={{ type: "spring", stiffness: 400 }}
                                                        >
                                                            <span className='text-sm whitespace-pre-wrap word-break-words'>
                                                                {message.content}
                                                            </span>
                                                        </motion.div>
                                                    </motion.div>
                                                ))
                                            }
                                            
                                            {/* Typing Indicator */}
                                            {isTyping && (
                                                <motion.div 
                                                    key="typing-indicator"
                                                    variants={typingVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    className="flex w-full justify-end"
                                                >
                                                    <div className="w-[90%] p-3 rounded-lg bg-[#5F3DF4] text-white shadow-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex gap-1">
                                                                <motion.span 
                                                                    className="w-2 h-2 bg-white rounded-full"
                                                                    animate={{ y: [0, -8, 0] }}
                                                                    transition={{ 
                                                                        duration: 0.6, 
                                                                        repeat: Infinity,
                                                                        ease: "easeInOut"
                                                                    }}
                                                                />
                                                                <motion.span 
                                                                    className="w-2 h-2 bg-white rounded-full"
                                                                    animate={{ y: [0, -8, 0] }}
                                                                    transition={{ 
                                                                        duration: 0.6, 
                                                                        repeat: Infinity,
                                                                        ease: "easeInOut",
                                                                        delay: 0.2
                                                                    }}
                                                                />
                                                                <motion.span 
                                                                    className="w-2 h-2 bg-white rounded-full"
                                                                    animate={{ y: [0, -8, 0] }}
                                                                    transition={{ 
                                                                        duration: 0.6, 
                                                                        repeat: Infinity,
                                                                        ease: "easeInOut",
                                                                        delay: 0.4
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-xs opacity-75">Sona is typing</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        
                                        {/* Scroll anchor */}
                                        <div ref={scroll} />
                                    </div>

                                    {/* Input field */}
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="p-2 flex justify-between items-center relative"
                                    >
                                        <textarea
                                            onChange={e => setChat(e.target.value)}
                                            onKeyDown={(e) => handler.keyPress(e)}
                                            value={chat}
                                            placeholder="Ask me anything..." 
                                            className={
                                                `w-full chatbox p-3 text-sm border rounded-lg bg-[#F7F7F7] focus:outline-none focus:ring-2 focus:border-transparent 
                                                border-gray-300 focus:ring-[#5F3DF4] disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none`
                                            }
                                            disabled={isTyping}
                                            rows={1}
                                        />
                                        <motion.button 
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className='absolute top-1/2 -translate-y-1/2 right-5 cursor-pointer'
                                            disabled={isTyping || !chat.trim()}
                                        >
                                            {
                                                chat.trim().length 
                                                ? <SendIcon className='text-[#5F3DF4]' click={() => handler.sendMessage()} />
                                                : <div title='Voice recording'><VoiceChatIcon className='text-[#5F3DF4]' /></div>
                                            }
                                        </motion.button>
                                    </motion.div>
                                </motion.div>
                            </div>
                        )
                    }
                </AnimatePresence>
                <div className='flex justify-end'>
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <SonaChatIcon 
                            className='cursor-pointer' 
                            click={() => handler.chatToggle()}
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}