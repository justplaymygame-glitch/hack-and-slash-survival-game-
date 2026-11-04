import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  AdminCheats,
  BarricadeTotem,
  Character,
  FloatingText,
  MapDef,
  Particle,
  PlayerUpgrades,
  PowerUpItem,
  Projectile,
  RebirthData,
  Weapon,
} from '../types/game';
import { sound } from '../audio/soundEngine';
import { calculatePlayerDamage, calculatePlayerMaxHp, calculatePlayerArmor, getComboStats } from '../game/rules';
import { drawWeaponSprite, SwordPreview } from '../game/weaponVisuals';

interface ActiveEnemy {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  radius: number;
  color: string;
  accentColor: string;
  behavior: string;
  shape: string;
  gold: number;
  exp: number;
  isBoss: boolean;
  bossTitle?: string;
  abilities?: string[];
  attackTimer: number;
  freezeTimer: number;
  burnTimer: number;
  burnDmg: number;
  hitFlashTimer: number;
  walkCycle: number;
  wingAngle?: number;
}

interface Shrine {
  x: number;
  y: number;
  type: 'healing' | 'fury' | 'gold';
  radius: number;
  cooldown: number;
  name: string;
}

interface GameCanvasProps {
  map: MapDef;
  character: Character;
  weapon: Weapon;
  upgrades: PlayerUpgrades;
  rebirths: RebirthData;
  adminCheats: AdminCheats;
  onGameOver: (stats: { kills: number; goldEarned: number; bossSlain: boolean; score: number }) => void;
  onVictory: (stats: { kills: number; goldEarned: number; bossSlain: boolean; score: number }) => void;
  onGoldGained: (amount: number) => void;
  onPause: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  map,
  character,
  weapon,
  upgrades,
  rebirths,
  adminCheats,
  onGameOver,
  onVictory,
  onGoldGained,
  onPause,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High frequency metrics for HUD
  const [hudStats, setHudStats] = useState({
    playerHp: 100,
    playerMaxHp: 100,
    kills: 0,
    killsNeeded: map.targetKillsForBoss,
    bossActive: false,
    bossHp: 0,
    bossMaxHp: 1,
    bossName: '',
    goldRun: 0,
    combo: 0,
    comboTier: 'NONE',
    comboLabel: '',
    comboColor: '#94a3b8',
    comboTimerPercent: 0,
    comboDmgBonus: 0,
    comboGoldBonus: 0,
    abilityReady: true,
    abilityCdRemaining: 0,
  });

  const stateRef = useRef({
    player: {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      hp: 100,
      maxHp: 100,
      speed: 4.2,
      facingAngle: 0,
      isSwinging: false,
      swingProgress: 0,
      swingDirection: 1,
      dashCooldown: 0,
      isDashing: false,
      dashTimer: 0,
      abilityTimer: 0,
      invulnerableTimer: 0,
      frenzyTimer: 0,
      shieldActive: false,
      shieldHp: 0,
      doubleGoldTimer: 0,
      combo: 0,
      comboTimer: 0,
      comboMaxTimer: 2.8,
      comboTier: 'NONE',
      walkBob: 0,
      lastMoveX: 1,
      lastMoveY: 0,
    },
    enemies: [] as ActiveEnemy[],
    projectiles: [] as Projectile[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    powerUps: [] as PowerUpItem[],
    totems: [] as BarricadeTotem[],
    shrines: [] as Shrine[],
    scenery: [] as { x: number; y: number; type: 'tree' | 'mushroom' | 'ancient_stone' | 'rune_pillar'; radius: number; color: string }[],
    input: {
      up: false,
      down: false,
      left: false,
      right: false,
      isAttackHeld: false,
      attackCooldown: 0,
    },
    camera: {
      x: 0,
      y: 0,
      trauma: 0,
    },
    gameStats: {
      kills: 0,
      goldRun: 0,
      score: 0,
      bossSpawned: false,
      bossSlain: false,
      spawnTimer: 0,
      freezeAllTimer: 0,
      screenNukeFlash: 0,
      lastNukeTrigger: 0,
      lastBossTrigger: 0,
      lastTreasureTrigger: 0,
      lastComboTrigger: 0,
    },
    isGameOver: false,
    isVictory: false,
  });

  // Mobile virtual joystick
  const joystickRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    deltaX: number;
    deltaY: number;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
  });

  // Initialize Game World
  useEffect(() => {
    const s = stateRef.current;
    const playerMaxHp = calculatePlayerMaxHp(character.baseHp, upgrades.maxHpLevel);
    const moveSpeed = character.baseSpeed * (1 + upgrades.moveSpeedLevel * 0.08) * (adminCheats.speed5x ? 3.0 : 1.0);

    s.player.hp = playerMaxHp;
    s.player.maxHp = playerMaxHp;
    s.player.speed = moveSpeed;
    s.player.x = 0;
    s.player.y = 0;
    s.enemies = [];
    s.projectiles = [];
    s.particles = [];
    s.floatingTexts = [];
    s.powerUps = [];
    s.totems = [];
    s.gameStats.kills = 0;
    s.gameStats.goldRun = 0;
    s.gameStats.score = 0;
    s.gameStats.bossSpawned = false;
    s.gameStats.bossSlain = false;
    s.isGameOver = false;
    s.isVictory = false;

    // Interactive Shrines on map
    s.shrines = [
      { x: -280, y: -200, type: 'healing', radius: 24, cooldown: 0, name: 'Healing Spring' },
      { x: 280, y: -200, type: 'fury', radius: 24, cooldown: 0, name: 'Altar of Fury' },
      { x: 0, y: 320, type: 'gold', radius: 24, cooldown: 0, name: 'Midas Monolith' },
    ];

    // Procedural Mystic Forest Scenery
    const sceneryItems: typeof s.scenery = [];
    for (let i = 0; i < 55; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 280 + Math.random() * 850;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      const types: ('tree' | 'mushroom' | 'ancient_stone' | 'rune_pillar')[] = [
        'tree', 'tree', 'mushroom', 'ancient_stone', 'rune_pillar',
      ];
      const type = types[Math.floor(Math.random() * types.length)];
      sceneryItems.push({
        x,
        y,
        type,
        radius: type === 'tree' ? 28 : type === 'rune_pillar' ? 18 : 14,
        color: type === 'rune_pillar' ? map.accentColor : map.tileColor,
      });
    }
    s.scenery = sceneryItems;

    sound.startAtmosphericHum();
    return () => {
      sound.stopAtmosphericHum();
    };
  }, [map, character, upgrades, adminCheats]);

  // Dash Trigger
  const triggerDash = useCallback(() => {
    const s = stateRef.current;
    if (s.player.dashCooldown > 0 && !adminCheats.noCooldowns) return;

    sound.playDash();
    s.player.isDashing = true;
    s.player.dashTimer = 0.22;
    s.player.dashCooldown = 0.85;
    s.player.invulnerableTimer = 0.28;

    for (let i = 0; i < 10; i++) {
      s.particles.push({
        x: s.player.x,
        y: s.player.y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: character.accentColor,
        alpha: 1,
        size: 5,
        decay: 0.05,
      });
    }
  }, [character, adminCheats]);

  // Hero Ability Trigger
  const triggerAbility = useCallback(() => {
    const s = stateRef.current;
    if (s.player.abilityTimer > 0 && !adminCheats.noCooldowns) return;

    sound.playPowerUp();
    s.player.abilityTimer = character.abilityCooldown;

    switch (character.abilityType) {
      case 'whirlwind':
        s.player.invulnerableTimer = 3.0;
        s.player.frenzyTimer = 3.0;
        for (let i = 0; i < 24; i++) {
          s.projectiles.push({
            id: 'whirl_' + Math.random(),
            x: s.player.x,
            y: s.player.y,
            vx: Math.cos((i / 24) * Math.PI * 2) * 9,
            vy: Math.sin((i / 24) * Math.PI * 2) * 9,
            damage: weapon.damage * 2.2,
            color: weapon.vfxColor,
            radius: 8,
            isHostile: false,
            pierce: 6,
            life: 1.2,
          });
        }
        break;

      case 'barrier':
        s.player.shieldActive = true;
        s.player.shieldHp = 700;
        s.player.hp = Math.min(s.player.maxHp, s.player.hp + 100);
        break;

      case 'shadow_strike':
        s.enemies.slice(0, 8).forEach((en) => {
          en.hp -= weapon.damage * 4.5;
          en.hitFlashTimer = 0.12;
          s.floatingTexts.push({
            id: 'txt_' + Math.random(),
            x: en.x,
            y: en.y,
            text: `${weapon.damage * 4.5} ⚔️ SHADOW CRIT`,
            color: '#c084fc',
            alpha: 1,
            vy: -2.4,
            scale: 1.4,
          });
        });
        s.camera.trauma = 0.5;
        break;

      case 'solar_beam':
        for (let i = -4; i <= 4; i++) {
          const angle = s.player.facingAngle + (i * 0.12);
          s.projectiles.push({
            id: 'beam_' + Math.random(),
            x: s.player.x,
            y: s.player.y,
            vx: Math.cos(angle) * 15,
            vy: Math.sin(angle) * 15,
            damage: weapon.damage * 3.8,
            color: '#fde047',
            radius: 12,
            isHostile: false,
            pierce: 99,
            life: 1.4,
          });
        }
        break;

      case 'blizzard':
        s.gameStats.freezeAllTimer = 4.5;
        s.enemies.forEach((en) => {
          en.freezeTimer = 4.5;
          en.hp -= weapon.damage * 2.0;
          en.hitFlashTimer = 0.1;
        });
        break;

      case 'berserk_rage':
        s.player.frenzyTimer = 7.0;
        s.player.invulnerableTimer = 2.5;
        break;
    }
  }, [character, weapon, adminCheats]);

  // Defensive Totem
  const placeTotem = useCallback(() => {
    const s = stateRef.current;
    if (s.totems.length >= 3 + upgrades.totemCapacityLevel) return;

    s.totems.push({
      id: 'totem_' + Math.random(),
      x: s.player.x,
      y: s.player.y,
      hp: 400 + upgrades.totemCapacityLevel * 120,
      maxHp: 400 + upgrades.totemCapacityLevel * 120,
      type: 'runic',
      attackTimer: 0,
    });
    sound.playWeaponSwing('earth_quake');
  }, [upgrades]);

  // Auto-Aim Melee Attack Trigger (SPACE or Mouse Click / Button)
  const triggerAttack = useCallback(() => {
    const s = stateRef.current;
    if (s.input.attackCooldown > 0) return;

    // AUTO-AIM SYSTEM: Find nearest enemy
    let closestEnemy: ActiveEnemy | null = null;
    let closestDist = Infinity;

    s.enemies.forEach((en) => {
      const d = Math.hypot(en.x - s.player.x, en.y - s.player.y);
      if (d < closestDist) {
        closestDist = d;
        closestEnemy = en;
      }
    });

    // Auto-aim snap: If there is an enemy, snap facingAngle toward them!
    if (closestEnemy) {
      s.player.facingAngle = Math.atan2((closestEnemy as ActiveEnemy).y - s.player.y, (closestEnemy as ActiveEnemy).x - s.player.x);
    } else {
      // If no enemy nearby, aim in the direction of movement
      if (s.player.lastMoveX !== 0 || s.player.lastMoveY !== 0) {
        s.player.facingAngle = Math.atan2(s.player.lastMoveY, s.player.lastMoveX);
      }
    }

    const atkSpeed = adminCheats.rapidFire
      ? 100
      : weapon.attackSpeed * (s.player.frenzyTimer > 0 ? 2.0 : 1.0);
    s.input.attackCooldown = 1 / atkSpeed;
    s.player.isSwinging = true;
    s.player.swingProgress = 0;
    s.player.swingDirection = -s.player.swingDirection;

    sound.playWeaponSwing(weapon.soundType);

    const aimAngle = s.player.facingAngle;
    const reach = weapon.reach * (adminCheats.colossalBlade ? 6.5 : 1.0);
    const arcHalf = (weapon.arc * (adminCheats.colossalBlade ? 1.6 : 1.0)) / 2;

    s.enemies.forEach((enemy) => {
      const dx = enemy.x - s.player.x;
      const dy = enemy.y - s.player.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= reach + enemy.radius) {
        const enemyAngle = Math.atan2(dy, dx);
        let diff = enemyAngle - aimAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        if (Math.abs(diff) <= arcHalf) {
          const critChance = 0.05 + upgrades.critChanceLevel * 0.04;
          const currentComboStats = getComboStats(s.player.combo);
          const comboMult = 1 + currentComboStats.damageBonus;

          const { damage, isCrit } = calculatePlayerDamage(
            weapon.damage,
            upgrades.damageLevel,
            character.baseDamageMult,
            rebirths.damageMultiplier,
            critChance,
            adminCheats.dmg100x,
            comboMult
          );

          enemy.hp -= damage;
          enemy.hitFlashTimer = 0.08;
          sound.playHit(isCrit);

          // Advanced Combo Progression
          s.player.combo++;
          s.player.comboTimer = 2.8;
          s.player.comboMaxTimer = 2.8;

          const newComboStats = getComboStats(s.player.combo);
          if (newComboStats.tier !== s.player.comboTier && newComboStats.tier !== 'NONE') {
            s.player.comboTier = newComboStats.tier;
            sound.playComboTierUp(newComboStats.tier);
            s.camera.trauma = Math.min(s.camera.trauma + 0.35, 0.8);
            s.floatingTexts.push({
              id: 'combo_tier_' + Math.random(),
              x: s.player.x,
              y: s.player.y - 45,
              text: `★ RANK ${newComboStats.tier}: ${newComboStats.label}!`,
              color: newComboStats.color,
              alpha: 1,
              vy: -2.4,
              scale: 1.6,
            });
          }

          const knockAngle = Math.atan2(dy, dx);
          enemy.x += Math.cos(knockAngle) * weapon.knockback;
          enemy.y += Math.sin(knockAngle) * weapon.knockback;

          s.camera.trauma = Math.min(s.camera.trauma + (isCrit ? 0.3 : 0.15), 0.65);

          s.floatingTexts.push({
            id: 'txt_' + Math.random(),
            x: enemy.x + (Math.random() - 0.5) * 12,
            y: enemy.y - enemy.radius - 4,
            text: isCrit ? `${damage} CRIT!` : `${damage}`,
            color: isCrit ? '#fbbf24' : weapon.vfxColor,
            alpha: 1,
            vy: -2.0,
            scale: isCrit ? 1.3 : 1.0,
          });

          for (let p = 0; p < (isCrit ? 8 : 4); p++) {
            s.particles.push({
              x: enemy.x,
              y: enemy.y,
              vx: Math.cos(knockAngle + (Math.random() - 0.5)) * (4 + Math.random() * 5),
              vy: Math.sin(knockAngle + (Math.random() - 0.5)) * (4 + Math.random() * 5),
              color: isCrit ? '#fef08a' : enemy.accentColor,
              alpha: 1,
              size: 4,
              decay: 0.04,
            });
          }

          if (Math.random() < weapon.specialProcChance) {
            switch (weapon.powerType) {
              case 'freeze':
                enemy.freezeTimer = 1.6;
                break;
              case 'burn':
                enemy.burnTimer = 3.0;
                enemy.burnDmg = Math.round(weapon.damage * 0.45);
                break;
              case 'vampiric':
                s.player.hp = Math.min(s.player.maxHp, s.player.hp + Math.round(damage * 0.15));
                break;
              case 'blackhole':
                s.enemies.forEach((other) => {
                  if (other.id !== enemy.id) {
                    const odx = enemy.x - other.x;
                    const ody = enemy.y - other.y;
                    const odist = Math.hypot(odx, ody);
                    if (odist < 220 && odist > 10) {
                      other.x += (odx / odist) * 28;
                      other.y += (ody / odist) * 28;
                    }
                  }
                });
                break;
              case 'chain':
                s.enemies.slice(0, 4).forEach((target) => {
                  if (target.id !== enemy.id) {
                    target.hp -= Math.round(damage * 0.6);
                    target.hitFlashTimer = 0.06;
                    s.floatingTexts.push({
                      id: 'zap_' + Math.random(),
                      x: target.x,
                      y: target.y,
                      text: `⚡${Math.round(damage * 0.6)}`,
                      color: '#facc15',
                      alpha: 1,
                      vy: -1.8,
                      scale: 0.9,
                    });
                  }
                });
                break;
            }
          }
        }
      }
    });

    if (weapon.powerType === 'projectile' || weapon.powerType === 'wind_blade') {
      s.projectiles.push({
        id: 'proj_' + Math.random(),
        x: s.player.x,
        y: s.player.y,
        vx: Math.cos(aimAngle) * 10,
        vy: Math.sin(aimAngle) * 10,
        damage: Math.round(weapon.damage * 0.85),
        color: weapon.vfxColor,
        radius: 7,
        isHostile: false,
        pierce: 3,
        life: 1.1,
      });
    } else if (weapon.powerType === 'meteor' || weapon.powerType === 'burst') {
      for (let i = 0; i < 4; i++) {
        const rad = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 120;
        s.projectiles.push({
          id: 'burst_' + Math.random(),
          x: s.player.x + Math.cos(rad) * dist,
          y: s.player.y + Math.sin(rad) * dist,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          damage: Math.round(weapon.damage * 0.75),
          color: weapon.secondaryColor,
          radius: 9,
          isHostile: false,
          pierce: 2,
          life: 0.8,
        });
      }
    }
  }, [weapon, upgrades, character, rebirths, adminCheats]);

  // Main 60 FPS Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let hudUpdateCounter = 0;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const key = e.key.toLowerCase();

      if (key === 'w' || key === 'arrowup') s.input.up = true;
      if (key === 's' || key === 'arrowdown') s.input.down = true;
      if (key === 'a' || key === 'arrowleft') s.input.left = true;
      if (key === 'd' || key === 'arrowright') s.input.right = true;

      // SPACE IS ATTACK WITH AUTO-AIM
      if (key === ' ') {
        e.preventDefault();
        s.input.isAttackHeld = true;
        triggerAttack();
      }

      // SHIFT IS DASH
      if (key === 'shift') {
        e.preventDefault();
        triggerDash();
      }

      // E or Q is Hero Ability
      if (key === 'e' || key === 'q') {
        e.preventDefault();
        triggerAbility();
      }

      // T is Defend Totem
      if (key === 't') {
        e.preventDefault();
        placeTotem();
      }

      if (key === 'escape' || key === 'p') {
        onPause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') s.input.up = false;
      if (key === 's' || key === 'arrowdown') s.input.down = false;
      if (key === 'a' || key === 'arrowleft') s.input.left = false;
      if (key === 'd' || key === 'arrowright') s.input.right = false;
      if (key === ' ') {
        s.input.isAttackHeld = false;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        stateRef.current.input.isAttackHeld = true;
        triggerAttack();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        stateRef.current.input.isAttackHeld = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Loop
    const loop = (currentTime: number) => {
      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.min(rawDt, 0.05);

      const s = stateRef.current;

      if (!s.isGameOver && !s.isVictory) {
        // Admin Command Triggers
        if (adminCheats.nukeScreenTrigger && adminCheats.nukeScreenTrigger !== s.gameStats.lastNukeTrigger) {
          s.gameStats.lastNukeTrigger = adminCheats.nukeScreenTrigger;
          s.gameStats.screenNukeFlash = 0.6;
          s.camera.trauma = 1.0;
          s.enemies.forEach((en) => {
            if (!en.isBoss) {
              en.hp = 0;
              s.gameStats.kills++;
              const nukeGold = Math.round(en.gold * 3);
              s.gameStats.goldRun += nukeGold;
              onGoldGained(nukeGold);
            } else {
              en.hp = Math.max(1, en.hp - en.maxHp * 0.5);
              en.hitFlashTimer = 0.5;
            }
          });
          s.floatingTexts.push({
            id: 'nuke_' + Math.random(),
            x: s.player.x,
            y: s.player.y - 60,
            text: '💥 COSMIC ANNIHILATION NUKE!',
            color: '#ffffff',
            alpha: 1,
            vy: -3.0,
            scale: 2.2,
          });
        }

        if (adminCheats.instantBossTrigger && adminCheats.instantBossTrigger !== s.gameStats.lastBossTrigger) {
          s.gameStats.lastBossTrigger = adminCheats.instantBossTrigger;
          s.gameStats.kills = map.targetKillsForBoss;
        }

        if (adminCheats.spawnTreasureSwarmTrigger && adminCheats.spawnTreasureSwarmTrigger !== s.gameStats.lastTreasureTrigger) {
          s.gameStats.lastTreasureTrigger = adminCheats.spawnTreasureSwarmTrigger;
          for (let g = 0; g < 10; g++) {
            const gAngle = (g / 10) * Math.PI * 2;
            s.enemies.push({
              id: 'gold_wisp_' + Math.random(),
              x: s.player.x + Math.cos(gAngle) * 220,
              y: s.player.y + Math.sin(gAngle) * 220,
              hp: 25,
              maxHp: 25,
              speed: 3.5,
              damage: 1,
              radius: 13,
              color: '#fbbf24',
              accentColor: '#fef08a',
              behavior: 'orbit_flank',
              shape: 'wisp',
              gold: 250,
              exp: 80,
              isBoss: false,
              attackTimer: 0,
              freezeTimer: 0,
              burnTimer: 0,
              burnDmg: 0,
              hitFlashTimer: 0,
              walkCycle: 0,
              wingAngle: 0,
            });
          }
          s.floatingTexts.push({
            id: 'swarm_' + Math.random(),
            x: s.player.x,
            y: s.player.y - 50,
            text: '🪙 10 GOLDEN TREASURE WISPS SUMMONED!',
            color: '#fbbf24',
            alpha: 1,
            vy: -2,
            scale: 1.5,
          });
        }

        if (adminCheats.comboMaxTrigger && adminCheats.comboMaxTrigger !== s.gameStats.lastComboTrigger) {
          s.gameStats.lastComboTrigger = adminCheats.comboMaxTrigger;
          s.player.combo = 999;
          s.player.comboTimer = 25;
          s.player.comboMaxTimer = 25;
          s.player.comboTier = 'SSS';
          s.floatingTexts.push({
            id: 'combo_max_' + Math.random(),
            x: s.player.x,
            y: s.player.y - 50,
            text: '🔥 999x SSS PRIMORDIAL COMBO ACTIVATED!',
            color: '#ec4899',
            alpha: 1,
            vy: -2.5,
            scale: 1.8,
          });
        }

        if (s.gameStats.screenNukeFlash > 0) s.gameStats.screenNukeFlash -= dt;

        // Timers
        if (s.input.attackCooldown > 0) s.input.attackCooldown -= dt;
        if (s.player.dashCooldown > 0) s.player.dashCooldown -= dt;
        if (s.player.dashTimer > 0) s.player.dashTimer -= dt;
        else s.player.isDashing = false;
        if (s.player.abilityTimer > 0) s.player.abilityTimer -= dt;
        if (s.player.invulnerableTimer > 0) s.player.invulnerableTimer -= dt;
        if (s.player.frenzyTimer > 0) s.player.frenzyTimer -= dt;
        if (s.player.doubleGoldTimer > 0) s.player.doubleGoldTimer -= dt;
        if (s.gameStats.freezeAllTimer > 0) s.gameStats.freezeAllTimer -= dt;

        if (s.player.comboTimer > 0) {
          s.player.comboTimer -= dt;
          if (s.player.comboTimer <= 0) {
            s.player.combo = 0;
            s.player.comboTier = 'NONE';
          }
        }

        // Space or mouse held auto-swings with auto-aim
        if (s.input.isAttackHeld && s.input.attackCooldown <= 0) {
          triggerAttack();
        }

        if (s.player.isSwinging) {
          s.player.swingProgress += dt * weapon.attackSpeed * (s.player.frenzyTimer > 0 ? 8 : 4.8);
          if (s.player.swingProgress >= 1) {
            s.player.isSwinging = false;
            s.player.swingProgress = 0;
          }
        }

        // Movement with Combo speed bonus and Admin 5x Speed
        let moveX = 0;
        let moveY = 0;
        if (s.input.up) moveY -= 1;
        if (s.input.down) moveY += 1;
        if (s.input.left) moveX -= 1;
        if (s.input.right) moveX += 1;

        if (joystickRef.current.active) {
          moveX = joystickRef.current.deltaX;
          moveY = joystickRef.current.deltaY;
        }

        const moveLen = Math.hypot(moveX, moveY);
        if (moveLen > 0.1) {
          const normX = moveX / moveLen;
          const normY = moveY / moveLen;
          s.player.lastMoveX = normX;
          s.player.lastMoveY = normY;

          const activeComboStats = getComboStats(s.player.combo);
          let currentSpeed = (s.player.isDashing ? s.player.speed * 2.8 : s.player.speed) * (1 + activeComboStats.speedBonus);
          if (adminCheats.speed5x) currentSpeed *= 5;

          s.player.x += normX * currentSpeed * 60 * dt;
          s.player.y += normY * currentSpeed * 60 * dt;
          s.player.walkBob += dt * 10;
        }

        // Shrines interaction
        s.shrines.forEach((shrine) => {
          if (shrine.cooldown > 0) shrine.cooldown -= dt;
          const dist = Math.hypot(s.player.x - shrine.x, s.player.y - shrine.y);
          if (dist < shrine.radius + 18 && shrine.cooldown <= 0) {
            shrine.cooldown = 20.0;
            sound.playPowerUp();
            if (shrine.type === 'healing') {
              s.player.hp = Math.min(s.player.maxHp, s.player.hp + 70);
              s.floatingTexts.push({
                id: 'shrine_' + Math.random(),
                x: shrine.x,
                y: shrine.y - 20,
                text: '🌿 HEALING SPRING ACTIVATED!',
                color: '#34d399',
                alpha: 1,
                vy: -2,
                scale: 1.2,
              });
            } else if (shrine.type === 'fury') {
              s.player.frenzyTimer = 8.0;
              s.floatingTexts.push({
                id: 'shrine_' + Math.random(),
                x: shrine.x,
                y: shrine.y - 20,
                text: '⚡ FURY SURGE! +100% ATTACK SPEED!',
                color: '#fbbf24',
                alpha: 1,
                vy: -2,
                scale: 1.2,
              });
            } else if (shrine.type === 'gold') {
              s.player.doubleGoldTimer = 15.0;
              s.floatingTexts.push({
                id: 'shrine_' + Math.random(),
                x: shrine.x,
                y: shrine.y - 20,
                text: '🪙 2X GOLD BOUNTY ACTIVE!',
                color: '#facc15',
                alpha: 1,
                vy: -2,
                scale: 1.2,
              });
            }
          }
        });

        // Enemy Waves Spawning directly targeting YOU
        s.gameStats.spawnTimer += dt;
        const maxEnemies = 25 + map.id * 3;

        if (s.gameStats.spawnTimer > Math.max(0.5, 1.7 - map.id * 0.08) && s.enemies.length < maxEnemies) {
          s.gameStats.spawnTimer = 0;
          const spawnAngle = Math.random() * Math.PI * 2;
          const spawnDist = 480 + Math.random() * 200;
          const enemyVariant = map.enemyVariants[Math.floor(Math.random() * map.enemyVariants.length)];

          s.enemies.push({
            id: 'en_' + Math.random(),
            x: s.player.x + Math.cos(spawnAngle) * spawnDist,
            y: s.player.y + Math.sin(spawnAngle) * spawnDist,
            hp: enemyVariant.baseHp * (1 + (map.id - 1) * 0.12),
            maxHp: enemyVariant.baseHp * (1 + (map.id - 1) * 0.12),
            speed: enemyVariant.speed,
            damage: enemyVariant.damage,
            radius: enemyVariant.radius,
            color: enemyVariant.color,
            accentColor: enemyVariant.accentColor,
            behavior: enemyVariant.behavior,
            shape: enemyVariant.shape,
            gold: enemyVariant.gold,
            exp: enemyVariant.exp,
            isBoss: false,
            attackTimer: 0,
            freezeTimer: 0,
            burnTimer: 0,
            burnDmg: 0,
            hitFlashTimer: 0,
            walkCycle: Math.random() * 10,
            wingAngle: 0,
          });
        }

        // Boss Spawn Condition
        if (!s.gameStats.bossSpawned && s.gameStats.kills >= map.targetKillsForBoss) {
          s.gameStats.bossSpawned = true;
          sound.playBossRoar();
          s.camera.trauma = 0.8;

          const bossAngle = Math.random() * Math.PI * 2;
          const bossDist = 440;
          s.enemies.push({
            id: 'boss_' + map.id,
            x: s.player.x + Math.cos(bossAngle) * bossDist,
            y: s.player.y + Math.sin(bossAngle) * bossDist,
            hp: map.boss.baseHp,
            maxHp: map.boss.baseHp,
            speed: map.boss.speed,
            damage: map.boss.damage,
            radius: map.boss.radius,
            color: map.boss.color,
            accentColor: map.boss.glowColor,
            behavior: 'chase_player',
            shape: 'golem',
            gold: map.boss.gold,
            exp: map.boss.exp,
            isBoss: true,
            bossTitle: map.boss.title,
            abilities: map.boss.abilities,
            attackTimer: 0,
            freezeTimer: 0,
            burnTimer: 0,
            burnDmg: 0,
            hitFlashTimer: 0,
            walkCycle: 0,
          });

          s.floatingTexts.push({
            id: 'boss_alert',
            x: s.player.x,
            y: s.player.y - 50,
            text: `⚠️ REALM BOSS SUMMONED: ${map.boss.name}!`,
            color: '#ef4444',
            alpha: 1,
            vy: -1.5,
            scale: 1.6,
          });
        }

        // Update Enemies - Horde swarming straight at the player!
        const armorReduction = calculatePlayerArmor(upgrades.armorLevel);

        for (let i = s.enemies.length - 1; i >= 0; i--) {
          const en = s.enemies[i];
          if (en.hitFlashTimer > 0) en.hitFlashTimer -= dt;

          if (adminCheats.timeStop || s.gameStats.freezeAllTimer > 0 || en.freezeTimer > 0) {
            if (en.freezeTimer > 0) en.freezeTimer -= dt;
            continue;
          }
          if (en.burnTimer > 0) {
            en.burnTimer -= dt;
            en.hp -= en.burnDmg * dt;
          }

          en.walkCycle += dt * 6;
          if (en.wingAngle !== undefined) en.wingAngle += dt * 18;

          // Enemies swarm towards YOU
          const angleToPlayer = Math.atan2(s.player.y - en.y, s.player.x - en.x);
          en.x += Math.cos(angleToPlayer) * en.speed * 50 * dt;
          en.y += Math.sin(angleToPlayer) * en.speed * 50 * dt;

          const distToPlayer = Math.hypot(en.x - s.player.x, en.y - s.player.y);

          // Attack player (disabled if godmode or ghostMode)
          if (distToPlayer <= en.radius + 16 && s.player.invulnerableTimer <= 0 && !adminCheats.godmode && !adminCheats.ghostMode) {
            en.attackTimer += dt;
            if (en.attackTimer >= 0.75) {
              en.attackTimer = 0;
              let rawDmg = en.damage * (1 - armorReduction);
              if (s.player.shieldActive) {
                s.player.shieldHp -= rawDmg;
                if (s.player.shieldHp <= 0) s.player.shieldActive = false;
                rawDmg = 0;
              }
              s.player.hp -= Math.round(rawDmg);
              sound.playHit(false);
              s.camera.trauma = Math.min(s.camera.trauma + 0.3, 0.6);
            }
          }

          // Enemy Death
          if (en.hp <= 0) {
            sound.playEnemyKill();
            s.gameStats.kills++;

            const activeCStats = getComboStats(s.player.combo);
            const comboGoldMult = 1 + activeCStats.goldBonus;
            const goldMult = (1 + upgrades.goldGainLevel * 0.15) * (s.player.doubleGoldTimer > 0 ? 2 : 1) * comboGoldMult * rebirths.goldMultiplier;
            const goldGain = Math.round(en.gold * goldMult);
            s.gameStats.goldRun += goldGain;
            s.gameStats.score += Math.round(en.exp * 10);
            onGoldGained(goldGain);

            if (Math.random() < 0.22 || en.isBoss) {
              const types: PowerUpItem['type'][] = ['heal', 'frenzy', 'magnet', 'nuke', 'freeze', 'shield', 'double_gold', 'meteor'];
              const chosen = types[Math.floor(Math.random() * types.length)];
              s.powerUps.push({
                id: 'pup_' + Math.random(),
                x: en.x,
                y: en.y,
                type: chosen,
                duration: 8,
                radius: 14,
                color: chosen === 'heal' ? '#22c55e' : chosen === 'frenzy' ? '#f59e0b' : '#38bdf8',
                label: chosen.toUpperCase(),
                life: 16,
              });
            }

            if (en.isBoss) {
              s.gameStats.bossSlain = true;
              s.isVictory = true;
              sound.playBossDefeat();
              onVictory({
                kills: s.gameStats.kills,
                goldEarned: s.gameStats.goldRun,
                bossSlain: true,
                score: s.gameStats.score + 5000,
              });
            }

            for (let p = 0; p < 14; p++) {
              s.particles.push({
                x: en.x,
                y: en.y,
                vx: (Math.random() - 0.5) * 7,
                vy: (Math.random() - 0.5) * 7,
                color: en.accentColor,
                alpha: 1,
                size: 5,
                decay: 0.03,
              });
            }

            s.enemies.splice(i, 1);
          }
        }

        // Projectiles Update
        for (let i = s.projectiles.length - 1; i >= 0; i--) {
          const proj = s.projectiles[i];
          proj.x += proj.vx;
          proj.y += proj.vy;
          proj.life -= dt;

          s.particles.push({
            x: proj.x,
            y: proj.y,
            vx: 0,
            vy: 0,
            color: proj.color,
            alpha: 0.7,
            size: 3,
            decay: 0.08,
          });

          for (let e = s.enemies.length - 1; e >= 0; e--) {
            const enemy = s.enemies[e];
            const dist = Math.hypot(enemy.x - proj.x, enemy.y - proj.y);
            if (dist <= enemy.radius + proj.radius) {
              enemy.hp -= proj.damage;
              enemy.hitFlashTimer = 0.08;
              proj.pierce--;
              s.floatingTexts.push({
                id: 'txt_' + Math.random(),
                x: enemy.x,
                y: enemy.y,
                text: `${proj.damage}`,
                color: proj.color,
                alpha: 1,
                vy: -1.8,
                scale: 0.9,
              });
              if (proj.pierce <= 0) break;
            }
          }

          if (proj.life <= 0 || proj.pierce <= 0) {
            s.projectiles.splice(i, 1);
          }
        }

        // Power-ups Update
        for (let i = s.powerUps.length - 1; i >= 0; i--) {
          const pup = s.powerUps[i];
          pup.life -= dt;

          if (adminCheats.hyperVacuum) {
            const dx = s.player.x - pup.x;
            const dy = s.player.y - pup.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 1) {
              pup.x += (dx / dist) * 750 * dt;
              pup.y += (dy / dist) * 750 * dt;
            }
          }

          const distToPlayer = Math.hypot(pup.x - s.player.x, pup.y - s.player.y);

          if (distToPlayer <= pup.radius + 20) {
            sound.playPowerUp();
            switch (pup.type) {
              case 'heal':
                s.player.hp = Math.min(s.player.maxHp, s.player.hp + 60);
                break;
              case 'frenzy':
                s.player.frenzyTimer = 7.0;
                break;
              case 'freeze':
                s.enemies.forEach((en) => (en.freezeTimer = 4.0));
                break;
              case 'nuke':
                s.enemies.forEach((en) => {
                  if (!en.isBoss) en.hp = 0;
                  else en.hp -= 500;
                });
                s.camera.trauma = 0.7;
                break;
              case 'shield':
                s.player.shieldActive = true;
                s.player.shieldHp = 500;
                break;
              case 'double_gold':
                s.player.doubleGoldTimer = 12.0;
                break;
              case 'meteor':
                for (let m = 0; m < 8; m++) {
                  s.projectiles.push({
                    id: 'meteor_' + Math.random(),
                    x: s.player.x + (Math.random() - 0.5) * 320,
                    y: s.player.y + (Math.random() - 0.5) * 320,
                    vx: 0,
                    vy: 0,
                    damage: 220,
                    color: '#ea580c',
                    radius: 20,
                    isHostile: false,
                    pierce: 99,
                    life: 0.5,
                  });
                }
                break;
            }
            s.powerUps.splice(i, 1);
            continue;
          }

          if (pup.life <= 0) s.powerUps.splice(i, 1);
        }

        // Defeat condition: Only if YOUR player HP falls to 0!
        if (s.player.hp <= 0 && !s.isGameOver && !adminCheats.godmode) {
          s.isGameOver = true;
          onGameOver({
            kills: s.gameStats.kills,
            goldEarned: s.gameStats.goldRun,
            bossSlain: false,
            score: s.gameStats.score,
          });
        }

        // Particles & Floating Text
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= p.decay;
          if (p.alpha <= 0) s.particles.splice(i, 1);
        }

        for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
          const txt = s.floatingTexts[i];
          txt.y += txt.vy;
          txt.alpha -= 0.02;
          if (txt.alpha <= 0) s.floatingTexts.splice(i, 1);
        }

        s.camera.x += (s.player.x - s.camera.x) * 0.12;
        s.camera.y += (s.player.y - s.camera.y) * 0.12;
        if (s.camera.trauma > 0) {
          s.camera.trauma = Math.max(0, s.camera.trauma - dt * 1.3);
        }
      }

      // ================= 2D PROCEDURAL RENDERING =================
      ctx.save();
      ctx.imageSmoothingEnabled = false;

      ctx.fillStyle = map.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const shakeX = (Math.random() - 0.5) * (s.camera.trauma * s.camera.trauma) * 32;
      const shakeY = (Math.random() - 0.5) * (s.camera.trauma * s.camera.trauma) * 32;
      const offsetX = canvas.width / 2 - s.camera.x + shakeX;
      const offsetY = canvas.height / 2 - s.camera.y + shakeY;
      ctx.translate(offsetX, offsetY);

      // Floor grid
      const tileSize = 64;
      const startX = Math.floor((s.camera.x - canvas.width / 2) / tileSize) * tileSize;
      const endX = Math.ceil((s.camera.x + canvas.width / 2) / tileSize) * tileSize;
      const startY = Math.floor((s.camera.y - canvas.height / 2) / tileSize) * tileSize;
      const endY = Math.ceil((s.camera.y + canvas.height / 2) / tileSize) * tileSize;

      ctx.strokeStyle = map.tileColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = startX; x <= endX; x += tileSize) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
      }
      for (let y = startY; y <= endY; y += tileSize) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }
      ctx.stroke();

      // Scenery
      s.scenery.forEach((sc) => {
        if (sc.type === 'tree') {
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath();
          ctx.arc(sc.x + 4, sc.y + 8, sc.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = sc.color;
          ctx.beginPath();
          ctx.arc(sc.x, sc.y, sc.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(255,255,255,0.06)';
          ctx.beginPath();
          ctx.arc(sc.x - 4, sc.y - 4, sc.radius * 0.7, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#231509';
          ctx.fillRect(sc.x - 4, sc.y - 2, 8, 12);
        } else if (sc.type === 'mushroom') {
          ctx.fillStyle = map.accentColor;
          ctx.beginPath();
          ctx.arc(sc.x, sc.y - 4, sc.radius * 0.8, Math.PI, 0);
          ctx.fill();
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(sc.x - 3, sc.y - 4, 6, 8);
        } else if (sc.type === 'rune_pillar') {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(sc.x - 10, sc.y - 18, 20, 36);
          ctx.strokeStyle = map.accentColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(sc.x - 8, sc.y - 14, 16, 28);
        } else {
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.arc(sc.x, sc.y, sc.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Shrines
      s.shrines.forEach((shrine) => {
        const isReady = shrine.cooldown <= 0;
        ctx.fillStyle = isReady ? (shrine.type === 'healing' ? '#059669' : shrine.type === 'fury' ? '#d97706' : '#eab308') : '#374151';
        ctx.beginPath();
        ctx.arc(shrine.x, shrine.y, shrine.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isReady ? '#ffffff' : '#6b7280';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(shrine.type === 'healing' ? '❤️ WELL' : shrine.type === 'fury' ? '⚡ FURY' : '🪙 MIDAS', shrine.x, shrine.y + 4);
      });

      // Defensive Totems
      s.totems.forEach((totem) => {
        ctx.fillStyle = '#065f46';
        ctx.fillRect(totem.x - 12, totem.y - 12, 24, 24);
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.strokeRect(totem.x - 12, totem.y - 12, 24, 24);
      });

      // Power-Ups
      s.powerUps.forEach((pup) => {
        ctx.fillStyle = pup.color;
        ctx.beginPath();
        ctx.arc(pup.x, pup.y, pup.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(pup.label.substring(0, 4), pup.x, pup.y + 3);
      });

      // ================= DRAW HIGH-DETAIL PROCEDURAL ENEMIES =================
      s.enemies.forEach((en) => {
        ctx.save();
        ctx.translate(en.x, en.y);

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(0, en.radius * 0.7, en.radius * 0.85, en.radius * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        const baseFill = en.hitFlashTimer > 0 ? '#ffffff' : en.freezeTimer > 0 ? '#38bdf8' : en.color;
        const accentFill = en.hitFlashTimer > 0 ? '#ffffff' : en.accentColor;

        // Distinct procedural creature silhouettes:
        if (en.shape === 'wisp') {
          // Gnat / Wisp with fluttering translucent wings and glowing nucleus
          const wingF = Math.sin(en.wingAngle || 0) * 12;
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.beginPath();
          ctx.ellipse(-en.radius * 0.8, -en.radius * 0.6, en.radius * 0.7, Math.abs(wingF) + 2, 0.4, 0, Math.PI * 2);
          ctx.ellipse(en.radius * 0.8, -en.radius * 0.6, en.radius * 0.7, Math.abs(wingF) + 2, -0.4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = baseFill;
          ctx.beginPath();
          ctx.arc(0, 0, en.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = accentFill;
          ctx.beginPath();
          ctx.arc(0, 0, en.radius * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (en.shape === 'crawler') {
          // Insect / Arachnid crawler with animated skittering legs & mandibles
          const legWiggle = Math.sin(en.walkCycle) * 4;
          ctx.strokeStyle = baseFill;
          ctx.lineWidth = 2.5;
          for (let l = -1; l <= 1; l++) {
            // Left legs
            ctx.beginPath();
            ctx.moveTo(-en.radius * 0.6, l * 6);
            ctx.lineTo(-en.radius * 1.3, l * 6 + legWiggle * l);
            ctx.stroke();
            // Right legs
            ctx.beginPath();
            ctx.moveTo(en.radius * 0.6, l * 6);
            ctx.lineTo(en.radius * 1.3, l * 6 - legWiggle * l);
            ctx.stroke();
          }

          ctx.fillStyle = baseFill;
          ctx.beginPath();
          ctx.ellipse(0, 0, en.radius, en.radius * 0.75, 0, 0, Math.PI * 2);
          ctx.fill();

          // Pincers
          ctx.fillStyle = accentFill;
          ctx.beginPath();
          ctx.moveTo(-en.radius * 0.4, -en.radius * 0.7);
          ctx.lineTo(-en.radius * 0.6, -en.radius * 1.2);
          ctx.lineTo(-en.radius * 0.2, -en.radius * 0.8);
          ctx.moveTo(en.radius * 0.4, -en.radius * 0.7);
          ctx.lineTo(en.radius * 0.6, -en.radius * 1.2);
          ctx.lineTo(en.radius * 0.2, -en.radius * 0.8);
          ctx.fill();
        } else if (en.shape === 'beast') {
          // Quadruped beast with arched back, snout and glowing eyes
          const step = Math.sin(en.walkCycle) * 5;
          ctx.fillStyle = baseFill;
          // Paws
          ctx.fillRect(-en.radius * 0.7, en.radius * 0.3 + step, 5, 8);
          ctx.fillRect(en.radius * 0.4, en.radius * 0.3 - step, 5, 8);

          // Body
          ctx.beginPath();
          ctx.ellipse(0, -2, en.radius, en.radius * 0.75, 0, 0, Math.PI * 2);
          ctx.fill();

          // Spiky crest / ears
          ctx.fillStyle = accentFill;
          ctx.beginPath();
          ctx.moveTo(-en.radius * 0.5, -en.radius * 0.6);
          ctx.lineTo(-en.radius * 0.7, -en.radius * 1.3);
          ctx.lineTo(-en.radius * 0.2, -en.radius * 0.7);
          ctx.moveTo(en.radius * 0.5, -en.radius * 0.6);
          ctx.lineTo(en.radius * 0.7, -en.radius * 1.3);
          ctx.lineTo(en.radius * 0.2, -en.radius * 0.7);
          ctx.fill();
        } else {
          // Heavy Golem / Colossus / Boss
          const step = Math.sin(en.walkCycle) * 3;
          ctx.fillStyle = baseFill;
          // Stomping feet
          ctx.fillRect(-en.radius * 0.6, en.radius * 0.5 + step, 8, 10);
          ctx.fillRect(en.radius * 0.2, en.radius * 0.5 - step, 8, 10);

          // Armored Torso
          ctx.fillRect(-en.radius * 0.8, -en.radius * 0.8, en.radius * 1.6, en.radius * 1.4);

          // Runic chest core
          ctx.fillStyle = accentFill;
          ctx.beginPath();
          ctx.arc(0, -en.radius * 0.2, en.radius * 0.35, 0, Math.PI * 2);
          ctx.fill();

          // Horns / Crown for bosses
          if (en.isBoss) {
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.moveTo(-en.radius * 0.7, -en.radius * 0.8);
            ctx.lineTo(-en.radius * 0.9, -en.radius * 1.6);
            ctx.lineTo(-en.radius * 0.4, -en.radius * 0.9);
            ctx.moveTo(en.radius * 0.7, -en.radius * 0.8);
            ctx.lineTo(en.radius * 0.9, -en.radius * 1.6);
            ctx.lineTo(en.radius * 0.4, -en.radius * 0.9);
            ctx.fill();
          }
        }

        // Mini Health Bar
        const enHpRatio = Math.max(0, en.hp / en.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(-en.radius, -en.radius - 10, en.radius * 2, 4);
        ctx.fillStyle = en.isBoss ? '#f59e0b' : '#ef4444';
        ctx.fillRect(-en.radius, -en.radius - 10, en.radius * 2 * enHpRatio, 4);

        ctx.restore();
      });

      // Projectiles
      s.projectiles.forEach((proj) => {
        ctx.fillStyle = proj.color;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // ================= DRAW HIGH-DETAIL PROCEDURAL HERO CHARACTER =================
      ctx.save();
      ctx.translate(s.player.x, s.player.y);

      // Hero Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 16, 18, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shield bubble
      if (s.player.shieldActive) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Invulnerable aura
      if (s.player.invulnerableTimer > 0) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.stroke();
      }

      const bob = Math.sin(s.player.walkBob) * 2;
      const legStep = Math.sin(s.player.walkBob) * 4;

      // Hero Boots / Legs
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-7, 8 + bob + legStep, 5, 8);
      ctx.fillRect(2, 8 + bob - legStep, 5, 8);

      // Hero Armor Body & Pauldrons
      ctx.fillStyle = character.armorColor;
      ctx.fillRect(-10, -12 + bob, 20, 22);

      // Gold Belt & Chest Crest
      ctx.fillStyle = character.accentColor;
      ctx.fillRect(-8, 2 + bob, 16, 3);
      ctx.fillRect(-3, -6 + bob, 6, 6);

      // Flowing Cloak behind
      ctx.fillStyle = character.spriteColor;
      const facingDir = Math.cos(s.player.facingAngle);
      ctx.beginPath();
      ctx.moveTo(-facingDir * 8, -6 + bob);
      ctx.lineTo(-facingDir * 14, 12 + bob);
      ctx.lineTo(-facingDir * 4, 14 + bob);
      ctx.fill();

      // Hero Head & Hair
      ctx.fillStyle = character.hairColor;
      ctx.fillRect(-8, -24 + bob, 16, 12);

      // Hero Visor / Eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-4 + facingDir * 3, -19 + bob, 3, 3);
      ctx.fillRect(2 + facingDir * 3, -19 + bob, 3, 3);

      // Weapon Swing VFX & Custom Blade Silhouette Rendering
      const reachMult = adminCheats.colossalBlade ? 6.5 : 1.0;
      const effectiveReach = weapon.reach * reachMult;

      if (s.player.isSwinging) {
        const startArc = s.player.facingAngle - (weapon.arc / 2) * s.player.swingDirection;
        const currentAngle = startArc + weapon.arc * s.player.swingProgress * s.player.swingDirection;

        // Radiant multi-layer colored crescent slash arc
        ctx.beginPath();
        ctx.arc(0, bob, effectiveReach + 2, startArc, currentAngle, s.player.swingDirection < 0);
        ctx.lineWidth = adminCheats.colossalBlade ? 34 : 18;
        ctx.strokeStyle = weapon.vfxColor;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, bob, effectiveReach - 2, startArc, currentAngle, s.player.swingDirection < 0);
        ctx.lineWidth = adminCheats.colossalBlade ? 16 : 7;
        ctx.strokeStyle = weapon.secondaryColor;
        ctx.stroke();

        // Draw custom weapon model sweeping through arc
        ctx.save();
        ctx.translate(0, bob);
        ctx.rotate(currentAngle);
        drawWeaponSprite(ctx, weapon, reachMult * 0.9, true);
        ctx.restore();
      } else {
        const idleAngle = s.player.facingAngle + 0.6;
        ctx.save();
        ctx.translate(facingDir * 4, bob);
        ctx.rotate(idleAngle);
        drawWeaponSprite(ctx, weapon, reachMult * 0.75, false);
        ctx.restore();
      }

      ctx.restore();

      // Particles
      s.particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Floating Texts
      s.floatingTexts.forEach((txt) => {
        ctx.fillStyle = txt.color;
        ctx.globalAlpha = txt.alpha;
        ctx.font = `bold ${Math.round(13 * txt.scale)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(txt.text, txt.x, txt.y);
        ctx.globalAlpha = 1.0;
      });

      // Screen Nuke Blinding Flash
      if (s.gameStats.screenNukeFlash > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(s.gameStats.screenNukeFlash * 1.5, 0.9)})`;
        ctx.fillRect(-2000, -2000, 4000, 4000);
      }

      ctx.restore();

      // Throttle HUD update
      hudUpdateCounter++;
      if (hudUpdateCounter % 6 === 0) {
        const boss = s.enemies.find((e) => e.isBoss);
        const cInfo = getComboStats(s.player.combo);
        const decayPct = s.player.comboTimer > 0 ? (s.player.comboTimer / (s.player.comboMaxTimer || 2.8)) * 100 : 0;
        setHudStats({
          playerHp: Math.round(s.player.hp),
          playerMaxHp: s.player.maxHp,
          kills: s.gameStats.kills,
          killsNeeded: map.targetKillsForBoss,
          bossActive: !!boss,
          bossHp: boss ? Math.round(boss.hp) : 0,
          bossMaxHp: boss ? boss.maxHp : 1,
          bossName: boss ? map.boss.name : '',
          goldRun: s.gameStats.goldRun,
          combo: s.player.combo,
          comboTier: cInfo.tier,
          comboLabel: cInfo.label,
          comboColor: cInfo.color,
          comboTimerPercent: decayPct,
          comboDmgBonus: Math.round(cInfo.damageBonus * 100),
          comboGoldBonus: Math.round(cInfo.goldBonus * 100),
          abilityReady: s.player.abilityTimer <= 0,
          abilityCdRemaining: Math.max(0, +s.player.abilityTimer.toFixed(1)),
        });
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [map, character, weapon, upgrades, rebirths, adminCheats, onGameOver, onVictory, onGoldGained, onPause, triggerAttack, triggerDash, triggerAbility, placeTotem]);

  // Touch joystick handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    joystickRef.current = {
      active: true,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!joystickRef.current.active) return;
    const touch = e.touches[0];
    const dx = touch.clientX - joystickRef.current.startX;
    const dy = touch.clientY - joystickRef.current.startY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 45;

    if (dist > maxRadius) {
      joystickRef.current.deltaX = (dx / dist);
      joystickRef.current.deltaY = (dy / dist);
    } else {
      joystickRef.current.deltaX = dx / maxRadius;
      joystickRef.current.deltaY = dy / maxRadius;
    }
  };

  const handleTouchEnd = () => {
    joystickRef.current.active = false;
    joystickRef.current.deltaX = 0;
    joystickRef.current.deltaY = 0;
  };

  const playerHpPercent = Math.max(0, (hudStats.playerHp / hudStats.playerMaxHp) * 100);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-black">
      {/* 2D Canvas */}
      <canvas
        ref={canvasRef}
        data-testid="game-canvas"
        className="absolute inset-0 w-full h-full block cursor-crosshair pixel-art"
      />

      {/* TOP HUD: Minimalist, Pure Player Survival Glass Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        {/* Left: Player Vitality & Gold */}
        <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-3.5 pointer-events-auto">
          <div
            className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center font-bold text-xs"
            style={{ backgroundColor: character.armorColor }}
          >
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-slate-100">{character.name}</span>
              <span className="text-xs font-bold text-amber-300 font-mono">🪙 {hudStats.goldRun}</span>
            </div>
            {/* Health Bar */}
            <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-emerald-400 transition-all duration-100"
                style={{ width: `${playerHpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Realm Wave Progress or Boss Health */}
        {hudStats.bossActive ? (
          <div className="glass-panel px-6 py-2 rounded-2xl border-red-500/60 flex flex-col items-center pointer-events-auto shadow-[0_0_25px_rgba(239,68,68,0.25)] animate-pulse">
            <span className="text-xs font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5">
              <span>👑 BOSS: {hudStats.bossName}</span>
            </span>
            <div className="w-56 h-2 bg-slate-900 rounded-full overflow-hidden border border-red-900/60 mt-1">
              <div
                className="h-full bg-red-500 transition-all duration-100"
                style={{ width: `${Math.max(0, (hudStats.bossHp / hudStats.bossMaxHp) * 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-3 pointer-events-auto">
            <span className="text-xs font-bold text-emerald-400">
              Realm {map.id}: {map.name}
            </span>
            <span className="text-[11px] text-slate-300 font-mono">
              Fiends Defeated: {hudStats.kills} / {hudStats.killsNeeded}
            </span>
          </div>
        )}

        {/* Right: Controls Hint & Pause Button */}
        <div className="flex items-center gap-2.5">
          <div className="glass-panel px-3 py-1.5 rounded-2xl text-[10px] text-slate-400 font-mono hidden md:flex items-center gap-2">
            <span><strong className="text-emerald-400">SPACE</strong> Attack (Auto-Aim)</span>
            <span>·</span>
            <span><strong className="text-blue-400">SHIFT</strong> Dash</span>
          </div>

          <button
            onClick={onPause}
            className="w-10 h-10 glass-panel rounded-2xl flex items-center justify-center text-slate-300 hover:text-white cursor-pointer pointer-events-auto transition-transform active:scale-95"
            title="Pause (Esc / P)"
          >
            ⏸️
          </button>
        </div>
      </div>

      {/* ARCADE COMBO GAUGE */}
      {hudStats.combo >= 2 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex flex-col items-center">
          <div
            className="glass-panel px-4 py-1.5 rounded-2xl flex items-center gap-3 border shadow-2xl animate-pulse"
            style={{ borderColor: hudStats.comboColor }}
          >
            {/* Rank badge */}
            <span
              className="text-xs font-black px-2 py-0.5 rounded-lg text-black font-mono tracking-wider shadow"
              style={{ backgroundColor: hudStats.comboColor }}
            >
              {hudStats.comboTier !== 'NONE' ? hudStats.comboTier : 'COMBO'}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white font-mono tracking-tight leading-none">
                {hudStats.combo} <span className="text-[10px] text-slate-300 font-normal">HITS</span>
              </span>
              {hudStats.comboLabel && (
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: hudStats.comboColor }}>
                  {hudStats.comboLabel}
                </span>
              )}
            </div>
            {/* Multipliers */}
            <div className="border-l border-white/10 pl-2 text-[9px] font-mono text-slate-300 flex flex-col leading-tight">
              <span className="text-red-400 font-bold">+{hudStats.comboDmgBonus}% DMG</span>
              <span className="text-amber-300 font-bold">+{hudStats.comboGoldBonus}% GOLD</span>
            </div>
          </div>
          {/* Decay timer bar */}
          <div className="w-36 h-1.5 bg-black/60 rounded-full overflow-hidden mt-1 border border-white/10">
            <div
              className="h-full transition-all duration-75"
              style={{
                width: `${hudStats.comboTimerPercent}%`,
                backgroundColor: hudStats.comboColor,
              }}
            />
          </div>
        </div>
      )}

      {/* BOTTOM ACTION DOCK */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 glass-panel px-4 py-2 rounded-2xl pointer-events-auto z-10 hidden sm:flex">
        {/* Active Weapon with Custom Look */}
        <div className="flex items-center gap-2.5 pr-3 border-r border-white/10">
          <SwordPreview weapon={weapon} size={32} />
          <div>
            <span className="text-xs font-bold text-slate-200 block leading-tight">{weapon.name}</span>
            <span className="text-[9px] text-emerald-400 font-mono capitalize">{weapon.rarity}</span>
          </div>
        </div>

        {/* Auto-Aim Space Attack Button */}
        <button
          onClick={triggerAttack}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
        >
          <span>⚔️ Attack</span>
          <kbd className="px-1.5 py-0.2 bg-black/30 rounded text-[9px] font-mono">SPACE</kbd>
        </button>

        {/* Dash */}
        <button
          onClick={triggerDash}
          className="flex items-center gap-1 px-2.5 py-1.5 glass-panel-subtle hover:bg-zinc-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
        >
          <span>💨 Dash</span>
          <kbd className="px-1 py-0.2 bg-black/40 rounded text-[9px] font-mono">SHIFT</kbd>
        </button>

        {/* Ability Button */}
        <button
          onClick={triggerAbility}
          disabled={!hudStats.abilityReady && !adminCheats.noCooldowns}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            hudStats.abilityReady || adminCheats.noCooldowns
              ? 'bg-purple-600/80 hover:bg-purple-500 text-white shadow-md'
              : 'bg-zinc-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>✨ {character.abilityName}</span>
          <kbd className="px-1 py-0.2 bg-black/30 rounded text-[9px] font-mono">E</kbd>
          {!hudStats.abilityReady && !adminCheats.noCooldowns && (
            <span className="text-[10px] text-purple-300 font-mono ml-1">
              ({hudStats.abilityCdRemaining}s)
            </span>
          )}
        </button>

        {/* Totem */}
        <button
          onClick={placeTotem}
          className="flex items-center gap-1 px-2.5 py-1.5 glass-panel-subtle hover:bg-zinc-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
        >
          <span>🛡️ Totem</span>
          <kbd className="px-1 py-0.2 bg-black/40 rounded text-[9px] font-mono">T</kbd>
        </button>
      </div>

      {/* MOBILE CONTROLS */}
      <div className="sm:hidden absolute inset-0 pointer-events-none z-20">
        {/* Joystick on bottom-left */}
        <div
          className="absolute bottom-8 left-8 w-28 h-28 rounded-full border border-emerald-500/30 bg-emerald-950/20 pointer-events-auto flex items-center justify-center touch-none backdrop-blur-sm"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/70 border border-emerald-300 shadow-md" />
        </div>

        {/* Actions on bottom-right */}
        <div className="absolute bottom-8 right-8 flex flex-col items-end gap-3 pointer-events-auto">
          <div className="flex gap-2.5">
            <button
              onClick={placeTotem}
              className="w-11 h-11 rounded-2xl glass-panel text-sm flex items-center justify-center active:scale-95"
            >
              🛡️
            </button>
            <button
              onClick={triggerAbility}
              className="w-11 h-11 rounded-2xl bg-purple-600/80 border border-purple-400 text-sm flex items-center justify-center active:scale-95 text-white"
            >
              ✨
            </button>
            <button
              onClick={triggerDash}
              className="w-11 h-11 rounded-2xl bg-blue-600/80 border border-blue-400 text-sm flex items-center justify-center active:scale-95 text-white"
            >
              💨
            </button>
          </div>

          {/* Large Auto-Aim Attack Button */}
          <button
            onTouchStart={triggerAttack}
            onClick={triggerAttack}
            className="w-18 h-18 rounded-3xl bg-emerald-500 active:bg-emerald-400 text-black font-black text-sm flex items-center justify-center active:scale-90 shadow-2xl"
          >
            ⚔️ ATTACK
          </button>
        </div>
      </div>
    </div>
  );
};
