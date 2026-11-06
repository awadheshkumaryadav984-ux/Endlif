import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Award, 
  Sparkles, 
  Check, 
  Lock, 
  Trophy, 
  ChevronRight, 
  ChevronDown,
  Copy,
  Share2,
  Users,
  QrCode,
  Flame,
  Eye,
  EyeOff,
  UserCheck,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  Send,
  HeartHandshake,
  Compass,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Activity,
  Layers,
  Sparkle
} from 'lucide-react';
import { ShieldInfinityGuardStatue } from './GuardianStatue';
import { GuardianShareCardModal } from './GuardianShareCardModal';

interface GuardianTier {
  id: string;
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  glowColor: string;
  nextUnlock: string;
  recognition: string;
}

interface Achievement {
  id: string;
  title: string;
  desc: string;
  pointsReward: number;
  unlocked: boolean;
  progress: number;
}

interface LedgerEntry {
  id: string;
  timestamp: string;
  action: string;
  category: string;
  points: number;
  contactAlias?: string;
  status: 'verified' | 'flagged' | 'bonus';
  hash: string;
  note?: string;
}

interface LeaderboardItem {
  rank: number;
  name: string;
  alias: string;
  privacy: string;
  points: number;
  tier: string;
  color: string;
  activations: number;
  displayName: string;
  isUser?: boolean;
}

export default function CreatorHubView() {
  // --- Profile State ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [points, setPoints] = useState<number>(2850);
  const [guardianName, setGuardianName] = useState<string>('Adele Vance');
  const [guardianAlias, setGuardianAlias] = useState<string>('Sentinel-882');
  const [privacyMode, setPrivacyMode] = useState<'alias' | 'name' | 'hidden'>('alias');
  const [currentRank, setCurrentRank] = useState<GuardianTier>({
    id: 'silver',
    name: 'Silver Guardian',
    minPoints: 2500,
    maxPoints: 4999,
    color: '#e2e8f0',
    glowColor: 'rgba(226,232,240,0.5)',
    nextUnlock: 'Gold Attestation Shield & Emergency Circle Beacon at 5,000 PTS',
    recognition: 'Community Sentinel Guardian'
  });
  const [nextRank, setNextRank] = useState<GuardianTier | null>(null);
  const [percentageToNext, setPercentageToNext] = useState<number>(14);
  const [pointsRemaining, setPointsRemaining] = useState<number>(2150);
  const [allTiers, setAllTiers] = useState<GuardianTier[]>([]);
  const [referralCode, setReferralCode] = useState<string>('ENDLIF-SAFE-8821');
  const [referralLink, setReferralLink] = useState<string>('https://endlif.app/join/ENDLIF-SAFE-8821');
  const [referralsCount, setReferralsCount] = useState<number>(4);
  const [monthlyReferrals, setMonthlyReferrals] = useState<number>(2);
  const [streakProgress, setStreakProgress] = useState<{ current: number; target: number; bonus: number; remaining: number }>({
    current: 2,
    target: 3,
    bonus: 500,
    remaining: 1
  });
  const [trustedContactsVerified, setTrustedContactsVerified] = useState<number>(3);
  const [checkInStreak, setCheckInStreak] = useState<number>(7);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [claimedStatues, setClaimedStatues] = useState<string[]>(['blue_guardian']);
  const [claimedRewards, setClaimedRewards] = useState<string[]>(['creator_badge']);
  const [fraudAttemptsBlocked, setFraudAttemptsBlocked] = useState<number>(2);

  // --- UI Section Tabs & States ---
  const [activeTab, setActiveTab] = useState<'roadmap' | 'referral' | 'chamber' | 'leaderboard' | 'ledger'>('roadmap');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [leaderboardList, setLeaderboardList] = useState<LeaderboardItem[]>([]);
  const [userPosition, setUserPosition] = useState<{ rank: number; points: number; tier: string; color: string } | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [showInviteQuickSheet, setShowInviteQuickSheet] = useState<boolean>(false);
  const [inviteTargetName, setInviteTargetName] = useState<string>('');

  // Toast notification helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([25]);
    }
  };

  // Fetch Guardian Profile from real backend API
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/guardian/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setPoints(d.points);
        setGuardianName(d.name);
        setGuardianAlias(d.alias);
        setPrivacyMode(d.privacyMode);
        setCurrentRank(d.rank);
        setNextRank(d.nextRank);
        setPercentageToNext(d.percentageToNext);
        setPointsRemaining(d.pointsRemaining);
        setAllTiers(d.allTiers || []);
        setReferralCode(d.referralCode);
        setReferralLink(d.referralLink);
        setReferralsCount(d.referralsCount);
        setMonthlyReferrals(d.monthlyReferrals);
        setStreakProgress(d.streakProgress);
        setTrustedContactsVerified(d.trustedContactsVerified);
        setCheckInStreak(d.checkInStreak);
        setAchievements(d.achievements || []);
        setClaimedStatues(d.claimedStatues || []);
        setClaimedRewards(d.claimedRewards || []);
        setFraudAttemptsBlocked(d.fraudAttemptsBlocked || 0);
      }
    } catch (err: any) {
      console.error('Error loading Guardian profile:', err);
      setError('Could not connect to Guardian live telemetry. Operating in resilient offline mode.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Leaderboard
  const fetchLeaderboard = useCallback(async (period: 'weekly' | 'monthly') => {
    try {
      const res = await fetch(`/api/guardian/leaderboard?period=${period}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.success) {
        setLeaderboardList(json.leaderboard || []);
        setUserPosition(json.userPosition || null);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  }, []);

  // Fetch Ledger History
  const fetchLedger = useCallback(async () => {
    try {
      const res = await fetch('/api/guardian/ledger');
      if (!res.ok) return;
      const json = await res.json();
      if (json.success) {
        setLedgerEntries(json.ledger || []);
      }
    } catch (err) {
      console.error('Error fetching ledger:', err);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchLeaderboard(leaderboardPeriod);
    fetchLedger();
  }, [fetchProfile, fetchLeaderboard, fetchLedger, leaderboardPeriod]);

  // Update Privacy Setting
  const updatePrivacy = async (mode: 'alias' | 'name' | 'hidden') => {
    try {
      setPrivacyMode(mode);
      const res = await fetch('/api/guardian/privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      if (res.ok) {
        triggerToast(`🛡️ Privacy updated: Appearing as ${mode === 'alias' ? guardianAlias : mode === 'name' ? guardianName : 'Anonymous Guardian'}`);
        fetchLeaderboard(leaderboardPeriod);
      }
    } catch {
      triggerToast('⚠️ Unable to save privacy preference.');
    }
  };

  // 1-Tap Copy Referral Code or Link
  const copyReferral = (text: string, label: string) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      triggerToast(`✓ ${label} copied to clipboard!`);
    }
  };

  // Launch Native Share
  const handleShareInvite = async () => {
    const shareMessage = `I'm using Endlif to stay protected with real-time safety check-ins and verified SOS circle. Join my trusted network: ${referralLink}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Endlif Guardian Circle',
          text: shareMessage,
          url: referralLink,
        });
      } catch {
        // User dismissed
      }
    } else {
      copyReferral(referralLink, 'Safety Invite Link');
    }
  };

  // Send Direct SMS Invite
  const handleSmsInvite = (customName?: string) => {
    const namePart = customName ? `Hey ${customName}, ` : `Hey, `;
    const text = `${namePart}I'm using Endlif to protect myself and loved ones with verified safety check-ins and emergency circle SOS. Join my trusted Guardian Circle here: ${referralLink}`;
    window.location.href = `sms:?body=${encodeURIComponent(text)}`;
  };

  // Verify Genuine Activation Step via Backend
  const handleVerifyStep = async (stepType: string, contactAlias?: string, isFraud = false, fraudReason?: string) => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/guardian/referral/verify-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepType,
          contactAlias: contactAlias || 'Verified Citizen Contact',
          isFraudSimulation: isFraud,
          fraudReason
        })
      });
      const data = await res.json();
      if (data.fraudBlocked) {
        triggerToast(`🛑 Fraud Shield Blocked: ${data.message}`);
      } else if (data.success) {
        let msg = `🎉 Genuine Activation Verified: +${data.awardedPoints} Safety PTS awarded!`;
        if (data.streakBonus > 0) {
          msg += ` 🔥 STREAK MILESTONE HIT! +${data.streakBonus} BONUS PTS!`;
        }
        triggerToast(msg);
      }
      fetchProfile();
      fetchLeaderboard(leaderboardPeriod);
      fetchLedger();
    } catch {
      triggerToast('Verification error encountered.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Claim Chamber Statue
  const claimStatue = async (statueId: string, name: string, reqPoints: number) => {
    if (points < reqPoints) {
      triggerToast(`⚠️ Insufficient Points! Need ${reqPoints.toLocaleString()} PTS. You have ${points.toLocaleString()} PTS.`);
      return;
    }
    if (claimedStatues.includes(statueId)) {
      triggerToast(`✓ "${name}" statue is already shining in your chamber.`);
      return;
    }
    try {
      const res = await fetch('/api/guardian/claim-statue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statueId, reqPoints })
      });
      if (res.ok) {
        setClaimedStatues(prev => [...prev, statueId]);
        triggerToast(`🎉 Statue Attestation Unlocked! "${name}" figurine is now enshrined in your chamber.`);
      }
    } catch {
      triggerToast('Unable to connect to Chamber ledger.');
    }
  };

  // Claim Identity Feature / Profile Reward
  const claimReward = async (rewardId: string, cost: number, name: string) => {
    if (points < cost) {
      triggerToast(`⚠️ Insufficient Points! "${name}" costs ${cost} PTS. You have ${points.toLocaleString()} PTS.`);
      return;
    }
    try {
      const res = await fetch('/api/guardian/claim-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId, cost })
      });
      const data = await res.json();
      if (data.success) {
        setClaimedRewards(data.claimedRewards);
        setPoints(data.remainingPoints);
        triggerToast(`🛡️ Recognition Unlocked: "${name}". Active in your public safety profile.`);
        fetchProfile();
      }
    } catch {
      triggerToast('Unable to redeem reward.');
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col p-4 sm:p-6 pb-32 max-w-[600px] mx-auto w-full mt-14 text-slate-100 z-10 relative font-sans"
      id="endlif-guardian-hub-view"
    >
      
      {/* 1. TOP HEADER & MOVEMENT IDENTITY */}
      <div className="mb-5 flex items-center justify-between">
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono font-black tracking-widest text-indigo-400 uppercase bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-900/60">
              GUARDIAN HUB
            </span>
            <span className="text-[8px] font-mono font-bold tracking-wider text-emerald-400 uppercase bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40">
              SAFETY MOVEMENT
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            Community Guardian Hub
          </h2>
          <p className="text-[11px] text-slate-400 font-medium">
            Protect people, invite contacts safely, and unlock certified recognition.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="h-9 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
            title="Generate Shareable Guardian Card"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Share Card</span>
          </button>
        </div>
      </div>

      {/* 2. GUARDIAN PROGRESS HERO CARD */}
      <div 
        className="bg-slate-900/80 border border-slate-800 rounded-[28px] p-5 shadow-2xl space-y-4 text-left relative overflow-hidden backdrop-blur-md"
        style={{
          boxShadow: `0 10px 35px -10px ${currentRank.glowColor}`
        }}
      >
        {/* Background radial glow */}
        <div 
          className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: currentRank.color }}
        />

        {/* Top Status Line: "You are a Guardian" */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="space-y-0.5">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 block">
              Safety Mesh Status
            </span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-white tracking-tight">
                You are a <span style={{ color: currentRank.color }}>{currentRank.name}</span>
              </span>
              <div 
                className="w-2.5 h-2.5 rounded-full animate-ping"
                style={{ backgroundColor: currentRank.color }}
              />
            </div>
          </div>

          {/* Current Rank Badge */}
          <div 
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[10px] font-mono font-black uppercase tracking-wider"
            style={{
              backgroundColor: `${currentRank.color}15`,
              borderColor: `${currentRank.color}40`,
              color: currentRank.color
            }}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{currentRank.name}</span>
          </div>
        </div>

        {/* Points Display & Attestation Tag */}
        <div className="bg-slate-950/90 border border-slate-850 rounded-2xl p-4 flex items-center justify-between relative">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-black text-indigo-400 tracking-wider uppercase block">
              VERIFIED SAFETY POINTS
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono tracking-tight">
                {points.toLocaleString()}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">PTS</span>
            </div>
            
            <div className="pt-1 text-[10px] font-bold text-slate-400 font-sans flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 flex items-center justify-center text-black">
                <Check className="w-1.5 h-1.5 stroke-[4]" />
              </div>
              <span>Recognition:</span>
              <span className="text-emerald-400 font-mono font-bold">{currentRank.recognition}</span>
            </div>
          </div>

          <div className="text-right space-y-1">
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="h-8 px-3 bg-indigo-600 hover:bg-indigo-550 text-white font-mono font-black text-[9px] tracking-wider uppercase rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm shadow-indigo-950/40 flex items-center gap-1.5"
            >
              <QrCode className="w-3 h-3" />
              <span>Attestation Card</span>
            </button>
            <span className="text-[8px] font-mono text-slate-500 block">
              {fraudAttemptsBlocked} Fraud Blocks Recorded
            </span>
          </div>
        </div>

        {/* Animated Progress Bar & Percentage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-bold">Progress to {nextRank ? nextRank.name : 'Max Level'}:</span>
              <span className="font-black text-white">{percentageToNext}%</span>
            </div>
            {nextRank && (
              <span className="text-indigo-300 font-bold text-[10px]">
                {pointsRemaining.toLocaleString()} PTS remaining
              </span>
            )}
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-3 bg-slate-950 rounded-full border border-slate-800/80 p-0.5 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentageToNext}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full transition-all"
              style={{
                backgroundColor: currentRank.color,
                boxShadow: `0 0 10px ${currentRank.glowColor}`
              }}
            />
          </div>

          {/* Next Unlock Preview */}
          <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-2.5 flex items-center gap-2.5 text-left">
            <div className="w-6 h-6 rounded-lg bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[8.5px] font-mono uppercase text-slate-400 block font-bold">
                Next Milestone Unlock
              </span>
              <p className="text-[10px] text-indigo-200 font-sans font-medium line-clamp-1 truncate">
                {currentRank.nextUnlock}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN SECTION NAVIGATION TABS */}
      <div className="my-5 flex items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-850 overflow-x-auto no-scrollbar">
        {[
          { id: 'roadmap', label: '7 Ranks', icon: Layers },
          { id: 'referral', label: 'Invite & Protect', icon: HeartHandshake },
          { id: 'chamber', label: 'Chamber & Badges', icon: Trophy },
          { id: 'leaderboard', label: 'Leaderboard', icon: Award },
          { id: 'ledger', label: 'Ledger', icon: FileCheck2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[90px] py-2 px-2.5 rounded-xl font-mono text-[9.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 7 CLEAR GUARDIAN LEVELS ROADMAP */}
      {/* ========================================================================= */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4 animate-fade-in text-left">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-mono font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-400" />
                7-TIER GUARDIAN ROADMAP
              </h3>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                Milestones rooted in genuine safety network establishment.
              </p>
            </div>
            <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
              Rank: {currentRank.name}
            </span>
          </div>

          {/* 7 Levels List */}
          <div className="space-y-2.5">
            {[
              { id: 'guardian', name: 'Guardian', range: '0 – 999 PTS', min: 0, color: '#38bdf8', unlock: 'Registered Citizen Guardian & Standard SOS Mesh' },
              { id: 'bronze', name: 'Bronze Guardian', range: '1,000 – 2,499 PTS', min: 1000, color: '#f59e0b', unlock: 'Bronze Attestation Crest & Halo Badge' },
              { id: 'silver', name: 'Silver Guardian', range: '2,500 – 4,999 PTS', min: 2500, color: '#e2e8f0', unlock: 'Silver Sentinel Frame & Circle Priority Beacon' },
              { id: 'gold', name: 'Gold Guardian', range: '5,000 – 9,999 PTS', min: 5000, color: '#eab308', unlock: 'Gold Attestation Shield & Emergency Circle Beacon' },
              { id: 'elite', name: 'Guardian Elite', range: '10,000 – 24,999 PTS', min: 10000, color: '#818cf8', unlock: 'Cyber-Aegis Voice Dispatch Pack & Green Guardian Statue' },
              { id: 'champion', name: 'Guardian Champion', range: '25,000 – 49,999 PTS', min: 25000, color: '#f43f5e', unlock: 'Champion Crest, Red Champion Statue & Regional Beacon' },
              { id: 'legend', name: 'Guardian Legend', range: '50,000+ PTS', min: 50000, color: '#a855f7', unlock: 'Supreme Hall of Honor & Purple Legend Statue' }
            ].map((tier, idx) => {
              const isCurrent = currentRank.id === tier.id;
              const isAchieved = points >= tier.min;

              return (
                <div 
                  key={tier.id}
                  className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden ${
                    isCurrent 
                      ? 'bg-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-950/40' 
                      : isAchieved 
                        ? 'bg-slate-950/80 border-slate-800' 
                        : 'bg-slate-950/40 border-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs border"
                        style={{
                          backgroundColor: `${tier.color}18`,
                          borderColor: `${tier.color}44`,
                          color: tier.color
                        }}
                      >
                        {idx + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white font-sans">
                            {tier.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[8px] font-mono font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-1.5 py-0.2 rounded">
                              CURRENT RANK
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                          {tier.range}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      {isAchieved ? (
                        <span className="text-[9px] font-mono font-bold text-emerald-400 flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          UNLOCKED
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono font-bold text-slate-500 flex items-center gap-1 justify-end">
                          <Lock className="w-3 h-3" />
                          LOCKED
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[9.5px] text-slate-400 font-sans mt-2 pt-2 border-t border-slate-900 line-clamp-1">
                    <span className="text-slate-500 font-mono">Unlock:</span> {tier.unlock}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REFERRAL & SAFETY ACTIVATION */}
      {/* ========================================================================= */}
      {activeTab === 'referral' && (
        <div className="space-y-5 animate-fade-in text-left">
          
          {/* Main CTA Hero */}
          <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/20 rounded-[28px] p-5 shadow-xl space-y-4 relative overflow-hidden">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-900/60 inline-block">
                PRIMARY SAFETY MISSION
              </span>
              <h3 className="text-xl font-black text-white tracking-tight">
                Invite Someone. Help Protect Someone.
              </h3>
              <p className="text-[11px] text-slate-300 font-sans">
                Each verified contact brings mutual emergency SOS, automated check-in escalation, and real-time community protection.
              </p>
            </div>

            {/* Unique Referral Code & Link Box */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[8.5px] font-mono uppercase text-slate-400 font-bold">
                  Your Unique Referral Code
                </span>
                <span className="text-[8px] font-mono text-emerald-400 font-bold">
                  ✓ Verified Attested Link
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                <span className="font-mono font-black text-sm text-indigo-300 tracking-wider">
                  {referralCode}
                </span>
                <button
                  type="button"
                  onClick={() => copyReferral(referralCode, 'Referral Code')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>

              {/* 4 Action Buttons: Copy, Share, Invite, Track */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => copyReferral(referralLink, 'Referral Link')}
                  className="h-9 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-xl text-[9px] font-mono font-bold uppercase flex items-center justify-center gap-1 transition-all cursor-pointer"
                  title="Copy Full Link"
                >
                  <Copy className="w-3 h-3 text-slate-400" />
                  <span>Copy</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareInvite}
                  className="h-9 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/20 rounded-xl text-[9px] font-mono font-bold uppercase flex items-center justify-center gap-1 transition-all cursor-pointer"
                  title="Native System Share"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Share</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowInviteQuickSheet(true)}
                  className="h-9 bg-sky-600 hover:bg-sky-550 text-white rounded-xl text-[9px] font-mono font-bold uppercase flex items-center justify-center gap-1 transition-all shadow-md shadow-sky-950/40 cursor-pointer"
                  title="Invite via SMS or Share"
                >
                  <Send className="w-3 h-3" />
                  <span>Invite</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('ledger')}
                  className="h-9 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl text-[9px] font-mono font-bold uppercase flex items-center justify-center gap-1 transition-all cursor-pointer"
                  title="Track Activation Milestones"
                >
                  <Activity className="w-3 h-3 text-slate-400" />
                  <span>Track</span>
                </button>
              </div>
            </div>
          </div>

          {/* GUARDIAN MONTHLY STREAK CARD */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-black text-amber-300 uppercase tracking-wider">
                    GUARDIAN STREAK
                  </h4>
                  <span className="text-[9px] text-slate-400 font-sans block">
                    Monthly Community Growth Milestones
                  </span>
                </div>
              </div>

              <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-900/40">
                {monthlyReferrals} this month
              </span>
            </div>

            {/* Streak Milestone Indicators */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { count: 3, bonus: 500, achieved: monthlyReferrals >= 3 },
                { count: 5, bonus: 1000, achieved: monthlyReferrals >= 5 },
                { count: 10, bonus: 2500, achieved: monthlyReferrals >= 10 }
              ].map((ms) => (
                <div 
                  key={ms.count}
                  className={`p-2 rounded-xl border transition-all ${
                    ms.achieved 
                      ? 'bg-amber-950/20 border-amber-500/40 text-amber-300' 
                      : 'bg-slate-950/70 border-slate-850 text-slate-400'
                  }`}
                >
                  <span className="text-[9px] font-mono font-black block">
                    {ms.count} Referrals
                  </span>
                  <span className={`text-[10px] font-mono font-bold block mt-0.5 ${ms.achieved ? 'text-amber-400' : 'text-slate-500'}`}>
                    +{ms.bonus.toLocaleString()} PTS
                  </span>
                  <span className="text-[7.5px] font-mono uppercase block mt-1">
                    {ms.achieved ? '✓ EARNED' : `${Math.max(0, ms.count - monthlyReferrals)} to go`}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-400">Next Streak Bonus:</span>
              <span className="text-amber-300 font-bold">
                {streakProgress.remaining > 0 
                  ? `${streakProgress.remaining} more referral${streakProgress.remaining > 1 ? 's' : ''} for +${streakProgress.bonus} PTS`
                  : 'All Monthly Milestones Complete!'}
              </span>
            </div>
          </div>

          {/* VERIFIED GENUINE ACTIVATION CRITERIA */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-mono font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
                  REWARD ONLY VERIFIED GENUINE ACTIVATION
                </h4>
                <p className="text-[9.5px] text-slate-400 font-sans mt-0.5">
                  Endlif never rewards installation alone. Network security requires real readiness.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { type: 'referral_signup', title: 'Successful Referral', pts: '+400 PTS', desc: 'Account verified, identity confirmed, and phone validated.', icon: Users },
                { type: 'safety_setup', title: 'Safety Setup Completed', pts: '+200 PTS', desc: 'SOS trigger attested & location permissions safely granted.', icon: Shield },
                { type: 'contact_added', title: 'Trusted Contact Added', pts: '+300 PTS', desc: 'Mutual safety circle anchor established with emergency fallback.', icon: HeartHandshake },
                { type: 'seven_day_active', title: 'Active for 7 Days', pts: '+500 PTS', desc: 'Sustained civilian safety check-in readiness verified over 7 days.', icon: Activity }
              ].map((act) => {
                const Icon = act.icon;
                return (
                  <div 
                    key={act.type}
                    className="p-3 bg-slate-950/80 border border-slate-850 rounded-xl flex items-center justify-between hover:border-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-950/50 border border-indigo-900/50 flex items-center justify-center text-indigo-300 shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-white block leading-tight">
                          {act.title}
                        </span>
                        <span className="text-[8.5px] text-slate-400 font-sans block mt-0.5">
                          {act.desc}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-black text-xs text-emerald-400 block">
                        {act.pts}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Anti-Fraud Shield Statement */}
            <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-3 flex items-start gap-2.5 text-left">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-[9px] text-rose-300/90 font-sans leading-relaxed">
                <span className="font-bold text-rose-300 font-mono block uppercase">Automated Fraud Shield Active:</span>
                Duplicate devices, self-referrals, suspicious device fingerprints, or empty unverified downloads are automatically flagged and awarded 0 points.
              </div>
            </div>
          </div>

          {/* INTERACTIVE VERIFICATION TEST DECK */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-mono font-black text-indigo-400 uppercase tracking-wider block">
                [ VERIFICATION & ANTI-FRAUD TEST BENCH ]
              </span>
              <span className="text-[8px] font-mono text-slate-500">Live API Endpoint Simulator</span>
            </div>

            <p className="text-[10px] text-slate-400">
              Test how Endlif's backend validates genuine activations and shuts down spoofed installs in real time:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isVerifying}
                onClick={() => handleVerifyStep('referral_signup', 'Dr. Sarah M.')}
                className="p-2 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-xl text-[9px] font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                <span>+400 Referral Signup</span>
              </button>

              <button
                type="button"
                disabled={isVerifying}
                onClick={() => handleVerifyStep('safety_setup', 'Dr. Sarah M.')}
                className="p-2 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-xl text-[9px] font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Shield className="w-3 h-3 text-indigo-400" />
                <span>+200 Safety Setup</span>
              </button>

              <button
                type="button"
                disabled={isVerifying}
                onClick={() => handleVerifyStep('contact_added', 'Marcus T.')}
                className="p-2 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-xl text-[9px] font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Users className="w-3 h-3 text-indigo-400" />
                <span>+300 Contact Added</span>
              </button>

              <button
                type="button"
                disabled={isVerifying}
                onClick={() => handleVerifyStep('simulate_fraud', 'Spoofed Device #912', true, 'Duplicate device ID & self-referral spoof detected')}
                className="p-2 bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 border border-rose-900/40 rounded-xl text-[9px] font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>Test Fraud Detection</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GUARDIAN AWARD CHAMBER & ACHIEVEMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'chamber' && (
        <div className="space-y-6 animate-fade-in text-left">
          
          {/* AWARD CHAMBER STATUES GRID */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-[28px] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-xs font-black text-indigo-300 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <Trophy className="w-4 h-4 text-indigo-400" />
                GUARDIAN AWARD CHAMBER
              </h3>
              <span className="text-[8px] font-mono font-bold uppercase text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/40">
                Verified Chamber Figurines
              </span>
            </div>

            <p className="text-[10px] text-slate-400 font-sans">
              Cryptographically verified citizen milestone statues displayed on glowing holographic pedestals.
            </p>

            {/* Visual Statues Grid */}
            <div className="grid grid-cols-3 gap-3">
              
              {/* FIGURINE 1: Green Guardian Statue */}
              <div className="bg-slate-950/90 border border-slate-850 rounded-2xl p-2.5 flex flex-col items-center justify-between relative overflow-hidden">
                <div className="w-full flex items-center justify-center">
                  <ShieldInfinityGuardStatue color="emerald" isUnlocked={claimedStatues.includes('green_impact')} />
                </div>
                <div className="text-center w-full mt-2 space-y-1.5 z-10">
                  <div>
                    <span className="block text-[10px] font-black text-white uppercase leading-tight">Green Guardian</span>
                    <span className="text-[8px] font-mono font-bold text-slate-500 uppercase mt-0.5 block">Req: 10,000 PTS</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => claimStatue('green_impact', 'Green Guardian Statue', 10000)}
                    className={`w-full h-7 text-[8.5px] font-black uppercase rounded-lg border transition-all cursor-pointer ${
                      claimedStatues.includes('green_impact') 
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 cursor-default' 
                        : points >= 10000 
                          ? 'bg-emerald-600 hover:bg-emerald-550 text-white border-emerald-500' 
                          : 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {claimedStatues.includes('green_impact') ? 'ACTIVE ●' : points >= 10000 ? 'CLAIM STATUE' : 'LOCKED'}
                  </button>
                </div>
              </div>

              {/* FIGURINE 2: Red Champion Statue */}
              <div className="bg-slate-950/90 border border-slate-850 rounded-2xl p-2.5 flex flex-col items-center justify-between relative overflow-hidden">
                <div className="w-full flex items-center justify-center">
                  <ShieldInfinityGuardStatue color="red" isUnlocked={claimedStatues.includes('red_champion')} />
                </div>
                <div className="text-center w-full mt-2 space-y-1.5 z-10">
                  <div>
                    <span className="block text-[10px] font-black text-white uppercase leading-tight">Red Champion</span>
                    <span className="text-[8px] font-mono font-bold text-slate-500 uppercase mt-0.5 block">Req: 50,000 PTS</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => claimStatue('red_champion', 'Red Champion Statue', 50000)}
                    className={`w-full h-7 text-[8.5px] font-black uppercase rounded-lg border transition-all cursor-pointer ${
                      claimedStatues.includes('red_champion') 
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-400 cursor-default' 
                        : points >= 50000 
                          ? 'bg-rose-600 hover:bg-rose-550 text-white border-rose-500' 
                          : 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {claimedStatues.includes('red_champion') ? 'ACTIVE ●' : points >= 50000 ? 'CLAIM STATUE' : 'LOCKED'}
                  </button>
                </div>
              </div>

              {/* FIGURINE 3: Purple Legend Statue */}
              <div className="bg-slate-950/90 border border-slate-850 rounded-2xl p-2.5 flex flex-col items-center justify-between relative overflow-hidden">
                <div className="w-full flex items-center justify-center">
                  <ShieldInfinityGuardStatue color="purple" isUnlocked={claimedStatues.includes('purple_legend')} />
                </div>
                <div className="text-center w-full mt-2 space-y-1.5 z-10">
                  <div>
                    <span className="block text-[10px] font-black text-white uppercase leading-tight">Purple Legend</span>
                    <span className="text-[8px] font-mono font-bold text-slate-500 uppercase mt-0.5 block">Req: 100,000 PTS</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => claimStatue('purple_legend', 'Purple Legend Statue', 100000)}
                    className={`w-full h-7 text-[8.5px] font-black uppercase rounded-lg border transition-all cursor-pointer ${
                      claimedStatues.includes('purple_legend') 
                        ? 'bg-fuchsia-950/40 border-fuchsia-500/40 text-fuchsia-400 cursor-default' 
                        : points >= 100000 
                          ? 'bg-fuchsia-600 hover:bg-fuchsia-550 text-white border-fuchsia-500' 
                          : 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {claimedStatues.includes('purple_legend') ? 'ACTIVE ●' : points >= 100000 ? 'CLAIM STATUE' : 'LOCKED'}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* MEANINGFUL ACHIEVEMENTS LIST */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-[28px] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-xs font-black text-indigo-300 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <Award className="w-4 h-4 text-indigo-400" />
                GUARDIAN ACHIEVEMENTS
              </h3>
              <span className="text-[8px] font-mono font-bold text-slate-400">
                {achievements.filter(a => a.unlocked).length} of {achievements.length} UNLOCKED
              </span>
            </div>

            <div className="space-y-2.5">
              {achievements.map((ach) => (
                <div 
                  key={ach.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    ach.unlocked 
                      ? 'bg-slate-950/90 border-emerald-500/30 shadow-xs' 
                      : 'bg-slate-950/40 border-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                        ach.unlocked 
                          ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400' 
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}>
                        {ach.unlocked ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">
                            {ach.title}
                          </span>
                          <span className="text-[8px] font-mono font-bold text-indigo-400 bg-indigo-950/40 px-1.5 py-0.2 rounded border border-indigo-900/40">
                            +{ach.pointsReward} PTS
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-sans block mt-0.5">
                          {ach.desc}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[9px] font-mono font-black uppercase ${ach.unlocked ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {ach.unlocked ? 'COMPLETE' : `${Math.round(ach.progress * 100)}%`}
                    </span>
                  </div>

                  {/* Achievement Progress Bar if in progress */}
                  {!ach.unlocked && (
                    <div className="w-full h-1.5 bg-slate-900 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${Math.round(ach.progress * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* REPUTATION & RECOGNITION STORE (No Gambling, Only Safety Identity) */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-[28px] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-xs font-black text-indigo-300 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <Sparkle className="w-4 h-4 text-indigo-400" />
                GUARDIAN RECOGNITION & IDENTITY
              </h3>
              <span className="text-[8px] font-mono text-slate-500">Identity & Safety Assets</span>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'creator_badge', cost: 400, name: 'Attested Guardian Shield Badge', desc: 'Glowing verified shield badge on safety profile.' },
                { id: 'sentinel_frame', cost: 750, name: 'Neon Sentinel Profile Frame', desc: 'Futuristic cryptographic ring around your safety avatar.' },
                { id: 'priority_beacon', cost: 1200, name: 'Civilian Safety Beacon Accolade', desc: 'High-visibility beacon priority in neighborhood alerts.' },
                { id: 'dispatch_voice', cost: 2000, name: 'Custom Tactical SOS Tone Frequency', desc: 'High-frequency emergency audio pack tuned for crowd alerting.' }
              ].map((item) => {
                const isClaimed = claimedRewards.includes(item.id);
                return (
                  <div 
                    key={item.id} 
                    className="bg-slate-950/80 p-3 rounded-xl border border-slate-850 flex items-center justify-between hover:border-slate-800 transition-colors"
                  >
                    <div className="text-left pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{item.name}</span>
                        {isClaimed && (
                          <span className="text-[8px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-900/40">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <span className="text-[8.5px] text-slate-400 font-sans block mt-0.5">{item.desc}</span>
                    </div>

                    <button 
                      type="button" 
                      disabled={isClaimed}
                      onClick={() => claimReward(item.id, item.cost, item.name)}
                      className={`px-3 h-8 font-black rounded-lg text-[9px] uppercase tracking-wider font-mono border transition-all cursor-pointer shrink-0 ${
                        isClaimed 
                          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400 cursor-default' 
                          : 'bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white border-indigo-500/20'
                      }`}
                    >
                      {isClaimed ? 'CLAIMED' : `${item.cost.toLocaleString()} PTS`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LEADERBOARD & PRIVACY OPTIONS */}
      {/* ========================================================================= */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4 animate-fade-in text-left">
          
          {/* Period Toggle & Privacy Selector */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-850">
                <button
                  type="button"
                  onClick={() => setLeaderboardPeriod('weekly')}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-black uppercase transition-all cursor-pointer ${
                    leaderboardPeriod === 'weekly' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  onClick={() => setLeaderboardPeriod('monthly')}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-black uppercase transition-all cursor-pointer ${
                    leaderboardPeriod === 'monthly' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
              </div>

              {/* Privacy Setting Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[8.5px] font-mono text-slate-400 uppercase hidden sm:inline">Privacy:</span>
                <select
                  value={privacyMode}
                  onChange={(e) => updatePrivacy(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 text-[9px] font-mono font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="alias">Alias ({guardianAlias})</option>
                  <option value="name">First Name ({guardianName})</option>
                  <option value="hidden">Hidden (Anonymous)</option>
                </select>
              </div>
            </div>

            {/* "YOUR POSITION" Sticky Card */}
            {userPosition && (
              <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-mono font-black text-xs text-white shadow-sm">
                    #{userPosition.rank}
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase text-indigo-300 font-bold block">
                      Your Position ({leaderboardPeriod === 'weekly' ? 'Weekly' : 'Monthly'})
                    </span>
                    <span className="text-xs font-black text-white block">
                      {privacyMode === 'name' ? guardianName : privacyMode === 'alias' ? guardianAlias : 'Anonymous Guardian'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-black text-xs text-emerald-400 block">
                    {userPosition.points.toLocaleString()} PTS
                  </span>
                  <span className="text-[8px] font-mono text-slate-400 block">
                    {userPosition.tier}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Standings List */}
          <div className="space-y-2">
            {leaderboardList.map((entry) => {
              const isUser = entry.isUser;
              return (
                <div
                  key={`${entry.rank}-${entry.alias}`}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    isUser 
                      ? 'bg-slate-900 border-indigo-500/40 shadow-sm' 
                      : 'bg-slate-950/70 border-slate-850 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 text-center font-mono font-black text-xs ${
                      entry.rank === 1 ? 'text-amber-400' : entry.rank === 2 ? 'text-slate-300' : entry.rank === 3 ? 'text-amber-600' : 'text-slate-500'
                    }`}>
                      #{entry.rank}
                    </span>

                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center border font-mono font-bold text-[10px]"
                      style={{
                        backgroundColor: `${entry.color}15`,
                        borderColor: `${entry.color}33`,
                        color: entry.color
                      }}
                    >
                      <Shield className="w-3.5 h-3.5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-black ${isUser ? 'text-indigo-300' : 'text-white'}`}>
                          {entry.displayName}
                        </span>
                        {isUser && (
                          <span className="text-[7.5px] font-mono uppercase bg-indigo-500/20 text-indigo-300 px-1 py-0.2 rounded border border-indigo-400/20">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[8.5px] font-mono text-slate-500 block">
                        {entry.tier} ● {entry.activations} Genuine Activations
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-xs text-white block">
                      {entry.points.toLocaleString()}
                    </span>
                    <span className="text-[8px] font-mono text-slate-500 uppercase block">
                      VERIFIED PTS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CRYPTOGRAPHIC VERIFIED LEDGER */}
      {/* ========================================================================= */}
      {activeTab === 'ledger' && (
        <div className="space-y-4 animate-fade-in text-left">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-mono font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-indigo-400" />
                VERIFIED POINTS LEDGER
              </h3>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                Immutable audit trail of genuine safety activations and blocked fraud attempts.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchLedger}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white transition-colors"
              title="Refresh Ledger"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {ledgerEntries.map((entry) => (
              <div 
                key={entry.id}
                className={`p-3 rounded-xl border text-left transition-all ${
                  entry.status === 'flagged' 
                    ? 'bg-rose-950/20 border-rose-900/40' 
                    : entry.status === 'bonus' 
                      ? 'bg-amber-950/20 border-amber-900/40' 
                      : 'bg-slate-950/80 border-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono text-slate-500 uppercase">
                    {entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : 'Active'} ● Hash: {entry.hash}
                  </span>
                  <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.2 rounded border ${
                    entry.status === 'flagged' 
                      ? 'bg-rose-950 border-rose-800 text-rose-400' 
                      : entry.status === 'bonus' 
                        ? 'bg-amber-950 border-amber-800 text-amber-300' 
                        : 'bg-emerald-950 border-emerald-800 text-emerald-400'
                  }`}>
                    {entry.status}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-white font-sans">
                    {entry.action}
                  </span>
                  <span className={`font-mono font-black text-xs ${
                    entry.points > 0 ? 'text-emerald-400' : 'text-slate-500'
                  }`}>
                    {entry.points > 0 ? `+${entry.points}` : '0'} PTS
                  </span>
                </div>

                {entry.contactAlias && (
                  <span className="text-[8.5px] font-mono text-slate-400 block mt-0.5">
                    Contact: {entry.contactAlias}
                  </span>
                )}

                {entry.note && (
                  <span className="text-[8.5px] text-rose-300/80 font-sans block mt-1">
                    Note: {entry.note}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUICK INVITE MODAL SHEET */}
      <AnimatePresence>
        {showInviteQuickSheet && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 text-white shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <span className="text-xs font-mono font-black text-indigo-300 uppercase">
                  Invite Contact to Safety Circle
                </span>
                <button 
                  onClick={() => setShowInviteQuickSheet(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-slate-400 block">
                  Recipient Name (Optional)
                </label>
                <input 
                  type="text" 
                  value={inviteTargetName}
                  onChange={(e) => setInviteTargetName(e.target.value)}
                  placeholder="e.g. Alex, Mom, David" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleSmsInvite(inviteTargetName);
                    setShowInviteQuickSheet(false);
                  }}
                  className="w-full bg-sky-600 hover:bg-sky-550 text-white py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-950/40"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send SMS Safety Invite
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleShareInvite();
                    setShowInviteQuickSheet(false);
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 py-2.5 rounded-xl text-xs font-mono font-bold uppercase flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Open Device Share Sheet
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BRANDED SHAREABLE GUARDIAN CARD MODAL */}
      <GuardianShareCardModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        rankName={currentRank.name}
        rankColor={currentRank.color}
        points={points}
        referralCode={referralCode}
        referralLink={referralLink}
        alias={privacyMode === 'name' ? guardianName : guardianAlias}
      />

      {/* GLOBAL TOAST NOTIFIER */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[150] bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-2.5 shadow-2xl border border-slate-700 max-w-[90vw]"
          >
            <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shrink-0">
              <Check className="w-3 h-3 stroke-[3.5]" />
            </div>
            <span className="font-mono text-[9.5px] font-bold text-slate-100">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
