import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Tiny } from '../support/tiny';

const source = readFileSync('data/goings-on/theemptyseat/siege.kyr', 'utf8');
const site = readFileSync('data/goings-on/theemptyseat/site.kyr', 'utf8');
const claim = source.match(/ {2}Topic crown_aled_witnessed\b[\s\S]*?\n {2}}/)?.[0];
if (!claim) { throw new Error('Missing the witnessed Empty Seat claim'); }
const present = source.match(/ {2}Query courtPresent\b[\s\S]*?\.\n/)?.[0];
if (!present) { throw new Error('Missing the court presence query'); }
const replies = source.match(/ {2}Observe cadi_(?:reply|refusal|outside|after)\b[\s\S]*?\.\n/g);
if (replies?.length !== 4) { throw new Error('Missing the private council and aftermath scenes'); }
const block = (text: string, kind: string, id: string) => {
  const found = text.match(new RegExp(`  ${kind} ${id}\\b[\\s\\S]*?\\n  }`))?.[0];
  if (!found) { throw new Error(`Missing Empty Seat ${id}`); }
  return found;
};
const hall = `
  Place ward "the ward" is settlement at 0, 0.
  Place oath_hall "the oath hall" is room within ward at 0, 0 outdoors.
  Place cottages "the cottages outside the wall" is settlement at 3, 0.
  Place guild_hall "the safehouse" is room within cottages at 1, 0 outdoors.
  Place palace_kitchen "the palace kitchen" is room within ward at 0, 1 outdoors.
  Passage kitchen_door "the kitchen door" is door between oath_hall and palace_kitchen.
  Place north_gate "the gate" is room within ward at 2, 0 outdoors.
  Company party "You" of 1 at oath_hall.
  Person gareth "Gareth" at oath_hall { Role "the heir". Peaceable. }
  Person guildkeeper "Hest" at oath_hall { Role "the keeper". Peaceable. }
  Entity refugees: group "the refugee carts".
  Entity gareth_refuses: fact "Gareth will not buy the crown with his brother's life.".
  Entity goose_prize: fact "The company is Deputy Inspector of Geese.".
  Relation watchPledged(group). Relation pledgedWatchArrived(group). Relation cartsCounted(group).
  Relation ordersGiven(group). Relation compactMade(group). Relation siegeSettled(group).
  Measure escortReserve(place). Measure gateEscorts(place). Measure stores(place). Measure wardDefence(place).
  Measure assaultAt(group). Measure assaultStrength(place).
  Initially Set escortReserve(ward) to 1. Initially Set gateEscorts(ward) to 2.
  Initially Set stores(ward) to 3. Initially Assert at(refugees, north_gate).
  Initially Set assaultStrength(ward) to 5.
  Action prepare(actor: group) "Begin the preparations" {
    Requires at(actor, oath_hall). Time 0.
    On success { Assert befell(ri_succession_open). Assert befell(ri_heir_revealed).
      Assert guild_member(actor). }
  }
  Query gateWatchReady() means escortReserve(ward) >= gateEscorts(ward).
  Action first_shot(actor: group) "Hear the first shot" {
    Requires at(actor, oath_hall) and not befell(ri_siege_begun).
    On success { Assert befell(ri_siege_begun). Set assaultAt(party) to watch(clock) + 8. }
  }
  Occasion council "the council" at oath_hall when befell(ri_siege_begun) {
    Matter shelter "Bring the carts in?" for 1 hour until ordersGiven(party).
    Matter war_command "Whose orders?" for 1 hour until compactMade(party).
    Closes "The captain leaves.".
  }`;
const options = { rules: ['world', 'venturing'],
  canon: ['ri_succession_open', 'ri_heir_revealed', 'ri_siege_begun', 'ri_refugees_admitted',
    'ri_refugees_barred', 'ri_succession_fractured'] };

describe('earlier mathematical testimony', () => {
  it('makes Halm’s early reports and caution yield a real diagram that Mared can use', async () => {
    const halm = readFileSync('data/adventures/low-water/halm.kyr', 'utf8');
    const expedition = readFileSync('data/goings-on/theemptyseat/expedition.kyr', 'utf8');
    const comparison = expedition.match(/^ {2}Entity iv_compare:.*$/m)?.[0];
    if (!comparison) { throw new Error('Missing Mared’s comparison'); }
    const declarations = halm.match(new RegExp(
      '^ {2}(?:Discovery (?:scholar_met|instrument_reports|mathematical_warning|census_read)'
      + '|Item halm_(?:letter|intro_rubbing))\\b.*$', 'gm'));
    if (declarations?.length !== 6) { throw new Error('Missing Halm’s evidence and introduction'); }
    const t = await Tiny.start(`
      Place yard "the yard" is room at 0, 0 outdoors. Entity nowhere: place "out of sight".
      Company party "You" of 1 at yard.
      Person halm "Teodor Halm" at yard { Role "the scholar". Peaceable. }
      Person mared "Mared" at yard { Role "the mathematician". Peaceable. }
      Relation letterWritten(group). Relation comparedRubbing(group).
      ${comparison}
      ${declarations.join('\n')}
      ${['halm_hello', 'halm_collegium', 'halm_age', 'halm_letter_ask'].map(id => block(halm, 'Topic', id)).join('\n')}
      ${block(expedition, 'Topic', 'mared_rubbing')}
    `);
    expect(t.journey.find('Ask Halm for a letter')).toBeUndefined();
    await t.play('Ask the scholar who he is', 'Ask Halm about the Collegium');
    expect(t.journey.find('Ask Halm for a letter')).toBeUndefined();
    await t.play('Ask Halm what the Mathematical Age was', 'Ask Halm for a letter', 'Show Mared a Mathematical rubbing');
    expect(t.journey.holds('knows', 'party', 'census_read')).toBe(false);
    expect(t.journey.holds('carries', 'party', 'halm_intro_rubbing')).toBe(true);
    expect(t.journey.holds('comparedRubbing', 'party')).toBe(true);
  });
});
describe('the Empty Seat pays off its conversations', () => {
  it('requires the company to know it and the witness to be present, not merely a remembered flag', async () => {
    for (const [where, knows, offered] of [
      ['waiting_room', true, false], ['oath_hall', false, false], ['oath_hall', true, true],
    ] as const) {
      const t = await Tiny.start(`
        Place oath_hall "the oath hall" is room at 0, 0 outdoors.
        Place waiting_room "the waiting room" is room at 1, 0 outdoors.
        Company party "You" of 1 at oath_hall.
        Person aled "Aled" at oath_hall { Role "the heir". Peaceable. }
        Person burned_guest "the witness" at ${where} { Role "a returning witness". Peaceable. }
        Entity burned_confidence: fact "The visitor will stand beside Nerys.".
        Relation guestConfided(group). Relation crowned(group).
        Initially Assert guestConfided(burned_guest).
        Initially Assert established(burned_confidence).
        ${knows ? 'Initially Assert knows(party, burned_confidence).' : ''}
        Action prepare(actor: group) "Begin the council" {
          Requires at(actor, oath_hall). Time 0.
          On success { Assert befell(ri_evidence_sacrificed). Assert befell(ri_refugees_admitted). }
        }
        Occasion council "the council" at oath_hall when true {
          Matter war_command "Whose orders?" for 1 hour until crowned(aled).
          Closes "The captain leaves.".
        }
        ${claim}`, { canon: ['ri_evidence_sacrificed', 'ri_refugees_admitted'] });
      await t.play('Begin the council');
      expect(t.journey.offers('Ask Aled to take the crown and answer for the open gate')).toBe(offered);
      if (offered) {
        await t.play('Ask Aled to take the crown and answer for the open gate');
        expect(t.journey.holds('crowned', 'aled')).toBe(true);
      }
    }
  });

  describe('the court and its people move without waiting for the company', () => {
    it('begins independently and makes Nerys choose at the deadline without teaching the absent company', async () => {
      const t = await Tiny.start(`
        Place oath_hall "the hall" is room at 0, 0 outdoors.
        Company party "You" of 1 at oath_hall.
        Person queen "Nerys" at oath_hall { Role "the queen". Peaceable. }
        Measure succession_started_at(group). Relation publiclyProclaimed(group).
        ${block(site, 'Rule', 'succession_begins')}
        ${block(site, 'Rule', 'queen_proclaims')}`, {
        canon: ['ri_succession_open', 'ri_heir_revealed', 'ri_evidence_kept', 'ri_evidence_sacrificed'],
      });
      await t.play('Wait a while');
      expect(t.journey.holds('befell', 'ri_succession_open')).toBe(true);
      const left = 18 - (t.journey.measure('watch', 'clock') - t.journey.measure('succession_started_at', 'party'));
      await t.play(`=+${left - 1}`);
      expect(t.journey.holds('befell', 'ri_evidence_kept')).toBe(false);
      await t.play('=+1');
      expect(t.journey.holds('befell', 'ri_heir_revealed')).toBe(true);
      expect(t.journey.holds('befell', 'ri_evidence_kept')).toBe(true);
      expect(t.journey.holds('knows', 'party', 'ri_succession_open')).toBe(false);
    });

    it('makes a question open reparation, earns one defence point, and preserves Cadi’s choice and paid employment', async () => {
      for (const [repair, hired, admit] of [
        [true, false, true], [false, false, true], [true, true, true], [true, false, false],
      ] as const) {
        const t = await Tiny.start(`${hall}
          Person scout "Cadi" at oath_hall { Role "an adult scout". Peaceable. }
          Person courier "Tarian" at oath_hall { Role "an adult courier". Peaceable. }
          Person aled "Aled" at oath_hall { Role "the other heir". Peaceable. }
          Entity cadi_question: fact "Cadi asks whether she is in Tarian's future.".
          Entity courier_deal: fact "Tarian offered the summons route to the Ferryman.".
          Relation approachNamed(group). Relation approachUsed(group). Relation crowned(group).
          Relation cadiAnswered(group). Relation cadiApart(group).
          Initially Set hire(courier) to 3. Initially Set hire(scout) to 4.
          Initially Set quantity(party, gold) to ${hired ? 14 : 10}.
          Initially Set escortReserve(ward) to 2.
          ${hired ? 'Initially Assert willing(scout, party).' : ''}
          ${present}
          ${replies.join('\n')}
          ${['cadi_future', 'courier_future'].map(id => block(site, 'Topic', id)).join('\n')}
          ${['courier_reparation', 'gareth_compact', 'courier_road'].map(id => block(source, 'Topic', id)).join('\n')}
          ${['approach_defended', 'cadi_decides', 'cadi_leaves', 'scout_stays', 'scout_returns',
      'scout_to_council', 'courier_to_gate', 'courier_returns', 'incursion_held']
      .map(id => block(source, 'Rule', id)).join('\n')}
          ${block(source, 'Action', 'hold_open')}
          ${block(source, 'Action', 'seal_gate')}`, options);
        const warning = "Ask Tarian to name the Ferryman's blind approach";
        if (hired) { await t.play('Ask Cadi to join the company'); }
        await t.play('Begin the preparations', 'Hear the first shot');
        expect(t.journey.offers(warning)).toBe(false);
        await t.play('Ask Cadi what Tarian promised her', 'Ask Tarian whether Cadi is in his court plans');
        expect(t.journey.offers(warning)).toBe(true);
        if (repair) { await t.play(warning); }
        await t.play(admit ? 'Commit the watch and stores to bring the refugee carts in'
          : 'Seal the north gate before the last carts arrive', 'Wait a while');
        expect(t.journey.measure('wardDefence', 't__ward')).toBe((admit ? 6 : 7) + (repair ? 1 : 0));
        expect(t.journey.holds('cadiApart', 'scout')).toBe(!repair || !admit);
        expect(t.journey.seen()).toContain(!repair ? 'I can love you and still leave.'
          : admit ? 'That answer I believe.' : 'Those people are still outside.');
        await t.play('Give Gareth the defence command until the siege is over', '=until siegeSettled(party)');
        expect(t.journey.at('scout')).toBe(hired ? undefined
          : repair && admit ? 't__palace_kitchen' : 't__guild_hall');
        if (hired) { expect(t.journey.holds('courtPresent', 'scout', 'oath_hall')).toBe(true); }
        if (repair) {
          await t.play('>t__palace_kitchen', 'Ask Tarian to take the road instead of a place at court',
            'Ask Tarian to join the company', '>t__oath_hall', 'Wait a while');
          expect(t.journey.measure('quantity', 'party', 'gold')).toBe(7);
          expect(t.journey.holds('travelsWith', 'courier', 'party')).toBe(true);
          expect(t.journey.at('party')).toBe('t__oath_hall');
          expect(t.journey.holds('courtPresent', 'courier', 'oath_hall')).toBe(true);
          expect(t.journey.at('courier')).toBeUndefined();
        }
        if (hired) { expect(t.journey.holds('travelsWith', 'scout', 'party')).toBe(true); }
      }
    });
  });
  it('turns Gareth’s private answer into an additional escort, once the siege actually begins', async () => {
    const t = await Tiny.start(`${hall}
      ${block(site, 'Topic', 'gareth_choice')}
      ${block(site, 'Topic', 'gareth_watch')}
      ${block(source, 'Rule', 'pledged_watch')}`, options);
    const ask = 'Ask Gareth to muster volunteers instead of a coronation guard';
    await t.play('Begin the preparations');
    expect(t.journey.offers(ask)).toBe(false);
    await t.play('Ask Gareth if he wants the crown', ask);
    expect(t.journey.measure('escortReserve', 't__ward')).toBe(1);
    await t.play('Hear the first shot');
    expect(t.journey.measure('escortReserve', 't__ward')).toBe(2);
    await t.play('Wait a while');
    expect(t.journey.measure('escortReserve', 't__ward')).toBe(2);
  });
  it('turns the goose title into a crossing that spends one real escort and shelters the carts', async () => {
    const t = await Tiny.start(`${hall}
      ${block(site, 'Topic', 'guild_prize')}
      ${block(site, 'Topic', 'goose_roll')}
      ${block(source, 'Action', 'hold_open')}
      ${block(source, 'Rule', 'refugees_sheltered')}`, options);
    const count = 'Offer to count the refugee carts as Deputy Inspector of Geese';
    await t.play('Begin the preparations');
    expect(t.journey.offers(count)).toBe(false);
    await t.play("Ask about the Guild's strangest prize", count, 'Hear the first shot',
      'Commit the watch and stores to bring the refugee carts in');
    expect(t.journey.measure('escortReserve', 't__ward')).toBe(0);
    expect(t.journey.measure('stores', 't__ward')).toBe(1);
    expect(t.journey.at('refugees')).toBe('t__palace_kitchen');
    expect(t.journey.holds('within', 'refugees', 't__ward')).toBe(true);
    expect(t.journey.holds('within', 'guild_hall', 't__ward')).toBe(false);
  });
});
