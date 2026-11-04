import React from 'react';
import { LeaderboardEntry } from '../types/game';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
  currentUsername: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  entries,
  currentUsername,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 select-none">
      <div className="glass-panel w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden border-amber-500/30 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>🏆 Global Hall of Warriors</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Top recorded incursions across all thirteen ancient realms.
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
        <div className="p-6 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] font-mono">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Warrior</th>
                <th className="py-2.5 px-3">Realm</th>
                <th className="py-2.5 px-3">Bosses</th>
                <th className="py-2.5 px-3">Rebirths</th>
                <th className="py-2.5 px-3 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.map((entry, idx) => {
                const isMe = currentUsername && entry.name.toLowerCase() === currentUsername.toLowerCase();

                return (
                  <tr
                    key={entry.id || idx}
                    className={`transition-colors ${
                      isMe
                        ? 'bg-amber-500/15 font-semibold text-amber-200'
                        : 'hover:bg-white/5 text-slate-200'
                    }`}
                  >
                    <td className="py-3 px-3 font-mono">
                      {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={isMe ? 'text-amber-300 font-bold' : 'text-slate-100'}>
                          {entry.name}
                        </span>
                        {isMe && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-amber-400 text-black font-black rounded-full">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        {entry.characterName} · {entry.weaponName}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-mono">
                      Map #{entry.highestMap}
                    </td>
                    <td className="py-3 px-3 text-red-400 font-mono">
                      {entry.bossesSlain} 💀
                    </td>
                    <td className="py-3 px-3 text-pink-400 font-mono">
                      {entry.rebirths} 🔮
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-amber-300 font-mono">
                      {entry.score.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
