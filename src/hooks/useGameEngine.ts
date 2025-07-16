import { useState, useRef, useCallback, useEffect } from 'react';
import { Enemy, Tower, Projectile, GameState, EnemyType, TowerType } from '../types/game';
import { ENEMY_CONFIGS, TOWER_CONFIGS, WAVE_CONFIGS, GAME_PATH, GRID_SIZE } from '../utils/gameConfig';

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>({
    health: 100,
    gold: 200,
    wave: 1,
    score: 0,
    isPlaying: false,
    isPaused: false,
    gameSpeed: 1,
    selectedTowerType: null,
    selectedTower: null,
    showRange: false
  });

  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const waveSpawnRef = useRef<{ count: number; lastSpawn: number }>({ count: 0, lastSpawn: 0 });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const getDistance = (pos1: { x: number; y: number }, pos2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
  };

  const getPathPosition = (pathIndex: number, progress: number) => {
    if (pathIndex >= GAME_PATH.length - 1) {
      return GAME_PATH[GAME_PATH.length - 1];
    }

    const current = GAME_PATH[pathIndex];
    const next = GAME_PATH[pathIndex + 1];
    
    return {
      x: current.x + (next.x - current.x) * progress,
      y: current.y + (next.y - current.y) * progress
    };
  };

  const spawnEnemy = useCallback((type: EnemyType) => {
    const config = ENEMY_CONFIGS[type];
    const enemy: Enemy = {
      id: generateId(),
      position: { x: GAME_PATH[0].x, y: GAME_PATH[0].y },
      health: config.health,
      maxHealth: config.health,
      speed: config.speed,
      pathIndex: 0,
      pathProgress: 0,
      type,
      reward: config.reward
    };
    
    setEnemies(prev => [...prev, enemy]);
  }, []);

  const placeTower = useCallback((x: number, y: number, type: TowerType) => {
    const gridX = Math.floor(x / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;
    const gridY = Math.floor(y / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;
    
    // Check if position is valid (not on path, not occupied)
    const isOnPath = GAME_PATH.some(point => 
      Math.abs(point.x - gridX) < GRID_SIZE && Math.abs(point.y - gridY) < GRID_SIZE
    );
    
    const isOccupied = towers.some(tower => 
      Math.abs(tower.position.x - gridX) < GRID_SIZE && Math.abs(tower.position.y - gridY) < GRID_SIZE
    );

    if (isOnPath || isOccupied) return false;

    const config = TOWER_CONFIGS[type];
    if (gameState.gold < config.cost) return false;

    const tower: Tower = {
      id: generateId(),
      position: { x: gridX, y: gridY },
      type,
      level: 1,
      damage: config.damage,
      range: config.range,
      fireRate: config.fireRate,
      lastFired: 0,
      cost: config.cost,
      upgradeCost: config.upgradeCost
    };

    setTowers(prev => [...prev, tower]);
    setGameState(prev => ({ ...prev, gold: prev.gold - config.cost }));
    return true;
  }, [towers, gameState.gold]);

  const upgradeTower = useCallback((towerId: string) => {
    setTowers(prev => prev.map(tower => {
      if (tower.id === towerId && gameState.gold >= tower.upgradeCost) {
        setGameState(state => ({ ...state, gold: state.gold - tower.upgradeCost }));
        return {
          ...tower,
          level: tower.level + 1,
          damage: Math.floor(tower.damage * 1.5),
          range: Math.floor(tower.range * 1.1),
          upgradeCost: Math.floor(tower.upgradeCost * 1.5)
        };
      }
      return tower;
    }));
  }, [gameState.gold]);

  const sellTower = useCallback((towerId: string) => {
    const tower = towers.find(t => t.id === towerId);
    if (tower) {
      const sellPrice = Math.floor(tower.cost * 0.7);
      setTowers(prev => prev.filter(t => t.id !== towerId));
      setGameState(prev => ({ ...prev, gold: prev.gold + sellPrice, selectedTower: null }));
    }
  }, [towers]);

  const startWave = useCallback(() => {
    if (gameState.isPlaying) return;
    
    setGameState(prev => ({ ...prev, isPlaying: true }));
    waveSpawnRef.current = { count: 0, lastSpawn: 0 };
  }, [gameState.isPlaying]);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const gameLoop = useCallback((currentTime: number) => {
    if (!gameState.isPlaying || gameState.isPaused) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // Spawn enemies for current wave
    const currentWave = WAVE_CONFIGS[gameState.wave - 1];
    if (currentWave && waveSpawnRef.current.count < currentWave.enemyCount) {
      if (currentTime - waveSpawnRef.current.lastSpawn > currentWave.spawnDelay) {
        const enemyType = currentWave.enemyTypes[Math.floor(Math.random() * currentWave.enemyTypes.length)];
        spawnEnemy(enemyType);
        waveSpawnRef.current.count++;
        waveSpawnRef.current.lastSpawn = currentTime;
      }
    }

    // Update enemies
    setEnemies(prev => {
      const updated = prev.map(enemy => {
        const config = ENEMY_CONFIGS[enemy.type];
        const moveDistance = config.speed * deltaTime * 0.001 * gameState.gameSpeed;
        
        let newProgress = enemy.pathProgress + moveDistance / 100;
        let newPathIndex = enemy.pathIndex;

        if (newProgress >= 1) {
          newPathIndex++;
          newProgress = 0;
        }

        if (newPathIndex >= GAME_PATH.length - 1) {
          // Enemy reached the end
          setGameState(state => ({ ...state, health: state.health - 10 }));
          return null;
        }

        const newPosition = getPathPosition(newPathIndex, newProgress);
        
        return {
          ...enemy,
          position: newPosition,
          pathIndex: newPathIndex,
          pathProgress: newProgress
        };
      }).filter(Boolean) as Enemy[];

      return updated;
    });

    // Tower shooting logic
    setProjectiles(prev => {
      const newProjectiles = [...prev];
      
      towers.forEach(tower => {
        if (currentTime - tower.lastFired > tower.fireRate) {
          const target = enemies.find(enemy => 
            getDistance(tower.position, enemy.position) <= tower.range
          );
          
          if (target) {
            const projectile: Projectile = {
              id: generateId(),
              position: { ...tower.position },
              target,
              speed: 300,
              damage: tower.damage,
              type: TOWER_CONFIGS[tower.type].projectileType
            };
            
            newProjectiles.push(projectile);
            tower.lastFired = currentTime;
          }
        }
      });

      return newProjectiles;
    });

    // Update projectiles
    setProjectiles(prev => {
      const updated = prev.map(projectile => {
        const target = enemies.find(e => e.id === projectile.target.id);
        if (!target) return null;

        const distance = getDistance(projectile.position, target.position);
        if (distance < 10) {
          // Hit target
          setEnemies(enemyPrev => enemyPrev.map(enemy => {
            if (enemy.id === target.id) {
              const newHealth = enemy.health - projectile.damage;
              if (newHealth <= 0) {
                setGameState(state => ({ 
                  ...state, 
                  gold: state.gold + enemy.reward,
                  score: state.score + enemy.reward * 10
                }));
                return null;
              }
              return { ...enemy, health: newHealth };
            }
            return enemy;
          }).filter(Boolean) as Enemy[]);
          return null;
        }

        const moveDistance = projectile.speed * deltaTime * 0.001;
        const direction = {
          x: (target.position.x - projectile.position.x) / distance,
          y: (target.position.y - projectile.position.y) / distance
        };

        return {
          ...projectile,
          position: {
            x: projectile.position.x + direction.x * moveDistance,
            y: projectile.position.y + direction.y * moveDistance
          }
        };
      }).filter(Boolean) as Projectile[];

      return updated;
    });

    // Check wave completion
    if (currentWave && waveSpawnRef.current.count >= currentWave.enemyCount && enemies.length === 0) {
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        wave: prev.wave + 1,
        gold: prev.gold + currentWave.reward
      }));
    }

    // Check game over
    if (gameState.health <= 0) {
      setGameState(prev => ({ ...prev, isPlaying: false }));
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, enemies, towers, spawnEnemy]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  return {
    gameState,
    setGameState,
    enemies,
    towers,
    projectiles,
    placeTower,
    upgradeTower,
    sellTower,
    startWave,
    pauseGame
  };
};