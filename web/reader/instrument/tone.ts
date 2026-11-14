// One low tone on a commitment (IG-06), for the interaction research's two versions only (see Press): a soft wooden
// knock rather than a beep, as a piece is set down on a board. Made, not recorded: a falling sine and a quieter
// partial an octave and a fifth above, through a low pass, gone in a fifth of a second. A held act's is a little lower
// and longer. Silent where the address asks (&sound=0), and wherever the page cannot sound.
export type Knock = 'commit' | 'held';
export class Tone {
  private static context?: AudioContext;
  static readonly shapes: Record<Knock, { from: number; to: number; ms: number; gain: number }> = {
    commit: { from: 196, to: 132, ms: 170, gain: 0.16 },
    held: { from: 164, to: 98, ms: 260, gain: 0.18 },
  };
  // How many have sounded (for the repetition test: kyrieMono.inspect is the engine's; this is the page's own).
  static count = 0;
  static play(kind: Knock) {
    const root = typeof document === 'undefined' ? undefined : document.documentElement;
    if ((!root?.dataset.ix && !root?.dataset.touch) || root.dataset.sound === 'off' || typeof AudioContext === 'undefined') { return; }
    Tone.count++;
    try { Tone.knock(Tone.shapes[kind]); } catch { /* a page that cannot sound plays on in silence */ }
  }
  private static knock(shape: { from: number; to: number; ms: number; gain: number }) {
    const ctx = Tone.context ??= new AudioContext(), at = ctx.currentTime, end = at + shape.ms / 1000;
    if (ctx.state === 'suspended') { void ctx.resume(); }
    const filter = ctx.createBiquadFilter(), level = ctx.createGain();
    filter.type = 'lowpass'; filter.frequency.value = 1400;
    level.gain.setValueAtTime(0.0001, at);
    level.gain.exponentialRampToValueAtTime(shape.gain, at + 0.004);
    level.gain.exponentialRampToValueAtTime(0.0001, end);
    filter.connect(level).connect(ctx.destination);
    for (const [ratio, gain] of [[1, 1], [3, 0.18]] as const) {
      const osc = ctx.createOscillator(), part = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(shape.from * ratio, at);
      osc.frequency.exponentialRampToValueAtTime(shape.to * ratio, at + 0.06);
      part.gain.value = gain;
      osc.connect(part).connect(filter);
      osc.start(at); osc.stop(end + 0.02);
    }
  }
}
