import { describe, expect, it } from 'bun:test';
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionPresentation } from '../src/presentation/action-presentation';
import { Campaign } from '../src/campaign/campaign';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Operator } from '../src/lang/module';
import { Scenarios } from '../web/scenarios';

class Views {
  static async start(manifest: string, seed: string) { return PlaySession.start(manifest, seed, Scenarios.source()); }
  static crossing() { return this.start('data/bundles/crossing.campaign.json', 'slice'); }
  static orchard() { return this.start('data/discovery/orchard.campaign.json', 'glass'); }
  static async sources(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    return (await Promise.all(entries.map(e => e.isDirectory() ? this.sources(join(dir, e.name)) :
      Promise.resolve(e.name.endsWith('.ts') ? [join(dir, e.name)] : [])))).flat();
  }
}

describe('player-safe campaign view', () => {
  it('omits remote actors, NPC policy thresholds and dispositions from the crossing view', async () => {
    const session = await Views.crossing();
    const view = PlayerView.observe(session.campaign), text = JSON.stringify(view);
    expect(session.campaign.world.test(ModuleWriter.call('acceptsFood', 'crossing__guard'))).toBe(true);
    for (const hidden of ['mercy', 'acceptsFood', 'claim', 'crossing__carrier', 'crossing__guard', 'urgentAt', 'gatekeeper']) {
      expect(text).not.toContain(hidden);
    }
    expect(view.location?.name).toBe(session.campaign.module.entities.find(e => e.id === 'crossing__village')!.name);
    expect(view.deadlines).toEqual([{ situation: view.situations[0]!.name, pressure: 'Winter provision deadline', at: 8,
      passed: false }]);
    expect(view.choices.map(c => c.name)).toEqual(['Wait', 'Travel to Bridge checkpoint',
      'Walk the footpath to Wayside market', 'Eat a ration']);
    await session.perform('travel(crossing__bank)');
    const checkpoint = PlayerView.observe(session.campaign);
    expect(checkpoint.present.map(e => [e.name, e.members?.map(m => m.name)])).toEqual([['The unpaid guard', ['Rusk']]]);
    expect(checkpoint.choices.map(c => c.id)).toContain('pay(crossing__guard)');
    expect(checkpoint.choices.find(c => c.id === 'attack(crossing__guard)')).toMatchObject({ encounter: true,
      name: 'Attack The unpaid guard' });
  });
  it('keeps discovery facts private until examined, using template-derived public commands', async () => {
    const session = await Views.orchard();
    const before = JSON.stringify(PlayerView.observe(session.campaign));
    expect(before).not.toContain('mirror_prisons');
    expect(before).not.toContain('prisons for living people');
    expect(before).not.toContain('stair_plan');
    await session.perform('examine(orchard__mirror)');
    const after = PlayerView.observe(session.campaign);
    expect(after.knowledge.map(k => k.id)).toEqual(['orchard__mirror_prisons']);
    expect(after.choices.map(c => c.id)).not.toContain('examine(orchard__mirror)');
    expect(JSON.stringify(after)).not.toContain('stair_plan');
  });
  it('narrates NPC actions only where the party can witness them, identically after restore', async () => {
    const session = await Views.orchard();
    for (const command of ['wait', 'wait', 'wait']) { await session.perform(command); }
    const seen = PlayerView.chronicle(session.campaign).filter(e => e.kind === 'npc');
    expect(seen).toEqual([{ at: 1, kind: 'npc', text: 'Orris: Travel to Orchard yard', detail: [] }]);
    const events = session.campaign.events.flatMap(e => e.npc ?? []);
    expect(events.map(n => [n.elapsed, n.action])).toEqual([[1, 'travel(orchard__orris,orchard__gate,orchard__yard)'],
      [2, 'travel(orchard__orris,orchard__yard,orchard__glasshouse)']]);
    expect(events[1]!.changes).toEqual(['- at(orchard__orris, orchard__yard)', '+ at(orchard__orris, orchard__glasshouse)']);
    const restored = Campaign.restore(JSON.parse(JSON.stringify(session.campaign.save())));
    expect(PlayerView.chronicle(restored)).toEqual(PlayerView.chronicle(session.campaign));
    const crossing = await Views.crossing();
    for (const command of ['wait', 'wait']) { await crossing.perform(command); }
    expect(crossing.campaign.events.flatMap(e => e.npc ?? []).length).toBeGreaterThan(0);
    expect(PlayerView.chronicle(crossing.campaign).filter(e => e.kind === 'npc')).toEqual([]);
  });
  it('reports passed deadlines and the player\'s own declared effects without inventing narrative', async () => {
    const session = await Views.crossing();
    await session.perform('walk(crossing__refuge)');
    for (let i = 0; i < 8; i++) { await session.perform('wait'); }
    const chronicle = PlayerView.chronicle(session.campaign);
    expect(chronicle[0]).toEqual({ at: 0, kind: 'player', text: 'Walk the footpath to Wayside market',
      detail: ['Assert at(The company, Wayside market).'] });
    expect(chronicle.filter(e => e.kind === 'world')).toEqual([{ at: 8, kind: 'world', detail: [],
      text: `Deadline reached: Winter provision deadline (${session.campaign.installations[0]!.name})` }]);
    expect(PlayerView.observe(session.campaign).deadlines[0]!.passed).toBe(true);
  });
  it('refuses label templates that would merge distinguishable commands', () => {
    const schema = { id: 'pay', name: 'Pay at {site}', parameters: [{ name: 'actor', type: 'group' },
      { name: 'recipient', type: 'group' }, { name: 'site', type: 'place' }] } as Operator;
    const grounded = ['a', 'b'].map(recipient => ({ ...schema, id: `pay(p,${recipient},s)`, schema: 'pay',
      bindings: { actor: 'p', recipient, site: 's' }, name: 'Pay at S' })) as Operator[];
    expect(() => ActionPresentation.choices(grounded, [schema])).toThrow('Ambiguous public command');
    const legacy = { ...schema, name: 'Transfer one coin' };
    expect(ActionPresentation.choices(grounded, [legacy]).map(c => c.choice.id)).toEqual(['pay(p,a,s)', 'pay(p,b,s)']);
  });
});

describe('environment-neutral engine boundary', () => {
  it('keeps filesystem, runtime and DOM access out of simulation code', async () => {
    const root = resolve(import.meta.dir, '../src');
    const offenders: string[] = [];
    for (const path of await Views.sources(root)) {
      if (path.endsWith('node-bundle-source.ts')) { continue; }
      const text = await readFile(path, 'utf8');
      if (/from 'node:|from 'bun|\bBun\.|\bprocess\.|\b(document|window|localStorage)\./.test(text)) {
        offenders.push(path.slice(root.length + 1));
      }
    }
    expect(offenders).toEqual([]);
  });
});
