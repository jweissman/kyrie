import { AutoplayRun } from '../../../../src/autoplay/run';
import { CreatureStore } from '../../../../src/creature-store';
import { Battle } from '../../../../src/battle';
import { Tactics } from '../../../../src/tactics';
const seed = process.argv[2]!, cls = process.argv[3] ?? 'warrior', race = cls === 'mage' ? 'elf' : 'human';
const s = await AutoplayRun.start({ seed, origin: 'debt', protagonist: { name: 'P', raceId: race, classId: cls }, policy: 'wander', steps: 0 });
const c: any = s.campaign, m = c.module, w = c.world;
const facts: any[] = [...w.allFacts()];
const atOf = new Map<string, string>(); for (const f of facts) if (f.name === 'at') atOf.set(f.args[0], f.args[1]);
const tempers = new Map<string, string>(); for (const f of facts) if (/temper/i.test(f.name) && f.args.length === 2) tempers.set(f.args[0], f.args[1]);
const name = (id: string) => m.entities.find((e: any) => e.id === id)?.name ?? id;
const read = c.readout, creatures = read.creatures;
const hero = creatures.find((x: any) => x.id === read.partyIds[0]);
const siteOf = (p: string) => /^region__(w\d+)_/.exec(p ?? '')?.[1];
const rooms: Record<string, number> = {}; for (const e of m.entities) if (e.type === 'place') { const k = siteOf(e.id); if (k) rooms[k] = (rooms[k] ?? 0) + 1; }
const big = Object.entries(rooms).sort((a, b) => b[1] - a[1])[0]?.[0];
const out: any[] = [];
for (const [g, members] of Object.entries<string[]>(read.inhabitants)) {
  const place = atOf.get(g) ?? ''; const k = siteOf(place);
  if (!k || !members.length || g === 'party') continue;
  const foes = members.map(id => creatures.find((x: any) => x.id === id)).filter(Boolean);
  if (!foes.length || facts.some(f => f.name === 'peaceable' && f.args[0] === g)) continue;
  let won = 0, hurt = 0, rounds = 0; const N = 20;
  for (let t = 0; t < N; t++) {
    const store = new CreatureStore(structuredClone([hero, ...foes]));
    const b = Battle.encounter(store, [{ creatureId: hero.id, team: 'fighters' as const }, ...foes.map((f: any) => ({ creatureId: f.id, team: 'goblins' as const }))], { seed: `${seed}:${g}:${t}`, maxTurns: 150 });
    while (!b.state.outcome) b.step(Tactics.choose(b.state, b.legalCommands()));
    const me = b.state.combatants.find((f: any) => f.id === hero.id)!;
    if (b.state.outcome === 'fighters') { won++; hurt += 1 - me.hp / hero.state.hp; }
    rounds += (b.state as any).round ?? (b.state as any).turn ?? 0;
  }
  out.push({ site: k, big: k === big, group: name(g), place: name(place), n: foes.length, win: won / N, hurt: won ? +(hurt / won).toFixed(2) : 1, temper: tempers.get(g) ?? '' });
}
console.log(JSON.stringify({ seed, cls, hp: hero.state.hp, out }));
