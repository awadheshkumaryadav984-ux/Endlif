import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X, Shield, QrCode, Copy, Check, Share2, Download, MessageSquare } from 'lucide-react';

interface GuardianShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  rankName: string;
  rankColor: string;
  points: number;
  referralCode: string;
  referralLink: string;
  alias: string;
}

export const GuardianShareCardModal: React.FC<GuardianShareCardModalProps> = ({
  isOpen,
  onClose,
  rankName,
  rankColor,
  points,
  referralCode,
  referralLink,
  alias
}) => {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const shareText = `I just became a ${rankName} on Endlif. I’m helping build a safer community with real-time check-ins and verified guardian networks. Join my circle to protect each other: ${referralLink}`;

  const handleCopy = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareSMS = () => {
    const encoded = encodeURIComponent(shareText);
    window.location.href = `sms:?body=${encoded}`;
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Endlif ${rankName} Attestation`,
          text: shareText,
          url: referralLink,
        });
      } catch {
        // User dismissed or share failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <motion.div 
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-3xl p-5 text-white shadow-2xl relative space-y-4"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-left space-y-1">
          <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-900/50">
            OFFICIAL ATTESTATION CARD
          </span>
          <h3 className="text-lg font-black tracking-tight text-white">Share Your Guardian Impact</h3>
          <p className="text-[11px] text-slate-400">
            Inspire your friends and family to stay protected. Every genuine activation strengthens the community safety mesh.
          </p>
        </div>

        {/* The Branded Graphic Card */}
        <div 
          ref={cardRef}
          className="w-full rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black p-5 border border-slate-800 relative overflow-hidden text-left shadow-xl"
        >
          {/* Neon decorative background glow */}
          <div 
            className="absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: rankColor }}
          />

          {/* Top Brand & Attestation Status */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center border shadow-sm"
                style={{ 
                  backgroundColor: `${rankColor}18`,
                  borderColor: `${rankColor}44`,
                  color: rankColor 
                }}
              >
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="font-mono font-black text-xs tracking-wider uppercase text-white block">
                  ENDLIF
                </span>
                <span className="text-[8px] font-mono text-slate-400 tracking-widest block uppercase">
                  Guardian Network
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block text-[8px] font-mono font-bold uppercase text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
                VERIFIED SENTINEL
              </span>
            </div>
          </div>

          {/* Core Card Message */}
          <div className="py-4 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-black uppercase"
              style={{
                backgroundColor: `${rankColor}15`,
                borderColor: `${rankColor}44`,
                color: rankColor
              }}
            >
              <Shield className="w-3 h-3" />
              {rankName}
            </div>

            <p className="text-sm font-black text-white leading-snug tracking-tight">
              “I just became a <span style={{ color: rankColor }}>{rankName}</span> on Endlif. I’m helping build a safer community.”
            </p>

            <div className="flex items-center gap-3 pt-1 text-slate-400 text-[10px] font-mono">
              <div>
                <span className="block text-slate-500 text-[8px] uppercase">Guardian Alias</span>
                <span className="font-bold text-white">{alias}</span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="block text-slate-500 text-[8px] uppercase">Verified Safety PTS</span>
                <span className="font-bold text-emerald-400">{points.toLocaleString()} PTS</span>
              </div>
            </div>
          </div>

          {/* QR Code & Referral Code Footer */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="space-y-0.5 text-left">
              <span className="text-[8px] font-mono uppercase text-slate-500 block">Personal Safety Invite Code</span>
              <span className="font-mono font-black text-xs text-indigo-300 tracking-wider block">
                {referralCode}
              </span>
              <span className="text-[8px] text-slate-400 font-sans block">
                Join verified mutual safety circle
              </span>
            </div>

            {/* Stylized QR Code Graphic */}
            <div className="w-11 h-11 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center shadow-inner">
              <QrCode className="w-9 h-9 text-slate-950" />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 py-2.5 rounded-xl text-[10px] font-mono font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            {copied ? 'Copied!' : 'Copy Text'}
          </button>

          <button
            type="button"
            onClick={handleShareSMS}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white py-2.5 rounded-xl text-[10px] font-mono font-black uppercase flex items-center justify-center gap-1.5 transition-all shadow-md shadow-sky-950/40 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Device SMS
          </button>
        </div>

        <button
          type="button"
          onClick={handleNativeShare}
          className="w-full bg-indigo-600 hover:bg-indigo-550 text-white py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-950/40 cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          Share Guardian Attestation
        </button>
      </motion.div>
    </div>
  );
};
