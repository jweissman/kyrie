import { describe, expect, it } from 'bun:test';
import { Content } from '../../src/content';
import { CombatProjection } from '../../src/combat-projection';
import { Barks } from '../../src/narrative/barks';
import { Voice } from '../../src/narrative/voice';
import { VoiceContext } from '../../src/narrative/voice-context';
import type { CombatEvent } from '../../src/model';

// A blow that takes one of the company past half their strength, or past a quarter, and leaves them standing is
// remarked on: the lines for it had been written and never said, and a company worn down with nothing said of it
// (AB-02, R82). Only grim, cheerful and jovial fighters had a line; the proud, acerbic, compassionate and stoic said
// nothing, however hurt. A blow that crosses neither mark is not remarked on. No world: the fight's own barks.
const blow = (id: string, left: number): CombatEvent[] => [{ type: 'damage', turn: 1, actor: 'wolf', target: id,
  amount: 20 - left, hp: left, rolled: 20 - left } as unknown as CombatEvent];
const fighter = (id: string) => {
  const f = CombatProjection.fighter(new Content('barks').createCreature(id, { raceId: 'human', classId: 'warrior' }), 'fighters');
  f.maxHp = 20;
  return f;
};

describe('a blow that tells', () => {
  it('has a line for one of the company of every manner', () => {
    const silent = VoiceContext.manners.filter(manner => !Voice.fitting('hurt', { side: 'company', kind: 'person', manner })
      .length);
    expect(silent).toEqual([]);
  });
  it('is remarked on past half the strength, most of the time, and never short of it', () => {
    const said = (left: number) => Array.from({ length: 40 }, (_, i) => new Barks([fighter(`m${i}`)], `s${i}`)
      .of(blow(`m${i}`, left), 1));
    expect(said(9).filter(Boolean).length).toBeGreaterThan(15);
    expect(said(15).filter(Boolean)).toEqual([]);
  });
});
