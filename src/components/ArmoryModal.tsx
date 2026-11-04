import React, { useState } from 'react';
import { Weapon } from '../types/game';
import { WEAPONS } from '../data/weapons';
import { sound } from '../audio/soundEngine';
import { SwordPreview } from '../game/weaponVisuals';

interface ArmoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWeaponId: string;
  unlockedWeaponIds: string[];
  gold: number;
  onSelectWeapon: (weaponId: string) => void;
  onBuyWeapon: (weapon: Weapon) => void;
}

export const ArmoryModal: React.FC<ArmoryModalProps> = ({
  isOpen,
  onClose,
  selectedWeaponId,
  unlockedWeaponIds,
  gold,
  onSelectWeapon,
  onBuyWeapon,
}) => {
  const [filterRarity, setFilterRarity] = useState<string>('all');

  if (!isOpen) return null;

  const filteredWeapons = WEAPONS.filter((w) => {
    if (filterRarity === 'all') return true;
    return w.rarity === filterRarity;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 select-none">
      <div className="glass-panel w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>🗡️ Ancient Armory</span>
              <span className="text-xs text-emerald-400 font-mono font-normal">(35 Weapons)</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Each weapon has its own unique blade silhouette, custom powers, swing VFX, and audio profile.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-amber-300 font-mono">🪙 {gold.toLocaleString()}</span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full glass-panel-subtle hover:bg-zinc-800 flex items-center justify-center text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Clean Filter Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 border-b border-white/5 overflow-x-auto text-xs">
          {['all', 'common', 'rare', 'epic', 'legendary', 'mythic', 'divine'].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRarity(r)}
              className={`px-3 py-1 rounded-xl capitalize font-medium text-[11px] cursor-pointer transition-all ${
                filterRarity === r
                  ? 'bg-emerald-500 text-black font-bold shadow-sm'
                  : 'glass-panel-subtle text-slate-300 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Weapon Cards Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredWeapons.map((weapon, idx) => {
            const isUnlocked = unlockedWeaponIds.includes(weapon.id);
            const isEquipped = selectedWeaponId === weapon.id;
            const canAfford = gold >= weapon.cost;

            return (
              <div
                key={weapon.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isEquipped
                    ? 'bg-emerald-950/30 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : isUnlocked
                    ? 'glass-panel-subtle border-white/10 hover:border-emerald-500/40'
                    : 'bg-zinc-950/40 border-white/5 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full glass-panel-subtle text-slate-300">
                      {weapon.rarity}
                    </span>
                  </div>

                  {/* Weapon Preview & Info */}
                  <div className="flex items-center gap-3 mb-2.5">
                    <SwordPreview weapon={weapon} size={54} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: weapon.vfxColor }}
                        />
                        <h4 className="text-xs font-bold text-white truncate">{weapon.name}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 italic truncate">{weapon.title}</p>
                    </div>
                  </div>

                  {/* Clean stats row */}
                  <div className="flex items-center justify-between bg-black/40 px-3 py-1.5 rounded-xl text-[10px] font-mono mb-2.5">
                    <span className="text-slate-300"><strong className="text-red-400">{weapon.damage}</strong> DMG</span>
                    <span className="text-slate-300"><strong className="text-blue-300">{weapon.attackSpeed}x</strong> SPD</span>
                    <span className="text-slate-300"><strong className="text-amber-300">{weapon.reach}</strong> RNG</span>
                  </div>

                  {/* Power description */}
                  <div className="bg-emerald-950/20 p-2 rounded-xl border border-emerald-500/10 mb-3">
                    <span className="text-[10px] font-bold text-emerald-300 block">
                      ⚡ {weapon.powerName}
                    </span>
                    <p className="text-[10px] text-slate-300 mt-0.5 leading-snug line-clamp-2">
                      {weapon.powerDescription}
                    </p>
                  </div>
                </div>

                {/* Action button & audio preview */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => sound.playWeaponSwing(weapon.soundType)}
                    className="p-1.5 glass-panel-subtle rounded-lg text-xs hover:text-white cursor-pointer"
                    title="Audio Preview"
                  >
                    🔊
                  </button>

                  {isEquipped ? (
                    <span className="text-[11px] font-bold text-emerald-400 py-1 px-3 bg-emerald-950/60 rounded-xl border border-emerald-500/40">
                      EQUIPPED
                    </span>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => onSelectWeapon(weapon.id)}
                      className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      EQUIP
                    </button>
                  ) : (
                    <button
                      onClick={() => onBuyWeapon(weapon)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-black'
                          : 'bg-zinc-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      BUY ({weapon.cost} 🪙)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
