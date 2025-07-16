import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { GameState, TowerType } from '../types/game';
import { TOWER_CONFIGS } from '../utils/gameConfig';
import { 
  Play, 
  Pause, 
  FastForward, 
  Heart, 
  Coins, 
  Zap,
  Target,
  Snowflake,
  Circle
} from 'lucide-react';

interface GameUIProps {
  gameState: GameState;
  onTowerSelect: (type: TowerType) => void;
  onStartWave: () => void;
  onPauseGame: () => void;
  onSpeedChange: (speed: number) => void;
  onUpgradeTower: () => void;
  onSellTower: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  gameState,
  onTowerSelect,
  onStartWave,
  onPauseGame,
  onSpeedChange,
  onUpgradeTower,
  onSellTower
}) => {
  const towerIcons = {
    basic: Target,
    cannon: Circle,
    ice: Snowflake,
    lightning: Zap
  };

  const getTowerIcon = (type: TowerType) => {
    const Icon = towerIcons[type];
    return <Icon className="w-6 h-6" />;
  };

  return (
    <div className="flex flex-col gap-4 w-80">
      {/* Game Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Game Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span>Health</span>
            </div>
            <Badge variant={gameState.health > 50 ? "default" : "destructive"}>
              {gameState.health}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              <span>Gold</span>
            </div>
            <Badge variant="secondary">{gameState.gold}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Wave</span>
            <Badge variant="outline">{gameState.wave}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Score</span>
            <Badge variant="outline">{gameState.score}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Game Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={onStartWave}
              disabled={gameState.isPlaying}
              className="flex-1"
              variant={gameState.isPlaying ? "secondary" : "default"}
            >
              <Play className="w-4 h-4 mr-2" />
              {gameState.isPlaying ? "Wave Active" : "Start Wave"}
            </Button>
            
            <Button
              onClick={onPauseGame}
              disabled={!gameState.isPlaying}
              variant="outline"
              size="icon"
            >
              <Pause className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => onSpeedChange(1)}
              variant={gameState.gameSpeed === 1 ? "default" : "outline"}
              size="sm"
              className="flex-1"
            >
              1x
            </Button>
            <Button
              onClick={() => onSpeedChange(2)}
              variant={gameState.gameSpeed === 2 ? "default" : "outline"}
              size="sm"
              className="flex-1"
            >
              2x
            </Button>
            <Button
              onClick={() => onSpeedChange(3)}
              variant={gameState.gameSpeed === 3 ? "default" : "outline"}
              size="sm"
              className="flex-1"
            >
              3x
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tower Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Towers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(Object.keys(TOWER_CONFIGS) as TowerType[]).map(type => {
            const config = TOWER_CONFIGS[type];
            const canAfford = gameState.gold >= config.cost;
            const isSelected = gameState.selectedTowerType === type;
            
            return (
              <Button
                key={type}
                onClick={() => onTowerSelect(type)}
                disabled={!canAfford}
                variant={isSelected ? "default" : "outline"}
                className="w-full justify-start h-auto p-3"
              >
                <div className="flex items-center gap-3 w-full">
                  {getTowerIcon(type)}
                  <div className="flex-1 text-left">
                    <div className="font-medium capitalize">{type} Tower</div>
                    <div className="text-sm text-muted-foreground">
                      Damage: {config.damage} | Range: {config.range}
                    </div>
                  </div>
                  <Badge variant={canAfford ? "secondary" : "destructive"}>
                    ${config.cost}
                  </Badge>
                </div>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Selected Tower Info */}
      {gameState.selectedTower && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Selected Tower</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              {getTowerIcon(gameState.selectedTower.type)}
              <span className="font-medium capitalize">
                {gameState.selectedTower.type} Tower (Level {gameState.selectedTower.level})
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Damage:</span>
                <span>{gameState.selectedTower.damage}</span>
              </div>
              <div className="flex justify-between">
                <span>Range:</span>
                <span>{gameState.selectedTower.range}</span>
              </div>
              <div className="flex justify-between">
                <span>Fire Rate:</span>
                <span>{gameState.selectedTower.fireRate}ms</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={onUpgradeTower}
                disabled={gameState.gold < gameState.selectedTower.upgradeCost}
                className="flex-1"
                size="sm"
              >
                Upgrade (${gameState.selectedTower.upgradeCost})
              </Button>
              <Button
                onClick={onSellTower}
                variant="destructive"
                size="sm"
              >
                Sell
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Over */}
      {gameState.health <= 0 && (
        <Card className="border-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-red-500">Game Over!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p>Final Score: {gameState.score}</p>
              <p>Waves Completed: {gameState.wave - 1}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};