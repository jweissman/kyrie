import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Canon } from '../../src/canon/canon';
import { LocalKinds } from '../../src/canon/local-catalog';
import { Campaign } from '../../src/campaign/campaign';
import { LoadCache } from '../../src/campaign/load-cache';
import { SingleModule } from '../../src/campaign/single-module';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../src/campaign/overlay-bundle-source';
import { Installed } from '../../src/ports/installed';
import { PlayerView } from '../../src/presentation/player-view';
import { ActionFeedbackView } from '../../src/presentation/action-feedback';
import { CombatTelling } from '../../src/ui/combat-telling';
import type { BundleSource } from '../../src/campaign/bundle-source';

class PausedSource implements BundleSource {
  private reached!: () => void;
  private resume!: () => void;
  readonly waiting = new Promise<void>(resolve => { this.reached = resolve; });
  private readonly continued = new Promise<void>(resolve => { this.resume = resolve; });
  constructor(private readonly source: BundleSource, private readonly paused: string) {}
  resolve(relative: string, from?: string): string { return this.source.resolve(relative, from); }
  async read(path: string): Promise<string> {
    if (path === this.paused) { this.reached(); await this.continued; }
    return this.source.read(path);
  }
  release(): void { this.resume(); }
}

describe('scoped campaign loading', () => {
  it('restores check history with its own local tool, while retaining names already recorded', async () => {
    const t = await Tiny.start('Place yard "yard" is room. Company party "You" of 1 at yard. '
      + 'Kind local_tool "field kit" is gear.', { own: true });
    const save = t.campaign.save(), actor = save.state.partyIds[0]!;
    const check = { type: 'check' as const, turn: 0, actor, skill: 'lore', stat: 'intelligence',
      modifier: 1, tool: 2, using: 'local_tool', die: 10, rolled: 13, difficulty: 12, success: true };
    const before = PlayerView.observe(t.campaign);
    const wait = t.campaign.offered().find(action => action.name === 'Wait a while')!;
    const event = await t.session.leg(wait.id);
    save.events.push({ action: 'search', elapsed: 0, changes: [], result: 'success',
      combat: [check, { ...check, usingName: 'the old kit' }] });
    const foreign = LocalKinds.item('other', { id: 'local_tool', name: 'foreign kit', base: { category: 'gear' } });
    LocalKinds.activate({ items: { local_tool: foreign } });
    try {
      const restored = Campaign.restore(save);
      const detail = PlayerView.chronicle(restored).flatMap(entry => entry.detail);
      expect(detail.some(line => line.includes('field kit 2'))).toBe(true);
      expect(detail.some(line => line.includes('the old kit 2'))).toBe(true);
      expect(detail.some(line => line.includes('foreign kit'))).toBe(false);
      const feedback = ActionFeedbackView.read(t.campaign, { ...event, combat: [check] }, before);
      expect(feedback.rolls[0]).toContain('field kit 2');
      const state = { combatants: [], turn: 0, actor: '', outcome: null };
      expect(CombatTelling.exchanges([check], state, undefined, t.campaign.vocabulary)[0]!.detail)
        .toContain('field kit 2');
    } finally { LocalKinds.reset(); }
  });
  it('installs and undoes without changing the ambient catalog', async () => {
    const first = 'Place yard "yard" is room. Company party "You" of 1 at yard. '
      + 'Kind purse_kind "creditor" is gear worth 0.';
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'scoped-loading/wages.kyr': 'Module wages "Wages" { Kind purse_kind "wages" is gear worth 30. }',
      'scoped-loading/module.json': JSON.stringify({ version: 1, source: 'wages.kyr', rules: ['world'] }) });
    const t = await Tiny.start(first, { seed: 'install-ambient', own: true });
    const waiting = t.campaign.offered().find(action => action.name === 'Wait a while');
    expect(waiting).toBeDefined();
    t.campaign.execute(waiting!.id);
    const marker = LocalKinds.item('other', { id: 'foreign_marker', name: 'foreign marker',
      base: { category: 'gear' } });
    LocalKinds.activate({ items: { foreign_marker: marker } });
    try {
      await t.campaign.install({ id: 'wages', bundle: 'scoped-loading/module.json' }, source);
      expect(t.campaign.vocabulary?.itemDefinition('wages__purse_kind')?.value).toBe(30);
      expect(Canon.items.foreign_marker?.name).toBe('foreign marker');
      expect(Canon.items.purse_kind).toBeUndefined();
      t.campaign.undo();
      expect(t.campaign.vocabulary?.itemDefinition('purse_kind')?.value).toBe(0);
      expect(t.campaign.vocabulary?.itemDefinition('wages__purse_kind')).toBeUndefined();
      expect(Canon.items.foreign_marker?.name).toBe('foreign marker');
      expect(Canon.items.purse_kind).toBeUndefined();
    } finally { LocalKinds.reset(); }
  });
  it('orders different rules installations and releases the next after a load fails', async () => {
    const cache = new LoadCache<string>(), calls: string[] = [], source = NodeBundleSource.shared;
    const a = { id: 'load-domain-a' }, b = { id: 'load-domain-b' };
    let release!: () => void, reached!: () => void;
    const paused = new Promise<void>(resolve => { release = resolve; });
    const waiting = new Promise<void>(resolve => { reached = resolve; });
    const load = (domain: typeof a, label: string) => Installed.within(domain, () =>
      cache.take(source, label, async () => {
        calls.push(`${label}:${Installed.current().id}`);
        if (label === 'first') { reached(); await paused; throw new Error('first failed'); }
        return label;
      }, value => `${value}:${Installed.current().id}`));
    const first = load(a, 'first');
    await waiting;
    const second = load(b, 'second'), third = load(a, 'third');
    try {
      await Promise.resolve();
      expect(calls).toEqual(['first:load-domain-a']);
    } finally { release(); }
    await expect(first).rejects.toThrow('first failed');
    expect(await Promise.all([second, third])).toEqual(['second:load-domain-b', 'third:load-domain-a']);
    expect(calls).toEqual(['first:load-domain-a', 'second:load-domain-b', 'third:load-domain-a']);
  });
  it('lets public loads interleave and gives each its own item and species', async () => {
    const make = (name: string, value: number, like: string) => SingleModule.source(
      `Species local_beast "${name}" like ${like}. Kind local_token "${name} token" is treasure worth ${value}. `
      + 'Place yard "yard" is room. Company party "You" of 1 at yard. '
      + 'Person beast "Beast" at yard { Species local_beast. } Item prize is local_token at yard.', { own: true });
    const a = make('amber wolf', 3, 'wolf'), b = make('silver bear', 9, 'bear');
    const shape = (c: Campaign) => structuredClone({ world: c.world.describe(), creatures: c.readout.creatures,
      catalog: c.module.catalog });
    const expectedA = shape(await Campaign.load(a.campaign, 'public-a', a.source));
    const expectedB = shape(await Campaign.load(b.campaign, 'public-b', b.source));
    const paused = new PausedSource(a.source, a.source.resolve('site.kyr', a.campaign));
    const first = Campaign.load(a.campaign, 'public-a', paused);
    await Promise.race([paused.waiting, first.then(() => { throw new Error('Start did not reach its paused source'); })]);
    const second = Campaign.load(b.campaign, 'public-b', new OverlayBundleSource(b.source, {}));
    try {
      const completed = await Promise.race([second.then(() => true), Bun.sleep(1000).then(() => false)]);
      expect(completed).toBe(true);
    } finally { paused.release(); }
    expect(shape(await first)).toEqual(expectedA);
    expect(shape(await second)).toEqual(expectedB);
  });
  it('lets a second load succeed when the first caller cancels their shared start', async () => {
    const world = SingleModule.source('Place yard "yard" is room. Company party "You" of 1 at yard.', { own: true });
    let release!: () => void, reached!: () => void, secondSteps = 0;
    const paused = new Promise<void>(resolve => { release = resolve; });
    const waiting = new Promise<void>(resolve => { reached = resolve; });
    const first = Campaign.load(world.campaign, 'cancelled-load', world.source, {
      async step() { reached(); await paused; throw new Error('cancelled'); } });
    await waiting;
    const second = Campaign.load(world.campaign, 'cancelled-load', world.source, {
      step() { secondSteps++; } });
    release();
    await expect(first).rejects.toThrow('cancelled');
    expect((await second).running).toBe(true);
    expect(secondSteps).toBeGreaterThan(0);
  });
});
