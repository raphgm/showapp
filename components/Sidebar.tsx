
import React, { useState } from 'react';
import { 
  PanelLeftOpen,
  PanelLeftClose,
  ChevronDown,
  Circle,
  Camera,
  Shield,
  LogOut,
  Layers,
  User
} from 'lucide-react';
import { AppRoute, UserProfile, Workspace } from '../types';
import { NAVIGATION_ITEMS, SECONDARY_NAV_ITEMS, NavItem, SecondaryNavItem } from '../constants/navigation';

interface SidebarProps {
  currentRoute: string;
  setRoute: (route: string) => void;
  onRecordClick: () => void;
  onScreenshotClick: (mode: 'fullscreen' | 'window' | 'region' | 'scrolling') => void;
  onMinimize: () => void;
  user: UserProfile;
  workspace: Workspace;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentRoute, 
  setRoute, 
  onRecordClick, 
  onScreenshotClick, 
  onMinimize,
  user, 
  workspace, 
  onSignOut 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const mainNav: (NavItem | SecondaryNavItem)[] = [
    NAVIGATION_ITEMS.find(i => i.id === AppRoute.HOME)!,
    NAVIGATION_ITEMS.find(i => i.id === AppRoute.FOR_YOU)!,
    NAVIGATION_ITEMS.find(i => i.id === AppRoute.LIBRARY)!,
    ...SECONDARY_NAV_ITEMS.filter(i => i.id === AppRoute.SUMMARIES),
    NAVIGATION_ITEMS.find(i => i.id === AppRoute.BOARDS)!,
    NAVIGATION_ITEMS.find(i => i.id === AppRoute.MEETINGS)!,
    NAVIGATION_ITEMS.find(i => i.id === AppRoute.CHAT)!,
    NAVIGATION_ITEMS.find(i => i.id === AppRoute.CAPTURES)!,
    ...SECONDARY_NAV_ITEMS.filter(i => i.id !== AppRoute.SUMMARIES),
  ].filter(Boolean) as (NavItem | SecondaryNavItem)[];

  const NavButton: React.FC<{ item: any }> = ({ item }) => (
    <button
      onClick={() => setRoute(item.id)}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all group ${
        currentRoute === item.id 
          ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
      }`}
    >
      {item.icon && <item.icon className={`size-4.5 ${currentRoute === item.id ? 'text-indigo-600' : 'text-slate-300 group-hover:text-indigo-400'}`} />}
      <span className="flex-1 text-left">{item.label}</span>
    </button>
  );

  if (isCollapsed) {
    return (
      <aside className="w-[84px] border-r border-slate-100 bg-white h-screen flex flex-col sticky top-0 shrink-0 z-20 items-center py-6 overflow-y-auto no-scrollbar">
        <div className="flex-1 w-full space-y-3 flex flex-col items-center px-3">
          {/* User Identity Focus (Branding Logo Removed) */}
          <button className="size-11 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br from-[#3b27b2] via-[#8227b2] to-[#b61cc9] font-black shadow-lg shadow-indigo-100 mb-6">
            <User className="size-5" />
          </button>
          
          <div className="w-8 h-px bg-slate-100 my-4" />
          
          {mainNav.map((item) => (
            <button
              key={item.id}
              onClick={() => setRoute(item.id)}
              className={`size-11 rounded-2xl transition-all relative group flex items-center justify-center ${
                currentRoute === item.id 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              <item.icon className="size-5" />
              {item.badge && (
                <span className="absolute top-2 right-2 size-2 bg-rose-500 rounded-full border-2 border-white"></span>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-4 flex flex-col items-center mt-auto pt-6 shrink-0 px-3">
          <button onClick={() => setIsCollapsed(false)} className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all">
            <PanelLeftOpen className="size-5" />
          </button>
          <button onClick={onRecordClick} className="size-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-indigo-200 transition-all active:scale-95 group">
             <Circle className="size-6 fill-white" />
          </button>
          
          <div className="w-8 h-px bg-slate-100 my-2" />
          
          <div className="size-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-black" title={workspace.name}>
            {workspace.initial || 'W'}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-72 border-r border-slate-100 bg-white h-screen flex flex-col sticky top-0 shrink-0 z-20 shadow-sm animate-in slide-in-from-left duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Workspace Hub</div>
          <button onClick={() => setIsCollapsed(true)} className="p-2 text-slate-300 hover:bg-slate-50 rounded-xl transition-all">
            <PanelLeftClose className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-8 pb-6 no-scrollbar">
        <nav className="space-y-1.5">
          {mainNav.map((item) => <NavButton key={item.id} item={item} />)}
        </nav>
        
        {(user.role === 'Owner' || user.role === 'Admin') && (
          <div className="pt-2">
            <div className="px-4 pb-3 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Management</div>
            <button
              onClick={() => setRoute(AppRoute.ADMIN_MANAGE)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all ${
                currentRoute.startsWith('admin')
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Shield className="size-4.5" />
              <span>Admin Console</span>
            </button>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 space-y-2">
        <button onClick={onSignOut} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all font-bold text-xs uppercase tracking-widest group">
           <LogOut className="size-4 group-hover:translate-x-0.5 transition-transform" />
           Sign Out
        </button>

        {/* Compact Workspace Badge at the Bottom */}
        <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
           <div className="size-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md">
             {workspace.initial || 'W'}
           </div>
           <div className="min-w-0">
             <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">Workspace</div>
             <div className="text-xs font-bold text-slate-900 truncate">{workspace.name || "Default Hub"}</div>
           </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
