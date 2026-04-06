import React, { useState } from 'react';
import { 
  Plus, Users, FolderOpen, MoreHorizontal, LayoutGrid, 
  UserPlus, Mail, X, Loader2, CheckCircle2,
  Activity, Eye, Crown, Shield, Zap, 
  BarChart3, Video, Sparkles, ArrowUpRight
} from 'lucide-react';
import { Space, Workspace, WorkspaceMember, UserRole } from '../types';
import HeroBanner from '../components/HeroBanner';
import PageDoodles from '../components/PageDoodles';

interface SpacesProps {
  workspace: Workspace;
}

const Spaces: React.FC<SpacesProps> = ({ workspace }) => {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Spaces' | 'Team' | 'Activity'>('Overview');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Creator');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const [members, setMembers] = useState<WorkspaceMember[]>([
    { id: '1', name: 'You', email: '', avatar: '', role: 'Owner', joinedAt: 'Founder' },
  ]);

  const [spaces, setSpaces] = useState<Space[]>([
    { id: '1', name: `${workspace.name} Team Space`, members: workspace.memberCount, videos: 0, role: 'Admin', initial: workspace.initial }
  ]);

  const handleCreateSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim()) return;
    const newSpace: Space = {
      id: Date.now().toString(),
      name: newSpaceName,
      members: 1,
      videos: 0,
      role: 'Admin',
      initial: newSpaceName.charAt(0).toUpperCase()
    };
    setSpaces([...spaces, newSpace]);
    setNewSpaceName('');
    setIsCreateModalOpen(false);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    setTimeout(() => {
      const newMember: WorkspaceMember = {
        id: Date.now().toString(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        avatar: '',
        role: inviteRole,
        joinedAt: 'Just now'
      };
      setMembers([newMember, ...members]);
      setIsInviting(false);
      setInviteSuccess(true);
      setTimeout(() => {
        setInviteSuccess(false);
        setIsInviteModalOpen(false);
        setInviteEmail('');
      }, 1500);
    }, 1000);
  };

  const getRoleBadge = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      Owner: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      Admin: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      Creator: 'bg-amber-50 text-amber-600 border-amber-100',
      Viewer: 'bg-slate-50 text-slate-500 border-slate-100'
    };
    const icons: Record<UserRole, React.ReactNode> = {
      Owner: <Crown className="size-3" />,
      Admin: <Shield className="size-3" />,
      Creator: <Zap className="size-3" />,
      Viewer: <Eye className="size-3" />
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${colors[role]}`}>
        {icons[role]} {role}
      </span>
    );
  };

  const rolePermissions = [
    { role: 'Owner', icon: Crown, color: 'from-indigo-500 to-violet-600', bg: 'bg-indigo-50', border: 'border-indigo-100', desc: 'Full workspace control, billing, and member management', perms: ['All permissions', 'Billing & plans', 'Delete workspace', 'Transfer ownership'] },
    { role: 'Admin', icon: Shield, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', border: 'border-emerald-100', desc: 'Manage team, spaces, and content moderation', perms: ['Invite & remove members', 'Manage spaces', 'Moderate content', 'View analytics'] },
    { role: 'Creator', icon: Zap, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', border: 'border-amber-100', desc: 'Create, edit, and publish content in assigned spaces', perms: ['Record & upload', 'Edit own content', 'Share externally', 'Comment & react'] },
    { role: 'Viewer', icon: Eye, color: 'from-slate-400 to-zinc-500', bg: 'bg-slate-50', border: 'border-slate-100', desc: 'View-only access to shared content and spaces', perms: ['View content', 'Add comments', 'Download (if allowed)', 'View-only mode'] },
  ];

  const activityFeed = [
    { user: 'You', action: 'created workspace', target: workspace.name, time: 'Just now', icon: Sparkles, color: 'text-indigo-500' },
    ...(members.length > 1 ? members.slice(0, -1).map(m => ({ user: m.name, action: 'joined the team as', target: m.role, time: m.joinedAt, icon: UserPlus, color: 'text-emerald-500' })) : []),
    ...(spaces.length > 1 ? spaces.slice(1).map(s => ({ user: 'You', action: 'created space', target: s.name, time: 'Recently', icon: FolderOpen, color: 'text-violet-500' })) : []),
  ];

  const teamStats = [
    { label: 'Team Members', value: members.length, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50', trend: '+' + members.length },
    { label: 'Active Spaces', value: spaces.length, icon: LayoutGrid, color: 'text-violet-500', bg: 'bg-violet-50', trend: '+' + spaces.length },
    { label: 'Roles Defined', value: new Set(members.map(m => m.role)).size, icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-50', trend: 'Configured' },
    { label: 'Pending Invites', value: 0, icon: Mail, color: 'text-amber-500', bg: 'bg-amber-50', trend: 'None' },
  ];

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 bg-white min-h-screen relative">
      <PageDoodles />
      
      {/* ── Invite Member Modal ── */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-10 w-full max-w-xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300 relative overflow-hidden">
            {inviteSuccess ? (
              <div className="text-center space-y-8 py-10 animate-in slide-in-from-bottom-4">
                 <div className="size-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                   <CheckCircle2 className="size-10 text-emerald-500" />
                 </div>
                 <div className="space-y-2">
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">Invitation Sent!</h3>
                   <p className="text-slate-400 font-medium">They'll receive an email with access instructions.</p>
                 </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className="size-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                      <UserPlus className="size-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Invite Team Member</h3>
                      <p className="text-slate-400 text-sm font-medium">Add someone to {workspace.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsInviteModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
                    <X className="size-5" />
                  </button>
                </div>

                <form onSubmit={handleInviteSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                      <input 
                        autoFocus type="email" required value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Role</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Admin', 'Creator', 'Viewer'] as UserRole[]).map((role) => (
                        <button
                          key={role} type="button"
                          onClick={() => setInviteRole(role)}
                          className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all ${inviteRole === role ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-200'}`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setIsInviteModalOpen(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                    <button 
                      type="submit" disabled={isInviting || !inviteEmail.trim()}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-bold hover:from-indigo-500 hover:to-violet-500 flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                    >
                      {isInviting ? <Loader2 className="size-3 animate-spin" /> : <Mail className="size-3" />}
                      {isInviting ? 'Sending…' : 'Send Invite'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Create Space Modal ── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
                  <FolderOpen className="size-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Create Space</h3>
                  <p className="text-slate-400 text-sm font-medium">A home for your team's work</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSpace} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Space Name</label>
                <input 
                  autoFocus type="text" value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  placeholder="e.g. Marketing, Engineering"
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" disabled={!newSpaceName.trim()} className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-xs font-bold hover:from-violet-500 hover:to-fuchsia-500 flex items-center gap-2 shadow-lg shadow-violet-200 transition-all disabled:opacity-50">
                  <Plus className="size-3" /> Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Hero Banner ── */}
      <HeroBanner 
        title={<>Scale your <br />Production Team.</>}
        description="Organize your team into spaces, define roles & permissions, and collaborate with enterprise-grade governance across your entire workspace."
        imageUrl="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
        gradientFrom="from-[#1e1b4b]"
        gradientTo="to-[#4338ca]"
        buttons={
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => setIsInviteModalOpen(true)} className="flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95">
              <UserPlus className="size-4" /> Invite Member
            </button>
            <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-3 bg-white/10 text-white border border-white/20 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-all active:scale-95 backdrop-blur-sm">
              <FolderOpen className="size-4" /> Create Space
            </button>
          </div>
        }
      />

      {/* ── Team Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {teamStats.map(stat => (
          <div key={stat.label} className="p-5 bg-white rounded-[24px] border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`size-10 ${stat.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className={`size-5 ${stat.color}`} />
              </div>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg">{stat.trend}</span>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-2xl border border-slate-100 w-fit">
        {[
          { id: 'Overview', icon: BarChart3 },
          { id: 'Spaces', icon: LayoutGrid },
          { id: 'Team', icon: Users },
          { id: 'Activity', icon: Activity },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-slate-900 shadow-sm border border-slate-100' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className="size-3.5" />
            {tab.id}
          </button>
        ))}
      </div>

      {/* ═══════ OVERVIEW TAB ═══════ */}
      {activeTab === 'Overview' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Role Permission Cards */}
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Roles & Permissions</h2>
                  <div className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded-lg">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">{rolePermissions.length} ROLES</span>
                  </div>
                </div>
                <p className="text-slate-400 mt-2">Define access levels and capabilities for your team members.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {rolePermissions.map(rp => {
                const Icon = rp.icon;
                const count = members.filter(m => m.role === rp.role).length;
                return (
                  <div key={rp.role} className={`group p-6 bg-white rounded-[24px] border ${rp.border} hover:shadow-lg hover:-translate-y-0.5 transition-all relative overflow-hidden`}>
                    <div className={`absolute top-0 right-0 w-24 h-24 ${rp.bg} rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity`} />
                    <div className="relative">
                      <div className={`size-11 bg-gradient-to-br ${rp.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="size-5 text-white" />
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-black text-slate-900">{rp.role}</h3>
                        <span className={`text-xs font-bold ${rp.bg} ${count > 0 ? 'text-slate-600' : 'text-slate-400'} px-2 py-0.5 rounded-lg`}>{count}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium mb-4 leading-relaxed">{rp.desc}</p>
                      <div className="space-y-1.5">
                        {rp.perms.map(p => (
                          <div key={p} className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                            <CheckCircle2 className="size-3 text-emerald-400 flex-shrink-0" />
                            {p}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workspace Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button onClick={() => setIsInviteModalOpen(true)} className="p-7 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-[28px] border border-indigo-100 hover:shadow-lg hover:-translate-y-1 transition-all group text-left">
              <div className="size-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                <UserPlus className="size-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-1">Invite People</h3>
              <p className="text-slate-400 text-sm font-medium">Grow your team with new members</p>
            </button>
            <button onClick={() => setIsCreateModalOpen(true)} className="p-7 bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-[28px] border border-violet-100 hover:shadow-lg hover:-translate-y-1 transition-all group text-left">
              <div className="size-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-violet-200 group-hover:scale-110 transition-transform">
                <FolderOpen className="size-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-1">Create Space</h3>
              <p className="text-slate-400 text-sm font-medium">Organize work into team spaces</p>
            </button>
            <button onClick={() => setActiveTab('Team')} className="p-7 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[28px] border border-emerald-100 hover:shadow-lg hover:-translate-y-1 transition-all group text-left">
              <div className="size-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                <Shield className="size-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-1">Manage Roles</h3>
              <p className="text-slate-400 text-sm font-medium">Configure access and permissions</p>
            </button>
          </div>

          {/* Recent Activity Preview */}
          {activityFeed.length > 0 && (
            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                    <Activity className="size-5 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Recent Activity</h3>
                    <p className="text-xs text-slate-400 font-medium">What's happening in your workspace</p>
                  </div>
                </div>
                <button onClick={() => setActiveTab('Activity')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:gap-3 flex items-center gap-2 transition-all">
                  View All <ArrowUpRight className="size-3" />
                </button>
              </div>
              <div className="space-y-3">
                {activityFeed.slice(0, 4).map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-slate-100">
                      <div className="size-8 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className={`size-3.5 ${item.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-600 font-medium truncate">
                          <span className="font-bold text-slate-900">{item.user}</span> {item.action} <span className="font-bold text-slate-900">{item.target}</span>
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">{item.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════ SPACES TAB ═══════ */}
      {activeTab === 'Spaces' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Collaboration Spaces</h2>
                <div className="px-2.5 py-0.5 bg-violet-50 border border-violet-100 rounded-lg">
                  <span className="text-[10px] font-black text-violet-600 uppercase tracking-wider">{spaces.length} SPACES</span>
                </div>
              </div>
              <p className="text-slate-400 mt-2">Organize your team's work into focused collaboration hubs.</p>
            </div>
            <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-200 hover:from-violet-500 hover:to-fuchsia-500 transition-all">
              <Plus className="size-4" /> New Space
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spaces.map(space => (
              <div key={space.id} className="group p-6 bg-white rounded-[28px] border border-slate-100 hover:shadow-xl hover:border-indigo-100 hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-5">
                  <div className="size-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                    {space.initial}
                  </div>
                  <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="size-4" />
                  </button>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{space.name}</h3>
                <p className="text-xs text-slate-400 font-medium mb-5">Created by you</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Users className="size-3" /> {space.members}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Video className="size-3" /> {space.videos}
                    </div>
                  </div>
                  {getRoleBadge(space.role as UserRole || 'Admin')}
                </div>
              </div>
            ))}

            {/* Add Space Card */}
            <button onClick={() => setIsCreateModalOpen(true)} className="p-6 rounded-[28px] border-2 border-dashed border-slate-200 hover:border-indigo-300 flex flex-col items-center justify-center text-center min-h-[200px] transition-all group bg-slate-50/50 hover:bg-indigo-50/50">
              <div className="size-14 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform group-hover:border-indigo-200">
                <Plus className="size-6 text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </div>
              <span className="text-sm font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">Create New Space</span>
            </button>
          </div>
        </div>
      )}

      {/* ═══════ TEAM TAB ═══════ */}
      {activeTab === 'Team' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header with Title & Filter Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Team Members</h2>
                <div className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded-lg">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">ACTIVE</span>
                </div>
              </div>
              <p className="text-slate-400 mt-2">
                {members.length === 0 && 'Start by inviting team members to collaborate.'}
                {members.length === 1 && 'You\'re the only member. Invite others to grow your team.'}
                {members.length > 1 && `${members.length} member${members.length !== 1 ? 's' : ''} collaborating in ${workspace.name}.`}
              </p>
            </div>
            
            <button onClick={() => setIsInviteModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-200 hover:from-indigo-500 hover:to-violet-500 transition-all">
              <UserPlus className="size-4" /> Invite Member
            </button>
          </div>

          {/* Member Cards Grid */}
          {members.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {members.map(member => (
                <div 
                  key={member.id} 
                  className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-indigo-100 transition-all cursor-default hover:-translate-y-1"
                >
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Header with Role Badge */}
                  <div className="relative p-6 pb-4 border-b border-slate-100/50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-indigo-200/50 group-hover:scale-110 transition-transform">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>{getRoleBadge(member.role)}</div>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-0.5">{member.name}</h3>
                    {member.role === 'Owner' && <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">Workspace Owner</span>}
                  </div>

                  {/* Member Info */}
                  <div className="relative p-6 space-y-3">
                    {/* Email */}
                    <div className="flex items-start gap-3">
                      <div className="size-3 rounded-full bg-slate-200 flex-shrink-0 mt-1.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email</p>
                        <p className="text-sm text-slate-600 font-medium truncate">{member.email || '—'}</p>
                      </div>
                    </div>

                    {/* Joined Date */}
                    <div className="flex items-start gap-3">
                      <Clock className="size-3.5 text-slate-300 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Joined</p>
                        <p className="text-sm text-slate-600 font-medium">{member.joinedAt}</p>
                      </div>
                    </div>

                    {/* Status indicator */}
                    <div className="flex items-center gap-2 pt-2">
                      <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active</span>
                    </div>
                  </div>

                  {/* Hover accent line */}
                  <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center rounded-[32px] border border-dashed border-slate-200 bg-slate-50/50">
              <div className="size-20 bg-white rounded-3xl flex items-center justify-center mb-5 border border-slate-100 shadow-sm">
                <Users className="size-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-400 mb-1.5">No team members yet</h3>
              <p className="text-sm text-slate-300 max-w-sm mb-6">Invite colleagues to start collaborating together.</p>
              <button onClick={() => setIsInviteModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition-all">
                <UserPlus className="size-3.5" /> Invite First Member
              </button>
            </div>
          )}

          {/* Growth CTA */}
          {members.length > 0 && members.length < 5 && (
            <div className="p-8 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-[28px] border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-white rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm">
                  <Users className="size-6 text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Expand your team</h3>
                  <p className="text-sm text-slate-400 font-medium">Add more members to scale your collaboration</p>
                </div>
              </div>
              <button onClick={() => setIsInviteModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition-all">
                <UserPlus className="size-3.5" /> Invite More
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══════ ACTIVITY TAB ═══════ */}
      {activeTab === 'Activity' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Activity Log</h2>
            <div className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-100 rounded-lg">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">{activityFeed.length} EVENTS</span>
            </div>
          </div>
          <p className="text-slate-400 mt-2">Track all changes and activities happening in your workspace.</p>

          {activityFeed.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center rounded-[32px] border border-dashed border-slate-200 bg-slate-50/50">
              <div className="size-20 bg-white rounded-3xl flex items-center justify-center mb-5 border border-slate-100 shadow-sm">
                <Activity className="size-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-400 mb-1.5">No activity yet</h3>
              <p className="text-sm text-slate-300 max-w-sm mb-6">Activity will appear here as your team collaborates.</p>
              <button onClick={() => setActiveTab('Team')} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition-all">
                <UserPlus className="size-3.5" /> Invite Members
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activityFeed.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 hover:shadow-lg hover:border-emerald-100 hover:-translate-y-0.5 transition-all group">
                    <div className="size-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-50 transition-colors">
                      <Icon className={`size-4 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-600 font-medium">
                        <span className="font-bold text-slate-900">{item.user}</span> {item.action} <span className="font-bold text-slate-900">{item.target}</span>
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 font-medium flex-shrink-0">{item.time}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Spaces;
