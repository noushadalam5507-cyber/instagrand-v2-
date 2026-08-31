import React from 'react';
import {
  Sparkles,
  Crown,
  Video,
  AtSign,
  Users,
  Shield,
  LogOut,
  LogIn,
  Zap,
  Activity,
  Coins,
  ShieldCheck,
  Settings,
  Lock,
  Smartphone
} from 'lucide-react';
import { Cyber3DIcon } from './Cyber3DIcon';
import { ThemeToggle } from './ThemeToggle';
import { UserProfile, ViewTab } from '../types';

interface NavbarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  isInCall: boolean;
  onOpenAdminVault?: () => void;
  onOpenSecurity?: () => void;
  onOpenDailyCheckIn?: () => void;
  onOpenStudioPass?: () => void;
  onOpenAIAssistant?: () => void;
  onOpenSpotlight?: () => void;
  onOpenCoinStore?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenAuth,
  onSignOut,
  isInCall,
  onOpenAdminVault,
  onOpenSecurity,
  onOpenDailyCheckIn,
  onOpenStudioPass,
  onOpenAIAssistant,
  onOpenSpotlight,
  onOpenCoinStore,
}) => {
  const isOwnerAdmin =
    currentUser?.email?.toLowerCase() === 'noushadalam5507@gmail.com' ||
    currentUser?.username === 'naushad' ||
    currentUser?.role === 'admin';

  return (
    <header id="main-navbar" className="sticky top-0 z-40 w-full bg-zinc-950/85 backdrop-blur-xl border-b border-purple-900/40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand Logo with Continuous 360 Rotating Chromatic 3D Icon */}
        <div
          id="brand-logo"
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0"
        >
          <div className="group-hover:scale-105 transition-transform flex items-center justify-center">
            <Cyber3DIcon
              size={40}
              isProcessing={isInCall}
              processLabel={isInCall ? 'CALL' : ''}
              theme="chromatic-shift"
              showRings={true}
              showParticles={false}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white neon-text-glow font-sans">
                Instagrand
              </span>
              <span className="text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 text-white shadow-md shadow-blue-500/30 uppercase tracking-wider">
                N A
              </span>
            </div>
            <p className="text-[9px] text-cyan-300/80 font-mono hidden sm:block">
              Founder: MD Naushad Alam · Universal Apple, Android & PC
            </p>
          </div>
        </div>

        {/* Center Tab Navigation (Quick Switcher on Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-zinc-900/80 border border-purple-900/50 rounded-2xl">
          <button
            id="nav-tab-home-top"
            type="button"
            onClick={() => onSelectTab('home')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'home'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Feed</span>
          </button>

          <button
            id="nav-tab-search-top"
            type="button"
            onClick={() => onSelectTab('search')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'search'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Search & Follow</span>
          </button>

          <button
            id="nav-tab-checker-top"
            type="button"
            onClick={() => onSelectTab('username-checker')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'username-checker'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <AtSign className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Handle Registry</span>
          </button>

          <button
            id="nav-tab-call-module"
            type="button"
            onClick={() => onSelectTab('call-module')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'call-module'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-fuchsia-300" />
            <span>Live 4K Calling</span>
            {isInCall && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>

          <button
            id="nav-tab-messages-top"
            type="button"
            onClick={() => onSelectTab('messages')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'messages'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>DMs</span>
          </button>
        </nav>

        {/* Right User Auth & Control Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* AI Guru Support Button */}
          {onOpenAIAssistant && (
            <button
              id="nav-ai-assistant-btn"
              type="button"
              onClick={onOpenAIAssistant}
              className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-950/80 to-purple-950/80 hover:from-fuchsia-900 hover:to-purple-900 border border-fuchsia-500/40 text-fuchsia-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="InstaGrand AI Assistant & Photo Guru"
            >
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
              <span className="hidden md:inline">AI Guru</span>
            </button>
          )}

          {/* Daily Reward +50 Coins Button */}
          {onOpenDailyCheckIn && (
            <button
              id="nav-daily-reward-btn"
              type="button"
              onClick={onOpenDailyCheckIn}
              className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900/80 border border-amber-400/50 text-amber-300 text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Claim 50 Free Coins Daily"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">+50 Coins</span>
            </button>
          )}

          {/* Studio Pass VIP Button */}
          {onOpenStudioPass && (
            <button
              id="nav-studio-pass-btn"
              type="button"
              onClick={onOpenStudioPass}
              className={`px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                currentUser?.hasStudioPass
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-zinc-900/90 border-purple-800 text-purple-300 hover:border-cyan-400'
              }`}
              title="Studio Pass (Verified Badge, Ad-Free, 3D Filters)"
            >
              <Crown className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">{currentUser?.hasStudioPass ? 'VIP Active' : 'Studio Pass'}</span>
            </button>
          )}

          {/* Theme Mode Toggle (Purple / Dark / Light) */}
          <ThemeToggle variant="compact" />

          {/* Anti-Hack Device Shield Button */}
          {onOpenSecurity && (
            <button
              id="nav-security-shield-btn"
              type="button"
              onClick={onOpenSecurity}
              className="p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 transition-colors cursor-pointer"
              title="Anti-Hack Device Shield & Active Sessions"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </button>
          )}

          {/* Master Owner / Admin Vault Button */}
          {onOpenAdminVault && isOwnerAdmin && (
            <button
              id="nav-open-admin-vault-btn"
              type="button"
              onClick={onOpenAdminVault}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-fuchsia-900/40 to-purple-900/40 hover:from-amber-500/30 hover:to-purple-800/50 border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Owner / Admin Master Data Control"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">Admin Vault</span>
            </button>
          )}

          {/* User Profile / Coins Pill */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              {/* Wallet Coin Pill */}
              <div
                id="navbar-wallet-coins-pill"
                onClick={onOpenCoinStore ? onOpenCoinStore : () => onSelectTab('profile')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold cursor-pointer hover:bg-amber-500/20 transition-colors shadow-sm active:scale-95"
                title="Coin Store & Earn Free Coins (+100 Sign up bonus)"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentUser.coins ?? 100}</span>
              </div>

              <div
                id="user-profile-pill"
                onClick={onOpenAuth}
                className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-zinc-900/90 border transition-all cursor-pointer shadow-sm ${
                  currentUser.hasStudioPass || currentUser.isVerified
                    ? 'border-cyan-400 ring-1 ring-cyan-400/40'
                    : 'border-purple-500/40 hover:border-purple-400'
                }`}
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-fuchsia-400"
                  />
                  {(currentUser.hasStudioPass || currentUser.isVerified) && (
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[9px] font-black shadow-sm">
                      ✓
                    </span>
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-white leading-tight truncate max-w-[90px]">
                      {currentUser.name}
                    </p>
                    {(currentUser.hasStudioPass || currentUser.isVerified) && (
                      <span className="text-[10px] text-cyan-300 animate-pulse">✦</span>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-fuchsia-300 leading-none">
                    @{currentUser.username || 'naushad'}
                  </p>
                </div>
              </div>

              <button
                id="nav-settings-btn"
                type="button"
                onClick={() => onSelectTab('settings')}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-purple-300 hover:text-white transition-colors border border-purple-950 cursor-pointer"
                title="Settings and activity"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                id="sign-out-btn"
                type="button"
                onClick={onSignOut}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors border border-purple-950 cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="nav-google-sign-in-btn"
              type="button"
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
