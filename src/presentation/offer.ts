import { Headings } from '../ui/headings';
import { Promotion, type Candidate, type Kind } from '../ui/promotion';
import type { Campaign } from '../campaign/campaign';
import type { Screen } from '../ui/screen-types';
import { Patience } from '../ui/patience';
import { PlayerFrame } from './player-frame';
import { Aspects } from './aspects';
import { PileLead } from './pile-lead';
import type { Aspect, Mark, Promoted } from './glance-types';

// The kinds of act a player is offered, few enough to read at a glance (the owner, 14 November: a taxonomy of ten or
// twelve, at most one of each promoted): speaking, fighting, doing something to someone or something, searching,
// going a way, setting out on a journey, lighting, waiting (or resting, or camping), caring for the company (eating,
// tending), studying, and anything else.
export type ActType = 'talk' | 'fight' | 'act' | 'search' | 'go' | 'journey' | 'light' | 'wait' | 'care' | 'study'
  | 'other';
// One choice offered: the page's own id for it, the command it does, its words, its type, what it is to the company
// (its aspects, as Emphasis draws them; gold only where it continues the aim followed), and what it risks.
// for: of an opener (a talk), what it is led for within it (Promoted.for), which a headless player does by it.
export interface Offered {
  choice: string; command?: string; for?: string; label: string; type: ActType; aspects: Aspect[]; marks: Mark[];
  continues?: true; minutes?: number; bearing?: Bearing;
  // Within an opener, the act each of its reasons is for (Promotion.inside), as the four's are: what it is drawn as is
  // borne by a row inside it, or by none (AT-07 I2).
  inside?: Promoted['inside'];
}
// A way's bearing in a site (see Offers.borne).
export type Bearing = 'frontier' | 'retreat' | 'return';
// What a surface offers: exactly four primary choices where there are four or more to be had (never filler where
// there are fewer), and every other one in the rest, kept for one deliberate step further (all, More, a lens).
export interface Offer { primary: Offered[]; rest: Offered[] }

// One attention hierarchy for every surface and both clients (the owner, 14 November: four promoted everywhere, the
// rest reachable, the terminal and the page agreeing on which four and what they mean). The scene's four are the acts
// the place leads with for their reasons (Promotion.pick: the urgent, the aim, the company's needs, the place's own),
// then, toward four, its leading way and the best of the rest that have a reason, by the scene's order, each of a type
// not yet shown, so that the four are different things to do; fewer, where fewer have a reason. A surface of its
// own (creation's cards, a talk's questions, a fight's hand) ranks its own, and is offered alike (Offers.ranked).
export class Offers {
  static readonly four = 4;
  static readonly types: Record<Kind, ActType> = { talk: 'talk', attack: 'fight', act: 'act', search: 'search',
    way: 'go', step: 'go', travel: 'journey', light: 'light', wait: 'wait', rest: 'wait', camp: 'wait', eat: 'care',
    tend: 'care', study: 'study', other: 'other' };
  // out: at the followed aim's place, the ways that leave it (see AimBusiness): with a grave choice there, that choice
  // is promoted after what is urgent, and the way out, never gilded, after it.
  // screen: where the company stands; in a site or under the ground, each way is told by its bearing (frontier,
  // retreat, return).
  static scene(acts: Promoted[], ways: string[], cands: Candidate[],
    { campaign, out, screen }: { campaign?: Campaign; out?: Set<string>; screen?: Screen } = {}): Offer {
    const live = [...cands.filter(c => !c.barred), ...this.besides(cands, campaign, screen?.warned)];
    const byChoice = new Map(live.map(c => [c.choice, c]));
    // What an opener led with holds (the speaking door's words, read in its focus) is not led loose beside it: two of
    // the riddle's four answers had stood in the four, the riddle nowhere (the owner, 18 November, CL-34).
    const held = new Set(acts.flatMap(a => byChoice.get(a.choice)?.holds ?? []));
    const graves = out ? live.filter(c => c.marks.some(m => m.kind === 'grave') && !held.has(c.command ?? '')) : [];
    const leaves = new Set(graves.length ? acts.filter(a => out!.has(byChoice.get(a.choice)?.exit ?? '')).map(a => a.choice)
      : []);
    const piled = PileLead.of(acts.map(a => this.promoted(a, byChoice.get(a.choice))).map(o => leaves.has(o.choice)
      ? this.ungilded(o) : o), live, campaign, c => this.candidate(c)), promoted = piled.promoted;
    for (const h of piled.held) { held.add(h); }
    const led = [...promoted.filter(o => !leaves.has(o.choice)), ...graves.map(c => this.candidate(c)),
      ...promoted.filter(o => leaves.has(o.choice))]
      .filter((o, i, all) => all.findIndex(x => x.choice === o.choice) === i);
    const shown = new Set(led.map(o => o.choice)), types = new Set(led.map(o => o.type));
    // Then the leading way, then the rest in the scene's order: each of a type the four do not yet hold.
    const order = [...ways.flatMap(w => byChoice.get(w) ?? []), ...[...live].sort((a, b) => a.order - b.order)];
    const acted = led.some(o => !['talk', 'go', 'journey'].includes(o.type));
    const fill: Offered[] = [], waitsOnly = live.filter(c => this.types[c.kind] !== 'other' || c.whys.length)
      .every(c => this.types[c.kind] === 'wait');
    const bare = !led.length && !live.some(c => c.whys.length);
    // A way into another hex is the map's (the owner, 25 November): never a filler of the four, which would open the
    // map beside the map's own row ("Open the map" and "Open the world map" on one landing); only what leads there.
    const crossing = new Set(screen?.exits.filter(e => e.crosses).map(e => e.id) ?? []);
    // Of a kind not yet shown first; and where the scene has fewer than four kinds, the next of any (four waits in a
    // bare loft are four choices, not one).
    for (const distinct of [true, false]) {
      for (const c of order) {
        if (led.length + fill.length >= this.four) { break; }
        const type = this.types[c.kind];
        // The company's own upkeep (gear, preparing spells) with no reason here never fills the four: two of the
        // four at a keep's door had been "Have Cyril prepare Cure Light Wounds in place of Charm Person".
        const upkeep = type === 'other' && !c.whys.length;
        // A second wait beside the first is the same choice told twice ("Wait", "Wait an hour": M22's review), its
        // lengths the Wait lens's; only where waiting is all there is to do are the waits the four.
        const again = !distinct && type === 'wait' && types.has('wait') && !waitsOnly;
        // Nor, beside an act the place is led with, a way for no more than being untaken, as Promotion holds it: "To
        // the taproom of the Stone Horn" had filled the four at the customs-house, beside Bran's line to read, from
        // the third turn on (cold plays 2 and 3, CL-25).
        const idle = (type === 'go' || type === 'journey') && c.whys.length > 0
          && c.whys.every(w => w === 'unvisited') && acted;
        // Nor anything with no reason to be led here: fewer than four rather than filler (GRAMMAR: "none is made up").
        // A quarter of the four's rows had been reasonless, daylight torches and plain waits among them, and a reasoned
        // act a cap passed over had given way to "Wait a while" (the atlas study, §2.4 and §5.3: AT-01). Only where
        // waiting is all there is to do, or nothing here has a reason at all (a bare loft), is a wait the four's. The
        // leading way is the glance's own (Glance.ways: the way on, or back in, PL-26).
        const reasonless = !c.whys.length && !waitsOnly && !(bare && type === 'wait') && !ways.includes(c.choice);
        if (shown.has(c.choice) || (distinct && types.has(type)) || upkeep || again || idle || reasonless
          || crossing.has(c.choice)
          || held.has(c.command ?? '')) { continue; }
        // The ways of one choice side by side, or none of them (OR-242; see Alternatives).
        const choice = this.together(c, byChoice);
        if (!choice || led.length + fill.length + choice.length > this.four) { continue; }
        for (const w of choice) { fill.push(this.candidate(w)); shown.add(w.choice); }
        types.add(type);
      }
    }
    // What was led past the four is the rest's, not lost: the Guldríce agent's one question, led fifth on the landing
    // once the hand on the green was led before it, had been offered nowhere, nor the notice on the well-post (MT-15).
    const primary = [...led, ...fill].slice(0, this.four), kept = new Set(primary.map(o => o.choice));
    const rest = this.once(live.filter(c => !kept.has(c.choice)), [...kept])
      .sort((a, b) => this.rank(a) - this.rank(b) || a.order - b.order).map(c => this.candidate(c));
    // A site, or under the ground (a town's undertown is one too).
    const site = !!screen && (screen.path.some(p => p.kind === 'site') || !!screen.place.underground);
    const at = { site, ...out ? { out } : {} };
    const ctx = { twice: this.twice([...primary, ...rest]), byChoice, at,
      ...screen && campaign ? { land: { screen, campaign } } : {} };
    return { primary: primary.map(o => this.told(o, ctx)), rest: rest.map(o => this.told(o, ctx)) };
  }
  // A candidate and the other ways of its choice, all to be had here; or it alone, of none (see Alternatives).
  private static together(c: Candidate, byChoice: Map<string, Candidate>): Candidate[] | undefined {
    const ways = c.together?.flatMap(id => byChoice.get(id) ?? []) ?? [c];
    return ways.length === (c.together?.length ?? 1) ? ways : undefined;
  }
  // Two ways worded alike are told apart by which way each lies ("Take the way across country to the woods of
  // Greenwood, north-east"): a cold player had met three such ways out of one stretch of wild country and could not
  // choose between them (CL-01; a census of three worlds found 28 labels said twice in one offer).
  private static told(o: Offered, c: { twice: Set<string>; byChoice: Map<string, Candidate>;
    at: { site: boolean; out?: Set<string> }; land?: { screen: Screen; campaign: Campaign } }): Offered {
    return this.borne(this.borneWay(o, c.twice.has(o.label) ? c.land : undefined), c.byChoice.get(o.choice), c.at);
  }
  // Each place gone to once: a journey to where a way from here already goes ("Set out for the shore of the Eastern
  // Ocean" beside "To the shore of the Eastern Ocean", "To the way into Scarth Holm" beside "Take the road to Scarth
  // Holm") is the same choice told twice (cold play 2, CL-07: a rest of 86, a dozen of them a destination again).
  private static once(rest: Candidate[], shown: string[]): Candidate[] {
    const ids = [...rest.flatMap(c => [c.choice, c.command ?? '']), ...shown];
    const there = new Set(ids.flatMap(id => /^go\([^,]+,([^)]+)\)$/.exec(id)?.[1] ?? []));
    return rest.filter(c => !there.has(Offers.journeyTo(c) ?? ''));
  }
  // Where a journey goes, where the candidate is one (travel:<place>).
  private static journeyTo(c: Candidate): string | undefined {
    return [c.command, c.choice].find(id => id?.startsWith('travel:'))?.slice('travel:'.length);
  }
  private static twice(all: Offered[]): Set<string> {
    const labels = all.map(o => o.label);
    return new Set(labels.filter((l, i) => labels.indexOf(l) !== i));
  }
  // A way said with which way it lies, where another is worded as it is (see twice).
  private static borneWay(o: Offered, at?: { screen: Screen; campaign: Campaign }): Offered {
    const to = at ? /^go\([^,]+,([^)]+)\)$/.exec(o.choice)?.[1] : undefined;
    const bearing = to && at ? Headings.bearing(at.campaign.module, at.screen.path, at.screen.place.id, to) : undefined;
    return bearing ? { ...o, label: `${o.label}, ${bearing}` } : o;
  }
  // In a site, a way's bearing, typed for every client to say as a small sign or a word (EX-02): the frontier, a way
  // not yet taken whose contents are not known (further in, or along); the retreat, the way the company came or out
  // of what the aim is about; the return, a way to somewhere been. Never a claim that the aim lies that way: gold
  // stays the aim's evidenced next step alone.
  private static borne(o: Offered, c: Candidate | undefined, at: { site: boolean; out?: Set<string> }): Offered {
    if (!at.site || !c?.exit || c.kind === 'act') { return o; }
    const bearing: Bearing = c.whys.includes('retreat') || at.out?.has(c.exit) ? 'retreat'
      : c.visited ? 'return' : 'frontier';
    return { ...o, bearing };
  }
  // A way out, offered without the aim's gold.
  private static ungilded({ continues: _, ...o }: Offered): Offered {
    return { ...o, aspects: o.aspects.filter(x => x !== 'undertaking') };
  }
  // Every other legal choice of the scene, which the page reaches through its likenesses and lenses rather than as an
  // act (talking to whoever is here, setting a thing down, lighting a torch by day): kept in the rest, by the kind of
  // its action, so that nothing the company can do is out of reach (and the terminal, which draws no likeness, can
  // offer talk among the four).
  private static besides(cands: Candidate[], campaign?: Campaign, warned?: Screen['warned']): Candidate[] {
    if (!campaign) { return []; }
    const had = new Set(cands.flatMap(c => [c.choice, c.command, ...Object.values(c.leaves ?? {})]));
    // Warned off as the page marks it (Marks.warned): whatever spends the last of their patience, a moment's take
    // among it (cold play 3, CL-12: "Collect a moonstone", unmarked in the four, brought the vault's keeper on).
    const toward = warned && new RegExp(`[(,]${warned.id}[,)]`);
    return PlayerFrame.of(campaign).rows.filter(r => !had.has(r.choice.id))
      .map((r, i) => ({ choice: r.choice.id, command: r.choice.id, label: r.choice.name,
        kind: this.kind(r.action.schema), whys: [], order: cands.length + i,
        marks: [...r.action.grave ? [{ kind: 'grave' as const, said: r.action.grave, ask: true }] : [],
          ...warned && !toward!.test(r.choice.id) && Math.max(r.action.minutes ?? 0, 1) >= warned.left
            ? [{ kind: 'warned' as const, said: Patience.note(warned.by) }] : []] }));
  }
  // The rest in an order by what each is, the scene's own order within: talk and ways and what is done here before
  // the company's own gear (setting a thing down, giving it across, packing it), which a town's rest had led with
  // (TP-06: 60 rows at the a1 camp, the terminal line's "junk drawer").
  static readonly ranks: readonly ActType[] = ['talk', 'go', 'journey', 'search', 'act', 'study', 'fight', 'light',
    'care', 'wait', 'other'];
  private static rank(c: Candidate): number { return this.ranks.indexOf(this.types[c.kind]); }
  private static readonly gear = new Set(['put_item', 'put_in', 'transfer_item', 'take_from', 'equip_item',
    'douse_light', 'prepare_spell']);
  private static kind(schema: string | undefined): Kind {
    const s = schema ?? '';
    if (this.gear.has(s)) { return 'other'; }
    return s === 'talk_to' ? 'talk' : s === 'attack' ? 'attack' : s.startsWith('wait') ? 'wait'
      : /^(camp|rest)/.test(s) ? 'rest' : s === 'search' ? 'search' : s === 'eat' ? 'eat' : /light|kindle/.test(s) ? 'light'
        : /^(go|travel|walk|enter|leave|climb|descend)/.test(s) ? 'way' : 'act';
  }
  // The journey set out on, at the head of the four (see Glance.held): what it put out of the four goes to the rest.
  static headed(offer: Offer, bound: Promoted): Offer {
    const head: Offered = { ...this.promoted(bound, undefined), type: 'journey' };
    const all = [head, ...offer.primary.filter(o => o.choice !== bound.choice)];
    return { primary: all.slice(0, this.four),
      rest: [...all.slice(this.four), ...offer.rest.filter(o => o.choice !== bound.choice)] };
  }
  // A surface's own choices, ranked by it best first: the first four, and the rest as they came.
  static ranked<T>(ranked: T[], offered: (t: T) => Offered): Offer {
    return { primary: ranked.slice(0, this.four).map(t => offered(t)),
      rest: ranked.slice(this.four).map(t => offered(t)) };
  }
  private static promoted(a: Promoted, c: Candidate | undefined): Offered {
    return { choice: a.choice, ...a.command ? { command: a.command } : {}, ...a.for ? { for: a.for } : {},
      label: a.label,
      type: c ? this.types[c.kind] : a.choice.startsWith('follow:') ? 'act' : 'other', aspects: a.aspects, marks: a.marks, ...a.continues ? { continues: true } : {},
      ...c?.minutes ? { minutes: c.minutes } : {} };
  }
  // A choice offered for no reason the place leads with: what it is to the company is its reasons' aspects, the aim's
  // gold aside (gold is only the followed aim's next step, which is among the acts).
  private static candidate(c: Candidate): Offered {
    const inside = Promotion.inside(c, c.whys);
    return { choice: c.choice, ...c.command ? { command: c.command } : {}, label: c.label, type: this.types[c.kind],
      ...inside.length ? { inside } : {},
      aspects: Aspects.of(c.whys, c.marks, c.visited === true, !!c.teaches).filter(a => a !== 'undertaking'), marks: c.marks,
      ...c.minutes ? { minutes: c.minutes } : {} };
  }
}
