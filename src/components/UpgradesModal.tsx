import React from 'react';
import { PlayerUpgrades } from '../types/game';
import { calculateUpgradeCost } from '../game/rules';
import { sound } from '../audio/soundEngine';

interface UpgradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  upgrades: PlayerUpgrades;
  gold: number;
  onUpgrade: (key: keyof PlayerUpgrades, cost: number) => void;
}

interface UpgradeDef {
  key: keyof PlayerUpgrades;
  name: string;
  desc: string;
  baseCost: number;
  icon: string;
  statBonus: string;
}

const UPGRADE_LIST: UpgradeDef[] = [
  {
    key: 'damageLevel',
    name: 'Blade Sharpness',
    desc: 'Increases all base melee and proc damage.',
    baseCost: 50,
    icon: '⚔️',
    statBonus: '+15% Damage per level',
  },
  {
    key: 'attackSpeedLevel',
    name: 'Swift Strikes',
    desc: 'Increases melee weapon swing frequency.',
    baseCost: 75,
    icon: '⚡',
    statBonus: '+10% Attack Speed per level',
  },
  {
    key: 'maxHpLevel',
    name: 'Hero Vitality',
    desc: 'Expands the player’s maximum life pool.',
    baseCost: 60,
    icon: '❤️',
    statBonus: '+25 Max HP per level',
  },
  {
    key: 'armorLevel',
    name: 'Ironbark Carapace',
    desc: 'Toughens skin with petrified bark to reduce incoming monster damage.',
    baseCost: 80,
    icon: '🛡️',
    statBonus: '+4% Damage Reduction per level (max 75%)',
  },
  {
    key: 'moveSpeedLevel',
    name: 'Windwalker Agility',
    desc: 'Enables faster movement around the forest battlefield.',
    baseCost: 90,
    icon: '👟',
    statBonus: '+8% Movement Speed per level',
  },
  {
    key: 'goldGainLevel',
    name: 'Ancient Midas',
    desc: 'Increases gold coins scavenged from slain monsters.',
    baseCost: 100,
    icon: '🪙',
    statBonus: '+15% Gold Bounty per level',
  },
  {
    key: 'critChanceLevel',
    name: 'Precision Cleave',
    desc: 'Higher probability of landing 200% critical strikes.',
    baseCost: 120,
    icon: '🎯',
    statBonus: '+4% Crit Chance per level',
  },
  {
    key: 'lifeStealLevel',
    name: 'Vampiric Touch',
    desc: 'Restores health when cleaving down enemy hordes.',
    baseCost: 150,
    icon: '🩸',
    statBonus: '+3% Life Leech on hit per level',
  },
  {
    key: 'totemCapacityLevel',
    name: 'Runic Totem Mastery',
    desc: 'Increases max placeable defense totems and totem HP.',
    baseCost: 140,
    icon: '🛡️',
    statBonus: '+1 Totem & +100 HP per level',
  },
];

export const UpgradesModal: React.FC<UpgradesModalProps> = ({
  isOpen,
  onClose,
  upgrades,
  gold,
  onUpgrade,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 select-none">
      <div className="glass-panel w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>📈 Sanctuary Upgrades</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Invest your gold bounty to permanently enhance your warrior attributes.
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

        {/* Upgrades List */}
        <div className="p-6 overflow-y-auto space-y-2.5">
          {UPGRADE_LIST.map((item) => {
            const currentLevel = upgrades[item.key];
            const cost = calculateUpgradeCost(currentLevel, item.baseCost);
            const canAfford = gold >= cost;

            return (
              <div
                key={item.key}
                className="flex items-center justify-between p-3.5 glass-panel-subtle hover:border-emerald-500/30 rounded-2xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl p-2 rounded-xl bg-black/40">{item.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{item.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                        LVL {currentLevel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                    <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                      {item.statBonus}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playCoin();
                    onUpgrade(item.key, cost);
                  }}
                  disabled={!canAfford}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 font-mono ${
                    canAfford
                      ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-md'
                      : 'bg-zinc-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  UPGRADE ({cost} 🪙)
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
