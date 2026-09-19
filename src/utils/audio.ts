// Web Audio API sound alerts and microphone real-time analyser

class SoundAlertManager {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playAnomalyAlert(type: 'chattering' | 'pressure_loss' = 'chattering') {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const now = this.ctx.currentTime;
      if (type === 'chattering') {
        // High frequency double bleep for switch chattering
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.04);
        osc.frequency.setValueAtTime(880, now + 0.06);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
      } else {
        // Lower tone for pressure drop
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }
}

export const soundManager = new SoundAlertManager();

export class MicrophoneSensor {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;
  private animationId: number | null = null;
  private onLevelCallback: ((db: number, peak: number, volume: number) => void) | null = null;
  private peak: number = -60;

  public async start(onLevel: (db: number, peak: number, volume: number) => void): Promise<boolean> {
    try {
      this.stop();
      this.onLevelCallback = onLevel;

      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.source = this.ctx.createMediaStreamSource(this.stream);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.8;

      this.source.connect(this.analyser);
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(new ArrayBuffer(bufferLength));

      const loop = () => {
        if (!this.analyser || !this.dataArray) return;
        this.analyser.getByteTimeDomainData(this.dataArray);

        // Compute RMS
        let sumSquares = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
          const norm = (this.dataArray[i] - 128) / 128;
          sumSquares += norm * norm;
        }
        const rms = Math.sqrt(sumSquares / this.dataArray.length);

        // Convert to dB (-60 dB noise floor to 0 dB)
        let db = 20 * Math.log10(Math.max(rms, 0.0001));
        if (db < -60) db = -60;
        if (db > 0) db = 0;

        if (db > this.peak) {
          this.peak = db;
        } else {
          this.peak = Math.max(-60, this.peak - 0.25);
        }

        // 0 to 1 volume
        const volume = Math.min(1, Math.max(0, (db + 60) / 60));

        if (this.onLevelCallback) {
          this.onLevelCallback(Math.round(db * 10) / 10, Math.round(this.peak * 10) / 10, volume);
        }

        this.animationId = requestAnimationFrame(loop);
      };

      this.animationId = requestAnimationFrame(loop);
      return true;
    } catch {
      return false;
    }
  }

  public stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
    this.analyser = null;
    this.peak = -60;
  }
}
