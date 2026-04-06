
import React from 'react';
import { ArrowLeft, Mail, ShieldCheck, Briefcase, Lock, FileText, Globe, ArrowRight, Heart, Users, Sparkles, BookOpen, LifeBuoy, MessageCircle } from 'lucide-react';
import { AppRoute } from '../types';
import Logo from '../components/Logo';

interface InfoPageProps {
  type: AppRoute;
  onBack: () => void;
}

const InfoPage: React.FC<InfoPageProps> = ({ type, onBack }) => {
  const contentMap: Record<string, { title: string; subtitle: string; icon: any; sections: any[] }> = {
    [AppRoute.ABOUT]: {
      title: "Our Story",
      subtitle: "Empowering the world's knowledge creators.",
      icon: Heart,
      sections: [
        { 
          label: "Mission", 
          text: "Show was founded on a simple premise: showing is better than telling. In a world of fragmented attention, we build tools that make sharing expertise instant, engaging, and personal." 
        },
        { 
          label: "Our Journey", 
          text: "What started as a tool for engineering teams to share bug reports has evolved into a global platform used by over 20,000 educators to teach everything from quantum physics to fine arts." 
        },
        { 
          label: "The Team", 
          text: "We are a distributed team of designers, engineers, and educators operating from San Francisco, London, and Lagos. We are committed to building the future of async collaboration." 
        }
      ]
    },
    [AppRoute.CAREERS]: {
      title: "Join the Team",
      subtitle: "We're hiring! Build the future of content with us.",
      icon: Briefcase,
      sections: [
        { 
          label: "Why Show?", 
          text: "We value autonomy, craftsmanship, and a 'teaching first' mindset. We offer competitive compensation, equity, and the freedom to work from anywhere." 
        },
        { 
          label: "Open Roles", 
          isList: true,
          items: [
            "Senior Frontend Engineer (React/TypeScript)",
            "AI Research Scientist (Multimodal LLMs)",
            "Product Designer (Spatial Interfaces)",
            "Community Lead (Education & Creative)"
          ]
        },
        { 
          label: "Our Culture", 
          text: "We don't have many meetings. We use our own product to share ideas, give feedback, and stay aligned. It's high-trust and high-impact." 
        }
      ]
    },
    [AppRoute.SECURITY]: {
      title: "Security & Trust",
      subtitle: "Enterprise-grade protection for your content.",
      icon: ShieldCheck,
      sections: [
        { 
          label: "Infrastructure", 
          text: "Show is hosted on secure cloud providers with multi-region redundancy. All video data is encrypted at rest using AES-256." 
        },
        { 
          label: "Compliance", 
          text: "We are SOC2 Type II compliant and regularly undergo third-party penetration testing to ensure your workspace remains a fortress." 
        },
        { 
          label: "Data Privacy", 
          text: "Your data is yours. We do not sell your data, and we provide robust export tools so you can move your content whenever you choose." 
        }
      ]
    },
    [AppRoute.PRIVACY]: {
      title: "Privacy Policy",
      subtitle: "Transparency is our baseline.",
      icon: Lock,
      sections: [
        { label: "Introduction", text: "This policy explains how we collect, use, and protect your personal information when you use Show." },
        { label: "Data Collection", text: "We collect basic account info (name, email) and the content you explicitly record. We do not track you across other websites." },
        { label: "Cookies", text: "We use essential cookies to keep you logged in and functional cookies to improve the studio performance." }
      ]
    },
    [AppRoute.TERMS]: {
      title: "Terms of Service",
      subtitle: "The legal foundation of our partnership.",
      icon: FileText,
      sections: [
        { label: "Acceptance", text: "By using Show, you agree to these terms. Please read them carefully." },
        { label: "Usage Rules", text: "Do not use the platform to share illegal, harmful, or copyright-infringing content. Be a good citizen of the creative community." },
        { label: "Service Limits", text: "Limits on storage and slots are based on your chosen plan. We reserve the right to modify these to maintain system stability." }
      ]
    },
    [AppRoute.PRESS_KIT]: {
      title: "Press Kit",
      subtitle: "Brand assets and media resources.",
      icon: Globe,
      sections: [
        { label: "Brand Identity", text: "Download high-resolution logos, brand guidelines, and product screenshots for media use." },
        { label: "Contact Media", text: "For press inquiries, please reach out to press@sslabs.io" }
      ]
    },
    [AppRoute.CONTACT]: {
      title: "Get in Touch",
      subtitle: "We're here to help you succeed.",
      icon: Mail,
      sections: [
        { label: "Support", text: "Need help? Email support@sslabs.io or use the in-app chat widget." },
        { label: "Sales", text: "Interested in Enterprise features for your school or company? Contact sales@sslabs.io" },
        { label: "Offices", text: "SS Labs Global: 123 Creator Lane, San Francisco, CA 94105" }
      ]
    },
    [AppRoute.BLOG]: {
      title: "The Show Blog",
      subtitle: "Insights on async work, video culture, and product updates.",
      icon: BookOpen,
      sections: [
        { label: "Latest", text: "Announcing Show 2.0: The Future of Spatial Video." },
        { label: "Engineering", text: "How we built a 4K recorder in the browser using WebAssembly." },
        { label: "Culture", text: "Why we killed the daily standup meeting." },
        { label: "Tutorials", text: "Mastering the Infinite Board: A comprehensive guide." }
      ]
    },
    [AppRoute.COMMUNITY]: {
      title: "Community",
      subtitle: "Connect with thousands of creators.",
      icon: Users,
      sections: [
        { label: "Discord", text: "Join our vibrant Discord server to chat with other creators, share tips, and get feedback on your productions." },
        { label: "Events", text: "We host monthly virtual town halls and creator showcases. Check our calendar for the next event." },
        { label: "Ambassadors", text: "Apply to become a Show Ambassador and get exclusive swag, early access to features, and more." }
      ]
    },
    [AppRoute.HELP]: {
      title: "Help Center",
      subtitle: "Guides, tutorials, and support.",
      icon: LifeBuoy,
      sections: [
        { label: "Getting Started", text: "Learn the basics of recording, editing, and sharing your first Show." },
        { 
          label: "Mastering Show Pill", 
          text: "The Show Pill is your minimized companion. It stays visible while you work in other apps, allowing you to instantly start recording, snap screenshots, or return to the main studio. Just drag it to move it anywhere on your screen.",
          image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&q=80&w=1000"
        },
        { label: "Account Management", text: "Managing your subscription, team members, and billing details." },
        { label: "Troubleshooting", text: "Common issues and how to resolve them." }
      ]
    }
  };

  const page = contentMap[type] || contentMap[AppRoute.ABOUT];
  const Icon = page.icon;

  return (
    <div className="min-h-screen bg-white overflow-y-auto font-sans">
      <nav className="h-20 bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-all group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </button>
          <Logo showText={true} />
          <div className="w-20"></div>
        </div>
      </nav>

      <header className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center space-y-6">
          <div className="size-20 bg-white rounded-3xl flex items-center justify-center text-indigo-600 mx-auto shadow-xl border border-white/50">
            <Icon className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">{page.title}</h1>
            <p className="text-xl text-slate-500 font-medium">{page.subtitle}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="space-y-16">
          {page.sections.map((section, idx) => (
            <section key={idx} className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
              <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest flex items-center gap-3">
                <span className="w-10 h-px bg-indigo-200"></span>
                {section.label}
              </h2>
              {section.isList ? (
                <ul className="space-y-4">
                  {section.items.map((item: string, i: number) => (
                    <li key={i} className="flex items-center justify-between p-8 bg-slate-50 border border-slate-100 rounded-3xl group hover:bg-white hover:border-indigo-200 transition-all hover:shadow-2xl hover:shadow-indigo-100/30">
                      <span className="text-xl font-bold text-slate-800">{item}</span>
                      <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-2 transition-all" />
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <p className="text-2xl text-slate-600 font-medium leading-relaxed">
                    {section.text}
                  </p>
                  {section.image && (
                    <div className="mt-8 rounded-3xl overflow-hidden border border-slate-100 shadow-2xl shadow-indigo-100/50">
                      <img src={section.image} alt={section.label} className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" />
                    </div>
                  )}
                </>
              )}
            </section>
          ))}
        </div>
      </main>

      <footer className="bg-slate-50 border-t border-slate-100 py-20 text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <button onClick={onBack} className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all font-bold">
            <ArrowLeft className="w-4 h-4" />
            Back Home
          </button>
          <Logo showText={true} className="opacity-40 grayscale mx-auto" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">© 2025 Show by SS Labs Global. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default InfoPage;
