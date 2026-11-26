import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { SceneModel } from '../../src/ui/scene';
import { ScreenModel } from '../../src/ui/screen-model';
import { Canon } from '../../src/canon/canon';
import { CanonVocabulary } from '../../src/canon/canon-vocabulary';
import { LocalKinds } from '../../src/canon/local-catalog';
import { PlayerView } from '../../src/presentation/player-view';
import type { CreatureStore } from '../../src/creature-store';

// An author's own kind of thing that does something when it is used (OB-07; mission-22 brief Phase 4B: "a custom item
// with real properties and effects, authored in Kyr without modifying a global catalog"). `using "…"` is the effect
// language, read as the module is; the shared rules' use_item uses it up on whoever it is used on (Items.consume), as
// it does the catalogue's own remedies. Nothing in data/catalog names it.
const yard = (use = 'Heal (2d4) health to ally.', base = 'is consumable') => `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Kind day_tonic "a day tonic" ${base} worth 3 using "${use}" described "A stoppered bottle of something warm.".
  Item tonic "a day tonic" is day_tonic at yard.`;
const hp = (t: Tiny) => t.campaign.readout.creatures.find(c => c.id === 't__party_1')!.state;
const hurt = (t: Tiny, by: number) => {
  const lease = (t.campaign as unknown as { creatures: CreatureStore }).creatures.acquire(['t__party_1']);
  try { lease.creatures[0]!.state.hp -= by; lease.commit(lease.creatures); } finally { lease.release(); }
};
const names = (t: Tiny) => PlayerView.choices(t.campaign).map(r => r.choice.name);
const carried = (t: Tiny) => (hp(t).inventory ?? []).filter(i => i.definition === 'day_tonic').length;

describe('a kind of the module\'s own, used', () => {
  it('requires a use for a consumable unless it inherits one or an unsupported use', () => {
    const vocabulary = CanonVocabulary.scoped(), capabilities = new Set<string>();
    expect(() => vocabulary.item('test', { id: 'inert', name: 'inert',
      base: { category: 'consumable' } }, capabilities)).toThrow('a consumable needs a use');
    expect(vocabulary.item('test', { id: 'inherited', name: 'inherited', base: { like: 'ale' } }, capabilities).use)
      .toBe(Canon.items.ale!.use);
    expect(vocabulary.item('test', { id: 'unsupported', name: 'unsupported',
      base: { like: 'scroll_of_shapechange' } }, capabilities).unsupported?.use).toBeTruthy();
  });
  it('is declared with its use, and no catalogue file names it', async () => {
    const t = await Tiny.start(yard());
    const tonic = t.campaign.vocabulary?.itemDefinition('day_tonic');
    expect([tonic?.category, tonic?.use, tonic?.value])
      .toEqual(['consumable', 'Heal (2d4) health to ally.', 3]);
    expect(tonic?.source).toEqual({ kyr: true, notes: 'Declared by the module t.' });
  });

  it('is used on one who is hurt, mends them by its dice, and is used up', async () => {
    const t = await Tiny.start(yard());
    await t.play('Take');
    expect(carried(t)).toBe(1);
    // Whole, it does nothing for anyone, and is not offered.
    expect(names(t).filter(n => /use a day tonic|day tonic: Use/.test(n))).toEqual([]);
    hurt(t, 6);
    await t.play('Wait a while');
    const before = hp(t).hp;
    // One way to tend her: the row is that way, done at once, not a fold of one (GR-16: "Tend Aldith" pressed twice
    // had opened its one way out of sight and closed it again, nothing tended and nothing said).
    const [tend, ...more] = SceneModel.build(ScreenModel.build(t.campaign)).you.filter(c => c.id.startsWith('mend:'));
    expect(more).toEqual([]);
    expect(tend).toMatchObject({ label: 'Tend Ama: use a day tonic', command: expect.stringMatching(/^use_item\(/) });
    expect(tend!.children).toBeUndefined();
    await t.play('Tend Ama: use a day tonic');
    const healed = hp(t).hp - before;
    expect(healed).toBeGreaterThanOrEqual(2);
    expect(healed).toBeLessThanOrEqual(8);
    expect(carried(t)).toBe(0);
  });

  it('keeps tending from the screen catalog when another campaign becomes active', async () => {
    const t = await Tiny.start(yard());
    await t.play('Take'); hurt(t, 6); await t.play('Wait a while');
    const screen = ScreenModel.build(t.campaign);
    const other = LocalKinds.item('other', { id: 'day_tonic', name: 'fire',
      base: { category: 'consumable' }, use: 'Deal (1d6) fire damage to enemy.' });
    LocalKinds.activate({ items: { day_tonic: other } });
    try {
      expect(SceneModel.build(screen).you.find(c => c.id.startsWith('mend:'))?.label)
        .toBe('Tend Ama: use a day tonic');
    } finally { LocalKinds.reset(); }
  });

  it('refuses at once an effect the language does not read, or a use on what is not used up', async () => {
    await expect(Tiny.start(yard('Mend a bit.'))).rejects.toThrow(/Kind day_tonic is using "Mend a bit\."/);
    await expect(Tiny.start(yard(undefined, 'is gear'))).rejects
      .toThrow('Kind day_tonic is using: what is used up is consumable, not gear');
  });
});
