import React, { useState } from 'react';
import { Video, CodeSnippet } from '../types';
import VideoCard from '../components/VideoCard';
import { 
  Copy, Send, Info, ChevronDown, Gift, Video as VideoIcon, 
  ShoppingCart, Sparkles, BrainCircuit, BookOpen, Layers, 
  Briefcase, Plus, PlayCircle, Presentation, Users, FileStack,
  Zap, TrendingUp, Clock, Award, FolderOpen, Search, ArrowRight,
  MessageSquare, Code, Terminal, FileCode, Share2, Bookmark, Layout,
  Activity, Database, ShieldCheck, X, Loader2
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner';

interface LibraryProps {
  videos: Video[];
  snippets?: CodeSnippet[];
  onVideoClick: (video: Video) => void;
  workspaceName: string;
  onBuyOptions: () => void;
  variant?: 'default' | 'summaries' | 'watchlater';
  coverImage?: string;
}

interface Collection {
  id: string;
  title: string;
  segments: number;
  stakeholders: number;
  thumbnail: string;
}

const INITIAL_COLLECTIONS: Collection[] = [
  { id: 'c1', title: 'Q4 Strategic Alignment', segments: 5, stakeholders: 12, thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800' },
  { id: 'c2', title: 'Creator Mastery Series', segments: 3, stakeholders: 8, thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800' }
];

const Library: React.FC<LibraryProps> = ({ videos, snippets = [], onVideoClick, workspaceName, onBuyOptions, variant = 'default', coverImage }) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Collections' | 'Snippets' | 'Shared'>('All');
  const [collections, setCollections] = useState<Collection[]>(INITIAL_COLLECTIONS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsCreating(true);
    setTimeout(() => {
      const newCollection: Collection = {
        id: `c${Date.now()}`,
        title: newTitle,
        segments: 0,
        stakeholders: 1,
        thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'
      };
      setCollections([newCollection, ...collections]);
      setIsCreating(false);
      setIsCreateModalOpen(false);
      setNewTitle('');
      setActiveTab('Collections');
    }, 1000);
  };

  if (variant === 'summaries') {
    return (
      <div className="max-w-6xl mx-auto py-10 px-8 space-y-12 animate-in fade-in duration-700">
        <HeroBanner 
          title={<>Intelligence Feed <br />& Neural Insights.</>}
          description="Instant post-session mastering. Review key takeaways, action items, and executive summaries automatically extracted from your latest productions."
          imageUrl="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200"
          gradientFrom="from-[#7C3AED]"
          gradientTo="to-[#4C1D95]"
          buttons={
            <button className="flex items-center gap-3 bg-white text-indigo-900 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-wider hover:bg-indigo-50 transition-all shadow-xl active:scale-95">
              <Zap className="size-5 text-amber-500 fill-amber-500" />
              Analyze Latest Shows
            </button>
          }
        />

        <div className="space-y-8">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
             <div className="size-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><BrainCircuit className="size-6" /></div>
             AI-Processed Highlights
          </h2>
          
          <div className="space-y-6">
            {videos.length > 0 ? (
              videos.map((v, i) => (
                <div key={v.id} className="group bg-white border border-slate-100 p-8 rounded-[48px] hover:shadow-2xl hover:border-indigo-100 transition-all flex flex-col md:flex-row gap-10">
                   <div className="w-full md:w-72 aspect-video rounded-3xl overflow-hidden shrink-0 relative bg-slate-900 shadow-xl">
                      <img src={v.thumbnailUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" alt={v.title} />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <button onClick={() => onVideoClick(v)} className="size-14 bg-white rounded-full text-indigo-600 shadow-2xl scale-90 group-hover:scale-100 transition-transform flex items-center justify-center">
                            <PlayCircle className="size-8" />
                         </button>
                      </div>
                   </div>
                   <div className="flex-1 space-y-5 py-2">
                      <div className="flex justify-between items-start">
                         <div>
                            <div className="flex items-center gap-2 mb-1.5">
                               <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">NEURAL_V2</span>
                               <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Mastering Complete</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{v.title}</h3>
                         </div>
                         <span className="px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest">{v.duration}</span>
                      </div>
                      <p className="text-slate-500 text-base font-medium leading-relaxed line-clamp-3">
                        {v.aiSummary || v.description}
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                         {['Decision Point', 'Ecosystem Strategy', 'Actionable Log'].map(tag => (
                           <span key={tag} className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">{tag}</span>
                         ))}
                      </div>
                   </div>
                   <div className="flex flex-col justify-center gap-3 shrink-0">
                      <button onClick={() => onVideoClick(v)} className="px-8 py-4 bg-slate-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100">View Insights</button>
                      <button className="px-8 py-4 bg-white border border-slate-100 text-slate-400 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:border-indigo-200 hover:text-indigo-600 transition-all">Copy Recap</button>
                   </div>
                </div>
              ))
            ) : (
              <div className="py-40 text-center bg-slate-50/50 rounded-[64px] border-2 border-dashed border-slate-100">
                 <div className="size-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm text-slate-300"><Sparkles className="size-10" /></div>
                 <h3 className="text-2xl font-black text-slate-400 uppercase tracking-[0.2em]">Telemetry Offline</h3>
                 <p className="text-slate-400 mt-2 font-medium">Record a show to begin generating AI intelligence data.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-8 space-y-12 animate-in fade-in duration-700 relative min-h-full">
      {/* Create Collection Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-md" onClick={() => !isCreating && setIsCreateModalOpen(false)}></div>
           <div className="bg-white w-full max-w-lg rounded-[56px] border border-slate-100 p-12 shadow-[0_64px_128px_-32px_rgba(0,0,0,0.2)] relative z-10 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-10">
                 <div className="space-y-1">
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase tracking-widest">New Set</h3>
                   <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Establish Collaborative Vault</p>
                 </div>
                 <button onClick={() => setIsCreateModalOpen(false)} className="p-3 bg-slate-50 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all shadow-sm">
                    <X className="size-6" />
                 </button>
              </div>
              <form onSubmit={handleCreateCollection} className="space-y-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-1">Collection Identity</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Engineering Masterclass"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] px-8 py-5 text-lg font-bold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all placeholder:text-slate-300"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isCreating || !newTitle.trim()}
                  className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black text-xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isCreating ? <Loader2 className="size-6 animate-spin" /> : 'Deploy Collection'}
                  {!isCreating && <ArrowRight className="size-6" />}
                </button>
              </form>
           </div>
        </div>
      )}

      {/* Decorative Blueprint */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] overflow-hidden">
        <svg className="absolute top-40 right-[-10%] w-[800px] h-[800px] text-indigo-950" viewBox="0 0 100 100">
           <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1 3" />
           <path d="M0,0 L100,100 M100,0 L0,100" stroke="currentColor" strokeWidth="0.05" />
        </svg>
      </div>

      <HeroBanner 
         title={<>Asset Vault <br />& Team Hub.</>}
         description="Your structural base for collective knowledge. Secure, neural-indexed, and ready for deployment across your entire production ecosystem."
         imageUrl={coverImage || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200"}
         gradientFrom="from-[#1E293B]"
         gradientTo="to-[#0F172A]"
         buttons={
           <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-3 bg-white text-indigo-950 px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all shadow-2xl active:scale-95"
           >
             <Plus className="size-4" />
             New Collection
           </button>
         }
      />

      {/* Storage Modules (Stats) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
         {[
           { label: 'STORAGE_UTILIZED', val: '12.4 GB', icon: Database, color: 'text-indigo-600', detail: '82% CAPACITY' },
           { label: 'PLAYLIST_SETS', val: String(collections.length).padStart(2, '0'), icon: Presentation, color: 'text-amber-500', detail: 'INTERNAL_SYNC' },
           { label: 'SHOW_ASSETS', val: String(videos.length).padStart(2, '0'), icon: VideoIcon, color: 'text-emerald-500', detail: 'STABLE_NODE' }
         ].map((stat, i) => (
           <div key={i} className="bg-white border border-slate-100 rounded-[48px] p-10 shadow-sm flex flex-col justify-between group hover:shadow-2xl hover:border-indigo-100 transition-all relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                 <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{stat.label}</div>
                    <div className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{stat.val}</div>
                 </div>
                 <div className={`size-14 rounded-2xl bg-slate-50 ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>
                    <stat.icon className="size-7" />
                 </div>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">
                    <span>{stat.detail}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">SYS_CHECK_OK</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div className={`h-full ${i === 0 ? 'bg-indigo-600' : i === 1 ? 'bg-amber-400' : 'bg-emerald-500'} rounded-full transition-all duration-1000`} style={{ width: i === 0 ? '82%' : i === 1 ? '40%' : '100%' }} />
                 </div>
              </div>
           </div>
         ))}
      </div>

      {/* Library Navigation */}
      <div className="flex items-center justify-between border-b border-slate-100 relative z-10 pt-4">
        <div className="flex gap-10">
          {[
            { id: 'All', icon: Layers, label: 'All Content' },
            { id: 'Collections', icon: Presentation, label: 'Playlists' },
            { id: 'Snippets', icon: Code, label: 'Code Labs' },
            { id: 'Shared', icon: Users, label: 'Shared Hubs' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-6 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all border-b-4 ${
                activeTab === tab.id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon className={`size-4.5 ${activeTab === tab.id ? 'text-indigo-600' : 'opacity-40'}`} />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="pb-6 hidden md:flex items-center gap-3">
           <Search className="size-4 text-slate-300" />
           <input type="text" placeholder="Vault Search..." className="text-xs font-black uppercase tracking-widest text-slate-400 outline-none w-32 placeholder:opacity-50" />
        </div>
      </div>

      {activeTab === 'Collections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-4 relative z-10">
          {collections.map(collection => (
            <div key={collection.id} className="group bg-white border border-slate-100 rounded-[56px] overflow-hidden hover:shadow-2xl transition-all cursor-pointer flex flex-col">
              <div className="aspect-[16/10] relative overflow-hidden bg-slate-900 shadow-inner">
                <img src={collection.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 opacity-80" alt={collection.title} />
                <div className="absolute inset-0 bg-indigo-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <div className="size-16 bg-white rounded-full flex items-center justify-center text-indigo-950 shadow-2xl scale-75 group-hover:scale-100 transition-all duration-500">
                    <PlayCircle className="size-8" />
                  </div>
                </div>
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md text-indigo-600 text-[10px] font-black px-4 py-2 rounded-2xl shadow-xl uppercase tracking-[0.2em] border border-white/50">
                  {collection.segments} MASTER_TRACKS
                </div>
              </div>
              <div className="p-12 space-y-8 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                   <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="size-3 text-emerald-500" />
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">NEURAL_INDEXED</span>
                   </div>
                   <h3 className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-none tracking-tighter">{collection.title}</h3>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-3">
                    {[1,2,3].map(i => <div key={i} className="size-11 rounded-full bg-slate-200 border-4 border-white shadow-sm flex items-center justify-center text-[10px] font-black">+{i*2}</div>)}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{collection.stakeholders} Stakeholders</span>
                </div>
                <button className="w-full py-5 bg-slate-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100 group-hover:-translate-y-1">
                  Establish Connection
                </button>
              </div>
            </div>
          ))}
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="border-4 border-dashed border-slate-100 rounded-[56px] flex flex-col items-center justify-center p-20 text-slate-300 hover:border-indigo-200 hover:text-indigo-600 transition-all space-y-6 group bg-slate-50/30"
          >
            <div className="size-20 bg-white rounded-3xl group-hover:scale-110 transition-transform shadow-xl shadow-slate-100 relative flex items-center justify-center">
               <Plus className="size-10" />
               <div className="absolute -top-3 -right-3 bg-indigo-600 rounded-2xl p-2.5 border-4 border-white shadow-lg">
                  <Sparkles className="size-4 text-white" />
               </div>
            </div>
            <span className="font-black text-xs uppercase tracking-[0.3em]">Deploy New Set</span>
          </button>
        </div>
      )}

      {(activeTab === 'All' || activeTab === 'Shared') && (
        <section className="space-y-10 relative z-10">
          <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
               <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Show Feed</h2>
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Global production stream</p>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
               Latest Masters <ChevronDown className="size-3.5" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {videos.length > 0 ? (
              videos.map(v => (
                <VideoCard key={v.id} video={v} onClick={onVideoClick} />
              ))
            ) : (
              <div className="col-span-full py-48 text-center space-y-10 bg-white rounded-[64px] border-2 border-dashed border-slate-100 relative overflow-hidden group">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none grayscale">
                   <FolderOpen className="size-96 absolute -bottom-20 -right-20 rotate-12" />
                </div>
                <div className="relative z-10 space-y-10 animate-in slide-in-from-bottom-8 duration-700">
                  <div className="size-28 bg-indigo-50 rounded-[40px] flex items-center justify-center mx-auto shadow-inner border border-indigo-100/50 group-hover:scale-110 transition-transform duration-700">
                    <FolderOpen className="size-12 text-indigo-300" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Vault is Empty.</h3>
                    <p className="text-slate-400 max-w-sm mx-auto font-medium text-lg leading-relaxed px-6">Start your first production in the studio to populate your collaborative hub.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Bottom Nav Pill Padding */}
      <div className="h-24" />
    </div>
  );
};

export default Library;