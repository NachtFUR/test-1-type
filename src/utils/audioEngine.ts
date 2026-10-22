/**
 * Authentic Mechanical Typewriter Acoustic Synthesizer via Web Audio API.
 * High-fidelity physical modeling of 19th/early 20th century typewriter mechanics:
 * key lever linkages, typebar slotted guide snaps, platen rubber/paper impacts,
 * resonant steel harmonics, and the iconic escapement pawl star-wheel trip.
 */

export type TypewriterModel = 'remington1888' | 'royal1910' | 'underwood1930';

class MechanicalAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.9;
  private bellEnabled: boolean = true;
  private model: TypewriterModel = 'remington1888';
  private isUnlocked: boolean = false;

  // Pre-cached procedural impulse buffers for latency-free, crisp mechanical strikes
  private strikeBuffers: Map<string, AudioBuffer[]> = new Map();
  private spacebarBuffers: AudioBuffer[] = [];
  private backspaceBuffers: AudioBuffer[] = [];

  // Ambient sound sources
  private ambientType: 'none' | 'fireplace' | 'rain' | 'clock' = 'none';
  private ambientGain: GainNode | null = null;
  private ambientStopFn: (() => void) | null = null;
  private ambientVolume: number = 0.35;

  constructor() {
    // Passive unlock listener on first user interaction
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.unlockAudio();
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
      };
      window.addEventListener('keydown', unlock, { once: true, passive: true });
      window.addEventListener('pointerdown', unlock, { once: true, passive: true });
      window.addEventListener('click', unlock, { once: true, passive: true });
      window.addEventListener('touchstart', unlock, { once: true, passive: true });
    }
  }

  public getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx({ latencyHint: 'interactive' });
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlockAudio() {
    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      this.isUnlocked = true;
    } catch {
      // ignore
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(muted ? 0 : this.ambientVolume, this.ctx.currentTime);
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume() {
    return this.volume;
  }

  public setBellEnabled(enabled: boolean) {
    this.bellEnabled = enabled;
  }

  public getBellEnabled() {
    return this.bellEnabled;
  }

  public setModel(model: TypewriterModel) {
    this.model = model;
  }

  public getModel() {
    return this.model;
  }

  /**
   * Generates a physical acoustic model of a typewriter key strike.
   * Models the 4 key physical phases:
   * 1. Key lever trip & linkage friction
   * 2. High-velocity steel hammer impact against paper and rubber platen
   * 3. Steel typebar vibrational resonance (modal frequencies)
   * 4. Escapement star-wheel release pawl click (15-25ms later)
   */
  public playKeyStroke(char?: string) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    // Pitch & timbre jitter based on character or random variance
    const charCode = char ? char.charCodeAt(0) : Math.floor(Math.random() * 120);
    const variance = ((charCode * 19) % 31) - 15; // -15 to +15%
    const pitchFactor = 1 + variance * 0.015;

    // Master gain for this individual keystroke
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume, now);
    masterGain.connect(ctx.destination);

    // --- PHASE 1: STEEL TYPEBAR HAMMER IMPACT (0ms) ---
    // Physical profile per model
    let primaryImpactFreq = 3400; // sharp metallic click
    let platenThumpFreq = 140;    // heavy cast-iron/rubber platen
    let escapementDelay = 0.022;  // pawl click delay in seconds
    let steelRingFreq = 1850;     // ringing steel typebar
    let metalGain = 0.8;

    if (this.model === 'remington1888') {
      // 1888 Heavy Cast Iron Remington No. 2: deep, solid, heavy platen thud
      primaryImpactFreq = 2800 * pitchFactor;
      platenThumpFreq = 120;
      escapementDelay = 0.026;
      steelRingFreq = 1600 * pitchFactor;
      metalGain = 0.95;
    } else if (this.model === 'royal1910') {
      // 1910 Royal Aristocrat: crisp, snappy, high-pitched mechanical snap
      primaryImpactFreq = 3900 * pitchFactor;
      platenThumpFreq = 160;
      escapementDelay = 0.018;
      steelRingFreq = 2200 * pitchFactor;
      metalGain = 0.85;
    } else if (this.model === 'underwood1930') {
      // 1930 Underwood No. 5: classic rhythmic typewriter clack-clack
      primaryImpactFreq = 3300 * pitchFactor;
      platenThumpFreq = 135;
      escapementDelay = 0.020;
      steelRingFreq = 1900 * pitchFactor;
      metalGain = 0.88;
    }

    // 1. Sharp Hard-Surface Impact Transient (Bandpassed noise with steep decay)
    const noiseDuration = 0.045;
    const noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * noiseDuration), ctx.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      // Exponential decay envelope directly baked into the sample
      const decay = Math.exp(-i / (ctx.sampleRate * 0.008));
      noiseData[i] = (Math.random() * 2 - 1) * decay;
    }

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(primaryImpactFreq, now);
    noiseFilter.Q.setValueAtTime(3.2, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(metalGain * 1.2, now);

    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSrc.start(now);

    // 2. Heavy Rubber Platen Cylinder Thump (Deep, visceral physical body impact)
    const platenOsc = ctx.createOscillator();
    platenOsc.type = 'triangle';
    platenOsc.frequency.setValueAtTime(platenThumpFreq * pitchFactor, now);
    platenOsc.frequency.exponentialRampToValueAtTime(45, now + 0.038);

    const platenGain = ctx.createGain();
    platenGain.gain.setValueAtTime(0.7, now);
    platenGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    platenOsc.connect(platenGain);
    platenGain.connect(masterGain);
    platenOsc.start(now);
    platenOsc.stop(now + 0.04);

    // 3. Resonant Steel Typebar Ringing (Harmonic metal ping)
    const ringOsc = ctx.createOscillator();
    ringOsc.type = 'sine';
    ringOsc.frequency.setValueAtTime(steelRingFreq, now);

    const ringGain = ctx.createGain();
    ringGain.gain.setValueAtTime(0.35 * metalGain, now);
    ringGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

    ringOsc.connect(ringGain);
    ringGain.connect(masterGain);
    ringOsc.start(now);
    ringOsc.stop(now + 0.06);

    // --- PHASE 2: ESCAPEMENT WHEEL & PAWL TRIP (18-26ms later) ---
    // The star wheel slips one tooth as the carriage spring advances one character
    const escapementTime = now + escapementDelay;
    
    // Escapement spring click
    const pawlOsc = ctx.createOscillator();
    pawlOsc.type = 'square';
    pawlOsc.frequency.setValueAtTime(4200 * pitchFactor, escapementTime);
    pawlOsc.frequency.exponentialRampToValueAtTime(1800, escapementTime + 0.015);

    const pawlGain = ctx.createGain();
    pawlGain.gain.setValueAtTime(0.4, escapementTime);
    pawlGain.gain.exponentialRampToValueAtTime(0.001, escapementTime + 0.014);

    pawlOsc.connect(pawlGain);
    pawlGain.connect(masterGain);
    pawlOsc.start(escapementTime);
    pawlOsc.stop(escapementTime + 0.016);

    // Mechanical gear tooth click (bandpassed burst)
    const toothBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.02), ctx.sampleRate);
    const toothData = toothBuf.getChannelData(0);
    for (let i = 0; i < toothData.length; i++) {
      const decay = Math.exp(-i / (ctx.sampleRate * 0.004));
      toothData[i] = (Math.random() * 2 - 1) * decay;
    }
    const toothSrc = ctx.createBufferSource();
    toothSrc.buffer = toothBuf;

    const toothFilter = ctx.createBiquadFilter();
    toothFilter.type = 'highpass';
    toothFilter.frequency.setValueAtTime(3200, escapementTime);

    const toothGain = ctx.createGain();
    toothGain.gain.setValueAtTime(0.35, escapementTime);

    toothSrc.connect(toothFilter);
    toothFilter.connect(toothGain);
    toothGain.connect(masterGain);
    toothSrc.start(escapementTime);
  }

  /**
   * Play heavy mechanical spacebar clunk.
   * Wide wooden/cast metal rocker bar that drops and trips the escapement mechanism
   * without a typebar platen strike.
   */
  public playSpacebar() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 1.15, now);
    masterGain.connect(ctx.destination);

    // 1. Heavy wooden/cast rocker lever thud (hollow chassis bottom)
    const thudOsc = ctx.createOscillator();
    thudOsc.type = 'triangle';
    thudOsc.frequency.setValueAtTime(160, now);
    thudOsc.frequency.exponentialRampToValueAtTime(50, now + 0.06);

    const thudGain = ctx.createGain();
    thudGain.gain.setValueAtTime(0.85, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

    thudOsc.connect(thudGain);
    thudGain.connect(masterGain);
    thudOsc.start(now);
    thudOsc.stop(now + 0.06);

    // 2. Wide spacebar wood/metal surface rattle
    const rattleBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.06), ctx.sampleRate);
    const rattleData = rattleBuf.getChannelData(0);
    for (let i = 0; i < rattleData.length; i++) {
      const decay = Math.exp(-i / (ctx.sampleRate * 0.012));
      rattleData[i] = (Math.random() * 2 - 1) * decay;
    }

    const rattleSrc = ctx.createBufferSource();
    rattleSrc.buffer = rattleBuf;

    const rattleFilter = ctx.createBiquadFilter();
    rattleFilter.type = 'bandpass';
    rattleFilter.frequency.setValueAtTime(1400, now);
    rattleFilter.Q.setValueAtTime(2.0, now);

    const rattleGain = ctx.createGain();
    rattleGain.gain.setValueAtTime(0.5, now);

    rattleSrc.connect(rattleFilter);
    rattleFilter.connect(rattleGain);
    rattleGain.connect(masterGain);
    rattleSrc.start(now);

    // 3. Crisp escapement ratchet jump (delayed by 20ms)
    const escTime = now + 0.022;
    const escOsc = ctx.createOscillator();
    escOsc.type = 'square';
    escOsc.frequency.setValueAtTime(3600, escTime);
    escOsc.frequency.exponentialRampToValueAtTime(1400, escTime + 0.02);

    const escGain = ctx.createGain();
    escGain.gain.setValueAtTime(0.45, escTime);
    escGain.gain.exponentialRampToValueAtTime(0.001, escTime + 0.018);

    escOsc.connect(escGain);
    escGain.connect(masterGain);
    escOsc.start(escTime);
    escOsc.stop(escTime + 0.02);
  }

  /**
   * Play backspace / correction key mechanical clink.
   * Ratchet pawl forced backward over a steel tooth.
   */
  public playBackspace() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume, now);
    masterGain.connect(ctx.destination);

    // Double mechanical click (pawl lifting, then snapping down into previous tooth)
    [0, 0.022].forEach((delay, idx) => {
      const clickTime = now + delay;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(idx === 0 ? 2400 : 3100, clickTime);
      osc.frequency.exponentialRampToValueAtTime(idx === 0 ? 1200 : 1600, clickTime + 0.02);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, clickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.018);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(clickTime);
      osc.stop(clickTime + 0.022);
    });

    // Metallic spring ping
    const springOsc = ctx.createOscillator();
    springOsc.type = 'sine';
    springOsc.frequency.setValueAtTime(4600, now + 0.02);

    const springGain = ctx.createGain();
    springGain.gain.setValueAtTime(0.2, now + 0.02);
    springGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    springOsc.connect(springGain);
    springGain.connect(masterGain);
    springOsc.start(now + 0.02);
    springOsc.stop(now + 0.065);
  }

  /**
   * Play authentic Victorian margin warning bell ("Ding!").
   * Struck by an external mechanical trip hammer against a brass dome.
   */
  public playMarginBell() {
    if (this.isMuted || !this.bellEnabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.95, now);
    masterGain.connect(ctx.destination);

    // 1. Immediate metallic hammer clink transient
    const hammerOsc = ctx.createOscillator();
    hammerOsc.type = 'square';
    hammerOsc.frequency.setValueAtTime(4800, now);

    const hammerGain = ctx.createGain();
    hammerGain.gain.setValueAtTime(0.35, now);
    hammerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

    hammerOsc.connect(hammerGain);
    hammerGain.connect(masterGain);
    hammerOsc.start(now);
    hammerOsc.stop(now + 0.015);

    // 2. Brass bell resonant modes with long shimmering harmonic sustain
    const harmonics = [
      { freq: 2640, gain: 0.7, decay: 1.35 }, // Fundamental chime
      { freq: 5280, gain: 0.38, decay: 0.85 }, // Octave harmonic
      { freq: 7920, gain: 0.18, decay: 0.45 }, // Third harmonic
      { freq: 1320, gain: 0.22, decay: 0.30 }, // Bell casing low body ring
    ];

    harmonics.forEach(({ freq, gain, decay }) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(gain, now);
      gainNode.gain.exponentialRampToValueAtTime(0.00005, now + decay);

      osc.connect(gainNode);
      gainNode.connect(masterGain);

      osc.start(now);
      osc.stop(now + decay);
    });
  }

  /**
   * Play Carriage Return:
   * 1. Heavy return lever clank
   * 2. Rapid platen line-advance ratchet teeth: `k-k-k-k-k`
   * 3. Carriage slide zip / whoosh across rails
   * 4. Heavy cast-iron left margin stop bumper: `THUD-CLANK`
   */
  public playCarriageReturn() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 1.1, now);
    masterGain.connect(ctx.destination);

    // 1. Initial lever pull metal impact
    this.playKeyStroke('Enter');

    // 2. Ratchet teeth clicking (line-space pawl advancing platen roller)
    const numClicks = 6;
    for (let i = 0; i < numClicks; i++) {
      const clickTime = now + 0.045 + i * 0.022;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800 + i * 110, clickTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, clickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.016);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(clickTime);
      osc.stop(clickTime + 0.018);
    }

    // 3. Carriage rail slide whoosh (ball bearings and steel rail friction)
    const whooshDuration = 0.24;
    const noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * whooshDuration), ctx.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, now + 0.07);
    filter.frequency.exponentialRampToValueAtTime(2200, now + 0.28);
    filter.Q.setValueAtTime(2.2, now);

    const whooshGain = ctx.createGain();
    whooshGain.gain.setValueAtTime(0.001, now + 0.07);
    whooshGain.gain.linearRampToValueAtTime(0.4, now + 0.16);
    whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.31);

    noiseSrc.connect(filter);
    filter.connect(whooshGain);
    whooshGain.connect(masterGain);

    noiseSrc.start(now + 0.07);
    noiseSrc.stop(now + 0.32);

    // 4. Heavy Left-Margin Stop Clank (carriage hitting the stop bumper)
    const stopTime = now + 0.29;
    
    // Low chassis thump
    const stopThump = ctx.createOscillator();
    stopThump.type = 'triangle';
    stopThump.frequency.setValueAtTime(180, stopTime);
    stopThump.frequency.exponentialRampToValueAtTime(45, stopTime + 0.06);

    const stopGain = ctx.createGain();
    stopGain.gain.setValueAtTime(0.65, stopTime);
    stopGain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.06);

    stopThump.connect(stopGain);
    stopGain.connect(masterGain);
    stopThump.start(stopTime);
    stopThump.stop(stopTime + 0.065);

    // Metallic bumper ping
    const pingOsc = ctx.createOscillator();
    pingOsc.type = 'sine';
    pingOsc.frequency.setValueAtTime(2800, stopTime);

    const pingGain = ctx.createGain();
    pingGain.gain.setValueAtTime(0.35, stopTime);
    pingGain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.05);

    pingOsc.connect(pingGain);
    pingGain.connect(masterGain);
    pingOsc.start(stopTime);
    pingOsc.stop(stopTime + 0.055);
  }

  /**
   * Play paper knob rotation ratchet sound (for loading/scrolling).
   */
  public playPaperKnob() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.75, now);
    masterGain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.04);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Ambient Study Atmosphere (Fireplace, Rain on Glass, Grandfather Clock, or None).
   */
  public setAmbientSound(type: 'none' | 'fireplace' | 'rain' | 'clock') {
    if (this.ambientStopFn) {
      this.ambientStopFn();
      this.ambientStopFn = null;
    }
    this.ambientType = type;
    if (type === 'none') return;

    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.ambientVolume, now);
      gainNode.connect(ctx.destination);
      this.ambientGain = gainNode;

      let isRunning = true;

      if (type === 'fireplace') {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (last + 0.02 * white) / 1.02;
          last = data[i];
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);

        noise.connect(filter);
        filter.connect(gainNode);
        noise.start(now);

        const popInterval = setInterval(() => {
          if (!isRunning || this.isMuted) return;
          if (Math.random() > 0.4) {
            const popTime = ctx.currentTime;
            const popOsc = ctx.createOscillator();
            popOsc.type = 'sine';
            popOsc.frequency.setValueAtTime(500 + Math.random() * 1200, popTime);
            popOsc.frequency.exponentialRampToValueAtTime(80, popTime + 0.03);

            const popGain = ctx.createGain();
            popGain.gain.setValueAtTime(0.08 + Math.random() * 0.1, popTime);
            popGain.gain.exponentialRampToValueAtTime(0.001, popTime + 0.03);

            popOsc.connect(popGain);
            popGain.connect(gainNode);

            popOsc.start(popTime);
            popOsc.stop(popTime + 0.035);
          }
        }, 250);

        this.ambientStopFn = () => {
          isRunning = false;
          clearInterval(popInterval);
          try {
            noise.stop();
          } catch {}
        };
      } else if (type === 'rain') {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);

        const highPass = ctx.createBiquadFilter();
        highPass.type = 'highpass';
        highPass.frequency.setValueAtTime(250, now);

        noise.connect(highPass);
        highPass.connect(filter);
        filter.connect(gainNode);
        noise.start(now);

        this.ambientStopFn = () => {
          isRunning = false;
          try {
            noise.stop();
          } catch {}
        };
      } else if (type === 'clock') {
        let tick = true;
        const clockInterval = setInterval(() => {
          if (!isRunning || this.isMuted) return;
          const tickTime = ctx.currentTime;
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          const baseFreq = tick ? 1800 : 1350;
          tick = !tick;

          osc.frequency.setValueAtTime(baseFreq, tickTime);
          osc.frequency.exponentialRampToValueAtTime(300, tickTime + 0.025);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.2, tickTime);
          gain.gain.exponentialRampToValueAtTime(0.001, tickTime + 0.03);

          osc.connect(gain);
          gain.connect(gainNode);

          osc.start(tickTime);
          osc.stop(tickTime + 0.035);
        }, 1000);

        this.ambientStopFn = () => {
          isRunning = false;
          clearInterval(clockInterval);
        };
      }
    } catch {
      // AudioContext may be waiting for user interaction
    }
  }

  public getAmbientSound() {
    return this.ambientType;
  }

  public setAmbientVolume(vol: number) {
    this.ambientVolume = Math.max(0, Math.min(1, vol));
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : this.ambientVolume, this.ctx.currentTime);
    }
  }

  public getAmbientVolume() {
    return this.ambientVolume;
  }
}

export const soundEngine = new MechanicalAudioEngine();
