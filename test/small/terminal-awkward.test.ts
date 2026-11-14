import { describe, expect, it } from 'bun:test';
import { Awkward } from '../support/awkward';
import { Keyed } from '../support/keyed';
import { Indicator } from '../../src/presentation/indicator';
import { Emphasis } from '../../src/presentation/emphasis';
import { Signs } from '../../src/presentation/signs';
import { Terminal } from '../../src/cli/terminal';
import { TerminalCreation } from '../../src/cli/terminal-creation';
import { TerminalMenus, type Journeyed } from '../../src/cli/terminal-menus';
import { TerminalPicker } from '../../src/cli/terminal-picker';
import { TerminalPickerView } from '../../src/cli/terminal-picker-view';
import { TerminalWidth } from '../../src/cli/terminal-width';
import { TerminalSlots } from '../../src/cli/terminal-slots';
import { CheckpointStore } from '../../src/session/checkpoint-store';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { TerminalWalk } from '../../src/cli/terminal-walk';
import { WalkStyle } from '../../src/cli/walk-style';
import { Creation } from '../../web/engine/creation';
import { CreationFlow } from '../../web/engine/creation-flow';
import type { Setting } from '../../web/engine/protocol';

// The terminal's awkward cases, in one tiny world (the owner, 14 November: TP-05), played in its human mode by keys
// on the real picker (Keyed), drawn as the terminal draws it, without a terminal: many legal acts and four led with,
// an act that is several things, a question too long for a narrow terminal, the instruments, acts that change once one
// is done, and creation through the same picker. Then the headless mode on the same world, its lines unchanged.
const labels = (k: Keyed, n = -1) => k.frames.at(n)!.menu.rows.map(r => r.label);

describe('the indicator grammar (TP-02)', () => {
  it('is one colour by one precedence, at most two icons, and the rest in words', () => {
    // Gold first, and only where the aim is followed; then danger; then the particular promises before the general.
    expect(Indicator.of({ aspects: ['knowledge', 'undertaking', 'danger'] }).tone).toBe('gold');
    expect(Indicator.of({ aspects: ['knowledge', 'undertaking', 'danger'], gilded: false }).tone).toBe('red');
    expect(Indicator.of({ aspects: ['companionship', 'exploration', 'knowledge'] }).aspect).toBe('knowledge');
    expect(Indicator.of({ aspects: ['companionship', 'exploration'] }).aspect).toBe('exploration');
    const many = Indicator.of({ aspects: ['wonder', 'payoff', 'knowledge', 'danger'], crosses: true, hold: true });
    expect([many.aspect, many.icons.map(i => i.said), many.detail])
      .toEqual(['danger', ['to gain', 'to learn'], ['uncanny', Signs.crossing.said, Signs.hold.said]]);
  });
  // TP-03, decided by a1's camp: the brother's "Ask Osbert what he means to do" was worth a look and a companion before
  // the aim was followed, a companion alone after it, and had turned from silver to rose with nothing about him
  // changed. A companion is its icon, the first, and never a colour, whatever else the act is.
  it('draws a companion by its icon alone, the same before and after the aim is followed (a1\'s camp)', () => {
    const before = Indicator.of({ aspects: ['exploration', 'companionship'] });
    const after = Indicator.of({ aspects: ['companionship'] });
    expect([before.tone, before.icons[0]!.sign]).toEqual(['silver', Signs.emblem('companion')]);
    expect([after.tone, after.icons[0]!.sign]).toEqual([undefined, Signs.emblem('companion')]);
    expect(Emphasis.precedence).not.toContain('companionship');
    expect(Indicator.words(['companionship', 'knowledge'])).toEqual(['to learn', 'a companion']);
  });
});

describe('the terminal\'s human mode, in the awkward world', () => {
  it('leads with the engine\'s four, the rest a step away, and back folds them again on the same row', async () => {
    // The four by the commands that do them, as the terminal leads with them (Terminal.led: an opener by its act).
    const t = await Awkward.start(), four = Terminal.led(t.glance, t.screen);
    const k = await Keyed.play(t.session, ['down', 'down', 'down', 'down', 'return', 'down', 'left']);
    expect(k.frames[0]!.menu.rows.map(r => r.id)).toEqual(four);
    expect(k.frames[0]!.lines).toContain(`   ${k.frames[0]!.menu.rest!.length} more`);
    expect(k.frames[0]!.menu.rest!.length).toBeGreaterThan(10);
    // Unfolded on More, the focus on the first of the rest; folded, on More again.
    expect(k.frames[4]!.focused).toBe(TerminalPicker.more);
    // The rest by kind of act, each kind folded: the focus on the first kind's own row.
    expect(k.frames[5]!.focused).toBe(`${TerminalPicker.head}${k.frames[0]!.menu.rest![0]!.group}`);
    expect(k.frames.at(-1)!.focused).toBe(TerminalPicker.more);
    // The list never reflows: folded again, the picker is as tall as it was.
    expect(k.frames.at(-1)!.lines.length).toBe(k.frames[0]!.lines.length);
  });
  it('draws an act that is several things by its one colour, and says all of it on ?', async () => {
    const t = await Awkward.start();
    // Followed, the rows are led in a new order and the focus stays on the row it was on: up twice to the aim's.
    const k = await Keyed.play(t.session, ['a', 'return', 'up', 'up', '?']);
    const lines = k.last.lines.join('\n');
    // Followed, the aim's question is gold, said by its sign without colour, and teaches: its icon.
    // Text only (the owner, 15 November): its colour's mark and its words, no icon beside or after.
    expect(lines).toMatch(/^▸✦ Ask Osric whether .*…$/m);
    expect(lines).toMatch(/^ {4}your aim, to learn$/m);
    // The companion's asking: no colour (TP-03), and in the terminal no icon either; it says so on ?.
    expect(lines).toMatch(/^ {3}Ask Wenna whether she would come along$/m);
  });
  it('fits every line to a narrow terminal, the long question wrapped where it is focused and cut elsewhere', async () => {
    const t = await Awkward.start();
    const k = await Keyed.play(t.session, ['a', 'return', 'up', 'up', 'down'], { width: 32 });
    for (const frame of k.frames) { expect(frame.lines.every(l => TerminalWidth.of(l) <= 31)).toBe(true); }
    const [focused, other] = [k.frames.at(-2)!.lines, k.last.lines];
    expect(focused.filter(l => /Osric|alders|floods|causeway/.test(l)).length).toBeGreaterThan(2);
    expect(other.filter(l => /Osric|alders|floods|causeway/.test(l))).toEqual([expect.stringMatching(/…/)]);
  });
  it('reads the instruments that bear on the moment, each one\'s gloss on asking', async () => {
    const t = await Awkward.start();
    await t.play('Wait › Until dark');
    const k = await Keyed.play(t.session, ['pagedown', 'up', '?']);
    const info = k.last.menu.info!.map(r => r.label);
    expect(info).toEqual([expect.stringMatching(/^Sky: .*moon/), expect.stringMatching(/^Provisions: /)]);
    expect(k.last.focused).toBe('instrument:sky');
    expect(k.last.lines.join(' ')).toContain(t.leaf.instruments!.find(i => i.id === 'sky')!.gloss.split('.')[0]!);
  });
  it('offers what has changed once an act is done, the focus on the first again', async () => {
    const t = await Awkward.start();
    const before = labels(await Keyed.play(t.session, []));
    const k = await Keyed.play(t.session, ['down', 'return']);
    expect(k.picked[0]).toEqual({ choice: 't__wenna_come' });
    const after = labels(k);
    expect(before).toContain('Ask Wenna whether she would come along');
    expect(after).not.toContain('Ask Wenna whether she would come along');
    expect([...after, ...k.last.menu.rest!.map(r => r.label)]).toContain('Ask Wenna to join the company');
    expect(k.last.focused).toBe(k.last.menu.rows[0]!.id);
  });
  it('makes a life through the same picker: the four, the rest a step away, the card chosen focused', () => {
    const names = { human: { she: ['Wenna'], he: ['Odo'], they: ['Wren'] } };
    const setting: Setting = { title: 'Merscfaenn', generated: true, pitch: { heading: '', text: '' },
      origins: [{ id: 'debt', title: 'A debt', choice: 'You owe money' }], names,
      party: [Creation.protagonist('human', 'awkward', names)] };
    const step = new CreationFlow(setting, Creation.catalog()).steps().find(s => s.id === 'calling')!;
    const picker = new TerminalPicker(TerminalCreation.menu(step));
    expect(picker.visible.map(r => r.id).slice(0, 5)).toEqual([...step.cards.slice(0, 4).map(c => c.id),
      TerminalPicker.more]);
    expect(picker.focused!.id).toBe(step.chosen ?? step.cards[0]!.id);
    picker.press({ name: 'right' });
    expect(picker.visible).toHaveLength(step.cards.length);
    // Each card by its emblem's character, as the scene's acts are by their signs.
    expect(picker.visible.every(r => !!r.icon)).toBe(true);
  });
  it('turns a lens on and off by its key, its own few and its own rest, without the focus unfolding them', async () => {
    const t = await Awkward.start(), people = t.glance.lenses.people;
    const k = await Keyed.play(t.session, ['down', 't', 't']);
    const lensed = k.frames[2]!;
    expect([lensed.menu.title, lensed.menu.rows.length]).toEqual(['Talk', Math.min(4, people.promoted.length)]);
    expect(lensed.menu.rest!.length).toBe(people.promoted.length + people.rest.length - lensed.menu.rows.length);
    expect(lensed.lines.some(l => /^ {4}\d+ more$/.test(l)) || !lensed.menu.rest!.length).toBe(true);
    expect(k.last.menu.title).toBeUndefined();
  });
  it('talks through the same picker, headed by whom, its rest its own replies and not the scene\'s', async () => {
    const t = await Awkward.start();
    const k = await Keyed.play(t.session, ['t', 'return']);
    expect(k.last.menu.title).toBe('With Wenna');
    expect(k.last.menu.rows.map(r => r.label)).toContain('Ask Wenna about the mill');
    expect([...k.last.menu.rows, ...k.last.menu.rest ?? []].some(r => /^Set down|^Wait/.test(r.label))).toBe(false);
  });
  // One foe, one key: the move is made at it, as the page's fight makes it (FightMoves), the target never asked.
  it('makes a move at the only foe without asking at whom', async () => {
    const t = await Awkward.start();
    t.journey.put('party', 't__cellar');
    const k = await Keyed.play(t.session, Array.from({ length: 40 }, () => 'return'));
    const asked = k.frames.filter(f => /at whom/.test(f.menu.title ?? ''));
    const turns = new Set(k.frames.filter(f => /'s turn$/.test(f.menu.title ?? '')).map(f => f.menu));
    expect(asked.length).toBeGreaterThan(0);
    expect(asked.every(f => f.menu.rows.length > 1)).toBe(true);
    // Every turn struck with the first move; the turns at the last rat asked nothing.
    expect(turns.size).toBeGreaterThan(new Set(asked.map(f => f.menu)).size);
  });
  it('fights through the same picker: the moves, a target, back to the moves', async () => {
    const t = await Awkward.start();
    t.journey.put('party', 't__cellar');
    const k = await Keyed.play(t.session, ['return', 'return', 'left', 'return', 'return']);
    const titles = k.frames.map(f => f.menu.title ?? '');
    expect(titles).toContain('Aud\'s turn');
    expect(titles).toContain('Melee Attack: at whom?');
    expect(k.said.join('\n')).toMatch(/^Aud \d+\/\d+$/m);
  });
  // A town's rest had been 117 acts, 36 of them journeys in one unranked list: grouped by the map's own kinds, gone
  // through a page or a group at a time, the engine's order kept within each (it ranks no journey yet).
  it('groups what is done here by kind, the journeys under the map\'s headings after it, and pages through them', () => {
    const at = (id: string, journey?: Journeyed) => ({ id, name: id, time: 0, ...journey ? { journey } : {} });
    const listed = [at('travel:b', 'roads'), at('wait'), at('travel:a', 'known'), at('travel:c', 'roads'),
      ...Array.from({ length: 12 }, (_, i) => at(`travel:r${i}`, 'roads')), at('search')];
    const rows = TerminalMenus.grouped(listed);
    expect(rows.map(r => r.id).slice(0, 5)).toEqual(['wait', 'search', 'travel:a', 'travel:b', 'travel:c']);
    expect(rows.map(r => r.group).slice(0, 4)).toEqual(['Other', 'Other', 'Places you know the way to',
      'Where the roads go']);
    const picker = new TerminalPicker({ rows });
    picker.press({ ch: ']' });
    expect(picker.focused!.id).toBe('travel:a');
    picker.press({ ch: ']' });
    expect(picker.focused!.id).toBe('travel:b');
    picker.press({ name: 'pagedown' });
    expect(picker.focus).toBe(3 + TerminalPicker.paged);
    picker.press({ name: 'pagedown' });
    expect(picker.focus).toBe(rows.length - 1);
    picker.press({ ch: '[' });
    expect(picker.focused!.id).toBe('travel:b');
  });
});

describe('the terminal\'s human mode, in the awkward world, its rest and its drawing', () => {
  // The town's sixty-odd acts done here: each kind of act (Offers' types) folded under a row of its own, opened one at
  // a time, and back shuts the group the focus is in before it folds the rest.
  it('folds the rest by kind of act, each group opened on Enter and shut again on back', async () => {
    const t = await Awkward.start();
    const k = await Keyed.play(t.session, ['down', 'down', 'down', 'down', 'return', 'return', 'down', 'left']);
    const heads = k.frames[5]!.menu.fold ? k.frames[5]!.lines.filter(l => /^[▸ ] \+ /.test(l)) : [];
    expect(heads.length).toBeGreaterThan(2);
    expect(heads.join(' ')).toMatch(/Speak · \d+/);
    expect(k.frames[6]!.lines.some(l => /^[▸ ] − /.test(l))).toBe(true);
    expect(k.frames[7]!.focused).not.toMatch(/^…group:/);
    expect(k.last.focused).toMatch(/^…group:/);
    expect(k.last.lines.some(l => /^[▸ ] − /.test(l))).toBe(false);
  });
  it('says what a question does from its act\'s fields: that it teaches', async () => {
    const t = await Awkward.start();
    const k = await Keyed.play(t.session, ['t', 'down', 'return']);
    const ford = k.last.menu.rows.find(r => r.id === 't__osric_ford')!;
    expect([k.last.menu.title, ford.note]).toEqual(['With Osric', 'teaches']);
  });
  // A price once, where the page says it: "Buy a ten-foot pole for Disa · 1 coin" had stood over "1 coin · 3 min".
  it('says a price once, in the note, the act in the page\'s own words', () => {
    const row = TerminalMenus.row({ id: 'buy', name: 'Buy a candle for Disa — 1 coin', time: 3,
      signed: { shown: 'A candle', note: '1 coin' } });
    expect([row.label, row.note]).toEqual(['A candle', '1 coin']);
  });
  it('keeps a game in the engine\'s one slot, a path asked for only with --save-as', async () => {
    const path = join(tmpdir(), `kyrie-slots-${Bun.hash(String(performance.now())).toString(36)}.json`);
    const t = await Awkward.start();
    TerminalSlots.store(path).write(CheckpointStore.autosave, t.session.checkpoint());
    expect(TerminalSlots.store(path).read(CheckpointStore.autosave).transcript.seed).toBe(t.session.seed);
    rmSync(path, { force: true });
  });
  // The owner saw creation all but uncoloured (15 November): the heading, the focus, the rows' meaning and the rail in
  // the stage's inks and the meaning tones, wherever the terminal has 256 colours or more; the detail in one area of
  // fixed height under the list, never wrapped into it; beside it from 120 columns.
  it('draws in colour wherever there is colour: the heading, the focus, the meaning, the rail', async () => {
    const t = await Awkward.start();
    t.follow('ford');
    const menu = (await Keyed.play(t.session, [])).last.menu;
    const draw = (depth: 'true' | '256' | 'none', width = 80) => TerminalPickerView.lines(new TerminalPicker(
      { ...menu, title: 'Why have you come to Hythe?' }), { width, height: 24, shows: { depth, unicode: true,
      prism: false } });
    const [rich, cube, none] = [draw('true'), draw('256'), draw('none')];
    expect(rich[0]).toContain('\x1b[1m');
    expect(rich.join('\n')).toContain(`\x1b[38;2;242;189;76m▎`);
    expect(cube.join('\n')).toContain('\x1b[38;5;');
    expect(none.join('\n')).not.toContain('\x1b[');
    // As tall whichever row is in hand, the detail beneath the list; at 140 columns, beside it.
    expect(rich.length).toBe(draw('true').length);
    const wide = draw('true', 140);
    expect(wide.some(l => l.includes('│'))).toBe(true);
    expect(wide.length).toBeLessThan(rich.length);
  });
  it('asks once before an act that cannot be undone, and leaving the game too', () => {
    const picker = new TerminalPicker({ rows: [{ id: 'jump', label: 'Jump into the weir', ask: 'No way back.' }] });
    expect([picker.press({ name: 'return' }), picker.asking]).toEqual([undefined, 'jump']);
    expect(picker.press({ name: 'return' })).toEqual({ choice: 'jump' });
    expect([picker.press({ ch: 'q' }), picker.press({ ch: 'q' })]).toEqual([undefined, null]);
  });
});

describe('the terminal\'s headless mode, in the awkward world', () => {
  // Said unasked only what was chosen or is so: the aim, not that the question teaches (the owner's headless review,
  // 14 November: "worth a look" told the player where curiosity ought to occur before the fiction had produced it).
  it('keeps its plain lines: numbered, the aim said in words, never an editorial word', async () => {
    const t = await Awkward.start();
    const walked = await TerminalWalk.run(t.session, WalkStyle.scripted(['follow 1', 'look']));
    const text = walked.transcript.join('\n');
    expect(text).not.toContain('\x1b[');
    expect(text).toMatch(/^1\. Ask Osric whether .* {2}\[your aim\]$/m);
    expect(text).not.toMatch(/worth a look|to learn|to gain|uncanny/);
    expect(text).toMatch(/^\(more: .*all \d+\)$/m);
  });
});
