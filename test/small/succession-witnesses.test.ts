import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { Countries } from '../../src/world/countries';
import { ModuleParser, VocabularyContext } from '../../src/lang/index';
import { Knowing } from '../../src/presentation/knowing';
import { PlayerFrame } from '../../src/presentation/player-frame';
import { Tiny } from '../support/tiny';

const witnesses = Countries.provinces.map(country => {
  const manifest = join('data/adventures', country.bundle);
  const bundle = JSON.parse(readFileSync(manifest, 'utf8')) as { source: string | string[] };
  const sources = (typeof bundle.source === 'string' ? [bundle.source] : bundle.source)
    .filter(source => source.endsWith('.kyr')).map(source => readFileSync(join(dirname(manifest), source), 'utf8'));
  const source = sources.find(text => text.includes('Topic seat_reflection '));
  const fragment = source?.match(/Entity seat_witness:[\s\S]*?\n {2}}/)?.[0];
  if (!fragment) { throw new Error(`No local succession witness in ${country.name}`); }
  const speaker = fragment.match(/Topic seat_reflection with (\w+)/)?.[1];
  const gate = fragment.match(/when ([\s\S]*?) once \{/)?.[1];
  const name = source?.match(new RegExp(`Person ${speaker} "([^"]+)"`))?.[1];
  if (!speaker || !gate || !name) { throw new Error(`Invalid succession witness in ${country.name}`); }
  return { country, fragment, speaker, gate, name, source: sources.join('\n') };
});
const witness = (id: string) => {
  const found = witnesses.find(w => w.country.id === id);
  if (!found) { throw new Error(`No witness for ${id}`); }
  return found;
};
const yard = `Place yard "the yard" is room at 0, 0 outdoors. Company party "You" of 1 at yard.`;
const reflection = (t: Tiny) => PlayerFrame.of(t.campaign).rows
  .find(row => row.action.schema === 't__seat_reflection');
const sketch = readFileSync('data/adventures/theemptyseat/NOTES.md', 'utf8').split('## Act III sketch:')[1]!;

describe('the returning succession witnesses', () => {
  it('gives every area an evidence-gated local voice, a durable twist and a role in the siege', () => {
    for (const w of witnesses) {
      const module = ModuleParser.parseWithin(VocabularyContext.none.fork(), `Module proof "Proof" { ${w.fragment} }`);
      const topic = module.actions.find(action => action.id === 'seat_reflection')!;
      expect(topic.speaker).toBe(w.speaker);
      expect(topic.topic).toBe(true);
      expect(w.country.rumour).toContain(w.name);
      expect(w.gate.trim()).not.toBe('true');
      expect(module.entities.find(entity => entity.id === 'seat_witness')?.name).toContain('Dun Rì');
      expect(topic.success).toContainEqual({ kind: 'assert', call: {
        kind: 'call', name: 'knows', args: ['actor', 'seat_witness'],
      } });
      for (const [, fact] of w.gate.matchAll(/knows\(actor, (\w+)\)/g)) {
        expect(w.source).toMatch(new RegExp(`\\b(?:Discovery|Entity) ${fact}\\b`));
      }
      for (const [, call] of w.gate.matchAll(/\b(\w+)\(actor\)/g)) {
        expect(w.source).toMatch(new RegExp(`\\b(?:Relation|Query) ${call}\\b`));
      }
      expect(sketch).toContain(w.name);
    }
  });

  it('lets Maelin reflect on the rescued living only after the bell and book have returned', async () => {
    const w = witness('romance');
    const t = await Tiny.start(`${yard}
      Person maelin "Maelin Vale" at yard { Role "the bell keeper". Peaceable. }
      Relation bellReturned(group). Relation bookRead(group).
      ${w.fragment} Goal false.`);
    expect(reflection(t)).toBeUndefined();
    t.journey.assert('bellReturned', 'party');
    t.campaign.refreshProjection(); t.look();
    expect(reflection(t)).toBeUndefined();
    t.journey.assert('bookRead', 'party');
    t.campaign.refreshProjection(); t.look();
    expect(Knowing.of(t.campaign).teaches(reflection(t)!.action)).toBe(true);
    await t.play('Ask Maelin what the returned bell teaches a king');
    expect(t.journey.taken.at(-1)?.told).toContain('The living came down. The bell came after.');
    expect(t.journey.holds('knows', 'party', 'seat_witness')).toBe(true);
    expect(reflection(t)).toBeUndefined();
  });

  it('waits for Kezu to wake rather than making a sleeping witness deliver a speech', async () => {
    const w = witness('strewnfield');
    const t = await Tiny.start(`${yard}
      Person kezu "Kezu" at yard { Role "the watch keeper". Peaceable.
        State sleeping "Kezu sleeps.". State waking "Kezu is awake.". }
      Entity kezu_dreams_house: fact "Kezu dreams the growing house.".
      Initially Assert established(kezu_dreams_house).
      Initially Assert knows(party, kezu_dreams_house).
      ${w.fragment} Goal false.`);
    expect(reflection(t)).toBeUndefined();
    t.journey.assert('state', 'kezu', 'waking');
    t.campaign.refreshProjection(); t.look();
    await t.play('Ask Kezu what the house has taught the next king');
    expect(t.journey.holds('knows', 'party', 'seat_witness')).toBe(true);
    expect(t.journey.taken.at(-1)?.told).toContain('No more people keeping watch alone.');
  });

  it('does not make Mrs Cherrett speak after her death', async () => {
    const w = witness('hessel');
    const t = await Tiny.start(`${yard}
      Person cherrett "Mrs Abigail Cherrett" at yard { Role "the widow". Peaceable. }
      Relation gone(group). Entity josiah_line: fact "Josiah's canal survey.".
      Initially Assert established(josiah_line).
      Initially Assert knows(party, josiah_line). Initially Assert gone(cherrett).
      ${w.fragment} Goal false.`);
    expect(reflection(t)).toBeUndefined();
    expect(t.journey.holds('knows', 'party', 'seat_witness')).toBe(false);
  });

  it('lets Marta nominate a mule only after the tower has answered the mirror', async () => {
    const w = witness('pitchpass');
    const t = await Tiny.start(`${yard}
      Person marta "Marta Vellacott" at yard { Role "the muleteer". Peaceable. }
      Relation answered(group). ${w.fragment} Goal false.`);
    expect(reflection(t)).toBeUndefined();
    t.journey.assert('answered', 'party');
    t.campaign.refreshProjection(); t.look();
    await t.play('Ask Marta what the mirror teaches a king');
    expect(t.journey.holds('knows', 'party', 'seat_witness')).toBe(true);
    expect(t.journey.taken.at(-1)?.told).toContain("I'll carry it for Gnomon first.");
  });
});
