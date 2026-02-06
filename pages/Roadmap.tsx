
import React, { useState } from 'react';
import { 
  Plus, GripVertical, CheckCircle2, Clock, 
  MoreVertical, Sparkles, Filter, ListTodo, 
  Trash2, ArrowRight, Zap, Target
} from 'lucide-react';
import { ProductionTask } from '../types';
import HeroBanner from '../components/HeroBanner';

const INITIAL_TASKS: ProductionTask[] = [
  { id: 't1', title: 'Draft Script for Q4 Product Demo', status: 'Scripting', priority: 'High', estimatedTime: '2h' },
  { id: 't2', title: 'Capture Studio Footage for UI Walkthrough', status: 'Recording', priority: 'High', estimatedTime: '4h' },
  { id: 't3', title: 'Apply AI Summarization to Engineering Sync', status: 'Mastering', priority: 'Medium', estimatedTime: '1h' },
  { id: 't4', title: 'Review Community Feedback from v2.4 Launch', status: 'Backlog', priority: 'Low', estimatedTime: '3h' },
  { id: 't5', title: 'Establish Shared Library for Marketing Team', status: 'Setup', priority: 'Medium', estimatedTime: '2h' },
];

const Roadmap: React.FC<{ coverImage?: string }> = ({ coverImage }) => {
  const [tasks, setTasks] = useState<ProductionTask[]>(INITIAL_TASKS);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newTasks = [...tasks];
    const draggedTask = newTasks[draggedIndex];
    newTasks.splice(draggedIndex, 1);
    newTasks.splice(index, 0, draggedTask);
    
    setDraggedIndex(index);
    setTasks(newTasks);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: ProductionTask = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTaskTitle,
      status: 'Backlog',
      priority: 'Medium',
      estimatedTime: '1h'
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'High': return 'text-rose-500 bg-rose-50 border-rose-100';
      case 'Medium': return 'text-amber-500 bg-amber-50 border-amber-100';
      default: return 'text-indigo-500 bg-indigo-50 border-indigo-100';
    }
  };

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-12 relative animate-in fade-in duration-700">
      {/* Decorative Doodles */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
        <svg className="absolute top-20 right-0 w-96 h-96 text-indigo-600" viewBox="0 0 100 100">
           <path d="M10,10 L30,10 M10,10 L10,30" fill="none" stroke="currentColor" strokeWidth="0.5" />
           <path d="M70,90 L90,90 M90,90 L90,70" fill="none" stroke="currentColor" strokeWidth="0.5" />
           <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="2 4" />
        </svg>
      </div>

      <HeroBanner 
        title={<>Prioritize your <br />Production Cycle.</>}
        description="A dynamic interface to manage your teaching backlog. Drag and drop production steps to reorganize based on team impact and deadlines."
        imageUrl={coverImage || "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=1200"}
        gradientFrom="from-slate-900"
        gradientTo="to-slate-800"
        buttons={
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
             <Target className="size-4 text-emerald-400" />
             <span className="text-[10px] font-black text-white uppercase tracking-widest">Alignment Optimized</span>
          </div>
        }
      />

      <div className="flex flex-col lg:flex-row gap-12 relative z-10">
        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between">
             <div className="space-y-1">
               <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                 <ListTodo className="size-8 text-indigo-600" />
                 Active Backlog
               </h2>
               <p className="text-slate-400 font-medium">Reorder items to set global workspace priorities.</p>
             </div>
             <div className="flex items-center gap-2">
                <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                  <Filter className="size-4" />
                </button>
             </div>
          </div>

          <form onSubmit={addTask} className="relative group">
             <input 
               type="text" 
               value={newTaskTitle}
               onChange={(e) => setNewTaskTitle(e.target.value)}
               placeholder="Identify a new production step..."
               className="w-full bg-white border-2 border-slate-100 rounded-[32px] px-10 py-6 font-bold text-slate-900 outline-none focus:border-indigo-600 transition-all shadow-sm group-hover:shadow-xl"
             />
             <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95">
                <Plus className="size-5" />
             </button>
          </form>

          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div 
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`group bg-white border border-slate-100 p-6 rounded-[32px] flex items-center gap-6 transition-all duration-300 cursor-default ${
                  draggedIndex === index ? 'opacity-30 scale-95 border-indigo-600' : 'hover:shadow-2xl hover:border-indigo-100'
                }`}
              >
                <div className="p-2 text-slate-200 group-hover:text-indigo-400 transition-colors cursor-grab active:cursor-grabbing">
                   <GripVertical className="size-6" />
                </div>

                <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                  <CheckCircle2 className={`size-6 ${task.status === 'Mastering' ? 'text-emerald-500' : 'text-slate-300'}`} />
                </div>

                <div className="flex-1">
                   <h3 className="font-black text-slate-900 text-lg tracking-tight group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                   <div className="flex items-center gap-4 mt-1.5">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{task.status}</span>
                      <div className="size-1 rounded-full bg-slate-200" />
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <Clock className="size-3" /> {task.estimatedTime}
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-6">
                   <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                   </div>
                   <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all"
                   >
                     <Trash2 className="size-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="w-full lg:w-80 space-y-8">
           <div className="bg-indigo-600 rounded-[48px] p-10 text-white space-y-8 shadow-2xl shadow-indigo-100 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 size-40 bg-white/10 blur-[80px] rounded-full" />
              <div className="space-y-4 relative z-10">
                 <div className="size-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                   <Sparkles className="size-6" />
                 </div>
                 <h3 className="text-2xl font-black leading-tight">Mastery Insight</h3>
                 <p className="text-indigo-100 font-medium text-sm leading-relaxed">
                   Based on your current backlog, prioritizing the <span className="font-black text-white">Capture Stage</span> for the Q4 Demo will accelerate downstream mastering by 25%.
                 </p>
              </div>
              <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                 Auto-Optimize <Zap className="size-3 fill-indigo-600" />
              </button>
           </div>

           <div className="bg-white border border-slate-100 rounded-[48px] p-10 space-y-8 shadow-sm">
              <div className="space-y-1">
                 <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-[0.3em]">Phase Metrics</h4>
                 <div className="text-3xl font-black text-indigo-950">12.5h <span className="text-slate-300 text-sm font-bold uppercase tracking-widest">Est.</span></div>
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Scripting', val: 30, color: 'bg-indigo-500' },
                   { label: 'Recording', val: 55, color: 'bg-rose-500' },
                   { label: 'Editing', val: 15, color: 'bg-emerald-500' }
                 ].map(m => (
                   <div key={m.label} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                         <span>{m.label}</span>
                         <span>{m.val}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                         <div className={`h-full ${m.color} rounded-full`} style={{ width: `${m.val}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
