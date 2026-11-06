import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The lore sweep (doc/imbar/15-lore-ledger.md): links added between adventures by reading a world event, by reacting
// to an item kind another adventure hands out, and by an itinerant named in several places. Each is played in its own
// campaign, as a player would, and must fire when its event or item is present and stay silent when it is not.
const campaign = (name: string) => `data/campaigns/${name}.campaign.json`;
const told = (j: Journey) => j.taken.map(x => `${x.page} ${x.told}`).join('\n');

interface Arrival { events?: string[]; items?: string[]; look?: boolean }
async function arrive(name: string, mod: string, place: string, opts: Arrival = {}) {
  const { events = [], items = [], look = true } = opts;
  const j = await Journey.start(campaign(name), 'lore');
  for (const e of events) { j.assert('befell', e); }
  for (const i of items) { j.give(i); }
  j.put('party', `${mod}__${place}`);
  // The Lull begins in a dark with no top to it: nothing is seen, and so nothing is read, by a company without a light.
  // (By lamplight the sleepers of the Lull cannot be talked to, so a talk there is had in the dark.)
  if (!look) { return j; }
  if (mod === 'lull') { await j.play('a candle: Light'); }
  await j.play('=+1');
  return j;
}

describe('a world event read in an adventure that never read one', () => {
  const cases: [string, string, string, string, string, RegExp][] = [
    ['Fair Weather', 'skeel', 'skeel', 'lamp_room', 'remainder_kept', /LIGHT AT THE EDGE OF THE SEA/],
    ['The Quiet in the Sky', 'the-quiet-in-the-sky', 'larum', 'larum_street', 'cloudgate_fell', /a piece of the sky came down in a bay/],
    ['Half the Hive', 'half-the-hive', 'hume', 'taproom', 'remainder_harboured', /They keep their own hours/],
    ['The Lull', 'the-lull', 'lull', 'almshouse', 'remainder_kept', /left on the other side of a door/],
    ['The Long Man', 'the-long-man', 'longman', 'taproom', 'slack_opened', /A black square/],
    ['Low Water', 'low-water', 'lowwater', 'taproom', 'slack_opened', /URGENT, THE SQUARE/],
  ];
  for (const [title, file, mod, place, event, line] of cases) {
    it(`${title} hears of ${event} only when it befell`, async () => {
      expect(told(await arrive(file, mod, place))).not.toMatch(line);
      expect(told(await arrive(file, mod, place, { events: [event] }))).toMatch(line);
    }, 120000);
  }
});

describe('a visitor from elsewhere: a person who reacts to an item kind another adventure hands out', () => {
  const cases: [string, string, string, string, string, string, string, RegExp][] = [
    ['Loveday and the Prefect\'s table', 'skeel', 'skeel', 'lamp_room', 'pharos_rubbing', 'Show Loveday Kitto the rubbing', 'lore_table_same', /scrubbed column/],
    ['Mother Ysolt and the keeper\'s bench', 'the-long-man', 'longman', 'nave', 'tally_rubbing', 'Show Mother Ysolt the wax rubbing', 'lore_rubbing_notches', /A tally is for the one who sits after/],
    ['Aldith Mote and the Collegium\'s glossary', 'the-lull', 'lull', 'glossary', 'old_glossary', 'Show Aldith Mote', 'lore_glossary_kin', /someone else's letter/],
    ['Halm and the Prefect\'s writ', 'low-water', 'lowwater', 'dig', 'prefects_writ', 'Show Halm the fair copy', 'lore_writ_kept', /Servandam/],
    ['the Ninth Valuer and the Prefect\'s writ', 'what-tessary-owes', 'tessary', 'withies', 'prefects_writ', 'Show the Ninth Valuer', 'lore_valuer_kept', /first thing in a long time I have not known how to enter/],
  ];
  for (const [title, file, mod, place, kind, ask, fact, line] of cases) {
    it(`${title}: offered and answered only to a company holding the ${kind}`, async () => {
      const without = await arrive(file, mod, place, { look: false });
      expect(without.offers(ask)).toBe(false);
      const j = await arrive(file, mod, place, { items: [kind], look: false });
      expect(j.offers(ask)).toBe(true);
      await j.play(ask);
      expect(told(j)).toMatch(line);
      expect(j.holds('knows', 'party', `${mod}__${fact}`)).toBe(true);
    }, 120000);
  }
});

describe('entry points toward Tolleth: a letter put in the company\'s hands', () => {
  it('Mother Jago hands over a letter for the Tolleth packet, once', async () => {
    const j = await arrive('skeel', 'skeel', 'taproom');
    expect(j.holds('holding', 'party', 'map')).toBe(false);
    await j.play('Ask Mother Jago whether she has word for anyone on the Tolleth packet');
    expect(told(j)).toMatch(/Captain Bascom/);
    expect(j.holds('holding', 'party', 'map')).toBe(true);
    expect(j.offers('Ask Mother Jago whether she has word for anyone on the Tolleth packet')).toBe(false);
  }, 120000);
  it('Factor Sault hands over a sealed packet of accounts for Captain Bascom', async () => {
    const j = await arrive('what-tessary-owes', 'tessary', 'sault_office');
    expect(j.holds('holding', 'party', 'exchange_ledger')).toBe(false);
    await j.play('Ask Factor Sault whether anything is wanted carried overseas');
    expect(told(j)).toMatch(/Dorothea, Captain Bascom/);
    expect(j.holds('holding', 'party', 'exchange_ledger')).toBe(true);
  }, 120000);
  it('Mrs Scrope and Pell pass on the rumour of raiders and the delayed packet', async () => {
    const h = await arrive('hessel', 'hessel', 'pump_room');
    await h.play('Ask Mrs Scrope what is said of the coast');
    expect(told(h)).toMatch(/Captain Bascom/);
    const w = await arrive('the-third-night', 'wrayford', 'wheels_taproom');
    await w.play('Ask Pell what the carters from the coast are saying');
    expect(w.holds('knows', 'party', 'wrayford__lore_pell_coast')).toBe(true);
  }, 120000);
});

describe('the almanack woman, Jessamy Cattermole, and the surveyor Orlando Pym: itinerants named in several places', () => {
  const trail: [string, string, string, string, string][] = [
    ['skeel', 'skeel', 'taproom', 'Ask Mother Jago who else has come down the coast road', 'lore_cattermole_skeel'],
    ['low-water', 'lowwater', 'taproom', 'Ask Ruan Tell who has been through lately', 'lore_cattermole_bowl'],
    ['the-long-man', 'longman', 'taproom', 'Ask Martin Pask whether any pedlars', 'lore_cattermole_merrow'],
    ['hessel', 'hessel', 'pump_room', 'Ask Mrs Scrope about the woman with the almanacks', 'lore_cattermole_hessel'],
    ['the-third-night', 'wrayford', 'wheels_taproom', 'Ask Pell whether a pedlar', 'lore_cattermole_wray'],
    ['what-tessary-owes', 'tessary', 'drum_taproom', 'Ask Hannelore Rackham about the man with the chain', 'lore_pym_tessary'],
    ['the-lull', 'lull', 'sx_taproom', 'Ask Dorcas Trewin about the man with a chain', 'lore_pym_lull'],
    ['the-quiet-in-the-sky', 'larum', 'hark', 'Ask Bet Garside about the mark', 'lore_pym_larum'],
  ];
  for (const [file, mod, place, ask, fact] of trail) {
    it(`${mod}: ${fact} is a thread the player carries`, async () => {
      const j = await arrive(file, mod, place);
      expect(j.holds('knows', 'party', `${mod}__${fact}`)).toBe(false);
      await j.play(ask);
      expect(j.holds('knows', 'party', `${mod}__${fact}`)).toBe(true);
    }, 120000);
  }
});
