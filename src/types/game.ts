export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'divine';

export type WeaponPowerType = 
  | 'cleave'
  | 'projectile'
  | 'burst'
  | 'freeze'
  | 'burn'
  | 'shock'
  | 'chain'
  | 'vampiric'
  | 'blackhole'
  | 'spectral'
  | 'poison'
  | 'holy'
  | 'quake'
  | 'meteor'
  | 'execute'
  | 'wind_blade'
  | 'thorn_burst';

export interface Weapon {
  id: string;
  name: string;
  title: string;
  description: string;
  powerName: string;
  powerDescription: string;
  powerType: WeaponPowerType;
  damage: number;
  attackSpeed: number; // attacks per second
  reach: number; // reach in pixels
  arc: number; // swing angle in radians
  vfxColor: string; // primary swing arc color
  secondaryColor: string; // trail/particle glow color
  soundType: string; // audio synth key
  rarity: Rarity;
  cost: number;
  specialProcChance: number; // 0 to 1
  knockback: number;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  description: string;
  cost: number;
  spriteColor: string;
  hairColor: string;
  armorColor: string;
  accentColor: string;
  baseHp: number;
  baseSpeed: number;
  baseDamageMult: number;
  abilityName: string;
  abilityDesc: string;
  abilityCooldown: number; // seconds
  abilityType: 'whirlwind' | 'barrier' | 'shadow_strike' | 'solar_beam' | 'blizzard' | 'berserk_rage';
}

export type EnemyBehavior = 'chase_player' | 'swarm_tower' | 'charger' | 'ranged_spitter' | 'orbit_flank';

export interface EnemyVariant {
  id: string;
  name: string;
  typeTitle: string;
  baseHp: number;
  speed: number;
  damage: number;
  color: string;
  accentColor: string;
  radius: number;
  behavior: EnemyBehavior;
  exp: number;
  gold: number;
  shape: 'beast' | 'crawler' | 'wisp' | 'golem' | 'spitter' | 'specter';
}

export interface BossDef {
  name: string;
  title: string;
  baseHp: number;
  speed: number;
  damage: number;
  color: string;
  glowColor: string;
  radius: number;
  abilities: string[];
  exp: number;
  gold: number;
  dialogue: string;
}

export interface MapDef {
  id: number; // 1 to 13
  name: string;
  theme: string;
  description: string;
  bgColor: string;
  tileColor: string;
  accentColor: string;
  ambientParticleColor: string;
  targetKillsForBoss: number;
  enemyVariants: EnemyVariant[]; // exactly 4
  boss: BossDef; // exactly 1
}

export interface PlayerUpgrades {
  damageLevel: number;
  attackSpeedLevel: number;
  maxHpLevel: number;
  armorLevel: number;
  moveSpeedLevel: number;
  goldGainLevel: number;
  critChanceLevel: number;
  lifeStealLevel: number;
  totemCapacityLevel: number;
}

export interface RebirthData {
  count: number;
  soulShards: number;
  damageMultiplier: number;
  expMultiplier: number;
  goldMultiplier: number;
}

export interface PowerUpItem {
  id: string;
  x: number;
  y: number;
  type: 'heal' | 'frenzy' | 'magnet' | 'nuke' | 'freeze' | 'shield' | 'double_gold' | 'meteor';
  duration: number; // in seconds
  radius: number;
  color: string;
  label: string;
  life: number; // despawn timer
}

export interface BarricadeTotem {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  type: 'wooden' | 'runic' | 'crystal';
  attackTimer: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  color: string;
  radius: number;
  isHostile: boolean;
  pierce: number;
  life: number;
  trailColor?: string;
  homing?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  decay: number;
  shape?: 'circle' | 'square' | 'spark' | 'leaf';
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  scale: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  characterName: string;
  weaponName: string;
  highestMap: number;
  bossesSlain: number;
  score: number;
  rebirths: number;
  timestamp: number;
}

export interface AdminCheats {
  godmode: boolean;
  dmg100x: boolean;
  speed5x: boolean;
  unlockedAllSwords: boolean;
  infiniteShield: boolean;
  noCooldowns: boolean;
  // 10 New Commands
  timeStop: boolean;
  colossalBlade: boolean;
  rapidFire: boolean;
  ghostMode: boolean;
  hyperVacuum: boolean;
  nukeScreenTrigger: number;
  instantBossTrigger: number;
  spawnTreasureSwarmTrigger: number;
  comboMaxTrigger: number;
  ascendRebirthsTrigger: number;
}

