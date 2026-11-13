import { afterAll, describe, expect, it } from 'bun:test';
import animals from '../data/catalog/animals.json';
import monsters from '../data/catalog/monsters.json';
import devices from '../data/catalog/devices.json';
import { Defenses, type Defense } from '../src/rules/defenses';
import { Fighting } from '../src/rules/fighting';
import { Canon } from '../src/canon/canon';
import { Content } from '../src/content';
import { Effects, type EffectContext } from '../src/effects';
import { Expressions } from '../src/expressions';
import { LocalKinds } from '../src/canon/local-catalog';
import { KindDefenses } from '../src/kind-defenses';
import { CombatTelling } from '../src/ui/combat-telling';
import type { Modifiers } from '../src/rules/modifiers';
import type { CombatEvent, Fighter } from '../src/model';
import type { Species } from '../src/canon/schema';

// Typed defenses with bypasses (the SRD adaptation briefing, §3), in their explicit order: immunity, the summed
// fraction, the best flat resistance, the best reduction the blow does not pass; then regeneration at the turn's end,
// unless harm of a kind it cannot mend struck. Each defense is crossed with an attack it holds against and one that
// passes it, and the event names what held or passed.
const physical = Canon.rules.physicalDamage;
const blow = (type: string, tags: string[] = []) => ({ amount: 15, bonus: 0, type, tags: [type, ...tags], physical });
const rows: [string, Defense[], Modifiers, ReturnType<typeof blow>, number, string][] = [
  ['immunity to fire, against fire', [{ kind: 'immunity', to: ['fire'] }], {}, blow('fire'), 0, 'immunity'],
  ['immunity to fire, against a blade', [{ kind: 'immunity', to: ['fire'] }], {}, blow('slashing'), 15, ''],
  ['immunity to fire, against true harm', [{ kind: 'immunity', to: ['all'] }], {}, blow('true'), 15, ''],
  ['fire 10, against fire', [{ kind: 'resistance', to: ['fire'], amount: 10, mode: 'flat' }], {}, blow('fire'), 5,
    'resistance'],
  ['fire 10, against cold', [{ kind: 'resistance', to: ['fire'], amount: 10, mode: 'flat' }], {}, blow('cold'), 15, ''],
  ['fire 10 and 5, the best holds', [{ kind: 'resistance', to: ['fire'], amount: 10, mode: 'flat' },
    { kind: 'resistance', to: ['fire'], amount: 5, mode: 'flat' }], {}, blow('fire'), 5, 'resistance'],
  ['half fire (a fraction), against fire', [], { resistances: { fire: 0.5 } }, blow('fire'), 7, ''],
  ['half fire (a fraction), against a blade', [], { resistances: { fire: 0.5 } }, blow('slashing'), 15, ''],
  ['10/silver, against steel', [{ kind: 'reduction', amount: 10, unless: ['silver'] }], {}, blow('slashing',
    ['manufactured']), 5, 'reduction'],
  ['10/silver, against silver', [{ kind: 'reduction', amount: 10, unless: ['silver'] }], {}, blow('slashing',
    ['silver', 'manufactured']), 15, 'passed:silver'],
  ['10/silver, against fire (a reduction turns blows)', [{ kind: 'reduction', amount: 10, unless: ['silver'] }], {},
    blow('fire'), 15, ''],
  ['10/magic, against a spell', [{ kind: 'reduction', amount: 10, unless: ['magic'] }], {}, blow('bludgeoning',
    ['spell', 'magic']), 15, 'passed:magic'],
  ['5/bludgeoning, against a club', [{ kind: 'reduction', amount: 5, unless: ['bludgeoning'] }], {},
    blow('bludgeoning'), 15, 'passed:bludgeoning'],
  ['5/bludgeoning, against a spear', [{ kind: 'reduction', amount: 5, unless: ['bludgeoning'] }], {},
    blow('piercing'), 10, 'reduction'],
  ['10/silver beside Orsino\'s reduction 3, silver passes the ten, the three holds', [{ kind: 'reduction', amount: 10,
    unless: ['silver'] }], { damageReduction: 3 }, blow('slashing', ['silver']), 12, 'passed:silver'],
];
describe('each defense, against an attack it holds and one that passes it', () => {
  it.each(rows)('%s', (...[, defenses, modifiers, hit, amount, account]) => {
    const m = Defenses.mitigate(hit, modifiers, defenses);
    expect(m.amount).toBe(amount);
    const said = [...(m.guarded ?? []).map(g => g.defense), ...(m.bypassed ?? []).map(b => `passed:${b.by}`)];
    if (account) { expect(said).toContain(account); } else { expect(m.guarded ?? []).toEqual([]); }
  });
});

// The old mitigation, as it was before defenses (Fighting.mitigate at 1733c9e4): the oracle the translated canon must
// agree with, blow for blow, for every creature the catalogs have.
const before = (blow: { amount: number; type: string; bonus: number }, r: Record<string, number>, dr: number) => {
  const { amount, type, bonus } = blow;
  let damage = Math.max(0, amount + bonus);
  if (type === 'true') { return damage; }
  const resistance = (r.all ?? 0) + (r[type] ?? (physical.includes(type) ? r.physical ?? 0 : 0));
  if (resistance > 0) { damage = Math.floor(damage * (1 - Math.min(1, resistance))); }
  else if (resistance < 0) { damage = Math.floor(damage * (1 + Math.abs(resistance))); }
  return Math.max(0, damage - dr);
};
const written = { ...animals.species, ...monsters.species, ...devices.devices } as unknown as Record<string, Species>;
describe('the old resistances, translated to defenses as the canon loads', () => {
  it('give every kind the fractions its record wrote, and no other defense', () => {
    for (const [id, raw] of Object.entries(written)) {
      if (raw.variantOf || raw.defenses) { continue; }
      expect([id, Defenses.fractions(Canon.creature(id).defenses)]).toEqual([id, raw.resistances ?? {}]);
      expect(Canon.creature(id).resistances).toBeUndefined();
    }
  });
  it('mitigate every blow of a table the same as before, for every kind', () => {
    const content = new Content('defenses-before'), types = [...Canon.rules.damageTypes];
    let compared = 0;
    // Every kind but those that state typed defenses of their own (the unicorn), which had none before.
    for (const id of Object.keys(written).filter(id => !Canon.creature(id).requires && Canon.isSpecies(id)
      && !written[id]!.defenses)) {
      const f = content.creature(id, id, 'goblins'), m = Effects.modifiers(f), defenses = KindDefenses.of(f);
      // Its summed fractions are what they were: its kind's, translated, are its record's (above).
      const old = m.resistances ?? {};
      for (const type of types) {
        for (const [amount, bonus] of [[0, 0], [1, 0], [7, 2], [15, 0], [40, -3]] as const) {
          const now = Fighting.mitigate(amount, type, { bonus, defender: m, physical, defenses }).amount;
          expect([id, type, amount, now]).toEqual([id, type, amount, before({ amount, type, bonus }, old,
            m.damageReduction ?? 0)]);
          compared++;
        }
      }
    }
    expect(compared).toBeGreaterThan(5000);
  });
});
// Regeneration is a defense read at the end of its holder's turn: it mends unless harm of a kind it cannot mend
// struck it since (a troll and fire). A kind declared for this spec alone, as a module declares its own.
describe('regeneration', () => {
  LocalKinds.install({ species: { t_troll: { ...Canon.creature('wolf'), name: 'Troll',
    defenses: [{ kind: 'regeneration', amount: 5, stoppedBy: ['fire', 'acid'] }], source: { kyr: true } } } });
  afterAll(() => LocalKinds.reset());
  const content = new Content('regeneration'), expressions = new Expressions('regeneration');
  const turn = (troll: Fighter): CombatEvent[] => {
    const events: CombatEvent[] = [];
    Effects.turnEnd(troll, { fighters: [troll], turn: 1, events, content, abilities: [], retreat: false,
      location: null, expressions } as EffectContext);
    return events;
  };
  it('mends a blade\'s harm and not fire\'s, and the telling says what stopped it', () => {
    const troll = { ...content.creature('t_troll', 'troll', 'goblins'), name: 'the troll', hp: 40, maxHp: 40 };
    const context = { fighters: [troll], turn: 1, events: [] as CombatEvent[], content, abilities: [], retreat: false,
      location: null, expressions, source: { id: 'trap', kind: 'trap' } } as EffectContext;
    Effects.damage(troll, { amount: 12, type: 'slashing' }, context);
    const hurt = troll.hp;
    expect(turn(troll).some(e => e.type === 'heal' && e.amount === 5)).toBe(true);
    expect(troll.hp).toBe(Math.min(troll.maxHp, hurt + 5));
    Effects.damage(troll, { amount: 6, type: 'fire' }, context);
    // It may burn besides (fire's own condition, at its turn's end); it does not mend.
    const burned = troll.hp, stopped = turn(troll);
    expect(troll.hp).toBeLessThanOrEqual(burned);
    expect(stopped.filter(e => e.type === 'heal')).toEqual([expect.objectContaining({ amount: 0, stoppedBy: 'fire' })]);
    const told = CombatTelling.exchanges(stopped, { combatants: [troll], turn: 1, actor: '', outcome: null });
    expect(told.map(t => t.text).join(' ')).toContain('The fire stops the troll\'s mending.');
    // While it burns, its burning is fire at each turn's end, and it does not mend; put out, it mends again.
    expect(turn(troll).filter(e => e.type === 'heal')).toEqual([expect.objectContaining({ stoppedBy: 'fire' })]);
    troll.statuses = [];
    expect(turn(troll).some(e => e.type === 'heal' && e.amount === 5)).toBe(true);
  });
});

describe('the telling names what passed a guard', () => {
  it('says silver passed it, and what a flat resistance turned', () => {
    const state = { combatants: [{ id: 'u', name: 'the unicorn', team: 'goblins' } as Fighter], turn: 1, actor: '',
      outcome: null };
    const hit = (modifiers: object): CombatEvent => ({ type: 'damage', turn: 1, actor: 'x', target: 'u', rolled: 9,
      amount: 9, hp: 30, damageType: 'slashing', modifiers: { bonus: 0, resistance: 0, reduction: 0, ...modifiers } });
    const passed = CombatTelling.exchanges([hit({ bypassed: [{ defense: 'reduction', amount: 10, by: 'silver' }] })], state);
    expect(passed[0]!.text).toContain('Silver passes the unicorn\'s guard.');
    const turned = CombatTelling.exchanges([hit({ guarded: [{ defense: 'resistance', amount: 10, to: 'cold' }] })], state);
    expect(turned[0]!.text).toContain('The unicorn turns 10 of the slashing.');
  });
});
