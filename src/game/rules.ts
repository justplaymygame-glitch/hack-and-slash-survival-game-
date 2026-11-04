export interface DamageResult {
  damage: number;
  isCrit: boolean;
}

export type ComboTier = 'NONE' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';

export interface ComboStats {
  tier: ComboTier;
  label: string;
  damageBonus: number; // e.g. 0.1 for +10%
  goldBonus: number;   // e.g. 0.2 for +20%
  speedBonus: number;  // e.g. 0.1 for +10%
  color: string;
  minHits: number;
  nextTierHits: number;
}

export function getComboStats(hits: number): ComboStats {
  if (hits >= 200) {
    return {
      tier: 'SSS',
      label: 'PRIMORDIAL OVERLORD',
      damageBonus: 2.0, // +200% damage
      goldBonus: 1.5,   // +150% gold
      speedBonus: 0.35,
      color: '#ec4899', // radiant pink
      minHits: 200,
      nextTierHits: 200,
    };
  } else if (hits >= 120) {
    return {
      tier: 'SS',
      label: 'GOD OF THE GLADE',
      damageBonus: 1.5, // +150% damage
      goldBonus: 1.0,   // +100% gold
      speedBonus: 0.25,
      color: '#f59e0b', // amber gold
      minHits: 120,
      nextTierHits: 200,
    };
  } else if (hits >= 80) {
    return {
      tier: 'S',
      label: 'UNSTOPPABLE',
      damageBonus: 1.0, // +100% damage
      goldBonus: 0.75,
      speedBonus: 0.20,
      color: '#ef4444', // crimson
      minHits: 80,
      nextTierHits: 120,
    };
  } else if (hits >= 50) {
    return {
      tier: 'A',
      label: 'DEVASTATING',
      damageBonus: 0.7, // +70% damage
      goldBonus: 0.5,
      speedBonus: 0.15,
      color: '#a855f7', // purple
      minHits: 50,
      nextTierHits: 80,
    };
  } else if (hits >= 30) {
    return {
      tier: 'B',
      label: 'RELENTLESS',
      damageBonus: 0.45, // +45% damage
      goldBonus: 0.35,
      speedBonus: 0.10,
      color: '#3b82f6', // blue
      minHits: 30,
      nextTierHits: 50,
    };
  } else if (hits >= 15) {
    return {
      tier: 'C',
      label: 'SAVAGE',
      damageBonus: 0.25, // +25% damage
      goldBonus: 0.2,
      speedBonus: 0.05,
      color: '#10b981', // emerald
      minHits: 15,
      nextTierHits: 30,
    };
  } else if (hits >= 5) {
    return {
      tier: 'D',
      label: 'BRISK',
      damageBonus: 0.1, // +10% damage
      goldBonus: 0.1,
      speedBonus: 0.0,
      color: '#06b6d4', // cyan
      minHits: 5,
      nextTierHits: 15,
    };
  }
  return {
    tier: 'NONE',
    label: '',
    damageBonus: 0,
    goldBonus: 0,
    speedBonus: 0,
    color: '#94a3b8',
    minHits: 0,
    nextTierHits: 5,
  };
}

export function calculatePlayerDamage(
  weaponDamage: number,
  damageLevel: number,
  characterMult: number,
  rebirthMult: number,
  critChance: number,
  admin100x: boolean = false,
  comboMultiplier: number = 1.0
): DamageResult {
  // Base upgrade gives +15% damage per level
  const upgradeMult = 1 + (damageLevel * 0.15);
  const totalMult = characterMult * rebirthMult * upgradeMult * comboMultiplier;
  let finalDamage = weaponDamage * totalMult;

  // Crit roll
  const isCrit = Math.random() < Math.min(critChance, 0.9);
  if (isCrit) {
    finalDamage *= 2.0;
  }

  if (admin100x) {
    finalDamage *= 100;
  }

  return {
    damage: Math.round(finalDamage),
    isCrit,
  };
}

export function calculatePlayerMaxHp(baseHp: number, maxHpLevel: number): number {
  return Math.round(baseHp + (maxHpLevel * 30));
}

export function calculatePlayerArmor(armorLevel: number): number {
  // Reduces damage taken by 4% per level, capped at 75%
  return Math.min(0.75, armorLevel * 0.04);
}

export function calculateUpgradeCost(level: number, baseCost: number): number {
  return Math.round(baseCost * Math.pow(1.4, level));
}

export function calculateEnemyScaledStats(
  mapId: number,
  baseHp: number,
  baseDamage: number,
  baseSpeed: number
) {
  // Scale with map index
  const mapScaling = 1 + ((mapId - 1) * 0.12);
  return {
    hp: Math.round(baseHp * mapScaling),
    damage: Math.round(baseDamage * mapScaling),
    speed: +(baseSpeed * Math.min(1 + ((mapId - 1) * 0.02), 1.6)).toFixed(2),
  };
}

export function checkBossSpawnCondition(killsInMap: number, targetKills: number): boolean {
  return killsInMap >= targetKills;
}

export function checkMapVictory(bossDefeated: boolean, currentMapId: number): {
  canAdvance: boolean;
  nextMapId: number;
  isAllGameCleared: boolean;
} {
  if (!bossDefeated) {
    return { canAdvance: false, nextMapId: currentMapId, isAllGameCleared: false };
  }

  if (currentMapId >= 13) {
    return { canAdvance: true, nextMapId: 13, isAllGameCleared: true };
  }

  return {
    canAdvance: true,
    nextMapId: currentMapId + 1,
    isAllGameCleared: false,
  };
}

export function calculateRebirthRequirements(currentRebirths: number) {
  const costGold = Math.round(5000 * Math.pow(2.2, currentRebirths));
  const rewardSoulShards = Math.round(10 + (currentRebirths * 15));
  const newDamageMultiplier = +(1 + ((currentRebirths + 1) * 0.5)).toFixed(1);
  return {
    costGold,
    rewardSoulShards,
    newDamageMultiplier,
  };
}

export function validateUsername(name: string, existingNames: string[]): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, error: 'Name cannot be empty.' };
  }
  if (trimmed.length < 3) {
    return { valid: false, error: 'Name must be at least 3 characters long.' };
  }
  if (trimmed.length > 16) {
    return { valid: false, error: 'Name cannot exceed 16 characters.' };
  }
  const regex = /^[a-zA-Z0-9_-]+$/;
  if (!regex.test(trimmed)) {
    return { valid: false, error: 'Name can only contain letters, numbers, hyphens, and underscores.' };
  }
  const isTaken = existingNames.some(
    (existing) => existing.toLowerCase() === trimmed.toLowerCase()
  );
  if (isTaken) {
    return { valid: false, error: `The name "${trimmed}" is already in use by another warrior. Please choose a different one.` };
  }
  return { valid: true };
}
