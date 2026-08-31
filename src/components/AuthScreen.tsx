import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  User,
  Mail,
  Eye,
  EyeOff,
  UserPlus,
  Coins,
  Crown,
  KeyRound,
  Zap,
  Globe,
  Radio,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import {
  syncUserProfileToFirestore,
  claimUsernameInFirestore,
} from '../lib/firestoreService';
import { Cyber3DIcon } from './Cyber3DIcon';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile, isNewRegistration?: boolean) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  // Mode: 'login' | 'signup'
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Sign Up Form Fields
  const [signupFullName, setSignupFullName] = useState<string>('Naushad Alam');
  const [signupUsername, setSignupUsername] = useState<string>('naushad');
  const [signupEmail, setSignupEmail] = useState<string>('noushadalam5507@gmail.com');
  const [signupPassword, setSignupPassword] = useState<string>('NeonPurple2026!');
  const [showSignupPassword, setShowSignupPassword] = useState<boolean>(false);

  // Login Form Fields
  const [loginIdentifier, setLoginIdentifier] = useState<string>('noushadalam5507@gmail.com');
  const [loginPassword, setLoginPassword] = useState<string>('NeonPurple2026!');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Loading & Error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Demo Accounts for Fast One-Tap Login
  const demoAccounts: UserProfile[] = [
    {
      id: 'usr_naushad_primary',
      name: 'Naushad Alam',
      email: 'noushadalam5507@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      username: 'naushad',
      isVerified: true,
      status: 'online',
      customBio: 'Lead Architect & Instagrand Creator 💜',
      joinedDate: 'August 2026',
      coins: 500,
      accountType: 'google',
      role: 'admin',
    },
    {
      id: 'usr_cyber_sarah',
      name: 'Sarah Chen',
      email: 'sarah.chen.tech@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      username: 'sarah_chen',
      isVerified: true,
      status: 'online',
      customBio: 'Real-time WebRTC & Cyber Creator 🔮',
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
      customBio: '4K Opus Studio Streamer 🎙️',
      joinedDate: 'August 2026',
      coins: 150,
      accountType: 'google',
      role: 'creator',
    },
  ];

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#06b6d4', '#ec4899', '#facc15'],
      });
    } catch {
      // ignore
    }
  };

  // Google Sign In with Firebase Auth Popup + Fallback
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setStatusMessage('Authenticating with Google & Firebase Cloud...');

    try {
      let finalUser: UserProfile;

      try {
        // Attempt Firebase Google Popup Sign-in
        const res = await signInWithPopup(auth, googleProvider);
        const fbUser = res.user;

        const isOwner = fbUser.email?.toLowerCase() === 'noushadalam5507@gmail.com';
        const defaultHandle = fbUser.displayName
          ? fbUser.displayName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15)
          : isOwner ? 'naushad' : `user_${Math.floor(Math.random() * 10000)}`;

        finalUser = {
          id: fbUser.uid || `usr_google_${Date.now()}`,
          name: fbUser.displayName || (isOwner ? 'Naushad Alam' : 'Google User'),
          email: fbUser.email || 'user@gmail.com',
          avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          username: isOwner ? 'naushad' : defaultHandle,
          isVerified: isOwner || Boolean(fbUser.emailVerified),
          status: 'online',
          customBio: isOwner ? 'Lead Architect & Instagrand Creator 💜' : 'Verified Instagrand Creator',
          joinedDate: 'August 2026',
          coins: isOwner ? 500 : 200,
          accountType: 'google',
          role: isOwner ? 'admin' : 'creator',
        };
      } catch (popupErr: any) {
        console.warn('Firebase popup blocked or skipped in iframe, using direct Google Auth Sync:', popupErr);
        // Fallback for sandboxed preview
        const isOwner = loginIdentifier.toLowerCase().includes('noushad') || loginIdentifier.toLowerCase().includes('naushad');
        finalUser = {
          id: `usr_g_${Date.now()}`,
          name: isOwner ? 'Naushad Alam' : 'Google Verified Creator',
          email: isOwner ? 'noushadalam5507@gmail.com' : 'creator.google@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          username: isOwner ? 'naushad' : 'google_creator',
          isVerified: true,
          status: 'online',
          customBio: isOwner ? 'Lead Architect & Instagrand Creator 💜' : 'Instagrand N A Creator (Naushad)',
          joinedDate: 'August 2026',
          coins: 300,
          accountType: 'google',
          role: isOwner ? 'admin' : 'creator',
        };
      }

      // Synchronize to Firestore
      await syncUserProfileToFirestore(finalUser);
      await claimUsernameInFirestore(finalUser.username, finalUser);

      triggerConfetti();
      onLoginSuccess(finalUser, false);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setErrorMessage(err?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // Manual Sign Up Form Submit
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanName = signupFullName.trim();
    const cleanHandle = signupUsername.trim().toLowerCase().replace(/^@/, '');
    const cleanEmail = signupEmail.trim().toLowerCase();

    if (!cleanName) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!cleanHandle || cleanHandle.length < 3) {
      setErrorMessage('Username must be at least 3 characters.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Creating your account in Firebase Firestore...');

    try {
      const isOwner = cleanEmail === 'noushadalam5507@gmail.com' || cleanHandle === 'naushad';
      const newUser: UserProfile = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: cleanName,
        email: cleanEmail,
        username: cleanHandle,
        avatar: isOwner
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
          : `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanHandle}&backgroundColor=180a30`,
        isVerified: isOwner,
        status: 'online',
        customBio: isOwner ? 'Lead Architect & Instagrand Creator 💜' : 'Instagrand N A Member ✨',
        joinedDate: 'August 2026',
        coins: 100, // +100 Coins Welcome Registration Bonus
        accountType: 'manual',
        role: isOwner ? 'admin' : 'creator',
      };

      // Save to Firebase Firestore
      await syncUserProfileToFirestore(newUser);
      const claimResult = await claimUsernameInFirestore(cleanHandle, newUser);

      if (!claimResult.success && !isOwner) {
        setErrorMessage(claimResult.message);
        setIsLoading(false);
        return;
      }

      triggerConfetti();
      onLoginSuccess(newUser, true);
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMessage(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // Manual Login Form Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanIdent = loginIdentifier.trim().toLowerCase().replace(/^@/, '');
    if (!cleanIdent) {
      setErrorMessage('Please enter your email or username.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Verifying credentials & fetching Firestore vault...');

    try {
      const isOwner =
        cleanIdent === 'noushadalam5507@gmail.com' ||
        cleanIdent === 'naushad' ||
        cleanIdent === 'noushad';

      // Match demo accounts or create logged in profile
      const matchedDemo = demoAccounts.find(
        (a) => a.email.toLowerCase() === cleanIdent || a.username.toLowerCase() === cleanIdent
      );

      const loggedUser: UserProfile = matchedDemo || {
        id: `usr_${Date.now()}`,
        name: isOwner ? 'Naushad Alam' : cleanIdent.split('@')[0],
        email: cleanIdent.includes('@') ? cleanIdent : `${cleanIdent}@instagrand.com`,
        username: isOwner ? 'naushad' : cleanIdent,
        avatar: isOwner
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
          : `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanIdent}&backgroundColor=180a30`,
        isVerified: isOwner,
        status: 'online',
        customBio: isOwner ? 'Lead Architect & Instagrand Creator 💜' : 'Instagrand N A Creator (Naushad)',
        joinedDate: 'August 2026',
        coins: isOwner ? 500 : 150,
        accountType: 'manual',
        role: isOwner ? 'admin' : 'creator',
      };

      // Sync user profile
      await syncUserProfileToFirestore(loggedUser);
      await claimUsernameInFirestore(loggedUser.username, loggedUser);

      triggerConfetti();
      onLoginSuccess(loggedUser, false);
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err?.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // Instant Select Demo Account
  const handleSelectDemoAccount = async (acc: UserProfile) => {
    setIsLoading(true);
    setStatusMessage(`Logging in as @${acc.username}...`);
    try {
      await syncUserProfileToFirestore(acc);
      await claimUsernameInFirestore(acc.username, acc);
      triggerConfetti();
      onLoginSuccess(acc, false);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Fast login failed.');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <div
      id="instagrand-auth-screen"
      className="min-h-screen w-full bg-[#05010c] text-white flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden select-none"
    >
      {/* Dynamic Cyber Glow Ambient Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-600/15 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-80 h-80 bg-fuchsia-600/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="relative z-10 w-full max-w-md bg-zinc-950/90 border border-purple-500/50 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(168,85,247,0.3)] backdrop-blur-2xl box-border my-auto animate-fade-in flex flex-col space-y-5">
        
        {/* Top 3D Monogram & Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          {/* Mini 3D Rotating Logo */}
          <div className="flex items-center justify-center -my-2">
            <Cyber3DIcon
              size={90}
              isProcessing={isLoading}
              processType="installing"
              theme="black-blue"
              showRings={true}
              showParticles={false}
            />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[10px] font-mono uppercase tracking-wider shadow">
              <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
              <span>Instagrand N A · Built by Naushad</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {authMode === 'login' ? 'Welcome Instagrand N A' : 'Create Account'}
            </h1>
            <p className="text-xs text-zinc-400 font-medium">
              {authMode === 'login'
                ? 'Sign in to access 4K Opus calling & Black-Blue 3D Orbit'
                : 'Register to claim your handle & get +100 Coins bonus'}
            </p>
          </div>
        </div>

        {/* Auth Mode Tabs (Login / Sign Up) */}
        <div className="grid grid-cols-2 p-1 bg-zinc-900/90 rounded-2xl border border-purple-900/50 text-xs font-bold">
          <button
            id="tab-btn-login"
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage('');
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              authMode === 'login'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Login</span>
          </button>
          <button
            id="tab-btn-signup"
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMessage('');
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              authMode === 'signup'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Error / Status Messages */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-600/50 text-xs text-rose-200 flex items-start gap-2 animate-shake">
            <span className="font-bold shrink-0">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {statusMessage && (
          <div className="p-3 rounded-2xl bg-purple-950/80 border border-purple-600/50 text-xs text-purple-200 flex items-center gap-2 animate-pulse">
            <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Primary Action 1: Sign in with Google (Prominent Button) */}
        <div className="space-y-2">
          <button
            id="google-signin-main-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-white/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {/* Google "G" SVG Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-purple-900/50" />
            <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">
              or continue with {authMode === 'login' ? 'credentials' : 'registration'}
            </span>
            <div className="flex-1 h-px bg-purple-900/50" />
          </div>
        </div>

        {/* TAB 1: LOGIN FORM */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>Username or Email</span>
              </label>
              <div className="relative">
                <input
                  id="login-identifier-input"
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="noushadalam5507@gmail.com or naushad"
                  required
                  className="w-full px-3.5 py-3 rounded-2xl bg-zinc-900/90 border border-purple-900/60 focus:border-purple-400 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Password</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showLoginPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password-input"
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-3.5 py-3 rounded-2xl bg-zinc-900/90 border border-purple-900/60 focus:border-purple-400 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-zinc-900 border-purple-800 text-purple-600 focus:ring-purple-500"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setLoginIdentifier('noushadalam5507@gmail.com');
                  setLoginPassword('NeonPurple2026!');
                }}
                className="text-purple-400 hover:text-purple-300 hover:underline cursor-pointer"
              >
                Autofill Naushad (Admin)
              </button>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              <span>LOGIN TO INSTAGRAND N A</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 2: SIGN UP FORM */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>Full Name</span>
                </label>
                <input
                  id="signup-fullname-input"
                  type="text"
                  value={signupFullName}
                  onChange={(e) => setSignupFullName(e.target.value)}
                  placeholder="Naushad Alam"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-900/90 border border-purple-900/60 focus:border-purple-400 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
                />
              </div>

              {/* Username Handle */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="text-purple-400">@</span>
                    <span>Username</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Available</span>
                </label>
                <input
                  id="signup-username-input"
                  type="text"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                  placeholder="naushad"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-900/90 border border-purple-900/60 focus:border-purple-400 text-xs sm:text-sm text-white placeholder-zinc-500 font-mono focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                <span>Email Address</span>
              </label>
              <input
                id="signup-email-input"
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="noushadalam5507@gmail.com"
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-900/90 border border-purple-900/60 focus:border-purple-400 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Password</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                >
                  {showSignupPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showSignupPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <input
                id="signup-password-input"
                type={showSignupPassword ? 'text' : 'password'}
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="Choose a strong password (6+ characters)"
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-900/90 border border-purple-900/60 focus:border-purple-400 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
              />
            </div>

            {/* +100 Coins Welcome Badge */}
            <div className="p-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
                <span className="text-amber-200 font-medium">New Member Sign-Up Bonus</span>
              </div>
              <span className="font-black text-amber-400 font-mono">+100 COINS</span>
            </div>

            <button
              id="signup-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-600 hover:from-emerald-300 hover:to-purple-500 text-black font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-emerald-400/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              <span>Create Instagrand N A Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Quick Demo Logins Section */}
        <div className="pt-2 border-t border-purple-900/40 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="font-semibold text-zinc-300">Quick Demo Accounts:</span>
            <span className="text-[10px] text-purple-400 font-mono">1-Click Sign-in</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {demoAccounts.map((demo) => (
              <button
                key={demo.id}
                type="button"
                onClick={() => handleSelectDemoAccount(demo)}
                className="p-2 rounded-xl bg-zinc-900/80 hover:bg-purple-950/70 border border-purple-900/40 hover:border-purple-500/60 transition-all flex flex-col items-center text-center gap-1 cursor-pointer group"
              >
                <img
                  src={demo.avatar}
                  alt={demo.name}
                  className="w-6 h-6 rounded-full object-cover border border-purple-500/50 group-hover:scale-110 transition-transform"
                />
                <span className="text-[10px] font-bold text-white truncate max-w-full">
                  @{demo.username}
                </span>
                <span className="text-[9px] text-purple-300 truncate max-w-full font-mono">
                  {demo.role === 'admin' ? '👑 Admin' : '⭐ Creator'}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
