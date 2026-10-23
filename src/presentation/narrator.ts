import type { Campaign, CampaignEvent } from '../campaign/campaign';
import type { Entity, Observation, Shelter } from '../lang/module';
import type { Screen, TargetRow } from '../ui/screen-types';
import type { ActionFeedback } from './action-feedback';
import { FictionalTime } from './fictional-time';
import { Typography } from './typography';
import { Narration } from './narration';

// One line of what came of a command: someone's words, the telling of what happened, an event that broke in, a
// change to the place, or a fight's turning point.
export interface ExchangeLine { text: string; kind: 'speech' | 'telling' | 'event' | 'change' | 'fight' }
export interface Exchange { said?: string; lines: ExchangeLine[]; notes: string[]; tone: 'act' | 'fight' | 'fail' }
// What the page tells, kept apart by what it is for: the present situation (what this place is, and who and what
// is here), what has changed since the company was last here, and what came of the last thing it did.
export interface Leaf {
  heading?: { kind: 'opening' | 'country'; title: string };
  situation: string[]; presence: string[]; changed: string[]; exchange?: Exchange; shelter?: Shelter;
}
// One command, as the host keeps it until the next: what happened, what the company saw of it, the words it was
// chosen in, and whether it brought the company somewhere else.
export interface Told { event: CampaignEvent; feedback: ActionFeedback; said?: string; moved: boolean }

// Chooses what to tell. The world says everything that is true at a place; the narrator says what this place is, what
// stands out, what has changed, and what came of the last thing done, and leaves out what would only repeat: the
// passing life of a place is told the first time, the sky when the company comes under it or it changes, and the
// sky not at all beneath a roof or underground.
export class Narrator {
  static leaf(campaign: Campaign, screen: Screen, told?: Told): Leaf {
    const defs = this.defs(campaign), shelter = this.shelter(campaign, screen.place.id);
    const seenBefore = this.seenBefore(campaign);
    const known = [...seenBefore].some(id => defs.get(id)?.place === screen.place.id);
    const turned = this.skyTurned(told?.event);
    // The sky is told when the company comes out under it (from indoors, or at the start), or when it turns; walking on
    // from one place to the next under the same sky, it is not told again.
    const under = !told || (told.moved && this.cameOut(campaign, told.event));
    const lines = screen.observed.filter(o => this.tells(defs.get(o.id), { shelter, known, arrived: under,
      turned, here: screen.place.id }));
    const situation = this.paragraphs(lines, defs), presence = this.presence(screen);
    const exchange = told && this.exchange(campaign, told), shown = [...situation, ...presence];
    // What the page already says of the place and who is in it is not said again among what just happened.
    if (exchange) { exchange.lines = exchange.lines.filter(l => l.kind !== 'change' || !shown.some(p => p.includes(l.text))); }
    return this.set({
      situation, presence, changed: known && told?.moved ? screen.fresh : [],
      ...exchange ? { exchange } : {}, ...shelter ? { shelter } : {},
    });
  }
  // Every line as a book would set it.
  private static set(leaf: Leaf): Leaf {
    const e = leaf.exchange;
    return { ...leaf, situation: leaf.situation.map(t => Typography.curl(t)),
      presence: leaf.presence.map(t => Typography.curl(t)), changed: leaf.changed.map(t => Typography.curl(t)),
      ...e ? { exchange: { ...e, lines: e.lines.map(l => ({ ...l, text: Typography.curl(l.text) })),
        ...e.said ? { said: Typography.curl(e.said) } : {} } } : {} };
  }
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
      const def = defs.get(line.id), text = FictionalTime.prose(line.text);
      const runs = !def?.aspect || def.aspect === 'fixture' || def.aspect === 'weather' || def.aspect === 'ambience';
      const from = runs && line.id.includes('__') ? line.id.split('__')[0]! : '';
      const prior = out.at(-1);
      if (prior && from && prior.from === from) { prior.text = `${prior.text} ${text}`; } else { out.push({ text, from }); }
    }
    return out.map(p => p.text);
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
    for (const t of [...screen.people.filter(p => !p.companion), ...screen.things]) {
      if (t.says?.length) { lines.push(...t.says); continue; }
      if (t.state) { lines.push(`${this.upper(this.short(t.name))} ${t.state === 'dead' ? 'lies dead' : 'is down'}.`); continue; }
      if (t.kind === 'person') { named.push(this.who(t)); }
    }
    if (named.length === 1) { lines.push(`${this.upper(named[0]!)}${named[0]!.includes(', ') ? ',' : ''} is here.`); }
    else if (named.length) { lines.push(`Here are ${named.slice(0, -1).join('; ')}; and ${named.at(-1)}.`); }
    return lines;
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
    const lines: ExchangeLine[] = [
      ...(spoken.length ? [] : feedback.result ? [{ text: feedback.result, kind: 'telling' as const }] : []),
      ...spoken.map(text => ({ text, kind: 'speech' as const })),
      ...feedback.events.map(text => ({ text, kind: 'event' as const })),
      ...feedback.immediate.map(text => ({ text: text.replace(/^You witness: /, ''), kind: fight ? 'fight' as const : 'event' as const })),
      ...(told.moved ? [] : feedback.observations.map(text => ({ text, kind: 'change' as const }))),
    // What someone says, whether answering or of their own accord (a companion's word on coming somewhere), is speech.
    ].map(l => ({ ...l, kind: ['telling', 'event'].includes(l.kind) && /^['‘"“]/.test(l.text) ? 'speech' as const : l.kind }));
    // Going somewhere is told by the place it brings you to: "You arrive at the old bank" adds nothing to it.
    const unique = lines.filter((l, i) => lines.findIndex(o => o.text === l.text) === i)
      .filter(l => !(told.moved && /^You arrive at /.test(l.text)));
    const notes = [...feedback.resources, ...(spoken.length ? [] : feedback.discoveries.map(d => `Noted: ${this.gist(d)}`))];
    return { ...told.said ? { said: told.said } : {}, lines: this.tidy(unique, fight), notes,
      tone: fight ? 'fight' : event.result === 'failure' ? 'fail' : 'act' };
  }
  private static tidy(lines: ExchangeLine[], fight: boolean): ExchangeLine[] {
    const kept = new Set(Narration.tidy(lines.map(l => l.text), fight ? lines.length : 0));
    return lines.filter(l => kept.has(Narration.sentence(l.text)))
      .map(l => ({ ...l, text: Narration.sentence(l.text) }));
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
  // The first clause of a fact, enough to recognise it by.
  private static gist(fact: string): string {
    const words = fact.split(/\s+/), clause = fact.split(/[,;:.]/)[0]!;
    return clause.split(/\s+/).length <= 9 ? clause : `${words.slice(0, 9).join(' ')}…`;
  }
}
