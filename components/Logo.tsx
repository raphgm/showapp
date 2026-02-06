
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "", showText = false }) => {
  return (
    <div className={`flex items-center gap-4 cursor-default select-none group ${className}`}>
      {/* Icon Part: Gradient Circle matching the provided image */}
      <div className="relative w-12 h-12 flex-shrink-0 transition-transform duration-500 ease-out group-hover:scale-105">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#3b27b2] via-[#8227b2] to-[#b61cc9] flex items-center justify-center shadow-xl shadow-indigo-100/50">
          <svg 
            viewBox="0 0 24 24" 
            className="w-5 h-5 text-white ml-0.5 fill-current"
            style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))' }}
          >
             <path d="M5.5 4.866a1.5 1.5 0 0 1 2.227-1.313l13.5 7.42a1.5 1.5 0 0 1 0 2.626l-13.5 7.42A1.5 1.5 0 0 1 5.5 19.706V4.866Z" />
          </svg>
        </div>
      </div>

      {/* Text Part: "Show" in dark charcoal matching the provided image */}
      {showText && (
        <span className="text-[40px] font-black text-[#333333] tracking-tight leading-none">
          Show
        </span>
      )}
    </div>
  );
};

export default Logo;
