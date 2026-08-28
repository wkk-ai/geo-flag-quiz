let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function unlockAudio(): void {
  getCtx();
}

function tone(freq: number, duration: number, type: OscillatorType, gain = 0.06, delay = 0) {
  const audio = getCtx();
  if (!audio) return;
  const t0 = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export function playCorrect(muted: boolean) {
  if (muted) return;
  tone(523.25, 0.12, "triangle", 0.05);
  tone(659.25, 0.16, "triangle", 0.05, 0.1);
}

export function playBonus(muted: boolean) {
  if (muted) return;
  tone(659.25, 0.1, "triangle", 0.05);
  tone(783.99, 0.12, "triangle", 0.05, 0.09);
  tone(1046.5, 0.18, "triangle", 0.04, 0.18);
}

export function playWrong(muted: boolean) {
  if (muted) return;
  tone(196, 0.22, "sawtooth", 0.03);
}

export function playGameOver(muted: boolean) {
  if (muted) return;
  tone(392, 0.16, "triangle", 0.04);
  tone(311.13, 0.18, "triangle", 0.04, 0.14);
  tone(233.08, 0.28, "triangle", 0.04, 0.3);
}
