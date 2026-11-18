// Where each line of a reviewed step was made (the adventure-structure brief §6.4), known at the review's edge from
// what the engine itself said it produced in that step, never by searching the sources for equal words: each
// perception of the step's events carries the declaration that made it (an Observe, a Rule, a Discovery's source),
// each voiced line its table and entry, the act's result its action; the scene's observations and who is here carry
// theirs. A line is made of them when it is exactly one of them, or several in order, as the narrator turns them
// (second person, the hour in words, a sentence's capital, cut to its first sentences by the scene's budget): one way
// only. Some of what the engine keeps relays another's words, and is set aside where the maker is also there: a voiced
// answer or a rule's words kept as told (the Topic's result, the Rule's say), what someone here is seen as (the
// observation about them), the glance's relaying of what changed and who is here, and a Discovery learned (resulting
// knowledge, not its telling). A line two producers of the step could both have made, or none did, is unknown, and
// says why.
import type { Campaign, CampaignEvent } from '../campaign/campaign';
import { FictionalTime } from '../campaign/fictional-time';
import { Narration } from '../presentation/narration';
import { SecondPerson } from '../presentation/second-person';
import { Sentences } from '../presentation/sentences';
import { Typography } from '../presentation/typography';
import type { ExchangeLine, Leaf } from '../presentation/narrator';
import type { Screen } from '../ui/screen-types';
import type { Offered } from './runner';
import type { Exactness, SourceRef } from './review-types';

export interface Unit { key: string; source: SourceRef; relay?: true }
type Found = { exact: Exactness; sources: SourceRef[] };

export class ReviewProvenance {
  private readonly types = new Map<string, string>();
  private readonly me?: string;
  constructor(private readonly campaign: Campaign) {
    const m = campaign.module;
    for (const o of m.observations ?? []) { this.types.set(o.id, 'Observe'); }
    for (const r of m.rules ?? []) { this.types.set(r.id, 'Rule'); }
    for (const o of m.objectives ?? []) { this.types.set(o.id, 'Objective'); }
    for (const a of m.actions) {
      for (const id of [a.schema ?? a.id, a.id]) { if (!this.types.has(id)) { this.types.set(id, a.topic ? 'Topic' : 'Action'); } }
    }
    for (const e of m.entities) { if (!this.types.has(e.id)) { this.types.set(e.id, e.type); } }
    const ids = campaign.readout.partyIds;
    this.me = ids.length === 1 ? campaign.readout.creatures.find(c => c.id === ids[0])?.name : undefined;
  }
  // A declaration by its id: the namespace it was installed under (drove__owain: drove), its id, and its type.
  kyr(id: string, via: string): SourceRef {
    const bare = id.split('@')[0]!, module = /^([a-z0-9_]+?)__/.exec(bare)?.[1] ?? 'rules';
    const type = this.types.get(bare);
    return { kind: 'kyr', module, declaration: bare, ...type ? { type } : {}, via };
  }
  // What the engine said it produced in a step: its events' perceptions, voiced lines and results, and the scene's
  // observations and those here, each with what made it.
  units(events: readonly CampaignEvent[], screen: Screen): Unit[] {
    const out: Unit[] = [];
    for (const e of events) {
      for (const p of [...e.perceptions ?? [], ...e.prelude?.perceptions ?? []]) {
        this.add(out, p.text, this.kyr(p.id, `perception:${p.kind}`), p.kind === 'discovery');
      }
      for (const v of e.voiced ?? []) {
        this.add(out, v.text, { kind: 'template', table: v.kind, entry: v.id, via: 'voiced' },
          v.kind === 'answer' || v.kind === 'rule');
      }
      for (const r of [e.response, e.prelude?.response]) { if (r) { this.add(out, r, this.result(e)); } }
    }
    for (const o of screen.observed) { this.add(out, o.text, this.kyr(o.id, 'observed')); }
    for (const t of [...screen.people, ...screen.things]) {
      for (const s of t.says ?? []) { this.add(out, s, this.kyr(t.id, 'says'), true); }
    }
    return out;
  }
  // What the narrator's leaf told the scene from: the glance's sight and sign of life (by their declarations, where
  // they have one), what it says lies here, how the company came, what changed, and who is here.
  leafUnits(leaf: Leaf | undefined): Unit[] {
    const out: Unit[] = [], g = leaf?.glance, engine = ReviewProvenance.engine;
    if (g?.sight) { this.add(out, g.sight.text, this.kyr(g.sight.id, 'glance:sight')); }
    if (g?.life) { this.add(out, g.life.text, g.life.id ? this.kyr(g.life.id, 'glance:life') : engine('glance:life'), !g.life.id); }
    if (g?.contents) { this.add(out, g.contents.text, engine('glance:contents')); }
    if (g?.came) { this.add(out, g.came, engine('glance:came')); }
    for (const c of g?.changed ?? []) { this.add(out, c, engine('glance:changed'), true); }
    for (const p of leaf?.presence ?? []) { this.add(out, p, engine('narrator:presence'), true); }
    return out;
  }
  // The act's result, as its action's author wrote it where the action has words of its own (Result, Otherwise, Told);
  // otherwise the engine's.
  private result(e: CampaignEvent): SourceRef {
    const op = this.campaign.operator(e.action), schema = op?.schema ?? op?.id;
    const written = op && (op.report || op.otherwise || op.told?.length);
    return schema && written ? this.kyr(schema, 'result') : { kind: 'engine', producer: `result:${schema ?? e.action}` };
  }
  // A unit's words as the narrator may turn them (see the head of this file), each kept with what made it.
  private add(out: Unit[], text: string, source: SourceRef, relay = false) {
    const forms = new Set<string>();
    for (const t of [text, FictionalTime.prose(text)]) {
      for (const u of [t, Narration.sentence(t), this.me ? SecondPerson.turn(t, this.me) : t]) {
        const parts = Sentences.split(u);
        for (let n = 1; n <= parts.length; n++) { forms.add(ReviewProvenance.key(parts.slice(0, n).join(' '))); }
        forms.add(ReviewProvenance.key(u));
      }
    }
    for (const key of forms) { if (key && !out.some(o => o.key === key && ReviewProvenance.same(o.source, source))) {
      out.push({ key, source, ...relay ? { relay: true as const } : {} });
    } }
  }
  // A line shown: made of the step's units in one way only, or by the engine where the narrator said it made it (a
  // blow of a fight, a roll), or unknown.
  line(text: string, units: readonly Unit[], kinds: readonly ExchangeLine[] = []): Found {
    const key = ReviewProvenance.key(text), ways = ReviewProvenance.makers(this.ways(key, units));
    if (ways.length === 1) { return { exact: ReviewProvenance.exactness(ways[0]!), sources: ways[0]! }; }
    if (ways.length > 1) {
      return this.unknown(`made ${ways.length} ways by this step's producers: ${ways.map(w => w.map(s =>
        ReviewProvenance.name(s)).join(' + ')).join(' | ')}`);
    }
    const kind = kinds.find(k => ReviewProvenance.key(k.text) === key)?.kind;
    if (kind === 'fight' || kind === 'roll') { return { exact: 'producer', sources: [{ kind: 'engine', producer: `narrator:${kind}` }] }; }
    return this.unknown(kind ? `a ${kind} line no producer of this step made whole` : 'no producer of this step made it');
  }
  // Of the ways a line was made, those of its makers: a way that only relays (see the head of this file) set aside
  // where a way by a maker of the words is there too, part by part.
  private static makers(ways: Unit[][]): SourceRef[][] {
    const made = ways.filter(w => !w.every(u => u.relay));
    return (made.length ? made : ways).map(w => w.map(u => u.source));
  }
  private unknown(reason: string): Found { return { exact: 'unknown', sources: [{ kind: 'unknown', reason }] }; }
  // Every way the line is its units in order, a space between; two at most (one is the answer, two is ambiguous).
  private ways(key: string, units: readonly Unit[]): Unit[][] {
    return this.walk({ key, units, memo: new Map() }, 0);
  }
  private walk(o: { key: string; units: readonly Unit[]; memo: Map<number, Unit[][]> }, i: number): Unit[][] {
    const { key, units, memo } = o;
    if (i === key.length) { return [[]]; }
    const kept = memo.get(i);
    if (kept) { return kept; }
    const out: Unit[][] = [], seen = new Set<string>();
    for (const u of units) {
      const end = i + u.key.length;
      if (!key.startsWith(u.key, i) || (end < key.length && key[end] !== ' ')) { continue; }
      for (const rest of this.walk(o, end === key.length ? end : end + 1)) {
        const way = [u, ...rest], id = way.map(x => ReviewProvenance.name(x.source)).join('+');
        if (!seen.has(id) && out.length < 4) { seen.add(id); out.push(way); }
      }
    }
    memo.set(i, out);
    return out;
  }
  // A choice: the declaration whose command it is (a Topic, an Action, the rules' own acts by their schema), or the
  // engine's, for what is no world act (talking to someone, an aim followed, a journey by road).
  choice(o: Offered): Found {
    if (o.id.startsWith('talk:')) { return { exact: 'producer', sources: [{ kind: 'engine', producer: 'talk' }, this.kyr(o.id.slice(5), 'person')] }; }
    if (o.id.startsWith('follow:')) { return { exact: 'producer', sources: [{ kind: 'engine', producer: 'follow' }] }; }
    if (o.id.startsWith('travel:')) {
      return { exact: 'producer', sources: [{ kind: 'engine', producer: 'travel' }, this.kyr(o.id.slice(7), 'destination')] };
    }
    if (/#talk$/.test(o.id)) { return { exact: 'producer', sources: [{ kind: 'engine', producer: 'talk' }, this.kyr(o.id.split('#')[0]!, 'person')] }; }
    if (o.id === 'again' || /^company\//.test(o.id)) { return { exact: 'producer', sources: [{ kind: 'engine', producer: o.id.split(':')[0]! }] }; }
    const op = this.campaign.operator(o.id), schema = op?.schema ?? op?.id ?? /^(\w+)(\(|$)/.exec(o.id)?.[1];
    if (!schema || !this.types.has(schema)) { return this.unknown(`no declaration of the command ${o.id}`); }
    return { exact: 'exact', sources: [this.kyr(schema, 'command')] };
  }
  private static engine(producer: string): SourceRef { return { kind: 'engine', producer }; }
  private static exactness(sources: readonly SourceRef[]): Exactness {
    return sources.every(s => s.kind === 'template' || (s.kind === 'kyr' && s.via !== 'says')) ? 'exact' : 'producer';
  }
  static name(s: SourceRef): string {
    switch (s.kind) {
      case 'kyr': return `${s.type ?? 'kyr'} ${s.declaration}`;
      case 'template': return `${s.table}:${s.entry}`;
      case 'engine': return `engine ${s.producer}`;
      default: return `unknown (${s.reason})`;
    }
  }
  private static same(a: SourceRef, b: SourceRef): boolean { return JSON.stringify(a) === JSON.stringify(b); }
  // Words as compared: the stress marks gone, quotes and dashes straight, spacing single.
  static key(text: string): string {
    return Typography.plain(text).replace(/[‘’]/g, '\'').replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
  }
}
