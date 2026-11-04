import React, { useState } from 'react';
import { FriendProfile, getRegisteredUsernames } from '../utils/storage';
import { sound } from '../audio/soundEngine';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  partyMembers: FriendProfile[];
  onAddPartyMember: (friend: FriendProfile) => void;
  onRemovePartyMember: (name: string) => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({
  isOpen,
  onClose,
  currentUsername,
  partyMembers,
  onAddPartyMember,
  onRemovePartyMember,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<FriendProfile | null>(null);
  const [searchError, setSearchError] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setSearchResult(null);

    const query = searchQuery.trim();
    if (!query) {
      setSearchError('Please enter a warrior username.');
      return;
    }

    if (query.toLowerCase() === currentUsername.toLowerCase()) {
      setSearchError('You cannot add yourself as a friend.');
      return;
    }

    const registered = getRegisteredUsernames();
    const matched = registered.find((n) => n.toLowerCase() === query.toLowerCase());

    if (matched) {
      const profile: FriendProfile = {
        name: matched,
        level: Math.floor(Math.random() * 30) + 10,
        characterTitle: 'Mystic Ranger',
        weaponName: 'Gale Whisper Katana',
        highestMap: Math.min(13, Math.floor(Math.random() * 8) + 4),
        isOnline: true,
        avatarColor: '#10b981',
      };
      setSearchResult(profile);
      sound.playCoin();
    } else {
      if (query.length >= 3) {
        const customProfile: FriendProfile = {
          name: query,
          level: 15,
          characterTitle: 'Forest Pilgrim',
          weaponName: 'Verdant Slicer',
          highestMap: 3,
          isOnline: true,
          avatarColor: '#3b82f6',
        };
        setSearchResult(customProfile);
        sound.playCoin();
      } else {
        setSearchError(`Warrior "${query}" not found in the realm.`);
      }
    }
  };

  const copyMyName = () => {
    navigator.clipboard.writeText(currentUsername).catch(() => {});
    setCopiedNotification(true);
    sound.playCoin();
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 select-none">
      <div className="glass-panel w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden border-teal-500/30 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>👥 Friends &amp; Co-op Party</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Form a defense party with your friends. Each party member grants +10% Gold &amp; EXP bonuses!
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass-panel-subtle hover:bg-zinc-800 flex items-center justify-center text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* My Warrior Name */}
          <div className="flex items-center justify-between glass-panel-subtle p-3.5 rounded-2xl">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Your Warrior Name</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                🛡️ {currentUsername || 'Warrior'}
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </span>
            </div>
            <button
              onClick={copyMyName}
              className="px-3 py-1.5 glass-panel-subtle hover:bg-zinc-800 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            >
              {copiedNotification ? 'COPIED!' : '📋 Copy Name'}
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="text-xs text-slate-300 font-bold block uppercase tracking-wider font-mono">
              Search Friend by Username:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. ShadowWalker, DragonSlayer..."
                className="flex-1 bg-zinc-900 border border-zinc-700 focus:border-teal-400 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs rounded-xl transition-all cursor-pointer font-mono"
              >
                SEARCH
              </button>
            </div>
            {searchError && <p className="text-xs text-red-400">{searchError}</p>}
          </form>

          {/* Search Result */}
          {searchResult && (
            <div className="glass-panel-subtle p-3.5 rounded-2xl border-teal-500/30 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-500/20 border border-teal-400 flex items-center justify-center text-sm">
                  🛡️
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    {searchResult.name}
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono">
                      ONLINE
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Highest Map: #{searchResult.highestMap} · {searchResult.weaponName}
                  </p>
                </div>
              </div>

              {partyMembers.some((p) => p.name.toLowerCase() === searchResult.name.toLowerCase()) ? (
                <span className="text-xs text-emerald-400 font-bold">IN PARTY</span>
              ) : (
                <button
                  onClick={() => {
                    sound.playPowerUp();
                    onAddPartyMember(searchResult);
                    setSearchResult(null);
                    setSearchQuery('');
                  }}
                  className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs rounded-xl cursor-pointer transition-all"
                >
                  ➕ Invite
                </button>
              )}
            </div>
          )}

          {/* Active Party Members */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Defense Party ({partyMembers.length + 1} / 4)
              </h3>
              <span className="text-[11px] text-amber-300 font-semibold font-mono">
                Party Buff: +{partyMembers.length * 10}% Gold &amp; EXP!
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 glass-panel-subtle rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs">👑</span>
                  <span className="text-xs font-bold text-white">{currentUsername || 'You'} (Party Leader)</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">HOST</span>
              </div>

              {partyMembers.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center justify-between p-3 glass-panel-subtle rounded-xl border border-teal-500/20"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs">🛡️</span>
                    <span className="text-xs font-bold text-teal-200">{member.name}</span>
                    <span className="text-[10px] text-slate-400">({member.characterTitle})</span>
                  </div>
                  <button
                    onClick={() => onRemovePartyMember(member.name)}
                    className="text-[10px] text-red-400 hover:text-red-300 px-2 py-0.5 rounded-lg glass-panel-subtle cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {partyMembers.length === 0 && (
                <p className="text-xs text-slate-500 italic p-3 text-center rounded-xl border border-dashed border-white/5">
                  No friends in your party yet. Search a warrior above to invite them!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
