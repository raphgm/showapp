
import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Share2, Link, Eye, MoreVertical, Sparkles, 
  MessageSquare, ThumbsUp, BrainCircuit, Send, FileText, GraduationCap, Mail, Clock, CheckCircle,
  Cloud, Youtube, HardDrive, Twitter, Server, Globe, Loader2,
  X, ArrowUpRight, Play, Pause, Volume2, User, LayoutGrid, Award,
  ChevronRight, RefreshCw, HelpCircle, FastForward, Volume1, VolumeX,
  PenTool, Scissors, Zap, Linkedin, FileCode
} from 'lucide-react';
import { Video, Comment } from '../types';
import { askAiGenius, transmuteAsset, generateKnowledgeCheck } from '../services/geminiService';

interface VideoDetailProps {
  video: Video;
  onBack: () => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

const timeToSeconds = (timeStr: string) => {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
};

const VideoDetail: React.FC<VideoDetailProps> = ({ video, onBack }) => {
  const [commentInput, setCommentInput] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'ai' | 'relay'>('comments');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  
  // Relay State
  const [isTransmuting, setIsTransmuting] = useState<string | null>(null);
  const [transmutedContent, setTransmutedContent] = useState<string | null>(null);

  // AI Quiz State
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const [comments, setComments] = useState<Comment[]>(video.comments || [
    { id: 'c1', userId: 'u1', userName: 'Sarah Chen', userAvatar: '', text: 'Great explanation on the API setup!', timestamp: 45, createdAt: '2h ago' },
    { id: 'c2', userId: 'u2', userName: 'Marcus Lee', userAvatar: '', text: 'Can we dive deeper into security?', timestamp: 110, createdAt: '1h ago' }
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const updateTime = () => setCurrentTime(v.currentTime);
    const updateDuration = () => setDuration(v.duration);
    v.addEventListener('timeupdate', updateTime);
    v.addEventListener('loadedmetadata', updateDuration);
    return () => {
      v.removeEventListener('timeupdate', updateTime);
      v.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleStartQuiz = async () => {
    setActiveTab('ai'); // Switch to AI tab where quiz lives
    if (quiz.length > 0) return;
    setIsGeneratingQuiz(true);
    const questions = await generateKnowledgeCheck(video.transcript || video.description);
    setQuiz(questions);
    setIsGeneratingQuiz(false);
  };

  const handleTransmute = async (format: 'short' | 'linkedin' | 'documentation') => {
    setIsTransmuting(format);
    setTransmutedContent(null);
    const result = await transmuteAsset(video.transcript || video.description, format);
    setTransmutedContent(result);
    setIsTransmuting(null);
  };

  const handleAnswerQuiz = (index: number) => {
    if (index === quiz[currentQuizIndex].correctIndex) {
      setQuizScore(prev => prev + 1);
    }
    if (currentQuizIndex < quiz.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedValue = (x / rect.width) * duration;
    handleSeek(clickedValue);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      userId: 'me',
      userName: 'Raphael (You)',
      userAvatar: '',
      text: commentInput,
      timestamp: Math.floor(currentTime),
      createdAt: 'Just now'
    };
    setComments(prev => [...prev, newComment]);
    setCommentInput('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const heatmap = Array.from({ length: 40 }).map((_, i) => ({
    val: Math.sin(i * 0.5) * 40 + 50 + (Math.random() * 20),
    isKey: i % 8 === 0
  }));

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-6 min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-all group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Productions
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-emerald-100">
             <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
             Ecosystem Hub: Ready
          </div>
          <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200">
             Export to Infinite Board
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-10">
        <div className="space-y-10">
          {/* Enhanced Video Player */}
          <div className="relative aspect-video bg-slate-950 rounded-[48px] overflow-hidden shadow-[0_32px_128px_-16px_rgba(0,0,0,0.4)] group border-4 border-white transition-all duration-700">
            <video 
              ref={videoRef}
              src={video.videoUrl} 
              className="w-full h-full object-cover"
              onClick={togglePlay}
            />
            
            {/* Custom Overlay Controls */}
            <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 z-20">
              
              {/* Intelligence Heatmap */}
              <div className="relative h-12 flex items-end gap-0.5 mb-4 px-2 opacity-30 hover:opacity-100 transition-all">
                {heatmap.map((h, i) => (
                   <div 
                     key={i} 
                     className={`flex-1 rounded-full transition-all duration-500 ${h.isKey ? 'bg-indigo-400' : 'bg-white/10'}`} 
                     style={{ height: `${h.val}%` }}
                   />
                ))}
              </div>

              {/* Advanced Progress Bar with Seek Markers */}
              <div 
                ref={progressBarRef}
                onClick={handleProgressBarClick}
                className="relative h-2 bg-white/20 rounded-full mb-10 cursor-pointer group/bar transition-all hover:h-3"
              >
                {/* AI Chapter Markers */}
                {video.chapters?.map((chapter, i) => {
                  const chapterTime = timeToSeconds(chapter.time);
                  const pos = (chapterTime / duration) * 100;
                  return (
                    <div 
                      key={i}
                      className="absolute top-0 bottom-0 w-0.5 bg-white/40 z-10 hover:bg-white transition-colors"
                      style={{ left: `${pos}%` }}
                      title={chapter.label}
                    />
                  );
                })}

                {/* Comment Seek Markers */}
                {comments.map((comment, i) => {
                  const pos = (comment.timestamp / duration) * 100;
                  return (
                    <div 
                      key={comment.id}
                      className="absolute top-1/2 -translate-y-1/2 size-2.5 bg-emerald-400 rounded-full border-2 border-white shadow-lg z-20 hover:scale-150 transition-transform"
                      style={{ left: `${pos}%` }}
                    />
                  );
                })}

                {/* Active Progress */}
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full transition-all duration-75" 
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 size-4 bg-white rounded-full shadow-2xl scale-0 group-hover/bar:scale-100 transition-transform ring-4 ring-indigo-500/20" />
                </div>
              </div>

              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-10">
                  <button onClick={togglePlay} className="transition-transform active:scale-90">
                    {isPlaying ? <Pause className="w-10 h-10 fill-white" /> : <Play className="w-10 h-10 fill-white" />}
                  </button>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-[11px] font-black tracking-[0.3em] uppercase font-mono bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/5">
                      {formatTime(currentTime)} <span className="mx-2 opacity-20">/</span> {formatTime(duration)}
                    </div>

                    <div className="relative">
                      <button 
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border border-white/5"
                      >
                        <FastForward className="size-3.5" /> {playbackRate}x
                      </button>
                      {showSpeedMenu && (
                        <div className="absolute bottom-full mb-4 left-0 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex flex-col gap-1 shadow-2xl animate-in slide-in-from-bottom-2 duration-300">
                           {[0.5, 1, 1.25, 1.5, 2].map(rate => (
                             <button 
                               key={rate} 
                               onClick={() => handleSpeedChange(rate)}
                               className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-left transition-colors ${playbackRate === rate ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/10'}`}
                             >
                               {rate}x
                             </button>
                           ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3 group/volume">
                    <button onClick={() => setIsMuted(!isMuted)} className="text-white/60 hover:text-white transition-colors">
                      {isMuted || volume === 0 ? <VolumeX className="size-5" /> : volume < 0.5 ? <Volume1 className="size-5" /> : <Volume2 className="size-5" />}
                    </button>
                    <input 
                      type="range" 
                      min="0" max="1" step="0.01" 
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-24 accent-indigo-500 h-1 rounded-full cursor-pointer bg-white/20 appearance-none transition-all group-hover/volume:w-32" 
                    />
                  </div>
                  
                  <button onClick={handleStartQuiz} className="flex items-center gap-3 px-6 py-3 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-950/20 active:scale-95">
                     <GraduationCap className="size-4" /> Start Proficiency Check
                  </button>
                </div>
              </div>
            </div>

            {/* Frame Annotation Toggle (Mock UI) */}
            <div className="absolute top-8 left-8 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity z-30">
               <button className="size-14 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-indigo-600 transition-all shadow-2xl group/tool">
                  <PenTool className="size-6" />
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover/tool:opacity-100 transition-opacity">Visual Frame Markup</div>
               </button>
               <button className="size-14 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-rose-500 transition-all shadow-2xl group/tool">
                  <Scissors className="size-6" />
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-rose-500 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover/tool:opacity-100 transition-opacity">Asset Snapshot</div>
               </button>
            </div>
          </div>

          <div className="flex justify-between items-start gap-12 px-2">
            <div className="flex-1 space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-indigo-100">NEURAL INDEXED</div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Produced {video.createdAt}</div>
                </div>
                <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-[0.9] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
                  {video.title}
                </h1>
              </div>
              
              <div className="flex items-center gap-5 p-5 bg-slate-50 border border-slate-100 rounded-[32px] w-fit shadow-sm">
                <div className="size-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-100">
                  {video.author.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900 tracking-tight">{video.author}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chief Production Architect</p>
                </div>
                <div className="w-px h-10 bg-slate-200 mx-4"></div>
                <button className="px-6 py-3 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-[0.2em] shadow-sm">Follow Hub</button>
              </div>

              <div className="prose prose-slate max-w-none">
                 <p className="text-2xl text-slate-500 font-medium leading-relaxed tracking-tight">{video.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="flex flex-col h-[calc(100vh-8rem)] sticky top-24">
          <div className="bg-white border border-slate-100 rounded-[48px] flex flex-col h-full shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
            
            {/* Tab Navigation */}
            <div className="flex p-4 border-b border-slate-50 bg-slate-50/50">
               {[
                 { id: 'comments', label: 'Briefing Notes', icon: MessageSquare },
                 { id: 'ai', label: 'Genius Core', icon: BrainCircuit },
                 { id: 'relay', label: 'Relay Hub', icon: Zap }
               ].map(tab => (
                 <button 
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`flex-1 py-4 rounded-[24px] flex flex-col items-center gap-1.5 transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-xl ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    <tab.icon className="size-4.5" />
                    <span className="text-[9px] font-black uppercase tracking-[0.15em]">{tab.label}</span>
                 </button>
               ))}
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              {activeTab === 'comments' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {comments.sort((a,b) => a.timestamp - b.timestamp).map((c) => (
                    <div 
                      key={c.id} 
                      className="bg-slate-50 p-7 rounded-[40px] border border-transparent hover:border-indigo-100 hover:bg-white transition-all cursor-pointer group shadow-sm hover:shadow-2xl hover:shadow-indigo-50"
                      onClick={() => handleSeek(c.timestamp)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600 shadow-inner">
                            {c.userName.charAt(0)}
                          </div>
                          <div>
                            <span className="text-sm font-black text-slate-900 block">{c.userName}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{c.createdAt}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-indigo-500 bg-white border border-indigo-50 px-3 py-1.5 rounded-xl shadow-sm">
                          {formatTime(c.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed px-1">
                        {c.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'relay' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                   <div className="space-y-2">
                     <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Relay Hub</h3>
                     <p className="text-sm text-slate-400 font-medium leading-relaxed">Turn this production into high-impact collaborative assets for your ecosystem.</p>
                   </div>

                   {transmutedContent ? (
                     <div className="flex-1 flex flex-col space-y-4 animate-in zoom-in-95">
                        <div className="flex-1 bg-slate-50 p-8 rounded-[40px] border border-slate-100 overflow-y-auto no-scrollbar font-medium text-slate-600 leading-relaxed prose prose-sm prose-indigo">
                           <pre className="whitespace-pre-wrap font-sans text-sm">{transmutedContent}</pre>
                        </div>
                        <div className="flex gap-3">
                           <button onClick={() => setTransmutedContent(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Relay New</button>
                           <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Copy Result</button>
                        </div>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 gap-4">
                        {[
                          { id: 'short', label: 'Viral Relay', desc: 'Gen-Z style high-energy short script.', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                          { id: 'linkedin', label: 'Professional Auth', desc: 'Authority-driven summary for LinkedIn.', icon: Linkedin, color: 'text-blue-600', bg: 'bg-blue-50' },
                          { id: 'documentation', label: 'Structured Spec', desc: 'Clean technical documentation relay.', icon: FileCode, color: 'text-indigo-600', bg: 'bg-indigo-50' }
                        ].map(r => (
                          <button 
                            key={r.id} 
                            onClick={() => handleTransmute(r.id as any)}
                            disabled={!!isTransmuting}
                            className="p-6 bg-white border border-slate-100 rounded-[32px] text-left hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-50 transition-all group flex items-start gap-5 disabled:opacity-50"
                          >
                             <div className={`size-14 ${r.bg} rounded-2xl flex items-center justify-center ${r.color} group-hover:scale-110 transition-transform shadow-sm`}>
                                {isTransmuting === r.id ? <Loader2 className="size-6 animate-spin" /> : <r.icon className="size-7" />}
                             </div>
                             <div>
                                <div className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{r.label}</div>
                                <div className="text-[11px] font-bold text-slate-400 mt-0.5">{r.desc}</div>
                             </div>
                          </button>
                        ))}
                     </div>
                   )}
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="space-y-8 animate-in zoom-in-95 duration-500 h-full flex flex-col">
                   {isGeneratingQuiz ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="size-24 border-4 border-indigo-100 rounded-full flex items-center justify-center relative">
                           <Loader2 className="size-12 text-indigo-600 animate-spin absolute" />
                           <BrainCircuit className="size-8 text-indigo-200" />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-xl font-black text-slate-900">Genius Core Analysis</h3>
                           <p className="text-sm text-slate-400 font-medium">Extracting conceptual milestones...</p>
                        </div>
                     </div>
                   ) : quizCompleted ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                        <div className="size-32 bg-emerald-50 rounded-[48px] flex items-center justify-center text-emerald-600 shadow-inner border border-emerald-100">
                           <Award className="size-16" />
                        </div>
                        <div className="space-y-3">
                           <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Phase Mastered</h3>
                           <p className="text-xl text-slate-500 font-medium">Validation: {quizScore}/{quiz.length}</p>
                        </div>
                        <button 
                          onClick={() => { setQuizCompleted(false); setCurrentQuizIndex(0); setQuizScore(0); }}
                          className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-3"
                        >
                          <RefreshCw className="size-4" /> Recalibrate Checkpoint
                        </button>
                     </div>
                   ) : quiz.length > 0 ? (
                     <div className="space-y-8 h-full flex flex-col">
                        <div className="space-y-3">
                           <div className="flex justify-between items-center text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                              <span>Question {currentQuizIndex + 1} of {quiz.length}</span>
                              <span>{Math.round(((currentQuizIndex) / quiz.length) * 100)}% Mastery</span>
                           </div>
                           <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-600 transition-all duration-700 shadow-[0_0_12px_rgba(79,70,229,0.5)]" style={{ width: `${(currentQuizIndex / quiz.length) * 100}%` }} />
                           </div>
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
                           {quiz[currentQuizIndex].question}
                        </h3>

                        <div className="space-y-4 flex-1">
                           {quiz[currentQuizIndex].options.map((opt, i) => (
                             <button 
                               key={i}
                               onClick={() => handleAnswerQuiz(i)}
                               className="w-full p-7 text-left bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-[36px] font-bold text-base transition-all flex items-center justify-between group shadow-sm hover:shadow-xl hover:shadow-indigo-100"
                             >
                                <span className="max-w-[85%]">{opt}</span>
                                <ChevronRight className="size-5 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                             </button>
                           ))}
                        </div>
                     </div>
                   ) : (
                     <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                        <div className="p-10 bg-indigo-600 rounded-[56px] text-white space-y-8 shadow-2xl shadow-indigo-200 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-8 opacity-10">
                              <Sparkles className="size-20" />
                           </div>
                           <div className="space-y-4 relative z-10">
                              <div className="size-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                                 <BrainCircuit className="size-6 text-indigo-100" />
                              </div>
                              <h3 className="text-3xl font-black leading-none tracking-tighter">Genius Core <br />Insights</h3>
                           </div>
                           <p className="text-indigo-50 font-medium leading-relaxed text-lg relative z-10">
                              Use Show Genius to extract deep semantic checkpoints or validate retention across your production hub.
                           </p>
                           <button 
                             onClick={handleStartQuiz}
                             className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest relative z-10 shadow-xl hover:bg-indigo-50 transition-all"
                           >
                              Synthesize Checkpoints
                           </button>
                        </div>
                        
                        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                           <div className="text-center">
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mb-1">Neural Bridge Active</p>
                              <p className="text-sm text-slate-400 font-medium">Validation matrix ready for deployment.</p>
                           </div>
                        </div>
                     </div>
                   )}
                </div>
              )}
            </div>

            {/* Sticky Input for Briefing Notes */}
            <div className="p-8 border-t border-slate-50 bg-white">
              <div className="flex items-center gap-4 bg-slate-50 rounded-[40px] p-2 pr-5 shadow-inner border border-slate-100 group focus-within:border-indigo-400 transition-all">
                <input 
                  type="text" 
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(); }}
                  placeholder={`Capture logic at ${formatTime(currentTime)}...`}
                  className="flex-1 bg-transparent border-none outline-none px-7 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300"
                />
                <button 
                  onClick={handleAddComment}
                  className="size-12 bg-indigo-600 text-white rounded-[20px] shadow-xl hover:bg-indigo-700 transition-all active:scale-90 flex items-center justify-center shrink-0"
                >
                  <Send className="size-4.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;
