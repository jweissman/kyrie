import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Journey } from '../src/session/journey';
import { Frontier } from '../src/world/frontier';
import { GeneratedWorld } from './support/generated';

// The pieces of evidence that pass between adventures are things a person gives: each must be asked for, offered, and
// taken, as a player would (asked for; given into the company's hands), before it can be carried to a door.
// (A first pass checked that the kinds existed and gave them to the company by the test's hand; this one asks every
// giver.)
describe('what the givers give', () => {
  it('hands over the writ, the rubbing, the letter, the note, the tally and the lens to a company that asks, and the company can take each', async () => {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, { region: { terrain: 'mountain' } });
    const s = await PlaySession.start(w.path, 'thorn', w.source), frontier = new Frontier('thorn', NodeBundleSource.shared);
    const j = Journey.of(s);
    for (const g of ['sennet', 'longman', 'lowwater', 'tolleth', 'skeel', 'tessary']) { await GeneratedWorld.travel(s, `gate_${g}`); await frontier.expand(s.campaign); }
    const gift = async (place: string, facts: [string, ...string[]][], ask: string, kind: string) => {
      j.put('party', place);
      for (const f of facts) { j.assert(...f); }
      await j.play(ask);
      expect(j.holds('holding', 'party', kind)).toBe(true);
    };
    await gift('plongman__nave', [['knows', 'party', 'plongman__charter_read'], ['plongman__valeTold', 'plongman__ysolt']],
      'Ask Mother Ysolt for a fair copy', 'prefects_writ');
    await gift('pskeel__church', [['knows', 'party', 'pskeel__tally_read']], 'Ask Parson Hosken to take a rubbing', 'tally_rubbing');
    // Halm at his dig, as he is by day: the roads of a shaped world bring the company to it after he has gone to the inn.
    j.put('plowwater__halm', 'plowwater__dig');
    await gift('plowwater__dig', [['knows', 'party', 'plowwater__census_read']], 'Ask Halm for a letter of introduction', 'collegium_letter');
    await gift('ptessary__withies', [['knows', 'party', 'ptessary__release_law']], 'Ask the Valuer what a surety owes', 'surety_terms');
    await gift('psennet__rem_count', [['knows', 'party', 'psennet__lamp_lent']], 'Ask Tamsin Quaye whether someone could carry', 'watch_tally');
    await gift('ptolleth__pharos_lamp', [['knows', 'party', 'ptolleth__lens_asked_for']], 'Show Marren Kestle the Watch', 'pharos_lens');
  }, 1200000);
});
