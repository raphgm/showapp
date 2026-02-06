
import React from 'react';
import { LayoutGrid } from 'lucide-react';

const DevStatusIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-4 py-2 animate-in fade-in slide-in-from-right duration-700 pointer-events-auto">
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono leading-none">ECO_HUB</span>
        <span className="text-[10px] font-black text-indigo-600 tracking-wider font-mono uppercase leading-none">Global_Sync</span>
      </div>
      
      <div className="relative group cursor-pointer flex-shrink-0">
        {/* Active glowing ring */}
        <div className="absolute inset-[-3px] rounded-xl border border-indigo-500/40 animate-pulse"></div>
        {/* Main icon container - slightly smaller for header */}
        <div className="relative size-10 bg-[#121214] rounded-xl flex items-center justify-center border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-300">
          <LayoutGrid className="size-5 text-indigo-400 group-hover:text-white transition-colors" strokeWidth={3} />
        </div>
      </div>
    </div>
  );
};

export default DevStatusIndicator;
