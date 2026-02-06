
import React from 'react';
import Logo from './Logo';
import { AppRoute } from '../types';
import { ArrowRight } from 'lucide-react';

interface LandingHeaderProps {
  isScrolled: boolean;
  onSignIn: () => void;
  onSignUp: () => void;
  onNavigateInfo: (route: AppRoute) => void;
}

const LandingHeader: React.FC<LandingHeaderProps> = ({ isScrolled, onSignIn, onSignUp, onNavigateInfo }) => {
  const navLinks = [
    { label: 'Product', route: AppRoute.PRODUCT },
    { label: 'Solutions', route: AppRoute.SOLUTIONS },
    { label: 'Pricing', route: AppRoute.PRICING },
    { label: 'Enterprise', route: AppRoute.ENTERPRISE },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-lg border-b border-slate-100 shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Left: Logo & Nav */}
          <div className="flex items-center gap-10">
            <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer">
                <Logo showText={true} />
            </div>
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => (
                <button 
                  key={link.route} 
                  onClick={() => onNavigateInfo(link.route)} 
                  className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onSignIn} 
              className="hidden sm:block text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={onSignUp}
              className="flex items-center gap-2 bg-slate-950 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-900/10"
            >
              Join Show
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
