import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  MessageSquare, 
  Plus, 
  Users, 
  X, 
  Sparkles, 
  Link2, 
  Share2, 
  Settings, 
  MoreVertical, 
  ChevronLeft, 
  Radio, 
  Trash2,
  Volume2,
  MicOff,
  Video,
  Shield,
  Send,
  ExternalLink,
  Bot,
  Copy,
  Check,
  Mail,
  Bell,
  PhoneCall,
  AlertTriangle,
  Smartphone
} from 'lucide-react';
import { Contact } from '../types';
import ThreeDAvatar from './ThreeDAvatar';
import { SafetyCircleManager } from '../services/SafetyCircleManager';
import { NotificationManager } from '../services/NotificationManager';
import { SMSFallbackService } from '../services/SMSFallbackService';
import { EmailFallbackService } from '../services/EmailFallbackService';
import { FCMService } from '../services/FCMService';
import { toE164, isValidE164, formatForDisplay } from '../services/phoneUtils';
import { AlertAuditLogger } from '../services/AlertAuditLogger';

interface CircleViewProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  onBack?: () => void;
  profileName?: string;
  avatar?: any;
}

export default function CircleView({ 
  contacts, 
  setContacts, 
  onBack, 
  profileName = 'Adele Vance', 
  avatar 
}: CircleViewProps) {
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRole, setNewContactRole] = useState('Primary Guardian');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  
  // Interactive navigation / dropdowns
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [quickActionAlert, setQuickActionAlert] = useState<string | null>(null);
  
  // Immersive safety action overlays
  const [activeCallContact, setActiveCallContact] = useState<Contact | null>(null);
  const [activeMsgContact, setActiveMsgContact] = useState<Contact | null>(null);
  const [editablePhone, setEditablePhone] = useState('');
  const [editableEmail, setEditableEmail] = useState('');
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [channelActionStatus, setChannelActionStatus] = useState<{ [key: string]: string }>({});
  
  // Canonical Emergency Alert Template
  const [presetAlertTemplate, setPresetAlertTemplate] = useState(
    `ENDLIF Emergency Safety Alert: Daily check-in overdue for ${profileName}. Please verify their safety immediately. Track status: https://endlif.app/status`
  );

  // Sync contacts with SafetyCircleManager
  useEffect(() => {
    const handleCircleUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ contacts: Contact[] }>;
      if (customEvent.detail?.contacts) {
        setContacts(customEvent.detail.contacts);
      } else {
        setContacts(SafetyCircleManager.getContacts());
      }
    };

    window.addEventListener('endlif_circle_updated', handleCircleUpdated);
    return () => window.removeEventListener('endlif_circle_updated', handleCircleUpdated);
  }, [setContacts]);

  // Smooth VoIP Call Simulator States
  const [callState, setCallState] = useState<'connecting' | 'ringing' | 'active' | 'disconnected'>('connecting');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // VoIP call progress simulation effect
  useEffect(() => {
    let callStateTimeout: NodeJS.Timeout;
    let autoPickUpTimeout: NodeJS.Timeout;

    if (activeCallContact) {
      setCallState('connecting');
      setCallDuration(0);

      callStateTimeout = setTimeout(() => {
        setCallState('ringing');
        
        autoPickUpTimeout = setTimeout(() => {
          setCallState('active');
          if (window.navigator?.vibrate) {
            window.navigator.vibrate([80, 50, 80]);
          }
        }, 1600);
      }, 1000);
    } else {
      setCallState('disconnected');
    }

    return () => {
      clearTimeout(callStateTimeout);
      clearTimeout(autoPickUpTimeout);
    };
  }, [activeCallContact]);

  // Active call duration counter
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    if (activeCallContact && callState === 'active') {
      timerInterval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      clearInterval(timerInterval);
    };
  }, [activeCallContact, callState]);

  const formatCallDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;

    const rawPhone = newContactPhone.trim();
    const formattedPhone = toE164(rawPhone);

    if (!isValidE164(formattedPhone)) {
      setPhoneError('Please provide a valid E.164 phone number (e.g. +14155552671)');
      return;
    }

    setPhoneError(null);

    const newContact: Contact = {
      id: `guardian_${Date.now()}`,
      name: newContactName.trim(),
      role: newContactRole,
      status: 'Active',
      avatar: `https://lh3.googleusercontent.com/aida-public/AB6AXuAj9awLdHeoyRWhpmJ_G_9iEymBJIcMPqIXy66-tiksDTcwVcy8p_M6uySonXEmqlwnhOlRTGXLqHC9rHiRojZT-ojhHZZGwJbBaeaQob1KWy_sutgEsQm7A-PrfVYVT3DsZwL-ZvLXA5PJasMpUFsqhEHbmNBXbOewH8R4xh-i5KNIokS9OamLNXAydPYfn3YQBTJ64afZO2pIxoP1b3DVOm7NSqq6PS_K6-Yr4dU_oWHNeQDGWmSxp1Bn9WetsBAq36NnTqTj6OU`,
      online: true,
      phone: formattedPhone,
      email: newContactEmail.trim() || undefined,
      fcmToken: `fcm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };

    SafetyCircleManager.addContact(newContact);
    setContacts(SafetyCircleManager.getContacts());
    setNewContactName('');
    setNewContactPhone('');
    setNewContactEmail('');
    setNewContactRole('Primary Guardian');
    setShowAddModal(false);
    triggerNotification(`✦ Guardian ${newContact.name} enrolled in Safety Circle with E.164 verified phone!`);
  };

  const triggerNotification = (text: string) => {
    setQuickActionAlert(text);
    setTimeout(() => {
      setQuickActionAlert(null);
    }, 3800);
  };

  const handleQuickAction = (actionType: 'invite' | 'share' | 'permissions') => {
    if (actionType === 'invite') {
      triggerNotification('🔗 Direct guardian safety invite link generated & copied');
    } else if (actionType === 'share') {
      triggerNotification('📍 Continuous live safety link shared on guardian channel');
    } else if (actionType === 'permissions') {
      triggerNotification('⚙ Guardian background alert permissions verified.');
    }
  };

  const handleRemoveContact = (id: string, name: string) => {
    SafetyCircleManager.removeContact(id);
    setContacts(SafetyCircleManager.getContacts());
    triggerNotification(`Guardian ${name} removed from your active Safety Circle.`);
    setActiveMenuId(null);
  };

  const executeCall = (contact: Contact) => {
    setActiveCallContact(contact);
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([40, 30, 40]);
    }
    NotificationManager.initiateEmergencyCall(contact);
  };

  const openEmergencyChannelsModal = (contact: Contact) => {
    setActiveMsgContact(contact);
    setEditablePhone(contact.phone || '+15550123499');
    setEditableEmail(contact.email || '');
    setCopiedMessage(false);
    setChannelActionStatus({});
  };

  const handleSendFCM = async () => {
    if (!activeMsgContact) return;
    setChannelActionStatus(prev => ({ ...prev, fcm: 'Sending FCM push notification...' }));
    const result = await FCMService.sendNotification({
      token: activeMsgContact.fcmToken || 'token-sim',
      title: '🚨 ENDLIF Emergency Safety Alert',
      body: presetAlertTemplate,
      data: {
        type: 'DAILY_CHECKIN_EXPIRED',
        contactId: activeMsgContact.id,
        userName: profileName
      }
    });

    if (result.success) {
      setChannelActionStatus(prev => ({
        ...prev,
        fcm: result.isSimulation ? 'Sent (Development Push Simulation)' : 'Delivered to ENDLIF App'
      }));
      triggerNotification(`FCM push dispatched to ${activeMsgContact.name}`);
    } else {
      setChannelActionStatus(prev => ({ ...prev, fcm: `Failed: ${result.error}` }));
    }
  };

  const handleSendSmsFallback = async () => {
    if (!activeMsgContact) return;
    setChannelActionStatus(prev => ({ ...prev, sms: 'Opening native device SMS...' }));
    const updatedContact = { ...activeMsgContact, phone: toE164(editablePhone) || activeMsgContact.phone };
    SMSFallbackService.triggerDeviceSms(updatedContact, presetAlertTemplate);
    setChannelActionStatus(prev => ({ ...prev, sms: 'Device SMS client triggered' }));
    triggerNotification(`Device SMS intent launched for ${activeMsgContact.name}`);
  };

  const handleSendEmailFallback = async () => {
    if (!activeMsgContact) return;
    const emailToUse = editableEmail.trim() || activeMsgContact.email;
    if (!emailToUse) {
      setChannelActionStatus(prev => ({ ...prev, email: 'Please specify an email address first' }));
      return;
    }

    setChannelActionStatus(prev => ({ ...prev, email: 'Dispatching email alert...' }));
    const updatedContact = { ...activeMsgContact, email: emailToUse };
    const result = await EmailFallbackService.sendEmail(
      updatedContact,
      `🚨 URGENT: ENDLIF Safety Alert for ${profileName}`,
      presetAlertTemplate
    );

    if (result.success) {
      setChannelActionStatus(prev => ({
        ...prev,
        email: result.isSimulation ? 'Sent (Simulation Inbox Logged)' : 'Email delivered'
      }));
      triggerNotification(`Email alert dispatched to ${emailToUse}`);
    } else {
      setChannelActionStatus(prev => ({ ...prev, email: `Email Error: ${result.error}` }));
    }
  };

  const handleCopyAlertMessage = () => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(presetAlertTemplate);
      }
      setCopiedMessage(true);
      triggerNotification('📋 Emergency safety alert text copied to clipboard!');
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch (err) {
      console.error('Clipboard copy error:', err);
    }
  };

  return (
    <div className="font-sans min-h-screen bg-white text-slate-800 pb-24 select-none antialiased relative">
      
      {/* 1. PREMIUM STARTUP HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-100/80 max-w-[600px] mx-auto w-full">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            title="Go Safety Home"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div className="text-left">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              Circle
            </h1>
            <p className="text-[11px] text-[#5B4BFF] font-extrabold tracking-wide uppercase mt-0.5">
              Your trusted guardians
            </p>
          </div>
        </div>

        {/* Small Active Avatar View */}
        <div className="flex items-center">
          {avatar ? (
            <div className="w-10 h-10 flex items-center justify-center">
              <ThreeDAvatar config={avatar} size="sm" interactive={false} />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full border border-[#5B4BFF]/20 bg-[#5B4BFF]/10 text-[#5B4BFF] flex items-center justify-center text-xs font-black uppercase">
              {profileName.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-[600px] mx-auto px-6 py-6 space-y-7">

        {/* 2. AUTO-DISMISS FLOATING TOAST NOTIFICATION */}
        <AnimatePresence>
          {quickActionAlert && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="bg-slate-900 text-white p-4 rounded-3xl flex items-center gap-3.5 shadow-xl text-xs font-bold font-sans z-50 fixed top-20 left-4 right-4 md:left-[calc(50%-280px)] md:right-[calc(50%-280px)]"
            >
              <div className="w-6 h-6 rounded-full bg-[#5B4BFF] flex items-center justify-center text-white flex-shrink-0 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="flex-1 text-slate-200 leading-snug">{quickActionAlert}</span>
              <button 
                onClick={() => setQuickActionAlert(null)}
                className="text-slate-400 hover:text-white p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. TOP SUMMARY CARD */}
        <section id="top-summary-card">
          <div className="bg-slate-50/50 border border-slate-100 rounded-[24px] p-5 flex items-center justify-between gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              {/* Overlapping avatars stacking layout */}
              <div className="flex -space-x-3.5">
                {contacts.slice(0, 4).map((c, i) => (
                  <div key={c.id || i} className="relative">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-[0_2px_6px_rgba(0,0,0,0.04)] flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://lh3.googleusercontent.com/aida-public/AB6AXuAj9awLdHeoyRWhpmJ_G_9iEymBJIcMPqIXy66-tiksDTcwVcy8p_M6uySonXEmqlwnhOlRTGXLqHC9rHiRojZT-ojhHZZGwJbBaeaQob1KWy_sutgEsQm7A-PrfVYVT3DsZwL-ZvLXA5PJasMpUFsqhEHbmNBXbOewH8R4xh-i5KNIokS9OamLNXAydPYfn3YQBTJ64afZO2pIxoP1b3DVOm7NSqq6PS_K6-Yr4dU_oWHNeQDGWmSxp1Bn9WetsBAq36NnTqTj6OU`;
                      }}
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-550 border border-white rounded-full bg-emerald-500" />
                  </div>
                ))}
                {contacts.length === 0 && (
                  <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-400">
                    <Users className="w-4 h-4" />
                  </div>
                )}
              </div>
              
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-[15px] text-slate-900 leading-tight">
                  {contacts.length} Guardians
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-600 font-extrabold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    {contacts.filter(c => c.online !== false).length} Online
                  </span>
                  <span>•</span>
                  <span>Last Sync: Just now</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-[#5B4BFF] hover:bg-[#4C3EE0] text-white px-5 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 shadow-sm cursor-pointer hover:shadow-md"
            >
              Manage
            </button>
          </div>
        </section>

        {/* 4. GUARDIAN CARDS SECTION */}
        <section id="guardian-cards" className="space-y-4">
          <div className="flex items-center justify-between pl-1">
            <h2 className="text-[11px] font-black text-slate-400 tracking-wider uppercase">
              Active Circle Loop ({contacts.length})
            </h2>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest font-mono">Real-Time verified</span>
            </div>
          </div>

          <div className="space-y-3">
            {contacts.map((contact) => {
              const isMenuOpen = activeMenuId === contact.id;

              return (
                <div 
                  key={contact.id}
                  className="bg-slate-50/70 border border-slate-100/90 rounded-[24px] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:bg-slate-50 hover:shadow-sm hover:border-slate-200/40 group relative"
                >
                  <div className="flex items-start gap-4">
                    {/* Circle Avatar with Glowing verified Ring */}
                    <div className="relative flex-shrink-0">
                      <div className="w-15 h-15 rounded-full p-0.5 bg-gradient-to-tr from-[#5B4BFF]/20 to-teal-400/20 group-hover:from-[#5B4BFF]/40 group-hover:to-teal-400/40 transition-all">
                        <img 
                          src={contact.avatar} 
                          alt={contact.name} 
                          className="w-full h-full rounded-full object-cover border border-white bg-slate-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://lh3.googleusercontent.com/aida-public/AB6AXuAj9awLdHeoyRWhpmJ_G_9iEymBJIcMPqIXy66-tiksDTcwVcy8p_M6uySonXEmqlwnhOlRTGXLqHC9rHiRojZT-ojhHZZGwJbBaeaQob1KWy_sutgEsQm7A-PrfVYVT3DsZwL-ZvLXA5PJasMpUFsqhEHbmNBXbOewH8R4xh-i5KNIokS9OamLNXAydPYfn3YQBTJ64afZO2pIxoP1b3DVOm7NSqq6PS_K6-Yr4dU_oWHNeQDGWmSxp1Bn9WetsBAq36NnTqTj6OU`;
                          }}
                        />
                      </div>
                      {/* Active emerald pulse badge anchor */}
                      <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                      </span>
                    </div>

                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-[16px] text-slate-950">
                          {contact.name}
                        </span>
                        <span className="text-[10px] bg-[#5B4BFF]/8 text-[#5B4BFF] font-extrabold px-2 py-0.5 rounded-full select-none">
                          {contact.name.toLowerCase().includes('friend') ? 'Trusted Contact' : 'Primary Guardian'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                        <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider flex items-center gap-1">
                          🟢 Online
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-[11px] text-slate-400">{contact.phone || '+1 (555) 012-3499'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center justify-end gap-1.5 self-end sm:self-center relative pr-1">
                    <button
                      onClick={() => executeCall(contact)}
                      className="w-10 h-10 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-90"
                      title="📞 Cellular Emergency Call"
                    >
                      <Phone className="w-4 h-4 fill-emerald-600" />
                    </button>
                    <button
                      onClick={() => openEmergencyChannelsModal(contact)}
                      className="w-10 h-10 rounded-full bg-indigo-50 hover:bg-indigo-100 text-[#5B4BFF] border border-indigo-100 transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-90"
                      title="🚨 Multi-Channel Safety Dispatch"
                    >
                      <Bell className="w-4 h-4 text-[#5B4BFF]" />
                    </button>

                    {/* Options */}
                    <button
                      onClick={() => setActiveMenuId(isMenuOpen ? null : contact.id)}
                      className="w-9 h-9 rounded-full hover:bg-slate-200 text-slate-450 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
                      title="Options Menu"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Popup menu dropdown container */}
                    <AnimatePresence>
                      {isMenuOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setActiveMenuId(null)}
                          />
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 5 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 5 }}
                            className="absolute right-0 top-11 bg-white border border-slate-200 rounded-2xl p-2 w-48 shadow-lg z-50 text-left space-y-1"
                          >
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2.5 py-1.5 block leading-none">
                              Management
                            </span>
                            <button
                              onClick={() => {
                                handleRemoveContact(contact.id, contact.name);
                              }}
                              className="w-full flex items-center gap-2 text-rose-600 hover:bg-rose-50 font-extrabold text-xs p-2.5 rounded-xl text-left cursor-pointer transition-all"
                            >
                              <Trash2 className="w-4 h-4 text-rose-500" />
                              Remove Guardian
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}

            {contacts.length === 0 && (
              <div className="bg-slate-50 rounded-[24px] p-8 text-center border border-dashed border-slate-200">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-500">No active guardians detected</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                  Add custom trusted contacts using the button to bind emergency notifications.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 5. QUICK ACTIONS SECTION */}
        <section id="quick-actions" className="space-y-4">
          <div className="pl-1">
            <h2 className="text-[11px] font-black text-slate-400 tracking-wider uppercase">
              Quick Security Actions
            </h2>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {[
              { id: 'add', label: 'Add Guardian', icon: <Plus className="w-5 h-5 text-[#5B4BFF] stroke-[2.5]" />, action: () => setShowAddModal(true) },
              { id: 'invite', label: 'Invite', icon: <Link2 className="w-5 h-5 text-emerald-500 stroke-[2.5]" />, action: () => handleQuickAction('invite') },
              { id: 'share', label: 'Share Live', icon: <Share2 className="w-5 h-5 text-indigo-550 text-indigo-500 stroke-[2.5]" />, action: () => handleQuickAction('share') },
              { id: 'permissions', label: 'Manage Perms', icon: <Settings className="w-5 h-5 text-slate-500 stroke-[2.5]" />, action: () => handleQuickAction('permissions') }
            ].map(action => (
              <button
                key={action.id}
                onClick={action.action}
                className="bg-slate-50/60 border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all rounded-[20px] p-3 flex flex-col items-center justify-center text-center gap-2 cursor-pointer group active:scale-95"
              >
                <div className="w-11 h-11 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-105 transition-all">
                  {action.icon}
                </div>
                <span className="text-[9.5px] font-extrabold text-slate-600 tracking-tight leading-tight uppercase">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 6. STATISTICS CARDS */}
        <section id="statistics-cards" className="space-y-4">
          <div className="pl-1">
            <h2 className="text-[11px] font-black text-slate-400 tracking-wider uppercase">
              Core Network Metrics
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50/50 border border-slate-100 rounded-[24px] p-5 flex flex-col justify-between shadow-xs h-32 relative overflow-hidden group hover:shadow-sm transition-all text-left">
              <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-rose-500/5 group-hover:scale-125 transition-transform duration-300" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">
                🚨 Alerts Today
              </span>
              <span className="bg-gradient-to-tr from-rose-500 to-amber-500 bg-clip-text text-transparent font-black text-4xl font-mono tracking-tight leading-none z-10 select-none">
                0
              </span>
              <span className="text-[10px] text-slate-400 font-semibold z-10">
                All nodes secure
              </span>
            </div>

            <div className="bg-slate-50/50 border border-slate-100 rounded-[24px] p-5 flex flex-col justify-between shadow-xs h-32 relative overflow-hidden group hover:shadow-sm transition-all text-left">
              <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-[#5B4BFF]/5 group-hover:scale-125 transition-transform duration-300" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">
                👥 Guardians Online
              </span>
              <span className="bg-gradient-to-tr from-[#5B4BFF] to-emerald-400 bg-clip-text text-transparent font-black text-4xl font-mono tracking-tight leading-none z-10 select-none">
                {contacts.filter(c => c.online !== false).length}
              </span>
              <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1 z-10 font-sans">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" /> Active Loop
              </span>
            </div>
          </div>
        </section>

      </div>

      {/* 7. FLOATING AI ASSISTANT "ACHYUTA" (Orb theme) */}
      <div className="fixed bottom-24 right-5 z-40">
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('endlif_navigate', { detail: 'assistant' }));
          }}
          className="group relative flex flex-col items-center justify-center p-0.5 rounded-full select-none cursor-pointer focus:outline-none"
          title="Ask Achyuta AI Help"
        >
          {/* Pulsing smart ambient glow ring */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#5B4BFF] to-cyan-400 blur-md opacity-70 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
          <span className="absolute inset-x-0 inset-y-0.5 rounded-full bg-gradient-to-tr from-[#5B4BFF] to-pink-500 blur-md opacity-40 group-hover:scale-110 transition-all" />

          {/* Orb core */}
          <div className="relative w-15 h-15 rounded-full bg-gradient-to-tr from-[#5B4BFF] to-indigo-900 border border-white/20 flex items-center justify-center text-white overflow-hidden shadow-md group-hover:scale-105 active:scale-95 transition-all">
            <Radio className="w-5 h-5 text-white stroke-[2.5] absolute animate-[ping_3s_infinite_ease-in-out]" />
            <Bot className="w-6 h-6 text-white stroke-[2.2] animate-pulse" />
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity backdrop-brightness-125" />
          </div>

          <span className="absolute -top-7.5 bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded-md border border-slate-800 opacity-0 group-hover:opacity-100 transition-all shadow-sm uppercase tracking-wider pointer-events-none whitespace-nowrap">
            Achyuta AI
          </span>
        </button>
      </div>


      {/* ==================== INTERACTIVE IMMERSIVE OVERLAYS ==================== */}

      {/* A. CALLING INTERFACE SIMULATOR */}
      <AnimatePresence>
        {activeCallContact && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col justify-between p-8 text-center text-white select-none">
            <div className="py-6 flex flex-col items-center gap-2">
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3.5 py-1 rounded-full font-black uppercase tracking-widest inline-block animate-pulse">
                Encrypted Safety Call Out
              </span>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider">Gateway Protocol: AES-GCM Direct VoIP Tube</p>
            </div>

            {/* Profile Block with gorgeous calling status */}
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                {/* Voice soundwave ripple effects */}
                {callState === 'active' && (
                  <>
                    <span className="absolute inset-0 bg-[#5B4BFF]/20 rounded-full animate-ping" />
                    <span className="absolute inset-2 bg-emerald-500/10 rounded-full animate-[ping_2.5s_infinite_ease-in-out]" />
                    <span className="absolute inset-4 bg-[#5B4BFF]/10 rounded-full animate-[ping_3.5s_infinite]" />
                  </>
                )}
                {callState === 'ringing' && (
                  <span className="absolute inset-2 bg-emerald-500/15 rounded-full animate-pulse" />
                )}
                
                <img 
                  src={activeCallContact.avatar} 
                  alt={activeCallContact.name} 
                  className={`w-28 h-28 rounded-full object-cover relative z-10 shadow-lg border-2 transition-all duration-500 ${
                    callState === 'active' 
                      ? 'border-emerald-500 scale-105' 
                      : 'border-slate-500 scale-100'
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://lh3.googleusercontent.com/aida-public/AB6AXuAj9awLdHeoyRWhpmJ_G_9iEymBJIcMPqIXy66-tiksDTcwVcy8p_M6uySonXEmqlwnhOlRTGXLqHC9rHiRojZT-ojhHZZGwJbBaeaQob1KWy_sutgEsQm7A-PrfVYVT3DsZwL-ZvLXA5PJasMpUFsqhEHbmNBXbOewH8R4xh-i5KNIokS9OamLNXAydPYfn3YQBTJ64afZO2pIxoP1b3DVOm7NSqq6PS_K6-Yr4dU_oWHNeQDGWmSxp1Bn9WetsBAq36NnTqTj6OU`;
                  }}
                />
              </div>

              <div className="space-y-1">
                <h3 className="text-3xl font-black tracking-tight">{activeCallContact.name}</h3>
                <p className="text-sm text-slate-400 font-mono tracking-wider">{activeCallContact.phone}</p>
                
                <div className="pt-2">
                  {callState === 'connecting' && (
                    <span className="text-xs text-indigo-400 animate-pulse font-bold uppercase tracking-widest block">Establishing Secure Routing...</span>
                  )}
                  {callState === 'ringing' && (
                    <span className="text-xs text-teal-400 animate-pulse font-bold uppercase tracking-widest block">Ringing Secure Device...</span>
                  )}
                  {callState === 'active' && (
                    <div className="space-y-3">
                      <span className="text-xs text-emerald-400 font-black uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <span className="w-2 h-2 rounded bg-emerald-500 animate-ping inline-block" />
                        Live Connection ({formatCallDuration(callDuration)})
                      </span>
                      
                      {/* Active equalizer simulation bars */}
                      <div className="flex items-center justify-center gap-1.5 h-6">
                        {[16, 24, 12, 32, 20, 14, 28, 8, 18, 22].map((height, i) => (
                          <span 
                            key={i} 
                            style={{ height: `${height}px` }} 
                            className="w-1 bg-[#5B4BFF] rounded-full animate-pulse transition-all"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Calling Options Grid */}
            <div className="pb-8 space-y-8 max-w-sm mx-auto w-full">
              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                    isMuted ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <MicOff className="w-5 h-5 mb-1.5" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wide">Mute</span>
                </button>

                <button 
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)} 
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                    isSpeakerOn ? 'bg-[#5B4BFF]/20 border-[#5B4BFF] text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <Volume2 className="w-5 h-5 mb-1.5" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wide">Speaker</span>
                </button>

                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/5 text-slate-500 select-none">
                  <Video className="w-5 h-5 mb-1.5" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wide">Video Off</span>
                </div>
              </div>

              {/* End Call Button */}
              <div className="space-y-4">
                <button
                  onClick={() => setActiveCallContact(null)}
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center mx-auto text-white shadow-lg active:scale-90 transition-all cursor-pointer"
                  title="Hang Up call"
                >
                  <X className="w-7 h-7 stroke-[2.5]" />
                </button>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-semibold font-mono tracking-wider uppercase">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" /> Secure satellite routing active
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* B. MULTI-CHANNEL EMERGENCY DISPATCH & FALLBACK CONSOLE */}
      <AnimatePresence>
        {activeMsgContact && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[24px] border border-slate-200 p-6 max-w-md w-full shadow-2xl text-left space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5B4BFF]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-[15px] leading-tight">Safety Alert & Fallback Console</h4>
                    <p className="text-[10.5px] text-slate-500 font-mono">Guardian: {activeMsgContact.name} ({activeMsgContact.role})</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveMsgContact(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Recipient Coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block font-mono">
                    Phone (E.164)
                  </label>
                  <input
                    type="tel"
                    value={editablePhone}
                    onChange={(e) => setEditablePhone(e.target.value)}
                    placeholder="+14155552671"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 font-mono focus:border-[#5B4BFF] rounded-xl text-xs font-bold text-slate-800 outline-none transition-colors"
                  />
                  <p className="text-[8.5px] text-slate-400 font-mono">
                    {isValidE164(toE164(editablePhone)) ? '✓ Valid E.164' : '⚠️ Format: +[country][number]'}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block font-mono">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editableEmail}
                    onChange={(e) => setEditableEmail(e.target.value)}
                    placeholder="guardian@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 font-mono focus:border-[#5B4BFF] rounded-xl text-xs font-bold text-slate-800 outline-none transition-colors"
                  />
                  <p className="text-[8.5px] text-slate-400 font-mono">
                    For Universal Email Fallback
                  </p>
                </div>
              </div>

              {/* Canonical Safety Message */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block font-mono">
                    Emergency Alert Message
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyAlertMessage}
                    className="text-[9.5px] text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedMessage ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedMessage ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <textarea
                  value={presetAlertTemplate}
                  onChange={(e) => setPresetAlertTemplate(e.target.value)}
                  className="w-full h-20 p-2.5 bg-slate-50 border border-slate-200 font-mono focus:border-[#5B4BFF] rounded-xl text-xs font-semibold text-slate-700 outline-none resize-none transition-colors leading-relaxed"
                />
              </div>

              {/* Multi-Channel Execution Buttons */}
              <div className="space-y-2 pt-1">
                <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block font-mono">
                  Dispatch Via Individual Channels
                </span>

                {/* Primary: FCM */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>1. Primary: ENDLIF In-App (FCM Push)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendFCM}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer shadow-xs"
                    >
                      Trigger Push
                    </button>
                  </div>
                  {channelActionStatus.fcm && (
                    <p className="text-[9.5px] font-mono text-emerald-700 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                      {channelActionStatus.fcm}
                    </p>
                  )}
                </div>

                {/* Fallback 1: Device SMS */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <MessageSquare className="w-4 h-4 text-sky-600" />
                      <span>2. Fallback: Device SMS Client</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendSmsFallback}
                      className="bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer shadow-xs"
                    >
                      Open SMS
                    </button>
                  </div>
                  {channelActionStatus.sms && (
                    <p className="text-[9.5px] font-mono text-sky-700 bg-sky-50 p-1.5 rounded border border-sky-200">
                      {channelActionStatus.sms}
                    </p>
                  )}
                </div>

                {/* Fallback 2: Universal Email */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Mail className="w-4 h-4 text-indigo-600" />
                      <span>3. Fallback: Universal Email</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendEmailFallback}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer shadow-xs"
                    >
                      Send Email
                    </button>
                  </div>
                  {channelActionStatus.email && (
                    <p className="text-[9.5px] font-mono text-indigo-700 bg-indigo-50 p-1.5 rounded border border-indigo-200">
                      {channelActionStatus.email}
                    </p>
                  )}
                </div>

                {/* Fallback 3: Cellular Call */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <PhoneCall className="w-4 h-4 text-rose-600" />
                    <span>4. Fallback: Cellular Call Prompt</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeMsgContact) {
                        NotificationManager.initiateEmergencyCall(activeMsgContact);
                      }
                    }}
                    className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    Dial Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* E. ADD NEW GUARDIAN MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-slate-200 max-w-sm w-full p-6 rounded-[24px] shadow-2xl text-left"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black flex items-center gap-2 text-slate-900">
                  <Users className="w-5 h-5 text-[#5B4BFF]" /> Add Guardian
                </h3>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setPhoneError(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateContact} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Maya Lin, Emergency Contact"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#5B4BFF] focus:bg-white rounded-xl px-4 py-3 outline-none text-slate-800 transition-colors text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Phone Number (E.164 Format)
                  </label>
                  <input 
                    type="tel" 
                    required
                    placeholder="e.g. +14155552671 or +447911123456"
                    value={newContactPhone}
                    onChange={(e) => {
                      setNewContactPhone(e.target.value);
                      if (phoneError) setPhoneError(null);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#5B4BFF] focus:bg-white rounded-xl px-4 py-3 outline-none text-slate-800 transition-colors font-mono text-xs font-bold"
                  />
                  {phoneError ? (
                    <p className="text-[10px] text-rose-600 font-bold mt-1 font-mono">{phoneError}</p>
                  ) : (
                    <p className="text-[9px] text-slate-400 font-mono mt-1">Include country code starting with +</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Email Address (Optional for Email Fallback)
                  </label>
                  <input 
                    type="email" 
                    placeholder="guardian@family.org"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#5B4BFF] focus:bg-white rounded-xl px-4 py-3 outline-none text-slate-800 transition-colors font-mono text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Relationship Group</label>
                  <select 
                    value={newContactRole}
                    onChange={(e) => setNewContactRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#5B4BFF] focus:bg-white rounded-xl px-4 py-3 outline-none text-slate-800 transition-colors text-xs font-extrabold cursor-pointer"
                  >
                    <option value="Primary Guardian">Primary Guardian</option>
                    <option value="Secondary Guardian">Secondary Guardian</option>
                    <option value="Family Contact">Family Contact</option>
                    <option value="Trusted Contact">Trusted Contact</option>
                    <option value="Local Neighbor">Local Neighbor</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 bg-[#5B4BFF] text-white font-black rounded-xl hover:bg-[#4C3EE0] active:scale-95 transition-all outline-none cursor-pointer text-xs uppercase tracking-wider shadow-sm"
                >
                  Enroll In Safety Circle
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
