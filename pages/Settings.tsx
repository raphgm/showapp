
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { 
  User, Bell, Shield, CreditCard, Video, Monitor, 
  Check, Camera, Mic, Save, Smartphone, Mail, Eye, EyeOff,
  Globe, Moon, Volume2, MessageCircle, RefreshCw,
  Puzzle, Calendar, Database, CheckCircle2, Zap, Loader2,
  Settings2, ArrowRight, Link as LinkIcon, Terminal
} from 'lucide-react';
import { connectGoogleCalendar, initGoogleAuth } from '../services/googleCalendarService';
import PageDoodles from '../components/PageDoodles';

interface SettingsProps {
  user: UserProfile;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
}

interface DeviceOption {
  deviceId: string;
  label: string;
}

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  category: 'Calendar' | 'Communication' | 'Storage' | 'Development';
  lastSynced?: string;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'recording' | 'integrations' | 'notifications' | 'plan' | 'developer'>('profile');
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState("Lead Producer");
  const [isSaving, setIsSaving] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const avatarFileRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };


  // Integrations State
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg',
      description: 'Automatically sync and record your scheduled team briefings.',
      status: 'disconnected',
      category: 'Calendar',
      lastSynced: '2 hours ago'
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg',
      description: 'Post automated session summaries directly to your channels.',
      status: 'disconnected',
      category: 'Communication'
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
      description: 'Embed your recorded materials inside shared Notion pages.',
      status: 'disconnected',
      category: 'Storage'
    }
  ]);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // Hardware State
  const [audioInputs, setAudioInputs] = useState<DeviceOption[]>([]);
  const [videoInputs, setVideoInputs] = useState<DeviceOption[]>([]);

  // Persistent Config
  const [recordConfig, setRecordConfig] = useState({
    resolution: '1080p',
    framerate: '60',
    audioDeviceId: 'default',
    videoDeviceId: 'default'
  });

  const [notifications, setNotifications] = useState({
    emailDigest: true,
    newComments: true,
    mentions: true,
    productUpdates: false
  });

  useEffect(() => {
    const savedConfig = localStorage.getItem('show_record_config');
    if (savedConfig) setRecordConfig(JSON.parse(savedConfig));
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) setGeminiApiKey(savedApiKey);
    checkPermissionsAndEnumerate();
  }, []);

  const checkPermissionsAndEnumerate = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      stream.getTracks().forEach(t => t.stop());
      await enumerateDevices();
    } catch (err) {
      console.error("Hardware access error:", err);
      await enumerateDevices();
    }
  };

  const enumerateDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audio = devices.filter(d => d.kind === 'audioinput').map(d => ({ deviceId: d.deviceId, label: d.label || `Mic ${d.deviceId.slice(0, 5)}` }));
    const video = devices.filter(d => d.kind === 'videoinput').map(d => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 5)}` }));
    setAudioInputs(audio);
    setVideoInputs(video);
  };

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdateUser({ name, email });
      setIsSaving(false);
    }, 800);
  };
  
  const handleSaveApiKey = () => {
    setIsSavingKey(true);
    setTimeout(() => {
      localStorage.setItem('gemini_api_key', geminiApiKey);
      setIsSavingKey(false);
    }, 800);
  };

  const handleConnectIntegration = async (id: string) => {
    setConnectingId(id);
    if (id === 'google-calendar') {
      try {
        await initGoogleAuth();
        await connectGoogleCalendar();
        updateIntegrationStatus(id, 'connected');
      } catch (err) {
        console.error("Auth error", err);
      } finally {
        setConnectingId(null);
      }
    } else {
      setTimeout(() => {
        updateIntegrationStatus(id, 'connected');
        setConnectingId(null);
      }, 1500);
    }
  };

  const updateIntegrationStatus = (id: string, status: Integration['status']) => {
    setIntegrations(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'recording', label: 'Recorder Options', icon: Video },
    { id: 'integrations', label: 'Connected Apps', icon: Puzzle },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'plan', label: 'Workspace Plan', icon: CreditCard },
    { id: 'developer', label: 'Developer', icon: Terminal },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      <PageDoodles variant="minimal" />
      <div>
        <h1 className="text-3xl font-black text-indigo-950 tracking-tight">Workspace Preferences</h1>
        <p className="text-gray-500 font-medium mt-1">Manage your team identity and shared hub configuration.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' 
                  : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 w-full space-y-6">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-8 pb-10 border-b border-gray-50">
                <div className="relative group cursor-pointer" onClick={() => avatarFileRef.current?.click()}>
                  <input type="file" ref={avatarFileRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                  <img src={user.avatar} alt="Avatar" className="w-28 h-28 rounded-[40px] object-cover border-4 border-white shadow-2xl" />
                  <div className="absolute inset-0 bg-black/50 rounded-[40px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-indigo-950">Member Identity</h2>
                  <p className="text-base text-gray-500 font-medium max-w-sm">This information is visible to your team and collaborators.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Display Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-slate-50 rounded-2xl font-bold text-gray-700 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Work Email</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-slate-50 rounded-2xl font-bold text-gray-700 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div className="col-span-full space-y-3">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Title / Headline</label>
                  <textarea 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-slate-50 rounded-2xl font-bold text-gray-700 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-70"
                >
                  {isSaving ? 'Updating...' : 'Save Profile Changes'}
                  {!isSaving && <Save className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'recording' && (
            <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-1 pb-6 border-b border-gray-50 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-black text-indigo-950">Recorder Preferences</h2>
                  <p className="text-base text-gray-500 font-medium">Calibrate your recording hardware for team sessions.</p>
                </div>
                <button onClick={checkPermissionsAndEnumerate} className="p-3 bg-gray-50 text-indigo-600 rounded-2xl hover:bg-indigo-50 transition-all shadow-sm active:scale-95">
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[32px] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-50 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-50 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Monitor className="w-6 h-6" /></div>
                    <div>
                      <div className="font-black text-indigo-950 text-lg">Native Resolution</div>
                      <div className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Detail Level</div>
                    </div>
                  </div>
                  <select 
                    value={recordConfig.resolution}
                    onChange={(e) => setRecordConfig({...recordConfig, resolution: e.target.value})}
                    className="bg-white border-2 border-slate-100 text-indigo-950 text-sm font-bold rounded-xl px-5 py-3 outline-none focus:border-indigo-600 transition-all"
                  >
                    <option value="720p">720p Regular</option>
                    <option value="1080p">1080p High Fidelity</option>
                    <option value="4k">4K Ultra (Pro Hub)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-4">
               <h2 className="text-2xl font-black text-indigo-950 pb-6 border-b border-gray-50">Team Ecosystem</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {integrations.map(item => (
                   <div key={item.id} className="p-8 rounded-[32px] border-2 border-slate-50 bg-slate-50/50 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="size-16 rounded-[24px] bg-white border border-slate-100 flex items-center justify-center p-3 shadow-sm">
                          <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <h4 className="font-black text-slate-900 text-lg">{item.name}</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.description}</p>
                      </div>
                      <button 
                        onClick={() => handleConnectIntegration(item.id)}
                        disabled={connectingId === item.id}
                        className="mt-8 w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        {connectingId === item.id ? <Loader2 className="size-3.5 animate-spin" /> : 'Connect Link'}
                      </button>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-1 pb-6 border-b border-gray-50">
                <h2 className="text-2xl font-black text-indigo-950">Alert Preferences</h2>
                <p className="text-base text-gray-500 font-medium">Control how and when you receive notifications.</p>
              </div>
              <div className="space-y-4">
                {[
                  { key: 'emailDigest', label: 'Weekly Email Digest', desc: 'Receive a weekly summary of your workspace activity' },
                  { key: 'newComments', label: 'New Comments', desc: 'Get notified when someone comments on your shows' },
                  { key: 'mentions', label: 'Mentions', desc: 'Alert when someone mentions you in a discussion' },
                  { key: 'productUpdates', label: 'Product Updates', desc: 'Stay informed about new features and improvements' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[32px] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-50 transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-50 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Bell className="w-5 h-5" /></div>
                      <div>
                        <div className="font-black text-indigo-950 text-base">{item.label}</div>
                        <div className="text-xs text-slate-400 font-medium mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                    <div 
                      className={`w-12 h-6 rounded-full p-0.5 cursor-pointer transition-colors ${notifications[item.key as keyof typeof notifications] ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      onClick={() => setNotifications({...notifications, [item.key]: !notifications[item.key as keyof typeof notifications]})}
                    >
                      <div className={`size-5 bg-white rounded-full shadow-sm transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'plan' && (
            <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-1 pb-6 border-b border-gray-50">
                <h2 className="text-2xl font-black text-indigo-950">Workspace Plan</h2>
                <p className="text-base text-gray-500 font-medium">Manage your subscription and billing details.</p>
              </div>
              <div className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[32px] border border-indigo-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Current Plan</div>
                    <div className="text-3xl font-black text-indigo-950 tracking-tight mt-1">{user.plan || 'Starter Creator'}</div>
                  </div>
                  <div className="size-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-indigo-100">
                    <Zap className="size-8 text-indigo-600" />
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Shows used</span>
                    <span className="font-black text-indigo-950">{user.videoCount} / {user.videoLimit}</span>
                  </div>
                  <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(user.videoCount / user.videoLimit) * 100}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {['5 GB Storage', 'AI Summaries', 'Team Spaces', 'Priority Support'].map(feature => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-indigo-900 font-medium">
                      <CheckCircle2 className="size-4 text-indigo-600" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
              <button className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                Upgrade to Pro
              </button>
            </div>
          )}

          {activeTab === 'developer' && (
             <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-1 pb-6 border-b border-gray-50">
                <h2 className="text-2xl font-black text-indigo-950">Developer Settings</h2>
                <p className="text-base text-gray-500 font-medium">Manage API keys and advanced configurations.</p>
              </div>

              <div className="space-y-6">
                 <div className="space-y-3">
                   <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Gemini API Key</label>
                   <div className="relative">
                     <input 
                       type={showApiKey ? "text" : "password"}
                       value={geminiApiKey} 
                       onChange={(e) => setGeminiApiKey(e.target.value)}
                       placeholder="Enter your Gemini API key"
                       className="w-full px-6 py-4 bg-gray-50 border-2 border-slate-50 rounded-2xl font-bold text-gray-700 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all font-mono tracking-wider"
                     />
                     <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-600">
                        {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                     </button>
                   </div>
                   <p className="text-xs text-gray-400 ml-1">Your key is stored locally and never sent to our servers.</p>
                 </div>
              </div>

               <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleSaveApiKey}
                  disabled={isSavingKey}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-70"
                >
                  {isSavingKey ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save API Key</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
