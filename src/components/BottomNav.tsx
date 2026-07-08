import { Home, Users, FileLock, PhoneCall, BrainCircuit, ShieldCheck, User } from 'lucide-react';
import { Screen } from '../types';

interface BottomNavProps {
  activeScreen: Screen;
  setScreen: (screen: Screen) => void;
}

export default function BottomNav({ activeScreen, setScreen }: BottomNavProps) {
  // If we are currently in SOS active screen or checkin, we don't display normal navigation or we keep it clean.
  if (activeScreen === 'sos') return null;

  const isDark = ['resources', 'account'].includes(activeScreen);

  return (
    <nav className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] z-50 h-[80px] transition-all duration-300 flex justify-around items-center px-2 pb-4 rounded-t-2xl ${
      isDark 
        ? 'bg-slate-950/90 border-t border-slate-900 shadow-[0_-4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md' 
        : 'bg-white border-t border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]'
    }`}>
      {/* Home tab */}
      <button 
        onClick={() => setScreen('home')}
        className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
          activeScreen === 'home' 
            ? 'text-indigo-500 scale-110 font-bold drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' 
            : isDark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Home className="w-5 h-5 mb-1" />
        <span className="text-[9px] font-bold tracking-wider uppercase">HOME</span>
      </button>

      {/* Safety Circle tab */}
      <button 
        onClick={() => setScreen('circle')}
        className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
          activeScreen === 'circle' 
            ? 'text-indigo-500 scale-110 font-bold drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' 
            : isDark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Users className="w-5 h-5 mb-1" />
        <span className="text-[9px] font-bold tracking-wider uppercase">CIRCLE</span>
      </button>

      {/* Emergency Resources tab */}
      <button 
        onClick={() => setScreen('resources')}
        className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
          activeScreen === 'resources' 
            ? 'text-indigo-400 scale-110 font-bold drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]' 
            : isDark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <PhoneCall className="w-5 h-5 mb-1" />
        <span className="text-[9px] font-bold tracking-wider uppercase">HELP</span>
      </button>

      {/* Bot Assistant tab */}
      <button 
        onClick={() => setScreen('assistant')}
        className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
          activeScreen === 'assistant' 
            ? 'text-indigo-500 scale-110 font-bold drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' 
            : isDark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <BrainCircuit className="w-5 h-5 mb-1" />
        <span className="text-[9px] font-bold tracking-wider uppercase">Achyuta</span>
      </button>

      {/* Account Profile tab */}
      <button 
        onClick={() => setScreen('account')}
        className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
          activeScreen === 'account' 
            ? 'text-indigo-400 scale-110 font-bold drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]' 
            : isDark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <User className="w-5 h-5 mb-1" />
        <span className="text-[9px] font-bold tracking-wider uppercase">PROFILE</span>
      </button>
    </nav>
  );
}
