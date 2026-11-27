import { Crossing } from '../campaign/crossing';
import { OwnWords } from './own-words';
import { Spatial } from '../lang/spatial';
import { PartyCapabilities } from '../campaign/party-capabilities';
import { LocalObservations } from '../campaign/local-observations';
import type { Campaign } from '../campaign/campaign';
import type { Call, Entity, MovementMode } from '../lang/module';
import type { Operator } from '../campaign/planner';
import { ModuleWriter } from '../lang/module-writer';
import { World } from '../lang/world';
import { Discovery } from '../lang/discovery';
import { ActionPresentation, type PublicChoice } from './action-presentation';
import { ObservationText } from '../lang/observation-text';
import { AimWords } from './aim-words';
import { Agency } from '../campaign/agency';
import { ActionTime } from '../campaign/action-time';
import { ChoiceWording } from './choice-wording';
import { Masked } from './masked'; import { EntityIndex } from '../lang/entity-index';
import { Frozen } from './frozen'; import { Costs } from '../costs'; import { Chronicle } from './chronicle';
import { CompanyKnowledge } from './company-knowledge';
import { CompanyMap } from './company-map'; import { Undertakings } from './undertakings';
import { QueryIndex } from '../lang/query-index';
import { ChoiceIds } from '../ui/choice-ids';
import { PlayerFrame, type FrameRows } from './player-frame';
import { PlayerRevision } from './player-revision';

export interface SpatialScene {
  ancestry: { id: string; name: string; kind: string }[];
  exits: { id: string; destination: string; name: string; mode: MovementMode; available: boolean;
    reason?: string; command?: string; barrier?: string }[];
  enteredFrom?: { id: string; name: string; mode: MovementMode };
}
// What kind of place it is (a room, a settlement, wild country); and the zone it is in, which no module now says.
export interface SceneMetadata { kind?: string; zone?: string }
export interface PartyMember {
  id: string; name: string; raceId: string; classId?: string; level: number; hp: number; maxHp: number;
  mana: number; maxMana: number; slots?: number[]; maxSlots?: number[]; gold: number; experience: number;
  prepared?: string[][]; ready?: string[][];
  conditions: string[];
  // Watches left on conditions that run on the world's clock (a torch burning down).
  lasting?: Record<string, number>;
  abilities?: string[]; attributes?: Record<string, number>; backgroundId?: string;
}
export interface PresentEntity {
  id: string; name: string; type: string;
  members?: { name: string; raceId: string; classId?: string; level: number; hp: number; maxHp: number;
    backgroundId?: string; professionId?: string }[];
  state?: 'dead' | 'incapacitated'; intact?: boolean; activity?: string; condition?: string;
  // The container it is seen in.
  within?: string;
}
export interface PlayerSnapshot {
  spatial?: SpatialScene;
  actor: string; title: string; situations: { name: string; description: string }[];
  elapsed: number; running: boolean; location?: { id: string; name: string } & SceneMetadata;
  // Minutes past the watch (fewer than ten).
  minutes?: number;
  observations: { id: string; text: string }[];
  present: PresentEntity[]; party: PartyMember[];
  resources?: { id: string; name: string; amount: number }[];
  items?: { id: string; name: string; description: string; owner: string;
    equipped: boolean; slot?: string; effects: string[] }[];
  holdings: { text: string; value: number }[]; facts: string[];
  // What the company knows, and how: seen with its own eyes, done by it, found in a source, or heard from someone; and
  // when.
  knowledge: { id: string; text: string; source?: 'seen' | 'did' | 'found' | 'heard' | 'read'; from?: string; at?: number;
    // Heard from someone, and since seen or found for itself: a report borne out.
    confirmed?: true }[];
  assumptions: { id: string; text: string }[];
  deadlines: { situation: string; pressure: string; at: number; passed: boolean }[];
  capabilities?: { name: string; providers: string[] }[];
  choices: PublicChoice[];
  // The aims held, and the one followed (see Undertakings), by its id.
  objectives?: { id: string; text: string }[]; followed?: string | undefined;
  map: {
    places: ({ id: string; name: string; visited: boolean } & SceneMetadata)[];
    links: { from: string; to: string; status?: string }[];
  };
}
export interface ChronicleEntry { at: number; kind: 'player' | 'npc' | 'world' | 'observation' | 'discovery' | 'event'; text: string; detail: string[] }
// What the company perceives of one world, kept with what it was worked out of (see PlayerView.observe).
interface Observed { snapshot?: PlayerSnapshot; chronicle?: readonly ChronicleEntry[] }

// Player-safe projection of an omniscient campaign. Kyr has no declared observability, so this applies one
// conservative, documented locality policy: the player actor's own facts, its location, co-located entities,
// legal commands, its own declared effects and combats, NPC actions at its location, and public deadlines.
export class PlayerView {
  private static readonly ownHidden = ['at', 'distinct', 'within', 'knows', 'assumesFalse', 'mayExamine', 'operates', 'able', 'unladen', 'capable'];
  static readonly darkness = { id: 'darkness',
    text: 'It is pitch dark. Without a light you can see nothing here, and do nothing that needs seeing.' };
  static supported(campaign: Campaign): boolean { return campaign.persistent && !!campaign.playerActor; }
  private static actor(campaign: Campaign): string {
    if (!this.supported(campaign)) { throw new Error('No player view for this campaign'); }
    return campaign.playerActor!;
  }
  private static readonly named = new WeakMap<Map<string, Entity>, Map<string, string>>();
  private static labels(campaign: Campaign): Map<string, string> {
    const presented = ObservationText.presented(campaign.world);
    let labels = this.named.get(presented);
    if (!labels) { labels = new Map([...presented].map(([id, e]) => [id, e.name])); this.named.set(presented, labels); }
    return labels;
  }
  // A topic someone can be asked about is spoken, not a thing lying in the room.
  private static spoken(world: World, source: string): boolean {
    return world.relatedTo('testimony', source).length > 0;
  }
  private static test(world: World, name: string, ...args: string[]): boolean {
    return world.relates(name) && world.test(ModuleWriter.call(name, ...args));
  }
  // The choices are worked out once for each list of actions on offer; each caller gets its own rows.
  private static readonly listed = new WeakMap<readonly Operator[], ReturnType<typeof PlayerView.list>>();
  static choices(campaign: Campaign): ReturnType<typeof PlayerView.list> {
    return Costs.time('rows asked', () => {
      const offered = campaign.offered();
      let rows = this.listed.get(offered);
      if (!rows) { rows = Costs.time('rows', () => this.list(campaign, offered)); this.listed.set(offered, rows); }
      return rows.map(row => ({ ...row, choice: { ...row.choice } }));
    });
  }
  // Actions as the page offers them: what the company sees, named as it would name them, worded, alike ones as one
  // (also what the company could do with more coin: CoinReading).
  static offer(campaign: Campaign, offered: readonly Operator[]) { return this.list(campaign, offered); }
  // The rows of these schemas alone, as the frame holds them, the rest of what is on offer not grounded nor worded:
  // a journey's leg wants only its way, and whether anyone here would fight (test/small/rows-of-schemas holds them to
  // the frame's). Not an ask: whether one is asked turns on everyone else on offer (OwnWords.unasked).
  static only(campaign: Campaign, schemas: ReadonlySet<string>): ReturnType<typeof PlayerView.list> {
    if (schemas.has('ask')) { throw new Error('An ask is worded by all that is on offer'); }
    if (!campaign.running) { return []; }
    const world = campaign.world, actor = campaign.playerActor;
    const at = { module: campaign.module, world, ...actor ? { playerActor: actor } : {} };
    return campaign.within(() => this.list(campaign, campaign.operators.applicable(world, actor, new Set(schemas))
      .filter(action => !Crossing.carried(at, action))));
  }
  private static list(campaign: Campaign, offered: readonly Operator[]) {
    const world = campaign.world, unnamed = Masked.unnamed(world), actor = campaign.playerActor ?? '';
    const here = ChoiceWording.here(campaign);
    // Nothing can be done to someone the company does not see.
    const seen = world.module.seen ? offered.filter(a => this.sees(world, actor, a)) : offered;
    const visible = OwnWords.unasked(world.module, seen);
    const rows = ActionPresentation.choices(visible, campaign.schemaList).map(row => {
      row.choice.time = ActionTime.of(row.action, world);
      // A measure its label says ("Ask {healer} for {service}, {fee(service)} coin") is said by what it is bound to.
      if (/\{[^}]*\(/.test(row.choice.name)) {
        row.choice.name = ObservationText.render(row.choice.name, world, false, row.action.bindings ?? {});
      }
      // Choices are grounded with every name; a place the company has not learned is said as it is seen, someone known
      // as something while that holds as that (the Book of Faces' BOF-01: "Talk to Tibb" beside "an old man").
      row.choice.name = Masked.choice(world, row.choice.name, row.action.bindings, unnamed);
      row.choice.name = ChoiceWording.word(campaign, row.action, { name: row.choice.name, ...here ? { here } : {} });
      return row;
    });
    // The same thing done with either of two things alike (one torch of three, a candle of the two on the shelf), or by
    // either of two members, is one choice; done to two different things worded alike (a granary plate and a song
    // plate, each drawn with a stylus: The Patient Star's P4, the audit's F7) it is two.
    const said = new Set<string>();
    return rows.filter(row => { const key = this.alike(world, row); return !said.has(key) && !!said.add(key); });
  }
  private static alike(world: World, row: { action: Operator; choice: { name: string } }): string {
    const types = EntityIndex.of(world.module.entities).byId;
    const what = Object.entries(row.action.bindings ?? {}).filter(([, v]) => types.get(v)?.type !== 'member')
      .map(([k, v]) => `${k}=${world.one('itemKind', v) ?? v}`);
    return `${row.action.schema}|${row.choice.name}|${what.join(',')}`;
  }
  private static sees(world: World, actor: string, action: Operator): boolean {
    const seen = world.module.seen ?? {};
    return [...Object.values(action.bindings ?? {}), ...action.speaker ? [action.speaker] : []]
      .every(id => !seen[id] || LocalObservations.noticed(world, id, actor));
  }
  // The places whose names the company has not learned, by name, with what they are called until it does.
  // Something said in the words the company had for things before it learned what they are called: what it knew
  // then (the facts it knew, by id) decides, not what it knows now.
  static aliased(world: Campaign['world'], text: string, knew: Set<string>): string {
    return EntityIndex.of(world.module.entities).aliased.filter(e => !knew.has(e.alias!.until))
      .reduce((t, e) => Masked.said(t, e.name, e.alias!.name), text);
  }
  // A choice the page offers, or any action the rules offer now by its id: the page groups and words what it shows, and
  // an action it folded into another (the same done with either of two alike things) is no less legal for that (the
  // architecture review's H2: a legal action the page folded away could not be done, and a game kept by one build's
  // wording could fail to play again by another's).
  static resolve(campaign: Campaign, command: string): string {
    // A row's id begins with its schema's: found among that schema's rows, it is found without the rest worded (a
    // journey's leg, its way). Any other is looked for among all the rows, as before.
    const schema = /^([a-z0-9_]+)(?:\(|$)/.exec(command)?.[1];
    const own = schema && schema !== 'ask' && campaign.module.actions.some(a => a.id === schema)
      ? this.only(campaign, new Set([schema])).find(c => c.choice.id === command) : undefined;
    if (own) { return own.action.id; }
    const rows = PlayerFrame.of(campaign).rows;
    // By its id, or by the id an older build kept it by, its place among its siblings in it (ChoiceIds).
    const id = ChoiceIds.resolve(command, rows.map(c => c.choice.id));
    const match = id === undefined ? undefined : rows.find(c => c.choice.id === id);
    if (match) { return match.action.id; }
    if (campaign.offered().some(a => a.id === command)) { return command; }
    throw Crossing.withheld(campaign, command) ?? new Error(`Unavailable command: ${command}`);
  }
  // The entities a relation holds between the actor and, in the module's order.
  private static about(world: World, relation: string, actor: string, entities: Entity[]): Entity[] {
    return EntityIndex.of(entities).ordered(world.related(relation, actor).map(r => r.args[1]!));
  }
  // What could be present at a place, to be looked at more closely: whatever is at it or mounted there, any door,
  // anyone guarding a way, and anything inside something.
  private static nearby(world: World, place: string): Set<string> {
    const near = new Set<string>();
    // Mounted only where a module declares it (MT-25: read in every world, where none had, as an undeclared nothing).
    for (const name of ['at', ...world.relates('mounted') ? ['mounted'] : []]) {
      for (const r of world.relatedTo(name, place)) { near.add(r.args[0]!); }
    }
    for (const name of ['guards', 'inside']) { for (const r of world.related(name)) { near.add(r.args[0]!); } }
    for (const e of EntityIndex.of(world.module.entities).typed('door')) { near.add(e.id); }
    return near;
  }
  // Someone who stands across a way out of here, barring it, is met from this side of it.
  private static guarding(world: Campaign['world'], id: string, here: string): boolean {
    const ways = world.related('guards', id).map(r => r.args[1]);
    return ways.length > 0 && this.test(world, 'able', id)
      && ways.some(w => world.related('connects', w!).some(r => r.args[1] === here))
      && !!QueryIndex.of(world.module, 'watched')
      && ways.some(w => world.test(ModuleWriter.call('watched', w!)));
  }
  private static lasting(statuses: { id: string; remaining: number; clock?: string }[]):
    { lasting?: Record<string, number> } {
    const timed = statuses.filter(s => s.clock === 'world-time' && s.remaining > 0);
    return timed.length ? { lasting: Object.fromEntries(timed.map(s => [s.id, s.remaining])) } : {};
  }
  // Unable to see here: an unlit place without a light, or one where light dies, without sunlight.
  private static benighted(world: World, actor: string, place: string): boolean {
    return QueryIndex.of(world.module, 'benighted') ? world.test(ModuleWriter.call('benighted', actor))
      : this.test(world, 'unlit', place) && !this.test(world, 'capable', actor, 'light');
  }
  // What the company perceives turns on the player's revision (PlayerRevision: the world and, beside it, the
  // campaign's clock, creatures, log and the aim followed). A page asks it of one revision several times (before a
  // command, after it, in the command's feedback, for its screen), so it is worked out once for each, and given frozen:
  // no reader may change what the next is given. And what has happened, as the company has it (see chronicle), turns
  // on no more, and is kept with it: read again from the whole log, by the command's feedback and again for the page,
  // every act (OR-91).
  static observe(campaign: Campaign): PlayerSnapshot {
    return this.kept(campaign).snapshot ??= Costs.time('observe', () => Frozen.deep(this.perceive(campaign)));
  }
  static chronicle(campaign: Campaign): readonly ChronicleEntry[] {
    const actor = this.actor(campaign);
    return this.kept(campaign).chronicle ??= Frozen.deep(Chronicle.of(campaign, actor, this.labels(campaign)));
  }
  // What the company perceives as a journey's leg is told by its receipt (OR-1361; LegTold): its rows only the ways
  // (as Travel reads them), and who is here not read (what they are about is a planner's reading), so that neither the
  // whole frame nor the revision it is kept by (PlayerRevision, which asks for every act on offer) is worked out for a
  // leg the page tells without its frame. A leg's feedback reads no more of it (ActionFeedbackView.read: the act's own
  // row, and the rest of the rows only where the company stayed, where a journey stops and its frame is built whole).
  // Not kept, and so not frozen against a later reader: it is the leg's alone.
  static glimpse(campaign: Campaign): PlayerSnapshot {
    return Costs.time('observe', () => this.perceive(campaign, this.only(campaign, this.ways)));
  }
  private static readonly ways: ReadonlySet<string> = new Set(['go', 'lie_still']);
  // What is perceived, for a journey's leg (glimpse) or anything else (observe).
  static seen(campaign: Campaign, leg = false): PlayerSnapshot {
    return leg ? this.glimpse(campaign) : this.observe(campaign);
  }
  private static kept(campaign: Campaign): Observed { return PlayerRevision.of(campaign).reading('observed', () => ({})); }
  private static perceive(campaign: Campaign, narrow?: ReturnType<typeof PlayerView.only>): PlayerSnapshot {
    const actor = this.actor(campaign), world = campaign.world, labels = this.labels(campaign);
    const entities = campaign.module.entities, read = campaign.readout;
    const state = { elapsed: read.elapsed, creatures: read.creatures, partyIds: read.partyIds };
    const at = world.one('at', actor), place = at === undefined ? undefined : ObservationText.entity(world, at);
    const location = place?.type === 'place' ? place : undefined;
    const perceiving = this.test(world, 'able', actor), dark = !!location && this.benighted(world, actor, location.id);
    const situations = campaign.installations.length ?
      campaign.installations.map(m => ({ name: m.name, description: m.description ?? '' })) :
      [{ name: campaign.module.name, description: campaign.module.description }];
    // The frame's rows, the one row set of this revision (PlayerFrame), not a copy of its own.
    const publicChoices = narrow ?? PlayerFrame.of(campaign).rows;
    return { actor, title: campaign.module.name, situations, elapsed: state.elapsed, running: campaign.running,
      ...read.minutes ? { minutes: read.minutes } : {},
      ...(location ? { location: { id: location.id, name: ObservationText.label(world, location.id),
        ...(location.space ? { kind: location.space.kind } : {}) } } : {}),
      ...(location?.space ? { spatial: this.spatial(campaign, actor, location, publicChoices) } : {}),
      // In an unlit place without a light, what is said here goes unseen; who is here, and what sounds, is heard.
      observations: perceiving && location ? [...dark ? [this.darkness] : [],
        ...LocalObservations.read(world, actor, dark)] : [],
      // Whoever could be here, in the module's order: not every entity there is.
      present: perceiving && location && !narrow ? this.present(campaign, actor, location.id, dark) : [],
      items: state.creatures.filter(c => state.partyIds.includes(c.id)).flatMap(c =>
        (c.state.inventory ?? []).map(i => {
        const d = campaign.catalog.get(i.definition);
        return { id: i.id, name: d.name, description: d.description, owner: c.name, equipped: !!i.equipped,
          ...(d.slot ? { slot: d.slot } : {}), effects: [d.use ?? d.description] };
      })),
      party: this.members(campaign),
      resources: world.measured('quantity').filter(m => m.call.args[0] === actor)
        .map(m => ({ id: m.call.args[1]!, name: labels.get(m.call.args[1]!) ?? m.call.args[1]!, amount: m.value })),
      holdings: world.measuresOf(actor).map(m => ({
        text: m.call.args.length > 1 ? `${m.call.name}: ${this.rest(m.call, labels)}` : m.call.name, value: m.value })),
      facts: world.of(actor).filter(r => !this.ownHidden.includes(r.name))
        .map(r => r.args.length > 1 ? `${r.name}: ${this.rest(r, labels)}` : r.name).sort(),
      knowledge: CompanyKnowledge.of(campaign, actor, labels),
      assumptions: this.about(world, 'assumesFalse', actor, entities)
        .map(e => ({ id: e.id, text: ObservationText.render(e.name, world) })),
      deadlines: campaign.installations.filter(m => m.deadline !== undefined).flatMap(m => m.pressures.map(id => ({
        situation: m.name, pressure: labels.get(id) ?? id, at: m.deadline!, passed: state.elapsed >= m.deadline! }))),
      capabilities: this.about(world, 'capable', actor, entities).map(e => ({ name: e.name,
        providers: PartyCapabilities.providers(campaign.catalog, e.id,
          state.creatures.filter(c => state.partyIds.includes(c.id)))
          .map(c => `${c.name} (${c.raceId} ${c.classId})`) })),
      choices: publicChoices.map(c => c.choice), followed: perceiving ? Undertakings.followed(campaign)?.id : undefined,
      // The aims held by the one test every client counts by (Undertakings.held), each in its words.
      ...(campaign.module.objectives?.length ? { objectives: perceiving ? Undertakings.held(campaign)
        .map(o => ({ id: o.id, text: AimWords.render(world, o) }))
        .toSorted((a, b) => PlayerView.own(a.id) - PlayerView.own(b.id)) : [] } : {}),
      map: CompanyMap.of(campaign, actor, publicChoices.filter(c => c.choice.category === 'travel').map(c => c.action)) };
  }
  // Your own errand before what the country holds (the page's aim had wandered to whatever was heard of last: the lone
  // tower, then the cisterns, while the brothers' errand was under way: play 7).
  private static own(id: string): number { return /^origin__/.test(id) ? 0 : 1; }
  // The company as the page shows it: each member's standing, spells, conditions, abilities and qualities.
  private static members(campaign: Campaign): PlayerSnapshot['party'] {
    const creatures = campaign.readout.creatures;
    return campaign.fighters.map(f => ({ id: f.id, name: f.name, raceId: f.raceId, classId: f.classId, level: f.level,
      backgroundId: creatures.find(c => c.id === f.id)?.backgroundId,
      hp: f.hp, maxHp: f.maxHp, mana: f.mana, maxMana: f.maxMana, gold: f.gold, experience: f.experience,
      ...(f.maxSlots ? { slots: [...f.slots ?? []], maxSlots: [...f.maxSlots] } : {}),
      ...(f.prepared ? { prepared: structuredClone(f.prepared), ready: structuredClone(f.ready ?? []) } : {}),
      conditions: f.statuses.map(s => s.id), ...PlayerView.lasting(f.statuses), abilities: [...f.abilities],
      attributes: { strength: f.strength, dexterity: f.dexterity, constitution: f.constitution,
        intelligence: f.intelligence, wisdom: f.wisdom, charisma: f.charisma } }));
  }
  // Whoever and whatever is here to be looked at more closely, in the module's order: not every entity there is.
  private static present(campaign: Campaign, actor: string, here: string, dark: boolean): PresentEntity[] {
    const world = campaign.world, discovery = Discovery.supported(campaign.module);
    // Someone whose role turns on what holds is who they are now (see ObservationText.presented).
    const now = ObservationText.presented(world);
    return EntityIndex.of(campaign.module.entities).ordered(this.nearby(world, here)).filter(e => e.id !== actor
      && e.type !== 'place' && (!dark || e.type === 'group') && LocalObservations.noticed(world, e.id, actor)
      && (this.test(world, 'at', e.id, here) || (world.relates('mounted') && this.test(world, 'mounted', e.id, here))
        || (e.type === 'door' && this.test(world, 'doorHere', e.id, here))
        || (e.type === 'group' && this.guarding(world, e.id, here))
        || LocalObservations.within(world, e.id, here))
      && (e.type !== 'source' || !discovery || (this.test(world, 'noticeable', e.id) && !this.spoken(world, e.id))))
      .map(e => this.entity(campaign, world, e.roles ? now.get(e.id) ?? e : e));
  }
  private static spatial(campaign: Campaign, actor: string, location: Entity,
    choices: FrameRows): SpatialScene {
    const world = campaign.world, entities = ObservationText.presented(world);
    const ancestry = Spatial.ancestry(entities, location.id).reverse()
      .map(e => ({ id: e.id, name: e.name, kind: e.space!.kind }));
    const exits = EntityIndex.of(campaign.module.entities).exitsFrom(location.id)
      .filter(e => Spatial.visible(world, actor, e)).map(e => {
      const exit = e.exit!, selected = choices.find(c => c.action.movement?.passage === e.id);
      const barrier = exit.door ? entities.get(exit.door)?.name ?? exit.door : undefined;
      const reason = selected ? undefined : exit.door && this.test(world, 'lockedDoor', exit.door) ? `${barrier} is locked` :
        exit.door && !this.test(world, 'openedDoor', exit.door) ? `${barrier} is closed` :
        this.test(world, 'closed', exit.destination) ? 'The destination is closed' : 'Access is unavailable';
      return { id: e.id, destination: exit.destination, name: e.name, mode: exit.mode, available: !!selected,
        ...(selected ? { command: selected.choice.id } : {}), ...(barrier ? { barrier } : {}),
        ...(reason ? { reason } : {}) };
    });
    const lastMove = [...campaign.history].reverse()
      .find(event => event.changes.includes(`+ at(${actor}, ${location.id})`));
    const action = lastMove ? campaign.operator(lastMove.action) : undefined;
    const movement = action?.movement;
    return { ancestry, exits, ...(movement ? { enteredFrom: { id: movement.origin,
      name: entities.get(movement.origin)?.name ?? movement.origin, mode: movement.mode } } : {}) };
  }
  private static rest(call: Call, labels: Map<string, string>): string {
    return call.args.slice(1).map(id => labels.get(id) ?? id).join(', ');
  }
  private static entity(campaign: Campaign, world: World, e: Entity): PresentEntity {
    if (e.type === 'group') {
      const read = campaign.readout, ids = read.inhabitants[e.id] ?? [], creatures = read.creatures;
      const activity = this.activity(campaign, world, e.id);
      const condition = this.condition(world, e.id, campaign.playerActor);
      return { id: e.id, name: e.name, type: e.type, ...(activity ? { activity } : {}),
        ...(condition ? { condition } : {}),
        members: ids.map(id => creatures.find(c => c.id === id)!).map(c => ({ name: c.name, raceId: c.raceId,
          classId: c.classId, level: c.base.level, hp: c.state.hp, maxHp: c.base.maxHp,
          ...c.backgroundId ? { backgroundId: c.backgroundId } : {},
          ...c.professionId ? { professionId: c.professionId } : {} })),
        ...(this.test(world, 'dead', e.id) ? { state: 'dead' as const } :
          !this.test(world, 'able', e.id) ? { state: 'incapacitated' as const } : {}) };
    }
    const condition = this.condition(world, e.id);
    const box = world.one('inside', e.id);
    return { id: e.id, name: e.name, type: e.type, ...(condition ? { condition } : {}),
      ...(box ? { within: ObservationText.label(world, box) } : {}),
      ...(e.type === 'source' ? { intact: this.test(world, 'intact', e.id) } : {}) };
  }
  private static condition(world: World, id: string, company?: string): string | undefined {
    if (this.test(world, 'routed', id)) { return 'routed'; }
    // Faced down or talked round, a band that lets the company by says so (a warn-off that succeeded changed nothing
    // to be seen: the play-structure investigation's PT-32).
    if (company && !this.test(world, 'peaceable', id) && this.test(world, 'tolerates', id, company)) {
      return 'letting you by';
    }
    const state = world.one('state', id);
    // A state is named by its id ("wound_up"); the page says it as words ("wound up"). One the thing tells in its own
    // words ("The steward wears a big iron key on his belt") is told by them, not again by its id beside the thing's
    // name ("worn", which the M16 free play read under the key: PRE-07).
    const name = state ? ObservationText.entity(world, state)?.name : undefined;
    if (name && this.described(world).has(`${id}__${name}`)) { return undefined; }
    return name && /^[a-z0-9_]+$/.test(name) ? name.replace(/_/g, ' ') : name;
  }
  private static readonly descriptions = new WeakMap<object, Set<string>>();
  private static described(world: World): Set<string> {
    let ids = this.descriptions.get(world.module);
    if (!ids) {
      ids = new Set((world.module.observations ?? []).map(o => o.id));
      this.descriptions.set(world.module, ids);
    }
    return ids;
  }
  // What a person in view is evidently trying to do: the label of the goal their next choice would serve.
  private static activity(campaign: Campaign, world: World, id: string): string | undefined {
    const actor = campaign.actors.find(a => a.id === id && !a.player);
    if (!actor || !world.module.relations.some(r => r.name === 'at') || !this.test(world, 'able', id)) { return undefined; }
    const explained = Agency.explain(world, actor, campaign.operators, campaign.readout.waiting);
    const pursuing = explained.selected ?? explained.goals.find(g => g.applicable && !g.satisfied)?.id;
    const label = campaign.module.pursuits?.find(p => p.actor === id && p.id === pursuing)?.label;
    if (!label) { return undefined; }
    const text = ObservationText.render(label, world, false);
    // What they are evidently doing; and, from one who speaks and is here to say it, that they can find no way to it.
    // A creature with no way open is doing nothing to be seen: that is the planner's knowledge of the whole world,
    // not the company's (the review's A20).
    if (explained.selected) { return text; }
    return this.test(world, 'talks', id) ? `${text}, but no way is open to them` : undefined;
  }
}
