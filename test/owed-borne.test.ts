import { describe, expect, it } from 'bun:test';
import { PlayerView } from '../src/presentation/player-view';
import { Glanced } from './support/glanced';

// What is green inside a talk is green outside it (the owner, 18 November: the wagoner's thanks, two coins, drawn green
// in his talk, and neither his likeness nor his row in the scene said so): someone with something for the company now
// (Owed) is a payoff where the place leads with them, on their likeness and in the people lens, as the act inside is.
describe('a payoff inside a talk is borne outside it', () => {
  it('by the wagoner, once his wheel is out of the ditch', async () => {
    const g = await Glanced.country('a1');
    const heave = PlayerView.choices(g.campaign).find(c => /heave/.test(c.choice.id))!;
    await g.perform(heave.choice.id);
    const glance = g.leaf.glance!, owed = g.screen.people.filter(p => p.owed).map(p => p.id);
    expect(owed).toEqual(['origin__carter']);
    expect(g.screen.paying).toEqual(['origin__carter_thanks']);
    for (const who of owed) {
      expect(glance.likenesses?.[who]?.aspects).toContain('payoff');
      expect(glance.lenses.people.promoted.find(a => a.subject === who)?.aspects).toContain('payoff');
      // And it is for the act that pays: the page finds it inside.
      expect(glance.acts.find(a => a.subject === who)?.inside?.map(i => i.command)).toContain('origin__carter_thanks');
    }
  }, 120000);
});
