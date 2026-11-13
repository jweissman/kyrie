// Fragile start audit: a careful, ordinary player from the opening to the first ruin it is told the way to.
// bun fragile.ts <seed> <origin> <class> [hire]
// It asks every rumour in the starting town, optionally hires the town's traveller, travels to the nearest ruin whose
// way it was told, and explores it: lighting the dark, trying a riddle's words, stepping into traps when it must, and
// taking on only fights the page reckons slight, fair or hard. Every fight is fought with the game's own tactics, and
// the player's turns in it are counted.
import { AutoplayRun } from '../../../../src/autoplay/run';
import { ScreenModel } from '../../../../src/ui/screen-model';
import { PlayerView } from '../../../../src/presentation/player-view';
import { Itineraries } from '../../../../src/ui/itinerary';
import { Travel } from '../../../../src/session/travel';
import { Tactics } from '../../../../src/tactics';
import { DangerSense } from '../../../../src/presentation/danger-sense';
import { Advancement } from '../../../../src/rules/advancement';
import type { Battle } from '../../../../src/battle';

const [seed, origin, cls, ...flags] = process.argv.slice(2) as [string, string, string, ...string[]];
const hire = flags.includes('hire'), big = flags.includes('big');
const race = cls === 'mage' ? 'elf' : 'human';
const s = await AutoplayRun.start({ seed, origin, protagonist: { name: 'P', raceId: race, classId: cls },
  policy: 'wander', steps: 0 });
const c: any = s.campaign;
const log: string[] = [];
const labels: Record<string, string> = {};
const fights: any[] = [];
let decisions = 0, playerTurns = 0;
const harms: any[] = [];
const screen = (): any => ScreenModel.build(c);
const choices = () => PlayerView.choices(c).map(x => ({ id: x.choice.id, name: x.choice.name }));
const hero = () => c.readout.creatures.find((x: any) => x.id === c.readout.partyIds[0]);
const alive = () => c.running && (hero()?.state.hp ?? 0) > 0;
const ended = () => !c.running;
const siteOf = (id: string) => /^region__(w\d+)(?:_|$)/.exec(id ?? '')?.[1];
const townOf = (id: string) => /^region__(s\d+)_/.exec(id ?? '')?.[1];
const here = (): string => c.world.one('at', c.playerActor);
const danger = (group: string) => { try { return DangerSense.reckon(c, group)?.danger ?? 'none'; } catch (e) { if (process.env.TRACE) console.error('danger', group, (e as Error).message); return '?'; } };

async function act(command: string, why: string) {
  decisions++;
  let turns = 0;
  const before = hero()?.state.hp;
  const event: any = await s.perform(command, async (b: Battle) => {
    turns++; playerTurns++; return Tactics.choose(b.state, b.legalCommands());
  });
  const battle = event?.combat?.some((e: any) => e.type === 'end');
  if (!battle && /^risk\(/.test(command) === false && (hero()?.state.hp ?? 0) < (before ?? 0)) { harms.push({ why, from: before, to: hero()?.state.hp ?? 0 }); }
  if (event?.combat?.length && (battle || /^risk\(/.test(command))) {
    const chosen = /^attack\(/.test(command), trap = /^risk\(/.test(command) && turns === 0;
    fights.push({ at: here(), chosen, trap, why, turns, hpBefore: before, hpAfter: hero()?.state.hp ?? 0, died: !alive(),
      outcome: event.combat.find((e: any) => e.type === 'end')?.outcome ?? event.result });
  }
  log.push(`${why}: ${command}`);
  return event;
}

// 1. The starting town: every place in it, every rumour.
const town = townOf(here()) ?? 's1';
const seen = new Set<string>();
async function talkEverybody() {
  for (const p of screen().people) {
    if (seen.has(p.id)) { continue; }
    seen.add(p.id);
    const talk = (p.acts ?? []).find((a: any) => /^talk_to\(/.test(a.command ?? ''));
    if (!talk) { continue; }
    await act(talk.command, 'talk');
    for (let n = 0; n < 12; n++) {
      const person = screen().people.find((x: any) => x.id === p.id);
      const topics = (person?.acts ?? []).find((a: any) => a.label === 'Talk')?.children ?? [];
      const next = topics.find((t: any) => t.command && !seen.has(t.command)
        && (/^(Ask|Give|Tell .* you will)/.test(t.label)) && !/five days|to join/.test(t.label));
      const all = (a: any[]): any[] => (a ?? []).flatMap((x: any) => [x, ...all(x.children)]);
      const join = all(person?.acts).find((t: any) => t.command && /join the company|to join|come along/i.test(t.label));
      if (hire && join && !seen.has(join.command)) { seen.add(join.command); await act(join.command, 'hire'); continue; }
      if (!next) { break; }
      seen.add(next.command);
      await act(next.command, 'ask');
    }
    const leave = screen().people.find((x: any) => x.id === p.id)?.acts?.find((a: any) => /^take_leave/.test(a.command ?? ''));
    if (leave) { await act(leave.command, 'leave'); }
  }
}
const visited = new Set<string>();
const trail: string[] = [];
for (let guard = 0; guard < 60; guard++) {
  const at = here();
  if (!visited.has(at)) { visited.add(at); await talkEverybody(); }
  const exits = screen().exits.filter((e: any) => townOf(e.destination?.id) === town && !visited.has(e.destination.id));
  const go = exits[0]?.acts?.[0]?.command;
  if (go) { trail.push(at); await act(go, 'town'); continue; }
  const back = trail.pop();
  if (!back) { break; }
  const way = screen().exits.find((e: any) => e.destination?.id === back)?.acts?.[0]?.command;
  if (!way) { break; }
  await act(way, 'town-back');
}

// 2. The first ruin it is told the way to (else the nearest it knows of).
const told = (screen().knowledge ?? []).map((k: any) => k.text as string).filter((t: string) => /^The way to /.test(t));
const dests = Itineraries.destinations(c).filter((d: any) => siteOf(d.id))
  .map((d: any) => ({ id: d.id, name: d.name, minutes: Itineraries.plan(c, d.id)?.minutes ?? 9999,
    told: told.some((t: string) => t.includes(d.name)) }))
  .map((d: any) => ({ ...d, rooms: c.module.entities.filter((e: any) => e.type === 'place' && siteOf(e.id) === siteOf(d.id)).length }))
  .sort((a: any, b: any) => (big ? b.rooms - a.rooms : 0) || Number(b.told) - Number(a.told) || a.minutes - b.minutes);
const target = dests[0];
const result: any = { seed, origin, cls, hire, mode: big ? 'big' : 'first', party: c.readout.partyIds.length, heroHp: hero()?.base.maxHp,
  target: target?.name ?? null, told: target?.told ?? false, decisions: 0 };
if (!target) { result.reached = false; result.known = Itineraries.destinations(c).map((d: any) => d.id); result.told = told; finish(); }

const journey = await Travel.go({ campaign: c, perform: (command: string, said: string) => act(command, `travel ${said}`) },
  target.id);
for (let tries = 0; tries < 8 && !journey.arrived && alive(); tries++) {
  // An ordinary player stops for the night, and when weary: camps where they are, or sleeps.
  const cs0 = choices();
  const camp = cs0.find(x => /^(make_camp|camp|rest|take_lodging)/.test(x.id));
  if (camp && (screen().expedition?.daylight !== 'day' || screen().expedition?.weary)) { await act(camp.id, 'camp'); }
  const again = await Travel.go({ campaign: c, perform: (command: string, said: string) => act(command, `travel ${said}`) },
    target.id);
  if (again.arrived) { journey.arrived = true; }
  if (!again.legs.length) { break; }
}
result.reached = journey.arrived && alive();
result.arrivedAt = screen().clock;
const site = siteOf(target.id)!;

// The site's climax: its worthiest band.
const groups = Object.entries<string[]>(c.readout.inhabitants)
  .filter(([g, members]) => g !== c.playerActor && !members.some((m: string) => c.readout.partyIds.includes(m)) && siteOf(c.world.one('at', g) ?? '') === site && !c.world.test({ kind: 'call', name: 'peaceable', args: [g] }))
  .map(([g, members]) => ({ g, worth: members.reduce((n: number, id: string) => {
    const cr = c.readout.creatures.find((x: any) => x.id === id); return n + (cr ? Advancement.worth(cr) : 0); }, 0) }))
  .sort((a, b) => b.worth - a.worth);
const climax = groups[0]?.g;
result.climax = climax ? c.module.entities.find((e: any) => e.id === climax)?.name : null;
result.climaxLabelOnArrival = climax ? danger(climax) : null;

// 3. Explore: lit, riddles tried, traps walked by the hardiest, fights only when not grave or deadly.
const tried = new Set<string>();
const edges: Record<string, Set<string>> = {};
const roomWays: Record<string, string[]> = {};
let hazards = 0, rests = 0;
const hpOf = (command: string) => { const m = /,([^,)]+)\)$/.exec(command)?.[1]; const cr = c.readout.creatures.find((x: any) => m && m.includes(x.id.replace(/^region__/, ''))); return cr?.state.hp ?? 0; };
function nearest(from: string): string[] | undefined {
  const prev = new Map<string, string>([[from, '']]), queue = [from];
  while (queue.length) {
    const at = queue.shift()!;
    if (at !== from && !visited.has(at)) {
      const path = [at]; let p = prev.get(at)!; while (p) { path.unshift(p); p = prev.get(p)!; } return path;
    }
    for (const to of edges[at] ?? []) { if (!prev.has(to)) { prev.set(to, at); queue.push(to); } }
  }
  return undefined;
}
for (let step = 0; step < 90 && alive(); step++) {
  const sc = screen(), cs = choices();
  visited.add(here());
  roomWays[here()] = sc.exits.map((e: any) => `${e.name}${e.passage && e.passage !== 'open' ? ` [${e.passage}]` : ''}${e.reason ? ` (${e.reason})` : ''} :: ${JSON.stringify((e.acts ?? []).map((a: any) => [a.command, a.label, (a.children ?? []).map((k: any) => [k.command, k.label])]))}`);
  if (sc.dark) {
    const light = cs.find(x => /^light_item\(/.test(x.id)) ?? cs.find(x => /^field_spell\(.*light/.test(x.id));
    if (light && !tried.has(`${light.id}@${step}`)) { tried.add(`${light.id}@${step}`); await act(light.id, 'light'); continue; }
  }
  const h = hero(), hurt = h && h.state.hp < 0.6 * h.base.maxHp;
  const rest = cs.find(x => /^(rest|camp)\(/.test(x.id));
  if (hurt && rest && !tried.has(`${rest.id}@${screen().clock}`)) { tried.add(`${rest.id}@${screen().clock}`); rests++; await act(rest.id, 'rest'); continue; }
  const attacks = cs.filter(x => /^attack\(/.test(x.id));
  let fought = false;
  for (const a of attacks) {
    const g = a.id.slice(7).split(',')[1]!;
    const d = danger(g);
    labels[g] = labels[g] ?? d;
    if (g === climax) { result.climaxLabelMet = d; }
    if (['slight', 'fair', 'hard'].includes(d) && !tried.has(a.id)) { tried.add(a.id); await act(a.id, `fight(${d})`); fought = true; break; }
  }
  if (fought) { continue; }
  const riddle = cs.find(x => /press|speak|answer/i.test(x.name) && !tried.has(x.id));
  const goes = cs.filter(x => /^go\(/.test(x.id));
  const dest = (id: string) => id.replace(/\)$/, '').split(',').at(-1)!;
  for (const g of goes) { const to = dest(g.id); if (siteOf(to) === site) { (edges[here()] ??= new Set()).add(to); } }
  for (const e of sc.exits) { const to = e.destination?.id; if (siteOf(to) === site && ['hazard', 'open'].includes(e.passage ?? 'open')) { (edges[here()] ??= new Set()).add(to); } }
  const fresh = goes.filter(x => siteOf(dest(x.id)) === site && !visited.has(dest(x.id)) && !tried.has(x.id));
  if (fresh.length) { tried.add(fresh[0]!.id); await act(fresh[0]!.id, 'explore'); continue; }
  if (riddle) { tried.add(riddle.id); await act(riddle.id, 'riddle'); continue; }
  // A hazard on a way not yet taken: look, then a safe way past if one is offered, else the hardiest goes first.
  const hazard = sc.exits.find((e: any) => e.passage === 'hazard' && !visited.has(e.destination?.id)
    && siteOf(e.destination?.id) === site && !tried.has(`hazard:${e.destination?.id}:risked`));
  if (hazard && !hurt) {
    const kids = (hazard.acts ?? []).flatMap((a: any) => a.children ?? []).filter((k: any) => k.command);
    const look = kids.find((k: any) => /^look_closely/.test(k.command) && !tried.has(k.command));
    if (look) { tried.add(look.command); await act(look.command, 'look'); continue; }
    const safe = kids.find((k: any) => !/^(look_closely|risk|prod)\(/.test(k.command) && !tried.has(k.command));
    if (safe) { tried.add(safe.command); await act(safe.command, 'disarm'); continue; }
    const risks = kids.filter((k: any) => /^risk\(/.test(k.command));
    const hardiest = risks.sort((a: any, b: any) => hpOf(b.command) - hpOf(a.command))[0];
    if (hardiest) { tried.add(`hazard:${hazard.destination.id}:risked`); hazards++; await act(hardiest.command, 'risk'); continue; }
  }
  const work = cs.find(x => /^change_thing\(/.test(x.id) && !/coins/.test(x.id) && !tried.has(x.id));
  if (work) { tried.add(work.id); await act(work.id, 'work'); continue; }
  // The nearest room seen but not entered, by the ways already known.
  const path = nearest(here());
  if (!path) { result.stuck = { rooms: roomWays, at: here(), offered: cs.map(x => `${x.id} | ${x.name}`).slice(0, 40), ways: screen().exits.map((e: any) => `${e.name} :: ${e.passage} :: ${e.reason ?? ''}`) }; break; }
  const step1 = goes.find(x => dest(x.id) === path[1]);
  if (!step1) { break; }
  await act(step1.id, 'backtrack');
}
result.roomsSeen = [...visited].filter(v => siteOf(v) === site).length;
result.siteRooms = c.module.entities.filter((e: any) => e.type === 'place' && siteOf(e.id) === site).length;
result.climaxDown = climax ? !c.readout.inhabitants[climax]?.some((id: string) => (c.readout.creatures.find((x: any) => x.id === id)?.state.hp ?? 0) > 0) : null;
finish();

function finish(): never {
  const real = fights.filter(f => !f.trap);
  const firstTurnFight = real.findIndex(f => f.turns > 0);
  const deathAt = real.findIndex(f => f.died);
  Object.assign(result, {
    decisions, playerTurns, hazardsRisked: hazards, harms, rests, traps: fights.filter(f => f.trap).length,
    fights: fights.filter(f => !f.trap).length, chosenFights: fights.filter(f => f.chosen).length,
    unchosenFights: fights.filter(f => !f.chosen && !f.trap).length,
    autoResolved: fights.filter(f => !f.trap && f.turns === 0).length,
    killedBy: (() => { const d = fights.find(f => f.died); return d ? (d.trap ? 'trap' : d.chosen ? 'chosen fight' : 'set upon') : null; })(),
    fell: !alive(), died: ended(),
    diedWithoutTurn: deathAt >= 0 && real[deathAt].turns === 0,
    diedBeforeFirstTurn: deathAt >= 0 && (firstTurnFight < 0 || firstTurnFight > deathAt),
    labels: Object.values(labels).reduce((m: any, l) => (m[l] = (m[l] ?? 0) + 1, m), {}),
    fightLog: fights.map(f => `${f.why}${f.trap ? ' (trap)' : f.chosen ? '' : ' (set upon)'} turns=${f.turns} hp ${f.hpBefore}->${f.hpAfter}${f.died ? ' DIED' : ''}`),
  });
  if (process.env.TRACE) { result.log = log.slice(-40); }
  console.log(JSON.stringify(result));
  process.exit(0);
}
