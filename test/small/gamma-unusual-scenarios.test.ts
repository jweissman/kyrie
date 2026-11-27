import { describe, expect, it } from 'bun:test';
import { Outcome } from '../../src/presentation/outcome';
import { Tiny } from '../support/tiny';
import { ModuleWriter } from '../../src/lang/module-writer';

const call = (name: string, ...args: string[]) => ModuleWriter.call(name, ...args);
const terrainIds = ['forest', 'marsh', 'mountain', 'frost', 'desert', 'hills',
  'jungle', 'volcanic', 'saltflat', 'reef', 'archipelago'] as const;

function crossing(): string {
  const places = terrainIds.map((terrain, index) => ({ id: `terrain_${index}`, terrain,
    name: `the ${terrain === 'archipelago' ? 'island chain' : terrain}` }));
  const all = [...places, { id: 'floating_city', terrain: 'sky', name: 'Aeral, the floating city' }];
  const declarations = all.map((place, index) =>
    `Place ${place.id} "${place.name}" is ${place.id === 'floating_city' ? 'settlement' : 'room'} ${place.id === 'floating_city' ? 'elsewhere' : `at ${index}, 0 outdoors`}.`).join('\n');
  const facts = all.map(place => `Initially Assert terrain(${place.id}, ${place.terrain}).`).join('\n');
  const passages = all.slice(1).map((place, index) =>
    `Passage leg_${index + 1} "the ${index === all.length - 2 ? 'ascent to Aeral' : `road beyond the ${all[index]!.terrain}`}" `
      + `is ${index === all.length - 2 ? 'portal' : 'overland'} between ${all[index]!.id} and ${place.id} taking ${index + 1} hours.`)
    .join('\n');
  return `
    ${declarations}
    Entity sky: terrainkind "sky".
    Company party "You" of 1 at terrain_0.
    ${facts}
    ${passages}
    Action complete(actor: group) "Name the road's twelve terrains at Aeral" {
      Requires company(actor) and at(actor, floating_city)
        ${all.map(place => `and been(actor, ${place.id}) and terrain(${place.id}, ${place.terrain})`).join('\n        ')}.
      On success { Assert roadCompleted(actor). }
      Result "The chart is whole: low wood, mire, stone, ice, sand, hill, vine, fire, salt, reef, islands, and the skyborne city.".
    }
    Relation roadCompleted(group).
    Goal false.`;
}

const social = (facts: string[] = ['seal_oath', 'cargo_ledger', 'tide_marks'], size = 3) => `
  Place hall "the tidal court" is room at 0, 0 indoors.
  Company party "You" of ${size} at hall.
  Person keeper "the harbour keeper" at hall {
    Role "keeper of the tide-gate". Ancestry human. Peaceable. Pronouns they.
  }
  Discovery seal_oath "The keeper swore the gate would be opened to anyone bringing the old city's seal.".
  Discovery cargo_ledger "The keeper's ledger records a cargo paid for but never entered at the gate.".
  Discovery tide_marks "The cut in the stone and the moon table show that the lower gate is safe for only two hours.".
  ${facts.map(fact => `Initially Assert knows(party, ${fact}).`).join('\n')}
  Relation gateAnswer(group).
  Action persuade(actor: group, site: place) "Persuade the keeper to honour the old seal-oath" {
    Requires able(actor) and at(actor, site) and at(keeper, site) and knows(actor, seal_oath)
      and capable(actor, persuasion) and not gateAnswer(actor).
    Resolve check(actor, persuasion, dc_fair).
    On success { Assert gateAnswer(actor). Assert persuaded(actor). }
    On failure { Assert refused(actor). }
    Result "The keeper lays a hand on the old seal and sends for the key.".
    Otherwise "The keeper says an oath is not a key without the council's word.".
  }
  Action intimidate(actor: group, site: place) "Intimidate the keeper with the cargo ledger" {
    Requires able(actor) and at(actor, site) and at(keeper, site) and knows(actor, cargo_ledger)
      and capable(actor, intimidation) and not gateAnswer(actor).
    Resolve check(actor, intimidation, dc_fair).
    On success { Assert gateAnswer(actor). Assert threatened(actor). }
    On failure { Assert refused(actor). }
    Result "The keeper closes the ledger and orders the lower gate open.".
    Otherwise "The keeper calls two porters and says the Watch may read the ledger too.".
  }
  Action reason(actor: group, site: place) "Reason from the tide marks and the ferry table" {
    Requires able(actor) and at(actor, site) and at(keeper, site) and knows(actor, tide_marks)
      and capable(actor, lore) and not gateAnswer(actor).
    Resolve check(actor, lore, dc_hard).
    On success { Assert gateAnswer(actor). Assert reasoned(actor). }
    On failure { Assert refused(actor). }
    Result "The keeper checks the moon table, the stone, and the clock, then opens the gate at once.".
    Otherwise "The keeper agrees the marks are strange, but not yet enough to risk the boats.".
  }
  Relation persuaded(group). Relation threatened(group). Relation reasoned(group). Relation refused(group).
  Goal false.`;

const threeSkilled = [
  { name: 'Ivo', raceId: 'human' as const, classId: 'warrior' as const },
  { name: 'Mara', raceId: 'human' as const, classId: 'mage' as const },
  { name: 'Tess', raceId: 'human' as const, classId: 'bard' as const }
];

describe('Gamma unusual situations', () => {
  it('crosses every terrain Kyr currently declares before reaching a floating city', async () => {
    const t = await Tiny.start(crossing());
    for (let index = 1; index <= terrainIds.length; index++) {
      const destination = `t__${index === terrainIds.length ? 'floating_city' : `terrain_${index}`}`;
      const choices = t.journey.choices();
      const leg = choices.find(choice => choice.command.startsWith('go(') && choice.command.includes(destination));
      expect(choices.map(choice => choice.command)).toContain(leg?.command);
      await t.perform(leg!.command);
    }
    expect(t.where()).toBe('t__floating_city');
    expect(t.world.test(call('been', 'party', 't__floating_city'))).toBe(true);
    expect(t.world.related('terrain').map(relation => relation.args[1])).toEqual(expect.arrayContaining([
      'forest', 'marsh', 'mountain', 'frost', 'desert', 'hills', 'jungle', 'volcanic',
      'saltflat', 'reef', 'archipelago', 'sky'
    ]));
    await t.play("Name the road's twelve terrains at Aeral");
    expect(t.world.test(call('t__roadCompleted', 'party'))).toBe(true);
  });

  it('offers persuasion, intimidation and reasoning only with the relevant facts and skills', async () => {
    const all = await Tiny.start(social(), { party: threeSkilled });
    const approaches = () => all.journey.choices().filter(choice =>
      /^(t__persuade|t__intimidate|t__reason)\(/.test(choice.command)).map(choice => choice.command.split('(')[0]!);
    expect(approaches().sort()).toEqual(['t__intimidate', 't__persuade', 't__reason']);
    const reasoning = all.journey.choices().find(choice => choice.command.startsWith('t__reason('))!;
    const result = await all.session.leg(reasoning.command);
    expect(['success', 'failure']).toContain(result.result);

    const uninformed = await Tiny.start(social(['seal_oath']), { party: threeSkilled });
    expect(uninformed.journey.choices().some(choice => choice.command.startsWith('t__persuade('))).toBe(true);
    expect(uninformed.journey.choices().some(choice => choice.command.startsWith('t__intimidate('))).toBe(false);
    expect(uninformed.journey.choices().some(choice => choice.command.startsWith('t__reason('))).toBe(false);

    const warriorOnly = await Tiny.start(social(undefined, 1), {
      party: [{ name: 'Ivo', raceId: 'human', classId: 'warrior' }]
    });
    expect(warriorOnly.journey.choices().some(choice => choice.command.startsWith('t__intimidate('))).toBe(true);
    expect(warriorOnly.journey.choices().some(choice => choice.command.startsWith('t__persuade('))).toBe(false);
    expect(warriorOnly.journey.choices().some(choice => choice.command.startsWith('t__reason('))).toBe(false);
  });

  it('gathers thoughts, foresees a deduction and learns it in the same command', async () => {
    const t = await Tiny.start(`
      Place study "the chart-room" is room at 0, 0 indoors.
      Company party "You" of 1 at study.
      Discovery clay "The broken jars carry the orchard's green clay.".
      Discovery tide "That clay appeared at the lower quay only on the two low tides.".
      Discovery route "The jars were carried by the old drain, which opens behind the lower quay.".
      Initially Assert knows(party, clay). Initially Assert knows(party, tide).
      Relation reflecting(group). Relation deduced(group).
      Action gather_thoughts(actor: group, site: place) "Gather your thoughts over the two accounts" {
        Requires able(actor) and at(actor, site) and knows(actor, clay) and knows(actor, tide)
          and not knows(actor, route) and not reflecting(actor).
        Time 1.
        On success { Assert reflecting(actor). }
        Result "You stop looking for another mark and put the two you have beside one another.".
      }
      Rule thoughts_deduce when reflecting(party) and knows(party, clay) and knows(party, tide)
          and not knows(party, route)
          says "Green clay at the quay, twice at the low tide: the jars came through the old drain." teaches route {
        Assert deduced(party).
      }
      Action ask_drain(actor: group) "Ask which cellar joins the old drain" {
        Requires company(actor) and knows(actor, route) and not drainAsked(actor).
        On success { Assert drainAsked(actor). }
      }
      Relation drainAsked(group).
      Goal false.`);
    const action = t.campaign.offered().find(option => option.id.startsWith('t__gather_thoughts('))!;
    expect(Outcome.taught(t.campaign.module, t.campaign.world, action, 'party')).toEqual(['t__route']);
    expect(t.journey.choices().some(choice => choice.command.startsWith('t__ask_drain('))).toBe(false);
    await t.perform(action.id);
    expect(t.world.test(call('knows', 'party', 't__route'))).toBe(true);
    expect(t.world.test(call('t__deduced', 'party'))).toBe(true);
    expect(t.journey.choices().map(choice => choice.command)).toContain('t__ask_drain');
    await t.play('Ask which cellar joins the old drain');
  });
});
