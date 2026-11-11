import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { Travel } from '../src/session/travel';
import { Glanced } from './support/glanced';

// A trap survived leaves a game that can be played on (the owner's play of 11 November: a rune went off, the company
// lived, and then the page offered nothing, and the map set out and came back to where it lay). A rune that hurts and
// puts the company to sleep: the page leads with the one thing it can do, says what holds it, refuses a journey in
// those words, keeps it so across a save, and gives the ways back once it wakes.
class Rune {
  static start() {
    return PlaySession.start('test/fixtures/probes/sleep-rune/probe.campaign.json', 'rune', NodeBundleSource.shared);
  }
  static ids(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
  static async sprung() {
    const s = await this.start();
    await s.leg(this.ids(s).find(id => id.startsWith('risk('))!);
    return s;
  }
}

describe('a trap survived', () => {
  it('leads with lying as you are, and says who is asleep', async () => {
    const s = await Rune.sprung(), g = Glanced.of(s), me = g.screen.party[0]!;
    expect(me.hp).toBeLessThan(me.maxHp);
    expect(me.hp).toBeGreaterThan(0);
    expect(Rune.ids(s)).toEqual(['lie_still']);
    expect(g.glance.acts.map(a => [a.label, a.why, a.aspects])).toEqual([['Lie as you are', 'helpless', []]]);
    expect(g.glance.need).toEqual(['Hild: asleep']);
  }, 60000);
  it('refuses a journey in words that say why, and goes nowhere', async () => {
    const s = await Rune.sprung();
    const done = await Travel.go({ campaign: s.campaign, perform: c => s.perform(c) }, 'p__hall');
    expect(done).toMatchObject({ legs: [], arrived: false, stopped: 'You cannot move until what holds you passes' });
    await s.leg('travel:p__hall');
    expect(s.campaign.world.one('at', 'party')).toBe('p__gallery');
  }, 60000);
  it('wakes, kept across a save, with the way back and a journey that goes', async () => {
    const s = PlaySession.resume(JSON.parse(JSON.stringify((await Rune.sprung()).checkpoint())));
    expect(Rune.ids(s)).toEqual(['lie_still']);
    for (let i = 0; i < 12 && Rune.ids(s).includes('lie_still'); i++) { await s.leg('lie_still'); }
    expect(Rune.ids(s)).toContain('go(p__gate,p__hall)');
    expect(Glanced.of(s).screen.party[0]!.conditions).toEqual([]);
    await s.leg('travel:p__hall');
    expect(s.campaign.world.one('at', 'party')).toBe('p__hall');
  }, 60000);
});
