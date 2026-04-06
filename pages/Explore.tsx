import React, { useState, useMemo } from 'react';
import { 
  Search, Flame, Sparkles, Award, TrendingUp, Heart, MessageCircle, Share2,
  Filter, Grid3x3, List, Eye, Zap, Radio, Users, Volume2, Compass,
  ArrowRight, Play, Video, Aperture, Wand2, BookOpen
} from 'lucide-react';
import { UserProfile } from '../types';
import PageDoodles from '../components/PageDoodles';

interface ExploreProps {
  user?: UserProfile;
  onNavigate: (route: string) => void;
}

interface Creator {
  id: string;
  name: string;
  avatar: string;
  handle: string;
  followers: number;
  isFollowing: boolean;
  badges: string[];
  specialty: string;
}

interface Show {
  id: string;
  title: string;
  creator: string;
  thumbnail: string;
  views: number;
  likes: number;
  category: string;
  duration: string;
  isLive: boolean;
  status?: 'trending' | 'new' | 'featured';
}

const Explore: React.FC<ExploreProps> = ({ user, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [followedCreators, setFollowedCreators] = useState<Set<string>>(new Set());

  const shows: Show[] = [
    {
      id: '1',
      title: 'The Monday Show - Web Design Trends 2026',
      creator: 'Sarah Chen',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=500',
      views: 24500,
      likes: 3200,
      category: 'Live Show',
      duration: '42:15',
      isLive: true,
      status: 'trending'
    },
    {
      id: '2',
      title: 'Behind the Scenes: Production Studio Setup',
      creator: 'Marcus Production',
      thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?auto=format&fit=crop&q=80&w=500',
      views: 18900,
      likes: 2100,
      category: 'Behind the Scenes',
      duration: '28:45',
      isLive: false,
      status: 'new'
    },
    {
      id: '3',
      title: 'Live Coding Session: Building Real-Time Dashboards',
      creator: 'Alex Rivera',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=500',
      views: 35600,
      likes: 5200,
      category: 'Live Coding',
      duration: '1:32:20',
      isLive: true,
      status: 'featured'
    },
    {
      id: '4',
      title: 'The Creative Process: Designing Your Brand',
      creator: 'Priya Designs',
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=500',
      views: 12200,
      likes: 2800,
      category: 'Tutorial',
      duration: '35:30',
      isLive: false
    },
    {
      id: '5',
      title: 'Studio Tour: Inside Our Production Workspace',
      creator: 'Pro Studios',
      thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=500',
      views: 7800,
      likes: 1900,
      category: 'Studio Tour',
      duration: '18:10',
      isLive: false
    },
    {
      id: '6',
      title: 'Streaming Master Class: Engagement Strategies',
      creator: 'Stream Expert',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-adf4198c838d?auto=format&fit=crop&q=80&w=500',
      views: 21200,
      likes: 4400,
      category: 'Masterclass',
      duration: '51:45',
      isLive: true,
      status: 'featured'
    }
  ];

  const topCreators: Creator[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      handle: '@sarahdesign',
      followers: 45300,
      isFollowing: false,
      badges: ['Verified', 'Creator'],
      specialty: 'Design & UX'
    },
    {
      id: '2',
      name: 'Marcus Production',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      handle: '@marcuspro',
      followers: 32800,
      isFollowing: false,
      badges: ['Verified', 'Producer'],
      specialty: 'Studio Production'
    },
    {
      id: '3',
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
      handle: '@alexrivera',
      followers: 58200,
      isFollowing: false,
      badges: ['Verified', 'Creator', 'Top'],
      specialty: 'Live Coding'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Shows', icon: Compass, color: 'from-indigo-500 to-blue-500' },
    { id: 'live', label: 'Live Now', icon: Radio, color: 'from-red-500 to-pink-500' },
    { id: 'trending', label: 'Trending', icon: Flame, color: 'from-orange-500 to-red-500' },
    { id: 'tutorial', label: 'Tutorials', icon: BookOpen, color: 'from-purple-500 to-pink-500' },
    { id: 'studio', label: 'Studio Tours', icon: Aperture, color: 'from-cyan-500 to-blue-500' },
  ];

  const filteredShows = useMemo(() => {
    let filtered = shows;

    if (searchQuery) {
      filtered = filtered.filter(
        s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
             s.creator.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory === 'live') {
      filtered = filtered.filter(s => s.isLive);
    } else if (selectedCategory === 'trending') {
      filtered = filtered.filter(s => s.status === 'trending').sort((a, b) => b.views - a.views);
    } else if (selectedCategory === 'tutorial') {
      filtered = filtered.filter(s => s.category.toLowerCase().includes('tutorial') || s.category.toLowerCase().includes('masterclass'));
    } else if (selectedCategory === 'studio') {
      filtered = filtered.filter(s => s.category.toLowerCase().includes('studio') || s.category.toLowerCase().includes('behind'));
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const displayCreators = useMemo(() => {
    return topCreators
      .map(c => ({
        ...c,
        isFollowing: followedCreators.has(c.id)
      }))
      .sort((a, b) => b.followers - a.followers);
  }, [followedCreators]);

  const toggleFollow = (creatorId: string) => {
    setFollowedCreators(prev => {
      const updated = new Set(prev);
      if (updated.has(creatorId)) {
        updated.delete(creatorId);
      } else {
        updated.add(creatorId);
      }
      return updated;
    });
  };

  return (
    <div className="min-h-screen">
      <PageDoodles variant="technical" />

      {/* ═══════════════════════════════════════════ */}
      {/* HERO SECTION — Discover Creators & Shows   */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-indigo-500/5 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-violet-500/5 via-transparent to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left — Text + CTAs */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-indigo-100 rounded-full shadow-sm">
                <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Show Studio Network</span>
                <span className="text-[10px] text-slate-400 font-medium">Explore</span>
              </div>

              {/* Heading */}
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-[1.05]">
                  Discover the Best
                  <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Shows & Creators.
                  </span>
                </h1>
                <p className="text-lg text-slate-500 max-w-md leading-relaxed">
                  Explore trending live shows, production tutorials, coding sessions, and inspiring creator stories from the Show Studio community.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3 pt-4">
                <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all active:scale-95 flex items-center gap-2 shadow-lg hover:shadow-xl">
                  <Play className="size-4" />
                  Browse Shows
                </button>
                <button className="px-6 py-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-900 font-bold rounded-lg transition-all hover:bg-slate-50">
                  Follow Creators
                  <ArrowRight className="size-4 ml-2 inline" />
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-8 border-t border-slate-100">
                <div>
                  <div className="text-2xl font-bold text-slate-900">2,840+</div>
                  <div className="text-sm text-slate-500">Active Creators</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">15K+</div>
                  <div className="text-sm text-slate-500">Shows Streamed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">890K</div>
                  <div className="text-sm text-slate-500">Community Members</div>
                </div>
              </div>
            </div>

            {/* Right — Visual Preview */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl overflow-hidden border border-white/50 backdrop-blur-xl">
                <div className="w-full h-full bg-gradient-to-br from-indigo-600/80 to-purple-600/80 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="size-20 mx-auto bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-lg">
                      <Play className="size-10 text-white fill-white" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-white font-bold text-lg">Live Shows</p>
                      <p className="text-white/70 text-sm">12 streaming now</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-48 h-48 bg-gradient-to-tl from-indigo-300/30 to-transparent rounded-2xl blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* STICKY HEADER & SEARCH                     */}
      {/* ═══════════════════════════════════════════ */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Latest Shows</h2>
              <p className="text-slate-500 text-sm mt-1">Find your next favorite show or creator</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-slate-500'}`}
              >
                <Grid3x3 className="size-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-slate-500'}`}
              >
                <List className="size-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search shows, creators, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* CATEGORY PILLS                             */}
      {/* ═══════════════════════════════════════════ */}
      <div className="sticky top-24 z-30 bg-white/50 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <cat.icon className="size-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* MAIN CONTENT                               */}
      {/* ═══════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        
        {/* Top Creators */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Featured Creators</h3>
              <p className="text-slate-500 text-sm mt-1">Follow talented creators in the community</p>
            </div>
            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm">View More →</a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayCreators.map(creator => (
              <div key={creator.id} className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="size-20 rounded-full object-cover border-4 border-indigo-100"
                    />
                    {creator.badges.includes('Verified') && (
                      <Award className="absolute bottom-0 right-0 size-6 text-blue-500 bg-white rounded-full p-1" />
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">{creator.name}</h3>
                  <p className="text-slate-500 text-sm">{creator.handle}</p>
                  <p className="text-slate-600 text-xs bg-indigo-50 px-3 py-1 rounded-full mt-2">{creator.specialty}</p>
                  <p className="text-slate-600 font-semibold mb-4 mt-3">{(creator.followers / 1000).toFixed(1)}K followers</p>
                  <button
                    onClick={() => toggleFollow(creator.id)}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                      creator.isFollowing
                        ? 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {creator.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shows Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShows.map(show => (
              <div
                key={show.id}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all"
              >
                <div className="relative overflow-hidden bg-slate-200 aspect-video">
                  <img
                    src={show.thumbnail}
                    alt={show.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {show.isLive && (
                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      <Radio className="size-3" />
                      LIVE
                    </div>
                  )}
                  {show.status === 'trending' && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      <Flame className="size-3" />
                      Trending
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
                    {show.duration}
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {show.title}
                  </h4>
                  <p className="text-slate-500 text-sm mb-4">{show.creator}</p>

                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="size-3" />
                        {(show.views / 1000).toFixed(1)}K
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="size-3" />
                        {(show.likes / 1000).toFixed(1)}K
                      </span>
                    </div>
                    <span className="bg-indigo-100 px-2 py-1 rounded text-indigo-700 font-semibold">
                      {show.category}
                    </span>
                  </div>

                  <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition-all active:scale-95">
                    Watch Show
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredShows.map(show => (
              <div
                key={show.id}
                className="flex gap-4 bg-white rounded-xl p-4 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-lg bg-slate-200 w-48 h-28 flex-shrink-0">
                  <img
                    src={show.thumbnail}
                    alt={show.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {show.isLive && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                      <Radio className="size-3" />
                      LIVE
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {show.title}
                    </h4>
                    <p className="text-slate-500 text-sm">{show.creator}</p>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="size-3" />
                      {(show.views / 1000).toFixed(1)}K views
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="size-3" />
                      {(show.likes / 1000).toFixed(1)}K likes
                    </span>
                    <span className="bg-indigo-100 px-2 py-1 rounded text-indigo-700 font-semibold">
                      {show.category}
                    </span>
                  </div>
                </div>

                <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all whitespace-nowrap h-fit">
                  Watch
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
