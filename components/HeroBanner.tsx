
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
      
      {/* Noise Texture for Texture/Depth */}
      <div className="absolute inset-0 opacity-[0.15] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none"></div>
      
      {/* Animated Glow Orbs */}
      <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-white/10 blur-[100px] rounded-full pointer-events-none mix-blend-overlay animate-pulse-slow"></div>
      <div className="absolute -bottom-[30%] -left-[10%] w-[500px] h-[500px] bg-black/20 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Content Container */}
      <div className="relative z-10 p-12 md:p-16 flex flex-col md:flex-row items-center gap-16">
        
        {/* Text Section */}
        <div className="flex-1 text-center md:text-left space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="size-3.5 text-amber-300 fill-amber-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90">Production Grade</span>
          </div>
          
          <div className="space-y-6">
            <h2 className={`text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] ${titleClassName}`}>
              {title}
            </h2>
            <p className={`text-lg md:text-xl font-medium leading-relaxed max-w-lg mx-auto md:mx-0 opacity-90 ${descClassName}`}>
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
        <div className="w-full md:w-[48%] relative group/card">
           {/* Shadow/Glow underneath */}
           <div className="absolute inset-4 bg-indigo-950/50 blur-2xl rounded-[40px] transform translate-y-8 opacity-60"></div>
           
           <div className="relative rounded-[40px] overflow-hidden border border-white/10 shadow-2xl bg-white/5 backdrop-blur-sm transform transition-all duration-700 md:group-hover/card:scale-[1.02] md:group-hover/card:-translate-y-2">
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
      `}</style>
    </div>
  );
};

export default HeroBanner;
