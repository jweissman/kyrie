import { Journey } from '../src/session/journey';
import { City, Q, campaign } from '../test/support/quittance';

// Exploratory offered-action play: from the road into Quittance, take a random one of the choices the page offers,
// again and again, and check what must always be true. Usage: bun scripts/quittance-fuzz.ts [walks] [steps] [seed]
// A walk that throws, offers nothing, or breaks an invariant is printed with the labels that led to it.
const walks = Number(process.argv[2] ?? 10), steps = Number(process.argv[3] ?? 120), base = process.argv[4] ?? 'fuzz';

function rng(seed: string) {
  let h = 2166136261;
  for (const ch of seed) { h = Math.imul(h ^ ch.charCodeAt(0), 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1_000_000) / 1_000_000; };
}
const skip = [/^The company: Wait › And watch/, /^Pack/, /Give to/, /Set down here/, /prepare spells/i, /Prepare spells/];
const hard: { name: string; check: (j: Journey) => boolean }[] = [
  { name: 'arcs stay within 0..4', check: j => ['prewitt', 'garrity', 'dree', 'ianthe', 'pettifer', 'cray', 'gaunt', 'auberon']
    .every(p => { const v = City.arc(j, p); return v >= 0 && v <= 4; }) },
  { name: 'regard stays within 0..12', check: j => ['phoenix', 'lamprey', 'sovereign', 'providence', 'residuary', 'gasco', 'wardsfolk']
    .every(o => { const v = City.regard(j, o); return v >= 0 && v <= 12; }) },
  { name: 'gold is not negative', check: j => City.gold(j) >= 0 },
  { name: 'at most six wards lit', check: j => j.measure(Q('wardsLit'), Q('city')) <= 6 },
  { name: 'ayes at most five', check: j => j.measure(Q('ayes'), Q('city')) <= 5 },
  { name: 'the company is somewhere', check: j => !!j.at('party') },
  { name: 'not both a keeper terms and a slaying', check: j => !(j.holds(Q('fireSlain'), 'party') && j.holds(Q('fireTerms'), 'party')) },
];

let failures = 0;
for (let w = 0; w < walks; w++) {
  const seed = `${base}-${w}`, pick = rng(seed), trail: string[] = [];
  let j: Journey;
  try { j = await City.start(seed); } catch (e) { console.log(`walk ${w}: could not start: ${e}`); failures++; continue; }
  let ended = false;
  for (let i = 0; i < steps && !ended; i++) {
    let offered;
    try { offered = j.choices().filter(c => !skip.some(s => s.test(c.full))); } catch (e) { console.log(`walk ${w} step ${i}: choices threw: ${e}\n  ${trail.join('\n  ')}`); failures++; break; }
    if (offered.length === 0) { console.log(`walk ${w} step ${i}: nothing offered at ${j.at('party')} (watch ${j.watch()})\n  ${trail.slice(-8).join('\n  ')}`); failures++; break; }
    // Prefer the story to the weather: waits are picked a tenth of the time.
    const doing = offered.filter(c => !/Wait ›|Make camp|Search here/.test(c.full));
    const pool = pick() < 0.1 || doing.length === 0 ? offered : doing, choice = pool[Math.floor(pick() * pool.length)]!;
    trail.push(`[${j.watch()}] ${choice.full}`);
    try { await j.perform(choice.command, choice.label, choice.grave); } catch (e) {
      if (/closed|ended|reached/i.test(String(e))) { ended = true; break; }
      console.log(`walk ${w} step ${i}: ${choice.full} threw: ${e}\n  ${trail.slice(-10).join('\n  ')}`); failures++; break;
    }
    for (const inv of hard) {
      let ok = true; try { ok = inv.check(j); } catch (e) { ok = false; }
      if (!ok) { console.log(`walk ${w} step ${i}: invariant broken: ${inv.name}\n  ${trail.slice(-10).join('\n  ')}`); failures++; ended = true; break; }
    }
  }
  console.log(`walk ${w}: ${trail.length} steps, now at ${j.at('party')}, watch ${j.watch()}, gold ${City.gold(j)}, wards lit ${j.measure(Q('wardsLit'), Q('city'))}`);
}
console.log(failures ? `${failures} walk(s) found a fault` : 'no faults found');
process.exit(failures ? 1 : 0);
