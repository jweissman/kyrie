import { Likeness } from '../paintings/likeness';
import { CharacterSheets } from '../presentation/character-sheet';
import { CoinReading } from '../presentation/coin-reading';
import { Itineraries } from './itinerary';
import type { World } from '../lang/world';
import { EntityIndex } from '../lang/entity-index';
import { ItemNames } from '../item-names';
import { MechanicsText } from '../presentation/mechanics-text';
import { ConditionSense } from '../presentation/condition-sense';
import { Advancement } from '../rules/advancement';
import { Canon } from '../canon/canon'; import { Content } from '../content';
import { Illumination } from './illumination'; import { Standing } from './standing'; import { Patience } from './patience';
import { ItemCatalog } from '../item-catalog';
import { ModuleWriter } from '../lang/module-writer';
import { FictionalTime } from '../campaign/fictional-time';
import { SeenThrough } from './seen-through';
import { Calendar } from '../campaign/calendar';
import { PlayerView, type PlayerSnapshot } from '../presentation/player-view';
import type { Campaign } from '../campaign/campaign';
import type { Entity } from '../lang/module';
import { SkillReading, type Wanting } from '../presentation/skill-reading';
import { DangerSense } from '../presentation/danger-sense';
import { ChoiceGrouping, type Grouped, type Row } from './choice-grouping';
import { Passages } from './passages';
import { ObservationText } from '../lang/observation-text';
import { ChartModel } from './chart-model'; import { Carriers } from './carriers';
import { Overlays } from '../overlays'; import { PerkText } from '../presentation/perk-text'; import { Exposure } from './exposure';
import { TradeModel } from './trade-model';
import type { Act, ItemRow, MemberRow, Screen, TargetRow } from './screen-types';

// Builds the renderer-independent game screen from the authoritative campaign. Pure: same campaign, same screen.
export class ScreenModel {
  // The date by the campaign's calendar, and the weather by the sky of the region the company is in.
  private static when(campaign: Campaign, elapsed: number): Pick<Screen, 'date' | 'weather'> {
    const start = campaign.readout.calendar, world = campaign.world;
    const sky = world.related('state').find(r => /(^|__)sky$/.test(r.args[0]!))?.args[1];
    return { ...start ? { date: { short: Calendar.short(start, elapsed), long: Calendar.long(start, elapsed) } } : {},
      ...sky ? { weather: sky.replace(/^.*__/, '').replace(/^weather_/, '') } : {} };
  }
  static build(campaign: Campaign): Screen {
    const view = PlayerView.observe(campaign), world = campaign.world;
    const entities = ObservationText.presented(world);
    const names = this.names(campaign);
    const prices = this.prices(world);
    const present = new Set(view.present.map(p => p.id));
    const passageOf = this.passageOf(world, view.location?.id ?? '');
    const fees = this.fees(campaign);
    const grouped = ChoiceGrouping.group(this.commands(campaign), { present, names, prices, passageOf, fees,
      tell: ScreenModel.tell, ...Exposure.of(world), ...view.party.length === 1 ? { solo: true } : {},
      world, reckon: DangerSense.reckon.bind(DangerSense, campaign),
      ...(view.actor ? { carrier: Carriers.carrier.bind(null, world, view.actor) } : {}) });
    const here = view.location?.id ?? '';
    const passages = new Passages(entities, world, view.actor);
    const visited = new Set(view.map.places.filter(p => p.visited).map(p => p.id));
    const unclaimed = new Map([...grouped.targets].filter(([id]) => !present.has(id)));
    const companions = this.companions(campaign, view.actor, { unclaimed, present });
    const scene = this.scene(campaign, view, present), along = this.along(world, view.actor);
    const items = this.items(campaign, grouped, entities);
    const dark = view.observations.some(o => o.id === 'darkness');
    const rows = this.stack(view.present.map(p => ({ ...this.target(p, grouped, world, dark),
      ...along.has(p.id) ? { companion: true } : {},
      ...scene.says.has(p.id) ? { says: scene.says.get(p.id)! } : {}, ...this.reckoning(campaign, p.id, grouped),
      ...CharacterSheets.recruit(campaign, p.id, grouped.targets.get(p.id) ?? []) })));
    return {
      title: view.title, clock: FictionalTime.at(view.elapsed, view.minutes), elapsed: view.elapsed,
      running: view.running, ...Patience.of(campaign, view.minutes),
      ...this.when(campaign, view.elapsed), path: here ? passages.path(here) : [], place: passages.place(here),
      prose: scene.prose, fresh: scene.fresh, observed: view.observations,
      dark: view.observations.some(o => o.id === 'darkness'),
      exits: here ? passages.exits(here, grouped.exits,
        { ...(view.spatial ? { spatial: view.spatial } : {}), visited }) : [],
      people: [...rows.filter(r => ['person', 'creature', 'animal'].includes(r.kind)), ...companions],
      things: rows.filter(r => r.kind === 'thing' || r.kind === 'feature'),
      party: this.party(view, campaign, grouped), items, camp: grouped.camp,
      purse: { coin: view.resources?.find(r => r.id === 'gold')?.amount ?? 0,
        rations: view.resources?.find(r => r.id === 'rations')?.amount ?? 0,
        other: (view.resources ?? []).filter(r => !['gold', 'rations'].includes(r.id) && r.amount > 0)
          .map(r => `${r.amount} ${r.name}`) },
      knowledge: this.knowledge(view), done: SeenThrough.of(campaign),
      deadlines: view.deadlines.map(d => `${d.pressure}: ${FictionalTime.at(d.at)}${d.passed ? ' (passed)' : ''}`),
      capabilities: (view.capabilities ?? []).map(c => `${c.name} — ${c.providers.join(', ')}`),
      formations: this.formations(campaign),
      trade: here ? TradeModel.at(world, here, names) : [],
      objectives: (view.objectives ?? []).map(o => FictionalTime.prose(o.text)),
      ...new ChartModel(world, view.actor, entities).build(visited, here),
      expedition: this.expedition(world, view, items, here),
      map: view.map.places.map(p => ({ id: p.id, name: p.name, visited: p.visited, here: p.id === here,
        zone: passages.path(p.id).slice(0, -1).at(-1)?.name ?? p.zone ?? '' })),
      ...Itineraries.shown(campaign, entities),
      unplaced: [...grouped.unplaced, ...[...unclaimed.entries()].flatMap(([id, acts]) =>
        acts.map(a => ({ ...a, label: `${entities.get(id)?.name ?? id}: ${a.label}` })))],
    };
  }
  // The choices, with who makes each skilled one possible, and what the company could do with a skill nobody in it has.
  private static commands(campaign: Campaign): Row[] {
    const reading = SkillReading.read(campaign);
    return [...PlayerView.choices(campaign).map(r => ({ ...r,
      ...(reading.uses.has(r.action.id) ? { by: reading.uses.get(r.action.id)! } : {}) })),
    ...reading.wanting.map(w => ({ choice: { ...w.choice, time: w.choice.time ?? 1 }, action: w.action,
      wanting: ScreenModel.wanting(w) })), ...CoinReading.read(campaign).map(s => ({ choice: { ...s.choice,
      time: s.choice.time ?? 1 }, action: s.action, wanting: CoinReading.why(s) }))];
  }
  // What each item is priced at, where prices are measured: its items read by the entities' index, not every entity.
  private static prices(world: World): Map<string, number> {
    if (!world.module.measures.some(m => m.name === 'price')) { return new Map(); }
    return new Map(EntityIndex.of(world.module.entities).typed('item')
      .map(e => [e.id, world.number(ModuleWriter.call('price', e.id))]));
  }
  // What things cost: a service's fee, goods by the measure, and what a sale fetches (what a buyer pays for a kind, and
  // what a valuable is worth).
  private static fees(campaign: Campaign): Map<string, number> {
    const world = campaign.world;
    return new Map([
      ...campaign.module.entities.filter(e => e.type === 'service').map(e => [e.id, world.number(ModuleWriter.call('fee', e.id))] as const),
      ...world.measured('goodsPrice').map(m => [`${m.call.args[0]}:${m.call.args[1]}`, m.value] as const),
      ...world.measured('pays').map(m => [`pays:${m.call.args[0]}:${m.call.args[1]}`, m.value] as const),
      ...world.measured('worth').map(m => [`worth:${m.call.args[0]}`, m.value] as const)]);
  }
  // Whoever travels with the company is with it, not met where it is.
  private static along(world: Campaign['world'], actor?: string): Set<string> {
    return new Set(world.module.relations.some(r => r.name === 'travelsWith') && actor
      ? world.related('travelsWith').filter(r => r.args[1] === actor).map(r => r.args[0]!) : []);
  }
  // Family are named as what they are to you: "Ion, your brother", not "Ion, the drover's son".
  private static called(w: Campaign['world'], id: string, name: string): string {
    const kinship = w.module.relations.some(r => r.name === 'kinship') ? w.one('kinship', id) : undefined;
    const word = kinship && w.module.entities.find(e => e.id === kinship)?.name;
    return word ? `${name.split(', ')[0]}, ${word}` : name;
  }
  // Whoever has joined the company, talked to wherever the company is, whether or not they have anything left to
  // say: the follow-up review found companions gone from the page once their questions were asked. Their choices
  // are theirs, not left over among the company's own. They keep the face they were met with (the same review saw
  // a brother's portrait become an initial as he joined).
  private static companions(campaign: Campaign, actor: string | undefined,
    at: { unclaimed: Map<string, Act[]>; present: Set<string> }): TargetRow[] {
    const world = campaign.world, read = campaign.readout;
    if (!actor || !world.module.relations.some(r => r.name === 'travelsWith')) { return []; }
    return world.related('travelsWith').filter(r => r.args[1] === actor && !at.present.has(r.args[0]!)).map(r => {
      const id = r.args[0]!, acts = at.unclaimed.get(id) ?? [];
      const member = read.creatures.find(c => c.id === (read.inhabitants[id]?.[0] ?? `${id}_person`));
      const portrait = member && Canon.ancestries[member.raceId]?.playable === true
        ? this.portrait(world, id, member) : undefined;
      at.unclaimed.delete(id);
      return { id, kind: 'person' as const, name: this.called(world, id, world.module.entities.find(e => e.id === id)?.name ?? id),
        ...portrait ? { portrait } : {}, acts, companion: true };
    });
  }
  // What the company knows, newest first, with how it knows it: seen, found in something, told by someone, or known
  // before the story began (where the errand is bound: what the letter says).
  private static knowledge(view: PlayerSnapshot): Screen['knowledge'] {
    return [...view.knowledge].sort((a, b) => (b.at ?? -1) - (a.at ?? -1)).map(k => ({
      text: FictionalTime.prose(k.text), how: [k.source === 'seen' ? 'you saw it' : k.source === 'found' ? `from ${k.from ?? 'what you found'}`
        : k.source === 'read' ? `as ${k.from ?? 'what is written'} has it`
        : k.source === 'heard' ? `${k.from ?? 'someone'}${k.from?.includes(', ') ? ',' : ''} told you` : '',
      k.at !== undefined ? FictionalTime.at(k.at) : ''].filter(Boolean).join(', '),
      kind: k.confirmed ? 'confirmed' as const : k.source === 'heard' || k.source === 'read' ? 'reported' as const
        : k.source ? 'seen' as const : 'known' as const }));
  }
  // The scene's lines: what the place is like (and what is going on in it), and what each person or thing here looks
  // like now, told with them. Lines the company has not seen before at a place it has seen before are fresh.
  private static scene(campaign: Campaign, view: PlayerSnapshot, present: Set<string>) {
    const defs = new Map((campaign.module.observations ?? []).map(o => [o.id, o]));
    const events = campaign.history, last = events.at(-1);
    const before = new Set(events.slice(0, -1).flatMap(e => (e.perceptions ?? []).map(p => p.id)));
    const here = view.location?.id;
    const known = here !== undefined && [...before].some(id => defs.get(id)?.place === here && !defs.get(id)?.anchor);
    const fresh = known ? (last?.perceptions ?? []).filter(p => p.kind === 'observation' && !before.has(p.id))
      .map(p => FictionalTime.prose(p.text)) : [];
    // Lines one installation tells about the place run on as one paragraph; what is new stands on its own.
    const paragraphs: { text: string; from: string; fresh: boolean }[] = [], says = new Map<string, string[]>();
    for (const o of view.observations) {
      // An observation near a variable is told of the one it found (id@entity).
      const [base, subject] = o.id.split('@') as [string, string | undefined];
      const def = defs.get(base), text = FictionalTime.prose(o.text), place = subject ?? def?.place ?? '';
      if (def?.anchor === 'near' && present.has(place)) { says.set(place, [...says.get(place) ?? [], text]); continue; }
      // Only what describes the place itself runs on; a thing or person seen from here keeps its own paragraph.
      const own = def && (!def.anchor || def.anchor === 'at') && def.place === here;
      const from = own && o.id.includes('__') ? o.id.split('__')[0]! : '', prior = paragraphs.at(-1), isFresh = fresh.includes(text);
      if (prior && from && prior.from === from && !prior.fresh && !isFresh) { prior.text = `${prior.text} ${text}`; }
      else { paragraphs.push({ text, from, fresh: isFresh }); }
    }
    return { prose: paragraphs.map(p => p.text), says, fresh };
  }
  // What a spell or technique does, in its own words and then in the rules' terms.
  // Why a choice cannot be made: the skill it needs, and anything else that would do, which the company lacks.
  static wanting(w: Wanting): string {
    if (w.thing) { return `Needs ${[w.name, ...w.or].join(' or ')}, and the company has none.`; }
    return w.or.length ? `Needs ${w.name.toLowerCase()} or ${w.or.join(' or ')}, and the company has neither.`
      : `Needs ${w.name.toLowerCase()}: no one in the company has it.`;
  }
  static tell(this: void, id: string): string | undefined {
    const ability = Content.abilities.find(a => a.id === id), feat = Canon.traits[id];
    // A feat: what each of its perks does, and the abilities it brings.
    if (!ability && feat?.category === 'feat') {
      const perks = (feat.perks ?? [{ name: feat.name, description: '', modifiers: feat.modifiers }]).map(p => PerkText.of(p));
      const brings = (feat.grants?.abilities ?? []).map(a => Content.abilities.find(x => x.id === a)?.name)
        .filter(Boolean);
      return [...perks, brings.length ? `Brings ${brings.join(', ')}.` : ''].filter(Boolean).join(' ');
    }
    if (!ability) { return undefined; }
    const prose = Canon.abilities[id]?.effects ? ability.description : '';
    return [prose, MechanicsText.full(ability)].filter(Boolean).join(' ');
  }
  // Things standing on a passage from here (a door, a ladder) are acted on from that exit.
  private static passageOf(world: Campaign['world'], here: string): Map<string, string> {
    const result = new Map<string, string>();
    if (!world.module.relations.some(r => r.name === 'on')) { return result; }
    for (const on of world.related('on')) {
      const way = world.related('connects', on.args[1]).find(r => r.args[1] === here);
      if (way) { result.set(on.args[0]!, way.args[2]!); }
    }
    return result;
  }
  // What a provisioning party plans around: the hour, whether it is light, food in hand, and when they next must eat.
  private static expedition(world: Campaign['world'], view: PlayerSnapshot, items: ItemRow[], here?: string) {
    // Light as the world has it (dark), and the evening as the one clock says it: two formulas disagreed by an hour
    // (the review's H5).
    const actor = view.actor, elapsed = view.elapsed, part = FictionalTime.part(elapsed);
    const dark = world.relates('dark') ? world.test(ModuleWriter.call('dark')) : part === 'night';
    const daylight = dark ? 'night' : part === 'evening' ? 'evening' : 'day';
    const meal = world.module.measures.some(m => m.name === 'nextMeal') ? world.number(ModuleWriter.call('nextMeal', actor)) : 0;
    return { time: FictionalTime.at(elapsed, view.minutes), daylight,
      ...this.light(view, items, !!here && world.test(ModuleWriter.call('unlit', here))),
      rations: world.module.measures.some(m => m.name === 'quantity') ? world.number(ModuleWriter.call('quantity', actor, 'rations')) : 0,
      hungry: world.module.relations.some(r => r.name === 'hungry') && world.test(ModuleWriter.call('hungry', actor)),
      weary: world.relates('weary') && world.test(ModuleWriter.call('weary', actor)),
      ...(meal ? { nextMeal: FictionalTime.clock(meal) } : {}) };
  }
  // What gives the company light: a flame, or a light conjured (the cold playtest read "Nothing lit" under its Light).
  static readonly burning: Record<string, string> = { torchlit: 'torch', lamplit: 'lantern', candlelit: 'candle',
    lit: 'conjured light' };
  // How long the company's light will last, where that matters: somewhere unlit, or while something burns.
  private static light(view: PlayerSnapshot, items: ItemRow[], unlit: boolean): { light?: string } {
    const lit = view.party.flatMap(m => m.conditions.filter(c => this.burning[c]).map(c => `${m.name}'s ${this.burning[c]}`
      + `${m.lasting?.[c] ? `, ${FictionalTime.spoken(m.lasting[c])} left` : ''}`));
    if (!lit.length && !unlit) { return {}; }
    const spare = ([[this.count(items, 'torch'), 'torch', 'torches'], [this.count(items, 'candle'), 'candle', 'candles'],
      [this.count(items, 'lamp_oil'), 'flask of oil', 'flasks of oil']] as [number, string, string][])
      .filter(([n]) => n > 0).map(([n, one, many]) => `${n} ${n === 1 ? one : many}`).join(', ');
    return { light: `${lit.length ? lit.join('; ') : 'Nothing lit'} · ${spare ? `${spare} to spare` : 'nothing to spare'}` };
  }
  private static count(items: ItemRow[], kind: string): number { return items.filter(i => i.kind === kind).length; }
  // Identical wares on one shelf read as one row with a count; acting on the row acts on one of them.
  private static stack(rows: TargetRow[]): TargetRow[] {
    const out: TargetRow[] = [];
    for (const row of rows) {
      const twin = row.kind === 'thing' && row.note === 'for sale' ? out.find(o => o.name === row.name && o.note?.startsWith('for sale')) : undefined;
      if (!twin) { out.push(row); continue; }
      const count = Number(/×(\d+)/.exec(twin.note!)?.[1] ?? 1) + 1;
      twin.note = `for sale ×${count}`;
    }
    return out;
  }
  private static look(members: NonNullable<PlayerSnapshot['present'][number]['members']>): string | undefined {
    const standing = members.filter(m => m.hp > 0);
    if (!standing.length) { return undefined; }
    const kinds = new Map<string, number>();
    for (const m of standing) {
      const race = Content.race(m.raceId)?.name ?? m.raceId;
      const calling = m.classId ? Content.classes[m.classId as keyof typeof Content.classes]?.name : undefined;
      const kind = calling ? `${race} ${calling.toLowerCase()}` : race;
      kinds.set(kind, (kinds.get(kind) ?? 0) + 1);
    }
    const levels = [...new Set(standing.map(m => m.level))].sort((a, b) => a - b);
    const hurt = standing.filter(m => m.hp < m.maxHp).length;
    const hp = standing.map(m => m.maxHp), [low, high] = [Math.min(...hp), Math.max(...hp)];
    return `${[...kinds].map(([k, n]) => n > 1 ? `${k} ×${n}` : k).join(', ')}; level ${levels.join('–')}`
      + `; ${low === high ? low : `${low}–${high}`} HP${standing.length > 1 ? ' each' : ''}; ${hurt ? `${hurt} wounded` : 'unhurt'}.`;
  }
  private static target(p: PlayerSnapshot['present'][number], grouped: Grouped, w: Campaign['world'], dark = false):
    TargetRow {
    const acts = grouped.targets.get(p.id) ?? [];
    if (p.type === 'group') {
      const member = p.members?.[0];
      // Anyone of a people (an ancestry, whether or not a player may be one) is a person; anything else a creature.
      const playable = member && (!!Canon.ancestries[member.raceId]
        || (Content.playableRaces as string[]).includes(member.raceId));
      // A person's ancestry is in their look; their note is what is going on with them (a creature's, what it is).
      // A creature that keeps the peace (a dog on a doorstep, a goat on a tether) is an animal about the place, not a
      // danger; what it is, its role says.
      const animal = !playable && w.test(ModuleWriter.call('peaceable', p.id));
      // A creature its author gave a role is said by it ("the tall grey figure that walks the Long Man"), not by its
      // kind, which may be what the company has yet to find out (an automaton).
      const note = (p.state ? undefined : p.condition) ?? (member && !playable && !animal && !p.name.includes(', ')
        ? `${Content.race(member.raceId)?.name ?? member.raceId}` : undefined);
      // People are described when they follow a calling (a necromancer, a hired blade), creatures always.
      // In the dark they are heard, not seen: nothing of how many are hurt, how seasoned or how hardy (the
      // architecture review's H5: exact hit points beside "In the dark you can hear…").
      const look = dark || p.state || (playable && !p.members?.some(m => m.classId && m.classId !== 'commoner'))
        ? undefined : this.look(p.members ?? []);
      const name = this.called(w, p.id, p.name);
      // A painting is of one person, of a people who look like the folk in the paintings: not a band of goblins.
      const likened = playable && (p.members?.length ?? 1) === 1 && Canon.ancestries[member!.raceId]?.playable === true;
      const portrait = likened ? this.portrait(w, p.id, member) : undefined;
      return { id: p.id, kind: playable ? 'person' : animal ? 'animal' : 'creature', name, ...(note ? { note } : {}),
        ...portrait ? { portrait } : {}, ...(p.members?.length ?? 0) > 1 ? { many: true } : {},
        ...(!p.state && p.activity ? { activity: p.activity } : {}), ...(look ? { look } : {}),
        ...(p.state ? { state: p.state === 'dead' ? 'dead' as const : 'down' as const } : {}), acts };
    }
    const counted = w.module.measures.some(m => m.name === 'quantity');
    const coin = counted ? w.number(ModuleWriter.call('quantity', p.id, 'gold')) : 0;
    const food = counted ? w.number(ModuleWriter.call('quantity', p.id, 'rations')) : 0;
    const forSale = w.module.relations.some(r => r.name === 'forSale') && w.test(ModuleWriter.call('forSale', p.id));
    // Something growing is told by how it grows (its description), not by the name of its state.
    const note = p.condition && p.type !== 'scenery' ? p.condition : p.within ? `in ${p.within}` : forSale ? 'for sale' : p.type === 'source' ? (p.intact === false ? 'destroyed' : acts.length ? 'can be read' : 'already read')
      : coin ? `${coin} coin` : food ? `${food} ration${food === 1 ? '' : 's'} left` : p.type === 'mechanism' ? 'mechanism' : undefined;
    const look = p.type === 'item' ? this.described(w, p.id, p.name) : undefined;
    return { id: p.id, kind: ['mechanism', 'door'].includes(p.type) ? 'feature' : 'thing', name: p.name,
      ...(note ? { note } : {}), ...(look ? { look } : {}), acts };
  }
  // A thing to be had, seen for what it is in its kind's own words (the follow-up review found a singer's token that
  // offered nothing but Take, though its kind is described); none where those words are only its name.
  private static described(w: Campaign['world'], id: string, name: string): string | undefined {
    const kind = w.module.relations.some(r => r.name === 'itemKind') ? w.one('itemKind', id) : undefined;
    const told = kind ? ItemCatalog.definitions[kind] : undefined;
    if (!told) { return undefined; }
    return [name, told.name].some(n => ScreenModel.bare(n) === ScreenModel.bare(told.description)) ? undefined
      : told.description;
  }
  private static bare(s: string): string { return s.toLowerCase().replace(/^(an?|the) /, ''); }
  // The painting for someone: their own likeness, else one for their work, background or role (see Likeness).
  private static portrait(w: Campaign['world'], id: string, member?: { backgroundId?: string; professionId?: string }):
    TargetRow['portrait'] {
    const own = w.module.relations.some(r => r.name === 'likeness') ? w.one('likeness', id) : undefined;
    const ownName = own && w.module.entities.find(e => e.id === own)?.name;
    const [name, ...rest] = w.module.entities.find(e => e.id === id)?.name.split(', ') ?? [], role = rest.join(' ');
    const pronoun = w.module.relations.some(r => r.name === 'pronouns') ? w.one('pronouns', id) : undefined;
    const sex = /pron_he$/.test(pronoun ?? '') ? 'man' as const : /pron_she$/.test(pronoun ?? '') ? 'woman' as const : undefined;
    const painting = Likeness.of({ ...ownName ? { own: ownName } : {},
      ...member?.backgroundId ? { background: member.backgroundId } : {},
      ...member?.professionId ? { profession: member.professionId } : {}, ...role ? { role } : {},
      ...name ? { name } : {}, ...sex ? { sex } : {}, key: id });
    return painting ? Likeness.portrait(painting) : undefined;
  }
  // Every entity by the name the company knows it by: a member by their own name.
  private static names(campaign: Campaign): Map<string, string> {
    const world = campaign.world, byId = new Map(campaign.readout.creatures.map(c => [c.id, c]));
    return new Map(campaign.module.entities.map(e =>
      [e.id, (e.creatureId && byId.get(e.creatureId)?.name) || ObservationText.label(world, e.id)]));
  }
  // A group the company could attack is weighed up before it does.
  private static reckoning(campaign: Campaign, id: string, grouped: Grouped): Pick<TargetRow, 'reckoning'> {
    if (!(grouped.targets.get(id) ?? []).some(a => a.label === 'Attack')) { return {}; }
    const reckoning = DangerSense.reckon(campaign, id);
    return reckoning ? { reckoning } : {};
  }
  // The formations the company was formed as: every member holds them, so the first living one says.
  private static formations(campaign: Campaign): Screen['formations'] {
    const ids = campaign.readout.partyIds, member = campaign.readout.creatures.find(c => ids.includes(c.id));
    return (member?.traits ?? []).map(id => Canon.traits[Canon.resolve('traits', id)]).filter(t => t?.category === 'party')
      .map(t => ({ name: t!.name, perks: (t!.perks ?? []).map(p => PerkText.of(p)) }));
  }
  private static party(view: PlayerSnapshot, campaign: Campaign, grouped: Grouped): MemberRow[] {
    const entities = campaign.module.entities;
    return view.party.map(m => {
      const ref = entities.find(e => e.creatureId === m.id)?.id;
      const race = Content.race(m.raceId)?.name ?? m.raceId;
      const klass = Content.classes[m.classId as keyof typeof Content.classes]?.name ?? m.classId;
      const background = m.backgroundId ? Canon.backgrounds[m.backgroundId]?.name : undefined;
      const likeness = campaign.readout.creatures.find(c => c.id === m.id)?.likeness;
      return { id: m.id, ...(ref ? { ref } : {}), name: m.name, line: `${race} ${klass}`.toLowerCase(),
        ...likeness && Likeness.ids.has(likeness) ? { portrait: Likeness.portrait(likeness) } : {},
        ...(background ? { background } : {}), level: m.level, hp: m.hp, maxHp: m.maxHp, mana: m.mana,
        maxMana: m.maxMana, ...(m.maxSlots ? { slots: m.slots, maxSlots: m.maxSlots } : {}),
        ...(m.prepared ? { spells: this.prepared(m.prepared, m.ready ?? []) } : {}),
        experience: m.experience, gold: m.gold, next: Advancement.next(m.classId, m.level),
        progress: this.progress(m.level, m.experience, Advancement.next(m.classId, m.level)),
        conditions: m.conditions.filter(c => !this.boon(c)).map(c => this.condition(c)), ...Standing.of(m),
        boons: m.conditions.filter(c => this.boon(c))
          .map(c => `${this.condition(c)}${m.lasting?.[c] ? ` · ${FictionalTime.duration(m.lasting[c])} left` : ''}`),
        abilities: (m.abilities ?? []).map(id => Content.abilities.find(a => a.id === id))
          .filter(a => !!a).map(a => ({ id: a.id, name: a.name, cost: a.cost ?? 0, price: MechanicsText.price(a),
            text: MechanicsText.full(a, { ...m.attributes, level: m.level, bonusSpellDC: 0 }) })),
        attributes: m.attributes ?? {}, acts: ref ? Illumination.mark(grouped.members.get(ref) ?? []) : [],
        overlays: this.overlays(campaign, m.id), ...this.sheet(campaign, m.id, ref, grouped.members.get(ref ?? '') ?? []) };
    });
  }
  // The member as the rules have them, and what a development would change, each with its command if offered.
  private static sheet(campaign: Campaign, id: string, ref: string | undefined, acts: Act[]) {
    return CharacterSheets.of(campaign, id, { ...ref ? { ref } : {}, offered: new Set(this.offered(acts)) });
  }
  private static offered(acts: Act[]): string[] {
    return acts.flatMap(a => [...a.command ? [a.command] : [], ...this.offered(a.children ?? [])]);
  }
  // How far a companion is from the next level, and what it brings.
  private static progress(level: number, experience: number, next: string[]): string {
    const needed = Advancement.threshold(level + 1), brings = next.length ? `, which brings ${next.join(', ')}` : '';
    if (needed === Infinity) { return 'At the highest level'; }
    return needed <= experience ? `Ready for level ${level + 1}${brings}: a night under a roof`
      : `${experience} of ${needed} experience to level ${level + 1}${brings}`;
  }
  // Each prepared spell by level, the ready ones first, as the company sheet lists them.
  private static prepared(prepared: string[][], ready: string[][]) {
    return prepared.flatMap((spells, i) => {
      const left = [...ready[i] ?? []];
      return spells.map(id => ({ level: i + 1, name: Content.abilities.find(a => a.id === id)?.name ?? id,
        ready: left.includes(id) && left.splice(left.indexOf(id), 1).length > 0 }))
        .sort((a, b) => Number(b.ready) - Number(a.ready));
    });
  }
  // Each overlay and what it actually contributed, so a player can see why a companion can do something.
  private static overlays(campaign: Campaign, id: string) {
    const c = campaign.readout.creatures.find(x => x.id === id);
    if (!c) { return []; }
    const all = Overlays.contributions(c);
    return Overlays.of(c).map(([oid, o]) => ({ id: oid, name: o.name, role: o.role,
      grants: all.filter(x => x.source === oid).map(x => x.kind === 'skill' ? `${campaign.module.entities.find(e => e.id === x.value)?.name ?? x.value} (skill)`
        : x.kind === 'gear' ? ItemCatalog.get(x.value).name : x.kind === 'gold' ? `+${x.value} coin` : x.value) }));
  }
  private static condition(id: string): string { return Canon.conditions[Canon.resolve('conditions', id)]?.name ?? id; }
  // A condition that helps (a lit torch, a blessing, a ward) is told apart from one that hurts.
  private static boon(id: string): boolean { return ConditionSense.helps(id); }
  // A thing whose use brings light: its effect applies a condition that grants it (a torch, a lantern).
  private static lights(use?: string): boolean {
    const status = use && /^Apply (\w+) to/.exec(use)?.[1];
    return !!status && !!Canon.conditions[Canon.resolve('conditions', status)]?.grants?.includes('light');
  }
  private static items(campaign: Campaign, grouped: Grouped, entities: Map<string, Entity>): ItemRow[] {
    const state = campaign.readout;
    return state.creatures.filter(c => state.partyIds.includes(c.id)).flatMap(c => (c.state.inventory ?? []).map(i => {
      const d = ItemCatalog.get(i.definition);
      return { id: i.id, name: entities.get(i.id)?.name ?? ItemNames.called(d.name), kind: i.definition,
        description: d.description,
        owner: c.id, ownerName: c.name, equipped: !!i.equipped, ...(d.slot ? { slot: d.slot } : {}),
        ...(this.lights(d.use) ? { light: true } : {}), acts: grouped.items.get(i.id) ?? [] };
    }));
  }
}
