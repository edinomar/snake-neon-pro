
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameSettings, Point, GameStatus, Difficulty, Speed } from '../types';
import { GRID_SIZE, DESKTOP_TILE_COUNT, MOBILE_TILE_COUNT, DIRECTIONS, COLORS } from '../constants';
import { soundManager } from '../utils/audio';

interface GameViewProps {
  settings: GameSettings;
  onGameOver: (score: number) => void;
  onExit: () => void;
  bestScore: number;
}

const GameView: React.FC<GameViewProps> = ({ settings, onGameOver, onExit, bestScore }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const tileCount = isMobile ? MOBILE_TILE_COUNT : DESKTOP_TILE_COUNT;
  
  const [snake, setSnake] = useState<Point[]>([]);
  const [food, setFood] = useState<Point>({ x: 0, y: 0 });
  const [obstacles, setObstacles] = useState<Point[]>([]);
  const [direction, setDirection] = useState<Point>(DIRECTIONS.RIGHT);
  const [nextDirection, setNextDirection] = useState<Point>(DIRECTIONS.RIGHT);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<GameStatus>(GameStatus.PLAYING);
  const [isMuted, setIsMuted] = useState(soundManager.getMuteState());

  const snakeRef = useRef(snake);
  const directionRef = useRef(direction);
  const nextDirectionRef = useRef(nextDirection);
  const scoreRef = useRef(score);

  useEffect(() => {
    snakeRef.current = snake;
    directionRef.current = direction;
    nextDirectionRef.current = nextDirection;
    scoreRef.current = score;
  }, [snake, direction, nextDirection, score]);

  const generatePoint = useCallback((occupied: Point[]) => {
    let p: Point;
    let isOccupied = true;
    while (isOccupied) {
      p = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
      };
      isOccupied = occupied.some(o => o.x === p.x && o.y === p.y);
      if (!isOccupied) return p;
    }
    return { x: 0, y: 0 };
  }, [tileCount]);

  const initGame = useCallback(() => {
    const startX = Math.floor(tileCount / 3);
    const startY = Math.floor(tileCount / 3);
    const initialSnake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY }
    ];
    
    let initialObstacles: Point[] = [];
    if (settings.difficulty === Difficulty.LEVEL_3 || settings.difficulty === Difficulty.LEVEL_4) {
      const obstacleCount = Math.floor(tileCount * 0.6);
      for (let i = 0; i < obstacleCount; i++) {
        initialObstacles.push(generatePoint([...initialSnake, ...initialObstacles]));
      }
    }

    setSnake(initialSnake);
    setObstacles(initialObstacles);
    setFood(generatePoint([...initialSnake, ...initialObstacles]));
    setDirection(DIRECTIONS.RIGHT);
    setNextDirection(DIRECTIONS.RIGHT);
    setScore(0);
    setStatus(GameStatus.PLAYING);
    soundManager.startMusic();
  }, [settings.difficulty, tileCount, generatePoint]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleGameOverInternal = useCallback(() => {
    soundManager.playGameOver();
    soundManager.stopMusic();
    onGameOver(scoreRef.current);
  }, [onGameOver]);

  const update = useCallback(() => {
    if (status !== GameStatus.PLAYING) return;

    const currentDirection = nextDirectionRef.current;
    setDirection(currentDirection);
    
    const head = { 
      x: snakeRef.current[0].x + currentDirection.x, 
      y: snakeRef.current[0].y + currentDirection.y 
    };

    if (settings.difficulty === Difficulty.LEVEL_1 || settings.difficulty === Difficulty.LEVEL_3) {
      if (head.x < 0) head.x = tileCount - 1;
      if (head.x >= tileCount) head.x = 0;
      if (head.y < 0) head.y = tileCount - 1;
      if (head.y >= tileCount) head.y = 0;
    } else {
      if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        handleGameOverInternal();
        return;
      }
    }

    if (snakeRef.current.some(s => s.x === head.x && s.y === head.y)) {
      handleGameOverInternal();
      return;
    }

    if (obstacles.some(o => o.x === head.x && o.y === head.y)) {
      handleGameOverInternal();
      return;
    }

    const newSnake = [head, ...snakeRef.current];

    if (head.x === food.x && head.y === food.y) {
      soundManager.playCollect();
      const newScore = scoreRef.current + 10;
      setScore(newScore);
      setFood(generatePoint([...newSnake, ...obstacles]));
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [status, settings.difficulty, tileCount, food, obstacles, generatePoint, handleGameOverInternal]);

  useEffect(() => {
    const interval = setInterval(update, settings.speed);
    return () => clearInterval(interval);
  }, [update, settings.speed]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp': if (directionRef.current !== DIRECTIONS.DOWN) setNextDirection(DIRECTIONS.UP); break;
      case 'ArrowDown': if (directionRef.current !== DIRECTIONS.UP) setNextDirection(DIRECTIONS.DOWN); break;
      case 'ArrowLeft': if (directionRef.current !== DIRECTIONS.RIGHT) setNextDirection(DIRECTIONS.LEFT); break;
      case 'ArrowRight': if (directionRef.current !== DIRECTIONS.LEFT) setNextDirection(DIRECTIONS.RIGHT); break;
      case 'Escape': onExit(); break;
    }
  }, [onExit]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = tileCount * GRID_SIZE;
    ctx.clearRect(0, 0, size, size);

    ctx.strokeStyle = COLORS.GRID;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= tileCount; i++) {
      ctx.beginPath(); ctx.moveTo(i * GRID_SIZE, 0); ctx.lineTo(i * GRID_SIZE, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * GRID_SIZE); ctx.lineTo(size, i * GRID_SIZE, size); ctx.stroke();
    }

    if (settings.difficulty === Difficulty.LEVEL_2 || settings.difficulty === Difficulty.LEVEL_4) {
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4; ctx.strokeRect(0, 0, size, size);
    }

    obstacles.forEach(obs => {
      ctx.fillStyle = COLORS.ORANGE;
      ctx.shadowBlur = 10; ctx.shadowColor = COLORS.ORANGE;
      ctx.fillRect(obs.x * GRID_SIZE + 2, obs.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
    });

    const foodPulse = 1 + Math.sin(Date.now() / 200) * 0.15;
    ctx.fillStyle = COLORS.MAGENTA;
    ctx.shadowBlur = 20; ctx.shadowColor = COLORS.MAGENTA;
    ctx.beginPath();
    ctx.arc(food.x * GRID_SIZE + GRID_SIZE / 2, food.y * GRID_SIZE + GRID_SIZE / 2, (GRID_SIZE / 2 - 2) * foodPulse, 0, Math.PI * 2);
    ctx.fill();

    snake.forEach((segment, i) => {
      ctx.fillStyle = i === 0 ? COLORS.CYAN : `rgba(6, 182, 212, ${1 - (i / snake.length) * 0.7})`;
      ctx.shadowBlur = i === 0 ? 15 : 5;
      ctx.shadowColor = COLORS.CYAN;
      ctx.fillRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    });
    ctx.shadowBlur = 0;
  }, [snake, food, obstacles, tileCount, settings.difficulty]);

  const touchStart = useRef<Point | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.touches[0].clientX - touchStart.current.x;
    const dy = e.touches[0].clientY - touchStart.current.y;
    const threshold = 25;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > threshold) {
        if (dx > 0 && directionRef.current !== DIRECTIONS.LEFT) setNextDirection(DIRECTIONS.RIGHT);
        else if (dx < 0 && directionRef.current !== DIRECTIONS.RIGHT) setNextDirection(DIRECTIONS.LEFT);
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    } else {
      if (Math.abs(dy) > threshold) {
        if (dy > 0 && directionRef.current !== DIRECTIONS.UP) setNextDirection(DIRECTIONS.DOWN);
        else if (dy < 0 && directionRef.current !== DIRECTIONS.DOWN) setNextDirection(DIRECTIONS.UP);
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }
  };

  const isCurrentNewRecord = score > bestScore;

  return (
    <div className="flex flex-col items-center w-full h-full safe-top pb-4">
      
      <div className="w-full flex justify-between items-center px-6 py-4">
        <button onClick={onExit} className="p-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-400 active:scale-95">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>
        </button>
        
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-cyan-500/20 px-4 py-1 rounded-full flex flex-col items-center min-w-[60px]">
            <span className="text-[8px] text-slate-500 uppercase font-black">Score</span>
            <span className={`${isCurrentNewRecord ? 'text-yellow-400' : 'text-cyan-400'} font-orbitron text-sm font-bold transition-colors`}>{score}</span>
          </div>
          <div className="bg-slate-900 border border-fuchsia-500/20 px-4 py-1 rounded-full flex flex-col items-center min-w-[60px]">
            <span className="text-[8px] text-slate-500 uppercase font-black">Best</span>
            <span className="text-fuchsia-400 font-orbitron text-sm font-bold">{Math.max(score, bestScore)}</span>
          </div>
        </div>

        {/* Ícone de Som - Pequeno e Redondo (Parte Superior/Header) */}
        <button 
          onClick={() => setIsMuted(soundManager.toggleMute())}
          className="p-2.5 bg-slate-900 border border-slate-700 rounded-full text-slate-400 active:scale-90 transition-all shadow-lg"
        >
          {isMuted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          )}
        </button>
      </div>

      {/* Tabuleiro elevado alterando items-center para items-start e pt-6 */}
      <div 
        className="flex-1 w-full flex items-start justify-center p-4 pt-6"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div className="relative bg-slate-900 border-2 border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.1)]">
          <canvas 
            ref={canvasRef} 
            width={tileCount * GRID_SIZE} 
            height={tileCount * GRID_SIZE}
            className="block max-w-full h-auto aspect-square rounded-2xl"
            onClick={() => setStatus(prev => prev === GameStatus.PLAYING ? GameStatus.PAUSED : GameStatus.PLAYING)}
          />
          
          {status === GameStatus.PAUSED && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-4xl font-orbitron text-cyan-400 animate-pulse tracking-widest">PAUSE</div>
                <div className="text-slate-400 text-xs mt-2 uppercase tracking-[0.3em]">Tap to Resume</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isMobile && (
        <div className="w-full px-8 flex justify-center mt-2 opacity-30">
          <div className="w-full h-1 bg-slate-800 rounded-full relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-cyan-500/50 w-full animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
};

export default GameView;
