import React, { useState, useEffect, useRef } from 'react';
import {
  AdminCheats,
  LeaderboardEntry,
  PlayerUpgrades,
  Weapon,
  Character,
} from './types/game';
import { MAPS } from './data/maps';
import { WEAPONS } from './data/weapons';
import { CHARACTERS } from './data/characters';
import {
  loadGameState,
  saveGameState,
  GameState,
  FriendProfile,
  FeedbackSubmission,
  getLeaderboard,
  registerNewUsername,
} from './utils/storage';
import { GameCanvas } from './components/GameCanvas';
import { AdminPanel } from './components/AdminPanel';
import { ArmoryModal } from './components/ArmoryModal';
import { CharactersModal } from './components/CharactersModal';
import { UpgradesModal } from './components/UpgradesModal';
import { RebirthModal } from './components/RebirthModal';
import { FriendsModal } from './components/FriendsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { FeedbackModal } from './components/FeedbackModal';
import { UsernamePromptModal } from './components/UsernamePromptModal';
import { sound } from './audio/soundEngine';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => loadGameState());
  const [currentScreen, setCurrentScreen] = useState<'title' | 'playing' | 'paused' | 'victory' | 'gameover'>('title');

  // Modals
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isArmoryOpen, setIsArmoryOpen] = useState(false);
  const [isCharactersOpen, setIsCharactersOpen] = useState(false);
  const [isUpgradesOpen, setIsUpgradesOpen] = useState(false);
  const [isRebirthOpen, setIsRebirthOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isNamePromptOpen, setIsNamePromptOpen] = useState(false);
  const [isLeaveGameOpen, setIsLeaveGameOpen] = useState(false);
  const [hasLeftGame, setHasLeftGame] = useState(false);
  const [leaveGameSavedTime, setLeaveGameSavedTime] = useState('');
  const [autoSaveNotification, setAutoSaveNotification] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const [lastRunStats, setLastRunStats] = useState({
    kills: 0,
    goldEarned: 0,
    bossSlain: false,
    score: 0,
  });

  const [adminCheats, setAdminCheats] = useState<AdminCheats>({
    godmode: false,
    dmg100x: false,
    speed5x: false,
    unlockedAllSwords: false,
    infiniteShield: false,
    noCooldowns: false,
    timeStop: false,
    colossalBlade: false,
    rapidFire: false,
    ghostMode: false,
    hyperVacuum: false,
    nukeScreenTrigger: 0,
    instantBossTrigger: 0,
    spawnTreasureSwarmTrigger: 0,
    comboMaxTrigger: 0,
    ascendRebirthsTrigger: 0,
  });

  const keyBuffer = useRef('');

  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  // 5-Minute Auto-Save Background Interval
  useEffect(() => {
    const FIVE_MINUTES_MS = 5 * 60 * 1000;
    const interval = setInterval(() => {
      saveGameState(gameState);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAutoSaveNotification(`💾 Game Auto-Saved (${timeStr})`);
      setTimeout(() => setAutoSaveNotification(''), 4500);
    }, FIVE_MINUTES_MS);

    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    document.body.dataset.state = currentScreen;
  }, [currentScreen]);

  useEffect(() => {
    if (!gameState.hasChosenName && !gameState.username) {
      setIsNamePromptOpen(true);
    }
  }, [gameState.hasChosenName, gameState.username]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setCurrentScreen('playing');
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      keyBuffer.current += e.key.toLowerCase();
      if (keyBuffer.current.length > 5) {
        keyBuffer.current = keyBuffer.current.slice(-5);
      }
      if (keyBuffer.current.endsWith('1234z')) {
        sound.playAdminCheats();
        setIsAdminOpen(true);
        keyBuffer.current = '';
      }

      if (document.body.dataset.state === 'title') {
        // Pressing Escape in main menu opens Leave Game dialog
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsLeaveGameOpen(true);
          setHasLeftGame(false);
          return;
        }

        if (e.key === 'Enter' || e.key === ' ') {
          const activeTag = document.activeElement?.tagName.toLowerCase();
          if (activeTag !== 'input' && activeTag !== 'textarea') {
            e.preventDefault();
            startGame();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const startGame = () => {
    sound.playPowerUp();
    setCurrentScreen('playing');
  };

  const currentMap = MAPS.find((m) => m.id === gameState.currentMapId) || MAPS[0];
  const currentWeapon = WEAPONS.find((w) => w.id === gameState.selectedWeaponId) || WEAPONS[0];
  const currentCharacter = CHARACTERS.find((c) => c.id === gameState.selectedCharacterId) || CHARACTERS[0];

  const handleUpgrade = (key: keyof PlayerUpgrades, cost: number) => {
    if (gameState.gold < cost) return;
    setGameState((prev) => ({
      ...prev,
      gold: prev.gold - cost,
      upgrades: {
        ...prev.upgrades,
        [key]: prev.upgrades[key] + 1,
      },
    }));
  };

  const handleRebirth = (cost: number, rewardSouls: number, newMultiplier: number) => {
    if (gameState.gold < cost) return;
    setGameState((prev) => ({
      ...prev,
      gold: 0,
      soulShards: prev.soulShards + rewardSouls,
      rebirths: {
        ...prev.rebirths,
        count: prev.rebirths.count + 1,
        soulShards: prev.rebirths.soulShards + rewardSouls,
        damageMultiplier: newMultiplier,
      },
    }));
    setIsRebirthOpen(false);
  };

  const handleBuyWeapon = (weapon: Weapon) => {
    if (gameState.gold < weapon.cost) return;
    sound.playCoin();
    setGameState((prev) => ({
      ...prev,
      gold: prev.gold - weapon.cost,
      unlockedWeaponIds: [...prev.unlockedWeaponIds, weapon.id],
      selectedWeaponId: weapon.id,
    }));
  };

  const handleSelectWeapon = (weaponId: string) => {
    sound.playPowerUp();
    setGameState((prev) => ({ ...prev, selectedWeaponId: weaponId }));
  };

  const handleBuyCharacter = (char: Character) => {
    if (gameState.gold < char.cost) return;
    sound.playCoin();
    setGameState((prev) => ({
      ...prev,
      gold: prev.gold - char.cost,
      unlockedCharacterIds: [...prev.unlockedCharacterIds, char.id],
      selectedCharacterId: char.id,
    }));
  };

  const handleSelectCharacter = (charId: string) => {
    sound.playPowerUp();
    setGameState((prev) => ({ ...prev, selectedCharacterId: charId }));
  };

  const handleAddPartyMember = (friend: FriendProfile) => {
    setGameState((prev) => ({
      ...prev,
      partyMembers: [...prev.partyMembers.filter((p) => p.name !== friend.name), friend],
    }));
  };

  const handleRemovePartyMember = (name: string) => {
    setGameState((prev) => ({
      ...prev,
      partyMembers: prev.partyMembers.filter((p) => p.name !== name),
    }));
  };

  const handleSubmitFeedback = (submission: FeedbackSubmission) => {
    setGameState((prev) => ({
      ...prev,
      gold: prev.gold + 500,
      soulShards: prev.soulShards + 5,
      feedbackList: [submission, ...(prev.feedbackList || [])],
    }));
  };

  const handleSaveUsername = (name: string) => {
    registerNewUsername(name);
    setGameState((prev) => ({
      ...prev,
      username: name,
      hasChosenName: true,
    }));
    setIsNamePromptOpen(false);
  };

  const handleAdminGiveCurrency = (gold: number, souls: number) => {
    setGameState((prev) => ({
      ...prev,
      gold: prev.gold + gold,
      soulShards: prev.soulShards + souls,
    }));
  };

  const handleAdminEquipBestSword = () => {
    const best = WEAPONS[WEAPONS.length - 1];
    setGameState((prev) => ({
      ...prev,
      unlockedWeaponIds: Array.from(new Set([...prev.unlockedWeaponIds, best.id])),
      selectedWeaponId: best.id,
    }));
  };

  const handleAdminUnlockAllSwords = () => {
    setGameState((prev) => ({
      ...prev,
      unlockedWeaponIds: WEAPONS.map((w) => w.id),
    }));
  };

  const handleAdminUnlockAllCharacters = () => {
    setGameState((prev) => ({
      ...prev,
      unlockedCharacterIds: CHARACTERS.map((c) => c.id),
    }));
  };

  const handleAdminMaxUpgrades = () => {
    setGameState((prev) => ({
      ...prev,
      upgrades: {
        damageLevel: 25,
        attackSpeedLevel: 25,
        maxHpLevel: 25,
        armorLevel: 18,
        moveSpeedLevel: 25,
        goldGainLevel: 25,
        critChanceLevel: 25,
        lifeStealLevel: 25,
        totemCapacityLevel: 10,
      },
    }));
  };

  const handleAdminSelectMap = (mapId: number) => {
    setGameState((prev) => ({
      ...prev,
      currentMapId: mapId,
      highestMapReached: Math.max(prev.highestMapReached, mapId),
    }));
  };

  const handleAdminAddRebirths = (count: number) => {
    setGameState((prev) => ({
      ...prev,
      rebirths: {
        ...prev.rebirths,
        count: prev.rebirths.count + count,
        damageMultiplier: +(prev.rebirths.damageMultiplier + count * 0.5).toFixed(1),
      },
    }));
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  const handleVictory = (stats: { kills: number; goldEarned: number; bossSlain: boolean; score: number }) => {
    setLastRunStats(stats);
    setCurrentScreen('victory');
    setGameState((prev) => {
      const nextMap = Math.min(13, prev.currentMapId + 1);
      return {
        ...prev,
        gold: prev.gold + stats.goldEarned,
        totalBossesSlain: prev.totalBossesSlain + 1,
        totalEnemiesSlain: prev.totalEnemiesSlain + stats.kills,
        highestMapReached: Math.max(prev.highestMapReached, nextMap),
      };
    });
  };

  const handleGameOver = (stats: { kills: number; goldEarned: number; bossSlain: boolean; score: number }) => {
    setLastRunStats(stats);
    setCurrentScreen('gameover');
    setGameState((prev) => ({
      ...prev,
      gold: prev.gold + stats.goldEarned,
      totalEnemiesSlain: prev.totalEnemiesSlain + stats.kills,
    }));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-slate-100 select-none">
      {/* Active 2D Combat Arena */}
      {currentScreen === 'playing' && (
        <GameCanvas
          map={currentMap}
          character={currentCharacter}
          weapon={currentWeapon}
          upgrades={gameState.upgrades}
          rebirths={gameState.rebirths}
          adminCheats={adminCheats}
          onVictory={handleVictory}
          onGameOver={handleGameOver}
          onGoldGained={(amt) => setGameState((prev) => ({ ...prev, gold: prev.gold + amt }))}
          onPause={() => setCurrentScreen('paused')}
        />
      )}

      {/* Clean, Simple, Cinematic Title Screen */}
      {currentScreen === 'title' && (
        <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/25 via-zinc-950 to-black overflow-y-auto">
          {/* Top Header: Simple & Clean */}
          <header className="flex items-center justify-between w-full max-w-5xl mx-auto z-10">
            {/* Identity Chip */}
            <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border border-white/20"
                style={{ backgroundColor: currentCharacter.armorColor }}
              >
                🛡️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-100">
                    {gameState.username || 'Warrior'}
                  </span>
                  <button
                    onClick={() => setIsNamePromptOpen(true)}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    ✏️
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {currentCharacter.name} · {currentWeapon.name}
                </span>
              </div>
            </div>

            {/* Money Counters & Sound */}
            <div className="flex items-center gap-3">
              <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-2">
                <span className="text-sm">🪙</span>
                <span className="text-xs font-bold text-amber-300 font-mono tabular-nums">
                  {gameState.gold.toLocaleString()}
                </span>
              </div>

              <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-2">
                <span className="text-sm">💎</span>
                <span className="text-xs font-bold text-cyan-300 font-mono tabular-nums">
                  {gameState.soulShards.toLocaleString()}
                </span>
              </div>

              <button
                onClick={toggleMute}
                className="w-10 h-10 glass-panel rounded-2xl flex items-center justify-center text-slate-300 hover:text-white cursor-pointer transition-transform active:scale-95"
                title="Mute / Unmute"
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
            </div>
          </header>

          {/* Central Title Lockup & Start CTA */}
          <main className="flex flex-col items-center justify-center text-center my-auto py-8 z-10 max-w-xl mx-auto">
            {/* Emblem */}
            <div className="w-16 h-16 rounded-3xl glass-panel flex items-center justify-center mb-5 glow-emerald animate-pulseGlow">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2 glow-text-emerald">
              MYSTIC FOREST
            </h1>
            <p className="text-xs sm:text-sm text-emerald-400/90 font-medium tracking-wide mb-6">
              Ancient Hack &amp; Slash Tower Defense
            </p>

            {/* Clean Realm Selector Pill */}
            <div className="glass-panel px-5 py-2.5 rounded-2xl flex items-center gap-4 mb-7">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                  Current Realm
                </span>
                <span className="text-xs font-bold text-slate-100">
                  #{currentMap.id} {currentMap.name}
                </span>
              </div>

              <select
                value={gameState.currentMapId}
                onChange={(e) => setGameState((prev) => ({ ...prev, currentMapId: Number(e.target.value) }))}
                className="bg-zinc-900 border border-zinc-700 text-emerald-300 text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer"
              >
                {MAPS.map((m) => (
                  <option
                    key={m.id}
                    value={m.id}
                    disabled={m.id > gameState.highestMapReached}
                  >
                    Realm #{m.id}: {m.name} {m.id > gameState.highestMapReached ? '🔒' : '✓'}
                  </option>
                ))}
              </select>
            </div>

            {/* Main Primary Start Button */}
            <button
              onClick={startGame}
              data-start="true"
              className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm sm:text-base rounded-2xl uppercase tracking-wider glow-emerald transition-all transform hover:scale-105 active:scale-95 cursor-pointer shadow-xl"
            >
              SURVIVE THE HORDE [START]
            </button>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2 text-[11px] text-slate-400 font-mono">
              <span>Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-slate-300">SPACE</kbd> to Attack (Auto-Aim)</span>
              <span>·</span>
              <button
                onClick={() => {
                  setIsLeaveGameOpen(true);
                  setHasLeftGame(false);
                }}
                className="hover:text-red-400 underline cursor-pointer transition-colors"
              >
                Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-slate-300">ESC</kbd> to Leave Game
              </button>
            </div>
          </main>

          {/* Bottom Dock Navigation: Simple, Clean & Modern */}
          <footer className="w-full max-w-4xl mx-auto z-10 flex flex-col items-center gap-3">
            <nav className="glass-panel p-1.5 rounded-2xl flex items-center gap-1.5 flex-wrap justify-center">
              <button
                onClick={() => setIsArmoryOpen(true)}
                className="px-3.5 py-2 hover:bg-white/5 rounded-xl text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>🗡️</span>
                <span>Armory (35)</span>
              </button>

              <button
                onClick={() => setIsCharactersOpen(true)}
                className="px-3.5 py-2 hover:bg-white/5 rounded-xl text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>🧙</span>
                <span>Heroes</span>
              </button>

              <button
                onClick={() => setIsUpgradesOpen(true)}
                className="px-3.5 py-2 hover:bg-white/5 rounded-xl text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>📈</span>
                <span>Upgrades</span>
              </button>

              <button
                onClick={() => setIsRebirthOpen(true)}
                className="px-3.5 py-2 hover:bg-white/5 rounded-xl text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>🔮</span>
                <span>Rebirth ({gameState.rebirths.damageMultiplier}x)</span>
              </button>

              <button
                onClick={() => setIsFriendsOpen(true)}
                className="px-3.5 py-2 hover:bg-white/5 rounded-xl text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>👥</span>
                <span>Party</span>
              </button>

              <button
                onClick={() => setIsLeaderboardOpen(true)}
                className="px-3.5 py-2 hover:bg-white/5 rounded-xl text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>🏆</span>
                <span>Ranks</span>
              </button>

              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="px-3.5 py-2 hover:bg-white/5 rounded-xl text-xs font-semibold text-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>💬</span>
                <span>Feedback (+500🪙)</span>
              </button>
            </nav>

            {/* Discreet Admin Shortcut */}
            <button
              onClick={() => {
                sound.playAdminCheats();
                setIsAdminOpen(true);
              }}
              className="text-[10px] text-zinc-600 hover:text-emerald-400 font-mono transition-colors cursor-pointer"
              title="Secret Admin Panel (Shortcut: 1234z)"
            >
              [1234z Secret Admin Console]
            </button>
          </footer>
        </div>
      )}

      {/* Pause Modal */}
      {currentScreen === 'paused' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 select-none">
          <div className="glass-panel p-6 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl animate-fadeIn">
            <h3 className="text-base font-bold text-slate-100 tracking-wider">
              GAME PAUSED
            </h3>
            <p className="text-xs text-slate-400">Combat is frozen in time.</p>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setCurrentScreen('playing')}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl cursor-pointer transition-all"
              >
                RESUME
              </button>
              <button
                onClick={() => setCurrentScreen('title')}
                className="w-full py-2.5 glass-panel-subtle hover:bg-zinc-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-all"
              >
                RETURN TO SANCTUARY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory Modal */}
      {currentScreen === 'victory' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
          <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl border-emerald-500/40 animate-fadeIn">
            <span className="text-4xl block">👑</span>
            <h3 className="text-xl font-black text-emerald-400 tracking-wider">
              REALM {currentMap.id} CONQUERED!
            </h3>
            <p className="text-xs text-slate-300">
              The ancient boss <strong className="text-amber-400">{currentMap.boss.name}</strong> has been defeated.
            </p>

            <div className="grid grid-cols-2 gap-3 glass-panel-subtle p-3.5 rounded-2xl text-left text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block font-mono">FIENDS SLAIN</span>
                <span className="font-bold text-slate-100">{lastRunStats.kills}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-mono">GOLD EARNED</span>
                <span className="font-bold text-amber-300">+{lastRunStats.goldEarned} 🪙</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-white/5">
                <span className="text-slate-400 text-[10px] block font-mono">TOTAL SCORE</span>
                <span className="font-bold text-slate-100">{lastRunStats.score.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {currentMap.id < 13 ? (
                <button
                  onClick={() => {
                    setGameState((prev) => ({
                      ...prev,
                      currentMapId: prev.currentMapId + 1,
                    }));
                    setCurrentScreen('playing');
                  }}
                  data-start="true"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl uppercase tracking-wider glow-emerald transition-all cursor-pointer"
                >
                  ENTER NEXT REALM (#{currentMap.id + 1}) →
                </button>
              ) : (
                <div className="p-3 bg-amber-500/20 border border-amber-500 rounded-xl text-amber-300 text-xs font-bold">
                  🌟 ALL 13 REALMS CONQUERED! YOU ARE THE WORLD-CHAMPION!
                </div>
              )}

              <button
                onClick={() => setCurrentScreen('title')}
                className="w-full py-2.5 glass-panel-subtle hover:bg-zinc-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                RETURN TO SANCTUARY &amp; UPGRADE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over / Defeat Modal */}
      {currentScreen === 'gameover' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
          <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl border-red-500/40 animate-fadeIn">
            <span className="text-4xl block">💀</span>
            <h3 className="text-xl font-black text-red-400 tracking-wider">
              SACRED HEART FALLEN
            </h3>
            <p className="text-xs text-slate-400">
              Corrupted forest invaders overwhelmed your defenses.
            </p>

            <div className="grid grid-cols-2 gap-3 glass-panel-subtle p-3 rounded-2xl text-left text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block font-mono">FIENDS SLAIN</span>
                <span className="font-bold text-slate-100">{lastRunStats.kills}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-mono">GOLD SECURED</span>
                <span className="font-bold text-amber-300">+{lastRunStats.goldEarned} 🪙</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setCurrentScreen('playing')}
                data-start="true"
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-lg"
              >
                RETRY REALM #{currentMap.id}
              </button>
              <button
                onClick={() => setCurrentScreen('title')}
                className="w-full py-2.5 glass-panel-subtle hover:bg-zinc-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                RETURN TO SANCTUARY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        adminCheats={adminCheats}
        setAdminCheats={setAdminCheats}
        onGiveCurrency={handleAdminGiveCurrency}
        onEquipBestSword={handleAdminEquipBestSword}
        onUnlockAllSwords={handleAdminUnlockAllSwords}
        onUnlockAllCharacters={handleAdminUnlockAllCharacters}
        onMaxUpgrades={handleAdminMaxUpgrades}
        onSelectMap={handleAdminSelectMap}
        onAddRebirths={handleAdminAddRebirths}
      />

      <ArmoryModal
        isOpen={isArmoryOpen}
        onClose={() => setIsArmoryOpen(false)}
        selectedWeaponId={gameState.selectedWeaponId}
        unlockedWeaponIds={gameState.unlockedWeaponIds}
        gold={gameState.gold}
        onSelectWeapon={handleSelectWeapon}
        onBuyWeapon={handleBuyWeapon}
      />

      <CharactersModal
        isOpen={isCharactersOpen}
        onClose={() => setIsCharactersOpen(false)}
        selectedCharacterId={gameState.selectedCharacterId}
        unlockedCharacterIds={gameState.unlockedCharacterIds}
        gold={gameState.gold}
        onSelectCharacter={handleSelectCharacter}
        onBuyCharacter={handleBuyCharacter}
      />

      <UpgradesModal
        isOpen={isUpgradesOpen}
        onClose={() => setIsUpgradesOpen(false)}
        upgrades={gameState.upgrades}
        gold={gameState.gold}
        onUpgrade={handleUpgrade}
      />

      <RebirthModal
        isOpen={isRebirthOpen}
        onClose={() => setIsRebirthOpen(false)}
        rebirths={gameState.rebirths}
        gold={gameState.gold}
        onPerformRebirth={handleRebirth}
      />

      <FriendsModal
        isOpen={isFriendsOpen}
        onClose={() => setIsFriendsOpen(false)}
        currentUsername={gameState.username}
        partyMembers={gameState.partyMembers || []}
        onAddPartyMember={handleAddPartyMember}
        onRemovePartyMember={handleRemovePartyMember}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        entries={getLeaderboard({
          id: 'user_score',
          name: gameState.username || 'Warrior',
          characterName: currentCharacter.name,
          weaponName: currentWeapon.name,
          highestMap: gameState.highestMapReached,
          bossesSlain: gameState.totalBossesSlain,
          score: (gameState.totalEnemiesSlain * 10) + (gameState.totalBossesSlain * 2500),
          rebirths: gameState.rebirths.count,
          timestamp: Date.now(),
        })}
        currentUsername={gameState.username}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        authorName={gameState.username}
        onSubmitFeedback={handleSubmitFeedback}
      />

      <UsernamePromptModal
        isOpen={isNamePromptOpen}
        currentUsername={gameState.username}
        onSaveUsername={handleSaveUsername}
        canCancel={!!gameState.username}
        onClose={() => setIsNamePromptOpen(false)}
      />

      {/* Floating 5-Minute Auto-Save Notification */}
      {autoSaveNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-fadeIn">
          <div className="glass-panel px-4 py-1.5 rounded-full border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold shadow-2xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{autoSaveNotification}</span>
          </div>
        </div>
      )}

      {/* LEAVE GAME & AUTO-SAVE MODAL (Triggered by ESC in Main Menu) */}
      {isLeaveGameOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border-white/10 flex flex-col space-y-4">
            {!hasLeftGame ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-xl">
                    🚪
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-wide">Leave Game?</h3>
                    <p className="text-xs text-slate-400">Exit the mystic forest sanctuary.</p>
                  </div>
                </div>

                <div className="bg-zinc-900/60 p-3.5 rounded-2xl border border-white/5 space-y-2 text-xs text-slate-300">
                  <p>
                    When you click <strong className="text-white">Leave Game</strong>, all your current progress is{' '}
                    <strong className="text-emerald-400">immediately auto-saved</strong> to persistent storage.
                  </p>
                  <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4 font-mono">
                    <li>Gold &amp; Soul Shards preserved</li>
                    <li>All 35 swords &amp; equipped weapons saved</li>
                    <li>Upgrades, rebirths, and realm checkpoints safe</li>
                  </ul>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setIsLeaveGameOpen(false)}
                    className="px-4 py-2 glass-panel-subtle hover:bg-zinc-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
                  >
                    Stay in Sanctuary
                  </button>
                  <button
                    onClick={() => {
                      saveGameState(gameState);
                      sound.playPowerUp();
                      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                      setLeaveGameSavedTime(timeStr);
                      setHasLeftGame(true);
                    }}
                    className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all"
                  >
                    LEAVE GAME
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl">
                    💾
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-300 tracking-wide">
                      Game Auto-Saved Successfully!
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">Archived at {leaveGameSavedTime}</p>
                  </div>
                </div>

                <div className="bg-emerald-950/20 p-4 rounded-2xl border border-emerald-500/20 text-xs text-slate-300 space-y-1.5">
                  <p className="font-semibold text-emerald-200">
                    Your session is safely stored in local memory.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    You may safely close this browser window now, or resume your defense whenever you are ready.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setIsLeaveGameOpen(false);
                      setHasLeftGame(false);
                    }}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all uppercase tracking-wider"
                  >
                    Resume Adventure
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
