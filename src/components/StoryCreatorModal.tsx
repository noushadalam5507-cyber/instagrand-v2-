import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Camera,
  Image as ImageIcon,
  Music,
  Plus,
  Send,
  Upload,
  Coins,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  X,
  Volume2,
  Trash2,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, StoryItem } from '../types';
import { MusicTrackItem } from '../data/musicTracks';
import { MusicSelectorModal } from './MusicSelectorModal';

interface StoryCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onStoryPublished: (newStory: StoryItem) => void;
}

export const StoryCreatorModal: React.FC<StoryCreatorModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onStoryPublished,
}) => {
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string>(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80'
  );
  const [caption, setCaption] = useState<string>('Live moments in Instagrand 💜✨');
  const [selectedMusicTrack, setSelectedMusicTrack] = useState<MusicTrackItem | null>(null);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishedEarningsReward, setPublishedEarningsReward] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const samplePresets = [
    {
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
      label: 'Cyber Glow',
    },
    {
      url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=80',
      label: 'Neon Abstract',
    },
    {
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
      label: 'Stage Lighting',
    },
    {
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
      label: 'Server Matrix',
    },
  ];

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setSelectedMediaUrl(objectUrl);
    }
  };

  const handlePublishStory = () => {
    setIsPublishing(true);

    setTimeout(() => {
      setIsPublishing(false);

      const newStory: StoryItem = {
        id: `story_${Date.now()}`,
        userId: currentUser?.id || 'usr_self',
        userName: currentUser?.name || 'You',
        userUsername: currentUser?.username || 'naushad',
        userAvatar:
          currentUser?.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        isVerified: currentUser?.isVerified ?? true,
        hasUnseenStory: true,
        mediaUrl: selectedMediaUrl,
        caption: caption,
        musicTrackTitle: selectedMusicTrack?.title,
        musicTrackArtist: selectedMusicTrack?.artist,
        musicTrackAudioUrl: selectedMusicTrack?.audioUrl,
        musicCategory: selectedMusicTrack?.category,
        adMobEarnings: selectedMusicTrack ? '+$0.35 AdMob' : '+$0.15 AdMob',
        adMobImpressions: 1,
      };

      // Confetti celebration
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#d946ef', '#10b981', '#f59e0b'],
      });

      onStoryPublished(newStory);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div
        id="story-creator-music-modal"
        className="w-full max-w-md bg-zinc-950 border-2 border-purple-500/60 rounded-3xl p-5 shadow-[0_0_50px_rgba(217,70,239,0.35)] relative overflow-hidden flex flex-col space-y-4 max-h-[92vh]"
      >
        {/* Background Cyber Grid */}
        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-purple-900/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 via-fuchsia-500 to-amber-400 p-0.5 shadow-md shadow-fuchsia-500/30">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Camera className="w-4 h-4 text-fuchsia-400" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Create Music Story</h3>
              <p className="text-[11px] text-purple-300">Add Trending Audio & Monetize in AdMob</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-purple-900/60 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Story Canvas Preview */}
        <div className="relative z-10 aspect-[4/5] w-full rounded-2xl overflow-hidden bg-zinc-900 border-2 border-purple-500/40 shadow-xl flex items-center justify-center group">
          <img
            src={selectedMediaUrl}
            alt="Story Preview"
            className="w-full h-full object-cover"
          />

          {/* Attached Music Pill on Preview */}
          {selectedMusicTrack ? (
            <div className="absolute top-3 left-3 right-3 p-2.5 rounded-2xl bg-zinc-950/85 backdrop-blur-md border border-fuchsia-500/60 flex items-center justify-between shadow-lg animate-fadeIn">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={selectedMusicTrack.coverUrl}
                  alt={selectedMusicTrack.title}
                  className="w-7 h-7 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <div className="text-xs font-black text-white truncate flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-fuchsia-400 animate-bounce" />
                    <span>{selectedMusicTrack.title}</span>
                  </div>
                  <div className="text-[10px] text-purple-300 truncate font-mono">
                    {selectedMusicTrack.artist}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMusicTrack(null)}
                className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsMusicModalOpen(true)}
              className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-zinc-950/80 backdrop-blur-md border border-fuchsia-500/50 text-xs font-bold text-white flex items-center gap-1.5 hover:bg-fuchsia-950 transition-all cursor-pointer shadow-lg hover:scale-105"
            >
              <Music className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
              <span>+ Add Music / Naat</span>
            </button>
          )}

          {/* Change Media Floating Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-zinc-950/80 backdrop-blur-md border border-purple-500/50 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-950 transition-all cursor-pointer shadow-lg"
          >
            <Upload className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Upload Photo</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Quick Presets Strip */}
        <div className="relative z-10 grid grid-cols-4 gap-2">
          {samplePresets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedMediaUrl(p.url)}
              className={`aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                selectedMediaUrl === p.url
                  ? 'border-fuchsia-400 shadow-[0_0_10px_#d946ef]'
                  : 'border-purple-900/50 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Music Selector Trigger Button */}
        <div className="relative z-10">
          <button
            type="button"
            onClick={() => setIsMusicModalOpen(true)}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-purple-950/80 via-zinc-900 to-fuchsia-950/80 border border-fuchsia-500/50 hover:border-fuchsia-400 text-left flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 group-hover:scale-105 transition-transform">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  {selectedMusicTrack ? selectedMusicTrack.title : 'Choose Music for Story'}
                </div>
                <div className="text-[10px] text-purple-300 font-mono">
                  {selectedMusicTrack
                    ? `${selectedMusicTrack.artist} · ${selectedMusicTrack.monetizationPerStory}`
                    : 'Hindi New · Slowed+Reverb · English · Naat'}
                </div>
              </div>
            </div>

            <span className="text-xs font-bold text-fuchsia-400 group-hover:translate-x-0.5 transition-transform">
              {selectedMusicTrack ? 'Change' : 'Browse +'}
            </span>
          </button>
        </div>

        {/* Story Caption Input */}
        <div className="relative z-10">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption to your story..."
            className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-900/90 border border-purple-900/60 focus:border-fuchsia-500 focus:outline-none text-xs text-white placeholder-zinc-500"
          />
        </div>

        {/* Monetization & Share Footer */}
        <div className="relative z-10 flex items-center justify-between pt-2 border-t border-purple-900/50">
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>AdMob Earn: <strong className="text-emerald-400">+$0.35/view</strong></span>
          </div>

          <button
            type="button"
            onClick={handlePublishStory}
            disabled={isPublishing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-fuchsia-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'Sharing Story...' : 'Share to Story'}</span>
          </button>
        </div>
      </div>

      {/* Sub Music Selection Modal */}
      <MusicSelectorModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        onSelectTrack={(track) => setSelectedMusicTrack(track)}
        selectedTrackId={selectedMusicTrack?.id}
      />
    </div>
  );
};
