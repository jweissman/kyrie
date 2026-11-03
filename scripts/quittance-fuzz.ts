import { Journey } from '../src/session/journey';
import { City, Q } from '../test/support/quittance';

// Exploratory offered-action play: from the road into Quittance, take a random one of the choices the page offers,
// again and again, and check what must always be true. Usage: bun scripts/quittance-fuzz.ts [walks] [steps] [seed]
// A walk that throws, offers nothing, or breaks an invariant is printed with the labels that led to it.
const walks = Number(process.argv[2] ?? 10), steps = Number(process.argv[3] ?? 120), base = process.argv[4] ?? 'fuzz';

class Fuzz {
  static readonly skip = [
    /^The company: Wait › And watch/, /^Pack/, /Give to/, /Set down here/, /prepare spells/i, /Prepare spells/,
  ];
  static readonly hard = [
    'arcs stay within 0..4', 'regard stays within 0..12', 'gold is not negative', 'at most six wards lit',
    'ayes at most five', 'the company is somewhere', 'not both a keeper terms and a slaying',
  ] as const;
  static h = 0;

  static seed(seed: string) {
    this.h = 2166136261;
    for (const ch of seed) { this.h = Math.imul(this.h ^ ch.charCodeAt(0), 16777619); }
  }
  static pick() {
    this.h ^= this.h << 13; this.h ^= this.h >>> 17; this.h ^= this.h << 5;
    return ((this.h >>> 0) % 1_000_000) / 1_000_000;
  }
  static check(name: typeof Fuzz.hard[number], j: Journey): boolean {
    switch (name) {
      case 'arcs stay within 0..4': return ['prewitt', 'garrity', 'dree', 'ianthe', 'pettifer', 'cray', 'gaunt', 'auberon']
        .every(p => { const v = City.arc(j, p); return v >= 0 && v <= 4; });
      case 'regard stays within 0..12': return ['phoenix', 'lamprey', 'sovereign', 'providence', 'residuary', 'gasco', 'wardsfolk']
        .every(o => { const v = City.regard(j, o); return v >= 0 && v <= 12; });
      case 'gold is not negative': return City.gold(j) >= 0;
      case 'at most six wards lit': return j.measure(Q('wardsLit'), Q('city')) <= 6;
      case 'ayes at most five': return j.measure(Q('ayes'), Q('city')) <= 5;
      case 'the company is somewhere': return !!j.at('party');
      case 'not both a keeper terms and a slaying':
        return !(j.holds(Q('fireSlain'), 'party') && j.holds(Q('fireTerms'), 'party'));
    }
  }
}
const skip = Fuzz.skip;

let failures = 0;
for (let w = 0; w < walks; w++) {
  const seed = `${base}-${w}`, trail: string[] = [];
  Fuzz.seed(seed);
  let j: Journey;
  try { j = await City.start(seed); } catch (e) { console.log(`walk ${w}: could not start: ${String(e)}`); failures++; continue; }
  let ended = false;
  for (let i = 0; i < steps && !ended; i++) {
    let offered;
    try { offered = j.choices().filter(c => !skip.some(s => s.test(c.full))); } catch (e) {
      console.log(`walk ${w} step ${i}: choices threw: ${String(e)}\n  ${trail.join('\n  ')}`); failures++; break;
    }
    if (offered.length === 0 && !j.holds('able', 'party')) { console.log(`walk ${w} step ${i}: the company fell at ${j.at('party')} (a fight chosen at random; the world goes on without it)`); break; }
    if (offered.length === 0) { console.log(`walk ${w} step ${i}: nothing offered at ${j.at('party')} (watch ${j.watch()})\n  ${trail.slice(-8).join('\n  ')}`); failures++; break; }
    // Prefer the story to the weather: waits are picked a tenth of the time.
    const doing = offered.filter(c => !/Wait ›|Make camp|Search here/.test(c.full));
    const pool = Fuzz.pick() < 0.1 || doing.length === 0 ? offered : doing;
    const choice = pool[Math.floor(Fuzz.pick() * pool.length)]!;
    trail.push(`[${j.watch()}] ${choice.full}`);
    try { await j.perform(choice.command, choice.label, choice.grave); } catch (e) {
      if (/closed|ended|reached/i.test(String(e))) { ended = true; break; }
      console.log(`walk ${w} step ${i}: ${choice.full} threw: ${String(e)}\n  ${trail.slice(-10).join('\n  ')}`); failures++; break;
    }
    for (const inv of Fuzz.hard) {
      let ok = true; try { ok = Fuzz.check(inv, j); } catch { ok = false; }
      if (!ok) { console.log(`walk ${w} step ${i}: invariant broken: ${inv}\n  ${trail.slice(-10).join('\n  ')}`); failures++; ended = true; break; }
    }
  }
  console.log(`walk ${w}: ${trail.length} steps, now at ${j.at('party')}, watch ${j.watch()}, gold ${City.gold(j)}, wards lit ${j.measure(Q('wardsLit'), Q('city'))}`);
}
console.log(failures ? `${failures} walk(s) found a fault` : 'no faults found');
process.exit(failures ? 1 : 0);
