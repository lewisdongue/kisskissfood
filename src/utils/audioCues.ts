/**
 * Audio Cues Utility
 * Provides pleasant audio feedback for key user events
 */

/**
 * Speak a short voice cue using the Web Speech API.
 * Returns true if speech was started, false if not supported/failed.
 */
const speakCue = (text: string): boolean => {
  try {
    if (typeof window === "undefined") return false;
    if (!("speechSynthesis" in window)) return false;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = navigator.language || "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Avoid stacking many announcements
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
};

/**
 * Fallback: chime-like sound using Web Audio API.
 */
const playMatchFoundChime = (): void => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  // Create a pleasant ascending chime (3 notes)
  const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 - major chord
  const duration = 0.15; // 150ms per note
  const startTime = audioContext.currentTime;

  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = freq;
    oscillator.type = "sine";

    // Envelope: quick attack, smooth decay
    gainNode.gain.setValueAtTime(0, startTime + index * duration);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + index * duration + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + index * duration + duration);

    oscillator.start(startTime + index * duration);
    oscillator.stop(startTime + index * duration + duration);
  });

  // Clean up audio context after sounds finish
  setTimeout(() => {
    audioContext.close().catch(() => {
      // Ignore errors on close
    });
  }, frequencies.length * duration * 1000 + 100);
};

/**
 * Fallback: confirmation sound using Web Audio API.
 */
const playConnectionBeep = (): void => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  // Create a pleasant two-tone connection sound
  const frequencies = [440, 554.37]; // A4, C#5
  const duration = 0.1; // 100ms per tone
  const startTime = audioContext.currentTime;

  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = freq;
    oscillator.type = "sine";

    // Envelope: quick attack, smooth decay
    gainNode.gain.setValueAtTime(0, startTime + index * duration);
    gainNode.gain.linearRampToValueAtTime(0.25, startTime + index * duration + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + index * duration + duration);

    oscillator.start(startTime + index * duration);
    oscillator.stop(startTime + index * duration + duration);
  });

  // Clean up audio context after sounds finish
  setTimeout(() => {
    audioContext.close().catch(() => {
      // Ignore errors on close
    });
  }, frequencies.length * duration * 1000 + 100);
};

/**
 * Play a pleasant "match found" sound
 * Prefer voice cue; fallback to a chime sound.
 */
export const playMatchFoundSound = (): void => {
  try {
    // No voice here: a match row is not a live peer yet. Only a discreet chime.
    playMatchFoundChime();
  } catch (error) {
    // Silently fail if audio context is not available
    void error;
  }
};

/**
 * Play a pleasant "connection established" sound
 * Prefer voice cue; fallback to a confirmation sound.
 */
export const playConnectionSound = (): void => {
  try {
    const spoke = speakCue("Connected.");
    if (spoke) return;

    playConnectionBeep();
  } catch (error) {
    // Silently fail if audio context is not available
    void error;
  }
};

/**
 * Check if audio is enabled (user hasn't muted)
 * This respects browser autoplay policies
 */
export const isAudioEnabled = (): boolean => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    return audioContext.state !== 'suspended';
  } catch {
    return false;
  }
};

