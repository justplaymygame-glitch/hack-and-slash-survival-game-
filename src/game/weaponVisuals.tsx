import React, { useEffect, useRef } from 'react';
import { Weapon } from '../types/game';

export interface WeaponVisualDetails {
  bladeType:
    | 'scimitar'
    | 'cleaver'
    | 'estoc'
    | 'katana'
    | 'dagger'
    | 'greatsword'
    | 'void_cleaver'
    | 'scythe'
    | 'glaive'
    | 'lance'
    | 'dragonfang'
    | 'falchion'
    | 'executioner'
    | 'flamberge'
    | 'longsword'
    | 'spiral'
    | 'pillar'
    | 'clockwork'
    | 'plasma'
    | 'bone_zweihander'
    | 'wingblade'
    | 'singularity'
    | 'tree_blade'
    | 'world_ender';
  bladeColor: string;
  edgeColor: string;
  coreColor: string;
  guardColor: string;
  hiltColor: string;
  pommelColor: string;
  auraGlow: string;
  bladeLength: number;
  bladeWidth: number;
  hasParticles?: boolean;
}

export function getWeaponVisual(weaponId: string): WeaponVisualDetails {
  switch (weaponId) {
    case 'verdant_slicer':
      return {
        bladeType: 'scimitar',
        bladeColor: '#15803d',
        edgeColor: '#86efac',
        coreColor: '#166534',
        guardColor: '#78350f',
        hiltColor: '#14532d',
        pommelColor: '#22c55e',
        auraGlow: '#10b981',
        bladeLength: 42,
        bladeWidth: 7,
      };
    case 'flamebrand_cleaver':
      return {
        bladeType: 'cleaver',
        bladeColor: '#dc2626',
        edgeColor: '#fef08a',
        coreColor: '#991b1b',
        guardColor: '#451a03',
        hiltColor: '#1f2937',
        pommelColor: '#f97316',
        auraGlow: '#ef4444',
        bladeLength: 44,
        bladeWidth: 11,
      };
    case 'frostbite_estoc':
      return {
        bladeType: 'estoc',
        bladeColor: '#06b6d4',
        edgeColor: '#e0f2fe',
        coreColor: '#0284c7',
        guardColor: '#bae6fd',
        hiltColor: '#075985',
        pommelColor: '#38bdf8',
        auraGlow: '#38bdf8',
        bladeLength: 48,
        bladeWidth: 4,
      };
    case 'stormcaller_katana':
      return {
        bladeType: 'katana',
        bladeColor: '#2563eb',
        edgeColor: '#bfdbfe',
        coreColor: '#1d4ed8',
        guardColor: '#fbbf24',
        hiltColor: '#1e1b4b',
        pommelColor: '#facc15',
        auraGlow: '#60a5fa',
        bladeLength: 50,
        bladeWidth: 5,
      };
    case 'venomfang_dagger':
      return {
        bladeType: 'dagger',
        bladeColor: '#16a34a',
        edgeColor: '#dcfce7',
        coreColor: '#15803d',
        guardColor: '#365314',
        hiltColor: '#14532d',
        pommelColor: '#4ade80',
        auraGlow: '#22c55e',
        bladeLength: 32,
        bladeWidth: 6,
      };
    case 'obsidian_greatsword':
      return {
        bladeType: 'greatsword',
        bladeColor: '#18181b',
        edgeColor: '#f97316',
        coreColor: '#27272a',
        guardColor: '#3f3f46',
        hiltColor: '#52525b',
        pommelColor: '#ea580c',
        auraGlow: '#f97316',
        bladeLength: 52,
        bladeWidth: 12,
      };
    case 'sunblade_scimitar':
      return {
        bladeType: 'scimitar',
        bladeColor: '#f59e0b',
        edgeColor: '#fffbeb',
        coreColor: '#d97706',
        guardColor: '#78350f',
        hiltColor: '#b45309',
        pommelColor: '#fef08a',
        auraGlow: '#fbbf24',
        bladeLength: 46,
        bladeWidth: 8,
      };
    case 'void_cleaver':
      return {
        bladeType: 'void_cleaver',
        bladeColor: '#4c1d95',
        edgeColor: '#e9d5ff',
        coreColor: '#2e1065',
        guardColor: '#1e1b4b',
        hiltColor: '#3b0764',
        pommelColor: '#c084fc',
        auraGlow: '#a855f7',
        bladeLength: 46,
        bladeWidth: 10,
      };
    case 'soul_harvester_scythe':
      return {
        bladeType: 'scythe',
        bladeColor: '#0f766e',
        edgeColor: '#ccfbf1',
        coreColor: '#115e59',
        guardColor: '#f3f4f6',
        hiltColor: '#1f2937',
        pommelColor: '#2dd4bf',
        auraGlow: '#14b8a6',
        bladeLength: 52,
        bladeWidth: 8,
      };
    case 'thunderstrike_glaive':
      return {
        bladeType: 'glaive',
        bladeColor: '#4f46e5',
        edgeColor: '#fef08a',
        coreColor: '#3730a3',
        guardColor: '#eab308',
        hiltColor: '#312e81',
        pommelColor: '#38bdf8',
        auraGlow: '#818cf8',
        bladeLength: 54,
        bladeWidth: 6,
      };
    case 'celestial_rapier':
      return {
        bladeType: 'estoc',
        bladeColor: '#c084fc',
        edgeColor: '#faf5ff',
        coreColor: '#9333ea',
        guardColor: '#e9d5ff',
        hiltColor: '#581c87',
        pommelColor: '#f472b6',
        auraGlow: '#d8b4fe',
        bladeLength: 50,
        bladeWidth: 4,
      };
    case 'abyssal_halberd':
      return {
        bladeType: 'glaive',
        bladeColor: '#09090b',
        edgeColor: '#a855f7',
        coreColor: '#18181b',
        guardColor: '#3b0764',
        hiltColor: '#27272a',
        pommelColor: '#7c3aed',
        auraGlow: '#9333ea',
        bladeLength: 56,
        bladeWidth: 11,
      };
    case 'infernal_spire':
      return {
        bladeType: 'lance',
        bladeColor: '#b91c1c',
        edgeColor: '#fef08a',
        coreColor: '#7f1d1d',
        guardColor: '#450a0a',
        hiltColor: '#292524',
        pommelColor: '#f97316',
        auraGlow: '#ef4444',
        bladeLength: 52,
        bladeWidth: 7,
      };
    case 'glacial_claymore':
      return {
        bladeType: 'greatsword',
        bladeColor: '#0284c7',
        edgeColor: '#ffffff',
        coreColor: '#0369a1',
        guardColor: '#38bdf8',
        hiltColor: '#0c4a6e',
        pommelColor: '#e0f2fe',
        auraGlow: '#38bdf8',
        bladeLength: 54,
        bladeWidth: 11,
      };
    case 'dragonfang_blade':
      return {
        bladeType: 'dragonfang',
        bladeColor: '#dc2626',
        edgeColor: '#fecaca',
        coreColor: '#991b1b',
        guardColor: '#7f1d1d',
        hiltColor: '#450a0a',
        pommelColor: '#fbbf24',
        auraGlow: '#f87171',
        bladeLength: 48,
        bladeWidth: 9,
      };
    case 'eclipse_saber':
      return {
        bladeType: 'katana',
        bladeColor: '#334155',
        edgeColor: '#f8fafc',
        coreColor: '#0f172a',
        guardColor: '#94a3b8',
        hiltColor: '#1e293b',
        pommelColor: '#cbd5e1',
        auraGlow: '#e2e8f0',
        bladeLength: 50,
        bladeWidth: 6,
      };
    case 'zephyr_falchion':
      return {
        bladeType: 'falchion',
        bladeColor: '#059669',
        edgeColor: '#a7f3d0',
        coreColor: '#047857',
        guardColor: '#10b981',
        hiltColor: '#064e3b',
        pommelColor: '#6ee7b7',
        auraGlow: '#34d399',
        bladeLength: 46,
        bladeWidth: 8,
      };
    case 'duskreaver':
      return {
        bladeType: 'executioner',
        bladeColor: '#1e1b4b',
        edgeColor: '#c084fc',
        coreColor: '#312e81',
        guardColor: '#4338ca',
        hiltColor: '#0f172a',
        pommelColor: '#818cf8',
        auraGlow: '#6366f1',
        bladeLength: 50,
        bladeWidth: 13,
      };
    case 'aetherial_pike':
      return {
        bladeType: 'lance',
        bladeColor: '#0891b2',
        edgeColor: '#cffafe',
        coreColor: '#0e7490',
        guardColor: '#06b6d4',
        hiltColor: '#164e63',
        pommelColor: '#67e8f9',
        auraGlow: '#22d3ee',
        bladeLength: 55,
        bladeWidth: 6,
      };
    case 'bloodthorn_flamberge':
      return {
        bladeType: 'flamberge',
        bladeColor: '#881337',
        edgeColor: '#fda4af',
        coreColor: '#4c0519',
        guardColor: '#1c1917',
        hiltColor: '#9f1239',
        pommelColor: '#f43f5e',
        auraGlow: '#e11d48',
        bladeLength: 52,
        bladeWidth: 8,
      };
    case 'starlight_edge':
      return {
        bladeType: 'longsword',
        bladeColor: '#0284c7',
        edgeColor: '#e0f2fe',
        coreColor: '#0369a1',
        guardColor: '#38bdf8',
        hiltColor: '#0f172a',
        pommelColor: '#fef08a',
        auraGlow: '#38bdf8',
        bladeLength: 50,
        bladeWidth: 7,
      };
    case 'volcanic_warblade':
      return {
        bladeType: 'cleaver',
        bladeColor: '#ea580c',
        edgeColor: '#fef08a',
        coreColor: '#9a3412',
        guardColor: '#431407',
        hiltColor: '#1c1917',
        pommelColor: '#fb923c',
        auraGlow: '#f97316',
        bladeLength: 48,
        bladeWidth: 12,
      };
    case 'netherite_broadsword':
      return {
        bladeType: 'greatsword',
        bladeColor: '#27272a',
        edgeColor: '#d8b4fe',
        coreColor: '#18181b',
        guardColor: '#581c87',
        hiltColor: '#3f3f46',
        pommelColor: '#c084fc',
        auraGlow: '#a855f7',
        bladeLength: 52,
        bladeWidth: 10,
      };
    case 'spectral_dagger':
      return {
        bladeType: 'dagger',
        bladeColor: '#0d9488',
        edgeColor: '#f0fdfa',
        coreColor: '#115e59',
        guardColor: '#14b8a6',
        hiltColor: '#042f2e',
        pommelColor: '#5eead4',
        auraGlow: '#2dd4bf',
        bladeLength: 36,
        bladeWidth: 6,
      };
    case 'chaos_spindle':
      return {
        bladeType: 'spiral',
        bladeColor: '#7c3aed',
        edgeColor: '#f472b6',
        coreColor: '#4c1d95',
        guardColor: '#be185d',
        hiltColor: '#3b0764',
        pommelColor: '#e879f9',
        auraGlow: '#c084fc',
        bladeLength: 50,
        bladeWidth: 9,
      };
    case 'titans_pillar':
      return {
        bladeType: 'pillar',
        bladeColor: '#475569',
        edgeColor: '#cbd5e1',
        coreColor: '#334155',
        guardColor: '#64748b',
        hiltColor: '#1e293b',
        pommelColor: '#94a3b8',
        auraGlow: '#94a3b8',
        bladeLength: 52,
        bladeWidth: 14,
      };
    case 'chrono_blade':
      return {
        bladeType: 'clockwork',
        bladeColor: '#d97706',
        edgeColor: '#fef3c7',
        coreColor: '#b45309',
        guardColor: '#f59e0b',
        hiltColor: '#78350f',
        pommelColor: '#fbbf24',
        auraGlow: '#f59e0b',
        bladeLength: 50,
        bladeWidth: 7,
      };
    case 'nova_carver':
      return {
        bladeType: 'plasma',
        bladeColor: '#f97316',
        edgeColor: '#ffffff',
        coreColor: '#c2410c',
        guardColor: '#fb923c',
        hiltColor: '#431407',
        pommelColor: '#fdba74',
        auraGlow: '#fb923c',
        bladeLength: 52,
        bladeWidth: 10,
      };
    case 'blighted_zweihander':
      return {
        bladeType: 'bone_zweihander',
        bladeColor: '#4d7c0f',
        edgeColor: '#bef264',
        coreColor: '#365314',
        guardColor: '#1c1917',
        hiltColor: '#14532d',
        pommelColor: '#a3e635',
        auraGlow: '#84cc16',
        bladeLength: 56,
        bladeWidth: 11,
      };
    case 'seraphic_wingblade':
      return {
        bladeType: 'wingblade',
        bladeColor: '#fbbf24',
        edgeColor: '#ffffff',
        coreColor: '#f59e0b',
        guardColor: '#fef08a',
        hiltColor: '#b45309',
        pommelColor: '#ffffff',
        auraGlow: '#fde047',
        bladeLength: 52,
        bladeWidth: 9,
      };
    case 'cosmic_broadsword':
      return {
        bladeType: 'greatsword',
        bladeColor: '#312e81',
        edgeColor: '#e0e7ff',
        coreColor: '#1e1b4b',
        guardColor: '#6366f1',
        hiltColor: '#0f172a',
        pommelColor: '#a5b4fc',
        auraGlow: '#818cf8',
        bladeLength: 54,
        bladeWidth: 12,
      };
    case 'singularity_edge':
      return {
        bladeType: 'singularity',
        bladeColor: '#020617',
        edgeColor: '#38bdf8',
        coreColor: '#0f172a',
        guardColor: '#1e293b',
        hiltColor: '#000000',
        pommelColor: '#0284c7',
        auraGlow: '#0ea5e9',
        bladeLength: 54,
        bladeWidth: 8,
      };
    case 'genesis_blade':
      return {
        bladeType: 'tree_blade',
        bladeColor: '#16a34a',
        edgeColor: '#fef08a',
        coreColor: '#15803d',
        guardColor: '#ca8a04',
        hiltColor: '#78350f',
        pommelColor: '#eab308',
        auraGlow: '#22c55e',
        bladeLength: 52,
        bladeWidth: 9,
      };
    case 'infinity_cleaver':
      return {
        bladeType: 'cleaver',
        bladeColor: '#ec4899',
        edgeColor: '#67e8f9',
        coreColor: '#8b5cf6',
        guardColor: '#f43f5e',
        hiltColor: '#312e81',
        pommelColor: '#a855f7',
        auraGlow: '#d946ef',
        bladeLength: 54,
        bladeWidth: 13,
      };
    case 'world_ender':
    default:
      return {
        bladeType: 'world_ender',
        bladeColor: '#450a0a',
        edgeColor: '#fca5a5',
        coreColor: '#18181b',
        guardColor: '#7f1d1d',
        hiltColor: '#09090b',
        pommelColor: '#ef4444',
        auraGlow: '#dc2626',
        bladeLength: 60,
        bladeWidth: 15,
      };
  }
}

/**
 * Draws the custom pixel-art/vector weapon model relative to (0,0) as the hand position.
 * Angle 0 means extending horizontally to the right.
 */
export function drawWeaponSprite(
  ctx: CanvasRenderingContext2D,
  weapon: Weapon,
  lengthMultiplier: number = 1.0,
  isSwinging: boolean = false
) {
  const vis = getWeaponVisual(weapon.id);
  const len = vis.bladeLength * lengthMultiplier;
  const w = vis.bladeWidth * (lengthMultiplier > 1 ? Math.min(lengthMultiplier * 0.5 + 0.5, 3) : 1);

  ctx.save();

  // Subtle aura glow underneath
  ctx.shadowColor = vis.auraGlow;
  ctx.shadowBlur = isSwinging ? 18 : 8;

  // 1. Pommel
  ctx.fillStyle = vis.pommelColor;
  ctx.beginPath();
  ctx.arc(-10, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // 2. Handle / Grip
  ctx.fillStyle = vis.hiltColor;
  ctx.fillRect(-9, -2, 9, 4);

  // Grip wrapping bands
  ctx.fillStyle = '#0f172a';
  for (let gx = -7; gx < 0; gx += 2.5) {
    ctx.fillRect(gx, -2, 1, 4);
  }

  // 3. Crossguard
  ctx.fillStyle = vis.guardColor;
  switch (vis.bladeType) {
    case 'scythe':
      // Bone shaft curve
      ctx.fillRect(-1, -6, 5, 12);
      ctx.fillStyle = vis.pommelColor;
      ctx.fillRect(1, -7, 3, 14);
      break;

    case 'katana':
      // Round tsuba
      ctx.beginPath();
      ctx.ellipse(0, 0, 3, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'estoc':
      // Bell cup / ring guard
      ctx.beginPath();
      ctx.arc(1, 0, 6, -Math.PI / 2, Math.PI / 2);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = vis.guardColor;
      ctx.stroke();
      break;

    case 'world_ender':
      // Horned skull guard
      ctx.fillRect(-2, -10, 6, 20);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(0, -12, 3, 4);
      ctx.fillRect(0, 8, 3, 4);
      break;

    case 'wingblade':
      // Angelic wings
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-4, -10);
      ctx.lineTo(2, -8);
      ctx.lineTo(-4, 10);
      ctx.lineTo(2, 8);
      ctx.fill();
      break;

    default:
      // Classic sturdy crossguard
      ctx.fillRect(0, -w - 3, 3.5, (w + 3) * 2);
      break;
  }

  // 4. Blade Body
  ctx.fillStyle = vis.bladeColor;

  if (vis.bladeType === 'scythe') {
    // Large curved crescent scythe blade extending perpendicular
    ctx.beginPath();
    ctx.moveTo(len * 0.7, -2);
    ctx.quadraticCurveTo(len, -w * 3, len * 0.4, -w * 4.5);
    ctx.quadraticCurveTo(len * 0.8, -w * 2, len * 0.7, 2);
    ctx.fill();

    // Sharp glowing cutting edge
    ctx.strokeStyle = vis.edgeColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(len * 0.7, -2);
    ctx.quadraticCurveTo(len, -w * 3, len * 0.4, -w * 4.5);
    ctx.stroke();
  } else if (vis.bladeType === 'dagger') {
    // Double edged pointed short dagger
    ctx.beginPath();
    ctx.moveTo(2, -w / 2);
    ctx.lineTo(len - 8, -w / 2);
    ctx.lineTo(len, 0);
    ctx.lineTo(len - 8, w / 2);
    ctx.lineTo(2, w / 2);
    ctx.closePath();
    ctx.fill();

    // Central fuller
    ctx.fillStyle = vis.coreColor;
    ctx.fillRect(4, -1, len - 14, 2);

    // Glowing edge highlight
    ctx.strokeStyle = vis.edgeColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (vis.bladeType === 'cleaver' || vis.bladeType === 'void_cleaver' || vis.bladeType === 'executioner') {
    // Massive heavy chopper blade with blunt back and wicked edge
    ctx.beginPath();
    ctx.moveTo(2, -w * 0.4);
    ctx.lineTo(len - 6, -w * 0.4);
    ctx.lineTo(len, w * 0.6);
    ctx.lineTo(2, w * 0.7);
    ctx.closePath();
    ctx.fill();

    // Serrations or notches on spine
    ctx.fillStyle = '#09090b';
    for (let nx = 12; nx < len - 10; nx += 10) {
      ctx.fillRect(nx, -w * 0.4, 3, 3);
    }

    // Cutting edge line
    ctx.strokeStyle = vis.edgeColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(2, w * 0.7);
    ctx.lineTo(len, w * 0.6);
    ctx.stroke();
  } else if (vis.bladeType === 'katana' || vis.bladeType === 'scimitar' || vis.bladeType === 'falchion') {
    // Elegant sweeping curved edge
    ctx.beginPath();
    ctx.moveTo(2, -w * 0.3);
    ctx.quadraticCurveTo(len * 0.6, -w * 0.2, len - 6, -w * 0.5);
    ctx.lineTo(len, 0);
    ctx.quadraticCurveTo(len * 0.6, w * 0.6, 2, w * 0.4);
    ctx.closePath();
    ctx.fill();

    // Hamon temper line
    ctx.strokeStyle = vis.edgeColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(2, w * 0.35);
    ctx.quadraticCurveTo(len * 0.6, w * 0.55, len, 0);
    ctx.stroke();
  } else if (vis.bladeType === 'flamberge') {
    // Undulating serpentine wavy blade
    ctx.beginPath();
    ctx.moveTo(2, 0);
    for (let wx = 4; wx < len; wx += 8) {
      ctx.lineTo(wx, (wx % 16 === 0 ? 1 : -1) * (w / 2));
    }
    ctx.lineTo(len, 0);
    ctx.lineTo(2, 0);
    ctx.fill();

    ctx.strokeStyle = vis.edgeColor;
    ctx.lineWidth = 2.0;
    ctx.stroke();
  } else if (vis.bladeType === 'world_ender') {
    // Apocalyptic jagged demonic greatsword
    ctx.beginPath();
    ctx.moveTo(2, -w / 2);
    ctx.lineTo(len * 0.4, -w * 0.6);
    ctx.lineTo(len * 0.5, -w * 0.4);
    ctx.lineTo(len * 0.85, -w * 0.8);
    ctx.lineTo(len, 0);
    ctx.lineTo(len * 0.85, w * 0.8);
    ctx.lineTo(len * 0.5, w * 0.4);
    ctx.lineTo(len * 0.4, w * 0.6);
    ctx.lineTo(2, w / 2);
    ctx.closePath();
    ctx.fill();

    // Blood crack fuller
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(len * 0.3, -2);
    ctx.lineTo(len * 0.6, 2);
    ctx.lineTo(len * 0.9, 0);
    ctx.stroke();

    ctx.strokeStyle = vis.edgeColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else {
    // Standard / Greatsword / Broadsword tapering spearhead
    ctx.beginPath();
    ctx.moveTo(2, -w / 2);
    ctx.lineTo(len - 10, -w / 2);
    ctx.lineTo(len, 0);
    ctx.lineTo(len - 10, w / 2);
    ctx.lineTo(2, w / 2);
    ctx.closePath();
    ctx.fill();

    // Central fuller groove
    ctx.fillStyle = vis.coreColor;
    ctx.fillRect(4, -1.2, len - 16, 2.4);

    // Glowing edges
    ctx.strokeStyle = vis.edgeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * React Component that renders the unique weapon silhouette onto an HTML5 canvas
 */
export const SwordPreview: React.FC<{ weapon: Weapon; size?: number; className?: string }> = ({
  weapon,
  size = 64,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Dark mystic pedestal background
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(30, 41, 59, 0.7)');
    gradient.addColorStop(1, 'rgba(15, 23, 42, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Subtle border glow
    ctx.strokeStyle = weapon.vfxColor + '44';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, size - 1, size - 1);

    // Position weapon diagonally from bottom-left to top-right
    ctx.save();
    ctx.translate(size * 0.25, size * 0.75);
    ctx.rotate(-Math.PI / 4);

    // Scale so weapon fits comfortably in preview box
    const vis = getWeaponVisual(weapon.id);
    const fitScale = (size * 0.7) / Math.max(vis.bladeLength, 40);

    drawWeaponSprite(ctx, weapon, fitScale, false);
    ctx.restore();
  }, [weapon, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`rounded-xl border border-white/10 shrink-0 ${className}`}
      title={`${weapon.name} - ${weapon.title}`}
    />
  );
};
