
import React, { useState } from 'react';
import { Plus, Users, FolderOpen, MoreHorizontal, LayoutGrid, ShieldCheck, UserPlus, ShieldAlert, Mail, ArrowRight, X, Loader2, CheckCircle2 } from 'lucide-react';
import { Space, Workspace, WorkspaceMember, UserRole } from '../types';
import HeroBanner from '../components/HeroBanner';

interface SpacesProps {
  workspace: Workspace;
}

const Spaces: React.FC<SpacesProps> = ({ workspace }) => {
  const [activeTab, setActiveTab] = useState<'Spaces' | 'Team'>('Spaces');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  
  // Invitation States
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Creator');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const [members, setMembers] = useState<WorkspaceMember[]>([
    { id: '1', name: 'Raphael Gab-Momoh', email: 'raphael@sslabs.io', avatar: '', role: 'Owner', joinedAt: 'Aug 2024' },
    { id: '2', name: 'Sarah Chen', email: 'sarah@sslabs.io', avatar: '', role: 'Admin', joinedAt: 'Sep 2024' },
    { id: '3', name: 'Marcus Lee', email: 'marcus@design.io', avatar: '', role: 'Creator', joinedAt: 'Oct 2024' },
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
    
    // Simulate API call
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
    const colors = {
      Owner: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      Admin: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      Creator: 'bg-amber-100 text-amber-700 border-amber-200',
      Viewer: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return (
      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${colors[role]}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-12 relative">
      
      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] p-12 w-full max-w-xl shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 relative overflow-hidden">
            {inviteSuccess ? (
              <div className="text-center space-y-8 py-10 animate-in slide-in-from-bottom-4">
                 <div className="size-24 bg-emerald-50 rounded-[32px] flex items-center justify-center mx-auto border-4 border-emerald-100/50 shadow-inner">
                   <CheckCircle2 className="size-12 text-emerald-600 stroke-[3px]" />
                 </div>
                 <div className="space-y-2">
                   <h3 className="text-3xl font-black text-slate-900 tracking-tight">Invitation Dispatched</h3>
                   <p className="text-slate-500 font-medium">Redirecting to your production team...</p>
                 </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-10">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Expand Your Team</h3>
                    <p className="text-slate-400 font-medium text-sm">Add stakeholders to your {workspace.name} workspace.</p>
                  </div>
                  <button onClick={() => setIsInviteModalOpen(false)} className="p-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleInviteSubmit} className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2">Stakeholder Email</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-slate-300" />
                      <input 
                        autoFocus
                        type="email" 
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold text-slate-900 focus:border-indigo-600 focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2">Structural Role</label>
                    <div className="grid grid-cols-2 gap-4">
                      {['Admin', 'Creator', 'Viewer'].map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setInviteRole(role as UserRole)}
                          className={`px-6 py-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${inviteRole === role ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isInviting || !inviteEmail.trim()}
                    className="w-full bg-slate-950 text-white py-6 rounded-3xl font-black text-xl shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isInviting ? <Loader2 className="size-6 animate-spin" /> : <UserPlus className="size-6" />}
                    {isInviting ? 'Generating Invite...' : 'Send Access Key'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Space Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-indigo-950 tracking-tight">Create New Space</h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSpace} className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-indigo-950 uppercase tracking-widest ml-1">Space Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  placeholder="e.g. Marketing, Engineering, Q1 Projects"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-indigo-950 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all placeholder:text-gray-300"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)} 
                  className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 hover:text-indigo-950 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!newSpaceName.trim()}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-indigo-600"
                >
                  Create Space
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Spaces Banner */}
      <HeroBanner 
        title={<>Scale your <br />Production Team.</>}
        description="Manage permissions, organize collaborative spaces, and grow your workspace with enterprise-grade governance controls."
        imageUrl="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
        gradientFrom="from-[#1e1b4b]"
        gradientTo="to-[#4338ca]"
        buttons={
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 bg-white text-indigo-900 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-indigo-50 transition-all shadow-lg active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        }
      />

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-indigo-950 tracking-tight flex items-center gap-3">
            {activeTab === 'Spaces' ? <LayoutGrid className="w-8 h-8 text-indigo-600" /> : <Users className="w-8 h-8 text-indigo-600" />}
            {activeTab === 'Spaces' ? 'Collaboration Spaces' : 'Team Management'}
          </h1>
          <p className="text-gray-500 font-medium">Manage how your team organized and permissions for {workspace.name}.</p>
        </div>
        <button 
          onClick={() => {
            if (activeTab === 'Spaces') {
              setIsCreateModalOpen(true);
            } else {
              setIsInviteModalOpen(true);
            }
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg hover:-translate-y-1 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          {activeTab === 'Spaces' ? 'Create Space' : 'Invite Member'}
        </button>
      </div>

      <div className="flex gap-8 border-b border-indigo-50 overflow-x-auto scrollbar-hide">
        {['Spaces', 'Team'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap px-2 ${
              activeTab === tab 
                ? 'text-indigo-600 border-indigo-600' 
                : 'text-gray-400 hover:text-gray-600 border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Spaces' ? (
        <div className="space-y-4">
          {spaces.map(space => (
            <div key={space.id} className="flex items-center justify-between px-6 py-5 bg-white border border-indigo-50 rounded-2xl hover:border-indigo-400 transition-all shadow-sm group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
                  {space.initial}
                </div>
                <span className="font-bold text-indigo-950 text-base">{space.name}</span>
              </div>
              <div className="flex items-center gap-8">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{space.members} members</span>
                {getRoleBadge(space.role as UserRole || 'Admin')}
                <button className="p-2 text-gray-300 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all"><MoreHorizontal className="w-5 h-5" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-indigo-50 rounded-[32px] overflow-hidden shadow-sm">
          <div className="divide-y divide-indigo-50">
            {members.map(member => (
              <div key={member.id} className="flex items-center justify-between px-8 py-6 hover:bg-indigo-50/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black">
                    {member.name.charAt(0)}
                  </div>
                  <span className="font-bold text-indigo-950">{member.name}</span>
                </div>
                <div className="flex items-center gap-8">
                  <span className="text-sm text-gray-500 font-medium">{member.email}</span>
                  {getRoleBadge(member.role)}
                  <button className="p-2 text-gray-300 hover:text-indigo-600 transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Spaces;
