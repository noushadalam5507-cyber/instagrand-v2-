import React, { useState, useRef, useEffect } from 'react';
import {
  PlusSquare,
  Image as ImageIcon,
  Film,
  Camera,
  Sparkles,
  Sliders,
  DollarSign,
  Video,
  Hash,
  Smile,
  Send,
  Upload,
  CheckCircle2,
  Lock,
  Eye,
  Crown,
  Radio,
  RefreshCw,
  Coins,
  ArrowRight,
  Music,
  ShieldCheck,
  Zap,
  Activity,
  Award,
  Wallet,
  Wand2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, PostItem } from '../types';
import { MusicSelectorModal } from './MusicSelectorModal';
import { AIMediaFilterStudio } from './AIMediaFilterStudio';
import { MusicTrackItem } from '../data/musicTracks';
import { awardUserAiContentPayout, trackAndMonetizeBandwidthUsage } from '../lib/firestoreService';
import { ADMOB_CONFIG } from '../lib/admobConfig';
import { checkUserMonetizationStatus, MONETIZATION_MIN_FOLLOWERS } from '../lib/monetizationRules';

interface CreatePostViewProps {
  currentUser: UserProfile | null;
  onPostCreated: (newPost: PostItem) => void;
  onNavigateHome: () => void;
}

export const CreatePostView: React.FC<CreatePostViewProps> = ({
  currentUser,
  onPostCreated,
  onNavigateHome,
}) => {
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string>(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80'
  );
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState<string>(
    'Streaming direct in 4K Opus Studio! Dial @naushad for private live sessions 💜✨ #Instagrand #NeonCall #CreatorStudio'
  );
  const [location, setLocation] = useState<string>('Purple Neon Cyber Studio');
  const [audioTrack, setAudioTrack] = useState<string>('Apna Bana Le · Arijit Singh');
  const [selectedFilter, setSelectedFilter] = useState<string>('cyber-neon');
  const [isMonetized, setIsMonetized] = useState<boolean>(true);
  const [allowDirectCalls, setAllowDirectCalls] = useState<boolean>(true);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState<boolean>(false);
  const [isAiStudioModalOpen, setIsAiStudioModalOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Quality & Wallet Payout State
  const [aiScanStatus, setAiScanStatus] = useState<'idle' | 'scanning' | 'approved'>('approved');
  const [aiQualityScore, setAiQualityScore] = useState<number>(98);
  const [aiApprovalPayout, setAiApprovalPayout] = useState<number>(2.0); // ₹2 for photo, ₹5 for video
  const [walletRupees, setWalletRupees] = useState<number>(50.0);
  const [payoutToast, setPayoutToast] = useState<string | null>(null);

  const myUserId = currentUser?.id || 'usr_self';

  // Load user rupee wallet balance
  useEffect(() => {
    const key = `instagrand_user_rupees_${myUserId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setWalletRupees(parseFloat(saved));
    } else {
      localStorage.setItem(key, '50.00');
      setWalletRupees(50.0);
    }
  }, [myUserId]);

  // Adjust payout when media type changes
  useEffect(() => {
    if (mediaType === 'video') {
      setAiApprovalPayout(ADMOB_CONFIG.videoApprovalPayoutRupees || 5.0);
    } else {
      setAiApprovalPayout(ADMOB_CONFIG.photoApprovalPayoutRupees || 2.0);
    }
  }, [mediaType]);

  const filterPresets = [
    { id: 'normal', name: 'Original', class: 'filter-none' },
    { id: 'cyber-neon', name: 'Cyber Neon 🔮', class: 'contrast-125 saturate-150 hue-rotate-15' },
    { id: 'purple-twilight', name: 'Purple Glow 💜', class: 'contrast-110 brightness-105 saturate-125' },
    { id: 'ultra-hdr', name: 'Ultra 4K HDR ✨', class: 'contrast-130 brightness-110 saturate-140' },
    { id: 'noir-matrix', name: 'Dark Noir 🌌', class: 'grayscale contrast-150' },
    { id: 'vaporwave', name: 'Vaporwave 🌈', class: 'contrast-120 saturate-180 hue-rotate-45' },
    { id: 'golden-hour', name: 'Golden Flare 🔥', class: 'sepia-50 contrast-115 brightness-105' },
  ];

  const presetGallery: { url: string; type: 'image' | 'video'; label: string }[] = [
    {
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
      type: 'image',
      label: 'Cyber Fluid 1',
    },
    {
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
      type: 'image',
      label: 'Retro Server Room',
    },
    {
      url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=80',
      type: 'image',
      label: 'Neon Abstract',
    },
    {
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
      type: 'image',
      label: 'Circuit Waveform',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const objectUrl = URL.createObjectURL(file);
      setSelectedMediaUrl(objectUrl);
      setMediaType(isVideo ? 'video' : 'image');
      setAiApprovalPayout(isVideo ? 5.0 : 2.0);

      // Trigger AI Quality Scan
      setAiScanStatus('scanning');
      setTimeout(() => {
        setAiQualityScore(Math.floor(94 + Math.random() * 6));
        setAiScanStatus('approved');
      }, 700);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setUploadProgress(20);

    const timer1 = setTimeout(() => setUploadProgress(60), 300);
    const timer2 = setTimeout(() => setUploadProgress(90), 600);

    try {
      // Check 20k follower threshold eligibility
      const monetizationStatus = checkUserMonetizationStatus(currentUser);
      let actualPayoutAwarded = 0;

      // 1. Process AI Content Quality Payout ONLY if user reached 20k followers threshold or is Admin
      if (monetizationStatus.isEligible) {
        const payoutRes = await awardUserAiContentPayout({
          userId: myUserId,
          username: currentUser?.username || 'naushad',
          mediaType: mediaType,
          amountRupees: aiApprovalPayout,
          qualityScore: aiQualityScore,
        });
        actualPayoutAwarded = aiApprovalPayout;
        setWalletRupees(payoutRes.newWalletBalance);
      }

      // 2. Track Data Network Bandwidth Monetization -> Credits Founder AdMob Wallet
      const mbEstimated = mediaType === 'video' ? 38.5 : 8.2;
      trackAndMonetizeBandwidthUsage(mbEstimated, `Upload ${mediaType.toUpperCase()} (${aiQualityScore}% HDR)`);

      setTimeout(() => {
        setIsPublishing(false);
        setUploadProgress(100);

        // Extract hashtags
        const hashtags = caption.match(/#[a-zA-Z0-9_]+/g) || ['#Instagrand', '#NeonCall'];

        const newPost: PostItem = {
          id: `post_${Date.now()}`,
          authorId: currentUser?.id || 'usr_self',
          authorName: currentUser?.name || 'Naushad Alam',
          authorUsername: currentUser?.username || 'naushad',
          authorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          isVerified: currentUser?.isVerified ?? true,
          mediaType: mediaType,
          mediaUrl: selectedMediaUrl,
          caption: caption,
          hashtags: hashtags,
          location: location,
          audioTrack: audioTrack,
          likesCount: 1,
          isLiked: true,
          commentsCount: 0,
          comments: [],
          sharesCount: 0,
          createdAt: 'Just now',
          isMonetized: isMonetized && monetizationStatus.isEligible,
          earningsEst: monetizationStatus.isEligible ? `₹${(aiApprovalPayout * 12.5).toFixed(2)}` : undefined,
          isAiApproved: true,
          aiQualityScore: aiQualityScore,
          aiPayoutRupees: actualPayoutAwarded,
          aiScanVerdict: monetizationStatus.isEligible
            ? `AI Verified: Full Ultra HD (${aiQualityScore}%) · Instant ₹${aiApprovalPayout.toFixed(2)} Credited`
            : `AI Verified: Full Ultra HD (${aiQualityScore}%) · Payouts locked (Reach 20k followers)`,
          networkDataConsumedMb: mbEstimated,
        };

        // Confetti celebration for AI approval & Instant wallet money
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#a855f7', '#fbbf24', '#ffffff'],
        });

        onPostCreated(newPost);
        onNavigateHome();
      }, 900);
    } catch (err) {
      console.error('Publishing error:', err);
      setIsPublishing(false);
    }
  };

  const activeFilterClass = filterPresets.find((f) => f.id === selectedFilter)?.class || '';
  const monetizationStatus = checkUserMonetizationStatus(currentUser);

  return (
    <div id="create-post-studio-route" className="max-w-xl mx-auto space-y-5 pb-20 animate-fade-in">
      {/* Top Wallet & Monetization Bar */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-zinc-950 via-purple-950/80 to-zinc-950 border border-purple-500/40 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-black flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-300" />
              <span>Instagrand Wallet · Instant AI Payouts</span>
            </div>
            <div className="text-base font-black text-white flex items-center gap-2">
              <span>₹{walletRupees.toFixed(2)} INR</span>
              {monetizationStatus.isEligible ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-mono">
                  +₹{aiApprovalPayout.toFixed(2)} on Approval
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-500/50 font-mono">
                  Locked ({monetizationStatus.currentFollowers.toLocaleString()}/20k Followers)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-zinc-400 block font-mono">Rate per Post:</span>
          <span className="text-xs font-bold text-amber-300 font-mono">
            {mediaType === 'video' ? '₹10.00 / Video' : '₹2.00 / Pic'}
          </span>
        </div>
      </div>

      {/* 20k Threshold Notification Badge if locked */}
      {!monetizationStatus.isEligible && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-950 to-purple-950/40 border border-amber-500/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-200">20,000 Follower Monetization Goal:</span>{' '}
              <span className="text-zinc-300">
                You have {monetizationStatus.currentFollowers.toLocaleString()} followers ({monetizationStatus.progressPercent}%). Need {monetizationStatus.remainingFollowers.toLocaleString()} more to start claiming cash payouts on uploads.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Studio Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/50 text-fuchsia-300 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Full-Quality Upload Studio</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">Upload Photo or Video</h2>
        </div>

        <button
          type="button"
          onClick={handlePublish}
          disabled={isPublishing}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isPublishing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              <span>Verifying ({uploadProgress}%)...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-black" />
              <span>Publish & Claim ₹{aiApprovalPayout.toFixed(2)}</span>
            </>
          )}
        </button>
      </div>

      {/* Main Media Picker & Preview Area */}
      <div className="rounded-3xl bg-zinc-950/90 border border-purple-900/60 overflow-hidden shadow-2xl p-4 space-y-4">
        {/* Upload Container & Live Canvas */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-900 border border-purple-500/30 flex items-center justify-center group">
          {mediaType === 'video' ? (
            <video
              src={selectedMediaUrl}
              autoPlay
              loop
              muted
              playsInline
              className={`w-full h-full object-cover transition-all ${activeFilterClass}`}
            />
          ) : (
            <img
              src={selectedMediaUrl}
              alt="Preview"
              className={`w-full h-full object-cover transition-all ${activeFilterClass}`}
            />
          )}

          {/* AI Quality Approval Live Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-emerald-500/70 text-white shadow-xl">
            {aiScanStatus === 'scanning' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span className="text-[11px] font-bold text-cyan-300">AI Scanning Clarity...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-bold text-emerald-300">
                  AI Approved · {aiQualityScore}% Ultra HD (₹{aiApprovalPayout.toFixed(2)} Ready)
                </span>
              </>
            )}
          </div>

          {/* Quick upload overlay button */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-zinc-950/90 backdrop-blur-md border border-cyan-500/60 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-cyan-950 transition-all cursor-pointer shadow-lg"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Choose Photo / Video</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {allowDirectCalls && (
            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-purple-950/90 backdrop-blur-md border border-purple-500/50 text-[11px] font-bold text-fuchsia-300 flex items-center gap-1.5 shadow-lg">
              <Video className="w-3 h-3 text-cyan-300 animate-pulse" />
              <span>Direct Dial @{currentUser?.username || 'naushad'} Button Active</span>
            </div>
          )}
        </div>

        {/* AI Quality Assurance Guarantee Card */}
        <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>AI Auto-Approval Guarantee</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500 text-black font-black font-mono">
                  ACTIVE
                </span>
              </div>
              <p className="text-[10px] text-emerald-300/80 leading-relaxed">
                Full-quality photos & 4K video uploads are automatically approved by AI with ₹{aiApprovalPayout.toFixed(2)} instant cash credit!
              </p>
            </div>
          </div>
        </div>

        {/* Preset Gallery Quick Selection */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
            Or Pick from Cyber Vault:
          </span>
          <div className="grid grid-cols-4 gap-2">
            {presetGallery.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedMediaUrl(item.url);
                  setMediaType(item.type);
                  setAiApprovalPayout(item.type === 'video' ? 5.0 : 2.0);
                }}
                className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedMediaUrl === item.url
                    ? 'border-cyan-400 shadow-[0_0_10px_#06b6d4]'
                    : 'border-purple-900/50 hover:border-purple-500/40 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 right-1 text-[9px] text-white font-mono bg-zinc-950/70 truncate rounded px-1">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Presets Carousel & Full Studio Launch Button */}
        <div className="space-y-2.5 pt-2 border-t border-purple-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Cyber Filters</span>
            </span>

            <button
              type="button"
              onClick={() => setIsAiStudioModalOpen(true)}
              className="px-3 py-1 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer transition-all hover:scale-105"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Open AI Filter Studio</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {filterPresets.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedFilter === filter.id
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-zinc-900 border border-purple-900/50 text-zinc-400 hover:text-purple-200'
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>

        {/* Caption & Hashtag Editor */}
        <div className="space-y-3 pt-2 border-t border-purple-900/40">
          <div>
            <label className="text-xs font-bold text-purple-300 block mb-1">
              Caption & Description
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write an engaging caption for your followers..."
              className="w-full p-3 rounded-xl bg-zinc-900/90 border border-purple-900/60 focus:border-cyan-400 focus:outline-none text-xs text-white placeholder-zinc-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-zinc-400 block mb-1">Location Tag</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-purple-900/60 text-xs text-white"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-zinc-400 block">Audio Track</label>
                <button
                  type="button"
                  onClick={() => setIsMusicModalOpen(true)}
                  className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <Music className="w-3 h-3 text-cyan-300" />
                  <span>Choose Music +</span>
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={audioTrack}
                  onChange={(e) => setAudioTrack(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 rounded-xl bg-zinc-900/90 border border-purple-900/60 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => setIsMusicModalOpen(true)}
                  className="absolute right-2 text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  <Music className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement & Earnings Driver Settings */}
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Instagrand Creator Payout Boost</div>
                <div className="text-[10px] text-purple-300/80">
                  Earn ₹{aiApprovalPayout.toFixed(2)} instant wallet credit on AI full quality approval
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMonetized(!isMonetized)}
              className={`w-11 h-6 rounded-full transition-colors cursor-pointer p-0.5 ${
                isMonetized ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  isMonetized ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-purple-900/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Direct Video Call Action on Post</div>
                <div className="text-[10px] text-purple-300/80">
                  Followers can dial your Studio room with 1 tap
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAllowDirectCalls(!allowDirectCalls)}
              className={`w-11 h-6 rounded-full transition-colors cursor-pointer p-0.5 ${
                allowDirectCalls ? 'bg-gradient-to-r from-purple-600 to-fuchsia-500' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  allowDirectCalls ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Music Selector Modal */}
      <MusicSelectorModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        onSelectTrack={(track) => {
          setAudioTrack(`${track.title} · ${track.artist}`);
        }}
      />

      {/* AI Photo & Video Filter Processing Studio Modal */}
      {isAiStudioModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-5xl bg-zinc-950 rounded-3xl border-2 border-purple-600/70 p-4 sm:p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/50 mb-4">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-fuchsia-400 animate-pulse" />
                <span className="text-sm sm:text-base font-black text-white">
                  Instagrand AI Neural Filter & Video Studio
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsAiStudioModalOpen(false)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <AIMediaFilterStudio
              currentUser={currentUser}
              onClose={() => setIsAiStudioModalOpen(false)}
              onApplyMediaToPost={(mediaUrl, type, filterName) => {
                setSelectedMediaUrl(mediaUrl);
                setMediaType(type);
                setIsAiStudioModalOpen(false);
                setAiApprovalPayout(type === 'video' ? 5.0 : 2.0);
                setAiScanStatus('approved');
                setAiQualityScore(99);
                setCaption((prev) => `${prev} [Enhanced with AI ${filterName}]`);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
