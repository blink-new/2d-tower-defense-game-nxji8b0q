export interface Position {
  x: number;
  y: number;
}

export interface Enemy {
  id: string;
  position: Position;
  health: number;
  maxHealth: number;
  speed: number;
  pathIndex: number;
  pathProgress: number;
  type: EnemyType;
  reward: number;
}

export interface Tower {
  id: string;
  position: Position;
  type: TowerType;
  level: number;
  damage: number;
  range: number;
  fireRate: number;
  lastFired: number;
  cost: number;
  upgradeCost: number;
}

export interface Projectile {
  id: string;
  position: Position;
  target: Enemy;
  speed: number;
  damage: number;
  type: ProjectileType;
}

export interface GameState {
  health: number;
  gold: number;
  wave: number;
  score: number;
  isPlaying: boolean;
  isPaused: boolean;
  gameSpeed: number;
  selectedTowerType: TowerType | null;
  selectedTower: Tower | null;
  showRange: boolean;
}

export type EnemyType = 'basic' | 'fast' | 'heavy' | 'flying';
export type TowerType = 'basic' | 'cannon' | 'ice' | 'lightning';
export type ProjectileType = 'bullet' | 'cannonball' | 'ice' | 'lightning';

export interface WaveConfig {
  enemyCount: number;
  enemyTypes: EnemyType[];
  spawnDelay: number;
  reward: number;
}