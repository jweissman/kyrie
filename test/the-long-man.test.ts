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
      const [e] = await this.act(s, '^Wait › An hour');
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
    await Dale.act(s, '^Wait › A while');
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
    // Seen through, the dale is a level's experience to each (its goal had been lost, written in its second file),
    // and the keeper is gone into the hill, not still standing by the company.
    const r = s.campaign.readout;
    expect(r.creatures.filter(c => r.partyIds.includes(c.id)).map(c => c.state.experience)).toEqual([1000, 1000, 1000]);
    expect(Dale.holds(s, 'at', 'longman__mower', 'longman__leak')).toBe(true);
    // The evening after, the Ox talks of the springs running clear, not of the low field going under.
    await Dale.act(s, '^To Merrow green', '^Into the Drowned Ox');
    expect(await Dale.until(s, 222)).toContain('ran clear this morning');
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
    await Dale.act(s, '^To Merrow green', '^Into the Drowned Ox', '^Buy › A torch', '^Out to Merrow green', '^To the Hall yard',
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
    await Dale.act(s, '^Wait › A while', '^To the Hall yard', '^To Merrow green', '^Into Gammer', 'about the rod',
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

describe('The Long Man, its other endings', () => {
  it('lays its keeper by day with the steward\'s own bar, and leaves the wall with nobody to keep it', async () => {
    const s = await Dale.start();
    await Dale.act(s, '^To Merrow green', '^Into the Drowned Ox', '^Buy › A torch', '^Out to Merrow green',
      '^To the Hall yard', '^Into the Hall cellar', '^Take$', '^Search here', 'lift the oak bar', '^To the grey gallery',
      'light', '^To the keeper\'s niche', 'Get the bar under', '^Take$');
    expect(Dale.holds(s, 'dead', 'longman__mower')).toBe(true);
    await Dale.act(s, '^To the grey gallery', '^To the Hall cellar', '^Out to the Hall yard', '^Into the steward',
      'Show Aldous Venn the Mower\'s mask');
    expect(Dale.holds(s, 'longman__paidBounty', 'longman__venn')).toBe(true);
    await Dale.until(s, 400);
    expect(Dale.holds(s, 'longman__broke', 'longman__long_man')).toBe(true);
  }, 180000);
  it('shows the steward his own ledger beside what the bronze held shut, and he leaves on the barge', async () => {
    const s = await Dale.start();
    await Dale.act(s, '^To Merrow green', '^Into the Drowned Ox', '^Buy › A torch', '^Out to Merrow green',
      '^To the Hall yard', '^Into the steward', '^Read', '^Out to the Hall yard', '^Into the Hall cellar', '^Search here',
      'lift the oak bar', '^To the grey gallery', 'light', '^To the wet gallery', '^To the grey gallery',
      '^To the Hall cellar', '^Out to the Hall yard', '^Into the steward', 'Show Aldous Venn his own ledger');
    expect(Dale.holds(s, 'longman__exposed', 'longman__venn')).toBe(true);
    await Dale.until(s, 206);
    expect(Dale.holds(s, 'at', 'longman__venn', 'longman__downriver')).toBe(true);
  }, 180000);
});

// What the dale's people do without being asked: each owner minds what is theirs, and a foreman can be bought.
describe('The Long Man, its people unprompted', () => {
  it('has Gammer Coller say so when her rod is taken without asking', async () => {
    const s = await Dale.start();
    const said = Dale.said(await Dale.act(s, '^To Merrow green', '^Into Gammer', 'about the rod', '^Take'));
    expect(said).toContain("'That is the reeve's rod,'");
    expect(Dale.holds(s, 'objected', 'longman__nell', 'longman__rod')).toBe(true);
    // Heard of from Gammer Coller and since taken, the rod is not "heard, not yet seen" (NAR-13).
    const rod = ScreenModel.build(s.campaign).knowledge.find(k => /the dyke-reeve's rod, by her door/.test(k.text))!;
    expect(rod.kind).toBe('confirmed');
  }, 120000);
  it('has Dunnet tell the steward of the bronze he sees the company carry, unless his wages were paid', async () => {
    const told = await Dale.start();
    expect(Dale.said(await Dale.act(told, '^To Merrow green', '^To the Hall yard', 'Untie the tarpaulin', '^Take from')))
      .toContain('goes in to the steward');
    expect(Dale.holds(told, 'hostile', 'longman__venn', 'party')).toBe(true);
    const paid = await Dale.start();
    expect(Dale.said(await Dale.act(paid, '^To Merrow green', '^To the Hall yard', 'Give Dunnet three coin',
      'Untie the tarpaulin', '^Take from'))).not.toContain('goes in to the steward');
    expect(Dale.holds(paid, 'hostile', 'longman__venn', 'party')).toBe(false);
  }, 120000);
  it('lets the key be lifted off its hook while the steward sleeps, and has his foreman see it go', async () => {
    const s = await Dale.start();
    await Dale.act(s, '^To Merrow green', '^To the Hall yard');
    await Dale.until(s, 90);
    expect(Dale.holds(s, 'at', 'longman__venn', 'longman__chamber')).toBe(true);
    expect(Dale.said(await Dale.act(s, '^Into the steward', '^Take from the hook'))).not.toContain('Give it here');
    expect(Dale.holds(s, 'state', 'longman__key_hook', 'longman__empty')).toBe(true);
    expect(Dale.said(await Dale.act(s, '^Out to the Hall yard'))).toContain('goes in to the steward');
  }, 180000);
});

// What the dale was missing (README §11): a town under the lake with a second face in it, Pell's lantern, Dunnet's
// arm, and a barge-master who will not carry a weir downriver.
describe('The Long Man, deepened', () => {
  it('raises the town under the lake, where a second face lies in its mould and buys the steward\'s bounty', async () => {
    const s = await Dale.start();
    await Dale.act(s, '^To Merrow green', '^To the Hall yard', '^To the crest');
    await Dale.until(s, 80);
    await Dale.act(s, '^Wait › A while', '^To the Hall yard', '^To Merrow green', '^Into Gammer', 'about the rod',
      'for the loan', '^Take', '^Out to Merrow green', '^To the Hall yard', '^To the crest', '^To the lakeshore',
      'push the punt', '^To the deep water', '^To the Water-House', 'turn the great wheel');
    await Dale.until(s, s.campaign.state.elapsed + 14);
    await Dale.act(s, '^To the drowned street', '^To the face-house', '^Search here', '^Take$', '^To the drowned street',
      'lift the bar', '^To the last house');
    expect(Dale.holds(s, 'knows', 'party', 'longman__last_count')).toBe(true);
    await Dale.act(s, '^To the drowned street', '^To the Water-House', '^To the deep water', '^To the lakeshore',
      '^To the crest', '^To the Hall yard', '^Into the steward', 'Show Aldous Venn a grey face, fired and never fitted');
    expect(Dale.holds(s, 'longman__paidBounty', 'longman__venn')).toBe(true);
    expect(Dale.holds(s, 'able', 'longman__mower')).toBe(true);
  }, 240000);
  it('brings Pell\'s lantern out of the wet gallery to Dunnet, who tells the parish by nightfall', async () => {
    const s = await Dale.start();
    await Dale.act(s, '^To Merrow green', '^Into the Drowned Ox', '^Buy › A torch', '^Out to Merrow green',
      '^To the Hall yard', '^Into the Hall cellar', '^Search here', 'lift the oak bar', '^To the grey gallery', 'light',
      '^To the wet gallery', '^Take$', '^To the grey gallery', '^To the Hall cellar', '^Out to the Hall yard');
    expect(Dale.said(await Dale.act(s, 'Give a miner\'s lantern'))).toContain('The clay stood up and took him');
    await Dale.until(s, 80);
    expect(Dale.holds(s, 'longman__exposed', 'longman__venn')).toBe(true);
  }, 180000);
  it('breaks Dunnet\'s arm when the keeper turns the cart over, and makes a friend of whoever binds it', async () => {
    const s = await Dale.start();
    await Dale.act(s, '^To Merrow green', '^To the Hall yard');
    await Dale.until(s, 100);
    expect(Dale.holds(s, 'longman__hurt', 'longman__dunnet')).toBe(true);
    expect(Dale.said(await Dale.act(s, 'Give bandages'))).toContain('For you. Not for him.');
    expect(Dale.holds(s, 'longman__promisedDoor', 'longman__dunnet')).toBe(true);
  }, 180000);
  it('lets Cass Rowell, told what the bronze held shut, set it down on the landing and take the Hall\'s plate', async () => {
    const s = await Dale.start();
    await Dale.act(s, '^To Merrow green', '^Into the Drowned Ox', '^Buy › A torch', '^Out to Merrow green',
      '^To the Hall yard', '^Into the Hall cellar', '^Search here', 'lift the oak bar', '^To the grey gallery', 'light',
      '^To the sluice chamber', '^To the grey gallery', '^To the wet gallery', '^To the grey gallery', '^To the Hall cellar',
      '^Out to the Hall yard', '^To Merrow green', '^To the low field', '^To the mill landing');
    await Dale.until(s, 171);
    await Dale.act(s, 'Tell Cass Rowell what the bronze', '^Take$');
    expect(Dale.holds(s, 'longman__aboard', 'longman__teeth')).toBe(false);
    await Dale.until(s, 210);
    expect(Dale.holds(s, 'longman__ruined', 'longman__venn')).toBe(true);
  }, 180000);
});
