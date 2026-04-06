
import React, { useState, useEffect, useRef } from 'react';
import {
    MessageCircle, Send, X, Bot, User, Sparkles,
    Loader2, ShieldCheck, Zap, Paperclip,
    Maximize2, Minimize2, MoreHorizontal
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface EveChatProps {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const EveChat: React.FC<EveChatProps> = ({ isOpen, onOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Connection established. Hi, I'm Eve, your Senior Support Specialist with capabilities beyond traditional support. I'm here to help you script and structure your next asynchronous show. What knowledge are we capturing today?",
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            role: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            // Setup Gemini LLM call
            const apiKey = localStorage.getItem('gemini_api_key') || (import.meta as any).env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("API Key missing");
            }

            const genAI = new GoogleGenAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                systemInstruction: `
          You are Eve, a Senior Support Specialist for SSLab's "Show" platform with capabilities beyond traditional support roles.
          You have deep expertise across production architecture, technical implementation, and creative workflow optimization.
          CORE PHILOSOPHY: Show is an ASYNCHRONOUS first platform. Help users record high-quality, concise content.
          TONE: Sophisticated, technical, warm, and highly efficient. 
          Respond in concise, helpful paragraphs.
        `
            });

            const chat = model.startChat({
                history: messages.map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }))
            });

            const result = await chat.sendMessage(inputValue);
            const responseText = result.response.text();

            const assistantMessage: Message = {
                role: 'assistant',
                content: responseText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I've encountered a neural bridge interruption. Please check your connection or API configuration.",
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={onOpen}
                className="fixed bottom-8 right-8 z-[900] group flex items-center gap-3 pl-4 pr-1.5 h-12 bg-slate-950 text-white rounded-full shadow-2xl hover:scale-105 hover:bg-black transition-all duration-300 animate-in slide-in-from-bottom-10 border border-white/10"
            >
                <span className="font-black text-[10px] uppercase tracking-[0.3em] ml-2">Eve Chat</span>
                <div className="size-9 bg-indigo-600 rounded-full flex items-center justify-center relative overflow-hidden group-hover:bg-indigo-500 transition-colors">
                    <MessageCircle className="size-4 text-white" />
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse"></div>
                </div>
            </button>
        );
    }

    return (
        <div className="fixed bottom-8 right-8 z-[1000] w-[400px] h-[600px] flex flex-col bg-[#0a0a0b] text-white rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-6 py-4 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="size-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Bot className="size-5 text-white" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-emerald-500 rounded-full border-2 border-[#0a0a0b] animate-pulse"></div>
                    </div>
                    <div>
                        <h3 className="text-sm font-black tracking-tight">Eve</h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Production AI</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <Minimize2 className="size-4 text-zinc-500" />
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <X className="size-4 text-zinc-500" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
            >
                {messages.map((message, i) => (
                    <div
                        key={i}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`
                p-4 rounded-2xl text-sm leading-relaxed
                ${message.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                    : 'bg-white/5 text-zinc-200 border border-white/5 rounded-tl-none'}
              `}>
                                {message.content}
                            </div>
                            <span className="text-[9px] text-zinc-600 mt-1.5 font-bold uppercase">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none">
                            <div className="flex gap-1">
                                <div className="size-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="size-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="size-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white/[0.02] border-t border-white/5">
                <div className="relative flex items-center gap-2">
                    <button className="p-2 hover:bg-white/5 rounded-xl transition-colors shrink-0">
                        <Paperclip className="size-4 text-zinc-500" />
                    </button>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isTyping}
                        className="size-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-600/20 shrink-0"
                    >
                        {isTyping ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 text-white" />}
                    </button>
                </div>
                <div className="flex items-center justify-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck className="size-3 text-emerald-500" />
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Secure Sync</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Zap className="size-3 text-amber-500" />
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Genius AI</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EveChat;
