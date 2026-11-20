import { describe, expect, it } from 'bun:test';
import { Journey } from '../../src/session/journey';
import { SingleModule } from '../../src/campaign/single-module';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../src/campaign/overlay-bundle-source';
import { Binder } from '../../src/world/compose/binder';
import { RandomStreams } from '../../src/random-streams';
import { WhyFact } from '../../src/cli/why-fact';
import { WhyPlacement } from '../../src/cli/why-placement';
import { WhySources } from '../../src/cli/why-sources';
import { WhyWriter } from '../../src/cli/why-writer';

// `kyrie inspect --why` (the maturity track's step 4, the platform maturity study's §7.1): why a fact holds, and why
// a placement won, told from what the engine keeps, not guessed. Its proving slice is a1's corn-store key-holder:
// `--why fact --world a1 "at(region__s1_merchant, ?)"` says Mik is at the shop as play began, the region's line that
// puts him there, and settlement-writer's template that chose the shop over the green; after "Ask Mik about the rats
// in the corn-store", `keyholder(?, region__s1_u_store_lock)` came of that topic, at its line and undertown.kyrt's.
// Here the same, on a world of one module and the fells' kits, so that an account can never name the wrong maker.
class Why {
  static readonly yard = `Module yard "A yard and a shop" {
  Place yard "the yard" is room.
  Place shop "the shop" is room.
  Company party "You" of 1 at yard.
  Person halm "Teodor Halm" at shop { Role "a scholar". Peaceable. Pronouns he. }
  Relation rung(entity).
  Action ring(actor: group, site: place) "Ring the bell" { Requires at(actor, site). On success { Assert rung(site). }
    Result "The bell rings.". }
  Rule halm_comes when rung(yard) and at(halm, shop) says "Halm comes out of the shop." {
    Retract at(halm, shop). Assert at(halm, yard). }
  Goal false.
}`;
  // A fact not yet so, and three ways to it, each shut by something else (MT-13: the AT-09 analysis's held drove).
  static readonly desk = `Module desk "A desk" {
  Place hall "the hall" is room.
  Place yard "the yard" is room.
  Company party "You" of 1 at hall.
  Relation freed(entity). Relation inked(entity).
  Action pay_fine(actor: group, site: place) "Pay the fine" { Requires at(actor, site) and quantity(actor, gold) >= 12.
    On success { Assert freed(actor). } Result "Paid.". }
  Action read_book(actor: group, site: place) "Read the book" {
    Requires at(actor, site) and at(actor, yard) and not inked(actor). On success { Assert freed(actor). } Result "Read.". }
  Action blot(actor: group, site: place) "Blot the page" { Requires at(actor, site) and not inked(actor).
    On success { Assert inked(actor). } Result "Blotted.". }
  Rule pardon when inked(party) and at(party, yard) { Assert freed(party). }
  Goal false.
}`;
  static async fact(fact: string, ...steps: string[]): Promise<string[]> { return this.of(this.yard, fact, ...steps); }
  static async of(kyr: string, fact: string, ...steps: string[]): Promise<string[]> {
    const one = SingleModule.source(kyr), j = await Journey.start(one.campaign, 'why', { source: one.source });
    const asked = WhyFact.resolved(j.campaign.world, WhyFact.parse(fact)!), sources = new WhySources(one.campaign, one.source, 'why');
    return WhyFact.report(j, sources, asked, await WhyFact.play(j, steps, asked));
  }
  // The fells with the raider-hold kit placed with nothing fixed, so that its slots are bound by preference and draw.
  static async loose(seed: string): Promise<WhySources> {
    const source = NodeBundleSource.shared, path = source.resolve('test/fixtures/fells/campaign.json');
    const manifest = JSON.parse(await source.read(path)) as { modules: unknown[] };
    manifest.modules = [manifest.modules[0], { kit: '../../../data/kits/raider-hold/kit.json', id: 'loose' }];
    const at = source.resolve('test/fixtures/fells/loose.campaign.json');
    return new WhySources(at, new OverlayBundleSource(source, { [at]: JSON.stringify(manifest) }), seed);
  }
}

describe('kyrie inspect --why', () => {
  it('says a fact held as play began, and the line that says so', async () => {
    const lines = await Why.fact('at(yard__halm, ?)');
    expect(lines.slice(0, 3)).toEqual(['why at(yard__halm, ?):', '  holds: at(yard__halm, yard__shop)',
      '  held as play began: at(yard__halm, yard__shop)']);
    expect(lines[3]).toMatch(/^ {2}written: single\/\w+\/site\.kyr:5: Person halm "Teodor Halm" at shop \{/);
    expect(lines.at(-1)).toBe('  in play: no step changed it');
  });
  it('says the step and the rule that changed it, where the rule is written', async () => {
    const lines = await Why.fact('at(yard__halm, ?)', 'Ring the bell');
    expect(lines[1]).toBe('  holds: at(yard__halm, yard__yard)');
    expect(lines).toContain('  in play: "Ring the bell" (yard__ring(party,yard__yard)):');
    const moved = lines.filter(l => l.startsWith('    '));
    expect(moved.map(l => l.split(', by ')[0])).toEqual(['    - at(yard__halm, yard__shop)', '    + at(yard__halm, yard__yard)']);
    for (const l of moved) {
      expect(l).toMatch(/by rule yard__halm_comes \(single\/\w+\/site\.kyr:9: Rule halm_comes when/);
    }
  });
  it('says an act made a fact, by the act itself, and what does not hold', async () => {
    expect((await Why.fact('rung(?)', 'Ring the bell')).filter(l => l.includes('rung'))).toEqual(['why yard__rung(?):',
      '  holds: yard__rung(yard__yard)', expect.stringMatching(/^ {4}\+ yard__rung\(yard__yard\), by the act yard__ring\(party,yard__yard\)/)]);
    expect((await Why.fact('rung(?)'))[1]).toBe('  holds: nothing of it');
    expect((await Why.fact('sung(?)'))[1]).toBe('  holds: nothing; nothing in the rules is called sung');
  });
  it('names, for a fact that does not hold, each writer\'s first condition that fails now', async () => {
    const as = ' (as actor party, site desk__hall)', head = ['  could be written by:',
      `    desk__pay_fine: quantity(actor, gold) >= 12${as}`, `    desk__read_book: at(actor, desk__yard)${as}`];
    expect((await Why.of(Why.desk, 'freed(party)')).slice(4)).toEqual([...head, '    rule desk__pardon: desk__inked(party)']);
    // Blotted, the rule waits only on the yard (and the act asked of it is not a writer: it writes inked).
    expect((await Why.of(Why.desk, 'freed(party)', 'Blot the page')).slice(4))
      .toEqual([...head, '    rule desk__pardon: at(party, desk__yard)']);
    expect((await Why.fact('rung(?)')).slice(-2)).toEqual(['  could be written by:',
      '    yard__ring: nothing fails: it can be done now (as actor party, site yard__yard)']);
  });
  // The draw it says chose is the binder's own: the lowest of those best preferred, by the placement's seed.
  it('says why a kit placement won: what each requirement ruled out, the preference, the seeded draw', async () => {
    for (const seed of ['fells', 'moor', 'tarn']) {
      const sources = await Why.loose(seed), lines = await WhyPlacement.report(sources, undefined, 'loose');
      const placed = (await sources.manifest()).composition!.placements[0]!;
      expect(lines[0]).toBe('raider_hold#loose:');
      expect(lines[1]).toStartWith(`  approach = ${placed.bindings.approach}: 5 weighed, 2 fit; ruled out: `);
      const draw = Binder.draw(RandomStreams.key(RandomStreams.key(seed, 'compose', 'raider_hold#loose'),
        'raider_hold#loose', 'approach', placed.bindings.approach!)).toFixed(3);
      expect(lines[2]).toMatch(new RegExp(`the seeded draw chose it \\(${draw}, lowest of ${draw} `));
      expect(lines).toContain('  + taken(' + `${placed.bindings.approach}, raider_hold)`);
    }
    expect(await WhyPlacement.report(await Why.loose('fells'), undefined, 'nowhere')).toEqual(['Nothing was placed as or at nowhere.']);
  });
  it('names the generator whose template wrote a line of generated Kyr, the most particular first', () => {
    expect(WhyWriter.of('  Person s1_merchant "Mik" at s1_shop { Role "salter". Ancestry lizardfolk. Peaceable.'))
      .toEqual([expect.stringMatching(/^src\/world\/settlement-writer\.ts:\d+$/)]);
    expect(WhyWriter.of('Topic s1_u_rats_job_ask with s1_merchant "Ask {s1_merchant} about the rats in the corn-store"'
      + ' when not s1_u_given(s1_u_rats_job) and not s1_u_done(s1_u_rats_job) once {'))
      .toEqual([expect.stringMatching(/^data\/generation\/town\/undertown\.kyrt:\d+$/)]);
  });
});
