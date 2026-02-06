
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Video, LayoutGrid, Users, Plus, 
  Settings, Home, Compass, MessageSquare, 
  CreditCard, Moon, Sun, ArrowRight, Command,
  FileText, LogOut, Laptop
} from 'lucide-react';
import { AppRoute, Video as VideoType } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  onRecord: () => void;
  videos: VideoType[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, 
  onClose, 
  onNavigate,
  onRecord,
  videos 
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Groups of commands
  const groups = [
    {
      label: "Actions",
      items: [
        { id: 'rec', label: 'Record new show', icon: Video, action: onRecord, shortcut: 'R' },
        { id: 'new-space', label: 'Create new space', icon: Plus, action: () => alert('New Space Modal'), shortcut: 'C' },
        { id: 'invite', label: 'Invite team members', icon: Users, action: () => alert('Invite Modal'), shortcut: 'I' },
      ]
    },
    {
      label: "Navigation",
      items: [
        { id: AppRoute.HOME, label: 'Go to Studio', icon: Home, action: () => onNavigate(AppRoute.HOME) },
        { id: AppRoute.LIBRARY, label: 'Go to Library', icon: FileText, action: () => onNavigate(AppRoute.LIBRARY) },
        { id: AppRoute.BOARDS, label: 'Go to Boards', icon: LayoutGrid, action: () => onNavigate(AppRoute.BOARDS) },
        { id: AppRoute.FOR_YOU, label: 'Explore Community', icon: Compass, action: () => onNavigate(AppRoute.FOR_YOU) },
      ]
    },
    {
      label: "Recent Productions",
      items: videos.slice(0, 3).map(v => ({
        id: v.id,
        label: v.title,
        icon: Video,
        action: () => alert(`Navigate to video: ${v.title}`), // In real app, nav to detail
        meta: v.duration
      }))
    },
    {
      label: "System",
      items: [
        { id: 'settings', label: 'Settings', icon: Settings, action: () => onNavigate(AppRoute.SETTINGS) },
        { id: 'billing', label: 'Billing & Plans', icon: CreditCard, action: () => alert('Billing') },
        { id: 'theme', label: 'Toggle Dark Mode', icon: Moon, action: () => alert('Theme Toggle') },
      ]
    }
  ];

  // Flatten items for keyboard navigation
  const allItems = groups.flatMap(g => g.items.map(i => ({ ...i, group: g.label })));
  
  // Filter based on query
  const filteredItems = allItems.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4" onClick={onClose}>
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" />
      
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-4 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            className="flex-1 text-lg outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
          />
          <div className="hidden sm:flex items-center gap-1.5">
            <kbd className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-bold text-slate-500">ESC</kbd>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {filteredItems.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500">
              <p className="text-sm font-medium">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* We'll render visually grouped, but maintain flat index for nav */}
              {groups.map((group) => {
                 const groupItems = filteredItems.filter(i => i.group === group.label);
                 if (groupItems.length === 0) return null;
                 
                 return (
                   <div key={group.label}>
                     <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                       {group.label}
                     </div>
                     {groupItems.map(item => {
                       // Find the true index in the flat list for highlighting
                       const flatIndex = filteredItems.indexOf(item);
                       const isSelected = flatIndex === selectedIndex;

                       return (
                         <button
                           key={item.id}
                           onClick={() => { item.action(); onClose(); }}
                           onMouseEnter={() => setSelectedIndex(flatIndex)}
                           className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                             isSelected ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 border-l-4 border-transparent hover:bg-slate-50'
                           }`}
                         >
                           <div className={`p-2 rounded-lg ${isSelected ? 'bg-white text-indigo-600 shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
                             <item.icon className="w-5 h-5" />
                           </div>
                           <div className="flex-1">
                             <div className={`text-sm font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{item.label}</div>
                           </div>
                           {item.shortcut && (
                             <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-400 shadow-sm">
                               {item.shortcut}
                             </kbd>
                           )}
                           {item.meta && (
                             <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                               {item.meta}
                             </span>
                           )}
                           {isSelected && <ArrowRight className="w-4 h-4 text-indigo-400" />}
                         </button>
                       );
                     })}
                   </div>
                 );
              })}
            </div>
          )}
        </div>
        
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <div className="flex items-center gap-4">
             <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 px-1 rounded">↵</kbd> to select</span>
             <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 px-1 rounded">↑↓</kbd> to navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <Laptop className="w-3 h-3" />
            <span>Show OS v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
