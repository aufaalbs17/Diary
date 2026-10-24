"use client";

// Web Audio API ambient soundscape generator (soothing cozy rain & warm cafe drone)
// 100% client-side, zero dependencies, zero CORS issues, instant playback.

let audioCtx: AudioContext | null = null;
let rainGain: GainNode | null = null;
let isPlaying = false;
let noiseNode: AudioBufferSourceNode | null = null;

export function toggleAmbientSound(onStateChange?: (playing: boolean) => void): boolean {
  if (typeof window === "undefined") return false;

  if (isPlaying) {
    stopAmbientSound();
    onStateChange?.(false);
    return false;
  } else {
    startAmbientSound();
    onStateChange?.(true);
    return true;
  }
}

export function isAmbientPlaying(): boolean {
  return isPlaying;
}

export function startAmbientSound() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    // Generate 5 seconds of soft pink/brown noise buffer for gentle rainfall
    const bufferSize = audioCtx.sampleRate * 5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise integration for soft cozy warmth
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 0.15;
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    // Filter to soft rainfall frequencies
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, audioCtx.currentTime);

    // Master gentle gain
    rainGain = audioCtx.createGain();
    rainGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    rainGain.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 2); // Soft fade-in

    noiseNode.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(audioCtx.destination);

    noiseNode.start();
    isPlaying = true;
  } catch (err) {
    console.error("Ambient sound error:", err);
  }
}

export function stopAmbientSound() {
  if (!isPlaying || !audioCtx) return;
  try {
    if (rainGain && audioCtx) {
      rainGain.gain.setValueAtTime(rainGain.gain.value, audioCtx.currentTime);
      rainGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1); // Soft fade-out
      setTimeout(() => {
        noiseNode?.stop();
        noiseNode?.disconnect();
        isPlaying = false;
      }, 1000);
    } else {
      noiseNode?.stop();
      isPlaying = false;
    }
  } catch (err) {
    isPlaying = false;
  }
}
