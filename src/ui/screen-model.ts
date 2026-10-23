import { Likeness } from '../paintings/likeness';
import { ItemNames } from '../item-names';
import { MechanicsText } from '../presentation/mechanics-text';
import { ConditionSense } from '../presentation/condition-sense';
import { Advancement } from '../rules/advancement';
import { Canon } from '../canon/canon';
import { Content } from '../content';
import { ItemCatalog } from '../item-catalog';
import { ModuleWriter } from '../lang/module-writer';
import { FictionalTime } from '../presentation/fictional-time';
import { Calendar } from '../presentation/calendar';
import { PlayerView, type PlayerSnapshot } from '../presentation/player-view';
import type { Campaign } from '../campaign/campaign';
import type { Entity } from '../lang/module';
import { SkillReading } from '../presentation/skill-reading';
import { DangerSense } from '../presentation/danger-sense';
import { ChoiceGrouping, type Grouped, type Row } from './choice-grouping';
import { Passages } from './passages';
import { ObservationText } from '../lang/observation-text';
import { ChartModel } from './chart-model';
import { Carriers } from './carriers';
import { Overlays } from '../overlays';
import { PerkText } from '../presentation/perk-text';
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
    const priced = world.module.measures.some(m => m.name === 'price');
    const prices = new Map(campaign.module.entities.filter(e => priced && e.type === 'item')
      .map(e => [e.id, world.number(ModuleWriter.call('price', e.id))]));
    const present = new Set(view.present.map(p => p.id));
    const passageOf = this.passageOf(world, view.location?.id ?? '');
    const fees = new Map([
      ...campaign.module.entities.filter(e => e.type === 'service').map(e => [e.id, world.number(ModuleWriter.call('fee', e.id))] as const),
      ...world.measured('goodsPrice').map(m => [`${m.call.args[0]}:${m.call.args[1]}`, m.value] as const)]);
    // Who makes each skilled choice possible, and what the company could do with a skill nobody in it has.
    const reading = SkillReading.read(campaign);
    const commands: Row[] = [
      ...PlayerView.choices(campaign).map(r => ({ ...r,
        ...(reading.uses.has(r.action.id) ? { by: reading.uses.get(r.action.id)! } : {}) })),
      ...reading.wanting.map(w => ({ choice: { ...w.choice, time: w.choice.time ?? 1 }, action: w.action,
        wanting: `Needs ${w.name.toLowerCase()}: no one in the company has it.` }))];
    const grouped = ChoiceGrouping.group(commands, { present, names, prices, passageOf, fees, tell: ScreenModel.tell,
      ...(view.actor ? { carrier: Carriers.carrier.bind(null, world, view.actor) } : {}) });
    const here = view.location?.id ?? '';
    const passages = new Passages(entities, world, view.actor);
    const visited = new Set(view.map.places.filter(p => p.visited).map(p => p.id));
    const unclaimed = new Map(grouped.targets);
    view.present.forEach(p => unclaimed.delete(p.id));
    const companions = this.companions(world, view.actor, unclaimed);
    const scene = this.scene(campaign, view, present);
    const rows = this.stack(view.present.map(p => ({ ...this.target(p, grouped, world),
      ...scene.says.has(p.id) ? { says: scene.says.get(p.id)! } : {}, ...this.reckoning(campaign, p.id, grouped) })));
    return {
      title: view.title, clock: FictionalTime.at(view.elapsed), elapsed: view.elapsed, running: view.running,
      ...this.when(campaign, view.elapsed), path: here ? passages.path(here) : [], place: passages.place(here),
      prose: scene.prose, fresh: scene.fresh, observed: view.observations,
      dark: view.observations.some(o => o.id === 'darkness'),
      exits: here ? passages.exits(here, grouped.exits,
        { ...(view.spatial ? { spatial: view.spatial } : {}), visited }) : [],
      people: [...rows.filter(r => ['person', 'creature', 'animal'].includes(r.kind)), ...companions],
      things: rows.filter(r => r.kind === 'thing' || r.kind === 'feature'),
      party: this.party(view, campaign, grouped),
      items: this.items(campaign, grouped, entities),
      camp: grouped.camp,
      purse: { coin: view.resources?.find(r => r.id === 'gold')?.amount ?? 0,
        rations: view.resources?.find(r => r.id === 'rations')?.amount ?? 0,
        other: (view.resources ?? []).filter(r => !['gold', 'rations'].includes(r.id) && r.amount > 0)
          .map(r => `${r.amount} ${r.name}`) },
      knowledge: this.knowledge(view),
      deadlines: view.deadlines.map(d => `${d.pressure}: ${FictionalTime.at(d.at)}${d.passed ? ' (passed)' : ''}`),
      capabilities: (view.capabilities ?? []).map(c => `${c.name} — ${c.providers.join(', ')}`),
      formations: this.formations(campaign),
      trade: here ? TradeModel.at(world, here, names) : [],
      objectives: (view.objectives ?? []).map(o => FictionalTime.prose(o.text)),
      ...new ChartModel(world, view.actor, entities).build(visited, here),
      expedition: this.expedition(world, view.actor, view.elapsed),
      map: view.map.places.map(p => ({ id: p.id, name: p.name, visited: p.visited, here: p.id === here,
        zone: passages.path(p.id).slice(0, -1).at(-1)?.name ?? p.zone ?? '' })),
      unplaced: [...grouped.unplaced, ...[...unclaimed.entries()].flatMap(([id, acts]) =>
        acts.map(a => ({ ...a, label: `${entities.get(id)?.name ?? id}: ${a.label}` })))],
    };
  }
  // Whoever has joined the company and has something to say: talked to wherever the company is. Their choices are
  // theirs, not left over among the company's own.
  private static companions(world: Campaign['world'], actor: string | undefined, unclaimed: Map<string, Act[]>): TargetRow[] {
    if (!actor || !world.module.relations.some(r => r.name === 'travelsWith')) { return []; }
    return world.related('travelsWith').filter(r => r.args[1] === actor && unclaimed.has(r.args[0]!)).map(r => {
      const id = r.args[0]!, acts = unclaimed.get(id)!;
      unclaimed.delete(id);
      return { id, kind: 'person' as const, name: world.module.entities.find(e => e.id === id)?.name ?? id, acts, companion: true };
    });
  }
  // What the company knows, newest first, with how it knows it: seen, found in something, or told by someone.
  private static knowledge(view: PlayerSnapshot): Screen['knowledge'] {
    return [...view.knowledge].sort((a, b) => (b.at ?? -1) - (a.at ?? -1)).map(k => ({
      text: FictionalTime.prose(k.text), how: [k.source === 'seen' ? 'you saw it' : k.source === 'found' ? `from ${k.from ?? 'what you found'}`
        : k.source === 'heard' ? `${k.from ?? 'someone'}${k.from?.includes(', ') ? ',' : ''} told you` : '',
      k.at !== undefined ? FictionalTime.at(k.at) : ''].filter(Boolean).join(', '),
      kind: k.confirmed ? 'confirmed' as const : k.source === 'heard' ? 'reported' as const : 'seen' as const }));
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
      const def = defs.get(o.id), text = FictionalTime.prose(o.text);
      if (def?.anchor === 'near' && present.has(def.place)) { says.set(def.place, [...says.get(def.place) ?? [], text]); continue; }
      // Only what describes the place itself runs on; a thing or person seen from here keeps its own paragraph.
      const own = def && (!def.anchor || def.anchor === 'at') && def.place === here;
      const from = own && o.id.includes('__') ? o.id.split('__')[0]! : '', prior = paragraphs.at(-1), isFresh = fresh.includes(text);
      if (prior && from && prior.from === from && !prior.fresh && !isFresh) { prior.text = `${prior.text} ${text}`; }
      else { paragraphs.push({ text, from, fresh: isFresh }); }
    }
    return { prose: paragraphs.map(p => p.text), says, fresh };
  }
  // What a spell or technique does, in its own words and then in the rules' terms.
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
  private static expedition(world: Campaign['world'], actor: string, elapsed: number) {
    const hour = (8 + Math.floor(elapsed / 6)) % 24;
    const daylight = hour >= 6 && hour < 18 ? 'day' : hour >= 18 && hour < 21 ? 'evening' : 'night';
    const meal = world.module.measures.some(m => m.name === 'nextMeal') ? world.number(ModuleWriter.call('nextMeal', actor)) : 0;
    return { time: FictionalTime.at(elapsed), daylight,
      rations: world.module.measures.some(m => m.name === 'quantity') ? world.number(ModuleWriter.call('quantity', actor, 'rations')) : 0,
      hungry: world.module.relations.some(r => r.name === 'hungry') && world.test(ModuleWriter.call('hungry', actor)),
      ...(meal ? { nextMeal: FictionalTime.clock(meal) } : {}) };
  }
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
      const race = Content.races[m.raceId as keyof typeof Content.races]?.name ?? m.raceId;
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
  private static target(p: PlayerSnapshot['present'][number], grouped: Grouped, w: Campaign['world']): TargetRow {
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
      const note = (p.state ? undefined : p.condition) ?? (member && !playable && !animal
        ? `${Content.races[member.raceId as keyof typeof Content.races]?.name ?? member.raceId}` : undefined);
      // People are described when they follow a calling (a necromancer, a hired blade), creatures always.
      const look = p.state || (playable && !p.members?.some(m => m.classId && m.classId !== 'commoner')) ? undefined
        : this.look(p.members ?? []);
      // Family are named as what they are to you: "Ion, your brother", not "Ion, the drover's son".
      const kinship = w.module.relations.some(r => r.name === 'kinship') ? w.one('kinship', p.id) : undefined;
      const word = kinship && w.module.entities.find(e => e.id === kinship)?.name;
      const name = word ? `${p.name.split(', ')[0]}, ${word}` : p.name;
      const portrait = playable ? this.portrait(w, p.id, member) : undefined;
      return { id: p.id, kind: playable ? 'person' : animal ? 'animal' : 'creature', name, ...(note ? { note } : {}),
        ...portrait ? { portrait } : {},
        ...(!p.state && p.activity ? { activity: p.activity } : {}), ...(look ? { look } : {}),
        ...(p.state ? { state: p.state === 'dead' ? 'dead' as const : 'down' as const } : {}), acts };
    }
    const counted = w.module.measures.some(m => m.name === 'quantity');
    const coin = counted ? w.number(ModuleWriter.call('quantity', p.id, 'gold')) : 0;
    const food = counted ? w.number(ModuleWriter.call('quantity', p.id, 'rations')) : 0;
    const forSale = w.module.relations.some(r => r.name === 'forSale') && w.test(ModuleWriter.call('forSale', p.id));
    // Something growing is told by how it grows (its description), not by the name of its state.
    const note = p.condition && p.type !== 'scenery' ? p.condition : p.within ? `in ${p.within}` : forSale ? 'for sale' : p.type === 'source' ? (p.intact === false ? 'destroyed' : acts.length ? 'can be read' : 'read')
      : coin ? `${coin} coin` : food ? `${food} ration${food === 1 ? '' : 's'} left` : p.type === 'mechanism' ? 'mechanism' : undefined;
    return { id: p.id, kind: ['mechanism', 'door'].includes(p.type) ? 'feature' : 'thing', name: p.name,
      ...(note ? { note } : {}), acts };
  }
  // The painting for someone: their own likeness, else one for their work, background or role (see Likeness).
  private static portrait(w: Campaign['world'], id: string, member?: { backgroundId?: string; professionId?: string }):
    TargetRow['portrait'] {
    const own = w.module.relations.some(r => r.name === 'likeness') ? w.one('likeness', id) : undefined;
    const ownName = own && w.module.entities.find(e => e.id === own)?.name;
    const role = w.module.entities.find(e => e.id === id)?.name.split(', ').slice(1).join(' ');
    const pronoun = w.module.relations.some(r => r.name === 'pronouns') ? w.one('pronouns', id) : undefined;
    const sex = /pron_he$/.test(pronoun ?? '') ? 'man' as const : /pron_she$/.test(pronoun ?? '') ? 'woman' as const : undefined;
    const painting = Likeness.of({ ...ownName ? { own: ownName } : {},
      ...member?.backgroundId ? { background: member.backgroundId } : {},
      ...member?.professionId ? { profession: member.professionId } : {}, ...role ? { role } : {},
      ...sex ? { sex } : {}, key: id });
    const credit = painting && Likeness.credits[painting];
    return painting ? { src: Likeness.src(painting), large: Likeness.large(painting), focus: Likeness.focus(painting),
      ...credit ? { credit } : {} } : undefined;
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
      const race = Content.races[m.raceId as keyof typeof Content.races]?.name ?? m.raceId;
      const klass = Content.classes[m.classId as keyof typeof Content.classes]?.name ?? m.classId;
      const background = m.backgroundId ? Canon.backgrounds[m.backgroundId]?.name : undefined;
      return { id: m.id, ...(ref ? { ref } : {}), name: m.name, line: `${race} ${klass}`.toLowerCase(),
        ...(background ? { background } : {}), level: m.level, hp: m.hp, maxHp: m.maxHp, mana: m.mana,
        maxMana: m.maxMana, ...(m.maxSlots ? { slots: m.slots, maxSlots: m.maxSlots } : {}),
        ...(m.prepared ? { spells: this.prepared(m.prepared, m.ready ?? []) } : {}),
        experience: m.experience, gold: m.gold, next: Advancement.next(m.classId, m.level),
        progress: this.progress(m.level, m.experience, Advancement.next(m.classId, m.level)),
        conditions: m.conditions.filter(c => !this.boon(c)).map(c => this.condition(c)),
        boons: m.conditions.filter(c => this.boon(c))
          .map(c => `${this.condition(c)}${m.lasting?.[c] ? ` · ${FictionalTime.duration(m.lasting[c])} left` : ''}`),
        abilities: (m.abilities ?? []).map(id => Content.abilities.find(a => a.id === id))
          .filter(a => !!a).map(a => ({ id: a.id, name: a.name, cost: a.cost ?? 0, price: MechanicsText.price(a),
            text: MechanicsText.full(a, { ...m.attributes, level: m.level, bonusSpellDC: 0 }) })),
        attributes: m.attributes ?? {}, acts: ref ? grouped.members.get(ref) ?? [] : [],
        overlays: this.overlays(campaign, m.id) };
    });
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
      return { id: i.id, name: entities.get(i.id)?.name ?? ItemNames.called(d.name), kind: d.name,
        description: d.description,
        owner: c.id, ownerName: c.name, equipped: !!i.equipped, ...(d.slot ? { slot: d.slot } : {}),
        ...(this.lights(d.use) ? { light: true } : {}), acts: grouped.items.get(i.id) ?? [] };
    }));
  }
}
