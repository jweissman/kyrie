import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';
import { ChoiceList, type Choice } from '../src/ui/choice-list';
import type { CampaignEvent } from '../src/campaign/campaign';

// The Long Man, played by the labels a player sees: the wall, the keeper that walks it, the steward's bronze, and the
// storm on the third night. Each test is one way the three days can go.
class Dale {
  static start() {
    return PlaySession.start('data/campaigns/the-long-man.campaign.json', 'merrow', NodeBundleSource.shared);
  }
  static leaves(list: Choice[], trail = ''): { label: string; command?: string }[] {
    return list.flatMap(c => c.children ? this.leaves(c.children, `${trail}${c.label} › `)
      : [{ label: trail + c.label, ...c.command ? { command: c.command } : {} }]);
  }
  static async act(s: PlaySession, ...labels: string[]): Promise<CampaignEvent[]> {
    const events: CampaignEvent[] = [];
    for (const label of labels) {
      const all = this.leaves(ChoiceList.all(ChoiceList.explore(ScreenModel.build(s.campaign))));
      const c = all.find(x => x.command && new RegExp(label, 'i').test(x.label));
      if (!c) { throw new Error(`No /${label}/ among ${all.map(x => x.label).join(' | ')}`); }
      events.push(await s.perform(c.command!));
    }
    return events;
  }
  // Waits by the hour until the clock reaches a watch, collecting what was said meanwhile.
  static async until(s: PlaySession, watch: number): Promise<string> {
    let said = '';
    while (s.campaign.state.elapsed < watch) {
      const [e] = await this.act(s, '^Wait an hour');
      said += ' ' + [...(e!.perceptions ?? []).map(p => p.text), e!.response ?? ''].join(' ');
    }
    return said;
  }
  static holds(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static said(events: CampaignEvent[]) {
    return events.flatMap(e => [...(e.perceptions ?? []).map(p => p.text), e.response ?? '']).join(' ');
  }
}

describe('The Long Man', () => {
  it('walks its keeper on the crest at night, and down to the yard after the bronze', async () => {
    const s = await Dale.start();
    await Dale.act(s, '^To Merrow green', '^To the Hall yard', '^To the crest');
    await Dale.until(s, 80);
    await Dale.act(s, '^Wait a while');
    expect(Dale.holds(s, 'knows', 'party', 'longman__mower_keeps')).toBe(true);
    await Dale.act(s, '^To the Hall yard');
    expect(await Dale.until(s, 100)).toContain('turns the cart over');
    // The bronze is not in the cart: Venn had it moved to the cellar at nightfall.
    expect(Dale.holds(s, 'inside', 'longman__teeth', 'longman__cellar_chest')).toBe(true);
  }, 120000);
  it('closes the leak when its keeper is given back its bronze, and the wall stands through the storm', async () => {
    const s = await Dale.start();
    await Dale.act(s, '^To Merrow green', '^To the Hall yard');
    await Dale.until(s, 100);
    await Dale.act(s, '^Into the Hall cellar', '^Take from', '^Out to the Hall yard');
    expect(Dale.said(await Dale.act(s, '^Give a sack of bell-teeth'))).toContain('sound like a bell');
    expect(Dale.holds(s, 'state', 'longman__leak_gate', 'longman__mended')).toBe(true);
    expect(Dale.holds(s, 'at', 'longman__wet', 'longman__core')).toBe(true);
    await Dale.until(s, 400);
    expect(Dale.holds(s, 'longman__broke', 'longman__long_man')).toBe(false);
    expect(Dale.holds(s, 'longman__drowned', 'longman__low_field')).toBe(false);
  }, 180000);
  it('breaks on the third night if nothing is done, and takes the low town and whoever is in it', async () => {
    const s = await Dale.start();
    await Dale.act(s, '^To Merrow green');
    expect(await Dale.until(s, 400)).toContain('like a wall falling');
    expect(Dale.holds(s, 'longman__lostToWater', 'longman__folk')).toBe(true);
    const party = s.campaign.readout.creatures.filter(c => s.campaign.readout.partyIds.includes(c.id));
    expect(party.some(c => c.state.hp < c.base.maxHp)).toBe(true);
  }, 180000);
  it('gets Merrow up the hill when Mother Ysolt has been shown what the notches on her font are', async () => {
    const s = await Dale.start();
    await Dale.act(s, '^To Merrow green', '^Into the Drowned Ox', '^Buy › Torch', '^Out to Merrow green', '^To the Hall yard',
      '^Into the steward', 'Ask Aldous Venn about the Mower', '^Take from the hook', '^Out to the Hall yard', '^To the crest',
      '^To the gauge stone', '^Into the galleries', 'light', '^Read the notches', '^To the grey gallery', '^To the sluice',
      'unlock the grate', '^To the Hollow Door$', '^To the Weeping Springs', '^To the low field', '^To Merrow green',
      '^Into the Chapel', 'Tell Mother Ysolt');
    expect(Dale.holds(s, 'longman__convinced', 'longman__ysolt')).toBe(true);
    await Dale.act(s, '^Out to Merrow green', '^To the Hall yard');
    await Dale.until(s, 400);
    expect(Dale.holds(s, 'at', 'longman__folk', 'longman__yard')).toBe(true);
    expect(Dale.holds(s, 'longman__lostToWater', 'longman__folk')).toBe(false);
  }, 180000);
  it('draws Hollow Water down with the dyke-reeve\'s rod, which saves the wall and drowns the mill', async () => {
    const s = await Dale.start();
    await Dale.act(s, '^To Merrow green', '^To the Hall yard', '^To the crest');
    await Dale.until(s, 80);
    await Dale.act(s, '^Wait a while', '^To the Hall yard', '^To Merrow green', '^Into Gammer', 'about the rod',
      'for the loan', '^Take', '^Out to Merrow green', '^To the Hall yard', '^To the crest', '^To the lakeshore',
      'push the punt', '^To the deep water', '^To the Water-House');
    expect(Dale.holds(s, 'knows', 'party', 'longman__rod_fits')).toBe(true);
    await Dale.act(s, 'turn the great wheel');
    expect(await Dale.until(s, s.campaign.state.elapsed + 14)).toContain('Hollow Water goes down');
    expect(Dale.holds(s, 'longman__drowned', 'longman__millhouse')).toBe(true);
    await Dale.act(s, '^Down to the drowned street|^To the drowned street');
    await Dale.until(s, 400);
    expect(Dale.holds(s, 'longman__broke', 'longman__long_man')).toBe(false);
  }, 180000);
});
