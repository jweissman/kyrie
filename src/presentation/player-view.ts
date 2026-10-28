import { Spatial } from '../spatial';
import { ItemCatalog } from '../item-catalog';
import { PartyCapabilities } from '../campaign/party-capabilities';
import { LocalObservations } from '../campaign/local-observations';
import type { Campaign, CampaignEvent } from '../campaign/campaign';
import type { Call, Change, Entity, MovementMode } from '../lang/module';
import type { Operator } from '../campaign/planner';
import { ModuleWriter } from '../lang/module-writer';
import { World } from '../lang/world';
import { Discovery } from '../information/discovery';
import { CombatPresenter } from '../ui/combat-presenter';
import { CombatProjection } from '../combat-projection';
import { ActionPresentation, type PublicChoice } from './action-presentation';
import { ObservationText } from '../lang/observation-text';
import { Spoken } from './spoken';
import { VisitedPlaces } from './visited-places';
import { Agency } from '../campaign/agency';
import { ActionTime } from '../campaign/action-time';
import { ChoiceWording } from './choice-wording';
import { EntityIndex } from '../lang/entity-index';
import { Frozen } from './frozen';
import { CompanyKnowledge } from './company-knowledge';
import { CompanyMap } from './company-map';

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
  // What the company knows, and how: seen with its own eyes, found in a source, or heard from someone; and when.
  knowledge: { id: string; text: string; source?: 'seen' | 'found' | 'heard' | 'read'; from?: string; at?: number;
    // Heard from someone, and since seen or found for itself: a report borne out.
    confirmed?: true }[];
  assumptions: { id: string; text: string }[];
  deadlines: { situation: string; pressure: string; at: number; passed: boolean }[];
  capabilities?: { name: string; providers: string[] }[];
  choices: PublicChoice[];
  objectives?: { id: string; text: string }[];
  map: {
    places: ({ id: string; name: string; visited: boolean } & SceneMetadata)[];
    links: { from: string; to: string; status?: string }[];
  };
}
export interface ChronicleEntry { at: number; kind: 'player' | 'npc' | 'world' | 'observation' | 'discovery' | 'event'; text: string; detail: string[] }

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
    const offered = campaign.offered();
    let rows = this.listed.get(offered);
    if (!rows) { rows = this.list(campaign, offered); this.listed.set(offered, rows); }
    return rows.map(row => ({ ...row, choice: { ...row.choice } }));
  }
  // Actions as the page offers them: what the company sees, named as it would name them, worded, alike ones as one
  // (also what the company could do with more coin: CoinReading).
  static offer(campaign: Campaign, offered: readonly Operator[]) { return this.list(campaign, offered); }
  private static list(campaign: Campaign, offered: readonly Operator[]) {
    const world = campaign.world, unnamed = this.unnamed(world), actor = campaign.playerActor ?? '';
    const here = ChoiceWording.here(campaign);
    // Nothing can be done to someone the company does not see.
    const visible = world.module.seen ? offered.filter(a => this.sees(world, actor, a)) : offered;
    const rows = ActionPresentation.choices(visible, campaign.schemaList).map(row => {
      row.choice.time = ActionTime.of(row.action, world);
      // Choices are grounded with every place's name; one the company has not learned is said as it is seen.
      for (const [name, alias] of unnamed) { row.choice.name = row.choice.name.replaceAll(name, alias); }
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
      .reduce((t, e) => t.replaceAll(e.name, e.alias!.name), text);
  }
  private static unnamed(world: Campaign['world']): Map<string, string> {
    return new Map(EntityIndex.of(world.module.entities).aliased.filter(e => ObservationText.known(world, e) !== e.name)
      .map(e => [e.name, e.alias!.name]));
  }
  // A choice the page offers, or any action the rules offer now by its id: the page groups and words what it shows, and
  // an action it folded into another (the same done with either of two alike things) is no less legal for that (the
  // architecture review's H2: a legal action the page folded away could not be done, and a game kept by one build's
  // wording could fail to play again by another's).
  static resolve(campaign: Campaign, command: string): string {
    const match = this.choices(campaign).find(c => c.choice.id === command);
    if (match) { return match.action.id; }
    if (campaign.offered().some(a => a.id === command)) { return command; }
    throw new Error(`Unavailable command: ${command}`);
  }
  // The entities a relation holds between the actor and, in the module's order.
  private static about(world: World, relation: string, actor: string, entities: Entity[]): Entity[] {
    return EntityIndex.of(entities).ordered(world.related(relation, actor).map(r => r.args[1]!));
  }
  // What could be present at a place, to be looked at more closely: whatever is at it or mounted there, any door,
  // anyone guarding a way, and anything inside something.
  private static nearby(world: World, place: string): Set<string> {
    const near = new Set<string>();
    for (const name of ['at', 'mounted']) { for (const r of world.relatedTo(name, place)) { near.add(r.args[0]!); } }
    for (const name of ['guards', 'inside']) { for (const r of world.related(name)) { near.add(r.args[0]!); } }
    for (const e of EntityIndex.of(world.module.entities).typed('door')) { near.add(e.id); }
    return near;
  }
  // Someone who stands across a way out of here, barring it, is met from this side of it.
  private static guarding(world: Campaign['world'], id: string, here: string): boolean {
    const ways = world.related('guards', id).map(r => r.args[1]);
    return ways.length > 0 && this.test(world, 'able', id)
      && ways.some(w => world.related('connects', w!).some(r => r.args[1] === here))
      && world.module.queries.some(q => q.name === 'watched')
      && ways.some(w => world.test(ModuleWriter.call('watched', w!)));
  }
  private static lasting(statuses: { id: string; remaining: number; clock?: string }[]):
    { lasting?: Record<string, number> } {
    const timed = statuses.filter(s => s.clock === 'world-time' && s.remaining > 0);
    return timed.length ? { lasting: Object.fromEntries(timed.map(s => [s.id, s.remaining])) } : {};
  }
  // Unable to see here: an unlit place without a light, or one where light dies, without sunlight.
  private static benighted(world: World, actor: string, place: string): boolean {
    return world.module.queries.some(q => q.name === 'benighted') ? world.test(ModuleWriter.call('benighted', actor))
      : this.test(world, 'unlit', place) && !this.test(world, 'capable', actor, 'light');
  }
  // What the company perceives turns on the world and, beside it, the campaign's clock, creatures and log. A page asks
  // it of one world several times (before a command, after it, in the command's feedback, for its screen), so it is
  // worked out once for each, and given frozen: no reader may change what the next is given.
  private static readonly observed = new WeakMap<World, { campaign: Campaign; key: string; store: object;
    version: number; last?: CampaignEvent; snapshot: PlayerSnapshot }>();
  static observe(campaign: Campaign): PlayerSnapshot {
    const world = campaign.world, kept = this.observed.get(world), store = campaign.tickState.creatures;
    const read = campaign.readout, last = campaign.history.at(-1);
    const key = `${read.elapsed}:${read.minutes ?? 0}:${campaign.history.length}:${campaign.installations.length}`
      + `:${campaign.running}`;
    if (kept?.campaign === campaign && kept.key === key && kept.store === store && kept.version === store.version
      && kept.last === last) { return kept.snapshot; }
    const snapshot = Frozen.deep(this.perceive(campaign));
    this.observed.set(world, { campaign, key, store, version: store.version, last, snapshot });
    return snapshot;
  }
  private static perceive(campaign: Campaign): PlayerSnapshot {
    const actor = this.actor(campaign), world = campaign.world, labels = this.labels(campaign);
    const entities = campaign.module.entities, read = campaign.readout;
    const state = { elapsed: read.elapsed, creatures: read.creatures, partyIds: read.partyIds };
    const at = world.one('at', actor), place = at === undefined ? undefined : ObservationText.entity(world, at);
    const location = place?.type === 'place' ? place : undefined;
    const perceiving = this.test(world, 'able', actor);
    const dark = !!location && this.benighted(world, actor, location.id);
    const situations = campaign.installations.length ?
      campaign.installations.map(m => ({ name: m.name, description: m.description ?? '' })) :
      [{ name: campaign.module.name, description: campaign.module.description }];
    const publicChoices = this.choices(campaign);
    return { actor, title: campaign.module.name, situations, elapsed: state.elapsed, running: campaign.running,
      ...read.minutes ? { minutes: read.minutes } : {},
      ...(location ? { location: { id: location.id, name: ObservationText.label(world, location.id),
        ...(location.space ? { kind: location.space.kind } : {}) } } : {}),
      ...(location?.space ? { spatial: this.spatial(campaign, actor, location, publicChoices) } : {}),
      // In an unlit place without a light, what is said here goes unseen; only who is here can be heard.
      observations: perceiving && location ? (dark ? [this.darkness] : LocalObservations.read(world, actor)) : [],
      // Whoever could be here, in the module's order: not every entity there is.
      present: perceiving && location ? this.present(campaign, actor, location.id, dark) : [],
      items: state.creatures.filter(c => state.partyIds.includes(c.id)).flatMap(c =>
        (c.state.inventory ?? []).map(i => {
        const d = ItemCatalog.get(i.definition);
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
        providers: PartyCapabilities.providers(e.id, state.creatures.filter(c => state.partyIds.includes(c.id)))
          .map(c => `${c.name} (${c.raceId} ${c.classId})`) })),
      choices: publicChoices.map(c => c.choice),
      ...(campaign.module.objectives?.length ? { objectives: perceiving ? campaign.module.objectives
        .filter(o => world.test(o.when)).map(o => ({ id: o.id, text: ObservationText.render(o.text, world) }))
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
      && (this.test(world, 'at', e.id, here) || this.test(world, 'mounted', e.id, here)
        || (e.type === 'door' && this.test(world, 'doorHere', e.id, here))
        || (e.type === 'group' && this.guarding(world, e.id, here))
        || LocalObservations.within(world, e.id, here))
      && (e.type !== 'source' || !discovery || (this.test(world, 'noticeable', e.id) && !this.spoken(world, e.id))))
      .map(e => this.entity(campaign, world, e.roles ? now.get(e.id) ?? e : e));
  }
  private static spatial(campaign: Campaign, actor: string, location: Entity,
    choices: ReturnType<typeof PlayerView.choices>): SpatialScene {
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
  private static change(change: Change, labels: Map<string, string>): string {
    const call = { ...change.call, args: change.call.args.map(id => labels.get(id) ?? id) };
    return ModuleWriter.change({ ...change, call } as Change);
  }
  // Rebuilt from the authoritative event log, so it is identical after save/restore and in every host.
  static chronicle(campaign: Campaign): ChronicleEntry[] {
    const actor = this.actor(campaign), labels = this.labels(campaign), entries: ChronicleEntry[] = [];
    const at = new Map<string, string>();
    for (const c of campaign.module.initial) {
      if (c.kind === 'assert' && c.call.name === 'at') { at.set(c.call.args[0]!, c.call.args[1]!); }
    }
    const names = { combatants: campaign.readout.creatures.map(c => CombatProjection.fighter(c, 'fighters')),
      turn: 0, actor: '', outcome: null };
    const deadlines = campaign.installations.filter(m => m.deadline !== undefined);
    let previous = 0;
    const perceived = new Set<string>();
    for (const event of campaign.history) {
      entries.push(this.playerEntry(campaign, event, previous, { labels, names }));
      VisitedPlaces.moves(event.changes.filter(line => line.includes(`at(${actor}, `)), at);
      const here = at.get(actor);
      for (const decision of event.npc ?? []) {
        const before = at.get(decision.actor);
        VisitedPlaces.moves(decision.changes, at);
        // What the company saw as it happened, as the runtime decided then; a game kept before that, by where the
        // company was. An undertaking obstructed is told by what came of it, if its author said, and not as done.
        const seen = decision.seen ?? (!!here && (before === here || at.get(decision.actor) === here));
        const act = campaign.operator(decision.action), obstructed = decision.goal === 'obstructed';
        if (!seen || (obstructed && !act?.otherwise)) { continue; }
        const told = obstructed ? act!.otherwise : act?.seen;
        entries.push({ at: decision.elapsed ?? event.elapsed, kind: 'npc',
          text: told ? ObservationText.render(told, campaign.world)
            : `${labels.get(decision.actor) ?? decision.actor}: ${act?.name ?? decision.action}`, detail: [] });
      }
      VisitedPlaces.moves(event.changes, at);
      for (const m of deadlines.filter(m => m.deadline! > previous && m.deadline! <= event.elapsed)) {
        entries.push({ at: m.deadline!, kind: 'world', detail: [],
          text: `Deadline reached: ${m.pressures.map(id => labels.get(id) ?? id).join(', ')} (${m.name})` });
      }
      // The chronicle is what happened; what places and people look like is the scene's to tell.
      for (const o of (event.perceptions ?? []).filter(p => p.kind !== 'observation')) {
        if (!perceived.has(`${o.id}:${o.text}`)) {
          perceived.add(`${o.id}:${o.text}`);
          entries.push({ at: event.elapsed, kind: o.kind, text: o.text, detail: [] });
        }
      }
      previous = event.elapsed;
    }
    return entries;
  }
  private static playerEntry(campaign: Campaign, event: CampaignEvent, previous: number, { labels, names }: {
    labels: Map<string, string>; names: Parameters<typeof CombatPresenter.format>[1]; }): ChronicleEntry {
    const action = campaign.operator(event.action);
    const declared = action ? (event.result === 'success' ? action.success : action.failure) : [];
    return { at: previous, kind: 'player',
      text: `${action?.name ?? event.action}${event.result === 'failure' ? ' — failed' : ''}`,
      detail: [...Spoken.told(campaign, event, labels), ...event.combat.map(c => CombatPresenter.format(c, names)),
        ...(campaign.module.observations?.length ? [] : declared.map(change => this.change(change, labels)))] };
  }
}
