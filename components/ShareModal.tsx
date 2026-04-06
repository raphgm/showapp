
import React, { useState } from 'react';
import { X, Copy, Check, Send, Globe, Youtube, HardDrive, Cloud, Link as LinkIcon, CheckCircle2, ExternalLink } from 'lucide-react';

interface ShareModalProps {
  onClose: () => void;
  productionUrl: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ onClose, productionUrl }) => {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [sentEmails, setSentEmails] = useState<string[]>([]);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const copyLink = () => {
    navigator.clipboard.writeText(productionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const subject = encodeURIComponent('Check out this Show production');
    const body = encodeURIComponent(
      `Hey!\n\nI wanted to share this production with you:\n\n${productionUrl}\n\nTake a look when you get a chance!`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');

    setSentEmails(prev => [...prev, email]);
    setSent(true);
    setEmail('');
    setTimeout(() => setSent(false), 3000);
  };

  const handleExport = (platform: string) => {
    setExportStatus(platform);
    switch (platform) {
      case 'YouTube':
        window.open('https://studio.youtube.com/channel/upload', '_blank');
        break;
      case 'Cloud':
        navigator.clipboard.writeText(productionUrl);
        break;
      case 'Download': {
        const link = document.createElement('a');
        link.href = productionUrl;
        link.download = `show-production-${Date.now()}.mp4`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        break;
      }
    }
    setTimeout(() => setExportStatus(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-white/95 backdrop-blur-3xl w-full max-w-lg rounded-[48px] border border-slate-100 p-10 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 space-y-10">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Distribute Production</h3>
            <p className="text-slate-500 font-medium">Share your masterpiece with your team and the world.</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all shadow-sm">
            <X className="size-6" />
          </button>
        </div>

        {/* Copy Link */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-1">Public Share Link</label>
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
            <div className="p-3 bg-white rounded-xl text-indigo-600 border border-slate-100 shadow-sm">
              <LinkIcon className="size-5" />
            </div>
            <input 
              readOnly 
              value={productionUrl}
              className="flex-1 bg-transparent text-sm font-bold text-slate-700 outline-none"
            />
            <button
              onClick={copyLink}
              className={`px-6 h-12 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md flex items-center gap-2 ${copied ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Email Invite */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-1">Invite via Email</label>
          <form onSubmit={handleSendEmail} className="flex items-center gap-3">
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@company.com"
              required
              className="flex-1 border-2 border-slate-50 bg-slate-50/50 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all text-base"
            />
            <button
              type="submit"
              className={`h-14 px-6 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2 ${
                sent ? 'bg-emerald-500 text-white' : 'bg-slate-950 text-white hover:bg-slate-800'
              }`}
            >
              {sent ? <CheckCircle2 className="size-5" /> : <Send className="size-5" />}
            </button>
          </form>
          {sentEmails.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {sentEmails.map((e, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
                  <CheckCircle2 className="size-3" /> {e}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Export & Publish */}
        <div className="space-y-6 pt-6 border-t border-slate-100">
           <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-1">Export & Publish</label>
           <div className="grid grid-cols-3 gap-4">
             {[
               { name: 'YouTube', icon: Youtube, color: 'hover:bg-red-50 hover:border-red-200 hover:text-red-600', activeColor: 'bg-red-50 border-red-200 text-red-600' },
               { name: 'Cloud', icon: Cloud, color: 'hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600', activeColor: 'bg-sky-50 border-sky-200 text-sky-600' },
               { name: 'Download', icon: HardDrive, color: 'hover:bg-slate-100 hover:border-slate-300 hover:text-slate-800', activeColor: 'bg-slate-100 border-slate-300 text-slate-800' }
             ].map(opt => (
               <button
                 key={opt.name}
                 onClick={() => handleExport(opt.name)}
                 className={`flex flex-col items-center justify-center gap-2 p-6 bg-white border-2 rounded-3xl transition-all group ${
                   exportStatus === opt.name ? `${opt.activeColor} scale-95` : `border-slate-100 ${opt.color}`
                 }`}
               >
                 {exportStatus === opt.name
                   ? <CheckCircle2 className="size-6 animate-in zoom-in" />
                   : <opt.icon className="size-6 text-slate-400 group-hover:scale-110 transition-transform" />
                 }
                 <span className="text-xs font-black uppercase tracking-widest">
                   {exportStatus === opt.name ? (opt.name === 'Download' ? 'Saving...' : 'Opened!') : opt.name}
                 </span>
               </button>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
