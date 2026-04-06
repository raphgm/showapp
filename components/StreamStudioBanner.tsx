import React from 'react';
import { Video, Calendar, Users, Link2 } from 'lucide-react';

const StreamStudioBanner: React.FC = () => (
  <section className="relative w-full min-h-[420px] flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-blue-900 to-indigo-900 rounded-[40px] shadow-2xl overflow-hidden p-10 md:p-16 my-10">
    {/* Left: Text */}
    <div className="flex-1 flex flex-col justify-center z-10">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 font-black text-[12px] uppercase tracking-[0.25em] mb-6">
        <span className="flex items-center"><span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>Production Grade</span>
      </div>
      <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
        Welcome to<br />Stream Studio.
      </h1>
      <p className="text-lg md:text-2xl text-blue-100 font-medium mb-8 max-w-xl">
        Launch a live broadcast, record a high-fidelity show, or manage your streaming channels. Your central hub for content creation.
      </p>
      <div className="flex flex-wrap gap-4">
        <button className="flex items-center gap-2 px-7 h-14 bg-white text-blue-900 font-black rounded-2xl text-sm uppercase tracking-wider shadow hover:bg-blue-50 transition">
          <Video className="size-5" /> Instant Meeting
        </button>
        <button className="flex items-center gap-2 px-7 h-14 bg-blue-800 text-white font-black rounded-2xl text-sm uppercase tracking-wider shadow hover:bg-blue-900 transition">
          <Calendar className="size-5" /> Schedule a Show
        </button>
        <button className="flex items-center gap-2 px-7 h-14 bg-blue-950 text-white font-black rounded-2xl text-sm uppercase tracking-wider shadow hover:bg-blue-900 transition">
          <Users className="size-5" /> Join a Show
        </button>
        <button className="flex items-center gap-2 px-7 h-14 bg-blue-100 text-blue-900 font-black rounded-2xl text-sm uppercase tracking-wider shadow hover:bg-blue-200 transition">
          <Link2 className="size-5" /> Create a Link
        </button>
      </div>
    </div>
    {/* Right: Image */}
    <div className="flex-1 flex items-center justify-center relative mt-10 md:mt-0 md:ml-10">
      <div className="relative rounded-3xl overflow-hidden shadow-xl w-[420px] h-[260px] bg-slate-900">
        <img src="/assets/stream-studio-mockup.png" alt="Stream Studio" className="w-full h-full object-cover" />
        <div className="absolute bottom-4 left-4 px-4 py-2 rounded-xl bg-black/80 text-white text-xs font-bold flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>LIVE PREVIEW
        </div>
      </div>
    </div>
    {/* Subtle grid overlay */}
    <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
  </section>
);

export default StreamStudioBanner;
