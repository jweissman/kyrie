// Scratch: what the page tells at rest across one walker's run (situation, presence, changed, journey lines), and the
// lines and phrases said again and again across places: the narration's empty talk, by count.
const W = process.env.W ?? process.cwd();
const { AutoplayRun } = await import(`${W}/src/autoplay/run`);
const { AutoPlayer } = await import(`${W}/src/autoplay/player`);
const { Draw } = await import(`${W}/src/autoplay/draw`);
const { ScreenModel } = await import(`${W}/src/ui/screen-model`);
const { Narrator } = await import(`${W}/src/presentation/narrator`);
const [seed = 'a1', cls = 'warrior', policy = 'silver', n = '160', origin = 'wanderer'] = process.argv.slice(2);
const spec = { seed, origin, policy, steps: Number(n), keep: 0, replay: false, frontier: false, protagonist: { name: 'Wynn', raceId: 'human', classId: cls } } as any;
const metrics = (AutoplayRun as any).empty(), s = await AutoplayRun.start(spec, metrics), c = s.campaign;
const player = new AutoPlayer(policy, new Draw(`${seed}:${origin}:${policy}`));
const lines = new Map<string, Set<string>>(), counts = new Map<string, number>(), grams = new Map<string, Set<string>>();
const norm = (l: string) => l.replace(/\d+/g, 'N');
for (let step = 0; step < spec.steps && c.running; step++) {
  const screen = ScreenModel.build(c), leaf = Narrator.leaf(c, screen);
  for (const part of ['situation', 'presence', 'changed', 'journey'] as const) {
    for (const l of (leaf[part] ?? []) as string[]) {
      const k = `${part}: ${norm(l)}`;
      (lines.get(k) ?? lines.set(k, new Set()).get(k)!).add(screen.place.id);
      counts.set(k, (counts.get(k) ?? 0) + 1);
      const w = l.toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter(Boolean);
      for (let i = 0; i + 5 <= w.length; i++) { const g = w.slice(i, i + 5).join(' '); (grams.get(g) ?? grams.set(g, new Set()).get(g)!).add(screen.place.id); }
    }
  }
  const sit = AutoplayRun.situation(s, step, AutoPlayer.paged.includes(policy), AutoPlayer.prefers[policy]);
  const move = player.next(sit); if (!move) break;
  try { await AutoplayRun.apply(s, move, player, metrics); } catch (e) { console.log('fail', (e as Error).message); break; }
}
console.log(`== lines told at three or more places (${seed} ${cls} ${policy})`);
for (const [k, at] of [...lines].filter(([, at]) => at.size >= 3).sort((a, b) => b[1].size - a[1].size).slice(0, 40)) {
  console.log(`${at.size} places, ${counts.get(k)}×  ${k.slice(0, 200)}`);
}
console.log('== five-word phrases at four or more places');
for (const [g, at] of [...grams].filter(([, at]) => at.size >= 4).sort((a, b) => b[1].size - a[1].size).slice(0, 40)) {
  console.log(`${at.size}  ${g}`);
}
