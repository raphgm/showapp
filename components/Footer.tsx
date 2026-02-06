
import React from 'react';
import { AppRoute } from '../types';
import { 
  Heart, Globe, Radio, Layout, Video, Users, Info, 
  MessageSquare, Activity, ShieldCheck, MapPin, 
  Cpu, Terminal, Zap, Fingerprint, Network, ArrowUpRight
} from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const sections = [
    {
      title: 'STRUCTURAL BASE',
      items: [
        { label: 'Studio Engine', route: AppRoute.HOME, icon: Radio },
        { label: 'Infinite Boards', route: AppRoute.BOARDS, icon: Layout },
        { label: 'Meetings Lab', route: AppRoute.MEETINGS, icon: Video },
        { label: 'Intelligence Hub', route: AppRoute.LIBRARY, icon: Globe },
      ]
    },
    {
      title: 'ECOSYSTEM',
      items: [
        { label: 'Knowledge Base', route: AppRoute.COURSES, icon: Info },
        { label: 'System Blog', route: AppRoute.BLOG, icon: MessageSquare },
        { label: 'Strategic Roadmap', route: AppRoute.ROADMAP, icon: Zap },
        { label: 'Chrome Command', route: AppRoute.EXTENSION, icon: Cpu },
      ]
    },
    {
      title: 'GOVERNANCE',
      items: [
        { label: 'Security Protocols', route: AppRoute.SECURITY, icon: ShieldCheck },
        { label: 'Data Sovereignty', route: AppRoute.PRIVACY, icon: Fingerprint },
        { label: 'Terms of Sync', route: AppRoute.TERMS, icon: Info },
      ]
    }
  ];

  return (
    <footer className="w-full pt-32 pb-40 px-12 bg-white mt-auto relative overflow-hidden border-t border-slate-50 selection:bg-indigo-100">
      {/* Structural Dotted Background - Matches your image */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.4]" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-32">
          {/* Brand & Description Column */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-6">
              <div className="flex flex-col">
                 <span className="text-[40px] font-black text-slate-900 tracking-tighter leading-none uppercase">SHOW_OS</span>
                 <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.4em] mt-3">Production Node Active</span>
              </div>
              <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-sm">
                The high-performance operating system for cognitive scale. Capture your vision, organize with AI. <span className="text-indigo-600 font-bold block mt-2">Show Don't Just Meet.</span>
              </p>
            </div>
            
            <button className="flex items-center gap-3 px-6 h-10 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
              DOWNLOAD HUB APP <ArrowUpRight className="size-3" />
            </button>
          </div>

          {/* Navigation Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-12">
            {sections.map((section) => (
              <div key={section.title} className="space-y-10">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] flex items-center gap-2">
                  <span className="size-1 bg-indigo-600 rounded-full" /> {section.title}
                </h4>
                <ul className="space-y-5">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <button 
                        onClick={() => onNavigate(item.route)}
                        className="group flex items-center gap-3 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-all text-left whitespace-nowrap"
                      >
                        <item.icon className="size-4 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all shrink-0" />
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="pt-16 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
            <span>© 2025 SS LABS GLOBAL PRODUCTION</span>
            <span className="size-1 rounded-full bg-slate-200 hidden sm:block"></span>
            <span className="flex items-center gap-2">
              Mastered with <Heart className="size-3 text-slate-200" /> in SAN FRANCISCO
            </span>
          </div>
          
          <div className="flex items-center gap-12">
            {['TWITTER', 'LINKEDIN', 'GITHUB', 'DISCORD'].map(social => (
              <button key={social} className="text-[11px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-[0.35em] transition-colors">
                {social}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
