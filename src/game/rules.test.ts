import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePlayerDamage,
  calculatePlayerMaxHp,
  calculatePlayerArmor,
  calculateUpgradeCost,
  calculateEnemyScaledStats,
  checkBossSpawnCondition,
  checkMapVictory,
  calculateRebirthRequirements,
  validateUsername,
  getComboStats,
} from './rules';

test('calculatePlayerDamage computes base and admin 100x properly', () => {
  const normal = calculatePlayerDamage(20, 0, 1.0, 1.0, 0, false);
  assert.equal(normal.damage, 20);

  const upgraded = calculatePlayerDamage(20, 2, 1.0, 1.0, 0, false);
  // 20 * (1 + 0.3) = 26
  assert.equal(upgraded.damage, 26);

  const admin100 = calculatePlayerDamage(20, 0, 1.0, 1.0, 0, true);
  assert.equal(admin100.damage, 2000);
});

test('calculatePlayerMaxHp and player armor scale with levels', () => {
  assert.equal(calculatePlayerMaxHp(100, 0), 100);
  assert.equal(calculatePlayerMaxHp(100, 4), 220);

  assert.equal(calculatePlayerArmor(0), 0);
  assert.equal(calculatePlayerArmor(5), 0.2);
});

test('calculateUpgradeCost grows exponentially', () => {
  const cost0 = calculateUpgradeCost(0, 100);
  const cost1 = calculateUpgradeCost(1, 100);
  assert.equal(cost0, 100);
  assert.equal(cost1, 140);
  assert.ok(calculateUpgradeCost(2, 100) > cost1);
});

test('enemy scaling increases with mapId', () => {
  const map1Stats = calculateEnemyScaledStats(1, 100, 10, 2.0);
  const map5Stats = calculateEnemyScaledStats(5, 100, 10, 2.0);
  assert.equal(map1Stats.hp, 100);
  assert.ok(map5Stats.hp > map1Stats.hp);
  assert.ok(map5Stats.damage > map1Stats.damage);
});

test('boss spawn condition triggers at target threshold', () => {
  assert.equal(checkBossSpawnCondition(24, 25), false);
  assert.equal(checkBossSpawnCondition(25, 25), true);
  assert.equal(checkBossSpawnCondition(30, 25), true);
});

test('checkMapVictory advances map or flags complete', () => {
  const midGame = checkMapVictory(true, 4);
  assert.equal(midGame.canAdvance, true);
  assert.equal(midGame.nextMapId, 5);
  assert.equal(midGame.isAllGameCleared, false);

  const finalBoss = checkMapVictory(true, 13);
  assert.equal(finalBoss.canAdvance, true);
  assert.equal(finalBoss.nextMapId, 13);
  assert.equal(finalBoss.isAllGameCleared, true);
});

test('calculateRebirthRequirements scales gold and soul shards', () => {
  const r0 = calculateRebirthRequirements(0);
  const r1 = calculateRebirthRequirements(1);
  assert.equal(r0.costGold, 5000);
  assert.ok(r1.costGold > r0.costGold);
  assert.ok(r1.rewardSoulShards > r0.rewardSoulShards);
  assert.equal(r0.newDamageMultiplier, 1.5);
  assert.equal(r1.newDamageMultiplier, 2.0);
});

test('validateUsername detects taken names, length and special characters', () => {
  const existing = ['ShadowBlade', 'DragonLord', 'ForestQueen'];

  // Empty
  assert.equal(validateUsername('', existing).valid, false);
  // Short
  assert.equal(validateUsername('hi', existing).valid, false);
  // Invalid chars
  assert.equal(validateUsername('bad name!', existing).valid, false);
  // Case-insensitive taken name
  const taken = validateUsername('shadowblade', existing);
  assert.equal(taken.valid, false);
  assert.ok(taken.error?.includes('already in use'));

  // Valid unique name
  assert.equal(validateUsername('MysticWarrior_99', existing).valid, true);
});

test('getComboStats scales properly through tiers', () => {
  assert.equal(getComboStats(0).tier, 'NONE');
  assert.equal(getComboStats(4).tier, 'NONE');
  assert.equal(getComboStats(5).tier, 'D');
  assert.equal(getComboStats(15).tier, 'C');
  assert.equal(getComboStats(30).tier, 'B');
  assert.equal(getComboStats(50).tier, 'A');
  assert.equal(getComboStats(80).tier, 'S');
  assert.equal(getComboStats(120).tier, 'SS');
  assert.equal(getComboStats(200).tier, 'SSS');
  assert.equal(getComboStats(500).tier, 'SSS');

  // Multiplier boost test
  const baseDmg = calculatePlayerDamage(100, 0, 1.0, 1.0, 0, false, 1.0);
  const sssDmg = calculatePlayerDamage(100, 0, 1.0, 1.0, 0, false, 3.0); // 1 + 2.0 combo bonus
  assert.equal(baseDmg.damage, 100);
  assert.equal(sssDmg.damage, 300);
});

