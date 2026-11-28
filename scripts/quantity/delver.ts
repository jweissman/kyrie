import { PlayTool } from '../../src/cli/play-tool';
import { Runner, type Said } from '../../src/cli/runner';
import { RunnerOffer } from '../../src/cli/runner-offer';
import { ModuleWriter, World } from '../../src/lang/index';
import { PlaySession } from '../../src/session/play-session';
import { CreatureFacts } from '../../src/campaign/creature-facts';
import { CreatureStore } from '../../src/creature-store';
import { ItemCatalog } from '../../src/item-catalog';
import { StockOpenings } from '../../src/world/stock-openings';
import { GoldenWalk } from '../../test/support/golden-walk';
import { BoredomCensus } from '../boredom-census';
import { NoviceCountry } from '../novice-country';
import { QuantityDungeon } from './dungeon';
import { QuantityPlaces } from './places';
import { Content } from '../../src/content';
import type { CombatEvent } from '../../src/model';

// A delve into the first dungeon, as the quantity gate walks it (the acceptance ladder's third rung, a cheap automated
// player; the lead's brief of 26 November: "the walked number must move", for the golden walk and the gold-follower
// never go down into the deep). The warrior of the walks, set down at the way into the country's first dungeon (the
// nearest site of two levels or more with a boss and a cache: QuantityDungeon) with a torch lit, goes on into it room
// by room: a room it has not been in first, the way down before the way back, a working part it has not tried (a
// wheel, a seal) once, and fights whatever meets it through by the company's own tactics, for so many steps. What it
// reads: the minutes it spent there and the fights begun, and how far down it came.
// rounds: each fight's, one initiative a round; beasts: those of the fights with a swarm of beasts (see beasts).
export interface Delved { name: string; seed: string; site: string; minutes: number; fights: number; levels: number;
  rooms: number; fell: boolean; rounds?: number[]; beasts?: number[] }
export class QuantityDelver {
  static readonly as = 'human/warrior/Wenna';
  static readonly steps = 60;
  static trace = false;
  static async walk(seed: string, steps = this.steps): Promise<Delved> {
    const opening = seed === 'iscoed' ? GoldenWalk.opening : StockOpenings.none;
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', seed, '--as', this.as, '--opening', opening]));
    const dungeon = QuantityDungeon.first(journey.session.campaign, NoviceCountry.read(journey.session.campaign, seed));
    const out: Delved = { name: `delver ${seed}`, seed, site: dungeon?.name ?? '', minutes: 0, fights: 0, levels: 0,
      rooms: 0, fell: false };
    if (!dungeon) { return out; }
    const s = this.hardy(journey.session, dungeon.entry), c = s.campaign, r = new Runner(s);
    const place = QuantityPlaces.place(c, dungeon.entry), been = new Map<string, number>(), tried = new Set<string>();
    const levels = new Set<string>(), start = BoredomCensus.minutes(s), from = c.history.length;
    await this.act(r, this.offers(r.said()).find(id => id.startsWith('light_item(')));
    for (let i = 0; i < steps && c.running && this.standing(s); i++) {
      const here = BoredomCensus.here(s);
      been.set(here, (been.get(here) ?? 0) + 1);
      const level = this.level(s, here);
      if (level) { levels.add(level); }
      const next = this.next(r.said(), { s, place, been, tried });
      if (!next) { break; }
      tried.add(next);
      if (QuantityDelver.trace) { console.error(here, '->', next); }
      await this.act(r, next);
    }
    const events = c.history.slice(from), fought = events.filter(e => e.combat.some(x => x.type === 'initiative'));
    return { ...out, minutes: BoredomCensus.minutes(s) - start, levels: levels.size, rooms: been.size,
      fights: fought.length, fell: !this.standing(s), rounds: fought.map(e => this.rounds(e.combat)),
      beasts: fought.filter(e => this.beasts(c, e.combat)).map(e => this.rounds(e.combat)) };
  }
  // Set down at the way in (the journey there is the gold walk's to measure, not this one's), and made hard to kill
  // (as the fight specs make a warrior of three hundred hit points): what is read is how much the deep holds to fight
  // in an hour of going through it, not how soon a first-level life falls to it.
  static readonly hp = 300;
  private static hardy(s: PlaySession, at: string): PlaySession {
    const checkpoint = s.checkpoint(), save = checkpoint.save;
    for (const m of save.creatures.filter(x => save.state.partyIds.includes(x.id))) {
      m.base.maxHp = this.hp; m.state.hp = this.hp;
    }
    const was = s.campaign.world.one('at', 'party');
    const world = new World(save.module, save.state.world).apply([
      ...was ? [{ kind: 'retract' as const, call: ModuleWriter.call('at', 'party', was) }] : [],
      { kind: 'assert', call: ModuleWriter.call('at', 'party', at) }]);
    const store = new CreatureStore(ItemCatalog.of(save.module.catalog), save.creatures);
    save.state.world = CreatureFacts.project(world, save.definition!.actors, store).snapshot;
    return PlaySession.resume(checkpoint);
  }
  private static offers(said: Said): string[] {
    return [...said.offer.primary, ...said.offer.rest].flatMap(o => [o, ...o.opens ?? []]).map(o => RunnerOffer.act(o));
  }
  // An act, and a fight it opens fought through.
  private static async act(r: Runner, id?: string): Promise<void> {
    if (!id) { return; }
    let said = await r.ask(JSON.stringify({ act: id }));
    while (!('error' in said) && said.moment === 'fight') { said = await r.ask(JSON.stringify({ act: 'fight:through' })); }
  }
  // Where next: whoever is here, fought; a way to a room of the place not yet been in, deeper first; a trap on a way
  // looked at, prodded from a pole's length, then risked; a working part not yet tried (a wheel, a seal); a light when
  // there is one to light; else the way to the room of the place been in least; else a wait, for what goes about.
  private static next(said: Said,
    at: { s: PlaySession; place?: string; been: Map<string, number>; tried: Set<string> }): string | undefined {
    const ids = this.offers(said), c = at.s.campaign;
    const fight = ids.find(id => id.startsWith('attack('));
    if (fight) { return fight; }
    const ways = ids.filter(id => id.startsWith('go(')).map(id => ({ id, to: /,([^,)]+)\)$/.exec(id)?.[1] ?? '' }))
      .filter(w => QuantityPlaces.place(c, w.to) === at.place);
    const unseen = ways.filter(w => !at.been.has(w.to)).sort((a, b) => this.depth(at.s, b.to) - this.depth(at.s, a.to));
    if (unseen[0]) { return unseen[0].id; }
    const trap = ['look_closely(', 'prod(', 'change_thing(', 'risk(', 'light_item(']
      .map(verb => ids.find(id => id.startsWith(verb) && !at.tried.has(id))).find(Boolean);
    if (trap) { return trap; }
    const least = [...ways].sort((a, b) => (at.been.get(a.to) ?? 0) - (at.been.get(b.to) ?? 0))[0];
    return least?.id ?? ids.find(id => id === 'wait');
  }
  // The level a room is on, and how far down it is (its index among the site's levels, by id order of writing).
  private static level(s: PlaySession, room: string): string | undefined {
    const e = s.campaign.module.entities.find(x => x.id === room);
    return e?.space?.kind === 'room' ? e.space.parent : undefined;
  }
  private static depth(s: PlaySession, room: string): number {
    const level = this.level(s, room);
    const levels = s.campaign.module.entities.filter(e => e.space?.kind === 'level');
    return level ? Math.max(0, levels.findIndex(e => e.id === level)) : 0;
  }
  private static rounds(combat: CombatEvent[]): number { return combat.filter(x => x.type === 'initiative').length; }
  // Whether the company fought a swarm: three or more beasts (animals of flesh) of one kind, by who rolled for the
  // first round (the rats of the barrow's cross-chamber, OR-1855).
  private static beasts(c: PlaySession['campaign'], combat: CombatEvent[]): boolean {
    const first = combat.find(x => x.type === 'initiative'), party = new Set(c.readout.partyIds);
    const foes = first?.type === 'initiative' ? first.order.map(o => o.id).filter(id => !party.has(id)) : [];
    const races = [...new Set(foes.map(id => c.readout.creatures.find(k => k.id === id)?.raceId ?? ''))];
    const kind = races.length === 1 ? Content.race(c.catalog, races[0]!) as { kind?: string; type?: string }
      : undefined;
    return foes.length >= 3 && kind?.kind === 'animal' && kind.type !== 'undead';
  }
  private static standing(s: PlaySession): boolean {
    const c = s.campaign;
    return c.readout.creatures.some(k => c.readout.partyIds.includes(k.id) && k.state.hp > 0);
  }
}

if (import.meta.main) {
  QuantityDelver.trace = process.argv.includes('--trace');
  for (const seed of process.argv.slice(2).filter(a => !a.startsWith('--')).length
    ? process.argv.slice(2).filter(a => !a.startsWith('--')) : ['iscoed', 'a1', 'thorn']) {
    const d = await QuantityDelver.walk(seed);
    console.log(JSON.stringify({ ...d, perHour: d.minutes ? Math.round(d.fights / (d.minutes / 60) * 100) / 100 : 0 }));
  }
}
