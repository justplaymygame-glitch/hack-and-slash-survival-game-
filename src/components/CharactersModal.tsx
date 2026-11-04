import React from 'react';
import { Character } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { sound } from '../audio/soundEngine';

interface CharactersModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCharacterId: string;
  unlockedCharacterIds: string[];
  gold: number;
  onSelectCharacter: (id: string) => void;
  onBuyCharacter: (char: Character) => void;
}

export const CharactersModal: React.FC<CharactersModalProps> = ({
  isOpen,
  onClose,
  selectedCharacterId,
  unlockedCharacterIds,
  gold,
  onSelectCharacter,
  onBuyCharacter,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 select-none">
      <div className="glass-panel w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>🧙 Ancient Heroes</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Select your champion. Each warrior possesses distinct attributes and an active ability.
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

        {/* Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CHARACTERS.map((char) => {
            const isUnlocked = unlockedCharacterIds.includes(char.id);
            const isEquipped = selectedCharacterId === char.id;
            const canAfford = gold >= char.cost;

            return (
              <div
                key={char.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isEquipped
                    ? 'bg-purple-950/30 border-purple-500/80 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : isUnlocked
                    ? 'glass-panel-subtle border-white/10 hover:border-purple-500/40'
                    : 'bg-zinc-950/40 border-white/5 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner shrink-0"
                      style={{
                        backgroundColor: char.armorColor,
                        borderColor: char.accentColor,
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: char.hairColor }}
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{char.name}</h4>
                      <span className="text-[10px] text-purple-300 block">{char.title}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 italic mb-2.5 line-clamp-2">{char.description}</p>

                  <div className="flex items-center justify-between bg-black/40 px-3 py-1.5 rounded-xl text-[10px] font-mono mb-2.5">
                    <span className="text-slate-300"><strong className="text-red-400">{char.baseHp}</strong> HP</span>
                    <span className="text-slate-300"><strong className="text-blue-300">{char.baseSpeed}</strong> SPD</span>
                    <span className="text-slate-300"><strong className="text-yellow-300">{char.baseDamageMult}x</strong> ATK</span>
                  </div>

                  <div className="bg-purple-950/20 p-2.5 rounded-xl border border-purple-500/10 mb-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-purple-300 mb-0.5">
                      <span>✨ {char.abilityName}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{char.abilityCooldown}s CD</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-snug line-clamp-2">
                      {char.abilityDesc}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex justify-end">
                  {isEquipped ? (
                    <span className="text-[11px] font-bold text-purple-300 py-1 px-3 bg-purple-950/60 rounded-xl border border-purple-500/40">
                      SELECTED
                    </span>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => {
                        sound.playPowerUp();
                        onSelectCharacter(char.id);
                      }}
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      SELECT
                    </button>
                  ) : (
                    <button
                      onClick={() => onBuyCharacter(char)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-black'
                          : 'bg-zinc-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      UNLOCK ({char.cost} 🪙)
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
