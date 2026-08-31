import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Zap, Video, Volume2, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { Cyber3DIcon } from './Cyber3DIcon';

interface InAppSplashScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InAppSplashScreen: React.FC<InAppSplashScreenProps> = ({ isOpen, onClose }) => {
  const [progress, setProgress] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(false);

  const bootSteps = [
    'Booting Black & Blue 3D "N A" Hologram Engine...',
    'Connecting Agora RTC Opus 48kHz Engine...',
    'Loading Google AdMob Rewarded Video Unit...',
    'Synchronizing Firebase Firestore Cloud Vault...',
    'Activating 150-Coin Self-Unblock Protocols...',
    'Instagrand N A 3D Suite Ready!',
  ];

  useEffect(() => {
    if (!isOpen) return;

    setProgress(0);
    setCurrentStepIndex(0);
    setIsDone(false);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 3;
        if (next >= 100) {
          clearInterval(interval);
          setIsDone(true);
          return 100;
        }

        // Map step index
        const step = Math.min(
          bootSteps.length - 1,
          Math.floor((next / 100) * bootSteps.length)
        );
        setCurrentStepIndex(step);
        return next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="in-app-splash-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in select-none"
    >
      {/* Background Cyber Glow Fields */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500/15 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Interactive Splash Hub */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 box-border px-2">
        {/* Top App Identity Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-purple-500/40 text-purple-300 text-xs font-mono tracking-wider shadow-lg max-w-full">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="truncate">INSTAGRAND N A 3D SUITE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
        </div>

        {/* The 3D Multi-Chromatic Rotating Icon (Continuously rotates 360 degrees & shifts colors) */}
        <div className="py-2 w-full flex items-center justify-center overflow-visible">
          <Cyber3DIcon
            size="hero"
            isProcessing={!isDone}
            processType="installing"
            processProgress={progress}
            processLabel={bootSteps[currentStepIndex]}
            theme="black-blue"
            showRings={true}
            showParticles={true}
          />
        </div>

        {/* Title & Tagline */}
        <div className="space-y-2 max-w-xs">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>Instagrand</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400">
              N A
            </span>
          </h1>
          <p className="text-xs text-cyan-200/80 font-medium leading-relaxed">
            Black & Blue 3D Orbit · 150-Coin Self-Unblock · AdMob Video Rewards · Custom PIN Lock
          </p>
        </div>

        {/* System Boot Progress Bar */}
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-cyan-400" />
              {bootSteps[currentStepIndex]}
            </span>
            <span className="text-emerald-400 font-bold">{progress}%</span>
          </div>

          <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-purple-900/60 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 via-purple-500 to-pink-500 transition-all duration-150 shadow-[0_0_15px_#00ff66]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* System Security & Connection Status */}
          <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] font-mono text-zinc-400 text-left">
            <div className="p-2 rounded-xl bg-zinc-900/80 border border-emerald-900/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 font-medium">Cloud Vault: Active</span>
            </div>
            <div className="p-2 rounded-xl bg-zinc-900/80 border border-cyan-900/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-cyan-300 font-medium">Encrypted · 4K Opus</span>
            </div>
          </div>
        </div>

        {/* Enter App CTA Button */}
        <div className="w-full pt-2">
          <button
            type="button"
            onClick={onClose}
            className={`w-full py-4 rounded-2xl font-black text-sm tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
              isDone
                ? 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-600 hover:from-emerald-300 hover:to-purple-500 text-black shadow-emerald-400/30 hover:scale-[1.02]'
                : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-purple-600/30'
            }`}
          >
            <span>{isDone ? 'LAUNCH BY NAUSHAD · ENTER INSTAGRAND N A' : 'LAUNCH BY NAUSHAD'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
