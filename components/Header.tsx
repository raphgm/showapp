
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Camera, Command, Phone, CheckCircle2, AlertCircle, Info, AlertTriangle, Check, Trash2 } from 'lucide-react';
import { UserProfile, AppRoute } from '../types';
import { NAVIGATION_ITEMS } from '../constants/navigation';
import { useToast } from './ToastProvider';

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
  const { notifications, unreadCount, markAllRead, clearNotifications } = useToast();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isNotifOpen]);

  const NOTIF_ICONS: Record<string, React.ElementType> = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  };
  const NOTIF_ICON_COLORS: Record<string, string> = {
    success: 'text-emerald-500',
    error: 'text-rose-500',
    info: 'text-indigo-500',
    warning: 'text-amber-500',
  };

  const formatTime = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };
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

        <div ref={notifRef} className="relative">
          <button 
            onClick={() => { setIsNotifOpen(!isNotifOpen); if (!isNotifOpen) markAllRead(); }}
            className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-all relative border border-gray-50"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-rose-500 text-white text-[10px] font-black rounded-full ring-2 ring-white px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Notifications</h3>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button onClick={clearNotifications} className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Clear all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={markAllRead} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Mark all read">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="max-h-[320px] overflow-y-auto no-scrollbar">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <Bell className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm font-semibold">No notifications yet</p>
                    <p className="text-xs opacity-60 mt-1">Actions you take will appear here</p>
                  </div>
                ) : (
                  notifications.slice(0, 15).map(notif => {
                    const NIcon = NOTIF_ICONS[notif.type] || Info;
                    return (
                      <div key={notif.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!notif.read ? 'bg-indigo-50/30' : ''}`}>
                        <div className={`mt-0.5 p-1.5 rounded-xl ${notif.type === 'success' ? 'bg-emerald-50' : notif.type === 'error' ? 'bg-rose-50' : notif.type === 'warning' ? 'bg-amber-50' : 'bg-indigo-50'}`}>
                          <NIcon className={`w-3.5 h-3.5 ${NOTIF_ICON_COLORS[notif.type]}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{notif.message}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{formatTime(notif.timestamp)}</p>
                        </div>
                        {!notif.read && <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

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
