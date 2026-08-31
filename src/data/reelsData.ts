export interface ReelComment {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
  isVerified?: boolean;
}

export interface ReelItem {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  isVerified: boolean;
  videoUrl: string;
  posterUrl: string;
  caption: string;
  audioTrackTitle: string;
  audioTrackArtist: string;
  category: 'hindi' | 'english' | 'urdu' | 'slowed';
  likesCount: number;
  isLiked?: boolean;
  commentsCount: number;
  comments: ReelComment[];
  sharesCount: number;
  viewsCount: number;
  adMobEarnings: string; // Earning per view for founder
  tags: string[];
}

export const REELS_DATA: ReelItem[] = [
  // ==========================================
  // 1. POPULAR HINDI REELS (VIRAL BOLLYWOOD & DANCE)
  // ==========================================
  {
    id: 'reel-h1',
    authorId: 'usr-naushad',
    authorName: 'Naushad Alam',
    authorUsername: 'naushad',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    isVerified: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-dancing-in-a-nightclub-with-neon-lights-42525-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    caption: 'Apna Bana Le Piya 💜 Instagrand 4K Neon Studio live! Drop a heart if you love this song ✨ #HindiReels #ArijitSingh #Instagrand',
    audioTrackTitle: 'Apna Bana Le (Trending Beat)',
    audioTrackArtist: 'Arijit Singh & Sachin-Jigar',
    category: 'hindi',
    likesCount: 48920,
    isLiked: false,
    commentsCount: 1420,
    sharesCount: 9800,
    viewsCount: 230400,
    adMobEarnings: '+$0.65 AdMob',
    tags: ['#ApnaBanaLe', '#HindiViral', '#ReelsIndia', '#NeonStudio'],
    comments: [
      {
        id: 'c1',
        authorName: 'Aarav Sharma',
        authorUsername: 'aarav_sharma',
        authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
        text: 'Bhai audio quality is pure fire! 🔥',
        timestamp: '15m ago',
        likes: 120,
        isVerified: true,
      },
      {
        id: 'c2',
        authorName: 'Riya Sen',
        authorUsername: 'riyasen_official',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        text: 'This video transition is so smooth 💜✨',
        timestamp: '1h ago',
        likes: 84,
        isVerified: false,
      },
    ],
  },
  {
    id: 'reel-h2',
    authorId: 'usr-priya',
    authorName: 'Priya Kapoor',
    authorUsername: 'priyavibes',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    isVerified: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-woman-in-a-pool-42523-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    caption: 'Chaleya dance vibes in Mumbai sunset 🌅 Keep streaming with 4K clarity! #Chaleya #Jawan #SRK #ReelTrending',
    audioTrackTitle: 'Chaleya (Original High Beat)',
    audioTrackArtist: 'Arijit Singh & Shilpa Rao',
    category: 'hindi',
    likesCount: 92450,
    isLiked: true,
    commentsCount: 3120,
    sharesCount: 18400,
    viewsCount: 412000,
    adMobEarnings: '+$0.75 AdMob',
    tags: ['#Chaleya', '#Jawan', '#BollywoodReels', '#DanceTrending'],
    comments: [
      {
        id: 'c3',
        authorName: 'Kabir Khan',
        authorUsername: 'kabir_k',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        text: 'Best reel of the day on Instagrand! 🌟',
        timestamp: '2h ago',
        likes: 215,
        isVerified: true,
      },
    ],
  },
  {
    id: 'reel-h3',
    authorId: 'usr-rohit',
    authorName: 'Rohit Varma',
    authorUsername: 'rohit_cinema',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    isVerified: false,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-going-down-a-curved-highway-down-a-mountain-41576-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    caption: 'Satranga vibes on the midnight expressway 🚗💨 Feel every lyric in 8D audio. #Satranga #Animal #NightDrive',
    audioTrackTitle: 'Satranga (Animal Emotional)',
    audioTrackArtist: 'Arijit Singh',
    category: 'hindi',
    likesCount: 38200,
    isLiked: false,
    commentsCount: 940,
    sharesCount: 6500,
    viewsCount: 189000,
    adMobEarnings: '+$0.50 AdMob',
    tags: ['#Satranga', '#NightDrive', '#CinematicReel'],
    comments: [],
  },

  // ==========================================
  // 2. URDU POETRY & SUFI VIRAL REELS
  // ==========================================
  {
    id: 'reel-u1',
    authorId: 'usr-sufi',
    authorName: 'Shayar Studio',
    authorUsername: 'urdu_shairi_vibes',
    authorAvatar: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80',
    isVerified: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-raindrops-falling-on-a-glass-window-at-night-42526-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    caption: 'Afreen Afreen 🌙 "Husn-e-jaana ki tareef mumkin nahi..." Sukoon-e-dil for your late night feed. #UrduGhazal #CokeStudio #SufiVibes',
    audioTrackTitle: 'Afreen Afreen (Coke Studio Soul)',
    audioTrackArtist: 'Rahat Fateh Ali Khan & Momina',
    category: 'urdu',
    likesCount: 115000,
    isLiked: true,
    commentsCount: 4200,
    sharesCount: 32000,
    viewsCount: 520000,
    adMobEarnings: '+$0.85 AdMob',
    tags: ['#AfreenAfreen', '#UrduPoetry', '#RahatFatehAliKhan', '#Sukoon'],
    comments: [
      {
        id: 'c4',
        authorName: 'Zainab Qureshi',
        authorUsername: 'zainab_q',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        text: 'SubhanAllah, pure bliss 🖤',
        timestamp: '30m ago',
        likes: 310,
        isVerified: false,
      },
    ],
  },
  {
    id: 'reel-u2',
    authorId: 'usr-tariq',
    authorName: 'Tariq Jameel Quotes',
    authorUsername: 'tariq_quotes',
    authorAvatar: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=200&auto=format&fit=crop&q=80',
    isVerified: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&auto=format&fit=crop&q=80',
    caption: 'Tajdar-e-Haram Acoustic Vibes 🕌 Jumma Mubarak & daily blessings to all our Instagrand family 🤲 #NaatSharif #TajdarEHaram #Peace',
    audioTrackTitle: 'Tajdar-e-Haram (Acoustic Soul)',
    audioTrackArtist: 'Atif Aslam',
    category: 'urdu',
    likesCount: 154000,
    isLiked: false,
    commentsCount: 6800,
    sharesCount: 45000,
    viewsCount: 680000,
    adMobEarnings: '+$0.95 AdMob',
    tags: ['#TajdarEHaram', '#Naat', '#AtifAslam', '#IslamicReel'],
    comments: [],
  },

  // ==========================================
  // 3. SLOWED + REVERB NIGHT AESTHETICS
  // ==========================================
  {
    id: 'reel-s1',
    authorId: 'usr-kaifi',
    authorName: 'Midnight Lofi Club',
    authorUsername: 'midnight_slowed',
    authorAvatar: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&auto=format&fit=crop&q=80',
    isVerified: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-reflection-of-city-lights-in-the-water-at-night-42524-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&auto=format&fit=crop&q=80',
    caption: 'Kahani Suno 2.0 (Slowed + 8D Reverb) 🌌 Plug in your headphones and feel the ambient depth. #SlowedReverb #MidnightVibes',
    audioTrackTitle: 'Kahani Suno 2.0 (Midnight Mix)',
    audioTrackArtist: 'Kaifi Khalil',
    category: 'slowed',
    likesCount: 198000,
    isLiked: true,
    commentsCount: 7900,
    sharesCount: 54000,
    viewsCount: 890000,
    adMobEarnings: '+$1.10 AdMob',
    tags: ['#KahaniSuno', '#SlowedReverb', '#LofiIndia', '#AestheticVideo'],
    comments: [],
  },

  // ==========================================
  // 4. ENGLISH GLOBAL VIRAL REELS
  // ==========================================
  {
    id: 'reel-e1',
    authorId: 'usr-alex',
    authorName: 'Cyberpunk Visuals',
    authorUsername: 'cyber_alex',
    authorAvatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
    isVerified: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-colored-lights-flashing-in-a-dark-tunnel-42527-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    caption: 'Starboy x Die With A Smile mashup in Tokyo Cyber Neon 🚀⚡ High energy weekend mode! #Starboy #TheWeeknd #BrunoMars #Gaga',
    audioTrackTitle: 'Starboy (Cyber Neon Mix)',
    audioTrackArtist: 'The Weeknd & Daft Punk',
    category: 'english',
    likesCount: 142000,
    isLiked: false,
    commentsCount: 5400,
    sharesCount: 39000,
    viewsCount: 740000,
    adMobEarnings: '+$0.90 AdMob',
    tags: ['#Starboy', '#TheWeeknd', '#Cyberpunk', '#EnglishReels'],
    comments: [],
  },
];
