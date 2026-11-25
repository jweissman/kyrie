import { EntityIndex } from '../lang/entity-index';
import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';
import type { World } from '../lang/world';
import type { Campaign, CampaignEvent } from '../campaign/campaign';
import type { PlayerSnapshot } from './player-view';
import { VisitedPlaces } from './visited-places';
import { Outcome } from './outcome';
import { QueryIndex } from '../lang/query-index';

// What the company knows, and how: seen with its own eyes, found in a source, read, or heard from someone; and when
// it learned it.
export class CompanyKnowledge {
  static of(campaign: Campaign, actor: string, labels: Map<string, string>): PlayerSnapshot['knowledge'] {
    const world = campaign.world, learned = this.learned(campaign, actor), reached = this.reached(campaign, actor);
    // A fact with no words is a mark an author keeps (the brother knelt by the cart), not something to be told.
    // Nor what is over (stale: what was so and is no longer), let go from the Notes as the aims it gave are: a lead
    // spent (the notice whose jobs are all paid: FH-05, see Undertakings.leads), and as much a mended gate's failing,
    // a drover freed held, the salt-pans fuelled going cold (FH-25).
    // Nor a wonder met (OR-440): its discovery is known and kept, but the thing is told where it stands, not carried as
    // a note (the first day's load, FH-25); the Book's own place for the wonders met is OR-460.
    const spent = CompanyKnowledge.over(world);
    const wonders = new Set(world.relates('wonder') ? world.related('wonder').map(r => r.args[1]!) : []);
    const known = EntityIndex.of(campaign.module.entities).ordered(world.related('knows', actor).map(r => r.args[1]!))
      .filter(e => e.name && !spent.has(e.id) && !wonders.has(e.id));
    return known.map(e => {
      const told = world.related('toldBy', actor).find(r => r.args[2] === e.id);
      const found = world.related('learnedFrom', actor).find(r => r.args[2] === e.id);
      const seen = CompanyKnowledge.holds(world, 'witnessed', actor, e.id),
        read = CompanyKnowledge.holds(world, 'readIn', actor, e.id);
      const by = learned.get(e.id);
      const own = !seen && !found && !read && !told && by ? this.own(campaign, by.action, e.id) : undefined;
      const source = seen ? 'seen' as const : found ? 'found' as const : read ? 'read' as const : told ? 'heard' as const
        : own?.source;
      const writing = read ? campaign.module.observations?.find(o => o.teaches === e.id && o.aspect === 'reading')?.about
        : undefined;
      const from = found ? labels.get(found.args[1]!) : read && writing ? labels.get(writing)
        : told ? labels.get(told.args[1]!) : own?.from ? labels.get(own.from) : undefined;
      return { id: e.id, text: ObservationText.render(e.name, world), ...source ? { source } : {},
        ...told && (seen || found || read || reached.has(e.id) || this.borne(world, actor, e.id))
          ? { confirmed: true as const } : {},
        ...from ? { from } : {}, ...by ? { at: by.at } : {} };
    });
  }
  // What was learnt in play by an act that names no source of its own (no witnessing, no telling written for it): the
  // company's own deed, when the act itself made it so (its record: see Outcome); told, when the act
  // was asking someone, by them; otherwise found by the company itself (the notice on the well-post read). It had been
  // filed as known before the company set out (NAR-12: notes knowing what nobody said), and a deed done for someone
  // as their telling ("the wagoner told you" that you got him out of the ditch: NP-03).
  private static own(campaign: Campaign, action: string, fact: string)
    : { source: 'did' | 'heard' | 'seen'; from?: string } {
    const op = campaign.operator(action), speaker = op?.speaker ?? op?.bindings?.informant;
    const did = (op?.success ?? []).some(c => c.kind === 'assert' && !Outcome.learnt.has(c.call.name)
      && c.call.args.includes(fact));
    return did ? { source: 'did' } : speaker ? { source: 'heard', from: speaker } : { source: 'seen' };
  }
  // What is over: every fact the world marks stale (data/rules/discovery.kyr: stale), the spent leads among them.
  static over(world: World): Set<string> {
    return world.relates('stale') ? new Set(world.related('stale').map(r => r.args[0]!)) : new Set();
  }
  // When the company learned each thing it knows, from the log: read once, and then only what the log has added since
  // (a log cut back, by a command undone, is read again).
  private static readonly learnt = new WeakMap<readonly CampaignEvent[],
    { actor: string; read: number; last?: CampaignEvent; learned: Map<string, { at: number; action: string }> }>();
  private static learned(campaign: Campaign, actor: string): Map<string, { at: number; action: string }> {
    const log = campaign.history;
    let kept = this.learnt.get(log);
    if (!kept || kept.actor !== actor || kept.read > log.length || log[kept.read - 1] !== kept.last) {
      kept = { actor, read: 0, learned: new Map() }; this.learnt.set(log, kept);
    }
    for (; kept.read < log.length; kept.read++) {
      const e = log[kept.read]!;
      for (const c of e.changes) {
        const m = /^\+ knows\(([^,]+), ([^)]+)\)$/.exec(c);
        if (m && m[1] === actor && !kept.learned.has(m[2]!)) {
          kept.learned.set(m[2]!, { at: e.elapsed, action: e.action });
        }
      }
    }
    kept.last = log[kept.read - 1];
    return kept.learned;
  }
  // Whether what a fact told of, and showed (a thing or a way hidden until it was known), is since in the company's
  // hands or under its feet: heard of and since taken, it is not "heard, not yet seen" (the dyke-reeve's rod). So with
  // a place it led to, once the company has been there (the hobs' hold, heard of at the bell-frame and come to).
  private static borne(world: World, actor: string, fact: string): boolean {
    const shown = world.relates('revealedBy') && world.related('revealedBy').some(r => r.args[1] === fact
      && (this.asks(world, 'carries', actor, r.args[0]!) || this.holds(world, 'tookWay', actor, r.args[0]!)));
    return shown || (world.relates('leadsTo') && world.related('leadsTo')
      .some(r => r.args[0] === fact && this.holds(world, 'been', actor, r.args[1]!)));
  }
  // The facts that lead somewhere the company has since been (leadsTo): heard of a grassed mound north of the fells,
  // and come to it, it is borne out, not "heard, not yet seen" (Friday's surprise, as you were told). Where it has
  // been is read from the log, so a place come to counts and a place only put on the map does not.
  private static reached(campaign: Campaign, actor: string): Set<string> {
    const world = campaign.world;
    if (!world.relates('leadsTo')) { return new Set(); }
    const been = VisitedPlaces.of(campaign, actor);
    return new Set(world.related('leadsTo').filter(r => been.has(r.args[1]!)).map(r => r.args[0]!));
  }
  // A query (carries) as well as a relation.
  private static asks(world: World, name: string, ...args: string[]): boolean {
    return !!QueryIndex.of(world.module, name) && world.test(ModuleWriter.call(name, ...args));
  }
  private static holds(world: World, name: string, ...args: string[]): boolean {
    return world.relates(name) && world.test(ModuleWriter.call(name, ...args));
  }
}
