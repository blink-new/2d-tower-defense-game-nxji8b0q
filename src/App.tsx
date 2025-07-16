import React from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameUI } from './components/GameUI';
import { useGameEngine } from './hooks/useGameEngine';
import { TowerType } from './types/game';

function App() {
  const {
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
  } = useGameEngine();

  const handleTowerSelect = (type: TowerType) => {
    setGameState(prev => ({
      ...prev,
      selectedTowerType: prev.selectedTowerType === type ? null : type,
      selectedTower: null
    }));
  };

  const handleCanvasClick = (x: number, y: number) => {
    // Check if clicking on a tower first
    const clickedTower = towers.find(tower => {
      const distance = Math.sqrt(
        Math.pow(tower.position.x - x, 2) + Math.pow(tower.position.y - y, 2)
      );
      return distance <= 20;
    });

    if (clickedTower) {
      setGameState(prev => ({
        ...prev,
        selectedTower: clickedTower,
        selectedTowerType: null
      }));
      return;
    }

    // Try to place a tower
    if (gameState.selectedTowerType) {
      const success = placeTower(x, y, gameState.selectedTowerType);
      if (success) {
        setGameState(prev => ({ ...prev, selectedTowerType: null }));
      }
    } else {
      // Deselect tower
      setGameState(prev => ({ ...prev, selectedTower: null }));
    }
  };

  const handleSpeedChange = (speed: number) => {
    setGameState(prev => ({ ...prev, gameSpeed: speed }));
  };

  const handleUpgradeTower = () => {
    if (gameState.selectedTower) {
      upgradeTower(gameState.selectedTower.id);
    }
  };

  const handleSellTower = () => {
    if (gameState.selectedTower) {
      sellTower(gameState.selectedTower.id);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-center mb-2">
            Tower Defense
          </h1>
          <p className="text-center text-muted-foreground">
            Defend your base by strategically placing towers to stop enemy waves
          </p>
        </header>

        <div className="flex gap-6 justify-center">
          <div className="flex-shrink-0">
            <GameCanvas
              enemies={enemies}
              towers={towers}
              projectiles={projectiles}
              gameState={gameState}
              onCanvasClick={handleCanvasClick}
            />
          </div>

          <GameUI
            gameState={gameState}
            onTowerSelect={handleTowerSelect}
            onStartWave={startWave}
            onPauseGame={pauseGame}
            onSpeedChange={handleSpeedChange}
            onUpgradeTower={handleUpgradeTower}
            onSellTower={handleSellTower}
          />
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Click on towers to select them • Click empty spaces to place towers • Start waves to begin</p>
        </div>
      </div>
    </div>
  );
}

export default App;