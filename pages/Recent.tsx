
import React from 'react';
import { 
  Clock, Calendar, Play, ChevronRight, History, 
  Filter, Search, MoreVertical, LayoutGrid, 
  MonitorPlay, BrainCircuit, Sparkles, Zap
} from 'lucide-react';
import { Video } from '../types';
import VideoCard from '../components/VideoCard';
import HeroBanner from '../components/HeroBanner';

interface RecentProps {
  videos: Video[];
  onVideoClick: (video: Video) => void;
}

const Recent: React.FC<RecentProps> = ({ videos, onVideoClick }) => {
  // Mock grouping for demonstration
  const today = videos.slice(0, 2);
  const yesterday = videos.slice(2, 4);
  const older = videos.slice(4);

  const TimelineSection = ({ title, items }: { title: string; items: Video[] }) => (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] px-2">{title}</h3>
        <div className="flex-1 h-px bg-slate-100"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map(v => (
          <VideoCard key={v.id} video={v} onClick={onVideoClick} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-16 animate-in fade-in duration-700 bg-white min-h-screen">
      <HeroBanner 
        title={<>Production <br />Timeline.</>}
        description="Pick up exactly where you left off. Access your latest masters, drafts, and AI-indexed sessions in chronological order."
        imageUrl="https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&q=80&w=1200"
        gradientFrom="from-[#1e1b4b]"
        gradientTo="to-[#4338ca]"
        buttons={
          <div className="flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
             <History className="size-4 text-indigo-300" />
             <span className="text-[10px] font-black text-white uppercase tracking-widest">Tracking 48hr cycle</span>
          </div>
        }
      />

      <div className="flex items-center justify-between border-b border-slate-100 pb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
            <Clock className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Recent Sessions</h1>
            <p className="text-slate-400 font-medium">Chronological record of all workspace activity.</p>
          </div>
        </div>
        <div className="flex gap-3">
           <button className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"><Search className="size-5" /></button>
           <button className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"><Filter className="size-5" /></button>
        </div>
      </div>

      <div className="space-y-20">
        {videos.length === 0 ? (
          <div className="py-40 text-center space-y-6">
            <div className="size-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <MonitorPlay className="size-10 text-slate-200" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Timeline Empty</h3>
              <p className="text-slate-400 max-w-xs mx-auto">Start a new production in the Studio to see it propagated here.</p>
            </div>
          </div>
        ) : (
          <>
            <TimelineSection title="Today" items={today} />
            {yesterday.length > 0 && <TimelineSection title="Yesterday" items={yesterday} />}
            {older.length > 0 && <TimelineSection title="Earlier this week" items={older} />}
          </>
        )}
      </div>
      
      {/* Visual Footer Doodle */}
      <div className="pt-20 opacity-[0.05] pointer-events-none flex justify-center">
         <BrainCircuit className="size-64 text-indigo-900" strokeWidth={0.5} />
      </div>
    </div>
  );
};

export default Recent;
