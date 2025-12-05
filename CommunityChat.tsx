
import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, MoreVertical, Smile, MessageCircle, Bell, Volume2, Trash2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { getChatResponses } from '../services/geminiService';

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'Hassan (Mogadishu)', text: 'Has anyone sent to MTN Uganda today? How is the speed?', isUser: false, timestamp: '10:00 AM', avatarColor: 'bg-blue-500' },
  { id: '2', sender: 'Sarah (Kampala)', text: 'Yes, I received one 10 mins ago. It was instant!', isUser: false, timestamp: '10:05 AM', avatarColor: 'bg-purple-500' },
  { id: '3', sender: 'Abdi Trader', text: 'The rate is good today at 3750. Better than yesterday.', isUser: false, timestamp: '10:12 AM', avatarColor: 'bg-orange-500' },
];

const AVATAR_COLORS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'];
const TYPING_USERS = ['Abdi', 'Sarah', 'Kintu', 'Fatuma', 'Hassan', 'Unknown User', 'Mama Samia'];
const SUPPORT_PHONE = '256779334452'; // Admin WhatsApp Line

const CommunityChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [typingUser, setTypingUser] = useState<string | null>(null);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUser]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      text: inputText,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    
    // Pick a random typer to simulate activity
    const randomTyper = TYPING_USERS[Math.floor(Math.random() * TYPING_USERS.length)];
    setTypingUser(randomTyper);

    try {
        // Call Gemini to simulate community response with a minimum delay for realism
        const [responses] = await Promise.all([
            getChatResponses(inputText, messages),
            new Promise(resolve => setTimeout(resolve, 2500)) // 2.5s delay to show typing indicator
        ]);
        
        if (responses.length > 0) {
            const newResponses = responses.map((resp, idx) => ({
                id: (Date.now() + idx + 1).toString(),
                sender: resp.sender,
                text: resp.text,
                isUser: false,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
            }));
            setMessages(prev => [...prev, ...newResponses]);
        }
    } catch (error) {
        console.error("Chat error:", error);
    } finally {
        setTypingUser(null);
    }
  };

  const startWhatsAppChat = () => {
    const message = `Hello, I have an inquiry about SomalUganda Remit.`;
    const url = `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleClearChat = () => {
      setMessages([]);
      setShowSettings(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden animate-fade-in border border-gray-200 dark:border-gray-700">
      
      {/* Chat Header */}
      <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 border-b border-emerald-100 dark:border-emerald-900/50 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 dark:bg-emerald-800 p-2 rounded-full">
            <Users className="text-emerald-700 dark:text-emerald-100 w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">Community Chat</h2>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              24 users online
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={startWhatsAppChat}
                className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
            >
                <MessageCircle size={16} fill="white" className="text-white" />
                <span className="hidden sm:inline">WhatsApp Admin</span>
                <span className="sm:hidden">Admin</span>
            </button>
            
            <div className="relative">
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className={`ml-1 p-1 rounded-full transition-colors ${showSettings ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-200' : 'text-gray-400 dark:text-gray-400 hover:text-gray-600 hover:bg-emerald-100/50 dark:hover:text-gray-200 dark:hover:bg-gray-700'}`}
                >
                  <MoreVertical size={20} />
                </button>

                {showSettings && (
                    <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowSettings(false)}></div>
                        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-40 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-4 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                                <h3 className="font-bold text-gray-800 dark:text-white text-sm">Chat Preferences</h3>
                            </div>
                            
                            <div className="p-2">
                                <div 
                                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors" 
                                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${notificationsEnabled ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-700'}`}>
                                            <Bell size={16} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Notifications</span>
                                    </div>
                                    <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${notificationsEnabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                                    </div>
                                </div>

                                <div 
                                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors" 
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${soundEnabled ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-700'}`}>
                                            <Volume2 size={16} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Sound Effects</span>
                                    </div>
                                    <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${soundEnabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                                    </div>
                                </div>
                                
                                <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                                <button 
                                    onClick={handleClearChat}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 transition-colors text-left group"
                                >
                                    <div className="p-2 rounded-full bg-red-50 group-hover:bg-red-100 dark:bg-red-900/50 dark:group-hover:bg-red-900 transition-colors">
                                        <Trash2 size={16} />
                                    </div>
                                    <span className="text-sm font-medium">Clear Chat History</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50 scrollbar-thin">
        {messages.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                <MessageCircle size={48} className="mb-2 opacity-20" />
                <p className="text-sm">No messages yet. Start the conversation!</p>
             </div>
        ) : (
            messages.map((msg) => (
            <div 
                key={msg.id} 
                className={`flex items-end gap-2 ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0
                ${msg.isUser ? 'bg-slate-700 dark:bg-slate-600' : (msg.avatarColor || 'bg-gray-400')}
                `}>
                {msg.sender.charAt(0).toUpperCase()}
                </div>

                {/* Bubble */}
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm
                ${msg.isUser 
                    ? 'bg-emerald-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-bl-none'}
                `}>
                {!msg.isUser && <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 mb-0.5">{msg.sender}</p>}
                <p>{msg.text}</p>
                <p className={`text-[10px] mt-1 text-right ${msg.isUser ? 'text-emerald-100' : 'text-gray-400 dark:text-gray-500'}`}>
                    {msg.timestamp}
                </p>
                </div>
            </div>
            ))
        )}
        {typingUser && (
          <div className="flex items-end gap-2 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 animate-pulse">
               {typingUser.charAt(0)}
            </div>
            <div>
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 ml-1 mt-1 font-medium">{typingUser} is typing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          <button type="button" className="text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-2">
            <Smile size={24} />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message to the community..."
            className="flex-grow bg-gray-100 dark:bg-gray-700 border-0 rounded-full px-4 py-3 focus:ring-2 focus:ring-emerald-500 dark:text-white transition-all outline-none"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim() || !!typingUser}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:dark:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-full shadow-md transition-all flex-shrink-0"
          >
            <Send size={20} />
          </button>
        </form>
      </div>

    </div>
  );
};

export default CommunityChat;
