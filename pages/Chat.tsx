
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, SquarePen, MoreHorizontal, SlidersHorizontal, Sparkles, AtSign, 
  MessageCircle, ChevronDown, MessageSquare, Users, Plus, Smile, Type, 
  SendHorizontal, Pencil, Paperclip, X, User, ArrowUpRight, Layout,
  PanelLeftClose, PanelLeftOpen, BrainCircuit, Activity, Zap
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner';

interface ChatMessage {
  id: string;
  sender: 'me' | 'them' | 'ai';
  text: string;
  timestamp: string;
}

interface ProductionSet {
  id: string;
  name: string;
}

const MOCK_USERS = [
  { id: 'u1', name: 'Sarah Chen', handle: '@sarah' },
  { id: 'u2', name: 'Marcus Lee', handle: '@marcus' },
  { id: 'u3', name: 'Raphael Gab-Momoh', handle: '@raphael' },
  { id: 'ai', name: 'Show Genius', handle: '@genius' },
];

const Chat: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('Chats');
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const [isNewMessageMode, setIsNewMessageMode] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [recipient, setRecipient] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [sets, setSets] = useState<ProductionSet[]>([
    { id: '1', name: 'General' }, { id: '2', name: 'Design Team' }, { id: '3', name: 'Engineering' }, { id: '4', name: 'Marketing Huddle' }
  ]);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [tempSetName, setTempSetName] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMessageInput(val);
    const words = val.split(' ');
    const lastWord = words[words.length - 1];
    if (lastWord.startsWith('@')) { setShowMentions(true); setMentionFilter(lastWord.slice(1).toLowerCase()); } 
    else { setShowMentions(false); }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim()) return;
    const newMsg: ChatMessage = { id: Date.now().toString(), sender: 'me', text: messageInput, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages([...messages, newMsg]);
    setMessageInput('');
    setIsNewMessageMode(false);
    setShowMentions(false);
    if (activeNav === 'Copilot') {
      setTimeout(() => {
        const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'ai', text: "I'm your Show Genius. I can help you summarize your recorded classes or find specific moments in your workspace. How can I assist today?", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages(prev => [...prev, aiMsg]);
      }, 1000);
    }
  };

  const selectNavItem = (id: string) => {
    setActiveNav(id);
    setIsNewMessageMode(false);
    if (id === 'Copilot') setMessages([{ id: 'ai-init', sender: 'ai', text: 'Hi! I am the Show Genius. Ask me anything about your productions.', timestamp: 'System' }]);
    else setMessages([]);
  };

  return (
    <div className="flex h-full bg-[#f3f2f1] overflow-hidden font-sans relative">
      <aside className={`${isSidebarOpen ? 'w-80 border-r opacity-100' : 'w-0 border-r-0 opacity-0'} transition-all duration-300 ease-in-out bg-[#f3f2f1] border-gray-200 shrink-0 flex flex-col overflow-hidden relative`}>
        <div className="w-80 flex flex-col h-full">
          <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-indigo-950 tracking-tight">Workspace Chat</h2>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsNewMessageMode(true)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors"><SquarePen className="w-4 h-4 text-indigo-600" /></button>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 hover:text-indigo-600"><PanelLeftClose className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-200/50 p-1 rounded-xl">
              {['Unread', 'Sets', 'Chats'].map(filter => (
                <button key={filter} onClick={() => { setActiveFilter(filter); setIsNewMessageMode(false); setActiveNav(null); }} className={`flex-1 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${activeFilter === filter ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{filter}</button>
              ))}
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto px-2 space-y-1">
            <button onClick={() => selectNavItem('Copilot')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeNav === 'Copilot' ? 'bg-white shadow-sm ring-1 ring-indigo-100' : 'hover:bg-gray-200'}`}>
              <div className={`size-8 rounded-lg flex items-center justify-center ${activeNav === 'Copilot' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-indigo-50'}`}><Sparkles className="w-4 h-4" /></div>
              <div className="flex-1 text-left"><div className="text-sm font-black text-indigo-950">Show Genius</div><div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Assistant</div></div>
            </button>
            {activeFilter === 'Sets' && (
              <div className="mt-4 px-2 animate-in slide-in-from-left-2 duration-300">
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Team Sets</div>
                 <div className="space-y-0.5">{sets.map(set => (
                   <button key={set.id} onClick={() => selectNavItem(set.name)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${activeNav === set.name ? 'bg-white shadow-sm text-indigo-900 ring-1 ring-gray-100' : 'hover:bg-gray-200 text-gray-600'}`}><Layout className={`w-4 h-4 transition-all ${activeNav === set.name ? 'text-indigo-600' : 'opacity-50 group-hover:text-indigo-600 group-hover:opacity-100'}`} /><span className="text-sm font-bold flex-1 text-left truncate">{set.name}</span></button>
                 ))}</div>
                 <button onClick={() => alert('New Set Modal')} className="w-full flex items-center gap-2 px-3 py-2 mt-2 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-black uppercase tracking-wide transition-all"><Plus className="w-3 h-3" /> Create New Set</button>
              </div>
            )}
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-white relative overflow-hidden">
        {/* Intelligence Background Doodles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
           <svg className="absolute top-10 right-10 w-[400px] h-[400px] text-indigo-950" viewBox="0 0 100 100">
             <path d="M10,50 Q50,0 90,50 T10,50" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1 1" />
           </svg>
           <svg className="absolute bottom-20 left-10 w-64 h-64 text-indigo-950 -rotate-12" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.2" />
              <path d="M50,20 L50,80 M20,50 L80,50" stroke="currentColor" strokeWidth="0.1" />
           </svg>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <BrainCircuit className="size-[600px] text-indigo-900" strokeWidth={0.5} />
           </div>
        </div>

        {!isSidebarOpen && (
          <div className="absolute top-4 left-4 z-10">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors shadow-sm text-gray-500 hover:text-indigo-600 border border-gray-200"><PanelLeftOpen className="w-4 h-4" /></button>
          </div>
        )}

        {!activeNav && isNewMessageMode && messages.length === 0 ? (
          <div className="flex-1 overflow-y-auto p-12 relative z-10">
            <HeroBanner 
              title={<>Your AI-Native <br />Conversation Hub.</>}
              description="Chat with teammates or consult the Show Genius to extract insights from your recorded productions instantly."
              imageUrl="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800"
              gradientFrom="from-[#10b981]"
              gradientTo="to-[#059669]"
              buttons={<button onClick={() => selectNavItem('Copilot')} className="flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-emerald-50 transition-all shadow-lg"><Sparkles className="w-4 h-4" />Try Show Genius</button>}
            />
            <div className="mt-24 flex flex-col items-center text-center space-y-6">
               <div className="p-8 bg-slate-50 rounded-full border border-slate-100 shadow-inner group relative">
                 <BrainCircuit className="w-16 h-16 text-slate-300 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-700" />
                 <div className="absolute -top-2 -right-2 bg-white rounded-xl p-2 shadow-lg border border-slate-100">
                    <Zap className="size-4 text-amber-500 fill-amber-500" />
                 </div>
               </div>
               <div className="space-y-3">
                 <h3 className="text-4xl font-black text-indigo-950 tracking-tighter">Start your workflow discussion.</h3>
                 <p className="text-slate-400 font-medium text-lg max-w-sm mx-auto leading-relaxed">Select a teammate or use the Genius to bridge communication gaps across your workspace.</p>
               </div>
            </div>
          </div>
        ) : (
          <>
            <div className={`p-4 border-b border-gray-100 flex items-center justify-between ${!isSidebarOpen ? 'pl-16' : ''} relative z-10 bg-white/80 backdrop-blur-md`}>
              <div className="flex items-center gap-4 flex-1">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">To:</span>
                <input type="text" value={recipient || (activeNav !== 'Copilot' ? activeNav : '') || ''} onChange={(e) => setRecipient(e.target.value)} placeholder="Teammate or @set" className="flex-1 outline-none text-sm font-bold text-indigo-950" />
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col relative z-10">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col max-w-[80%] ${msg.sender === 'me' ? 'self-end items-end' : 'self-start items-start'}`}>
                  <div className={`px-5 py-3.5 rounded-3xl text-sm font-medium ${msg.sender === 'me' ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg' : 'bg-gray-100 text-indigo-950 rounded-tl-none border border-gray-200'}`}>{msg.text}</div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5 px-2">{msg.timestamp}</span>
                </div>
              ))}
            </div>
            <div className="p-8 border-t border-gray-100 relative z-10 bg-white">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-4">
                <input ref={inputRef} value={messageInput} onChange={handleInputChange} placeholder="Type a message or use @ to mention..." className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 font-semibold outline-none focus:border-indigo-600 transition-all shadow-inner" />
                <button className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:translate-y-0"><SendHorizontal className="w-6 h-6" /></button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Chat;
