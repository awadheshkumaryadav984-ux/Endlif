import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Flame, 
  Zap, 
  Award, 
  Sparkles, 
  Plus, 
  Share2, 
  Heart, 
  MessageSquare, 
  Trophy, 
  Check, 
  ChevronRight, 
  ChevronDown,
  UserPlus, 
  Loader2, 
  Crown, 
  Image as ImageIcon, 
  Globe, 
  Lock, 
  Gift, 
  ExternalLink, 
  Coins, 
  Trash2,
  FileText,
  BookOpen,
  Send,
  Sliders,
  X,
  Upload,
  Eye,
  ArrowRight,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  Info,
  Calendar,
  Compass
} from 'lucide-react';

interface FeedItem {
  id: string;
  type: 'news' | 'article' | 'post';
  title: string;
  category: string;
  content?: string;
  newsLink?: string;
  verified: boolean;
  trustScore: number;
  views: number;
  likes: number;
  bookmarks: number;
  shares: number;
  timestamp: string;
  region?: string;
  language?: string;
  screenshotUrl?: string;
}

interface LeaderboardItem {
  rank: number;
  name: string;
  username: string;
  avatar: string;
  points: number;
  reputation: number;
  verificationRate: number;
  level: number;
}

// Custom SVG statue renderer for Guardian Awards (preserved as requested)
const ShieldInfinityGuardStatue = ({ color, isUnlocked }: { color: string; isUnlocked: boolean }) => {
  const glowHex = color === 'emerald' ? '#10b981' : color === 'red' ? '#f43f5e' : '#a855f7';
  const strokeColor = isUnlocked ? glowHex : '#4b5563';
  const outlineColor = isUnlocked ? glowHex : '#374151';
  const bodyOpacity = isUnlocked ? 0.95 : 0.45;
  const glowFilter = isUnlocked ? `url(#glow-${color})` : 'none';

  return (
    <svg 
      viewBox="0 0 200 320" 
      className="w-full h-48 transition-all duration-500"
      style={{ filter: isUnlocked ? `drop-shadow(0 0 10px ${glowHex}55)` : 'none' }}
    >
      <defs>
        <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isUnlocked ? glowHex : '#4b5563'} stopOpacity="0.8" />
          <stop offset="50%" stopColor="#1e293b" stopOpacity="0.9" />
          <stop offset="100%" stopColor={isUnlocked ? glowHex : '#1f2937'} stopOpacity="0.4" />
        </linearGradient>
        {isUnlocked && (
          <filter id={`glow-${color}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>
      
      {isUnlocked && (
        <>
          <path 
            d="M 50 0 L 150 0 L 170 320 L 30 320 Z" 
            fill={`url(#beam-glow-${color})`} 
            className="animate-pulse" 
            style={{ opacity: 0.15 }}
          />
          <linearGradient id={`beam-glow-${color}`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor={glowHex} stopOpacity="0.4"/>
            <stop offset="100%" stopColor={glowHex} stopOpacity="0"/>
          </linearGradient>
        </>
      )}

      <g opacity={bodyOpacity}>
        {isUnlocked && (
          <path 
            d="M 60 70 A 40 40 0 0 1 140 70" 
            fill="none" 
            stroke={glowHex} 
            strokeWidth="2" 
            strokeDasharray="4 4" 
            filter={glowFilter}
          />
        )}

        <path 
          d="M 60 140 C 30 110 30 70 45 40 C 50 60 65 75 75 90 C 65 110 70 125 75 135" 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="1.5" 
        />
        <path 
          d="M 140 140 C 170 110 170 70 155 40 C 150 60 135 75 125 90 C 135 110 130 125 125 135" 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="1.5" 
        />

        <path d="M 90 60 L 80 25 L 93 45 Z" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />
        <path d="M 110 60 L 120 25 L 107 45 Z" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />
        <path d="M 100 48 L 100 20 Z" stroke={glowHex} strokeWidth="2" filter={glowFilter} />

        <polygon 
          points="88,50 112,50 116,74 100,88 84,74" 
          fill="#111827" 
          stroke={strokeColor} 
          strokeWidth="1.5" 
        />
        <polygon 
          points="92,60 108,60 105,65 95,65" 
          fill={isUnlocked ? glowHex : '#6b7280'} 
          filter={glowFilter} 
        />
        <line x1="100" y1="65" x2="100" y2="82" stroke={strokeColor} strokeWidth="1" />

        <path d="M 80 94 C 60 90 50 105 45 120 C 60 125 70 120 78 114 Z" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1.5" />
        <path d="M 45 120 C 40 130 45 140 55 145 C 65 140 70 130 75 125 Z" fill="#1e293b" stroke={strokeColor} strokeWidth="1.5" />
        <path d="M 120 94 C 140 90 150 105 155 120 C 140 125 130 120 122 114 Z" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1.5" />
        <path d="M 155 120 C 160 130 155 140 145 145 C 135 140 130 130 125 125 Z" fill="#1e293b" stroke={strokeColor} strokeWidth="1.5" />

        <polygon 
          points="78,96 122,96 125,145 100,165 75,145" 
          fill={`url(#grad-${color})`} 
          stroke={strokeColor} 
          strokeWidth="1.5" 
        />
        
        <circle cx="100" cy="122" r="8" fill="#090d16" stroke={strokeColor} strokeWidth="1" />
        <path 
          d="M 96 122 C 92 118 92 126 96 122 C 100 118 100 126 104 122 C 108 118 108 126 104 122" 
          fill="none" 
          stroke={isUnlocked ? glowHex : '#4b5563'} 
          strokeWidth="1.5" 
          filter={glowFilter}
        />

        <polygon 
          points="84,145 116,145 112,178 88,178" 
          fill="#111827" 
          stroke={strokeColor} 
          strokeWidth="1.5" 
        />
        <line x1="100" y1="145" x2="100" y2="178" stroke={strokeColor} strokeWidth="1" />

        <polygon points="75,145 88,145 84,185 70,175" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />
        <polygon points="125,145 112,145 116,185 130,175" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />

        <path d="M 72 118 L 52 155 L 56 182 L 70 170 Z" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />
        <path d="M 128 118 L 148 155 L 144 182 L 130 170 Z" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />

        <polygon points="85,178 100,178 95,225 80,225" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1.2" />
        <polygon points="80,225 95,225 92,270 74,270" fill="#0f172a" stroke={strokeColor} strokeWidth="1.2" />
        <polygon points="74,270 92,270 90,285 70,285" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />
        
        <polygon points="100,178 115,178 120,225 105,225" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1.2" />
        <polygon points="105,225 120,225 126,270 108,270" fill="#0f172a" stroke={strokeColor} strokeWidth="1.2" />
        <polygon points="108,270 126,270 130,285 110,285" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />

        <path 
          d="M 50 120 Q 15 220 30 285 L 75 285 Z" 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="1.5" 
          strokeDasharray="3 3"
        />
        <path 
          d="M 150 120 Q 185 220 170 285 L 125 285 Z" 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="1.5" 
          strokeDasharray="3 3"
        />

        <path 
          d="M 98 85 L 102 85 L 101.5 242 L 98.5 242 Z" 
          fill={isUnlocked ? glowHex : '#374151'} 
          stroke={strokeColor} 
          strokeWidth="1" 
          filter={glowFilter}
        />
        <line x1="100" y1="90" x2="100" y2="240" stroke={isUnlocked ? '#ffffff' : '#4b5563'} strokeWidth="1" />
        <polygon points="90,242 110,242 105,246 95,246" fill="#1e293b" stroke={strokeColor} strokeWidth="1.2" />
        <rect x="98" y="246" width="4" height="25" fill="#0f172a" stroke={strokeColor} strokeWidth="1" />

        <path 
          d="M 94 275 C 89 268 83 275 88 280 C 93 285 107 265 112 270 C 117 275 111 282 106 275 C 101 268 97 282 94 275" 
          fill="none" 
          stroke={isUnlocked ? glowHex : '#4b5563'} 
          strokeWidth="2.5" 
          filter={glowFilter}
        />
        {isUnlocked && (
          <circle cx="100" cy="275" r="3" fill="#ffffff" filter={glowFilter} />
        )}
      </g>
    </svg>
  );
};

export default function CreatorHubView() {
  // --- Persistent Storage State ---
  const [points, setPoints] = useState<number>(() => {
    const saved = localStorage.getItem('endlif_hub_points');
    return saved ? parseInt(saved, 10) : 1550; // starts with Blue Guardian Level (1000+)
  });

  const [verificationStatus, setVerificationStatus] = useState<string>('VERIFIED CREATOR');
  
  const [claimedAwards, setClaimedAwards] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('endlif_claimed_guardian_statues');
      return saved ? JSON.parse(saved) : ['blue_guardian'];
    } catch {
      return ['blue_guardian'];
    }
  });

  // Track achievements
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('endlif_unlocked_achievements');
      return saved ? JSON.parse(saved) : ['first_article'];
    } catch {
      return ['first_article'];
    }
  });

  // Keep track of collapsed sections to avoid clutter
  const [collapseState, setCollapseState] = useState({
    pointsSystem: true,
    weeklyMissions: false,
    rankProgression: false,
    reputation: false,
    achievementVault: false,
    rewardStore: true,
    guardianTrophies: false,
    hallOfGuardians: true
  });

  // Content type selectors: news, article, post
  const [activeCardType, setActiveCardType] = useState<'news' | 'article' | 'post'>('news');

  // Input fields for contents
  const [newsTitle, setNewsTitle] = useState('');
  const [newsLink, setNewsLink] = useState('');
  const [newsScreenshot, setNewsScreenshot] = useState<string>('');
  const [newsScreenshotName, setNewsScreenshotName] = useState<string>('');

  const [articleTitle, setArticleTitle] = useState('');
  const [articleBody, setArticleBody] = useState('');
  const [articleTags, setArticleTags] = useState({
    disasterPrep: true,
    safetyTips: false,
    cyberAwareness: false
  });

  const [postTitle, setPostTitle] = useState('');
  const [postMessage, setPostMessage] = useState('');
  const [postPoster, setPostPoster] = useState<string>('');
  const [postPosterName, setPostPosterName] = useState<string>('');
  const [postType, setPostType] = useState<'infographics' | 'emergency_tips' | 'posters'>('emergency_tips');

  // AI Verification workflow
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationState, setVerificationState] = useState<'idle' | 'scanning' | 'verified'>('idle');
  const [trustScore, setTrustScore] = useState<number>(0);
  const [aiChecks, setAiChecks] = useState({
    duplicate: false,
    fakeNews: false,
    safetyReview: false,
    copyright: false
  });

  // Publish center state
  const [publishCategory, setPublishCategory] = useState('Disaster');
  const [publishRegion, setPublishRegion] = useState('Central Zone');
  const [publishLanguage, setPublishLanguage] = useState('English');

  // Dashboard Stats
  const [publishedCount, setPublishedCount] = useState<number>(() => {
    const saved = localStorage.getItem('endlif_published_count');
    return saved ? parseInt(saved, 10) : 18;
  });

  // News and Feed items (initialized with premium safety alerts)
  const [feedItems, setFeedItems] = useState<FeedItem[]>(() => {
    try {
      const saved = localStorage.getItem('endlif_hub_feed');
      return saved ? JSON.parse(saved) : [
        {
          id: 'item_1',
          type: 'news',
          title: '🚨 Flash Flood Warning: Ad-Hoc Drainage Gates Activation Required',
          category: 'Disaster',
          newsLink: 'https://emergency.alert.gov/flash-drain',
          verified: true,
          trustScore: 98,
          views: 1420,
          likes: 312,
          bookmarks: 96,
          shares: 54,
          timestamp: '2 hours ago',
          region: 'Northern Sector',
          language: 'English',
          screenshotUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=500&auto=format&fit=crop&q=80'
        },
        {
          id: 'item_2',
          type: 'article',
          title: '📖 Essential Cyber Hijacking Defense Matrix for Public Shelters',
          category: 'Cyber Security',
          content: 'When operating within localized mesh Wi-Fi configurations during main grid cutoffs, always utilize pre-configured static IP boundaries. Dynamic broadcasts remain highly susceptible to malicious interception routing vectors. This article outlines the essential protocol rules...',
          verified: true,
          trustScore: 95,
          views: 980,
          likes: 204,
          bookmarks: 84,
          shares: 42,
          timestamp: '5 hours ago',
          region: 'Global Matrix',
          language: 'English'
        },
        {
          id: 'item_3',
          type: 'post',
          title: '📢 Women Safety Night Protocol & Safehouse Coordinates',
          category: 'Women Safety',
          content: 'A rapid emergency guide mapping the verified civilian-guarded safehouse networks operating 24/7. Fully supplied with medical backups and solar power routers. Share with community groups immediately.',
          verified: true,
          trustScore: 100,
          views: 2450,
          likes: 850,
          bookmarks: 320,
          shares: 198,
          timestamp: '1 day ago',
          region: 'West District',
          language: 'Spanish'
        }
      ];
    } catch {
      return [];
    }
  });

  // Active filter tab in feed
  const [feedFilterTab, setFeedFilterTab] = useState<'all' | 'news' | 'article' | 'post' | 'saved'>('all');

  // State-based Toast notifier
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Weekly missions progress
  const [weeklyMissionsState, setWeeklyMissionsState] = useState({
    articles: 3, // 3 out of 5
    posts: 7, // 7 out of 10
    newsReports: 12, // 12 out of 20
    helpfulVotes: 145, // 145 out of 200
    streakCompleted: true
  });

  // Selected Leaderboard category
  const [leaderboardTab, setLeaderboardTab] = useState<'global' | 'country' | 'state' | 'city' | 'college' | 'friends'>('global');

  // Animation states for unlocked trophy celebration
  const [celebratingTrophy, setCelebratingTrophy] = useState<{ id: string, name: string, icon: string, description: string } | null>(null);

  // Save changes to localStorage on change
  useEffect(() => {
    localStorage.setItem('endlif_hub_points', points.toString());
    localStorage.setItem('endlif_claimed_guardian_statues', JSON.stringify(claimedAwards));
    localStorage.setItem('endlif_unlocked_achievements', JSON.stringify(unlockedAchievements));
    localStorage.setItem('endlif_hub_feed', JSON.stringify(feedItems));
    localStorage.setItem('endlif_published_count', publishedCount.toString());
  }, [points, claimedAwards, unlockedAchievements, feedItems, publishedCount]);

  // Helper to trigger Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Derive Rank Details dynamically
  const getRankProgression = () => {
    const list = [
      { level: 1, name: 'Citizen Reporter', min: 0, max: 999, color: 'text-slate-400', bg: 'from-slate-600/30 to-slate-900/30' },
      { level: 2, name: 'Blue Guardian', min: 1000, max: 9999, color: 'text-blue-400', bg: 'from-blue-600/30 to-blue-900/30' },
      { level: 3, name: 'Green Guardian', min: 10000, max: 49999, color: 'text-emerald-400', bg: 'from-emerald-600/30 to-emerald-900/30' },
      { level: 4, name: 'Red Champion', min: 50000, max: 99999, color: 'text-rose-400', bg: 'from-rose-600/30 to-rose-900/30' },
      { level: 5, name: 'Purple Legend', min: 100000, max: 499999, color: 'text-fuchsia-400', bg: 'from-fuchsia-600/30 to-fuchsia-900/30' },
      { level: 6, name: 'National Guardian', min: 500000, max: 999999, color: 'text-indigo-400', bg: 'from-indigo-600/30 to-indigo-900/30' },
      { level: 7, name: 'Global Safety Ambassador', min: 1000000, max: 99999999, color: 'text-amber-400', bg: 'from-amber-600/30 to-amber-900/30' },
    ];

    const current = list.find(l => points >= l.min && points <= l.max) || list[list.length - 1];
    const nextIdx = list.indexOf(current) + 1;
    const next = nextIdx < list.length ? list[nextIdx] : null;
    const progressPct = next ? Math.min(100, Math.max(5, ((points - current.min) / (next.min - current.min)) * 100)) : 100;

    return { list, current, next, progressPct };
  };

  const rankInfo = getRankProgression();

  // Handle claim awards/statues permanently (Blue, Green, Red, Purple)
  const claimGuardianStatue = (id: string, name: string, req: number, desc: string) => {
    if (points < req) {
      triggerToast(`⚠️ Insufficient Points! You need ${req.toLocaleString()} PTS. Current: ${points.toLocaleString()} PTS`);
      return;
    }
    if (claimedAwards.includes(id)) {
      triggerToast(`✓ "${name}" statue is already active in your chamber.`);
      return;
    }
    setClaimedAwards(prev => [...prev, id]);
    triggerToast(`🎉 Dynamic Figurine Activated: "${name}" initialized successfully!`);
    
    // Unlock achievement for statue claim
    if (!unlockedAchievements.includes('community_protector')) {
      triggerAchievement('community_protector', 'Community Protector', '🏆', 'Awarded for claim and setup of an advanced Guardian Statue.');
    }
  };

  // Helper to trigger achievement vault unlock with futuristic animation celebration
  const triggerAchievement = (id: string, name: string, icon: string, description: string) => {
    if (unlockedAchievements.includes(id)) return;
    setUnlockedAchievements(prev => [...prev, id]);
    setCelebratingTrophy({ id, name, icon, description });
  };

  // Drag and Drop simulation for Newspaper upload and posters
  const handleScreenshotDrop = (e: React.DragEvent, type: 'news' | 'post') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'news') {
          setNewsScreenshot(reader.result as string);
          setNewsScreenshotName(file.name);
          triggerToast(`📰 Attached Newspaper Screenshot: ${file.name}`);
        } else {
          setPostPoster(reader.result as string);
          setPostPosterName(file.name);
          triggerToast(`🎨 Attached Infographic Poster: ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // File picker simulation
  const handleScreenshotSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'news' | 'post') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'news') {
          setNewsScreenshot(reader.result as string);
          setNewsScreenshotName(file.name);
          triggerToast(`📰 Attached Newspaper Screenshot: ${file.name}`);
        } else {
          setPostPoster(reader.result as string);
          setPostPosterName(file.name);
          triggerToast(`🎨 Attached Infographic Poster: ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger simulated high-fidelity AI verification process
  const runAiVerification = () => {
    // Validate fields first
    if (activeCardType === 'news') {
      if (!newsTitle.trim()) {
        triggerToast('❌ News Title is required for verification.');
        return;
      }
    } else if (activeCardType === 'article') {
      if (!articleTitle.trim() || !articleBody.trim()) {
        triggerToast('❌ Title & Body are required for article verification.');
        return;
      }
    } else {
      if (!postTitle.trim() || !postMessage.trim()) {
        triggerToast('❌ Title & Short Message are required for safety posts.');
        return;
      }
    }

    setVerificationState('scanning');
    setVerificationProgress(0);
    setAiChecks({ duplicate: false, fakeNews: false, safetyReview: false, copyright: false });

    // Step-by-step scanner interval
    const interval = setInterval(() => {
      setVerificationProgress(prev => {
        const next = prev + 10;
        if (next === 25) {
          setAiChecks(c => ({ ...c, duplicate: true }));
        } else if (next === 50) {
          setAiChecks(c => ({ ...c, fakeNews: true }));
        } else if (next === 75) {
          setAiChecks(c => ({ ...c, safetyReview: true }));
        } else if (next === 100) {
          setAiChecks(c => ({ ...c, copyright: true }));
          setVerificationState('verified');
          // Generate customized trust score
          const calculatedScore = Math.floor(Math.random() * 15) + 85; // 85-100 score
          setTrustScore(calculatedScore);
          triggerToast(`🛡️ Verification Completed! Trust Index: ${calculatedScore}%`);
          clearInterval(interval);
        }
        return next;
      });
    }, 250);
  };

  // Publish content directly to the Feed and reward points
  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationState !== 'verified') {
      triggerToast('⚠️ Content must be run through AI Verification Panel first!');
      return;
    }

    let pGained = 0;
    let newItem: FeedItem;

    if (activeCardType === 'news') {
      pGained = 100;
      newItem = {
        id: `custom_${Date.now()}`,
        type: 'news',
        title: newsTitle,
        category: publishCategory,
        newsLink: newsLink || 'Self-published dispatch link',
        verified: true,
        trustScore: trustScore,
        views: 12,
        likes: 1,
        bookmarks: 0,
        shares: 0,
        timestamp: 'Just now',
        region: publishRegion,
        language: publishLanguage,
        screenshotUrl: newsScreenshot || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500&auto=format&fit=crop&q=80'
      };

      // Bonus point categories
      if (newsTitle.toLowerCase().includes('breaking')) {
        pGained += 50; // Breaking verified: +150
      } else if (publishRegion !== 'Central Zone') {
        pGained += 80; // Exclusive Local: +180
      }

      // Clear inputs
      setNewsTitle('');
      setNewsLink('');
      setNewsScreenshot('');
      setNewsScreenshotName('');

    } else if (activeCardType === 'article') {
      pGained = 200;
      newItem = {
        id: `custom_${Date.now()}`,
        type: 'article',
        title: articleTitle,
        category: publishCategory,
        content: articleBody,
        verified: true,
        trustScore: trustScore,
        views: 8,
        likes: 0,
        bookmarks: 0,
        shares: 0,
        timestamp: 'Just now',
        region: publishRegion,
        language: publishLanguage
      };

      // Bonus point categories
      if (articleBody.length > 500) {
        pGained += 100; // Featured Article: +300
      } else if (articleTags.cyberAwareness && articleTags.disasterPrep) {
        pGained += 300; // Expert Article: +500
      }

      // Clear inputs
      setArticleTitle('');
      setArticleBody('');

    } else {
      pGained = 50;
      newItem = {
        id: `custom_${Date.now()}`,
        type: 'post',
        title: postTitle,
        category: publishCategory,
        content: postMessage,
        verified: true,
        trustScore: trustScore,
        views: 15,
        likes: 2,
        bookmarks: 1,
        shares: 0,
        timestamp: 'Just now',
        region: publishRegion,
        language: publishLanguage,
        screenshotUrl: postPoster || undefined
      };

      // Clear inputs
      setPostTitle('');
      setPostMessage('');
      setPostPoster('');
      setPostPosterName('');
    }

    // Append to Feed list
    setFeedItems(prev => [newItem, ...prev]);
    setPoints(prev => prev + pGained);
    setPublishedCount(prev => prev + 1);
    setVerificationState('idle');
    setVerificationProgress(0);
    setTrustScore(0);

    triggerToast(`🚀 Published! +${pGained} Safety Points Credited.`);

    // Trigger Achievements check
    if (publishedCount + 1 >= 20 && !unlockedAchievements.includes('disaster_hero')) {
      triggerAchievement('disaster_hero', 'Disaster Hero', '🏆', 'Successfully published 20 emergency preparedness dispatches.');
    }
  };

  // Interactive feed actions
  const handleVote = (id: string) => {
    setFeedItems(prev => prev.map(item => {
      if (item.id === id) {
        const liked = item.likes + 1;
        triggerToast(`❤️ Upvoted safety alert! Contribution point added (+5 PTS)`);
        setPoints(p => p + 5);
        return { ...item, likes: liked };
      }
      return item;
    }));
  };

  const handleBookmark = (id: string) => {
    setFeedItems(prev => prev.map(item => {
      if (item.id === id) {
        const bm = item.bookmarks + 1;
        triggerToast(`📁 Saved to reference archive! (+3 PTS)`);
        setPoints(p => p + 3);
        return { ...item, bookmarks: bm };
      }
      return item;
    }));
  };

  const handleShare = (id: string) => {
    setFeedItems(prev => prev.map(item => {
      if (item.id === id) {
        const sh = item.shares + 1;
        triggerToast(`🔗 Shared broadcast coordinates securely! (+10 PTS)`);
        setPoints(p => p + 10);
        return { ...item, shares: sh };
      }
      return item;
    }));
  };

  const handleReport = (id: string) => {
    triggerToast('🚨 Report submitted. Safety auditors will flag this post if violations are found.');
  };

  // Reward Store Redemption Flow
  const redeemReward = (id: string, cost: number, title: string) => {
    if (points < cost) {
      triggerToast(`❌ Locked! You need ${cost.toLocaleString()} points. Currently you have ${points.toLocaleString()} points.`);
      return;
    }
    setPoints(prev => prev - cost);
    triggerToast(`🎟️ Redeemed! Your voucher for "${title}" has been transmitted to your secure inbox.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans antialiased text-left relative overflow-hidden">
      
      {/* State-Based Toast Overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-indigo-500/50 text-indigo-200 py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-2.5 backdrop-blur-md text-xs font-semibold"
          >
            <Sparkles className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trophy Celebration Modal Overlay */}
      <AnimatePresence>
        {celebratingTrophy && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-gradient-to-b from-slate-900 to-indigo-950 border border-indigo-500/30 rounded-3xl p-6 max-w-sm w-full text-center relative overflow-hidden shadow-2xl"
            >
              {/* Outer light beam glow */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl" />
              
              <div className="text-5xl mb-4 relative z-10 animate-bounce">{celebratingTrophy.icon}</div>
              <h3 className="text-xl font-black text-indigo-300 uppercase tracking-wide">ACHIEVEMENT UNLOCKED</h3>
              <p className="text-lg font-bold text-white mt-1 uppercase">{celebratingTrophy.name}</p>
              <p className="text-xs text-slate-300 mt-3 bg-slate-950/55 p-3 rounded-xl border border-white/5 font-medium leading-relaxed">
                {celebratingTrophy.description}
              </p>

              <button 
                type="button" 
                onClick={() => setCelebratingTrophy(null)}
                className="mt-6 w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg"
              >
                Inscribe to Vault
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">

        {/* 1. MISSION HEADER (Completely Overhauled) */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400 bg-indigo-950/50 border border-indigo-500/20 px-3 py-1 rounded-full">
              MISSION SYSTEM
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1.5">
              CREATOR HUB
            </h1>
            <p className="text-xs text-slate-400 font-medium italic max-w-lg">
              "Spread verified awareness. Protect communities. Earn recognition."
            </p>
          </div>

          {/* Level Progress Circle with glowing outline & score stats */}
          <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-850">
            {/* SVG Glowing Progress Ring */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="4" fill="transparent" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="28" 
                  stroke="url(#levelGlowGrad)" 
                  strokeWidth="4.5" 
                  fill="transparent" 
                  strokeDasharray="175"
                  strokeDashoffset={175 - (175 * rankInfo.progressPct) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="levelGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <span className="block text-[8px] font-bold text-slate-500 uppercase leading-none">LVL</span>
                <span className="text-sm font-black text-white leading-none">{rankInfo.current.level}</span>
              </div>
            </div>

            <div className="text-left space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-black text-white tracking-wide uppercase">{rankInfo.current.name}</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                <span>Total points: </span>
                <strong className="text-indigo-300 font-extrabold">{points.toLocaleString()} PTS</strong>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">{verificationStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Warning Notice bar */}
        <div className="bg-amber-950/30 border border-amber-500/20 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-200">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="font-medium">
            <strong>System Guideline Protocol:</strong> Entertainment, advertising, or unrelated content dispatches are strictly prohibited. The AI Verification Matrix penalizes unauthorized uploads with instant Trust Score reduction.
          </p>
        </div>


        {/* MAIN SPLIT GRID (Content Editor, Verification, Dashboard, Feed, Progression, Achievements) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: EDITORS, AI VERIFICATION & PUBLISH CENTER (Col-span: 8) */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            
            {/* 2. CREATE CONTENT SECTION */}
            <div className="space-y-4 text-left">
              <h3 className="text-sm font-black text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4.5 h-4.5" />
                2. CREATE SECURITY CONTENT
              </h3>

              {/* Three futuristic selection cards side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* News Upload */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveCardType('news');
                    setVerificationState('idle');
                    setVerificationProgress(0);
                  }}
                  className={`p-4 rounded-2xl text-left border transition-all duration-300 flex flex-col justify-between h-36 relative overflow-hidden group ${
                    activeCardType === 'news' 
                      ? 'bg-slate-900 border-indigo-500/60 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="space-y-1 relative z-10">
                    <span className="text-xl">📰</span>
                    <h4 className="text-xs font-black text-white uppercase tracking-wide mt-1">News Upload</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      Verify print clippings or external newspaper clippings.
                    </p>
                  </div>
                  <div className="flex items-center justify-between w-full relative z-10 mt-2">
                    <span className="text-[9px] font-mono text-indigo-400 font-extrabold">+100 Points</span>
                    <span className="text-[9px] font-bold text-slate-400 group-hover:text-white transition-colors flex items-center gap-1">
                      Load Form <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </button>

                {/* Awareness Article */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveCardType('article');
                    setVerificationState('idle');
                    setVerificationProgress(0);
                  }}
                  className={`p-4 rounded-2xl text-left border transition-all duration-300 flex flex-col justify-between h-36 relative overflow-hidden group ${
                    activeCardType === 'article' 
                      ? 'bg-slate-900 border-indigo-500/60 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="space-y-1 relative z-10">
                    <span className="text-xl">📖</span>
                    <h4 className="text-xs font-black text-white uppercase tracking-wide mt-1">Awareness Article</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      Publish comprehensive guidelines, prep materials, or cyber tips.
                    </p>
                  </div>
                  <div className="flex items-center justify-between w-full relative z-10 mt-2">
                    <span className="text-[9px] font-mono text-emerald-400 font-extrabold">+200 Points</span>
                    <span className="text-[9px] font-bold text-slate-400 group-hover:text-white transition-colors flex items-center gap-1">
                      Load Form <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </button>

                {/* Safety Post */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveCardType('post');
                    setVerificationState('idle');
                    setVerificationProgress(0);
                  }}
                  className={`p-4 rounded-2xl text-left border transition-all duration-300 flex flex-col justify-between h-36 relative overflow-hidden group ${
                    activeCardType === 'post' 
                      ? 'bg-slate-900 border-indigo-500/60 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="space-y-1 relative z-10">
                    <span className="text-xl">📢</span>
                    <h4 className="text-xs font-black text-white uppercase tracking-wide mt-1">Safety Post</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      Distribute short tips, poster designs, infographics, and urgent dispatches.
                    </p>
                  </div>
                  <div className="flex items-center justify-between w-full relative z-10 mt-2">
                    <span className="text-[9px] font-mono text-amber-400 font-extrabold">+50 Points</span>
                    <span className="text-[9px] font-bold text-slate-400 group-hover:text-white transition-colors flex items-center gap-1">
                      Load Form <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </button>
              </div>

              {/* Dynamic Form Editor rendering based on active tab */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 md:p-6 backdrop-blur-md text-left">
                
                {activeCardType === 'news' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                        <span>📰 News Verification Slate</span>
                      </h4>
                      <span className="text-[9px] font-mono text-slate-500">CRITERION: NEWSPAPER SCREENSHOT REQUIRED</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase text-slate-400">News Title / Headline</label>
                        <input 
                          type="text" 
                          value={newsTitle}
                          onChange={(e) => setNewsTitle(e.target.value)}
                          placeholder="e.g. Flash Flood Emergency along Highway 10" 
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase text-slate-400">News Source Reference Link</label>
                        <input 
                          type="text" 
                          value={newsLink}
                          onChange={(e) => setNewsLink(e.target.value)}
                          placeholder="https://example-news.org/alerts/flood-update" 
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Screenshot File Upload & Drag and Drop Box */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-400">Newspaper Screenshot (Simulate Upload)</label>
                      <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleScreenshotDrop(e, 'news')}
                        className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/55 rounded-2xl p-6 text-center transition-all cursor-pointer relative overflow-hidden"
                      >
                        {newsScreenshot ? (
                          <div className="space-y-2">
                            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
                            <p className="text-xs text-white font-bold uppercase">{newsScreenshotName || 'clipping_file_screenshot.png'}</p>
                            <button 
                              type="button" 
                              onClick={(e) => { e.stopPropagation(); setNewsScreenshot(''); setNewsScreenshotName(''); }}
                              className="text-[10px] text-rose-400 underline font-bold hover:text-rose-300"
                            >
                              Remove file
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer block space-y-2">
                            <Upload className="w-6 h-6 text-slate-500 mx-auto" />
                            <p className="text-xs text-slate-300 font-bold">Drag and drop newspaper file, or browse</p>
                            <p className="text-[10px] text-slate-500">Supports JPG, PNG clippings (Max 5MB)</p>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleScreenshotSelect(e, 'news')}
                              className="hidden" 
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeCardType === 'article' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                        <span>📖 Article Drafting Console</span>
                      </h4>
                      <span className="text-[9px] font-mono text-slate-500">CRITERION: ORIGINAL KNOWLEDGE COMPILATION</span>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-400">Article Title / Guide Name</label>
                      <input 
                        type="text" 
                        value={articleTitle}
                        onChange={(e) => setArticleTitle(e.target.value)}
                        placeholder="e.g. Master Guidelines for Cybersecurity Shield Setup" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-400">Guide Book / Survival Tips Content</label>
                      <textarea 
                        rows={4}
                        value={articleBody}
                        onChange={(e) => setArticleBody(e.target.value)}
                        placeholder="Detail preparation steps, emergency safety precautions, checklists, or critical cybersecurity routines..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none font-mono"
                      />
                    </div>

                    {/* Tag checklists */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-400">Core Awareness Focus Tags</label>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setArticleTags(t => ({ ...t, disasterPrep: !t.disasterPrep }))}
                          className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all ${
                            articleTags.disasterPrep 
                              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300' 
                              : 'bg-slate-950 border-slate-850 text-slate-500'
                          }`}
                        >
                          Disaster Preparedness
                        </button>
                        <button
                          type="button"
                          onClick={() => setArticleTags(t => ({ ...t, safetyTips: !t.safetyTips }))}
                          className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all ${
                            articleTags.safetyTips 
                              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300' 
                              : 'bg-slate-950 border-slate-850 text-slate-500'
                          }`}
                        >
                          Safety Tips
                        </button>
                        <button
                          type="button"
                          onClick={() => setArticleTags(t => ({ ...t, cyberAwareness: !t.cyberAwareness }))}
                          className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all ${
                            articleTags.cyberAwareness 
                              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300' 
                              : 'bg-slate-950 border-slate-850 text-slate-500'
                          }`}
                        >
                          Cyber Awareness
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeCardType === 'post' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                        <span>📢 Bullet Safety Dispatcher</span>
                      </h4>
                      <span className="text-[9px] font-mono text-slate-500">CRITERION: RAPID FIELD DISSEMINATION</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase text-slate-400">Post Header</label>
                        <input 
                          type="text" 
                          value={postTitle}
                          onChange={(e) => setPostTitle(e.target.value)}
                          placeholder="e.g. Critical Safe Zone Alert" 
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase text-slate-400">Dispatch Type</label>
                        <select 
                          value={postType}
                          onChange={(e) => setPostType(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                        >
                          <option value="emergency_tips">Emergency Field Tips</option>
                          <option value="infographics">Infographics File</option>
                          <option value="posters">Awareness Poster</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-400">Safety Message Brief (Max 280 chars)</label>
                      <textarea 
                        rows={3}
                        maxLength={280}
                        value={postMessage}
                        onChange={(e) => setPostMessage(e.target.value)}
                        placeholder="Distribute urgent warnings, posters, contact coordinates, or immediate shelter addresses..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
                      />
                    </div>

                    {/* Poster file attachment drop zone */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-400">Poster / Infographic File (Drag & Drop)</label>
                      <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleScreenshotDrop(e, 'post')}
                        className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/55 rounded-2xl p-4 text-center transition-all cursor-pointer relative overflow-hidden"
                      >
                        {postPoster ? (
                          <div className="space-y-1">
                            <Check className="w-6 h-6 text-emerald-400 mx-auto" />
                            <p className="text-[10px] text-white font-bold uppercase">{postPosterName || 'poster_infographic_design.png'}</p>
                            <button 
                              type="button" 
                              onClick={(e) => { e.stopPropagation(); setPostPoster(''); setPostPosterName(''); }}
                              className="text-[9px] text-rose-400 underline font-bold hover:text-rose-300"
                            >
                              Clear File
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer block space-y-1">
                            <ImageIcon className="w-5 h-5 text-slate-500 mx-auto" />
                            <p className="text-[11px] text-slate-300 font-bold">Attach visual safety poster or Infographic</p>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleScreenshotSelect(e, 'post')}
                              className="hidden" 
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* 3. AI VERIFICATION PANEL & 4. PUBLISH CENTER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              
              {/* AI Verification Panel card */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">PRE-PUBLISH ASSURANCE</span>
                  <h4 className="text-xs font-black text-white uppercase tracking-wide">3. AI Verification Panel</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    Run automated scanning sequence to confirm authenticity, checks, and duplicate files.
                  </p>
                </div>

                {/* AI checking list */}
                <div className="space-y-2 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-850">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      {aiChecks.duplicate ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />}
                      Duplicate Detection
                    </span>
                    <span className={`text-[9px] font-mono ${aiChecks.duplicate ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                      {aiChecks.duplicate ? '✓ PASSED' : 'PENDING'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      {aiChecks.fakeNews ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />}
                      Fake News Detection
                    </span>
                    <span className={`text-[9px] font-mono ${aiChecks.fakeNews ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                      {aiChecks.fakeNews ? '✓ PASSED' : 'PENDING'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      {aiChecks.safetyReview ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />}
                      AI Safety Review
                    </span>
                    <span className={`text-[9px] font-mono ${aiChecks.safetyReview ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                      {aiChecks.safetyReview ? '✓ CLEAN' : 'PENDING'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      {aiChecks.copyright ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />}
                      Copyright Check
                    </span>
                    <span className={`text-[9px] font-mono ${aiChecks.copyright ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                      {aiChecks.copyright ? '✓ ORIGINAL' : 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* Verification Actions & Results */}
                <div className="pt-2">
                  {verificationState === 'idle' && (
                    <button
                      type="button"
                      onClick={runAiVerification}
                      className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md"
                    >
                      🛡️ Run AI Verification Matrix
                    </button>
                  )}

                  {verificationState === 'scanning' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-indigo-400">
                        <span className="flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Analyzing contents...
                        </span>
                        <span>{verificationProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${verificationProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {verificationState === 'verified' && (
                    <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-2xl border border-indigo-900/30 animate-pulse">
                      <div>
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Trust Score</span>
                        <span className="text-xl font-black text-emerald-400 tracking-tight block mt-1">{trustScore}%</span>
                      </div>
                      <div className="bg-indigo-950/80 border border-indigo-400/30 text-[9px] px-2.5 py-1.5 rounded-xl font-black uppercase text-indigo-300 tracking-wider flex items-center gap-1 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <Check className="w-3 h-3 text-emerald-400 stroke-[3]" /> Holographic verified
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Publish Center card */}
              <form onSubmit={handlePublish} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">COORDINATE MAPPING</span>
                  <h4 className="text-xs font-black text-white uppercase tracking-wide">4. Publish Center</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    Map your content metadata to appropriate focus nodes before transmission.
                  </p>
                </div>

                <div className="space-y-3 bg-slate-950/50 p-3 rounded-2xl border border-slate-850 text-xs">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold uppercase text-slate-400">Category Node</label>
                    <select
                      value={publishCategory}
                      onChange={(e) => setPublishCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Disaster">Disaster Awareness</option>
                      <option value="Medical">Medical Preparedness</option>
                      <option value="Cyber Security">Cyber Security Protection</option>
                      <option value="Women Safety">Women Emergency Guard</option>
                      <option value="Child Safety">Child Protection Protocol</option>
                      <option value="Environment">Environmental Safety</option>
                      <option value="Traffic Safety">Traffic & Grid Safety</option>
                      <option value="Government Advisory">Official Government Advisory</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-bold uppercase text-slate-400">Target Region</label>
                      <input 
                        type="text"
                        value={publishRegion}
                        onChange={(e) => setPublishRegion(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-bold uppercase text-slate-400">Language</label>
                      <input 
                        type="text"
                        value={publishLanguage}
                        onChange={(e) => setPublishLanguage(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={verificationState !== 'verified'}
                  className={`w-full py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer ${
                    verificationState === 'verified'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white animate-pulse'
                      : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                  }`}
                >
                  {verificationState === 'verified' ? '🚀 Broadcast Verified Alert' : 'Locked (Requires Verification Check)'}
                </button>
              </form>

            </div>

            {/* 6. MISSION FEED */}
            <div className="space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                    <Compass className="w-4.5 h-4.5 animate-spin" />
                    6. COMMUNITY MISSION FEED
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Verified citizen transmissions distributed across decentralized grid sectors.
                  </p>
                </div>

                {/* Filter tabs */}
                <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-850">
                  <button 
                    type="button" 
                    onClick={() => setFeedFilterTab('all')}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                      feedFilterTab === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFeedFilterTab('news')}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                      feedFilterTab === 'news' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    News
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFeedFilterTab('article')}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                      feedFilterTab === 'article' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Articles
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFeedFilterTab('post')}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                      feedFilterTab === 'post' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Posts
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFeedFilterTab('saved')}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                      feedFilterTab === 'saved' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Saved
                  </button>
                </div>
              </div>

              {/* Feed List rendered with premium holographic cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedItems
                  .filter(item => {
                    if (feedFilterTab === 'all') return true;
                    if (feedFilterTab === 'saved') return item.bookmarks > 0;
                    return item.type === feedFilterTab;
                  })
                  .map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between hover:border-slate-700 hover:bg-slate-900 transition-all duration-300 relative overflow-hidden group shadow-md"
                    >
                      {/* Top metadata */}
                      <div className="space-y-1 relative z-10">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-[10px] font-extrabold uppercase text-indigo-400 px-2 py-0.5 bg-indigo-950/60 border border-indigo-500/10 rounded-md">
                            {item.category}
                          </span>
                          <div className="flex items-center gap-1">
                            {item.verified && (
                              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-2 py-0.5 rounded-md font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
                                <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" /> Verified ({item.trustScore}%)
                              </span>
                            )}
                          </div>
                        </div>

                        <h4 className="text-sm font-black text-white mt-2 leading-snug tracking-tight">
                          {item.title}
                        </h4>

                        {item.screenshotUrl && (
                          <div className="relative aspect-video rounded-xl overflow-hidden mt-3 border border-slate-850">
                            <img src={item.screenshotUrl} alt="Visual Attachment" className="w-full h-full object-cover" />
                          </div>
                        )}

                        {item.content && (
                          <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-3 mt-2">
                            {item.content}
                          </p>
                        )}

                        {item.newsLink && (
                          <a 
                            href={item.newsLink}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-indigo-300 hover:text-indigo-200 mt-2 hover:underline"
                          >
                            Source Link <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>

                      {/* Interactive metrics footer */}
                      <div className="border-t border-slate-850/80 pt-3.5 mt-4 flex items-center justify-between text-slate-400 text-[10px] font-mono font-bold">
                        <span>Views: {item.views.toLocaleString()}</span>
                        
                        <div className="flex items-center gap-3">
                          <button 
                            type="button" 
                            onClick={() => handleVote(item.id)}
                            className="flex items-center gap-1 hover:text-rose-400 transition-colors"
                          >
                            <Heart className="w-3.5 h-3.5 text-rose-500/70 fill-rose-500/10" /> {item.likes}
                          </button>
                          
                          <button 
                            type="button" 
                            onClick={() => handleBookmark(item.id)}
                            className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
                          >
                            <Bookmark className="w-3.5 h-3.5" /> {item.bookmarks}
                          </button>
                          
                          <button 
                            type="button" 
                            onClick={() => handleShare(item.id)}
                            className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
                          >
                            <Share2 className="w-3.5 h-3.5" /> {item.shares}
                          </button>

                          <button 
                            type="button" 
                            onClick={() => handleReport(item.id)}
                            className="text-slate-600 hover:text-rose-400 transition-colors"
                            title="Report Alert"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>

          </div>

          {/* COLUMN 2: DASHBOARDS, REPUTATIONS, MISSIONS & REWARD STORE (Col-span: 4) */}
          <div className="col-span-12 lg:col-span-4 space-y-8 text-left">
            
            {/* 5. CREATOR DASHBOARD PANEL */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Users className="w-4.5 h-4.5 text-indigo-400" />
                <div>
                  <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">5. Creator Dashboard</h4>
                  <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">Live Sector Analytics</p>
                </div>
              </div>

              {/* Grid of 7 core required metrics */}
              <div className="grid grid-cols-2 gap-3.5 text-xs font-mono">
                
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850">
                  <span className="block text-[8px] text-slate-500 uppercase font-black tracking-widest">Today's Points</span>
                  <span className="text-lg font-black text-white block mt-1">+150 PTS</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850">
                  <span className="block text-[8px] text-slate-500 uppercase font-black tracking-widest">Weekly Rank</span>
                  <span className="text-lg font-black text-indigo-400 block mt-1">#42</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850">
                  <span className="block text-[8px] text-slate-500 uppercase font-black tracking-widest">Monthly Rank</span>
                  <span className="text-lg font-black text-indigo-400 block mt-1">#118</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850">
                  <span className="block text-[8px] text-slate-500 uppercase font-black tracking-widest">Published Posts</span>
                  <span className="text-lg font-black text-white block mt-1">{publishedCount}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850">
                  <span className="block text-[8px] text-slate-500 uppercase font-black tracking-widest">Verification %</span>
                  <span className="text-lg font-black text-emerald-400 block mt-1">100%</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850">
                  <span className="block text-[8px] text-slate-500 uppercase font-black tracking-widest">Community Reach</span>
                  <span className="text-lg font-black text-white block mt-1">4.2k</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 col-span-2">
                  <span className="block text-[8px] text-slate-500 uppercase font-black tracking-widest">Impact Score</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-black text-indigo-300 block">890</span>
                    <span className="text-[9px] font-sans font-bold text-slate-400">DECISION POWER ACCELERATED</span>
                  </div>
                </div>

              </div>
            </div>

            {/* 7. REPUTATION SYSTEM (Instead of followers) */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setCollapseState(c => ({ ...c, reputation: !c.reputation }))}
                className="w-full flex items-center justify-between text-left cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4.5 h-4.5 text-indigo-400" />
                  <div>
                    <h4 className="font-extrabold text-white text-xs uppercase tracking-wider leading-none">7. Reputation System</h4>
                    <p className="text-[9px] font-mono text-slate-400 uppercase leading-none mt-1.5">Decentralized Trust Coordinates</p>
                  </div>
                </div>
                {collapseState.reputation ? <ChevronRight className="w-4.5 h-4.5 text-slate-500" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-500" />}
              </button>

              {!collapseState.reputation && (
                <div className="pt-4 space-y-3 font-mono text-[11px] border-t border-slate-850 mt-4">
                  <div className="flex justify-between items-center bg-slate-950/60 p-2 rounded-xl border border-slate-850">
                    <span className="text-slate-400 uppercase font-bold text-[9px]">Community Trust</span>
                    <span className="font-black text-indigo-300">EXCELLENT (96%)</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950/60 p-2 rounded-xl border border-slate-850">
                    <span className="text-slate-400 uppercase font-bold text-[9px]">Accuracy Score</span>
                    <span className="font-black text-emerald-400">98.4%</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950/60 p-2 rounded-xl border border-slate-850">
                    <span className="text-slate-400 uppercase font-bold text-[9px]">Helpful Appraise Score</span>
                    <span className="font-black text-indigo-300">1,240 ❤️</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950/60 p-2 rounded-xl border border-slate-850">
                    <span className="text-slate-400 uppercase font-bold text-[9px]">Consistency Coefficient</span>
                    <span className="font-black text-amber-400">HIGH INTENSITY</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950/60 p-2 rounded-xl border border-slate-850">
                    <span className="text-slate-400 uppercase font-bold text-[9px]">Verification Pass Rate</span>
                    <span className="font-black text-emerald-400">100.0%</span>
                  </div>
                </div>
              )}
            </div>

            {/* 8. POINTS SYSTEM CARD */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setCollapseState(c => ({ ...c, pointsSystem: !c.pointsSystem }))}
                className="w-full flex items-center justify-between text-left cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <Coins className="w-4.5 h-4.5 text-amber-500" />
                  <div>
                    <h4 className="font-extrabold text-white text-xs uppercase tracking-wider leading-none">8. Points Matrix Reference</h4>
                    <p className="text-[9px] font-mono text-slate-400 uppercase leading-none mt-1.5">Contribution weights guidelines</p>
                  </div>
                </div>
                {collapseState.pointsSystem ? <ChevronRight className="w-4.5 h-4.5 text-slate-500" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-500" />}
              </button>

              {!collapseState.pointsSystem && (
                <div className="pt-4 space-y-3.5 border-t border-slate-850 mt-4 text-[10.5px]">
                  <p className="text-slate-400 leading-relaxed font-sans font-medium">
                    Points are generated automatically on the decentralized blockchain. Falsified or duplicated alerts lead to penalties.
                  </p>

                  <div className="space-y-2 font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span>Safety Post</span>
                      <span className="text-indigo-400 font-extrabold">+50 PTS</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Newspaper News Verified</span>
                      <span className="text-indigo-400 font-extrabold">+100 PTS</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Breaking Verified Alert</span>
                      <span className="text-indigo-400 font-extrabold">+150 PTS</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Exclusive Local Alert</span>
                      <span className="text-indigo-400 font-extrabold">+180 PTS</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Awareness Article Draft</span>
                      <span className="text-indigo-400 font-extrabold">+200 PTS</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Featured Resource Guide</span>
                      <span className="text-indigo-400 font-extrabold">+300 PTS</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Expert Curated Article</span>
                      <span className="text-indigo-400 font-extrabold">+500 PTS</span>
                    </div>
                    <div className="border-t border-slate-850 my-2 pt-2 text-[9px] uppercase font-black text-slate-500">
                      Decentralized Feed Actions
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Helpful Upvote received</span>
                      <span className="text-indigo-400 font-extrabold">+5 PTS</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Saved to Archive by peer</span>
                      <span className="text-indigo-400 font-extrabold">+3 PTS</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Secure Shared Broadcast</span>
                      <span className="text-indigo-400 font-extrabold">+10 PTS</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Official Gov Spotlight</span>
                      <span className="text-indigo-400 font-extrabold">+1000 PTS</span>
                    </div>
                    <div className="border-t border-slate-850 my-2 pt-2 text-[9px] uppercase font-black text-slate-500">
                      Active Streak Multipliers
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Daily Upload reward</span>
                      <span className="text-indigo-400 font-extrabold">+20 PTS</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>7-Day Continuous Streak</span>
                      <span className="text-indigo-400 font-extrabold">+150 PTS</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>30-Day Continuous Streak</span>
                      <span className="text-indigo-400 font-extrabold">+1000 PTS</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 9. CREATOR RANK PROGRESSION LEVEL TREE */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setCollapseState(c => ({ ...c, rankProgression: !c.rankProgression }))}
                className="w-full flex items-center justify-between text-left cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4.5 h-4.5 text-indigo-400" />
                  <div>
                    <h4 className="font-extrabold text-white text-xs uppercase tracking-wider leading-none">9. Rank Progression</h4>
                    <p className="text-[9px] font-mono text-slate-400 uppercase leading-none mt-1.5">Seven Levels of Guardian Authority</p>
                  </div>
                </div>
                {collapseState.rankProgression ? <ChevronRight className="w-4.5 h-4.5 text-slate-500" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-500" />}
              </button>

              {!collapseState.rankProgression && (
                <div className="pt-4 border-t border-slate-850 mt-4 space-y-3 font-mono text-[10.5px]">
                  {rankInfo.list.map((l) => {
                    const isActive = points >= l.min && points <= l.max;
                    const isPassed = points > l.max;
                    
                    return (
                      <div 
                        key={l.level}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                          isActive 
                            ? 'bg-slate-900 border-indigo-500/50 shadow-sm' 
                            : 'bg-slate-950/40 border-slate-900 text-slate-500'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`font-black uppercase text-xs ${isActive ? l.color : 'text-slate-600'}`}>
                            Level {l.level}: {l.name}
                          </span>
                          {isActive && (
                            <span className="text-[8px] font-bold bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest animate-pulse">
                              Active
                            </span>
                          )}
                          {isPassed && (
                            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-0.5">
                              ✓ Passed
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                          <span>Required Points Threshold</span>
                          <span>{l.min.toLocaleString()} - {l.max > 5000000 ? '∞' : l.max.toLocaleString()} PTS</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 10. WEEKLY MISSIONS COMPACT */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setCollapseState(c => ({ ...c, weeklyMissions: !c.weeklyMissions }))}
                className="w-full flex items-center justify-between text-left cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-indigo-400" />
                  <div>
                    <h4 className="font-extrabold text-white text-xs uppercase tracking-wider leading-none">10. Weekly Missions</h4>
                    <p className="text-[9px] font-mono text-slate-400 uppercase leading-none mt-1.5">Sector contribution objectives</p>
                  </div>
                </div>
                {collapseState.weeklyMissions ? <ChevronRight className="w-4.5 h-4.5 text-slate-500" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-500" />}
              </button>

              {!collapseState.weeklyMissions && (
                <div className="pt-4 border-t border-slate-850 mt-4 space-y-4">
                  <p className="text-xs text-slate-400 font-sans font-medium">
                    Achieve objectives before weekly calibration cycle finishes. Unlock unique profile badges and points.
                  </p>

                  <div className="space-y-3 font-mono text-[10px]">
                    {/* Mission 1 */}
                    <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
                      <div className="flex justify-between text-slate-300">
                        <span>Publish 5 Articles</span>
                        <span>{weeklyMissionsState.articles}/5 guides</span>
                      </div>
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${(weeklyMissionsState.articles/5)*100}%` }} />
                      </div>
                    </div>

                    {/* Mission 2 */}
                    <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
                      <div className="flex justify-between text-slate-300">
                        <span>Publish 10 Safety Posts</span>
                        <span>{weeklyMissionsState.posts}/10 dispatches</span>
                      </div>
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${(weeklyMissionsState.posts/10)*100}%` }} />
                      </div>
                    </div>

                    {/* Mission 3 */}
                    <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
                      <div className="flex justify-between text-slate-300">
                        <span>Verify 20 News Reports</span>
                        <span>{weeklyMissionsState.newsReports}/20 checks</span>
                      </div>
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${(weeklyMissionsState.newsReports/20)*100}%` }} />
                      </div>
                    </div>

                    {/* Mission 4 */}
                    <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
                      <div className="flex justify-between text-slate-300">
                        <span>Receive 200 Helpful Votes</span>
                        <span>{weeklyMissionsState.helpfulVotes}/200 votes</span>
                      </div>
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${(weeklyMissionsState.helpfulVotes/200)*100}%` }} />
                      </div>
                    </div>

                    {/* Mission 5 */}
                    <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 text-slate-300">
                      <span>Complete Daily Streak</span>
                      <span className="text-emerald-400 font-bold">✓ COMPLETED</span>
                    </div>
                  </div>

                  {/* Mission rewards box */}
                  <div className="bg-indigo-950/30 border border-indigo-500/20 p-3 rounded-2xl text-[10.5px]">
                    <span className="text-[8px] font-black uppercase text-indigo-400 block tracking-widest font-mono mb-1.5">REWARDS ATTACHED</span>
                    <ul className="space-y-1 text-slate-300 font-sans font-medium">
                      <li>&bull; Bonus safety points: <strong>+500 Points</strong></li>
                      <li>&bull; Exclusive Guardian Badge: <strong>"Streak Master"</strong></li>
                      <li>&bull; Premium Matrix Access</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* 11. HALL OF GUARDIANS */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setCollapseState(c => ({ ...c, hallOfGuardians: !c.hallOfGuardians }))}
                className="w-full flex items-center justify-between text-left cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <Crown className="w-4.5 h-4.5 text-indigo-400" />
                  <div>
                    <h4 className="font-extrabold text-white text-xs uppercase tracking-wider leading-none">11. Hall of Guardians</h4>
                    <p className="text-[9px] font-mono text-slate-400 uppercase leading-none mt-1.5">Decentralized creator standings</p>
                  </div>
                </div>
                {collapseState.hallOfGuardians ? <ChevronRight className="w-4.5 h-4.5 text-slate-500" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-500" />}
              </button>

              {!collapseState.hallOfGuardians && (
                <div className="pt-4 border-t border-slate-850 mt-4 space-y-4">
                  {/* Internal tabs */}
                  <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850 text-[8.5px] font-mono font-black uppercase">
                    <button 
                      type="button" 
                      onClick={() => setLeaderboardTab('global')}
                      className={`py-1 rounded text-center transition-all ${leaderboardTab === 'global' ? 'bg-indigo-650 text-white' : 'text-slate-500'}`}
                    >
                      Global
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setLeaderboardTab('country')}
                      className={`py-1 rounded text-center transition-all ${leaderboardTab === 'country' ? 'bg-indigo-650 text-white' : 'text-slate-500'}`}
                    >
                      Country
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setLeaderboardTab('state')}
                      className={`py-1 rounded text-center transition-all ${leaderboardTab === 'state' ? 'bg-indigo-650 text-white' : 'text-slate-500'}`}
                    >
                      State
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setLeaderboardTab('city')}
                      className={`py-1 rounded text-center transition-all ${leaderboardTab === 'city' ? 'bg-indigo-650 text-white' : 'text-slate-500'}`}
                    >
                      City
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setLeaderboardTab('college')}
                      className={`py-1 rounded text-center transition-all ${leaderboardTab === 'college' ? 'bg-indigo-650 text-white' : 'text-slate-500'}`}
                    >
                      College
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setLeaderboardTab('friends')}
                      className={`py-1 rounded text-center transition-all ${leaderboardTab === 'friends' ? 'bg-indigo-650 text-white' : 'text-slate-500'}`}
                    >
                      Friends
                    </button>
                  </div>

                  {/* Leaderboard entries */}
                  <div className="space-y-2.5 font-mono text-[10.5px]">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.05)]">
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-400 font-extrabold text-xs">#1</span>
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs">👨‍🚀</div>
                        <div>
                          <span className="block font-black text-white leading-none">Brody prepared</span>
                          <span className="text-[8px] text-slate-500 uppercase leading-none mt-0.5">@brody_prepared</span>
                        </div>
                      </div>
                      <span className="font-extrabold text-white">584,200 PTS</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-extrabold text-xs">#2</span>
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs">👩‍⚕️</div>
                        <div>
                          <span className="block font-black text-white leading-none">Sarah Emergency</span>
                          <span className="text-[8px] text-slate-500 uppercase leading-none mt-0.5">@sarah_safety</span>
                        </div>
                      </div>
                      <span className="font-extrabold text-white">410,500 PTS</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-950/40 border border-indigo-500/20">
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-400 font-extrabold text-xs">#3</span>
                        <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/20 flex items-center justify-center text-xs">🛡️</div>
                        <div>
                          <span className="block font-black text-indigo-300 leading-none">You (Alpha Node)</span>
                          <span className="text-[8px] text-slate-500 uppercase leading-none mt-0.5">@your_handle</span>
                        </div>
                      </div>
                      <span className="font-extrabold text-indigo-300">{points.toLocaleString()} PTS</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 12. ACHIEVEMENT VAULT & GUARDIAN TROPHIES CHAMBER */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 backdrop-blur-md space-y-4">
              <button
                type="button"
                onClick={() => setCollapseState(c => ({ ...c, achievementVault: !c.achievementVault }))}
                className="w-full flex items-center justify-between text-left cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <Trophy className="w-4.5 h-4.5 text-indigo-400" />
                  <div>
                    <h4 className="font-extrabold text-white text-xs uppercase tracking-wider leading-none">12. Achievement Vault</h4>
                    <p className="text-[9px] font-mono text-slate-400 uppercase leading-none mt-1.5">Unlocks and custom achievements</p>
                  </div>
                </div>
                {collapseState.achievementVault ? <ChevronRight className="w-4.5 h-4.5 text-slate-500" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-500" />}
              </button>

              {!collapseState.achievementVault && (
                <div className="pt-4 border-t border-slate-850 space-y-4">
                  
                  {/* Required Trophies grid list */}
                  <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
                    {/* Trophy 1 */}
                    <div 
                      onClick={() => triggerAchievement('first_article', 'First Article', '🏆', 'Awarded for drafting and publishing your first original article guidelines.')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        unlockedAchievements.includes('first_article') 
                          ? 'bg-slate-900 border-indigo-500/30 text-slate-250 shadow-sm' 
                          : 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60'
                      }`}
                    >
                      <span className="block text-lg mb-1">{unlockedAchievements.includes('first_article') ? '🏆' : '🔒'}</span>
                      <span className="block font-black leading-tight uppercase">First Article</span>
                      <span className="text-[8px] text-slate-500 block mt-0.5 uppercase">UNLOCKED</span>
                    </div>

                    {/* Trophy 2 */}
                    <div 
                      onClick={() => triggerAchievement('hundred_posts', '100 Posts', '🏆', 'Distributed 100 fast safety notifications to community feeds.')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        unlockedAchievements.includes('hundred_posts') 
                          ? 'bg-slate-900 border-indigo-500/30 text-slate-250 shadow-sm' 
                          : 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60'
                      }`}
                    >
                      <span className="block text-lg mb-1">{unlockedAchievements.includes('hundred_posts') ? '🏆' : '🔒'}</span>
                      <span className="block font-black leading-tight uppercase">100 Posts</span>
                      <span className="text-[8px] text-slate-500 block mt-0.5 uppercase">
                        {unlockedAchievements.includes('hundred_posts') ? 'UNLOCKED' : '18/100 POSTS'}
                      </span>
                    </div>

                    {/* Trophy 3 */}
                    <div 
                      onClick={() => triggerAchievement('thousand_votes', '1000 Helpful Votes', '🏆', 'Accumulated 1,000 upvotes from verified citizens.')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        unlockedAchievements.includes('thousand_votes') 
                          ? 'bg-slate-900 border-indigo-500/30 text-slate-250 shadow-sm' 
                          : 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60'
                      }`}
                    >
                      <span className="block text-lg mb-1">{unlockedAchievements.includes('thousand_votes') ? '🏆' : '🔒'}</span>
                      <span className="block font-black leading-tight uppercase">1000 Votes</span>
                      <span className="text-[8px] text-slate-500 block mt-0.5 uppercase">
                        {unlockedAchievements.includes('thousand_votes') ? 'UNLOCKED' : '145/1000 VOTES'}
                      </span>
                    </div>

                    {/* Trophy 4 */}
                    <div 
                      onClick={() => triggerAchievement('disaster_hero', 'Disaster Hero', '🏆', 'Published 20 emergency preparedness dispatches.')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        unlockedAchievements.includes('disaster_hero') 
                          ? 'bg-slate-900 border-indigo-500/30 text-slate-250 shadow-sm' 
                          : 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60'
                      }`}
                    >
                      <span className="block text-lg mb-1">{unlockedAchievements.includes('disaster_hero') ? '🏆' : '🔒'}</span>
                      <span className="block font-black leading-tight uppercase">Disaster Hero</span>
                      <span className="text-[8px] text-slate-500 block mt-0.5 uppercase">
                        {unlockedAchievements.includes('disaster_hero') ? 'UNLOCKED' : '18/20 DISPATCHES'}
                      </span>
                    </div>

                    {/* Trophy 5 */}
                    <div 
                      onClick={() => triggerAchievement('cyber_guardian', 'Cyber Guardian', '🏆', 'Successfully authored 5 advanced cybersecurity guidelines.')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        unlockedAchievements.includes('cyber_guardian') 
                          ? 'bg-slate-900 border-indigo-500/30 text-slate-250 shadow-sm' 
                          : 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60'
                      }`}
                    >
                      <span className="block text-lg mb-1">{unlockedAchievements.includes('cyber_guardian') ? '🏆' : '🔒'}</span>
                      <span className="block font-black leading-tight uppercase">Cyber Guardian</span>
                      <span className="text-[8px] text-slate-500 block mt-0.5 uppercase">LOCK-STATE</span>
                    </div>

                    {/* Trophy 6 */}
                    <div 
                      onClick={() => triggerAchievement('medical_champ', 'Medical Awareness Champion', '🏆', 'Verify and publish 10 crucial sanitary advisory posts.')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        unlockedAchievements.includes('medical_champ') 
                          ? 'bg-slate-900 border-indigo-500/30 text-slate-250 shadow-sm' 
                          : 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60'
                      }`}
                    >
                      <span className="block text-lg mb-1">{unlockedAchievements.includes('medical_champ') ? '🏆' : '🔒'}</span>
                      <span className="block font-black leading-tight uppercase">Medical Champ</span>
                      <span className="text-[8px] text-slate-500 block mt-0.5 uppercase">LOCK-STATE</span>
                    </div>
                  </div>

                  {/* GUARDIAN AWARDS PRESERVED CHAMBER (Statues check) */}
                  <div className="border-t border-slate-850 pt-4 mt-4 space-y-3 text-left">
                    <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider block">🛡️ Preserved Guardian Awards Chamber</span>
                    
                    {/* Green Figurine */}
                    <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center justify-between gap-3">
                      <div className="w-12 h-12 flex items-center justify-center shrink-0">
                        <ShieldInfinityGuardStatue color="emerald" isUnlocked={claimedAwards.includes('green_impact')} />
                      </div>
                      <div className="text-[10px] flex-1">
                        <span className="block font-black text-slate-300 uppercase leading-none">Green Guardian Figurine</span>
                        <span className="text-[8px] text-slate-500 block mt-1 uppercase">REQS: 10,000 CREATOR POINTS</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => claimGuardianStatue('green_impact', 'Green Guardian Statue', 10000, 'Awarded for achieving 10,000 creator points.')}
                        className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg border transition-all ${
                          claimedAwards.includes('green_impact') 
                            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 cursor-not-allowed' 
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {claimedAwards.includes('green_impact') ? 'ACTIVE' : 'CLAIM'}
                      </button>
                    </div>

                    {/* Red Figurine */}
                    <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center justify-between gap-3">
                      <div className="w-12 h-12 flex items-center justify-center shrink-0">
                        <ShieldInfinityGuardStatue color="red" isUnlocked={claimedAwards.includes('red_champion')} />
                      </div>
                      <div className="text-[10px] flex-1">
                        <span className="block font-black text-slate-300 uppercase leading-none">Red Champion Figurine</span>
                        <span className="text-[8px] text-slate-500 block mt-1 uppercase">REQS: 50,000 CREATOR POINTS</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => claimGuardianStatue('red_champion', 'Red Champion Statue', 50000, 'Awarded for achieving 50,000 creator points.')}
                        className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg border transition-all ${
                          claimedAwards.includes('red_champion') 
                            ? 'bg-rose-950/40 border-rose-500/30 text-rose-400 cursor-not-allowed' 
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {claimedAwards.includes('red_champion') ? 'ACTIVE' : 'CLAIM'}
                      </button>
                    </div>

                    {/* Purple Figurine */}
                    <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center justify-between gap-3">
                      <div className="w-12 h-12 flex items-center justify-center shrink-0">
                        <ShieldInfinityGuardStatue color="purple" isUnlocked={claimedAwards.includes('purple_legend')} />
                      </div>
                      <div className="text-[10px] flex-1">
                        <span className="block font-black text-slate-300 uppercase leading-none">Purple Legend Figurine</span>
                        <span className="text-[8px] text-slate-500 block mt-1 uppercase">REQS: 100,000 CREATOR POINTS</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => claimGuardianStatue('purple_legend', 'Purple Legend Statue', 100000, 'Awarded to legendary ecosystem leaders.')}
                        className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg border transition-all ${
                          claimedAwards.includes('purple_legend') 
                            ? 'bg-fuchsia-950/40 border-fuchsia-500/30 text-fuchsia-400 cursor-not-allowed' 
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {claimedAwards.includes('purple_legend') ? 'ACTIVE' : 'CLAIM'}
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* 13. REWARD STORE REDEMPTIONS */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setCollapseState(c => ({ ...c, rewardStore: !c.rewardStore }))}
                className="w-full flex items-center justify-between text-left cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <Gift className="w-4.5 h-4.5 text-indigo-400" />
                  <div>
                    <h4 className="font-extrabold text-white text-xs uppercase tracking-wider leading-none">13. Reward Store</h4>
                    <p className="text-[9px] font-mono text-slate-400 uppercase leading-none mt-1.5">Redeem points for premium goods</p>
                  </div>
                </div>
                {collapseState.rewardStore ? <ChevronRight className="w-4.5 h-4.5 text-slate-500" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-500" />}
              </button>

              {!collapseState.rewardStore && (
                <div className="pt-4 border-t border-slate-850 mt-4 space-y-3 text-[10.5px]">
                  
                  {/* Item 1 */}
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                    <div>
                      <span className="block font-black text-white leading-none">Premium Membership</span>
                      <span className="text-[8px] text-slate-500 block mt-0.5 font-mono">1 Month full subscription</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => redeemReward('premium_membership', 800, 'Premium Membership')}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-lg text-[9px] uppercase tracking-wider font-mono"
                    >
                      800 PTS
                    </button>
                  </div>

                  {/* Item 2 */}
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                    <div>
                      <span className="block font-black text-white leading-none">Verified Creator Badge</span>
                      <span className="text-[8px] text-slate-500 block mt-0.5 font-mono">Dynamic profile glow highlight</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => redeemReward('creator_badge', 400, 'Verified Creator Badge')}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-lg text-[9px] uppercase tracking-wider font-mono"
                    >
                      400 PTS
                    </button>
                  </div>

                  {/* Item 3 */}
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                    <div>
                      <span className="block font-black text-white leading-none">Official safety certificate</span>
                      <span className="text-[8px] text-slate-500 block mt-0.5 font-mono">Signed civilian grid certificate</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => redeemReward('safety_certificate', 1200, 'Official safety certificate')}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-lg text-[9px] uppercase tracking-wider font-mono"
                    >
                      1.2k PTS
                    </button>
                  </div>

                  {/* Item 4 */}
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                    <div>
                      <span className="block font-black text-white leading-none">Emergency Kit Merchandise</span>
                      <span className="text-[8px] text-slate-500 block mt-0.5 font-mono">Custom Endlif medical field pouch</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => redeemReward('emergency_kit', 3000, 'Emergency Kit Merchandise')}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-lg text-[9px] uppercase tracking-wider font-mono"
                    >
                      3k PTS
                    </button>
                  </div>

                  {/* Item 5 */}
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                    <div>
                      <span className="block font-black text-white leading-none">ENDLIF Merchandise Kit</span>
                      <span className="text-[8px] text-slate-500 block mt-0.5 font-mono">Premium safety hoodie and caps</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => redeemReward('endlif_merch', 5000, 'ENDLIF Merchandise Kit')}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-lg text-[9px] uppercase tracking-wider font-mono"
                    >
                      5k PTS
                    </button>
                  </div>

                  {/* Item 6 */}
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                    <div>
                      <span className="block font-black text-white leading-none">Exclusive Themes</span>
                      <span className="text-[8px] text-slate-500 block mt-0.5 font-mono">Amber twilight custom style pack</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => redeemReward('amber_theme', 600, 'Exclusive Themes')}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-lg text-[9px] uppercase tracking-wider font-mono"
                    >
                      600 PTS
                    </button>
                  </div>

                  {/* Item 7 */}
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                    <div>
                      <span className="block font-black text-white leading-none">AI Assistant Credits</span>
                      <span className="text-[8px] text-slate-500 block mt-0.5 font-mono">Additional offline verification tokens</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => redeemReward('ai_credits', 500, 'AI Assistant Credits')}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-lg text-[9px] uppercase tracking-wider font-mono"
                    >
                      500 PTS
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
