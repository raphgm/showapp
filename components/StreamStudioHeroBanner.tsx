import React from 'react';
import HeroBanner from './HeroBanner';
import { Video, Calendar, Users, Link2 } from 'lucide-react';

const StreamStudioHeroBanner: React.FC = () => {
  return (
    <HeroBanner
      gradientFrom="from-blue-900"
      gradientTo="to-indigo-900"
      title={
        <>
          <span className="block text-base md:text-lg font-bold text-blue-200 mb-1 tracking-widest uppercase">Welcome to</span>
          Stream Studio.
        </>
      }
      description="Launch a live broadcast, record a high-fidelity show, or manage your streaming channels. Your central hub for content creation."
      imageUrl="/assets/stream-studio-mockup.png"
      imageAlt="Stream Studio Mockup"
      buttons={[
        <button key="instant" className="h-12 px-7 bg-blue-700 text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-lg hover:bg-blue-800 transition-all flex items-center gap-2">
          <Video className="size-4" /> INSTANT MEETING
        </button>,
        <button key="schedule" className="h-12 px-7 bg-white text-blue-900 rounded-xl font-black text-sm uppercase tracking-wider border border-blue-200 hover:bg-blue-50 transition-all flex items-center gap-2">
          <Calendar className="size-4" /> SCHEDULE A SHOW
        </button>,
        <button key="join" className="h-12 px-7 bg-blue-950 text-white rounded-xl font-black text-sm uppercase tracking-wider border border-blue-800 hover:bg-blue-900 transition-all flex items-center gap-2">
          <Users className="size-4" /> JOIN A SHOW
        </button>,
        <button key="link" className="h-12 px-7 bg-blue-100 text-blue-900 rounded-xl font-black text-sm uppercase tracking-wider border border-blue-200 hover:bg-blue-200 transition-all flex items-center gap-2">
          <Link2 className="size-4" /> CREATE A LINK
        </button>
      ]}
      className="my-12"
      titleClassName="text-white"
      descClassName="text-blue-100"
    />
  );
};

export default StreamStudioHeroBanner;
