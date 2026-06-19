import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Contact, Screen } from './types';
import { INITIAL_CONTACTS } from './data';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomeView from './components/HomeView';
import CircleView from './components/CircleView';
import ResourcesView from './components/ResourcesView';
import AssistantView from './components/AssistantView';
import CheckInView from './components/CheckInView';
import SosView from './components/SosView';
import AccountView from './components/AccountView';
import CreatorHubView from './components/CreatorHubView';
import ThreeDAvatar, { AvatarConfig } from './components/ThreeDAvatar';
import VaultGate from './components/VaultGate';
import PlexusBackground from './components/PlexusBackground';
import { SecureStorage } from './utils/security';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [lastCheckInTime, setLastCheckInTime] = useState<string>('04:32 PM');
  const [countdownMinutes, setCountdownMinutes] = useState<number>(23 * 60 + 12);

  const [isLocked, setIsLocked] = useState<boolean>(() => localStorage.getItem('endlif_pin_lock_enabled') === 'true');
  const [decoyModeActive, setDecoyModeActive] = useState<boolean>(() => localStorage.getItem('endlif_decoy_active') === 'true');

  const [profile, setProfile] = useState({ name: 'Adele Vance', gender: 'Female' });
  const [avatar, setAvatar] = useState<AvatarConfig>({
    character: 'dragon',
    theme: 'indigo',
    accessory: 'none',
    aura: 'none',
    motionStyle: 'float'
  });

  // Toggle contacts in real time based on decoy state
  useEffect(() => {
    if (decoyModeActive) {
      setContacts([
        { id: 'decoy1', name: 'Papa Pizza Delivery Hub', relationship: 'Commercial Vendor', phoneNumber: '+1 (555) 018-3561', icon: 'phone', highRiskSms: false },
        { id: 'decoy2', name: 'Supervisor (Main Desk)', relationship: 'Professional Office', phoneNumber: '+1 (555) 012-9442', icon: 'zap', highRiskSms: false }
      ]);
    } else {
      const savedContacts = SecureStorage.getItem('endlif_contacts');
      if (savedContacts) {
        try {
          setContacts(JSON.parse(savedContacts));
        } catch {
          setContacts(INITIAL_CONTACTS);
        }
      } else {
        setContacts(INITIAL_CONTACTS);
      }
    }
  }, [decoyModeActive]);

  useEffect(() => {
    const loadProfile = () => {
      const saved = SecureStorage.getItem('endlif_user_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.name) {
            setProfile({
              name: parsed.name,
              gender: parsed.gender || 'Female'
            });
          }
        } catch (e) {
          console.error('Failed to parse safety profile in App context', e);
        }
      }

      const savedAvatar = SecureStorage.getItem('endlif_user_avatar');
      if (savedAvatar) {
        try {
          setAvatar(JSON.parse(savedAvatar));
        } catch (e) {
          console.error('Failed to parse safety avatar in App context', e);
        }
      }
    };

    loadProfile();
    window.addEventListener('endlif_profile_updated', loadProfile);
    
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setScreen(customEvent.detail);
      }
    };
    window.addEventListener('endlif_navigate', handleNavigate);

    return () => {
      window.removeEventListener('endlif_profile_updated', loadProfile);
      window.removeEventListener('endlif_navigate', handleNavigate);
    };
  }, []);

  // Trigger SOS view
  const triggerSos = () => {
    setScreen('sos');
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([200, 100, 200, 100, 500]);
    }
  };

  const cancelSos = () => {
    setScreen('home');
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([100, 100]);
    }
  };

  const handleConfirmSafety = () => {
    // Verified safe, return home
    const now = new Date();
    const stamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastCheckInTime(stamp);
    setScreen('home');
  };

  // Determine what Title to show in navigation header based on active screen
  const getHeaderTitle = (): string => {
    switch (screen) {
      case 'home':
        return 'Endlif';
      case 'circle':
        return 'Circle Tracker';
      case 'resources':
        return 'Help';
      case 'assistant':
        return 'Assistant AI';
      case 'checkin':
        return 'Status Verification';
      case 'account':
        return 'Safety Profile';
      case 'creator_hub':
        return 'Creator Hub';
      default:
        return 'Endlif';
    }
  };

  const renderActiveScreen = () => {
    switch (screen) {
      case 'home':
        return (
          <HomeView 
            setScreen={setScreen} 
            onSosTrigger={triggerSos} 
            lastCheckInTime={lastCheckInTime}
            setLastCheckInTime={setLastCheckInTime}
          />
        );
      case 'circle':
        return (
          <CircleView 
            contacts={contacts} 
            setContacts={setContacts} 
            onBack={() => setScreen('home')}
            profileName={profile.name}
            avatar={avatar}
          />
        );
      case 'resources':
        return (
          <ResourcesView />
        );
      case 'assistant':
        return (
          <AssistantView />
        );
      case 'checkin':
        return (
          <CheckInView 
            onConfirmSafety={handleConfirmSafety} 
            countdownMinutes={countdownMinutes}
          />
        );
      case 'account':
        return (
          <AccountView setScreen={setScreen} />
        );
      case 'creator_hub':
        return (
          <CreatorHubView />
        );
      default:
        return (
          <HomeView 
            setScreen={setScreen} 
            onSosTrigger={triggerSos} 
            lastCheckInTime={lastCheckInTime}
            setLastCheckInTime={setLastCheckInTime}
          />
        );
    }
  };

  const handleVaultUnlock = (isDecoy: boolean) => {
    setIsLocked(false);
    setDecoyModeActive(isDecoy);
  };

  const isDarkBackgroundScreen = ['resources', 'checkin'].includes(screen);

  return (
    <div className={`min-h-screen flex flex-col font-sans select-none overflow-x-hidden transition-all duration-500 relative ${
      isDarkBackgroundScreen ? 'bg-[#05050e] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Immersive Dark Cyberplex background illustration requested by user */}
      <AnimatePresence>
        {isDarkBackgroundScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            <PlexusBackground />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-[9999]"
          >
            <VaultGate onUnlock={handleVaultUnlock} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Universal Screen Header (Not drawn during active high-stakes SOS view or Circle view) */}
      {screen !== 'sos' && screen !== 'circle' && (
        <Header 
          title={getHeaderTitle()} 
          showBack={screen !== 'home'} 
          onBack={() => setScreen('home')} 
          onProfileClick={() => setScreen('account')}
          profileName={profile.name}
          profileGender={profile.gender}
          avatar={avatar}
          isDark={isDarkBackgroundScreen}
        />
      )}

      {/* Main Container Stage for Content with transitions */}
      <main className="flex-1 w-full max-w-[600px] mx-auto flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {screen === 'sos' ? (
            <motion.div
              key="sos-active-view"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="absolute inset-0 z-50 overflow-hidden"
            >
              <SosView onCancelSos={cancelSos} contacts={contacts} />
            </motion.div>
          ) : (
            <motion.div
              key={screen}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex-1 w-full"
            >
              {renderActiveScreen()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Universal Interactive Active Background Safety Companion Mascot */}
      {screen !== 'sos' && (
        <div className="fixed bottom-24 right-4 md:right-[calc(50%-280px)] z-40 pointer-events-auto select-none">
          <div className="flex flex-col items-center select-none">
            {/* Soft glowing beacon label above the companion */}
            <span className="text-[8px] font-black font-mono bg-slate-900/95 text-indigo-400 px-2 py-0.5 rounded-full border border-slate-800 shadow-md uppercase tracking-wider scale-85 animate-pulse mb-0.5 select-none">
              Companion: {avatar.character}
            </span>
            <ThreeDAvatar config={avatar} size="md" interactive={true} />
          </div>
        </div>
      )}

      {/* Bottom navigation bar */}
      <BottomNav activeScreen={screen} setScreen={setScreen} />
    </div>
  );
}
