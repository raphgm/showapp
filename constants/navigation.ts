
import { 
  Home, 
  Compass, 
  Library as LibraryIcon, 
  LayoutGrid, 
  Video, 
  MessageSquare, 
  Image as ImageIcon, 
  Users,
  Bookmark,
  History,
  Settings,
  Sparkles,
  Puzzle,
  FolderOpen,
  BrainCircuit,
  ListTodo,
  BookOpen
} from 'lucide-react';
import { AppRoute } from '../types';

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  coverImage: string;
  description?: string;
  badge?: string;
}

export interface SecondaryNavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  { 
    id: AppRoute.HOME, 
    label: 'Studio', 
    icon: Home,
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2000',
    description: 'Your creative command center.'
  },
  { 
    id: AppRoute.COURSES, 
    label: 'Knowledge Hub', 
    icon: BookOpen,
    coverImage: 'https://images.unsplash.com/photo-1523050335191-0361001a4f00?auto=format&fit=crop&q=80&w=2000',
    badge: 'Series',
    description: 'Professional content series and documentation.'
  },
  { 
    id: AppRoute.FOR_YOU, 
    label: 'Explore', 
    icon: Compass,
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2000',
    description: 'Discover trending content across the organization.'
  },
  { 
    id: AppRoute.LIBRARY, 
    label: 'Asset Vault', 
    icon: FolderOpen,
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200',
    description: 'All your recordings, organized and indexed.'
  },
  { 
    id: AppRoute.BOARDS, 
    label: 'Boards', 
    icon: LayoutGrid,
    coverImage: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&q=80&w=2000',
    badge: 'New',
    description: 'Infinite canvas for boundless ideation.'
  },
  { 
    id: AppRoute.ROADMAP, 
    label: 'Roadmap', 
    icon: ListTodo,
    coverImage: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=2000',
    description: 'Prioritize your production pipeline.'
  },
  { 
    id: AppRoute.MEETINGS, 
    label: 'Meetings', 
    icon: Video,
    coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2000',
    description: 'Sync and async collaboration spaces.'
  },
  { 
    id: AppRoute.CHAT, 
    label: 'Chat', 
    icon: MessageSquare,
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2000',
    description: 'Team communication and AI genius.'
  },
  { 
    id: AppRoute.CAPTURES, 
    label: 'Captures', 
    icon: ImageIcon,
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=2000',
    description: 'Screenshots and stitched captures.'
  },
  { 
    id: AppRoute.SPACES_ALL, 
    label: 'Teams', 
    icon: Users,
    coverImage: 'https://images.unsplash.com/photo-152202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=2000',
    description: 'Manage your people and permissions.'
  },
];

export const SECONDARY_NAV_ITEMS: SecondaryNavItem[] = [
  { id: AppRoute.SUMMARIES, icon: BrainCircuit, label: 'AI Intelligence' },
  { id: AppRoute.WATCH_LATER, icon: Bookmark, label: 'Watch later' },
  { id: AppRoute.RECENT, icon: History, label: 'Recent' },
  { id: AppRoute.SETTINGS, icon: Settings, label: 'Personal settings' },
];
