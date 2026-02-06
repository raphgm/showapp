
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import Library from './pages/Library';
import Spaces from './pages/Spaces';
import Home from './pages/Home';
import Meetings from './pages/Meetings';
import Chat from './pages/Chat';
import Captures from './pages/Captures';
import Recorder from './pages/Recorder';
import VideoDetail from './pages/VideoDetail';
import ProfileSidebar from './components/ProfileSidebar';
import LandingPage from './pages/LandingPage';
import InfiniteBoard from './pages/InfiniteBoard';
import ScreenshotOverlay from './components/ScreenshotOverlay';
import PaymentModal from './components/PaymentModal';
import InfoPage from './pages/InfoPage';
import MarketingPage from './pages/MarketingPage';
import FloatingDock from './components/FloatingDock';
import CommandPalette from './components/CommandPalette';
import Logo from './components/Logo';
import SettingsPage from './pages/Settings';
import EveCaller from './components/EveCaller';
import Admin from './pages/Admin';
import ImageAnnotator from './components/ImageAnnotator';
import Onboarding from './components/Onboarding';
import SignIn from './components/SignIn';
import ExtensionHub from './pages/ExtensionHub';
import Roadmap from './pages/Roadmap';
import Recent from './pages/Recent';
import Courses from './pages/Courses';
import { 
  Camera, X, Download, Share2, Youtube, HardDrive, Mail, Cloud, 
  Terminal, Twitter, ArrowUpRight, Loader2, Globe, ExternalLink,
  Save, FileCode, Server, Play, Scissors, Maximize, Layers, Monitor, Home as HomeIcon, Video as VideoIcon, Sparkles, User, Layout, Minimize2, Move, LogOut, ArrowLeft, PenTool, Crosshair, Target, Info,
  Activity, BrainCircuit, Zap, Radio, Maximize2, Zap as ZapIcon, CloudRain
} from 'lucide-react';
import { Video, AppRoute, UserProfile, Workspace, Capture, CodeSnippet } from './types';
import { NAVIGATION_ITEMS } from './constants/navigation';

const INITIAL_USER: UserProfile = {
  name: 'Raphael Gabriels',
  email: 'raphael@sslabs.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=128',
  role: 'Owner',
  plan: 'Starter Creator',
  videoLimit: 1,
  videoCount: 0,
};

const INITIAL_WORKSPACE: Workspace = {
  name: "",
  memberCount: 1,
  initial: 'S'
};

const GlobalDoodles = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none opacity-[0.2]">
    <svg className="absolute -top-40 -right-40 w-[1000px] h-[1000px] text-indigo-600" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 3" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.15" />
      <path d="M50,5 L50,95 M5,50 L95,50" stroke="currentColor" strokeWidth="0.1" strokeDasharray="2 2" />
    </svg>
    <div className="absolute top-12 left-12 w-24 h-24 border-t-2 border-l-2 border-indigo-400 rounded-tl-3xl opacity-40"></div>
    <div className="absolute bottom-12 right-12 w-24 h-24 border-b-2 border-r-2 border-indigo-400 rounded-br-3xl opacity-40"></div>
    <div className="absolute top-[20%] left-[3%] text-[10px] font-mono font-black tracking-[0.6em] text-indigo-500 rotate-90 origin-left uppercase">
      OS_CORE :: [STABLE]
    </div>
    <div className="absolute bottom-[20%] right-[3%] text-[10px] font-mono font-black tracking-[0.6em] text-indigo-500 -rotate-90 origin-right uppercase">
      ARCHITECTURE :: [ACTIVE]
    </div>
    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #6366f1 0.8px, transparent 0.8px)', backgroundSize: '60px 60px' }}></div>
    <BrainCircuit className="absolute top-[10%] right-[30%] size-[500px] text-indigo-600 opacity-20" strokeWidth={0.3} />
  </div>
);

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<string>(AppRoute.HOME);
  const [videos, setVideos] = useState<Video[]>([]);
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [isActuallyRecording, setIsActuallyRecording] = useState(false);
  const [isScreenshotMode, setIsScreenshotMode] = useState(false);
  const [screenshotMode, setScreenshotMode] = useState<'fullscreen' | 'window' | 'region' | 'scrolling'>('region');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [workspace, setWorkspace] = useState<Workspace>(INITIAL_WORKSPACE);
  const [isEveCalling, setIsEveCalling] = useState(false);
  const [activeCaptureForEditing, setActiveCaptureForEditing] = useState<Capture | null>(null);
  const [publicInfoRoute, setPublicInfoRoute] = useState<AppRoute | null>(null);
  
  // Scroll and Dynamic UI states
  const [isScrolled, setIsScrolled] = useState(false);
  const [isInstantLoading, setIsInstantLoading] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<any | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setIsScrolled(scrollTop > 80);
  };

  const handleStartOnboarding = () => {
    setShowOnboarding(true);
    setShowSignIn(false);
  };

  const handleStartSignIn = () => {
    setShowSignIn(true);
    setShowOnboarding(false);
  };

  const handleCompleteSetup = (data: { name: string; email: string; workspace: string; focus: string; title: string }) => {
    setUser(prev => ({ ...prev, name: data.name, email: data.email }));
    setWorkspace({ name: data.workspace, memberCount: 1, initial: data.workspace.charAt(0).toUpperCase() });
    setIsAuthenticated(true);
    setShowOnboarding(false);
  };

  const handleSignInSuccess = () => {
    setIsAuthenticated(true);
    setShowSignIn(false);
  };

  const handleDevLogin = () => {
    setIsAuthenticated(true);
    setIsDevMode(true);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setIsDevMode(false);
    setIsProfileOpen(false);
    setIsMinimized(false);
    setCurrentRoute(AppRoute.HOME);
    setSelectedVideo(null);
    setUser(INITIAL_USER);
    setWorkspace(INITIAL_WORKSPACE);
  };

  const handleRecord = () => setIsRecordingModalOpen(true);
  
  const handleScreenshot = (mode: 'fullscreen' | 'window' | 'region' | 'scrolling') => {
    setScreenshotMode(mode);
    setIsScreenshotMode(true);
  };

  const handleCaptureComplete = (mode: string) => {
    const newCapture: Capture = {
      id: Math.random().toString(36).substring(7),
      url: `https://images.unsplash.com/photo-${1542744094 + Math.floor(Math.random() * 10000)}?auto=format&fit=crop&q=80&w=1280`, 
      type: mode.charAt(0).toUpperCase() + mode.slice(1),
      createdAt: 'Just now',
      title: `Smart Snap (${mode})`
    };
    setCaptures(prev => [newCapture, ...prev]);
    setIsScreenshotMode(false);
    setActiveCaptureForEditing(newCapture);
    setCurrentRoute(AppRoute.CAPTURES);
  };

  const handleSaveAnnotation = (newImageUrl: string) => {
    if (activeCaptureForEditing) {
      setCaptures(prev => prev.map(c => c.id === activeCaptureForEditing.id ? { ...c, url: newImageUrl, title: `${c.title} (Annotated)` } : c));
      setActiveCaptureForEditing(null);
    }
  };

  const handleDeleteCapture = (id: string) => setCaptures(prev => prev.filter(c => c.id !== id));

  const handleSaveVideo = (newVideo: Video) => {
    setVideos([newVideo, ...videos]);
    setIsRecordingModalOpen(false);
    setIsActuallyRecording(false);
    setSelectedVideo(newVideo);
    setUser(prev => ({ ...prev, videoCount: prev.videoCount + 1 }));
  };

  const handleSaveSnippet = (newSnippet: CodeSnippet) => {
    setSnippets(prev => [newSnippet, ...prev]);
    setIsRecordingModalOpen(false);
    setCurrentRoute(AppRoute.LIBRARY);
  };

  const handleInstantMeeting = () => {
    setIsInstantLoading(true);
    setTimeout(() => {
      const instantMeeting = {
        id: Date.now().toString(),
        title: user.name ? `${user.name.split(' ')[0]}'s Studio` : 'Member Studio',
        date: 'Today',
        time: 'Just now',
        type: 'Live Sync',
        attendees: 1
      };
      setActiveMeeting(instantMeeting);
      setIsInstantLoading(false);
    }, 1500);
  };

  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;
    const query = searchQuery.toLowerCase();
    return videos.filter(v => v.title.toLowerCase().includes(query) || v.description.toLowerCase().includes(query));
  }, [videos, searchQuery]);

  const currentNav = NAVIGATION_ITEMS.find(n => n.id === currentRoute);
  const activeCoverImage = currentNav?.coverImage;

  const renderContent = () => {
    if (selectedVideo) return <VideoDetail video={selectedVideo} onBack={() => setSelectedVideo(null)} />;
    if ([AppRoute.PRODUCT, AppRoute.SOLUTIONS, AppRoute.CUSTOMERS, AppRoute.ENTERPRISE, AppRoute.PRICING].includes(currentRoute as AppRoute)) {
      return <MarketingPage type={currentRoute as AppRoute} onBack={() => setCurrentRoute(AppRoute.HOME)} onSignUp={() => setIsPaymentOpen(true)} />;
    }
    if ([AppRoute.BLOG, AppRoute.COMMUNITY, AppRoute.HELP].includes(currentRoute as AppRoute)) {
      return <InfoPage type={publicInfoRoute || AppRoute.HELP} onBack={() => setCurrentRoute(AppRoute.HOME)} />;
    }
    switch (currentRoute) {
      case AppRoute.HOME: return <Home user={user} onRecordClick={handleRecord} onNavigate={setCurrentRoute} coverImage={activeCoverImage} />;
      case AppRoute.LIBRARY: return <Library videos={filteredVideos} snippets={snippets} onVideoClick={handleVideoClick} workspaceName={workspace.name} onBuyOptions={() => setIsPaymentOpen(true)} coverImage={activeCoverImage} />;
      case AppRoute.COURSES: return <Courses onVideoClick={handleVideoClick} coverImage={activeCoverImage} />;
      case AppRoute.SUMMARIES: return <Library videos={filteredVideos} snippets={snippets} onVideoClick={handleVideoClick} workspaceName={workspace.name} onBuyOptions={() => setIsPaymentOpen(true)} variant="summaries" coverImage={activeCoverImage} />;
      case AppRoute.WATCH_LATER: return <Library videos={filteredVideos} snippets={snippets} onVideoClick={handleVideoClick} workspaceName={workspace.name} onBuyOptions={() => setIsPaymentOpen(true)} variant="watchlater" coverImage={activeCoverImage} />;
      case AppRoute.BOARDS: return <InfiniteBoard videos={filteredVideos} onVideoClick={handleVideoClick} coverImage={activeCoverImage} />;
      case AppRoute.ROADMAP: return <Roadmap coverImage={activeCoverImage} />;
      case AppRoute.MEETINGS: return <Meetings user={user} snippets={snippets} coverImage={activeCoverImage} activeMeeting={activeMeeting} setActiveMeeting={setActiveMeeting} isInstantLoading={isInstantLoading} onInstantRoom={handleInstantMeeting} />;
      case AppRoute.CHAT: return <Chat coverImage={activeCoverImage} />;
      case AppRoute.CAPTURES: return <Captures captures={captures} onAddCapture={() => handleScreenshot('region')} onDeleteCapture={handleDeleteCapture} onEditCapture={(capture) => setActiveCaptureForEditing(capture)} coverImage={activeCoverImage} />;
      case AppRoute.SETTINGS: return <SettingsPage user={user} onUpdateUser={(updates) => setUser(prev => ({...prev, ...updates}))} />;
      case AppRoute.RECENT: return <Recent videos={filteredVideos} onVideoClick={handleVideoClick} />;
      case AppRoute.EXTENSION: return <ExtensionHub />;
      case AppRoute.FOR_YOU: return <Spaces workspace={workspace} />;
      case AppRoute.ADMIN_MANAGE: return <Admin user={user} workspace={workspace} currentRoute={currentRoute as AppRoute} onNavigate={setCurrentRoute} />;
      default: return <Home user={user} onRecordClick={handleRecord} onNavigate={setCurrentRoute} coverImage={activeCoverImage} />;
    }
  };

  const handleVideoClick = (video: Video) => setSelectedVideo(video);
  const shouldShowFooter = !selectedVideo && ![AppRoute.BOARDS, AppRoute.CHAT, AppRoute.MEETINGS, AppRoute.RECENT].includes(currentRoute as AppRoute);

  const handleStopRecording = () => {
    const finishBtn = document.getElementById('finish-recording-btn');
    if (finishBtn) finishBtn.click();
    else setIsActuallyRecording(false);
  };

  if (!isAuthenticated) {
    if (showSignIn) {
      return <SignIn onSuccess={handleSignInSuccess} onNavigateSignUp={handleStartOnboarding} onCancel={() => setShowSignIn(false)} />;
    }
    if (showOnboarding) {
      return <Onboarding onComplete={handleCompleteSetup} onCancel={() => setShowOnboarding(false)} />;
    }
    if (publicInfoRoute) {
      if ([AppRoute.PRODUCT, AppRoute.SOLUTIONS, AppRoute.CUSTOMERS, AppRoute.ENTERPRISE, AppRoute.PRICING].includes(publicInfoRoute)) {
        return <MarketingPage type={publicInfoRoute} onBack={() => setPublicInfoRoute(null)} onSignUp={handleStartOnboarding} />;
      }
      return <InfoPage type={publicInfoRoute} onBack={() => setPublicInfoRoute(null)} />;
    }

    return (
      <div className="min-h-screen w-full relative">
        <LandingPage onSignIn={handleStartSignIn} onSignUp={handleStartOnboarding} onDevLogin={handleDevLogin} onNavigateInfo={(route) => setPublicInfoRoute(route)} onContactSales={() => setIsEveCalling(true)} />
        <EveCaller isOpen={isEveCalling} onOpen={() => setIsEveCalling(true)} onClose={() => setIsEveCalling(false)} />
      </div>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden ${isMinimized ? 'bg-[#f8fafc]' : 'bg-white'} relative selection:bg-indigo-100 selection:text-indigo-900`}>
      <GlobalDoodles />
      
      {isInstantLoading && (
        <div className="fixed inset-0 z-[10000] bg-[#0a0c1a]/95 flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in duration-300 backdrop-blur-xl">
           <div className="relative group">
              <div className="size-40 bg-gradient-to-br from-[#3b27b2] via-[#8227b2] to-[#b61cc9] rounded-[56px] flex items-center justify-center shadow-[0_40px_80px_-15px_rgba(59,39,178,0.4)] animate-pulse">
                <BrainCircuit className="size-20 text-white" />
              </div>
              <div className="absolute inset-[-20px] border border-white/10 rounded-[64px] animate-[spin_12s_linear_infinite]" />
           </div>
           <div className="space-y-4">
             <h3 className="text-5xl font-black text-white tracking-tighter uppercase tracking-[0.2em]">Deploying Studio</h3>
             <p className="text-indigo-400 font-bold text-sm uppercase tracking-[0.4em] opacity-80 flex items-center gap-3 justify-center">
                <Loader2 className="size-4 animate-spin" /> Synchronizing Neural Masters
             </p>
           </div>
        </div>
      )}

      {!isMinimized && (
        <Sidebar currentRoute={currentRoute} setRoute={setCurrentRoute} onRecordClick={handleRecord} onScreenshotClick={handleScreenshot} onMinimize={() => setIsMinimized(true)} user={user} workspace={workspace} onSignOut={handleSignOut} />
      )}

      {isMinimized && (
        <FloatingDock 
          isRecording={isActuallyRecording}
          onMaximize={() => setIsMinimized(false)}
          onRecord={handleRecord}
          onStop={handleStopRecording}
          onSnap={(mode) => handleScreenshot(mode as any)}
          onNavigate={setCurrentRoute}
        />
      )}

      <main className={`flex-1 flex flex-col min-w-0 overflow-hidden relative z-10 ${isMinimized ? 'opacity-30 pointer-events-none' : ''}`}>
        {!isMinimized && (
          <Header 
            onRecordClick={handleRecord} 
            onProfileClick={() => setIsProfileOpen(true)} 
            onSearch={(q) => { setSearchQuery(q); setIsCommandPaletteOpen(true); }} 
            onScreenshotClick={handleScreenshot} 
            onMinimize={() => setIsMinimized(true)} 
            user={user} 
            currentRoute={currentRoute} 
            setRoute={(route) => { setSelectedVideo(null); setCurrentRoute(route); }}
            isDevMode={isDevMode}
          />
        )}
        
        <div ref={scrollAreaRef} onScroll={handleScroll} className="flex-1 overflow-y-auto relative flex flex-col no-scrollbar">
          <div className="flex-1 relative pb-20">{renderContent()}</div>
          {shouldShowFooter && <Footer onNavigate={setCurrentRoute} />}
        </div>

        {/* Dynamic Responsive Bottom Nav Hub - High Fidelity Consolidation */}
        {!selectedVideo && !isMinimized && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-1 p-2 bg-white/95 backdrop-blur-3xl rounded-full border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
            
            {/* Home Button */}
            <button 
              onClick={() => setCurrentRoute(AppRoute.HOME)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-colors text-xs font-black uppercase tracking-wider ${
                currentRoute === AppRoute.HOME 
                ? 'bg-indigo-100 text-indigo-600' 
                : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              <HomeIcon className={`size-4 ${currentRoute === AppRoute.HOME ? 'fill-indigo-600' : ''}`} />
              <span>Home</span>
            </button>
            
            {/* Show (Record) Button */}
            <button 
              onClick={handleRecord}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-colors bg-rose-100 text-rose-600 hover:bg-rose-200 text-xs font-black uppercase tracking-wider"
            >
              <VideoIcon className="size-4 fill-rose-500" />
              <span>Show</span>
            </button>

            {/* Library Button */}
            <button 
              onClick={() => setCurrentRoute(AppRoute.LIBRARY)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-colors text-xs font-black uppercase tracking-wider ${
                currentRoute === AppRoute.LIBRARY 
                ? 'bg-indigo-100 text-indigo-600' 
                : 'text-slate-400 hover:text-indigo-600'
              }`}
            >
              <Cloud className={`size-4 ${currentRoute === AppRoute.LIBRARY ? 'fill-indigo-600' : ''}`} />
              <span>Library</span>
            </button>
          </div>
        )}

        {!isMinimized && (
          <button onClick={() => setIsMinimized(true)} className="fixed right-8 bottom-8 z-[200] flex items-center gap-4 bg-[#1e1b4b] text-white pl-5 pr-4 py-2.5 rounded-full shadow-2xl hover:bg-[#2e2a6d] transition-all active:scale-95 group border border-white/10 leading-none">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80 group-hover:opacity-100">Show Pill</span>
            <Maximize2 className="size-4 rotate-45 transition-transform group-hover:rotate-90" />
          </button>
        )}
      </main>

      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} onNavigate={setCurrentRoute} onRecord={handleRecord} videos={videos} />
      {isRecordingModalOpen && <Recorder isMinimized={isMinimized} onClose={() => setIsRecordingModalOpen(false)} onSave={handleSaveVideo} onSaveSnippet={handleSaveSnippet} onRecordingStatusChange={setIsActuallyRecording} />}
      {isScreenshotMode && <ScreenshotOverlay initialMode={screenshotMode} onCapture={handleCaptureComplete} onClose={() => setIsScreenshotMode(false)} />}
      {activeCaptureForEditing && <ImageAnnotator imageUrl={activeCaptureForEditing.url} initialTitle={activeCaptureForEditing.title} onSave={handleSaveAnnotation} onClose={() => setActiveCaptureForEditing(null)} />}
      {isPaymentOpen && <PaymentModal onClose={() => setIsPaymentOpen(false)} onSuccess={(tier) => setUser(p => ({...p, videoLimit: p.videoLimit + (tier === 'Pro' ? 200 : 50)}))} />}
      {isProfileOpen && <ProfileSidebar user={user} onClose={() => setIsProfileOpen(false)} onSignOut={handleSignOut} setRoute={setCurrentRoute} onUpdateUser={(u) => setUser(p => ({...p, ...u}))} onUpgradeClick={() => setIsPaymentOpen(true)} />}
    </div>
  );
};

export default App;
