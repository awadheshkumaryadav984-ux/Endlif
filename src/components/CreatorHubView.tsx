import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Flame, 
  Zap, 
  Award, 
  Sparkles, 
  Plus, 
  Video, 
  Share2, 
  Heart, 
  MessageSquare, 
  Tv, 
  Trophy, 
  Check, 
  ChevronRight, 
  UserPlus, 
  Loader2, 
  Crown, 
  Image as ImageIcon, 
  Camera, 
  Globe, 
  Lock, 
  Settings, 
  PlusSquare, 
  Gift, 
  ExternalLink, 
  Coins, 
  Trash2,
  FileText,
  BookOpen,
  Send,
  MessageCircle,
  TrendingUp,
  Sliders,
  Bell,
  X,
  Upload,
  Play,
  Pause,
  Volume2,
  FileUp,
  Eye,
  ArrowRight
} from 'lucide-react';

interface LeaderboardItem {
  rank: number;
  name: string;
  username: string;
  avatar: string;
  points: number;
  subscribers: number;
  achievements: string[];
  awardsEarned: string[];
  isUser?: boolean;
}

interface FeedItem {
  id: string;
  type: 'video' | 'post' | 'article';
  title: string;
  category: string;
  content?: string; // body for post or article
  duration?: string; // for videos
  author: string;
  views: number;
  likes: number;
  shares: number;
  commentsCount: number;
  timestamp: string;
  isCustom?: boolean;
  mediaUrl?: string; // base64 preview of uploaded image
  fileName?: string; // name of uploaded file
  fileSize?: string; // size of uploaded file
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
];

const PRESET_BANNERS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80", 
  "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80", 
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80", 
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80"  
];

const GUARDIAN_TROPHIES = [
  {
    id: 'green_impact',
    name: 'Green Guardian',
    color: 'emerald',
    pointsReq: 10000,
    accentColor: '#10b981',
    accentText: 'text-emerald-450',
    titleText: 'GREEN IMPACT AWARD',
    pedestalText: 'GREEN AWARD',
    motto: 'INFINITE IMPACT. ENDLESS LEGACY.',
    badgeId: 'green_impact',
    glowColor: 'shadow-[0_0_30px_rgba(16,185,129,0.35)] border-emerald-500/40',
    baseBg: 'from-emerald-950 via-slate-900 to-emerald-950',
    textColor: 'text-emerald-300',
    description: 'Formed of reinforced carbon-density polymers and emerald alloy, this statue is given to grid guardians who reach major digital impact coordinates of 10k points.'
  },
  {
    id: 'red_champion',
    name: 'Red Guardian',
    color: 'red',
    pointsReq: 100000,
    accentColor: '#f43f5e',
    accentText: 'text-rose-450',
    titleText: 'RED CHAMPION AWARD',
    pedestalText: 'RED AWARD',
    motto: 'TACTICAL INFLUENCE. ENDLESS COMMAND.',
    badgeId: 'red_champion',
    glowColor: 'shadow-[0_0_30px_rgba(244,63,94,0.35)] border-rose-500/40',
    baseBg: 'from-rose-950 via-slate-900 to-rose-950',
    textColor: 'text-rose-300',
    description: 'Forged in ultra-durable titanium-graphene rose composite, this prestigious armor statue is granted to elite tactical command coordinators who cross 100k points.'
  },
  {
    id: 'purple_legend',
    name: 'Purple Guardian',
    color: 'purple',
    pointsReq: 500000,
    accentColor: '#a855f7',
    accentText: 'text-fuchsia-450',
    titleText: 'PURPLE LEGEND AWARD',
    pedestalText: 'PURPLE AWARD',
    motto: 'ULTIMATE LEADERSHIP. ENDLESS COGNITION.',
    badgeId: 'purple_legend',
    glowColor: 'shadow-[0_0_30px_rgba(168,85,247,0.35)] border-fuchsia-500/40',
    baseBg: 'from-fuchsia-950 via-slate-900 to-fuchsia-950',
    textColor: 'text-fuchsia-300',
    description: 'The absolute zenith of civic-safeguarding achievement. Cast in pure quantum-resonance fuchsia iridium, representing the ultimate advisor status at 500k points.'
  }
];

const ShieldInfinityGuardStatue = ({ color, isUnlocked }: { color: string; isUnlocked: boolean }) => {
  // color can be 'emerald' | 'red' | 'purple'
  const glowHex = color === 'emerald' ? '#10b981' : color === 'red' ? '#f43f5e' : '#a855f7';
  const strokeColor = isUnlocked ? glowHex : '#4b5563';
  const outlineColor = isUnlocked ? glowHex : '#374151';
  const bodyOpacity = isUnlocked ? 0.95 : 0.45;
  const glowFilter = isUnlocked ? `url(#glow-${color})` : 'none';

  return (
    <svg 
      viewBox="0 0 200 320" 
      className="w-full h-72 transition-all duration-500"
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
      
      {/* Background glowing beam */}
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

      {/* Armored Cyber Knight Silhouette */}
      <g opacity={bodyOpacity}>
        {/* Halo Crown behind the head */}
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

        {/* Outer spikes/aura wings representing the epic ornament in the photo */}
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

        {/* High Headress Horns */}
        <path d="M 90 60 L 80 25 L 93 45 Z" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />
        <path d="M 110 60 L 120 25 L 107 45 Z" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />
        <path d="M 100 48 L 100 20 Z" stroke={glowHex} strokeWidth="2" filter={glowFilter} />

        {/* Helmet / Cybernetic Face Mask */}
        <polygon 
          points="88,50 112,50 116,74 100,88 84,74" 
          fill="#111827" 
          stroke={strokeColor} 
          strokeWidth="1.5" 
        />
        {/* Glowing Visor Slit */}
        <polygon 
          points="92,60 108,60 105,65 95,65" 
          fill={isUnlocked ? glowHex : '#6b7280'} 
          filter={glowFilter} 
        />
        <line x1="100" y1="65" x2="100" y2="82" stroke={strokeColor} strokeWidth="1" />

        {/* Pauldrons (Spiky layered shoulders) */}
        {/* Left shoulder */}
        <path d="M 80 94 C 60 90 50 105 45 120 C 60 125 70 120 78 114 Z" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1.5" />
        <path d="M 45 120 C 40 130 45 140 55 145 C 65 140 70 130 75 125 Z" fill="#1e293b" stroke={strokeColor} strokeWidth="1.5" />
        {/* Right shoulder */}
        <path d="M 120 94 C 140 90 150 105 155 120 C 140 125 130 120 122 114 Z" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1.5" />
        <path d="M 155 120 C 160 130 155 140 145 145 C 135 140 130 130 125 125 Z" fill="#1e293b" stroke={strokeColor} strokeWidth="1.5" />

        {/* Chest Plate / Cuirass */}
        <polygon 
          points="78,96 122,96 125,145 100,165 75,145" 
          fill={`url(#grad-${color})`} 
          stroke={strokeColor} 
          strokeWidth="1.5" 
        />
        
        {/* Chest Infinity Core Reactor */}
        <circle cx="100" cy="122" r="8" fill="#090d16" stroke={strokeColor} strokeWidth="1" />
        <path 
          d="M 96 122 C 92 118 92 126 96 122 C 100 118 100 126 104 122 C 108 118 108 126 104 122" 
          fill="none" 
          stroke={isUnlocked ? glowHex : '#4b5563'} 
          strokeWidth="1.5" 
          filter={glowFilter}
        />

        {/* Abdomen / Armored Midsection */}
        <polygon 
          points="84,145 116,145 112,178 88,178" 
          fill="#111827" 
          stroke={strokeColor} 
          strokeWidth="1.5" 
        />
        <line x1="100" y1="145" x2="100" y2="178" stroke={strokeColor} strokeWidth="1" />
        <line x1="90" y1="156" x2="110" y2="156" stroke={strokeColor} strokeWidth="0.8" />
        <line x1="92" y1="166" x2="108" y2="166" stroke={strokeColor} strokeWidth="0.8" />

        {/* Tassets / Hip plates */}
        <polygon points="75,145 88,145 84,185 70,175" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />
        <polygon points="125,145 112,145 116,185 130,175" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />

        {/* Left Arm & Gauntlet */}
        <path d="M 72 118 L 52 155 L 56 182 L 70 170 Z" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />
        {/* Right Arm holding sword */}
        <path d="M 128 118 L 148 155 L 144 182 L 130 170 Z" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />

        {/* Armored Legs */}
        {/* Left Leg */}
        <polygon points="85,178 100,178 95,225 80,225" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1.2" />
        <polygon points="80,225 95,225 92,270 74,270" fill="#0f172a" stroke={strokeColor} strokeWidth="1.2" />
        <polygon points="74,270 92,270 90,285 70,285" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />
        {/* Right Leg */}
        <polygon points="100,178 115,178 120,225 105,225" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1.2" />
        <polygon points="105,225 120,225 126,270 108,270" fill="#0f172a" stroke={strokeColor} strokeWidth="1.2" />
        <polygon points="108,270 126,270 130,285 110,285" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />

        {/* Cape behind the statue */}
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

        {/* THE ROYAL INFINITY GREATSWORD */}
        {/* Sword Blade aligned vertically in the center */}
        <path 
          d="M 98 85 L 102 85 L 101.5 242 L 98.5 242 Z" 
          fill={isUnlocked ? glowHex : '#374151'} 
          stroke={strokeColor} 
          strokeWidth="1" 
          filter={glowFilter}
        />
        {/* Central glowing fuller line */}
        <line x1="100" y1="90" x2="100" y2="240" stroke={isUnlocked ? '#ffffff' : '#4b5563'} strokeWidth="1" />

        {/* Sword Crossguard */}
        <polygon points="90,242 110,242 105,246 95,246" fill="#1e293b" stroke={strokeColor} strokeWidth="1.2" />

        {/* Sword Hilt Grip */}
        <rect x="98" y="246" width="4" height="25" fill="#0f172a" stroke={strokeColor} strokeWidth="1" />

        {/* AMAZING INFINITY LOOP HANDLE / POMMEL */}
        <path 
          d="M 94 275 C 89 268 83 275 88 280 C 93 285 107 265 112 270 C 117 275 111 282 106 275 C 101 268 97 282 94 275" 
          fill="none" 
          stroke={isUnlocked ? glowHex : '#4b5563'} 
          strokeWidth="2.5" 
          filter={glowFilter}
        />
        {/* Glowing aura core for sword hilt */}
        {isUnlocked && (
          <circle cx="100" cy="275" r="3" fill="#ffffff" filter={glowFilter} />
        )}
      </g>
    </svg>
  );
};

export default function CreatorHubView() {
  // --- Persistent Storage State ---
  const [hasChannel, setHasChannel] = useState<boolean>(() => {
    return localStorage.getItem('endlif_channel_created') === 'true';
  });

  const [channelName, setChannelName] = useState<string>(() => {
    return localStorage.getItem('endlif_channel_name') || '';
  });

  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem('endlif_channel_username') || '';
  });

  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    return localStorage.getItem('endlif_channel_avatar') || PRESET_AVATARS[0];
  });

  const [bannerUrl, setBannerUrl] = useState<string>(() => {
    return localStorage.getItem('endlif_channel_banner') || PRESET_BANNERS[0];
  });

  const [channelCategory, setChannelCategory] = useState<string>(() => {
    return localStorage.getItem('endlif_channel_category') || 'Education';
  });

  const [points, setPoints] = useState<number>(() => {
    const saved = localStorage.getItem('endlif_channel_points');
    return saved ? parseInt(saved, 10) : 1200;
  });

  // Core stats
  const [subscribers, setSubscribers] = useState<number>(() => {
    const saved = localStorage.getItem('endlif_channel_subscribers');
    return saved ? parseInt(saved, 10) : 148;
  });

  const [views, setViews] = useState<number>(() => {
    const saved = localStorage.getItem('endlif_channel_views');
    return saved ? parseInt(saved, 10) : 3420;
  });

  const [likes, setLikes] = useState<number>(() => {
    const saved = localStorage.getItem('endlif_channel_likes');
    return saved ? parseInt(saved, 10) : 512;
  });

  const [shares, setShares] = useState<number>(() => {
    const saved = localStorage.getItem('endlif_channel_shares');
    return saved ? parseInt(saved, 10) : 96;
  });

  const [activeFollowers, setActiveFollowers] = useState<number>(() => {
    const saved = localStorage.getItem('endlif_channel_active_followers');
    return saved ? parseInt(saved, 10) : 84;
  });

  // Track dynamic claimed badges
  const [claimedAwards, setClaimedAwards] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('endlif_channel_claimed_awards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Uploaded and Seeded feed items: unified collection of videos, posts, and articles
  const [feedItems, setFeedItems] = useState<FeedItem[]>(() => {
    try {
      const saved = localStorage.getItem('endlif_channel_feed');
      return saved ? JSON.parse(saved) : [
        {
          id: 'item_1',
          type: 'video',
          title: 'Direct Survival Blueprint: How to Hardset Ad-Hoc Emergency Antennas',
          category: 'Technology',
          duration: '12:45',
          author: 'Self',
          views: 1240,
          likes: 198,
          shares: 42,
          commentsCount: 16,
          timestamp: '2026-06-11 12:44',
          fileName: 'antenna_setup_hq.mp4',
          fileSize: '42.8 MB'
        },
        {
          id: 'item_2',
          type: 'post',
          title: 'Immediate Alert: Local Emergency Backup Check-ins',
          category: 'Motivation',
          content: 'A quick reminder to configure periodic fail-safe alarms tonight. High voltage lightning is projected across Southern grid node sectors. Keep physical radio receivers calibrated to 88.5 FM.',
          author: 'Self',
          views: 940,
          likes: 112,
          shares: 28,
          commentsCount: 9,
          timestamp: '2026-06-13 18:20',
          mediaUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80'
        },
        {
          id: 'item_3',
          type: 'article',
          title: 'The Blueprint for Hyper-Localized Water Preservation and Siphon Science',
          category: 'Education',
          content: 'As public piping structures become highly vulnerable under dynamic atmospheric adjustments, maintaining local gravity-powered filtration siphons should be prioritized inside domestic shelter networks. This step-by-step master plan details the optimal sand-carbon density ratios for purifying rainwater under 5 minutes without electrical heat inputs.',
          author: 'Self',
          views: 1420,
          likes: 202,
          shares: 54,
          commentsCount: 22,
          timestamp: '2026-06-10 14:02'
        }
      ];
    } catch {
      return [];
    }
  });

  // Interactive Content Studio Mode inside Dashboard
  const [studioTab, setStudioTab] = useState<'video' | 'post' | 'article'>('video');
  const [feedFilterTab, setFeedFilterTab] = useState<'all' | 'video' | 'post' | 'article'>('all');

  // Form states for general channel setup
  const [setupName, setSetupName] = useState('');
  const [setupUsername, setSetupUsername] = useState('');
  const [setupCategory, setSetupCategory] = useState('Education');
  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState(0);
  const [selectedBannerIdx, setSelectedBannerIdx] = useState(0);

  // Referral state inputs
  const [refName, setRefName] = useState('');
  const [refContact, setRefContact] = useState('');
  const [isAddingReferral, setIsAddingReferral] = useState(false);

  // Studio Upload Form fields
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Education');
  const [uploadContent, setUploadContent] = useState('');
  const [uploadDuration, setUploadDuration] = useState('3:45');
  
  // High-fidelity file upload simulation states
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState('');
  const [uploadFileBase64, setUploadFileBase64] = useState('');
  const [uploadFileProgress, setUploadFileProgress] = useState(0);
  const [uploadingState, setUploadingState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expanded View Modal/Overlay for Feed Items (Videos, Articles, Posts)
  const [viewingItem, setViewingItem] = useState<FeedItem | null>(null);
  const [videoPlaybackProgress, setVideoPlaybackProgress] = useState(0);
  const [videoIsPlaying, setVideoIsPlaying] = useState(true);
  const playTimerRef = useRef<any>(null);

  // Popup overlay celebrating unlocked trophy badges
  const [activeNotification, setActiveNotification] = useState<{
    id: string;
    title: string;
    badge: string;
    description: string;
    reward: string;
    color: string;
  } | null>(null);

  // Expanded View Modal/Overlay for inspecting Guardian Statues/Trophies
  const [inspectingTrophy, setInspectingTrophy] = useState<any | null>(null);

  // Synchronize dynamic persistent variables with localStorage
  useEffect(() => {
    localStorage.setItem('endlif_channel_created', hasChannel ? 'true' : 'false');
    localStorage.setItem('endlif_channel_name', channelName);
    localStorage.setItem('endlif_channel_username', username);
    localStorage.setItem('endlif_channel_avatar', avatarUrl);
    localStorage.setItem('endlif_channel_banner', bannerUrl);
    localStorage.setItem('endlif_channel_category', channelCategory);
    localStorage.setItem('endlif_channel_points', points.toString());
    localStorage.setItem('endlif_channel_subscribers', subscribers.toString());
    localStorage.setItem('endlif_channel_views', views.toString());
    localStorage.setItem('endlif_channel_likes', likes.toString());
    localStorage.setItem('endlif_channel_shares', shares.toString());
    localStorage.setItem('endlif_channel_active_followers', activeFollowers.toString());
    localStorage.setItem('endlif_channel_claimed_awards', JSON.stringify(claimedAwards));
    localStorage.setItem('endlif_channel_feed', JSON.stringify(feedItems));
  }, [hasChannel, channelName, username, avatarUrl, bannerUrl, channelCategory, points, subscribers, views, likes, shares, activeFollowers, claimedAwards, feedItems]);

  // Handle mock video slider simulation in modal open State
  useEffect(() => {
    if (viewingItem && viewingItem.type === 'video' && videoIsPlaying) {
      playTimerRef.current = setInterval(() => {
        setVideoPlaybackProgress(prev => {
          if (prev >= 100) {
            return 0; // restart/loop
          }
          return prev + 1.2;
        });
      }, 150);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [viewingItem, videoIsPlaying]);

  // Integrated metrics as requested
  const communityMembers = subscribers + activeFollowers;
  const activeMembers = Math.floor(views * 0.14) + communityMembers;
  const weeklyGrowth = `+${Math.floor((points / 25) + 4)}%`;

  // Game Ranking Structure Config
  const AWARDS_TIERS = [
    {
      id: 'blue_guardian',
      name: '🔵 BLUE GUARDIAN AWARD',
      pointsReq: 1000,
      badge: '🔵 Blue Guardian Badge',
      color: 'from-blue-600 via-indigo-600 to-slate-900 border-blue-500/50',
      description: 'Acquired early in the civic-safety contribution journey.',
      rewards: [
        'Exclusive Blue Profile Badge Icon',
        'Special Profile Avatar Frame Highlight',
        'Early Leaderboard indexing inclusion'
      ]
    },
    {
      id: 'green_impact',
      name: '🟢 GREEN IMPACT AWARD',
      pointsReq: 10000,
      badge: '🟢 Green Impact Trophy',
      color: 'from-emerald-600 via-teal-600 to-slate-900 border-emerald-500/50',
      description: 'Celebrates exceptional local content reach scores.',
      rewards: [
        '3 Months Complimentary Premium Upgrades',
        'Official Endlif Survival Gift Box (First aid kit, custom badges)',
        'Ecosystem Brand Ambassador status',
        'Dynamic digital Guardian Achievement Trophy'
      ]
    },
    {
      id: 'red_champion',
      name: '🔴 RED CHAMPION AWARD',
      pointsReq: 100000,
      badge: '🔴 Red Champion Emblem',
      color: 'from-rose-600 via-rose-700 to-slate-900 border-rose-500/50',
      description: 'Granted to high performers with wide digital authority.',
      rewards: [
        '1 Year Free Premium Subscription Key',
        'Official Glass-Engraved Endlif Champion Trophy',
        'Exclusive Endlif Field Merchandise kit (Premium Hoodie & Caps)',
        'Featured Channel on global Frontpage spotlights'
      ]
    },
    {
      id: 'purple_legend',
      name: '🟣 PURPLE LEGEND AWARD',
      pointsReq: 500000,
      badge: '🟣 Purple Legendary Crown',
      color: 'from-purple-600 via-fuchsia-700 to-slate-900 border-purple-500/50',
      description: 'The pinnacle of community leadership, resilience, and civic construction.',
      rewards: [
        'Lifetime Premium VIP Account Status',
        'Permanent Hall of Legends induction position',
        'Direct developer panel advisory voting access'
      ]
    }
  ];

  // Derive Rank Details dynamically
  const getRankDetails = () => {
    if (points >= 500000) return { rank: 'Endlif Legend', level: 'Level 5', icon: '💎', nextAward: null };
    if (points >= 100000) return { rank: 'Endlif Champion', level: 'Level 4', icon: '🏆', nextAward: { id: 'purple_legend', req: 500000, rem: 500000 - points } };
    if (points >= 10000) return { rank: 'Endlif Guardian', level: 'Level 3', icon: '🛡️', nextAward: { id: 'red_champion', req: 100000, rem: 100000 - points } };
    if (points >= 1000) return { rank: 'Rising Star', level: 'Level 2', icon: '🌟', nextAward: { id: 'green_impact', req: 10000, rem: 10000 - points } };
    return { rank: 'Pioneer Scout', level: 'Level 1', icon: '🌱', nextAward: { id: 'blue_guardian', req: 1000, rem: 1000 - points } };
  };

  const rankDetails = getRankDetails();

  // Seed Static Top Creators for Hall of Legends
  const HALL_OF_LEGENDS_STATIC: LeaderboardItem[] = [
    {
      rank: 1,
      name: "Major Brody",
      username: "@brody_preparedness",
      avatar: "https://images.unsplash.com/photo-1550064876-c29b2933010b?w=150&auto=format&fit=crop&q=80",
      points: 584000,
      subscribers: 14200,
      achievements: ["Ecosystem Founder", "Lifetime Admiral"],
      awardsEarned: ["🏆 CHAMPION", "💎 LEGEND", "🔵 BLUE GUARDIAN"]
    },
    {
      rank: 2,
      name: "Sarah Connor",
      username: "@sarah_preparedness",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      points: 512000,
      subscribers: 10900,
      achievements: ["Emergency Drills Advisor"],
      awardsEarned: ["🏆 CHAMPION", "💎 LEGEND", "🛡️ GUARDIAN"]
    },
    {
      rank: 3,
      name: "Neo CyberGuard",
      username: "@neo_shield",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      points: 215300,
      subscribers: 6100,
      achievements: ["Anti-Hack Advisor", "Tactical Architect"],
      awardsEarned: ["🏆 CHAMPION", "🛡️ GUARDIAN"]
    }
  ];

  // Dynamic user injection based on point standing
  const getDynamicLeaderboard = (): LeaderboardItem[] => {
    const list = [...HALL_OF_LEGENDS_STATIC];
    if (hasChannel) {
      const activeUserAwards: string[] = [];
      if (points >= 1000) activeUserAwards.push("🔵 GUARDIAN BADGE");
      if (points >= 10000) activeUserAwards.push("🟢 IMPACT TROPHY");
      if (points >= 100000) activeUserAwards.push("🔴 CHAMPION EMBLEM");
      if (points >= 500000) activeUserAwards.push("🟣 LEGENDARY CROWN");

      const userItem: LeaderboardItem = {
        rank: 99,
        name: channelName || "You",
        username: username || "@your_handle",
        avatar: avatarUrl,
        points: points,
        subscribers: subscribers,
        achievements: [rankDetails.rank, "Pioneer Explorer"],
        awardsEarned: activeUserAwards,
        isUser: true
      };
      
      list.push(userItem);
    }
    
    return list
      .sort((a, b) => b.points - a.points)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  };

  const currentLeaderboard = getDynamicLeaderboard();

  // --- File Processing (Drag & Drop + Input File) ---

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setUploadFileName(file.name);
    
    // Calculate readable file size
    const mb = file.size / (1024 * 1024);
    if (mb >= 1) {
      setUploadFileSize(`${mb.toFixed(1)} MB`);
    } else {
      setUploadFileSize(`${(file.size / 1024).toFixed(0)} KB`);
    }

    // Auto load text for articles using FileReader
    if (studioTab === 'article' && (file.name.endsWith('.txt') || file.name.endsWith('.md'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          const lines = text.split('\n');
          const firstLine = lines[0]?.trim() || '';
          // If first line behaves like markdown title
          const prospectiveTitle = firstLine.replace(/^#+\s*/, '');
          if (prospectiveTitle && prospectiveTitle.length > 3) {
            setUploadTitle(prospectiveTitle);
            setUploadContent(lines.slice(1).join('\n').trim());
          } else {
            setUploadContent(text);
          }
          showSuccessToast("📄 Local file contents loaded directly into draft article!");
        }
      };
      reader.readAsText(file);
    }

    // Capture base64 representation if images uploaded for posts or articles
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadFileBase64(result);
        showSuccessToast("🖼️ Selected Image attached to Draft successfully!");
      };
      reader.readAsDataURL(file);
    } else if (studioTab === 'video') {
      showSuccessToast(`📹 Video file "${file.name}" linked. Ready to broadcast.`);
      // Extract simulated duration from random numbers to make it seamless
      const durationMin = Math.floor(Math.random() * 8) + 3;
      const durationSec = Math.floor(Math.random() * 50) + 10;
      setUploadDuration(`${durationMin}:${durationSec}`);
    } else {
      showSuccessToast(`📎 File linked: "${file.name}"`);
    }
  };

  const triggerUploadInputClick = () => {
    fileInputRef.current?.click();
  };

  // --- Actions ---

  const handleSetupChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupName.trim() || !setupUsername.trim()) return;

    const formattedUsername = setupUsername.startsWith('@') ? setupUsername : `@${setupUsername}`;
    
    setChannelName(setupName);
    setUsername(formattedUsername);
    setChannelCategory(setupCategory);
    setAvatarUrl(PRESET_AVATARS[selectedAvatarIdx]);
    setBannerUrl(PRESET_BANNERS[selectedBannerIdx]);
    setHasChannel(true);

    // Give points for setting up
    setPoints(prev => prev + 150);
    showSuccessToast("Channel initialized! +150 Points received.");

    if (window.navigator?.vibrate) {
      window.navigator.vibrate([100, 50, 100]);
    }
  };

  const handleStudioUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      alert("Please provide a title for your broadcast draft.");
      return;
    }

    setUploadingState('processing');
    setUploadFileProgress(0);

    // Animate a professional real-time uploader process
    const interval = setInterval(() => {
      setUploadFileProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadingState('success');
          
          setTimeout(() => {
            let ptsGained = 50;
            let iconNotification = "💬 Info Alert Broadcasted Live!";
            
            if (studioTab === 'video') {
              ptsGained = 150;
              iconNotification = "📹 Tactical Video Drill Approved!";
            } else if (studioTab === 'article') {
              ptsGained = 200;
              iconNotification = "📄 Verified Expert Article Published!";
            }

            const newItem: FeedItem = {
              id: `item_${Date.now()}`,
              type: studioTab,
              title: uploadTitle,
              category: uploadCategory,
              content: studioTab !== 'video' ? uploadContent : undefined,
              duration: studioTab === 'video' ? uploadDuration : undefined,
              author: 'Self',
              views: Math.floor(Math.random() * 40) + 20,
              likes: Math.floor(Math.random() * 10) + 2,
              shares: Math.floor(Math.random() * 6) + 1,
              commentsCount: Math.floor(Math.random() * 3),
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              isCustom: true,
              mediaUrl: uploadFileBase64 || undefined,
              fileName: uploadFileName || undefined,
              fileSize: uploadFileSize || undefined
            };

            setFeedItems(prev => [newItem, ...prev]);
            setPoints(prev => prev + ptsGained);
            
            // Increment creator general scores
            setViews(prev => prev + newItem.views);
            setLikes(prev => prev + newItem.likes);
            setShares(prev => prev + newItem.shares);

            // Reset field states
            setUploadTitle('');
            setUploadContent('');
            setUploadFileName('');
            setUploadFileSize('');
            setUploadFileBase64('');
            setUploadFileProgress(0);
            setUploadingState('idle');

            showSuccessToast(`${iconNotification} +${ptsGained} PTS Credited!`);
            
            if (window.navigator?.vibrate) {
              window.navigator.vibrate([120, 40, 120]);
            }
          }, 800);

          return 100;
        }
        return prev + Math.floor(Math.random() * 16) + 10;
      });
    }, 150);
  };

  const showSuccessToast = (message: string) => {
    // Elegant toast banner
    const existing = document.getElementById('endlif-success-toast');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'endlif-success-toast';
    banner.className = 'fixed bottom-6 right-6 bg-slate-900 border border-emerald-450 text-emerald-100 py-3.5 px-6 rounded-2xl shadow-xl z-[999999] text-xs font-bold tracking-wider uppercase flex items-center gap-2 max-w-sm transition-all duration-300 ease-out translate-y-0';
    banner.innerHTML = `🌟 ${message}`;
    document.body.appendChild(banner);
    
    setTimeout(() => {
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(15px)';
      setTimeout(() => banner.remove(), 400);
    }, 3200);
  };

  const handleReferralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refName.trim() || !refContact.trim()) return;

    setIsAddingReferral(true);

    setTimeout(() => {
      const pointsGained = 100;
      setPoints(prev => prev + pointsGained);
      setSubscribers(prev => prev + 1);
      setActiveFollowers(prev => prev + 2);

      setRefName('');
      setRefContact('');
      setIsAddingReferral(false);

      showSuccessToast(`Referral Registered! +${pointsGained} Points Awarded.`);

      if (window.navigator?.vibrate) {
        window.navigator.vibrate([80, 50, 80]);
      }
    }, 1000);
  };

  const triggerEngagementBonus = () => {
    const bonusPts = 250;
    setPoints(prev => prev + bonusPts);
    setSubscribers(prev => prev + Math.floor(Math.random() * 15) + 8);
    setViews(prev => prev + Math.floor(Math.random() * 400) + 200);
    setActiveFollowers(prev => prev + Math.floor(Math.random() * 10) + 5);

    showSuccessToast(`🔥 High Engagement Bonus Activated! +${bonusPts} PTS.`);
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([150, 50, 150]);
    }
  };

  const simulateItemLike = (id: string, currentlyLiked: number) => {
    const ptsAwarded = 5;
    setPoints(prev => prev + ptsAwarded);
    setLikes(prev => prev + 1);

    setFeedItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, likes: item.likes + 1 };
      }
      return item;
    }));

    showSuccessToast(`Safety Content Liked! Appraised +${ptsAwarded} PTS.`);
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([50]);
    }
  };

  const simulateItemShare = (id: string, currentlyShared: number) => {
    const ptsAwarded = 10;
    setPoints(prev => prev + ptsAwarded);
    setShares(prev => prev + 1);

    setFeedItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, shares: item.shares + 1 };
      }
      return item;
    }));

    showSuccessToast(`Content Distributed! Accredited +${ptsAwarded} PTS.`);
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([60]);
    }
  };

  const claimGamingBadge = (tierId: string, badgeName: string, reqPoints: number, desc: string) => {
    if (points < reqPoints) {
      alert(`Voucher locked! You need at least ${reqPoints.toLocaleString()} points to extract this award. Currently you have ${points.toLocaleString()} points.`);
      return;
    }

    if (claimedAwards.includes(tierId)) {
      showSuccessToast(`You already claimed the ${badgeName}!`);
      return;
    }

    setClaimedAwards(prev => [...prev, tierId]);

    const activeTierObj = AWARDS_TIERS.find(t => t.id === tierId);
    setActiveNotification({
      id: tierId,
      title: badgeName,
      badge: badgeName,
      description: desc,
      reward: activeTierObj ? activeTierObj.rewards.join(', ') : 'Exclusive Access Privileges',
      color: 'bg-indigo-600'
    });

    if (window.navigator?.vibrate) {
      window.navigator.vibrate([100, 100, 100, 200]);
    }
  };

  const deleteCustomItem = (id: string) => {
    if (confirm("Are you sure you want to delete this resource post?")) {
      setFeedItems(prev => prev.filter(item => item.id !== id));
      showSuccessToast("Successfully deleted content post from channel archive.");
    }
  };

  const resetAllState = () => {
    if (confirm("Reset Creator Hub data? This will purge subscribers, points, and channel assets back to safe defaults.")) {
      localStorage.removeItem('endlif_channel_created');
      localStorage.removeItem('endlif_channel_name');
      localStorage.removeItem('endlif_channel_username');
      localStorage.removeItem('endlif_channel_avatar');
      localStorage.removeItem('endlif_channel_banner');
      localStorage.removeItem('endlif_channel_category');
      localStorage.removeItem('endlif_channel_points');
      localStorage.removeItem('endlif_channel_subscribers');
      localStorage.removeItem('endlif_channel_views');
      localStorage.removeItem('endlif_channel_likes');
      localStorage.removeItem('endlif_channel_shares');
      localStorage.removeItem('endlif_channel_active_followers');
      localStorage.removeItem('endlif_channel_claimed_awards');
      localStorage.removeItem('endlif_channel_feed');

      setHasChannel(false);
      setChannelName('');
      setUsername('');
      setPoints(1200);
      setSubscribers(148);
      setViews(3420);
      setLikes(512);
      setShares(96);
      setActiveFollowers(84);
      setClaimedAwards([]);
      // Reset Default Feed Items
      setFeedItems([
        {
          id: 'item_1',
          type: 'video',
          title: 'Direct Survival Blueprint: How to Hardset Ad-Hoc Emergency Antennas',
          category: 'Technology',
          duration: '12:45',
          author: 'Self',
          views: 1240,
          likes: 198,
          shares: 42,
          commentsCount: 16,
          timestamp: '2026-06-11 12:44',
          fileName: 'antenna_setup_hq.mp4',
          fileSize: '42.8 MB'
        },
        {
          id: 'item_2',
          type: 'post',
          title: 'Immediate Alert: Local Emergency Backup Check-ins',
          category: 'Motivation',
          content: 'A quick reminder to configure periodic fail-safe alarms tonight. High voltage lightning is projected across Southern grid node sectors. Keep physical radio receivers calibrated to 88.5 FM.',
          author: 'Self',
          views: 940,
          likes: 112,
          shares: 28,
          commentsCount: 9,
          timestamp: '2026-06-13 18:20',
          mediaUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80'
        }
      ]);
      showSuccessToast("Creator Hub state returned to defaults.");
    }
  };

  const activeFilteredItems = feedItems.filter(item => {
    if (feedFilterTab === 'all') return true;
    return item.type === feedFilterTab;
  });

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 py-4 pb-28 text-slate-800 space-y-6 mt-16 text-left selection:bg-indigo-100 font-sans max-w-7xl mx-auto">
      
      {/* 1. CELEBRATION BADGE MODAL */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 text-center text-slate-100"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-700/60 p-8 rounded-[32px] w-full max-w-sm space-y-6 relative overflow-hidden"
            >
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-555/10 rounded-full blur-2xl" />

              <div className="flex justify-center">
                {['green_impact', 'red_champion', 'purple_legend'].includes(activeNotification.id) ? (
                  <div className="w-full h-72 flex justify-center -my-6 scale-90 relative">
                    <ShieldInfinityGuardStatue 
                      color={
                        activeNotification.id === 'green_impact' ? 'emerald' : 
                        activeNotification.id === 'red_champion' ? 'red' : 'purple'
                      } 
                      isUnlocked={true} 
                    />
                  </div>
                ) : (
                  <span className="text-6xl animate-bounce">🏆</span>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-black tracking-widest text-indigo-400 font-mono uppercase bg-indigo-950 border border-indigo-900 px-3.5 py-1.5 rounded-full">
                  {['green_impact', 'red_champion', 'purple_legend'].includes(activeNotification.id) ? '🛡️ GUARDIAN STATUE SECURED' : 'AWARD SECURELY CLAIMED'}
                </span>
                <h3 className="text-xl font-black uppercase text-slate-100 leading-tight">
                  {activeNotification.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  {activeNotification.description}
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left space-y-3">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-mono">UNLOCKED REWARDS & CODES</span>
                <p className="text-xs text-slate-350 leading-relaxed font-medium">
                  {activeNotification.reward}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveNotification(null)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg"
              >
                Accept Rewards & Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1.5 TROPHY INSPECTION VIEWPORT MODAL */}
      <AnimatePresence>
        {inspectingTrophy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setInspectingTrophy(null)}
            className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 text-center text-slate-100"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[36px] w-full max-w-lg space-y-6 relative overflow-hidden"
            >
              <button
                onClick={() => setInspectingTrophy(null)}
                className="absolute top-4 right-4 bg-slate-800 p-2 rounded-full text-slate-300 hover:text-white cursor-pointer z-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute -top-24 -left-24 w-52 h-52 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
              <div 
                className="absolute -bottom-24 -right-24 w-52 h-52 rounded-full blur-3xl animate-pulse" 
                style={{ backgroundColor: `${inspectingTrophy.accentColor}15` }}
              />

              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black tracking-widest text-indigo-400 font-mono uppercase bg-indigo-950/80 border border-indigo-900 px-3.5 py-1.5 rounded-full mb-3">
                  GUARDIAN CHRONICLE VESSEL
                </span>
                
                {/* Detailed Larger SVG Model */}
                <div className="w-full h-80 flex justify-center -my-4 relative">
                  <ShieldInfinityGuardStatue color={inspectingTrophy.color} isUnlocked={claimedAwards.includes(inspectingTrophy.id)} />
                </div>

                <div className="space-y-1.5 text-center px-4">
                  <h3 className="text-xl font-black uppercase text-slate-50 leading-tight tracking-tight">
                    {inspectingTrophy.name} Status Statue
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 bg-slate-800 border border-slate-700 text-slate-400 rounded">
                      Pedestal: {inspectingTrophy.pedestalText}
                    </span>
                    <span className={`text-[9px] font-mono font-black uppercase py-0.5 px-2 rounded ${
                      claimedAwards.includes(inspectingTrophy.id) 
                        ? 'bg-emerald-950/60 border border-emerald-500/20 text-emerald-400' 
                        : 'bg-slate-950/60 border border-slate-800 text-slate-400'
                    }`}>
                      {claimedAwards.includes(inspectingTrophy.id) ? 'Status: Active Guard' : `Forges at: ${inspectingTrophy.pointsReq.toLocaleString()} PTS`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto pt-2">
                    {inspectingTrophy.description}
                  </p>
                </div>
              </div>

              {/* Pedestal Inscriptions list inside box styling */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl text-left space-y-2.5 relative">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-mono block">
                  🛡️ pedestal gold-plate inscriptions
                </span>
                <div className="font-mono text-slate-350 space-y-1 text-[10.5px]">
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500 uppercase">Primary Title:</span>
                    <strong className="text-slate-200">ENDLIF</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500 uppercase">Motto Inscribed:</span>
                    <strong className="text-slate-200 text-right text-[9.5px] tracking-tight">{inspectingTrophy.motto}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 uppercase">Core Attribute:</span>
                    <strong className="text-slate-200">LEADER. INFLUENCER. AMBASSADOR.</strong>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInspectingTrophy(null)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-705 border border-slate-700/60 text-slate-200 font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Dismiss Terminal
                </button>
                
                {(!claimedAwards.includes(inspectingTrophy.id) && points >= inspectingTrophy.pointsReq) && (
                  <button
                    type="button"
                    onClick={() => {
                      claimGamingBadge(inspectingTrophy.id, inspectingTrophy.titleText, inspectingTrophy.pointsReq, inspectingTrophy.description);
                      setInspectingTrophy(null);
                    }}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg animate-pulse"
                  >
                    Forge Statue (+250 XP)
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. LIVE MEDIA VIEWER OVERLAY MODAL */}
      <AnimatePresence>
        {viewingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewingItem(null)}
            className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-slate-200 rounded-[28px] overflow-hidden w-full max-w-2xl text-left shadow-2xl relative"
            >
              <button
                onClick={() => setViewingItem(null)}
                className="absolute top-4 right-4 bg-slate-900/60 p-2 rounded-full text-white hover:bg-slate-900 transition-colors cursor-pointer z-50 shadow-md"
              >
                <X className="w-4 h-4" />
              </button>

              {/* VIDEO PLAYER VIEW */}
              {viewingItem.type === 'video' && (
                <div className="flex flex-col">
                  {/* Digital Canvas Screen Area */}
                  <div className="relative aspect-video bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-950 flex flex-col items-center justify-center overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between text-white z-10">
                      <span className="text-[10px] font-mono tracking-wider font-extrabold text-indigo-300">
                        📹 BROADCAST DRILL FEED ACTIVE
                      </span>
                      {viewingItem.fileSize && (
                        <span className="text-[9px] font-mono opacity-80">
                          {viewingItem.fileSize} / {viewingItem.fileName || 'stream_chunk'}
                        </span>
                      )}
                    </div>

                    {/* Animated Sine-Wave Audio Waveform Loop */}
                    {videoIsPlaying ? (
                      <div className="flex gap-1.5 items-center justify-center h-24">
                        {[0.8, 1.4, 0.6, 2.0, 1.2, 0.4, 1.7, 0.9, 1.5, 0.7, 1.9].map((val, idx) => (
                          <motion.div 
                            key={idx}
                            animate={{ scaleY: [1, val, 1] }}
                            transition={{ repeat: Infinity, duration: 1.1, delay: idx * 0.08 }}
                            className="bg-gradient-to-t from-indigo-500 to-emerald-450 w-1.5 rounded-full"
                            style={{ height: '50px', transformOrigin: 'center' }}
                          />
                        ))}
                      </div>
                    ) : (
                      <Play className="w-16 h-16 text-white stroke-[1.5] bg-indigo-600/60 p-4 rounded-full hover:scale-110 duration-200" />
                    )}

                    <div className="absolute bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <h4 className="text-sm font-extrabold text-white leading-tight uppercase">
                        {viewingItem.title}
                      </h4>
                    </div>

                    {/* Live Playback Controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-slate-950 py-3 px-4 flex items-center gap-4 text-white">
                      <button 
                        onClick={() => setVideoIsPlaying(!videoIsPlaying)}
                        className="p-1 hover:text-indigo-400 cursor-pointer"
                      >
                        {videoIsPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>

                      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden relative cursor-pointer">
                        <div 
                          className="absolute h-full bg-indigo-500 top-0 left-0 transition-all duration-150"
                          style={{ width: `${videoPlaybackProgress}%` }}
                        />
                      </div>

                      <div className="text-[10px] font-mono text-slate-300">
                        {Math.floor(videoPlaybackProgress / 20)}:{(Math.floor(videoPlaybackProgress * 3) % 60).toString().padStart(2, '0')} / {viewingItem.duration || '5:00'}
                      </div>

                      <Volume2 className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[9px] bg-slate-100 border text-slate-650 px-2.5 py-0.5 rounded font-mono font-bold uppercase">
                        Category: {viewingItem.category}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        Published by {viewingItem.author} &bull; {viewingItem.timestamp}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-base font-black text-slate-900 leading-snug">
                        Description & Transmission Metadata
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">
                        This verified tactical media drill has been distributed via low-frequency citizen radio waves. Active nodes may cache local chunks to establish high-fidelity mesh routing networks in grid shelter sectors.
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-4">
                      <div className="flex gap-4 font-mono font-bold text-slate-500">
                        <span>👀 {viewingItem.views} views</span>
                        <span>❤️ {viewingItem.likes} likes</span>
                      </div>
                      <button
                        onClick={() => {
                          simulateItemLike(viewingItem.id, viewingItem.likes);
                          setViewingItem(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
                        }}
                        className="bg-indigo-600 text-white font-extrabold text-[10px] tracking-wider uppercase px-4 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        Appraise Video (+5 PTS)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* POST VIEW */}
              {viewingItem.type === 'post' && (
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] font-black tracking-widest text-indigo-650 font-mono uppercase">
                        BROADCAST INFO ALERT
                      </span>
                      <h4 className="text-sm font-mono font-bold text-slate-450 uppercase leading-none">
                        Category: {viewingItem.category}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-black text-slate-900 leading-tight uppercase">
                      {viewingItem.title}
                    </h3>
                    
                    {viewingItem.mediaUrl && (
                      <div className="rounded-2xl overflow-hidden aspect-video relative max-h-56 bg-slate-100 border border-slate-200">
                        <img src={viewingItem.mediaUrl} alt="Attached Preview" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <p className="text-xs text-slate-600 leading-relaxed font-sans p-4 bg-slate-50 border border-slate-150 rounded-2xl font-medium whitespace-pre-wrap">
                      {viewingItem.content}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-4">
                    <div className="font-mono text-slate-400">
                      Timestamp: {viewingItem.timestamp}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          simulateItemLike(viewingItem.id, viewingItem.likes);
                          setViewingItem(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
                        }}
                        className="bg-slate-100 border hover:bg-red-50 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider px-3 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        ❤️ Like
                      </button>
                      <button
                        onClick={() => setViewingItem(null)}
                        className="bg-indigo-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ARTICLE VIEW */}
              {viewingItem.type === 'article' && (
                <div className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <span className="text-[9px] bg-emerald-50 border border-emerald-150 text-emerald-600 font-mono text-[8px] font-black uppercase py-0.5 px-2.5 rounded-full leading-none">
                        📄 VERIFIED EXPERT ARTICLE
                      </span>
                      <h4 className="text-[10px] text-slate-400 uppercase font-mono font-bold leading-none mt-1">
                        Category Area of Research: {viewingItem.category} &bull; Authored by {viewingItem.author}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-4 pr-1">
                    <h3 className="text-xl font-black text-slate-900 leading-tight uppercase font-sans">
                      {viewingItem.title}
                    </h3>

                    {viewingItem.mediaUrl && (
                      <div className="w-full h-48 rounded-2xl overflow-hidden bg-slate-50 border">
                        <img src={viewingItem.mediaUrl} alt="Header Art" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="text-xs text-slate-750 font-sans leading-relaxed space-y-3 font-normal whitespace-pre-wrap bg-slate-50/50 p-4 border border-slate-200/60 rounded-2xl">
                      {viewingItem.content}
                    </div>

                    <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl text-white space-y-1">
                      <span className="text-[8.5px] font-black tracking-widest uppercase text-indigo-400 font-mono">
                        Verification Signatures
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Signed: Endlif Civic Safety Council Mesh Registry [SHA-256 Key Verified]
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-4">
                    <span className="font-mono text-slate-400">Published: {viewingItem.timestamp}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          simulateItemShare(viewingItem.id, viewingItem.shares);
                          setViewingItem(prev => prev ? { ...prev, shares: prev.shares + 1 } : null);
                        }}
                        className="bg-slate-50 text-slate-650 hover:bg-slate-100 border text-[9.5px] font-extrabold uppercase px-3 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        🔁 Share Link
                      </button>
                      <button
                        onClick={() => setViewingItem(null)}
                        className="bg-indigo-600 text-white font-extrabold text-[9.5px] uppercase tracking-wider px-4 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        Close Reader
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. HEAD BANNER */}
      <div className="bg-gradient-to-tr from-slate-900 via-slate-950 to-indigo-950 text-white p-6 rounded-[28px] relative overflow-hidden border border-slate-850 shadow-sm">
        <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-550/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-550/5 rounded-full blur-[60px]" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 font-black tracking-widest uppercase py-0.5 px-3 rounded-full font-mono">
                ENDLIF CREATOR HUB
              </span>
              <span className="text-xs text-indigo-400 font-mono font-black">TRANSMITTER NETWORKS ONLINE</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight uppercase leading-none text-slate-100">
              CREATOR WORKSPACE
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl font-medium">
              Form your custom broadcast channel, publish off-grid survival drills, write emergency guidebooks, upload files securely, invite peers, and extract prestigious trophies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerEngagementBonus}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] tracking-wider uppercase px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 border border-indigo-500/30"
              title="Add simulated engagement boosts"
            >
              <TrendingUp className="w-3.5 h-3.5" /> Boost Analytics
            </button>
            <button
              onClick={resetAllState}
              className="bg-slate-800 hover:bg-slate-700 hover:text-red-400 text-slate-350 p-2.5 rounded-xl border border-slate-700/60 cursor-pointer transition-all"
              title="Reset State"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* STEP 1: CHANNEL CREATION ONBOARDING */}
      {!hasChannel ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-xs text-left relative overflow-hidden space-y-5"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-emerald-500 to-indigo-600" />
          
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
              <Tv className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase">
                Step 1: Setup Your Creator Channel
              </h3>
              <p className="text-[9px] text-slate-400 font-mono tracking-wider">CREATOR ECOSYSTEM ONBOARDING</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
            Choose your custom channel branding. Prepare beautiful aesthetic assets inspired by modern media applications. Enter your custom display name and unique handle to launch.
          </p>

          <form onSubmit={handleSetupChannel} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2 md:col-span-1">
                <label className="block text-[8px] font-black text-slate-450 uppercase tracking-wider font-mono">
                  Channel Name
                </label>
                <input
                  type="text"
                  required
                  value={setupName}
                  onChange={(e) => setSetupName(e.target.value)}
                  placeholder="e.g. Survivor Drills Daily, Civic Safe Patrol"
                  className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                />
              </div>

              <div className="space-y-1 col-span-2 md:col-span-1">
                <label className="block text-[8px] font-black text-slate-450 uppercase tracking-wider font-mono">
                  Username (@handle)
                </label>
                <input
                  type="text"
                  required
                  value={setupUsername}
                  onChange={(e) => setSetupUsername(e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_@]/g, ''))}
                  placeholder="e.g. @survivor_drills"
                  className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2 px-3 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="block text-[8px] font-black text-slate-455 uppercase tracking-wider font-mono">
                  Channel Category
                </label>
                <select
                  value={setupCategory}
                  onChange={(e) => setSetupCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none cursor-pointer"
                >
                  <option value="Education">Education</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Technology">Technology</option>
                  <option value="Motivation">Motivation</option>
                  <option value="Entertainment">Entertainment</option>
                </select>
              </div>
            </div>

            {/* Custom Avatar Selector */}
            <div className="space-y-2">
              <label className="block text-[8px] font-black text-slate-450 uppercase tracking-wider font-mono">
                Select Profile Theme Picture
              </label>
              <div className="flex gap-2 pb-1 overflow-x-auto">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatarIdx(idx)}
                    className={`relative w-12 h-12 rounded-full overflow-hidden border-2 shrink-0 transition-transform ${
                      selectedAvatarIdx === idx ? 'border-indigo-600 scale-105 shadow-xs' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <img src={url} alt={`Avatar preset ${idx}`} className="w-full h-full object-cover" />
                    {selectedAvatarIdx === idx && (
                      <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white stroke-[3.5]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Aesthetic Cover Banner Art Selector */}
            <div className="space-y-2">
              <label className="block text-[8px] font-black text-slate-455 uppercase tracking-wider font-mono">
                Select Cover Banner Art Design
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {PRESET_BANNERS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedBannerIdx(idx)}
                    className={`relative h-12 w-full rounded-lg overflow-hidden border-2 transition-transform ${
                      selectedBannerIdx === idx ? 'border-indigo-600 scale-98' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <img src={url} alt={`Banner preset ${idx}`} className="w-full h-full object-cover" />
                    {selectedBannerIdx === idx && (
                      <div className="absolute inset-0 bg-indigo-600/25 flex items-center justify-center">
                        <span className="bg-indigo-600 text-white font-extrabold text-[8px] px-2 py-0.5 rounded tracking-wide uppercase">Active</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-550 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5 active:scale-98"
            >
              <PlusSquare className="w-4 h-4" /> Initialize & Launch My Channel (+150 PTS)
            </button>
          </form>
        </motion.div>
      ) : (

        /* DYNAMIC DASHBOARD LAYOUT */
        <div className="space-y-6">
          
          {/* A. CHANNEL PROFILE HEADER CARD */}
          <div className="bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-sm text-left relative">
            <div className="relative h-32 w-full bg-slate-900">
              <img src={bannerUrl} alt="Cover Banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              
              <div className="absolute top-3 right-4 flex items-center gap-1.5 bg-slate-950/40 py-1.5 px-3.5 rounded-full backdrop-blur-md border border-white/10">
                <span className="w-2 h-2 bg-emerald-400 rotate-45 animate-ping rounded-full" />
                <span className="text-[7.5px] font-mono font-black text-slate-100 uppercase tracking-widest leading-none">Active Transmitter</span>
              </div>
            </div>

            <div className="px-5 pb-5 relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 -mt-9 relative z-10 text-center sm:text-left">
                <div className="relative w-20 h-20 rounded-full border-4 border-white bg-slate-100 shadow-md overflow-hidden shrink-0">
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0 pt-10 sm:pt-11 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                    <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 border border-indigo-150 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono leading-none">
                      Category: {channelCategory}
                    </span>
                    <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-150 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono leading-none">
                      {rankDetails.level} ({points.toLocaleString()} PTS)
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase leading-none tracking-tight">
                    {channelName}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 font-bold mt-0.5">{username}</p>
                </div>
              </div>

              {/* Score breakdown metrics inside layout */}
              <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center bg-slate-50 p-3 rounded-2xl">
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono">Creator Rank</span>
                  <span className="text-xs font-black text-indigo-600 flex items-center justify-center gap-1 mt-0.5 uppercase tracking-tight leading-none">
                    {rankDetails.icon} {rankDetails.rank}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono">Total Points</span>
                  <span className="text-xs font-black text-slate-900 font-mono mt-0.5 block leading-none">{points.toLocaleString()} PTS</span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono">Milestone Gap</span>
                  <span className="text-xs font-black text-slate-500 font-mono mt-0.5 block uppercase tracking-tight leading-none">
                    {rankDetails.nextAward ? `-${rankDetails.nextAward.rem.toLocaleString()} PTS` : 'MAX LEVEL'}
                  </span>
                </div>
              </div>

              {/* Progress visual slider */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[8px] text-slate-450 uppercase font-black font-mono">
                  <span>Award Milestone Level Progression</span>
                  {rankDetails.nextAward ? (
                    <span className="text-indigo-650">Next Target: {rankDetails.nextAward.id.replace('_', ' ').toUpperCase()} ({rankDetails.nextAward.req.toLocaleString()} PTS)</span>
                  ) : (
                    <span className="text-slate-550">Maximum Achievement Crown Unlocked</span>
                  )}
                </div>
                <div className="w-full h-1.5 bg-slate-150 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-indigo-600 transition-all duration-300" 
                    style={{ width: `${Math.min(100, Math.max(5, (points / (rankDetails.nextAward ? rankDetails.nextAward.req : 500000)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* D. GUARDIAN STATUE TROPHIES CHAMBER */}
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 shadow-xl text-left relative overflow-hidden space-y-4">
            {/* Ambient background glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[90px] pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-4 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-extrabold text-slate-100 text-sm tracking-tight uppercase">
                    🛡️ Guardian Award Trophies Chamber
                  </h3>
                </div>
                <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                  ACTIVE AMBASSADORS ACHIEVE THESE PRESTIGIOUS HIGH-TECH ENEMY-DETERRENTS
                </p>
              </div>
              <div className="text-[10px] font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                Chamber Rating: <strong className="text-indigo-400 font-black">{claimedAwards.filter(id => ['green_impact', 'red_champion', 'purple_legend'].includes(id)).length}/3 ACTIVE TROPHIES</strong>
              </div>
            </div>

            <p className="text-xs text-slate-350 leading-relaxed font-sans max-w-3xl relative z-10">
              Each dynamic armor figurine is constructed on the secure grid network when corresponding safety milestones are forged. Claimed trophies activate high-voltage glowing power loops and emit premium digital & physical security coordinates. (Blue Guardian award is excluded as requested).
            </p>

            {/* Three Pedestal Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 relative z-10">
              {GUARDIAN_TROPHIES.map((trophy) => {
                const isClaimed = claimedAwards.includes(trophy.id);
                const isClaimable = points >= trophy.pointsReq && !isClaimed;
                const progressPct = Math.min(100, Math.floor((points / trophy.pointsReq) * 100));

                return (
                  <div 
                    key={trophy.id}
                    className={`relative flex flex-col items-center bg-slate-950/80 border rounded-2xl p-4 overflow-hidden transition-all duration-300 group ${
                      isClaimed 
                        ? trophy.glowColor 
                        : 'border-slate-850 hover:border-slate-800 shadow-inner'
                    }`}
                  >
                    {/* Glowing color banner background inside card */}
                    {isClaimed && (
                      <div 
                        className="absolute inset-0 bg-radial transition-opacity duration-350 pointer-events-none opacity-10 group-hover:opacity-20"
                        style={{ backgroundImage: `radial-gradient(circle, ${trophy.accentColor} 0%, transparent 70%)` }}
                      />
                    )}

                    {/* Lock holographic grid watermark */}
                    {!isClaimed && (
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.8)_2px,transparent_2px),linear-gradient(90deg,rgba(15,23,42,0.8)_2px,transparent_2px)] bg-[size:16px_16px] pointer-events-none opacity-30" />
                    )}

                    {/* Locked Indicator Cover */}
                    {!isClaimed && (
                      <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-850 p-1.5 rounded-lg text-slate-500 z-10">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}

                    {/* Unlocked Active Emblem */}
                    {isClaimed && (
                      <div className="absolute top-3 right-3 bg-slate-900 border border-slate-800 p-1 rounded-lg text-slate-100 z-10 font-bold font-mono text-[6.5px] uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" /> Active
                      </div>
                    )}

                    {/* Trophy Name Header */}
                    <div className="text-center w-full pb-2 mb-2 border-b border-slate-900/60 z-10">
                      <span className={`block text-[7px] font-black uppercase tracking-widest font-mono ${isClaimed ? trophy.accentText : 'text-slate-500'}`}>
                        {trophy.titleText}
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-200 mt-0.5 group-hover:text-white transition-colors">
                        {trophy.name} Statue
                      </h4>
                    </div>

                    {/* Custom SVG Armored Figure */}
                    <div className="w-full relative py-1 flex items-center justify-center cursor-pointer" onClick={() => setInspectingTrophy(trophy)}>
                      <ShieldInfinityGuardStatue color={trophy.color} isUnlocked={isClaimed} />
                      
                      {/* Interactive inspecting overlay zoom icon */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/20 backdrop-blur-[1px] rounded-lg">
                        <div className="bg-indigo-600 text-white font-extrabold text-[8px] uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center gap-1 shadow-md">
                          <Eye className="w-3 h-3" /> Inspect Statue
                        </div>
                      </div>
                    </div>

                    {/* Inscribed Octagonal Pedestal base visual representation in UI */}
                    <div className="w-full bg-slate-900/90 border border-slate-850 p-2 rounded-xl text-center flex flex-col items-center justify-center relative mt-2 z-10 select-none">
                      <span className="text-[11px] font-black font-mono tracking-widest text-slate-200 leading-none">ENDLIF</span>
                      <span className="text-[6.5px] uppercase font-mono tracking-wider text-slate-500 font-bold block mt-0.5">LEADER. INFLUENCER. AMBASSADOR.</span>
                      <span className={`text-[6px] uppercase font-mono text-center tracking-normal ${isClaimed ? trophy.accentText : 'text-slate-600'} leading-none mt-1`}>
                        {isClaimed ? trophy.motto : 'INSCRIBED STATUE RECORD'}
                      </span>
                    </div>

                    {/* Progress slider or Claim Button */}
                    <div className="w-full mt-3 z-10">
                      {isClaimed ? (
                        <button
                          type="button"
                          onClick={() => setInspectingTrophy(trophy)}
                          className="w-full py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-extrabold text-[8px] uppercase tracking-wider rounded-lg transition-all"
                        >
                          Inspect Chronicle Inscription
                        </button>
                      ) : isClaimable ? (
                        <button
                          type="button"
                          onClick={() => claimGamingBadge(trophy.id, trophy.titleText, trophy.pointsReq, trophy.description)}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white font-black text-[8.5px] uppercase tracking-widest rounded-lg transition-all animate-pulse shadow-md"
                        >
                          Claim Guardian Trophy
                        </button>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[6.5px] font-bold uppercase tracking-wider font-mono text-slate-500">
                            <span>Points Forage</span>
                            <span>{points.toLocaleString()} / {trophy.pointsReq.toLocaleString()} PTS ({progressPct}%)</span>
                          </div>
                          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-800 transition-all duration-300" style={{ width: `${progressPct}%` }} />
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

          {/* B. ANALYTICS STATS OVERVIEW ROW */}
          <div className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm text-left relative overflow-hidden space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Users className="w-5 h-5 text-indigo-600" />
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider leading-none">Community Statistics & Growth</h4>
                <p className="text-[9px] font-mono text-slate-400 uppercase leading-none mt-1">Real-time engagement telemetry</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-left">
                <span className="text-[8.5px] font-bold text-slate-450 uppercase font-mono tracking-wider block">👥 Community Members</span>
                <span className="text-xl font-black text-slate-900 font-mono mt-1 block leading-none">{communityMembers.toLocaleString()}</span>
                <span className="text-[8.5px] text-slate-400 font-sans block mt-1.5">Subscribers + active followers</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-left relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                </div>
                <span className="text-[8.5px] font-bold text-slate-455 uppercase font-mono tracking-wider block">🔥 Active Members</span>
                <span className="text-xl font-black text-slate-900 font-mono mt-1 block leading-none">{activeMembers.toLocaleString()}</span>
                <span className="text-[8.5px] text-orange-600 font-extrabold font-mono block mt-1.5 uppercase leading-none">HIGH ENGAGEMENT</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-left">
                <span className="text-[8.5px] font-bold text-slate-450 uppercase font-mono tracking-wider block">⚡ Weekly Growth</span>
                <span className="text-xl font-black text-emerald-600 font-mono mt-1 block leading-none">{weeklyGrowth}</span>
                <span className="text-[8.5px] text-slate-400 font-sans block mt-1.5">Reach acceleration rate</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-left">
                <span className="text-[8.5px] font-bold text-slate-450 uppercase font-mono tracking-wider block">🔔 Followers Base</span>
                <span className="text-xl font-black text-slate-900 font-mono mt-1 block leading-none">{subscribers}</span>
                <button
                  type="button"
                  onClick={() => {
                    setPoints(prev => prev + 50);
                    setSubscribers(prev => prev + 1);
                    showSuccessToast("Growth simulator triggered: Autocast +1 Subscriber! (+50 PTS)");
                  }}
                  className="mt-1.5 w-full py-1 bg-slate-900 hover:bg-slate-800 text-[8px] font-black uppercase text-slate-100 rounded-md tracking-wider transition-all"
                >
                  Join Crew (+50 PTS)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono py-2 border-t border-slate-150 text-slate-500 font-semibold bg-slate-50/50 rounded-xl">
              <div>VIEWS: <strong className="text-slate-800">{views.toLocaleString()}</strong></div>
              <div>LIKES: <strong className="text-slate-800">{likes.toLocaleString()}</strong></div>
              <div>SHARES: <strong className="text-slate-800">{shares.toLocaleString()}</strong></div>
            </div>
          </div>

          {/* C. REARRANGED: TWO COLUMN WORKBENCH & MEDIA HUB */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUMN 1 - MAIN WORKSPACE: FILE PUBLISHER + TRANSMISSION FEED ARCHIVE (Col-span: 12 -> 8 on desktop) */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              
              {/* STUDIO CARD: WITH DEDICATED UPLOAD SLIDERS AND PARSER WORKFLOWS */}
              <div className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm text-left relative overflow-hidden space-y-4">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 uppercase tracking-wider">
                      <Sliders className="w-4.5 h-4.5 text-indigo-600" /> Creator Upload Studio
                    </h3>
                    <p className="text-[9px] font-mono text-slate-400 uppercase leading-none">Aesthetic content distribution engine</p>
                  </div>

                  {/* Aesthetic tab switcher */}
                  <div className="bg-slate-100 p-1 rounded-xl flex gap-1 self-start select-none">
                    <button
                      type="button"
                      onClick={() => { 
                        setStudioTab('video'); 
                        setUploadCategory('Education'); 
                        setUploadFileName(''); 
                        setUploadFileBase64('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                        studioTab === 'video' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" /> Video (+150 PTS)
                    </button>
                    <button
                      type="button"
                      onClick={() => { 
                        setStudioTab('post'); 
                        setUploadCategory('Motivation'); 
                        setUploadFileName(''); 
                        setUploadFileBase64('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                        studioTab === 'post' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" /> Post (+50 PTS)
                    </button>
                    <button
                      type="button"
                      onClick={() => { 
                        setStudioTab('article'); 
                        setUploadCategory('Technology'); 
                        setUploadFileName(''); 
                        setUploadFileBase64('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                        studioTab === 'article' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Book Article (+200 PTS)
                    </button>
                  </div>
                </div>

                {/* HIGH FIDELITY DRAG AND DROP FILE UPLOAD AREA */}
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerUploadInputClick}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-50/40' 
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-350'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden" 
                    accept={
                      studioTab === 'video' 
                        ? 'video/*' 
                        : studioTab === 'article' 
                          ? 'text/plain,text/markdown,.md,.txt' 
                          : 'image/*'
                    }
                  />

                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="p-3 bg-white rounded-full border shadow-sm">
                      <Upload className="w-5 h-5 text-indigo-600" />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                        {uploadFileName ? `Selected: ${uploadFileName}` : `Click or Drag & Drop to Upload ${studioTab.toUpperCase()}`}
                      </p>
                      
                      <p className="text-[10px] text-slate-450 font-medium">
                        {studioTab === 'video' && "Accepts high-fidelity .mp4, .mov, or .avi formats"}
                        {studioTab === 'post' && "Accepts visual header image attachments (.png, .jpg, .svg)"}
                        {studioTab === 'article' && "Auto-import local article draft .md or .txt files directly!"}
                      </p>
                    </div>

                    {uploadFileName && (
                      <span className="text-[9px] font-mono font-black uppercase bg-indigo-50 border border-indigo-150 px-2.5 py-0.5 rounded-full text-indigo-700">
                        File linked: {uploadFileSize || 'Calculating...'}
                      </span>
                    )}
                  </div>
                </div>

                <form onSubmit={handleStudioUploadSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3.5">
                    
                    {/* Block Name title info */}
                    <div className="space-y-1 col-span-2">
                      <label className="block text-[8px] font-black text-slate-450 uppercase tracking-widest font-mono">
                        {studioTab === 'video' ? 'Survival Drill Video Title' : studioTab === 'post' ? 'Alert Brief Title' : 'Research Guide Article Title'}
                      </label>
                      <input
                        type="text"
                        required
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder={
                          studioTab === 'video' 
                            ? "e.g. Ad-hoc Antenna Setups for Off-Grid Transmission" 
                            : studioTab === 'post' 
                              ? "e.g. Dynamic Warning: Active Regional Weather Shifts" 
                              : "e.g. Gravity Water Purifier Filtration Sandbox Drills"
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1 col-span-2 md:col-span-1">
                      <label className="block text-[8px] font-black text-slate-450 uppercase tracking-widest font-mono">
                        Category Area
                      </label>
                      <select
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 cursor-pointer outline-none"
                      >
                        <option value="Education">Education</option>
                        <option value="Technology">Technology</option>
                        <option value="Motivation">Motivation</option>
                        <option value="Entertainment">Entertainment</option>
                      </select>
                    </div>

                    <div className="space-y-1 col-span-2 md:col-span-1">
                      <label className="block text-[8px] font-black text-slate-450 uppercase tracking-widest font-mono">
                        {studioTab === 'video' ? 'Drill Video Length' : 'Broadcast Priority'}
                      </label>
                      {studioTab === 'video' ? (
                        <input
                          type="text"
                          required
                          value={uploadDuration}
                          onChange={(e) => setUploadDuration(e.target.value)}
                          placeholder="e.g. 10:25"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                        />
                      ) : (
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 cursor-pointer outline-none">
                          <option>⚡ Priority High Fail-safe Alert</option>
                          <option>🔵 General Awareness Broadcast</option>
                          <option>📖 Educational Digest Manual</option>
                        </select>
                      )}
                    </div>

                    {/* Substantive text area for posts and articles */}
                    {studioTab !== 'video' && (
                      <div className="space-y-1 col-span-2">
                        <label className="block text-[8px] font-black text-slate-450 uppercase tracking-widest font-mono">
                          {studioTab === 'post' ? 'Alert Body (Character Limit 280)' : 'Comprehensive Article Body Text Markdown'}
                        </label>
                        <textarea
                          required
                          rows={studioTab === 'post' ? 3 : 5}
                          value={uploadContent}
                          onChange={(e) => setUploadContent(e.target.value)}
                          placeholder={
                            studioTab === 'post' 
                              ? "Write brief updates for active followers..." 
                              : "Produce detailed instructions for water purification, medicine formulation, or communications setup. Supports markdown styles."
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-medium text-slate-805 focus:bg-white focus:border-indigo-500 outline-none transition-colors leading-relaxed"
                        />
                      </div>
                    )}
                  </div>

                  {/* PREVIEW CONTAINER FOR IMAGE ATTACHMENTS */}
                  {uploadFileBase64 && (studioTab === 'post' || studioTab === 'article') && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150 space-y-1.5">
                      <span className="block text-[7.5px] font-black text-slate-400 uppercase tracking-widest font-mono">
                        Attachment Media Preview
                      </span>
                      <div className="relative aspect-video max-h-32 rounded-lg overflow-hidden border bg-white max-w-xs">
                        <img src={uploadFileBase64} alt="Upload thumb draft" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadFileBase64('')}
                          className="absolute top-1 right-1 bg-slate-900/80 hover:bg-slate-900 p-1 rounded-full text-white cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PROGRESS ENGINE WITH LIVE INTERACTIVE FEEDBACK */}
                  {uploadingState !== 'idle' && (
                    <div className="bg-slate-55/70 p-4 rounded-2xl border border-slate-150 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono font-bold leading-none">
                        <span className="text-indigo-600 flex items-center gap-1.5 uppercase tracking-wide">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                          {uploadingState === 'processing' ? 'Encoding payload & emitting RF chunks...' : 'Transmission Approved! Open feed.'}
                        </span>
                        <span className="text-slate-600">{uploadFileProgress}%</span>
                      </div>
                      
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-450 transition-all duration-150"
                          style={{ width: `${uploadFileProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={uploadingState !== 'idle'}
                    className="w-full py-3.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-100 font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-40"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400 stroke-[2.5]" /> Launch {studioTab.toUpperCase()} Broadcast
                  </button>
                </form>
              </div>

              {/* TRANSMISSION LIVE FEED ARCHIVE */}
              <div className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm text-left relative overflow-hidden space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-2">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 leading-none">
                      <Tv className="w-4.5 h-4.5 text-indigo-650" /> Live Feed Archive
                    </h3>
                    <p className="text-[9px] font-mono text-slate-400 uppercase leading-none mt-1">Filter published awareness broadcasts</p>
                  </div>

                  <div className="flex gap-1 bg-slate-50 border border-slate-200/60 p-1 rounded-xl self-start">
                    {['all', 'video', 'post', 'article'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFeedFilterTab(t as any)}
                        className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg tracking-wider transition-all cursor-pointer ${
                          feedFilterTab === t 
                            ? 'bg-slate-900 text-slate-100 shadow-sm' 
                            : 'text-slate-550 hover:text-slate-800'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid Layout fitting pristine standards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeFilteredItems.length === 0 ? (
                    <div className="col-span-2 text-center py-10 text-xs text-slate-400 font-medium">
                      No {feedFilterTab} blocks are currently published to Endlif antennae files. Use the Setup Studio to publish!
                    </div>
                  ) : (
                    activeFilteredItems.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => setViewingItem(item)}
                        className="group bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between overflow-hidden text-xs transition-all duration-200 hover:shadow-md hover:border-indigo-250 cursor-pointer text-left relative"
                      >
                        {/* Interactive Thumbnail Previews with real indicators */}
                        <div className="relative aspect-video bg-slate-900 w-full overflow-hidden flex items-center justify-center">
                          {item.mediaUrl ? (
                            <img src={item.mediaUrl} alt="Thumbnail preview" className="w-full h-full object-cover group-hover:scale-105 duration-300" />
                          ) : item.type === 'video' ? (
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 to-purple-950/80 flex flex-col items-center justify-center p-3 text-center">
                              <Video className="w-8 h-8 text-white/90 drop-shadow-md mb-1 stroke-[1.5]" />
                              <span className="text-[8.5px] font-mono text-indigo-200 uppercase tracking-widest truncate max-w-full">
                                {item.fileName || 'tactical_drill.mp4'}
                              </span>
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-slate-900/40 flex flex-col items-center justify-center p-3 text-center">
                              {item.type === 'article' ? <BookOpen className="w-8 h-8 text-emerald-555 opacity-70 mb-1" /> : <Send className="w-8 h-8 text-pink-555 opacity-70 mb-1" />}
                              <span className="text-[8.5px] font-mono text-slate-400 uppercase tracking-wide">Endlif Citizen Feed</span>
                            </div>
                          )}

                          {/* Float duration or type labels */}
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white font-mono text-[8px] font-black px-1.5 py-0.5 rounded tracking-wide leading-none select-none">
                            {item.type === 'video' ? `📹 ${item.duration || '12:00'}` : item.type === 'article' ? '📝 ARTICLE' : '📢 POST'}
                          </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2.5">
                              <span className="text-[7.5px] font-black text-slate-400 uppercase font-mono bg-slate-200/70 px-2 py-0.5 rounded leading-none">
                                {item.category}
                              </span>

                              <span className="text-[7px] text-slate-450 font-mono">
                                {item.timestamp.split(' ')[0]}
                              </span>
                            </div>

                            <h4 className="font-extrabold text-slate-900 text-xs uppercase leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                              {item.title}
                            </h4>

                            {item.content && (
                              <p className="text-[10px] text-slate-500 font-sans leading-relaxed line-clamp-2">
                                {item.content}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-150 flex items-center justify-between text-[9px] font-mono font-bold">
                            <div className="text-slate-400 flex gap-2">
                              <span>👀 {item.views}</span>
                              <span>❤️ {item.likes}</span>
                            </div>

                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                simulateItemLike(item.id, item.likes);
                              }}
                              className="text-indigo-650 hover:text-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 py-1 px-2.5 rounded-lg transition-all cursor-pointer"
                            >
                              ❤️ Appraise (+5)
                            </div>
                          </div>
                        </div>

                        {item.isCustom && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCustomItem(item.id);
                            }}
                            className="absolute top-2 right-2 bg-slate-900/60 hover:bg-slate-900 p-1.5 rounded-full text-white transition-colors cursor-pointer shadow-sm z-10"
                            title="Delete article draft"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* COLUMN 2 - SIDEBAR STATS: REWARDS + LEADERBOARD BOARD + REFERRAL NETWORKS (Col-span: 12 -> 4 on desktop) */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              
              {/* GAMING ACHIEVEMENTS */}
              <div className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm text-left relative overflow-hidden space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Trophy className="w-4.5 h-4.5 text-amber-500 stroke-[2.5]" />
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider leading-none">Milestone Awards</h4>
                    <p className="text-[9px] font-mono text-slate-400 uppercase leading-none mt-1">Claim honors with milestone points</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
                  Use accumulated points to unlock official level badges. Claimed milestones register permanently to your Hall signature.
                </p>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {AWARDS_TIERS.map((tier) => {
                    const isClaimed = claimedAwards.includes(tier.id);
                    const isAllowed = points >= tier.pointsReq;
                    
                    return (
                      <div 
                        key={tier.id} 
                        className={`bg-gradient-to-tr ${tier.color} text-white p-4 rounded-2xl border flex flex-col justify-between gap-3 relative overflow-hidden shadow-xs`}
                      >
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="text-[7.5px] font-black uppercase tracking-widest font-mono text-indigo-200 bg-slate-950/40 px-2 py-0.5 rounded leading-none">
                              {tier.pointsReq.toLocaleString()} PTS
                            </span>
                            
                            {isClaimed ? (
                              <span className="text-[7px] font-black uppercase text-emerald-350 bg-emerald-950/60 py-0.5 px-1.5 rounded font-mono border border-emerald-500/20">Armed</span>
                            ) : isAllowed ? (
                              <span className="text-[7px] font-black uppercase text-amber-300 bg-amber-950/50 py-0.5 px-1.5 rounded font-mono border border-amber-500/20 animate-pulse">Claimable</span>
                            ) : (
                              <span className="text-[7px] font-black uppercase text-slate-300 bg-slate-950/40 py-0.5 px-1.5 rounded font-mono border border-white/5">Locked</span>
                            )}
                          </div>

                          <h5 className="text-xs font-black uppercase tracking-wide text-slate-100">{tier.name}</h5>
                          <p className="text-[10px] text-indigo-100 font-sans leading-relaxed font-medium">{tier.description}</p>
                        </div>

                        <div className="bg-slate-950/40 p-2.5 rounded-lg border border-white/5 text-[9.5px] font-mono space-y-1 overflow-hidden">
                          <span className="text-[7px] font-black text-indigo-300 uppercase tracking-widest block leading-none">PERKS ATTACHED</span>
                          <ul className="space-y-0.5 text-slate-350 font-sans">
                            {tier.rewards.slice(0, 2).map((reward, i) => (
                              <li key={i} className="truncate">&bull; {reward}</li>
                            ))}
                          </ul>
                        </div>

                        <button
                          type="button"
                          disabled={isClaimed || !isAllowed}
                          onClick={() => claimGamingBadge(tier.id, tier.name, tier.pointsReq, tier.description)}
                          className={`w-full py-2 font-black text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                            isClaimed 
                              ? 'bg-slate-900/60 text-slate-500 border border-slate-800 cursor-not-allowed' 
                              : isAllowed 
                                ? 'bg-white text-indigo-950 hover:bg-slate-100 font-black shadow-sm' 
                                : 'bg-white/10 text-white/30 border border-white/5 cursor-not-allowed'
                          }`}
                        >
                          {isClaimed ? 'Badge Infused' : isAllowed ? 'Claim Award & Badge' : `Locked (-${(tier.pointsReq - points).toLocaleString()} PTS)`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STEP 8: LEADERBOARD REGISTRY */}
              <div className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm text-left relative overflow-hidden space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Crown className="w-4.5 h-4.5 text-indigo-600" />
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider leading-none">Hall of Legends</h4>
                    <p className="text-[9px] font-mono text-slate-400 uppercase leading-none mt-1">High-performing creators of the grid</p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-150 rounded-2xl overflow-hidden bg-slate-50/50">
                  {currentLeaderboard.map((item) => {
                    const userStanding = item.isUser;
                    return (
                      <div 
                        key={item.rank} 
                        className={`flex items-center justify-between p-3 flex-wrap gap-2 ${
                          userStanding ? 'bg-indigo-50/70 border-l-2 border-indigo-500' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-md text-[9px] font-black flex items-center justify-center font-mono text-center ${
                            item.rank === 1 
                              ? 'bg-amber-100 text-amber-700 font-bold' 
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            #{item.rank}
                          </span>

                          <div className="relative w-8 h-8 rounded-full overflow-hidden border">
                            <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                          </div>

                          <div className="text-left leading-tight">
                            <div className="flex items-center gap-1">
                              <span className="font-black text-[11px] text-slate-805 truncate max-w-[90px]">{item.name}</span>
                              {userStanding && (
                                <span className="text-[6.5px] bg-indigo-600 text-white rounded px-1 tracking-wider leading-none">YOU</span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono block leading-none">{item.username}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="block text-[11px] font-black text-slate-900 font-mono leading-none">{(item.points).toLocaleString()}</span>
                          <span className="text-[7px] text-slate-400 font-mono block uppercase">PTS Score</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* REFERRAL PORTAL */}
              <div className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm text-left relative overflow-hidden space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <UserPlus className="w-4.5 h-4.5 text-indigo-650" />
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider leading-none">Invite Network</h4>
                    <p className="text-[9px] font-mono text-slate-400 uppercase leading-none mt-1">Acquire point credentials instantly</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
                  Register safe citizen nodes on the secure grid. Each successful invitation earns <strong className="text-indigo-650 font-extrabold">+100 Points</strong>.
                </p>

                <form onSubmit={handleReferralSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[8px] font-black text-slate-450 uppercase tracking-widest font-mono">
                      Affiliated Name
                    </label>
                    <input
                      type="text"
                      required
                      value={refName}
                      onChange={(e) => setRefName(e.target.value)}
                      placeholder="e.g. John Doe, Alice Smith"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[8px] font-black text-slate-450 uppercase tracking-widest font-mono">
                      Fail-safe Contact (Email / Radio Id)
                    </label>
                    <input
                      type="text"
                      required
                      value={refContact}
                      onChange={(e) => setRefContact(e.target.value)}
                      placeholder="e.g. peer_antenna@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-550 outline-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAddingReferral}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1 active:scale-98 disabled:opacity-40"
                  >
                    {isAddingReferral ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" /> Invite Peer (+100 PTS)
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
