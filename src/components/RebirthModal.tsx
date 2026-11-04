import React from 'react';
import { RebirthData } from '../types/game';
import { calculateRebirthRequirements } from '../game/rules';
import { sound } from '../audio/soundEngine';

interface RebirthModalProps {
  isOpen: boolean;
  onClose: () => void;
  rebirths: RebirthData;
  gold: number;
  onPerformRebirth: (cost: number, rewardSouls: number, newMultiplier: number) => void;
}

export const RebirthModal: React.FC<RebirthModalProps> = ({
  isOpen,
  onClose,
  rebirths,
  gold,
  onPerformRebirth,
}) => {
  if (!isOpen) return null;

  const { costGold, rewardSoulShards, newDamageMultiplier } = calculateRebirthRequirements(rebirths.count);
  const canRebirth = gold >= costGold;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 select-none">
      <div className="glass-panel w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden border-pink-500/30 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>🔮 Primordial Rebirth Altar</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Ascend your mortal form to unlock permanent +50% base damage multipliers.
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
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 glass-panel-subtle p-4 rounded-2xl text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Rebirths</span>
              <span className="text-xl font-black text-pink-400 mt-1 block">{rebirths.count}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Damage Mult</span>
              <span className="text-xl font-black text-red-400 mt-1 block">{rebirths.damageMultiplier}x</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Soul Shards</span>
              <span className="text-xl font-black text-cyan-300 mt-1 block">💎 {rebirths.soulShards}</span>
            </div>
          </div>

          {/* Ascension Card */}
          <div className="bg-pink-950/20 p-5 rounded-2xl border border-pink-500/20 space-y-3">
            <h3 className="text-xs font-bold text-pink-300 uppercase tracking-wider">
              ✨ Next Ascension Benefits:
            </h3>
            <ul className="text-xs text-slate-300 space-y-1.5 font-medium">
              <li className="flex items-center gap-2">
                <span>⚔️</span>
                <span>Damage Multiplier increases to: <strong className="text-red-400 font-bold">{newDamageMultiplier}x (+50% bonus)</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <span>💎</span>
                <span>Gain <strong className="text-cyan-300 font-bold">+{rewardSoulShards} Soul Shards</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <span>👑</span>
                <span>Climb the Global Leaderboards</span>
              </li>
            </ul>

            <div className="pt-3 border-t border-pink-500/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Sacrifice:</span>
                <span className="text-xs font-bold text-amber-300 font-mono">
                  {costGold.toLocaleString()} 🪙 Gold (You have: {gold.toLocaleString()} 🪙)
                </span>
              </div>

              <button
                onClick={() => {
                  sound.playBossDefeat();
                  onPerformRebirth(costGold, rewardSoulShards, newDamageMultiplier);
                }}
                disabled={!canRebirth}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer font-mono ${
                  canRebirth
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-lg'
                    : 'bg-zinc-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {canRebirth ? 'ASCEND NOW' : 'NEED MORE GOLD'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
