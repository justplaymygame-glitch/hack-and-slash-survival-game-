import React from 'react';
import { AdminCheats } from '../types/game';
import { MAPS } from '../data/maps';
import { sound } from '../audio/soundEngine';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  adminCheats: AdminCheats;
  setAdminCheats: React.Dispatch<React.SetStateAction<AdminCheats>>;
  onGiveCurrency: (gold: number, souls: number) => void;
  onEquipBestSword: () => void;
  onUnlockAllSwords: () => void;
  onUnlockAllCharacters: () => void;
  onMaxUpgrades: () => void;
  onSelectMap: (mapId: number) => void;
  onAddRebirths: (count: number) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  adminCheats,
  setAdminCheats,
  onGiveCurrency,
  onEquipBestSword,
  onUnlockAllSwords,
  onUnlockAllCharacters,
  onMaxUpgrades,
  onSelectMap,
  onAddRebirths,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="glass-panel w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden border-emerald-500/30 animate-fadeIn">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              ROOT ADMIN CONSOLE // 1234z
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass-panel-subtle hover:bg-zinc-800 flex items-center justify-center text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Overpowered Status Cheats */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              ⚡ Overpowered Status Cheats
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Godmode */}
              <button
                onClick={() => {
                  sound.playAdminCheats();
                  setAdminCheats((prev) => ({ ...prev, godmode: !prev.godmode }));
                }}
                className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  adminCheats.godmode
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'glass-panel-subtle border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <span>🛡️ GOD MODE (INVULNERABLE)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 font-mono">
                  {adminCheats.godmode ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* 100x Damage */}
              <button
                onClick={() => {
                  sound.playAdminCheats();
                  setAdminCheats((prev) => ({ ...prev, dmg100x: !prev.dmg100x }));
                }}
                className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  adminCheats.dmg100x
                    ? 'bg-red-500/20 border-red-400 text-red-300'
                    : 'glass-panel-subtle border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <span>💥 100x DAMAGE MULTIPLIER</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 font-mono">
                  {adminCheats.dmg100x ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* 5x Speed */}
              <button
                onClick={() => {
                  sound.playAdminCheats();
                  setAdminCheats((prev) => ({ ...prev, speed5x: !prev.speed5x }));
                }}
                className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  adminCheats.speed5x
                    ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                    : 'glass-panel-subtle border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <span>⚡ 5x HYPER SPEED</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 font-mono">
                  {adminCheats.speed5x ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Infinite Shield */}
              <button
                onClick={() => {
                  sound.playAdminCheats();
                  setAdminCheats((prev) => ({ ...prev, infiniteShield: !prev.infiniteShield }));
                }}
                className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  adminCheats.infiniteShield
                    ? 'bg-teal-500/20 border-teal-400 text-teal-300'
                    : 'glass-panel-subtle border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <span>🛡️ PERPETUAL SHIELD</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 font-mono">
                  {adminCheats.infiniteShield ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>

          {/* 10 NEW ULTRA COMMANDS */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>🔥 10 NEW OVERPOWERED COMMANDS</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono font-normal">
                  NEW
                </span>
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* 1. Time Stop */}
              <button
                onClick={() => {
                  sound.playTimeStop();
                  setAdminCheats((prev) => ({ ...prev, timeStop: !prev.timeStop }));
                }}
                className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  adminCheats.timeStop
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                    : 'glass-panel-subtle border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <span>❄️ #1 TIME STOP (PARALYZE ALL)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 font-mono">
                  {adminCheats.timeStop ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* 2. Colossal Blade */}
              <button
                onClick={() => {
                  sound.playAdminCheats();
                  setAdminCheats((prev) => ({ ...prev, colossalBlade: !prev.colossalBlade }));
                }}
                className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  adminCheats.colossalBlade
                    ? 'bg-purple-500/25 border-purple-400 text-purple-200'
                    : 'glass-panel-subtle border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <span>🗡️ #2 COLOSSAL BLADE (10x REACH)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 font-mono">
                  {adminCheats.colossalBlade ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* 3. Rapid Fire */}
              <button
                onClick={() => {
                  sound.playAdminCheats();
                  setAdminCheats((prev) => ({ ...prev, rapidFire: !prev.rapidFire }));
                }}
                className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  adminCheats.rapidFire
                    ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                    : 'glass-panel-subtle border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <span>⚡ #3 RAPID FIRE (0.01s DELAY)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 font-mono">
                  {adminCheats.rapidFire ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* 4. Ghost Phase Mode */}
              <button
                onClick={() => {
                  sound.playAdminCheats();
                  setAdminCheats((prev) => ({ ...prev, ghostMode: !prev.ghostMode }));
                }}
                className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  adminCheats.ghostMode
                    ? 'bg-indigo-500/25 border-indigo-400 text-indigo-200'
                    : 'glass-panel-subtle border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <span>👻 #4 GHOST PHASE (NO CLIP)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 font-mono">
                  {adminCheats.ghostMode ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* 5. Hyper Vacuum */}
              <button
                onClick={() => {
                  sound.playVacuum();
                  setAdminCheats((prev) => ({ ...prev, hyperVacuum: !prev.hyperVacuum }));
                }}
                className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  adminCheats.hyperVacuum
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                    : 'glass-panel-subtle border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <span>🧲 #5 HYPER VACUUM (ALL LOOT)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 font-mono">
                  {adminCheats.hyperVacuum ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* 6. Screen Annihilation Nuke */}
              <button
                onClick={() => {
                  sound.playNukeAnnihilation();
                  setAdminCheats((prev) => ({ ...prev, nukeScreenTrigger: Date.now() }));
                }}
                className="p-3 bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 rounded-2xl text-xs font-bold text-left cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span>💣 #6 SCREEN ANNIHILATION NUKE</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/30 text-white font-mono">
                    ACTIVATE
                  </span>
                </div>
                <p className="text-[10px] text-red-200/70 font-normal mt-1">
                  Obliterates every monster on screen in blinding flash.
                </p>
              </button>

              {/* 7. Awaken Realm Boss */}
              <button
                onClick={() => {
                  sound.playBossRoar();
                  setAdminCheats((prev) => ({ ...prev, instantBossTrigger: Date.now() }));
                }}
                className="p-3 bg-fuchsia-950/40 hover:bg-fuchsia-900/50 border border-fuchsia-500/40 text-fuchsia-300 rounded-2xl text-xs font-bold text-left cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span>👹 #7 AWAKEN REALM BOSS NOW</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/30 text-white font-mono">
                    SPAWN
                  </span>
                </div>
                <p className="text-[10px] text-fuchsia-200/70 font-normal mt-1">
                  Forces current realm&apos;s Final Boss to spawn instantly.
                </p>
              </button>

              {/* 8. Golden Swarm */}
              <button
                onClick={() => {
                  sound.playPowerUp();
                  setAdminCheats((prev) => ({ ...prev, spawnTreasureSwarmTrigger: Date.now() }));
                }}
                className="p-3 bg-yellow-950/40 hover:bg-yellow-900/50 border border-yellow-500/40 text-yellow-300 rounded-2xl text-xs font-bold text-left cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span>🪙 #8 SUMMON 10 TREASURE WISPS</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/30 text-white font-mono">
                    SUMMON
                  </span>
                </div>
                <p className="text-[10px] text-yellow-200/70 font-normal mt-1">
                  Spawns a swarm of golden sprites bursting with loot.
                </p>
              </button>

              {/* 9. Max 999x SSS Combo */}
              <button
                onClick={() => {
                  sound.playComboTierUp('SSS');
                  setAdminCheats((prev) => ({ ...prev, comboMaxTrigger: Date.now() }));
                }}
                className="p-3 bg-pink-950/40 hover:bg-pink-900/50 border border-pink-500/40 text-pink-300 rounded-2xl text-xs font-bold text-left cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span>🔥 #9 999x SSS PRIMORDIAL COMBO</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/30 text-white font-mono">
                    BURST
                  </span>
                </div>
                <p className="text-[10px] text-pink-200/70 font-normal mt-1">
                  Sets combo to 999 with +200% DMG &amp; +150% Gold bonuses.
                </p>
              </button>

              {/* 10. Instant +5 Rebirths */}
              <button
                onClick={() => {
                  sound.playAdminCheats();
                  onAddRebirths(5);
                  setAdminCheats((prev) => ({ ...prev, ascendRebirthsTrigger: Date.now() }));
                }}
                className="p-3 bg-teal-950/40 hover:bg-teal-900/50 border border-teal-500/40 text-teal-300 rounded-2xl text-xs font-bold text-left cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span>🔮 #10 ASCEND +5 REBIRTHS</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/30 text-white font-mono">
                    ASCEND
                  </span>
                </div>
                <p className="text-[10px] text-teal-200/70 font-normal mt-1">
                  Instantly bestows 5 rebirth levels and +250% global damage.
                </p>
              </button>
            </div>
          </div>

          {/* Instant Armory & Wealth */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              🗡️ Instant Armory &amp; Progression Hacks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  sound.playAdminCheats();
                  onEquipBestSword();
                }}
                className="p-3 glass-panel-subtle hover:bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-bold text-left cursor-pointer transition-all"
              >
                ⚔️ EQUIP &quot;THE WORLD-ENDER&quot; (#35)
                <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                  Instant max-tier 360-degree cataclysmic screen cleave.
                </p>
              </button>

              <button
                onClick={() => {
                  sound.playAdminCheats();
                  onUnlockAllSwords();
                }}
                className="p-3 glass-panel-subtle hover:bg-zinc-800 text-slate-200 rounded-2xl text-xs font-bold text-left cursor-pointer transition-all"
              >
                🎁 UNLOCK ALL 35 SWORDS
                <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                  Grants all 35 elemental melee weapons instantly.
                </p>
              </button>

              <button
                onClick={() => {
                  sound.playAdminCheats();
                  onUnlockAllCharacters();
                }}
                className="p-3 glass-panel-subtle hover:bg-zinc-800 text-slate-200 rounded-2xl text-xs font-bold text-left cursor-pointer transition-all"
              >
                🧙 UNLOCK ALL 6 HEROES
                <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                  Unlock Kaelen, Boran, Nyx, Solaria, Gorath, Lyra.
                </p>
              </button>

              <button
                onClick={() => {
                  sound.playCoin();
                  onGiveCurrency(1000000, 1000);
                }}
                className="p-3 glass-panel-subtle hover:bg-amber-950/30 border border-amber-500/30 text-amber-300 rounded-2xl text-xs font-bold text-left cursor-pointer transition-all"
              >
                💰 +1,000,000 GOLD &amp; +1,000 SOULS
                <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                  Instant infinite currency for all shops.
                </p>
              </button>

              <button
                onClick={() => {
                  sound.playAdminCheats();
                  onMaxUpgrades();
                }}
                className="p-3 glass-panel-subtle hover:bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 rounded-2xl text-xs font-bold text-left cursor-pointer transition-all"
              >
                📈 MAX OUT ALL UPGRADES
                <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                  Sets all sanctuary upgrades to maximum tier.
                </p>
              </button>

              <button
                onClick={() => {
                  sound.playAdminCheats();
                  onAddRebirths(5);
                }}
                className="p-3 glass-panel-subtle hover:bg-pink-950/30 border border-pink-500/30 text-pink-300 rounded-2xl text-xs font-bold text-left cursor-pointer transition-all"
              >
                🔮 +5 INSTANT REBIRTHS (+250% DMG)
                <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                  Permanent ascension multiplier boost.
                </p>
              </button>
            </div>
          </div>

          {/* Dimensional Warp */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              🗺️ Dimensional Warp: Jump to Any Map (1-13)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MAPS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    sound.playAdminCheats();
                    onSelectMap(m.id);
                  }}
                  className="p-2 glass-panel-subtle hover:border-emerald-500/40 text-left rounded-xl text-[11px] cursor-pointer transition-all"
                >
                  <span className="font-bold text-emerald-400 font-mono">#{m.id}</span> {m.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl uppercase tracking-wider cursor-pointer transition-all"
          >
            CONFIRM &amp; RETURN
          </button>
        </div>
      </div>
    </div>
  );
};
