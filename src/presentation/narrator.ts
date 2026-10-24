import type { Campaign, CampaignEvent } from '../campaign/campaign';
import type { Entity, Observation, Shelter } from '../lang/module';
import type { Screen, TargetRow } from '../ui/screen-types';
import { ActionFeedbackView, type ActionFeedback } from './action-feedback';
import { FictionalTime } from './fictional-time';
import { Typography } from './typography';
import { Narration } from './narration';
import { ModuleWriter } from '../lang/module-writer';

// One line of what came of a command: someone's words, the telling of what happened, an event that broke in, a
// change to the place, or a fight's turning point.
export interface ExchangeLine { text: string; kind: 'speech' | 'telling' | 'event' | 'change' | 'fight' | 'roll' }
export interface Exchange { said?: string; lines: ExchangeLine[]; notes: string[]; tone: 'act' | 'fight' | 'fail' }
// What the page tells, kept apart by what it is for: the present situation (what this place is, and who and what
// is here), what has changed since the company was last here, and what came of the last thing it did.
export interface Leaf {
  heading?: { kind: 'opening' | 'country'; title: string };
  situation: string[]; presence: string[]; changed: string[]; exchange?: Exchange; shelter?: Shelter;
  // Whether the last command brought the company here from somewhere else, and the way, told as it went.
  moved?: boolean; journey?: string[];
}
// One command, as the host keeps it until the next: what happened, what the company saw of it, the words it was
// chosen in, and whether it brought the company somewhere else.
export interface Told { event: CampaignEvent; feedback: ActionFeedback; said?: string; moved: boolean }

// Chooses what to tell. The world says everything that is true at a place; the narrator says what this place is, what
// stands out, what has changed, and what came of the last thing done, and leaves out what would only repeat: the
// passing life of a place is told the first time, the sky when the company comes under it or it changes, and the
// sky not at all beneath a roof or underground.
export class Narrator {
  static readonly weary = 'It is a long time since anyone slept. The company is weary, and will fight the worse for it until it sleeps.';
  static leaf(campaign: Campaign, screen: Screen, told?: Told): Leaf {
    const defs = this.defs(campaign), shelter = this.shelter(campaign, screen.place.id);
    const seenBefore = this.seenBefore(campaign);
    const known = [...seenBefore].some(id => Narrator.def(defs, id)?.place === screen.place.id);
    const turned = this.skyTurned(told?.event);
    // The sky is told when the company comes out under it (from indoors, or at the start), or when it turns; walking on
    // from one place to the next under the same sky, it is not told again.
    const under = !told || (told.moved && this.cameOut(campaign, told.event));
    const kept = screen.observed.filter(o => this.tells(this.def(defs, o.id), { shelter, known, arrived: under, turned,
      here: screen.place.id }));
    // What has changed since the company was last here is told under that, not twice.
    const changed = known && told?.moved ? screen.fresh : [];
    const exchange = told && this.exchange(campaign, told);
    // What the last command did to the place (a trap sprung, a wonder gone quiet) is told as what happened, not again
    // in the place's telling under it.
    // What looking closely, prodding or listening found is the answer to it, and told as that; anything else newly
    // seen in the place (a room a torch shows) is told with the place.
    const probing = told && ActionFeedbackView.probes.includes(campaign.operator(told.event.action)?.schema ?? '');
    if (exchange && !probing) { exchange.lines = exchange.lines.filter(l => l.kind !== 'change'
      || !kept.some(k => Narration.sentence(k.text) === l.text)); }
    const echoed = new Set((exchange?.lines ?? []).map(l => l.text));
    const lines = this.order(kept.filter(l => !changed.includes(FictionalTime.prose(l.text))
      && !echoed.has(Narration.sentence(l.text))), defs);
    const credited = lines.map(l => ({ ...l, text: this.noticed(campaign, Narrator.def(defs, l.id), l.text) }));
    const situation = this.paragraphs(credited, defs);
    // What a thing looks like is not told again with it when the place has just said it (a wonder, told as the place).
    const placed = situation.join(' ');
    const presence = this.presence(screen).filter(p => !echoed.has(Narration.sentence(p)) && !placed.includes(p));
    const journey = (told?.event.voiced ?? []).filter(v => v.kind.startsWith('journey')).map(v => Typography.curl(v.text));
    return this.set({
      situation, presence, changed,
      ...exchange ? { exchange } : {}, ...shelter ? { shelter } : {}, ...told?.moved ? { moved: true } : {},
      ...journey.length ? { journey } : {},
    });
  }
  // A place is told first, then what stands out in it, then what is to be read in it, and last the sky over it and
  // the passing life of it; lines of one kind keep the order they were written in.
  static readonly ranks: Record<string, number> = { fixture: 0, feature: 1, sign: 2, revelation: 2, weather: 3,
    ambience: 4 };
  private static order<T extends { id: string }>(lines: T[], defs: Map<string, Observation>): T[] {
    return lines.map((l, i) => ({ l, i, r: this.ranks[Narrator.def(defs, l.id)?.aspect ?? 'fixture'] ?? 1 }))
      .sort((a, b) => a.r - b.r || a.i - b.i).map(x => x.l);
  }
  // Every line as a book would set it.
  private static set(leaf: Leaf): Leaf {
    const e = leaf.exchange;
    return { ...leaf, situation: leaf.situation.map(t => Typography.curl(t)),
      presence: leaf.presence.map(t => Typography.curl(t)), changed: leaf.changed.map(t => Typography.curl(t)),
      ...e ? { exchange: { ...e, lines: e.lines.map(l => ({ ...l, text: Typography.curl(l.text) })),
        ...e.said ? { said: Typography.curl(e.said) } : {} } } : {} };
  }
  // An observation's definition, by its id; one near a variable is told by its own (id@entity).
  private static def(defs: Map<string, Observation>, id: string): Observation | undefined { return defs.get(id.split('@')[0]!); }
  private static readonly cached = new WeakMap<Campaign['module'], Map<string, Observation>>();
  private static defs(campaign: Campaign): Map<string, Observation> {
    let defs = this.cached.get(campaign.module);
    if (!defs) {
      defs = new Map((campaign.module.observations ?? []).map(o => [o.id, o]));
      this.cached.set(campaign.module, defs);
    }
    return defs;
  }
  // What the place's description holds now. Lines about someone or something here are told with them; an event is
  // told as part of what happened; ambience only the first time; the sky only in the open, and only on arriving or
  // when it turns.
  private static tells(def: Observation | undefined,
    at: { shelter?: Shelter; known: boolean; arrived: boolean; turned: boolean; here: string }): boolean {
    if (!def) { return true; }
    if (def.anchor === 'near' || def.aspect === 'event') { return false; }
    if (def.aspect === 'ambience') { return !at.known; }
    if (def.aspect === 'weather') { return at.shelter !== 'underground' && (at.arrived || at.turned); }
    return true;
  }
  // The lines one installation tells of its own place run on as one paragraph; a feature or a sign stands alone.
  private static paragraphs(lines: { id: string; text: string }[], defs: Map<string, Observation>): string[] {
    const out: { text: string; from: string }[] = [];
    for (const line of lines) {
      const def = Narrator.def(defs, line.id), text = FictionalTime.prose(line.text);
      const runs = !def?.aspect || def.aspect === 'fixture' || def.aspect === 'weather' || def.aspect === 'ambience';
      const from = runs && line.id.includes('__') ? line.id.split('__')[0]! : '';
      const prior = out.at(-1);
      if (prior && from && prior.from === from) { prior.text = `${prior.text} ${text}`; } else { out.push({ text, from }); }
    }
    return out.map(p => p.text);
  }
  // What only someone who brings a capability would notice (tracks, a word in the old script) is credited to the
  // fellow traveller who noticed it; what the one who plays notices is simply told.
  private static noticed(campaign: Campaign, def: Observation | undefined, text: string): string {
    const world = campaign.world;
    if (!def?.by || !world.module.relations.some(r => r.name === 'fellow')) { return text; }
    const by = world.related('brings').find(r => r.args[1] === def.by && world.test(ModuleWriter.call('fellow', r.args[0]!))
      && world.test(ModuleWriter.call('awake', r.args[0]!)));
    const name = by && campaign.module.entities.find(e => e.id === by.args[0])?.name;
    return name ? `${name} sees it first. ${text}` : text;
  }
  private static seenBefore(campaign: Campaign): Set<string> {
    return new Set(campaign.history.slice(0, -1).flatMap(e => (e.perceptions ?? []).map(p => p.id)));
  }
  // Whether the company has just come out from under a roof (or the ground): where it was before the command.
  private static cameOut(campaign: Campaign, event: CampaignEvent): boolean {
    const player = campaign.playerActor, left = event.changes.map(c => new RegExp(`^- at\\(${player}, (.+)\\)$`).exec(c)?.[1])
      .find(Boolean);
    return !left || this.shelter(campaign, left) !== 'outdoors';
  }
  private static skyTurned(event?: CampaignEvent): boolean {
    return !!event?.changes.some(c => /state\([^,]*sky,/.test(c));
  }
  // Where the company stands, as the place says it, or as its kind and setting imply: a room of a building is under
  // a roof; a green, a road and wild country are open to the sky.
  static shelter(campaign: Campaign, place: string): Shelter | undefined {
    const entities = new Map(campaign.module.entities.map(e => [e.id, e]));
    let at: Entity | undefined = entities.get(place);
    if (at?.space?.shelter) { return at.space.shelter; }
    for (let n = 0; at?.space?.parent && n < 8; n++) {
      at = entities.get(at.space.parent);
      if (at?.space?.shelter) { return at.space.shelter; }
      if (at?.space?.kind === 'building') { return 'indoors'; }
      if (at?.space && ['settlement', 'wilderness', 'region'].includes(at.space.kind)) { return 'outdoors'; }
    }
    return undefined;
  }
  // Who and what is here: as they can be seen now, or simply who they are.
  private static presence(screen: Screen): string[] {
    const lines: string[] = [], named: string[] = [];
    let many = false;
    for (const t of [...screen.people.filter(p => !p.companion), ...screen.things]) {
      if (t.says?.length) { lines.push(...t.says); continue; }
      if (t.state) {
        const lie = t.many ? (t.state === 'dead' ? 'lie dead' : 'are down') : t.state === 'dead' ? 'lies dead' : 'is down';
        lines.push(`${this.upper(this.short(t.name))} ${lie}.`); continue;
      }
      if (t.kind === 'person') { named.push(this.who(t)); many ||= !!t.many; }
    }
    // In the dark they are heard, not seen: by what they are, close by.
    const heard = screen.people.filter(p => !p.companion && !p.state).map(p => this.short(p.name));
    const all = heard.length > 1 ? `${heard.slice(0, -1).join(', ')} and ${heard.at(-1)}` : heard[0];
    if (screen.dark) { return all ? [`In the dark you can hear ${all} close by.`] : []; }
    if (named.length === 1) {
      lines.push(`${this.upper(named[0]!)}${named[0]!.includes(', ') ? ',' : ''} ${many ? 'are' : 'is'} here.`);
    }
    else if (named.length) { lines.push(`Here are ${named.slice(0, -1).join('; ')}; and ${named.at(-1)}.`); }
    // Two of a kind doing the same (two goats at one hedge) are told once.
    return lines.filter((l, i) => lines.indexOf(l) === i);
  }
  // "Eamon, innkeeper" is "Eamon, the innkeeper"; "Cyril, pilgrim" is "Cyril, a pilgrim".
  private static who(t: TargetRow): string {
    const [name, ...rest] = t.name.split(', '), role = rest.join(', ');
    if (!role) { return name!; }
    if (/^(the|a|an|his|her|their) /i.test(role)) { return `${name}, ${role}`; }
    return `${name}, ${this.offices.test(role) ? 'the' : /^[aeiou]/i.test(role) ? 'an' : 'a'} ${role}`;
  }
  private static readonly offices =
    /^(innkeeper|priest|priestess|merchant|reeve|toll-reeve|smith|miller|headman|abbot|prior)\b/i;
  private static short(name: string): string { return name.split(', ')[0]!; }
  private static upper(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
  // What came of the command. Something learned by asking is said in the words of whoever told it, where they told
  // it: the journal keeps it, but the page does not send the player there to find out what was said.
  private static exchange(campaign: Campaign, told: Told): Exchange {
    const { event, feedback } = told, action = campaign.operator(event.action);
    const informant = action?.schema === 'ask' ? action.bindings?.informant : undefined;
    const speaker = informant ? this.nameOf(campaign, informant) : undefined;
    const spoken = speaker ? feedback.discoveries.map(d => this.speech(d, speaker)) : [];
    const fight = event.combat.some(e => e.type === 'end');
    // What the voice tables told of it (someone joining, a dog patted) stands for the bare result of the command.
    const voiced = (event.voiced ?? []).filter(v => !v.kind.startsWith('journey'))
      .map(v => ({ text: v.text, kind: 'telling' as const }));
    // So does what was learned, when the scene shows it: the dog's muddy coat, not the note of it.
    const bare = voiced.length && (/^You (carry out|do) /.test(feedback.result ?? '')
      || (feedback.discoveries.length > 0 && feedback.result === feedback.discoveries.join(' ')));
    const result = spoken.length || bare ? [] : feedback.result ? [{ text: feedback.result, kind: 'telling' as const }] : [];
    const events = feedback.events.map(text => ({ text, kind: 'event' as const }));
    // A thing changed is told by what came of it (the water going down) before how it is now (the well dry).
    const changing = /^change_thing/.test(action?.schema ?? '');
    const lines: ExchangeLine[] = [
      ...changing ? events : [], ...result,
      ...spoken.map(text => ({ text, kind: 'speech' as const })),
      ...changing ? [] : events,
      ...voiced,
      ...feedback.immediate.map(text => ({ text: text.replace(/^You witness: /, ''),
        kind: fight ? 'fight' as const : feedback.rolls.includes(text) ? 'roll' as const : 'event' as const })),
      ...event.changes.includes(`+ weary(${campaign.playerActor})`) ? [{ text: Narrator.weary, kind: 'event' as const }] : [],
      ...(told.moved ? [] : feedback.observations.map(text => ({ text, kind: 'change' as const }))),
    // What someone says, whether answering or of their own accord (a companion's word on coming somewhere), is speech.
    ].map(l => ({ ...l, kind: ['telling', 'event'].includes(l.kind) && /^['‘"“]/.test(l.text) ? 'speech' as const : l.kind }));
    // Going somewhere is told by the place it brings you to: "You arrive at the old bank" adds nothing to it.
    const unique = lines.filter((l, i) => lines.findIndex(o => o.text === l.text) === i)
      .filter(l => !(told.moved && /^You arrive at /.test(l.text)));
    // What was learned is noted, unless it has just been said.
    const said = new Set(unique.map(l => l.text));
    const notes = [...feedback.resources.map(r => this.resource(r)), ...(spoken.length ? []
      : feedback.discoveries.filter(d => !said.has(d)).map(d => `Noted: ${this.gist(d)}`))];
    return { ...told.said ? { said: told.said } : {}, lines: this.tidy(unique, fight), notes,
      tone: fight ? 'fight' : event.result === 'failure' ? 'fail' : 'act' };
  }
  // Tidied lines keep the kind of the line they were made from ("Wenna takes 7 slashing damage (8 HP left)" is
  // the event it was); one made of several (two who each gain experience) is an event.
  private static tidy(lines: ExchangeLine[], fight: boolean): ExchangeLine[] {
    const made = lines.map(l => ({ l, text: Narration.tidy([l.text])[0] }));
    return Narration.tidy(lines.map(l => l.text), fight ? lines.length : 0)
      .map(text => ({ ...made.find(m => m.text === text)?.l ?? { kind: 'event' as const }, text }));
  }
  private static nameOf(campaign: Campaign, id: string): string {
    return this.short(campaign.module.entities.find(e => e.id === id)?.name ?? id);
  }
  // "A drover went out and did not come home. His dog did." told by Eamon is
  // "‘A drover went out and did not come home,’ says Eamon. ‘His dog did.’"
  static speech(text: string, speaker: string): string {
    const said = text.trim(), [first, ...rest] = said.split(/(?<=[.!?])\s+/);
    const lead = first!.replace(/\.$/, ',');
    return rest.length ? `‘${lead}’ says ${speaker}. ‘${rest.join(' ')}’` : `‘${lead}’ says ${speaker}.`;
  }
  // "Coin: 22 → 21" reads "−1 coin (21 now)".
  static resource(line: string): string {
    const m = /^(.+): (\d+) → (\d+)$/.exec(line);
    if (!m) { return line; }
    const [, name, a, b] = m, delta = Number(b) - Number(a);
    return `${delta > 0 ? '+' : '−'}${Math.abs(delta)} ${name!.toLowerCase()} (${b} now)`;
  }
  // What was learned, as much of it as can be acted on: its first sentence ("The way to the round tower on the
  // Sharpmunt: north from the ford, then..."), or its first part when the sentence runs long, never cut mid-thought.
  static gist(fact: string): string {
    const sentence = fact.split(/(?<=[.!?])\s+/)[0]!.replace(/\.$/, ''), part = sentence.split(/[;:]\s/)[0]!;
    return this.words(sentence) <= 30 ? sentence : this.words(part) <= 30 ? part
      : `${sentence.split(/\s+/).slice(0, 24).join(' ')}…`;
  }
  private static words(text: string): number { return text.split(/\s+/).length; }
}
