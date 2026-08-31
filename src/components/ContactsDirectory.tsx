import React, { useState, useEffect } from 'react';
import {
  Users,
  Video,
  Phone,
  Search,
  Crown,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  Activity,
  Plus,
  ArrowRight,
  Database
} from 'lucide-react';
import { UserProfile } from '../types';
import { subscribeToAllUsers } from '../lib/firestoreService';

interface Contact {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: string;
  status: 'online' | 'in-call' | 'away';
  isVerified: boolean;
  lastCallTime?: string;
}

interface ContactsDirectoryProps {
  currentUser: UserProfile | null;
  onInitiateCall: (targetUsername: string) => void;
  onOpenAuth: () => void;
}

export const ContactsDirectory: React.FC<ContactsDirectoryProps> = ({
  currentUser,
  onInitiateCall,
  onOpenAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [firestoreUsers, setFirestoreUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const unsub = subscribeToAllUsers((users) => {
      setFirestoreUsers(users);
    });
    return () => unsub();
  }, []);

  const defaultContacts: Contact[] = [
    {
      id: 'cnt_1',
      name: 'Naushad Alam',
      username: 'naushad',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Lead System Architect · Direct Studio Lead',
      status: 'online',
      isVerified: true,
      lastCallTime: 'Just now',
    },
    {
      id: 'cnt_2',
      name: 'Aria Cyber',
      username: 'aria_cyber',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      role: 'Spatial Audio Engineer',
      status: 'online',
      isVerified: true,
      lastCallTime: 'Yesterday',
    },
    {
      id: 'cnt_3',
      name: 'Devon Vance',
      username: 'devon_v',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'Ultra-HD Video Researcher',
      status: 'online',
      isVerified: false,
      lastCallTime: '3 days ago',
    },
    {
      id: 'cnt_4',
      name: 'Elena Rostova',
      username: 'elena_r',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'WebRTC Protocol Contributor',
      status: 'in-call',
      isVerified: true,
      lastCallTime: '1 week ago',
    },
    {
      id: 'cnt_5',
      name: 'Zack Thorne',
      username: 'zack_t',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'Neon UI Designer',
      status: 'away',
      isVerified: false,
      lastCallTime: '2 weeks ago',
    },
  ];

  // Merge Firestore users with default directory
  const mergedContacts: Contact[] = [...defaultContacts];

  firestoreUsers.forEach((fbUser) => {
    const existingIdx = mergedContacts.findIndex(
      (c) => c.username.toLowerCase() === fbUser.username.toLowerCase()
    );
    const mapped: Contact = {
      id: fbUser.id,
      name: fbUser.name,
      username: fbUser.username,
      avatar: fbUser.avatar,
      role: fbUser.customBio || 'Verified Neon Studio Member',
      status: fbUser.status === 'in-call' ? 'in-call' : 'online',
      isVerified: fbUser.isVerified || fbUser.username.toLowerCase().includes('naushad'),
      lastCallTime: 'Live in Firestore',
    };

    if (existingIdx >= 0) {
      mergedContacts[existingIdx] = { ...mergedContacts[existingIdx], ...mapped };
    } else {
      mergedContacts.push(mapped);
    }
  });

  const filtered = mergedContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="contacts-directory-container" className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-950/80 border border-purple-500/30 neon-border-purple">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/30 text-xs font-semibold text-fuchsia-300 uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Creators & Verified Directory</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Direct Call Directory</h2>
          <p className="text-xs text-purple-200/70">
            1-Click instant purple neon audio and video studio connection.
          </p>
        </div>

        {/* Quick dial target input */}
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
          <input
            id="search-contacts-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or @handle..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-900/90 border border-purple-800/60 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
          />
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((contact) => (
          <div
            key={contact.id}
            id={`contact-card-${contact.username}`}
            className="p-5 rounded-2xl bg-zinc-950/80 border border-purple-900/40 hover:border-purple-500/60 transition-all group flex flex-col justify-between shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-purple-400/50 group-hover:scale-105 transition-transform"
                  />
                  <span
                    className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-zinc-950 ${
                      contact.status === 'online'
                        ? 'bg-emerald-400'
                        : contact.status === 'in-call'
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-zinc-500'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">{contact.name}</h3>
                    {contact.isVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" />
                    )}
                  </div>
                  <span className="text-xs font-mono text-fuchsia-400">@{contact.username}</span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{contact.role}</p>
                </div>
              </div>

              {contact.username === 'naushad' && (
                <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-600 text-[10px] font-bold text-fuchsia-300 uppercase">
                  FOUNDER
                </span>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-purple-950 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500 font-mono">
                {contact.lastCallTime ? `Recent: ${contact.lastCallTime}` : 'Active'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  id={`call-video-btn-${contact.username}`}
                  type="button"
                  onClick={() => onInitiateCall(contact.username)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Call 4K</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
