
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import Library from './pages/Library';
import Spaces from './pages/Spaces';
import Home from './pages/Home';
import Meetings from './pages/Meetings';
import Chat from './pages/Chat';
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
import EveChat from './components/EveChat';
import Admin from './pages/Admin';
import SnapEditor from './components/SnapEditor';
import Onboarding from './components/Onboarding';
import SignIn from './components/SignIn';
import ExtensionHub from './pages/ExtensionHub';
import Roadmap from './pages/Roadmap';
import Recent from './pages/Recent';
import Courses from './pages/Courses';
import StudioWorkspace from './components/StudioWorkspace';
import ProfilePhotoEditor from './components/ProfilePhotoEditor';
import SnapStudio from './pages/SnapStudio';
import StreamStudio from './pages/StreamStudio';
import ShowStudioPage from './pages/ShowStudio';
import Explore from './pages/Explore';
import GuestJoin from './pages/GuestJoin';
import CoHostJoin from './pages/CoHostJoin';
import { ToastProvider, useToast } from './components/ToastProvider';
import ErrorBoundary from './components/ErrorBoundary';
import {
  Camera, X, Download, Share2, Youtube, HardDrive, Mail, Cloud,
  Terminal, Twitter, ArrowUpRight, Loader2, Globe, ExternalLink,
  Save, FileCode, Server, Play, Scissors, Maximize, Layers, Monitor, Home as HomeIcon, Video as VideoIcon, Sparkles, User, Layout, Minimize2, LogOut, ArrowLeft, PenTool, Crosshair, Target, Info,
  Activity, BrainCircuit, Zap, Radio, Maximize2, Zap as ZapIcon, CloudRain
} from 'lucide-react';
import { Video, AppRoute, UserProfile, Workspace, Capture, CodeSnippet } from './types';
import { NAVIGATION_ITEMS } from './constants/navigation';
import { useAuth } from './services/AuthContext';
import {
  saveVideos, loadVideos,
  saveCaptures, loadCaptures,
  saveSnippets, loadSnippets,
  saveUserProfile, loadUserProfile,
  saveWorkspace, loadWorkspace,
  saveRoute, loadRoute,
} from './services/persistence';
import {
  vaultSaveCaptures, vaultLoadCaptures,
  syncCapturesToCloud, subscribeToCaptureSync,
  migrateToVault, updateVaultStatus,
  type VaultStatus, type CaptureMetadata,
} from './services/vaultService';

const INITIAL_USER: UserProfile = {
  name: 'Creator',
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
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
    {/* Dot Grid */}
    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #0f172a 0.8px, transparent 0.8px)', backgroundSize: '40px 40px' }}></div>

    {/* Large Blueprint Circle - Top Right */}
    <svg className="absolute -top-1/4 -right-1/4 w-[1200px] h-[1200px] text-indigo-900 opacity-5" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1 4" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.05" />
      <path d="M50,2 L50,98 M2,50 L98,50" stroke="currentColor" strokeWidth="0.05" strokeDasharray="1 1" />
    </svg>

    {/* NEW: Schematic Lines - Top Left */}
    <svg className="absolute top-[5%] left-[5%] w-[400px] h-[400px] text-indigo-900 opacity-5" viewBox="0 0 100 100">
      <path d="M0,10 L40,10 L40,50 L80,50" fill="none" stroke="currentColor" strokeWidth="0.2" />
      <path d="M20,0 L20,30 L60,30" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 2" />
      <circle cx="40" cy="50" r="3" fill="none" stroke="currentColor" strokeWidth="0.3" />
      <rect x="75" y="45" width="10" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="0.2" />
    </svg>

    {/* Wireframe Sphere - Bottom Left */}
    <svg className="absolute -bottom-1/4 -left-1/4 w-[800px] h-[800px] text-indigo-900 opacity-5" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.2" />
      <ellipse cx="100" cy="100" rx="80" ry="30" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 3" />
      <ellipse cx="100" cy="100" rx="80" ry="60" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 3" />
      <ellipse cx="100" cy="100" rx="30" ry="80" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 3" />
      <ellipse cx="100" cy="100" rx="60" ry="80" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 3" />
    </svg>

    {/* NEW: Small connector doodle - Mid Left */}
    <svg className="absolute top-1/2 left-[8%] -translate-y-1/2 w-[200px] h-[100px] text-indigo-900 opacity-5" viewBox="0 0 100 50">
      <path d="M0,25 L30,25 Q35,25 35,20 L35,5" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <path d="M0,25 L30,25 Q35,25 35,30 L35,45" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <rect x="35" y="0" width="65" height="50" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1 1" />
    </svg>

    {/* Central Core Brain */}
    <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[60vw] max-w-[800px] text-indigo-900 opacity-[0.02]" strokeWidth={0.3} />

    {/* Side Text */}
    <div className="absolute top-[20%] left-[2%] text-[9px] font-mono font-black tracking-[0.5em] text-indigo-200 rotate-90 origin-left uppercase">
      OS_CORE :: [STABLE_NODE]
    </div>
    <div className="absolute bottom-[20%] right-[2%] text-[9px] font-mono font-black tracking-[0.5em] text-indigo-200 -rotate-90 origin-right uppercase">
      DATA_STREAM :: [ACTIVE]
    </div>
  </div>
);

const App: React.FC = () => {
  const { firebaseUser, isAuthenticated: isFirebaseAuth, loading: authLoading, logout } = useAuth();
  const { addToast } = useToast();
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
  const [isEveChatOpen, setIsEveChatOpen] = useState(false);
  const [activeCaptureForEditing, setActiveCaptureForEditing] = useState<Capture | null>(null);
  const [publicInfoRoute, setPublicInfoRoute] = useState<AppRoute | null>(null);
  const [isStudioWorkspaceOpen, setIsStudioWorkspaceOpen] = useState(false);
  const [isProfilePhotoEditorOpen, setIsProfilePhotoEditorOpen] = useState(false);

  // ─── Secure Vault state ─────────────────────────────────────────────
  const [vaultStatus, setVaultStatus] = useState<VaultStatus>({
    encrypted: false, synced: false, lastSyncedAt: null, captureCount: 0,
  });
  const vaultSyncRef = useRef(false); // prevents sync loops

  // Scroll and Dynamic UI states
  const [isScrolled, setIsScrolled] = useState(false);
  const [isInstantLoading, setIsInstantLoading] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<any | null>(null);

  // Initialize join codes from URL synchronously to avoid landing page flashes
  const [guestJoinRoomCode, setGuestJoinRoomCode] = useState<string | null>(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/join\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  });
  const [cohostJoinRoomCode, setCohostJoinRoomCode] = useState<string | null>(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/cohost\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  });

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const uid = firebaseUser?.uid ?? null;

  // Sync Firebase auth state → local state & hydrate persisted data
  useEffect(() => {
    if (isFirebaseAuth && firebaseUser) {
      setIsAuthenticated(true);
      const id = firebaseUser.uid;

      // Hydrate non-capture persisted data (sync)
      const savedVideos = loadVideos(id);
      const savedSnippets = loadSnippets(id);
      const savedProfile = loadUserProfile(id);
      const savedWorkspace = loadWorkspace(id);
      const savedRoute = loadRoute(id);

      if (savedVideos.length) setVideos(savedVideos);
      if (savedSnippets.length) setSnippets(savedSnippets);
      if (savedWorkspace) setWorkspace(savedWorkspace);
      if (savedRoute) setCurrentRoute(savedRoute);

      // ─── Secure Vault: migrate & load encrypted captures ─────────
      (async () => {
        // 1. Try migrating old unencrypted captures to vault
        const migrated = await migrateToVault(id);
        if (migrated.length > 0) {
          setCaptures(migrated);
          addToast(`🔒 ${migrated.length} captures migrated to Secure Vault`, 'success');
        } else {
          // 2. Load from encrypted vault
          const vaultCaptures = await vaultLoadCaptures(id);
          if (vaultCaptures.length > 0) {
            setCaptures(vaultCaptures);
          }
        }
        setVaultStatus(prev => ({ ...prev, encrypted: true }));
      })();

      // Merge Firebase profile on top of saved profile
      setUser(prev => {
        const base = savedProfile ?? prev;
        return {
          ...base,
          name: firebaseUser.displayName || base.name,
          email: firebaseUser.email || base.email,
          avatar: firebaseUser.photoURL || base.avatar,
          uid: firebaseUser.uid,
        };
      });
    }
  }, [isFirebaseAuth, firebaseUser]);

  // ─── Auto-save state changes to localStorage ─────────────────────
  useEffect(() => {
    if (uid) saveVideos(uid, videos);
  }, [uid, videos]);

  // ─── Secure Vault: encrypted save + cloud sync for captures ──────
  useEffect(() => {
    if (!uid || vaultSyncRef.current) return;
    (async () => {
      // Encrypt and save to localStorage
      await vaultSaveCaptures(uid, captures);
      // Sync metadata to Firebase Realtime Database
      await syncCapturesToCloud(uid, captures);
      // Update vault status
      const now = new Date().toISOString();
      await updateVaultStatus(uid, {
        encrypted: true,
        synced: true,
        lastSyncedAt: now,
        captureCount: captures.length,
      });
      setVaultStatus({
        encrypted: true,
        synced: true,
        lastSyncedAt: now,
        captureCount: captures.length,
      });
    })();
  }, [uid, captures]);

  // ─── Secure Vault: subscribe to cloud sync (real-time) ───────────
  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToCaptureSync(uid, (cloudMetadata) => {
      // If cloud has captures that we don't have locally, flag it
      // (actual image data stays local — cloud only has metadata)
      setVaultStatus(prev => ({
        ...prev,
        synced: true,
        captureCount: cloudMetadata.length,
      }));
    });
    return () => unsubscribe();
  }, [uid]);

  useEffect(() => {
    if (uid) saveSnippets(uid, snippets);
  }, [uid, snippets]);

  useEffect(() => {
    if (uid) saveUserProfile(uid, user);
  }, [uid, user]);

  useEffect(() => {
    if (uid) saveWorkspace(uid, workspace);
  }, [uid, workspace]);

  useEffect(() => {
    if (uid) saveRoute(uid, currentRoute);
  }, [uid, currentRoute]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // setIsCommandPaletteOpen(prev => !prev); // Override Command Palette -> Show Studio
        setCurrentRoute(AppRoute.SHOW_STUDIO);
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'r') {
        e.preventDefault();
        handleRecord();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Detect /join/<code> or /cohost/<code> in URL for guest/co-host access (Sync already handled in useState, this is for dynamic updates)
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const guestMatch = path.match(/^\/join\/([a-zA-Z0-9_-]+)/);
      const cohostMatch = path.match(/^\/cohost\/([a-zA-Z0-9_-]+)/);
      if (guestMatch) {
        setGuestJoinRoomCode(guestMatch[1]);
      } else if (cohostMatch) {
        setCohostJoinRoomCode(cohostMatch[1]);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleGuestJoin = (guestName: string, guestEmail?: string, wantsRecording?: boolean) => {
    const roomCode = guestJoinRoomCode; // Capture value before clearing state
    console.log('[App] Guest Joining Room:', roomCode);
    // Clear the /join/ path from the URL
    window.history.replaceState({}, '', '/');
    setGuestJoinRoomCode(null);
    // Safety: If already logged in as a legitimate user (Owner/Admin/Member), don't overwrite with Guest
    const isActuallyGuest = !isAuthenticated || user.role === 'Guest' || (user as any).role === 'Viewer';

    if (isActuallyGuest) {
      setUser({
        uid: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: guestName,
        email: guestEmail || '',
        avatar: '',
        role: 'Guest',
        plan: 'Guest',
        videoLimit: 0,
        videoCount: 0,
      });
      setIsAuthenticated(true);
    }

    if (wantsRecording && guestEmail) {
      addToast(`Recording will be sent to ${guestEmail} after the session`, 'success');
    }
    setIsAuthenticated(true);
    setCurrentRoute(AppRoute.MEETINGS);
    // Create a meeting for them to join
    const guestMeeting = {
      id: roomCode || Date.now().toString(),
      title: 'Live Show',
      date: 'Today',
      time: 'Just now',
      type: 'Guest',
      attendees: 1,
      link: `${window.location.origin}/join/${roomCode}`,
      wantsRecording: wantsRecording && !!guestEmail,
    };
    setActiveMeeting(guestMeeting);
  };

  const handleCoHostJoin = (coHostName: string) => {
    const roomCode = cohostJoinRoomCode; // Capture value before clearing state
    // Clear the /cohost/ path from the URL
    window.history.replaceState({}, '', '/');
    setCohostJoinRoomCode(null);
    // If already a member/owner, keep their high-level role
    const isActuallyGuest = !isAuthenticated || user.role === 'Guest';

    if (isActuallyGuest) {
      setUser({
        name: coHostName,
        email: '',
        avatar: '',
        role: 'Co-host' as any,
        plan: 'Guest',
        videoLimit: 0,
        videoCount: 0,
      });
      setIsAuthenticated(true);
    }
    setCurrentRoute(AppRoute.MEETINGS);
    // Create a meeting for them to join as co-host
    const cohostMeeting = {
      id: roomCode || Date.now().toString(),
      title: 'Live Show',
      date: 'Today',
      time: 'Just now',
      type: 'Co-host',
      attendees: 1,
      link: `${window.location.origin}/join/${roomCode}`,
    };
    setActiveMeeting(cohostMeeting);
    addToast(`Joined as Co-host — you have full meeting controls`, 'success');
  };

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
    addToast('Welcome back!', 'success');
  };

  const handleDevLogin = () => {
    setIsAuthenticated(true);
    setIsDevMode(true);
  };

  const handleSignOut = async () => {
    await logout();
    setIsAuthenticated(false);
    setIsDevMode(false);
    setIsProfileOpen(false);
    setIsMinimized(false);
    setCurrentRoute(AppRoute.HOME);
    setSelectedVideo(null);
    setUser(INITIAL_USER);
    setWorkspace(INITIAL_WORKSPACE);
    addToast('Signed out successfully', 'info');
  };

  const handleRecord = () => setIsRecordingModalOpen(true);

  const handleScreenshot = (mode: 'fullscreen' | 'window' | 'region' | 'scrolling') => {
    setScreenshotMode(mode);
    setIsScreenshotMode(true);
  };

  const handleCaptureComplete = (mode: string, dataUrl: string) => {
    const newCapture: Capture = {
      id: Math.random().toString(36).substring(7),
      url: dataUrl,
      type: mode.charAt(0).toUpperCase() + mode.slice(1),
      createdAt: 'Just now',
      title: `Smart Snap (${mode})`
    };
    setCaptures(prev => [newCapture, ...prev]);
    setIsScreenshotMode(false);
    setActiveCaptureForEditing(newCapture);
    setCurrentRoute(AppRoute.SNAP_STUDIO);
    addToast('Screenshot captured — opening editor', 'success');
  };

  const handleSaveAnnotation = (newImageUrl: string) => {
    if (activeCaptureForEditing) {
      const existingCaptureIndex = captures.findIndex(c => c.id === activeCaptureForEditing.id);

      if (existingCaptureIndex > -1) {
        // It's an existing capture, update it
        setCaptures(prev => prev.map(c =>
          c.id === activeCaptureForEditing.id
            ? { ...c, url: newImageUrl, title: c.title?.includes('(Annotated)') ? c.title : `${c.title} (Annotated)` }
            : c
        ));
      } else {
        // It's a new capture from the studio, add it to the main vault
        const newCapture: Capture = {
          ...activeCaptureForEditing,
          url: newImageUrl,
        };
        setCaptures(prev => [newCapture, ...prev]);
      }

      setActiveCaptureForEditing(null);
      setCurrentRoute(AppRoute.CAPTURES);
      addToast('Snap saved to Captures', 'success');
    }
  };

  const handleDeleteCapture = (id: string) => {
    setCaptures(prev => prev.filter(c => c.id !== id));
    addToast('Capture deleted', 'info');
  };

  const handleSaveVideo = (newVideo: Video) => {
    setVideos([newVideo, ...videos]);
    setIsRecordingModalOpen(false);
    setIsActuallyRecording(false);
    setSelectedVideo(newVideo);
    setUser(prev => ({ ...prev, videoCount: prev.videoCount + 1 }));
    addToast('Show saved to your Library', 'success');
  };

  const handleInstantMeeting = (customCode?: string) => {
    setIsInstantLoading(true);
    setTimeout(() => {
      const roomCode = customCode || 'stream-room';
      const instantMeeting = {
        id: roomCode,
        title: user.name ? `${user.name.split(' ')[0]}'s Studio` : 'Member Studio',
        date: 'Today',
        time: 'Just now',
        type: 'Live Sync',
        attendees: 1,
        link: `${window.location.origin}/join/${roomCode}`
      };
      setActiveMeeting(instantMeeting);
      setCurrentRoute(AppRoute.MEETINGS); // Navigate to meetings to join the stream
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
      case AppRoute.HOME: return <Home user={user} onRecordClick={handleRecord} onStopClick={handleStopRecording} onNavigate={setCurrentRoute} coverImage={activeCoverImage} />;
      case AppRoute.LIBRARY: return <Library videos={filteredVideos} snippets={snippets} onVideoClick={handleVideoClick} onDeleteVideo={handleDeleteVideo} workspaceName={workspace.name} onBuyOptions={() => setIsPaymentOpen(true)} coverImage={activeCoverImage} />;
      case AppRoute.COURSES: return <Courses onVideoClick={handleVideoClick} coverImage={activeCoverImage} />;
      case AppRoute.SUMMARIES: return <Library videos={filteredVideos} snippets={snippets} onVideoClick={handleVideoClick} onDeleteVideo={handleDeleteVideo} workspaceName={workspace.name} onBuyOptions={() => setIsPaymentOpen(true)} variant="summaries" coverImage={activeCoverImage} />;
      case AppRoute.WATCH_LATER: return <Library videos={filteredVideos} snippets={snippets} onVideoClick={handleVideoClick} onDeleteVideo={handleDeleteVideo} workspaceName={workspace.name} onBuyOptions={() => setIsPaymentOpen(true)} variant="watchlater" coverImage={activeCoverImage} />;
      case AppRoute.BOARDS: return <InfiniteBoard videos={filteredVideos} onVideoClick={handleVideoClick} coverImage={activeCoverImage} />;
      case AppRoute.ROADMAP: return <Roadmap coverImage={activeCoverImage} />;
      case AppRoute.MEETINGS:
        return <Meetings user={user} snippets={snippets} coverImage={activeCoverImage} activeMeeting={activeMeeting} setActiveMeeting={setActiveMeeting} isInstantLoading={isInstantLoading} onInstantRoom={handleInstantMeeting} />;
      case AppRoute.STREAM_STUDIO:
        if (activeMeeting) {
          return <Meetings user={user} snippets={snippets} coverImage={activeCoverImage} activeMeeting={activeMeeting} setActiveMeeting={setActiveMeeting} isInstantLoading={isInstantLoading} onInstantRoom={handleInstantMeeting} />;
        }
        return <StreamStudio onEnterStudio={handleInstantMeeting} />;
      case AppRoute.SHOW_STUDIO: return <ShowStudioPage onClose={() => setCurrentRoute(AppRoute.HOME)} />;
      case AppRoute.CHAT: return <Chat user={user} workspace={workspace} coverImage={activeCoverImage} />;
      case AppRoute.CAPTURES:
      case AppRoute.SNAP_STUDIO: return <SnapStudio captures={captures} onEnterStudioWorkspace={() => setIsStudioWorkspaceOpen(true)} onQuickSnap={() => handleScreenshot('region')} onDeleteCapture={handleDeleteCapture} onEditCapture={(capture) => setActiveCaptureForEditing(capture)} onOpenProfileEditor={() => setIsProfilePhotoEditorOpen(true)} coverImage={activeCoverImage} vaultStatus={vaultStatus} />;
      case AppRoute.SETTINGS: return <SettingsPage user={user} onUpdateUser={(updates) => setUser(prev => ({ ...prev, ...updates }))} />;
      case AppRoute.RECENT: return <Recent videos={filteredVideos} onVideoClick={handleVideoClick} />;
      case AppRoute.EXTENSION: return <ExtensionHub />;
      case AppRoute.SPACES_ALL: return <Spaces workspace={workspace} />;
      case AppRoute.FOR_YOU: return <Explore user={user} onNavigate={setCurrentRoute} />;
      case AppRoute.ADMIN_MANAGE: return <Admin user={user} workspace={workspace} currentRoute={currentRoute as AppRoute} onNavigate={setCurrentRoute} />;
      default: return <Home user={user} onRecordClick={handleRecord} onNavigate={setCurrentRoute} coverImage={activeCoverImage} />;
    }
  };

  const handleVideoClick = (video: Video) => setSelectedVideo(video);
  const handleDeleteVideo = (id: string) => {
    setVideos(prev => {
      const next = prev.filter(v => v.id !== id);
      if (uid) saveVideos(uid, next);
      return next;
    });
    // Assuming addToast works based on line 200
  };

  const shouldShowFooter = !selectedVideo && ![AppRoute.BOARDS, AppRoute.CHAT, AppRoute.MEETINGS, AppRoute.RECENT].includes(currentRoute as AppRoute);

  const handleStopRecording = () => {
    const finishBtn = document.getElementById('finish-recording-btn');
    if (finishBtn) finishBtn.click();
    else setIsActuallyRecording(false);
  };

  // Co-host join page — shown for /cohost/<code> URLs, bypasses auth
  if (cohostJoinRoomCode) {
    return <CoHostJoin roomCode={cohostJoinRoomCode} onJoin={(name) => handleCoHostJoin(name)} />;
  }

  // Guest join page — shown for /join/<code> URLs, bypasses auth
  if (guestJoinRoomCode) {
    return <GuestJoin roomCode={guestJoinRoomCode} onJoin={(name, email, wantsRec) => handleGuestJoin(name, email, wantsRec)} />;
  }

  // Show a loading screen while Firebase resolves initial auth state
  if (authLoading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center gap-6">
        <Logo showText={true} className="scale-125" />
        <Loader2 className="size-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

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
        <LandingPage onSignIn={handleStartSignIn} onSignUp={handleStartOnboarding} onDevLogin={handleDevLogin} onNavigateInfo={(route) => setPublicInfoRoute(route)} onContactSales={() => setIsEveChatOpen(true)} />
        <EveChat isOpen={isEveChatOpen} onOpen={() => setIsEveChatOpen(true)} onClose={() => setIsEveChatOpen(false)} />
      </div>
    );
  }

  return (
    <div
      className={`flex h-screen overflow-hidden bg-[#f8fafc] relative selection:bg-indigo-100 selection:text-indigo-900`}
    >
      <GlobalDoodles />

      {isStudioWorkspaceOpen && <StudioWorkspace captures={captures} onClose={() => setIsStudioWorkspaceOpen(false)} onDelete={handleDeleteCapture} onEdit={setActiveCaptureForEditing} />}

      {isProfilePhotoEditorOpen && <ProfilePhotoEditor onClose={() => setIsProfilePhotoEditorOpen(false)} />}

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

      {!isMinimized && !activeMeeting && (
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
        {!isMinimized && !activeMeeting && (
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
          <div className="flex-1 relative pb-20"><ErrorBoundary>{renderContent()}</ErrorBoundary></div>
          {shouldShowFooter && <Footer onNavigate={setCurrentRoute} />}
        </div>

        {/* In-app nav pill removed — Show pill only appears on external pages via Chrome extension */}
        {!selectedVideo && !isMinimized && !activeMeeting && (
          <div
            className="fixed z-[150] flex items-center gap-1 p-2 bg-white/95 backdrop-blur-3xl rounded-full border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] select-none"
            style={{ bottom: 40, left: '50%', transform: 'translateX(-50%)' }}
          >

            {/* Home Button */}
            <button
              onClick={() => setCurrentRoute(AppRoute.HOME)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-colors text-xs font-black uppercase tracking-wider ${currentRoute === AppRoute.HOME
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
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-colors text-xs font-black uppercase tracking-wider ${currentRoute === AppRoute.LIBRARY
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
      {isRecordingModalOpen && <Recorder isMinimized={isMinimized} onClose={() => setIsRecordingModalOpen(false)} onSave={handleSaveVideo} onRecordingStatusChange={setIsActuallyRecording} />}
      {isScreenshotMode && <ScreenshotOverlay initialMode={screenshotMode} onCapture={handleCaptureComplete} onClose={() => setIsScreenshotMode(false)} />}
      {activeCaptureForEditing && <SnapEditor imageUrl={activeCaptureForEditing.url} initialTitle={activeCaptureForEditing.title} onSave={handleSaveAnnotation} onClose={() => setActiveCaptureForEditing(null)} />}
      {isPaymentOpen && <PaymentModal onClose={() => setIsPaymentOpen(false)} onSuccess={(tier) => setUser(p => ({ ...p, videoLimit: p.videoLimit + (tier === 'Pro' ? 200 : 50) }))} />}
      {isProfileOpen && <ProfileSidebar user={user} onClose={() => setIsProfileOpen(false)} onSignOut={handleSignOut} setRoute={setCurrentRoute} onUpdateUser={(u) => setUser(p => ({ ...p, ...u }))} onUpgradeClick={() => setIsPaymentOpen(true)} />}
    </div>
  );
};

export default App;
