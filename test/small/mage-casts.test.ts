import { describe, expect, it } from 'bun:test';
import { Content } from '../../src/content';
import { CreatureStore } from '../../src/creature-store';
import { Battle } from '../../src/battle';
import { Tactics } from '../../src/tactics';
import { CombatModel } from '../../src/ui/combat-model';
import { ChoiceList } from '../../src/ui/choice-list';
import { TerminalFight } from '../../src/cli/terminal-fight';
import { Creation } from '../../web/engine/creation';
import { CreationFlow } from '../../web/engine/creation-flow';
import type { Setting } from '../../web/engine/protocol';
import type { Choice } from '../../src/ui/choice-list';
import type { Asking } from '../../src/cli/terminal-input';

// A mage casts what the calling promised (the owner, 15 November, P0: a mage made at creation, of the warding school,
// could not cast Magic Missile at the rats nor Mage Armor on itself, and died trying). Its two slots had been prepared
// with the first spells it learned, and a slot cast only the spell it held; the rest said "no spell of its level left".
// A mage as creation makes one, a companion, two rats: Magic Missile at a rat (a foe), Mage Armor on itself, Arcane
// Ward on the companion (a friend), each offered by the page's fight menu and by the terminal's, and each cast.
const names = { human: { she: ['Wenna'], he: ['Hamo'], they: ['Wren'] } };
const setting: Setting = { title: 'Merscfaenn', generated: true, pitch: { heading: '', text: '' },
  origins: [{ id: 'debt', title: 'A debt', choice: 'You owe money' }], names,
  party: [Creation.protagonist('human', 'mage-casts', names)] };
const made = () => {
  const flow = new CreationFlow(setting, Creation.catalog());
  flow.choose('calling', 'mage');
  const school = Creation.catalog().callings.find(c => c.id === 'mage')!.specializations.find(s => s.id === 'abjurer')!;
  flow.choose('specialty', school.id);
  return flow.member;
};
const fight = () => {
  const content = new Content('mage-casts');
  const store = new CreatureStore([content.createCreature('wiz', { ...made(), level: 1 } as never),
    content.createCreature('pal', { raceId: 'human', classId: 'warrior', level: 1 }),
    ...['r1', 'r2'].map(id => content.createCreature(id, { raceId: 'rat' }))]);
  const battle = Battle.encounter(store, [{ creatureId: 'wiz', team: 'fighters' }, { creatureId: 'pal', team: 'fighters' },
    ...['r1', 'r2'].map(creatureId => ({ creatureId, team: 'goblins' as const }))], { seed: 'mage-casts' });
  for (let i = 0; i < 20 && battle.state.actor !== 'wiz'; i++) {
    battle.step(Tactics.choose(battle.state, battle.plain(battle.legalCommands())));
  }
  return battle;
};
// The page's spells, folds opened: each spell's commands, by whom it can be cast at.
const offered = (battle: Battle): Map<string, Choice> => {
  const spells = ChoiceList.combat(CombatModel.build(battle)).find(s => s.id === 'spells')?.choices ?? [];
  return new Map(spells.flatMap(c => /^more:/.test(c.id) ? c.children ?? [] : [c]).map(c => [c.label.split(' → ')[0]!, c]));
};
const at = (c: Choice | undefined): string[] => c?.children?.flatMap(t => t.command ? [t.command] : [])
  ?? (c?.command ? [c.command] : []);

describe('a mage made at creation, against rats', () => {
  it('is offered Magic Missile at each rat, Mage Armor (on itself, nothing to choose), and Arcane Ward on itself or its companion', () => {
    const battle = fight(), spells = offered(battle);
    expect(battle.state.actor).toBe('wiz');
    for (const name of ['Magic Missile', 'Mage Armor', 'Arcane Ward']) {
      expect([name, spells.get(name)?.disabled]).toEqual([name, undefined]);
    }
    expect(at(spells.get('Magic Missile'))).toEqual(['magic_missile>r1', 'magic_missile>r2']);
    expect(at(spells.get('Mage Armor'))).toEqual(['armor>']);
    expect(at(spells.get('Arcane Ward')).sort()).toEqual(['ward>pal', 'ward>wiz']);
  });
  it('casts each: the missile strikes a rat, the armour is on the mage, the ward on the companion', () => {
    for (const [ability, target, said] of [['magic_missile', 'r1', 'damage'], ['armor', 'wiz', 'status'],
      ['ward', 'pal', 'status']] as const) {
      const battle = fight(), events = battle.step({ actor: 'wiz', ability, target });
      expect([ability, events.some(e => e.type === said && 'target' in e && e.target === target)])
        .toEqual([ability, true]);
    }
  });
  it('casts Magic Missile in the terminal by its name and a rat\'s number', async () => {
    const battle = fight(), answers = ['Magic Missile', '2'], log = console.log, table = console.table;
    const input = { close: () => undefined, ask: async () => answers.shift() ?? 'q' } as Asking;
    console.log = () => undefined; console.table = () => undefined;
    try {
      const command = await TerminalFight.command(battle.state, battle.legalCommands(), input);
      expect(command).toMatchObject({ actor: 'wiz', ability: 'magic_missile', target: 'r2' });
      expect(battle.step(command!).some(e => e.type === 'damage' && e.target === 'r2')).toBe(true);
    } finally { console.log = log; console.table = table; }
  });
});
