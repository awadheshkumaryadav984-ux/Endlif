import React from 'react';

interface GuardianStatueProps {
  color: 'emerald' | 'red' | 'purple' | 'gold' | 'blue';
  isUnlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ShieldInfinityGuardStatue: React.FC<GuardianStatueProps> = ({ 
  color, 
  isUnlocked,
  size = 'md'
}) => {
  const colorMap = {
    emerald: '#10b981',
    red: '#f43f5e',
    purple: '#a855f7',
    gold: '#eab308',
    blue: '#38bdf8'
  };

  const glowHex = colorMap[color] || '#38bdf8';
  const strokeColor = isUnlocked ? glowHex : '#475569';
  const bodyOpacity = isUnlocked ? 0.98 : 0.4;
  const glowFilter = isUnlocked ? `url(#glow-${color})` : 'none';

  const heightClass = size === 'sm' ? 'h-36' : size === 'lg' ? 'h-56' : 'h-44';

  return (
    <svg 
      viewBox="0 0 200 320" 
      className={`w-full ${heightClass} transition-all duration-500`}
      style={{ filter: isUnlocked ? `drop-shadow(0 0 14px ${glowHex}55)` : 'none' }}
    >
      <defs>
        <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isUnlocked ? glowHex : '#475569'} stopOpacity="0.9" />
          <stop offset="50%" stopColor="#0f172a" stopOpacity="0.95" />
          <stop offset="100%" stopColor={isUnlocked ? glowHex : '#1e293b'} stopOpacity="0.5" />
        </linearGradient>
        
        <radialGradient id={`pedestal-glow-${color}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glowHex} stopOpacity={isUnlocked ? 0.4 : 0.05} />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {isUnlocked && (
          <filter id={`glow-${color}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>
      
      {/* Illuminated Pedestal Platform */}
      <ellipse cx="100" cy="295" rx="70" ry="16" fill={`url(#pedestal-glow-${color})`} />
      <polygon points="40,295 160,295 145,310 55,310" fill="#090d16" stroke={strokeColor} strokeWidth="1.5" />
      <ellipse cx="100" cy="295" rx="60" ry="8" fill="#0f172a" stroke={strokeColor} strokeWidth="1" />

      {isUnlocked && (
        <>
          <path 
            d="M 50 0 L 150 0 L 170 320 L 30 320 Z" 
            fill={`url(#beam-glow-${color})`} 
            className="animate-pulse" 
            style={{ opacity: 0.18 }}
          />
          <linearGradient id={`beam-glow-${color}`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor={glowHex} stopOpacity="0.45"/>
            <stop offset="100%" stopColor={glowHex} stopOpacity="0"/>
          </linearGradient>
        </>
      )}

      <g opacity={bodyOpacity}>
        {/* Halo Attestation Ring */}
        {isUnlocked && (
          <path 
            d="M 55 65 A 45 45 0 0 1 145 65" 
            fill="none" 
            stroke={glowHex} 
            strokeWidth="2.5" 
            strokeDasharray="4 4" 
            filter={glowFilter}
          />
        )}

        {/* Outer Guardian Aegis Wings */}
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

        {/* Crown Spikes */}
        <path d="M 90 60 L 80 25 L 93 45 Z" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />
        <path d="M 110 60 L 120 25 L 107 45 Z" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />
        <path d="M 100 48 L 100 18 Z" stroke={glowHex} strokeWidth="2.5" filter={glowFilter} />

        {/* Visor & Helmet */}
        <polygon 
          points="88,50 112,50 116,74 100,88 84,74" 
          fill="#090d16" 
          stroke={strokeColor} 
          strokeWidth="1.5" 
        />
        <polygon 
          points="92,60 108,60 105,65 95,65" 
          fill={isUnlocked ? glowHex : '#64748b'} 
          filter={glowFilter} 
        />
        <line x1="100" y1="65" x2="100" y2="82" stroke={strokeColor} strokeWidth="1" />

        {/* Chest Plate / Shoulders */}
        <path d="M 80 94 C 60 90 50 105 45 120 C 60 125 70 120 78 114 Z" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1.5" />
        <path d="M 45 120 C 40 130 45 140 55 145 C 65 140 70 130 75 125 Z" fill="#0f172a" stroke={strokeColor} strokeWidth="1.5" />
        <path d="M 120 94 C 140 90 150 105 155 120 C 140 125 130 120 122 114 Z" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1.5" />
        <path d="M 155 120 C 160 130 155 140 145 145 C 135 140 130 130 125 125 Z" fill="#0f172a" stroke={strokeColor} strokeWidth="1.5" />

        {/* Central Safety Core Crest */}
        <polygon 
          points="78,96 122,96 125,145 100,165 75,145" 
          fill={`url(#grad-${color})`} 
          stroke={strokeColor} 
          strokeWidth="1.5" 
        />
        
        <circle cx="100" cy="122" r="9" fill="#030712" stroke={strokeColor} strokeWidth="1.2" />
        <path 
          d="M 96 122 C 92 118 92 126 96 122 C 100 118 100 126 104 122 C 108 118 108 126 104 122" 
          fill="none" 
          stroke={isUnlocked ? glowHex : '#64748b'} 
          strokeWidth="1.8" 
          filter={glowFilter} 
        />

        {/* Abdominal & Waist Armor */}
        <polygon 
          points="84,145 116,145 112,178 88,178" 
          fill="#090d16" 
          stroke={strokeColor} 
          strokeWidth="1.5" 
        />
        <line x1="100" y1="145" x2="100" y2="178" stroke={strokeColor} strokeWidth="1" />

        <polygon points="75,145 88,145 84,185 70,175" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />
        <polygon points="125,145 112,145 116,185 130,175" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />

        <path d="M 72 118 L 52 155 L 56 182 L 70 170 Z" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />
        <path d="M 128 118 L 148 155 L 144 182 L 130 170 Z" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />

        {/* Lower Guardian Plate Legs */}
        <polygon points="85,178 100,178 95,225 80,225" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1.2" />
        <polygon points="80,225 95,225 92,270 74,270" fill="#090d16" stroke={strokeColor} strokeWidth="1.2" />
        <polygon points="74,270 92,270 90,285 70,285" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />
        
        <polygon points="100,178 115,178 120,225 105,225" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1.2" />
        <polygon points="105,225 120,225 126,270 108,270" fill="#090d16" stroke={strokeColor} strokeWidth="1.2" />
        <polygon points="108,270 126,270 130,285 110,285" fill={`url(#grad-${color})`} stroke={strokeColor} strokeWidth="1" />

        {/* Guardian Staff / Aegis Scepter */}
        <path 
          d="M 98 85 L 102 85 L 101.5 242 L 98.5 242 Z" 
          fill={isUnlocked ? glowHex : '#475569'} 
          stroke={strokeColor} 
          strokeWidth="1" 
          filter={glowFilter} 
        />
        <line x1="100" y1="90" x2="100" y2="240" stroke={isUnlocked ? '#ffffff' : '#64748b'} strokeWidth="1" />
        <polygon points="90,242 110,242 105,246 95,246" fill="#0f172a" stroke={strokeColor} strokeWidth="1.2" />
        <rect x="98" y="246" width="4" height="25" fill="#090d16" stroke={strokeColor} strokeWidth="1" />

        {/* Base Attestation Sigil */}
        <path 
          d="M 94 275 C 89 268 83 275 88 280 C 93 285 107 265 112 270 C 117 275 111 282 106 275 C 101 268 97 282 94 275" 
          fill="none" 
          stroke={isUnlocked ? glowHex : '#475569'} 
          strokeWidth="2.5" 
          filter={glowFilter} 
        />
        {isUnlocked && (
          <circle cx="100" cy="275" r="3.5" fill="#ffffff" filter={glowFilter} />
        )}
      </g>
    </svg>
  );
};
