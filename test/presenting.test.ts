import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';
import { VoiceContext } from '../src/narrative/voice-context';
import { CompanyPortraits } from '../src/paintings/company-portraits';
import { ModuleParser } from '../src/lang/module-parser';
import { World } from '../src/lang/world';
import { Membership } from '../src/campaign/membership';
import type { Campaign } from '../src/campaign/campaign';
import type { Member } from '../web/engine/protocol';

// How the protagonist presents, chosen at creation (the owner, 2026-10-30: a mechanism for the sex of the one who
// plays), is the world's: the company that is them alone is spoken of in their words, the narrator says them, and
// their portrait is of a woman or a man as they chose, from the start and after a save. One who is neither is spoken
// of as they, and painted as their name says where it says (Agnes is a woman's name), else as the draw has it. Anyone
// who joins is spoken of, and painted, as their own group is.
describe('how the protagonist presents', () => {
  const start = async (pronouns: Member['pronouns'], name: string) => {
    const party = [{ name, raceId: 'dwarf', classId: 'cleric', pronouns }];
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'wanderer', party });
    return PlaySession.start(w.path, 'kite', w.source);
  };
  it('is the world\'s, the narrator\'s and the portrait\'s, from the start and after a save', async () => {
    for (const [pronouns, as] of [['she', 'woman'], ['he', 'man']] as const) {
      const s = await start(pronouns, 'Wren'), c = s.campaign, company = c.playerActor!;
      expect([c.world.one('pronouns', company), VoiceContext.pronoun(c, company, 'person')])
        .toEqual([`pron_${pronouns}`, pronouns]);
      const me = ScreenModel.build(c).party[0]!;
      expect(me.face?.id).toBe(`cleric-dwarf-${as}`);
      const back = PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())) as ReturnType<typeof s.checkpoint>);
      expect([back.campaign.world.one('pronouns', company), ScreenModel.build(back.campaign).party[0]!.face?.id])
        .toEqual([`pron_${pronouns}`, me.face?.id]);
    }
  }, 180000);
  it('is spoken of as they for one who is neither, and painted as their name says', async () => {
    const s = await start('they', 'Agnes'), c = s.campaign;
    expect(VoiceContext.pronoun(c, c.playerActor!, 'person')).toBe('they');
    expect(ScreenModel.build(c).party[0]!.face?.id).toBe('cleric-dwarf-woman');
  }, 90000);
  it('leaves anyone who joins as their own group is said: a recruit in theirs, the one who came alone in the company\'s',
    () => {
      const module = ModuleParser.parse(`Module m "M" { Entity party: group "You". Entity hal: group "Hal".
        Entity odo: group "Odo". Relation memberOf(member, group). Relation joinedAs(member, group).
        Relation pronouns(group, pronoun). Entity pron_he: pronoun "he". Entity pron_she: pronoun "she".
        Entity me: member "Wren" bound to me_body. Entity hal_m: member "Hal" bound to hal_body.
        Entity odo_m: member "Odo" bound to odo_body.
        Initially Assert pronouns(party, pron_she). Initially Assert pronouns(hal, pron_he).
        Initially Assert memberOf(me, party). Initially Assert joinedAs(hal_m, hal). Initially Assert memberOf(hal_m, party).
        Initially Assert memberOf(odo_m, odo). }`);
      const world = new World(module).apply(module.initial);
      expect(['me', 'hal_m', 'odo_m'].map(m => CompanyPortraits.said(world, m))).toEqual(['pron_she', 'pron_he', undefined]);
    });
  // The company is spoken of in the words of the one who came alone only while they are alone: once Hal joins, it is
  // many (the critic's reading: a company of two had been "she"); when he goes home, it is hers again. Her own portrait
  // keeps her words all the while.
  it('speaks of the company as many once anyone joins it, and as the one who came alone when they leave', () => {
    const module = ModuleParser.parse(`Module m "M" { Place yard "the yard" is room. Entity party: group "You".
      Entity hal: group "Hal". Relation at(entity, place). Relation memberOf(member, group).
      Relation joinedAs(member, group). Relation travelsWith(group, group). Relation pronouns(group, pronoun).
      Entity pron_she: pronoun "she". Entity me: member "Wren". Entity hal_m: member "Hal".
      Initially Assert pronouns(party, pron_she). Initially Assert memberOf(me, party). }`);
    module.entities.find(e => e.id === 'hal_m')!.creatureId = 'hal_body';
    const current = { partyIds: ['me_body'], inhabitants: { party: ['me_body'], hal: ['hal_body'] } as
      Record<string, string[]>, enlisted: {} as Record<string, string> };
    const company = { world: new World(module).apply(module.initial), readout: current, playerActor: 'party' };
    const said = () => [VoiceContext.pronoun(company as unknown as Campaign, 'party', 'person'),
      CompanyPortraits.said(company.world, 'me')];
    expect(said()).toEqual(['she', 'pron_she']);
    company.world = Membership.enlist({ current, company: 'party', module, world: company.world }, 'hal', 'party');
    expect([said(), current.inhabitants.party]).toEqual([['they', 'pron_she'], ['me_body', 'hal_body']]);
    company.world = Membership.depart({ current, company: 'party', module, world: company.world })!;
    expect(said()).toEqual(['she', 'pron_she']);
  });
});
