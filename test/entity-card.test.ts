import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { EntityCard } from '../src/presentation/entity-card';
import { ModuleWriter } from '../src/lang/module-writer';
import { Narrator } from '../src/presentation/narrator';
import { ScreenModel } from '../src/ui/screen-model';

// The entity card prototype (the forward-design record's first): one thing as the company knows it, or as the engine
// holds it, read from the entity, the company's knowledge and the typed actions offered on it; the act the page leads
// with and what an act would change come from the same rows.
describe('an entity card', () => {
  it('says what the company knows, and only that, and what it could do and would change', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'Ralf', raceId: 'human',
      classId: 'warrior' }] }, NodeBundleSource.shared);
    const c = s.campaign, tuck = EntityCard.of(c, 'region__s1_merchant')!;
    // Tuck, before the company: what it owes him, and what it could do, led as the page leads it.
    expect([tuck.name, tuck.here, tuck.ties]).toEqual(['Tuck, woodwright', true, ['inDebtTo(party, region__s1_merchant)']]);
    const led = Narrator.leaf(c, ScreenModel.build(c)).glance!.acts.find(a => a.subject === 'region__s1_merchant')!;
    expect(tuck.acts.find(a => a.choice === led.command)?.why).toBe(led.why);
    expect([tuck.truth, tuck.acts.some(a => a.changes)]).toEqual([undefined, false]);
    // As the engine holds him: each question's answer is a fact the company would come to know.
    const asked = EntityCard.of(c, 'region__s1_merchant', 'author')!.acts.filter(a => /^ask\(/.test(a.choice));
    expect(asked.length).toBeGreaterThan(0);
    for (const a of asked) { expect(a.changes!.some(x => /^\+ knows\(party, /.test(x))).toBe(true); }
    // A place known only by its look until its name is known: the card says the look, and nothing behind it.
    const mound = EntityCard.of(c, 'region__w1')!;
    expect([mound.name, mound.known]).toEqual(['a long mound north of Thornhaven', []]);
    expect(EntityCard.of(c, 'region__w1', 'author')!.truth!.alias).toBe('a long mound north of Thornhaven');
    // Told its name, the card names it, and says what told it.
    const w = c as unknown as { world: { apply(x: unknown[]): unknown }; commit(x: unknown): void };
    w.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', 'region__w1_named') }]));
    const named = EntityCard.of(c, 'region__w1')!;
    expect([named.name, named.known.map(k => k.id)]).toEqual(['the sorrow rest', ['region__w1_named']]);
  }, 120000);
});
