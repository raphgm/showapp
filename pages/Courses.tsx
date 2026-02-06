
import React, { useState } from 'react';
import { 
  BookOpen, Plus, Clock, Users, Star, 
  ChevronRight, PlayCircle, Sparkles, BrainCircuit, 
  ArrowRight, Filter, Search, MoreVertical, CheckCircle2,
  Trophy, Activity, Loader2, X, Target, LayoutGrid, Layers,
  FileText, Network, Zap, GraduationCap, ChevronDown
} from 'lucide-react';
import { Course, Module, Video, AppRoute } from '../types';
import HeroBanner from '../components/HeroBanner';
import { generateCourseSyllabus } from '../services/geminiService';

interface CoursesProps {
  onVideoClick: (video: Video) => void;
  coverImage?: string;
}

const INITIAL_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Advanced System Architecture',
    description: 'Master the principles of scalable distributed systems and high-availability design patterns.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    author: 'Raphael Gab-Momoh',
    enrolledStudents: 1240,
    progress: 65,
    category: 'Engineering',
    modules: [
        { id: 'm1', title: 'Distributed Patterns', videos: [] },
        { id: 'm2', title: 'Event-Driven Systems', videos: [] }
    ]
  },
  {
    id: 'c2',
    title: 'Mastering Multi-modal AI',
    description: 'Deep dive into building applications with Gemini, Veo, and low-latency audio models.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    author: 'Sarah Chen',
    enrolledStudents: 850,
    progress: 12,
    category: 'AI Research',
    modules: [
        { id: 'm1', title: 'Transformer Basics', videos: [] },
        { id: 'm2', title: 'Prompt Engineering', videos: [] }
    ]
  }
];

const Courses: React.FC<CoursesProps> = ({ onVideoClick, coverImage }) => {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [activeTab, setActiveTab] = useState<'following' | 'studio'>('following');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  const handleGenerateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate cognitive steps
    const steps = ['Semantic Analysis...', 'Structuring Taxonomy...', 'Drafting Objectives...', 'Finalizing Syllabus...'];
    for (const step of steps) {
        setGenerationStep(step);
        await new Promise(r => setTimeout(r, 800));
    }

    const syllabus = await generateCourseSyllabus(aiPrompt);
    
    if (syllabus) {
      const newSeries: Course = {
        id: `gen-${Date.now()}`,
        title: syllabus.title,
        description: syllabus.description,
        thumbnailUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
        author: 'Me (Genius Assisted)',
        enrolledStudents: 0,
        progress: 0,
        category: 'New Series',
        modules: syllabus.modules.map((m: any, i: number) => ({
          id: `m-${i}`,
          title: m.title,
          videos: []
        }))
      };
      setCourses([newSeries, ...courses]);
      setActiveTab('studio');
      setIsAiModalOpen(false);
      setAiPrompt('');
    }
    setIsGenerating(false);
    setGenerationStep('');
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 bg-white min-h-screen">
      {/* AI Content Architect Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => !isGenerating && setIsAiModalOpen(false)}></div>
          <div className="bg-white w-full max-w-2xl rounded-[40px] border border-slate-100 overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 flex flex-col">
            
            {/* Header */}
            <div className="bg-slate-50 p-10 border-b border-slate-100 flex justify-between items-start">
               <div className="space-y-2">
                 <div className="flex items-center gap-3">
                    <div className="size-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <BrainCircuit className="size-6" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Neural Architect</h3>
                 </div>
                 <p className="text-slate-500 font-medium max-w-md">Describe your learning objective. The system will structure a complete modular curriculum for you.</p>
               </div>
               <button onClick={() => setIsAiModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-900 transition-all"><X className="size-6" /></button>
            </div>
            
            {/* Body */}
            <div className="p-10 space-y-8 bg-white relative">
               {isGenerating && (
                   <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-6">
                       <div className="relative">
                           <div className="size-24 rounded-full border-4 border-indigo-100 animate-spin border-t-indigo-600"></div>
                           <div className="absolute inset-0 flex items-center justify-center">
                               <Sparkles className="size-8 text-indigo-600 animate-pulse" />
                           </div>
                       </div>
                       <div className="text-center space-y-2">
                           <h4 className="text-xl font-black text-slate-900">{generationStep}</h4>
                           <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Processing Knowledge Graph</p>
                       </div>
                   </div>
               )}

               <form onSubmit={handleGenerateCourse} className="space-y-8">
                  <div className="space-y-4">
                     <label className="text-xs font-black text-indigo-600 uppercase tracking-widest ml-1">Series Directive</label>
                     <textarea 
                       autoFocus
                       rows={3}
                       value={aiPrompt}
                       onChange={(e) => setAiPrompt(e.target.value)}
                       placeholder="e.g. Create a comprehensive onboarding series for Senior Product Managers focusing on agile methodologies and stakeholder alignment."
                       className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 text-lg font-medium text-slate-900 focus:border-indigo-600 outline-none transition-all resize-none placeholder:text-slate-300"
                     />
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                     <Zap className="size-5 text-indigo-600 fill-indigo-600" />
                     <div className="flex-1">
                        <div className="text-sm font-bold text-indigo-900">Cognitive Scale Engine</div>
                        <div className="text-xs text-indigo-700/60">Will generate module structure, learning outcomes, and suggested video titles.</div>
                     </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 hover:-translate-y-1 active:translate-y-0"
                  >
                    Generate Syllabus
                    <ArrowRight className="size-5" />
                  </button>
               </form>
            </div>
          </div>
        </div>
      )}

      <HeroBanner 
        title={<>Instructional Design <br />at Cognitive Scale.</>}
        description="The operating system that transforms passive recording into active, structured knowledge for your entire organization."
        imageUrl={coverImage || "https://images.unsplash.com/photo-1523050335191-0361001a4f00?auto=format&fit=crop&q=80&w=1200"}
        gradientFrom="from-indigo-950"
        gradientTo="to-slate-900"
        buttons={
          <div className="flex gap-4">
            <button 
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-3 bg-white text-indigo-950 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-50 transition-all active:scale-95 group"
            >
              <BrainCircuit className="size-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              Architect Series
            </button>
            <button className="flex items-center gap-3 bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-all border border-white/10">
              <LayoutGrid className="size-4" />
              Browse Hub
            </button>
          </div>
        }
      />

      <div className="flex items-center justify-between border-b border-slate-100 pb-6 sticky top-20 bg-white/80 backdrop-blur-xl z-20 pt-4">
        <div className="flex gap-8">
          {[
            { id: 'following', label: 'My Learning', icon: GraduationCap },
            { id: 'studio', label: 'Authored Series', icon: Layers }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all border-b-4 ${
                activeTab === tab.id ? 'border-indigo-600 text-indigo-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon className={`size-4 ${activeTab === tab.id ? 'text-indigo-600' : 'opacity-40'}`} />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
             <input type="text" placeholder="Search knowledge base..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 w-64 transition-all" />
           </div>
        </div>
      </div>

      <div className="space-y-8">
        {courses.map(course => (
          <div key={course.id} className="group bg-white border border-slate-100 rounded-[40px] overflow-hidden hover:shadow-[0_32px_64px_-16px_rgba(79,70,229,0.15)] transition-all duration-500 hover:border-indigo-100">
             <div className="flex flex-col md:flex-row">
                {/* Course Thumbnail / Info */}
                <div className="md:w-96 bg-slate-50 p-1 shrink-0">
                   <div className="h-full bg-white rounded-[36px] overflow-hidden border border-slate-100 shadow-sm relative group-hover:shadow-md transition-all">
                      <div className="aspect-video relative overflow-hidden">
                         <img src={course.thumbnailUrl} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-indigo-900/10 mix-blend-multiply" />
                         <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur text-indigo-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/50">{course.category}</span>
                         </div>
                      </div>
                      <div className="p-8 space-y-6">
                         <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-900 leading-tight">{course.title}</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-3">{course.description}</p>
                         </div>
                         <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                            <div className="size-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xs border-2 border-white shadow-sm">
                               {course.author.charAt(0)}
                            </div>
                            <div className="text-xs font-bold text-slate-600">{course.author}</div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Course Syllabus / Modules */}
                <div className="flex-1 p-10 flex flex-col">
                   <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-4">
                         <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Network className="size-5" />
                         </div>
                         <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Syllabus Structure</h4>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <Clock className="size-3" />
                         <span>Est. 4h 20m</span>
                      </div>
                   </div>

                   <div className="space-y-3 flex-1">
                      {course.modules.length > 0 ? course.modules.map((module, idx) => (
                         <div key={module.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 hover:border-indigo-100 transition-all cursor-pointer group/module">
                            <div className="flex items-center gap-4">
                               <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs group-hover/module:bg-indigo-600 group-hover/module:text-white transition-colors">
                                  {idx + 1}
                                </div>
                               <span className="font-bold text-slate-700 group-hover/module:text-indigo-900 transition-colors">{module.title}</span>
                            </div>
                            <ChevronDown className="size-4 text-slate-300 group-hover/module:text-indigo-400 transition-colors" />
                         </div>
                      )) : (
                         <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 font-bold text-xs uppercase tracking-widest">
                            No Modules Published
                         </div>
                      )}
                   </div>

                   <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between items-center">
                      <div className="space-y-1">
                         <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                         </div>
                         <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${course.progress}%` }} />
                         </div>
                      </div>
                      <button className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg hover:-translate-y-1 active:translate-y-0">
                         {course.progress && course.progress > 0 ? 'Resume Learning' : 'Start Series'}
                      </button>
                   </div>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="h-24" />
    </div>
  );
};

export default Courses;
