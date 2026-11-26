import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { KyrLint } from '../src/cli/kyr-lint';
import type { BundleSource } from '../src/campaign/bundle-source';

// The kx-1 authorability experiment (KX-01, doc/architecture/reviews/kyr-authorability-2026-11-19.md), its boundary
// crossed by typed exports (KX-03): a kind of thing of no kind the catalog has, the lodestar chip, declared in Kyr
// (test/fixtures/kx-lodestar/lodestar), which exports the kind's vocabulary, tunedTo as a relation and leanings as a
// measure; five chips of it, of which Deem lays three on the Long Man's green, each named, tuned and charged by the
// seed (chips); and a separate scenario, a pedlar, with a chip of his own (pedlar). Each of the two declares the
// vocabulary as lodestar does and imports it in its manifest, bound by the campaign to lodestar's (lodestar.tunedTo),
// as an entity is imported: an explicit edge, in place of kx-1's `shared` mark (a name shared by all).
const root = 'test/fixtures/kx-lodestar';
const [tuned, leanings] = ['lodestar__tunedTo', 'lodestar__leanings'];
const campaign = `${root}/kx.campaign.json`;
const chips = ['a', 'b', 'c', 'd', 'e'].map(c => `chips__chip_${c}`);
const homes = ['grey', 'red', 'black'].map(h => `chips__${h}_home`);
class Lodestar {
  static start(seed: string, source: BundleSource = NodeBundleSource.shared, from = campaign) {
    return PlaySession.start(from, seed, source);
  }
  static holds(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static number(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.number(ModuleWriter.call(name, ...args));
  }
  static offered(s: PlaySession, pattern: RegExp) {
    return s.campaign.offered().map(o => o.id).filter(i => pattern.test(i));
  }
  static async play(s: PlaySession, pattern: RegExp) {
    const [id] = this.offered(s, pattern);
    if (!id) { throw new Error(`Nothing offered like ${pattern}`); }
    return s.leg(id);
  }
  static name(s: PlaySession, id: string) { return s.campaign.world.module.entities.find(e => e.id === id)?.name; }
  static holder(s: PlaySession, id: string) {
    return s.campaign.readout.creatures.filter(c => (c.state.inventory ?? []).some(i => i.id === id)).map(c => c.name);
  }
  // What a seed lays on the green: each chip there, with its name, its stone and its leanings.
  static laid(s: PlaySession) {
    return chips.filter(c => this.holds(s, 'at', c, 'longman__green')).map(c => ({ id: c, name: this.name(s, c),
      home: homes.find(h => this.holds(s, tuned, c, h)), leanings: this.number(s, leanings, c) }));
  }
}

describe('kx-lodestar: a kind of thing of its own, generated, placed, used and reused by content alone', () => {
  it('is read without error, and is a kind of the catalog while its campaign is played', async () => {
    const findings = await KyrLint.campaign(campaign, new NodeBundleSource());
    expect(findings.filter(f => f.level === 'error')).toEqual([]);
    const session = await Lodestar.start('a'), chip = session.campaign.catalog.definition('lodestar_chip');
    expect(chip).toMatchObject({ category: 'gear', value: 6, name: 'a lodestar chip' });
    expect(chip?.source?.notes).toContain('lodestar');
  }, 120000);

  it('lays three distinct chips by Deem, by the seed and the same again for the same seed', async () => {
    const first = Lodestar.laid(await Lodestar.start('a')), again = Lodestar.laid(await Lodestar.start('a'));
    const other = Lodestar.laid(await Lodestar.start('b'));
    expect(again).toEqual(first);
    for (const laid of [first, other]) {
      expect(laid).toHaveLength(3);
      expect(new Set(laid.map(c => c.name)).size).toBe(3);
      for (const c of laid) {
        expect(c.name).toMatch(/^a lodestar chip of /);
        expect(homes).toContain(c.home!);
        expect(c.leanings).toBeGreaterThanOrEqual(1); expect(c.leanings).toBeLessThanOrEqual(3);
      }
    }
    expect(other).not.toEqual(first);
  }, 120000);

  it('is taken, handed on, followed to its stone, sold, and kept across a save', async () => {
    const s = await Lodestar.start('a');
    await Lodestar.play(s, /^go\(party,longman__south_road,/);
    const [chip] = Lodestar.laid(s), id = chip!.id;
    await Lodestar.play(s, new RegExp(`^take_item\\(party,${id},lodestar_chip,longman__member_party_1,`));
    expect(Lodestar.holder(s, id)).toEqual(['Elen']);
    await Lodestar.play(s, new RegExp(`^transfer_item\\(party,${id},longman__member_party_1,longman__member_party_2\\)`));
    expect(Lodestar.holder(s, id)).toEqual(['Bran']);
    // Its use: the stone it leans to is known, the way to it is open, and it has one leaning fewer.
    const home = chip!.home!, way = home.replace('_home', '_path');
    expect(Lodestar.offered(s, new RegExp(`^go\\(party,${way},`))).toEqual([]);
    const leaned = await Lodestar.play(s, new RegExp(`^lodestar__follow_lean\\(party,${id},`));
    expect(leaned.response).toContain('leans one way');
    expect(Lodestar.holds(s, 'knows', 'party', home)).toBe(true);
    expect(Lodestar.number(s, leanings, id)).toBe(chip!.leanings - 1);
    expect(Lodestar.offered(s, new RegExp(`^go\\(party,${way},`))).toHaveLength(1);
    expect(Lodestar.offered(s, new RegExp(`^lodestar__follow_lean\\(party,${id},`))).toEqual([]);
    // Kept as it was, in Bran's hands, across a save and its reading again.
    const resumed = PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())));
    expect([Lodestar.holder(resumed, id), Lodestar.number(resumed, leanings, id)])
      .toEqual([['Bran'], chip!.leanings - 1]);
    // Sold to one who buys them, as any thing is.
    const gold = Lodestar.number(s, 'quantity', 'party', 'gold');
    await Lodestar.play(s, new RegExp(`^sell\\(party,${id},lodestar_chip,longman__member_party_2,pedlar__pedlar,`));
    expect(Lodestar.holder(s, id)).toEqual([]);
    expect(Lodestar.number(s, 'quantity', 'party', 'gold')).toBe(gold + 4);
  }, 120000);

  it('is used by a separate scenario as it is written: the pedlar\'s chip is given, and leans by the one action', async () => {
    const s = await Lodestar.start('a');
    await Lodestar.play(s, /^go\(party,longman__south_road,/);
    await Lodestar.play(s, /^pedlar__chip_gift\(/);
    expect(Lodestar.holder(s, 'pedlar__pedlar_chip')).toHaveLength(1);
    // The kind's own action, not a copy of it the pedlar brought.
    expect(Lodestar.offered(s, /follow_lean\(party,pedlar__pedlar_chip,/))
      .toEqual([expect.stringMatching(/^lodestar__follow_lean\(party,pedlar__pedlar_chip,\w+,pedlar__chert_home\)$/)]);
    await Lodestar.play(s, /^lodestar__follow_lean\(party,pedlar__pedlar_chip,/);
    expect(Lodestar.holds(s, 'knows', 'party', 'pedlar__chert_home')).toBe(true);
    expect(Lodestar.number(s, leanings, 'pedlar__pedlar_chip')).toBe(1);
  }, 120000);

  // The boundary: not imported, what the pedlar says of his chip is his module's own (pedlar__tunedTo), and the
  // kind's action never sees it; imported but declared otherwise than lodestar declares it, the campaign is refused.
  const files = (...names: string[]) => Object.fromEntries(names.map(n => [`${root}/${n}`, readFileSync(`${root}/${n}`,
    'utf8')]));
  const over = (texts: Record<string, string>) => new OverlayBundleSource(NodeBundleSource.shared, texts);
  it('fails at the boundary without the import, and refuses one declared another way', async () => {
    const was = files('pedlar/pedlar.kyr', 'pedlar/module.json');
    const manifest = was[`${root}/pedlar/module.json`]!, unimported = manifest.replace(', "tunedTo", "leanings"', '');
    expect(unimported).not.toBe(manifest);
    // kx-alone.campaign.json: the same campaign, the pedlar's request binding only the party and the green.
    const s = await Lodestar.start('a', over({ [`${root}/pedlar/module.json`]: unimported }),
      `${root}/kx-alone.campaign.json`);
    await Lodestar.play(s, /^go\(party,longman__south_road,/);
    await Lodestar.play(s, /^pedlar__chip_gift\(/);
    expect(Lodestar.holds(s, 'pedlar__tunedTo', 'pedlar__pedlar_chip', 'pedlar__chert_home')).toBe(true);
    expect(Lodestar.offered(s, /follow_lean\(party,pedlar__pedlar_chip,/)).toEqual([]);
    const pedlar = was[`${root}/pedlar/pedlar.kyr`]!;
    const crossed = pedlar.replace('Relation tunedTo(item, fact).', 'Relation tunedTo(item, place).')
      .replace('Initially Assert tunedTo(pedlar_chip, chert_home).', 'Initially Assert tunedTo(pedlar_chip, chert_pit).');
    expect(crossed).not.toBe(pedlar);
    await expect(Lodestar.start('a', over({ [`${root}/pedlar/pedlar.kyr`]: crossed })))
      .rejects.toThrow(/lodestar__tunedTo is imported as \(item, place\) but declared \(item, fact\)/);
  }, 120000);
});
