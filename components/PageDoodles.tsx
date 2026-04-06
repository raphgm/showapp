import React, { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface PageDoodlesProps {
  variant?: 'default' | 'minimal' | 'technical';
}

const useScrollParallax = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const container = ref.current?.closest('[class*="overflow"]') ||
      ref.current?.closest('main') ||
      document.querySelector('main') ||
      ref.current?.parentElement;

    if (!container) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY((container as HTMLElement).scrollTop ?? 0);
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  return { ref, scrollY };
};

const PageDoodles: React.FC<PageDoodlesProps> = ({ variant = 'default' }) => {
  const { ref, scrollY } = useScrollParallax();
  const s = scrollY * 0.1; // base parallax factor

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none opacity-[0.18]">
      <style>{`
        @keyframes doodle-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes doodle-float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        @keyframes doodle-float-reverse { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(15px); } }
        @keyframes doodle-pulse { 0%, 100% { opacity: 0.8; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
      `}</style>

      {/* Blueprint Circle — Top Right */}
      <div className="absolute -top-40 -right-40 w-[900px] h-[900px] text-indigo-600 will-change-transform"
        style={{ transform: `translateY(${s * 0.3}px) rotate(${s * 0.4}deg)` }}>
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          style={{ animation: 'doodle-spin 120s linear infinite' }}
        >
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="1 3" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.15" />
          <path d="M50,0 L50,100 M0,50 L100,50" stroke="currentColor" strokeWidth="0.08" strokeDasharray="1 2" />
        </svg>
      </div>

      {/* Corner Measurement Markings */}
      <div
        className="absolute top-20 left-20 w-32 h-32 border-t-2 border-l-2 border-slate-400 rounded-tl-3xl opacity-40 will-change-transform"
        style={{ transform: `translate(${s * -0.15}px, ${s * -0.2}px)`, animation: 'doodle-pulse 8s ease-in-out infinite' }}
      />
      <div
        className="absolute bottom-20 right-20 w-32 h-32 border-b-2 border-r-2 border-slate-400 rounded-br-3xl opacity-40 will-change-transform"
        style={{ transform: `translate(${s * 0.15}px, ${s * 0.2}px)`, animation: 'doodle-pulse 8s ease-in-out infinite 4s' }}
      />

      {/* Technical Text — Left Edge */}
      <div
        className="absolute top-[25%] left-[3%] text-[10px] font-mono font-black text-indigo-500/50 rotate-90 origin-left uppercase tracking-[0.5em] will-change-transform"
        style={{ transform: `rotate(90deg) translateX(${s * 0.5}px)` }}
      >
        SHOW_OS :: [INITIALIZED]
      </div>

      {/* Technical Text — Right Edge */}
      <div
        className="absolute bottom-[25%] right-[3%] text-[10px] font-mono font-black text-indigo-500/50 -rotate-90 origin-right uppercase tracking-[0.5em] will-change-transform"
        style={{ transform: `rotate(-90deg) translateX(${s * -0.5}px)` }}
      >
        RENDER_V3 :: [READY]
      </div>

      {/* Hand-drawn Sketchy Workflow Doodle — Upper Left */}
      <div className="absolute top-[10%] left-[12%] w-72 h-72 text-indigo-400/50 will-change-transform"
        style={{ transform: `translateY(${s * -0.6}px) scale(${1 + s * 0.001})` }}>
        <svg
          className="w-full h-full"
          viewBox="0 0 200 200"
          style={{ animation: 'doodle-float 6s ease-in-out infinite' }}
        >
          <path d="M20,20 Q50,10 80,30 T140,20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="20" y="40" width="60" height="40" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M85,60 L120,60 Q135,60 135,80 L135,120" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="135" cy="135" r="15" fill="none" stroke="currentColor" strokeWidth="2.5" />
        </svg>
      </div>

      {variant !== 'minimal' && (
        <>
          {/* Wireframe Cube Doodle — Bottom Center */}
          <div className="absolute bottom-[8%] left-[35%] w-48 h-48 text-slate-300 will-change-transform"
            style={{ transform: `translateY(${s * 0.8}px) rotate(${s * -0.3}deg)` }}>
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              style={{ animation: 'doodle-float-reverse 7s ease-in-out infinite' }}
            >
              <path d="M30,30 L70,30 L70,70 L30,70 Z M45,15 L85,15 L85,55 L45,55 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M30,30 L45,15 M70,30 L85,15 M70,70 L85,55 M30,70 L45,55" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </div>

          {/* Sparkle Accent */}
          <div
            className="absolute top-[16%] right-[25%] will-change-transform"
            style={{ transform: `translateY(${s * -0.4}px) rotate(${s * 0.6}deg) scale(${1 + Math.sin(s * 0.05) * 0.1})` }}
          >
            <Sparkles className="size-16 text-indigo-500/30" style={{ animation: 'doodle-pulse 3s ease-in-out infinite' }} />
          </div>

          {/* Dot Grid Patch — Bottom Left */}
          <svg
            className="absolute bottom-[15%] left-[8%] w-40 h-40 text-indigo-400/30 will-change-transform"
            viewBox="0 0 100 100"
            style={{ transform: `translateY(${s * 0.5}px) translateX(${s * -0.15}px)` }}
          >
            {Array.from({ length: 5 }).map((_, row) =>
              Array.from({ length: 5 }).map((_, col) => (
                <circle key={`${row}-${col}`} cx={10 + col * 20} cy={10 + row * 20} r="1.5" fill="currentColor" />
              ))
            )}
          </svg>
        </>
      )}

      {variant === 'technical' && (
        <>
          {/* Extra technical arc — right side */}
          <div className="absolute top-[40%] -right-10 w-64 h-64 text-indigo-500/25 will-change-transform"
            style={{ transform: `translateY(${s * 0.4}px) rotate(${s * 0.2}deg)` }}>
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              style={{ animation: 'doodle-spin 60s linear infinite reverse' }}
            >
              <path d="M80,10 A40,40 0 0,1 80,90" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 3" />
              <path d="M70,20 A30,30 0 0,1 70,80" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Crosshair — center-left */}
          <svg
            className="absolute top-[55%] left-[22%] w-24 h-24 text-slate-400/40 will-change-transform"
            viewBox="0 0 100 100"
            style={{ transform: `translateY(${s * -0.3}px) rotate(${s * -0.5}deg)` }}
          >
            <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M50,20 L50,80 M20,50 L80,50" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="3" fill="currentColor" opacity="0.4" />
          </svg>
        </>
      )}
    </div>
  );
};

export default PageDoodles;
