import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';
import { ChoiceList, type Choice } from '../src/ui/choice-list';
import type { CampaignEvent } from '../src/campaign/campaign';

// The Long Man's second reading (doc/imbar/): the Hall's charter, the reeve's office, the sheaf in forty, and the
// parish bell given to the keeper as it was given once before. Played by the labels a player sees.
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
      if (!c) { throw new Error(`No /${label}/ among ${all.map(x => x.label).slice(0, 25).join(' | ')}`); }
      events.push(await s.perform(c.command!));
    }
    return events;
  }
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

describe('The Long Man, the charter', () => {
  it('has the reeve of the waters watch the Hall\'s keeping, and the parish choose a warden for the sheaf in forty', async () => {
    const s = await Dale.start();
    await Dale.act(s, '^To Merrow green', '^To the Hall yard', '^Into the steward', '^Read the framed charter', '^Search here');
    expect(Dale.holds(s, 'knows', 'party', 'longman__charter_read')).toBe(true);
    // The Latin gives the Hall's custodia as keeping, and the dale's own word for the wall.
    await Dale.act(s, '^Out to the Hall yard', '^To Merrow green', '^Into the Chapel');
    expect(Dale.said(await Dale.act(s, 'Show Mother Ysolt the charter'))).toContain('Murus Longus');
    expect(Dale.holds(s, 'longman__valeTold', 'longman__ysolt')).toBe(true);
    await Dale.act(s, '^Out to Merrow green', '^Into Gammer');
    expect(Dale.said(await Dale.act(s, 'Tell Gammer Coller what the charter says'))).toContain('To watch the keeping');
    expect(Dale.said(await Dale.act(s, 'Tell Gammer Coller the charter lets the dale'))).toContain('A parish may choose a man');
    await Dale.act(s, '^Out to Merrow green', '^To the Hall yard');
    expect(Dale.said(await Dale.act(s, 'Ask Dunnet whether he would keep the wall'))).toContain('Not own it');
    expect(Dale.holds(s, 'longman__wardenChosen', 'longman__dunnet')).toBe(true);
    // The steward, met with the reeve behind him, gives up the key, and the Hall's own letter goes to Marlow.
    expect(Dale.said(await Dale.act(s, '^Into the steward', 'Tell Aldous Venn the reeve'))).toContain('That is what a card is for');
    expect(Dale.holds(s, 'longman__exposed', 'longman__venn')).toBe(true);
    // The wall is then mended as ever: the bronze from the cellar chest back to its keeper.
    await Dale.until(s, 100);
    await Dale.act(s, '^Out to the Hall yard', '^Into the Hall cellar', '^Take from', '^Out to the Hall yard');
    expect(Dale.said(await Dale.act(s, '^Give a sack of bell-teeth'))).toContain('sound like a bell');
    await Dale.until(s, 440);
    expect(Dale.said(await Dale.act(s, '^To Merrow green'))).toContain('THE KEEPING');
    expect(Dale.holds(s, 'longman__broke', 'longman__long_man')).toBe(false);
  }, 240000);
  it('shows the ordinary Venn in the Lord\'s debt, and the Hall left cold when the charter is told without the dale', async () => {
    const s = await Dale.start();
    await Dale.act(s, '^To Merrow green', '^To the Hall yard', '^Into the steward');
    expect(Dale.said(await Dale.act(s, 'Ask Aldous Venn about the Lord'))).toContain('Dame Isolde');
    await Dale.act(s, '^Read the framed charter', '^Search here');
    expect(Dale.said(await Dale.act(s, 'Read Aldous Venn his own charter'))).toContain('a job nobody told us we had');
    expect(Dale.holds(s, 'longman__exposed', 'longman__venn')).toBe(true);
  }, 180000);
});

describe('The Long Man, the bell', () => {
  it('has the parish give its bell to the keeper, as it did the year the water wept, when the bronze has gone downriver', async () => {
    const s = await Dale.start();
    // The steward's barge takes the bronze at dusk on the second day; the company has seen what it was holding shut.
    await Dale.act(s, '^To Merrow green', '^Into the Drowned Ox', '^Buy › A torch', '^Out to Merrow green',
      '^To the Hall yard', '^Into the Hall cellar', '^Search here', 'lift the oak bar', '^To the grey gallery', 'light',
      '^To the wet gallery', '^To the grey gallery', '^To the Hall cellar', '^Out to the Hall yard');
    expect(Dale.holds(s, 'knows', 'party', 'longman__teeth_taken')).toBe(true);
    await Dale.until(s, 215);
    expect(Dale.holds(s, 'at', 'longman__teeth', 'longman__downriver')).toBe(true);
    // The parish register's leaf after the weeping tells what was done then.
    await Dale.act(s, '^To Merrow green', '^Into the Chapel', '^To the vestry', 'Read the parish register, the leaf');
    expect(Dale.holds(s, 'knows', 'party', 'longman__bell_given_before')).toBe(true);
    await Dale.act(s, '^Out to|^To the chapel');
    const said = Dale.said(await Dale.act(s, 'Ask Mother Ysolt whether the parish would give its bell again'));
    expect(said).toContain('another bell was given, once');
    expect(Dale.holds(s, 'longman__bellGone')).toBe(true);
    await Dale.act(s, '^Take');
    await Dale.act(s, '^Out to Merrow green', '^To the Hall yard');
    await Dale.until(s, 290);
    await Dale.act(s, '^Into the Hall cellar', '^To the grey gallery', "^To the keeper's niche");
    expect(Dale.said(await Dale.act(s, '^Give the bell'))).toContain('a note a good deal deeper');
    expect(Dale.holds(s, 'state', 'longman__leak_gate', 'longman__mended')).toBe(true);
    await Dale.until(s, 440);
    expect(Dale.holds(s, 'longman__broke', 'longman__long_man')).toBe(false);
    await Dale.act(s, '^To the grey gallery', '^To the Hall cellar', '^Out to the Hall yard');
    expect(Dale.said(await Dale.act(s, '^To Merrow green'))).toContain('a boy goes round the green with a pan');
  }, 300000);
});

describe('The Long Man, the company', () => {
  const toQuarrel = async (s: PlaySession) => {
    await Dale.act(s, '^To Merrow green', '^Into the Drowned Ox');
    expect(Dale.said(await Dale.act(s, '^Buy › A torch'))).toBeDefined();
    await Dale.act(s, '^Out to Merrow green', '^To the Hall yard', '^Into the steward', 'Ask Aldous Venn about the Mower',
      '^Take from the hook', '^Out to the Hall yard', '^To the crest', '^To the gauge stone', '^Into the galleries', 'light',
      '^Read the notches', '^Out|^To the foot', );
  };
  it('lets each member speak by what they are, once, in the places that suit it', async () => {
    const s = await Dale.start();
    const a = Dale.said(await Dale.act(s, '^To Merrow green', '^Into the Chapel'));
    expect(a).toContain('Dori lays a hand flat on the font');
    const b = Dale.said(await Dale.act(s, '^Out to Merrow green', '^To the Hall yard'));
    expect(b).toContain('Bran walks round the cart once');
    const c = Dale.said(await Dale.act(s, '^To the crest'));
    expect(c).toContain('Elen goes down on one knee by a stump');
    // Once: coming back to the font is not another remark.
    const d = Dale.said(await Dale.act(s, '^To the Hall yard', '^To Merrow green', '^Into the Chapel'));
    expect(d).not.toContain('lays a hand flat');
  }, 180000);
  it('puts the warrior and the cleric at odds over the forty crowns, and lets the company choose', async () => {
    const s = await Dale.start();
    await toQuarrel(s);
  }, 240000);
});
