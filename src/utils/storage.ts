import { Character, LeaderboardEntry, PlayerUpgrades, RebirthData, Weapon } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { WEAPONS } from '../data/weapons';

export interface GameState {
  username: string;
  hasChosenName: boolean;
  gold: number;
  soulShards: number;
  selectedCharacterId: string;
  selectedWeaponId: string;
  unlockedCharacterIds: string[];
  unlockedWeaponIds: string[];
  currentMapId: number;
  highestMapReached: number;
  totalBossesSlain: number;
  totalEnemiesSlain: number;
  upgrades: PlayerUpgrades;
  rebirths: RebirthData;
  partyMembers: FriendProfile[];
  feedbackList: FeedbackSubmission[];
}

export interface FriendProfile {
  name: string;
  level: number;
  characterTitle: string;
  weaponName: string;
  highestMap: number;
  isOnline: boolean;
  avatarColor: string;
}

export interface FeedbackSubmission {
  id: string;
  author: string;
  rating: number; // 1 to 5
  category: 'gameplay' | 'weapons' | 'enemies' | 'bosses' | 'bug' | 'feature';
  message: string;
  timestamp: number;
}

const STORAGE_KEY = 'mystic_forest_save_v1';
const USERNAMES_KEY = 'mystic_forest_registered_users';

export const SEEDED_USERNAMES = [
  'ForestKnight',
  'ShadowWalker',
  'DragonSlayer',
  'MoonBlade',
  'OakWarden',
  'EldritchSeeker',
  'SolarDruid',
  'CrimsonReaper',
  'GlacialFang',
  'ValkyrieQueen',
  'ChaosMage',
  'PrimordialGod',
  'SylvanusBane',
  'ThornWeaver',
  'AncientRoot',
  'BladeMaster_X',
  'GhostWhisperer',
  'TitanCrusher',
];

export const INITIAL_UPGRADES: PlayerUpgrades = {
  damageLevel: 0,
  attackSpeedLevel: 0,
  maxHpLevel: 0,
  armorLevel: 0,
  moveSpeedLevel: 0,
  goldGainLevel: 0,
  critChanceLevel: 0,
  lifeStealLevel: 0,
  totemCapacityLevel: 0,
};

export const INITIAL_STATE: GameState = {
  username: '',
  hasChosenName: false,
  gold: 0,
  soulShards: 0,
  selectedCharacterId: 'blade_dancer',
  selectedWeaponId: 'verdant_slicer',
  unlockedCharacterIds: ['blade_dancer'],
  unlockedWeaponIds: ['verdant_slicer'],
  currentMapId: 1,
  highestMapReached: 1,
  totalBossesSlain: 0,
  totalEnemiesSlain: 0,
  upgrades: INITIAL_UPGRADES,
  rebirths: {
    count: 0,
    soulShards: 0,
    damageMultiplier: 1.0,
    expMultiplier: 1.0,
    goldMultiplier: 1.0,
  },
  partyMembers: [],
  feedbackList: [],
};

export function loadGameState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...INITIAL_STATE };
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_STATE,
      ...parsed,
      upgrades: { ...INITIAL_UPGRADES, ...(parsed.upgrades || {}) },
      rebirths: { ...INITIAL_STATE.rebirths, ...(parsed.rebirths || {}) },
    };
  } catch {
    return { ...INITIAL_STATE };
  }
}

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save game state', e);
  }
}

export function getRegisteredUsernames(): string[] {
  try {
    const raw = localStorage.getItem(USERNAMES_KEY);
    if (!raw) {
      localStorage.setItem(USERNAMES_KEY, JSON.stringify(SEEDED_USERNAMES));
      return [...SEEDED_USERNAMES];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...SEEDED_USERNAMES];
  } catch {
    return [...SEEDED_USERNAMES];
  }
}

export function registerNewUsername(name: string): void {
  const current = getRegisteredUsernames();
  if (!current.some((n) => n.toLowerCase() === name.toLowerCase())) {
    current.push(name);
    try {
      localStorage.setItem(USERNAMES_KEY, JSON.stringify(current));
    } catch {}
  }
}

// Global simulated leaderboard
export const SEEDED_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lead_1',
    name: 'PrimordialGod',
    characterName: 'Gorath',
    weaponName: 'The World-Ender',
    highestMap: 13,
    bossesSlain: 42,
    score: 850000,
    rebirths: 8,
    timestamp: Date.now() - 3600000 * 5,
  },
  {
    id: 'lead_2',
    name: 'ValkyrieQueen',
    characterName: 'Solaria',
    weaponName: 'Omni-Blade of the Ancients',
    highestMap: 13,
    bossesSlain: 31,
    score: 640000,
    rebirths: 5,
    timestamp: Date.now() - 3600000 * 12,
  },
  {
    id: 'lead_3',
    name: 'ShadowWalker',
    characterName: 'Nyx',
    weaponName: 'Singularity Edge',
    highestMap: 12,
    bossesSlain: 24,
    score: 490000,
    rebirths: 3,
    timestamp: Date.now() - 3600000 * 24,
  },
  {
    id: 'lead_4',
    name: 'DragonSlayer',
    characterName: 'Gorath',
    weaponName: 'Dragonheart Glaive',
    highestMap: 11,
    bossesSlain: 19,
    score: 360000,
    rebirths: 2,
    timestamp: Date.now() - 3600000 * 48,
  },
  {
    id: 'lead_5',
    name: 'ForestKnight',
    characterName: 'Kaelen',
    weaponName: 'Rune-Carved Zweihander',
    highestMap: 9,
    bossesSlain: 14,
    score: 220000,
    rebirths: 1,
    timestamp: Date.now() - 3600000 * 72,
  },
  {
    id: 'lead_6',
    name: 'GlacialFang',
    characterName: 'Lyra',
    weaponName: 'Glacial Fang',
    highestMap: 7,
    bossesSlain: 9,
    score: 145000,
    rebirths: 1,
    timestamp: Date.now() - 3600000 * 96,
  },
];

export function getLeaderboard(currentUserScore?: LeaderboardEntry): LeaderboardEntry[] {
  let list = [...SEEDED_LEADERBOARD];
  if (currentUserScore && currentUserScore.name) {
    const existingIdx = list.findIndex((e) => e.name.toLowerCase() === currentUserScore.name.toLowerCase());
    if (existingIdx >= 0) {
      if (currentUserScore.score > list[existingIdx].score) {
        list[existingIdx] = currentUserScore;
      }
    } else {
      list.push(currentUserScore);
    }
  }
  return list.sort((a, b) => b.score - a.score);
}
