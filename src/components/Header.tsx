import { Shield } from 'lucide-react';
import ThreeDAvatar, { AvatarConfig } from './ThreeDAvatar';

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
  onProfileClick?: () => void;
  profileName?: string;
  profileGender?: string;
  avatar?: AvatarConfig;
  isDark?: boolean;
}

export default function Header({ 
  title = 'Endlif', 
  onBack, 
  showBack = false, 
  onProfileClick,
  profileName = 'Adele Vance',
  profileGender = 'Female',
  avatar,
  isDark = false
}: HeaderProps) {
  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'AV';
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${isDark ? 'bg-slate-950/70 border-slate-800/80 shadow-none' : 'bg-white/80 border-slate-200/80 shadow-xs'}`}>
      <div className="max-w-[600px] mx-auto flex items-center justify-between px-6 py-3">
        {showBack ? (
          <button 
            onClick={onBack}
            className={`flex items-center justify-center w-9 h-9 rounded-full transition-all cursor-pointer ${isDark ? 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} active:scale-95`}
          >
            <span className="font-semibold text-lg">&larr;</span>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${isDark ? 'bg-indigo-950/50 border-indigo-500/30' : 'bg-indigo-50 border-indigo-100'}`}>
              <Shield className={`w-4.5 h-4.5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
            </div>
            <h1 className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h1>
          </div>
        )}

        {showBack && title && (
          <h1 className={`font-bold text-xs uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h1>
        )}

        <button 
          onClick={onProfileClick}
          className="flex items-center gap-1.5 focus:outline-none select-none group"
          title="Personal Account Profile"
        >
          <span className={`text-[10px] sm:text-xs font-bold transition-colors ${isDark ? 'text-slate-300 group-hover:text-indigo-400' : 'text-slate-500 group-hover:text-indigo-600'}`}>
            {profileName}
          </span>
          {avatar ? (
            <div className="w-10 h-10 flex items-center justify-center -mr-2">
              <ThreeDAvatar config={avatar} size="sm" interactive={false} />
            </div>
          ) : (
            <div 
              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-[10px] font-black cursor-pointer transition-all hover:scale-105 active:scale-95 uppercase tracking-tighter ${isDark ? 'border-indigo-500/50 hover:border-indigo-400 bg-indigo-750 text-white' : 'border-indigo-100 hover:border-indigo-500 bg-indigo-600 text-white'}`}
            >
              {getInitials(profileName)}
            </div>
          )}
        </button>
      </div>
    </header>
  );
}
