
import React, { useRef } from 'react';
import { X, User, Keyboard, CreditCard, Chrome, Monitor, Smartphone, LogOut, Sparkles, Plus } from 'lucide-react';
import { UserProfile, AppRoute } from '../types';

interface ProfileSidebarProps {
  user: UserProfile;
  onClose: () => void;
  onSignOut: () => void;
  setRoute: (route: string) => void;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
  onUpgradeClick: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  user,
  onClose,
  onSignOut,
  setRoute,
  onUpdateUser,
  onUpgradeClick
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showShortcuts, setShowShortcuts] = React.useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const menuItems = [
    { id: 'account', icon: User, label: 'Account & preferences', action: () => setRoute(AppRoute.SETTINGS) },
    { id: 'shortcuts', icon: Keyboard, label: 'Keyboard shortcuts', action: () => setShowShortcuts(true) },
    { id: 'billing', icon: CreditCard, label: 'Billing', action: onUpgradeClick, isActive: true },
    { id: 'chrome', icon: Chrome, label: 'Install Chrome extension', action: () => window.open('https://chromewebstore.google.com/', '_blank') },
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl z-[150] flex flex-col animate-in slide-in-from-right duration-300 font-sans">
      {/* Keyboard Shortcuts Overlay */}
      {showShortcuts && (
        <div className="absolute inset-0 bg-white z-10 flex flex-col animate-in fade-in duration-200">
          <div className="p-6 flex items-center justify-between border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-900">Keyboard Shortcuts</h3>
            <button onClick={() => setShowShortcuts(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {[
              {
                section: 'General', shortcuts: [
                  { keys: '⌘ K', desc: 'Open command palette' },
                  { keys: '⌘ R', desc: 'Start recording' },
                  { keys: '⌘ ⇧ S', desc: 'Quick screenshot' },
                  { keys: '⌘ ,', desc: 'Open settings' },
                ]
              },
              {
                section: 'Snap Editor', shortcuts: [
                  { keys: 'V', desc: 'Select tool' },
                  { keys: 'A', desc: 'Arrow tool' },
                  { keys: 'D', desc: 'Draw / Pen' },
                  { keys: 'T', desc: 'Text tool' },
                  { keys: 'R', desc: 'Rectangle' },
                  { keys: 'O', desc: 'Ellipse' },
                  { keys: 'X', desc: 'Crop' },
                  { keys: 'B', desc: 'Blur' },
                  { keys: '⌘ Z', desc: 'Undo' },
                  { keys: '⌘ ⇧ Z', desc: 'Redo' },
                ]
              },
              {
                section: 'Navigation', shortcuts: [
                  { keys: 'G then H', desc: 'Go to Home' },
                  { keys: 'G then L', desc: 'Go to Library' },
                  { keys: 'ESC', desc: 'Close panel / modal' },
                ]
              },
            ].map(group => (
              <div key={group.section}>
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">{group.section}</h4>
                <div className="space-y-2">
                  {group.shortcuts.map(s => (
                    <div key={s.desc} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-50">
                      <span className="text-sm text-slate-600 font-medium">{s.desc}</span>
                      <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-500">{s.keys}</kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header Close Button */}
      <div className="p-6 flex justify-end">
        <button
          onClick={onClose}
          className="p-3 text-slate-300 hover:bg-slate-50 hover:text-indigo-600 rounded-full transition-all border border-slate-50"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Profile Section */}
      <div className="px-12 pb-10 flex flex-col items-center text-center">
        <div className="relative mb-6 group cursor-pointer" onClick={handleAvatarClick}>
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl transition-transform group-hover:scale-105 duration-300">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-2 right-1 bg-indigo-600 p-2 rounded-xl border-4 border-white shadow-lg text-white group-hover:bg-indigo-700 transition-colors">
            <Sparkles className="w-4 h-4" />
          </div>
          {/* Overlay to hint upload */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-full transition-colors flex items-center justify-center">
            <Plus className="text-white opacity-0 group-hover:opacity-100 w-8 h-8" />
          </div>
        </div>

        <h2 className="text-[32px] font-black text-[#1e1b4b] tracking-tight leading-tight">
          {user.name || 'Creator'}
        </h2>
        <p className="text-indigo-600 font-bold text-base mt-1">
          {user.email || 'raphael@sslabs.com'}
        </p>

        <button
          onClick={() => setRoute(AppRoute.SETTINGS)}
          className="mt-6 px-10 py-3 border-2 border-indigo-50 rounded-[20px] text-sm font-black text-indigo-700 hover:bg-indigo-50 hover:border-indigo-100 transition-all active:scale-95"
        >
          Manage profile
        </button>
      </div>

      <div className="w-full h-px bg-slate-50"></div>

      {/* Subscription Status Section */}
      <div className="px-8 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.15em]">Subscription Status</h3>
          <span className="px-3 py-1.5 bg-white border border-indigo-100 rounded-xl text-[10px] font-black text-indigo-600 shadow-sm">
            {user.plan || 'Starter Creator'}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="text-slate-400">Admin Role</span>
            <span className="text-slate-900 font-black">{user.role || 'Owner'}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
              <span className="text-slate-400">Production Quota</span>
              <span className="text-indigo-600">{user.videoCount}/{user.videoLimit} Slots</span>
            </div>
            <div className="w-full h-2 bg-indigo-50 rounded-full overflow-hidden">
              <div
                style={{ width: `${(user.videoCount / user.videoLimit) * 100}%` }}
                className="h-full bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]"
              ></div>
            </div>
          </div>
        </div>

        <button
          onClick={onUpgradeClick}
          className="w-full py-5 bg-[#5c55ee] text-white rounded-[20px] font-black text-lg shadow-[0_20px_40px_-10px_rgba(92,85,238,0.4)] hover:bg-[#6e67f5] transition-all active:scale-[0.98] mt-2"
        >
          Upgrade to Premium
        </button>
      </div>

      <div className="w-full h-px bg-slate-50"></div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-6 px-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            className={`w-full flex items-center gap-5 px-6 py-4 rounded-[20px] transition-all group ${item.isActive
                ? 'border-2 border-indigo-600 bg-white shadow-lg'
                : 'hover:bg-slate-50 text-slate-600'
              }`}
          >
            <item.icon className={`w-5 h-5 ${item.isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'} transition-colors`} />
            <span className={`text-base font-black flex-1 text-left ${item.isActive ? 'text-slate-900' : 'text-slate-600'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Terminate Session Footer */}
      <div className="p-8 mt-auto">
        <button
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-3 text-slate-400 hover:text-rose-600 transition-all font-black text-sm uppercase tracking-widest group"
        >
          <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          Terminate Session
        </button>
      </div>
    </div>
  );
};

export default ProfileSidebar;
