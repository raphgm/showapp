
import React, { useState } from 'react';
import { 
  Shield, Users, CreditCard, Lock, LifeBuoy, 
  CheckCircle2, Search, MoreHorizontal, Settings, 
  Database, Fingerprint, Zap, FileText
} from 'lucide-react';
import { AppRoute, UserProfile, Workspace } from '../types';

interface AdminProps {
  user: UserProfile;
  workspace: Workspace;
  currentRoute: AppRoute;
  onNavigate: (route: string) => void;
}

const Admin: React.FC<AdminProps> = ({ user, workspace, currentRoute, onNavigate }) => {
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [domain, setDomain] = useState('sslabs.io');

  const navItems = [
    { id: AppRoute.ADMIN_MANAGE, label: 'General', icon: Settings },
    { id: AppRoute.ADMIN_USERS, label: 'Users & Roles', icon: Users },
    { id: AppRoute.ADMIN_WORKSPACE, label: 'Security & SSO', icon: Lock },
    { id: AppRoute.ADMIN_BILLING, label: 'Billing', icon: CreditCard },
    { id: 'support', label: 'Priority Support', icon: LifeBuoy },
  ];

  const activeTab = currentRoute;

  const renderContent = () => {
    switch (activeTab) {
      case AppRoute.ADMIN_USERS:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-indigo-950">Team Members</h2>
                <p className="text-gray-500 text-sm">Manage access and roles for your workspace.</p>
              </div>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700 transition-all">
                Invite People
              </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
                <Search className="w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search members..." 
                  className="bg-transparent text-sm font-medium outline-none flex-1"
                />
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 tracking-wider">User</th>
                    <th className="px-6 py-3 tracking-wider">Role</th>
                    <th className="px-6 py-3 tracking-wider">Status</th>
                    <th className="px-6 py-3 tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { name: user.name, email: user.email, role: 'Owner', status: 'Active' },
                    { name: 'Sarah Chen', email: 'sarah@sslabs.io', role: 'Admin', status: 'Active' },
                    { name: 'Marcus Lee', email: 'marcus@sslabs.io', role: 'Creator', status: 'Active' },
                    { name: 'Alex Rivera', email: 'alex@sslabs.io', role: 'Viewer', status: 'Pending' },
                  ].map((member, i) => (
                    <tr key={i} className="group hover:bg-indigo-50/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-indigo-950">{member.name}</div>
                            <div className="text-xs text-gray-400">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          defaultValue={member.role}
                          className="bg-transparent font-medium text-indigo-900 outline-none cursor-pointer hover:text-indigo-600 transition-colors"
                        >
                          <option>Owner</option>
                          <option>Admin</option>
                          <option>Creator</option>
                          <option>Viewer</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                          member.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case AppRoute.ADMIN_WORKSPACE:
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-indigo-950">Security & SSO</h2>
                <p className="text-gray-500 text-sm">Manage authentication methods and domain settings.</p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                    <Fingerprint className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-950 text-lg">Single Sign-On (SSO)</h3>
                    <p className="text-gray-500 text-sm max-w-md mt-1">
                      Enable SAML 2.0 authentication for your workspace. Users will be redirected to your identity provider.
                    </p>
                  </div>
                </div>
                <div 
                  className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${ssoEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                  onClick={() => setSsoEnabled(!ssoEnabled)}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${ssoEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>

              {ssoEnabled && (
                <div className="pt-6 border-t border-gray-100 space-y-6 animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Identity Provider URL</label>
                      <input type="text" placeholder="https://idp.example.com/saml" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-medium text-sm focus:border-indigo-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Entity ID</label>
                      <input type="text" placeholder="urn:example:idp" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-medium text-sm focus:border-indigo-500 outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">X.509 Certificate</label>
                     <textarea rows={4} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-xs focus:border-indigo-500 outline-none" placeholder="-----BEGIN CERTIFICATE-----..." />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-6">
              <div className="flex gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-indigo-950 text-lg">Shared Library Settings</h3>
                  <p className="text-gray-500 text-sm max-w-md mt-1">
                    Configure default visibility and retention for content in the Shared Library.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Default Visibility</label>
                   <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-medium text-sm outline-none">
                     <option>Workspace (Visible to all)</option>
                     <option>Private (Invite only)</option>
                   </select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Data Retention</label>
                   <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-medium text-sm outline-none">
                     <option>Unlimited</option>
                     <option>1 Year</option>
                     <option>90 Days</option>
                   </select>
                 </div>
              </div>
            </div>
          </div>
        );

      case AppRoute.ADMIN_BILLING:
        return (
           <div className="space-y-6">
             <div className="flex justify-between items-center">
               <div>
                 <h2 className="text-xl font-bold text-indigo-950">Plan & Billing</h2>
                 <p className="text-gray-500 text-sm">Manage your subscription and payment methods.</p>
               </div>
             </div>

             <div className="bg-indigo-900 rounded-2xl p-8 text-white flex justify-between items-center relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-indigo-800"></div>
               <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
               
               <div className="relative z-10 space-y-2">
                 <div className="text-indigo-300 font-bold text-xs uppercase tracking-widest">Current Plan</div>
                 <div className="text-3xl font-black">{user.plan}</div>
                 <div className="flex items-center gap-2 text-sm text-indigo-200">
                   <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                   Priority Support Active
                 </div>
               </div>
               
               <div className="relative z-10 text-right space-y-2">
                 <div className="text-3xl font-black">$49<span className="text-lg text-indigo-300 font-medium">/mo</span></div>
                 <button className="bg-white text-indigo-900 px-6 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-50 transition-colors">
                   Manage Subscription
                 </button>
               </div>
             </div>
             
             <div className="bg-white border border-gray-100 rounded-2xl p-6">
               <h3 className="font-bold text-indigo-950 mb-4">Payment Methods</h3>
               <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-8 bg-white rounded border border-gray-200 flex items-center justify-center">
                        <span className="font-black text-indigo-900 italic text-xs">VISA</span>
                     </div>
                     <div>
                       <div className="font-bold text-gray-700 text-sm">Visa ending in 4242</div>
                       <div className="text-xs text-gray-400">Expires 12/28</div>
                     </div>
                  </div>
                  <button className="text-indigo-600 text-sm font-bold hover:underline">Edit</button>
               </div>
               <button className="mt-4 flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700">
                 <PlusIcon className="w-4 h-4" /> Add Payment Method
               </button>
             </div>
           </div>
        );

      case 'support':
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-8 text-white text-center space-y-4 shadow-xl shadow-indigo-200">
               <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm">
                 <LifeBuoy className="w-8 h-8 text-white" />
               </div>
               <h2 className="text-2xl font-black">Priority Support</h2>
               <p className="text-indigo-100 max-w-md mx-auto">
                 As a {user.plan} customer, you have access to 24/7 dedicated support and a 1-hour response time SLA.
               </p>
               <button className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-black text-sm hover:bg-indigo-50 transition-all shadow-lg">
                 Contact Dedicated Agent
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-indigo-950">Fast-Track Ticket</h3>
                </div>
                <p className="text-gray-500 text-sm">Skip the queue. Your tickets are automatically routed to our senior engineering team.</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-indigo-950">Onboarding Session</h3>
                </div>
                <p className="text-gray-500 text-sm">Schedule a 1-on-1 walkthrough with a product specialist for your team.</p>
              </div>
            </div>
          </div>
        );

      default:
        // Default to General Settings (Manage)
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-indigo-950">Workspace Overview</h2>
                <p className="text-gray-500 text-sm">General settings for {workspace.name}.</p>
              </div>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-6">
               <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Workspace Name</label>
                 <input type="text" defaultValue={workspace.name} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-medium text-sm focus:border-indigo-500 outline-none" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Workspace URL</label>
                 <div className="flex">
                   <span className="px-4 py-2 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg text-gray-500 text-sm font-medium">show.app/</span>
                   <input type="text" defaultValue={workspace.name.toLowerCase().replace(/\s/g, '-')} className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-r-lg font-medium text-sm focus:border-indigo-500 outline-none" />
                 </div>
               </div>
               <div className="flex items-center gap-4 pt-2">
                  <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-2xl">
                    {workspace.initial}
                  </div>
                  <div>
                    <button className="text-sm font-bold text-indigo-600 hover:underline">Upload Logo</button>
                    <p className="text-xs text-gray-400 mt-1">Recommended 400x400px</p>
                  </div>
               </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col md:flex-row">
      {/* Sub-Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-gray-100 p-6 flex-shrink-0">
        <div className="mb-8">
          <h1 className="text-xl font-black text-indigo-950">Admin Console</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">{workspace.name}</p>
        </div>
        <nav className="space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id === 'support' ? item.id : item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                (activeTab === item.id) || (item.id === 'support' && activeTab === 'support')
                  ? 'bg-indigo-50 text-indigo-700 font-bold' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

export default Admin;
