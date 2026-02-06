
import React, { useState } from 'react';
import { 
  ArrowRight, Mail, Lock, Eye, EyeOff, 
  Loader2, Github, Chrome, ChevronLeft,
  Sparkles, Fingerprint, ShieldCheck
} from 'lucide-react';
import Logo from './Logo';

interface SignInProps {
  onSuccess: () => void;
  onNavigateSignUp: () => void;
  onCancel: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSuccess, onNavigateSignUp, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-white flex items-center justify-center font-sans overflow-hidden p-6">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[#f8faff] opacity-50 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#c7d2fe 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative w-full max-w-[480px] animate-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[48px] shadow-[0_40px_100px_-20px_rgba(79,70,229,0.15)] border border-slate-100 p-12 relative overflow-hidden">
          
          {/* Subtle Scanline Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/0 via-slate-500/5 to-white/0 h-1 w-full animate-scanline opacity-10"></div>

          <div className="flex flex-col items-center text-center mb-10">
            <button onClick={onCancel} className="absolute top-8 left-8 p-2 text-slate-300 hover:text-slate-900 transition-colors">
              <ChevronLeft className="size-5" />
            </button>
            <Logo showText={true} className="mb-8 scale-110" />
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Welcome Back</h2>
              <p className="text-slate-400 font-medium">Access your production studio.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                <input 
                  autoFocus
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-14 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-950 text-white py-5 rounded-[24px] font-black text-lg shadow-2xl hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
            >
              {isLoading ? <Loader2 className="size-5 animate-spin" /> : <><Fingerprint className="size-5" /> Sign In</>}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-slate-50 space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-x-0 h-px bg-slate-50"></div>
              <span className="relative px-4 bg-white text-[10px] font-black text-slate-300 uppercase tracking-widest">Authorized Methods</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 py-3 border-2 border-slate-50 rounded-2xl hover:border-indigo-100 hover:bg-indigo-50/50 transition-all group">
                <svg className="size-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-xs font-black text-slate-600">Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 py-3 border-2 border-slate-50 rounded-2xl hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all group">
                <Github className="size-5" />
                <span className="text-xs font-black">GitHub</span>
              </button>
            </div>

            <p className="text-center text-sm font-medium text-slate-500">
              New to Show? {' '}
              <button onClick={onNavigateSignUp} className="text-indigo-600 font-black hover:underline underline-offset-4">Create workspace</button>
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-8 opacity-30 text-[9px] font-black text-slate-900 uppercase tracking-[0.4em]">
           <span className="flex items-center gap-2"><ShieldCheck className="size-3" /> SECURED_AUTH</span>
           <span>v2.4.0_STABLE</span>
        </div>
      </div>
      
      <style>{`
        @keyframes scanline {
          0% { top: -10%; }
          100% { top: 110%; }
        }
        .animate-scanline {
          animation: scanline 10s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SignIn;
