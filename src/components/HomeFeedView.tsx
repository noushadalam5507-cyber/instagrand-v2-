import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Video,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  Music2,
  Music,
  Volume2,
  VolumeX,
  Send,
  Coins,
  Crown,
  Radio,
  Plus,
  Download,
  Film,
  DollarSign,
  Flame,
  X,
  Smile,
  Dices,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PostItem, StoryItem, UserProfile } from '../types';
import { AdMobBanner } from './AdMobBanner';
import { StoryCreatorModal } from './StoryCreatorModal';
import { MusicSelectorModal } from './MusicSelectorModal';
import { MUSIC_CATALOG } from '../data/musicTracks';

interface HomeFeedViewProps {
  currentUser: UserProfile | null;
  onStartCall: (roomId: string, targetUser?: string) => void;
  onOpenAuth: () => void;
  onNavigateToSearch: () => void;
  onCreateNewPost: () => void;
  onOpenAICreator?: () => void;
  onOpenVideoReels?: () => void;
  onOpenLuckySpin?: () => void;
  onOpenShakeAndWin?: () => void;
  posts: PostItem[];
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
}

export const HomeFeedView: React.FC<HomeFeedViewProps> = ({
  currentUser,
  onStartCall,
  onOpenAuth,
  onNavigateToSearch,
  onCreateNewPost,
  onOpenAICreator,
  onOpenVideoReels,
  onOpenLuckySpin,
  onOpenShakeAndWin,
  posts,
  onToggleLike,
  onAddComment,
}) => {
  const [activeStory, setActiveStory] = useState<StoryItem | null>(null);
  const [isStoryCreatorOpen, setIsStoryCreatorOpen] = useState<boolean>(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState<boolean>(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [openCommentsModalPostId, setOpenCommentsModalPostId] = useState<string | null>(null);
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());
  const [watchedEarningsToast, setWatchedEarningsToast] = useState<{ amount: string; coins: number } | null>(null);
  const [videoMutedState, setVideoMutedState] = useState<Record<string, boolean>>({
    'post-1': true,
  });

  // Story Audio Playback controller
  const [isStoryAudioPlaying, setIsStoryAudioPlaying] = useState<boolean>(true);
  const storyAudioRef = useRef<HTMLAudioElement | null>(null);

  // Dynamic user stories list with preloaded Hindi, Slowed, English, Naat tracks
  const [storyList, setStoryList] = useState<StoryItem[]>([
    {
      id: 'story-self',
      userId: currentUser?.id || 'usr-naushad',
      userName: currentUser?.name || 'Your Story',
      userUsername: currentUser?.username || 'naushad',
      userAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isVerified: currentUser?.isVerified ?? true,
      hasUnseenStory: false,
      mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      caption: 'Live streaming from Neon Studio 💜',
      musicTrackTitle: 'Apna Bana Le',
      musicTrackArtist: 'Arijit Singh',
      musicTrackAudioUrl: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
      musicCategory: 'hindi',
      adMobEarnings: '+$0.35 AdMob',
    },
    {
      id: 'story-1',
      userId: 'usr-elena',
      userName: 'Elena Vance',
      userUsername: 'elena_neon',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      hasUnseenStory: true,
      mediaUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
      caption: 'Direct Dialing @naushad in 4K Opus Studio! 🚀',
      musicTrackTitle: 'Kahani Suno 2.0 (Slowed + Reverb)',
      musicTrackArtist: 'Kaifi Khalil',
      musicTrackAudioUrl: 'https://assets.mixkit.co/music/preview/mixkit-deep-urban-623.mp3',
      musicCategory: 'slowed',
      adMobEarnings: '+$0.50 AdMob',
    },
    {
      id: 'story-2',
      userId: 'usr-marcus',
      userName: 'Dr. Marcus Lee',
      userUsername: 'marcus_ai',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      hasUnseenStory: true,
      mediaUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
      caption: 'WebRTC ultra low-latency nodes synced worldwide 📡',
      musicTrackTitle: 'Starboy (Cyber Neon Mix)',
      musicTrackArtist: 'The Weeknd',
      musicTrackAudioUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
      musicCategory: 'english',
      adMobEarnings: '+$0.48 AdMob',
    },
    {
      id: 'story-3',
      userId: 'usr-sophia',
      userName: 'Sophia Chen',
      userUsername: 'sophia_vr',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      hasUnseenStory: true,
      mediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      caption: 'Cyberpunk aesthetic drops tonight at 8 PM 🔮',
      musicTrackTitle: 'Chaleya (Jawan Hit)',
      musicTrackArtist: 'Arijit Singh & Shilpa Rao',
      musicTrackAudioUrl: 'https://assets.mixkit.co/music/preview/mixkit-holliday-690.mp3',
      musicCategory: 'hindi',
      adMobEarnings: '+$0.40 AdMob',
    },
    {
      id: 'story-4',
      userId: 'usr-devon',
      userName: 'Devon Miles',
      userUsername: 'devon_sound',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      isVerified: false,
      hasUnseenStory: true,
      mediaUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      caption: 'Tajdar-e-Haram Soulful acoustic vibes 🕌',
      musicTrackTitle: 'Tajdar-e-Haram (Acoustic Soul)',
      musicTrackArtist: 'Atif Aslam',
      musicTrackAudioUrl: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
      musicCategory: 'naat',
      adMobEarnings: '+$0.65 AdMob',
    },
  ]);

  // Handle active story music playback & AdMob revenue credit
  useEffect(() => {
    if (activeStory && activeStory.musicTrackAudioUrl) {
      if (storyAudioRef.current) {
        storyAudioRef.current.pause();
      }
      const audio = new Audio(activeStory.musicTrackAudioUrl);
      storyAudioRef.current = audio;
      audio.loop = true;
      audio.play().catch(() => {});
      setIsStoryAudioPlaying(true);

      setWatchedEarningsToast({
        amount: activeStory.adMobEarnings || '+$0.35 AdMob',
        coins: 5,
      });
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.8 } });
      const timer = setTimeout(() => setWatchedEarningsToast(null), 3500);

      return () => {
        audio.pause();
        clearTimeout(timer);
      };
    } else {
      if (storyAudioRef.current) {
        storyAudioRef.current.pause();
      }
    }
  }, [activeStory]);

  const handleToggleStoryAudio = () => {
    if (!storyAudioRef.current) return;
    if (isStoryAudioPlaying) {
      storyAudioRef.current.pause();
      setIsStoryAudioPlaying(false);
    } else {
      storyAudioRef.current.play().catch(() => {});
      setIsStoryAudioPlaying(true);
    }
  };

  const handleAddStory = (newStory: StoryItem) => {
    setStoryList((prev) => [newStory, ...prev]);
    setActiveStory(newStory);
  };

  const handleLike = (postId: string) => {
    onToggleLike(postId);
    const post = posts.find((p) => p.id === postId);
    if (post && !post.isLiked) {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#ec4899', '#d946ef', '#a855f7'],
      });
    }
  };

  const handleSavePost = (postId: string) => {
    setSavedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const handleSendComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    onAddComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const activeCommentsPost = posts.find((p) => p.id === openCommentsModalPostId);

  return (
    <div id="instagrand-home-feed" className="max-w-lg mx-auto space-y-4 px-2 sm:px-0 pb-28 animate-fade-in box-border">
      {/* 1. Instagram Stories Bar */}
      <section
        id="stories-bar-section"
        aria-label="Stories"
        className="p-3 rounded-2xl bg-zinc-950/80 border border-purple-900/40 shadow-lg backdrop-blur-sm"
      >
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Stories</span>
          </div>
          <button
            type="button"
            onClick={() => setIsMusicModalOpen(true)}
            className="text-[11px] font-semibold text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1 bg-purple-950/50 px-2 py-0.5 rounded-lg border border-purple-800/40 transition-colors"
          >
            <Music className="w-3 h-3 text-amber-300" />
            <span>Music Catalog ({MUSIC_CATALOG.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1 px-1">
          {/* Add story for current user */}
          <div
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
            onClick={() => setIsStoryCreatorOpen(true)}
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-purple-700 via-zinc-800 to-zinc-900 border border-purple-500/30 group-hover:scale-105 transition-all">
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt="Your story"
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 border border-zinc-950 flex items-center justify-center text-white shadow-sm">
                <Plus className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            </div>
            <span className="text-[10px] text-zinc-300 font-medium truncate w-14 text-center">
              Your Story
            </span>
          </div>

          {/* Other creator stories */}
          {storyList.slice(1).map((story) => (
            <div
              key={story.id}
              onClick={() => setActiveStory(story)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-purple-500 via-fuchsia-500 to-cyan-400 group-hover:scale-105 transition-all shadow-[0_0_8px_rgba(217,70,239,0.3)]">
                <div className="w-full h-full rounded-full p-0.5 bg-zinc-950 relative">
                  <img
                    src={story.userAvatar}
                    alt={story.userName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover"
                  />
                  {story.musicTrackTitle && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-fuchsia-600 text-white flex items-center justify-center text-[7px] border border-zinc-950">
                      ♫
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-zinc-300 font-medium truncate w-14 text-center">
                @{story.userUsername}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Compact Quick Features Ribbon (Clean single-row scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {onOpenLuckySpin && (
          <button
            type="button"
            onClick={onOpenLuckySpin}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Dices className="w-3.5 h-3.5 text-amber-400" />
            <span>Lucky Spin</span>
          </button>
        )}

        {onOpenShakeAndWin && (
          <button
            type="button"
            onClick={onOpenShakeAndWin}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:bg-purple-900/60 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
            <span>Shake & Win</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsMusicModalOpen(true)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-fuchsia-950/60 border border-fuchsia-500/40 text-fuchsia-300 hover:bg-fuchsia-900/60 text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          <Music className="w-3.5 h-3.5 text-fuchsia-400" />
          <span>Music Stories</span>
        </button>

        {onOpenAICreator && (
          <button
            type="button"
            onClick={onOpenAICreator}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Studio</span>
          </button>
        )}

        {onOpenVideoReels && (
          <button
            type="button"
            onClick={onOpenVideoReels}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Film className="w-3.5 h-3.5 text-emerald-400" />
            <span>5 Videos Reel</span>
          </button>
        )}
      </div>

      {/* Floating Watch-to-Earn Video Monetization Toast */}
      {watchedEarningsToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-zinc-950 border border-emerald-400 shadow-xl flex items-center gap-2 text-xs text-white font-bold animate-bounce">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400">
            <Coins className="w-3 h-3" />
          </div>
          <div>
            <span>Reward: <strong className="text-emerald-300">{watchedEarningsToast.amount}</strong> + <strong className="text-amber-300">{watchedEarningsToast.coins} Coins</strong>!</span>
          </div>
        </div>
      )}

      {/* 3. Instagram-Style Clean Posts Feed */}
      <div className="space-y-5">
        {posts.map((post) => {
          const isSaved = savedPostIds.has(post.id);
          const isMuted = videoMutedState[post.id] ?? true;

          return (
            <article
              key={post.id}
              id={`post-card-${post.id}`}
              className="rounded-2xl bg-zinc-950 border border-purple-900/40 shadow-xl overflow-hidden transition-all box-border"
            >
              {/* Post Header */}
              <div className="p-3 sm:p-3.5 flex items-center justify-between border-b border-purple-950/60">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover border border-purple-500/40 shadow-sm"
                    />
                    {post.isVerified && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-fuchsia-600 border border-zinc-950 flex items-center justify-center shadow-sm">
                        <Crown className="w-2 h-2 text-amber-300" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-white hover:text-fuchsia-300 cursor-pointer truncate">
                        {post.authorName}
                      </span>
                      <span className="text-[11px] text-purple-300/80 font-mono truncate">
                        @{post.authorUsername}
                      </span>
                    </div>

                    <div className="text-[10px] text-zinc-400 flex items-center gap-1 truncate">
                      {post.location && <span>📍 {post.location}</span>}
                      {post.createdAt && (
                        <>
                          <span>•</span>
                          <span>{post.createdAt}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Live Call CTA Button */}
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => onStartCall(`studio-${post.authorUsername}`, post.authorUsername)}
                    className="px-2.5 py-1 rounded-full bg-purple-600/25 hover:bg-purple-600/45 border border-purple-500/50 text-fuchsia-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    title={`Call @${post.authorUsername} live in 4K Opus Studio`}
                  >
                    <Video className="w-3 h-3 text-cyan-300 animate-pulse" />
                    <span>Call Live</span>
                  </button>

                  <button
                    type="button"
                    className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Media Container */}
              <div className="relative w-full aspect-square bg-zinc-900 overflow-hidden flex items-center justify-center">
                {post.mediaType === 'video' ? (
                  <div className="relative w-full h-full">
                    <video
                      src={post.mediaUrl}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setVideoMutedState((prev) => ({ ...prev, [post.id]: !isMuted }))
                        }
                        className="p-1.5 rounded-full bg-zinc-950/80 backdrop-blur-md text-white border border-purple-500/30 hover:bg-zinc-900 transition-all cursor-pointer"
                      >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-fuchsia-400" />}
                      </button>
                    </div>

                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-purple-950/80 backdrop-blur-md border border-purple-500/40 text-[9px] font-bold text-fuchsia-300 flex items-center gap-1">
                      <Radio className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
                      <span>4K OPUS</span>
                    </div>
                  </div>
                ) : (
                  <img
                    src={post.mediaUrl}
                    alt={post.caption}
                    className="w-full h-full object-cover"
                  />
                )}

                {post.isMonetized && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/50 text-[9px] font-bold text-amber-300 flex items-center gap-1 shadow-sm">
                    <Coins className="w-2.5 h-2.5 text-amber-400" />
                    <span>Monetized</span>
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="p-3 sm:p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      onClick={() => handleLike(post.id)}
                      className="group flex items-center gap-1 text-zinc-300 hover:text-pink-400 transition-all cursor-pointer"
                    >
                      <Heart
                        className={`w-5 h-5 transition-transform group-active:scale-125 ${
                          post.isLiked
                            ? 'fill-pink-500 text-pink-500'
                            : 'stroke-[2px]'
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => setOpenCommentsModalPostId(post.id)}
                      className="group flex items-center gap-1 text-zinc-300 hover:text-fuchsia-400 transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-5 h-5 stroke-[2px] group-active:scale-110" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText?.(window.location.href);
                        confetti({ particleCount: 15, spread: 30 });
                      }}
                      className="text-zinc-300 hover:text-cyan-400 transition-all cursor-pointer"
                    >
                      <Share2 className="w-4.5 h-4.5 stroke-[2px]" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSavePost(post.id)}
                      className="text-zinc-300 hover:text-amber-400 transition-all cursor-pointer p-0.5"
                    >
                      <Bookmark
                        className={`w-5 h-5 stroke-[2px] ${
                          isSaved ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Likes Count */}
                <div className="text-xs font-bold text-white">
                  {post.likesCount.toLocaleString()} likes
                </div>

                {/* Caption & Hashtags (Properly wrapping, zero clipping) */}
                <div className="space-y-1 text-xs sm:text-sm">
                  <p className="text-zinc-200 leading-snug break-words">
                    <span className="font-bold text-white mr-1.5 hover:text-fuchsia-300 cursor-pointer">
                      @{post.authorUsername}
                    </span>
                    {post.caption}
                  </p>

                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 text-[11px] font-mono text-purple-400 pt-0.5">
                      {post.hashtags.map((tag, idx) => (
                        <span key={idx} className="hover:underline cursor-pointer">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clean Instagram-Style Comments Preview (Elena Vance & others) */}
                {post.comments && post.comments.length > 0 && (
                  <div className="pt-2 border-t border-purple-950/60 space-y-1.5">
                    {post.comments.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setOpenCommentsModalPostId(post.id)}
                        className="text-[11px] text-zinc-400 hover:text-purple-300 font-medium transition-colors block text-left"
                      >
                        View all {post.comments.length} comments
                      </button>
                    )}

                    {post.comments.slice(-2).map((comment) => (
                      <div key={comment.id} className="flex items-start justify-between gap-2 text-xs">
                        <div className="flex items-start gap-1.5 min-w-0 break-words flex-1">
                          {comment.authorAvatar && (
                            <img
                              src={comment.authorAvatar}
                              alt={comment.authorName}
                              className="w-4 h-4 rounded-full object-cover shrink-0 mt-0.5"
                            />
                          )}
                          <p className="text-zinc-300 leading-snug break-words">
                            <span className="font-bold text-white mr-1">
                              @{comment.authorUsername}
                            </span>
                            <span className="text-zinc-300 font-normal">{comment.text}</span>
                          </p>
                        </div>
                        <span className="text-[10px] text-zinc-500 shrink-0 font-mono">
                          {comment.timestamp || 'now'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Add Comment Pill Bar */}
                <div className="pt-1.5 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Add a comment for @${post.authorUsername}...`}
                    value={commentInputs[post.id] || ''}
                    onChange={(e) =>
                      setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendComment(post.id);
                    }}
                    className="flex-1 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-purple-900/50 focus:border-fuchsia-500 focus:outline-none text-xs text-white placeholder-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendComment(post.id)}
                    className="p-1.5 rounded-full bg-purple-600 hover:bg-fuchsia-600 text-white transition-all cursor-pointer shrink-0"
                    title="Post comment"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* 4. Official Google AdMob Fixed Bottom Banner */}
      <div className="w-full pt-4">
        <AdMobBanner position="inline" currentUser={currentUser} />
      </div>

      {/* Full Comments Modal / Bottom Sheet */}
      {openCommentsModalPostId && activeCommentsPost && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={() => setOpenCommentsModalPostId(null)}
        >
          <div
            className="w-full max-w-lg bg-zinc-950 border-t sm:border border-purple-900/60 rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3.5 border-b border-purple-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-fuchsia-400" />
                <h3 className="text-xs font-bold text-white">
                  Comments ({activeCommentsPost.comments?.length || 0})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenCommentsModalPostId(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
              {/* Post original caption as first comment */}
              <div className="flex items-start gap-2.5 pb-3 border-b border-purple-950/60">
                <img
                  src={activeCommentsPost.authorAvatar}
                  alt={activeCommentsPost.authorName}
                  className="w-7 h-7 rounded-full object-cover shrink-0"
                />
                <div className="text-xs space-y-1 min-w-0">
                  <p className="text-zinc-200 leading-snug break-words">
                    <span className="font-bold text-white mr-1.5">
                      @{activeCommentsPost.authorUsername}
                    </span>
                    {activeCommentsPost.caption}
                  </p>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {activeCommentsPost.createdAt}
                  </span>
                </div>
              </div>

              {/* All Comments */}
              {activeCommentsPost.comments && activeCommentsPost.comments.length > 0 ? (
                activeCommentsPost.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start justify-between gap-2 text-xs">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <img
                        src={comment.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={comment.authorName}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-zinc-200 leading-snug break-words">
                          <span className="font-bold text-white mr-1.5">
                            @{comment.authorUsername}
                          </span>
                          {comment.text}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
                          <span>{comment.timestamp || 'Just now'}</span>
                          <span className="cursor-pointer hover:text-fuchsia-300">Reply</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-zinc-500">
                  No comments yet. Start the conversation!
                </div>
              )}
            </div>

            {/* Quick Add Comment Box */}
            <div className="p-3 border-t border-purple-950/80 bg-zinc-900/60 flex items-center gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentInputs[activeCommentsPost.id] || ''}
                onChange={(e) =>
                  setCommentInputs((prev) => ({
                    ...prev,
                    [activeCommentsPost.id]: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendComment(activeCommentsPost.id);
                }}
                className="flex-1 px-3.5 py-2 rounded-full bg-zinc-950 border border-purple-900/50 focus:border-fuchsia-500 focus:outline-none text-xs text-white placeholder-zinc-500"
              />
              <button
                type="button"
                onClick={() => handleSendComment(activeCommentsPost.id)}
                className="px-3 py-2 rounded-full bg-purple-600 hover:bg-fuchsia-600 text-white text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story View Modal */}
      {activeStory && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => {
            if (storyAudioRef.current) storyAudioRef.current.pause();
            setActiveStory(null);
          }}
        >
          <div
            className="relative w-full max-w-sm h-[75vh] rounded-3xl overflow-hidden border border-purple-500/60 bg-zinc-950 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Story progress timer bar */}
            <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
              <div className="flex-1 h-1 rounded-full bg-white/25 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-400 via-fuchsia-400 to-amber-300 w-full animate-pulse" />
              </div>
            </div>

            {/* Header info & audio toggle */}
            <div className="absolute top-5 left-3.5 right-3.5 z-20 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <img
                  src={activeStory.userAvatar}
                  alt={activeStory.userName}
                  className="w-7 h-7 rounded-full object-cover border border-purple-400 ring-1 ring-fuchsia-400"
                />
                <div>
                  <div className="text-xs font-bold flex items-center gap-1">
                    <span>{activeStory.userName}</span>
                    {activeStory.isVerified && <Crown className="w-2.5 h-2.5 text-amber-300" />}
                  </div>
                  <div className="text-[10px] text-purple-300 font-mono">@{activeStory.userUsername}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeStory.musicTrackAudioUrl && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStoryAudio();
                    }}
                    className="p-1.5 rounded-full bg-zinc-950/80 backdrop-blur-md border border-fuchsia-500/40 text-fuchsia-300 hover:scale-105 transition-all"
                  >
                    {isStoryAudioPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (storyAudioRef.current) storyAudioRef.current.pause();
                    setActiveStory(null);
                  }}
                  className="p-1.5 rounded-full bg-zinc-950/80 text-xs font-bold hover:bg-zinc-800 text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Attached Music Pill */}
            {activeStory.musicTrackTitle && (
              <div className="absolute top-14 left-3.5 right-3.5 z-20 p-2 rounded-xl bg-zinc-950/85 backdrop-blur-md border border-fuchsia-500/60 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-white shrink-0">
                    <Music className="w-3 h-3 animate-bounce" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-white truncate">
                      {activeStory.musicTrackTitle}
                    </div>
                    <div className="text-[9px] text-purple-300 truncate">
                      {activeStory.musicTrackArtist}
                    </div>
                  </div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  {activeStory.adMobEarnings || '+$0.35'}
                </span>
              </div>
            )}

            <img
              src={activeStory.mediaUrl}
              alt="Story content"
              className="w-full h-full object-cover"
            />

            {/* Bottom Caption */}
            {activeStory.caption && (
              <div className="absolute bottom-4 left-3.5 right-3.5 z-20 p-2.5 rounded-xl bg-zinc-950/85 backdrop-blur-md border border-purple-500/40 text-xs text-white text-center shadow-lg">
                {activeStory.caption}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Story Creator Modal */}
      <StoryCreatorModal
        isOpen={isStoryCreatorOpen}
        onClose={() => setIsStoryCreatorOpen(false)}
        currentUser={currentUser}
        onStoryPublished={handleAddStory}
      />

      {/* Music Selector Modal */}
      <MusicSelectorModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        onSelectTrack={() => {
          setIsStoryCreatorOpen(true);
        }}
      />
    </div>
  );
};
