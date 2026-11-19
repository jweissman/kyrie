// AT-07 probe: engine-side container support along a walk. Read-only; prints violations, changes nothing.
// Run from the repository: cd /var/tmp/kyrie/wt-m21 && bun /var/tmp/kyrie/m22/probes-at07/support.ts
import { DrawnWorld } from '/var/tmp/kyrie/wt-m21/src/world/drawn-world';
import { NodeBundleSource } from '/var/tmp/kyrie/wt-m21/src/campaign/node-bundle-source';
import { Journey } from '/var/tmp/kyrie/wt-m21/src/session/journey';
import { Doable, type Row } from '/var/tmp/kyrie/wt-m21/src/presentation/doable';
import { Attest } from '/var/tmp/kyrie/wt-m21/src/presentation/attest';
import { Emphasis } from '/var/tmp/kyrie/wt-m21/src/presentation/emphasis';
import { SceneModel } from '/var/tmp/kyrie/wt-m21/src/ui/scene';
import { Attending } from '/var/tmp/kyrie/wt-m21/src/ui/attention';
import { Paging } from '/var/tmp/kyrie/wt-m21/web/reader/paging';
import { LensFocus } from '/var/tmp/kyrie/wt-m21/web/reader/stage/lens-focus';
import type { Aspect, Glance } from '/var/tmp/kyrie/wt-m21/src/presentation/glance-types';
import type { Choice } from '/var/tmp/kyrie/wt-m21/src/ui/choice-list';
import { Glanced } from '/var/tmp/kyrie/wt-m21/test/support/glanced';

const drawn = (as: readonly Aspect[]) => [...Emphasis.drawn(as, true), ...as.includes('companionship') ? ['companionship' as const] : []]
  .filter((a, i, all) => all.indexOf(a) === i);
const counts: Record<string, number> = {};
const tally = (k: string) => { counts[k] = (counts[k] ?? 0) + 1; };
const out: string[] = [];

function check(at: string, g: Glance, screen: ReturnType<Journey['screen']>) {
  const scene = Attending.place(SceneModel.build(screen));
  const tree = new Map<string, Choice>();
  const index = (cs: Choice[]) => { for (const c of cs) { tree.set(c.id, c); index(c.children ?? []); } };
  index([...scene.subjects.flatMap(s => s.choices), ...scene.near, ...scene.far, ...scene.you]);
  // P1: an opener led with (acts, lens promoted): each drawn aspect it bears is borne by some descendant's witness.
  const led = [...g.acts, ...Object.values(g.lenses ?? {}).flatMap(l => l.promoted)];
  for (const a of led) {
    const c = tree.get(a.choice);
    if (!c || c.command || !c.children?.length) { continue; }
    tally('openers led');
    const kids = Attending.all(c.children);
    const borne = new Set(kids.flatMap(k => Attest.within(g, k)).flatMap(w => w.aspects));
    const own = drawn(a.continues ? a.aspects : a.aspects.filter(x => x !== 'undertaking'));
    const missing = own.filter(x => !borne.has(x));
    if (missing.length) { tally('P1 opener aspect with no descendant'); out.push(`${at} | P1 ${a.choice} why=${a.why} aspects=${a.aspects.join(',')} missing=${missing.join(',')}`); }
  }
  // P2: a likeness's aspects borne by some row of that subject (its choices and what is within them).
  for (const [who, l] of Object.entries(g.likenesses ?? {})) {
    const s = scene.subjects.find(x => x.id === who);
    tally('likenesses');
    const rows = Attending.all(s?.choices ?? []);
    const borne = new Set(rows.flatMap(k => Attest.within(g, k)).flatMap(w => w.aspects));
    const missing = drawn(l.continues ? l.aspects : l.aspects.filter(x => x !== 'undertaking')).filter(x => !borne.has(x) && x !== 'danger');
    if (missing.length) { tally('P2 likeness aspect with no row'); out.push(`${at} | P2 ${who} likeness=${l.aspects.join(',')} missing=${missing.join(',')}`); }
  }
  // P3: row validity in Doable (every client's rows): words, and a command or rows to open.
  const rows = Doable.flat(Doable.of(g, screen));
  for (const r of rows) {
    tally('doable rows');
    if (!r.label.trim()) { tally('P3 blank label'); out.push(`${at} | P3 blank ${r.id}`); }
    if (!r.does && !r.opens?.length) { tally('P3 neither does nor opens'); out.push(`${at} | P3 inert ${r.id} "${r.label}"`); }
  }
  // P3b: lens acts: words, and a command or a choice in the scene's tree.
  for (const [lens, l] of Object.entries(g.lenses ?? {})) {
    for (const a of [...l.promoted, ...l.rest, ...Object.values(l.leaves ?? {}).flat()]) {
      tally('lens acts');
      if (!a.label.trim()) { tally('P3b blank lens act'); out.push(`${at} | P3b blank ${lens} ${a.choice}`); }
      if (!a.command && !tree.get(a.choice)) { tally('P3b lens act with no command nor choice'); out.push(`${at} | P3b ${lens} ${a.choice} "${a.label}"`); }
    }
    // AT-04: the size of each lens as the page pages it (four in view, three a page and More).
    const acts = [...l.promoted, ...l.rest];
    const pages = Paging.of(LensFocus.of(acts, [], s => s).rows, 4, 0).pages;
    counts[`max pages ${lens}`] = Math.max(counts[`max pages ${lens}`] ?? 0, pages);
    // A rest act carrying no aspect at all though the offer's rest gives it one (the terminal colours it, the page not).
    const offered = new Map((g.offer?.rest ?? []).map(o => [o.choice, o]));
    for (const a of l.rest) {
      const o = offered.get(a.choice), w = Attest.witness(g, a.choice);
      if (o && drawn(o.aspects).length && !w) { tally(`P4 rest act coloured in the offer, unwitnessed (${lens})`);
        if ((counts[`P4 rest act coloured in the offer, unwitnessed (${lens})`] ?? 0) <= 3) {
          out.push(`${at} | P4 ${lens} ${a.choice} offer.aspects=${o.aspects.join(',')}`); } }
    }
  }
}

const walks: { world: string; origin: string; cls: string; acts: string[] }[] = [
  { world: 'iscoed', origin: 'drove', cls: 'warrior', acts: ['Read the notice on the well-post', 'Ask Owain how many head came down',
    'To the drove pens', 'To the Black Rhyne', 'Search', 'travel:drove__customs', 'Tell Mardle where the four bullocks are'] },
];
const auto = (process.env.AUTO ?? '').split(',').filter(Boolean);
for (const spec of auto) {
  const [world, origin, cls] = spec.split(':');
  const j = Journey.of(await DrawnWorld.start(world!, { origin: origin!, party: [{ name: 'Wenna', raceId: 'human', classId: cls! }] },
    NodeBundleSource.shared));
  for (let turn = 0; turn < Number(process.env.TURNS ?? 20); turn++) {
    const p = Glanced.of(j.session), g = p.leaf.glance!;
    check(`${world}/${origin}:T${turn}@${p.screen.place.name}`, g, p.screen);
    const rows = Doable.flat(Doable.of(g, p.screen)).filter(r => r.does && !r.does.startsWith('view:'));
    const pick = rows[(turn * 7) % Math.max(1, rows.length)];
    if (!pick?.does) { break; }
    try { await j.perform(pick.does); } catch (e) { out.push(`could not ${pick.does}: ${String(e).slice(0, 80)}`); break; }
  }
}
for (const w of process.env.AUTO ? [] : walks) {
  const j = Journey.of(await DrawnWorld.start(w.world, { origin: w.origin, party: [{ name: 'Wenna', raceId: 'human', classId: w.cls }] },
    NodeBundleSource.shared));
  const look = (at: string) => { const p = Glanced.of(j.session); check(`${w.world}:${at}@${p.screen.place.name}`, p.leaf.glance!, p.screen); };
  look('start');
  for (const act of w.acts) {
    try { await (act.includes(':') ? j.perform(act) : j.play(act)); } catch (e) { out.push(`could not ${act}: ${String(e).slice(0, 80)}`); break; }
    look(act);
  }
}
console.log(out.join('\n'));
console.log(JSON.stringify(counts, null, 1));
