
import React, { useState, useRef, useEffect } from 'react';
import {
  Search, SquarePen, MoreHorizontal, SlidersHorizontal, Sparkles, AtSign,
  MessageCircle, ChevronDown, MessageSquare, Users, Plus, Smile, Type,
  SendHorizontal, Pencil, Paperclip, X, User, ArrowUpRight, Layout,
  PanelLeftClose, PanelLeftOpen, BrainCircuit, Activity, Zap
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import PageDoodles from '../components/PageDoodles';
import { UserProfile, Workspace } from '../types';
import type {
  WorkspaceChatMessage,
  DirectMessage,
  TeamSet,
  TeamSetMessage,
  WorkspaceMember,
} from '../services/firebase';
import {
  sendWorkspaceMessage,
  subscribeToWorkspaceMessages,
  sendDirectMessage,
  subscribeToDirectMessages,
  createTeamSet,
  subscribeToTeamSets,
  sendTeamSetMessage,
  subscribeToTeamSetMessages,
  subscribeToWorkspaceMembers,
  syncWorkspaceMember,
  setUserPresence,
  inviteWorkspaceMember,
} from '../services/firebase';

interface ChatProps {
  user: UserProfile;
  workspace: Workspace;
  coverImage?: string;
}

type ConversationType = 'workspace' | 'direct' | 'set' | 'ai';

interface ActiveConversation {
  type: ConversationType;
  id: string;
  name: string;
}

const Chat: React.FC<ChatProps> = ({ user, workspace }) => {
  const [activeFilter, setActiveFilter] = useState('Chats');
  const [activeConversation, setActiveConversation] = useState<ActiveConversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showMembersModal, setShowMembersModal] = useState(false);

  // Firebase state
  const [workspaceMessages, setWorkspaceMessages] = useState<WorkspaceChatMessage[]>([]);
  const [directConversations, setDirectConversations] = useState<Map<string, DirectMessage[]>>(new Map());
  const [teamSets, setTeamSets] = useState<TeamSet[]>([]);
  const [activeSetMessages, setActiveSetMessages] = useState<TeamSetMessage[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Get workspace ID from workspace name (simple hash)
  const workspaceId = workspace.name || 'default-workspace';

  // Subscribe to workspace messages
  useEffect(() => {
    if (!workspaceId) return;
    const unsubscribe = subscribeToWorkspaceMessages(workspaceId, (messages) => {
      setWorkspaceMessages(messages);
    });
    return () => unsubscribe();
  }, [workspaceId]);

  // Subscribe to direct messages
  useEffect(() => {
    if (!user.uid) return;
    const unsubscribe = subscribeToDirectMessages(user.uid, (conversations) => {
      setDirectConversations(conversations);
    });
    return () => unsubscribe();
  }, [user.uid]);

  // Subscribe to team sets
  useEffect(() => {
    if (!workspaceId) return;
    const unsubscribe = subscribeToTeamSets(workspaceId, (sets) => {
      setTeamSets(sets);
    });
    return () => unsubscribe();
  }, [workspaceId]);

  // Subscribe to workspace members
  useEffect(() => {
    if (!workspaceId) return;
    const unsubscribe = subscribeToWorkspaceMembers(workspaceId, (members) => {
      setWorkspaceMembers(members);
    });
    return () => unsubscribe();
  }, [workspaceId]);

  // Register current user as workspace member and set online presence
  useEffect(() => {
    if (!workspaceId || !user.uid) return;

    const currentMember: WorkspaceMember = {
      id: user.uid,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      online: true,
      lastSeen: Date.now(),
      workspaceId,
    };

    // Register/update member
    syncWorkspaceMember(workspaceId, currentMember);

    // Set online status
    setUserPresence(workspaceId, user.uid, true);

    // Set offline on unmount
    return () => {
      setUserPresence(workspaceId, user.uid, false);
    };
  }, [workspaceId, user.uid, user.name, user.email, user.avatar, user.role]);

  // Subscribe to active set messages
  useEffect(() => {
    if (activeConversation?.type !== 'set' || !workspaceId) return;
    const unsubscribe = subscribeToTeamSetMessages(workspaceId, activeConversation.id, (messages) => {
      setActiveSetMessages(messages);
    });
    return () => unsubscribe();
  }, [activeConversation, workspaceId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [workspaceMessages, activeSetMessages, directConversations]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !user.uid) return;

    const timestamp = Date.now();
    const messageId = `${user.uid}_${timestamp}`;

    if (!activeConversation || activeConversation.type === 'workspace') {
      // Send to workspace chat
      const message: WorkspaceChatMessage = {
        id: messageId,
        senderId: user.uid,
        senderName: user.name,
        senderAvatar: user.avatar,
        text: messageInput,
        timestamp,
        type: 'workspace',
      };
      sendWorkspaceMessage(workspaceId, message);
    } else if (activeConversation.type === 'ai') {
      // Send to workspace as AI query
      const userMessage: WorkspaceChatMessage = {
        id: messageId,
        senderId: user.uid,
        senderName: user.name,
        senderAvatar: user.avatar,
        text: messageInput,
        timestamp,
        type: 'workspace',
      };
      sendWorkspaceMessage(workspaceId, userMessage);

      // Simulate AI response
      setTimeout(() => {
        const aiMessage: WorkspaceChatMessage = {
          id: `ai_${timestamp + 1}`,
          senderId: 'show-genius',
          senderName: 'Show Genius',
          text: "I'm your Show Genius AI assistant. I can help you analyze your recorded content, find specific moments in your workspace, and provide insights. This is a simulated response - full AI integration coming soon!",
          timestamp: timestamp + 1000,
          type: 'ai',
        };
        sendWorkspaceMessage(workspaceId, aiMessage);
      }, 1000);
    } else if (activeConversation.type === 'set') {
      // Send to team set
      const message: TeamSetMessage = {
        id: messageId,
        setId: activeConversation.id,
        senderId: user.uid,
        senderName: user.name,
        senderAvatar: user.avatar,
        text: messageInput,
        timestamp,
      };
      sendTeamSetMessage(workspaceId, message);
    } else if (activeConversation.type === 'direct') {
      // Send direct message
      const message: DirectMessage = {
        id: messageId,
        senderId: user.uid,
        senderName: user.name,
        senderAvatar: user.avatar,
        recipientId: activeConversation.id,
        recipientName: activeConversation.name,
        text: messageInput,
        timestamp,
        read: false,
      };
      sendDirectMessage(message);
    }

    setMessageInput('');
  };

  const selectConversation = (conversation: ActiveConversation) => {
    setActiveConversation(conversation);
  };

  const handleCreateSet = () => {
    const setName = prompt('Enter team set name:');
    if (!setName || !user.uid) return;

    const newSet: TeamSet = {
      id: `set_${Date.now()}`,
      name: setName,
      workspaceId,
      createdBy: user.uid,
      createdAt: Date.now(),
      memberIds: [user.uid],
    };
    createTeamSet(workspaceId, newSet);
  };

  // Get messages for current conversation
  const getCurrentMessages = () => {
    if (!activeConversation || activeConversation.type === 'workspace' || activeConversation.type === 'ai') {
      return workspaceMessages;
    } else if (activeConversation.type === 'set') {
      return activeSetMessages;
    } else if (activeConversation.type === 'direct') {
      const conversationId = [user.uid, activeConversation.id].sort().join('_');
      return directConversations.get(conversationId) || [];
    }
    return [];
  };

  const messages = getCurrentMessages();

  return (
    <div className="flex h-full bg-[#f3f2f1] overflow-hidden font-sans relative">
      <PageDoodles variant="minimal" />
      <aside className={`${isSidebarOpen ? 'w-80 border-r opacity-100' : 'w-0 border-r-0 opacity-0'} transition-all duration-300 ease-in-out bg-[#f3f2f1] border-gray-200 shrink-0 flex flex-col overflow-hidden relative`}>
        <div className="w-80 flex flex-col h-full">
          <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-indigo-950 tracking-tight">Workspace Chat</h2>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowMembersModal(true)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Browse Members"><Users className="w-4 h-4 text-indigo-600" /></button>
                <button onClick={() => setActiveConversation(null)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="New Message"><SquarePen className="w-4 h-4 text-indigo-600" /></button>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 hover:text-indigo-600"><PanelLeftClose className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-200/50 p-1 rounded-xl">
              {['Unread', 'Sets', 'Chats'].map(filter => (
                <button key={filter} onClick={() => setActiveFilter(filter)} className={`flex-1 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${activeFilter === filter ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{filter}</button>
              ))}
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto px-2 space-y-1">
            <button onClick={() => selectConversation({ type: 'ai', id: 'show-genius', name: 'Show Genius' })} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeConversation?.type === 'ai' ? 'bg-white shadow-sm ring-1 ring-indigo-100' : 'hover:bg-gray-200'}`}>
              <div className={`size-8 rounded-lg flex items-center justify-center ${activeConversation?.type === 'ai' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-indigo-50'}`}><Sparkles className="w-4 h-4" /></div>
              <div className="flex-1 text-left"><div className="text-sm font-black text-indigo-950">Show Genius</div><div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Assistant</div></div>
            </button>

            <button onClick={() => selectConversation({ type: 'workspace', id: workspaceId, name: workspace.name || 'Workspace' })} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeConversation?.type === 'workspace' ? 'bg-white shadow-sm ring-1 ring-indigo-100' : 'hover:bg-gray-200'}`}>
              <div className={`size-8 rounded-lg flex items-center justify-center ${activeConversation?.type === 'workspace' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-indigo-400'}`}><MessageSquare className="w-4 h-4" /></div>
              <div className="flex-1 text-left"><div className="text-sm font-black text-indigo-950">General</div><div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Workspace Chat</div></div>
            </button>

            {activeFilter === 'Chats' && directConversations.size > 0 && (
              <div className="mt-4 px-2 animate-in slide-in-from-left-2 duration-300">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Direct Messages</div>
                <div className="space-y-0.5">
                  {Array.from(directConversations.entries()).map(([conversationId, msgs]) => {
                    const lastMsg = msgs[msgs.length - 1];
                    const otherUserId = conversationId.split('_').find(id => id !== user.uid) || '';
                    const member = workspaceMembers.find(m => m.id === otherUserId);
                    if (!member) return null;
                    return (
                      <button
                        key={conversationId}
                        onClick={() => selectConversation({ type: 'direct', id: member.id, name: member.name })}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${activeConversation?.id === member.id ? 'bg-white shadow-sm text-indigo-900 ring-1 ring-gray-100' : 'hover:bg-gray-200 text-gray-600'}`}
                      >
                        <div className="relative">
                          <img src={member.avatar} alt={member.name} className="size-8 rounded-full" />
                          {member.online && <div className="absolute bottom-0 right-0 size-2.5 bg-green-500 border-2 border-white rounded-full" />}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="text-sm font-bold truncate">{member.name}</div>
                          <div className="text-[10px] text-gray-400 truncate">{lastMsg.text}</div>
                        </div>
                        {!lastMsg.read && lastMsg.recipientId === user.uid && (
                          <div className="size-2 bg-indigo-600 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeFilter === 'Sets' && (
              <div className="mt-4 px-2 animate-in slide-in-from-left-2 duration-300">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Team Sets</div>
                <div className="space-y-0.5">{teamSets.map(set => (
                  <button key={set.id} onClick={() => selectConversation({ type: 'set', id: set.id, name: set.name })} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${activeConversation?.id === set.id ? 'bg-white shadow-sm text-indigo-900 ring-1 ring-gray-100' : 'hover:bg-gray-200 text-gray-600'}`}><Layout className={`w-4 h-4 transition-all ${activeConversation?.id === set.id ? 'text-indigo-600' : 'opacity-50 group-hover:text-indigo-600 group-hover:opacity-100'}`} /><span className="text-sm font-bold flex-1 text-left truncate">{set.name}</span></button>
                ))}</div>
                <button onClick={handleCreateSet} className="w-full flex items-center gap-2 px-3 py-2 mt-2 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-black uppercase tracking-wide transition-all"><Plus className="w-3 h-3" /> Create New Set</button>
              </div>
            )}
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-white relative overflow-hidden">
        {/* Intelligence Background Doodles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
          <svg className="absolute top-10 right-10 w-[400px] h-[400px] text-indigo-950" viewBox="0 0 100 100">
            <path d="M10,50 Q50,0 90,50 T10,50" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1 1" />
          </svg>
          <svg className="absolute bottom-20 left-10 w-64 h-64 text-indigo-950 -rotate-12" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.2" />
            <path d="M50,20 L50,80 M20,50 L80,50" stroke="currentColor" strokeWidth="0.1" />
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <BrainCircuit className="size-[600px] text-indigo-900" strokeWidth={0.5} />
          </div>
        </div>

        {!isSidebarOpen && (
          <div className="absolute top-4 left-4 z-10">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors shadow-sm text-gray-500 hover:text-indigo-600 border border-gray-200"><PanelLeftOpen className="w-4 h-4" /></button>
          </div>
        )}

        {!activeConversation && messages.length === 0 ? (
          <div className="flex-1 overflow-y-auto p-12 relative z-10">
            <HeroBanner
              title={<>Your AI-Native <br />Conversation Hub.</>}
              description="Chat with teammates or consult the Show Genius to extract insights from your recorded productions instantly."
              imageUrl="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800"
              gradientFrom="from-[#10b981]"
              gradientTo="to-[#059669]"
              buttons={<button onClick={() => selectConversation({ type: 'ai', id: 'show-genius', name: 'Show Genius' })} className="flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-emerald-50 transition-all shadow-lg"><Sparkles className="w-4 h-4" />Try Show Genius</button>}
            />
            <div className="mt-24 flex flex-col items-center text-center space-y-6">
              <div className="p-8 bg-slate-50 rounded-full border border-slate-100 shadow-inner group relative">
                <BrainCircuit className="w-16 h-16 text-slate-300 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-700" />
                <div className="absolute -top-2 -right-2 bg-white rounded-xl p-2 shadow-lg border border-slate-100">
                  <Zap className="size-4 text-amber-500 fill-amber-500" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-4xl font-black text-indigo-950 tracking-tighter">Start your workflow discussion.</h3>
                <p className="text-slate-400 font-medium text-lg max-w-sm mx-auto leading-relaxed">Select a teammate or use the Genius to bridge communication gaps across your workspace.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={`p-4 border-b border-gray-100 flex items-center justify-between ${!isSidebarOpen ? 'pl-16' : ''} relative z-10 bg-white/80 backdrop-blur-md`}>
              <div className="flex items-center gap-4 flex-1">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">To:</span>
                <span className="text-sm font-bold text-indigo-950">{activeConversation?.name || 'General Workspace'}</span>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col relative z-10">
              {messages.map((msg: any) => {
                const isMe = msg.senderId === user.uid;
                const isAI = msg.type === 'ai' || msg.senderId === 'show-genius';
                return (
                  <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                    {!isMe && (
                      <div className="flex items-center gap-2 mb-1 px-2">
                        {msg.senderAvatar ? (
                          <img src={msg.senderAvatar} alt={msg.senderName} className="size-4 rounded-full" />
                        ) : (
                          <div className="size-4 rounded-full bg-indigo-600 flex items-center justify-center">
                            {isAI ? <Sparkles className="size-2 text-white" /> : <User className="size-2 text-white" />}
                          </div>
                        )}
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{msg.senderName}</span>
                      </div>
                    )}
                    <div className={`px-5 py-3.5 rounded-3xl text-sm font-medium ${isMe ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg' : isAI ? 'bg-gradient-to-br from-purple-100 to-indigo-100 text-indigo-950 rounded-tl-none border border-indigo-200' : 'bg-gray-100 text-indigo-950 rounded-tl-none border border-gray-200'}`}>{msg.text}</div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5 px-2">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                );
              })}
            </div>
            <div className="p-8 border-t border-gray-100 relative z-10 bg-white">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-4">
                <input value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 font-semibold outline-none focus:border-indigo-600 transition-all shadow-inner" />
                <button type="submit" className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:translate-y-0"><SendHorizontal className="w-6 h-6" /></button>
              </form>
            </div>
          </>
        )}
      </main>

      {/* Members Directory Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200" onClick={() => setShowMembersModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-indigo-950 tracking-tight">Workspace Members</h2>
                <p className="text-sm text-gray-500 mt-1">Click on anyone to start a conversation</p>
              </div>
              <button onClick={() => setShowMembersModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="size-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-3">
                {workspaceMembers.filter(m => m.id !== user.uid).map(member => (
                  <button
                    key={member.id}
                    onClick={() => {
                      selectConversation({ type: 'direct', id: member.id, name: member.name });
                      setShowMembersModal(false);
                    }}
                    className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-indigo-50 rounded-xl transition-all group border border-transparent hover:border-indigo-200"
                  >
                    <div className="relative">
                      <img src={member.avatar} alt={member.name} className="size-12 rounded-full" />
                      <div className={`absolute bottom-0 right-0 size-3 border-2 border-white rounded-full ${member.online ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-indigo-950">{member.name}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${member.online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {member.online ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{member.email}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{member.role}</p>
                    </div>
                    <MessageCircle className="size-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => alert('Invite members functionality - integrate with your user management system')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
              >
                <Plus className="size-4" />
                Invite New Members
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
