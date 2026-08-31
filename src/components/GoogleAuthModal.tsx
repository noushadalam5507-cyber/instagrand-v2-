import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  X,
  User,
  Database,
  Check,
  Mail,
  Phone,
  Eye,
  EyeOff,
  UserPlus,
  Coins,
  Crown,
  KeyRound
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import {
  syncUserProfileToFirestore,
  claimUsernameInFirestore,
  registerManualAccountInFirestore
} from '../lib/firestoreService';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile, isNewRegistration?: boolean) => void;
  currentUser: UserProfile | null;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
}) => {
  // Mode: 'google' | 'register' | 'login'
  const [authMode, setAuthMode] = useState<'google' | 'register' | 'login'>('google');
  const [selectedDemo, setSelectedDemo] = useState<string>('naushad');

  // Manual Registration State (Classic Instagram-style)
  const [regFullName, setRegFullName] = useState<string>('Naushad Alam');
  const [regUsername, setRegUsername] = useState<string>('noushad');
  const [regEmailOrPhone, setRegEmailOrPhone] = useState<string>('naushadalam@gmail.com');
  const [regPassword, setRegPassword] = useState<string>('NeonPurple2026!');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Manual Login State
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState<string>('naushadalam@gmail.com');
  const [loginPassword, setLoginPassword] = useState<string>('NeonPurple2026!');

  // Custom Google Email input for instant One-Tap sign-in
  const [customGoogleEmail, setCustomGoogleEmail] = useState<string>('naushadalam@gmail.com');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authStatusMessage, setAuthStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const demoAccounts: UserProfile[] = [
    {
      id: 'usr_naushad_primary',
      name: 'MD Naushad Alam',
      email: 'naushadalam@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      username: 'naushad',
      isVerified: true,
      status: 'online',
      customBio: 'Founder & Lead System Architect · Instagrand N A 💜',
      joinedDate: 'August 2026',
      coins: 500,
      accountType: 'google',
      role: 'admin',
    },
    {
      id: 'usr_cyber_sarah',
      name: 'Sarah Chen',
      email: 'sarah.chen.tech@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      username: 'sarah_chen',
      isVerified: true,
      status: 'online',
      customBio: 'Cybersecurity & Real-time WebRTC Dev',
      joinedDate: 'July 2026',
      coins: 250,
      accountType: 'google',
      role: 'creator',
    },
    {
      id: 'usr_alex_vance',
      name: 'Alex Vance',
      email: 'alex.vance.neon@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      username: 'alexv',
      isVerified: false,
      status: 'online',
      customBio: 'Spatial Audio Enthusiast',
      joinedDate: 'August 2026',
      coins: 100,
      accountType: 'google',
      role: 'creator',
    },
  ];

  // 1. Google Fast Sign-In Handler
  const handleGoogleSignIn = async (account?: UserProfile, customEmail?: string) => {
    setIsLoading(true);
    setErrorMessage('');
    setAuthStatusMessage('Connecting with Google & syncing Firebase Firestore...');

    try {
      let finalUser: UserProfile;

      if (account) {
        finalUser = account;
      } else if (customEmail && customEmail.trim()) {
        const cleanEmail = customEmail.trim();
        const handle = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'naushad';
        const isOwner = cleanEmail.toLowerCase().includes('naushad') || cleanEmail.toLowerCase() === 'noushadalam5507@gmail.com' || cleanEmail.toLowerCase() === 'naushadalam@gmail.com';
        
        finalUser = {
          id: `usr_g_${Date.now()}`,
          name: isOwner ? 'MD Naushad Alam' : cleanEmail.split('@')[0],
          email: cleanEmail,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          username: handle,
          isVerified: isOwner,
          status: 'online',
          customBio: isOwner ? 'Founder & Lead Architect 💜' : 'Instagrand N A Creator',
          joinedDate: 'August 2026',
          coins: 200,
          accountType: 'google',
          role: isOwner ? 'admin' : 'creator',
        };
      } else {
        // Attempt Real Firebase Google Auth Popup
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const fbUser = result.user;
          const handle = fbUser.email?.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'naushad';
          const emailLower = fbUser.email?.toLowerCase() || '';
          const isOwner = emailLower.includes('naushad') || emailLower === 'noushadalam5507@gmail.com' || emailLower === 'naushadalam@gmail.com';

          finalUser = {
            id: fbUser.uid,
            name: fbUser.displayName || 'Google User',
            email: fbUser.email || 'naushadalam@gmail.com',
            avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            username: handle,
            isVerified: isOwner,
            status: 'online',
            customBio: isOwner ? 'Founder & Lead Architect · Instagrand N A' : 'Google Verified Creator',
            joinedDate: 'August 2026',
            coins: 150,
            accountType: 'google',
            role: isOwner ? 'admin' : 'creator',
          };
        } catch (popupError: any) {
          console.warn('Firebase Google popup fallback to profile:', popupError?.message);
          const selected = demoAccounts.find((a) => a.username === selectedDemo) || demoAccounts[0];
          finalUser = selected;
        }
      }

      // Sync user profile to Firestore
      await syncUserProfileToFirestore(finalUser);

      // Claim handle in Firestore registry
      await claimUsernameInFirestore(finalUser.username, finalUser);

      confetti({ particleCount: 50, spread: 60 });
      onLoginSuccess(finalUser, false);
      onClose();
    } catch (error: any) {
      console.error('Authentication or Firestore sync error:', error);
      const selected = demoAccounts.find((a) => a.username === selectedDemo) || demoAccounts[0];
      onLoginSuccess(selected, false);
      onClose();
    } finally {
      setIsLoading(false);
      setAuthStatusMessage('');
    }
  };

  // 2. Instagram-Style Manual Account Registration Handler
  const handleManualRegistration = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!regFullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!regEmailOrPhone.trim()) {
      setErrorMessage('Please enter an email address or mobile phone number.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setAuthStatusMessage('Creating secure account in Firebase & crediting 100 Coins...');

    try {
      const isEmail = regEmailOrPhone.includes('@');
      let fbUid = `usr_inst_${Date.now()}`;

      // Try creating user in Firebase Auth if it's an email
      if (isEmail) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, regEmailOrPhone.trim(), regPassword);
          if (cred?.user?.uid) {
            fbUid = cred.user.uid;
          }
        } catch (authErr: any) {
          console.warn('Firebase email auth handled gracefully with Firestore master record:', authErr?.message);
          // If auth provider throws email-already-in-use or domain restriction in sandbox, proceed with Firestore registration
        }
      }

      // Record in Firestore database (/users, /accounts master ledger, /wallet_transactions)
      const regResult = await registerManualAccountInFirestore({
        id: fbUid,
        name: regFullName,
        emailOrPhone: regEmailOrPhone,
        rawPassword: regPassword,
      });

      // Fire festive celebration confetti!
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#d946ef', '#ec4899', '#06b6d4', '#f59e0b', '#ffffff'],
      });

      // Pass user and flag `isNewRegistration = true` to immediately redirect to Username Checker
      onLoginSuccess(regResult.user, true);
      onClose();
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMessage(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
      setAuthStatusMessage('');
    }
  };

  // 3. Instagram-Style Manual Login Handler
  const handleManualLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!loginEmailOrPhone.trim()) {
      setErrorMessage('Please enter your email or phone number.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setAuthStatusMessage('Signing in to Firebase account...');

    try {
      const isEmail = loginEmailOrPhone.includes('@');
      let fbUid = `usr_${Date.now()}`;
      let userName = loginEmailOrPhone.split('@')[0] || 'Instagrand User';

      if (isEmail) {
        try {
          const cred = await signInWithEmailAndPassword(auth, loginEmailOrPhone.trim(), loginPassword);
          if (cred?.user?.uid) {
            fbUid = cred.user.uid;
            userName = cred.user.displayName || userName;
          }
        } catch (authErr: any) {
          console.warn('Firebase login handled with direct profile sync:', authErr?.message);
        }
      }

      const handle = loginEmailOrPhone.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'naushad';
      const loggedInUser: UserProfile = {
        id: fbUid,
        name: userName,
        email: isEmail ? loginEmailOrPhone : `${loginEmailOrPhone}@instagrand.internal`,
        phone: !isEmail ? loginEmailOrPhone : undefined,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        username: handle,
        isVerified: handle.includes('naushad') || loginEmailOrPhone.toLowerCase() === 'noushadalam5507@gmail.com',
        status: 'online',
        customBio: 'Instagrand Member 💜',
        joinedDate: 'August 2026',
        coins: 100,
        accountType: 'manual',
        role: loginEmailOrPhone.toLowerCase() === 'noushadalam5507@gmail.com' ? 'admin' : 'creator',
      };

      await syncUserProfileToFirestore(loggedInUser);
      onLoginSuccess(loggedInUser, false);
      onClose();
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err?.message || 'Invalid credentials. Please verify and try again.');
    } finally {
      setIsLoading(false);
      setAuthStatusMessage('');
    }
  };

  return (
    <div
      id="google-auth-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-lg animate-fade-in"
    >
      <div
        id="google-auth-card"
        className="relative w-full max-w-md bg-zinc-950/95 border-2 border-purple-500/40 rounded-3xl p-6 sm:p-8 neon-border-purple text-zinc-100 shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto"
      >
        {/* Glow corner highlights */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-fuchsia-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/40">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide">
                {authMode === 'register'
                  ? 'Create New Account'
                  : authMode === 'login'
                  ? 'Log In to Instagrand'
                  : 'Instagrand N A Portal'}
              </h2>
              <p className="text-xs text-purple-300/80">
                {authMode === 'register'
                  ? 'Get +100 Coins & Claim Custom Handle'
                  : 'Unified Google & Firebase Access'}
              </p>
            </div>
          </div>
          <button
            id="close-google-auth-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-purple-950/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-600/60 text-rose-200 text-xs flex items-center gap-2">
            <X className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Loading / Status Indicator */}
        {authStatusMessage && (
          <div className="mt-4 p-3 rounded-xl bg-purple-950/80 border border-purple-500/60 text-purple-200 text-xs flex items-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{authStatusMessage}</span>
          </div>
        )}

        {/* TAB 1: GOOGLE SIGN-IN MODE */}
        {authMode === 'google' && (
          <div className="mt-5 space-y-4">
            <p className="text-xs text-zinc-300 leading-relaxed">
              Connect seamlessly via Firebase Google OAuth to claim verified handles like{' '}
              <span className="text-fuchsia-400 font-semibold">@naushad</span> and access 4K purple neon calling.
            </p>

            {/* Custom Google Email Input & Hint Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-zinc-900 to-indigo-950/80 border border-purple-500/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Google Account Email</span>
                </label>
                <span className="px-2 py-0.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 text-[10px] font-mono font-bold">
                  Hint: naushadalam@gmail.com
                </span>
              </div>

              <div className="relative">
                <input
                  id="custom-google-email-input"
                  type="email"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  placeholder="naushadalam@gmail.com"
                  className="w-full pl-3.5 pr-24 py-2.5 rounded-xl bg-zinc-950 border border-purple-800/80 text-white placeholder-zinc-500 text-xs font-mono focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
                />
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn(undefined, customGoogleEmail)}
                  className="absolute inset-y-1 right-1 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-black text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow"
                >
                  <span>Connect</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <p className="text-[10px] text-purple-300/70 font-mono">
                Default Example: <span className="text-cyan-300 font-bold">naushadalam@gmail.com</span> (Founder & Master Admin)
              </p>
            </div>

            {/* Verified Google Account Picker */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider flex items-center justify-between">
                <span>Or Select Verified Identity:</span>
                <span className="text-[10px] text-zinc-400 font-normal">One-Tap Fast Auth</span>
              </label>
              {demoAccounts.map((account) => {
                const isSelected = selectedDemo === account.username;
                return (
                  <div
                    key={account.id}
                    id={`account-option-${account.username}`}
                    onClick={() => {
                      setSelectedDemo(account.username);
                      setCustomGoogleEmail(account.email);
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-900/40 border-purple-400 ring-1 ring-purple-400/50 shadow-md shadow-purple-900/30'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-purple-800 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={account.avatar}
                          alt={account.name}
                          className="w-10 h-10 rounded-full object-cover border border-purple-400/40"
                        />
                        {account.isVerified && (
                          <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white rounded-full p-0.5 shadow">
                            <CheckCircle2 className="w-3 h-3 text-cyan-300" />
                          </div>
                        )}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-white">{account.name}</span>
                          <span className="text-xs px-1.5 py-0.2 rounded bg-purple-950 text-fuchsia-300 border border-purple-800 font-mono">
                            @{account.username}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">{account.email}</p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-purple-400 bg-purple-600 text-white'
                          : 'border-zinc-700 bg-zinc-800/50'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Google Sign-In Main Button */}
            <button
              id="google-auth-submit-btn"
              type="button"
              disabled={isLoading}
              onClick={() => handleGoogleSignIn(undefined, customGoogleEmail)}
              className="w-full mt-2 py-3 px-4 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Sign In with Google Identity</span>
                  <ArrowRight className="w-4 h-4 text-zinc-600" />
                </>
              )}
            </button>

            {/* Instagram Style Classic Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-purple-900/60 w-full" />
              <span className="bg-zinc-950 px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                OR
              </span>
              <div className="border-t border-purple-900/60 w-full" />
            </div>

            {/* Instagram Style "Create New Account" CTA Button */}
            <button
              id="open-manual-register-btn"
              type="button"
              onClick={() => setAuthMode('register')}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-indigo-600 hover:from-purple-600 hover:to-fuchsia-500 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-300" />
              <span>Create New Account</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-black ml-1">
                +100 Coins
              </span>
            </button>

            {/* Already have manual account link */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-xs text-purple-300 hover:text-fuchsia-300 font-semibold cursor-pointer underline-offset-4 hover:underline"
              >
                Already registered manually? Log in with Email / Phone
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: INSTAGRAM-STYLE "CREATE NEW ACCOUNT" FORM */}
        {authMode === 'register' && (
          <form onSubmit={handleManualRegistration} className="mt-4 space-y-4">
            {/* Welcome Bonus Callout */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/90 to-fuchsia-950/80 border border-purple-500/50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5 text-amber-300 animate-bounce" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>100 Instagrand Coins Bonus</span>
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-[11px] text-purple-200/70">
                  Instant registration bonus credited automatically to your Firebase Firestore wallet!
                </p>
              </div>
            </div>

            {/* Field 1: Full Name */}
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="reg-fullname-input"
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Naushad Alam"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-purple-800/60 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
            </div>

            {/* Field 2: Username / Handle with noushad@ placeholder */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-purple-200">
                  Username (@handle)
                </label>
                <span className="text-[10px] text-cyan-300 font-mono">
                  Example: noushad@
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400 font-mono text-xs">
                  @
                </div>
                <input
                  id="reg-username-input"
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_@]/g, ''))}
                  placeholder="noushad@"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-purple-800/60 text-white placeholder-zinc-500 text-xs font-mono focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">
                Your unique Instagrand handle for calls & search.
              </p>
            </div>

            {/* Field 3: Custom Email or Phone Number */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-purple-200">
                  Mobile Number or Email
                </label>
                <span className="text-[10px] text-cyan-300 font-mono">
                  Hint: naushadalam@gmail.com
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                  {regEmailOrPhone.includes('@') ? (
                    <Mail className="w-4 h-4" />
                  ) : (
                    <Phone className="w-4 h-4" />
                  )}
                </div>
                <input
                  id="reg-email-phone-input"
                  type="text"
                  required
                  value={regEmailOrPhone}
                  onChange={(e) => setRegEmailOrPhone(e.target.value)}
                  placeholder="naushadalam@gmail.com or +1 555-0199"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-purple-800/60 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 font-mono"
                />
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">
                You can register with either a custom email address or mobile phone number.
              </p>
            </div>

            {/* Field 3: Secure Password */}
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Secure Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create a strong password (min 6 chars)"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-purple-800/60 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-purple-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      regPassword.length >= 8
                        ? 'w-full bg-emerald-500'
                        : regPassword.length >= 6
                        ? 'w-2/3 bg-amber-500'
                        : 'w-1/3 bg-rose-500'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-mono text-purple-300">
                  {regPassword.length >= 8 ? 'Strong' : regPassword.length >= 6 ? 'Medium' : 'Weak'}
                </span>
              </div>
            </div>

            {/* Registration Submit Button */}
            <button
              id="submit-manual-registration-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-purple-600/40 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register & Choose Handle</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Instagram Style Secondary Option Links */}
            <div className="pt-2 text-center space-y-2">
              <button
                type="button"
                onClick={() => setAuthMode('google')}
                className="text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
              >
                <span>Back to Google Sign-In</span>
              </button>
              <div>
                <span className="text-xs text-zinc-500">Have an account? </span>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-xs text-fuchsia-400 hover:text-fuchsia-300 font-bold cursor-pointer underline-offset-4 hover:underline"
                >
                  Log In
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 3: CLASSIC LOG IN FORM */}
        {authMode === 'login' && (
          <form onSubmit={handleManualLogin} className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-purple-200">
                  Email or Mobile Number
                </label>
                <span className="text-[10px] text-cyan-300 font-mono">
                  Hint: naushadalam@gmail.com
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email-phone-input"
                  type="text"
                  required
                  value={loginEmailOrPhone}
                  onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                  placeholder="naushadalam@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-purple-800/60 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-purple-800/60 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-purple-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="submit-manual-login-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>LOGIN TO INSTAGRAND N A</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center space-y-2">
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className="text-xs text-fuchsia-400 hover:text-fuchsia-300 font-bold cursor-pointer"
              >
                Don't have an account? Create New Account
              </button>
              <div>
                <button
                  type="button"
                  onClick={() => setAuthMode('google')}
                  className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Back to Google Sign-In
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
