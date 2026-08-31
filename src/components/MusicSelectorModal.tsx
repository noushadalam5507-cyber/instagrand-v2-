import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Search,
  Flame,
  Sparkles,
  Coins,
  DollarSign,
  TrendingUp,
  Radio,
  CheckCircle2,
  Sliders,
  ExternalLink,
  Crown,
  Heart,
  Plus
} from 'lucide-react';
import { MUSIC_CATALOG, MusicTrackItem } from '../data/musicTracks';

interface MusicSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrack: (track: MusicTrackItem) => void;
  selectedTrackId?: string;
}

export const MusicSelectorModal: React.FC<MusicSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectTrack,
  selectedTrackId,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'hindi' | 'slowed' | 'english' | 'naat'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (!isOpen) return null;

  const filteredTracks = MUSIC_CATALOG.filter((track) => {
    const matchesCategory = activeCategory === 'all' || track.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      track.title.toLowerCase().includes(q) ||
      track.artist.toLowerCase().includes(q) ||
      track.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const handleTogglePreview = (track: MusicTrackItem) => {
    if (playingTrackId === track.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(track.audioUrl);
      audioRef.current = audio;
      audio.play().catch(() => {});
      setPlayingTrackId(track.id);

      audio.onended = () => {
        setPlayingTrackId(null);
      };
    }
  };

  const handleSelect = (track: MusicTrackItem) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingTrackId(null);
    onSelectTrack(track);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div
        id="music-story-selector-modal"
        className="w-full max-w-xl bg-zinc-950 border-2 border-purple-500/60 rounded-3xl p-4 sm:p-6 shadow-[0_0_50px_rgba(217,70,239,0.35)] relative overflow-hidden flex flex-col max-h-[90vh] space-y-4"
      >
        {/* Ambient Back Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-purple-900/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 via-fuchsia-500 to-amber-400 p-0.5 shadow-md shadow-fuchsia-500/30">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Music className="w-5 h-5 text-fuchsia-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-black text-white">Story Music & Audio Studio</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  AdMob Earning Active
                </span>
              </div>
              <p className="text-xs text-purple-300">
                Hindi New · Slowed+Reverb · English Hits · Soulful Naat Sharif
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (audioRef.current) audioRef.current.pause();
              onClose();
            }}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-purple-900/60 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* AdMob Founder & Creator Monetization Banner Note */}
        <div className="relative z-10 p-3 rounded-2xl bg-gradient-to-r from-amber-950/70 via-zinc-950 to-purple-950/70 border border-amber-500/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-1">
                <span>Story Music Monetization Pool</span>
                <span className="text-[9px] px-1.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                  AdMob Synced
                </span>
              </div>
              <p className="text-[11px] text-zinc-300">
                Every story view with music deposits earnings directly into Founder AdMob (<strong>noushadalam5507@gmail.com</strong>) & Creator Wallet!
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative z-10">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-purple-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Hindi, Slowed+Reverb, English, Naat Sharif, Arijit..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-zinc-900/90 border border-purple-900/60 focus:border-fuchsia-500 focus:outline-none text-xs text-white placeholder-zinc-500"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: '🔥 All Tracks' },
            { id: 'hindi', label: '🇮🇳 Hindi New Songs' },
            { id: 'slowed', label: '🌌 Slowed + Reverb' },
            { id: 'english', label: '🌍 English Hits' },
            { id: 'naat', label: '🕌 Naat Sharif & Duas' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-md shadow-fuchsia-600/30'
                  : 'bg-zinc-900 border border-purple-900/40 text-zinc-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Music Track List Stream */}
        <div className="relative z-10 flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredTracks.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              No tracks found matching your search. Try another query!
            </div>
          ) : (
            filteredTracks.map((track) => {
              const isPlaying = playingTrackId === track.id;
              const isSelected = selectedTrackId === track.id;

              return (
                <div
                  key={track.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                    isSelected
                      ? 'bg-purple-950/80 border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.3)] ring-1 ring-fuchsia-400'
                      : 'bg-zinc-900/80 border-purple-900/40 hover:border-purple-500/60 hover:bg-zinc-900'
                  }`}
                >
                  {/* Track Thumbnail & Play Button */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer group/cover"
                      onClick={() => handleTogglePreview(track)}
                    >
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        {isPlaying ? (
                          <div className="p-1 rounded-full bg-fuchsia-500 text-white animate-pulse">
                            <Pause className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="p-1 rounded-full bg-white/80 text-black group-hover/cover:bg-white">
                            <Play className="w-3.5 h-3.5 ml-0.5" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Track Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-black text-white truncate">{track.title}</h4>
                        {track.trendingRank && track.trendingRank <= 3 && (
                          <span className="text-[9px] px-1.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-bold border border-fuchsia-500/40 flex-shrink-0">
                            #{track.trendingRank} Trending
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>

                      <div className="flex items-center gap-2 mt-1 text-[10px] font-mono">
                        <span className="text-emerald-400 font-bold">{track.monetizationPerStory}</span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-purple-300">{track.plays.toLocaleString()} uses</span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-400">{track.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Preview + Select for Story) */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePreview(track)}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-fuchsia-600 text-white border-fuchsia-400 shadow-md shadow-fuchsia-600/40'
                          : 'bg-zinc-800 text-zinc-300 hover:text-white border-zinc-700'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Volume2 className="w-3.5 h-3.5 animate-bounce text-amber-300" />
                          <span className="text-[10px] hidden sm:inline">Playing</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span className="text-[10px] hidden sm:inline">Listen</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelect(track)}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Story</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
