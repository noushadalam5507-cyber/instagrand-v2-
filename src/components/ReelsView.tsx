import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Music,
  Plus,
  Sparkles,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Flame,
  CheckCircle2,
  Send,
  Radio,
  Download,
  Disc3,
  Zap,
  Coins,
  ShieldCheck,
  Award,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReelItem, ReelComment, REELS_DATA } from '../data/reelsData';
import { UserProfile } from '../types';
import { AdMobBanner } from './AdMobBanner';
import { SmartReelAdBreakModal } from './SmartReelAdBreakModal';
import { DuetRemixModal } from './DuetRemixModal';
import { shouldBlockAds } from '../lib/adminAdPolicy';
import { recordTrafficConsumption } from '../utils/trafficTracker';

interface ReelsViewProps {
  currentUser: UserProfile | null;
  onSelectMusicTrack?: (trackTitle: string) => void;
  onNavigateToMusic?: () => void;
  onUpdateCoins?: (newCoins: number) => void;
}

export const ReelsView: React.FC<ReelsViewProps> = ({
  currentUser,
  onSelectMusicTrack,
  onNavigateToMusic,
  onUpdateCoins,
}) => {
  const [reels, setReels] = useState<ReelItem[]>(REELS_DATA);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isCommentsOpen, setIsCommentsOpen] = useState<boolean>(false);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [earningsToast, setEarningsToast] = useState<{ amount: string; message: string } | null>(null);
  const [watchedReelIds, setWatchedReelIds] = useState<Set<string>>(new Set());
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isDuetModalOpen, setIsDuetModalOpen] = useState<boolean>(false);
  const [duetTargetReel, setDuetTargetReel] = useState<ReelItem | null>(null);

  // Smart Ad Interval state (1 short sponsored video ad only after every 5 reels)
  const SMART_AD_INTERVAL = 5;
  const [reelsWatchedCount, setReelsWatchedCount] = useState<number>(0);
  const [isSmartAdModalOpen, setIsSmartAdModalOpen] = useState<boolean>(false);
  const [pendingNextIndex, setPendingNextIndex] = useState<number | null>(null);

  // New reel upload state
  const [newCaption, setNewCaption] = useState<string>('');
  const [newSongTitle, setNewSongTitle] = useState<string>('Apna Bana Le · Arijit Singh');
  const [newCategory, setNewCategory] = useState<'hindi' | 'english' | 'urdu' | 'slowed'>('hindi');
  const [newVideoUrl, setNewVideoUrl] = useState<string>('https://assets.mixkit.co/videos/preview/mixkit-girl-dancing-in-a-nightclub-with-neon-lights-42525-large.mp4');

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const filteredReels = reels.filter((r) => {
    if (selectedCategory === 'all') return true;
    return r.category === selectedCategory;
  });

  const activeReel: ReelItem | undefined = filteredReels[currentIndex] || filteredReels[0];

  // Smooth uninterrupted playback when switching reels
  useEffect(() => {
    if (!activeReel) return;
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }

    // Track unique views cleanly without intrusive popups on every reel
    if (!watchedReelIds.has(activeReel.id)) {
      setWatchedReelIds((prev) => new Set([...prev, activeReel.id]));
      setReelsWatchedCount((prev) => prev + 1);

      // Meter real-time traffic consumption (6.5 MB per reel) & award stream drop coins
      recordTrafficConsumption(6.5, `4K Reel Stream: ${activeReel.caption.slice(0, 20)}`, (coinsAdded) => {
        if (onUpdateCoins && currentUser) {
          onUpdateCoins((currentUser.coins ?? 100) + coinsAdded);
        }
      });
    }
  }, [currentIndex, activeReel?.id, selectedCategory]);

  const handleNextReel = () => {
    const nextIdx = currentIndex < filteredReels.length - 1 ? currentIndex + 1 : 0;
    const newCount = reelsWatchedCount + 1;

    // Trigger Smart Ad Break only every 5-6 reels (non-admin)
    if (newCount > 0 && newCount % SMART_AD_INTERVAL === 0 && !shouldBlockAds(currentUser)) {
      setPendingNextIndex(nextIdx);
      setIsSmartAdModalOpen(true);
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      setCurrentIndex(nextIdx);
    }
  };

  const handlePrevReel = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(filteredReels.length - 1);
    }
  };

  const handleProceedAfterAdBreak = () => {
    if (pendingNextIndex !== null) {
      setCurrentIndex(pendingNextIndex);
      setPendingNextIndex(null);
    } else {
      setCurrentIndex((prev) => (prev + 1) % filteredReels.length);
    }
  };

  const handleRewardEarnedFromAd = (earnedCoins: number, newTotalCoins: number) => {
    if (onUpdateCoins) {
      onUpdateCoins(newTotalCoins);
    }
    setEarningsToast({
      amount: `+${earnedCoins} Free Coins! 🍌`,
      message: 'Ad Break Reward Credited to your Wallet!',
    });
    confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setEarningsToast(null), 4000);
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleToggleLike = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          const isLiked = !r.isLiked;
          if (isLiked) {
            confetti({ particleCount: 25, spread: 40, origin: { y: 0.7 } });
          }
          return {
            ...r,
            isLiked,
            likesCount: isLiked ? r.likesCount + 1 : r.likesCount - 1,
          };
        }
        return r;
      })
    );
  };

  const handleAddComment = (reelId: string) => {
    if (!newCommentText.trim()) return;
    const newComment: ReelComment = {
      id: `rc-${Date.now()}`,
      authorName: currentUser?.name || 'You',
      authorUsername: currentUser?.username || 'user',
      authorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      text: newCommentText.trim(),
      timestamp: 'Just now',
      likes: 1,
      isVerified: currentUser?.isVerified,
    };

    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          return {
            ...r,
            commentsCount: r.commentsCount + 1,
            comments: [newComment, ...(r.comments || [])],
          };
        }
        return r;
      })
    );
    setNewCommentText('');
  };

  const handlePublishNewReel = (e: React.FormEvent) => {
    e.preventDefault();
    const newReel: ReelItem = {
      id: `reel-${Date.now()}`,
      authorId: currentUser?.id || 'usr-self',
      authorName: currentUser?.name || 'Naushad Alam',
      authorUsername: currentUser?.username || 'naushad',
      authorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      isVerified: currentUser?.isVerified ?? true,
      videoUrl: newVideoUrl,
      posterUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      caption: newCaption || 'New Instagrand 4K Reel! 💜',
      audioTrackTitle: newSongTitle,
      audioTrackArtist: 'Original Audio Studio',
      category: newCategory,
      likesCount: 1,
      isLiked: true,
      commentsCount: 0,
      comments: [],
      sharesCount: 0,
      viewsCount: 1,
      adMobEarnings: '+$0.65 AdMob',
      tags: ['#NewReel', '#Instagrand', '#ViralVideo'],
    };

    setReels((prev) => [newReel, ...prev]);
    setIsUploadModalOpen(false);
    setCurrentIndex(0);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const categories = [
    { id: 'all', label: '🔥 All Popular' },
    { id: 'hindi', label: '🇮🇳 Hindi Viral' },
    { id: 'urdu', label: '🌙 Urdu & Sufi' },
    { id: 'slowed', label: '🎧 Slowed + Reverb' },
    { id: 'english', label: '⚡ English Billboard' },
  ];

  if (!activeReel) {
    return (
      <div className="p-8 text-center text-zinc-400">
        <p>No reels found in this category.</p>
        <button
          onClick={() => setSelectedCategory('all')}
          className="mt-3 px-4 py-2 bg-purple-600 rounded-xl text-white font-bold text-xs"
        >
          View All Reels
        </button>
      </div>
    );
  }

  return (
    <div id="instagrand-reels-container" className="max-w-md mx-auto space-y-3 pb-20 animate-fade-in relative">
      {/* Smart Ad Interval Frequency Bar */}
      <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-zinc-950/90 border border-purple-800/40 text-xs shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[11px] font-black text-white flex items-center gap-1.5">
              <span>Smart Ad Interval: 1 per 5 Reels</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                Smooth UX
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">
              Reels in cycle: <span className="text-amber-300 font-bold">{reelsWatchedCount % SMART_AD_INTERVAL}/5</span> · 0 Ad Spam
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsSmartAdModalOpen(true)}
          className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-600/20 hover:from-amber-500/30 hover:to-purple-600/30 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer hover:scale-105 active:scale-95"
          title="Watch short sponsored clip now to earn 10 Coins"
        >
          <Coins className="w-3 h-3 text-amber-400" />
          <span>+10🪙 Ad</span>
        </button>
      </div>

      {/* Category Filter Pills Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1 px-1">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentIndex(0);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-black tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)] scale-105'
                  : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-purple-900/40 hover:bg-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold flex items-center gap-1 flex-shrink-0 hover:scale-105 transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Post Reel</span>
        </button>
      </div>

      {/* Main Instagram Vertical Reel Player Box */}
      <div
        id="active-reel-card"
        className="relative w-full h-[76vh] rounded-3xl overflow-hidden bg-black border-2 border-purple-600/50 shadow-[0_0_40px_rgba(168,85,247,0.35)] select-none flex flex-col justify-between"
      >
        {/* Background Video element */}
        <video
          ref={videoRef}
          src={activeReel.videoUrl}
          poster={activeReel.posterUrl}
          autoPlay
          playsInline
          loop
          muted={isMuted}
          onClick={handleTogglePlay}
          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        />

        {/* Dark Vignette Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

        {/* Play/Pause Center Indicator */}
        {!isPlaying && (
          <div
            onClick={handleTogglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-zinc-950/80 border-2 border-fuchsia-400 text-white flex items-center justify-center shadow-[0_0_25px_rgba(217,70,239,0.7)] animate-scale">
              <Play className="w-8 h-8 fill-current ml-1" />
            </div>
          </div>
        )}

        {/* Top Header Bar inside Reel */}
        <div className="relative z-20 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-wider uppercase bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent drop-shadow">
              Instagrand Reels
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-500/40 font-mono font-bold">
              4K HD
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Mute / Unmute Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition-all cursor-pointer"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Floating Earnings Toast Notification */}
        {earningsToast && (
          <div className="absolute top-16 left-4 right-4 z-30 p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/95 via-fuchsia-600/95 to-purple-600/95 text-white shadow-2xl flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-black/40 flex items-center justify-center font-bold text-amber-300">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black">{earningsToast.amount}</div>
                <div className="text-[10px] text-amber-100">{earningsToast.message}</div>
              </div>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/50 font-bold border border-white/20">
              Founder & Creator Share
            </span>
          </div>
        )}

        {/* Right Floating Action Buttons Column (Like, Comment, Share, Audio, Up/Down Nav) */}
        <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-4 text-white">
          {/* 1. Like Button */}
          <button
            type="button"
            onClick={() => handleToggleLike(activeReel.id)}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div
              className={`p-2.5 rounded-full backdrop-blur-md border transition-all duration-300 group-hover:scale-110 group-active:scale-90 ${
                activeReel.isLiked
                  ? 'bg-rose-600/90 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                  : 'bg-black/60 border-white/20 text-white hover:bg-black/80'
              }`}
            >
              <Heart
                className={`w-6 h-6 ${
                  activeReel.isLiked ? 'fill-current stroke-rose-300' : 'stroke-2'
                }`}
              />
            </div>
            <span className="text-[11px] font-bold drop-shadow">
              {activeReel.likesCount.toLocaleString()}
            </span>
          </button>

          {/* 2. Comment Button */}
          <button
            type="button"
            onClick={() => setIsCommentsOpen(true)}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition-all group-hover:scale-110 group-active:scale-90">
              <MessageCircle className="w-6 h-6 stroke-2" />
            </div>
            <span className="text-[11px] font-bold drop-shadow">
              {activeReel.commentsCount.toLocaleString()}
            </span>
          </button>

          {/* 3. Share Button */}
          <button
            type="button"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
              }
              setEarningsToast({
                amount: 'Link Copied!',
                message: 'Share this popular Hindi/Urdu reel with friends 🚀',
              });
              setTimeout(() => setEarningsToast(null), 3000);
            }}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition-all group-hover:scale-110 group-active:scale-90">
              <Share2 className="w-6 h-6 stroke-2" />
            </div>
            <span className="text-[11px] font-bold drop-shadow">
              {activeReel.sharesCount.toLocaleString()}
            </span>
          </button>

          {/* 4. Duet & Remix Studio Button */}
          <button
            type="button"
            onClick={() => {
              setDuetTargetReel(activeReel);
              setIsDuetModalOpen(true);
              if (videoRef.current) {
                videoRef.current.pause();
              }
              setIsPlaying(false);
            }}
            className="flex flex-col items-center gap-1 group cursor-pointer"
            title="Create Duet & Remix Reel"
          >
            <div className="p-2.5 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-600 border border-fuchsia-400 text-white hover:scale-110 active:scale-90 transition-all shadow-[0_0_15px_rgba(217,70,239,0.6)] animate-pulse">
              <Layers className="w-6 h-6 stroke-2" />
            </div>
            <span className="text-[11px] font-bold drop-shadow text-fuchsia-300">Duet</span>
          </button>

          {/* 5. Rotating Vinyl Music Disc */}
          <div
            onClick={() => {
              if (onNavigateToMusic) onNavigateToMusic();
            }}
            className="flex flex-col items-center gap-1 group cursor-pointer"
            title="Listen song on Instagrand Music"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-amber-400 p-0.5 shadow-lg animate-spin duration-3000">
              <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center">
                <Disc3 className="w-5 h-5 text-amber-300" />
              </div>
            </div>
            <span className="text-[9px] font-mono text-purple-200">Music</span>
          </div>

          {/* 6. Next Reel Up/Down Quick Navigation */}
          <div className="flex flex-col gap-1 pt-1">
            <button
              type="button"
              onClick={handlePrevReel}
              title="Previous Reel"
              className="p-1.5 rounded-full bg-black/60 border border-white/20 hover:bg-black text-white cursor-pointer"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextReel}
              title="Next Reel"
              className="p-1.5 rounded-full bg-black/60 border border-white/20 hover:bg-black text-white cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Reel Info: Creator, Verified Badge, Caption, and Music Pill */}
        <div className="relative z-20 p-4 pr-20 space-y-2.5 text-white">
          {/* Creator Profile */}
          <div className="flex items-center gap-2.5">
            <img
              src={activeReel.authorAvatar}
              alt={activeReel.authorName}
              className="w-10 h-10 rounded-full object-cover border-2 border-fuchsia-400 shadow-md"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black drop-shadow">@{activeReel.authorUsername}</span>
                {activeReel.isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-cyan-300 fill-fuchsia-600" />
                )}
                <button
                  type="button"
                  className="ml-2 px-2.5 py-0.5 rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-[10px] font-bold text-white transition-all cursor-pointer"
                >
                  Follow
                </button>
              </div>
              <span className="text-[10px] text-purple-200/90">{activeReel.authorName}</span>
            </div>
          </div>

          {/* Reel Caption */}
          <p className="text-xs text-zinc-100 font-medium line-clamp-2 leading-relaxed drop-shadow">
            {activeReel.caption}
          </p>

          {/* Live Audio Pill Track */}
          <div
            onClick={() => {
              if (onSelectMusicTrack) onSelectMusicTrack(activeReel.audioTrackTitle);
              if (onNavigateToMusic) onNavigateToMusic();
            }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-fuchsia-500/50 text-xs font-bold text-white hover:border-fuchsia-400 cursor-pointer shadow-lg max-w-full"
          >
            <Music className="w-3.5 h-3.5 text-amber-300 animate-pulse flex-shrink-0" />
            <span className="truncate text-[11px]">{activeReel.audioTrackTitle} · {activeReel.audioTrackArtist}</span>
          </div>
        </div>
      </div>

      {/* Reel Index Indicator & Swipe Buttons with Smart Interval Countdown */}
      <div className="flex items-center justify-between px-2 text-xs text-zinc-400 font-mono">
        <div className="flex items-center gap-2">
          <span>Reel {currentIndex + 1} of {filteredReels.length}</span>
          <span className="text-emerald-400 font-bold">
            {SMART_AD_INTERVAL - (reelsWatchedCount % SMART_AD_INTERVAL) === 0
              ? '✨ Next: Ad Break'
              : `${SMART_AD_INTERVAL - (reelsWatchedCount % SMART_AD_INTERVAL)} clean reels until ad`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevReel}
            className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-purple-900/60 text-white text-xs font-bold cursor-pointer"
          >
            ▲ Prev
          </button>
          <button
            type="button"
            onClick={handleNextReel}
            className="px-4 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-bold cursor-pointer shadow-md"
          >
            ▼ Next Reel
          </button>
        </div>
      </div>

      {/* Official AdMob Banner Integration (Admin Ad-Free Protected) */}
      <AdMobBanner position="bottom" currentUser={currentUser} />

      {/* Comments Drawer Modal */}
      {isCommentsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={() => setIsCommentsOpen(false)}
        >
          <div
            className="w-full max-w-md h-[65vh] rounded-t-3xl sm:rounded-3xl bg-zinc-950 border border-purple-700/60 p-4 flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-purple-950">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-fuchsia-400" />
                <span className="text-sm font-black text-white">
                  Comments ({activeReel.commentsCount})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCommentsOpen(false)}
                className="p-1 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 py-3">
              {activeReel.comments.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  No comments yet. Be the first to comment on this reel!
                </div>
              ) : (
                activeReel.comments.map((comm) => (
                  <div key={comm.id} className="flex items-start gap-2.5">
                    <img
                      src={comm.authorAvatar}
                      alt={comm.authorName}
                      className="w-7 h-7 rounded-full object-cover border border-purple-500/50 flex-shrink-0"
                    />
                    <div className="flex-1 bg-zinc-900/80 p-2.5 rounded-2xl border border-purple-950 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white">@{comm.authorUsername}</span>
                        <span className="text-[10px] text-zinc-500">{comm.timestamp}</span>
                      </div>
                      <p className="text-zinc-200">{comm.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <div className="pt-2 border-t border-purple-950 flex items-center gap-2">
              <input
                type="text"
                placeholder="Add a comment to this reel..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddComment(activeReel.id);
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-purple-900/60 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500"
              />
              <button
                type="button"
                onClick={() => handleAddComment(activeReel.id)}
                className="p-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload New Reel Modal */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-zinc-950 border-2 border-purple-500/60 p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-purple-900/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-white">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Post New Viral Reel</h3>
                  <p className="text-[10px] text-purple-300">Earn with Google AdMob video revenue</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePublishNewReel} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-300 block mb-1">Reel Caption</label>
                <textarea
                  rows={2}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Drop an engaging caption with hashtags (#HindiReels #Slowed #Instagrand)..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-purple-900/60 text-xs text-white focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-300 block mb-1">Audio Sound Track</label>
                  <input
                    type="text"
                    value={newSongTitle}
                    onChange={(e) => setNewSongTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-purple-900/60 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-300 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-purple-900/60 text-xs text-white"
                  >
                    <option value="hindi">🇮🇳 Hindi Viral</option>
                    <option value="urdu">🌙 Urdu Ghazal & Sufi</option>
                    <option value="slowed">🎧 Slowed + Reverb</option>
                    <option value="english">⚡ English Global</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Founder AdMob monetization automatically attached to your reel.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-sm transition-all shadow-lg hover:scale-[1.02] cursor-pointer"
              >
                Publish Reel Now
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Smart Video Ad Break Modal (Triggered every 5-6 reels) */}
      <SmartReelAdBreakModal
        isOpen={isSmartAdModalOpen}
        onClose={() => setIsSmartAdModalOpen(false)}
        reelsWatchedCount={reelsWatchedCount}
        currentUser={currentUser}
        onRewardEarned={handleRewardEarnedFromAd}
        onProceedToNextReel={handleProceedAfterAdBreak}
      />

      {/* Duet & Remix Studio Modal */}
      <DuetRemixModal
        isOpen={isDuetModalOpen}
        onClose={() => setIsDuetModalOpen(false)}
        originalReel={duetTargetReel}
        currentUser={currentUser}
        onPostDuet={(newReel) => {
          setReels((prev) => [newReel, ...prev]);
          setCurrentIndex(0);
          setEarningsToast({
            amount: '+30 Coins Earned!',
            message: 'Your Duet Reel is live across NeonCall network! 🚀',
          });
          setTimeout(() => setEarningsToast(null), 4000);
        }}
        onUpdateCoins={onUpdateCoins}
      />
    </div>
  );
};
