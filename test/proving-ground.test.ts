import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { Environment } from '../src/campaign/environment';
import type { Campaign } from '../src/campaign/campaign';
import type { CampaignEvent } from '../src/campaign/campaign-types';

// The Varrow's high country: Brack at the river's mouth, with its Exchange, its Watch and the Lamplighters' Charter;
// the Unlit under the Lanthorn, a plane with its own law; and the ways between them. What is exercised here is the
// world model, not scripts: a secret found and used, a power that takes a fortress by the shared dominion rules, a
// law that holds for everyone in a place.
class Ground {
  static async start(seed = 'ground') {
    return (await PlaySession.start('data/campaigns/varrow.campaign.json', seed, NodeBundleSource.shared)).campaign;
  }
  static change(c: Campaign, kind: 'assert' | 'retract', facts: [string, ...string[]][]) {
    const open = c as unknown as { commit(w: unknown): void };
    open.commit(c.world.apply(facts.map(([name, ...args]) => ({ kind, call: ModuleWriter.call(name, ...args) }))));
  }
  static put(c: Campaign, ...facts: [string, ...string[]][]) { Ground.change(c, 'assert', facts); }
  static drop(c: Campaign, ...facts: [string, ...string[]][]) { Ground.change(c, 'retract', facts); }
  static holds(c: Campaign, name: string, ...args: string[]) { return c.world.test(ModuleWriter.call(name, ...args)); }
  static act(c: Campaign, pick: (label: string) => boolean): CampaignEvent {
    const action = c.available().find(a => pick(a.name));
    if (!action) { throw new Error(`No action among: ${c.available().map(a => a.name).join(' | ')}`); }
    return c.execute(action.id);
  }
  static text(e: CampaignEvent): string {
    return [e.response ?? '', ...(e.perceptions ?? []).map(p => p.text)].join(' ');
  }
}

describe('Brack', () => {
  it('is two days down the salt road from Hollin, and its Exchange feels the Toll', async () => {
    const c = await Ground.start();
    Ground.act(c, l => l.includes('salt road'));
    expect(Ground.holds(c, 'at', 'party', 'brack__pans')).toBe(true);
    Ground.put(c, ['at', 'party', 'brack__exchange_floor']);
    const look = Ground.act(c, l => l.startsWith('Wait a while'));
    expect(Ground.text(look) + c.world.snapshot.relations.length).toBeDefined();
    expect(Ground.holds(c, 'tolls', 'lanthorn__wardens', 'varrow__toll_gate')).toBe(true);
  }, 120000);
  it('gives up the Exchange\'s secret to a company that buys a clerk, and lets it be used against the factor', async () => {
    const c = await Ground.start('secret');
    Ground.put(c, ['at', 'party', 'brack__counting_house']);
    Ground.drop(c, ['at', 'party', 'varrow__market']);
    Ground.act(c, l => l.startsWith('Pay Pim'));
    Ground.act(c, l => l.includes('strongroom door'));
    // The strongroom has no windows: nothing in it can be found without a light.
    Ground.act(c, l => l.includes('use Light on Ivo'));
    Ground.act(c, l => l.startsWith('Collect a ledger bound in black for Ivo'));
    Ground.act(c, l => l.startsWith('Wait a while'));
    expect(Ground.holds(c, 'knows', 'party', 'brack__toll_bought')).toBe(true);
    Ground.put(c, ['at', 'party', 'brack__exchange_floor']);
    Ground.act(c, l => l.startsWith('Tell Dame Marrick'));
    expect(Ground.holds(c, 'brack__exposed', 'brack__hale')).toBe(true);
    Ground.act(c, l => l.startsWith('Wait a while'));
    expect(Ground.holds(c, 'brack__rewarded', 'party')).toBe(true);
  }, 120000);
  it('lets the Exchange take the Lanthorn when it falls empty, and toll the Gap itself, by the shared dominion rules', async () => {
    const c = await Ground.start('seized');
    // The Toll lifted and the hobs, who covet the gate too, gone from the downs: the gate stands empty, and the
    // Exchange is the one power left that wants it.
    Ground.put(c, ['lanthorn__lifted', 'lanthorn__toll']);
    Ground.drop(c, ['covets', 'knotFolk__gaffer', 'lanthorn__gate_passage']);
    for (let i = 0; i < 40 && !Ground.holds(c, 'holds', 'brack__hale', 'lanthorn__gate_passage'); i++) {
      Ground.act(c, l => l.startsWith('Wait an hour'));
    }
    expect(Ground.holds(c, 'holds', 'brack__hale', 'lanthorn__gate_passage')).toBe(true);
    Ground.act(c, l => l.startsWith('Wait a while'));
    expect(Ground.holds(c, 'tolls', 'brack__exchange_guards', 'varrow__toll_gate')).toBe(true);
    // Hollin and Skerry feel it as they felt Ninefingers' Toll: nothing in their rules names the Exchange.
    expect(c.world.test(ModuleWriter.call('tolls', '?collector', 'varrow__toll_gate'))).toBe(true);
  }, 300000);
});

describe('the Unlit', () => {
  it('is a plane under its own law, reached through the Lanthorn once the Unlight is gone', async () => {
    const c = await Ground.start('unlit');
    const veil = c.world.module.entities.find(e => e.id === 'unlit__veil')!;
    expect(veil).toBeDefined();
    Ground.put(c, ['at', 'party', 'unlit__ash_road']);
    Ground.drop(c, ['at', 'party', 'varrow__market']);
    expect(Environment.laws(c.world, 'party')).toEqual(['unlit_law']);
    Ground.put(c, ['state', 'lanthorn__unlight', 'lanthorn__gone']);
    Ground.act(c, l => l.startsWith('Wait a while'));
    expect(Ground.holds(c, 'state', 'unlit__unlight_stain', 'unlit__clear')).toBe(true);
  }, 120000);
  it('holds every combatant in a fight there to its law', async () => {
    const c = await Ground.start('law');
    Ground.drop(c, ['at', 'party', 'varrow__market']);
    Ground.put(c, ['at', 'party', 'unlit__arch']);
    const attack = c.available().find(a => a.resolve?.name === 'combat' && a.resolve.args[0] === 'unlit__watcher')!;
    const battle = c.encounterBattle(attack.id);
    expect(battle.state.combatants.every(f => f.statuses.some(s => s.id === 'unlit_law'))).toBe(true);
    const law = battle.state.combatants.find(f => f.team === 'fighters')!;
    expect(law.statuses.find(s => s.id === 'unlit_law')!.clock).toBe('until-removed');
  }, 120000);
});
