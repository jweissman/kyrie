import type { Campaign } from '../campaign/campaign';
import { EntityIndex } from '../lang/entity-index';
import { ItemNames } from '../lang/item-names';
import { ModuleWriter } from '../lang/module-writer';
import { Means } from './means';
import { VisitedPlaces } from './visited-places';
import { Waits } from './waits';

// What shuts the company out of where its aim goes, met there already: a thing on the only known way that bars it
// (the muniment-press door, locked), that the company has stood before and has nothing to open (not one of its
// changes is a change the company is equipped for: the old key, lockwork, a crowbar). The World agent's walk of the
// first quarter hour (iscoed, a warrior, the reeve's receipt held up against the Hall's seal: OR-171): the library
// seen and the press found locked, the gold led from every place in the town back to the Hall, and at the Hall nothing
// was gold, forty times. As a keeper beyond the company is (Guarded), it is no step of the aim's, and the need says so.
// found: a thing of a kind it wants, in the world: where it lies, or, still hidden, who tells where (OR-172: the old
// press key on its nail behind the Hall kitchen's dresser, that Orla Pennick tells of).
export interface Found { item: string; at?: string; teller?: string; waits?: string; telling?: string }
export interface Shutting {
  bar: string; name: string; needs: string[]; from: { seller: string; kind: string }[]; found?: Found;
}
export class Shut {
  // ways: whether a way the company can take reaches the aim's place, and the places on the known way there, barred
  // ways and all (KnownWays, as AimContinuity.shut reads them).
  static of(campaign: Campaign, from: string, ways: { able: boolean; legs: string[] }): Shutting | undefined {
    const party = campaign.playerActor;
    if (!party || ways.able) { return undefined; }
    const been = VisitedPlaces.of(campaign, party);
    let at = from;
    for (const to of ways.legs) {
      const bar = Shut.bar(campaign, at, to);
      if (bar) { return been.has(at) ? Shut.wanting(campaign, party, bar) : undefined; }
      at = to;
    }
    return undefined;
  }
  // The thing that bars the known way, and the place before it, where the company has what opens it (the old press
  // key in hand, OR-172): that place, and then the thing, are the aim's step.
  static opens(campaign: Campaign, from: string, ways: { able: boolean; legs: string[] }):
    { bar: string; before: string } | undefined {
    const party = campaign.playerActor, w = campaign.world;
    if (!party || ways.able) { return undefined; }
    let at = from;
    for (const to of ways.legs) {
      const bar = Shut.bar(campaign, at, to);
      if (bar) {
        const state = w.one('state', bar);
        return w.related('changeOf').some(r => r.args[1] === bar && (!state
          || w.test(ModuleWriter.call('changeFrom', r.args[0]!, state)))
          && w.test(ModuleWriter.call('equippedFor', party, r.args[0]!))) ? { bar, before: at } : undefined;
      }
      at = to;
    }
    return undefined;
  }
  // What the company would need to change it, where it has none: its changes from the state it is in, each asking
  // something the company does not meet.
  private static wanting(campaign: Campaign, party: string, bar: string): Shutting | undefined {
    const w = campaign.world, state = w.one('state', bar);
    const changes = w.related('changeOf').filter(r => r.args[1] === bar).map(r => r.args[0]!)
      .filter(c => !state || w.test(ModuleWriter.call('changeFrom', c, state)));
    const needs = [...new Set(changes.flatMap(c => w.related('needs').filter(r => r.args[0] === c).map(r => r.args[1]!)))];
    if (!changes.length || changes.some(c => w.test(ModuleWriter.call('equippedFor', party, c)))) { return undefined; }
    const name = EntityIndex.of(campaign.module.entities).byId.get(bar)?.name ?? bar;
    const been = VisitedPlaces.of(campaign, party), found = Shut.found(campaign, party, needs);
    return { bar, name, needs, from: Means.sources(campaign, needs).filter(s => s.at && been.has(s.at))
      .map(s => ({ seller: s.seller, kind: s.kind })), ...found ? { found } : {} };
  }
  // A thing of a kind it wants that the world holds, not the company's: where it lies, seen; or, hidden until a fact is
  // known, whoever tells that fact (an act that asserts toldBy: a topic of theirs). Never one with neither.
  private static found(campaign: Campaign, party: string, kinds: string[]): Found | undefined {
    const w = campaign.world, items = w.relates('itemKind') ? w.related('itemKind')
      .filter(r => kinds.includes(r.args[1]!)).map(r => r.args[0]!) : [];
    // Not one on a shelf for sale (who sells it is said apart), nor anywhere the company has not been (AR-21).
    const been = VisitedPlaces.of(campaign, party);
    for (const item of items.filter(i => !w.test(ModuleWriter.call('forSale', i)))) {
      const fact = w.relates('revealedBy') ? w.one('revealedBy', item) : undefined, at = w.one('at', item);
      if (!at || at === party) { continue; }
      if (!fact || w.test(ModuleWriter.call('knows', party, fact))) {
        if (been.has(at)) { return { item, at }; }
        continue;
      }
      const telling = campaign.module.actions.find(o => (o.success ?? []).some(c => c.call?.name === 'toldBy'
        && c.call.args[2] === fact && !c.call.args[1]!.startsWith('?')));
      const teller = telling?.success?.flatMap(c => c.call?.name === 'toldBy' ? [c.call.args[1]!] : [])[0];
      if (!teller || !been.has(w.one('at', teller) ?? '')) { continue; }
      const waits = Waits.on(campaign, telling!);
      return { item, teller, telling: telling!.id, ...waits ? { waits } : {} };
    }
    return undefined;
  }
  // A thing on a way between two places, in a state that blocks it.
  private static bar(campaign: Campaign, from: string, to: string): string | undefined {
    const w = campaign.world, ways = new Set(w.related('connects').filter(l => l.args[1] === from && l.args[2] === to)
      .map(l => l.args[0]!));
    const on = w.relates('on') ? w.related('on').filter(r => ways.has(r.args[1]!)).map(r => r.args[0]!) : [];
    const blocks = w.relates('blocksWhen') ? w.related('blocksWhen') : [];
    return on.find(t => blocks.some(b => b.args[0] === t && w.test(ModuleWriter.call('state', t, b.args[1]!))));
  }
  // Said as a need: "The muniment-press door bars the way: it wants the old press key, lockwork or a crowbar, and
  // the company has none of them."
  static said(campaign: Campaign, s: Shutting): string {
    const byId = EntityIndex.of(campaign.module.entities).byId;
    const named = s.needs.map(n => Means.item(campaign.catalog, n)
      ? ItemNames.called(Means.item(campaign.catalog, n)!)
      : (byId.get(n)?.name ?? n.replace(/_/g, ' ')).toLowerCase());
    const list = named.length > 1 ? `${named.slice(0, -1).join(', ')} or ${named.at(-1)}` : named[0] ?? 'what opens it';
    const f = s.found, thing = f && byId.get(f.item)?.name;
    if (f && thing) {
      const first = f.waits ? `, once ${byId.get(f.waits)?.name ?? f.waits} are seen to` : '';
      const by = f.teller ? `${Shut.upper(byId.get(f.teller)?.name ?? f.teller)} knows where ${thing} is${first}`
        : `${Shut.upper(thing)} lies in ${byId.get(f.at!)?.name ?? f.at}`;
      return `${Shut.upper(s.name)} bars the way: it wants ${list}. ${by}.`;
    }
    const who = s.from[0] && (byId.get(s.from[0].seller)?.name ?? s.from[0].seller);
    const sold = s.from[0] && `; ${who!.includes(',') ? `${who},` : who} sells ${
      ItemNames.called(Means.item(campaign.catalog, s.from[0].kind) ?? s.from[0].kind)}`;
    return `${Shut.upper(s.name)} bars the way: it wants ${list}, and the company has none`
      + ` of them${sold ?? ''}.`;
  }
  private static upper(x: string): string { return `${x.charAt(0).toUpperCase()}${x.slice(1)}`; }
}
