import React from "react";

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
}

interface LibraryCardProps {
  title: string;
  date: string;
  mode: string;
  videoUrl: string;
  thumbnailUrl: string;
  userName: string;
  userAvatar: string;
  userRole: string;
  collaborators: Collaborator[];
  onExport?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  onInvite?: () => void;
}

const LibraryCard: React.FC<LibraryCardProps> = ({
  title,
  date,
  mode,
  videoUrl,
  thumbnailUrl,
  userName,
  userAvatar,
  userRole,
  collaborators,
  onExport,
  onShare,
  onEdit,
  onDelete,
  onDownload,
  onInvite,
}) => {
  return (
    <div className="library-card group relative rounded-3xl shadow-xl bg-white overflow-hidden transition hover:scale-[1.02] hover:shadow-2xl border border-slate-100">
      <div className="relative">
        <video
          src={videoUrl}
          poster={thumbnailUrl}
          className="w-full aspect-video object-cover transition group-hover:brightness-90"
          muted
          loop
          onMouseOver={e => e.currentTarget.play()}
          onMouseOut={e => e.currentTarget.pause()}
          tabIndex={0}
          aria-label="Preview production"
        />
        <button
          className="absolute top-4 right-4 bg-white/80 rounded-full p-2 shadow hover:bg-white"
          title="Export"
          onClick={onExport}
        >
          <span role="img" aria-label="Export">⬆️</span>
        </button>
        <span className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">NEURAL INDEXED</span>
      </div>
      <div className="p-6 flex flex-col gap-2">
        <h2 className="text-2xl font-extrabold text-slate-900">{title}</h2>
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <span>{date}</span>
          <span className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full font-semibold">{mode}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full border-2 border-white shadow" />
          <span className="font-bold">{userName}</span>
          <span className="text-xs text-slate-400">{userRole}</span>
          {collaborators.map(c => (
            <img key={c.id} src={c.avatar} alt={c.name} className="w-7 h-7 rounded-full border-2 border-white -ml-2 shadow" />
          ))}
          <button
            className="ml-auto px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold hover:bg-blue-200 transition"
            onClick={onInvite}
          >
            Invite
          </button>
        </div>
        <div className="flex gap-3 mt-4">
          <button className="btn-primary" onClick={onShare}>Share</button>
          <button className="btn-secondary" onClick={onEdit}>Edit</button>
          <button className="btn-danger" onClick={onDelete}>Delete</button>
          <button className="btn-outline" onClick={onDownload}>Download</button>
        </div>
        <div className="mt-6 flex gap-4">
          <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition" title="Gen-Z style high-energy short script.">
            <span role="img" aria-label="Viral Relay">⚡</span>
            <span className="text-xs font-semibold text-yellow-700">Viral Relay</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 transition" title="Authority-driven summary for LinkedIn.">
            <span role="img" aria-label="Professional Auth">🔗</span>
            <span className="text-xs font-semibold text-blue-700">Professional Auth</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 transition" title="Clean technical documentation relay.">
            <span role="img" aria-label="Structured Spec">📄</span>
            <span className="text-xs font-semibold text-purple-700">Structured Spec</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LibraryCard;
