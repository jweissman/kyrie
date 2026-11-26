import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../src/campaign/overlay-bundle-source';
import { ModuleBundle } from '../../src/campaign/module-bundle';

// Two modules of one campaign each giving a kind of their own the same name, two meanings (OR-540: the debt's
// generated purse_kind, a purse for the creditor, and the Lull's, Haskett's wages, met when the Lull was drawn as the
// next country of kite, and its install was refused). A module's own kind is its installation's, as its places are:
// the first keeps the name, and one another module has given to something else is the later installation's own,
// under its installation's name; each module's acts read its own.
const first = `Place yard "the yard" is room at 0, 0 outdoors. Company party "You" of 1 at yard.
  Kind purse_kind "a purse for the creditor" is gear worth 0 weighing 1 described "Heavy, and sewn shut.".
  Item purse "a purse" is purse_kind at yard.`;
const second = `Module wages "Wages" { Place mill "the mill" is room at 1, 0 outdoors.
  Kind purse_kind "a purse of wages" is gear worth 30 weighing 0 described "Thirty coin, for the wages.".
  Item wages_purse "a purse of wages" is purse_kind at mill. }`;
const source = new OverlayBundleSource(NodeBundleSource.shared, {
  'kinds-two/wages.kyr': second,
  'kinds-two/module.json': JSON.stringify({ version: 1, source: 'wages.kyr', rules: ['world'] }) });
const kind = (t: Tiny, item: string) => t.world.one('itemKind', item);
const worth = (t: Tiny, id: string) => t.world.number({ kind: 'call', name: 'worth', args: [id] });

describe('two modules of one campaign, one kind\'s name', () => {
  it('installs the later beside the first, each item of its own module\'s kind', async () => {
    const t = await Tiny.start(first, { seed: 'kinds-two' });
    await t.campaign.install({ id: 'wages', bundle: 'kinds-two/module.json' }, source);
    const [a, b] = [kind(t, 't__purse'), kind(t, 'wages__wages_purse')];
    expect([a, b]).toEqual(['purse_kind', 'wages__purse_kind']);
    expect([t.campaign.catalog.get(a!).name, t.campaign.catalog.get(b!).name])
      .toEqual(['a purse for the creditor', 'a purse of wages']);
    expect([worth(t, a!), worth(t, b!)]).toEqual([0, 30]);
  });
  it('reads the later ahead and puts it aside, the campaign\'s own kind its own again', async () => {
    const t = await Tiny.start(first, { seed: 'kinds-two-ahead' });
    await ModuleBundle.prepare(t.campaign.vocabulary, source.resolve('kinds-two/module.json'), source);
    expect(t.campaign.catalog.find('purse_kind')?.name).toBe('a purse for the creditor');
  });
});

describe('two campaigns of one process, one kind\'s name', () => {
  it('begins the second after the first, and the first plays on with its own', async () => {
    const a = await Tiny.start(first, { seed: 'kinds-two-a' });
    const b = await Tiny.start(second.replace('Module wages', 'Module b').replace('at 1, 0 outdoors.',
      'at 0, 0 outdoors. Company party "You" of 1 at mill.'), { seed: 'kinds-two-b' });
    expect(b.campaign.catalog.find('purse_kind')?.name).toBe('a purse of wages');
    await a.play('Wait a while');
    expect(a.campaign.catalog.find('purse_kind')?.name).toBe('a purse for the creditor');
  });
});
