
import React, { useState, useRef, useEffect } from 'react';
import { GameSettings, Speed, Difficulty } from '../types';
import { soundManager } from '../utils/audio';

interface Option {
  value: number;
  label: string;
  icon: string;
}

interface CustomDropdownProps {
  label: string;
  options: Option[];
  value: number;
  onChange: (value: number) => void;
  accentColor: 'cyan' | 'fuchsia';
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ label, options, value, onChange, accentColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value);

  const colors = {
    cyan: {
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.2)]',
      focus: 'border-cyan-400',
    },
    fuchsia: {
      border: 'border-fuchsia-500/30',
      text: 'text-fuchsia-400',
      bg: 'bg-fuchsia-500/10',
      shadow: 'shadow-[0_0_15px_rgba(217,70,239,0.2)]',
      focus: 'border-fuchsia-400',
    }
  };

  const activeColor = colors[accentColor];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className={`block ${activeColor.text} text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-1 opacity-80`}>
        {label}
      </label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-slate-900/60 backdrop-blur-md border ${isOpen ? activeColor.focus : 'border-slate-800'} rounded-2xl py-4 px-5 transition-all duration-300 ${isOpen ? activeColor.shadow : ''} active:scale-[0.98]`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl filter drop-shadow-sm">{selectedOption?.icon}</span>
          <span className="font-bold text-slate-100 text-sm tracking-wide">{selectedOption?.label}</span>
        </div>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'} ${activeColor.text}`}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
      </button>

      <div className={`absolute left-0 right-0 mt-2 z-50 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 origin-top shadow-2xl ${
        isOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'
      }`}>
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              onChange(opt.value);
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/5 active:bg-white/10 ${
              value === opt.value ? activeColor.bg : ''
            }`}
          >
            <span className="text-xl">{opt.icon}</span>
            <span className={`font-bold text-sm ${value === opt.value ? activeColor.text : 'text-slate-400'}`}>
              {opt.label}
            </span>
            {value === opt.value && (
              <div className={`ml-auto w-1.5 h-1.5 rounded-full ${activeColor.text} ${activeColor.bg} shadow-[0_0_8px_currentColor]`}></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

interface MainMenuProps {
  onStart: (settings: GameSettings) => void;
  bestScore: number;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, bestScore }) => {
  const [speed, setSpeed] = useState<Speed>(Speed.NORMAL);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.LEVEL_1);
  const [isMuted, setIsMuted] = useState(soundManager.getMuteState());

  const handleToggleMute = () => {
    soundManager.resumeContext();
    setIsMuted(soundManager.toggleMute());
  };

  const speedOptions = [
    { value: Speed.EASY, label: 'Slow Velocity', icon: '🐌' },
    { value: Speed.NORMAL, label: 'Standard Speed', icon: '⚡' },
    { value: Speed.HARD, label: 'Turbo Reflex', icon: '🚀' }
  ];

  const diffOptions = [
    { value: Difficulty.LEVEL_1, label: 'Ghost Walls', icon: '🌀' },
    { value: Difficulty.LEVEL_2, label: 'Steel Borders', icon: '🧱' },
    { value: Difficulty.LEVEL_3, label: 'Lethal Spikes', icon: '🎯' },
    { value: Difficulty.LEVEL_4, label: 'Hardcore Mode', icon: '💀' }
  ];

  const handleStart = async () => {
    await soundManager.resumeContext();
    soundManager.startMusic();
    onStart({ speed, difficulty });
  };

  return (
    <div className="w-full max-w-sm bg-slate-950/60 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-700 flex flex-col items-center">
      
      {/* Ícone de Som - Pequeno e Redondo (Canto Inferior Esquerdo) */}
      <button 
        onClick={handleToggleMute}
        className="fixed bottom-8 left-8 p-3 bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-700 text-slate-400 active:scale-90 transition-all z-50 shadow-lg"
      >
        {isMuted ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        )}
      </button>

      <div className="mb-12 text-center relative">
        <div className="absolute -inset-4 bg-cyan-500/20 blur-3xl rounded-full opacity-50 animate-pulse"></div>
        <h1 className="relative text-5xl font-black font-orbitron tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-400 to-blue-600 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
          SNAKE
          <br />
          NEON
        </h1>
        <p className="relative text-[9px] text-cyan-400/80 uppercase tracking-[0.5em] mt-2 font-black">Professional Edition</p>
      </div>

      <div className="w-full space-y-6">
        <CustomDropdown 
          label="Game Velocity" 
          options={speedOptions} 
          value={speed} 
          onChange={(val) => setSpeed(val as Speed)} 
          accentColor="cyan"
        />

        <CustomDropdown 
          label="Combat Zone" 
          options={diffOptions} 
          value={difficulty} 
          onChange={(val) => setDifficulty(val as Difficulty)} 
          accentColor="fuchsia"
        />
      </div>

      <div className="mt-12 w-full flex flex-col gap-6">
        <button
          onClick={handleStart}
          className="group relative w-full py-5 bg-slate-100 rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(6,182,212,0.3)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 transition-opacity"></div>
          <span className="relative font-orbitron font-black text-xl text-white tracking-widest drop-shadow-md">
            START GAME
          </span>
        </button>
        
        <div className="flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
          <div className="flex flex-col items-center">
             <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">High Record</span>
             <span className="text-fuchsia-400 font-orbitron font-bold text-xl drop-shadow-[0_0_10px_rgba(217,70,239,0.4)]">{bestScore}</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
        </div>

        <div className="flex flex-col items-center mt-2">
          <a 
            href="https://techsync.net.br/categories/docs/politica-jogos.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[10px] text-slate-600 hover:text-cyan-400 transition-colors uppercase font-bold tracking-widest"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
