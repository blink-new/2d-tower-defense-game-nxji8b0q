import React, { useRef, useEffect } from 'react';
import { Enemy, Tower, Projectile, GameState } from '../types/game';
import { ENEMY_CONFIGS, TOWER_CONFIGS, GAME_PATH, CANVAS_WIDTH, CANVAS_HEIGHT, GRID_SIZE } from '../utils/gameConfig';

interface GameCanvasProps {
  enemies: Enemy[];
  towers: Tower[];
  projectiles: Projectile[];
  gameState: GameState;
  onCanvasClick: (x: number, y: number) => void;
}

const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    
    for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
};

const drawPath = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 30;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(GAME_PATH[0].x, GAME_PATH[0].y);
    
    for (let i = 1; i < GAME_PATH.length; i++) {
      ctx.lineTo(GAME_PATH[i].x, GAME_PATH[i].y);
    }
    
    ctx.stroke();
    
    // Draw path borders
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 34;
    ctx.beginPath();
    ctx.moveTo(GAME_PATH[0].x, GAME_PATH[0].y);
    
    for (let i = 1; i < GAME_PATH.length; i++) {
      ctx.lineTo(GAME_PATH[i].x, GAME_PATH[i].y);
    }
    
    ctx.stroke();
};

const drawEnemy = (ctx: CanvasRenderingContext2D, enemy: Enemy) => {
    const config = ENEMY_CONFIGS[enemy.type];
    
    // Draw enemy body
    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.arc(enemy.position.x, enemy.position.y, config.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw health bar
    const barWidth = config.size * 2;
    const barHeight = 4;
    const healthPercent = enemy.health / enemy.maxHealth;
    
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(
      enemy.position.x - barWidth / 2,
      enemy.position.y - config.size - 8,
      barWidth,
      barHeight
    );
    
    ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : healthPercent > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(
      enemy.position.x - barWidth / 2,
      enemy.position.y - config.size - 8,
      barWidth * healthPercent,
      barHeight
    );
};

const drawTower = (ctx: CanvasRenderingContext2D, tower: Tower, gameState: GameState) => {
    const config = TOWER_CONFIGS[tower.type];
    
    // Draw range if selected
    if (gameState.selectedTower?.id === tower.id || gameState.showRange) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(tower.position.x, tower.position.y, tower.range, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Draw tower base
    ctx.fillStyle = '#374151';
    ctx.beginPath();
    ctx.arc(tower.position.x, tower.position.y, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw tower
    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.arc(tower.position.x, tower.position.y, 14, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw level indicator
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(
      tower.level.toString(),
      tower.position.x,
      tower.position.y + 4
    );
};

const drawProjectile = (ctx: CanvasRenderingContext2D, projectile: Projectile) => {
    const colors = {
      bullet: '#64748b',
      cannonball: '#dc2626',
      ice: '#0ea5e9',
      lightning: '#eab308'
    };
    
    ctx.fillStyle = colors[projectile.type];
    ctx.beginPath();
    ctx.arc(projectile.position.x, projectile.position.y, 4, 0, Math.PI * 2);
    ctx.fill();
};

export const GameCanvas: React.FC<GameCanvasProps> = ({
  enemies,
  towers,
  projectiles,
  gameState,
  onCanvasClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw game elements
    drawGrid(ctx);
    drawPath(ctx);
    
    // Draw towers
    towers.forEach(tower => drawTower(ctx, tower, gameState));
    
    // Draw enemies
    enemies.forEach(enemy => drawEnemy(ctx, enemy));
    
    // Draw projectiles
    projectiles.forEach(projectile => drawProjectile(ctx, projectile));
    
    // Draw placement preview
    if (gameState.selectedTowerType) {
      const rect = canvas.getBoundingClientRect();
      // This would need mouse position tracking for preview
    }
  }, [enemies, towers, projectiles, gameState]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    onCanvasClick(x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="game-canvas cursor-crosshair"
      onClick={handleCanvasClick}
    />
  );
};