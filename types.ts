
export type Point = {
  x: number;
  y: number;
};

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAMEOVER = 'GAMEOVER'
}

export enum Difficulty {
  LEVEL_1 = 1, // Pass-through walls, no obstacles
  LEVEL_2 = 2, // Lethal walls, no obstacles
  LEVEL_3 = 3, // Pass-through walls, with obstacles
  LEVEL_4 = 4  // Lethal walls, with obstacles
}

export enum Speed {
  EASY = 150,
  NORMAL = 100,
  HARD = 60
}

export interface GameSettings {
  speed: Speed;
  difficulty: Difficulty;
}

export interface GameState {
  snake: Point[];
  food: Point;
  obstacles: Point[];
  direction: Point;
  nextDirection: Point;
  score: number;
  bestScore: number;
  status: GameStatus;
}
