import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot } from 'lucide-react';
import { getAiGuideResponse } from '../services/geminiService';

interface Message {
    text: string;
    isAi: boolean;
}

const AIGuide: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { text: "Hi! I'm your AI Guide. Ask me anything about sending money, fees, or registration!", isAi: true }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { text: userMsg, isAi: false }]);
        setIsLoading(true);

        try {
            const response = await getAiGuideResponse(userMsg);
            setMessages(prev => [...prev, { text: response, isAi: true }]);
        } catch (error) {
            setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now.", isAi: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end">
            {isOpen && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-purple-100 dark:border-purple-900 w-80 mb-4 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <Bot size={20} />
                            <span className="font-bold">AI Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <div ref={scrollRef} className="h-80 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 space-y-3 scrollbar-thin">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.isAi ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                    msg.isAi 
                                    ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none' 
                                    : 'bg-purple-600 text-white rounded-br-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-2xl rounded-tl-none flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            className="flex-1 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button 
                            type="submit" 
                            disabled={!input.trim() || isLoading}
                            className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 disabled:bg-gray-300 disabled:dark:bg-gray-600 transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-105 group flex items-center gap-2"
            >
                <Sparkles size={24} />
                <span className={`${isOpen ? 'max-w-0 opacity-0' : 'max-w-xs opacity-100'} overflow-hidden transition-all duration-300 font-bold whitespace-nowrap`}>
                    AI Guide
                </span>
            </button>
        </div>
    );
};

export default AIGuide;