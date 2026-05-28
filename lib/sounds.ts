let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function playReveal() {
  const c = ac(); if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain); gain.connect(c.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(900, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(500, c.currentTime + 0.06);
  gain.gain.setValueAtTime(0.04, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
  osc.start(); osc.stop(c.currentTime + 0.08);
}

export function playFlag() {
  const c = ac(); if (!c) return;
  [440, 660].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(c.destination);
    osc.type = "square";
    osc.frequency.value = freq;
    const t = c.currentTime + i * 0.04;
    gain.gain.setValueAtTime(0.025, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.start(t); osc.stop(t + 0.05);
  });
}

export function playExplosion() {
  const c = ac(); if (!c) return;

  // White noise burst
  const samples = c.sampleRate * 0.6;
  const buf = c.createBuffer(1, samples, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < samples; i++) data[i] = (Math.random() * 2 - 1);
  const noise = c.createBufferSource();
  noise.buffer = buf;

  const lpf = c.createBiquadFilter();
  lpf.type = "lowpass";
  lpf.frequency.value = 180;

  const noiseGain = c.createGain();
  noiseGain.gain.setValueAtTime(0.4, c.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.6);

  noise.connect(lpf); lpf.connect(noiseGain); noiseGain.connect(c.destination);
  noise.start(); noise.stop(c.currentTime + 0.6);

  // Low thump
  const thump = c.createOscillator();
  const thumpGain = c.createGain();
  thump.connect(thumpGain); thumpGain.connect(c.destination);
  thump.type = "sine";
  thump.frequency.setValueAtTime(80, c.currentTime);
  thump.frequency.exponentialRampToValueAtTime(20, c.currentTime + 0.3);
  thumpGain.gain.setValueAtTime(0.35, c.currentTime);
  thumpGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
  thump.start(); thump.stop(c.currentTime + 0.3);
}

export function playOpen() {
  const c = ac(); if (!c) return;
  [380, 560].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(c.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = c.currentTime + i * 0.055;
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    osc.start(t); osc.stop(t + 0.13);
  });
}

export function playClose() {
  const c = ac(); if (!c) return;
  [520, 360].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(c.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = c.currentTime + i * 0.045;
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.start(t); osc.stop(t + 0.08);
  });
}

export function playMinimize() {
  const c = ac(); if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain); gain.connect(c.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(580, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(280, c.currentTime + 0.13);
  gain.gain.setValueAtTime(0.05, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
  osc.start(); osc.stop(c.currentTime + 0.15);
}

export function playDelete() {
  const c = ac(); if (!c) return;
  // Short noise crunch + descending sweep
  const samples = Math.floor(c.sampleRate * 0.12);
  const buf = c.createBuffer(1, samples, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < samples; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / samples);
  const noise = c.createBufferSource();
  noise.buffer = buf;
  const hpf = c.createBiquadFilter();
  hpf.type = "highpass";
  hpf.frequency.value = 800;
  const noiseGain = c.createGain();
  noiseGain.gain.setValueAtTime(0.18, c.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
  noise.connect(hpf); hpf.connect(noiseGain); noiseGain.connect(c.destination);
  noise.start(); noise.stop(c.currentTime + 0.12);

  // Descending tone underneath
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain); gain.connect(c.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(400, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, c.currentTime + 0.18);
  gain.gain.setValueAtTime(0.06, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
  osc.start(); osc.stop(c.currentTime + 0.2);
}

export function playMaximize(exiting: boolean) {
  const c = ac(); if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain); gain.connect(c.destination);
  osc.type = "sine";
  const [from, to] = exiting ? [620, 380] : [380, 680];
  osc.frequency.setValueAtTime(from, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(to, c.currentTime + 0.11);
  gain.gain.setValueAtTime(0.05, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.13);
  osc.start(); osc.stop(c.currentTime + 0.13);
}

export function playWin() {
  const c = ac(); if (!c) return;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(c.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = c.currentTime + i * 0.1;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.07, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.start(t); osc.stop(t + 0.4);
  });
}
