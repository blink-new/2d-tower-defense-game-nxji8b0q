import { EnemyType, TowerType, WaveConfig } from '../types/game';

export const GRID_SIZE = 40;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const ENEMY_CONFIGS = {
  basic: {
    health: 100,
    speed: 1,
    reward: 10,
    color: '#ef4444',
    size: 12
  },
  fast: {
    health: 60,
    speed: 2,
    reward: 15,
    color: '#22c55e',
    size: 10
  },
  heavy: {
    health: 300,
    speed: 0.5,
    reward: 25,
    color: '#8b5cf6',
    size: 16
  },
  flying: {
    health: 80,
    speed: 1.5,
    reward: 20,
    color: '#06b6d4',
    size: 14
  }
};

export const TOWER_CONFIGS = {
  basic: {
    damage: 25,
    range: 100,
    fireRate: 1000,
    cost: 50,
    upgradeCost: 30,
    color: '#64748b',
    projectileType: 'bullet' as const
  },
  cannon: {
    damage: 80,
    range: 120,
    fireRate: 2000,
    cost: 100,
    upgradeCost: 60,
    color: '#dc2626',
    projectileType: 'cannonball' as const
  },
  ice: {
    damage: 15,
    range: 90,
    fireRate: 800,
    cost: 75,
    upgradeCost: 45,
    color: '#0ea5e9',
    projectileType: 'ice' as const
  },
  lightning: {
    damage: 40,
    range: 150,
    fireRate: 1500,
    cost: 150,
    upgradeCost: 90,
    color: '#eab308',
    projectileType: 'lightning' as const
  }
};

export const WAVE_CONFIGS: WaveConfig[] = [
  { enemyCount: 10, enemyTypes: ['basic'], spawnDelay: 1000, reward: 50 },
  { enemyCount: 15, enemyTypes: ['basic', 'fast'], spawnDelay: 800, reward: 75 },
  { enemyCount: 20, enemyTypes: ['basic', 'fast'], spawnDelay: 600, reward: 100 },
  { enemyCount: 12, enemyTypes: ['heavy'], spawnDelay: 1500, reward: 150 },
  { enemyCount: 25, enemyTypes: ['basic', 'fast', 'flying'], spawnDelay: 500, reward: 200 },
  { enemyCount: 30, enemyTypes: ['basic', 'fast', 'heavy'], spawnDelay: 400, reward: 250 },
  { enemyCount: 20, enemyTypes: ['flying', 'heavy'], spawnDelay: 800, reward: 300 },
  { enemyCount: 40, enemyTypes: ['basic', 'fast', 'flying', 'heavy'], spawnDelay: 300, reward: 400 },
  { enemyCount: 35, enemyTypes: ['heavy', 'flying'], spawnDelay: 600, reward: 500 },
  { enemyCount: 50, enemyTypes: ['basic', 'fast', 'flying', 'heavy'], spawnDelay: 200, reward: 750 }
];

// Game path - enemies follow this route
export const GAME_PATH = [
  { x: 0, y: 300 },
  { x: 200, y: 300 },
  { x: 200, y: 150 },
  { x: 400, y: 150 },
  { x: 400, y: 450 },
  { x: 600, y: 450 },
  { x: 600, y: 300 },
  { x: 800, y: 300 }
];