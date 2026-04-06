
import React, { useState } from 'react';
import { Video, Sparkles, Layers } from 'lucide-react';

interface HeroBannerProps {
  title: string | React.ReactNode;
  description: string;
  imageUrl: string;
  gradientFrom?: string;
  gradientTo?: string;
  buttons?: React.ReactNode;
  imageAlt?: string;
  className?: string;
  titleClassName?: string;
  descClassName?: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({
  title,
  description,
  imageUrl,
  gradientFrom = "from-indigo-600",
  gradientTo = "to-violet-600",
  buttons,
  imageAlt = "Hero Visual",
  className = "",
  titleClassName = "text-white",
  descClassName = "text-indigo-50"
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`relative w-full rounded-[48px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(79,70,229,0.2)] group ${className}`}>
      {/* Main Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} transition-all duration-1000`}></div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Noise Texture for Texture/Depth */}
      <div className="absolute inset-0 opacity-[0.15] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none"></div>

      {/* Animated Glow Orbs */}
      <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-white/10 blur-[100px] rounded-full pointer-events-none mix-blend-overlay animate-pulse-slow"></div>
      <div className="absolute -bottom-[30%] -left-[10%] w-[500px] h-[500px] bg-black/20 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Content Container */}
      <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">

        {/* Text Section */}
        <div className="flex-1 text-center md:text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="size-3.5 text-emerald-300 fill-emerald-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90">Production Grade</span>
          </div>

          <div className="space-y-4">
            <h2 className={`text-4xl md:text-5xl font-black tracking-tighter leading-[0.9] ${titleClassName}`}>
              {title}
            </h2>
            <p className={`text-base md:text-lg font-medium leading-relaxed max-w-lg mx-auto md:mx-0 opacity-90 ${descClassName}`}>
              {description}
            </p>
          </div>

          {buttons && (
            <div className="flex flex-wrap gap-4 pt-2 justify-center md:justify-start animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {buttons}
            </div>
          )}
        </div>

        {/* Visual Section - Floating 3D Card */}
        <div className="w-full md:w-[40%] relative group/card">
          {/* Shadow/Glow underneath */}
          <div className="absolute inset-4 bg-indigo-950/40 blur-2xl rounded-[32px] transform translate-y-6 opacity-50"></div>

          <div className="relative rounded-[32px] overflow-hidden border border-white/10 shadow-lg bg-white/5 backdrop-blur-sm transform transition-all duration-700 md:group-hover/card:scale-[1.02] md:group-hover/card:-translate-y-2">
            {/* Glass Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 z-20 pointer-events-none"></div>

            {imageError ? (
              <div className="aspect-[16/10] bg-slate-900/50 flex flex-col items-center justify-center gap-4 text-slate-500">
                <Layers className="size-16 opacity-50" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Visual Feed</span>
              </div>
            ) : (
              <div className="aspect-[16/10] relative">
                <img
                  src={imageUrl}
                  alt={imageAlt}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover opacity-90 group-hover/card:opacity-100 transition-opacity duration-700"
                />
                <div className="absolute inset-0 bg-indigo-900/10 mix-blend-multiply"></div>
              </div>
            )}

            {/* Floating UI Badge on Image */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Preview</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-pulse-slow {
          animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes doodle-spin-extra-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes doodle-float-slow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        @keyframes doodle-pulse-glow { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.05); } }
      `}</style>

      {/* ─── Augmented Reality Doodles ────────────────────── */}

      {/* Rotating Radar/Scan Circle - Top Right */}
      <div className="absolute -top-20 -right-20 w-[600px] h-[600px] pointer-events-none opacity-20" style={{ animation: 'doodle-spin-extra-slow 60s linear infinite' }}>
        <svg viewBox="0 0 100 100" className="w-full h-full text-white/30">
          <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1 2" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.1" />
          <path d="M50,0 L50,10 M50,90 L50,100 M0,50 L10,50 M90,50 L100,50" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="0.5 4" />
        </svg>
      </div>

      {/* Floating Geometric Shapes - Bottom Left */}
      <svg className="absolute bottom-10 left-10 w-32 h-32 text-emerald-300/20 pointer-events-none" style={{ animation: 'doodle-float-slow 8s ease-in-out infinite' }} viewBox="0 0 100 100">
        <path d="M50,20 L80,70 L20,70 Z" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="50" cy="45" r="5" fill="currentColor" opacity="0.5" />
      </svg>

      {/* Pulsing Signal Waves - Center Right */}
      <div className="absolute top-1/2 right-[20%] w-64 h-64 -translate-y-1/2 pointer-events-none">
        <svg className="w-full h-full text-purple-300/30" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" className="opacity-0" style={{ animation: 'doodle-pulse-glow 4s ease-in-out infinite' }} />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.2" className="opacity-0" style={{ animation: 'doodle-pulse-glow 4s ease-in-out infinite 1s' }} />
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.1" className="opacity-0" style={{ animation: 'doodle-pulse-glow 4s ease-in-out infinite 2s' }} />
        </svg>
      </div>
    </div>
  );
};

export default HeroBanner;
