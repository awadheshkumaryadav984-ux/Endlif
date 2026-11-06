import { Home, Users, PhoneCall, BrainCircuit, User } from 'lucide-react';
import { Screen } from '../types';

interface BottomNavProps {
  activeScreen: Screen;
  setScreen: (screen: Screen) => void;
}

export default function BottomNav({ activeScreen, setScreen }: BottomNavProps) {
  // If we are currently in SOS active screen, hide standard bottom navigation
  if (activeScreen === 'sos') return null;

  const isDark = ['resources', 'account', 'creator_hub'].includes(activeScreen);

  const navItems: Array<{ id: Screen; label: string; icon: typeof Home; isAchyuta?: boolean }> = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'circle', label: 'CIRCLE', icon: Users },
    { id: 'resources', label: 'HELP', icon: PhoneCall },
    { id: 'assistant', label: 'ACHYUTA AI', icon: BrainCircuit, isAchyuta: true },
    { id: 'account', label: 'PROFILE', icon: User },
  ];

  return (
    <nav 
      aria-label="Primary navigation"
      className={`fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[540px] z-50 h-[66px] transition-all duration-300 flex justify-around items-center px-2 rounded-2xl ${
        isDark 
          ? 'bg-slate-900/90 border border-slate-800 shadow-[0_12px_36px_rgba(0,0,0,0.45)] backdrop-blur-xl' 
          : 'bg-white/95 border border-slate-200/90 shadow-[0_12px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl'
      }`}
    >
      {navItems.map((item) => {
        const isActive = activeScreen === item.id;
        const Icon = item.icon;

        if (item.isAchyuta) {
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer min-w-[64px] min-h-[48px] ${
                isActive
                  ? isDark 
                    ? 'bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 shadow-xs' 
                    : 'bg-indigo-50/90 border border-indigo-200/70 text-indigo-700 shadow-xs'
                  : isDark 
                    ? 'text-slate-400 hover:text-slate-200' 
                    : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4.5 h-4.5 mb-0.5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              </div>
              <span className="text-[9px] font-bold tracking-wider uppercase">
                ACHYUTA AI
              </span>
            </button>
          );
        }

        return (
          <button 
            key={item.id}
            onClick={() => setScreen(item.id)}
            className={`flex flex-col items-center justify-center px-2 py-1.5 rounded-xl transition-all duration-200 cursor-pointer min-w-[56px] min-h-[48px] ${
              isActive 
                ? isDark 
                  ? 'text-indigo-400 font-semibold' 
                  : 'text-indigo-600 font-semibold'
                : isDark 
                  ? 'text-slate-400 hover:text-slate-200' 
                  : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Icon className={`w-4.5 h-4.5 mb-0.5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
            <span className="text-[9px] font-medium tracking-wider uppercase">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
