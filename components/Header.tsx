
import React from 'react';
import { Search, Bell, Camera, Command, Phone } from 'lucide-react';
import { UserProfile, AppRoute } from '../types';
import { NAVIGATION_ITEMS } from '../constants/navigation';

interface HeaderProps {
  onRecordClick: () => void;
  onProfileClick: () => void;
  onSearch: (query: string) => void;
  onScreenshotClick: (mode: 'fullscreen' | 'window' | 'region' | 'scrolling') => void;
  onMinimize: () => void;
  onContactSales?: () => void;
  user: UserProfile;
  currentRoute: string;
  setRoute: (route: string) => void;
  isDevMode?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onRecordClick, 
  onProfileClick, 
  onSearch, 
  onScreenshotClick,
  onMinimize,
  onContactSales,
  user, 
  currentRoute, 
  setRoute,
  isDevMode
}) => {
  const isActive = (routeId: string) => {
    if (routeId === AppRoute.SPACES_ALL) {
      return currentRoute.startsWith('spaces');
    }
    return currentRoute === routeId;
  };

  return (
    <header className="h-20 bg-white px-6 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
      {/* Search Section (Branding Removed) */}
      <div className="flex-none flex items-center gap-6">
        <div 
          onClick={() => onSearch('')} 
          className="relative group w-64 cursor-text"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-hover:text-indigo-500 transition-colors" />
          <div className="w-full border border-gray-100 rounded-2xl py-2 pl-9 pr-4 text-sm bg-gray-50/50 hover:bg-gray-50 hover:border-indigo-200 transition-all font-medium text-gray-400 flex items-center justify-between">
            <span>Search Productions...</span>
            <div className="flex items-center gap-1 opacity-50">
              <Command className="w-3 h-3" />
              <span className="text-[10px]">K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Area */}
      <nav className="flex-1 flex items-center justify-center gap-2 h-full min-w-max">
        {NAVIGATION_ITEMS.map((tab) => {
          const active = isActive(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => setRoute(tab.id)}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all group ${
                active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'} transition-colors`} />
              <span className="text-[13px] font-bold">
                {tab.label}
              </span>
            </button>
          );
        })}

        <div className="w-px h-6 bg-gray-100 mx-2"></div>

        <button
          onClick={() => setRoute(AppRoute.CAPTURES)}
          className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all group ${
            currentRoute === AppRoute.CAPTURES ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Camera className={`w-4 h-4 ${currentRoute === AppRoute.CAPTURES ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'} transition-colors`} />
          <span className="text-[13px] font-bold">
            Snap
          </span>
        </button>
      </nav>

      {/* Action Section */}
      <div className="flex-none flex items-center justify-end gap-3 pl-4">
        {onContactSales && (
          <button 
            onClick={onContactSales}
            className="hidden xl:flex items-center gap-2 px-2.5 h-5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors leading-none"
          >
            <Phone className="w-3 h-3" />
            <span className="text-[9px] font-black uppercase tracking-wide">Contact Sales</span>
          </button>
        )}

        <button 
          onClick={onRecordClick}
          className="bg-slate-950 hover:bg-black text-white px-3 h-6 rounded-lg text-[11px] font-black shadow-lg shadow-slate-100 transition-all active:scale-95 leading-none animate-blink"
        >
          New Show
        </button>

        <button 
          className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-all relative border border-gray-50"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </button>

        <div 
          onClick={onProfileClick}
          className="flex items-center cursor-pointer group p-1 rounded-2xl hover:bg-gray-50 transition-all"
        >
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-9 h-9 rounded-xl border-2 border-white shadow-sm group-hover:ring-2 group-hover:ring-indigo-500 transition-all object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
