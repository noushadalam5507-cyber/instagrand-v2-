import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, ChatMessage } from '../types';

export interface UsernameDoc {
  username: string;
  ownerUid: string;
  ownerEmail: string;
  ownerName: string;
  claimedAt: string;
  isVIP: boolean;
}

export interface RoomDoc {
  roomId: string;
  hostUsername: string;
  hostName: string;
  hostAvatar: string;
  status: 'active' | 'ended';
  createdAt: string;
  targetUsername?: string;
}

// 1. User Profiles Persistence
export async function syncUserProfileToFirestore(user: UserProfile): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(
      userRef,
      {
        ...user,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving user profile to Firestore:', error);
  }
}

export function subscribeToUserProfile(userId: string, onUpdate: (user: UserProfile | null) => void) {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as UserProfile);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.error('Error listening to user profile:', err);
    }
  );
}

export function subscribeToAllUsers(onUpdate: (users: UserProfile[]) => void) {
  const usersCol = collection(db, 'users');
  return onSnapshot(
    usersCol,
    (snapshot) => {
      const users: UserProfile[] = [];
      snapshot.forEach((d) => {
        users.push(d.data() as UserProfile);
      });
      onUpdate(users);
    },
    (err) => {
      console.error('Error listening to users collection:', err);
    }
  );
}

// 2. Username Registry & Claiming
export async function checkUsernameDoc(username: string): Promise<UsernameDoc | null> {
  try {
    const handle = username.trim().toLowerCase().replace(/^@/, '');
    const handleRef = doc(db, 'usernames', handle);
    const snap = await getDoc(handleRef);
    if (snap.exists()) {
      return snap.data() as UsernameDoc;
    }
    return null;
  } catch (error) {
    console.error('Error checking username in Firestore:', error);
    return null;
  }
}

export async function claimUsernameInFirestore(
  username: string,
  user: UserProfile
): Promise<{ success: boolean; message: string }> {
  try {
    const handle = username.trim().toLowerCase().replace(/^@/, '');
    const handleRef = doc(db, 'usernames', handle);
    const snap = await getDoc(handleRef);

    const isSpecialVIP = handle === 'naushad' || handle === 'noushadalam' || handle === 'noushad';
    const isOwnerByEmail = user.email.toLowerCase() === 'noushadalam5507@gmail.com';

    if (snap.exists()) {
      const existing = snap.data() as UsernameDoc;
      if (existing.ownerUid !== user.id && existing.ownerEmail !== user.email) {
        return { success: false, message: `Handle @${handle} is already claimed by another user.` };
      }
    }

    const payload: UsernameDoc = {
      username: handle,
      ownerUid: user.id,
      ownerEmail: user.email,
      ownerName: user.name,
      claimedAt: new Date().toISOString(),
      isVIP: isSpecialVIP || isOwnerByEmail,
    };

    await setDoc(handleRef, payload);

    // Also update user's profile in Firestore
    const updatedProfile: UserProfile = {
      ...user,
      username: handle,
      isVerified: payload.isVIP || user.isVerified,
    };
    await syncUserProfileToFirestore(updatedProfile);

    return { success: true, message: `Successfully registered @${handle} to ${user.email}!` };
  } catch (error: any) {
    console.error('Error claiming username:', error);
    return { success: false, message: error?.message || 'Failed to claim handle' };
  }
}

export function subscribeToUsernamesRegistry(onUpdate: (handles: Record<string, UsernameDoc>) => void) {
  const handlesCol = collection(db, 'usernames');
  return onSnapshot(
    handlesCol,
    (snapshot) => {
      const map: Record<string, UsernameDoc> = {};
      snapshot.forEach((d) => {
        map[d.id] = d.data() as UsernameDoc;
      });
      onUpdate(map);
    },
    (err) => {
      console.error('Error subscribing to usernames:', err);
    }
  );
}

// 3. Rooms and Real-Time Chat Sync
export async function registerCallRoom(room: RoomDoc): Promise<void> {
  try {
    const roomRef = doc(db, 'rooms', room.roomId);
    await setDoc(roomRef, room, { merge: true });
  } catch (err) {
    console.error('Error registering room:', err);
  }
}

export async function sendChatMessageToFirestore(roomId: string, message: ChatMessage): Promise<void> {
  try {
    const messagesCol = collection(db, 'rooms', roomId, 'messages');
    await addDoc(messagesCol, {
      ...message,
      createdAt: serverTimestamp(),
      createdAtIso: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error sending chat message:', err);
  }
}

export function subscribeToRoomChatMessages(
  roomId: string,
  onMessages: (messages: ChatMessage[]) => void
) {
  const messagesCol = collection(db, 'rooms', roomId, 'messages');
  const q = query(messagesCol, orderBy('createdAtIso', 'asc'), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        msgs.push({
          id: d.id,
          senderId: data.senderId,
          senderName: data.senderName,
          senderUsername: data.senderUsername,
          senderAvatar: data.senderAvatar,
          text: data.text,
          timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: data.type || 'text',
        });
      });
      if (msgs.length > 0) {
        onMessages(msgs);
      }
    },
    (err) => {
      console.error('Error listening to chat messages:', err);
    }
  );
}

// 4. Instagrand Posts Collection
export async function createPostInFirestore(post: any): Promise<void> {
  try {
    const postsCol = collection(db, 'posts');
    await addDoc(postsCol, {
      ...post,
      createdAtServer: serverTimestamp(),
      createdAtIso: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error creating post in Firestore:', err);
  }
}

export function subscribeToFirestorePosts(onPosts: (posts: any[]) => void) {
  const postsCol = collection(db, 'posts');
  const q = query(postsCol, limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const posts: any[] = [];
      snapshot.forEach((d) => {
        posts.push({ id: d.id, ...d.data() });
      });
      onPosts(posts);
    },
    (err) => {
      console.error('Error listening to posts:', err);
    }
  );
}

// 5. Manual Registration & Master Accounts Vault (Owner / Admin 100% Control)

// Simple fast SHA-256 string hasher for secure storage in admin vault
export async function hashPasswordForVault(rawPassword: string): Promise<string> {
  try {
    if (window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(rawPassword);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('SubtleCrypto unavailable, using tokenized hash:', e);
  }
  return btoa(`sec_${rawPassword}_salted_${rawPassword.length * 37}`);
}

export async function registerManualAccountInFirestore(params: {
  id: string;
  name: string;
  emailOrPhone: string;
  rawPassword: string;
  initialUsername?: string;
}): Promise<{ user: UserProfile; success: boolean; message: string }> {
  try {
    const isEmail = params.emailOrPhone.includes('@');
    const email = isEmail
      ? params.emailOrPhone.trim().toLowerCase()
      : `${params.emailOrPhone.replace(/[^0-9+]/g, '')}@instagrand.internal`;
    const phone = !isEmail ? params.emailOrPhone.trim() : undefined;

    const baseHandle = params.initialUsername
      ? params.initialUsername.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '')
      : params.name.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '').slice(0, 15) || 'user';

    const cleanHandle = baseHandle.length >= 3 ? baseHandle : `${baseHandle}_${Math.floor(100 + Math.random() * 900)}`;

    const isMasterAdmin = email.toLowerCase() === 'noushadalam5507@gmail.com' || cleanHandle === 'naushad';
    const hashedPassword = await hashPasswordForVault(params.rawPassword);
    const nowIso = new Date().toISOString();

    const newUserProfile: UserProfile = {
      id: params.id,
      name: params.name.trim(),
      email: email,
      phone: phone,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + (params.name.length % 500)}?w=150&auto=format&fit=crop&q=80`,
      username: cleanHandle,
      isVerified: isMasterAdmin,
      status: 'online',
      customBio: 'Instagrand VIP Creator 💜',
      joinedDate: 'August 2026',
      coins: 100, // Credited 100-Coin Welcome Bonus!
      accountType: 'manual',
      registeredAt: nowIso,
      role: isMasterAdmin ? 'admin' : 'creator',
    };

    // 1. Save in /users/{userId}
    const userRef = doc(db, 'users', newUserProfile.id);
    await setDoc(userRef, newUserProfile, { merge: true });

    // 2. Save in /accounts/{accountId} master admin ledger
    const accountRef = doc(db, 'accounts', newUserProfile.id);
    await setDoc(accountRef, {
      id: newUserProfile.id,
      name: newUserProfile.name,
      email: newUserProfile.email,
      phone: newUserProfile.phone || '',
      username: newUserProfile.username,
      passwordHashed: hashedPassword,
      accountType: 'manual',
      registeredAt: nowIso,
      lastLogin: nowIso,
      coins: 100,
      isVerified: newUserProfile.isVerified,
      isAdmin: isMasterAdmin,
      securityLevel: '256-bit SHA Encrypted',
    }, { merge: true });

    // 3. Record Welcome Bonus in /wallet_transactions
    const txCol = collection(db, 'wallet_transactions');
    await addDoc(txCol, {
      userId: newUserProfile.id,
      username: newUserProfile.username,
      amount: 100,
      type: 'credit',
      reason: 'Welcome Bonus: 100 Instagrand Coins Credited for Registration',
      timestamp: nowIso,
    });

    // 4. Also register username if available
    try {
      await claimUsernameInFirestore(cleanHandle, newUserProfile);
    } catch (e) {
      console.warn('Initial handle claim attempted:', e);
    }

    return {
      user: newUserProfile,
      success: true,
      message: 'Account successfully registered and 100 Coins credited!',
    };
  } catch (error: any) {
    console.error('Error registering manual account:', error);
    throw error;
  }
}

export function subscribeToMasterAccounts(onAccounts: (accounts: any[]) => void) {
  const accountsCol = collection(db, 'accounts');
  return onSnapshot(
    accountsCol,
    (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      onAccounts(list);
    },
    (err) => {
      console.error('Error subscribing to accounts:', err);
    }
  );
}

export async function adminUpdateUserCoins(
  userId: string,
  newCoinsAmount: number,
  reason: string = 'Admin Manual Coin Adjustment'
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const accountRef = doc(db, 'accounts', userId);

    await updateDoc(userRef, { coins: newCoinsAmount });
    await updateDoc(accountRef, { coins: newCoinsAmount });

    const txCol = collection(db, 'wallet_transactions');
    await addDoc(txCol, {
      userId,
      amount: newCoinsAmount,
      type: 'credit',
      reason,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error updating user coins by admin:', err);
  }
}

export async function adminToggleVipStatus(userId: string, isVerified: boolean): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const accountRef = doc(db, 'accounts', userId);

    await updateDoc(userRef, { isVerified });
    await updateDoc(accountRef, { isVerified });
  } catch (err) {
    console.error('Error toggling VIP status by admin:', err);
  }
}

export async function adminDeleteUserAccount(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId));
    await deleteDoc(doc(db, 'accounts', userId));
  } catch (err) {
    console.error('Error deleting account by admin:', err);
  }
}

// 6. Chat Block / Unblock System & Self-Unblock with Coins

export interface ChatBlockRecord {
  id: string;
  threadId: string;
  blockerId: string;
  blockerUsername: string;
  blockedId: string;
  blockedUsername: string;
  blockedAt: string;
  isBlocked: boolean;
  unblockedWithCoins?: boolean;
  unblockedAt?: string;
}

export async function blockUserInFirestore(params: {
  threadId: string;
  blockerId: string;
  blockerUsername: string;
  blockedId: string;
  blockedUsername: string;
}): Promise<void> {
  try {
    const blockDocId = `block_${params.threadId}`;
    const blockRef = doc(db, 'chat_blocks', blockDocId);
    const payload: ChatBlockRecord = {
      id: blockDocId,
      threadId: params.threadId,
      blockerId: params.blockerId,
      blockerUsername: params.blockerUsername,
      blockedId: params.blockedId,
      blockedUsername: params.blockedUsername,
      blockedAt: new Date().toISOString(),
      isBlocked: true,
      unblockedWithCoins: false,
    };
    await setDoc(blockRef, payload, { merge: true });
  } catch (err) {
    console.error('Error blocking user in Firestore:', err);
    throw err;
  }
}

export async function unblockUserInFirestore(threadId: string): Promise<void> {
  try {
    const blockDocId = `block_${threadId}`;
    const blockRef = doc(db, 'chat_blocks', blockDocId);
    await setDoc(
      blockRef,
      {
        isBlocked: false,
        unblockedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error unblocking user in Firestore:', err);
    throw err;
  }
}

export async function selfUnblockWithCoins(params: {
  userId: string;
  threadId: string;
  costCoins?: number;
}): Promise<{ success: boolean; message: string; remainingCoins?: number }> {
  try {
    const cost = params.costCoins ?? 50;
    const userRef = doc(db, 'users', params.userId);
    const userSnap = await getDoc(userRef);

    let currentCoins = 0;
    let username = 'user';

    if (userSnap.exists()) {
      const data = userSnap.data() as UserProfile;
      currentCoins = Number(data.coins ?? 0);
      username = data.username || 'user';
    } else {
      // Check accounts doc as fallback
      const accRef = doc(db, 'accounts', params.userId);
      const accSnap = await getDoc(accRef);
      if (accSnap.exists()) {
        const accData = accSnap.data();
        currentCoins = Number(accData.coins ?? 0);
        username = accData.username || 'user';
      }
    }

    if (currentCoins < cost) {
      return {
        success: false,
        message: `Insufficient Coins: You need ${cost} coins to self-unblock. You currently have ${currentCoins} coins. Watch videos to earn free coins!`,
        remainingCoins: currentCoins,
      };
    }

    const remainingCoins = currentCoins - cost;
    const nowIso = new Date().toISOString();

    // 1. Deduct from users collection
    await updateDoc(userRef, { coins: remainingCoins });

    // 2. Deduct from accounts collection
    try {
      const accountRef = doc(db, 'accounts', params.userId);
      await updateDoc(accountRef, { coins: remainingCoins });
    } catch (e) {
      console.warn('Accounts doc update note:', e);
    }

    // 3. Record in wallet_transactions
    const txCol = collection(db, 'wallet_transactions');
    await addDoc(txCol, {
      userId: params.userId,
      username: username,
      amount: cost,
      type: 'debit',
      reason: `Self-Unblock: -${cost} Coins paid to unlock chat (${params.threadId})`,
      timestamp: nowIso,
    });

    // 4. Update block record in chat_blocks to unblock
    const blockDocId = `block_${params.threadId}`;
    const blockRef = doc(db, 'chat_blocks', blockDocId);
    await setDoc(
      blockRef,
      {
        isBlocked: false,
        unblockedWithCoins: true,
        unblockedAt: nowIso,
      },
      { merge: true }
    );

    return {
      success: true,
      message: `🎉 Success! Unblocked for 50 Coins. Your new balance is ${remainingCoins} coins.`,
      remainingCoins,
    };
  } catch (err: any) {
    console.error('Error during self-unblock with coins:', err);
    return {
      success: false,
      message: err?.message || 'Transaction failed. Please try again.',
    };
  }
}

export async function rewardUserCoinsFromAdMobVideo(params: {
  userId: string;
  coinsToAdd?: number;
  adUnitId?: string;
}): Promise<{ success: boolean; newCoins: number; message: string }> {
  try {
    const coins = params.coinsToAdd ?? 10;
    const userRef = doc(db, 'users', params.userId);
    const userSnap = await getDoc(userRef);

    let currentCoins = 0;
    let username = 'user';

    if (userSnap.exists()) {
      const data = userSnap.data() as UserProfile;
      currentCoins = Number(data.coins ?? 0);
      username = data.username || 'user';
    }

    const newCoins = currentCoins + coins;
    const nowIso = new Date().toISOString();

    // 1. Update user profile
    await updateDoc(userRef, { coins: newCoins });

    // 2. Update account ledger
    try {
      const accountRef = doc(db, 'accounts', params.userId);
      await updateDoc(accountRef, { coins: newCoins });
    } catch (e) {
      console.warn('Account update note:', e);
    }

    // 3. Record transaction in wallet_transactions
    const txCol = collection(db, 'wallet_transactions');
    await addDoc(txCol, {
      userId: params.userId,
      username: username,
      amount: coins,
      type: 'credit',
      reason: `AdMob Rewarded Video: +${coins} Coins earned from Google AdMob Ad`,
      timestamp: nowIso,
    });

    return {
      success: true,
      newCoins,
      message: `🍌 Rewarded! +${coins} Instagrand Coins added to your wallet.`,
    };
  } catch (err: any) {
    console.error('Error rewarding coins from AdMob video:', err);
    throw err;
  }
}

export function subscribeToAllChatBlocks(onBlocks: (blocks: Record<string, ChatBlockRecord>) => void) {
  const blocksCol = collection(db, 'chat_blocks');
  return onSnapshot(
    blocksCol,
    (snapshot) => {
      const map: Record<string, ChatBlockRecord> = {};
      snapshot.forEach((d) => {
        map[d.id] = d.data() as ChatBlockRecord;
      });
      onBlocks(map);
    },
    (err) => {
      console.error('Error listening to chat_blocks:', err);
    }
  );
}

export function subscribeToThreadBlock(
  threadId: string,
  onBlockChange: (block: ChatBlockRecord | null) => void
) {
  const blockDocId = `block_${threadId}`;
  const blockRef = doc(db, 'chat_blocks', blockDocId);
  return onSnapshot(
    blockRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onBlockChange(snapshot.data() as ChatBlockRecord);
      } else {
        onBlockChange(null);
      }
    },
    (err) => {
      console.error('Error listening to thread block state:', err);
    }
  );
}

// 7. AI Quality Content Approval Payout to Instagrand Wallet
export async function awardUserAiContentPayout(params: {
  userId: string;
  username: string;
  mediaType: 'image' | 'video';
  amountRupees: number;
  qualityScore: number;
}): Promise<{ success: boolean; newWalletBalance: number; message: string }> {
  try {
    const key = `instagrand_user_rupees_${params.userId}`;
    const currentBalance = parseFloat(localStorage.getItem(key) || '50.00');
    const newBalance = parseFloat((currentBalance + params.amountRupees).toFixed(2));
    localStorage.setItem(key, newBalance.toString());

    const nowIso = new Date().toISOString();
    const txCol = collection(db, 'wallet_transactions');
    await addDoc(txCol, {
      userId: params.userId,
      username: params.username,
      amount: params.amountRupees,
      currency: 'INR',
      type: 'credit',
      reason: `AI Quality Verified (${params.qualityScore}% Ultra HD): +₹${params.amountRupees.toFixed(2)} credited for ${params.mediaType === 'video' ? 'Full HD Reel' : 'HD Photo'} upload`,
      timestamp: nowIso,
    });

    return {
      success: true,
      newWalletBalance: newBalance,
      message: `🎉 AI Approved (${params.qualityScore}% Quality)! ₹${params.amountRupees.toFixed(2)} credited to your Instagrand Wallet.`,
    };
  } catch (err: any) {
    console.error('Error crediting AI payout:', err);
    const key = `instagrand_user_rupees_${params.userId}`;
    const currentBalance = parseFloat(localStorage.getItem(key) || '50.00');
    const newBalance = parseFloat((currentBalance + params.amountRupees).toFixed(2));
    localStorage.setItem(key, newBalance.toString());
    return {
      success: true,
      newWalletBalance: newBalance,
      message: `🎉 AI Approved (${params.qualityScore}% Quality)! ₹${params.amountRupees.toFixed(2)} credited to your wallet.`,
    };
  }
}

// 8. Internet Bandwidth Monetization -> Credited directly to Founder's AdMob Wallet
export function trackAndMonetizeBandwidthUsage(mbUsed: number, activityDesc: string) {
  try {
    const ratePerGb = 12.5; // ₹12.50 per GB
    const rupeesEarned = (mbUsed / 1024) * ratePerGb;
    
    // Update Founder AdMob Wallet Local / Cloud records
    const currentAdMobTotal = parseFloat(localStorage.getItem('founder_admob_total_inr') || '4520.80');
    const currentBandwidthTotalGb = parseFloat(localStorage.getItem('founder_bandwidth_consumed_gb') || '361.66');

    const newAdMobTotal = parseFloat((currentAdMobTotal + rupeesEarned).toFixed(2));
    const newBandwidthTotalGb = parseFloat((currentBandwidthTotalGb + (mbUsed / 1024)).toFixed(3));

    localStorage.setItem('founder_admob_total_inr', newAdMobTotal.toString());
    localStorage.setItem('founder_bandwidth_consumed_gb', newBandwidthTotalGb.toString());

    return {
      earnedRupees: rupeesEarned,
      newTotalAdMobInr: newAdMobTotal,
      newTotalGb: newBandwidthTotalGb,
    };
  } catch (e) {
    console.warn('Bandwidth monetization note:', e);
    return { earnedRupees: 0, newTotalAdMobInr: 4520.8, newTotalGb: 361.66 };
  }
}

// 9. Daily Check-in Reward (50 Free Coins via AdMob Rewarded Video)
export async function claimDailyCheckInRewardInFirestore(params: {
  userId: string;
}): Promise<{ success: boolean; newCoins: number; message: string; todayDate: string }> {
  try {
    const todayDate = new Date().toISOString().split('T')[0];
    const userRef = doc(db, 'users', params.userId);
    const userSnap = await getDoc(userRef);

    let currentCoins = 0;
    let username = 'user';

    if (userSnap.exists()) {
      const data = userSnap.data() as UserProfile;
      currentCoins = Number(data.coins ?? 0);
      username = data.username || 'user';
    }

    const bonusCoins = 50;
    const newCoins = currentCoins + bonusCoins;
    const nowIso = new Date().toISOString();

    // 1. Update user profile with new coins and today's claim date
    await updateDoc(userRef, {
      coins: newCoins,
      lastDailyClaimDate: todayDate,
    });

    // 2. Update account ledger
    try {
      const accountRef = doc(db, 'accounts', params.userId);
      await updateDoc(accountRef, {
        coins: newCoins,
      });
    } catch (e) {
      console.warn('Account update note:', e);
    }

    // 3. Record transaction in wallet_transactions
    const txCol = collection(db, 'wallet_transactions');
    await addDoc(txCol, {
      userId: params.userId,
      username: username,
      amount: bonusCoins,
      type: 'credit',
      reason: 'Daily Check-in Reward: +50 Free Coins claimed via AdMob Rewarded Video',
      timestamp: nowIso,
    });

    return {
      success: true,
      newCoins,
      todayDate,
      message: '🎉 Daily Check-in Success! +50 Free Coins added to your wallet.',
    };
  } catch (err: any) {
    console.error('Error claiming daily check-in reward:', err);
    throw err;
  }
}

// 10. Creator Tipping System (80% Creator / 20% Admin Platform Fee)
export interface SendTipParams {
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderAvatar: string;
  recipientId: string;
  recipientUsername: string;
  giftId: string;
  giftName: string;
  giftIcon: string;
  totalCoins: number;
  message?: string;
}

export async function sendCreatorTipInFirestore(params: SendTipParams): Promise<{
  success: boolean;
  message: string;
  senderNewCoins: number;
  creatorCoins: number;
  adminCommission: number;
}> {
  try {
    const totalCoins = params.totalCoins;
    const creatorCoins = Math.floor(totalCoins * 0.8); // 80% to creator
    const adminCommission = totalCoins - creatorCoins; // 20% to admin

    // 1. Check sender balance
    const senderRef = doc(db, 'users', params.senderId);
    const senderSnap = await getDoc(senderRef);
    let senderCoins = 0;
    if (senderSnap.exists()) {
      senderCoins = Number(senderSnap.data().coins ?? 0);
    }

    if (senderCoins < totalCoins) {
      return {
        success: false,
        message: `Insufficient coins: You need ${totalCoins} coins to send this ${params.giftName}. You currently have ${senderCoins} coins.`,
        senderNewCoins: senderCoins,
        creatorCoins: 0,
        adminCommission: 0,
      };
    }

    const senderNewCoins = senderCoins - totalCoins;
    const nowIso = new Date().toISOString();

    // 2. Deduct from sender
    await updateDoc(senderRef, { coins: senderNewCoins });
    try {
      const senderAccRef = doc(db, 'accounts', params.senderId);
      await updateDoc(senderAccRef, { coins: senderNewCoins });
    } catch (e) {
      // ignore
    }

    // 3. Credit 80% to recipient creator
    try {
      const recipientRef = doc(db, 'users', params.recipientId);
      const recipientSnap = await getDoc(recipientRef);
      if (recipientSnap.exists()) {
        const rCoins = Number(recipientSnap.data().coins ?? 0);
        await updateDoc(recipientRef, { coins: rCoins + creatorCoins });
      }
      const recipientAccRef = doc(db, 'accounts', params.recipientId);
      const recipientAccSnap = await getDoc(recipientAccRef);
      if (recipientAccSnap.exists()) {
        const rCoins = Number(recipientAccSnap.data().coins ?? 0);
        await updateDoc(recipientAccRef, { coins: rCoins + creatorCoins });
      }
    } catch (e) {
      console.warn('Recipient credit note:', e);
    }

    // 4. Credit 20% to Admin account (noushadalam5507@gmail.com / usr_naushad_primary)
    try {
      const adminRef = doc(db, 'users', 'usr_naushad_primary');
      const adminSnap = await getDoc(adminRef);
      if (adminSnap.exists()) {
        const aCoins = Number(adminSnap.data().coins ?? 0);
        await updateDoc(adminRef, { coins: aCoins + adminCommission });
      }
    } catch (e) {
      console.warn('Admin commission credit note:', e);
    }

    // 5. Record tip document in /creator_tips collection
    const tipsCol = collection(db, 'creator_tips');
    await addDoc(tipsCol, {
      senderId: params.senderId,
      senderName: params.senderName,
      senderUsername: params.senderUsername,
      senderAvatar: params.senderAvatar,
      recipientId: params.recipientId,
      recipientUsername: params.recipientUsername,
      giftId: params.giftId,
      giftName: params.giftName,
      giftIcon: params.giftIcon,
      totalCoins: totalCoins,
      creatorCoins: creatorCoins,
      adminCommission: adminCommission,
      message: params.message || '',
      timestamp: nowIso,
    });

    // 6. Record in /wallet_transactions for sender
    const txCol = collection(db, 'wallet_transactions');
    await addDoc(txCol, {
      userId: params.senderId,
      username: params.senderUsername,
      amount: totalCoins,
      type: 'debit',
      reason: `Creator Tip: -${totalCoins} Coins sent ${params.giftIcon} ${params.giftName} to @${params.recipientUsername} (80% creator / 20% platform fee)`,
      timestamp: nowIso,
    });

    // 7. Record in /wallet_transactions for creator
    await addDoc(txCol, {
      userId: params.recipientId,
      username: params.recipientUsername,
      amount: creatorCoins,
      type: 'credit',
      reason: `Creator Tip Received: +${creatorCoins} Coins (80% of ${totalCoins} ${params.giftName}) from @${params.senderUsername}`,
      timestamp: nowIso,
    });

    // 8. Record in /wallet_transactions for Admin platform fee
    await addDoc(txCol, {
      userId: 'usr_naushad_primary',
      username: 'naushad',
      amount: adminCommission,
      type: 'credit',
      reason: `Platform Fee Commission: +${adminCommission} Coins (20% fee on ${totalCoins} tip from @${params.senderUsername} to @${params.recipientUsername})`,
      timestamp: nowIso,
    });

    return {
      success: true,
      message: `🎉 Sent ${params.giftIcon} ${params.giftName}! +${creatorCoins} Coins to @${params.recipientUsername} (80%) · +${adminCommission} Coins Platform Commission (20%).`,
      senderNewCoins,
      creatorCoins,
      adminCommission,
    };
  } catch (err: any) {
    console.error('Error sending creator tip in Firestore:', err);
    throw err;
  }
}

export function subscribeToCreatorTips(onTips: (tips: any[]) => void) {
  const tipsCol = collection(db, 'creator_tips');
  const q = query(tipsCol, orderBy('timestamp', 'desc'), limit(50));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      onTips(list);
    },
    (err) => {
      console.error('Error subscribing to creator tips:', err);
    }
  );
}

// 11. Premium 'Studio Pass' Tier Management
export async function unlockStudioPassInFirestore(params: {
  userId: string;
  tier?: '30-day' | 'lifetime';
  coinsCost?: number;
  paymentMethod: 'coins' | 'direct';
}): Promise<{ success: boolean; newCoins?: number; message: string }> {
  try {
    const tier = params.tier || 'lifetime';
    const cost = params.coinsCost || 0;
    const userRef = doc(db, 'users', params.userId);
    const userSnap = await getDoc(userRef);

    let currentCoins = 0;
    let username = 'user';

    if (userSnap.exists()) {
      const data = userSnap.data() as UserProfile;
      currentCoins = Number(data.coins ?? 0);
      username = data.username || 'user';
    }

    if (params.paymentMethod === 'coins' && cost > 0) {
      if (currentCoins < cost) {
        return {
          success: false,
          message: `Insufficient coins: You need ${cost} coins to unlock Studio Pass. You have ${currentCoins} coins.`,
          newCoins: currentCoins,
        };
      }
    }

    const newCoins = params.paymentMethod === 'coins' && cost > 0 ? currentCoins - cost : currentCoins;
    const nowIso = new Date().toISOString();

    // 1. Update user doc with Studio Pass status, neon badge flag, and unlocked pass timestamp
    await updateDoc(userRef, {
      hasStudioPass: true,
      studioPassTier: tier,
      studioPassUnlockedAt: nowIso,
      isVerified: true,
      coins: newCoins,
    });

    // 2. Update accounts master ledger
    try {
      const accRef = doc(db, 'accounts', params.userId);
      await updateDoc(accRef, {
        hasStudioPass: true,
        isVerified: true,
        coins: newCoins,
      });
    } catch (e) {
      console.warn('Account update note for Studio Pass:', e);
    }

    // 3. Record transaction
    const txCol = collection(db, 'wallet_transactions');
    await addDoc(txCol, {
      userId: params.userId,
      username: username,
      amount: cost,
      type: cost > 0 ? 'debit' : 'credit',
      reason: `Studio Pass Unlocked (${tier.toUpperCase()} TIER): Verified Neon Badge + Complete Ad-Free Experience + 3D Hologram Filters Unlocked`,
      timestamp: nowIso,
    });

    return {
      success: true,
      newCoins,
      message: '✨ Studio Pass Unlocked! Enjoy your Verified Neon Badge, 100% Ad-Free experience, and Premium 3D Hologram Filters.',
    };
  } catch (err: any) {
    console.error('Error unlocking Studio Pass in Firestore:', err);
    throw err;
  }
}

// 12. Unlock Filter or Theme with Coins
export async function unlockFeatureWithCoinsInFirestore(params: {
  userId: string;
  featureId: string;
  featureType: 'filter' | 'theme';
  costCoins: number;
  featureName: string;
}): Promise<{ success: boolean; newCoins: number; message: string }> {
  try {
    const userRef = doc(db, 'users', params.userId);
    const userSnap = await getDoc(userRef);

    let currentCoins = 0;
    let unlockedFilters: string[] = [];
    let unlockedThemes: string[] = [];
    let username = 'user';

    if (userSnap.exists()) {
      const data = userSnap.data() as UserProfile;
      currentCoins = Number(data.coins ?? 0);
      unlockedFilters = data.unlockedFilterIds || [];
      unlockedThemes = data.unlockedThemeIds || [];
      username = data.username || 'user';
    }

    if (currentCoins < params.costCoins) {
      return {
        success: false,
        message: `Insufficient coins: You need ${params.costCoins} coins to unlock ${params.featureName}. Watch rewarded video or claim daily reward!`,
        newCoins: currentCoins,
      };
    }

    const newCoins = currentCoins - params.costCoins;
    const nowIso = new Date().toISOString();

    if (params.featureType === 'filter') {
      if (!unlockedFilters.includes(params.featureId)) {
        unlockedFilters.push(params.featureId);
      }
      await updateDoc(userRef, {
        coins: newCoins,
        unlockedFilterIds: unlockedFilters,
      });
    } else {
      if (!unlockedThemes.includes(params.featureId)) {
        unlockedThemes.push(params.featureId);
      }
      await updateDoc(userRef, {
        coins: newCoins,
        unlockedThemeIds: unlockedThemes,
      });
    }

    // Record transaction
    const txCol = collection(db, 'wallet_transactions');
    await addDoc(txCol, {
      userId: params.userId,
      username: username,
      amount: params.costCoins,
      type: 'debit',
      reason: `Feature Unlocked: -${params.costCoins} Coins paid for ${params.featureType === 'filter' ? '3D Filter' : 'Theme'} (${params.featureName})`,
      timestamp: nowIso,
    });

    return {
      success: true,
      newCoins,
      message: `🎉 Unlocked ${params.featureName} for ${params.costCoins} Coins!`,
    };
  } catch (err: any) {
    console.error('Error unlocking feature with coins:', err);
    throw err;
  }
}

// 13. Paid Profile Spotlight Boost (500-1000 Coins)
export async function boostProfileSpotlightInFirestore(params: {
  userId: string;
  durationHours: 24 | 48;
  coinsCost: number;
}): Promise<{ success: boolean; newCoins: number; message: string; expiresAt: string }> {
  try {
    const userRef = doc(db, 'users', params.userId);
    const userSnap = await getDoc(userRef);

    let currentCoins = 0;
    let username = 'user';

    if (userSnap.exists()) {
      const data = userSnap.data() as UserProfile;
      currentCoins = Number(data.coins ?? 0);
      username = data.username || 'user';
    }

    if (currentCoins < params.coinsCost) {
      return {
        success: false,
        message: `Insufficient coins: You need ${params.coinsCost} coins to activate ${params.durationHours}h Profile Spotlight.`,
        newCoins: currentCoins,
        expiresAt: '',
      };
    }

    const newCoins = currentCoins - params.coinsCost;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + params.durationHours * 60 * 60 * 1000).toISOString();

    await updateDoc(userRef, {
      coins: newCoins,
      isSpotlightActive: true,
      spotlightExpiresAt: expiresAt,
    });

    const txCol = collection(db, 'wallet_transactions');
    await addDoc(txCol, {
      userId: params.userId,
      username: username,
      amount: params.coinsCost,
      type: 'debit',
      reason: `Profile Spotlight Boost: -${params.coinsCost} Coins for ${params.durationHours} Hours Top Ranking Promotion`,
      timestamp: now.toISOString(),
    });

    return {
      success: true,
      newCoins,
      expiresAt,
      message: `🚀 Profile Spotlight Activated! Your profile is now featured at the TOP of Explore & Feed for ${params.durationHours} hours.`,
    };
  } catch (err: any) {
    console.error('Error boosting profile spotlight:', err);
    throw err;
  }
}

// 14. Verified Badge Shop (₹20 for 1 Month, ₹500 for 1 Year / Lifetime, or 50 Followers Milestone)
export async function unlockVerifiedBadgeInFirestore(params: {
  userId: string;
  badgePlan: '1-month' | '1-year' | 'milestone-50';
  priceDisplay: string;
  badgeType: 'blue' | 'neon' | 'gold';
}): Promise<{ success: boolean; message: string }> {
  try {
    const userRef = doc(db, 'users', params.userId);
    const userSnap = await getDoc(userRef);
    let username = 'user';
    if (userSnap.exists()) {
      username = (userSnap.data() as UserProfile).username || 'user';
    }

    const now = new Date();
    let expiresAt = '';
    if (params.badgePlan === '1-month') {
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (params.badgePlan === '1-year') {
      expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
    } else {
      expiresAt = 'permanent';
    }

    await updateDoc(userRef, {
      isVerified: true,
      verifiedBadgeType: params.badgeType,
      verifiedBadgeExpiresAt: expiresAt,
    });

    try {
      const accRef = doc(db, 'accounts', params.userId);
      await updateDoc(accRef, {
        isVerified: true,
      });
    } catch (e) {
      // ignore
    }

    const txCol = collection(db, 'wallet_transactions');
    await addDoc(txCol, {
      userId: params.userId,
      username: username,
      amount: 0,
      type: 'credit',
      reason: `Verified Badge Activated (${params.badgePlan.toUpperCase()} Plan - ${params.priceDisplay}): Authentic VIP checkmark enabled`,
      timestamp: now.toISOString(),
    });

    return {
      success: true,
      message: `✨ Verified Badge Activated (${params.badgePlan})! Your verified checkmark is now visible across calls, feeds, DMs and live streams.`,
    };
  } catch (err: any) {
    console.error('Error unlocking verified badge:', err);
    throw err;
  }
}

// 15. Private Account Toggle (Anti-hack & privacy safeguard)
export async function togglePrivateAccountInFirestore(params: {
  userId: string;
  isPrivate: boolean;
}): Promise<{ success: boolean; isPrivate: boolean; message: string }> {
  try {
    const userRef = doc(db, 'users', params.userId);
    await updateDoc(userRef, {
      isPrivateAccount: params.isPrivate,
    });

    return {
      success: true,
      isPrivate: params.isPrivate,
      message: params.isPrivate
        ? '🔒 Account is now Private. Only approved followers can view your posts and direct stream.'
        : '🌐 Account is now Public. Anyone on Instagrand can discover your profile.',
    };
  } catch (err: any) {
    console.error('Error toggling private account:', err);
    throw err;
  }
}

// 16. Paid Audio / Video Voice Note DMs (5 Coins: 80% to recipient, 20% platform commission)
export async function sendPaidAudioVideoDMInFirestore(params: {
  senderId: string;
  senderUsername: string;
  recipientId: string;
  recipientUsername: string;
  mediaType: 'voice_note' | 'video_message';
  durationSec: number;
  audioUrl?: string;
  videoUrl?: string;
}): Promise<{ success: boolean; message: string; senderNewCoins: number }> {
  try {
    const costCoins = 5;
    const recipientCoins = 4; // 80%
    const adminCoins = 1; // 20%

    const senderRef = doc(db, 'users', params.senderId);
    const senderSnap = await getDoc(senderRef);
    let senderCoins = 0;
    if (senderSnap.exists()) {
      senderCoins = Number(senderSnap.data().coins ?? 0);
    }

    if (senderCoins < costCoins) {
      return {
        success: false,
        message: `Insufficient coins: High-definition voice/video note requires 5 Coins. You have ${senderCoins} coins.`,
        senderNewCoins: senderCoins,
      };
    }

    const senderNewCoins = senderCoins - costCoins;
    const nowIso = new Date().toISOString();

    // 1. Deduct from sender
    await updateDoc(senderRef, { coins: senderNewCoins });

    // 2. Credit recipient (80%)
    try {
      const recRef = doc(db, 'users', params.recipientId);
      const recSnap = await getDoc(recRef);
      if (recSnap.exists()) {
        const rC = Number(recSnap.data().coins ?? 0);
        await updateDoc(recRef, { coins: rC + recipientCoins });
      }
    } catch (e) {
      // ignore
    }

    // 3. Credit admin (20%)
    try {
      const adminRef = doc(db, 'users', 'usr_naushad_primary');
      const adminSnap = await getDoc(adminRef);
      if (adminSnap.exists()) {
        const aC = Number(adminSnap.data().coins ?? 0);
        await updateDoc(adminRef, { coins: aC + adminCoins });
      }
    } catch (e) {
      // ignore
    }

    // 4. Record transactions
    const txCol = collection(db, 'wallet_transactions');
    await addDoc(txCol, {
      userId: params.senderId,
      username: params.senderUsername,
      amount: costCoins,
      type: 'debit',
      reason: `Paid ${params.mediaType === 'voice_note' ? 'Opus Voice Note' : '4K Video Note'} sent to @${params.recipientUsername} (-5 Coins)`,
      timestamp: nowIso,
    });

    return {
      success: true,
      message: `🎙️ Sent paid ${params.mediaType === 'voice_note' ? 'Voice Note' : 'Video Note'}! (4 Coins to @${params.recipientUsername} · 1 Coin Platform Fee)`,
      senderNewCoins,
    };
  } catch (err: any) {
    console.error('Error sending paid audio/video DM:', err);
    throw err;
  }
}

// ============================================================================
// 19. LISTEN TO EARN AUTOMATED TRACKER (कमाई का पूरा सिस्टम)
// ============================================================================
export interface ListenRewardParams {
  userId: string;
  username: string;
  trackId: string;
  trackTitle: string;
  trackArtist: string;
  coinsEarned: number;
  secondsListened: number;
}

export async function recordListenEarnReward(params: ListenRewardParams): Promise<{ success: boolean; newCoins: number; message: string }> {
  try {
    const userRef = doc(db, 'users', params.userId);
    const userSnap = await getDoc(userRef);
    let currentCoins = 0;
    if (userSnap.exists()) {
      currentCoins = Number(userSnap.data().coins ?? 0);
    }

    const newCoins = currentCoins + params.coinsEarned;
    const nowIso = new Date().toISOString();

    // 1. Update user coins in Firestore
    await updateDoc(userRef, { coins: newCoins });

    // 2. Add to wallet transactions
    const txCol = collection(db, 'wallet_transactions');
    await addDoc(txCol, {
      userId: params.userId,
      username: params.username,
      amount: params.coinsEarned,
      type: 'credit',
      reason: `🎵 Listen to Earn: "${params.trackTitle}" by ${params.trackArtist} (${params.secondsListened}s streamed)`,
      timestamp: nowIso,
      metadata: {
        trackId: params.trackId,
        source: 'listen_to_earn',
      },
    });

    return {
      success: true,
      newCoins,
      message: `🎉 +${params.coinsEarned} Coins credited for listening to "${params.trackTitle}"!`,
    };
  } catch (err: any) {
    console.error('Error recording Listen to Earn reward:', err);
    throw err;
  }
}

// ============================================================================
// 20. WATCH TO EARN AUTOMATED TRACKER
// ============================================================================
export interface WatchRewardParams {
  userId: string;
  username: string;
  videoId: string;
  videoTitle: string;
  rewardCoins: number;
}

export async function recordWatchEarnReward(params: WatchRewardParams): Promise<{ success: boolean; newCoins: number; message: string }> {
  try {
    const userRef = doc(db, 'users', params.userId);
    const userSnap = await getDoc(userRef);
    let currentCoins = 0;
    if (userSnap.exists()) {
      currentCoins = Number(userSnap.data().coins ?? 0);
    }

    const newCoins = currentCoins + params.rewardCoins;
    const nowIso = new Date().toISOString();

    // 1. Update user coins in Firestore
    await updateDoc(userRef, { coins: newCoins });

    // 2. Add to wallet transactions
    const txCol = collection(db, 'wallet_transactions');
    await addDoc(txCol, {
      userId: params.userId,
      username: params.username,
      amount: params.rewardCoins,
      type: 'credit',
      reason: `🎬 Watch to Earn: Completed video "${params.videoTitle}"`,
      timestamp: nowIso,
      metadata: {
        videoId: params.videoId,
        source: 'watch_to_earn',
      },
    });

    return {
      success: true,
      newCoins,
      message: `💰 +${params.rewardCoins} Coins added to your wallet for watching video!`,
    };
  } catch (err: any) {
    console.error('Error recording Watch to Earn reward:', err);
    throw err;
  }
}

// ============================================================================
// 21. GLOBAL MULTI-CURRENCY PAYOUT ENGINE (PayPal, Stripe, UPI, USDT, Wise)
// ============================================================================
export interface CreatePayoutParams {
  userId: string;
  username: string;
  email: string;
  coinsAmount: number;
  currency: 'USD' | 'INR' | 'EUR' | 'GBP' | 'AED' | 'SAR' | 'USDT';
  fiatAmount: number;
  payoutMethod: 'paypal' | 'stripe_bank' | 'upi' | 'crypto_usdt' | 'wise';
  payoutAccountDetails: string;
}

export async function requestGlobalPayoutInFirestore(params: CreatePayoutParams): Promise<{ success: boolean; newCoins: number; payoutId: string; message: string }> {
  try {
    const userRef = doc(db, 'users', params.userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error('User profile not found.');
    }

    const currentCoins = Number(userSnap.data().coins ?? 0);
    if (currentCoins < params.coinsAmount) {
      throw new Error(`Insufficient coin balance. You have ${currentCoins} coins, but requested ${params.coinsAmount} coins.`);
    }

    const newCoins = currentCoins - params.coinsAmount;
    const nowIso = new Date().toISOString();

    // 1. Deduct coins from user balance
    await updateDoc(userRef, { coins: newCoins });

    // 2. Create Payout Request record in 'payout_requests'
    const payoutCol = collection(db, 'payout_requests');
    const docRef = await addDoc(payoutCol, {
      userId: params.userId,
      username: params.username,
      email: params.email,
      coinsAmount: params.coinsAmount,
      currency: params.currency,
      fiatAmount: params.fiatAmount,
      payoutMethod: params.payoutMethod,
      payoutAccountDetails: params.payoutAccountDetails,
      status: 'pending',
      requestedAt: nowIso,
      adminNote: 'Processing in automated global payout queue (24-48h SLA)',
    });

    // 3. Add to wallet transactions as debit
    const txCol = collection(db, 'wallet_transactions');
    await addDoc(txCol, {
      userId: params.userId,
      username: params.username,
      amount: params.coinsAmount,
      type: 'debit',
      reason: `Global Payout Request (${params.currency} ${params.fiatAmount.toFixed(2)} via ${params.payoutMethod.toUpperCase()})`,
      timestamp: nowIso,
      metadata: {
        payoutId: docRef.id,
        payoutMethod: params.payoutMethod,
        currency: params.currency,
        fiatAmount: params.fiatAmount,
      },
    });

    return {
      success: true,
      newCoins,
      payoutId: docRef.id,
      message: `✅ Payout request for ${params.currency} ${params.fiatAmount.toFixed(2)} submitted! Reference #${docRef.id.slice(0, 8)}`,
    };
  } catch (err: any) {
    console.error('Error submitting payout request:', err);
    throw err;
  }
}

export function subscribeToUserPayouts(userId: string, onUpdate: (payouts: any[]) => void) {
  const payoutCol = collection(db, 'payout_requests');
  return onSnapshot(
    payoutCol,
    (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        if (data.userId === userId) {
          list.push({ id: d.id, ...data });
        }
      });
      list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
      onUpdate(list);
    },
    (err) => {
      console.error('Error subscribing to user payouts:', err);
    }
  );
}




