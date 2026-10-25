"use client";

// Web Audio API Multi-Atmosphere Soundscape Generator
// 100% client-side, zero external assets or CORS dependencies, instant playback & volume control.

export type AmbientTrackId =
  | "rain"
  | "piano"
  | "cafe"
  | "waves"
  | "fireplace"
  | "night_forest"
  | "music_box";

export interface AmbientTrack {
  id: AmbientTrackId;
  name: string;
  emoji: string;
  description: string;
  category: "Alam" | "Musik" | "Suasana";
}

export const AMBIENT_TRACKS: AmbientTrack[] = [
  {
    id: "piano",
    name: "Piano Romantis Berdua",
    emoji: "🎹",
    description: "Melodi piano lembut yang manis dan menenangkan hati",
    category: "Musik",
  },
  {
    id: "rain",
    name: "Hujan Rintik Tenang",
    emoji: "🌧️",
    description: "Suara rintik hujan lembut di jendela kaca",
    category: "Alam",
  },
  {
    id: "music_box",
    name: "Kotak Musik Nostalgia",
    emoji: "🎵",
    description: "Dentang kotak musik klasik penuh memori manis",
    category: "Musik",
  },
  {
    id: "cafe",
    name: "Kafe Hangat & Lofi",
    emoji: "☕",
    description: "Suasana kedai kopi santai dengan sentuhan vinyl hangat",
    category: "Suasana",
  },
  {
    id: "waves",
    name: "Deburan Ombak Senja",
    emoji: "🌊",
    description: "Ritme ombak pantai yang damai di tepi laut",
    category: "Alam",
  },
  {
    id: "fireplace",
    name: "Api Unggun & Perapian",
    emoji: "🔥",
    description: "Percikan kayu hangat di malam yang dingin",
    category: "Suasana",
  },
  {
    id: "night_forest",
    name: "Malam Hening & Jangkrik",
    emoji: "🌌",
    description: "Semilir angin malam bertabur bintang yang sunyi",
    category: "Alam",
  },
];

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let currentTrackId: AmbientTrackId = "piano";
let isPlaying = false;
let currentVolume = 0.6; // default 60%

// Active audio sources / timers for cleanup
let activeNodes: Array<AudioNode> = [];
let activeIntervals: Array<number | NodeJS.Timeout> = [];

const listeners = new Set<(playing: boolean, trackId: AmbientTrackId, volume: number) => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn(isPlaying, currentTrackId, currentVolume));
}

export function subscribeAmbientSound(
  callback: (playing: boolean, trackId: AmbientTrackId, volume: number) => void
): () => void {
  listeners.add(callback);
  callback(isPlaying, currentTrackId, currentVolume);
  return () => {
    listeners.delete(callback);
  };
}

export function getCurrentAmbientTrack(): AmbientTrack {
  return (
    AMBIENT_TRACKS.find((t) => t.id === currentTrackId) || AMBIENT_TRACKS[0]
  );
}

export function getAmbientVolume(): number {
  return currentVolume;
}

export function setAmbientVolume(vol: number) {
  currentVolume = Math.max(0, Math.min(1, vol));
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(currentVolume, audioCtx.currentTime + 0.1);
  }
  notifyListeners();
}

export function isAmbientPlaying(): boolean {
  return isPlaying;
}

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function clearCurrentSound() {
  activeIntervals.forEach((timer) => clearInterval(timer as number));
  activeIntervals = [];

  activeNodes.forEach((node) => {
    try {
      if ("stop" in node && typeof (node as AudioScheduledSourceNode).stop === "function") {
        (node as AudioScheduledSourceNode).stop();
      }
      node.disconnect();
    } catch {
      // ignore
    }
  });
  activeNodes = [];
}

// ----------------------------------------------------------------------------
// Audio Generators
// ----------------------------------------------------------------------------

// 1. Cozy Rain Generator
function playRain(ctx: AudioContext, destination: GainNode) {
  const bufferSize = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.02 * white) / 1.02;
    data[i] = lastOut * 0.18;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(850, ctx.currentTime);

  noise.connect(filter);
  filter.connect(destination);
  noise.start();

  activeNodes.push(noise, filter);
}

// 2. Romantic Piano Arpeggiator (Sweet procedural pentatonic & major7th chords)
function playPiano(ctx: AudioContext, destination: GainNode) {
  // Gentle romantic chord progression: Cmaj7, Am7, Fmaj7, G6
  const chords: number[][] = [
    [261.63, 329.63, 392.0, 493.88, 523.25], // Cmaj7 (C4, E4, G4, B4, C5)
    [220.0, 261.63, 329.63, 392.0, 440.0],  // Am7 (A3, C4, E4, G4, A4)
    [174.61, 261.63, 329.63, 349.23, 440.0], // Fmaj7 (F3, C4, E4, F4, A4)
    [196.0, 246.94, 293.66, 392.0, 493.88], // G6 (G3, B3, D4, G4, B4)
  ];

  let chordIndex = 0;
  let noteIndex = 0;

  const playNote = () => {
    if (!isPlaying || currentTrackId !== "piano") return;

    const currentChord = chords[chordIndex];
    const freq = currentChord[noteIndex % currentChord.length];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Warm soft timbre filter
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1400, ctx.currentTime);

    // Piano-like envelope: soft attack, long singing decay
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + 2.5);

    noteIndex++;
    if (noteIndex >= currentChord.length) {
      noteIndex = 0;
      chordIndex = (chordIndex + 1) % chords.length;
    }
  };

  playNote();
  const timer = setInterval(playNote, 680); // gentle lofi tempo
  activeIntervals.push(timer);
}

// 3. Nostalgic Music Box
function playMusicBox(ctx: AudioContext, destination: GainNode) {
  // Twinkle/Canon romantic melody pattern
  const melody = [
    523.25, 587.33, 659.25, 523.25, 659.25, 783.99,
    659.25, 587.33, 523.25, 493.88, 440.0, 523.25,
    587.33, 659.25, 783.99, 1046.5,
  ];
  let step = 0;

  const playChime = () => {
    if (!isPlaying || currentTrackId !== "music_box") return;

    const freq = melody[step % melody.length];
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    subOsc.type = "triangle";
    subOsc.frequency.setValueAtTime(freq * 2, ctx.currentTime);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc.connect(gain);
    subOsc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 1.9);
    subOsc.stop(now + 1.9);

    step++;
  };

  playChime();
  const timer = setInterval(playChime, 750);
  activeIntervals.push(timer);
}

// 4. Warm Cafe & Vinyl Lofi
function playCafe(ctx: AudioContext, destination: GainNode) {
  // Gentle vinyl crackle + distant warm Rhodes-like chords
  const bufferSize = ctx.sampleRate * 3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const isCrackle = Math.random() < 0.0008;
    data[i] = isCrackle ? (Math.random() * 2 - 1) * 0.25 : (Math.random() * 2 - 1) * 0.015;
  }

  const vinyl = ctx.createBufferSource();
  vinyl.buffer = buffer;
  vinyl.loop = true;

  const vinylFilter = ctx.createBiquadFilter();
  vinylFilter.type = "bandpass";
  vinylFilter.frequency.setValueAtTime(1200, ctx.currentTime);

  vinyl.connect(vinylFilter);
  vinylFilter.connect(destination);
  vinyl.start();
  activeNodes.push(vinyl, vinylFilter);

  // Distant warm electric piano chords
  const cafeChords = [
    [261.63, 311.13, 392.0, 466.16], // Cm7
    [220.0, 261.63, 329.63, 392.0],  // Am7
    [174.61, 220.0, 261.63, 311.13], // F7
    [196.0, 246.94, 293.66, 349.23], // G7
  ];
  let chordIdx = 0;

  const playCafeChord = () => {
    if (!isPlaying || currentTrackId !== "cafe") return;
    const notes = cafeChords[chordIdx % cafeChords.length];
    const now = ctx.currentTime;

    notes.forEach((f) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, now);

      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.05, now + 0.3);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(g);
      g.connect(destination);
      osc.start(now);
      osc.stop(now + 3.3);
    });

    chordIdx++;
  };

  playCafeChord();
  const timer = setInterval(playCafeChord, 3400);
  activeIntervals.push(timer);
}

// 5. Ocean Waves
function playWaves(ctx: AudioContext, destination: GainNode) {
  const bufferSize = ctx.sampleRate * 6;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.015 * white) / 1.015;
    data[i] = lastOut * 0.25;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(400, ctx.currentTime);

  const waveGain = ctx.createGain();
  waveGain.gain.setValueAtTime(0.05, ctx.currentTime);

  // LFO to swell the waves rhythmically
  const lfo = ctx.createOscillator();
  lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 sec period

  const lfoGain = ctx.createGain();
  lfoGain.gain.setValueAtTime(0.16, ctx.currentTime);

  lfo.connect(lfoGain);
  lfoGain.connect(waveGain.gain);

  source.connect(filter);
  filter.connect(waveGain);
  waveGain.connect(destination);

  source.start();
  lfo.start();

  activeNodes.push(source, filter, waveGain, lfo, lfoGain);
}

// 6. Fireplace & Campfire
function playFireplace(ctx: AudioContext, destination: GainNode) {
  const bufferSize = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let brown = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    brown = (brown + 0.02 * white) / 1.02;
    // random crackle pops
    const crackle = Math.random() < 0.001 ? (Math.random() * 2 - 1) * 0.4 : 0;
    data[i] = brown * 0.12 + crackle;
  }

  const fire = ctx.createBufferSource();
  fire.buffer = buffer;
  fire.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(650, ctx.currentTime);

  fire.connect(filter);
  filter.connect(destination);
  fire.start();

  activeNodes.push(fire, filter);
}

// 7. Night Forest & Crickets
function playNightForest(ctx: AudioContext, destination: GainNode) {
  // Soft breeze
  const bufferSize = ctx.sampleRate * 5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let b = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const w = Math.random() * 2 - 1;
    b = (b + 0.01 * w) / 1.01;
    data[i] = b * 0.09;
  }

  const breeze = ctx.createBufferSource();
  breeze.buffer = buffer;
  breeze.loop = true;

  const breezeFilter = ctx.createBiquadFilter();
  breezeFilter.type = "lowpass";
  breezeFilter.frequency.setValueAtTime(500, ctx.currentTime);

  breeze.connect(breezeFilter);
  breezeFilter.connect(destination);
  breeze.start();
  activeNodes.push(breeze, breezeFilter);

  // Cricket chirps
  const chirp = () => {
    if (!isPlaying || currentTrackId !== "night_forest") return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(4500, now);
    osc.frequency.linearRampToValueAtTime(4800, now + 0.04);
    osc.frequency.linearRampToValueAtTime(4500, now + 0.08);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.04, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(g);
    g.connect(destination);
    osc.start(now);
    osc.stop(now + 0.15);
  };

  const timer = setInterval(() => {
    chirp();
    setTimeout(chirp, 140);
    setTimeout(chirp, 280);
  }, 2200);
  activeIntervals.push(timer);
}

// ----------------------------------------------------------------------------
// Core Control Functions
// ----------------------------------------------------------------------------

function startSoundtrack(trackId: AmbientTrackId) {
  const ctx = getAudioContext();

  if (!masterGain) {
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(currentVolume, ctx.currentTime);
    masterGain.connect(ctx.destination);
  }

  clearCurrentSound();

  switch (trackId) {
    case "rain":
      playRain(ctx, masterGain);
      break;
    case "piano":
      playPiano(ctx, masterGain);
      break;
    case "music_box":
      playMusicBox(ctx, masterGain);
      break;
    case "cafe":
      playCafe(ctx, masterGain);
      break;
    case "waves":
      playWaves(ctx, masterGain);
      break;
    case "fireplace":
      playFireplace(ctx, masterGain);
      break;
    case "night_forest":
      playNightForest(ctx, masterGain);
      break;
    default:
      playPiano(ctx, masterGain);
  }

  isPlaying = true;
  currentTrackId = trackId;
  notifyListeners();
}

export function playAmbientTrack(trackId: AmbientTrackId) {
  startSoundtrack(trackId);
}

export function toggleAmbientSound(onStateChange?: (playing: boolean) => void): boolean {
  if (typeof window === "undefined") return false;

  if (isPlaying) {
    stopAmbientSound();
    onStateChange?.(false);
    return false;
  } else {
    startSoundtrack(currentTrackId);
    onStateChange?.(true);
    return true;
  }
}

export function stopAmbientSound() {
  clearCurrentSound();
  isPlaying = false;
  notifyListeners();
}

export function switchAmbientTrack(trackId: AmbientTrackId) {
  currentTrackId = trackId;
  if (isPlaying) {
    startSoundtrack(trackId);
  } else {
    notifyListeners();
  }
}

export function playWheelTickSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.035);
    g.gain.setValueAtTime(0.04, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // ignore
  }
}

