import { describe, expect, it } from 'bun:test';
import { ModuleBundle } from '../src/campaign/module-bundle';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Composer, type Placement } from '../src/world/compose/composer';
import { Composition } from '../src/world/compose/composition';
import { Kits } from '../src/world/compose/kit';
import type { Ledger } from '../src/world/compose/ledger';
import { WorldAssembler } from '../src/world/world-assembler';
import { WhyTool } from '../src/cli/why-tool';
import { ModuleParser } from '../src/lang/module-parser';
import { CanonVocabulary } from '../src/canon/canon-vocabulary';

// People in the assembler's ledger (data/assembly/vocabulary.kyr: practises, dwells): each settlement's folk whose
// work is a craft's, and those a town's author says practise one (Hesper Lowe, data/generation/town/neighbours.kyrt),
// so that a kit of the craft binds whoever already practises it there and need not make someone up (the tinker kit's
// resident). Iscoed as placed, and a census of the kit placed freely in drawn countries: where it binds a resident,
// where it makes one up, and that what it makes up is never a second shop beside one who lives there.
interface Census { towns: number; tended: number; resident: number; passing: number; madeUp: number; beside: number }
class PeopleCensus {
  // Places the tinker kit in a drawn country, unfixed, until no town is left; then counts what it did.
  static async of(seed: string): Promise<Census> {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
    const ledger = (await ModuleBundle.campaign(w.path, w.source, CanonVocabulary.context(), seed)).composition!.ledger;
    const composer = new Composer(ledger, { seed, source: w.source, context: Composition.context(ledger) });
    const kit = await Kits.load(w.source, w.source.resolve('data/kits/tinker/kit.json'));
    const placed: Placement[] = [];
    for (let n = 1; n < 40; n++) {
      const p = composer.place(kit, { kit: 'tinker', id: `census${n}` });
      if (!p) { break; }
      placed.push(p);
    }
    return this.counted(ledger, placed);
  }
  private static counted(ledger: Ledger, placed: Placement[]): Census {
    const tended = (town: string) => ledger.holds('tended', town, 'tinkering');
    const madeUp = placed.filter(p => !p.bindings.practitioner);
    for (const p of placed.filter(x => x.bindings.practitioner)) {
      expect(ledger.holds('dwells', p.bindings.practitioner!, p.bindings.town!)).toBe(true);
    }
    return { towns: ledger.solve(ModuleParser.predicate('settlement(?s)')).length,
      tended: placed.filter(p => tended(p.bindings.town!)).length, resident: placed.length - madeUp.length,
      passing: madeUp.filter(p => p.choices.kind === 'travelling').length, madeUp: madeUp.length,
      beside: madeUp.filter(p => p.choices.kind !== 'travelling' && tended(p.bindings.town!)).length };
  }
}
describe('people in the ledger, and the kits that bind them', () => {
  it('Iscoed: the ledger lists who practises tinkering and where; the kit binds Hesper Lowe and Elfred', async () => {
    const lines: string[] = [];
    expect(await WhyTool.main(['people', '--world', 'iscoed'], l => lines.push(l))).toBe(0);
    expect(lines).toEqual(expect.arrayContaining([
      'region__s1_hesper: practises tinkering, lives at region__s1; bound by tinker#tinker4',
      'region__s2_r5: practises tinkering, lives at region__s2; bound by tinker#tinker5',
      'region__s1_r7: practises tinkering, lives at region__s1',
      'region__s3_r1: practises tinkering, lives at region__s3',
      // The travelling tinker passes through a town with a tinker of its own; the shops are where there is none.
      'tinker#tinker1 at region__s3: travelling, its practitioner made up, beside region__s3_r1, who lives there and practises it',
      'tinker#tinker2 at region__s5: apprentice, its practitioner made up',
      'tinker#tinker3 at region__s4: master, its practitioner made up']));
  }, 120000);
  // Hesper lives in the town the company begins in; begun in Gatesend (the weir's mage), Porthalen has Sabine the
  // tinker at the pump, not no tinker at all (fixed to Hesper, the placement had been refused there, silently).
  it('Iscoed begun elsewhere: Porthalen\'s own tinker bound where Hesper Lowe is not', async () => {
    const lines: string[] = [];
    expect(await WhyTool.main(['people', '--world', 'iscoed', '--as', 'elf/mage/Ilse/scholar'], l => lines.push(l))).toBe(0);
    expect(lines).toContain('region__s1_r7: practises tinkering, lives at region__s1; bound by tinker#tinker4');
    expect(lines.some(l => l.includes('hesper'))).toBe(false);
  }, 120000);
  it('drawn countries: a resident bound wherever one is drawn, and no second shop beside one', async () => {
    const census = await Promise.all(['thorn', 'ash', 'brine'].map(seed => PeopleCensus.of(seed)));
    console.log(JSON.stringify(census));
    for (const c of census) {
      // A town for each placement: one occasion of the craft to a settlement.
      expect(c.resident + c.madeUp).toBe(c.towns);
      expect(c.beside).toBe(0);
    }
    // Residents exist in drawn countries, and the kit binds them rather than making all of its people up.
    expect(census.reduce((n, c) => n + c.resident, 0)).toBeGreaterThan(0);
  }, 240000);
});
