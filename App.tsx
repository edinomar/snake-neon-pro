
import React, { useState, useEffect, useCallback } from 'react';
import { GameStatus, Difficulty, Speed, GameSettings } from './types';
import GameView from './components/GameView';
import MainMenu from './components/MainMenu';
import GameOver from './components/GameOver';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [settings, setSettings] = useState<GameSettings>({
    speed: Speed.NORMAL,
    difficulty: Difficulty.LEVEL_1
  });
  const [lastScore, setLastScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    try {
      const saved = localStorage.getItem('snakeBestScore');
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      return 0;
    }
  });

  const handleStartGame = (newSettings: GameSettings) => {
    setSettings(newSettings);
    setStatus(GameStatus.PLAYING);
  };

  const handleGameOver = useCallback((score: number) => {
    setLastScore(score);
    setBestScore((prevBest) => {
      if (score > prevBest) {
        localStorage.setItem('snakeBestScore', score.toString());
        return score;
      }
      return prevBest;
    });
    setStatus(GameStatus.GAMEOVER);
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center overflow-hidden touch-none p-4">
      {status === GameStatus.IDLE && (
        <MainMenu onStart={handleStartGame} bestScore={bestScore} />
      )}
      
      {(status === GameStatus.PLAYING || status === GameStatus.PAUSED) && (
        <GameView 
          settings={settings} 
          onGameOver={handleGameOver} 
          onExit={() => setStatus(GameStatus.IDLE)}
          bestScore={bestScore}
        />
      )}

      {status === GameStatus.GAMEOVER && (
        <GameOver 
          score={lastScore} 
          bestScore={bestScore} 
          onRestart={() => setStatus(GameStatus.PLAYING)}
          onMenu={() => setStatus(GameStatus.IDLE)}
        />
      )}
    </div>
  );
};

export default App;
