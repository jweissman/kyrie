import type { DeepLayout, DeepLevel, DeepLink, DeepRoom } from './deep-layout';
import type { MechanismWords } from './deep-purposes';

// What the makers cut where they sealed the way down: the site's old name, their fate, what the keeper cannot bear,
// and the fact reading it teaches.
interface Words { fate: string; oldup: string; bane?: string; taught?: string }

// The working parts of a deep site, as Kyr: each a thing with states and the changes that move it, and the ways and
// rules that follow from it, in the words its purpose gives them (a mine's cage on a winding wheel, a barrow's portal
// stone on its counterweight). A way between levels that runs only once its gear is freed, with a climb beside it
// meanwhile; a seal across the way down, with the makers' warning cut in it; a drowned level that drains only while
// water is turned onto a wheel a level up and the wheel's chain engaged, and time passes; a hidden way out, found by
// what comes through it (a draft, a thread of daylight). Each acts the same way in every site that has it.
export class DeepMechanisms {
  static readonly q = JSON.stringify;
  static lines(layout: DeepLayout, words: Words, said: MechanismWords): string[] {
    return [...layout.links.flatMap(l => l.mechanism === 'winch' && said.winch ? this.winch(l, said.winch)
      : l.mechanism === 'seal' && said.seal ? this.seal(l, words, said.seal) : []),
    ...said.drowned ? layout.levels.filter(l => l.flooded).flatMap(l => this.drowned(layout, l, said.drowned!)) : [],
    ...said.vent ? this.vent(layout, said.vent) : []];
  }
  static room(layout: DeepLayout, role: string): DeepRoom | undefined {
    return layout.levels.flatMap(l => l.rooms).find(r => r.role === role);
  }
  private static winch(l: DeepLink, w: NonNullable<MechanismWords['winch']>): string[] {
    const q = this.q, gear = `${l.id}_wheel`;
    return [`  Thing ${gear} ${q(w.thing)} at ${l.a} {`, `    State seized ${q(w.seized)}.`, `    State turning ${q(w.turning)}.`,
      `    Change free ${q(w.free)} from seized to turning needing brawn or crowbar.`, '  }',
      `  Passage ${l.id} ${q(l.name)} is ${w.kind} between ${l.a} and ${l.b} taking ${l.minutes} minutes`
        + ` opening when state(${gear}, turning) ${q(w.shut)}.`,
      `  Passage ${l.id}_chain ${q(w.climb)} is climb between ${l.a} and ${l.b} taking 10 minutes needing climbing or rope.`];
  }
  private static seal(l: DeepLink, words: Words, w: NonNullable<MechanismWords['seal']>): string[] {
    const q = this.q, wall = `${l.id}_wall`, cut = `${l.id}_cut`;
    const read = w.read.replace('{oldup}', words.oldup).replace('{FATE}', words.fate.toUpperCase());
    return [`  Passage ${l.id} ${q(l.name)} is ${w.kind} between ${l.a} and ${l.b} taking ${l.minutes} minutes.`,
      `  Thing ${wall} ${q(w.thing)} on ${l.id} {`, `    State standing blocking ${q(w.standing)}.`, `    State broken ${q(w.broken)}.`,
      // Broken by main force, unless the purpose says how else it opens (a door that opens to a note, for lore).
      `    Change break ${q(w.break)} from standing to broken needing ${w.needs ?? 'brawn or crowbar'}.`,
      // Built back up from above, as whoever promised it would: never from below, walling the builder in.
      `    Change rebuild ${q(w.rebuild)} from broken to standing needing ${w.needs ?? 'brawn'} at ${l.a}.`, '  }',
      `  Thing ${cut} ${q(w.words)} at ${l.a} {`, `    State unread ${q(w.unread)}.`,
      `    State read ${q(`${read}${words.bane ? ` ${words.bane}` : ''}`)}.`,
      `    Change read ${q(w.readLabel)} from unread to read needing lore.`, '  }',
      ...words.taught ? [`  Observe ${cut}_told at ${l.a} when state(${cut}, read) and not knows(party, ${words.taught})`
        + ` ${q(w.told)} teaches ${words.taught}.`] : []];
  }
  // A drowned level: every way on it but the one into it is under water until the water is down; it goes down only
  // while the water above is turned onto the wheel and the wheel's chain draws it, a watch at a time.
  private static drowned(layout: DeepLayout, level: DeepLevel, w: NonNullable<MechanismWords['drowned']>): string[] {
    const q = this.q, water = `deepWater(${level.id})`, spring = this.room(layout, 'race_head');
    const pump = this.room(layout, 'pump'), arrival = layout.links.find(l => l.between && level.rooms.some(r => r.id === l.b))?.b;
    const ways = layout.links.filter(l => !l.between && level.rooms.some(r => r.id === l.a));
    const lines = [`  Initially Set ${water} to 12.`, `  Relation ${level.id}_dry().`, ...ways.map(l => `  Passage ${l.id} ${q(l.name)}`
      + ` is ${l.kind} between ${l.a} and ${l.b} taking ${l.minutes} minutes opening when ${water} == 0 ${q(w.flooded)}.`),
    ...arrival ? [`  Observe ${level.id}_deep at ${arrival} when ${water} > 6 ${q(w.deep)}.`,
      `  Observe ${level.id}_going at ${arrival} when ${water} > 0 and ${water} <= 6 ${q(w.going)}.`] : []];
    if (!spring || !pump) { return lines; }
    const gate = `${spring.id}_gate`, chain = `${pump.id}_chain`, on = `state(${gate}, open)`;
    return [...lines, `  Thing ${gate} ${q(w.gate)} at ${spring.id} {`, `    State shut ${q(w.gateShut)}.`,
      `    State open ${q(w.gateOpen)}.`, `    Change open ${q(w.open)} from shut to open.`,
      `    Change shut ${q(w.shut)} from open to shut.`, '  }',
      `  Thing ${chain} ${q(w.chain)} at ${pump.id} {`, `    State slack ${q(w.slack)}.`, `    State engaged ${q(w.engaged)}.`,
      `    Change engage ${q(w.engage)} from slack to engaged.`, '  }',
      // A watch's worth at a time, however much is done in the watch.
      `  Rule ${level.id}_pumping when ${on} and state(${chain}, engaged) and ${water} > 0`
        + ` and deepPumped(${pump.id}) < watch(clock) { Decrease ${water} by 1. Set deepPumped(${pump.id}) to watch(clock). }`,
      // Heard at the wheel's pit, not on the fell an hour away.
      `  Rule ${level.id}_drained at ${pump.id} when ${water} == 0 and not ${level.id}_dry() says ${q(w.drained)}`
        + ` { Assert ${level.id}_dry(). }`,
      `  Observe ${pump.id}_running at ${pump.id} when ${on} and state(${chain}, engaged) and ${water} > 0 ${q(w.running)}.`,
      `  Observe ${pump.id}_idle at ${pump.id} when ${on} and state(${chain}, slack) ${q(w.idle)}.`,
      `  Observe ${pump.id}_dry at ${pump.id} when state(${gate}, shut) ${q(w.dry)}.`,
      `  Observe ${pump.id}_heard at ${spring.id} when ${on} ${q(w.heard)}.`];
  }
  // A hidden way out off a room: hidden until what comes through it is followed, then a climb to the open air.
  private static vent(layout: DeepLayout, w: NonNullable<MechanismWords['vent']>): string[] {
    const vent = this.room(layout, 'vent'), way = vent && layout.links.find(l => l.b === vent.id && !l.between);
    if (!vent || !way) { return []; }
    const q = this.q, site = layout.site, found = `${vent.id}_found`;
    return [`  Discovery ${found} ${q(w.found)} { Found by searching ${way.a}. }`,
      `  Observe ${vent.id}_draft at ${way.a} as sign when not knows(party, ${found}) ${q(w.sign)}.`,
      `  Passage ${way.id} ${q(w.crawl)} is crawl between ${way.a} and ${way.b} taking 3 minutes hidden until ${found}.`,
      `  Passage ${vent.id}_rungs ${q(w.rungs)} is climb between ${vent.id} and ${site} taking 6 minutes hidden until ${found}.`];
  }
}
