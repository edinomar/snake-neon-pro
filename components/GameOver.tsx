
import React from 'react';

interface GameOverProps {
  score: number;
  bestScore: number;
  onRestart: () => void;
  onMenu: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, bestScore, onRestart, onMenu }) => {
  const isNewRecord = score >= bestScore && score > 0;

  return (
    <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border-2 border-red-500/30 rounded-[3rem] p-10 shadow-[0_0_60px_rgba(239,68,68,0.2)] text-center animate-in slide-in-from-bottom duration-500">
      <div className="text-6xl mb-6">💀</div>
      <h2 className="text-5xl font-black font-orbitron text-red-500 mb-8 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
        GAME OVER
      </h2>

      <div className="space-y-6 mb-10">
        <div className="bg-slate-800/50 rounded-3xl p-4">
          <div className="text-slate-400 text-sm uppercase tracking-widest font-bold">Your Score</div>
          <div className={`text-4xl font-orbitron font-bold ${isNewRecord ? 'text-yellow-400' : 'text-cyan-400'}`}>
            {score}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-3xl p-4">
          <div className="text-slate-400 text-sm uppercase tracking-widest font-bold">Best Record</div>
          <div className="text-4xl font-orbitron font-bold text-fuchsia-500">
            {bestScore}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={onRestart}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-orbitron font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        >
          PLAY AGAIN
        </button>
        <button
          onClick={onMenu}
          className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-orbitron font-bold text-xl text-slate-300 transition-all"
        >
          MAIN MENU
        </button>
      </div>
      
      {isNewRecord && (
        <div className="mt-8 text-yellow-400 font-bold animate-pulse text-sm">
          🎉 INCREDIBLE! NEW RECORD! 🎉
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-white/5">
        <a 
          href="https://techsync.net.br/categories/docs/politica-jogos.html" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[9px] text-slate-600 hover:text-red-400 transition-colors uppercase font-bold tracking-[0.2em]"
        >
          Privacy & Security Policy
        </a>
      </div>
    </div>
  );
};

export default GameOver;
