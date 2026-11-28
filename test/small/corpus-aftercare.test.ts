import { expect, it } from 'bun:test';
import meetings from '../../data/generation/wild/meetings.kyrt' with { type: 'text' };
import lovers from '../../data/adventures/quiet-in-the-sky/lovers.kyr' with { type: 'text' };
import folk from '../../data/adventures/wrongboat/folk.kyr' with { type: 'text' };
import box from '../../data/adventures/wrongboat/box.kyr' with { type: 'text' };
import sides from '../../data/adventures/wrongboat/sides.kyr' with { type: 'text' };
import clock from '../../data/adventures/wrongboat/clock.kyr' with { type: 'text' };
import wake from '../../data/adventures/wrongboat/wake.kyr' with { type: 'text' };
import { KyrTemplates } from '../../src/world/kyr-template';
import { WorldAssembler } from '../../src/world/world-assembler';
import { RegionMeetings } from '../../src/world/region-meetings';
import { Consequence } from '../../src/lang';
import { PlaySession } from '../../src/session/play-session';
import { Journey } from '../../src/session/journey';
import { KyrLint } from '../../src/cli/kyr-lint';
import { Tiny } from '../support/tiny';

function between(text: string, start: string, end: string): string {
  const from = text.indexOf(start), to = text.indexOf(end, from);
  if (from < 0 || to <= from) { throw new Error(`Missing authored fragment: ${start} / ${end}`); }
  return text.slice(from, to);
}

async function river(): Promise<Tiny> {
  return Tiny.start(`
    Place galley "the galley" is room at 0, 0 indoors.
    Place taproom "the taproom" is room at 0, 2 indoors.
    Place deck "the deck" is room at 0, 1 outdoors.
    Place puppet_booth "the puppet booth" is room at 1, 0 indoors.
    Place weir "the weir" is room at 2, 0 outdoors.
    Place quay "the quay" is room at 3, 0 outdoors.
    Company party "You" of 1 at galley.
    Person bess "Bess Lowther" at quay { Role "a toll-clerk". Ancestry human. Peaceable. }
    Person lads "the Trust's lads" at weir { Role "two grey coats". Ancestry human. Peaceable. }
    Passage backstage "the way to the puppet booth" is path between galley and puppet_booth.
    Passage inn "the way to the taproom" is path between galley and taproom.
    Passage bank "the way to the weir" is path between puppet_booth and weir.
    Passage onward "the way to the quay" is path between weir and quay opening when not ladsBlock().
    Passage afloat "the barge landing" is path between galley and quay taking 10 minutes.
    Relation teagueOpen(group). Relation teagueSaw(group). Relation hobKnown(group). Relation hiding(group). Relation liedToBess(group).
    Relation confronted(group). Relation bessMet(group). Relation bessTook(group). Relation boxReturned(group).
    Relation bessAlly(group). Relation bessKnows(group). Relation hobMet(group). Relation hobyPlay(group).
    Relation ladsPaid(group). Relation ladsRouted(group). Relation ladsSwept(group). Relation beatenUp(group).
    Relation caught(group). Relation emptyHanded(group). Relation ladsMet(group). Measure ladsMetAt(group).
    Query escort() means bessAlly(party) and together(bess, party).
    ${between(clock, '  Query ladsDealt()', '  Query escort()')}
    ${between(clock, '  Query ladsBlock()', '  Query aboard()')}
    Rule face_bess when at(party, quay) and not bessMet(party) { Assert confronted(party). }
    ${between(box, '  Relation hamperOpened', '  // The ways of being rid')}
    ${between(box, '  Action surrender_box', '\n}')}
    ${between(folk, '  Person teague ', '  // Shim Garrod')}
    ${between(folk, '  Person parr ', '  Topic parr_woman ')}
    ${between(sides, '  Person hoby ', '  Action hide_in_booth')}
    ${between(sides, '  Topic bess_where ', '  // Without anything')}
    ${between(sides, '  Topic bess_private ', '  Topic bess_hob_known')}
    ${between(clock, '  Action hide_in_galley', '  Action swear_false')}
    ${between(clock, '  Rule lads_meet ', '  Observe lads_stand_off ')}
    ${between(sides, '  Action pay_lads', '  // ── The Last Pint')}
    ${between(wake, '  Ending returned_public ', '  Ending bargain ')}
    Initially Give hamper_kind to party.
    Initially Set quantity(party, gold) to 20.
  `);
}

it('draws both heath situations across fifty replayable template seeds', () => {
  const template = KyrTemplates.parse(meetings);
  const selected = Array.from({ length: 50 }, (_, n) =>
    KyrTemplates.choose(template, `corpus-heath-${n}`).find(s => s.group === 'heath')!.option);
  expect(new Set(selected)).toEqual(new Set(['yarrow', 'kite']));
  expect(Array.from({ length: 50 }, (_, n) =>
    KyrTemplates.choose(template, `corpus-heath-${n}`).find(s => s.group === 'heath')!.option)).toEqual(selected);
  const placed = Array.from({ length: 12 }, (_, n) => {
    const region = WorldAssembler.region(`corpus-heath-${n}`, [0, 0]);
    return RegionMeetings.meetings(region).filter(m => m.section.option === 'kite').map(m => {
      expect(region.sites.some(s => s.id === m.lead?.site.id)).toBe(true);
      return m;
    });
  }).flat();
  expect(placed.length).toBeGreaterThan(0);
});

it('repays repairing the kite with a real hidden way, rather than a disconnected rumour', async () => {
  const template = KyrTemplates.parse(meetings);
  const section = template.sections.find(s => s.group === 'heath' && s.option === 'kite')!;
  const lines = KyrTemplates.fill(section.lines, { m: 'k', tract: 'heath', folk: 'human', he: 'she',
    site: 'ruin', seen: 'a broken stair', toward: 'north' }).join('\n');
  const story = `Place heath "the heath" is room at 0, 0 outdoors.
    Place ruin "the old stair" is room at 1, 0 outdoors. Company party "You" of 1 at heath.
    Discovery ruin_found "A stair leads beneath the heath.". Discovery ruin_named "the old stair".
    Passage track "the track to the old stair" is path between heath and ruin hidden until ruin_found.
    ${lines}`;
  const night = await Tiny.start(story);
  await night.play('Wait until dark');
  expect(night.journey.find("Hold the kite's crosspiece while the maker ties it")).toBeUndefined();
  const t = await Tiny.start(story);
  expect(t.journey.find('Ask what the kite showed beyond the heath')).toBeUndefined();
  await t.play("Hold the kite's crosspiece while the maker ties it", 'Ask what the kite showed beyond the heath');
  expect(t.journey.holds('knows', 'party', 'ruin_found')).toBe(true);
  await t.play('To the old stair');
  expect(t.where()).toBe('t__ruin');
});

it("lets care earn Mab's existing confidence without healing away the lasting wound or farming trust", async () => {
  const t = await Tiny.start(`Place yard "the yard" is room at 0, 0 outdoors.
    Company party "You" of 1 at yard.
    Person mab "Mab Treloar" at yard { Role "a pikewoman". Ancestry human. Peaceable. }
    Relation mabScarred(group). Measure mabTrust(group). Query beforeTesting() means true.
    Discovery living_kills "A living hand leaves a lasting wound.". Discovery old_partners "Mab and Ansel met on the Field.".
    Initially Assert mabScarred(mab). Initially Assert knows(party, living_kills).
    Initially Assert knows(party, old_partners). Initially Give bandages to party.
    ${between(lovers, '  Relation mabComforted', '  // She carries it')}
    ${between(lovers, '  Topic mab_ansel ', '  Topic ansel_mab ')}`);
  expect(t.journey.find('Ask Mab Treloar about Ansel Haverlock')).toBeUndefined();
  await t.play('Offer Mab a clean bandage and tend the split lip', 'Ask Mab Treloar about Ansel Haverlock');
  expect(t.journey.holds('mabScarred', 'mab')).toBe(true);
  expect(t.journey.holds('holding', 'party', 'bandages')).toBe(false);
  expect(t.journey.holds('knows', 'party', 'mab_loves')).toBe(true);
  const restored = Journey.of(PlaySession.fromSave(t.campaign.save(), 'tiny'), true);
  expect(restored.holds('mabComforted', 'mab')).toBe(true);
  expect(restored.find('Offer Mab a clean bandage and tend the split lip')).toBeUndefined();
});

it("allows truthful inexperience and quiet work to earn the cook's actual shelter", async () => {
  const t = await river();
  const food = t.journey.measure('quantity', 'party', 'rations');
  expect(t.journey.find('Stand in the galley steam behind Mrs Brabant')).toBeUndefined();
  await t.play('Ask Mrs Brabant what is the matter', "No. I've never lost anything",
    'Stay and peel beside Mrs Brabant without asking more', 'Stand in the galley steam behind Mrs Brabant');
  expect(t.journey.holds('hiding', 'party')).toBe(true);
  expect(t.journey.measure('quantity', 'party', 'rations')).toBe(food);
  expect(t.journey.find('Stay and peel beside Mrs Brabant without asking more')).toBeUndefined();
  expect(Consequence.census(t.campaign.module).filter(a => a.id === 't__teague_no')).toEqual([]);
});

it("lets Parr's recognition support an honest alliance without the cook's testimony", async () => {
  const t = await river();
  await t.play('To the taproom', 'Show Jack Parr the label on the hamper',
    'To the galley', 'To the quay', 'Hear what Bess has to say',
    'Tell her it was Hob Garrod who put it aboard');
  expect(t.journey.holds('bessAlly', 'party')).toBe(true);
  expect(t.journey.holds('teagueSaw', 'party')).toBe(false);
  expect(Consequence.census(t.campaign.module).filter(a => a.id === 't__parr_label')).toEqual([]);
});

it('makes public performance open the guarded way and change the returned-box aftermath', async () => {
  const t = await river();
  await t.play('Look under the cloth in the hamper', 'Wind the music box', 'Wind the music box');
  t.journey.roll('pass');
  await t.play('Wind the box a third time and feel under the comb');
  await t.play("Tom's private wedding verse: Read", 'To the puppet booth');
  expect(t.journey.find("Give Hoby Tom's private verse for the fair to sing")).toBeUndefined();
  await t.play('Ask Hoby what his play is about', 'A bargeman who steals wedding presents');
  await t.play('To the weir');
  expect(t.journey.find('To the quay')).toBeUndefined();
  expect(t.journey.find('Pay the lads fifteen coin to find the wrong woman')).toBeDefined();
  expect(t.journey.find('Give the box up to the lads')).toBeDefined();
  await t.play('To the puppet booth', "Give Hoby Tom's private verse for the fair to sing",
    'To the weir');
  expect(t.journey.find('Pay the lads fifteen coin to find the wrong woman')).toBeUndefined();
  expect(t.journey.find('Give the box up to the lads')).toBeUndefined();
  await t.play('To the quay', 'Hear what Bess has to say');
  const said = await t.journey.play('Put the box in her hands');
  expect(said).toContain('Children outside');
  expect(said).not.toContain('two men in grey coats at the door');
  expect(t.journey.holds('verseSung', 'party')).toBe(true);
  const restored = Journey.of(PlaySession.fromSave(t.campaign.save(), 'tiny'), true);
  expect(restored.holds('verseSung', 'party')).toBe(true);
  expect(Consequence.census(t.campaign.module).filter(a =>
    ['t__hoby_hob', 't__bess_private'].includes(a.id))).toEqual([]);
});

it('keeps the private return vulnerable when neither the lads nor the song have been dealt with', async () => {
  const t = await river();
  await t.play('Look under the cloth in the hamper', 'To the puppet booth', 'To the weir');
  expect(t.journey.find('To the quay')).toBeUndefined();
  expect(t.journey.holds('verseSung', 'party')).toBe(false);
  await t.play('To the puppet booth', 'To the galley', 'To the quay', 'Hear what Bess has to say');
  const said = await t.journey.play('Put the box in her hands');
  expect(said).toContain('two men in grey coats at the door');
  expect(said).not.toContain('Children outside');
});

it('assembles and lints both changed adventures without adding hard errors', async () => {
  for (const campaign of ['wrongboat', 'the-quiet-in-the-sky']) {
    expect((await KyrLint.campaign(`data/campaigns/${campaign}.campaign.json`))
      .filter(f => f.level === 'error')).toEqual([]);
  }
});
