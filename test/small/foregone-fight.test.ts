import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Foregone } from '../../src/ui/foregone';
import { Terminal } from '../../src/cli/terminal';
import { PlayerView } from '../../src/presentation/player-view';
import type { Asking } from '../../src/cli/terminal-input';

// A foregone fight is one act (the first blind playtest, 14 November: six rounds of a fight the game had called
// easily won; BP-01). An attack the reckoning calls easily won is fought through by the company's own tactics, asking
// nothing, unless it turns; a fight of any danger is the player's, turn by turn. The terminal and the page's host read
// the one rule (Foregone). A warrior in a cellar with a rat, and another with an owlbear.
const cellar = (foe: string) => Tiny.start(`
  Place cellar "the cellar" is room at 0, 0.
  Person foe "${foe === 'rat' ? 'a rat' : 'an owlbear'}" at cellar { Role "what is in the cellar". Species ${foe}. }
  Company party "You" of 1 at cellar.`, { party: [{ name: 'Wat', raceId: 'human', classId: 'warrior', level: 2 }] });
const attack = (t: Tiny) => PlayerView.choices(t.campaign).find(r => r.action.schema === 'attack')!.choice;
describe('a foregone fight', () => {
  it('is reckoned so for a rat, and not for an owlbear', async () => {
    const rat = await cellar('rat'), ogre = await cellar('owlbear');
    expect(Foregone.is(rat.screen, attack(rat).id)).toBe(true);
    expect(Foregone.is(ogre.screen, attack(ogre).id)).toBe(false);
  });
  it('is fought through in the terminal without a turn asked of the player', async () => {
    const t = await cellar('rat'), asked: string[] = [], label = attack(t).name;
    const answers = [label], input = { close: () => undefined, ask: async (q: string) => {
      asked.push(q); return answers.shift() ?? 'q';
    } } as Asking;
    const log = console.log, table = console.table;
    console.log = () => undefined; console.table = () => undefined;
    try { await Terminal.play(t.session, { input }); } finally { console.log = log; console.table = table; }
    // The scene's question, then the scene's again after the fight: no turn of it was asked.
    expect(asked).toHaveLength(2);
    expect(t.session.campaign.readout.creatures.find(c => c.id.startsWith('t__foe'))?.state.hp ?? 0).toBeLessThanOrEqual(0);
  });
});
