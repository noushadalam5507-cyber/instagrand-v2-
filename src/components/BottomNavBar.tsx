import React from 'react';
import {
  Home,
  Search,
  PlusSquare,
  MessageCircle,
  User,
  Sparkles,
  Film,
  Music
} from 'lucide-react';
import { ViewTab, UserProfile } from '../types';

interface BottomNavBarProps {
  activeTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  currentUser: UserProfile | null;
  unreadMessagesCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  unreadMessagesCount = 2,
}) => {
  return (
    <nav
      id="instagram-bottom-nav"
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-purple-900/60 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_30px_rgba(168,85,247,0.18)]"
    >
      <div className="max-w-xl mx-auto px-2 sm:px-4 py-1.5 flex items-center justify-between">
        {/* Tab 1: Home */}
        <button
          id="nav-tab-home"
          type="button"
          onClick={() => onSelectTab('home')}
          aria-label="Home Feed"
          className={`relative group flex flex-col items-center justify-center p-1.5 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'text-white'
              : 'text-zinc-400 hover:text-purple-300'
          }`}
        >
          <div
            className={`relative p-1 rounded-xl transition-all duration-300 ${
              activeTab === 'home'
                ? 'bg-purple-600/20 text-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.4)]'
                : 'group-hover:bg-purple-950/40'
            }`}
          >
            <Home
              className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform group-active:scale-90 ${
                activeTab === 'home' ? 'stroke-[2.5px]' : 'stroke-2'
              }`}
            />
            {activeTab === 'home' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-fuchsia-400 to-purple-400 shadow-[0_0_8px_#d946ef]" />
            )}
          </div>
          <span className="text-[9px] sm:text-[10px] font-medium tracking-tight mt-0.5">
            Home
          </span>
        </button>

        {/* Tab 2: Reels (Instagram Viral Video Player) */}
        <button
          id="nav-tab-reels"
          type="button"
          onClick={() => onSelectTab('reels')}
          aria-label="Watch Reels"
          className={`relative group flex flex-col items-center justify-center p-1.5 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'reels'
              ? 'text-white'
              : 'text-zinc-400 hover:text-purple-300'
          }`}
        >
          <div
            className={`relative p-1 rounded-xl transition-all duration-300 ${
              activeTab === 'reels'
                ? 'bg-purple-600/20 text-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.4)]'
                : 'group-hover:bg-purple-950/40'
            }`}
          >
            <Film
              className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform group-active:scale-90 ${
                activeTab === 'reels' ? 'stroke-[2.5px] text-fuchsia-400' : 'stroke-2'
              }`}
            />
            {activeTab === 'reels' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-fuchsia-400 to-purple-400 shadow-[0_0_8px_#d946ef]" />
            )}
          </div>
          <span className="text-[9px] sm:text-[10px] font-medium tracking-tight mt-0.5">
            Reels
          </span>
        </button>

        {/* Tab 3: Music Jukebox (Hindi, Urdu, Slowed, English) */}
        <button
          id="nav-tab-music"
          type="button"
          onClick={() => onSelectTab('music')}
          aria-label="Music Jukebox"
          className={`relative group flex flex-col items-center justify-center p-1.5 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'music'
              ? 'text-white'
              : 'text-zinc-400 hover:text-purple-300'
          }`}
        >
          <div
            className={`relative p-1 rounded-xl transition-all duration-300 ${
              activeTab === 'music'
                ? 'bg-purple-600/20 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                : 'group-hover:bg-purple-950/40'
            }`}
          >
            <Music
              className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform group-active:scale-90 ${
                activeTab === 'music' ? 'stroke-[2.5px] text-amber-300' : 'stroke-2'
              }`}
            />
            {activeTab === 'music' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-fuchsia-400 shadow-[0_0_8px_#fbbf24]" />
            )}
          </div>
          <span className="text-[9px] sm:text-[10px] font-medium tracking-tight mt-0.5">
            Music
          </span>
        </button>

        {/* Tab 4: Plus (+) / Create Post/Reel */}
        <button
          id="nav-tab-create"
          type="button"
          onClick={() => onSelectTab('create')}
          aria-label="Create Post"
          className="relative group flex flex-col items-center justify-center -translate-y-1.5 cursor-pointer"
        >
          <div
            className={`relative p-2.5 rounded-2xl bg-gradient-to-tr from-purple-700 via-fuchsia-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] border-2 border-purple-300/40 transition-all duration-300 group-hover:scale-110 group-active:scale-95 ${
              activeTab === 'create'
                ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-zinc-950 shadow-[0_0_25px_rgba(6,182,212,0.6)]'
                : ''
            }`}
          >
            <PlusSquare className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5px]" />
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-300 animate-ping opacity-75" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-fuchsia-300 tracking-tight mt-0.5">
            Create
          </span>
        </button>

        {/* Tab 5: Messages */}
        <button
          id="nav-tab-messages"
          type="button"
          onClick={() => onSelectTab('messages')}
          aria-label="Direct Messages"
          className={`relative group flex flex-col items-center justify-center p-1.5 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'messages'
              ? 'text-white'
              : 'text-zinc-400 hover:text-purple-300'
          }`}
        >
          <div
            className={`relative p-1 rounded-xl transition-all duration-300 ${
              activeTab === 'messages'
                ? 'bg-purple-600/20 text-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.4)]'
                : 'group-hover:bg-purple-950/40'
            }`}
          >
            <MessageCircle
              className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform group-active:scale-90 ${
                activeTab === 'messages' ? 'stroke-[2.5px]' : 'stroke-2'
              }`}
            />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-[16px] h-[16px] px-0.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-[0_0_10px_#ec4899] animate-pulse">
                {unreadMessagesCount}
              </span>
            )}
            {activeTab === 'messages' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-fuchsia-400 to-purple-400 shadow-[0_0_8px_#d946ef]" />
            )}
          </div>
          <span className="text-[9px] sm:text-[10px] font-medium tracking-tight mt-0.5">
            Chat
          </span>
        </button>

        {/* Tab 6: Profile */}
        <button
          id="nav-tab-profile"
          type="button"
          onClick={() => onSelectTab('profile')}
          aria-label="User Profile"
          className={`relative group flex flex-col items-center justify-center p-1.5 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'text-white'
              : 'text-zinc-400 hover:text-purple-300'
          }`}
        >
          <div
            className={`relative p-0.5 rounded-full transition-all duration-300 ${
              activeTab === 'profile'
                ? 'ring-2 ring-fuchsia-400 ring-offset-2 ring-offset-zinc-950 shadow-[0_0_15px_rgba(217,70,239,0.5)]'
                : 'group-hover:ring-1 group-hover:ring-purple-500/50'
            }`}
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-purple-500/50"
              />
            ) : (
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-purple-950 border border-purple-500/50 flex items-center justify-center text-purple-300">
                <User className="w-4 h-4" />
              </div>
            )}
            {currentUser?.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-fuchsia-600 border border-zinc-950 flex items-center justify-center shadow-[0_0_6px_#d946ef]">
                <Sparkles className="w-1.5 h-1.5 text-cyan-200" />
              </div>
            )}
          </div>
          <span className="text-[9px] sm:text-[10px] font-medium tracking-tight mt-0.5">
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
};
