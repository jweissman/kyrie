import { describe, expect, it } from 'bun:test';
import { PlayerView } from '../src/presentation/player-view';
import { Glanced } from './support/glanced';
import { Voice } from '../src/narrative/voice';
import { VoiceContext } from '../src/narrative/voice-context';

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
      // And spoken to, they take it as that, not as a stranger with a question (cold play 3, CL-22: Leif grinning
      // "before you have said anything at all" after the solemn reckoning he had paid for).
      const context = VoiceContext.of(g.campaign, { kind: 'address', actor: who }, new Set());
      expect(context.owing).toBe('yes');
      expect(Voice.tiers('address', context)[0]!.map(l => l.id).every(id => id.startsWith('address.owing.'))).toBe(true);
    }
  }, 120000);
});
