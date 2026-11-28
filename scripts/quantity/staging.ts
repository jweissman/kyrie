import type { PlaySession } from '../../src/session/play-session';
import { ScreenModel } from '../../src/ui/screen-model';

// The five expeditions' company made ready to go down (OR-1920): what it buys in the town, what it keeps, and the
// stair below the woods, the secure way in (data/generation/town/below.kyrt), made ready to go on from as a player
// reading the page there does: the ledge searched (an earlier party's cache under a slab: a lantern, its oil, food, a
// rope), and the one who waits on it, come down alone and not going on alone, asked and taken on for their fee.
// AGENTS.md's first dungeon has "a companion to recruit there, and gear to find near a secure entry"; the careful
// company had walked past both on every expedition of every reference life, and s0's, two and without a healer, came
// home from the first fight below on its third, fourth and fifth. Kept apart from the delver's own policy
// (expeditions.ts), so that each can change alone.
export interface Stager {
  act(s: PlaySession, id?: string): Promise<unknown>; ids(s: PlaySession): string[];
  walk(s: PlaySession, to: string): Promise<void>;
}
export class QuantityStaging {
  static readonly stair = 'region__s1_ud';
  static readonly waiting = 'region__s1_ud_waiting';
  // The gear the company goes down with, never sold (the jar of noonlight the halls' bane, OR-1620; the cloth, herbs
  // and draught it mends a hurt with below).
  static readonly kept = new RegExp('^(torch|candle|rations|oil_firebomb|longsword|chainmail|pole|rope|lamp_oil|lantern'
    + '|noonlight|bandages|herbs|minor_healing_potion)$');
  // What it buys in the town, as the purse allows, by who sells it, cheapest want first: at the house, a draught (a
  // minor potion of healing, eighteen) once it can pay for one; at the shop, two torches, a ration, cloth to bind two
  // hurts below (bandages, a coin each: the cheapest mending the town sells, within reach of a poor company), and a
  // firebomb. The shop last, where the company sets out from.
  static readonly buys: readonly (readonly [string, string, number])[] = [['region__s1_taproom', 'minor_healing_potion', 1],
    ['region__s1_shop', 'torch', 2], ['region__s1_shop', 'rations', 1], ['region__s1_shop', 'bandages', 2],
    ['region__s1_shop', 'oil_firebomb', 1]];
  static async buy(s: PlaySession, d: Stager): Promise<void> {
    for (const [room, kind, want] of this.buys) {
      if (this.count(s, kind) >= want || !this.affords(s, kind)) { continue; }
      await d.walk(s, room);
      while (this.count(s, kind) < want) {
        const buy = d.ids(s).find(id => id.startsWith('buy_item(') && id.includes(`_${kind}_`));
        if (!buy || !await d.act(s, buy)) { break; }
      }
    }
    await d.walk(s, 'region__s1_shop');
  }
  // How many of a kind the company carries; whether the purse holds its price where it is sold in the town.
  private static count(s: PlaySession, kind: string): number {
    const w = s.campaign.world;
    return w.related('ownedItem').filter(r => (/region__member_party|region__party/.test(r.args[1]!) || r.args[1] === 'party')
      && w.one('itemKind', r.args[0]!) === kind).length;
  }
  private static affords(s: PlaySession, kind: string): boolean {
    const w = s.campaign.world, gold = w.number({ kind: 'call', name: 'quantity', args: ['party', 'gold'] });
    return w.related('soldBy').some(r => r.args[1]!.startsWith('region__s1_') && w.one('itemKind', r.args[0]!) === kind
      && w.test({ kind: 'call', name: 'forSale', args: [r.args[0]!] })
      && w.number({ kind: 'call', name: 'price', args: [r.args[0]!] }) <= gold);
  }
  // Whether there is anything at the stair still to do: its ledge not yet searched, or the one waiting there still
  // waiting, and the company able to pay them.
  static wanted(s: PlaySession): boolean {
    const w = s.campaign.world;
    return !w.test({ kind: 'call', name: 'searched', args: ['party', this.stair] }) || this.hireable(s);
  }
  private static hireable(s: PlaySession): boolean {
    const w = s.campaign.world, gold = w.number({ kind: 'call', name: 'quantity', args: ['party', 'gold'] });
    return w.one('at', this.waiting) === this.stair && gold >= w.number({ kind: 'call', name: 'hire', args: [this.waiting] });
  }
  // Gone to the stair where there is something there still to do, and done: a light lit to search by, the ledge
  // searched, the one waiting asked, and taken on.
  static async stage(s: PlaySession, d: Stager): Promise<void> {
    if (!this.wanted(s)) { return; }
    if (s.campaign.world.one('at', 'party') !== this.stair) { await d.walk(s, this.stair); }
    const tried = new Set<string>();
    for (let i = 0; i < 4 && s.campaign.world.one('at', 'party') === this.stair; i++) {
      const id = this.staged(d.ids(s), s.campaign.world.test({ kind: 'call', name: 'benighted', args: ['party'] }), tried);
      if (!id) { return; }
      tried.add(id);
      await d.act(s, id);
    }
  }
  // The next of it the page offers at the stair (ids, its rows; dark, whether the company has no light here).
  static staged(ids: readonly string[], dark: boolean, tried: ReadonlySet<string> = new Set()): string | undefined {
    const verbs = [...dark ? ['light_item('] : [], `search(${this.stair})`, `${this.waiting}_ask`, 'recruit('];
    for (const verb of verbs) {
      const id = ids.find(x => x.startsWith(verb) && !tried.has(x) && (verb !== 'recruit(' || x.includes(this.waiting)));
      if (id) { return id; }
    }
    return undefined;
  }
  // What the page offers to bind a hurt with (ids, its rows), on whoever is worst hurt (member: their id, as a command
  // ends with it): a dose used (bandages, herbs, a draught).
  static dose(ids: readonly string[], member: string): string | undefined {
    return ids.find(id => id.startsWith('use_item(') && id.endsWith(`member_${member})`));
  }
  // Whether anyone of the company is ready for a level, as its sheet says ("Ready for level 2: a night under a roof"):
  // a level is gained only at a sheltered rest, and a company that rested only when hurt had gone down a fifth time at
  // the first level, its experience for a second long since earned (s4: three ghouls of the third rank on its fourth).
  static rising(s: PlaySession): boolean {
    return ScreenModel.build(s.campaign).party.some(m => m.hp > 0 && m.toward?.ready === true);
  }
}
