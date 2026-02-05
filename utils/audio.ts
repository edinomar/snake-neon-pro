
class SoundManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private isMuted: boolean = false;
  private beatInterval: number | null = null;

  constructor() {
    this.isMuted = localStorage.getItem('snakeMuted') === 'true';
  }

  private init() {
    if (!this.ctx) {
      // @ts-ignore
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public async resumeContext() {
    const ctx = this.init();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('snakeMuted', String(this.isMuted));
    if (this.isMuted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.isMuted;
  }

  getMuteState() {
    return this.isMuted;
  }

  playCollect() {
    if (this.isMuted) return;
    const ctx = this.init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  playGameOver() {
    if (this.isMuted) return;
    const ctx = this.init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  }

  startMusic() {
    if (this.isMuted) return;
    const ctx = this.init();
    if (this.beatInterval) return;

    this.musicGain = ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.05, ctx.currentTime);
    this.musicGain.connect(ctx.destination);

    const playBeat = () => {
      if (this.isMuted || !this.musicGain || !this.ctx) return;
      
      const time = this.ctx.currentTime;
      
      // Kick/Bass Beat
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.2);
      
      g.gain.setValueAtTime(0.2, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
      
      osc.connect(g);
      g.connect(this.musicGain);
      osc.start(time);
      osc.stop(time + 0.3);

      // Neon Synth Pulse
      const synth = this.ctx.createOscillator();
      const sg = this.ctx.createGain();
      synth.type = 'square';
      synth.frequency.setValueAtTime(110, time);
      sg.gain.setValueAtTime(0.02, time);
      sg.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      synth.connect(sg);
      sg.connect(this.musicGain);
      synth.start(time);
      synth.stop(time + 0.1);
    };

    // Toca um beat a cada 500ms (120 BPM)
    playBeat();
    this.beatInterval = window.setInterval(playBeat, 500);
  }

  stopMusic() {
    if (this.beatInterval) {
      window.clearInterval(this.beatInterval);
      this.beatInterval = null;
    }
    if (this.musicGain) {
      this.musicGain.disconnect();
      this.musicGain = null;
    }
  }
}

export const soundManager = new SoundManager();
