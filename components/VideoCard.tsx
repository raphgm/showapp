
import React from 'react';
import { MoreVertical, PlayCircle } from 'lucide-react';
import { Video } from '../types';

interface VideoCardProps {
  video: Video;
  onClick: (video: Video) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  return (
    <div 
      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1 transition-all cursor-pointer relative"
      onClick={() => onClick(video)}
    >
      <div className="aspect-video relative overflow-hidden bg-gray-100">
        <img 
          src={video.thumbnailUrl} 
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-all duration-300">
            <PlayCircle className="w-8 h-8 text-indigo-600 fill-indigo-500/10" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-indigo-950/80 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-lg border border-white/20">
          {video.duration}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-sm text-indigo-950 line-clamp-2 leading-tight flex-1 group-hover:text-indigo-600 transition-colors">
            {video.title}
          </h3>
          <button 
            onClick={(e) => { e.stopPropagation(); alert('Options for: ' + video.title); }}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 font-bold uppercase tracking-tighter">
          <span>{video.createdAt} • {video.views} views</span>
          <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">{video.author}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
