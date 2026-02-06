import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Sparkles, Loader2, ShieldCheck, Volume2, Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

// --- Audio Helper Functions (Optimized for 24kHz raw PCM) ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface EveCallerProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const EveCaller: React.FC<EveCallerProps> = ({ isOpen, onOpen, onClose }) => {
  const [callState, setCallState] = useState<'idle' | 'ringing' | 'connected' | 'error' | 'ending'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(15).fill(4));
  
  // Audio & Session Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isUserEndingRef = useRef(false);

  const SSLAB_KNOWLEDGE = `
    You are Eve, the high-performance Production Architect for SSLab's "Show" platform.
    
    CORE PHILOSOPHY: Show is an ASYNCHRONOUS first platform. Your job is to help users record high-quality, concise content so they can stop having live meetings.
    
    CRITICAL PROTOCOL:
    1. INITIATE IMMEDIATELY: Start the conversation the moment the link is established. 
    2. GREETING: "Neural link established. Hi, I'm Eve, your Production Architect. I'm here to help you script and structure your next asynchronous show. What knowledge are we capturing today?"
    3. DON'T WAIT: Do not wait for user silence to start speaking. Be proactive.
    
    BILLING PROTOCOL:
    - MENTION PAYMENT: You must gracefully mention that high-performance production requires a paid subscription.
    - REASONING: Explain that 4K mastering, unlimited show slots, and advanced neural indexing are premium features of the "Studio Pro" and "Enterprise" tiers.
    - PHRASING: "To maintain this level of architectural depth and unlock 4K mastering for your entire team, you'll need to establish a paid Studio subscription. It's an investment in your team's cognitive velocity."

    PLATFORM KNOWLEDGE:
    - SHOW STUDIO: 4K Ultra HD recording, 60fps (Premium feature).
    - INFINITE BOARDS: Spatial collaborative canvas for async walkthroughs.
    - ASSET VAULT: Neural-indexed team repository for on-demand learning.
    - ASYNC REVIEW: The main way teams use Show is by watching recordings and leaving frame-accurate comments later.
    
    TONE: Sophisticated, technical, warm, and highly efficient. You have a refined feminine voice (Kore).
  `;

  useEffect(() => {
    if (isOpen && callState === 'idle') {
      startCall();
    }
  }, [isOpen]);

  const cleanupAudio = (fullyDestroy = false) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    sessionPromiseRef.current = null;

    if (fullyDestroy) {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      if (inputAudioContextRef.current) {
        inputAudioContextRef.current.close().catch(() => {});
        inputAudioContextRef.current = null;
      }
    }
  };

  const startCall = async () => {
    isUserEndingRef.current = false;
    setErrorMessage(null);
    setCallState('ringing');
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
      if (!inputAudioContextRef.current) inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });

      if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
      if (inputAudioContextRef.current.state === 'suspended') await inputAudioContextRef.current.resume();

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SSLAB_KNOWLEDGE,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          }
        },
        callbacks: {
          onopen: async () => {
            setCallState('connected');
            
            // Proactive trigger
            sessionPromise.then(session => {
              session.sendRealtimeInput({ text: "START_SESSION_GREETING_IMMEDIATE" });
            });

            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              streamRef.current = stream;
              
              if (inputAudioContextRef.current) {
                const source = inputAudioContextRef.current.createMediaStreamSource(stream);
                const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                
                processor.onaudioprocess = (e) => {
                  const inputData = e.inputBuffer.getChannelData(0);
                  const l = inputData.length;
                  const int16 = new Int16Array(l);
                  for (let i = 0; i < l; i++) {
                    int16[i] = inputData[i] * 32768;
                  }
                  const base64Data = encode(new Uint8Array(int16.buffer));
                  sessionPromiseRef.current?.then(session => {
                    session.sendRealtimeInput({
                      media: { mimeType: 'audio/pcm;rate=16000', data: base64Data }
                    });
                  });
                };
                
                source.connect(processor);
                processor.connect(inputAudioContextRef.current.destination);
                processorRef.current = processor;
              }
            } catch (err) {
              console.error("Mic access failed", err);
              setErrorMessage("Microphone access denied. Please check permissions.");
              setCallState('error');
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              try {
                const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                source.addEventListener('ended', () => sourcesRef.current.delete(source));
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
                
                // Active Visualizer
                setAudioLevels(prev => prev.map(() => 15 + Math.random() * 45));
              } catch (e) {
                console.error("Audio playback error", e);
              }
            }
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setAudioLevels(new Array(15).fill(4));
            }
          },
          onclose: (e) => {
            if (!isUserEndingRef.current) {
               console.warn("Session closed unexpectedly", e);
               setErrorMessage("Neural signal lost. Re-establishing link...");
               handleUnexpectedDisconnect();
            }
          },
          onerror: (e) => {
            console.error("Eve Link Error", e);
            setErrorMessage("Connection integrity failure. Studio offline.");
            setCallState('error');
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (error) {
      console.error("Call failed to initialize", error);
      setCallState('error');
      setErrorMessage("Failed to initiate neural bridge.");
    }
  };

  const handleUnexpectedDisconnect = () => {
    cleanupAudio(false);
    setTimeout(() => {
      if (isOpen && !isUserEndingRef.current) {
        startCall();
      }
    }, 2000);
  };

  const endCall = () => {
    isUserEndingRef.current = true;
    setCallState('ending');
    cleanupAudio(true);
    setTimeout(() => {
      setCallState('idle');
      onClose();
    }, 800);
  };

  if (!isOpen && callState === 'idle') {
    return (
      <button
        onClick={onOpen}
        className="fixed bottom-8 right-8 z-[900] group flex items-center gap-3 pl-4 pr-1 h-8 bg-indigo-950 text-white rounded-full shadow-2xl hover:scale-105 transition-all duration-300 animate-in slide-in-from-bottom-10 border border-white/10"
      >
        <span className="font-black text-[10px] uppercase tracking-[0.3em]">Eve</span>
        <div className="size-6 bg-indigo-600 rounded-full flex items-center justify-center relative overflow-hidden group-hover:bg-indigo-50 transition-colors">
          <div className="absolute inset-0 bg-white/20 animate-ping rounded-full"></div>
          <Phone className="size-3 relative z-10 fill-white" />
        </div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 pointer-events-none">
      <div className={`
        pointer-events-auto relative bg-[#0a0a0b] text-white rounded-[56px] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.8)] 
        overflow-hidden transition-all duration-700 border border-white/5
        ${callState === 'idle' ? 'scale-90 opacity-0' : 'w-[400px] h-[680px] scale-100 opacity-100'}
      `}>
        {/* Background Atmosphere */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-600/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Header Branding */}
        <div className="p-10 flex flex-col items-center text-center space-y-4">
           <div className="flex items-center gap-3 text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] bg-indigo-950/40 px-4 py-2 rounded-2xl border border-indigo-500/20 backdrop-blur-xl">
             {callState === 'connected' ? <Wifi className="size-3 text-emerald-400" /> : <WifiOff className="size-3 text-rose-400" />}
             {callState === 'connected' ? 'Eve Link Active' : 'Establishing Sync'}
           </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-10 pb-20 space-y-12">
           <div className="relative">
              {(callState === 'ringing' || callState === 'error') && (
                <>
                  <div className={`absolute inset-[-20px] rounded-full border border-indigo-500/20 animate-ping ${callState === 'error' ? 'border-rose-500/30' : ''}`}></div>
                  <div className={`absolute inset-[-40px] rounded-full border border-indigo-500/10 animate-ping delay-300 ${callState === 'error' ? 'border-rose-500/15' : ''}`}></div>
                </>
              )}
              <div className={`w-40 h-40 rounded-[64px] bg-gradient-to-br p-[2px] shadow-2xl transform transition-all duration-700 ${callState === 'connected' ? 'from-indigo-500 via-purple-600 to-rose-500 rotate-3' : 'from-slate-700 to-slate-800 rotate-0'}`}>
                 <div className="w-full h-full rounded-[62px] bg-black overflow-hidden relative group">
                    <img 
                      src="https://images.unsplash.com/photo-1616790876844-97c0c6057364?auto=format&fit=crop&q=80&w=400" 
                      alt="Eve" 
                      className={`w-full h-full object-cover transition-all duration-[2000ms] ${callState === 'connected' ? 'opacity-80 scale-110' : 'opacity-40 grayscale scale-100'}`}
                    />
                    <div className="absolute inset-0 bg-indigo-950/20 mix-blend-overlay"></div>
                 </div>
              </div>
           </div>

           <div className="text-center space-y-3 w-full">
              <h2 className="text-4xl font-black tracking-tighter">Eve</h2>
              <div className="flex items-center justify-center h-8">
                 {callState === 'ringing' && (
                   <span className="text-indigo-400 font-bold text-sm tracking-widest uppercase animate-pulse flex items-center gap-3">
                      <Loader2 className="size-4 animate-spin" /> Calibrating Production...
                   </span>
                 )}
                 {callState === 'connected' && (
                    <div className="flex items-end gap-1.5 h-8">
                       {audioLevels.map((level, i) => (
                         <div 
                           key={i} 
                           className="w-2 bg-indigo-500 rounded-full transition-all duration-150"
                           style={{ height: `${level}%`, opacity: 0.4 + (level/100) }}
                         />
                       ))}
                    </div>
                 )}
                 {callState === 'error' && (
                   <span className="text-rose-500 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                     <AlertCircle className="size-3" /> Link Interrupted
                   </span>
                 )}
                 {callState === 'ending' && <span className="text-rose-500 font-black text-xs uppercase tracking-[0.4em]">Link Terminated</span>}
              </div>
           </div>

           {(callState === 'connected' || callState === 'error') && (
             <div className={`bg-white/5 border rounded-[32px] p-8 text-center w-full animate-in fade-in slide-in-from-bottom-4 duration-700 ${callState === 'error' ? 'border-rose-500/20' : 'border-white/10'}`}>
                <p className="text-indigo-200/60 font-medium leading-relaxed text-sm">
                  {callState === 'error' ? errorMessage : (
                    <>SSLab Content Hub Linked. <br /> <span className="text-white">Ready to script your next show.</span></>
                  )}
                </p>
                {callState === 'error' && (
                  <button 
                    onClick={startCall}
                    className="mt-4 flex items-center gap-2 mx-auto text-indigo-400 hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest"
                  >
                    <RefreshCw className="size-3" /> Re-establish Link
                  </button>
                )}
             </div>
           )}
        </div>

        {/* Footer Controls */}
        <div className="absolute bottom-0 inset-x-0 p-12 flex justify-center items-center z-50">
           <button 
             onClick={endCall}
             className="size-24 rounded-full bg-rose-600 flex items-center justify-center text-white hover:bg-rose-700 shadow-[0_20px_50px_rgba(225,29,72,0.4)] transition-all transform hover:scale-105 active:scale-95 group border-4 border-black ring-4 ring-rose-500/20"
           >
              <PhoneOff className="size-10 fill-white group-hover:scale-110 transition-transform" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default EveCaller;