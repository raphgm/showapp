
import React, { useState } from 'react';
import { 
  Puzzle, Globe, Zap, CheckCircle2, AlertCircle, 
  Settings2, Plus, ArrowRight, Loader2, X,
  ShieldCheck, ExternalLink, Calendar, Mail, 
  MessageSquare, Briefcase, Database
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import { connectGoogleCalendar, initGoogleAuth } from '../services/googleCalendarService';

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  category: 'Calendar' | 'Communication' | 'Storage' | 'Development';
}

const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg',
      description: 'Automatically import and record your scheduled briefings.',
      status: 'disconnected',
      category: 'Calendar'
    },
    {
      id: 'microsoft-outlook',
      name: 'Microsoft Outlook',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg',
      description: 'Sync your Outlook events and let AI join your enterprise calls.',
      status: 'disconnected',
      category: 'Calendar'
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg',
      description: 'Post automated briefing summaries directly to your channels.',
      status: 'disconnected',
      category: 'Communication'
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
      description: 'Embed your Show studio productions inside Notion pages.',
      status: 'disconnected',
      category: 'Storage'
    }
  ]);

  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleConnect = async (id: string) => {
    setConnectingId(id);
    
    if (id === 'google-calendar') {
      try {
        await initGoogleAuth();
        await connectGoogleCalendar();
        updateStatus(id, 'connected');
      } catch (err) {
        console.error("Failed to connect Google Calendar", err);
        alert("Authorization failed. Please try again.");
      } finally {
        setConnectingId(null);
      }
    } else {
      // Simulate connection for others
      setTimeout(() => {
        updateStatus(id, 'connected');
        setConnectingId(null);
      }, 1500);
    }
  };

  const updateStatus = (id: string, status: Integration['status']) => {
    setIntegrations(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
      <HeroBanner 
        title={<>Orchestrate your <br />Workflow Ecosystem.</>}
        description="Connect Show with the tools your team uses every day. Automate record-keeping, synchronize schedules, and deploy intelligence across your stack."
        imageUrl="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=800"
        gradientFrom="from-slate-800"
        gradientTo="to-indigo-900"
        buttons={
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
             <ShieldCheck className="size-4 text-emerald-400" />
             <span className="text-[10px] font-black text-white uppercase tracking-widest">Enterprise Secured Connections</span>
          </div>
        }
      />

      <div className="space-y-16">
        {/* Categories Section */}
        {['Calendar', 'Communication', 'Storage'].map(category => (
          <section key={category} className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                   {category === 'Calendar' ? <Calendar className="size-5" /> : 
                    category === 'Communication' ? <MessageSquare className="size-5" /> : 
                    <Database className="size-5" />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{category} Integrations</h2>
                  <p className="text-sm text-slate-400 font-medium">Power up your {category.toLowerCase()} workflow.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {integrations.filter(i => i.category === category).map(item => (
                <div 
                  key={item.id} 
                  className={`group p-8 rounded-[40px] border-2 transition-all flex flex-col justify-between h-full bg-white ${
                    item.status === 'connected' 
                      ? 'border-emerald-100 shadow-sm' 
                      : 'border-slate-100 hover:border-indigo-100 hover:shadow-xl'
                  }`}
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="size-16 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-center p-3 overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                        <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      {item.status === 'connected' ? (
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                           <CheckCircle2 className="size-3" /> Connected
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                           Inactive
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                      <p className="text-slate-400 text-sm font-medium mt-2 leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  <div className="mt-10 flex items-center justify-between gap-4">
                    {item.status === 'connected' ? (
                      <>
                        <button className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors" onClick={() => updateStatus(item.id, 'disconnected')}>Disconnect</button>
                        <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100">
                          <Settings2 className="size-4" />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleConnect(item.id)}
                        disabled={connectingId === item.id}
                        className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {connectingId === item.id ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />}
                        {connectingId === item.id ? 'Connecting...' : `Connect ${item.name}`}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Developer API Section */}
      <section className="bg-slate-950 rounded-[48px] p-12 lg:p-24 relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
         <div className="absolute -bottom-24 -right-24 size-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
         
         <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
            <div className="flex-1 space-y-8">
               <div className="size-16 bg-indigo-600 rounded-[24px] flex items-center justify-center text-white shadow-2xl">
                  <Globe className="size-8" />
               </div>
               <h3 className="text-4xl font-black text-white tracking-tight leading-none">
                  Build your own <br />Integrations.
               </h3>
               <p className="text-indigo-200/60 text-lg font-medium leading-relaxed max-w-sm">
                  Access the Show API to programmatically trigger recordings, manage workspace assets, and export AI insights to any endpoint.
               </p>
               <button className="flex items-center gap-3 text-indigo-400 font-black text-xs uppercase tracking-[0.2em] hover:text-white transition-colors group">
                  Developer Documentation <ArrowRight className="size-4 group-hover:translate-x-2 transition-transform" />
               </button>
            </div>

            <div className="flex-1 w-full max-w-md">
               <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 font-mono text-sm space-y-4 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="size-3 rounded-full bg-rose-500" />
                    <div className="size-3 rounded-full bg-amber-500" />
                    <div className="size-3 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-indigo-400"># Fetch workspace metadata</div>
                  <div className="text-white">GET <span className="text-emerald-400">/v1/workspace/metrics</span></div>
                  <div className="text-indigo-200/40">{`{`}</div>
                  <div className="pl-4 text-indigo-200/60">"productions": <span className="text-amber-400">12</span>,</div>
                  <div className="pl-4 text-indigo-200/60">"ai_usage": <span className="text-amber-400">"88%"</span></div>
                  <div className="text-indigo-200/40">{`}`}</div>
                  <div className="mt-8 flex justify-center">
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors">Generate API Key</button>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Integrations;
