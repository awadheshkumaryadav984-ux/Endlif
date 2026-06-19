import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart, Star, Shield, Zap, CircleDot } from 'lucide-react';

export interface AvatarConfig {
  character: string;
  theme: string;
  accessory: string;
  aura: string;
  motionStyle: 'float' | 'spin' | 'bounce' | 'run';
}

export const CHARACTER_OPTIONS = [
  { id: 'dragon', name: 'Cute Dragon', emoji: '🐲', desc: 'Flame-retardant digital defender' },
  { id: 'dog', name: 'Safety Dog', emoji: '🐶', desc: 'Loyal patrol rescue canine' },
  { id: 'cat', name: 'Agile Cat', emoji: '🐱', desc: 'Night-vision sensory scanner' },
  { id: 'elephant', name: 'Shield Elephant', emoji: '🐘', desc: 'Heavy structural armor protector' },
  { id: 'boy', name: 'Cyber Boy', emoji: '👦', desc: 'Agile high-frequency explorer' },
  { id: 'girl', name: 'Brave Girl', emoji: '👧', desc: 'Tactical security drone pilot' },
  { id: 'lion', name: 'Pride Lion', emoji: '🦁', desc: 'Vocal acoustic alert master' },
  { id: 'tiger', name: 'Stealth Tiger', emoji: '🐯', desc: 'Pre-emptive crisis radar scout' },
  { id: 'giraffe', name: 'Radar Giraffe', emoji: '🦒', desc: 'High-altitude navigation beacon' },
  { id: 'hyena', name: 'Rescue Hyena', emoji: '🐺', desc: 'Ultrasonic communication liaison' }
];

export const THEME_OPTIONS = [
  { 
    id: 'indigo', 
    name: 'Neon Violet Orb', 
    from: 'from-violet-600 via-indigo-600 to-indigo-900', 
    glass: 'rgba(99, 102, 241, 0.25)',
    border: 'border-indigo-400/80',
    shadow: 'shadow-indigo-500/40 shadow-[0_12px_24px_rgba(99,102,241,0.4)]',
    highlight: 'bg-indigo-300/30'
  },
  { 
    id: 'mint', 
    name: 'Tactical Emerald Jade', 
    from: 'from-emerald-500 via-teal-600 to-cyan-900', 
    glass: 'rgba(16, 185, 129, 0.25)',
    border: 'border-emerald-450/80',
    shadow: 'shadow-emerald-500/40 shadow-[0_12px_24px_rgba(16,185,129,0.4)]',
    highlight: 'bg-emerald-350/30'
  },
  { 
    id: 'ruby', 
    name: 'Crimson Plasma Shell', 
    from: 'from-rose-500 via-red-600 to-rose-950', 
    glass: 'rgba(244, 63, 94, 0.25)',
    border: 'border-rose-400/80',
    shadow: 'shadow-rose-500/40 shadow-[0_12px_24px_rgba(244,63,94,0.4)]',
    highlight: 'bg-rose-300/30'
  },
  { 
    id: 'solar', 
    name: 'Liquid Solar Amber', 
    from: 'from-amber-400 via-orange-500 to-amber-900', 
    glass: 'rgba(245, 158, 11, 0.25)',
    border: 'border-amber-400/80',
    shadow: 'shadow-amber-500/40 shadow-[0_12px_24px_rgba(245,158,11,0.45)]',
    highlight: 'bg-amber-300/35'
  },
  { 
    id: 'plasma', 
    name: 'Metamorphic Pulsar', 
    from: 'from-fuchsia-550 via-pink-600 to-purple-950', 
    glass: 'rgba(217, 70, 239, 0.25)',
    border: 'border-fuchsia-400/80',
    shadow: 'shadow-fuchsia-500/40 shadow-[0_12px_24px_rgba(217,70,239,0.45)]',
    highlight: 'bg-fuchsia-300/30'
  }
];

export const ACCESSORY_OPTIONS = [
  { id: 'none', name: 'None', label: '' },
  { id: 'helmet', name: 'Tactical Helmet', label: '🪖', offset: '-top-3.5 right-0.5 rotate-[6deg] scale-105 z-30' },
  { id: 'crown', name: 'Hologram Crown', label: '👑', offset: '-top-5 left-1/2 -translate-x-1/2 -rotate-3 z-30 scale-110' },
  { id: 'sunglasses', name: 'Vision Visor', label: '🕶️', offset: 'top-2.5 left-1/2 -translate-x-1/2 scale-115 z-20' },
  { id: 'headphones', name: 'DJ Radio Link', label: '🎧', offset: '-top-0.5 w-full flex justify-center scale-120 z-20' },
  { id: 'bow', name: 'Safety Ribbon', label: '🎀', offset: '-top-2 left-1.5 -rotate-[15deg] z-30 scale-105' }
];

export const AURA_OPTIONS = [
  { id: 'none', name: 'Static Shield', icon: null },
  { id: 'sparkles', name: 'Quantum Sparkles', icon: Sparkles, color: 'text-amber-400' },
  { id: 'heart', name: 'Guardian Heart', icon: Heart, color: 'text-rose-400' },
  { id: 'star', name: 'Stellar Star', icon: Star, color: 'text-yellow-450' },
  { id: 'shield', name: 'Active Firewall', icon: Shield, color: 'text-indigo-400' },
  { id: 'zap', name: 'Kinetic Charge', icon: Zap, color: 'text-cyan-400' }
];

interface ThreeDAvatarProps {
  config?: AvatarConfig;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean; // trigger sprint when clicked
}

export default function ThreeDAvatar({ 
  config = { character: 'dragon', theme: 'indigo', accessory: 'none', aura: 'none', motionStyle: 'float' },
  size = 'md',
  interactive = true
}: ThreeDAvatarProps) {
  
  const [isSprinting, setIsSprinting] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const characterObj = CHARACTER_OPTIONS.find(c => c.id === config.character) || CHARACTER_OPTIONS[0];
  const themeObj = THEME_OPTIONS.find(t => t.id === config.theme) || THEME_OPTIONS[0];
  const accessoryObj = ACCESSORY_OPTIONS.find(a => a.id === config.accessory) || ACCESSORY_OPTIONS[0];
  const auraObj = AURA_OPTIONS.find(au => au.id === config.aura) || AURA_OPTIONS[0];

  const sizeClasses = {
    sm: 'w-10 h-10 text-xl border-1',
    md: 'w-16 h-16 text-3xl border-2',
    lg: 'w-24 h-24 text-5xl border-[3px]',
    xl: 'w-36 h-36 text-7xl border-4'
  };

  const scaleFactor = {
    sm: 0.6,
    md: 1.0,
    lg: 1.5,
    xl: 2.2
  }[size];

  const particleSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  // Trigger high-speed 3D flight dash
  const handleAvatarClick = () => {
    if (!interactive || isSprinting) return;
    setIsSprinting(true);
    setClickCount(prev => prev + 1);

    // Provide immediate haptic notification output
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([100, 50, 100]);
    }

    setTimeout(() => {
      setIsSprinting(false);
    }, 1800);
  };

  // Floating keyframe nodes
  const points = [
    { x: -35, y: -25, delay: 0 },
    { x: 38, y: -35, delay: 0.4 },
    { x: -30, y: 38, delay: 0.8 },
    { x: 35, y: 30, delay: 1.2 }
  ];

  const getMotionAnimation = () => {
    if (isSprinting) {
      return {
        x: [0, -150, 350, -350, 0],
        y: [0, -45, 25, -20, 0],
        rotateX: [0, 45, 180, -180, 0],
        rotateY: [0, 180, 360 * 2, -360, 0],
        rotateZ: [0, -45, 360 * 3, -180, 0],
        scale: [1, 1.4, 0.6, 1.5, 1],
        transition: { duration: 1.8, ease: "easeInOut" }
      };
    }

    switch (config.motionStyle) {
      case 'spin':
        return {
          rotateY: 360,
          y: [0, -5, 0],
          transition: {
            rotateY: { repeat: Infinity, duration: 5, ease: "linear" },
            y: { repeat: Infinity, duration: 2.2, ease: "easeInOut" }
          }
        };
      case 'bounce':
        return {
          y: [3, -16, 3],
          scaleY: [0.9, 1.03, 0.9],
          scaleX: [1.1, 0.97, 1.1],
          rotate: [-1, 1, -1],
          transition: {
            repeat: Infinity,
            duration: 0.75,
            ease: "easeInOut"
          }
        };
      case 'run':
        return {
          x: [0, 8, -8, 0],
          y: [-1, -8, -1],
          skewX: [0, 12, -12, 0],
          rotate: [-3, 3, -3],
          transition: {
            repeat: Infinity,
            duration: 0.55,
            ease: "linear"
          }
        };
      case 'float':
      default:
        return {
          y: [0, -11, 0],
          rotate: [-4, 4, -4],
          rotateX: [-6, 6, -6],
          rotateY: [-5, 5, -5],
          transition: {
            repeat: Infinity,
            duration: 2.4,
            ease: "easeInOut"
          }
        };
    }
  };

  return (
    <div 
      className="relative select-none flex flex-col items-center justify-center p-4"
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
    >
      {/* 3D Radiant Glowing Particle Core Aura Field */}
      {auraObj.id !== 'none' && auraObj.icon && (
        <div className="absolute inset-0 pointer-events-none scale-125 z-0" style={{ transformStyle: 'preserve-3d' }}>
          {points.map((pt, index) => {
            const IconComponent = auraObj.icon!;
            return (
              <motion.div
                key={index}
                animate={{
                  scale: [0.5, 1.25, 0.5],
                  opacity: [0.2, 0.95, 0.2],
                  x: [pt.x * scaleFactor, pt.x * 1.45 * scaleFactor, pt.x * scaleFactor],
                  y: [pt.y * scaleFactor, pt.y * 1.45 * scaleFactor, pt.y * scaleFactor],
                  z: [-20, 30, -20],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.8,
                  delay: pt.delay,
                  ease: "easeInOut"
                }}
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${auraObj.color} ${particleSizes[size]}`}
              >
                <IconComponent className="w-full h-full drop-shadow-[0_0_10px_currentColor] stroke-[2.5]" />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Futuristic 3D Grid Stage / Holographic Stand */}
      {size !== 'sm' && (
        <div 
          className="absolute bottom-1 w-[120%] h-6 pointer-events-none z-0 flex items-center justify-center"
          style={{ transform: 'rotateX(72deg) translateY(24px)', transformStyle: 'preserve-3d' }}
        >
          {/* External dynamic scanning energy rings */}
          <div className="absolute w-32 h-32 rounded-full border-2 border-indigo-500/10 animate-[ping_3.5s_infinite] opacity-60" />
          <div className="absolute w-24 h-24 rounded-full border border-dashed border-indigo-400/30 animate-[spin_12s_linear_infinite]" />
          
          {/* Inner 3D physical metallic plate */}
          <div className="absolute w-20 h-20 rounded-full bg-gradient-to-b from-indigo-950/60 to-slate-950/90 border border-slate-700/60 shadow-[0_0_15px_rgba(99,102,241,0.25)] flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-emerald-500/20 animate-[spin_6s_linear_infinite]" />
          </div>
          
          {/* Soft downward spotlight emission */}
          <div 
            className="absolute -top-12 w-20 h-24 bg-gradient-to-t from-transparent via-indigo-500/5 to-indigo-500/25 blur-md"
            style={{ transform: 'rotateX(-90deg) translateZ(10px)' }}
          />
        </div>
      )}

      {/* Volumetric 3D Interactive Mascot Container */}
      <motion.div
        animate={getMotionAnimation()}
        onClick={handleAvatarClick}
        style={{ transformStyle: 'preserve-3d' }}
        className={`relative rounded-full bg-gradient-to-tr ${themeObj.from} flex items-center justify-center border-2 border-white/90 cursor-pointer select-none shadow-2xl transition-all duration-300 group ${themeObj.shadow} ${sizeClasses[size]}`}
      >
        {/* Glow capsule shell */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 via-transparent to-black/30 pointer-events-none mix-blend-overlay" />

        {/* Glossy Specular outer shell - 3D material reflection lens */}
        <div className="absolute top-0.5 left-2 right-2 h-[35%] rounded-t-full bg-gradient-to-b from-white/45 via-white/10 to-transparent pointer-events-none filter blur-[0.5px] z-10" />
        
        {/* Deep dual inner glass light tube */}
        <div className="absolute bottom-1 right-2 w-3 h-3 rounded-full bg-white/25 filter blur-[0.5px] pointer-events-none z-10" />
        <div className="absolute bottom-2.5 right-4 w-1.5 h-1.5 rounded-full bg-white/30 filter blur-[0.1px] pointer-events-none z-10 animate-pulse" />

        {/* Dynamic Inner concentric lighting pattern - gives depth behind emoji */}
        <div className={`absolute inset-2.5 rounded-full ${themeObj.highlight} filter blur-[2px] opacity-75 animate-pulse`} />

        {/* Mascot Face Emoji - Multi-Layered 3D Projection Drop Shadow effect */}
        <motion.span 
          animate={isSprinting ? { scale: [1, 1.35, 1], rotate: [0, 360, 0] } : {}}
          className="relative z-10 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.38)] select-none text-center select-none block transform-gpu active:scale-95"
          style={{ transform: 'translateZ(18px) scale(0.96)' }}
        >
          {characterObj.emoji}
        </motion.span>

        {/* Tactical High-Depth Accessories Layer */}
        {accessoryObj.id !== 'none' && (
          <div 
            className={`absolute select-none text-base sm:text-lg pointer-events-none filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.45)] whitespace-nowrap ${accessoryObj.offset}`}
            style={{ transform: 'translateZ(28px)' }}
          >
            {accessoryObj.label}
          </div>
        )}

        {/* Holographic scanning overlay line */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-25">
          <div className="w-full h-1 bg-cyan-400/40 opacity-70 blur-[0.5px] shadow-[0_0_8px_rgba(34,211,238,0.7)] absolute top-0 animate-[bounce_2.5s_infinite]" />
        </div>
      </motion.div>

      {/* 3D Floating Name Tag pedestal flag for larger sizes */}
      {size === 'xl' && (
        <div 
          className="mt-5 bg-slate-950/95 border border-slate-800 px-4 py-1.5 rounded-xl shadow-xl text-center relative pointer-events-none"
          style={{ transform: 'translateZ(15px)' }}
        >
          {/* Corner lights */}
          <div className="absolute -top-0.5 -left-0.5 w-1 h-1 bg-emerald-450 rounded-full animate-ping" />
          <div className="absolute -bottom-0.5 -right-0.5 w-1 h-1 bg-indigo-500 rounded-full animate-ping" />
          
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black font-mono text-emerald-400 animate-pulse">● PROTOCOL SECURE</span>
            <div className="w-[1px] h-3 bg-slate-800" />
            <span className="text-[10px] font-bold font-mono text-slate-300">GEO L3</span>
          </div>
        </div>
      )}
    </div>
  );
}
