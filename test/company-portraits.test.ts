import { describe, expect, it } from 'bun:test';
import { existsSync } from 'node:fs';
import { CompanyPortraits, type Face } from '../src/paintings/company-portraits';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { Battle } from '../src/battle';
import { CombatModel } from '../src/ui/combat-model';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';

// The portraits of the company (OWN-29): every calling, the aristocrat and the commoner, of each people and each
// presentation, cut from the matrices and looked at (data/paintings/pcs.json); given by who a member is, the same in
// every save, never one that does not fit them; none where nothing fits, and the card shows a letter instead.
describe('the portraits of the company', () => {
  const kinds = ['warrior', 'mage', 'cleric', 'thief', 'bard', 'ranger', 'monk', 'aristocrat', 'commoner'];
  it('paints every calling and general type of each people, men and women, each with copies the page can show', () => {
    for (const kind of kinds) {
      for (const ancestry of ['human', 'elf', 'dwarf']) {
        for (const as of ['man', 'woman']) {
          const fit = CompanyPortraits.usable.filter(p => p.class === kind && p.ancestry === ancestry);
          expect([kind, ancestry, as, fit.filter(p => p.presentation === as).length]).toEqual([kind, ancestry, as, 1]);
        }
      }
    }
    for (const p of CompanyPortraits.all) {
      expect([p.id, existsSync(`web/reader/${p.file}`), existsSync(`web/reader/${p.medium}`)]).toEqual([p.id, true, true]);
    }
  });
  it('gives each the portrait of their calling, people and presentation; the classless their station', () => {
    const shown = (who: Parameters<typeof CompanyPortraits.of>[0]) => CompanyPortraits.of(who)?.id;
    expect(shown({ classId: 'cleric', raceId: 'dwarf', presentation: 'woman', key: 'Dori' })).toBe('cleric-dwarf-woman');
    expect(shown({ classId: 'ranger', raceId: 'elf', presentation: 'man', key: 'Elen' })).toBe('ranger-elf-man');
    // Kyr's old name for a warrior is a warrior's.
    expect(shown({ classId: 'fighter', raceId: 'human', presentation: 'man', key: 'Bran' })).toBe('warrior-human-man');
    // No calling: a commoner, or an aristocrat born or bred to it; a calling is painted as itself whatever the birth.
    expect(shown({ raceId: 'human', presentation: 'woman', key: 'Agnes' })).toBe('commoner-human-woman');
    expect(shown({ classId: 'commoner', raceId: 'elf', backgroundId: 'noble', presentation: 'man', key: 'Aelar' }))
      .toBe('aristocrat-elf-man');
    expect(shown({ classId: 'warrior', raceId: 'human', backgroundId: 'noble', presentation: 'woman', key: 'Maud' }))
      .toBe('warrior-human-woman');
    for (const kind of kinds.slice(0, 7)) {
      for (const as of ['man', 'woman'] as const) {
        const face = CompanyPortraits.of({ classId: kind, raceId: 'elf', presentation: as, key: `${kind}:${as}` })!;
        const p = CompanyPortraits.all.find(x => x.id === face.id)!;
        expect([p.class, p.ancestry, p.presentation, p.usable, face.src, face.medium])
          .toEqual([kind, 'elf', as, true, p.file, p.medium]);
      }
    }
  });
  it('is the same for the same member every time, and draws men and women alike when nothing is said', () => {
    const drawn = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const who = { classId: 'thief', raceId: 'human', key: `Member ${i}|region__party_${i}` };
      const face = CompanyPortraits.of(who)!;
      expect(CompanyPortraits.of({ ...who })).toEqual(face);
      drawn.add(face.id);
    }
    expect([...drawn].sort()).toEqual(['thief-human-man', 'thief-human-woman']);
  });
  it('reads how a member presents from their pronouns, a likeness chosen for them, or a name only one sex is given', () => {
    expect(CompanyPortraits.presentation({ pronoun: 'pron_she', name: 'Alfric' })).toBe('woman');
    expect(CompanyPortraits.presentation({ pronoun: 'pron_he' })).toBe('man');
    expect(CompanyPortraits.presentation({ likeness: 'victrix', name: 'Alfric' })).toBe('woman');
    expect([CompanyPortraits.presentation({ name: 'Agnes Thatcher' }), CompanyPortraits.presentation({ name: 'Alfric' })])
      .toEqual(['woman', 'man']);
    // Nothing said, nothing assumed: they, or a name of no one sex, leaves it to the draw.
    expect([CompanyPortraits.presentation({ pronoun: 'pron_they' }), CompanyPortraits.presentation({ name: 'Wenna' })])
      .toEqual([undefined, undefined]);
    expect(CompanyPortraits.member({ id: 'p1', name: 'Agnes', raceId: 'dwarf', classId: 'monk' }, {})?.id)
      .toBe('monk-dwarf-woman');
  });
  it('gives none where nothing painted fits: another people, a calling with no column, an ancestry unsaid', () => {
    expect(CompanyPortraits.of({ classId: 'warrior', raceId: 'halfling', presentation: 'man', key: 'Alton' })).toBeUndefined();
    expect(CompanyPortraits.of({ classId: 'necromancer', raceId: 'human', key: 'Vane' })).toBeUndefined();
    expect(CompanyPortraits.of({ classId: 'aristocrat', raceId: 'human', key: 'Vane' })).toBeUndefined();
    expect(CompanyPortraits.of({ classId: 'warrior', key: 'Vane' })).toBeUndefined();
  });
  it('shows the company by their portraits in a fight, and no foe', () => {
    const content = new Content('faces');
    const hero = content.createCreature('hero', { raceId: 'human', classId: 'warrior' });
    const foe = content.createCreature('foe', { raceId: 'goblin', classId: 'thief' });
    const battle = Battle.encounter(new CreatureStore([hero, foe]), [{ creatureId: 'hero', team: 'fighters' },
      { creatureId: 'foe', team: 'goblins' }], { seed: 'faces' });
    const face: Face = CompanyPortraits.of({ classId: 'warrior', raceId: 'human', presentation: 'man', key: 'hero' })!;
    const screen = CombatModel.build(battle, undefined, new Map([['hero', face], ['foe', face]]));
    expect([screen.allies[0]!.face, screen.foes[0]!.face]).toEqual([face, undefined]);
  });
  it('is a member\'s on their page from the start and after a save', async () => {
    const party = [{ name: 'Wenna', raceId: 'dwarf', classId: 'cleric' }];
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'wanderer', party });
    const s = await PlaySession.start(w.path, 'kite', w.source), me = ScreenModel.build(s.campaign).party[0]!;
    expect(me.face?.id).toMatch(/^cleric-dwarf-(man|woman)$/);
    const back = PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())) as ReturnType<typeof s.checkpoint>);
    expect(ScreenModel.build(back.campaign).party[0]!.face).toEqual(me.face);
  }, 60000);
});
