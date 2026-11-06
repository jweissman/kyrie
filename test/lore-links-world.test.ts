import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Journey } from '../src/session/journey';
import { Frontier } from '../src/world/frontier';
import { GeneratedWorld } from './support/generated';

// The entry points toward Tolleth (doc/imbar/15-lore-ledger.md): a mariner's wife on the Gannet Reach and a Factor in the
// Ossel each hand a company, in a generated world, a thing to carry to Captain Bascom at the Tolleth quay. Asked for,
// and given into the company's hands, as a player would; nothing is set for another module to read by name.
describe('entry points toward Tolleth, in a generated world', () => {
  it('Mother Jago hands over her letter and Factor Sault her packet, to a company that asks', async () => {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, { region: { terrain: 'mountain' } });
    const s = await PlaySession.start(w.path, 'thorn', w.source), frontier = new Frontier('thorn', NodeBundleSource.shared);
    const j = Journey.of(s);
    for (const g of ['skeel', 'tessary']) { await GeneratedWorld.travel(s, `gate_${g}`); await frontier.expand(s.campaign); }
    expect(j.holds('holding', 'party', 'exchange_ledger')).toBe(false);
    j.put('party', 'pskeel__taproom');
    await j.play('Ask Mother Jago whether she has word for anyone on the Tolleth packet');
    expect(j.holds('holding', 'party', 'map')).toBe(true);
    j.put('ptessary__sault', 'ptessary__sault_office');
    j.put('party', 'ptessary__sault_office');
    await j.play('Ask Factor Sault whether anything is wanted carried overseas');
    expect(j.holds('holding', 'party', 'exchange_ledger')).toBe(true);
  }, 1200000);
});
