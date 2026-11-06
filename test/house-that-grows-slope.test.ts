import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { Journey } from '../src/session/journey';
import type { CampaignEvent } from '../src/campaign/campaign';

// The House That Grows, Act III: the Slope, the gate, the front door, and the three answers to Neme, played by the labels
// a player sees (doc/imbar/adventures/house-that-grows.md).
class Ring {
  static start() {
    return PlaySession.start('data/campaigns/the-house-that-grows.campaign.json', 'noon', NodeBundleSource.shared);
  }
  static choices(s: PlaySession) { return Journey.of(s).choices(); }
  static offered(s: PlaySession, label: string): boolean { return Journey.of(s).offers(label); }
  static async act(s: PlaySession, ...labels: string[]): Promise<CampaignEvent[]> {
    const j = Journey.of(s);
    await j.play(...labels);
    return j.taken.map(t => t.event);
  }
  static holds(s: PlaySession, name: string, ...args: string[]) { return s.campaign.world.test(ModuleWriter.call(name, ...args)); }
  static said(events: CampaignEvent[]) {
    return events.flatMap(e => [...(e.perceptions ?? []).map(p => p.text), e.response ?? '']).join(' ');
  }
  static readonly look = "?Tell Tobu: 'Look at me";
  // From Kezu's kitchen with Tobu, through the small door and up into the Long Hall.
  static async up(s: PlaySession) {
    await this.act(s, 'Ask Tobu what happened', 'Ask Tobu to come with you into', 'Ask \\w+ to come with you',
      'sleeping-room', '^Take', 'To Kezu.s kitchen', 'pond causeway', 'rim of Cobble', 'east lip', 'flattened barley',
      'Pay the watchers', this.look, 'back through the small door', this.look, 'back through the door to the cup shelf',
      this.look, 'back through the narrow door', this.look, 'back through the far door');
    expect(this.holds(s, 'at', 'party', 'hhg__long_hall')).toBe(true);
  }
}

describe('The House That Grows: the Slope', () => {
  it('walks downhill from the Long Hall to the keeper of the Slope, and hears the eleven', async () => {
    const s = await Ring.start();
    await Ring.up(s);
    const said = Ring.said(await Ring.act(s, '^To the Slope'));
    expect(Ring.holds(s, 'at', 'party', 'hhg__slope')).toBe(true);
    expect(said).toContain('eleven knocks');
    await Ring.act(s, 'Ask Sabe about the knocking');
    expect(Ring.holds(s, 'knows', 'party', 'hhg__eleven_strokes')).toBe(true);
  }, 120000);

  const reached = (s: PlaySession) => s.campaign.world.related('reached').map(r => r.args[0]!.replace(/^hhg__/, ''));

  it('lets a monk of the Watch speak at the gate, and stare it open instead of forcing it', async () => {
    const s = await Ring.start();
    await Ring.up(s);
    const said = Ring.said(await Ring.act(s, '^To the Slope'));
    expect(said).toContain('She is not looking away either');
    expect(Ring.offered(s, 'Knock the eleven at the gate')).toBe(false);
    await Ring.act(s, 'Stare at the gate with');
    expect(Ring.holds(s, 'state', 'hhg__gate_leaf', 'hhg__open')).toBe(true);
    expect(Ring.holds(s, 'hhg__gateStared', 'party')).toBe(true);
    expect(Ring.holds(s, 'hhg__gateAnswered', 'party')).toBe(false);
  }, 120000);

  it('opens the gate to the knock counted out, finds Neme, and walks out by the front door with her', async () => {
    const s = await Ring.start();
    await Ring.up(s);
    await Ring.act(s, '^To the Slope', 'Ask Sabe about the knocking', 'Knock the eleven at the gate', '^To the front hall');
    expect(Ring.holds(s, 'at', 'hhg__neme', 'hhg__front_hall')).toBe(true);
    expect(Ring.holds(s, 'hhg__nemeTrusts', 'party')).toBe(true);
    expect(Ring.said(await Ring.act(s, 'Ask Neme who she is'))).toContain('By the door');
    await Ring.act(s, 'Take Neme.s hand');
    expect(Ring.holds(s, 'hhg__nemeFree', 'party')).toBe(true);
    expect(Ring.holds(s, 'hhg__doorIn', 'hhg__kezu_bed')).toBe(false);
    expect(reached(s)).toContain('the_front_door');
  }, 120000);

  it('leaves the girl her knocking if you shut the gate, and the house goes on', async () => {
    const s = await Ring.start();
    await Ring.up(s);
    await Ring.act(s, '^To the Slope', 'Ask Sabe about the knocking', 'Knock the eleven at the gate', '^To the front hall', 'Shut the gate again');
    expect(Ring.holds(s, 'hhg__nemeLeft', 'party')).toBe(true);
    expect(Ring.holds(s, 'at', 'party', 'hhg__slope')).toBe(true);
    expect(reached(s)).toContain('the_gate_shut');
  }, 120000);

  it('costs Tobu his place to let her go, if Tobu is asked and is still with you', async () => {
    const s = await Ring.start();
    await Ring.up(s);
    await Ring.act(s, '^To the Slope', 'Ask Sabe about the knocking', 'Knock the eleven at the gate', '^To the front hall');
    expect(Ring.holds(s, 'following', 'hhg__tobu', 'party')).toBe(true);
    await Ring.act(s, 'Ask Tobu to go up and take the child.s chair');
    expect(Ring.holds(s, 'hhg__nemeSits', 'party')).toBe(true);
    expect(Ring.holds(s, 'at', 'hhg__tobu', 'hhg__long_hall')).toBe(true);
    expect(Ring.holds(s, 'hhg__sitting', 'hhg__tobu')).toBe(true);
    expect(reached(s)).toContain('the_chair');
  }, 120000);

  it('carries a Lifted brother\'s letter from the Slope to the reeve, and the vote is lighter by two', async () => {
    const s = await Ring.start();
    await Ring.up(s);
    await Ring.act(s, '^To the Slope', 'Ask Sabe whether she can read the Undal');
    expect(Ring.holds(s, 'knows', 'party', 'hhg__brother_letter')).toBe(true);
    const before = Journey.of(s).measure('hhg__sellVotes', 'hhg__tessa');
    await Ring.act(s, '^To the Long Hall', Ring.look, 'back through the far door', 'Ask Tobu to stay here', '^Wait › A while', 'back through the far door',
      'back through the far door', 'back through the door into the hall of coats', 'Knock on the glass', 'back through the small door',
      'east lip', 'rim of Cobble', 'pond causeway', "reeve.s house");
    expect(Ring.said(await Ring.act(s, 'Give the reeve the Lifted'))).toContain('a thing to be answered');
    expect(Journey.of(s).measure('hhg__sellVotes', 'hhg__tessa')).toBe(before - 2);
  }, 180000);

  it('settles the Knot House riggers without a blow if you carry Sabe\'s token, and her rope across the edge', async () => {
    const s = await Ring.start();
    await Ring.up(s);
    await Ring.act(s, '^To the Slope', 'Ask Sabe about the Netters', 'Ask Sabe for a Netters. token', 'Ask Sabe if she has a rope');
    expect(Ring.holds(s, 'hhg__gaveToken', 'hhg__sabe')).toBe(true);
    expect(Ring.holds(s, 'hhg__gaveRope', 'hhg__sabe')).toBe(true);
  }, 120000);

  it('lets a company that cut the Netters\' knot from below pay the Knot House its fee, or show Sabe\'s knot, rather than fight', async () => {
    const paid = await Ring.start();
    await Ring.up(paid);
    await Ring.act(paid, '^To the dormitory stair', 'light a candle', 'Undo the Netters. knot', 'Out to the foot of Rigging Row');
    expect(Ring.holds(paid, 'hhg__knotBroken', 'hhg__rigging_foot')).toBe(true);
    expect(Ring.holds(paid, 'at', 'hhg__riggers', 'hhg__rigging_foot')).toBe(true);
    expect(Ring.offered(paid, 'Pay the riggers four coin')).toBe(true);
    await Ring.act(paid, 'Pay the riggers four coin');
    expect(Ring.holds(paid, 'hhg__riggersSettled', 'party')).toBe(true);
    const shown = await Ring.start();
    await Ring.up(shown);
    await Ring.act(shown, '^To the Slope', 'Ask Sabe about the Netters', 'Ask Sabe for a Netters. token', '^To the Long Hall',
      '^To the dormitory stair', 'light a candle', 'Undo the Netters. knot', 'Out to the foot of Rigging Row');
    expect(Ring.offered(shown, "Show the riggers Sabe Orrel's knot")).toBe(true);
    await Ring.act(shown, "Show the riggers Sabe Orrel's knot");
    expect(Ring.holds(shown, 'hhg__riggersSettled', 'party')).toBe(true);
    expect(Ring.holds(shown, 'at', 'hhg__riggers', 'hhg__nowhere')).toBe(true);
  }, 120000);

  it('tells the acts as chapters and keeps its outward links and its comedy where a player will find them', async () => {
    const s = await Ring.start();
    const said = Ring.said(await Ring.act(s, 'pond causeway', 'sleeping-hall', 'Ask Wenu about the chalk numbers'));
    expect(said).toContain('Beams Book');
    expect(Ring.holds(s, 'hhg__heardBeams', 'party')).toBe(true);
    const out = Ring.said(await Ring.act(s, 'Out to the pond causeway', 'rim of Cobble', 'east lip', 'flattened barley', 'Ask Dace where the Company sends'));
    expect(out).toContain('Lesser Instruments');
    expect(out).toContain('Low Water');
    const down = Ring.said(await Ring.act(await Ring.start(), 'pond causeway', 'rim of Cobble'));
    expect(down).toMatch(/I\. Cobble Ring|keeps itself awake/);
  }, 120000);
});
