
export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: number; // in seconds
  createdAt: string;
}

export type BoardElementType = 'video' | 'note' | 'text' | 'shape' | 'image' | 'group' | 'drawing';

export interface BoardElement {
  id: string;
  type: BoardElementType;
  x: number;
  y: number;
  w: number;
  h: number;
  content?: string;
  color?: string;
  videoId?: string;
  url?: string;
  rotation?: number;
  layer?: number;
  locked?: boolean;
  points?: {x: number, y: number}[];
}

export interface BoardConnection {
  id: string;
  from: string;
  to: string;
  type: 'straight' | 'curved' | 'elbow';
}

export interface Board {
  id: string;
  name: string;
  elements: BoardElement[];
  connections: BoardConnection[];
  lastModified: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  createdAt: string;
  author: string;
  views: number;
  aiSummary?: string;
  transcript?: string;
  chapters?: Array<{ time: string, label: string }>;
  comments?: Comment[];
}

export interface Module {
  id: string;
  title: string;
  videos: Video[];
  isCompleted?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  author: string;
  modules: Module[];
  enrolledStudents: number;
  progress?: number; // 0-100
  category: string;
}

export interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  author: string;
  createdAt: string;
  tags?: string[];
}

export type UserRole = 'Owner' | 'Admin' | 'Creator' | 'Viewer';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  plan: string;
  videoLimit: number;
  videoCount: number;
}

export interface Workspace {
  name: string;
  memberCount: number;
  initial: string;
}

export enum AppRoute {
  HOME = 'home',
  FOR_YOU = 'foryou',
  LIBRARY = 'library',
  COURSES = 'courses',
  SUMMARIES = 'summaries',
  MEETINGS = 'meetings',
  CHAT = 'chat',
  WATCH_LATER = 'watchlater',
  RECENT = 'recent',
  EARN_FREE = 'earnfree',
  SETTINGS = 'settings',
  CAPTURES = 'captures',
  BOARDS = 'boards',
  BUY_OPTIONS = 'buy_options',
  EXTENSION = 'extension',
  INTEGRATIONS = 'integrations',
  ROADMAP = 'roadmap',
  // Admin Routes
  ADMIN_MANAGE = 'admin_manage',
  ADMIN_USERS = 'admin_users',
  ADMIN_WORKSPACE = 'admin_workspace',
  ADMIN_BILLING = 'admin_billing',
  // Spaces Routes
  SPACES_ALL = 'spaces_all',
  SPACES_SPECIFIC = 'spaces_specific',
  // Info Routes
  ABOUT = 'about',
  CAREERS = 'careers',
  SECURITY = 'security',
  PRIVACY = 'privacy',
  TERMS = 'terms',
  PRESS_KIT = 'press_kit',
  CONTACT = 'contact',
  // Marketing & Header Routes
  PRODUCT = 'product',
  SOLUTIONS = 'solutions',
  CUSTOMERS = 'customers',
  ENTERPRISE = 'enterprise',
  PRICING = 'pricing',
  BLOG = 'blog',
  COMMUNITY = 'community',
  HELP = 'help'
}

export interface Space {
  id: string;
  name: string;
  members: number;
  videos: number;
  role: string;
  initial: string;
}

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  joinedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  time: string;
  attendees: string[];
  status: 'upcoming' | 'live' | 'ended';
  type: 'sync' | 'async';
}

export interface Capture {
  id: string;
  url: string;
  type: string;
  createdAt: string;
  title?: string;
}

export interface ProductionTask {
  id: string;
  title: string;
  status: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedTime: string;
}
