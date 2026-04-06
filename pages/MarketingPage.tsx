
import React from 'react';
import { 
  ArrowLeft, CheckCircle2, Zap, ShieldCheck, Globe, Users, 
  LayoutGrid, ArrowRight, Star, Building2, GraduationCap, 
  Stethoscope, Briefcase, Code, BarChart3, Rocket,
  Monitor, PlayCircle, Sparkles, Lock, Cpu, Server, 
  MessageSquare, Layers, MousePointer2, Smartphone, 
  DollarSign, PieChart, Activity, FileText, Search,
  Terminal, History, Award, BookOpen, Share2,
  Calendar, Layout
} from 'lucide-react';
import { AppRoute } from '../types';
import Logo from '../components/Logo';
import HeroBanner from '../components/HeroBanner';

interface MarketingPageProps {
  type: AppRoute;
  onBack: () => void;
  onSignUp: () => void;
  onContactSales?: () => void;
}

const MarketingPage: React.FC<MarketingPageProps> = ({ type, onBack, onSignUp, onContactSales }) => {
  const SignUpButton = (
    <button 
      onClick={onSignUp} 
      className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-black text-sm hover:bg-indigo-50 transition-all shadow-xl active:scale-95 flex items-center gap-2 group"
    >
      Start for Free
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </button>
  );

  const renderContent = () => {
    switch (type) {
      case AppRoute.PRODUCT:
        return (
          <div className="space-y-24 animate-in fade-in duration-700">
            <HeroBanner 
              title={<>The All-in-One <br />Knowledge Studio.</>}
              description="From crystal-clear 4K screen recording to infinite spatial whiteboards. Show is the ultimate operating system for high-performance team collaboration."
              imageUrl="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200"
              gradientFrom="from-blue-600"
              gradientTo="to-indigo-700"
              buttons={SignUpButton}
            />
            
            <div className="space-y-16">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Core Workspace Capabilities</h2>
                <p className="text-lg text-slate-500 mt-4">A complete ecosystem for capturing, organizing, and scaling expertise.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { title: '4K Studio Recorder', desc: 'Capture every pixel at 60fps. Built-in noise cancellation and professional camera overlays.', icon: Monitor, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { title: 'AI-Native Insights', desc: 'Automated transcripts, executive summaries, and smart chapter detection for every show.', icon: Sparkles, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
                  { title: 'Infinite Canvas', desc: 'Spatial whiteboards that let you arrange videos, notes, and code in a boundless collaborative field.', icon: LayoutGrid, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { title: 'Precision Feedback', desc: 'Frame-accurate comments that live directly on the production timeline for hyper-specific collaboration.', icon: MessageSquare, color: 'text-rose-600', bg: 'bg-rose-50' },
                  { title: 'Multimodal Search', desc: 'Find insights instantly by searching spoken words, on-screen text, or code snippets across your library.', icon: Search, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { title: 'Live Collaborative Labs', desc: 'Launch real-time sandboxes for pair programming or design walkthroughs inside any production.', icon: Terminal, color: 'text-slate-800', bg: 'bg-slate-100' },
                  { title: 'Branded Portals', desc: 'White-label your environment with custom domains, logos, and institutional styling.', icon: Globe, color: 'text-sky-600', bg: 'bg-sky-50' },
                  { title: 'Proficiency Checks', desc: 'Deploy AI-generated checkpoints and quizzes to validate retention and track viewer progress.', icon: GraduationCap, color: 'text-violet-600', bg: 'bg-violet-50' },
                  { title: 'Team Analytics', desc: 'Deep engagement heatmaps show you exactly where viewers drop off or re-watch content.', icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
                  { title: 'Browser Command', desc: 'Record anything instantly from your toolbar with our lightweight, high-performance extension.', icon: Cpu, color: 'text-orange-600', bg: 'bg-orange-50' },
                  { title: 'Version Control', desc: 'Track iterations of your materials. Revert to previous session states with full asset history.', icon: History, color: 'text-gray-600', bg: 'bg-gray-100' },
                  { title: 'Smart Distribution', desc: 'Granular permissions and enterprise governance ensure your intellectual property stays secure.', icon: Lock, color: 'text-indigo-900', bg: 'bg-indigo-100' },
                ].map((f, i) => (
                  <div key={i} className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all group">
                    <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center ${f.color} mb-6 group-hover:scale-110 transition-transform`}>
                      <f.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{f.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed text-sm">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Integration Section */}
            <div className="bg-indigo-600 rounded-[64px] p-16 flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative shadow-2xl shadow-indigo-200">
               <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[120px] rounded-full"></div>
               <div className="flex-1 space-y-8 relative z-10 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest border border-white/20">
                    Ecosystem Connectivity
                  </div>
                  <h2 className="text-5xl font-black text-white leading-tight tracking-tighter">Unified with <br />your existing stack.</h2>
                  <p className="text-indigo-100 text-lg font-medium leading-relaxed max-w-md">Show seamlessly bridges the gap between your calendar, your chat, and your project management tools. Zero friction, total alignment.</p>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                     <button onClick={onSignUp} className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-50 transition-all active:scale-95">Explore Integrations</button>
                     <button onClick={onBack} className="text-indigo-100 font-bold px-8 py-4 hover:text-white transition-colors">API Documentation</button>
                  </div>
               </div>
               <div className="flex-1 w-full max-w-xl group">
                 <div className="grid grid-cols-3 gap-4">
                    {[Calendar, MessageSquare, Briefcase, Layout, Share2, Layers].map((Icon, idx) => (
                      <div key={idx} className="aspect-square bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center text-white hover:bg-white hover:text-indigo-600 transition-all duration-500 hover:-translate-y-2 cursor-pointer group/icon shadow-lg">
                        <Icon className="size-10 group-hover/icon:scale-110 transition-transform" />
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          </div>
        );

      case AppRoute.SOLUTIONS:
        return (
          <div className="space-y-24 animate-in fade-in duration-700">
             <HeroBanner 
               title={<>Engineered for <br />Modern Teams.</>}
               description="Show isn't just a tool; it's a solution to the meeting fatigue epidemic. See how different departments leverage Show to win back their time."
               imageUrl="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200"
               gradientFrom="from-emerald-600"
               gradientTo="to-teal-800"
               buttons={SignUpButton}
             />

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { title: 'Engineering', desc: 'Code reviews, bug reports, and system architecture walkthroughs explained with visual clarity.', icon: Code, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { title: 'Sales & Success', desc: 'Convert prospects with personalized video demos and high-touch customer onboarding shows.', icon: BarChart3, color: 'text-rose-600', bg: 'bg-rose-50' },
                  { title: 'Strategic Ops', desc: 'Scale your instructional design. Record once, share with thousands via AI-indexed playlists.', icon: GraduationCap, color: 'text-amber-600', bg: 'bg-amber-50' },
                  { title: 'Product Design', desc: 'The ultimate tool for UI/UX walkthroughs and design critiques without the live meeting friction.', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { title: 'Support Teams', desc: 'Close tickets 40% faster with video explanations that viewers can rewatch at their own pace.', icon: Stethoscope, color: 'text-cyan-600', bg: 'bg-cyan-50' },
                  { title: 'Leadership', desc: 'Strategic briefings and board updates that stakeholders can consume asynchronously with ease.', icon: Briefcase, color: 'text-slate-600', bg: 'bg-slate-50' },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col gap-6 p-10 rounded-[48px] border border-slate-100 hover:border-emerald-200 hover:shadow-2xl transition-all cursor-default group bg-white">
                    <div className={`w-16 h-16 rounded-3xl ${s.bg} flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform`}>
                      <s.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight">{s.title}</h3>
                      <p className="text-slate-500 font-medium mt-3 leading-relaxed">{s.desc}</p>
                    </div>
                    <button className="flex items-center gap-2 text-sm font-black text-emerald-600 uppercase tracking-widest mt-auto group-hover:gap-3 transition-all">
                       Learn workflow <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
             </div>

             <div className="bg-emerald-50 rounded-[48px] p-12 text-center space-y-6">
                <h3 className="text-3xl font-black text-emerald-950">Don't see your use case?</h3>
                <p className="text-emerald-700/60 font-medium max-w-lg mx-auto">Show is flexible enough to handle any workflow that requires clear visual communication. Start for free and build yours.</p>
                <button onClick={onSignUp} className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all">Start Custom Setup</button>
             </div>
          </div>
        );

      case AppRoute.CUSTOMERS:
        return (
          <div className="space-y-24 animate-in fade-in duration-700">
            <HeroBanner 
              title={<>The Pulse of <br />Elite Innovators.</>}
              description="Show is trusted by over 45,000 teams, from fast-growing startups to Fortune 500 enterprises. Experience communication without compromise."
              imageUrl="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=1200"
              gradientFrom="from-rose-500"
              gradientTo="to-pink-700"
              buttons={SignUpButton}
            />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700 py-12">
               {[1,2,3,4,5,6,7,8].map(i => (
                 <div key={i} className="h-20 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-xl tracking-tighter border-2 border-dashed border-slate-200">
                   PARTNER_{i}
                 </div>
               ))}
            </div>

            <div className="bg-white border-2 border-slate-100 rounded-[64px] p-20 relative overflow-hidden text-center space-y-12">
               <div className="flex items-center justify-center gap-1">
                 {[1,2,3,4,5].map(i => <Star key={i} className="w-8 h-8 text-yellow-400 fill-yellow-400" />)}
               </div>
               <blockquote className="text-4xl md:text-5xl font-black text-slate-900 leading-tight max-w-5xl mx-auto tracking-tighter">
                 "Show has fundamentally changed how we manage our engineering pipeline. We've reclaimed 15 hours per week of synchronous meeting time."
               </blockquote>
               <div className="flex flex-col items-center gap-4">
                 <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden ring-4 ring-rose-50 shadow-xl">
                   <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" alt="Sarah" />
                 </div>
                 <div>
                   <div className="text-lg font-black text-slate-900">Sarah Jenkins</div>
                   <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">CTO at TechFlow Global</div>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { label: '99.9% Satisfaction', icon: Activity },
                 { label: '12M+ Shows Produced', icon: PlayCircle },
                 { label: 'Top-Rated Studio App', icon: AwardIcon },
               ].map((stat, i) => (
                 <div key={i} className="text-center p-12 bg-slate-50 rounded-[40px] border border-slate-100">
                   <stat.icon className="w-10 h-10 text-rose-500 mx-auto mb-6" />
                   <div className="text-2xl font-black text-slate-900">{stat.label}</div>
                 </div>
               ))}
            </div>
          </div>
        );

      case AppRoute.ENTERPRISE:
        return (
          <div className="space-y-24 animate-in fade-in duration-700">
             <HeroBanner 
               title={<>Uncompromising <br />Governance.</>}
               description="Advanced security, dedicated support, and administrative controls built for global organizations that demand the absolute best in compliance."
               imageUrl="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200"
               gradientFrom="from-slate-800"
               gradientTo="to-slate-950"
               buttons={
                 <button onClick={onContactSales} className="bg-white text-slate-900 px-8 py-3 rounded-xl font-black text-sm hover:bg-slate-50 transition-all shadow-2xl">
                   Contact Sales
                 </button>
               }
             />

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <div className="space-y-10">
                 <div className="space-y-4">
                   <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Security that <br />scales with you.</h2>
                   <p className="text-lg text-slate-500 font-medium max-w-md">Our Enterprise tier provides the structural integrity needed for large-scale content delivery environments.</p>
                 </div>
                 
                 <div className="space-y-6">
                    {[
                      { title: 'SSO & SCIM Provisioning', desc: 'Secure your workspace with SAML 2.0 and automated user management via Okta, Azure, or Google.', icon: Lock },
                      { title: 'Data Sovereignty', desc: 'Choose where your data lives. Regional storage options for GDPR and custom compliance needs.', icon: Server },
                      { title: 'Domain Control', desc: 'Lock down workspace access to specific corporate domains and whitelist individual IPs.', icon: ShieldCheck },
                      { title: 'Advanced Audit Logs', desc: 'Full transparency on every action taken within your workspace with detailed forensic exports.', icon: FileText },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-5 group">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0 shadow-sm">
                          <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-900">{item.title}</h3>
                          <p className="text-slate-500 text-sm font-medium mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>

               <div className="relative">
                  <div className="absolute -inset-4 bg-indigo-600/5 blur-3xl rounded-full"></div>
                  <div className="bg-white border border-slate-100 p-12 rounded-[64px] shadow-2xl space-y-10 relative z-10">
                     <div className="space-y-2">
                        <div className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em]">The Enterprise Advantage</div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Dedicated Success</h3>
                     </div>
                     <div className="space-y-4">
                        {['Priority 1-hour Support Response', 'Quarterly Executive Business Reviews', 'Dedicated Account Manager', 'Custom Integration Engineering', 'Infinite Show Production Slots'].map((f, i) => (
                          <div key={i} className="flex items-center gap-3">
                             <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                             <span className="font-bold text-slate-700">{f}</span>
                          </div>
                        ))}
                     </div>
                     <button onClick={onContactSales} className="w-full bg-slate-950 text-white py-5 rounded-3xl font-black text-lg hover:bg-black transition-all shadow-xl active:scale-95">Book a Workshop</button>
                  </div>
               </div>
             </div>
          </div>
        );

      case AppRoute.PRICING:
        return (
          <div className="space-y-24 animate-in fade-in duration-700">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                 Fair & Transparent
               </div>
               <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">Simple Pricing. <br />Exponential Value.</h1>
               <h3 className="text-xl text-slate-500 font-medium">Start building your hub for free, then scale as you grow. No hidden fees, ever.</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
               {[
                 { name: 'Starter', price: '$0', desc: 'Perfect for individual creators and side projects.', features: ['1 Show Slot', '1080p HD Recording', 'Basic AI Summary', 'Shared with 2 Members', '30-Day Content History'], button: 'Choose Starter', icon: Rocket },
                 { name: 'Studio Pro', price: '$19', desc: 'The ultimate toolkit for professional content production.', features: ['Unlimited Shows', '4K UHD Mastering', 'Advanced AI Insights', 'Custom Branding & Logos', 'Global Search & Indexing', 'Priority Email Support'], popular: true, button: 'Go Pro', icon: Star },
                 { name: 'Team Hub', price: '$49', desc: 'Collaborative power for fast-growing departments.', features: ['Admin Governance Console', 'Workspace Libraries', 'Granular Permissions', 'Unlimited Stakeholders', 'Team-wide Insights', '1-on-1 Onboarding'], button: 'Start Team Plan', icon: Users }
               ].map((plan, i) => (
                 <div key={i} className={`p-10 rounded-[56px] border-2 flex flex-col transition-all group ${plan.popular ? 'border-indigo-600 bg-white shadow-[0_64px_128px_-32px_rgba(79,70,229,0.3)] scale-105 relative z-10' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-200'}`}>
                    {plan.popular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl">Most Popular</div>}
                    
                    <div className="mb-10 text-center lg:text-left">
                       <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 mb-6 mx-auto lg:mx-0">
                         <plan.icon className="w-6 h-6" />
                       </div>
                       <h3 className="text-2xl font-black text-slate-900 tracking-tight">{plan.name}</h3>
                       <div className="flex items-baseline justify-center lg:justify-start gap-1 mt-6 mb-2">
                         <span className="text-6xl font-black text-slate-900 tracking-tighter">{plan.price}</span>
                         <span className="text-lg text-slate-400 font-bold uppercase tracking-widest">/mo</span>
                       </div>
                       <p className="text-slate-500 font-medium leading-relaxed">{plan.desc}</p>
                    </div>

                    <div className="flex-1 space-y-5 mb-12">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">What's Included</div>
                       {plan.features.map((f, fi) => (
                         <div key={fi} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                           <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> {f}
                         </div>
                       ))}
                    </div>

                    <button 
                      onClick={onSignUp} 
                      className={`w-full py-5 rounded-3xl font-black text-lg transition-all active:scale-95 ${plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100' : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-600 hover:text-indigo-600'}`}
                    >
                      {plan.button}
                    </button>
                 </div>
               ))}
            </div>

            <div className="max-w-4xl mx-auto bg-slate-950 rounded-[48px] p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
               <div className="space-y-4 relative z-10 text-center md:text-left">
                  <h3 className="text-3xl font-black text-white tracking-tight">Need Enterprise security?</h3>
                  <p className="text-gray-400 font-medium">Custom billing, SSO, and dedicated support for organizations with 50+ members.</p>
               </div>
               <button onClick={onContactSales} className="whitespace-nowrap bg-white text-slate-900 px-10 py-5 rounded-3xl font-black text-lg shadow-2xl hover:bg-indigo-50 transition-all relative z-10">Contact Sales</button>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
            <Logo showText={true} />
            <h1 className="text-2xl font-bold text-slate-900">Content rendering in progress...</h1>
            <button onClick={onBack} className="text-indigo-600 font-bold hover:underline">Return to home</button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfdff] font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {/* Fixed Sticky Navigation */}
      <nav className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button 
              onClick={onBack} 
              className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-xl transition-all group"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:-translate-x-1 transition-all" />
              <span className="text-sm font-bold text-slate-400 group-hover:text-indigo-600 hidden sm:inline">Return</span>
            </button>
            <div className="hidden lg:block h-6 w-px bg-slate-100"></div>
            <div className="hidden sm:block cursor-pointer" onClick={onBack}><Logo showText={true} /></div>
          </div>
          
          <div className="flex items-center gap-4">
             {type !== AppRoute.PRICING && (
               <button 
                 onClick={() => { /* Internal route change logic if needed */ }} 
                 className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors mr-2 hidden md:block"
               >
                 Pricing
               </button>
             )}
             <button 
               onClick={onSignUp} 
               className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-sm hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-100"
             >
               Sign Up Free
             </button>
          </div>
        </div>
      </nav>

      {/* Main Marketing Content Container */}
      <main className="max-w-7xl mx-auto px-6 py-16 pb-32">
        {renderContent()}
      </main>

      {/* Global Bottom CTA Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 py-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center space-y-12">
           <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Ready to revolutionize <br />how your team works?</h2>
              <p className="text-lg text-slate-500 font-medium max-w-lg mx-auto">Join thousands of high-performance teams and start building your async hub today.</p>
           </div>
           <div className="flex flex-col sm:flex-row gap-4">
              {/* Reduced height buttons py-5 -> py-1.5 */}
              <button onClick={onSignUp} className="bg-indigo-600 text-white px-12 py-1.5 rounded-[24px] font-black text-xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-1 active:translate-y-0 leading-none">Get Started for Free</button>
              {type !== AppRoute.ENTERPRISE && (
                <button onClick={onContactSales} className="bg-white border-2 border-slate-200 text-slate-700 px-12 py-1.5 rounded-[24px] font-black text-xl hover:border-indigo-600 hover:text-indigo-600 transition-all leading-none">Talk to Sales</button>
              )}
           </div>
           <div className="pt-12 flex flex-col md:flex-row items-center justify-between w-full border-t border-slate-200 gap-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">© 2025 Show by SS Labs Global. SF / LDN / LOS.</p>
              <div className="flex gap-8">
                {['Terms', 'Privacy', 'Security', 'Cookies'].map(l => (
                  <button key={l} className="text-xs font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">{l}</button>
                ))}
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
};

const AwardIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
);

export default MarketingPage;
